const { forecastCategory, monthProgress } = require("../../src/services/forecast.service");

describe("dashboard forecast helpers", () => {
  it("flags a budget that will exhaust early", () => {
    const result = forecastCategory({ spent: 8400, daysElapsed: 10, daysLeft: 20, budget: 10000 });
    expect(result.willExceed).toBe(true);
    expect(result.velocity).toBeGreaterThan(0);
  });

  it("returns remaining days in the month", () => {
    const { daysElapsed, daysLeft } = monthProgress(new Date("2026-09-10"));
    expect(daysElapsed).toBe(10);
    expect(daysLeft).toBeGreaterThan(0);
  });
});
