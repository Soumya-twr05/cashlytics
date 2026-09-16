const MerchantPreference = require("../models/MerchantPreference");
const CategoryFeedback = require("../models/CategoryFeedback");
const { normalizeMerchant } = require("../utils/fingerprint");

async function recordCorrection(userId, { transactionId, merchant, fromCategory, toCategory }) {
  const name = normalizeMerchant(merchant);
  await CategoryFeedback.create({
    user: userId,
    transaction: transactionId,
    merchant: name,
    fromCategory,
    toCategory,
  });

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
