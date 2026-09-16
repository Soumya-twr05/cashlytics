const { forecastCategory } = require("../../src/services/forecast.service");

describe("financial health inputs", () => {
  it("does not exceed when spend is slow", () => {
    const result = forecastCategory({ spent: 1000, daysElapsed: 20, daysLeft: 10, budget: 5000 });
    expect(result.willExceed).toBe(false);
  });
});
