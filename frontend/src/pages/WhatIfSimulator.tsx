import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as api from "../lib/api";

interface Scenario {
  id: string;
  label: string;
  question: string;
  description: string;
  current: number;
  min: number;
  max: number;
  unit: string;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "shopping",
    label: "SCENARIO / LIFESTYLE ADJUSTMENT",
    question: "What if shopping cost less?",
    description: "Reduce your shopping spend and see how it impacts your annual savings.",
    current: 4000,
    min: 1000,
    max: 4000,
    unit: "monthly spend",
  },
  {
    id: "food",
    label: "SCENARIO / DINING ADJUSTMENT",
    question: "What if you cooked more?",
    description: "Reducing dining out can compound quickly across a year.",
    current: 8420,
    min: 2000,
    max: 8420,
    unit: "monthly spend",
  },
  {
    id: "transport",
    label: "SCENARIO / COMMUTE ADJUSTMENT",
    question: "What if you used public transport?",
    description: "Metro + bus could cut your transport spend significantly.",
    current: 3240,
    min: 800,
    max: 3240,
    unit: "monthly spend",
  },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-md text-xs"
      style={{ background: "#1b3d2b", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-jetbrains)", color: "#fff" }}
    >
      <div style={{ color: "rgba(200,221,210,0.6)" }}>{label}</div>
      <div>₹{payload[0].value.toLocaleString("en-IN")}</div>
    </div>
  );
}

