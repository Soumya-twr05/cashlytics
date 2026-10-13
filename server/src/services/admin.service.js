const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const AssistantMessage = require("../models/AssistantMessage");
const env = require("../config/env");

/**
 * Platform Overview Metrics
 */
async function getOverviewMetrics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalTransactions,
    totalAssistantRequests,
    activeTransactionUsers,
    activeAssistantUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Transaction.countDocuments(),
    AssistantMessage.countDocuments({ role: "user" }),
    Transaction.distinct("user", { occurredAt: { $gte: thirtyDaysAgo } }),
    AssistantMessage.distinct("user", { createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  // Combine unique active user IDs across transactions and assistant activity
  const activeUserSet = new Set([
    ...activeTransactionUsers.map((id) => String(id)),
    ...activeAssistantUsers.map((id) => String(id)),
  ]);

  return {
    totalUsers,
    activeUsers: activeUserSet.size,
    totalTransactions,
    totalAssistantRequests,
    activePeriodDays: 30,
  };
}

/**
 * Searchable, paginated user list (sanitized)
 */
async function getUsersList({ page = 1, limit = 10, search = "", role = "" }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (role && (role === "admin" || role === "user")) {
    query.role = role;
  }

  if (search && typeof search === "string" && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { email: { $regex: escaped, $options: "i" } },
      { name: { $regex: escaped, $options: "i" } },
    ];
  }

  const [total, rawUsers] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("name email role authProviders plan onboardingCompleted createdAt updatedAt")
      .lean(),
  ]);

  const sanitizedUsers = rawUsers.map((u) => ({
    id: String(u._id),
    name: u.name || "",
    email: u.email,
    role: u.role || "user",
    authProviders: u.authProviders || [],
    plan: u.plan || "Free",
    onboardingCompleted: !!u.onboardingCompleted,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  return {
    users: sanitizedUsers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Platform Analytics: Category distribution & feature adoption
 */
async function getPlatformAnalytics() {
  const [categoryAgg, totalTransactions, totalBudgets, totalGoals, totalMessages, smartCaptureCount] =
    await Promise.all([
      Transaction.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.countDocuments(),
      Budget.countDocuments(),
      Goal.countDocuments(),
      AssistantMessage.countDocuments(),
      Transaction.countDocuments({ source: { $nin: ["Manual", null] } }),
    ]);

  const categoryDistribution = categoryAgg.map((item) => ({
    category: item._id || "Uncategorized",
    count: item.count,
    percentage:
      totalTransactions > 0
        ? Number(((item.count / totalTransactions) * 100).toFixed(1))
        : 0,
  }));

  return {
    categoryDistribution,
    featureUsage: {
      transactionsCount: totalTransactions,
      budgetsCount: totalBudgets,
      goalsCount: totalGoals,
      assistantMessagesCount: totalMessages,
      smartCaptureCount,
    },
  };
}

/**
 * AI/ML Activity & Monitoring
 */
async function getAiMlMonitoring() {
  const [providerAgg, sourceAgg, confidenceAgg, totalCategorized] = await Promise.all([
    AssistantMessage.aggregate([
      { $match: { role: "assistant" } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Transaction.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { confidence: { $ne: null } } },
      { $group: { _id: null, avgConfidence: { $avg: "$confidence" } } },
    ]),
    Transaction.countDocuments(),
  ]);

  const providerUsage = providerAgg.map((p) => ({
    provider: p._id || "unknown",
    count: p.count,
  }));

  const fallbackRecord = providerUsage.find((p) => p.provider === "fallback");
  const fallbackCount = fallbackRecord ? fallbackRecord.count : 0;
  const totalAssistantReplies = providerUsage.reduce((acc, curr) => acc + curr.count, 0);

  const categorizationBySource = sourceAgg.map((s) => ({
    source: s._id || "Manual",
    count: s.count,
  }));

  const avgConfidence =
    confidenceAgg.length > 0 && confidenceAgg[0].avgConfidence !== null
      ? Number((confidenceAgg[0].avgConfidence * 100).toFixed(1))
      : null;

  return {
    assistant: {
      totalReplies: totalAssistantReplies,
      providerUsage,
      fallbackCount,
      fallbackRate:
        totalAssistantReplies > 0
          ? Number(((fallbackCount / totalAssistantReplies) * 100).toFixed(1))
          : 0,
    },
    categorization: {
      totalCategorized,
      averageConfidencePercent: avgConfidence,
      bySource: categorizationBySource,
    },
    unavailableMetrics: [
      {
        metric: "ML Inference Latency & Error Rates",
        reason:
          "The FastAPI ML service operates statelessly in memory without a persistent telemetry log collection. To collect p95/p99 latency and inference error counts, implement an telemetry logging middleware or timeseries metrics collector.",
      },
    ],
  };
}

/**
 * System Health Check (Backend, MongoDB, ML Service)
 */
async function getSystemHealth() {
  const dbConnected = mongoose.connection.readyState === 1;

  let mlStatus = "unreachable";
  let mlLatencyMs = null;
  let mlDetail = null;

  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const mlResponse = await fetch(`${env.mlServiceUrl}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    mlLatencyMs = Date.now() - startTime;
    if (mlResponse.ok) {
      const mlJson = await mlResponse.json().catch(() => ({}));
      mlStatus = mlJson.status === "healthy" ? "healthy" : "degraded";
      mlDetail = mlJson;
    } else {
      mlStatus = "degraded";
    }
  } catch (err) {
    mlStatus = "unreachable";
  }

  return {
    backend: {
      status: "healthy",
      uptimeSeconds: Math.floor(process.uptime()),
      memoryHeapMb: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    },
    database: {
      status: dbConnected ? "connected" : "disconnected",
      connectionState: mongoose.connection.readyState,
    },
    mlService: {
      status: mlStatus,
      latencyMs: mlLatencyMs,
      url: env.mlServiceUrl,
      details: mlDetail,
    },
  };
}

module.exports = {
  getOverviewMetrics,
  getUsersList,
  getPlatformAnalytics,
  getAiMlMonitoring,
  getSystemHealth,
};
