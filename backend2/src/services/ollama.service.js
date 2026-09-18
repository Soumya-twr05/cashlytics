const env = require("../config/env");

async function chat(prompt, facts = {}) {
  const context = `You are Cashlytics, a financial assistant. Use ONLY these grounded facts:
Income: ${facts.income}
Expenses: ${facts.expenses}
Savings: ${facts.savings}
Savings Rate: ${facts.savingsRate}%
Budgets Exceeded: ${facts.budgetsExceeded}
Health Score: ${facts.score}

Do not invent numbers. If you don't know, say you don't know. Keep responses short and helpful.`;

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
    console.warn(`Ollama unavailable: ${err.message}`);
    return {
      source: "fallback",
      text: fallbackReply(facts),
    };
  }
}

function fallbackReply(facts) {
  return `AI assistant is temporarily unavailable. Your financial data is still available in Cashlytics. Currently, your savings rate is ${facts.savingsRate}%, and your health score is ${facts.score}. You have exceeded ${facts.budgetsExceeded} budgets this month.`;
}

module.exports = { chat, fallbackReply };
