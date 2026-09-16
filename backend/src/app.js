const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const logger = require("./config/logger");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const transactionRoutes = require("./routes/transaction.routes");
const importRoutes = require("./routes/import.routes");
const budgetRoutes = require("./routes/budget.routes");
const goalRoutes = require("./routes/goal.routes");
const billRoutes = require("./routes/bill.routes");
const debtRoutes = require("./routes/debt.routes");
const intelligenceRoutes = require("./routes/intelligence.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "cashlytics-api", env: env.nodeEnv });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/import", importRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res) => {
  logger.warn(`404 ${req.method} ${req.path}`);
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

module.exports = app;
