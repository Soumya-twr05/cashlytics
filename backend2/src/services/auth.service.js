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

async function requestOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if an OTP was recently sent (cooldown)
  const recentOtp = await OtpVerification.findOne({
    email: normalizedEmail,
    createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // 1 minute cooldown
  });
  
  if (recentOtp) {
    const err = new Error("Please wait before requesting another OTP");
    err.status = 429;
    throw err;
  }

  const otp = generateOTP();
  const codeHash = hashOTP(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await OtpVerification.create({
    email: normalizedEmail,
    codeHash,
    expiresAt
  });

  // In production, integrate with SendGrid/AWS SES to send the email.
  // For development, we log it.
  console.log(`[DEV ONLY] OTP for ${normalizedEmail}: ${otp}`);

  return { message: "OTP sent successfully" };
}

async function verifyOtp(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();
  
  const otpRecord = await OtpVerification.findOne({
    email: normalizedEmail,
    used: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    const err = new Error("Invalid or expired OTP");
    err.status = 401;
    throw err;
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    const err = new Error("Maximum attempts exceeded. Please request a new OTP.");
    err.status = 429;
    throw err;
  }

  const providedHash = hashOTP(otp);
  if (otpRecord.codeHash !== providedHash) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const err = new Error("Invalid OTP");
    err.status = 401;
    throw err;
  }

  // Mark as used
  otpRecord.used = true;
  await otpRecord.save();

  // Find or create user
  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({
      email: normalizedEmail,
      authProviders: ["email"]
    });
  } else if (!user.authProviders.includes("email")) {
    user.authProviders.push("email");
    await user.save();
  }

  const token = signToken(user);
  return { token, user: publicUser(user) };
}

async function getUserProfile(userId) {
  const user = await User.findById(userId);
  return { user: publicUser(user) };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    plan: user.plan,
    preferences: user.preferences,
    onboardingCompleted: user.onboardingCompleted
  };
}

module.exports = { requestOtp, verifyOtp, getUserProfile, publicUser };
