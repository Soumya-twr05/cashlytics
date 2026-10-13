import { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as api from "../lib/api";
import {
  ScenarioId,
  SCENARIO_DEFINITIONS,
  getCurrentCalendarMonthRange,
  aggregatePeriodExpenses,
  calculateSimulation,
  getSliderConfig,
  calculateGoalImpact,
  formatINR,
  formatCompactINR,
  CategorySpendingData,
} from "../lib/whatIfCalculator";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0].value || 0);
  return (
    <div
      className="px-3 py-2 rounded-md text-xs shadow-lg"
      style={{
        background: "var(--sidebar)",
        border: "1px solid rgba(255,255,255,0.15)",
        fontFamily: "var(--font-jetbrains)",
        color: "#fff",
      }}
    >
      <div style={{ color: "var(--sidebar-foreground)", marginBottom: "2px" }}>{label}</div>
      <div className="font-semibold">{formatINR(val, true)}</div>
    </div>
  );
}

export default function WhatIfSimulator() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("shopping");
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  // Real data state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryDataMap, setCategoryDataMap] = useState<Record<ScenarioId, CategorySpendingData>>({
    shopping: {
      scenarioId: "shopping",
      categoryName: SCENARIO_DEFINITIONS.shopping.categoryName,
      totalSpend: 0,
      transactionCount: 0,
      hasData: false,
    },
    food: {
      scenarioId: "food",
      categoryName: SCENARIO_DEFINITIONS.food.categoryName,
      totalSpend: 0,
      transactionCount: 0,
      hasData: false,
    },
    transport: {
      scenarioId: "transport",
      categoryName: SCENARIO_DEFINITIONS.transport.categoryName,
      totalSpend: 0,
      transactionCount: 0,
      hasData: false,
    },
  });
  const [goals, setGoals] = useState<api.GoalItem[]>([]);

  // Current calendar month period
  const period = useMemo(() => getCurrentCalendarMonthRange(), []);

  // Fetch real transactions with pagination & user's actual goals
  const loadRealData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch transactions for the current calendar month
      // Handle pagination properly if items exceed standard page limits
      const allPeriodTxns: api.TransactionItem[] = [];
      let page = 1;
      const limit = 100;
      let totalPages = 1;

      do {
        const txRes = await api.listTransactions({
          page,
          limit,
          type: "debit",
          startDate: period.startDate.toISOString(),
          endDate: period.endDate.toISOString(),
        });

        const items = txRes.data?.items || [];
        allPeriodTxns.push(...items);

        const pagination = txRes.data?.pagination;
        if (pagination && pagination.pages !== undefined) {
          totalPages = pagination.pages;
        } else if (items.length < limit) {
          break;
        } else {
          totalPages = page + 1;
        }
        page++;
      } while (page <= totalPages && page <= 20); // Safety bound

      // Aggregate spending with strict validation (debit only, within period, no future dates)
      const aggregated = aggregatePeriodExpenses(allPeriodTxns, period);
      setCategoryDataMap(aggregated);

      // 2. Fetch authenticated user's actual financial goals
      const goalsRes = await api.listGoals();
      const userGoals = goalsRes.data?.items || [];
      setGoals(userGoals);

      // Set initial active goal if available
      const activeGoals = userGoals.filter((g) => Math.max(0, g.target - (g.current || 0)) > 0);
      if (activeGoals.length > 0) {
        setSelectedGoalId(activeGoals[0]._id);
      }

      // Initialize slider for current scenario
      const currentCat = aggregated[scenarioId];
      if (currentCat.hasData && currentCat.totalSpend > 0) {
        const cfg = getSliderConfig(currentCat.totalSpend);
        setSliderValue(cfg.defaultVal);
      } else {
        setSliderValue(0);
      }
    } catch (err: unknown) {
      console.error("Failed to load What-If simulation data:", err);
      setError("Unable to retrieve your transaction and goal data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [period, scenarioId]);

  useEffect(() => {
    let ignore = false;

    loadRealData().then(() => {
      if (ignore) return;
    });

    return () => {
      ignore = true;
    };
  }, [loadRealData]);

  // Handle scenario tab switch
  const handleScenarioChange = (id: ScenarioId) => {
    setScenarioId(id);
    const cat = categoryDataMap[id];
    if (cat.hasData && cat.totalSpend > 0) {
      const cfg = getSliderConfig(cat.totalSpend);
      setSliderValue(cfg.defaultVal);
    } else {
      setSliderValue(0);
    }
  };

  // Active scenario definition & real spending data
  const scenarioMeta = SCENARIO_DEFINITIONS[scenarioId];
  const activeCategory = categoryDataMap[scenarioId];
  const baselineSpend = activeCategory.totalSpend;
  const hasData = activeCategory.hasData && baselineSpend > 0;

  // Slider bounds based on real baseline
  const sliderConfig = useMemo(() => getSliderConfig(baselineSpend), [baselineSpend]);

  // Reliable calculations using pure arithmetic on real financial data
  const simulation = useMemo(
    () => calculateSimulation(baselineSpend, sliderValue),
    [baselineSpend, sliderValue]
  );

  const { simulatedMonthlySpend, monthlySavings, annualizedSavings } = simulation;

  // Active goals filtering & selection
  const activeGoals = useMemo(
    () => goals.filter((g) => Math.max(0, g.target - (g.current || 0)) > 0),
    [goals]
  );

  const currentGoal = useMemo(() => {
    if (!activeGoals.length) return null;
    return activeGoals.find((g) => g._id === selectedGoalId) || activeGoals[0];
  }, [activeGoals, selectedGoalId]);

  // Goal simulation impact
  const goalImpact = useMemo(
    () => calculateGoalImpact(currentGoal, monthlySavings),
    [currentGoal, monthlySavings]
  );

  // Slider percentage calculation (safeguarded against division by zero)
  const sliderPct = useMemo(() => {
    if (!hasData || sliderConfig.max <= sliderConfig.min) return 0;
    const range = sliderConfig.max - sliderConfig.min;
    return Math.max(0, Math.min(100, ((sliderValue - sliderConfig.min) / range) * 100));
  }, [hasData, sliderConfig, sliderValue]);

  // Derived chart data (strictly from deterministic calculation source)
  const chartData = useMemo(() => {
    if (!hasData) return [];
    return [
      { name: "Current", value: baselineSpend, formatted: formatINR(baselineSpend, true) },
      { name: "Simulated", value: simulatedMonthlySpend, formatted: formatINR(simulatedMonthlySpend, true) },
      { name: "Monthly Saved", value: monthlySavings, formatted: formatINR(monthlySavings, true) },
    ];
  }, [hasData, baselineSpend, simulatedMonthlySpend, monthlySavings]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
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

        {/* Live recalculation badge */}
        <div className="flex flex-col sm:items-end gap-1.5 sm:mt-2">
          <div className="flex items-center gap-2" style={{ color: "var(--primary)", fontSize: "12px" }}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--primary)" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
              Recalculates live
            </span>
          </div>
          <div
            className="text-[11px] px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }}
          >
            Baseline: {period.label} (Estimated typical month)
          </div>
        </div>
      </div>

      {/* Recoverable Error State */}
      {error && (
        <div
          className="mb-6 p-4 rounded-lg flex items-center justify-between gap-4"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <div className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </div>
          <button
            onClick={loadRealData}
            className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer shrink-0"
            style={{ background: "#f87171", color: "#000" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Scenario tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(Object.keys(SCENARIO_DEFINITIONS) as ScenarioId[]).map((id) => {
          const s = SCENARIO_DEFINITIONS[id];
          const isSelected = scenarioId === id;
          const cat = categoryDataMap[id];
          return (
            <button
              key={id}
              onClick={() => handleScenarioChange(id)}
              className="px-4 py-2 rounded-md text-sm font-medium shrink-0 cursor-pointer flex items-center gap-2 transition-colors"
              style={{
                background: isSelected ? "var(--sidebar)" : "var(--card)",
                color: isSelected ? "#ffffff" : "var(--muted-foreground)",
                border: `1px solid ${isSelected ? "var(--sidebar)" : "var(--border)"}`,
              }}
            >
              <span>{s.tabTitle}</span>
              {cat.hasData && (
                <span
                  className="text-[10px] px-1.5 py-0.2 rounded"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
                    color: isSelected ? "#fff" : "var(--muted-foreground)",
                    fontFamily: "var(--font-jetbrains)",
                  }}
                >
                  {formatINR(cat.totalSpend, true)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
          <div
            className="rounded-xl p-7 animate-pulse"
            style={{ background: "rgba(2,132,199,0.04)", border: "1px solid rgba(2,132,199,0.15)", minHeight: "340px" }}
          >
            <div className="h-3 w-28 bg-muted rounded mb-4" />
            <div className="h-7 w-64 bg-muted rounded mb-3" />
            <div className="h-4 w-full bg-secondary rounded mb-8" />
            <div className="h-12 w-48 bg-muted rounded mb-6" />
            <div className="h-2 w-full bg-secondary rounded" />
          </div>
          <div
            className="rounded-xl p-7 animate-pulse"
            style={{ background: "var(--card)", border: "1px solid var(--border)", minHeight: "340px" }}
          >
            <div className="h-4 w-36 bg-muted rounded mb-6" />
            <div className="grid grid-cols-3 gap-4 mb-7">
              <div className="h-16 bg-secondary rounded" />
              <div className="h-16 bg-secondary rounded" />
              <div className="h-16 bg-secondary rounded" />
            </div>
            <div className="h-40 bg-secondary/60 rounded" />
          </div>
        </div>
      ) : (
        /* Two-panel layout */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
          {/* Left: Scenario card — light blue tint */}
          <div
            className="rounded-xl p-7 flex flex-col justify-between"
            style={{
              background: "rgba(2,132,199,0.06)",
              border: "1px solid rgba(2,132,199,0.18)",
            }}
          >
            <div>
              <div
                className="text-xs font-semibold tracking-widest mb-3"
                style={{ color: "var(--forecast)", fontSize: "9px", letterSpacing: "0.14em" }}
              >
                {scenarioMeta.label}
              </div>
              <h2
                className="font-bold mb-2.5"
                style={{ fontSize: "24px", color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                {scenarioMeta.question}
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted-foreground)" }}>
                {hasData
                  ? `Your recorded spending in ${scenarioMeta.categoryName} is ${formatINR(baselineSpend, true)} across ${activeCategory.transactionCount} transaction${activeCategory.transactionCount === 1 ? "" : "s"} this month. Adjust the dial to simulate savings.`
                  : scenarioMeta.description}
              </p>

              {/* Slider / Data display */}
              {hasData ? (
                <div>
                  <div className="mb-2">
                    <div
                      className="text-xs font-semibold tracking-widest mb-2"
                      style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}
                    >
                      HYPOTHETICAL MONTHLY SPEND
                    </div>
                    <div className="flex items-end justify-between mb-4">
                      <div
                        className="font-bold tabular-nums"
                        style={{
                          fontSize: "38px",
                          fontFamily: "var(--font-jetbrains)",
                          color: "var(--forecast)",
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {formatINR(sliderValue, true)}
                      </div>
                      <div className="text-right text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
                        <div className="text-xs">Baseline spend</div>
                        <div className="font-semibold tabular-nums" style={{ fontFamily: "var(--font-jetbrains)" }}>
                          {formatINR(baselineSpend, true)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive slider */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min={sliderConfig.min}
                      max={sliderConfig.max}
                      step={sliderConfig.step}
                      value={sliderValue}
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      className="w-full"
                      style={{
                        height: "5px",
                        appearance: "none",
                        background: `linear-gradient(to right, #0284C7 0%, #0284C7 ${sliderPct}%, var(--border) ${sliderPct}%, var(--border) 100%)`,
                        borderRadius: "3px",
                        cursor: "pointer",
                        outline: "none",
                      }}
                      aria-label={`Simulated ${scenarioMeta.categoryName} monthly spending`}
                    />
                    <div
                      className="flex justify-between mt-1.5 text-xs tabular-nums"
                      style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jetbrains)", fontSize: "10px" }}
                    >
                      <span>₹0 (Max savings)</span>
                      <span>{formatINR(baselineSpend, true)} (No change)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state when category has zero transactions */
                <div
                  className="p-5 rounded-lg mb-4 text-center"
                  style={{ background: "var(--secondary)", border: "1px dashed var(--border)" }}
                >
                  <div className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    No spending data available for {scenarioMeta.categoryName} this month
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    No debit transactions were recorded in this category for {period.label}. Add transactions in the Transactions tab or select another category above to simulate savings.
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={0}
                    value={0}
                    disabled
                    className="w-full opacity-30 cursor-not-allowed"
                    style={{ height: "4px" }}
                  />
                </div>
              )}
            </div>

            {/* Projection & Goal Allocation Note */}
            {currentGoal ? (
              <div
                className="mt-6 p-4 rounded-lg"
                style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.16)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="text-xs font-semibold tracking-widest"
                    style={{ color: "var(--forecast)", fontSize: "9px", letterSpacing: "0.12em" }}
                  >
                    PROJECTION NOTE / GOAL IMPACT
                  </div>
                  {activeGoals.length > 1 && (
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className="text-xs px-2 py-0.5 rounded border cursor-pointer"
                      style={{
                        background: "rgba(15,23,42,0.8)",
                        borderColor: "rgba(6,182,212,0.3)",
                        color: "var(--forecast)",
                        fontFamily: "var(--font-jetbrains)",
                      }}
                      title="Select which goal to evaluate with potential savings"
                    >
                      {activeGoals.map((g) => (
                        <option key={g._id} value={g._id} style={{ background: "#0f172a", color: "#fff" }}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {monthlySavings > 0 ? (
                    <>
                      Assuming potential monthly savings of{" "}
                      <span className="font-semibold" style={{ color: "var(--forecast)" }}>
                        {formatINR(monthlySavings, true)}
                      </span>{" "}
                      are allocated toward your{" "}
                      <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                        {currentGoal.name}
                      </span>{" "}
                      ({formatINR(goalImpact?.remainingAmount || 0, true)} remaining),{" "}
                      {goalImpact?.monthsEarlier && goalImpact.monthsEarlier > 0 ? (
                        <>
                          it could reach completion{" "}
                          <span className="font-semibold" style={{ color: "var(--primary)" }}>
                            {goalImpact.monthsEarlier} month{goalImpact.monthsEarlier > 1 ? "s" : ""} earlier
                          </span>{" "}
                          (estimated ~{goalImpact.simulatedMonthsRemaining} months vs current ~{goalImpact.currentMonthsRemaining} months).
                        </>
                      ) : goalImpact?.simulatedMonthsRemaining ? (
                        <>
                          it could reach completion in approximately{" "}
                          <span className="font-semibold" style={{ color: "var(--primary)" }}>
                            {goalImpact.simulatedMonthsRemaining} months
                          </span>
                          {!goalImpact.isPaced && " (no prior monthly contributions were set)"}.
                        </>
                      ) : (
                        "your savings rate accelerates."
                      )}
                    </>
                  ) : (
                    <>
                      Simulate a spending reduction above to see how hypothetical savings would accelerate your{" "}
                      <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                        {currentGoal.name}
                      </span>{" "}
                      target.
                    </>
                  )}
                </p>
                <div className="mt-2 text-[10px]" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>
                  * Timeline comparison is an estimate based on steady monthly contributions, not a guarantee.
                </div>
              </div>
            ) : (
              /* No goals prompt */
              <div
                className="mt-6 p-4 rounded-lg"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
              >
                <div
                  className="text-xs font-semibold tracking-widest mb-1.5"
                  style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}
                >
                  FINANCIAL GOALS
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted-foreground)" }}>
                  No active savings goals found. Create a goal to project how simulated monthly savings can accelerate your timeline.
                </p>
                <a
                  href="/goals"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: "var(--primary)", color: "#000" }}
                >
                  Create a Goal →
                </a>
              </div>
            )}
          </div>

          {/* Right: Projected impact */}
          <div
            className="rounded-xl p-7 flex flex-col justify-between"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div>
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--forecast)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>

              {/* Three metrics in columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 mb-7">
                {[
                  {
                    label: "MONTHLY SAVINGS",
                    value: hasData && monthlySavings > 0 ? `+${formatINR(monthlySavings, true)}` : hasData ? "₹0" : "—",
                    sub: hasData ? "vs current behavior" : "No baseline spend",
                    color: hasData && monthlySavings > 0 ? "var(--primary)" : "var(--muted-foreground)",
                  },
                  {
                    label: "YEARLY SAVINGS",
                    value: hasData && annualizedSavings > 0 ? `+${formatINR(annualizedSavings, true)}` : hasData ? "₹0" : "—",
                    sub: hasData ? "annualized estimate" : "No baseline spend",
                    color: hasData && annualizedSavings > 0 ? "var(--primary)" : "var(--muted-foreground)",
                  },
                  {
                    label: "GOAL COMPLETION",
                    value:
                      goalImpact?.monthsEarlier && goalImpact.monthsEarlier > 0
                        ? `${goalImpact.monthsEarlier} mo`
                        : currentGoal
                        ? monthlySavings > 0 && goalImpact?.simulatedMonthsRemaining
                          ? `~${goalImpact.simulatedMonthsRemaining} mo`
                          : "No change"
                        : "No goal set",
                    sub:
                      goalImpact?.monthsEarlier && goalImpact.monthsEarlier > 0
                        ? "earlier vs current pace"
                        : currentGoal
                        ? monthlySavings > 0
                          ? "estimated timeline"
                          : "vs current pace"
                        : "create a goal to track",
                    color:
                      goalImpact?.monthsEarlier && goalImpact.monthsEarlier > 0
                        ? "var(--primary)"
                        : "var(--muted-foreground)",
                    highlightEarlier: Boolean(goalImpact?.monthsEarlier && goalImpact.monthsEarlier > 0),
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
                    {m.highlightEarlier && (
                      <div className="font-bold text-xs" style={{ color: m.color }}>
                        earlier
                      </div>
                    )}
                    <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>
                      {m.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart or Empty State */}
            <div style={{ height: "180px" }}>
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }} barSize={48}>
                    <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
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
                      tickFormatter={formatCompactINR}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" fill="#0284C7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center rounded-lg border border-dashed"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-50">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="17" x2="9" y2="13" />
                    <line x1="15" y1="17" x2="15" y2="9" />
                  </svg>
                  <span className="text-xs">No chart comparison available for this category this month</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slider styling */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #0284C7;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #0284C7;
          border: 2px solid #fff;
          cursor: pointer;
        }
        input[type=range]:disabled::-webkit-slider-thumb {
          background: #64748b;
          cursor: not-allowed;
        }
        input[type=range]:disabled::-moz-range-thumb {
          background: #64748b;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
