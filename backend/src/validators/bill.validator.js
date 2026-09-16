const Joi = require("joi");

const billSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  amount: Joi.number().min(0).required(),
  cadence: Joi.string().valid("monthly", "yearly", "weekly"),
  category: Joi.string(),
  nextDue: Joi.date().required(),
  autoPay: Joi.boolean(),
  status: Joi.string().valid("upcoming", "paid", "overdue"),
});

module.exports = { billSchema };
