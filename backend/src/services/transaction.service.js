const Transaction = require("../models/Transaction");
const { findDuplicate } = require("./duplicate.service");
const { categorizeTransaction } = require("./categorization.service");
const { parsePagination, paginated } = require("../utils/pagination");
const { normalizeMerchant } = require("../utils/fingerprint");

function initialsFor(merchant) {
  const parts = String(merchant).trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

async function createTransaction(userId, input) {
  const { fingerprint, existing } = await findDuplicate(userId, input);
  if (existing) {
    const err = new Error("Duplicate transaction");
    err.status = 409;
    err.duplicateId = existing.id;
    throw err;
  }

  const classified = input.category
    ? { category: input.category, confidence: input.confidence || 100, source: "manual" }
    : await categorizeTransaction(userId, input.merchant);

  const doc = await Transaction.create({
    user: userId,
    merchant: input.merchant,
    initials: input.initials || initialsFor(input.merchant),
    amount: input.amount,
    type: input.type || "debit",
    category: classified.category,
    method: input.method || "UPI",
    source: input.source || "Manual",
    confidence: classified.confidence,
    verified: Boolean(input.verified),
    confirmed: Boolean(input.confirmed),
    stage: input.stage || "ready",
    fingerprint,
    occurredAt: input.occurredAt || new Date(),
    notes: input.notes,
  });
  return doc;
}

async function listTransactions(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { user: userId };
  if (query.category && query.category !== "All") filter.category = query.category;
  if (query.search) filter.merchant = new RegExp(query.search, "i");
  if (query.verified === "true") filter.verified = true;
  if (query.verified === "false") filter.verified = false;

  const [items, total] = await Promise.all([
    Transaction.find(filter).sort({ occurredAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

async function getTransaction(userId, id) {
  return Transaction.findOne({ _id: id, user: userId });
}

async function updateTransaction(userId, id, patch) {
  if (patch.merchant) patch.merchant = patch.merchant;
  return Transaction.findOneAndUpdate({ _id: id, user: userId }, patch, { new: true });
}

async function deleteTransaction(userId, id) {
  return Transaction.findOneAndDelete({ _id: id, user: userId });
}

async function bulkVerify(userId, ids) {
  await Transaction.updateMany({ user: userId, _id: { $in: ids } }, { $set: { verified: true, confirmed: true } });
  return Transaction.find({ user: userId, _id: { $in: ids } });
}

module.exports = {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  bulkVerify,
  initialsFor,
  normalizeMerchant,
};
