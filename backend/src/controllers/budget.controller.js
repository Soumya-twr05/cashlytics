const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const { monthKey } = require("../services/intelligence.service");
const { forecastCategory, monthProgress } = require("../services/forecast.service");
const { success, created, fail } = require("../utils/response");
const { startOfMonth, endOfMonth } = require("../utils/date");

async function list(req, res, next) {
  try {
    const month = req.query.month || monthKey();
    const budgets = await Budget.find({ user: req.userId, month });
    const start = startOfMonth();
    const end = endOfMonth();
    const txns = await Transaction.find({ user: req.userId, occurredAt: { $gte: start, $lte: end }, type: "debit" });
    const { daysElapsed, daysLeft } = monthProgress();

    const items = budgets.map((b) => {
      const spent = txns.filter((t) => t.category === b.category).reduce((s, t) => s + t.amount, 0);
      return { ...b.toObject(), spent, forecast: forecastCategory({ spent, daysElapsed, daysLeft, budget: b.amount }) };
    });
    return success(res, { items, month });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const month = req.body.month || monthKey();
    const item = await Budget.create({ ...req.body, month, user: req.userId });
    return created(res, { item });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await Budget.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
    if (!item) return fail(res, "Budget not found", 404);
    return success(res, { item });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return fail(res, "Budget not found", 404);
    return success(res, {}, "Deleted");
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };
