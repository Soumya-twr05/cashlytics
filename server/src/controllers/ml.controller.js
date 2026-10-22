const mlService = require("../services/ml.service");
const { success, fail } = require("../utils/response");

/**
 * POST /api/ml/predict-category
 *
 * Proxies the category-prediction request from the browser to the
 * FastAPI ML service.  The frontend never needs to know the ML URL —
 * it calls this Node.js endpoint instead, which already has
 * ML_SERVICE_URL configured via the server environment variable.
 */
async function predictCategory(req, res) {
  const { description, amount } = req.body;

  if (!description || typeof description !== "string" || !description.trim()) {
    return fail(res, "description is required", 422);
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return fail(res, "amount must be a positive number", 422);
  }

  const result = await mlService.predictCategory(
    description.trim(),
    numericAmount
  );

  if (!result) {
    // ML service is down — return a safe fallback so the frontend can still
    // submit the transaction with "Other" as the category.
    return success(res, {
      category: "Other",
      confidence: 0,
      fallback: true,
    }, "ML service unavailable — using fallback");
  }

  return success(res, result, "Category predicted");
}

module.exports = { predictCategory };
