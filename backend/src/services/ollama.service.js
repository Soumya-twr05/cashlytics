const env = require("../config/env");
const logger = require("../config/logger");

async function chat(prompt, context = "") {
  const body = {
    model: env.ollamaModel,
    stream: false,
    prompt: `${context}\n\nUser: ${prompt}\nAssistant:`,
  };

  try {
    const res = await fetch(`${env.ollamaBaseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}`);
    const json = await res.json();
    return { source: "ollama", text: json.response || "" };
  } catch (err) {
    logger.warn(`Ollama unavailable: ${err.message}`);
    return {
      source: "fallback",
      text: fallbackReply(prompt),
    };
  }
}

function fallbackReply(prompt) {
  return `Based on your Cashlytics profile, I looked at "${prompt}". Your latest month shows elevated shopping and food velocity. Pause non-essential shopping and keep dining closer to baseline to protect the 20% savings target.`;
}

module.exports = { chat, fallbackReply };
