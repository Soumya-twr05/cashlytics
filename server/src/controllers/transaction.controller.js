const transactionService = require("../services/transaction.service");
const { recordCorrection } = require("../services/learning.service");
const { success, created, fail } = require("../utils/response");

async function list(req, res, next) {
  try {
    const data = await transactionService.listTransactions(req.userId, req.query);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await transactionService.createTransaction(req.userId, req.body);
    return created(res, { item }, "Transaction captured");
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const item = await transactionService.getTransaction(req.userId, req.params.id);
    if (!item) return fail(res, "Transaction not found", 404);
    return success(res, { item });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await transactionService.updateTransaction(req.userId, req.params.id, req.body);
    if (!item) return fail(res, "Transaction not found", 404);
    return success(res, { item });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await transactionService.deleteTransaction(req.userId, req.params.id);
    if (!item) return fail(res, "Transaction not found", 404);
    return success(res, {}, "Deleted");
  } catch (err) {
    return next(err);
  }
}

async function recategorize(req, res, next) {
  try {
    const existing = await transactionService.getTransaction(req.userId, req.params.id);
    if (!existing) return fail(res, "Transaction not found", 404);
    const item = await transactionService.updateTransaction(req.userId, req.params.id, {
      category: req.body.category,
      confidence: 100,
      verified: true,
    });
    await recordCorrection(req.userId, {
      transactionId: existing.id,
      merchant: existing.merchant,
      fromCategory: existing.category,
      toCategory: req.body.category,
    });
    return success(res, { item }, "Category learned");
  } catch (err) {
    return next(err);
  }
}

async function confirm(req, res, next) {
  try {
    const item = await transactionService.updateTransaction(req.userId, req.params.id, {
      confirmed: true,
      verified: true,
      stage: "ready",
    });
    if (!item) return fail(res, "Transaction not found", 404);
    return success(res, { item }, "Confirmed");
  } catch (err) {
    return next(err);
  }
}

async function bulkVerify(req, res, next) {
  try {
    const items = await transactionService.bulkVerify(req.userId, req.body.ids || []);
    return success(res, { items }, "Verified");
  } catch (err) {
    return next(err);
  }
}

async function smartCapture(req, res, next) {
  try {
    const data = await transactionService.listTransactions(req.userId, { ...req.query, limit: 50 });
    const pending = data.items.filter((t) => !t.confirmed && t.stage === "ready");
    const processing = data.items.filter((t) => t.stage !== "ready");
    return success(res, {
      ...data,
      stats: {
        detected: data.pagination.total,
        pending: pending.length,
        processing: processing.length,
        confirmed: data.items.filter((t) => t.confirmed).length,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, getOne, update, remove, recategorize, confirm, bulkVerify, smartCapture };
