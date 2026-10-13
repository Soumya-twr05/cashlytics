const {
  requestOtp,
  verifyOtp,
  handleGoogleCallback,
  getUserProfile,
} = require("../services/auth.service");

const env = require("../config/env");

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
      result.message || "OTP sent"
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
    if (err.status) {
      return fail(res, err.message, err.status);
    }
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
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
  try {
    if (!env.googleClientId || !env.googleClientSecret) {
      const acceptsJson = req.xhr || req.headers.accept?.includes("application/json");
      if (acceptsJson) {
        return fail(res, "Google OAuth is not configured on the server", 503);
      }
      return res.redirect(`${env.clientOrigin}/?auth_error=${encodeURIComponent("Google OAuth credentials are not configured on the server")}`);
    }

    const params = new URLSearchParams({
      client_id: env.googleClientId,
      redirect_uri: env.googleCallbackUrl,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });

    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    return next(err);
  }
}

async function googleAuthCallback(req, res, next) {
  try {
    if (req.query.error) {
      return res.redirect(`${env.clientOrigin}/?auth_error=${encodeURIComponent(req.query.error)}`);
    }

    if (!req.query.code) {
      return res.redirect(`${env.clientOrigin}/?auth_error=missing_code`);
    }

    const result = await handleGoogleCallback(req.query.code);

    return res.redirect(
      `${env.clientOrigin}/?token=${encodeURIComponent(result.token)}&onboardingCompleted=${result.onboardingCompleted ? "true" : "false"}&auth=google`
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err.message);
    return res.redirect(
      `${env.clientOrigin}/?auth_error=${encodeURIComponent(err.message || "google_auth_failed")}`
    );
  }
}

module.exports = {
  requestOtp: requestOtpController,
  verifyOtp: verifyOtpController,
  me,
  logout,
  googleAuth,
  googleAuthCallback,
};