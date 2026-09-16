import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from "recharts";

const MONTHLY_DATA = [
  { month: "Apr", income: 85000, expenses: 48000, savings: 37000 },
  { month: "May", income: 85000, expenses: 52000, savings: 33000 },
  { month: "Jun", income: 85000, expenses: 44000, savings: 41000 },
  { month: "Jul", income: 97000, expenses: 58000, savings: 39000 },
  { month: "Aug", income: 85000, expenses: 49300, savings: 35700 },
  { month: "Sep", income: 85000, expenses: 53720, savings: 17840 },
];

const CATEGORY_TREND = [
  { month: "Apr", food: 7200, transport: 3100, shopping: 5000, entertainment: 2100 },
  { month: "May", food: 8100, transport: 3400, shopping: 6200, entertainment: 1800 },
  { month: "Jun", food: 7400, transport: 2900, shopping: 4800, entertainment: 2400 },
  { month: "Jul", food: 9200, transport: 3800, shopping: 7100, entertainment: 3200 },
  { month: "Aug", food: 8600, transport: 3500, shopping: 5900, entertainment: 2600 },
  { month: "Sep", food: 8420, transport: 3240, shopping: 6800, entertainment: 1850 },
];

const ANOMALIES = [
  { month: "Jul", category: "Shopping", amount: 7100, baseline: 5200, severity: "high" },
  { month: "Sep", category: "Electronics", amount: 8500, baseline: 3500, severity: "high" },
  { month: "May", category: "Food", amount: 8100, baseline: 7000, severity: "medium" },
];

const METRICS = [
  { label: "Avg Monthly Savings", value: "₹34,090", sub: "Last 6 months", color: "var(--primary)" },
  { label: "Savings Rate", value: "21.4%", sub: "Of gross income", color: "var(--primary)" },
  { label: "Expense Growth", value: "+2.8%", sub: "Month over month", color: "var(--warning)" },
  { label: "Income Stability", value: "High", sub: "Consistent paycheck", color: "var(--forecast)" },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="px-3 py-2 text-xs rounded-sm border" style={{ background: "#0f1318", borderColor: "var(--border)", fontFamily: "var(--font-jetbrains)" }}>
      <div className="mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span style={{ color: "var(--foreground)" }}>₹{p.value.toLocaleString("en-IN")}</span>
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {METRICS.map((m) => (
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
            <div className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Monthly breakdown — last 6 months</div>
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barGap={2}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="font-semibold text-sm mb-4">Spending Baseline vs Actual</div>
              <div className="space-y-3">
                {[
                  { cat: "Food & Dining", baseline: 7000, actual: 8420 },
                  { cat: "Transport", baseline: 3200, actual: 3240 },
                  { cat: "Shopping", baseline: 5000, actual: 6800 },
                  { cat: "Entertainment", baseline: 2500, actual: 1850 },
                  { cat: "Bills", baseline: 4500, actual: 4200 },
                ].map((row) => {
                  const ratio = row.actual / row.baseline;
                  const color = ratio > 1.15 ? "var(--expense)" : ratio < 0.85 ? "var(--primary)" : "var(--forecast)";
                  return (
                    <div key={row.cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{row.cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs tabular-nums" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--muted-foreground)", fontSize: "10px" }}>
                            ₹{row.baseline.toLocaleString("en-IN")} baseline
                          </span>
                          <span className="text-xs font-semibold tabular-nums" style={{ fontFamily: "var(--font-jetbrains)", color, fontSize: "11px" }}>
                            ₹{row.actual.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-1.5 rounded-full overflow-visible" style={{ background: "var(--border)" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min((row.actual / 10000) * 100, 100)}%`, background: color }} />
                        <div className="absolute top-0 h-full w-px" style={{ left: `${Math.min((row.baseline / 10000) * 100, 100)}%`, background: "var(--muted-foreground)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="font-semibold text-sm mb-4">Savings Rate Trend</div>
              <div style={{ height: "160px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_DATA.map((d) => ({ ...d, rate: Math.round((d.savings / d.income) * 100) }))} margin={{ top: 4, right: 4, bottom: 0, left: -30 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v: any) => [`${v}%`, "Savings Rate"]} />
                    <ReferenceLine y={20} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 4" label={{ value: "Target 20%", fill: "#475569", fontSize: 9 }} />
                    <Line type="monotone" dataKey="rate" stroke="#22d3ee" strokeWidth={2} dot={{ fill: "#22d3ee", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Categories" && (
        <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="font-semibold text-sm mb-4">Category Trends — 6 Months</div>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CATEGORY_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
        </div>
      )}

      {activeTab === "Anomalies" && (
        <div className="space-y-3">
          <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
            Spending events that deviated significantly from your behavioral baseline.
          </div>
          {ANOMALIES.map((a, i) => (
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
                    ₹{a.amount.toLocaleString("en-IN")} actual vs ₹{a.baseline.toLocaleString("en-IN")} baseline
                  </div>
                </div>
                <span
                  className="text-xs font-bold tabular-nums px-2 py-1 rounded-sm"
                  style={{ fontFamily: "var(--font-jetbrains)", background: "rgba(245,158,11,0.1)", color: "var(--warning)" }}
                >
                  {(a.amount / a.baseline).toFixed(1)}× normal
                </span>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${(a.baseline / a.amount) * 100}%`, background: "var(--muted-foreground)" }} />
                <div className="h-full rounded-full absolute top-0 left-0" style={{ width: "100%", background: "var(--warning)", opacity: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Forecasts" && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Projected Expenses (Sep)", value: "₹61,400", sub: "87% confidence", color: "var(--forecast)" },
            { label: "Projected Savings (Sep)", value: "₹17,840", sub: "Current trajectory", color: "var(--primary)" },
            { label: "Budget Exhaustion (Food)", value: "Sep 14", sub: "6 days early", color: "var(--warning)" },
            { label: "Yearly Savings (2026)", value: "₹3,92,000", sub: "Projected at current rate", color: "var(--primary)" },
          ].map((f) => (
            <div
              key={f.label}
              className="p-5 rounded-sm border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{f.label}</div>
              <div
                className="font-bold tabular-nums text-2xl mb-1"
                style={{ fontFamily: "var(--font-jetbrains)", color: f.color }}
              >
                {f.value}
              </div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>{f.sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
