const {
  requestOtp,
  verifyOtp,
  getUserProfile,
} = require("../services/auth.service");

const {
  success,
  created,
  fail,
} = require("../utils/response");

async function requestOtpController(req, res, next) {
  try {
    const result = await requestOtp(req.body.email, req.body.mode);

    return created(
      res,
      result,
      "OTP sent"
    );
  } catch (err) {
    if (err.status) {
      return fail(
        res,
        err.message,
        err.status
      );
    }

    return next(err);
  }
}

async function verifyOtpController(req, res, next) {
  try {
    const result = await verifyOtp(
      req.body.email,
      req.body.otp,
      req.body.name,
      req.body.mode
    );

    return success(
      res,
      result,
      "Signed in successfully"
    );
  } catch (err) {
    if (err.status) {
      return fail(
        res,
        err.message,
        err.status
      );
    }

    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await getUserProfile(
      req.userId
    );

    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    // JWT is stateless, so logout is primarily
    // handled by removing the token on the client.
    return success(
      res,
      {},
      "Logged out successfully"
    );
  } catch (err) {
    return next(err);
  }
}

async function googleAuth(req, res, next) {
  // Google OAuth will be implemented separately.
  return fail(
    res,
    "Google Auth not yet implemented",
    501
  );
}

module.exports = {
  requestOtp: requestOtpController,
  verifyOtp: verifyOtpController,
  me,
  logout,
  googleAuth,
};