/**
 * email.service.js
 *
 * Transactional email delivery via Brevo (formerly Sendinblue) official HTTPS API.
 * Uses @getbrevo/brevo TransactionalEmailsApi.
 *
 * Compatible with Render's free tier (HTTPS on port 443; no outbound SMTP).
 * Supports arbitrary recipients without a custom domain once the sender email is verified in Brevo.
 */

const env = require("../config/env");

// ---------------------------------------------------------------------------
// Startup diagnostics (masked, safe to log)
// ---------------------------------------------------------------------------
const configuredKey = (env.brevoApiKey || "").trim();
const configuredFrom = (env.brevoFromEmail || "").trim();

if (configuredKey) {
  const keyType = configuredKey.startsWith("xkeysib-")
    ? "API v3 key (valid format)"
    : configuredKey.startsWith("xsmtpsib-")
    ? "WARNING: SMTP relay key detected (starts with xsmtpsib-). Brevo REST API requires an API v3 key (starts with xkeysib-)!"
    : "custom key format";
  console.log(
    `[EMAIL] Brevo provider loaded: sender="${configuredFrom || "NOT SET"}", keyType=${keyType}`
  );
} else {
  console.log("[EMAIL] Brevo not configured (BREVO_API_KEY missing in environment)");
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
// Brevo HTTPS API Sender
// ---------------------------------------------------------------------------
async function sendViaBrevo(to, subject, html, text) {
  const apiKey = (env.brevoApiKey || "").trim();
  const fromEmail = (env.brevoFromEmail || "").trim();
  const fromName = (env.brevoFromName || "Cashlytics").trim();

  if (!apiKey) {
    const error = new Error("BREVO_API_KEY is not configured.");
    error.status = 503;
    throw error;
  }

  if (apiKey.startsWith("xsmtpsib-")) {
    const error = new Error(
      "BREVO_API_KEY is configured with an SMTP relay key (starts with 'xsmtpsib-'). Brevo HTTPS API requires an API v3 key (starts with 'xkeysib-'). Please generate an API Key in Brevo under SMTP & API -> API Keys tab."
    );
    error.status = 500;
    throw error;
  }

  if (!fromEmail) {
    const error = new Error("BREVO_FROM_EMAIL is not configured.");
    error.status = 503;
    throw error;
  }

  const SibApiV3Sdk = require("@getbrevo/brevo");
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.authentications["apiKey"].apiKey = apiKey;

  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.sender = {
    name: fromName,
    email: fromEmail,
  };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = html;
  email.textContent = text;

  try {
    const data = await apiInstance.sendTransacEmail(email);
    const messageId =
      data?.messageId || data?.body?.messageId || (data?.response ? "accepted" : "sent");
    return { delivered: true, messageId };
  } catch (err) {
    let detail = err.message;
    if (err.response && err.response.body) {
      if (typeof err.response.body === "object") {
        detail =
          err.response.body.message ||
          err.response.body.code ||
          JSON.stringify(err.response.body);
      } else {
        detail = String(err.response.body);
      }
    }
    const error = new Error(`Brevo delivery failed: ${detail}`);
    error.status = 502;
    error.originalError = err;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send an OTP verification email using Brevo HTTPS API.
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

  const apiKey = (env.brevoApiKey || "").trim();
  const fromEmail = (env.brevoFromEmail || "").trim();

  // If Brevo is not configured
  if (!apiKey || !fromEmail) {
    if (env.nodeEnv === "production") {
      const missingVars = [];
      if (!apiKey) missingVars.push("BREVO_API_KEY");
      if (!fromEmail) missingVars.push("BREVO_FROM_EMAIL");
      const err = new Error(
        `Email delivery is not configured. Missing environment variable(s): ${missingVars.join(
          ", "
        )}. Please configure them in Render dashboard.`
      );
      err.status = 503;
      throw err;
    }

    console.log(
      `[EMAIL-DEV] OTP for ${normalizedTo}: ${otp} (Brevo not configured, simulated delivery)`
    );
    return { delivered: false, simulated: true };
  }

  try {
    const result = await sendViaBrevo(normalizedTo, subject, html, text);
    console.log(
      `[EMAIL] OTP → ${normalizedTo} via Brevo (id: ${result.messageId})`
    );
    return { ...result, provider: "brevo" };
  } catch (err) {
    console.error(`[EMAIL] ${err.message}`);

    if (env.nodeEnv === "production") {
      throw err;
    }

    return { delivered: false, error: err.message };
  }
}

module.exports = { sendOtpEmail };
