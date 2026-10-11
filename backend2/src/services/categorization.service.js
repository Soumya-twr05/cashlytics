const { MERCHANT_HINTS, normalizeCategory } = require("../utils/constants");
const { normalizeMerchant } = require("../utils/fingerprint");
const MerchantPreference = require("../models/MerchantPreference");
const mlService = require("./ml.service");

function heuristicCategory(merchant) {
  const key = normalizeMerchant(merchant).toLowerCase();
  const hit = Object.keys(MERCHANT_HINTS).find((token) => key.includes(token));
  if (hit) return { category: normalizeCategory(MERCHANT_HINTS[hit]), confidence: 0.92 };
  return { category: "Other", confidence: 0.62 };
}

async function categorizeTransaction(userId, merchant, amount) {
  const name = normalizeMerchant(merchant);
  
  // 1. Learned Merchant Preference
  const pref = await MerchantPreference.findOne({ user: userId, merchant: name });
  if (pref) {
    return {
      category: normalizeCategory(pref.learnedCategory),
      confidence: (pref.confidence / 100.0) || 0.9,
      source: "learned",
    };
  }

  // 2. ML Classifier
  const mlResult = await mlService.predictCategory(merchant, amount);
  if (mlResult && mlResult.category) {
    return {
      category: normalizeCategory(mlResult.category),
      confidence: mlResult.confidence,
      source: "ml",
    };
  }

  // 3. Heuristic fallback
  const guessed = heuristicCategory(merchant);
  return { ...guessed, source: "heuristic" };
}

module.exports = { categorizeTransaction, heuristicCategory };

