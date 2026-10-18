

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:5001/api";
export const ML_BASE_URL = (import.meta as any).env?.VITE_ML_URL || "http://127.0.0.1:8000";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
};

function getAuthHeaders(includeJson = true) {
  const token = getToken();

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(!isFormData),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

async function mlRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${ML_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "ML service error");
  }

  return data;
}

// ============================================================
// AUTH
// ============================================================

export async function requestOtp(email: string, mode: "signin" | "signup" = "signin") {
  return request("/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ email, mode }),
  });
}

export async function verifyOtp(
  email: string,
  otp: string,
  name?: string,
  mode: "signin" | "signup" = "signin"
) {
  return request<{
    token: string;
    user: {
      id: string;
      email: string;
      name?: string;
      onboardingCompleted?: boolean;
    };
    onboardingCompleted?: boolean;
  }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
      mode,
      ...(name?.trim()
        ? { name: name.trim() }
        : {}),
    }),
  });
}

export async function getAuthMe() {
  return request("/auth/me", {
    method: "GET",
  });
}

export async function logout() {
  return request("/auth/logout", {
    method: "POST",
  });
}

export function saveToken(token: string) {
  localStorage.setItem("cashlytics_token", token);
}

export function getToken() {
  return localStorage.getItem("cashlytics_token");
}

export function clearToken() {
  localStorage.removeItem("cashlytics_token");
}

// ============================================================
// PROFILE
// ============================================================

export type ProfileResponse = {
  profile: {
    monthlyIncome: number;
    averageMonthlyExpenses: number;
    desiredMonthlySavings: number;
    spendingStyle: "frugal" | "moderate" | "liberal";
    priorities: string[];
    currency: string;
    fiscalMonthStart: number;
  } | null;

  user: {
    _id?: string;
    name?: string;
    email: string;
    avatar?: string;
    authProviders?: string[];
    onboardingCompleted?: boolean;
    plan?: string;
    preferences?: Record<string, boolean>;
    createdAt?: string;
  };
};

export async function getProfile(): Promise<
  ApiResponse<ProfileResponse>
> {
  return request<ProfileResponse>("/profile", {
    method: "GET",
  });
}

export type UpdateProfileData = {
  monthlyIncome: number;
  averageMonthlyExpenses: number;
  desiredMonthlySavings: number;
  spendingStyle: "frugal" | "moderate" | "liberal";
  priorities: string[];
  currency?: string;
  fiscalMonthStart?: number;
};

