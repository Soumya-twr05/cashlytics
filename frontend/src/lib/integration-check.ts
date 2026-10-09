/**
 * Integration Health Checker
 * Verifies all services are working correctly
 */

import * as api from "./api";
import { CONFIG } from "./config";

export interface ServiceStatus {
  name: string;
  status: "healthy" | "unhealthy" | "checking";
  url: string;
  message?: string;
  lastChecked?: Date;
}

export interface IntegrationStatus {
  overall: "ok" | "degraded" | "offline";
  backend: ServiceStatus;
  ml: ServiceStatus;
  timestamp: Date;
}

async function checkService(
  name: string,
  healthUrl: string
): Promise<ServiceStatus> {
  const status: ServiceStatus = {
    name,
    status: "checking",
    url: healthUrl,
  };

  try {
    const response = await fetch(healthUrl);
    if (response.ok) {
      status.status = "healthy";
      status.message = "Service is operational";
    } else {
      status.status = "unhealthy";
      status.message = `HTTP ${response.status}`;
    }
  } catch (error) {
    status.status = "unhealthy";
    status.message =
      error instanceof Error ? error.message : "Connection failed";
  }

  status.lastChecked = new Date();
  return status;
}

export async function checkIntegration(): Promise<IntegrationStatus> {
  const [backend, ml] = await Promise.all([
    checkService(
      "Backend API",
      `${CONFIG.api.baseUrl.replace("/api", "")}/health`
    ),
    checkService("ML Service", `${CONFIG.ml.baseUrl}/health`),
  ]);

  const allHealthy =
    backend.status === "healthy" && ml.status === "healthy";
  const anyUnhealthy = backend.status === "unhealthy" || ml.status === "unhealthy";

  return {
    overall: allHealthy ? "ok" : anyUnhealthy ? "offline" : "degraded",
    backend,
    ml,
    timestamp: new Date(),
  };
}

export async function validateApiEndpoints(): Promise<{
  working: string[];
  failed: string[];
}> {
  const working: string[] = [];
  const failed: string[] = [];

  // Test key endpoints
  const endpoints = [
    {
      name: "Get Profile",
      fn: () => api.getProfile(),
    },
    {
      name: "List Transactions",
      fn: () => api.listTransactions({ limit: 1 }),
    },
    {
      name: "List Budgets",
      fn: () => api.listBudgets(),
    },
    {
      name: "List Goals",
      fn: () => api.listGoals(),
    },
    {
      name: "Dashboard Intelligence",
      fn: () => api.getDashboardIntelligence(),
    },
  ];

  for (const endpoint of endpoints) {
    try {
      await endpoint.fn();
      working.push(endpoint.name);
    } catch (error) {
      failed.push(endpoint.name);
    }
  }

  return { working, failed };
}

export async function validateMLEndpoints(): Promise<{
  working: string[];
  failed: string[];
}> {
  const working: string[] = [];
  const failed: string[] = [];

  // Test ML endpoints
  const endpoints = [
    {
      name: "Category Prediction",
      fn: () =>
        api.predictTransactionCategory("Test transaction at restaurant", 0),

    },
    {
      name: "Anomaly Detection",
      fn: () =>
        api.detectTransactionAnomaly({
          amount: 100,
          category: "Food",
          transaction_hour: 12,
          day_of_week: 3,
          is_weekend: 0,
          merchant_frequency: 5,
          user_avg_category_spend: 50,
        }),
    },
    {
      name: "Spending Forecast",
      fn: () =>
        api.forecastSpending({
          current_spending: 1000,
          days_available: 15,
          days_in_month: 30,
          recent_7_day_average: 200,
          weekday_average: 180,
          weekend_average: 220,
          historical_daily_average: 200,
        }),
    },
  ];

  for (const endpoint of endpoints) {
    try {
      await endpoint.fn();
      working.push(endpoint.name);
    } catch (error) {
      failed.push(endpoint.name);
    }
  }

  return { working, failed };
}

// Export convenience functions
export const IntegrationChecker = {
  checkServices: checkIntegration,
  validateBackendAPIs: validateApiEndpoints,
  validateMLAPIs: validateMLEndpoints,
};
