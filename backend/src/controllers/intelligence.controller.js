const { computeHealth } = require("../services/financialHealth.service");
const { detectAnomalies, monthlyTrend, categoryTotals } = require("../services/intelligence.service");
const { listLearning } = require("../services/learning.service");
const { startOfMonth, endOfMonth, rangeFromPreset } = require("../utils/date");
const { success } = require("../utils/response");

async function dashboard(req, res, next) {
  try {
    const health = await computeHealth(req.userId);
    const { start, end } = rangeFromPreset(req.query.range || "30D");
    const categories = await categoryTotals(req.userId, start, end);
    return success(res, { health, categories, range: req.query.range || "30D" });
  } catch (err) {
    return next(err);
  }
}

async function anomalies(req, res, next) {
  try {
    const items = await detectAnomalies(req.userId);
    return success(res, { items });
  } catch (err) {
    return next(err);
  }
}

async function trends(req, res, next) {
  try {
    const items = await monthlyTrend(req.userId, Number(req.query.months) || 6);
    return success(res, { items });
  } catch (err) {
    return next(err);
  }
}

async function learning(req, res, next) {
  try {
    const items = await listLearning(req.userId);
    return success(res, { items });
  } catch (err) {
    return next(err);
  }
}

async function snapshot(req, res, next) {
  try {
    const categories = await categoryTotals(req.userId, startOfMonth(), endOfMonth());
    const health = await computeHealth(req.userId);
    return success(res, { health, categories });
  } catch (err) {
    return next(err);
  }
}

module.exports = { dashboard, anomalies, trends, learning, snapshot };
