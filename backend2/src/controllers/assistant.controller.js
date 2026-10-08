const { chat } = require("../services/ollama.service");
const { buildAssistantContext } = require("../services/assistant.service");
const { success } = require("../utils/response");

async function ask(req, res, next) {
  try {
    const question = req.body.question || req.body.prompt || "";

    const context = await buildAssistantContext(req.userId);

    const reply = await chat(question, context.health);

    return success(res, {
      reply: reply.text,
      source: reply.source,
      context: {
        categories: context.categories,
        recentTransactions: context.recentTransactions,
        budgets: context.budgets,
        goals: context.goals,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function history(req, res, next) {
  try {
    return success(res, { items: [] });
  } catch (err) {
    return next(err);
  }
}

module.exports = { ask, history };