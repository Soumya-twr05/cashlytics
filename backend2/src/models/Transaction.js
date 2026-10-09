const mongoose = require("mongoose");
const { CATEGORIES, TRANSACTION_TYPES, TRANSACTION_SOURCES, TRANSACTION_METHODS, CAPTURE_STAGES } = require("../utils/constants");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rawDescription: { type: String, trim: true },
    merchant: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 }, // Amounts must be positive
    type: { type: String, enum: TRANSACTION_TYPES, default: "debit" },
    category: { type: String, enum: CATEGORIES, default: "Other" },
    method: { type: String, enum: TRANSACTION_METHODS, default: "UPI" },
    source: { type: String, enum: TRANSACTION_SOURCES, default: "Manual" },
    confidence: { type: Number, min: 0.0, max: 1.0, default: 0.8 }, // Standardized 0.0 to 1.0
    verified: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },
    stage: { type: String, enum: CAPTURE_STAGES, default: "ready" },
    fingerprint: { type: String, index: true },
    occurredAt: { type: Date, default: Date.now, index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Enforce constraint that category Income matches type credit, though this is primarily application logic
// We enforce index performance here
transactionSchema.index({ user: 1, occurredAt: -1 });
transactionSchema.index({ user: 1, fingerprint: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Transaction", transactionSchema);
