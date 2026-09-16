const router = require("express").Router();
const Joi = require("joi");
const ctrl = require("../controllers/ai.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const askSchema = Joi.object({
  question: Joi.string().min(3).max(2000),
  prompt: Joi.string().min(3).max(2000),
}).or("question", "prompt");

router.use(authMiddleware);
router.post("/ask", validate(askSchema), ctrl.ask);
router.get("/insights", ctrl.insights);

module.exports = router;
