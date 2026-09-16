const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  phone: Joi.string().allow("", null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const onboardingSchema = Joi.object({
  incomeRange: Joi.string().valid("lt30k", "30-60k", "60-120k", "gt120k").required(),
  monthlyIncome: Joi.number().min(0),
  savingsTargetPct: Joi.number().min(0).max(100),
  goals: Joi.array().items(Joi.string()),
  priorities: Joi.array().items(Joi.string()),
});

module.exports = { registerSchema, loginSchema, onboardingSchema };
