const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index to automatically delete expired documents after 1 hour
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
