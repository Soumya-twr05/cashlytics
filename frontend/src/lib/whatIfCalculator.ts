import type { TransactionItem, GoalItem } from "./api";

/**
 * Supported scenario identifiers in Cashlytics What-If Simulator
 */
export type ScenarioId = "shopping" | "food" | "transport";

export interface ScenarioMeta {
  id: ScenarioId;
  categoryName: string;
  label: string;
  question: string;
  description: string;
  tabTitle: string;
  unit: string;
}

export const SCENARIO_DEFINITIONS: Record<ScenarioId, ScenarioMeta> = {
  shopping: {
    id: "shopping",
    categoryName: "Shopping",
    label: "SCENARIO / LIFESTYLE ADJUSTMENT",
    question: "What if shopping cost less?",
    description: "Reduce your shopping spend and see how it impacts your annual savings.",
    tabTitle: "Shopping",
    unit: "monthly spend",
  },
  food: {
    id: "food",
    categoryName: "Food & Dining",
    label: "SCENARIO / DINING ADJUSTMENT",
    question: "What if you cooked more?",
    description: "Reducing dining out can compound quickly across a year.",
    tabTitle: "Dining",
    unit: "monthly spend",
  },
  transport: {
    id: "transport",
    categoryName: "Transport",
    label: "SCENARIO / COMMUTE ADJUSTMENT",
    question: "What if you used public transport?",
    description: "Metro, bus, or shared rides could cut your transport spend significantly.",
    tabTitle: "Commute",
    unit: "monthly spend",
  },
};

export interface CategorySpendingData {
  scenarioId: ScenarioId;
  categoryName: string;
  totalSpend: number;
  transactionCount: number;
  hasData: boolean;
}

export interface SimulationMetrics {
  baselineMonthlySpend: number;
  simulatedMonthlySpend: number;
  monthlySavings: number;
  annualizedSavings: number;
}

export interface GoalSimulationImpact {
  goalId?: string;
  goalName: string;
  targetAmount: number;
  currentSaved: number;
  remainingAmount: number;
  currentMonthlyContribution: number;
  currentMonthsRemaining: number | null; // null if no contribution
  simulatedMonthlyContribution: number;
  simulatedMonthsRemaining: number | null; // null if no contribution
  monthsEarlier: number;
  isFullyFunded: boolean;
  isPaced: boolean; // true if currentMonthlyContribution > 0
}

/**
 * Normalizes a transaction's category string to one of the supported scenario IDs.
 * Matches canonical Cashlytics category naming ("Food & Dining", "Shopping", "Transport").
 */
export function matchScenarioCategory(rawCategory?: string): ScenarioId | null {
  if (!rawCategory) return null;
  const cat = rawCategory.toLowerCase().trim();

  if (cat === "shopping" || cat.startsWith("shop") || cat.includes("shopping")) {
    return "shopping";
  }

  if (
    cat === "food & dining" ||
    cat === "food and dining" ||
    cat === "food" ||
    cat === "dining" ||
    cat.includes("food") ||
    cat.includes("dining")
  ) {
    return "food";
  }

  if (
    cat === "transport" ||
    cat === "transportation" ||
    cat === "commute" ||
    cat.includes("transport")
  ) {
    return "transport";
  }

  return null;
}

export interface PeriodDateRange {
  startDate: Date;
  endDate: Date;
  label: string;
  monthName: string;
  year: number;
}

/**
 * Returns the current calendar month date range boundaries.
 */
export function getCurrentCalendarMonthRange(): PeriodDateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthName = now.toLocaleDateString("en-IN", { month: "long" });
  const year = now.getFullYear();

  return {
    startDate: start,
    endDate: end,
    label: `${monthName} ${year}`,
    monthName,
    year,
  };
}

/**
 * Aggregates expense transactions into category spending summaries for the selected period.
 * Strict filtering:
 * 1. Only debit/expense transactions.
 * 2. Only within period boundaries (startDate <= occurredAt <= endDate).
 * 3. Excludes future-dated transactions (occurredAt <= now).
 * 4. Preserves full numeric precision without rounding.
 */
export function aggregatePeriodExpenses(
  transactions: TransactionItem[],
  period: PeriodDateRange,
  now: Date = new Date()
): Record<ScenarioId, CategorySpendingData> {
  const result: Record<ScenarioId, CategorySpendingData> = {
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
  };

  for (const tx of transactions) {
    // 1. Only debits / expenses
    if (tx.type && tx.type !== "debit") {
      continue;
    }

    // 2. Parse date
    const dateStr = tx.occurredAt || tx.date;
    if (!dateStr) continue;
    const txDate = new Date(dateStr);
    if (isNaN(txDate.getTime())) continue;

    // 3. Exclude transactions outside period and future-dated transactions
    if (txDate < period.startDate || txDate > period.endDate || txDate > now) {
      continue;
    }

    // 4. Match scenario category
    const scenarioId = matchScenarioCategory(tx.category);
    if (!scenarioId) continue;

    // 5. Accumulate with precision
    const amount = Number(tx.amount);
    if (!isNaN(amount) && amount > 0) {
      result[scenarioId].totalSpend += amount;
      result[scenarioId].transactionCount += 1;
      result[scenarioId].hasData = true;
    }
  }

  return result;
}

