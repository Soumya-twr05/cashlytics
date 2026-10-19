const crypto = require("crypto");
const User = require("../models/User");
const OtpVerification = require("../models/OtpVerification");
const { signToken } = require("../middleware/auth.middleware");
const { sendOtpEmail } = require("./email.service");
const env = require("../config/env");

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function isAdminEmail(email) {
  if (!env.adminEmail || !email) return false;
  return email.toLowerCase().trim() === env.adminEmail.toLowerCase().trim();
}

async function requestOtp(email, mode = "signin") {
  const normalizedEmail = email.toLowerCase().trim();

  // If signing in, ensure user exists
  if (mode === "signin") {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      const err = new Error("No account found with this email. Please sign up first.");
      err.status = 404;
      throw err;
    }
  }

  // If signing up, ensure user does not already exist
  if (mode === "signup") {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const err = new Error("An account already exists with this email. Please sign in instead.");
      err.status = 409;
      throw err;
    }
  }

  // Check if an OTP was recently sent (60-second cooldown)
  const recentOtp = await OtpVerification.findOne({
    email: normalizedEmail,
    createdAt: {
      $gt: new Date(Date.now() - 60 * 1000),
    },
  });

  if (recentOtp) {
    const err = new Error("Please wait before requesting another OTP");
    err.status = 429;
    throw err;
  }

  // Invalidate any previously pending, unused OTPs for this email to enforce single active OTP
  await OtpVerification.updateMany(
    { email: normalizedEmail, used: false },
    { $set: { used: true } }
  );

  const otp = generateOTP();
  const codeHash = hashOTP(otp);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpVerification.create({
    email: normalizedEmail,
    codeHash,
    expiresAt,
  });

  // Attempt email delivery via Brevo HTTPS API
  const emailResult = await sendOtpEmail(normalizedEmail, otp);

  return {
    message: emailResult.delivered
      ? "Verification code sent to your email"
      : "Verification code generated",
    emailDelivered: emailResult.delivered,
    devOtp:
      process.env.NODE_ENV !== "production" && !emailResult.delivered
        ? otp
        : undefined,
  };
}

async function verifyOtp(email, otp, name = "", mode = "signin") {
  const normalizedEmail = email.toLowerCase().trim();

  // Find latest valid, unused OTP
  const otpRecord = await OtpVerification.findOne({
    email: normalizedEmail,
    used: false,
    expiresAt: {
      $gt: new Date(),
    },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    const err = new Error("Invalid or expired OTP");
    err.status = 401;
    throw err;
  }

  // Check maximum attempts
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    const err = new Error("Maximum attempts exceeded. Please request a new OTP.");
    err.status = 429;
    throw err;
  }

  // Verify OTP using timing-safe comparison
  const providedHash = hashOTP(otp);
  const hashBuf = Buffer.from(otpRecord.codeHash, "utf-8");
  const provBuf = Buffer.from(providedHash, "utf-8");
  const isMatch =
    hashBuf.length === provBuf.length &&
    crypto.timingSafeEqual(hashBuf, provBuf);

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    const err = new Error("Invalid OTP");
    err.status = 401;
    throw err;
  }

  // Mark OTP as used
  otpRecord.used = true;
  await otpRecord.save();

  // Find or create user
  let user = await User.findOne({
    email: normalizedEmail,
  });

  const isAdmin = isAdminEmail(normalizedEmail);

  if (!user) {
    const trimmedName = name?.trim() || normalizedEmail.split("@")[0];
    user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      authProviders: ["email"],
      role: isAdmin ? "admin" : "user",
    });
  } else {
    let modified = false;
    if (name?.trim() && (!user.name || user.name === normalizedEmail.split("@")[0])) {
      user.name = name.trim();
      modified = true;
    }
    if (isAdmin && user.role !== "admin") {
      user.role = "admin";
      modified = true;
    }
    if (modified) {
      await user.save();
    }
  }

  if (!user) {
    const err = new Error("Unable to authenticate user.");
    err.status = 500;
    throw err;
  }

  if (!user.authProviders.includes("email")) {
    user.authProviders.push("email");
    await user.save();
  }

  const token = signToken(user);

  return {
    token,
    user: publicUser(user),
    onboardingCompleted: user.onboardingCompleted,
  };
}

/**
 * Handle Google OAuth callback:
 * Exchanges authorization code for tokens, retrieves Google profile,
 * creates or updates user in MongoDB, and issues signed Cashlytics JWT.
 */
async function handleGoogleCallback(code) {
  if (!env.googleClientId || !env.googleClientSecret) {
    const err = new Error("Google OAuth credentials are not configured on server");
    err.status = 503;
    throw err;
  }

  // 1. Exchange code for tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: env.googleCallbackUrl,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    console.error("Google token exchange failure:", tokenData);
    const err = new Error(tokenData.error_description || "Failed to exchange authorization code with Google");
    err.status = 401;
    throw err;
  }

  // 2. Fetch Google user profile
  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const profile = await profileResponse.json();

  if (!profileResponse.ok || !profile.email) {
    console.error("Google userinfo fetch failure:", profile);
    const err = new Error("Failed to retrieve user profile from Google");
    err.status = 401;
    throw err;
  }

  const normalizedEmail = profile.email.toLowerCase().trim();
  const googleId = profile.sub;

  // 3. Find or create user
  let user = await User.findOne({
    $or: [{ googleId }, { email: normalizedEmail }],
  });

  const isGoogleAdmin = isAdminEmail(normalizedEmail);

  if (!user) {
    user = await User.create({
      name: profile.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      googleId,
      avatar: profile.picture || "",
      authProviders: ["google"],
      role: isGoogleAdmin ? "admin" : "user",
    });
  } else {
    // Link google provider if needed
    let modified = false;
    if (isGoogleAdmin && user.role !== "admin") {
      user.role = "admin";
      modified = true;
    }
    if (!user.googleId) {
      user.googleId = googleId;
      modified = true;
    }
    if (!user.authProviders.includes("google")) {
      user.authProviders.push("google");
      modified = true;
    }
    if (!user.avatar && profile.picture) {
      user.avatar = profile.picture;
      modified = true;
    }
    if (modified) {
      await user.save();
    }
  }

  const token = signToken(user);

  return {
    token,
    user: publicUser(user),
    onboardingCompleted: !!user.onboardingCompleted,
  };
}

async function getUserProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return {
    user: publicUser(user),
  };
}

function publicUser(user) {
  return {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    plan: user.plan,
    role: user.role || "user",
    preferences: user.preferences,
    onboardingCompleted: user.onboardingCompleted,
  };
}

module.exports = {
  requestOtp,
  verifyOtp,
  handleGoogleCallback,
  getUserProfile,
  publicUser,
};