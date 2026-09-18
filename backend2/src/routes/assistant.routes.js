const router = require("express").Router();
const Joi = require("joi");
const ctrl = require("../controllers/assistant.controller");
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

const askSchema = Joi.object({
  question: Joi.string().min(3).max(2000),
  prompt: Joi.string().min(3).max(2000),
}).or("question", "prompt");

router.use(authMiddleware);
router.post("/ask", validate(askSchema), ctrl.ask);
router.get("/history", ctrl.history);

module.exports = router;
