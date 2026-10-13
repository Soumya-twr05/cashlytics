const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const OtpVerification = require("../src/models/OtpVerification");
const User = require("../src/models/User");
const { signToken } = require("../src/middleware/auth.middleware");
const env = require("../src/config/env");

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cashlytics_test");
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Cashlytics Authentication Test Suite", () => {
  const testEmail = "testuser@example.com";
  const existingUserEmail = "existing@example.com";

  beforeEach(async () => {
    await OtpVerification.deleteMany({});
    await User.deleteMany({});

    // Seed existing user for signin tests
    await User.create({
      name: "Existing User",
      email: existingUserEmail,
      authProviders: ["email"],
      onboardingCompleted: true,
    });
  });

  describe("A. OTP Request", () => {
    it("should successfully request an OTP for signup", async () => {
      const res = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: testEmail, mode: "signup" });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.devOtp).toBeDefined();
      expect(res.body.data.devOtp).toMatch(/^\d{6}$/);
    });

    it("should successfully request an OTP for signin when account exists", async () => {
      const res = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: existingUserEmail, mode: "signin" });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.devOtp).toBeDefined();
    });

    it("should reject signin if account does not exist (404)", async () => {
      const res = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: "nonexistent@example.com", mode: "signin" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No account found/i);
    });

    it("should reject signup if account already exists (409)", async () => {
      const res = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: existingUserEmail, mode: "signup" });

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it("should enforce cooldown on rapid duplicate OTP requests (429)", async () => {
      await request(app)
        .post("/api/auth/otp/request")
        .send({ email: testEmail, mode: "signup" });

      const duplicateRes = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: testEmail, mode: "signup" });

      expect(duplicateRes.statusCode).toEqual(429);
      expect(duplicateRes.body.message).toMatch(/wait before requesting/i);
    });
  });

  describe("B. OTP Verification & User Registration", () => {
    it("should reject an invalid OTP code (401)", async () => {
      const reqRes = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: testEmail, mode: "signup" });

      const res = await request(app)
        .post("/api/auth/otp/verify")
        .send({ email: testEmail, otp: "000000", mode: "signup" });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid OTP/i);
    });

    it("should verify correct OTP and create user record on signup", async () => {
      const reqRes = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: testEmail, mode: "signup" });

      const validOtp = reqRes.body.data.devOtp;

      const verifyRes = await request(app)
        .post("/api/auth/otp/verify")
        .send({
          email: testEmail,
          otp: validOtp,
          name: "Test User",
          mode: "signup",
        });

      expect(verifyRes.statusCode).toEqual(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.token).toBeDefined();
      expect(verifyRes.body.data.user.email).toBe(testEmail);
      expect(verifyRes.body.data.user.name).toBe("Test User");

      // Verify in DB
      const userInDb = await User.findOne({ email: testEmail });
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe("Test User");
      expect(userInDb.authProviders).toContain("email");
    });

    it("should verify correct OTP for existing user on signin", async () => {
      const reqRes = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: existingUserEmail, mode: "signin" });

      const validOtp = reqRes.body.data.devOtp;

      const verifyRes = await request(app)
        .post("/api/auth/otp/verify")
        .send({
          email: existingUserEmail,
          otp: validOtp,
          mode: "signin",
        });

      expect(verifyRes.statusCode).toEqual(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.token).toBeDefined();
      expect(verifyRes.body.data.user.name).toBe("Existing User");
    });

    it("should prevent OTP reuse once verified (single-use enforcement)", async () => {
      const reqRes = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: testEmail, mode: "signup" });

      const validOtp = reqRes.body.data.devOtp;

      // First verification succeeds
      const firstVerify = await request(app)
        .post("/api/auth/otp/verify")
        .send({ email: testEmail, otp: validOtp, name: "Test User", mode: "signup" });
      expect(firstVerify.statusCode).toEqual(200);

      // Replay attempt must be rejected
      const replayVerify = await request(app)
        .post("/api/auth/otp/verify")
        .send({ email: testEmail, otp: validOtp, name: "Test User", mode: "signup" });
      expect(replayVerify.statusCode).toEqual(401);
      expect(replayVerify.body.message).toMatch(/Invalid or expired OTP/i);
    });

    it("should reject expired OTPs", async () => {
      const reqRes = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: testEmail, mode: "signup" });

      const validOtp = reqRes.body.data.devOtp;

      // Manually backdate the OTP record expiration
      await OtpVerification.updateMany(
        { email: testEmail },
        { $set: { expiresAt: new Date(Date.now() - 1000) } }
      );

      const res = await request(app)
        .post("/api/auth/otp/verify")
        .send({ email: testEmail, otp: validOtp, mode: "signup" });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toMatch(/Invalid or expired OTP/i);
    });

    it("should lock out verification after 3 invalid attempts", async () => {
      const reqRes = await request(app)
        .post("/api/auth/otp/request")
        .send({ email: testEmail, mode: "signup" });

      const validOtp = reqRes.body.data.devOtp;

      // Send 3 wrong OTPs
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post("/api/auth/otp/verify")
          .send({ email: testEmail, otp: "999999", mode: "signup" });
      }

      // 4th attempt with correct OTP is rejected due to max attempts
      const lockedRes = await request(app)
        .post("/api/auth/otp/verify")
        .send({ email: testEmail, otp: validOtp, mode: "signup" });

      expect(lockedRes.statusCode).toEqual(429);
      expect(lockedRes.body.message).toMatch(/Maximum attempts exceeded/i);
    });
  });

  describe("C. Protected Routes & Session Handling", () => {
    it("should reject unauthenticated request to /api/auth/me (401)", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it("should allow authenticated request to /api/auth/me with valid token", async () => {
      const user = await User.findOne({ email: existingUserEmail });
      const token = signToken(user);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(existingUserEmail);
    });

    it("should reject /api/auth/me with forged or invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token-string");

      expect(res.statusCode).toEqual(401);
    });

    it("should return success on logout", async () => {
      const user = await User.findOne({ email: existingUserEmail });
      const token = signToken(user);

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("D. Google OAuth Route Structure", () => {
    it("should respond to GET /api/auth/google", async () => {
      const res = await request(app)
        .get("/api/auth/google")
        .set("Accept", "application/json");

      // In test env, credentials are unconfigured, so it returns 503 or redirects cleanly
      if (res.statusCode === 503) {
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Google OAuth is not configured/i);
      } else {
        expect(res.statusCode).toBe(302);
      }
    });

    it("should handle GET /api/auth/google/callback with error param by redirecting to client origin with auth_error", async () => {
      const res = await request(app)
        .get("/api/auth/google/callback?error=access_denied");

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain("auth_error=access_denied");
    });
  });
});
