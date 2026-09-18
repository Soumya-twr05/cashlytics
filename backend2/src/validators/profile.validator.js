const Joi = require("joi");
const { CATEGORIES, TRANSACTION_TYPES, TRANSACTION_SOURCES, TRANSACTION_METHODS } = require("../utils/constants");

const profileUpdateSchema = Joi.object({
  monthlyIncome: Joi.number().min(0).required(),
  averageMonthlyExpenses: Joi.number().min(0).required(),
  desiredMonthlySavings: Joi.number().min(0).required(),
  spendingStyle: Joi.string().valid("frugal", "moderate", "liberal"),
  priorities: Joi.array().items(Joi.string()),
  currency: Joi.string().length(3),
  fiscalMonthStart: Joi.number().min(1).max(28),
});

const preferencesSchema = Joi.object({
  emailReports: Joi.boolean(),
  anomalyAlerts: Joi.boolean(),
  weeklyInsights: Joi.boolean(),
  budgetWarnings: Joi.boolean(),
  goalUpdates: Joi.boolean(),
  aiLearning: Joi.boolean(),
  autoCateg: Joi.boolean(),
  patternDetection: Joi.boolean(),
  localProcessing: Joi.boolean(),
  shareAnonymous: Joi.boolean(),
  twoFactor: Joi.boolean(),
  biometric: Joi.boolean(),
});

module.exports = { profileUpdateSchema, preferencesSchema };
