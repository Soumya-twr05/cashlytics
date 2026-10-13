const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const skip = () => env.nodeEnv === "test";

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, message: "Too many requests, try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, message: "Too many auth attempts" },
});

module.exports = { apiLimiter, authLimiter };
