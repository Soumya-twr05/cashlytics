const { Resend } = require("resend");
const env = require("../config/env");

let resendClient = null;
if (env.resendApiKey) {
  try {
    resendClient = new Resend(env.resendApiKey);
  } catch (err) {
    console.error("Failed to initialize Resend client:", err.message);
  }
}

/**
 * Send an OTP verification code email.
 *
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @returns {Promise<{ delivered: boolean, messageId?: string, simulated?: boolean }>}
 */
async function sendOtpEmail(to, otp) {
  const normalizedTo = to.toLowerCase().trim();

  // In test environment, skip external network call to Resend
  if (env.nodeEnv === "test") {
    return {
      delivered: false,
      simulated: true,
    };
  }

  // If Resend API key is configured, send the real email
  if (env.resendApiKey && resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: env.emailFrom || "Cashlytics <onboarding@resend.dev>",
        to: normalizedTo,
        subject: "Your Cashlytics verification code",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="margin-bottom: 24px; text-align: center;">
              <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">CASHLYTICS</h2>
              <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Adaptive Financial Intelligence</p>
            </div>
            
            <p style="color: #374151; font-size: 15px; line-height: 1.5; margin: 0 0 20px;">
              Hello,
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.5; margin: 0 0 24px;">
              Use the following 6-digit one-time password to verify your account. This code is valid for <strong>10 minutes</strong> and can only be used once:
            </p>
            
            <div style="background: #f3f4f6; border-radius: 6px; padding: 18px; text-align: center; margin: 0 0 24px;">
              <span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827;">
                ${otp}
              </span>
            </div>
            
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
              If you did not request this verification code, please ignore this email or review your account security.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px;" />
            <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">
              &copy; ${new Date().getFullYear()} Cashlytics. All rights reserved.
            </p>
          </div>
        `,
      });

      if (response.error) {
        console.error("Resend delivery returned error:", response.error.message || response.error);
        if (env.nodeEnv === "production") {
          const err = new Error("Failed to deliver verification email. Please try again later.");
          err.status = 502;
          throw err;
        }
        return {
          delivered: false,
          error: response.error.message || response.error,
        };
      }

      return {
        delivered: true,
        messageId: response.data?.id,
      };
    } catch (err) {
      if (err.status) throw err;
      console.error("Email delivery network failure:", err.message);
      if (env.nodeEnv === "production") {
        const error = new Error("Email delivery service failed. Please check configuration.");
        error.status = 502;
        throw error;
      }
      return {
        delivered: false,
        error: err.message,
      };
    }
  }

  // If Resend API key is NOT configured
  if (env.nodeEnv === "production") {
    const err = new Error("Email delivery provider is not configured. Please contact support.");
    err.status = 503;
    throw err;
  }

  // Development simulation: Safe dev logging without exposing secrets
  console.log(`[AUTH-DEV] OTP generated for ${normalizedTo} (simulated delivery, Resend not configured)`);

  return {
    delivered: false,
    simulated: true,
  };
}

module.exports = {
  sendOtpEmail,
};
