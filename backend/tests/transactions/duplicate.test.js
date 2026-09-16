const { findDuplicate } = require("../../src/services/duplicate.service");

jest.mock("../../src/models/Transaction", () => ({
  findOne: jest.fn(async ({ fingerprint }) => (fingerprint ? null : { id: "dup" })),
}));

describe("duplicate detection", () => {
  it("returns a fingerprint even when no duplicate exists", async () => {
    const result = await findDuplicate("507f1f77bcf86cd799439011", {
      merchant: "Swiggy",
      amount: 450,
      occurredAt: new Date("2026-09-10"),
      method: "UPI",
    });
    expect(result.fingerprint).toHaveLength(64);
    expect(result.existing).toBeNull();
  });
});
