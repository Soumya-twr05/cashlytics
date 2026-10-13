const env = require("../config/env");

async function predictCategory(description, amount) {
  try {
    const res = await fetch(`${env.mlServiceUrl}/predict-category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount }),
    });
    if (!res.ok) throw new Error(`ML Service error: ${res.status}`);
    const data = await res.json();
    return { category: data.category || "Other", confidence: data.confidence || 0.6 };
  } catch (err) {
    console.warn(`ML category prediction failed: ${err.message}`);
    return null;
  }
}

async function detectAnomaly(features) {
  try {
    const res = await fetch(`${env.mlServiceUrl}/detect-anomaly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });
    if (!res.ok) throw new Error(`ML Service error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`ML anomaly detection failed: ${err.message}`);
    return null;
  }
}

async function forecastMonthlySpending(features) {
  try {
    const res = await fetch(`${env.mlServiceUrl}/forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });
    if (!res.ok) throw new Error(`ML Service error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`ML forecasting failed: ${err.message}`);
    return null;
  }
}

module.exports = { predictCategory, detectAnomaly, forecastMonthlySpending };
