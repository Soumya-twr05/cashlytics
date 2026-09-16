const request = require("supertest");
const app = require("../../src/app");

describe("authorization", () => {
  it("blocks dashboard without a token", async () => {
    const res = await request(app).get("/api/intelligence/dashboard");
    expect(res.status).toBe(401);
  });

  it("blocks transactions without a token", async () => {
    const res = await request(app).get("/api/transactions");
    expect(res.status).toBe(401);
  });

  it("rejects a malformed bearer token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-jwt");
    expect(res.status).toBe(401);
  });
});
