/**
 * Integration Configuration
 * Connects Frontend, Backend API, and ML Service
 */

export const CONFIG = {
  // Backend API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || "http://127.0.0.1:5001/api",
    timeout: 30000,
    retries: 3,
  },

  // ML Service Configuration
  ml: {
    baseUrl: process.env.REACT_APP_ML_URL || "http://127.0.0.1:8000",
    timeout: 30000,
    services: {
      categoryPrediction: "/predict-category",
      anomalyDetection: "/detect-anomaly",
      spending_forecast: "/forecast",
    },
  },

  // Feature Flags
  features: {
    ml_predictions: true,
    anomaly_detection: true,
    spending_forecast: true,
    ai_assistant: true,
    smart_capture: true,
    budget_recommendations: true,
  },

  // Cache Configuration
  cache: {
    transactions: 5 * 60 * 1000, // 5 minutes
    budgets: 10 * 60 * 1000, // 10 minutes
    goals: 10 * 60 * 1000, // 10 minutes
    intelligence: 5 * 60 * 1000, // 5 minutes
  },

  // Pagination
  pagination: {
    defaultLimit: 50,
    maxLimit: 100,
  },

  // Endpoints
  endpoints: {
    // Auth
    auth: {
      requestOtp: "/auth/otp/request",
      verifyOtp: "/auth/otp/verify",
      me: "/auth/me",
      logout: "/auth/logout",
    },

    // Transactions
    transactions: {
      list: "/transactions",
      create: "/transactions",
      get: "/transactions/:id",
      update: "/transactions/:id",
      delete: "/transactions/:id",
      confirm: "/transactions/:id/confirm",
      recategorize: "/transactions/:id/recategorize",
      smartCapture: "/transactions/smart-capture",
      bulkVerify: "/transactions/bulk-verify",
    },

    // Budgets
    budgets: {
      list: "/budgets",
      create: "/budgets",
      update: "/budgets/:id",
      delete: "/budgets/:id",
    },

    // Goals
    goals: {
      list: "/goals",
      create: "/goals",
      update: "/goals/:id",
      delete: "/goals/:id",
    },

    // Profile
    profile: {
      get: "/profile",
      update: "/profile",
      updatePreferences: "/profile/preferences",
    },

    // Intelligence
    intelligence: {
      dashboard: "/intelligence/dashboard",
      snapshot: "/intelligence/snapshot",
      anomalies: "/intelligence/anomalies",
      trends: "/intelligence/trends",
      learning: "/intelligence/learning",
      forecast: "/intelligence/forecast",
    },

    // AI Assistant
    assistant: {
      ask: "/assistant/ask",
      history: "/assistant/history",
    },
  },
};

// Service URLs for easy access
export const SERVICE_URLS = {
  BACKEND: CONFIG.api.baseUrl,
  ML: CONFIG.ml.baseUrl,
};
