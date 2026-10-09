const mongoose = require("mongoose");

const financialProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    monthlyIncome: { type: Number, required: true, min: 0 },
    averageMonthlyExpenses: { type: Number, required: true, min: 0 },
    desiredMonthlySavings: { type: Number, required: true, min: 0 },
    spendingStyle: { type: String, enum: ["frugal", "moderate", "liberal"], default: "moderate" },
    priorities: [{ type: String }],
    currency: { type: String, default: "INR" },
    fiscalMonthStart: { type: Number, default: 1, min: 1, max: 28 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FinancialProfile", financialProfileSchema);
