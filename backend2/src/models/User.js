const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    googleId: { type: String, sparse: true, unique: true },
    authProviders: [{ type: String, enum: ["email", "google"] }],
    avatar: { type: String },
    onboardingCompleted: { type: Boolean, default: false },
    plan: { type: String, default: "Free" },
    preferences: {
      emailReports: { type: Boolean, default: true },
      anomalyAlerts: { type: Boolean, default: true },
      weeklyInsights: { type: Boolean, default: true },
      budgetWarnings: { type: Boolean, default: true },
      goalUpdates: { type: Boolean, default: false },
      aiLearning: { type: Boolean, default: true },
      autoCateg: { type: Boolean, default: true },
      patternDetection: { type: Boolean, default: true },
      localProcessing: { type: Boolean, default: true },
      shareAnonymous: { type: Boolean, default: false },
      twoFactor: { type: Boolean, default: false },
      biometric: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
