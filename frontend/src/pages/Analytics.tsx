import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, ReferenceLine,
} from "recharts";

const INCOME_VS_EXPENSE = [
  { month: "Apr", income: 85000, expense: 48000 },
  { month: "May", income: 85000, expense: 52000 },
  { month: "Jun", income: 85000, expense: 44000 },
  { month: "Jul", income: 97000, expense: 58000 },
  { month: "Aug", income: 85000, expense: 49300 },
  { month: "Sep*", income: 85000, expense: 61400 },
];

const MERCHANT_DATA = [
  { name: "Swiggy", total: 6240, count: 18 },
  { name: "Amazon", total: 12300, count: 4 },
  { name: "Zomato", total: 4100, count: 14 },
  { name: "Netflix", total: 1947, count: 3 },
  { name: "Ola", total: 3640, count: 13 },
  { name: "BigBasket", total: 3720, count: 6 },
];

const SAVINGS_TREND = [
  { month: "Apr", savings: 37000, rate: 44 },
  { month: "May", savings: 33000, rate: 39 },
  { month: "Jun", savings: 41000, rate: 48 },
  { month: "Jul", savings: 39000, rate: 40 },
  { month: "Aug", savings: 35700, rate: 42 },
  { month: "Sep*", savings: 17840, rate: 21 },
];

const VELOCITY_DATA = [
  { week: "W1 Aug", daily: 1680 },
  { week: "W2 Aug", daily: 1540 },
  { week: "W3 Aug", daily: 1720 },
  { week: "W4 Aug", daily: 1890 },
  { week: "W1 Sep", daily: 2050 },
  { week: "W2 Sep", daily: 1980 },
];

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
  const [active, setActive] = useState("Income vs Expense");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "6M Avg Expenses", value: "₹51,170", sub: "Monthly", color: "var(--expense)" },
          { label: "Expense Growth", value: "+2.8%", sub: "Month over month", color: "var(--warning)" },
          { label: "Best Savings Month", value: "Jun 2026", sub: "₹41,000 saved", color: "var(--primary)" },
          { label: "Largest Single Transaction", value: "₹8,500", sub: "Amazon · Sep 8", color: "var(--ai-color)" },
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
        </div>
      )}

      {active === "Spending Velocity" && (
        <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="font-semibold text-sm mb-1">Daily Spending Velocity</div>
          <div className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Average spend per day, by week</div>
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VELOCITY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-jetbrains)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={<CT />} />
                <ReferenceLine y={1800} stroke="rgba(245,158,11,0.4)" strokeDasharray="4 4" label={{ value: "Baseline ₹1,800/day", fill: "#f59e0b", fontSize: 9 }} />
                <Line type="monotone" dataKey="daily" name="Daily spend" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Anomaly history */}
      <div className="mt-4 p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="font-semibold text-sm mb-4">Anomaly History</div>
        <div className="space-y-2">
          {[
            { month: "Sep 2026", category: "Electronics", amount: "₹8,500", factor: "2.4×", color: "var(--warning)" },
            { month: "Jul 2026", category: "Shopping", amount: "₹7,100", factor: "1.4×", color: "var(--warning)" },
            { month: "May 2026", category: "Food & Dining", amount: "₹8,100", factor: "1.2×", color: "var(--ai-color)" },
          ].map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 rounded-sm border"
              style={{ background: "rgba(245,158,11,0.03)", borderColor: "rgba(245,158,11,0.15)" }}
            >
              <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jetbrains)", width: "70px" }}>{a.month}</span>
              <span className="text-sm flex-1">{a.category}</span>
              <span
                className="text-sm font-semibold tabular-nums"
                style={{ fontFamily: "var(--font-jetbrains)", color: "var(--foreground)" }}
              >
                {a.amount}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-sm tabular-nums"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  color: a.color,
                  fontFamily: "var(--font-jetbrains)",
                }}
              >
                {a.factor} normal
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
