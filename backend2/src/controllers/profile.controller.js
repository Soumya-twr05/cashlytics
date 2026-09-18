const FinancialProfile = require("../models/FinancialProfile");
const User = require("../models/User");
const { success, fail } = require("../utils/response");

async function getProfile(req, res, next) {
  try {
    const profile = await FinancialProfile.findOne({ user: req.userId });
    if (!profile) return fail(res, "Profile not found", 404);
    return success(res, { profile });
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await FinancialProfile.findOneAndUpdate(
      { user: req.userId },
      { $set: req.body },
      { new: true, upsert: true }
    );

    // If profile is created/updated for the first time, mark onboarding completed
    await User.findByIdAndUpdate(req.userId, { onboardingCompleted: true });

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
    const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true });
    return success(res, { preferences: user.preferences }, "Preferences updated");
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProfile, updateProfile, updatePreferences };
