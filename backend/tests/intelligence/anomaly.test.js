const { scoreAnomaly } = require("../../src/services/ml.service");

describe("anomaly scoring", () => {
  it("marks 2.4x spend as high", () => {
    expect(scoreAnomaly(8500, 3500).severity).toBe("high");
  });

  it("keeps near-baseline spend as low", () => {
    expect(scoreAnomaly(3200, 3100).severity).toBe("low");
  });
});
