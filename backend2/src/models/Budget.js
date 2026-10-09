const mongoose = require("mongoose");
const { CATEGORIES } = require("../utils/constants");

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: CATEGORIES, required: true },
    amount: { type: Number, required: true, min: 0 },
    color: { type: String, default: "#10b981" },
    month: { type: String, required: true },
    aiNote: { type: String },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
