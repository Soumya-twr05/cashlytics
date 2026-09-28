const crypto = require("crypto");
const User = require("../models/User");
const OtpVerification = require("../models/OtpVerification");
const { signToken } = require("../middleware/auth.middleware");

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

async function requestOtp(email, mode = "signin") {
  const normalizedEmail = email.toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (mode === "signin" && !user) {
    const err = new Error("Account not found. Please create an account first.");
    err.status = 404;
    throw err;
  }

  if (mode === "signup" && user) {
    const err = new Error("An account already exists with this email. Please sign in.");
    err.status = 409;
    throw err;
  }

  // Check if an OTP was recently sent
  const recentOtp = await OtpVerification.findOne({
    email: normalizedEmail,
    createdAt: {
      $gt: new Date(Date.now() - 60 * 1000),
    },
  });

  if (recentOtp) {
    const err = new Error(
      "Please wait before requesting another OTP"
    );

    err.status = 429;
    throw err;
  }

  const otp = generateOTP();
  const codeHash = hashOTP(otp);

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await OtpVerification.create({
    email: normalizedEmail,
    codeHash,
    expiresAt,
  });

  // Development only
  console.log(
    `[DEV ONLY] OTP for ${normalizedEmail}: ${otp}`
  );

  return {
    message: "OTP sent successfully",
  };
}

async function verifyOtp(
  email,
  otp,
  name = "",
  mode = "signin"
) {
  const normalizedEmail = email.toLowerCase().trim();

  // ----------------------------------------------------
  // Find latest valid OTP
  // ----------------------------------------------------

  const otpRecord = await OtpVerification.findOne({
    email: normalizedEmail,
    used: false,
    expiresAt: {
      $gt: new Date(),
    },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    const err = new Error(
      "Invalid or expired OTP"
    );

    err.status = 401;
    throw err;
  }

  // ----------------------------------------------------
  // Check maximum attempts
  // ----------------------------------------------------

  if (
    otpRecord.attempts >=
    otpRecord.maxAttempts
  ) {
    const err = new Error(
      "Maximum attempts exceeded. Please request a new OTP."
    );

    err.status = 429;
    throw err;
  }

  // ----------------------------------------------------
  // Verify OTP
  // ----------------------------------------------------

  const providedHash = hashOTP(otp);

  if (otpRecord.codeHash !== providedHash) {
    otpRecord.attempts += 1;

    await otpRecord.save();

    const err = new Error("Invalid OTP");

    err.status = 401;
    throw err;
  }

  // OTP is correct
  otpRecord.used = true;
  await otpRecord.save();

  // ----------------------------------------------------
  // Find existing user
  // ----------------------------------------------------

  let user = await User.findOne({
    email: normalizedEmail,
  });

  // ----------------------------------------------------
  // SIGN IN
  // Existing account is required
  // ----------------------------------------------------

  if (mode === "signin" && !user) {
    const err = new Error(
      "Account not found. Please sign up first."
    );

    err.status = 404;
    throw err;
  }

  // ----------------------------------------------------
  // SIGN UP
  // Existing account cannot sign up again
  // ----------------------------------------------------

  if (mode === "signup" && user) {
    const err = new Error(
      "An account already exists with this email. Please sign in."
    );

    err.status = 409;
    throw err;
  }

  // ----------------------------------------------------
  // SIGN UP + NEW USER
  // ----------------------------------------------------

  if (mode === "signup" && !user) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      const err = new Error(
        "Name is required for signup."
      );

      err.status = 422;
      throw err;
    }

    user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      authProviders: ["email"],
    });
  }

  // ----------------------------------------------------
  // Safety check
  // ----------------------------------------------------

  if (!user) {
    const err = new Error(
      "Unable to authenticate user."
    );

    err.status = 500;
    throw err;
  }

  // ----------------------------------------------------
  // Make sure email authentication is enabled
  // ----------------------------------------------------

  if (
    !user.authProviders.includes("email")
  ) {
    user.authProviders.push("email");

    await user.save();
  }

  // ----------------------------------------------------
  // Generate JWT
  // ----------------------------------------------------

  const token = signToken(user);

  // ----------------------------------------------------
  // Return authentication result
  // ----------------------------------------------------

  return {
    token,
    user: publicUser(user),
    onboardingCompleted:
      user.onboardingCompleted,
  };
}

async function getUserProfile(userId) {
  const user = await User.findById(userId);

  return {
    user: publicUser(user),
  };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    plan: user.plan,
    preferences: user.preferences,
    onboardingCompleted:
      user.onboardingCompleted,
  };
}

module.exports = {
  requestOtp,
  verifyOtp,
  getUserProfile,
  publicUser,
};