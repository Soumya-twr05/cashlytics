const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const Transaction = require("../src/models/Transaction");
const AssistantMessage = require("../src/models/AssistantMessage");
const Budget = require("../src/models/Budget");
const Goal = require("../src/models/Goal");
const { signToken } = require("../src/middleware/auth.middleware");
const jwt = require("jsonwebtoken");
const env = require("../src/config/env");

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cashlytics_test");
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Admin Authorization & API Security Suite", () => {
  let adminUser;
  let normalUser;
  let adminToken;
  let normalToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await AssistantMessage.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});

    // Create Admin User
    adminUser = await User.create({
      name: "Super Admin",
      email: "admin@cashlytics.local",
      role: "admin",
      authProviders: ["email"],
      onboardingCompleted: true,
    });
    adminToken = signToken(adminUser);

    // Create Normal User
    normalUser = await User.create({
      name: "Regular User",
      email: "user@example.com",
      role: "user",
      authProviders: ["email"],
      onboardingCompleted: true,
    });
    normalToken = signToken(normalUser);

    // Seed test transactions
    await Transaction.create([
      {
        user: normalUser._id,
        merchant: "Supermarket",
        amount: 1500,
        type: "debit",
        category: "Groceries",
        source: "Manual",
        confidence: 0.9,
        fingerprint: "test-fp-1",
      },
      {
        user: normalUser._id,
        merchant: "Cafe",
        amount: 300,
        type: "debit",
        category: "Food & Dining",
        source: "SMS",
        confidence: 0.85,
        fingerprint: "test-fp-2",
      },
    ]);

    // Seed test assistant messages
    await AssistantMessage.create([
      {
        user: normalUser._id,
        role: "user",
        content: "What is my spending?",
      },
      {
        user: normalUser._id,
        role: "assistant",
        content: "Your highest spending is Groceries.",
        source: "ollama",
      },
      {
        user: normalUser._id,
        role: "assistant",
        content: "Here is your fallback overview.",
        source: "fallback",
      },
    ]);
  });

  describe("A. Access Control & Authorization", () => {
    it("should reject unauthenticated request to /api/admin/overview with 401", async () => {
      const res = await request(app).get("/api/admin/overview");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject authenticated non-admin user with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/admin/overview")
        .set("Authorization", `Bearer ${normalToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden|Administrator/i);
    });

    it("should reject forged JWT token claiming admin role for non-admin user with 403", async () => {
      // Craft a forged token that encodes role: 'admin' for a non-admin sub ID
      const forgedToken = jwt.sign(
        { sub: normalUser._id.toString(), email: normalUser.email, role: "admin" },
        env.jwtSecret,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/api/admin/overview")
        .set("Authorization", `Bearer ${forgedToken}`);

      // The server verifies against the actual user record in MongoDB, rejecting the forgery
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should allow verified administrator with 200 OK", async () => {
      const res = await request(app)
        .get("/api/admin/overview")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBe(2);
      expect(res.body.data.totalTransactions).toBe(2);
      expect(res.body.data.totalAssistantRequests).toBe(1);
    });
  });

  describe("B. Admin User Management", () => {
    it("should return sanitized paginated user list", async () => {
      const res = await request(app)
        .get("/api/admin/users?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeInstanceOf(Array);
      expect(res.body.data.users.length).toBe(2);
      expect(res.body.data.pagination.total).toBe(2);

      const firstUser = res.body.data.users[0];
      expect(firstUser).toHaveProperty("email");
      expect(firstUser).toHaveProperty("role");
      // Must not leak passwords or sensitive tokens
      expect(firstUser).not.toHaveProperty("password");
      expect(firstUser).not.toHaveProperty("codeHash");
    });

    it("should filter users by search term", async () => {
      const res = await request(app)
        .get("/api/admin/users?search=Super")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users.length).toBe(1);
      expect(res.body.data.users[0].email).toBe("admin@cashlytics.local");
    });
  });

  describe("C. Platform Analytics & AI/ML Monitoring", () => {
    it("should return category distribution matching database aggregates", async () => {
      const res = await request(app)
        .get("/api/admin/analytics")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categoryDistribution).toBeInstanceOf(Array);
      expect(res.body.data.featureUsage.transactionsCount).toBe(2);
      expect(res.body.data.featureUsage.smartCaptureCount).toBe(1); // One is SMS
    });

    it("should return AI/ML monitoring metrics with provider counts", async () => {
      const res = await request(app)
        .get("/api/admin/ai-ml")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assistant.totalReplies).toBe(2);
      expect(res.body.data.assistant.fallbackCount).toBe(1);
      expect(res.body.data.assistant.providerUsage).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ provider: "ollama", count: 1 }),
          expect.objectContaining({ provider: "fallback", count: 1 }),
        ])
      );
      expect(res.body.data.unavailableMetrics).toBeInstanceOf(Array);
    });

    it("should return system health metrics", async () => {
      const res = await request(app)
        .get("/api/admin/health")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.backend.status).toBe("healthy");
      expect(res.body.data.database.status).toBe("connected");
      expect(res.body.data.mlService).toHaveProperty("status");
    });
  });
});
