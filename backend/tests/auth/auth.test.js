const request = require("supertest");
const app = require("../../src/app");
const { registerSchema } = require("../../src/validators/auth.validator");

describe("auth validation", () => {
  it("rejects a short password", () => {
    const { error } = registerSchema.validate({
      name: "Arjun",
      email: "arjun@example.com",
      password: "short",
    });
    expect(error).toBeTruthy();
  });

  it("accepts a valid payload", () => {
    const { error } = registerSchema.validate({
      name: "Arjun Sharma",
      email: "arjun@example.com",
      password: "password123",
    });
    expect(error).toBeUndefined();
  });
});

describe("health", () => {
  it("returns service status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
