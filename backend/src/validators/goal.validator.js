const Joi = require("joi");

const goalSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  icon: Joi.string(),
  target: Joi.number().positive().required(),
  current: Joi.number().min(0),
  monthly: Joi.number().min(0),
  color: Joi.string(),
  deadline: Joi.date(),
});

module.exports = { goalSchema };
