import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, ReferenceLine,
} from "recharts";
import * as api from "../lib/api";

function CT({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="px-3 py-2 text-xs rounded-sm border" style={{ background: "#0f1318", borderColor: "var(--border)", fontFamily: "var(--font-jetbrains)" }}>
      <div className="mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color || p.fill }}>●</span>
          <span style={{ color: "var(--foreground)" }}>{typeof p.value === 'number' && p.value > 1000 ? `₹${p.value.toLocaleString("en-IN")}` : p.value}</span>
          <span style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
}

const CHART_TABS = ["Income vs Expense", "Savings Trend", "Top Merchants", "Spending Velocity"];

export default function Analytics() {
  const [active, setActive] = useState("Top Merchants");
  const [txns, setTxns] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [profileIncome, setProfileIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [txRes, trendRes, profileRes] = await Promise.allSettled([
          api.listTransactions({ limit: 1000 }) as any,
          api.getTrends() as any,
          api.getProfile() as any,
        ]);

        if (txRes.status === "fulfilled") {
          setTxns((txRes.value as any)?.data?.items || []);
        }

        if (trendRes.status === "fulfilled") {
          const items = (trendRes.value as any)?.data?.items || [];
          setMonthlyTrend(items);
        }

        if (profileRes.status === "fulfilled") {
          const income = (profileRes.value as any)?.data?.profile?.monthlyIncome || 0;
          setProfileIncome(income);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const merchantMap: Record<string, { total: number; count: number }> = {};
  let totalExpensesThisMonth = 0;
  let totalIncomeThisMonth = 0;

  // Group by week for velocity
  const weekMap: Record<string, number> = {};

  txns.forEach((tx) => {
    const date = tx.occurredAt ? new Date(tx.occurredAt) : null;
    if (tx.type === "debit") {
      totalExpensesThisMonth += tx.amount || 0;
      const m = tx.merchant || tx.category || "Unknown";
      if (!merchantMap[m]) merchantMap[m] = { total: 0, count: 0 };
      merchantMap[m].total += tx.amount || 0;
      merchantMap[m].count += 1;

      // Weekly velocity grouping
      if (date) {
        // ISO week key: YYYY-Www
        const jan1 = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
        const weekKey = `W${weekNum}`;
        weekMap[weekKey] = (weekMap[weekKey] || 0) + (tx.amount || 0);
      }
    } else if (tx.type === "credit") {
      totalIncomeThisMonth += tx.amount || 0;
    }
  });

  const MERCHANT_DATA = Object.entries(merchantMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Income vs Expense: use monthly trend data (real), fallback to profile income
  const INCOME_VS_EXPENSE = monthlyTrend.length > 0
    ? monthlyTrend.slice(-6).map((row: any) => {
        const [year, month] = row.month.split("-");
        const label = new Date(Number(year), Number(month) - 1, 1)
          .toLocaleString("en-IN", { month: "short" });
        return {
          month: label,
          income: row.income || profileIncome,
          expense: row.expenses || 0,
        };
      })
    : [{ month: "This Month", income: totalIncomeThisMonth || profileIncome, expense: totalExpensesThisMonth }];

  // Savings Trend: derived from monthly trend
  const SAVINGS_TREND: any[] = monthlyTrend.slice(-6).map((row: any) => {
    const [year, month] = row.month.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1)
      .toLocaleString("en-IN", { month: "short" });
    const income = row.income || profileIncome;
    const savings = row.income - row.expenses;
    const rate = income > 0 ? Math.round((savings / income) * 100) : 0;
    return { month: label, savings: Math.max(0, savings), rate: Math.max(0, rate) };
  });

  // Spending Velocity: weekly spend averages
  const VELOCITY_DATA: any[] = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, total]) => ({ week, daily: Math.round(total / 7) }));

  // Compute KPI values from real data
  const avgMonthlyExpense = monthlyTrend.length > 0
    ? Math.round(monthlyTrend.reduce((s: number, r: any) => s + r.expenses, 0) / monthlyTrend.length)
    : totalExpensesThisMonth;

  const momChange = monthlyTrend.length >= 2
    ? (() => {
        const prev = monthlyTrend[monthlyTrend.length - 2]?.expenses || 0;
        const curr = monthlyTrend[monthlyTrend.length - 1]?.expenses || 0;
        return prev > 0 ? (((curr - prev) / prev) * 100).toFixed(1) : "—";
      })()
    : "—";

  const bestSavingsMonth = monthlyTrend.reduce((best: any, row: any) => {
    const savings = row.income - row.expenses;
    return savings > (best?.savings || 0) ? { month: row.month, savings } : best;
  }, null);

  const largestTx = [...txns].filter(t => t.type === "debit").sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center" style={{ minHeight: "300px" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Avg Monthly Expenses",
            value: avgMonthlyExpense > 0 ? `₹${avgMonthlyExpense.toLocaleString("en-IN")}` : "—",
            sub: "Based on history",
            color: "var(--expense, #f87171)"
          },
          {
            label: "Expense Growth",
            value: momChange !== "—" ? `${Number(momChange) >= 0 ? "+" : ""}${momChange}%` : "—",
            sub: "Month over month",
            color: "var(--warning)"
          },
          {
            label: "Best Savings Month",
            value: bestSavingsMonth ? (() => {
              const [y, m] = bestSavingsMonth.month.split("-");
              return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-IN", { month: "short", year: "numeric" });
            })() : "—",
            sub: bestSavingsMonth ? `₹${Math.round(bestSavingsMonth.savings).toLocaleString("en-IN")} saved` : "No data yet",
            color: "var(--primary)"
          },
          {
            label: "Largest Single Transaction",
            value: largestTx ? `₹${largestTx.amount.toLocaleString("en-IN")}` : "—",
            sub: largestTx ? `${largestTx.merchant || largestTx.category || "Unknown"}` : "No transactions yet",
            color: "var(--ai-color)"
          },
        ].map((k) => (
          <div
            key={k.label}
            className="p-4 rounded-sm border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{k.label}</div>
            <div
              className="font-bold tabular-nums text-xl mb-0.5"
              style={{ fontFamily: "var(--font-jetbrains)", color: k.color }}
            >
              {k.value}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart tabs */}
      <div className="flex gap-1 mb-4">
        {CHART_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="text-xs px-3 py-2 rounded-sm"
            style={{
              background: active === tab ? "rgba(16,185,129,0.1)" : "transparent",
              color: active === tab ? "var(--primary)" : "var(--muted-foreground)",
              border: active === tab ? "1px solid rgba(16,185,129,0.25)" : "1px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Charts */}
      {active === "Income vs Expense" && (
        <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="font-semibold text-sm mb-1">Income vs Expense — 6 Months</div>
          <div className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Sep* is forecast based on current velocity</div>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={INCOME_VS_EXPENSE} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="income" name="Income" fill="rgba(16,185,129,0.06)" stroke="#10b981" strokeWidth={2} />
                <Bar dataKey="expense" name="Expenses" fill="#f87171" opacity={0.7} radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {active === "Savings Trend" && (
        <div className="space-y-4">
          <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="font-semibold text-sm mb-4">Savings Amount & Rate</div>
            <div style={{ height: "240px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={SAVINGS_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CT />} />
                  <ReferenceLine yAxisId="right" y={20} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 4" />
                  <Bar yAxisId="left" dataKey="savings" name="Savings ₹" fill="#22d3ee" opacity={0.6} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" name="Rate %" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {active === "Top Merchants" && (
        <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="font-semibold text-sm mb-4">Top Merchants by Total Spend</div>
          {MERCHANT_DATA.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: "240px" }}>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No expense transactions yet — add transactions to see merchant breakdown</p>
            </div>
          ) : (
            <div style={{ height: "240px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MERCHANT_DATA} layout="vertical" margin={{ top: 4, right: 60, bottom: 0, left: 60 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="total" name="Total Spend" fill="#10b981" opacity={0.7} radius={[0, 2, 2, 0]} label={{ position: "right", fill: "#64748b", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {active === "Spending Velocity" && (
        <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="font-semibold text-sm mb-1">Daily Spending Velocity</div>
          <div className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Average spend per day, by week</div>
          {VELOCITY_DATA.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: "240px" }}>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No transaction data yet — add transactions to see spending velocity</p>
            </div>
          ) : (
            <div style={{ height: "240px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={VELOCITY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip content={<CT />} />
                  <Line type="monotone" dataKey="daily" name="Daily spend" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Anomaly History — top high-value debit transactions */}
      <div className="mt-4 p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="font-semibold text-sm mb-4">Top Spending Transactions</div>
        <div className="space-y-2">
          {txns
            .filter((t) => t.type === "debit")
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            .slice(0, 5)
            .map((t, i) => {
              const date = t.occurredAt ? new Date(t.occurredAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—";
              return (
                <div
                  key={t._id || i}
                  className="flex items-center gap-4 px-4 py-3 rounded-sm border"
                  style={{ background: "rgba(245,158,11,0.03)", borderColor: "rgba(245,158,11,0.15)" }}
                >
                  <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jetbrains)", width: "70px" }}>{date}</span>
                  <span className="text-sm flex-1">{t.merchant || t.category || "Unknown"}</span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t.category || "—"}</span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ fontFamily: "var(--font-jetbrains)", color: "var(--foreground)" }}
                  >
                    ₹{(t.amount || 0).toLocaleString("en-IN")}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-sm"
                    style={{
                      background: "rgba(245,158,11,0.1)",
                      color: "var(--warning)",
                      fontFamily: "var(--font-jetbrains)",
                    }}
                  >
                    #{i + 1} spend
                  </span>
                </div>
              );
            })}
          {txns.filter((t) => t.type === "debit").length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted-foreground)" }}>
              No transactions recorded yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
