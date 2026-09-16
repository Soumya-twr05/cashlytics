const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const { startOfMonth, endOfMonth } = require("../utils/date");
const { scoreAnomaly } = require("./ml.service");

function oid(userId) {
  return new mongoose.Types.ObjectId(userId);
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
  const prevStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevEnd = endOfMonth(prevStart);

  const [current, previous] = await Promise.all([
    categoryTotals(userId, thisStart, now),
    categoryTotals(userId, prevStart, prevEnd),
  ]);

  const prevMap = Object.fromEntries(previous.map((row) => [row._id, row.total]));
  return current
    .map((row) => {
      const baseline = prevMap[row._id] || row.total * 0.7;
      const scored = scoreAnomaly(row.total, baseline);
      return {
        category: row._id,
        amount: row.total,
        baseline,
        ...scored,
      };
    })
    .filter((row) => row.severity !== "low");
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

module.exports = { categoryTotals, detectAnomalies, monthlyTrend, monthKey };
