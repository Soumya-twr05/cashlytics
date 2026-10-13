import assert from "node:assert/strict";
import {
  matchScenarioCategory,
  aggregatePeriodExpenses,
  calculateSimulation,
  getSliderConfig,
  calculateGoalImpact,
  getCurrentCalendarMonthRange,
  formatINR,
  formatCompactINR,
} from "./whatIfCalculator.ts";

console.log("Running What-If Calculator verification tests...\n");

// Mock current period: October 2026
const mockNow = new Date("2026-10-15T12:00:00.000Z");
const period = {
  startDate: new Date("2026-10-01T00:00:00.000Z"),
  endDate: new Date("2026-10-31T23:59:59.999Z"),
  label: "October 2026",
  monthName: "October",
  year: 2026,
};

// Case 1: Real transactions in all three categories
{
  const txns = [
    { _id: "1", amount: 4500, type: "debit", category: "Shopping", occurredAt: "2026-10-05T10:00:00.000Z" },
    { _id: "2", amount: 1500, type: "debit", category: "Food & Dining", occurredAt: "2026-10-06T10:00:00.000Z" },
    { _id: "3", amount: 800, type: "debit", category: "Transport", occurredAt: "2026-10-07T10:00:00.000Z" },
  ];
  const agg = aggregatePeriodExpenses(txns, period, mockNow);
  assert.equal(agg.shopping.totalSpend, 4500);
  assert.equal(agg.shopping.hasData, true);
  assert.equal(agg.food.totalSpend, 1500);
  assert.equal(agg.food.hasData, true);
  assert.equal(agg.transport.totalSpend, 800);
  assert.equal(agg.transport.hasData, true);
  console.log("✓ Case 1: Real transactions in all 3 categories passed");
}

// Case 2: No transactions in one category
{
  const txns = [
    { _id: "1", amount: 2000, type: "debit", category: "Shopping", occurredAt: "2026-10-05T10:00:00.000Z" },
    { _id: "2", amount: 1200, type: "debit", category: "Transport", occurredAt: "2026-10-06T10:00:00.000Z" },
  ];
  const agg = aggregatePeriodExpenses(txns, period, mockNow);
  assert.equal(agg.shopping.hasData, true);
  assert.equal(agg.food.hasData, false);
  assert.equal(agg.food.totalSpend, 0);
  assert.equal(agg.transport.hasData, true);
  console.log("✓ Case 2: Missing transactions in one category correctly handled");
}

// Case 3: No transactions in any supported category
{
  const txns = [
    { _id: "1", amount: 5000, type: "debit", category: "Healthcare", occurredAt: "2026-10-05T10:00:00.000Z" },
    { _id: "2", amount: 20000, type: "credit", category: "Income", occurredAt: "2026-10-06T10:00:00.000Z" },
  ];
  const agg = aggregatePeriodExpenses(txns, period, mockNow);
  assert.equal(agg.shopping.hasData, false);
  assert.equal(agg.food.hasData, false);
  assert.equal(agg.transport.hasData, false);
  console.log("✓ Case 3: Zero transactions in supported categories handled");
}

// Case 4: Transaction outside selected period (e.g. September 2026)
{
  const txns = [
    { _id: "1", amount: 3000, type: "debit", category: "Shopping", occurredAt: "2026-09-28T10:00:00.000Z" },
    { _id: "2", amount: 1000, type: "debit", category: "Shopping", occurredAt: "2026-10-05T10:00:00.000Z" },
  ];
  const agg = aggregatePeriodExpenses(txns, period, mockNow);
  assert.equal(agg.shopping.totalSpend, 1000); // 3000 excluded!
  console.log("✓ Case 4: Transactions outside period excluded");
}

// Case 5: Future-dated transaction (e.g. 2026-10-25 when now is 2026-10-15)
{
  const txns = [
    { _id: "1", amount: 2000, type: "debit", category: "Food & Dining", occurredAt: "2026-10-10T10:00:00.000Z" },
    { _id: "2", amount: 5000, type: "debit", category: "Food & Dining", occurredAt: "2026-10-25T10:00:00.000Z" }, // future
  ];
  const agg = aggregatePeriodExpenses(txns, period, mockNow);
  assert.equal(agg.food.totalSpend, 2000); // 5000 excluded!
  console.log("✓ Case 5: Future-dated transactions excluded");
}

// Case 7: Slider min and max bounds
{
  const baseline = 8420;
  // Slider at min
  const simMin = calculateSimulation(baseline, 0);
  assert.equal(simMin.simulatedMonthlySpend, 0);
  assert.equal(simMin.monthlySavings, 8420);
  assert.equal(simMin.annualizedSavings, 8420 * 12);

  // Slider at max
  const simMax = calculateSimulation(baseline, baseline);
  assert.equal(simMax.simulatedMonthlySpend, 8420);
  assert.equal(simMax.monthlySavings, 0);
  assert.equal(simMax.annualizedSavings, 0);

  // Slider exceeding max (must clamp to baseline)
  const simExceed = calculateSimulation(baseline, 10000);
  assert.equal(simExceed.simulatedMonthlySpend, 8420);
  assert.equal(simExceed.monthlySavings, 0);

  // Slider negative (must clamp to 0)
  const simNeg = calculateSimulation(baseline, -500);
  assert.equal(simNeg.simulatedMonthlySpend, 0);
  assert.equal(simNeg.monthlySavings, 8420);

  console.log("✓ Case 7: Slider min/max and clamping logic verified");
}

// Case 8: User has a real financial goal
{
  const goal = {
    _id: "g1",
    name: "MacBook Pro",
    target: 120000,
    current: 40000,
    monthly: 10000,
  };
  // Remaining: 80000. At 10000/mo = 8 months.
  // With monthly savings of 2500 -> 12500/mo -> 80000 / 12500 = 7 months (1 month earlier)
  const impact = calculateGoalImpact(goal, 2500);
  assert.equal(impact.remainingAmount, 80000);
  assert.equal(impact.currentMonthsRemaining, 8);
  assert.equal(impact.simulatedMonthsRemaining, 7);
  assert.equal(impact.monthsEarlier, 1);
  console.log("✓ Case 8: Real financial goal simulation impact verified");
}

// Case 9: User has no financial goal
{
  const impact = calculateGoalImpact(null, 2500);
  assert.equal(impact, null);
  console.log("✓ Case 9: Null goal handled cleanly without error");
}

// Case 11: Small or zero spending baseline
{
  const cfgZero = getSliderConfig(0);
  assert.equal(cfgZero.max, 0);
  assert.equal(cfgZero.min, 0);
  assert.equal(cfgZero.defaultVal, 0);

  const simZero = calculateSimulation(0, 0);
  assert.equal(simZero.monthlySavings, 0);
  assert.equal(simZero.annualizedSavings, 0);

  const cfgSmall = getSliderConfig(85.5);
  assert.equal(cfgSmall.min, 0);
  assert.equal(cfgSmall.max, 85.5);
  assert.equal(cfgSmall.step, 10);

  console.log("✓ Case 11: Small and zero baseline handled gracefully without NaN or div by 0");
}

// Currency formatting
{
  assert.equal(formatINR(12500, true), "₹12,500");
  assert.equal(formatINR(0, true), "₹0");
  assert.equal(formatCompactINR(15000), "₹15k");
  assert.equal(formatCompactINR(250000), "₹2.5L");
  console.log("✓ Currency formatting verified");
}

console.log("\nAll unit tests passed successfully!");
