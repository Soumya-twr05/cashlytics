const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema, onboardingSchema } = require("../validators/auth.validator");
const { authMiddleware } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");

router.post("/register", authLimiter, validate(registerSchema), ctrl.register);
router.post("/login", authLimiter, validate(loginSchema), ctrl.login);
router.get("/me", authMiddleware, ctrl.me);
router.post("/onboarding", authMiddleware, validate(onboardingSchema), ctrl.onboarding);

module.exports = router;
