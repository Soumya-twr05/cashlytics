const path = require("path");
const fs = require("fs");

function loadClassifier() {
  const file = path.resolve(__dirname, "../../ml/models/transaction_classifier.joblib");
  return { available: fs.existsSync(file) && fs.statSync(file).size > 0, path: file };
}

function loadAnomalyDetector() {
  const file = path.resolve(__dirname, "../../ml/models/anomaly_detector.joblib");
  return { available: fs.existsSync(file) && fs.statSync(file).size > 0, path: file };
}

function scoreAnomaly(amount, baseline) {
  if (!baseline) return { factor: 1, severity: "low" };
  const factor = amount / Math.max(baseline, 1);
  const severity = factor >= 2 ? "high" : factor >= 1.3 ? "medium" : "low";
  return { factor: Number(factor.toFixed(2)), severity };
}

module.exports = { loadClassifier, loadAnomalyDetector, scoreAnomaly };
