const Joi = require("joi");

const otpRequestSchema = Joi.object({
  email: Joi.string().email().required(),
  mode: Joi.string().valid("signin", "signup").optional().default("signin"),
});

const otpVerifySchema = Joi.object({
  email: Joi.string().email().required(),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),

  name: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .optional(),

  mode: Joi.string()
    .valid("signin", "signup")
    .optional()
    .default("signin"),
});

module.exports = {
  otpRequestSchema,
  otpVerifySchema,
};