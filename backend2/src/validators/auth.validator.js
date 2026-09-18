const Joi = require("joi");

const otpRequestSchema = Joi.object({
  email: Joi.string().email().required(),
});

const otpVerifySchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
});

module.exports = { otpRequestSchema, otpVerifySchema };
