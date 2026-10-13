const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

const {
  computeHealth,
  categoryTotals,
  startOfMonth,
  endOfMonth,
} = require("./intelligence.service");

async function buildAssistantContext(userId) {
  const start = startOfMonth();
  const end = endOfMonth();

  const [health, categories, transactions, budgets, goals] =
    await Promise.all([
      computeHealth(userId),

      categoryTotals(userId, start, end),

      Transaction.find({
        user: userId,
        occurredAt: { $gte: start, $lte: end },
      })
        .sort({ occurredAt: -1 })
        .limit(20)
        .select(
          "merchant amount type category occurredAt method source confidence"
        )
        .lean(),

      Budget.find({ user: userId })
        .select("category amount month aiNote")
        .lean(),

      Goal.find({ user: userId })
        .select("name target current monthly deadline")
        .lean(),
    ]);

  const expenseCategories = categories.map((item) => ({
    category: item._id,
    total: item.total,
    count: item.count,
  }));

  const recentTransactions = transactions.map((transaction) => ({
    merchant: transaction.merchant,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    date: transaction.occurredAt,
    method: transaction.method,
    source: transaction.source,
  }));

  const budgetContext = budgets.map((budget) => ({
    category: budget.category,
    amount: budget.amount,
    month: budget.month,
    aiNote: budget.aiNote || "",
  }));

  const goalContext = goals.map((goal) => ({
    name: goal.name,
    target: goal.target,
    current: goal.current,
    monthly: goal.monthly,
    deadline: goal.deadline || null,
  }));

  return {
    health,
    categories: expenseCategories,
    recentTransactions,
    budgets: budgetContext,
    goals: goalContext,
  };
}

module.exports = {
  buildAssistantContext,
};