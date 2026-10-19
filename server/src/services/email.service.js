/**
 * email.service.js
 *
 * Email delivery with two providers, in priority order:
 *
 *  1. Brevo (primary)  – HTTPS API, 300 emails/day free, no custom domain needed.
 *     The sender must be the Gmail address you registered your Brevo account with.
 *     Set BREVO_API_KEY + BREVO_FROM_EMAIL in Render env vars.
 *
 *  2. Resend (fallback) – HTTPS API, 100 emails/day free, but requires a verified
 *     custom domain to send to arbitrary users.  If you only have the Resend free
 *     plan without a domain, set RESEND_FROM_EMAIL=onboarding@resend.dev and
 *     leave SMTP_USER/SMTP_PASS empty.
 *
 * Gmail SMTP (port 465) is intentionally omitted: Render's free tier blocks it.
 */

const env = require("../config/env");

// ---------------------------------------------------------------------------
// 1.  Brevo client (lazy-initialised so import never throws)
// ---------------------------------------------------------------------------
let brevoApi = null;
if (env.brevoApiKey) {
  try {
    const SibApiV3Sdk = require("@getbrevo/brevo");
    const instance = new SibApiV3Sdk.TransactionalEmailsApi();
    instance.authentications["apiKey"].apiKey = env.brevoApiKey;
    brevoApi = instance;
  } catch (err) {
    console.error("[EMAIL] Failed to initialise Brevo client:", err.message);
  }
}

// ---------------------------------------------------------------------------
// 2.  Resend client
// ---------------------------------------------------------------------------
let resendClient = null;
if (env.resendApiKey) {
  try {
    const { Resend } = require("resend");
    resendClient = new Resend(env.resendApiKey);
  } catch (err) {
    console.error("[EMAIL] Failed to initialise Resend client:", err.message);
  }
}

// ---------------------------------------------------------------------------
// Email template helpers
// ---------------------------------------------------------------------------
function buildOtpHtml(otp) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                max-width:520px;margin:0 auto;padding:32px 24px;
                background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
      <div style="margin-bottom:24px;text-align:center;">
        <h2 style="margin:0;color:#111827;font-size:20px;font-weight:700;letter-spacing:-0.02em;">CASHLYTICS</h2>
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Adaptive Financial Intelligence</p>
      </div>

      <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 20px;">Hello,</p>
      <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 24px;">
        Use the following 6-digit one-time password to verify your account.
        This code is valid for <strong>10 minutes</strong> and can only be used once:
      </p>

      <div style="background:#f3f4f6;border-radius:6px;padding:18px;text-align:center;margin:0 0 24px;">
        <span style="font-family:'SF Mono',Monaco,Consolas,monospace;
                     font-size:32px;font-weight:700;letter-spacing:6px;color:#111827;">
          ${otp}
        </span>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:0 0 16px;">
        If you did not request this code, please ignore this email or review your account security.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;" />
      <p style="color:#9ca3af;font-size:11px;margin:0;text-align:center;">
        &copy; ${new Date().getFullYear()} Cashlytics. All rights reserved.
      </p>
    </div>
  `;
}

function buildOtpText(otp) {
  return (
    `Hello,\n\n` +
    `Your Cashlytics verification code is: ${otp}\n\n` +
    `This code is valid for 10 minutes and can only be used once.\n\n` +
    `If you did not request this code, please ignore this email.\n`
  );
}

// ---------------------------------------------------------------------------
// 3.  Provider implementations
// ---------------------------------------------------------------------------

/**
 * Send via Brevo HTTPS API.
 * Works on Render free tier.  Sender must match the email registered in Brevo.
 */
async function sendViaBrevo(to, subject, html, text) {
  const SibApiV3Sdk = require("@getbrevo/brevo");

  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.sender = {
    name: env.brevoFromName || "Cashlytics",
    email: env.brevoFromEmail,
  };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = html;
  email.textContent = text;

  const data = await brevoApi.sendTransacEmail(email);
  return { delivered: true, messageId: data?.messageId || data?.body?.messageId };
}

/**
 * Send via Resend HTTPS API.
 * Requires a verified custom domain to reach arbitrary recipients.
 * With onboarding@resend.dev you can only email the Resend account owner.
 */
async function sendViaResend(to, subject, html, text) {
  const response = await resendClient.emails.send({
    from: env.resendFromEmail || "Cashlytics <onboarding@resend.dev>",
    to,
    subject,
    html,
    text,
  });

  if (response.error) {
    const msg = response.error.message || JSON.stringify(response.error);
    throw new Error(`Resend error: ${msg}`);
  }

  return { delivered: true, messageId: response.data?.id };
}

// ---------------------------------------------------------------------------
// 4.  Public API
// ---------------------------------------------------------------------------

/**
 * Send an OTP verification email.
 *
 * @param {string} to  - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @returns {Promise<{ delivered: boolean, messageId?: string, simulated?: boolean, provider?: string, error?: string }>}
 */
async function sendOtpEmail(to, otp) {
  const normalizedTo = to.toLowerCase().trim();

  // In test environment skip all external calls
  if (env.nodeEnv === "test") {
    return { delivered: false, simulated: true };
  }

  const subject = "Your Cashlytics verification code";
  const html = buildOtpHtml(otp);
  const text = buildOtpText(otp);

  // ── Provider 1: Brevo ─────────────────────────────────────────────────────
  if (brevoApi && env.brevoFromEmail) {
    try {
      const result = await sendViaBrevo(normalizedTo, subject, html, text);
      console.log(
        `[EMAIL] OTP → ${normalizedTo} via Brevo (id: ${result.messageId})`
      );
      return { ...result, provider: "brevo" };
    } catch (err) {
      console.error("[EMAIL] Brevo delivery failed:", err.message);
      // fall through to Resend
    }
  }

  // ── Provider 2: Resend ────────────────────────────────────────────────────
  if (resendClient) {
    try {
      const result = await sendViaResend(normalizedTo, subject, html, text);
      console.log(
        `[EMAIL] OTP → ${normalizedTo} via Resend (id: ${result.messageId})`
      );
      return { ...result, provider: "resend" };
    } catch (err) {
      console.error("[EMAIL] Resend delivery failed:", err.message);

      if (env.nodeEnv === "production") {
        const error = new Error(
          "Failed to deliver verification email. Please try again later."
        );
        error.status = 502;
        throw error;
      }

      return { delivered: false, error: err.message };
    }
  }

  // ── No provider configured ────────────────────────────────────────────────
  if (env.nodeEnv === "production") {
    const err = new Error(
      "Email delivery is not configured. Please contact support."
    );
    err.status = 503;
    throw err;
  }

  // Development/staging: log OTP to console (auth.service exposes it as devOtp)
  console.log(
    `[EMAIL-DEV] OTP for ${normalizedTo} (no provider configured, simulated delivery)`
  );
  return { delivered: false, simulated: true };
}

module.exports = { sendOtpEmail };
