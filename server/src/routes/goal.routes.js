const router = require("express").Router();
const Joi = require("joi");
const ctrl = require("../controllers/goal.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { fail } = require("../utils/response");

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return fail(res, "Validation failed", 422, error.details.map((d) => d.message));
    req.body = value;
    return next();
  };
}

const goalSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  icon: Joi.string(),
  target: Joi.number().positive().required(),
  current: Joi.number().min(0),
  monthly: Joi.number().min(0),
  color: Joi.string(),
  deadline: Joi.date(),
});

router.use(authMiddleware);
router.get("/", ctrl.list);
router.post("/", validate(goalSchema), ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