/**
 * Calculates monthly and annualized savings.
 * Constrains simulated spend: 0 <= simulatedMonthlySpend <= baselineMonthlySpend
 */
export function calculateSimulation(
  baselineMonthlySpend: number,
  hypotheticalMonthlySpend: number
): SimulationMetrics {
  const baseline = Math.max(0, Number(baselineMonthlySpend) || 0);
  const clampedSimulated = Math.max(0, Math.min(baseline, Number(hypotheticalMonthlySpend) || 0));
  const monthlySavings = Math.max(0, baseline - clampedSimulated);
  const annualizedSavings = monthlySavings * 12;

  return {
    baselineMonthlySpend: baseline,
    simulatedMonthlySpend: clampedSimulated,
    monthlySavings,
    annualizedSavings,
  };
}

/**
 * Computes slider configuration bounds and initial step.
 */
export function getSliderConfig(baselineSpend: number): {
  min: number;
  max: number;
  step: number;
  defaultVal: number;
} {
  const baseline = Math.max(0, Number(baselineSpend) || 0);
  if (baseline <= 0) {
    return { min: 0, max: 0, step: 1, defaultVal: 0 };
  }

  let step = 100;
  if (baseline < 500) step = 10;
  else if (baseline < 2000) step = 50;
  else if (baseline < 10000) step = 100;
  else step = 250;

  // Target midpoint or 60% of baseline rounded to step
  const rawTarget = baseline * 0.6;
  const defaultVal = Math.max(0, Math.min(baseline, Math.round(rawTarget / step) * step));

  return {
    min: 0,
    max: baseline,
    step,
    defaultVal,
  };
}

/**
 * Evaluates the impact of potential monthly savings on a user's real financial goal.
 */
export function calculateGoalImpact(
  goal: GoalItem | null | undefined,
  monthlySavings: number
): GoalSimulationImpact | null {
  if (!goal) return null;

  const target = Math.max(0, Number(goal.target) || 0);
  const current = Math.max(0, Number(goal.current) || 0);
  const remaining = Math.max(0, target - current);
  const currentMonthly = Math.max(0, Number(goal.monthly) || 0);

  if (remaining <= 0) {
    return {
      goalId: goal._id,
      goalName: goal.name || "Goal",
      targetAmount: target,
      currentSaved: current,
      remainingAmount: 0,
      currentMonthlyContribution: currentMonthly,
      currentMonthsRemaining: 0,
      simulatedMonthlyContribution: currentMonthly + monthlySavings,
      simulatedMonthsRemaining: 0,
      monthsEarlier: 0,
      isFullyFunded: true,
      isPaced: true,
    };
  }

  const currentMonths = currentMonthly > 0 ? Math.ceil(remaining / currentMonthly) : null;
  const simulatedMonthly = currentMonthly + monthlySavings;
  const simulatedMonths = simulatedMonthly > 0 ? Math.ceil(remaining / simulatedMonthly) : null;

  let monthsEarlier = 0;
  if (currentMonths !== null && simulatedMonths !== null) {
    monthsEarlier = Math.max(0, currentMonths - simulatedMonths);
  }

  return {
    goalId: goal._id,
    goalName: goal.name || "Goal",
    targetAmount: target,
    currentSaved: current,
    remainingAmount: remaining,
    currentMonthlyContribution: currentMonthly,
    currentMonthsRemaining: currentMonths,
    simulatedMonthlyContribution: simulatedMonthly,
    simulatedMonthsRemaining: simulatedMonths,
    monthsEarlier,
    isFullyFunded: false,
    isPaced: currentMonthly > 0,
  };
}

/**
 * Formats a currency amount into standard Indian currency representation.
 */
export function formatINR(val: number, roundDecimals = false): string {
  if (isNaN(val)) return "₹0";
  const num = roundDecimals ? Math.round(val) : val;
  return `₹${num.toLocaleString("en-IN", {
    maximumFractionDigits: roundDecimals ? 0 : 2,
  })}`;
}

/**
 * Format currency for chart Y-axis (e.g. ₹12k, ₹500)
 */
export function formatCompactINR(val: number): string {
  if (isNaN(val)) return "₹0";
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${Math.round(val)}`;
}

/**
 * ============================================================================
 * ML Category Forecasting Integration Contract
 * ============================================================================
 * Cashlytics ML service (`POST /forecast`) currently predicts aggregate
 * total monthly spending across all combined categories.
 * 
 * When a category-specific ML forecasting model (e.g. `POST /forecast/category`)
 * is deployed, this contract allows the simulator to ingest predictive baselines
 * seamlessly rather than past-month run rates.
 */
export interface CategoryForecastBaseline {
  scenarioId: ScenarioId;
  predictedSpend: number;
  confidenceLower?: number;
  confidenceUpper?: number;
  source: "real_transactions" | "ml_forecast";
  forecastModelVersion?: string;
}
