import { useState } from "react";
import { requestOtp, saveToken, verifyOtp } from "../lib/api";

interface AuthProps {
  onSignInSuccess: (
    onboardingCompleted?: boolean,
    mode?: "signin" | "signup"
  ) => void;
  onGuestStart: () => void;
}

export default function Auth({
  onSignInSuccess,
  onGuestStart,
}: AuthProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Google authentication will be connected later.
  const handleGoogleAuth = async () => {
    setError("");
    setMessage("");

    setError("Google authentication is not connected yet.");
  };

  // Request OTP
  const handleRequestOtp = async () => {
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (mode === "signup" && !trimmedName) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      await requestOtp(normalizedEmail, mode);

      setOtpSent(true);

      setMessage(
        "OTP sent successfully. Check the backend terminal for the development OTP."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();
    const trimmedName = name.trim();

    if (!trimmedOtp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("OTP must be 6 digits.");
      return;
    }

    if (mode === "signup" && !trimmedName) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      /*
       * For signup:
       *   email + otp + name
       *
       * For signin:
       *   email + otp
       *
       * This prevents an existing user's name from being overwritten.
       */
      const response = await verifyOtp(
        normalizedEmail,
        trimmedOtp,
        mode === "signup" ? trimmedName : undefined,
        mode
      );

      if (!response.data?.token) {
        throw new Error("Authentication token was not returned.");
      }

      // Save JWT token
      saveToken(response.data.token);

      setMessage("Authentication successful.");

      /*
       * Pass both:
       * 1. onboarding status
       * 2. signin/signup mode
       *
       * App.tsx will use the mode to decide:
       * Sign in → Dashboard
       * Sign up → Onboarding
       */
      setTimeout(() => {
        onSignInSuccess(
          response.data?.onboardingCompleted,
          mode
        );
      }, 300);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Go back from OTP screen
  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setMessage("");
  };

  // Switch between Sign In and Sign Up
  const handleModeChange = () => {
    setMode(mode === "signin" ? "signup" : "signin");

    setError("");
    setMessage("");
    setEmail("");
    setName("");
    setOtp("");
    setOtpSent(false);
  };

  return (
    <div
      className="h-full flex items-center justify-center overflow-y-auto"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md px-6 py-12">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div
            className="flex items-center justify-center rounded-sm text-xs font-bold"
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#052e16",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            C
          </div>

          <span className="font-bold text-sm tracking-tight">
            CASHLYTICS
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="font-bold text-2xl mb-2"
            style={{ letterSpacing: "-0.02em" }}
          >
            {mode === "signin"
              ? "Welcome back"
              : "Create account"}
          </h1>

          <p
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            {mode === "signin"
              ? "Sign in to your financial intelligence dashboard"
              : "Join Cashlytics for AI-powered financial insights"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded-sm mb-6 text-sm"
            style={{
              background: "rgba(232, 93, 93, 0.08)",
              borderLeft: "3px solid var(--expense)",
              color: "var(--foreground)",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div
            className="p-3 rounded-sm mb-6 text-sm"
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              borderLeft: "3px solid var(--primary)",
              color: "var(--foreground)",
            }}
          >
            {message}
          </div>
        )}

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border mb-4 font-medium text-sm transition-colors"
          style={{
            borderColor: "var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background =
                "var(--secondary)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background =
                "var(--card)";
            }
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>

          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex-1 h-px"
            style={{ background: "var(--border)" }}
          />

          <span
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Or continue with email
          </span>

          <div
            className="flex-1 h-px"
            style={{ background: "var(--border)" }}
          />
        </div>

        {!otpSent ? (
          <>
            {/* Email Form */}
            <div className="space-y-4 mb-6">

              {/* Name - Signup only */}
              {mode === "signup" && (
                <div>
                  <label
                    className="block text-xs font-medium mb-2"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2.5 rounded-sm border bg-white text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-sm border bg-white text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Send OTP */}
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full py-3 rounded-sm font-semibold text-sm mb-4 transition-opacity flex items-center justify-center gap-2"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">
                    ◌
                  </span>
                  Sending OTP...
                </>
              ) : (
                "Continue with email →"
              )}
            </button>
          </>
        ) : (
          <>
            {/* OTP Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  Enter verification code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="123456"
                  className="w-full px-3 py-3 rounded-sm border bg-white text-center text-lg tracking-[0.4em] font-semibold focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  disabled={loading}
                />

                <p
                  className="text-xs mt-2"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  OTP sent to {email}
                </p>
              </div>
            </div>

            {/* Verify OTP */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 rounded-sm font-semibold text-sm mb-3 transition-opacity flex items-center justify-center gap-2"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">
                    ◌
                  </span>
                  Verifying...
                </>
              ) : (
                "Verify OTP →"
              )}
            </button>

            {/* Back */}
            <button
              type="button"
              onClick={handleBackToEmail}
              disabled={loading}
              className="w-full py-2.5 rounded-sm font-medium text-sm border transition-colors"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
            >
              Use a different email
            </button>
          </>
        )}

        {/* Continue as Guest */}
        {!otpSent && (
          <button
            type="button"
            onClick={onGuestStart}
            disabled={loading}
            className="w-full py-2.5 rounded-sm font-medium text-sm border transition-colors"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  "var(--secondary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  "var(--card)";
              }
            }}
          >
            Continue as guest
          </button>
        )}

        {/* Toggle Mode */}
        {!otpSent && (
          <div
            className="text-center mt-6 text-sm"
            style={{
              color: "var(--muted-foreground)",
            }}
          >
            {mode === "signin"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}

            <button
              type="button"
              onClick={handleModeChange}
              disabled={loading}
              className="font-semibold"
              style={{
                color: "var(--primary)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.7")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              {mode === "signin"
                ? "Sign up"
                : "Sign in"}
            </button>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-8 pt-6 border-t text-xs text-center space-y-2"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
        >
          <p>
            By signing up, you agree to our Terms of Service and
            Privacy Policy.
          </p>

          <p style={{ fontSize: "10px" }}>
            Your financial data is protected by Cashlytics
            authentication and secure API access.
          </p>
        </div>
      </div>
    </div>
  );
}