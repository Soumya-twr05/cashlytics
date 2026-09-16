const { heuristicCategory } = require("../../src/services/categorization.service");

describe("smart capture heuristics", () => {
  it("maps UPI lifestyle merchants", () => {
    expect(heuristicCategory("Zomato").category).toBe("Food & Dining");
    expect(heuristicCategory("Uber Trip").category).toBe("Transport");
    expect(heuristicCategory("Netflix India").category).toBe("Entertainment");
  });

  it("falls back to Other", () => {
    const result = heuristicCategory("Unknown Merchant XYZ");
    expect(result.category).toBe("Other");
    expect(result.confidence).toBeLessThan(80);
  });
});
