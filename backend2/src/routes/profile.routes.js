const router = require("express").Router();
const ctrl = require("../controllers/profile.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { profileUpdateSchema, preferencesSchema } = require("../validators/profile.validator");
const { fail } = require("../utils/response");

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return fail(res, "Validation failed", 422, error.details.map((d) => d.message));
    req.body = value;
    return next();
  };
}

router.use(authMiddleware);
router.get("/", ctrl.getProfile);
router.patch("/", validate(profileUpdateSchema), ctrl.updateProfile);
router.patch("/preferences", validate(preferencesSchema), ctrl.updatePreferences);

module.exports = router;
