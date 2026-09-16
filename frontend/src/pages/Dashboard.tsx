import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Page } from "../App";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

// Spending behavior data — 30-day view
const CHART_DATA = [
  { day: "01", savings: 4200, expenses: 8600, income: 14200 },
  { day: "03", savings: 3800, expenses: 11200, income: 0 },
  { day: "05", savings: 5100, expenses: 7400, income: 0 },
  { day: "07", savings: 6200, expenses: 9800, income: 0 },
  { day: "09", savings: 4900, expenses: 12100, income: 21000 },
  { day: "11", savings: 7300, expenses: 8200, income: 0 },
  { day: "13", savings: 5600, expenses: 14300, income: 0 },
  { day: "15", savings: 8400, expenses: 10600, income: 142000 },
  { day: "17", savings: 6100, expenses: 9200, income: 0 },
  { day: "19", savings: 9200, expenses: 13800, income: 0 },
  { day: "21", savings: 7800, expenses: 11400, income: 0 },
  { day: "23", savings: 6400, expenses: 8900, income: 0 },
  { day: "25", savings: 10200, expenses: 15200, income: 0 },
  { day: "27", savings: 8700, expenses: 12600, income: 0 },
  { day: "30", savings: 9800, expenses: 10400, income: 0 },
];

const CATEGORIES = [
  { name: "Food", amount: 12400, color: "#f59e0b", pct: 78 },
  { name: "Transport", amount: 6800, color: "#06b6d4", pct: 55 },
  { name: "Shopping", amount: 8500, color: "#f87171", pct: 68 },
  { name: "Bills", amount: 9600, color: "#818cf8", pct: 72 },
  { name: "Lifestyle", amount: 4200, color: "#0d9e7e", pct: 42 },
];

const TIME_RANGES = ["7D", "30D", "3M", "1Y"];

