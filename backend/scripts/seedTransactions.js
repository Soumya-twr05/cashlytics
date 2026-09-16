const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const User = require("../src/models/User");
const { createTransaction } = require("../src/services/transaction.service");

const SAMPLE = [
  { merchant: "SWIGGY", amount: 450, category: "Food & Dining", method: "UPI", source: "SMS" },
  { merchant: "Uber", amount: 620, category: "Transport", method: "Card", source: "Notification" },
  { merchant: "Netflix", amount: 649, category: "Entertainment", method: "Card", source: "Bank feed" },
  { merchant: "Amazon", amount: 8500, category: "Electronics", method: "UPI", source: "Notification" },
  { merchant: "Airtel", amount: 899, category: "Bills", method: "Auto-pay", source: "Bank feed" },
  { merchant: "Salary", amount: 142000, type: "credit", category: "Income", method: "NEFT", source: "Bank feed" },
];

async function seedTransactions() {
  await connectDatabase();
  const user = await User.findOne({ email: "arjun@example.com" });
  if (!user) {
    throw new Error("Run `npm run seed` first");
  }

  for (const row of SAMPLE) {
    try {
      await createTransaction(user.id, {
        ...row,
        occurredAt: new Date(),
        verified: true,
        confirmed: row.merchant !== "Amazon",
      });
    } catch (err) {
      if (err.status !== 409) throw err;
    }
  }

  console.log("Seeded sample transactions");
  await disconnectDatabase();
}

seedTransactions().catch((err) => {
  console.error(err);
  process.exit(1);
});