export async function updateProfile(
  data: UpdateProfileData
): Promise<ApiResponse<unknown>> {
  return request<unknown>("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function completeOnboarding(data: {
  monthlyIncome: number;
  averageMonthlyExpenses: number;
  desiredMonthlySavings: number;
  spendingStyle: "frugal" | "moderate" | "liberal";
  priorities: string[];
  goals?: Array<{ name: string; target?: number; icon?: string; color?: string }>;
}): Promise<ApiResponse<unknown>> {
  return request<unknown>("/profile/complete-onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProfilePreferences(
  preferences: Record<string, boolean>
): Promise<ApiResponse<unknown>> {
  return request<unknown>("/profile/preferences", {
    method: "PATCH",
    body: JSON.stringify(preferences),
  });
}

export async function updateProfileAvatar(
  file: File
): Promise<ApiResponse<unknown>> {
  const formData = new FormData();

  formData.append("avatar", file);

  return request<unknown>("/profile/avatar", {
    method: "PATCH",
    body: formData,
  });
}

// ============================================================
// TRANSACTIONS
// ============================================================

export interface TransactionItem {
  _id: string;
  merchant?: string;
  amount: number;
  type?: "debit" | "credit";
  category?: string;
  method?: string;
  source?: string;
  confidence?: number;
  verified?: boolean;
  confirmed?: boolean;
  stage?: string;
  occurredAt?: string;
  date?: string;
}

export interface GoalItem {
  _id: string;
  name: string;
  icon?: string;
  target: number;
  current?: number;
  monthly?: number;
  color?: string;
  deadline?: string;
  createdAt?: string;
}

export async function listTransactions(params?: {
  skip?: number;
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}) {
  const query = new URLSearchParams();

  if (params?.skip !== undefined) {
    query.append("skip", String(params.skip));
  }

  if (params?.page !== undefined) {
    query.append("page", String(params.page));
  }

  if (params?.limit !== undefined) {
    query.append("limit", String(params.limit));
  }

  if (params?.category) {
    query.append("category", params.category);
  }

  if (params?.type) {
    query.append("type", params.type);
  }

  if (params?.startDate) {
    query.append("startDate", params.startDate);
  }

  if (params?.endDate) {
    query.append("endDate", params.endDate);
  }

  const queryString = query.toString();

  return request<{
    items: TransactionItem[];
    pagination?: {
      page?: number;
      skip?: number;
      limit?: number;
      total?: number;
      pages?: number;
    };
  }>(
    `/transactions${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    }
  );
}

export async function createTransaction(data: {
  merchant?: string;
  description?: string;
  amount: number;
  category?: string;
  date?: string;
  occurredAt?: string;
  type?: "debit" | "credit";
  method?: string;
  source?: string;
  notes?: string;
}) {
  const transactionData: Record<string, unknown> = {
    merchant:
      data.merchant ||
      data.description ||
      "Transaction",

    amount: Math.abs(data.amount),
  };

  if (data.category) {
    transactionData.category = data.category;
  }

  if (data.type) {
    transactionData.type = data.type;
  }

  if (data.method) {
    transactionData.method = data.method;
  }

  if (data.source) {
    transactionData.source = data.source;
  }

  if (data.notes) {
    transactionData.notes = data.notes;
  }

  if (data.occurredAt) {
    transactionData.occurredAt = data.occurredAt;
  } else if (data.date) {
    transactionData.occurredAt = new Date(
      data.date
    ).toISOString();
  }

  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(transactionData),
  });
}

export async function getTransaction(id: string) {
  return request(`/transactions/${id}`, {
    method: "GET",
  });
}

export async function smartCaptureTransactions() {
  return request<any>("/transactions/smart-capture", {
    method: "GET",
  });
}

export async function updateTransaction(
  id: string,
  data: Record<string, unknown>
) {
  return request(`/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: string) {
  return request(`/transactions/${id}`, {
    method: "DELETE",
  });
}

export async function confirmTransaction(id: string) {
  return request(`/transactions/${id}/confirm`, {
    method: "POST",
  });
}

export async function recategorizeTransaction(
  id: string,
  category: string
) {
  return request(`/transactions/${id}/recategorize`, {
    method: "POST",
    body: JSON.stringify({ category }),
  });
}


export async function bulkVerifyTransactions(
  ids: string[]
) {
  return request("/transactions/bulk-verify", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ============================================================
// BUDGETS
// ============================================================

export async function listBudgets(params?: {
  month?: string;
}) {
  const query = new URLSearchParams();

  if (params?.month) {
    query.append("month", params.month);
  }

  const queryString = query.toString();

  return request(
    `/budgets${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    }
  );
}

export async function createBudget(data: {
  category: string;
  amount: number;
  color?: string;
  month?: string;
  aiNote?: string;
}) {
  return request("/budgets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBudget(
  id: string,
  data: Record<string, unknown>
) {
  return request(`/budgets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteBudget(id: string) {
  return request(`/budgets/${id}`, {
    method: "DELETE",
  });
}

// ============================================================
// GOALS
// ============================================================

export async function listGoals() {
  return request<{ items: GoalItem[] }>("/goals", {
    method: "GET",
  });
}

export async function createGoal(data: {
  name: string;
  target: number;
  icon?: string;
  current?: number;
  monthly?: number;
  color?: string;
  deadline?: string;
}) {
  return request("/goals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGoal(
  id: string,
  data: Record<string, unknown>
) {
  return request(`/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteGoal(id: string) {
  return request(`/goals/${id}`, {
    method: "DELETE",
  });
}

// ============================================================
// ANALYTICS
// ============================================================

export async function getMonthlySpending() {
  return request("/analytics/spending/monthly", { method: "GET" });
}

export async function getCategoryTrends() {
  return request("/analytics/spending/category-trends", { method: "GET" });
}

export async function getYearlySpending() {
  return request("/analytics/spending/yearly", { method: "GET" });
}

// ============================================================
// INTELLIGENCE
// ============================================================

export async function getDashboardIntelligence() {
  return request("/intelligence/dashboard", {
    method: "GET",
  });
}

export async function getFinancialSnapshot() {
  return request("/intelligence/snapshot", {
    method: "GET",
  });
}

export async function getAnomalies() {
  return request("/intelligence/anomalies", {
    method: "GET",
  });
}

export async function getTrends() {
  return request("/intelligence/trends", {
    method: "GET",
  });
}

export async function getLearning() {
  return request("/intelligence/learning", {
    method: "GET",
  });
}

export async function getForecast() {
  return request("/intelligence/forecast", {
    method: "GET",
  });
}

// ============================================================
// AI ASSISTANT
// ============================================================

export interface AssistantAskResponse {
  reply: string;
  source?: string;
  context?: {
    categories?: unknown[];
    recentTransactions?: unknown[];
    budgets?: unknown[];
    goals?: unknown[];
  };
}

export async function askAssistant(
  question: string
) {
  return request<AssistantAskResponse>("/assistant/ask", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export async function getAssistantHistory() {
  return request<{ items: any[] }>("/assistant/history", {
    method: "GET",
  });
}

export async function clearAssistantHistory() {
  return request<{ message: string }>("/assistant/history", {
    method: "DELETE",
  });
}

// ============================================================
// ML SERVICE
// ============================================================

export interface CategoryPrediction {
  category: string;
  confidence: number;
}

export async function predictTransactionCategory(
  description: string,
  amount: number
): Promise<CategoryPrediction> {
  return mlRequest<CategoryPrediction>(
    "/predict-category",
    {
      method: "POST",
      body: JSON.stringify({
        description: description.trim(),
        amount: Math.abs(amount),
      }),
    }
  );
}

export async function detectTransactionAnomaly(
  data: {
    amount: number;
    category: string;
    transaction_hour: number;
    day_of_week: number;
    is_weekend: number;
    merchant_frequency: number;
    user_avg_category_spend: number;
  }
) {
  return mlRequest<{
    is_anomaly: boolean;
    risk_score: number;
    risk_level: string;
    reasons: string[];
  }>("/detect-anomaly", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forecastSpending(
  data: {
    current_spending: number;
    days_available: number;
    days_in_month: number;
    recent_7_day_average: number;
    weekday_average: number;
    weekend_average: number;
    historical_daily_average: number;
  }
) {
  return mlRequest<{
    forecast: number;
    lower_bound: number;
    upper_bound: number;
  }>("/forecast", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkBackendHealth() {
  return fetch(
    `${API_BASE_URL.replace("/api", "")}/health`
  ).then((response) => response.json());
}

export async function checkMLHealth() {
  return fetch(
    `${ML_BASE_URL}/health`
  ).then((response) => response.json());
}

// ============================================================
// ADMIN APIS
// ============================================================

export interface AdminOverviewData {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalAssistantRequests: number;
  activePeriodDays: number;
}

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  authProviders: string[];
  plan: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  users: AdminUserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminAnalyticsData {
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  featureUsage: {
    transactionsCount: number;
    budgetsCount: number;
    goalsCount: number;
    assistantMessagesCount: number;
    smartCaptureCount: number;
  };
}

export interface AdminAiMlData {
  assistant: {
    totalReplies: number;
    providerUsage: Array<{ provider: string; count: number }>;
    fallbackCount: number;
    fallbackRate: number;
  };
  categorization: {
    totalCategorized: number;
    averageConfidencePercent: number | null;
    bySource: Array<{ source: string; count: number }>;
  };
  unavailableMetrics: Array<{
    metric: string;
    reason: string;
  }>;
}

export interface AdminHealthData {
  backend: {
    status: string;
    uptimeSeconds: number;
    memoryHeapMb: number;
    nodeVersion: string;
    timestamp: string;
  };
  database: {
    status: string;
    connectionState: number;
  };
  mlService: {
    status: string;
    latencyMs: number | null;
    url: string;
    details?: any;
  };
}

export async function getAdminOverview() {
  return request<AdminOverviewData>("/admin/overview", { method: "GET" });
}

export async function getAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.role) query.append("role", params.role);
  const qStr = query.toString();
  return request<AdminUsersResponse>(`/admin/users${qStr ? `?${qStr}` : ""}`, {
    method: "GET",
  });
}

export async function getAdminAnalytics() {
  return request<AdminAnalyticsData>("/admin/analytics", { method: "GET" });
}

export async function getAdminAiMl() {
  return request<AdminAiMlData>("/admin/ai-ml", { method: "GET" });
}

export async function getAdminHealth() {
  return request<AdminHealthData>("/admin/health", { method: "GET" });
}