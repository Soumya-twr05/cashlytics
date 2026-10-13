const Transaction = require("../models/Transaction");
const { transactionFingerprint } = require("../utils/fingerprint");

async function findDuplicate(userId, payload) {
  const fingerprint = transactionFingerprint({ userId, ...payload });
  const existing = await Transaction.findOne({ user: userId, fingerprint });
  return { fingerprint, existing };
}

module.exports = { findDuplicate };
