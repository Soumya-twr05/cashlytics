const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const { fail } = require("../utils/response");
const { otpRequestSchema, otpVerifySchema } = require("../validators/auth.validator");

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return fail(res, "Validation failed", 422, error.details.map((d) => d.message));
    req.body = value;
    return next();
  };
}

// OTP Auth Routes
router.post("/otp/request", authLimiter, validate(otpRequestSchema), ctrl.requestOtp);
router.post("/otp/verify", authLimiter, validate(otpVerifySchema), ctrl.verifyOtp);

// Google OAuth Routes (Stubs)
router.get("/google", ctrl.googleAuth);
router.get("/google/callback", ctrl.googleAuth);

// Session Routes
router.get("/me", authMiddleware, ctrl.me);
router.post("/logout", authMiddleware, ctrl.logout);

module.exports = router;