export default function WhatIfSimulator() {
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [scenarioId, setScenarioId] = useState("shopping");
  const [value, setValue] = useState(2500);

  useEffect(() => {
    // Load real category spending from the current month's transactions
    async function loadCategorySpend() {
      try {
        const res = await api.listTransactions({ limit: 1000 }) as any;
        const txns: any[] = res?.data?.items || [];
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const catMap: Record<string, number> = {};
        txns.forEach((tx: any) => {
          if (tx.type !== "debit") return;
          const d = new Date(tx.occurredAt || tx.date);
          if (d < monthStart) return;
          const cat = (tx.category || "").toLowerCase();
          if (cat.includes("shop")) catMap.shopping = (catMap.shopping || 0) + Number(tx.amount || 0);
          else if (cat.includes("food") || cat.includes("dining")) catMap.food = (catMap.food || 0) + Number(tx.amount || 0);
          else if (cat.includes("transport")) catMap.transport = (catMap.transport || 0) + Number(tx.amount || 0);
        });

        setScenarios((prev) =>
          prev.map((s) => {
            const realCurrent = catMap[s.id];
            if (!realCurrent || realCurrent <= 0) return s;
            const rounded = Math.round(realCurrent / 100) * 100;
            return {
              ...s,
              current: rounded,
              max: rounded,
              min: Math.round(rounded * 0.2 / 100) * 100,
              description: `Your current ${s.id === "food" ? "Food & Dining" : s.id === "shopping" ? "Shopping" : "Transport"} spend is ₹${rounded.toLocaleString("en-IN")} this month. Adjust the dial to see your projected savings.`,
            };
          })
        );
      } catch (e) {
        // Keep defaults on error
        console.error("WhatIf category load error:", e);
      }
    }
    loadCategorySpend();
  }, []);

  const scenario = scenarios.find((s) => s.id === scenarioId)!;;

  // When switching scenarios, reset slider to midpoint
  const handleScenario = (id: string) => {
    const s = scenarios.find((sc) => sc.id === id)!;
    setValue(Math.round((s.min + s.current) / 2));
    setScenarioId(id);
  };

  const diff = scenario.current - value;
  const monthlySavings = diff;
  const yearlySavings = diff * 12;
  const goalMonthsLeft = Math.ceil(158000 / 5000); // remaining / current monthly
  const newGoalMonthsLeft = Math.ceil(158000 / (5000 + diff));
  const monthsEarlier = Math.max(0, goalMonthsLeft - newGoalMonthsLeft);

  const sliderPct = ((value - scenario.min) / (scenario.current - scenario.min)) * 100;

  const chartData = [
    { label: "Current", value: scenario.current },
    { label: "Simulated", value: value },
    { label: "Monthly\nSaved", value: monthlySavings },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
        <div>
          <div
            className="text-xs font-semibold tracking-widest mb-2"
            style={{ color: "var(--primary)", fontSize: "10px", letterSpacing: "0.12em" }}
          >
            WHAT-IF SIMULATOR / DECISION SUPPORT
          </div>
          <h1
            className="font-bold leading-tight mb-1.5"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Try a different next month.
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Change one behavior. See what it does to your cashflow, year, and goals.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:mt-8" style={{ color: "var(--primary)", fontSize: "12px" }}>
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--primary)" }}
          />
          <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
            Model recalculates live
          </span>
        </div>
      </div>

      {/* Scenario tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => handleScenario(s.id)}
            className="px-4 py-2 rounded-md text-sm font-medium shrink-0"
            style={{
              background: scenarioId === s.id ? "var(--sidebar)" : "var(--card)",
              color: scenarioId === s.id ? "#ffffff" : "var(--muted-foreground)",
              border: `1px solid ${scenarioId === s.id ? "var(--sidebar)" : "var(--border)"}`,
            }}
          >
            {s.question.replace("What if ", "").replace("?", "")}
          </button>
        ))}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">

        {/* Left: Scenario card — light blue tint */}
        <div
          className="rounded-xl p-7"
          style={{
            background: "rgba(6,182,212,0.06)",
            border: "1px solid rgba(6,182,212,0.18)",
          }}
        >
          <div
            className="text-xs font-semibold tracking-widest mb-4"
            style={{ color: "var(--forecast)", fontSize: "9px", letterSpacing: "0.14em" }}
          >
            {scenario.label}
          </div>
          <h2
            className="font-bold mb-3"
            style={{ fontSize: "24px", color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            {scenario.question}
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--muted-foreground)" }}>
            {scenario.description}
          </p>

          {/* Slider value display */}
          <div className="mb-2">
            <div
              className="text-xs font-semibold tracking-widest mb-3"
              style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}
            >
              NEW MONTHLY SPEND
            </div>
            <div className="flex items-end justify-between mb-4">
              <div
                className="font-bold tabular-nums"
                style={{ fontSize: "40px", fontFamily: "var(--font-jetbrains)", color: "var(--forecast)", letterSpacing: "-0.03em" }}
              >
                ₹{value.toLocaleString("en-IN")}
              </div>
              <div className="text-right text-sm" style={{ color: "var(--muted-foreground)", marginBottom: "4px" }}>
                <div className="text-xs">Current</div>
                <div className="font-semibold tabular-nums" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  ₹{scenario.current.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="mb-2">
            <input
              type="range"
              min={scenario.min}
              max={scenario.current}
              step={100}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full"
              style={{
                height: "5px",
                appearance: "none",
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${sliderPct}%, #1b3d2b ${sliderPct}%, #1b3d2b 100%)`,
                borderRadius: "3px",
                cursor: "pointer",
                outline: "none",
              }}
            />
            <div className="flex justify-between mt-1.5 text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jetbrains)", fontSize: "10px" }}>
              <span>₹{scenario.min.toLocaleString("en-IN")}</span>
              <span>₹{scenario.current.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Model note */}
          {monthsEarlier > 0 && (
            <div className="mt-6">
              <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
                MODEL NOTE
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                At this pace, your{" "}
                <span style={{ color: "var(--forecast)", cursor: "pointer" }}>laptop goal</span>
                {" "}reaches completion earlier without changing your savings target.
              </p>
            </div>
          )}
        </div>

        {/* Right: Projected impact */}
        <div
          className="rounded-xl p-7"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div
                className="text-xs font-semibold tracking-widest mb-2"
                style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
              >
                PROJECTED IMPACT
              </div>
              <h2
                className="font-bold"
                style={{ fontSize: "22px", color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Your new financial trajectory
              </h2>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--forecast)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>

          {/* Three metrics in columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 mb-7">
            {[
              {
                label: "MONTHLY SAVINGS",
                value: monthlySavings > 0 ? `+₹${monthlySavings.toLocaleString("en-IN")}` : "₹0",
                sub: "vs current behavior",
                color: monthlySavings > 0 ? "var(--primary)" : "var(--muted-foreground)",
              },
              {
                label: "YEARLY SAVINGS",
                value: yearlySavings > 0 ? `+₹${yearlySavings.toLocaleString("en-IN")}` : "₹0",
                sub: "vs current behavior",
                color: yearlySavings > 0 ? "var(--primary)" : "var(--muted-foreground)",
              },
              {
                label: "GOAL COMPLETION",
                value: monthsEarlier > 0 ? `${monthsEarlier} months` : "No change",
                sub: monthsEarlier > 0 ? "earlier" : "vs current behavior",
                color: monthsEarlier > 0 ? "var(--primary)" : "var(--muted-foreground)",
                extraLine: monthsEarlier > 0 ? "vs current behavior" : undefined,
              },
            ].map((m) => (
              <div
                key={m.label}
                className="py-4 px-4 sm:border-r last:border-r-0 border-b sm:border-b-0 last:border-b-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="text-xs font-semibold tracking-widest mb-3"
                  style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.1em" }}
                >
                  {m.label}
                </div>
                <div
                  className="font-bold tabular-nums mb-1 leading-tight"
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    color: m.color,
                    fontSize: m.label === "GOAL COMPLETION" ? "20px" : "22px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {m.value}
                </div>
                {m.label === "GOAL COMPLETION" && monthsEarlier > 0 && (
                  <div
                    className="font-bold"
                    style={{ color: m.color, fontSize: "14px" }}
                  >
                    earlier
                  </div>
                )}
                <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>
                  {m.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Current", value: scenario.current },
                  { name: "Simulated", value: value },
                  { name: "Saved", value: monthlySavings },
                ]}
                margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
                barSize={48}
              >
                <CartesianGrid strokeDasharray="2 6" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          border: 2px solid #fff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
