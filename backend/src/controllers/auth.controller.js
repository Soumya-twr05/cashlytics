const User = require("../models/User");
const FinancialProfile = require("../models/FinancialProfile");
const { signToken } = require("../middleware/auth.middleware");
const { success, created, fail } = require("../utils/response");

async function register(req, res, next) {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return fail(res, "Email already registered", 409);
    const passwordHash = await User.hashPassword(req.body.password);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      passwordHash,
      avatarInitials: req.body.name.slice(0, 1).toUpperCase(),
    });
    await FinancialProfile.create({ user: user.id });
    const token = signToken(user);
    return created(res, { token, user: publicUser(user) }, "Account created");
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+passwordHash");
    if (!user || !(await user.comparePassword(req.body.password))) {
      return fail(res, "Invalid credentials", 401);
    }
    return success(res, { token: signToken(user), user: publicUser(user) }, "Signed in");
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const profile = await FinancialProfile.findOne({ user: req.userId });
    return success(res, { user: publicUser(req.user), profile });
  } catch (err) {
    return next(err);
  }
}

async function onboarding(req, res, next) {
  try {
    const incomeMap = { lt30k: 25000, "30-60k": 45000, "60-120k": 90000, gt120k: 150000 };
    const profile = await FinancialProfile.findOneAndUpdate(
      { user: req.userId },
      {
        $set: {
          ...req.body,
          monthlyIncome: req.body.monthlyIncome || incomeMap[req.body.incomeRange],
        },
      },
      { new: true, upsert: true }
    );
    return success(res, { profile }, "Onboarding saved");
  } catch (err) {
    return next(err);
  }
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    plan: user.plan,
    preferences: user.preferences,
  };
}

module.exports = { register, login, me, onboarding };
