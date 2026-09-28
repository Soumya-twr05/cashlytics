const FinancialProfile = require("../models/FinancialProfile");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const { success, fail } = require("../utils/response");

async function getProfile(req, res, next) {
  try {
    const profile = await FinancialProfile.findOne({ user: req.userId });
    const user = await User.findById(req.userId).select(
      "name email avatar authProviders onboardingCompleted plan preferences createdAt"
    );

    if (!user) {
      return fail(res, "User not found", 404);
    }

    return success(res, {
      profile,
      user,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await FinancialProfile.findOneAndUpdate(
      { user: req.userId },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );

    await User.findByIdAndUpdate(req.userId, {
      onboardingCompleted: true,
    });

    // Seed income transaction if monthlyIncome was updated and none exists this month
    if (req.body.monthlyIncome && req.body.monthlyIncome > 0) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const existingIncome = await Transaction.findOne({
        user: req.userId,
        type: "credit",
        category: "Income",
        merchant: "Monthly Salary",
        occurredAt: { $gte: monthStart, $lte: monthEnd },
      });

      if (!existingIncome) {
        await Transaction.create({
          user: req.userId,
          merchant: "Monthly Salary",
          amount: req.body.monthlyIncome,
          type: "credit",
          category: "Income",
          method: "NEFT",
          source: "Profile",
          notes: "Monthly income seeded from profile update",
          confidence: 1.0,
          verified: true,
          confirmed: true,
          stage: "ready",
          occurredAt: new Date(now.getFullYear(), now.getMonth(), 1, 9, 0, 0),
        });
      }
    }

    return success(res, { profile }, "Profile updated");
  } catch (err) {
    return next(err);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const updates = {};

    for (const [key, val] of Object.entries(req.body)) {
      updates[`preferences.${key}`] = val;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return fail(res, "User not found", 404);
    }

    return success(
      res,
      { preferences: user.preferences },
      "Preferences updated"
    );
  } catch (err) {
    return next(err);
  }
}

async function updateAvatar(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, "Please select an image", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          avatar: `data:${req.file.mimetype};base64,${req.file.buffer.toString(
            "base64"
          )}`,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("name email avatar");

    if (!user) {
      return fail(res, "User not found", 404);
    }

    return success(res, { user }, "Profile photo updated");
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /profile/complete-onboarding
 * Atomically:
 *   1. Saves the financial profile
 *   2. Seeds a recurring income transaction for the current month (idempotent)
 *   3. Creates the user's selected goals
 *   4. Marks onboardingCompleted = true
 */
async function completeOnboarding(req, res, next) {
  try {
    const {
      monthlyIncome,
      averageMonthlyExpenses,
      desiredMonthlySavings,
      spendingStyle,
      priorities,
      goals = [],
    } = req.body;

    if (!monthlyIncome || monthlyIncome <= 0) {
      return fail(res, "monthlyIncome is required and must be positive", 422);
    }

    // 1. Upsert financial profile
    const profile = await FinancialProfile.findOneAndUpdate(
      { user: req.userId },
      {
        $set: {
          monthlyIncome,
          averageMonthlyExpenses: averageMonthlyExpenses || 0,
          desiredMonthlySavings: desiredMonthlySavings || 0,
          spendingStyle: spendingStyle || "moderate",
          priorities: priorities || [],
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    // 2. Seed monthly income transaction (idempotent – once per calendar month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const existingIncomeThisMonth = await Transaction.findOne({
      user: req.userId,
      type: "credit",
      category: "Income",
      merchant: "Monthly Salary",
      occurredAt: { $gte: monthStart, $lte: monthEnd },
    });

    if (!existingIncomeThisMonth) {
      await Transaction.create({
        user: req.userId,
        merchant: "Monthly Salary",
        amount: monthlyIncome,
        type: "credit",
        category: "Income",
        method: "NEFT",
        source: "Onboarding",
        notes: "Monthly income seeded from onboarding profile",
        confidence: 1.0,
        verified: true,
        confirmed: true,
        stage: "ready",
        occurredAt: new Date(now.getFullYear(), now.getMonth(), 1, 9, 0, 0),
      });
    }

    // 3. Create goals (skip duplicates by name)
    for (const goal of goals) {
      if (!goal.name) continue;
      const exists = await Goal.findOne({ user: req.userId, name: goal.name });
      if (!exists) {
        await Goal.create({
          user: req.userId,
          name: goal.name,
          target: goal.target || 100000,
          icon: goal.icon || "",
          current: 0,
          monthly: 0,
          color: goal.color || "#10b981",
        });
      }
    }

    // 4. Mark onboarding complete
    await User.findByIdAndUpdate(req.userId, { onboardingCompleted: true });

    return success(res, { profile }, "Onboarding complete");
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  updateAvatar,
  completeOnboarding,
};