const router = require("express").Router();
const multer = require("multer");

const ctrl = require("../controllers/profile.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  profileUpdateSchema,
  preferencesSchema,
} = require("../validators/profile.validator");
const { fail } = require("../utils/response");

// Avatar upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, and WebP images are allowed")
      );
    }

    cb(null, true);
  },
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return fail(
        res,
        "Validation failed",
        422,
        error.details.map((d) => d.message)
      );
    }

    req.body = value;
    return next();
  };
}

router.use(authMiddleware);

router.get("/", ctrl.getProfile);

router.patch(
  "/",
  validate(profileUpdateSchema),
  ctrl.updateProfile
);

router.patch(
  "/preferences",
  validate(preferencesSchema),
  ctrl.updatePreferences
);

// Profile photo upload
router.patch(
  "/avatar",
  upload.single("avatar"),
  ctrl.updateAvatar
);

// Atomic onboarding completion: saves profile + seeds income transaction + creates goals
router.post("/complete-onboarding", ctrl.completeOnboarding);

module.exports = router;