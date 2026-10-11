const Joi = require("joi");
const { CATEGORIES, CATEGORY_MAP, TRANSACTION_TYPES, TRANSACTION_SOURCES, TRANSACTION_METHODS } = require("../utils/constants");

const ALLOWED_CATEGORIES = Array.from(new Set([...CATEGORIES, ...Object.keys(CATEGORY_MAP || {})]));

const transactionSchema = Joi.object({
  merchant: Joi.string().min(1).max(120).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid(...TRANSACTION_TYPES),
  category: Joi.string().valid(...ALLOWED_CATEGORIES),
  method: Joi.string().valid(...TRANSACTION_METHODS),
  source: Joi.string().valid(...TRANSACTION_SOURCES),
  occurredAt: Joi.date(),
  notes: Joi.string().allow("", null),
  verified: Joi.boolean(),
});

const recategorizeSchema = Joi.object({
  category: Joi.string().valid(...ALLOWED_CATEGORIES).required(),
});

module.exports = { transactionSchema, recategorizeSchema };

