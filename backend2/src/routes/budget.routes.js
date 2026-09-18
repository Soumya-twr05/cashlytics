const router = require("express").Router();
const Joi = require("joi");
const ctrl = require("../controllers/budget.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { CATEGORIES } = require("../utils/constants");
const { fail } = require("../utils/response");

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return fail(res, "Validation failed", 422, error.details.map((d) => d.message));
    req.body = value;
    return next();
  };
}

const budgetSchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES).required(),
  amount: Joi.number().min(0).required(),
  color: Joi.string(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/),
  aiNote: Joi.string().allow("", null),
});

router.use(authMiddleware);
router.get("/", ctrl.list);
router.post("/", validate(budgetSchema), ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
