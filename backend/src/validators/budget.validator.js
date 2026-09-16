const Joi = require("joi");
const { CATEGORIES } = require("../utils/constants");

const budgetSchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES).required(),
  amount: Joi.number().min(0).required(),
  color: Joi.string(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/),
  aiNote: Joi.string().allow("", null),
});

module.exports = { budgetSchema };
