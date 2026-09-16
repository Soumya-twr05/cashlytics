const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const User = require("../src/models/User");
const FinancialProfile = require("../src/models/FinancialProfile");
const Budget = require("../src/models/Budget");
const Goal = require("../src/models/Goal");
const Bill = require("../src/models/Bill");
const Debt = require("../src/models/Debt");
const { monthKey } = require("../src/services/intelligence.service");

async function seed() {
  await connectDatabase();
  const email = "arjun@example.com";
  await User.deleteOne({ email });
  const passwordHash = await User.hashPassword("password123");
  const user = await User.create({
    name: "Arjun Sharma",
    email,
    phone: "+91 98765 43210",
    passwordHash,
    avatarInitials: "A",
  });

  await FinancialProfile.create({
    user: user.id,
    incomeRange: "60-120k",
    monthlyIncome: 85000,
    savingsTargetPct: 20,
    goals: ["emergency", "invest"],
    priorities: ["food", "shopping"],
  });

  const month = monthKey();
  await Budget.insertMany([
    { user: user.id, category: "Food & Dining", amount: 10000, color: "#10b981", month },
    { user: user.id, category: "Shopping", amount: 4000, color: "#f87171", month },
    { user: user.id, category: "Transport", amount: 5000, color: "#22d3ee", month },
    { user: user.id, category: "Entertainment", amount: 3000, color: "#f59e0b", month },
    { user: user.id, category: "Bills", amount: 5000, color: "#818cf8", month },
    { user: user.id, category: "Healthcare", amount: 2000, color: "#34d399", month },
  ]);

  await Goal.insertMany([
    { user: user.id, name: "Emergency Fund", icon: "▣", target: 300000, current: 142000, monthly: 8000, color: "#10b981" },
    { user: user.id, name: "New Laptop", icon: "⊞", target: 80000, current: 52000, monthly: 5000, color: "#818cf8" },
  ]);

  await Bill.create({
    user: user.id,
    name: "Netflix",
    amount: 649,
    cadence: "monthly",
    category: "Entertainment",
    nextDue: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 8),
    autoPay: true,
  });

  await Debt.create({
    user: user.id,
    name: "Education loan",
    principal: 400000,
    remaining: 180000,
    apr: 9.5,
    minPayment: 8500,
    lender: "SBI",
  });

  console.log(`Seeded demo user ${email} / password123`);
  await disconnectDatabase();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
