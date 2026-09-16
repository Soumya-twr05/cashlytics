const { transactionFingerprint, normalizeMerchant } = require("../../src/utils/fingerprint");
const { heuristicCategory } = require("../../src/services/categorization.service");
const { initialsFor } = require("../../src/services/transaction.service");

describe("transactions", () => {
  it("normalizes merchant names", () => {
    expect(normalizeMerchant("  Swiggy  ")).toBe("SWIGGY");
  });

  it("builds a stable fingerprint", () => {
    const a = transactionFingerprint({
      userId: "u1",
      merchant: "Swiggy",
      amount: 450,
      occurredAt: "2026-09-10",
      method: "UPI",
    });
    const b = transactionFingerprint({
      userId: "u1",
      merchant: "SWIGGY",
      amount: 450,
      occurredAt: "2026-09-10",
      method: "UPI",
    });
    expect(a).toBe(b);
  });

  it("guesses food for Swiggy", () => {
    expect(heuristicCategory("SWIGGY").category).toBe("Food & Dining");
  });

  it("builds initials", () => {
    expect(initialsFor("OLA CABS")).toBe("OC");
  });
});
