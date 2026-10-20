const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const transactionRoutes = require("./routes/transaction.routes");
const intelligenceRoutes = require("./routes/intelligence.routes");
const budgetRoutes = require("./routes/budget.routes");
const goalRoutes = require("./routes/goal.routes");
const assistantRoutes = require("./routes/assistant.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Trust the first proxy hop (required for Render and other reverse-proxy hosts).
// Without this, express-rate-limit logs a proxy configuration warning and may
// count every request as coming from the same IP address.
app.set("trust proxy", 1);

app.use(helmet());
const allowedOrigins = env.clientOrigin.includes(",")
  ? env.clientOrigin.split(",").map((s) => s.trim())
  : env.clientOrigin;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(apiLimiter);

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "cashlytics-api-v2",
    env: env.nodeEnv,
    ai: {
      provider: env.aiProvider,
      groqConfigured: Boolean(env.groqApiKey),
      groqModel: env.groqModel || "openai/gpt-oss-120b",
      ollamaConfigured: Boolean(env.ollamaBaseUrl),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  console.warn(`404 ${req.method} ${req.path}`);
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

module.exports = app;
