const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const FinancialProfile = require("../models/FinancialProfile");
const { startOfMonth, endOfMonth } = require("../utils/date");

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
  const target = (profile?.savingsTargetPct || 20) / 100;
  const budgetHits = budgets.filter((b) => {
    const spent = txns.filter((t) => t.type === "debit" && t.category === b.category).reduce((s, t) => s + t.amount, 0);
    return spent > b.amount;
  }).length;

  let score = 55;
  score += Math.min(25, savingsRate * 100);
  if (savingsRate >= target) score += 8;
  score -= budgetHits * 6;
  if (goals.length) score += 4;
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

module.exports = { computeHealth };
