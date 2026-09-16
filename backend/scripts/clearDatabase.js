const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const User = require("../src/models/User");
const Transaction = require("../src/models/Transaction");
const Budget = require("../src/models/Budget");
const Goal = require("../src/models/Goal");
const Bill = require("../src/models/Bill");
const Debt = require("../src/models/Debt");
const FinancialProfile = require("../src/models/FinancialProfile");
const MerchantPreference = require("../src/models/MerchantPreference");
const CategoryFeedback = require("../src/models/CategoryFeedback");
const AIInsight = require("../src/models/AIInsight");

async function clear() {
  await connectDatabase();
  await Promise.all([
    User.deleteMany({}),
    Transaction.deleteMany({}),
    Budget.deleteMany({}),
    Goal.deleteMany({}),
    Bill.deleteMany({}),
    Debt.deleteMany({}),
    FinancialProfile.deleteMany({}),
    MerchantPreference.deleteMany({}),
    CategoryFeedback.deleteMany({}),
    AIInsight.deleteMany({}),
  ]);
  console.log("Database cleared");
  await disconnectDatabase();
}

clear().catch((err) => {
  console.error(err);
  process.exit(1);
});
