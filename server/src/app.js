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

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "cashlytics-api-v2", env: env.nodeEnv });
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
