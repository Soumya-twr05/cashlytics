const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const FinancialProfile = require("../models/FinancialProfile");
const mlService = require("./ml.service");

function oid(userId) {
  return new mongoose.Types.ObjectId(userId);
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function rangeFromPreset(preset = "30D") {
  const end = new Date();
  const start = new Date();
  if (preset === "7D") start.setDate(end.getDate() - 7);
  else if (preset === "3M") start.setMonth(end.getMonth() - 3);
  else if (preset === "6M") start.setMonth(end.getMonth() - 6);
  else if (preset === "1Y") start.setFullYear(end.getFullYear() - 1);
  else start.setDate(end.getDate() - 30);
  return { start, end };
}

async function categoryTotals(userId, start, end) {
  return Transaction.aggregate([
    { $match: { user: oid(userId), occurredAt: { $gte: start, $lte: end }, type: "debit" } },
    { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
}

async function detectAnomalies(userId) {
  const now = new Date();
  const thisStart = startOfMonth(now);

  const txns = await Transaction.find({
    user: userId,
    occurredAt: { $gte: thisStart, $lte: now },
    type: "debit"
  }).sort({ amount: -1 }).limit(50); // Send top 50 recent to ML for analysis

  // Calculate user's average baseline from DB (context)
  const prevStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevEnd = endOfMonth(prevStart);
  
  const previousTotals = await categoryTotals(userId, prevStart, prevEnd);
  const prevMap = Object.fromEntries(previousTotals.map((row) => [row._id, row.total]));

  // Calculate merchant frequencies for the user
  const merchantNames = txns.map((t) => t.merchant);
  const merchantFreqAgg = await Transaction.aggregate([
    { $match: { user: oid(userId), merchant: { $in: merchantNames } } },
    { $group: { _id: "$merchant", count: { $sum: 1 } } }
  ]);
  const merchantFrequencies = Object.fromEntries(merchantFreqAgg.map((r) => [r._id, r.count]));

  const anomalies = [];
  
  for (const txn of txns) {
    const baselineCategoryTotal = prevMap[txn.category] || 1; // Fallback to 1 to avoid div by zero
    
    const jsDay = txn.occurredAt.getDay();
    const isWeekend = (jsDay === 0 || jsDay === 6) ? 1 : 0;
    const pyDayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Map JS Sunday=0 to Python Sunday=6

    // Call ML Service with actual user context matching the Python schema exactly
    const mlResult = await mlService.detectAnomaly({
      amount: txn.amount,
      category: txn.category,
      transaction_hour: txn.occurredAt.getHours(),
      day_of_week: pyDayOfWeek,
      is_weekend: isWeekend,
      merchant_frequency: merchantFrequencies[txn.merchant] || 0,
      user_avg_category_spend: baselineCategoryTotal
    });
    
    // Fallback if ML is unavailable
    if (!mlResult) {
       anomalies.push({
         transaction: txn,
         severity: "unavailable",
         reason: "Anomaly analysis is temporarily unavailable.",
         riskScore: 0
       });
       continue;
    }

    if (mlResult.is_anomaly && mlResult.risk_level !== "LOW") {
      anomalies.push({
        transaction: txn,
        severity: mlResult.risk_level.toLowerCase(),
        reason: mlResult.reasons ? mlResult.reasons.join(", ") : "Detected by ML",
        riskScore: mlResult.risk_score
      });
    }
  }

  return anomalies;
}

async function getForecast(userId) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const daysInMonth = end.getDate();
  const daysAvailable = Math.max(1, now.getDate());

  // current_spending
  const currentMonthTxns = await Transaction.aggregate([
    { $match: { user: oid(userId), occurredAt: { $gte: start, $lte: now }, type: "debit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const currentSpending = currentMonthTxns[0]?.total || 0;

  // recent_7_day_average
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const recentTxns = await Transaction.aggregate([
    { $match: { user: oid(userId), occurredAt: { $gte: sevenDaysAgo, $lte: now }, type: "debit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const recent7DayAvg = (recentTxns[0]?.total || 0) / 7;

  // Historical data
  const history = await Transaction.aggregate([
    { $match: { user: oid(userId), occurredAt: { $lt: start }, type: "debit" } },
    { 
      $group: { 
        _id: { $dayOfWeek: "$occurredAt" }, // 1=Sun, 7=Sat
        total: { $sum: "$amount" }
      } 
    }
  ]);

  const oldestTxn = await Transaction.findOne({ user: userId, type: "debit" }).sort({ occurredAt: 1 });
  const totalDaysActive = oldestTxn ? Math.max(1, Math.ceil((now - oldestTxn.occurredAt) / (1000 * 60 * 60 * 24))) : 1;
  const weekendDays = Math.floor(totalDaysActive * 2 / 7) || 1;
  const weekdayDays = (totalDaysActive - weekendDays) || 1;

  let totalHistory = 0;
  let totalWeekend = 0;
  let totalWeekday = 0;
  
  for (const r of history) {
    totalHistory += r.total;
    if (r._id === 1 || r._id === 7) totalWeekend += r.total;
    else totalWeekday += r.total;
  }

  const historicalDailyAverage = totalHistory / totalDaysActive;
  const weekendAverage = totalWeekend / weekendDays;
  const weekdayAverage = totalWeekday / weekdayDays;

  // Call the ML forecast
  const mlResult = await mlService.forecastMonthlySpending({
    current_spending: currentSpending,
    days_available: daysAvailable,
    days_in_month: daysInMonth,
    recent_7_day_average: recent7DayAvg,
    weekday_average: weekdayAverage,
    weekend_average: weekendAverage,
    historical_daily_average: historicalDailyAverage
  });

  if (!mlResult) {
    const err = new Error("Forecast analysis is temporarily unavailable.");
    err.status = 503;
    throw err;
  }

  return mlResult;
}

async function monthlyTrend(userId, months = 6) {
  const start = startOfMonth(new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1), 1));
  return Transaction.aggregate([
    { $match: { user: oid(userId), occurredAt: { $gte: start } } },
    {
      $group: {
        _id: { y: { $year: "$occurredAt" }, m: { $month: "$occurredAt" } },
        income: { $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] } },
        expenses: { $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] } },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
  ]).then((rows) =>
    rows.map((row) => ({
      month: `${row._id.y}-${String(row._id.m).padStart(2, "0")}`,
      income: row.income,
      expenses: row.expenses,
      savings: row.income - row.expenses,
    }))
  );
}

async function computeHealth(userId) {
  const start = startOfMonth();
  const end = endOfMonth();

  const [txns, budgets, goals, profile] = await Promise.all([
    Transaction.find({ user: userId, occurredAt: { $gte: start, $lte: end } }),
    Budget.find({ user: userId }),
    Goal.find({ user: userId }),
    FinancialProfile.findOne({ user: userId }),
  ]);

  const income = txns.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  
  // Use desired savings from profile if it exists, else assume 20%
  let target = 0.20;
  if (profile && profile.desiredMonthlySavings && profile.monthlyIncome > 0) {
    target = profile.desiredMonthlySavings / profile.monthlyIncome;
  }

  const budgetHits = budgets.filter((b) => {
    const spent = txns.filter((t) => t.type === "debit" && t.category === b.category).reduce((s, t) => s + t.amount, 0);
    return spent > b.amount;
  }).length;

  let score = 55;
  score += Math.min(25, savingsRate * 100);
  if (savingsRate >= target) score += 8;
  score -= budgetHits * 6;
  if (goals && goals.length) score += 4;
  score = Math.max(20, Math.min(98, Math.round(score)));

  return {
    score,
    income,
    expenses,
    savings: income - expenses,
    savingsRate: Number((savingsRate * 100).toFixed(1)),
    budgetsExceeded: budgetHits,
    trajectory: score >= 75 ? "Healthy trajectory" : "Needs attention",
  };
}

module.exports = { categoryTotals, detectAnomalies, getForecast, monthlyTrend, monthKey, computeHealth, startOfMonth, endOfMonth, rangeFromPreset };
