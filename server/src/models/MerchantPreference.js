const mongoose = require("mongoose");
const { CATEGORIES } = require("../utils/constants");

const merchantPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    merchant: { type: String, required: true, uppercase: true, trim: true },
    predictedCategory: { type: String, enum: CATEGORIES },
    learnedCategory: { type: String, enum: CATEGORIES, required: true },
    confidence: { type: Number, min: 0, max: 100, default: 90 },
    transactionCount: { type: Number, default: 1 },
    status: { type: String, enum: ["learned", "predicting", "pending"], default: "learned" },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

merchantPreferenceSchema.index({ user: 1, merchant: 1 }, { unique: true });

module.exports = mongoose.model("MerchantPreference", merchantPreferenceSchema);