// ── Financial Health radial gauge ──────────────────────────────────
function HealthGauge({ score }: { score: number }) {
  const r = 48;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ * 0.75; // 270° arc
  const gap = circ - filled;

  return (
    <div className="relative shrink-0" style={{ width: "140px", height: "140px" }}>
      <svg viewBox="0 0 140 140" className="w-full h-full" style={{ transform: "rotate(135deg)" }}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#0d9e7e"
          strokeWidth="8"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold tabular-nums leading-none"
          style={{ fontSize: "28px", fontFamily: "var(--font-jetbrains)", color: "#ffffff" }}
        >
          {score}
        </span>
        <span className="text-xs mt-0.5" style={{ color: "rgba(200,221,210,0.6)", fontSize: "10px" }}>
          / 100
        </span>
      </div>
    </div>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-md shadow-lg text-xs"
      style={{ background: "#1b3d2b", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-jetbrains)" }}
    >
      <div className="mb-1 text-xs" style={{ color: "rgba(200,221,210,0.6)" }}>Day {label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span style={{ color: p.stroke }}>●</span>
          <span style={{ color: "#fff" }}>₹{p.value.toLocaleString("en-IN")}</span>
          <span style={{ color: "rgba(200,221,210,0.6)" }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [timeRange, setTimeRange] = useState("30D");

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto">
      {/* ── Page header ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <div
            className="text-xs font-semibold tracking-widest mb-2"
            style={{ color: "var(--primary)", fontSize: "10px", letterSpacing: "0.12em" }}
          >
            OVERVIEW / LIVE SYSTEM
          </div>
          <h1
            className="font-bold leading-tight mb-1.5"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Good morning, Arjun.
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Your financial system has a few signals worth your attention.
          </p>
        </div>
        <button
          onClick={() => onNavigate("smart-capture")}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium self-start sm:mt-6"
          style={{
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            background: "var(--card)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12z"/>
            <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/>
          </svg>
          Review 7 captures
        </button>
      </div>

      {/* ── Row 1: Health · Snapshot · Smart Capture ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_2.4fr_1.6fr] gap-4 mb-4">

        {/* Financial Health — dark green card */}
        <div
          className="rounded-xl p-6 flex flex-col"
          style={{ background: "var(--sidebar)", minHeight: "220px" }}
        >
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-xs font-semibold tracking-widest"
              style={{ color: "rgba(200,221,210,0.55)", fontSize: "9px", letterSpacing: "0.14em" }}
            >
              FINANCIAL HEALTH
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ background: "rgba(13,158,126,0.2)", color: "#4ecca3", fontSize: "9px", letterSpacing: "0.06em" }}
            >
              LIVE MODEL
            </span>
          </div>

          <div className="flex items-center gap-5 flex-1 flex-wrap">
            <HealthGauge score={82} />
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ecca3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M7 7h10v10"/>
                </svg>
                <span className="text-sm font-semibold" style={{ color: "#4ecca3" }}>
                  Healthy trajectory
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(200,221,210,0.7)", fontSize: "13px" }}>
                Your financial health improved 6% this month.
              </p>
              <button
                className="mt-3 text-xs"
                style={{ color: "rgba(200,221,210,0.4)", fontSize: "11px" }}
              >
                view breakdown →
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Snapshot — white card */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-xs font-semibold tracking-widest"
              style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
            >
              MONTHLY SNAPSHOT
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* Income */}
            <div>
              <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
                INCOME
              </div>
              <div
                className="font-bold tabular-nums mb-1"
                style={{ fontSize: "24px", fontFamily: "var(--font-jetbrains)", color: "var(--primary)", letterSpacing: "-0.02em" }}
              >
                ₹1,42,000
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>
                8.4%
              </div>
            </div>

            {/* Expenses */}
            <div>
              <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
                EXPENSES
              </div>
              <div
                className="font-bold tabular-nums mb-1"
                style={{ fontSize: "24px", fontFamily: "var(--font-jetbrains)", color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                ₹84,200
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--expense)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>
                21%
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
                SAVINGS
              </div>
              <div
                className="font-bold tabular-nums mb-1"
                style={{ fontSize: "24px", fontFamily: "var(--font-jetbrains)", color: "var(--primary)", letterSpacing: "-0.02em" }}
              >
                ₹57,800
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>
                12.8%
              </div>
            </div>

            {/* Net Liquid */}
            <div>
              <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
                NET LIQUID
              </div>
              <div
                className="font-bold tabular-nums"
                style={{ fontSize: "24px", fontFamily: "var(--font-jetbrains)", color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                ₹4,89,350
              </div>
            </div>
          </div>
        </div>

        {/* Smart Capture — white card */}
        <div
          className="rounded-xl p-6 flex flex-col"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-xs font-semibold tracking-widest"
              style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
            >
              SMART CAPTURE
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="var(--primary)">
              <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12z"/>
              <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/>
              <path d="M12 8v-2M12 18v-2M8 12H6M18 12h-2"/>
            </svg>
          </div>

          <div className="flex-1">
            <div
              className="font-bold tabular-nums leading-none mb-1"
              style={{ fontSize: "48px", fontFamily: "var(--font-jetbrains)", color: "var(--foreground)", letterSpacing: "-0.04em" }}
            >
              7
            </div>
            <div className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              transactions detected today
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "var(--primary)" }}
              />
              <span className="text-xs" style={{ color: "var(--primary)", fontSize: "12px" }}>
                Processing in real time
              </span>
            </div>

            <button
              onClick={() => onNavigate("smart-capture")}
              className="text-sm font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Review queue →
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Chart · Category Spend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">

        {/* Spending Behavior — white card */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span
              className="text-xs font-semibold tracking-widest"
              style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
            >
              SPENDING BEHAVIOR
            </span>
            {/* Time range */}
            <div
              className="flex rounded-md overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {TIME_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className="px-3 py-1 text-xs font-medium"
                  style={{
                    background: timeRange === r ? "var(--sidebar)" : "transparent",
                    color: timeRange === r ? "#ffffff" : "var(--muted-foreground)",
                    borderRight: r !== "1Y" ? "1px solid var(--border)" : "none",
                    fontSize: "11px",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <h2 className="font-semibold text-base mb-4" style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}>
            Income, expenses & savings velocity
          </h2>

          {/* Legend */}
          <div className="flex items-center gap-5 mb-4">
            {[
              { label: "Savings", color: "#0d9e7e" },
              { label: "Expenses", color: "#f87171" },
              { label: "Income", color: "#06b6d4" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid
                  strokeDasharray="2 6"
                  stroke="rgba(0,0,0,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="savings"
                  name="Savings"
                  stroke="#0d9e7e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#0d9e7e" }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#f87171" }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#06b6d4" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spend — white card */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs font-semibold tracking-widest"
              style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
            >
              CATEGORY SPEND
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          <h2 className="font-semibold text-base mb-5" style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}>
            This month
          </h2>

          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {cat.name}
                    </span>
                  </div>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ fontFamily: "var(--font-jetbrains)", color: "var(--foreground)" }}
                  >
                    ₹{cat.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div
                  className="relative h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#f0f0ea" }}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${cat.pct}%`, background: cat.color }}
                  />
                  {/* Dark tail to match the design */}
                  <div
                    className="absolute right-0 top-0 h-full rounded-r-full"
                    style={{ width: `${100 - cat.pct}%`, background: "#1b3d2b", opacity: 0.12 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
