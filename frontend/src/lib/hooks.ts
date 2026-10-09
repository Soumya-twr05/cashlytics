import { useEffect, useState } from "react";
import * as api from "./api";

// ==================== TRANSACTIONS ====================
export function useTransactions(params?: {
  skip?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.listTransactions(params);
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading transactions");
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.skip, params?.limit, params?.category, params?.startDate, params?.endDate]);

  return { data, loading, error, refetch: () => window.location.reload() };
}

export function useTransaction(id: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const result = await api.getTransaction(id);
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading transaction");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { data, loading, error };
}

// ==================== BUDGETS ====================
export function useBudgets(month?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.listBudgets({ month });
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading budgets");
      } finally {
        setLoading(false);
      }
    })();
  }, [month]);

  return { data, loading, error };
}

// ==================== GOALS ====================
export function useGoals() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.listGoals();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading goals");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

// ==================== INTELLIGENCE ====================
export function useDashboardIntelligence() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.getDashboardIntelligence();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading intelligence");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

export function useFinancialSnapshot() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.getFinancialSnapshot();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading snapshot");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

export function useAnomalies() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.getAnomalies();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading anomalies");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

export function useTrends() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.getTrends();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading trends");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

export function useLearning() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.getLearning();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading learning");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

export function useForecast() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.getForecast();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading forecast");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

// ==================== PROFILE ====================
export function useProfile() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await api.getProfile();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

// ==================== ML PREDICTIONS ====================
export async function predictCategory(description: string) {
  return api.predictTransactionCategory(description, 0);

}

export async function detectAnomaly(data: {
  amount: number;
  category: string;
  transaction_hour: number;
  day_of_week: number;
  is_weekend: number;
  merchant_frequency: number;
  user_avg_category_spend: number;
}) {
  return api.detectTransactionAnomaly(data);
}

export async function forecastMonthlySpending(data: {
  current_spending: number;
  days_available: number;
  days_in_month: number;
  recent_7_day_average: number;
  weekday_average: number;
  weekend_average: number;
  historical_daily_average: number;
}) {
  return api.forecastSpending(data);
}

// ==================== HEALTH CHECK ====================
export function useBackendHealth() {
  const [healthy, setHealthy] = useState(true);

  useEffect(() => {
    api
      .checkBackendHealth()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
  }, []);

  return healthy;
}

export function useMLHealth() {
  const [healthy, setHealthy] = useState(true);

  useEffect(() => {
    api
      .checkMLHealth()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
  }, []);

  return healthy;
}
