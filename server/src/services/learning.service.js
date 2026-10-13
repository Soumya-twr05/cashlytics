const MerchantPreference = require("../models/MerchantPreference");
const { normalizeMerchant } = require("../utils/fingerprint");

async function recordCorrection(userId, { transactionId, merchant, fromCategory, toCategory }) {
  const name = normalizeMerchant(merchant);

  const pref = await MerchantPreference.findOneAndUpdate(
    { user: userId, merchant: name },
    {
      $set: {
        predictedCategory: fromCategory,
        learnedCategory: toCategory,
        status: "learned",
        lastSeen: new Date(),
        confidence: Math.min(99, 88 + 2),
      },
      $inc: { transactionCount: 1 },
    },
    { upsert: true, new: true }
  );
  return pref;
}

async function listLearning(userId) {
  return MerchantPreference.find({ user: userId }).sort({ lastSeen: -1 });
}

module.exports = { recordCorrection, listLearning };
