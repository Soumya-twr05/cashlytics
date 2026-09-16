const { MERCHANT_HINTS } = require("../utils/constants");
const { normalizeMerchant } = require("../utils/fingerprint");
const MerchantPreference = require("../models/MerchantPreference");

function heuristicCategory(merchant) {
  const key = normalizeMerchant(merchant).toLowerCase();
  const hit = Object.keys(MERCHANT_HINTS).find((token) => key.includes(token));
  if (hit) return { category: MERCHANT_HINTS[hit], confidence: 92 };
  return { category: "Other", confidence: 62 };
}

async function categorizeTransaction(userId, merchant) {
  const name = normalizeMerchant(merchant);
  const pref = await MerchantPreference.findOne({ user: userId, merchant: name });
  if (pref) {
    return {
      category: pref.learnedCategory,
      confidence: pref.confidence,
      source: "learned",
    };
  }
  const guessed = heuristicCategory(merchant);
  return { ...guessed, source: "heuristic" };
}

module.exports = { categorizeTransaction, heuristicCategory };
