const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const OtpVerification = require("../src/models/OtpVerification");
const User = require("../src/models/User");

beforeAll(async () => {
  // Connect to a test DB if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cashlytics_test");
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Auth Endpoints", () => {
  const testEmail = "test@example.com";

  beforeEach(async () => {
    await OtpVerification.deleteMany({});
    await User.deleteMany({});
  });

  it("should request an OTP successfully", async () => {
    const res = await request(app).post("/api/auth/otp/request").send({ email: testEmail });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("OTP sent");
  });

  it("should reject an invalid OTP", async () => {
    await request(app).post("/api/auth/otp/request").send({ email: testEmail });
    const res = await request(app).post("/api/auth/otp/verify").send({ email: testEmail, otp: "000000" });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
