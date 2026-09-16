const crypto = require("crypto");

function normalizeMerchant(merchant = "") {
  return String(merchant).trim().toUpperCase().replace(/\s+/g, " ");
}

function transactionFingerprint({ userId, merchant, amount, occurredAt, method }) {
  const day = occurredAt ? new Date(occurredAt).toISOString().slice(0, 10) : "";
  const payload = [String(userId), normalizeMerchant(merchant), Number(amount).toFixed(2), day, method || ""].join("|");
  return crypto.createHash("sha256").update(payload).digest("hex");
}

module.exports = { normalizeMerchant, transactionFingerprint };
