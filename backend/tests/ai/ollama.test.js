const { fallbackReply } = require("../../src/services/ollama.service");

describe("ollama fallback", () => {
  it("returns a finance-aware reply without a live model", () => {
    const text = fallbackReply("Why did my expenses increase?");
    expect(text.toLowerCase()).toContain("cashlytics");
  });
});
