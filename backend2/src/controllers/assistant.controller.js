const { chat } = require("../services/ollama.service");
const { buildAssistantContext } = require("../services/assistant.service");
const AssistantMessage = require("../models/AssistantMessage");
const { success } = require("../utils/response");

async function ask(req, res, next) {
  try {
    const question = req.body.question || req.body.prompt || "";

    // Save user message to database
    if (req.userId && question.trim()) {
      await AssistantMessage.create({
        user: req.userId,
        role: "user",
        content: question.trim(),
      });
    }

    const context = await buildAssistantContext(req.userId);
    const result = await chat(question, context);

    // Save assistant reply to database
    if (req.userId && result?.reply) {
      await AssistantMessage.create({
        user: req.userId,
        role: "assistant",
        content: result.reply,
        insights: result.insights || [],
        suggestions: result.suggestions || [],
        chart: result.chart || null,
        source: result.source || "ollama",
      });
    }

    return success(res, {
      reply: result.reply,
      insights: result.insights || [],
      suggestions: result.suggestions || [],
      chart: result.chart,
      source: result.source,
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
    const items = await AssistantMessage.find({ user: req.userId })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return success(res, { items });
  } catch (err) {
    return next(err);
  }
}

async function clearHistory(req, res, next) {
  try {
    await AssistantMessage.deleteMany({ user: req.userId });
    return success(res, { message: "Conversation history cleared successfully" });
  } catch (err) {
    return next(err);
  }
}

module.exports = { ask, history, clearHistory };