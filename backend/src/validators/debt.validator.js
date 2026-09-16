const Joi = require("joi");

const debtSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  principal: Joi.number().min(0).required(),
  remaining: Joi.number().min(0).required(),
  apr: Joi.number().min(0),
  minPayment: Joi.number().min(0),
  lender: Joi.string().allow("", null),
});

module.exports = { debtSchema };
