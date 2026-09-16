const AIInsight = require("../models/AIInsight");
const { chat } = require("../services/ollama.service");
const { computeHealth } = require("../services/financialHealth.service");
const { success } = require("../utils/response");

async function ask(req, res, next) {
  try {
    const question = req.body.question || req.body.prompt || "";
    const health = await computeHealth(req.userId);
    const context = `Cashlytics user health score ${health.score}. Income ${health.income}, expenses ${health.expenses}, savings rate ${health.savingsRate}%.`;
    const reply = await chat(question, context);
    const insight = await AIInsight.create({
      user: req.userId,
      kind: "chat",
      title: question.slice(0, 80) || "AI question",
      body: reply.text,
      metadata: { source: reply.source },
    });
    return success(res, { reply: reply.text, source: reply.source, insightId: insight.id });
  } catch (err) {
    return next(err);
  }
}

async function insights(req, res, next) {
  try {
    const items = await AIInsight.find({ user: req.userId }).sort({ createdAt: -1 }).limit(30);
    return success(res, { items });
  } catch (err) {
    return next(err);
  }
}

module.exports = { ask, insights };
