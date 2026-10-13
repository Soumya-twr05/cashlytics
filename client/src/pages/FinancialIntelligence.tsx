import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from "recharts";
import * as api from "../lib/api";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="px-3 py-2 text-xs rounded-sm border" style={{ background: "#0f1318", borderColor: "var(--border)", fontFamily: "var(--font-jetbrains)" }}>
      <div className="mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span style={{ color: "var(--foreground)" }}>₹{Number(p.value || 0).toLocaleString("en-IN")}</span>
          <span style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
}

const TIME_RANGES = ["3M", "6M", "1Y", "All"];
const TABS = ["Trends", "Categories", "Anomalies", "Forecasts"];

export default function FinancialIntelligence() {
  const [timeRange, setTimeRange] = useState("6M");
  const [activeTab, setActiveTab] = useState("Trends");

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryTrend, setCategoryTrend] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([
    { label: "Avg Monthly Savings", value: "...", sub: "Last 6 months", color: "var(--primary)" },
    { label: "Savings Rate", value: "...", sub: "Of gross income", color: "var(--primary)" },
    { label: "Expense Growth", value: "...", sub: "Month over month", color: "var(--warning)" },
    { label: "Income Stability", value: "High", sub: "Consistent paycheck", color: "var(--forecast)" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [trendsRes, anomaliesRes, forecastRes, txRes] = await Promise.all([
          api.getTrends().catch(() => ({ data: { items: [] } })),
          api.getAnomalies().catch(() => ({ data: { items: [] } })),
          api.getForecast().catch(() => ({ data: null })),
          api.listTransactions({ limit: 1000 }).catch(() => ({ data: { items: [] } }))
        ]);

        const tData = (trendsRes as any)?.data?.items || [];
        setMonthlyData(tData);

        const aData = (anomaliesRes as any)?.data?.items || [];
        setAnomalies(aData.map((a: any) => ({
          month: new Date(a.transaction?.occurredAt || new Date()).toLocaleString('default', { month: 'short' }),
          category: a.transaction?.category || 'Unknown',
          amount: a.transaction?.amount || 0,
          baseline: (a.transaction?.amount || 0) / Math.max(1.1, (a.riskScore || 0) / 10), // Estimate baseline for UI
          severity: a.severity || 'low',
        })));

        const fData = (forecastRes as any)?.data;
        setForecast(fData);

        // Calculate Category Trends from txns
        const txns = (txRes as any)?.data?.items || [];
        const monthCats: Record<string, any> = {};
        
        txns.forEach((tx: any) => {
          if (tx.type !== "debit") return;
          const date = new Date(tx.occurredAt || tx.date);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const mLabel = date.toLocaleString('default', { month: 'short' });
          if (!monthCats[month]) monthCats[month] = { month: mLabel, food: 0, transport: 0, shopping: 0, entertainment: 0, sortKey: month };
          
          const cat = tx.category?.toLowerCase() || '';
          if (cat.includes('food')) monthCats[month].food += tx.amount;
          else if (cat.includes('transport')) monthCats[month].transport += tx.amount;
          else if (cat.includes('shop')) monthCats[month].shopping += tx.amount;
          else monthCats[month].entertainment += tx.amount;
        });
        
        const catArray = Object.values(monthCats).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
        setCategoryTrend(catArray.slice(-6));

        // Update metrics
        if (tData.length > 0) {
          const totalSavings = tData.reduce((acc: number, cur: any) => acc + (cur.savings || 0), 0);
          const avgSavings = totalSavings / tData.length;
          
          const recentIncome = tData[tData.length - 1]?.income || 1;
          const recentSavings = tData[tData.length - 1]?.savings || 0;
          const sr = (recentSavings / recentIncome) * 100;
          
          setMetrics([
            { label: "Avg Monthly Savings", value: `₹${Math.round(avgSavings).toLocaleString("en-IN")}`, sub: "Last 6 months", color: "var(--primary)" },
            { label: "Savings Rate", value: `${sr.toFixed(1)}%`, sub: "Of gross income", color: "var(--primary)" },
            { label: "Forecasted Spending", value: fData?.forecast ? `₹${Math.round(fData.forecast).toLocaleString("en-IN")}` : "...", sub: "Current month", color: "var(--warning)" },
            { label: "Anomalies Detected", value: aData.length.toString(), sub: "Recent activity", color: "var(--forecast)" },
          ]);
        }

      } catch (err) {
        console.error("Error fetching intelligence data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p style={{ color: "var(--muted-foreground)" }}>Loading Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-4 rounded-sm border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{m.label}</div>
            <div
              className="font-bold tabular-nums text-xl mb-0.5"
              style={{ fontFamily: "var(--font-jetbrains)", color: m.color }}
            >
              {m.value}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs + time range */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-xs px-4 py-2 rounded-sm"
              style={{
                background: activeTab === tab ? "rgba(16,185,129,0.1)" : "transparent",
                color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)",
                border: activeTab === tab ? "1px solid rgba(16,185,129,0.25)" : "1px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className="text-xs px-2.5 py-1 rounded-sm"
              style={{
                background: timeRange === r ? "rgba(16,185,129,0.1)" : "transparent",
                color: timeRange === r ? "var(--primary)" : "var(--muted-foreground)",
                border: timeRange === r ? "1px solid rgba(16,185,129,0.25)" : "1px solid transparent",
                fontFamily: "var(--font-jetbrains)",
                fontSize: "10px",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Trends" && (
        <div className="space-y-4">
          <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="font-semibold text-sm mb-1">Income vs Expenses vs Savings</div>
            <div className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Monthly breakdown</div>
            {monthlyData.length > 0 ? (
              <div style={{ height: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barGap={2}>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="income" name="Income" fill="#10b981" opacity={0.7} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f87171" opacity={0.7} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="savings" name="Savings" fill="#22d3ee" opacity={0.7} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-gray-500">No trend data available</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="font-semibold text-sm mb-4">Savings Rate Trend</div>
              {monthlyData.length > 0 ? (
                <div style={{ height: "160px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData.map((d) => ({ ...d, rate: d.income ? Math.round((d.savings / d.income) * 100) : 0 }))} margin={{ top: 4, right: 4, bottom: 0, left: -30 }}>
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v: any) => [`${v}%`, "Savings Rate"]} />
                      <ReferenceLine y={20} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 4" label={{ value: "Target 20%", fill: "#475569", fontSize: 9 }} />
                      <Line type="monotone" dataKey="rate" stroke="#22d3ee" strokeWidth={2} dot={{ fill: "#22d3ee", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-gray-500">No data</div>
              )}
            </div>
            
            <div className="p-5 rounded-sm border flex flex-col justify-center text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="text-sm text-gray-400 mb-2">Want to see more details?</div>
              <button className="text-emerald-500 hover:text-emerald-400 transition-colors">Explore full reports →</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Categories" && (
        <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="font-semibold text-sm mb-4">Category Trends</div>
          {categoryTrend.length > 0 ? (
            <div style={{ height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={categoryTrend} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "10px", color: "#64748b" }} />
                  <Line type="monotone" dataKey="food" name="Food" stroke="#10b981" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="transport" name="Transport" stroke="#22d3ee" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="shopping" name="Shopping" stroke="#f87171" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="entertainment" name="Entertainment" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-gray-500">No category data</div>
          )}
        </div>
      )}

      {activeTab === "Anomalies" && (
        <div className="space-y-3">
          <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
            Spending events that deviated significantly from your behavioral baseline.
          </div>
          {anomalies.length > 0 ? anomalies.map((a, i) => (
            <div
              key={i}
              className="p-5 rounded-sm border"
              style={{
                background: a.severity === "high" ? "rgba(245,158,11,0.04)" : "var(--card)",
                borderColor: a.severity === "high" ? "rgba(245,158,11,0.25)" : "var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm">{a.category} — {a.month}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    ₹{a.amount.toLocaleString("en-IN")} actual vs ~₹{Math.round(a.baseline).toLocaleString("en-IN")} baseline
                  </div>
                </div>
                <span
                  className="text-xs font-bold tabular-nums px-2 py-1 rounded-sm"
                  style={{ fontFamily: "var(--font-jetbrains)", background: "rgba(245,158,11,0.1)", color: "var(--warning)" }}
                >
                  {Math.max(1.1, (a.amount / a.baseline)).toFixed(1)}× normal
                </span>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (a.baseline / a.amount) * 100)}%`, background: "var(--muted-foreground)" }} />
                <div className="h-full rounded-full absolute top-0 left-0" style={{ width: "100%", background: "var(--warning)", opacity: 0.5 }} />
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-sm text-gray-500 border rounded-sm" style={{ borderColor: 'var(--border)' }}>
              No anomalies detected recently. Good job!
            </div>
          )}
        </div>
      )}

      {activeTab === "Forecasts" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Projected Expenses (Current Month)</div>
            <div className="font-bold tabular-nums text-2xl mb-1" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--forecast)" }}>
              {forecast?.forecast ? `₹${Math.round(forecast.forecast).toLocaleString("en-IN")}` : "Data unavailable"}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>Based on recent trends</div>
          </div>
          
          <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Forecast Range</div>
            <div className="font-bold tabular-nums text-2xl mb-1" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--primary)" }}>
              {forecast?.lower_bound ? `₹${Math.round(forecast.lower_bound).toLocaleString("en-IN")} - ₹${Math.round(forecast.upper_bound).toLocaleString("en-IN")}` : "..."}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>95% confidence interval</div>
          </div>
        </div>
      )}
    </div>
  );
}
