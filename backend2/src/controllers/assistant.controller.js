const { chat } = require("../services/ollama.service");
const { computeHealth } = require("../services/intelligence.service");
const { success } = require("../utils/response");

async function ask(req, res, next) {
  try {
    const question = req.body.question || req.body.prompt || "";
    const facts = await computeHealth(req.userId);
    const reply = await chat(question, facts);
    return success(res, { reply: reply.text, source: reply.source });
  } catch (err) {
    return next(err);
  }
}

async function history(req, res, next) {
  try {
    // In backend2, assistant history is kept in-memory or returned empty for now.
    return success(res, { items: [] });
  } catch (err) {
    return next(err);
  }
}

module.exports = { ask, history };
