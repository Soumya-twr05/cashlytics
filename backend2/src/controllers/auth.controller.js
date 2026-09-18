const { requestOtp, verifyOtp, getUserProfile } = require("../services/auth.service");
const { success, created, fail } = require("../utils/response");

async function requestOtpController(req, res, next) {
  try {
    const result = await requestOtp(req.body.email);
    return success(res, result, "OTP sent");
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    return next(err);
  }
}

async function verifyOtpController(req, res, next) {
  try {
    const result = await verifyOtp(req.body.email, req.body.otp);
    return success(res, result, "Signed in successfully");
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await getUserProfile(req.userId);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    // With stateless JWT, logout is primarily a client-side action (deleting token).
    // If blacklisting is needed, it would be implemented here.
    return success(res, {}, "Logged out successfully");
  } catch (err) {
    return next(err);
  }
}

async function googleAuth(req, res, next) {
  // Placeholder for Google OAuth. Depending on implementation (frontend token vs backend flow),
  // this would verify the Google token and find/create the user similar to verifyOtp.
  return fail(res, "Google Auth not yet implemented", 501);
}

module.exports = { requestOtp: requestOtpController, verifyOtp: verifyOtpController, me, logout, googleAuth };
