import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfilePreferences,
  updateProfileAvatar,
} from "../lib/api";
import { useAuth } from "../lib/auth-context";

const SECTIONS = [
  { id: "account", label: "Account" },
  { id: "financial", label: "Financial Preferences" },
  { id: "ai", label: "AI Personalization" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy & Data" },
  { id: "security", label: "Security" },
  { id: "sources", label: "Data Sources" },
];

type PreferenceState = {
  emailReports: boolean;
  anomalyAlerts: boolean;
  weeklyInsights: boolean;
  budgetWarnings: boolean;
  goalUpdates: boolean;
  aiLearning: boolean;
  autoCateg: boolean;
  patternDetection: boolean;
  localProcessing: boolean;
  shareAnonymous: boolean;
  twoFactor: boolean;
  biometric: boolean;
};

const DEFAULT_PREFS: PreferenceState = {
  emailReports: true,
  anomalyAlerts: true,
  weeklyInsights: true,
  budgetWarnings: true,
  goalUpdates: false,
  aiLearning: true,
  autoCateg: true,
  patternDetection: true,
  localProcessing: true,
  shareAnonymous: false,
  twoFactor: false,
  biometric: true,
};

function Toggle({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={value ? "Disable setting" : "Enable setting"}
      className="relative shrink-0"
      style={{
        width: "36px",
        height: "20px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
      onClick={() => onChange(!value)}
    >
      <div
        className="absolute inset-0 rounded-full transition-colors"
        style={{
          background: value ? "var(--primary)" : "var(--border)",
        }}
      />

      <div
        className="absolute top-1 rounded-full transition-all"
        style={{
          width: "14px",
          height: "14px",
          background: "white",
          left: value ? "18px" : "2px",
        }}
      />
    </button>
  );
}

function formatMemberSince(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(value?: number, currency = "INR") {
  if (value === undefined || value === null) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value.toLocaleString("en-IN")}`;
  }
}

interface ProfileProps {
  onUpdateProfile?: () => void;
}

export default function Profile({ onUpdateProfile }: ProfileProps) {
  const { updateUser } = useAuth();
  const [section, setSection] = useState("account");

  const [loading, setLoading] = useState(true);
  const [savingPreference, setSavingPreference] = useState<string | null>(
    null
  );
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [error, setError] = useState("");

  const [user, setUser] = useState<any>(null);
  const [financialProfile, setFinancialProfile] = useState<any>(null);

  const [prefs, setPrefs] =
    useState<PreferenceState>(DEFAULT_PREFS);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await getProfile();

      const profileData = response?.data;

      if (!profileData) {
        throw new Error("Profile data was not returned by the server.");
      }

      setUser(profileData.user || null);
      if (profileData.user && updateUser) {
        updateUser(profileData.user);
      }
      setFinancialProfile(profileData.profile || null);

      setPrefs({
        ...DEFAULT_PREFS,
        ...(profileData.user?.preferences || {}),
      });
    } catch (err: any) {
      console.error("Failed to load profile:", err);

      setError(
        err?.message ||
          "Unable to load your profile. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePreferenceToggle(
    key: keyof PreferenceState
  ) {
    const newValue = !prefs[key];

    // Optimistic UI update
    setPrefs((current) => ({
      ...current,
      [key]: newValue,
    }));

    try {
      setSavingPreference(key);

      const response = await updateProfilePreferences({
        [key]: newValue,
      });

      const savedPreferences = (response?.data as any)?.preferences;

      if (savedPreferences) {
        setPrefs((current) => ({
          ...current,
          ...savedPreferences,
        }));

        setUser((current: any) =>
          current
            ? {
                ...current,
                preferences: savedPreferences,
              }
            : current
        );
      }
    } catch (err: any) {
      console.error("Failed to save preference:", err);

      // Roll back if API fails
      setPrefs((current) => ({
        ...current,
        [key]: !newValue,
      }));

      setError(
        err?.message ||
          "Unable to save this preference."
      );
    } finally {
      setSavingPreference(null);
    }
  }

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be smaller than 2 MB.");
      return;
    }

    try {
      setError("");
      setAvatarUploading(true);

      const response = await updateProfileAvatar(file);

      const updatedUser = (response?.data as any)?.user;

      if (updatedUser) {
        setUser((current: any) => ({
          ...current,
          ...updatedUser,
        }));
        if (updateUser) {
          updateUser(updatedUser);
        }
      }
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);

      setError(
        err?.message ||
          "Unable to update your profile photo."
      );
    } finally {
      setAvatarUploading(false);

      // Allow selecting the same image again
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div
          className="p-8 rounded-sm border text-center"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Loading your profile...
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Cashlytics User";

  const email = user?.email || "—";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("");

  const currency = financialProfile?.currency || "INR";

  const monthlyIncome = financialProfile?.monthlyIncome;

  const monthlyExpenses =
    financialProfile?.averageMonthlyExpenses;

  const desiredSavings =
    financialProfile?.desiredMonthlySavings;

  const savingsPercentage =
    monthlyIncome > 0 && desiredSavings >= 0
      ? Math.round((desiredSavings / monthlyIncome) * 100)
      : null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {error && (
        <div
          className="mb-4 p-3 rounded-sm border text-xs"
          style={{
            background: "rgba(248,113,113,0.06)",
            borderColor: "rgba(248,113,113,0.25)",
            color: "var(--expense)",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile summary */}
          <div
            className="p-4 rounded-sm border mb-4 text-center"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="relative mx-auto mb-3" style={{ width: "56px" }}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="rounded-full object-cover"
                  style={{
                    width: "56px",
                    height: "56px",
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full text-xl font-bold"
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "rgba(16,185,129,0.15)",
                    color: "var(--primary)",
                  }}
                >
                  {initials || "U"}
                </div>
              )}

              <label
                className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border cursor-pointer"
                style={{
                  width: "20px",
                  height: "20px",
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  fontSize: "10px",
                }}
                title="Change profile photo"
              >
                {avatarUploading ? "…" : "✎"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
              </label>
            </div>

            <div className="font-semibold text-sm">
              {displayName}
            </div>

            <div
              className="text-xs mt-0.5"
              style={{
                color: "var(--muted-foreground)",
              }}
            >
              {email}
            </div>

            <div
              className="text-xs mt-2 px-2 py-0.5 rounded-full inline-block"
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "var(--primary)",
                fontSize: "10px",
              }}
            >
              {user?.plan || "Free"} Plan
            </div>
          </div>

          {/* Navigation */}
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className="text-left px-3 py-2 rounded-sm text-xs shrink-0 lg:w-full"
                style={{
                  background:
                    section === s.id
                      ? "rgba(16,185,129,0.08)"
                      : "transparent",
                  color:
                    section === s.id
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                  border:
                    section === s.id
                      ? "1px solid rgba(16,185,129,0.2)"
                      : "1px solid transparent",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 min-w-0">
          {/* ACCOUNT */}
          {section === "account" && (
            <div className="space-y-4">
              <div
                className="p-5 rounded-sm border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="font-semibold text-sm mb-4">
                  Account Information
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Full Name",
                      value: displayName,
                    },
                    {
                      label: "Email",
                      value: email,
                    },
                    {
                      label: "Phone",
                      value: "Not added",
                    },
                    {
                      label: "Member since",
                      value: formatMemberSince(user?.createdAt),
                    },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b last:border-b-0"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <span
                        className="text-xs"
                        style={{
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {field.label}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {field.value}
                        </span>

                        {field.label === "Phone" ? (
                          <span
                            className="text-xs"
                            style={{
                              color: "var(--muted-foreground)",
                            }}
                          >
                            Not available
                          </span>
                        ) : (
                          <span
                            className="text-xs"
                            style={{
                              color: "var(--muted-foreground)",
                            }}
                          >
                            Read-only
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Financial Profile */}
              {onUpdateProfile && (
                <div
                  className="p-5 rounded-sm border"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="font-semibold text-sm mb-1">
                    Financial Profile
                  </div>

                  <p
                    className="text-xs mb-4"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Update your income range, savings goals, and spending priorities to keep Cashlytics AI personalised.
                  </p>

                  <button
                    type="button"
                    onClick={onUpdateProfile}
                    className="text-xs px-4 py-2 rounded-sm font-semibold transition-opacity"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Update Profile →
                  </button>
                </div>
              )}

              {/* Export */}
              <div
                className="p-5 rounded-sm border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="font-semibold text-sm mb-4">
                  Export Data
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Export as CSV",
                    "Export as JSON",
                    "Download PDF Report",
                  ].map((button) => (
                    <button
                      key={button}
                      className="text-xs px-3 py-2 rounded-sm border"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--muted-foreground)",
                        background: "var(--secondary)",
                      }}
                    >
                      {button}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div
                className="p-5 rounded-sm border"
                style={{
                  background: "rgba(248,113,113,0.04)",
                  borderColor: "rgba(248,113,113,0.25)",
                }}
              >
                <div
                  className="font-semibold text-sm mb-2"
                  style={{ color: "var(--expense)" }}
                >
                  Danger Zone
                </div>

                <p
                  className="text-xs mb-3"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  Permanently delete your account and all
                  financial data. This action cannot be undone.
                </p>

                <button
                  className="text-xs px-4 py-2 rounded-sm"
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    color: "var(--expense)",
                    border:
                      "1px solid rgba(248,113,113,0.3)",
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* FINANCIAL */}
          {section === "financial" && (
            <div
              className="p-5 rounded-sm border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="font-semibold text-sm mb-4">
                Financial Preferences
              </div>

              {!financialProfile ? (
                <div
                  className="text-xs p-3 rounded-sm"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Your financial profile has not been completed yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    {
                      label: "Primary Currency",
                      value:
                        currency === "INR"
                          ? "INR (₹)"
                          : currency,
                    },
                    {
                      label: "Monthly Income",
                      value: formatCurrency(
                        monthlyIncome,
                        currency
                      ),
                    },
                    {
                      label: "Average Monthly Expenses",
                      value: formatCurrency(
                        monthlyExpenses,
                        currency
                      ),
                    },
                    {
                      label: "Desired Monthly Savings",
                      value: formatCurrency(
                        desiredSavings,
                        currency
                      ),
                    },
                    {
                      label: "Savings Target",
                      value:
                        savingsPercentage !== null
                          ? `${savingsPercentage}% of income`
                          : "—",
                    },
                    {
                      label: "Spending Style",
                      value:
                        financialProfile.spendingStyle
                          ? financialProfile.spendingStyle
                              .charAt(0)
                              .toUpperCase() +
                            financialProfile.spendingStyle.slice(1)
                          : "—",
                    },
                    {
                      label: "Fiscal Month Start",
                      value: `${financialProfile.fiscalMonthStart || 1
                        }st of month`,
                    },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <span className="text-sm">
                        {field.label}
                      </span>

                      <span
                        className="text-sm"
                        style={{
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI */}
          {section === "ai" && (
            <div className="space-y-4">
              <div
                className="p-5 rounded-sm border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="font-semibold text-sm mb-1">
                  AI Personalization
                </div>

                <p
                  className="text-xs mb-4"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  Control how Cashlytics learns from your
                  behavior and how it applies that intelligence.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      key: "aiLearning",
                      label: "Adaptive Learning",
                      desc: "Let Cashlytics learn from your category corrections",
                    },
                    {
                      key: "autoCateg",
                      label: "Auto-Categorization",
                      desc: "Automatically categorize new transactions based on learned preferences",
                    },
                    {
                      key: "patternDetection",
                      label: "Behavioral Pattern Detection",
                      desc: "Detect and surface unusual spending patterns",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium mb-0.5">
                          {item.label}
                        </div>

                        <div
                          className="text-xs"
                          style={{
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>

                      <Toggle
                        value={
                          prefs[
                            item.key as keyof PreferenceState
                          ]
                        }
                        disabled={
                          savingPreference === item.key
                        }
                        onChange={() =>
                          handlePreferenceToggle(
                            item.key as keyof PreferenceState
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-4 rounded-sm border flex items-start gap-3"
                style={{
                  background: "rgba(129,140,248,0.04)",
                  borderColor: "rgba(129,140,248,0.2)",
                }}
              >
                <span style={{ color: "var(--ai-color)" }}>
                  ✦
                </span>

                <div>
                  <div
                    className="text-xs font-semibold mb-1"
                    style={{ color: "var(--ai-color)" }}
                  >
                    Model accuracy
                  </div>

                  <p
                    className="text-xs"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Cashlytics uses your category corrections
                    and merchant preferences to improve future
                    categorization. More corrections provide
                    more personalization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {section === "notifications" && (
            <div
              className="p-5 rounded-sm border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="font-semibold text-sm mb-4">
                Notification Preferences
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "emailReports",
                    label: "Weekly Email Reports",
                    desc: "A summary of your weekly financial activity",
                  },
                  {
                    key: "anomalyAlerts",
                    label: "Anomaly Alerts",
                    desc: "Notify when unusual spending is detected",
                  },
                  {
                    key: "weeklyInsights",
                    label: "AI Insights Digest",
                    desc: "Weekly behavioral pattern insights",
                  },
                  {
                    key: "budgetWarnings",
                    label: "Budget Warnings",
                    desc: "Alert when approaching or exceeding budget",
                  },
                  {
                    key: "goalUpdates",
                    label: "Goal Milestones",
                    desc: "Celebrate goal progress and milestone completions",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <div>
                      <div className="text-sm font-medium mb-0.5">
                        {item.label}
                      </div>

                      <div
                        className="text-xs"
                        style={{
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>

                    <Toggle
                      value={
                        prefs[
                          item.key as keyof PreferenceState
                        ]
                      }
                      disabled={
                        savingPreference === item.key
                      }
                      onChange={() =>
                        handlePreferenceToggle(
                          item.key as keyof PreferenceState
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {section === "privacy" && (
            <div className="space-y-4">
              <div
                className="p-5 rounded-sm border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="font-semibold text-sm mb-4">
                  Privacy Controls
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: "localProcessing",
                      label: "Local Processing",
                      desc: "Process transaction intelligence on-device whenever possible",
                    },
                    {
                      key: "shareAnonymous",
                      label: "Anonymous Analytics",
                      desc: "Share anonymized usage data to improve Cashlytics",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium mb-0.5">
                          {item.label}
                        </div>

                        <div
                          className="text-xs"
                          style={{
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>

                      <Toggle
                        value={
                          prefs[
                            item.key as keyof PreferenceState
                          ]
                        }
                        disabled={
                          savingPreference === item.key
                        }
                        onChange={() =>
                          handlePreferenceToggle(
                            item.key as keyof PreferenceState
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-5 rounded-sm border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="font-semibold text-sm mb-2">
                  Data Retention
                </div>

                <p
                  className="text-xs mb-3"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  Transaction data is retained indefinitely by
                  default. You can request deletion at any time.
                </p>

                <button
                  className="text-xs px-3 py-2 rounded-sm border"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Request data deletion
                </button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {section === "security" && (
            <div
              className="p-5 rounded-sm border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="font-semibold text-sm mb-4">
                Security Settings
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "twoFactor",
                    label: "Two-Factor Authentication",
                    desc: "Require OTP on every login",
                  },
                  {
                    key: "biometric",
                    label: "Biometric Lock",
                    desc: "Use fingerprint/face to unlock the app",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <div>
                      <div className="text-sm font-medium mb-0.5">
                        {item.label}
                      </div>

                      <div
                        className="text-xs"
                        style={{
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>

                    <Toggle
                      value={
                        prefs[
                          item.key as keyof PreferenceState
                        ]
                      }
                      disabled={
                        savingPreference === item.key
                      }
                      onChange={() =>
                        handlePreferenceToggle(
                          item.key as keyof PreferenceState
                        )
                      }
                    />
                  </div>
                ))}

                <div className="py-3">
                  <button
                    className="text-xs px-4 py-2 rounded-sm"
                    style={{
                      background: "rgba(248,113,113,0.1)",
                      color: "var(--expense)",
                      border:
                        "1px solid rgba(248,113,113,0.3)",
                    }}
                  >
                    Sign out all other devices
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DATA SOURCES */}
          {section === "sources" && (
            <div className="space-y-4">
              <div
                className="p-5 rounded-sm border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="font-semibold text-sm mb-4">
                  Connected Data Sources
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "UPI Notifications",
                      status: "Active",
                      count: "—",
                      color: "var(--primary)",
                    },
                    {
                      name: "SMS Bank Alerts",
                      status: "Active",
                      count: "—",
                      color: "var(--primary)",
                    },
                    {
                      name: "HDFC Bank Feed",
                      status: "Disconnected",
                      count: "—",
                      color: "var(--muted-foreground)",
                    },
                    {
                      name: "CSV Import",
                      status: "Manual",
                      count: "—",
                      color: "var(--ai-color)",
                    },
                  ].map((source) => (
                    <div
                      key={source.name}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {source.name}
                        </div>

                        <div
                          className="text-xs mt-0.5"
                          style={{
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {source.count}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-sm"
                          style={{
                            background: `${source.color}14`,
                            color: source.color,
                            fontSize: "10px",
                          }}
                        >
                          {source.status}
                        </span>

                        <button
                          className="text-xs"
                          style={{
                            color:
                              source.status === "Disconnected"
                                ? "var(--primary)"
                                : "var(--expense)",
                          }}
                        >
                          {source.status === "Disconnected"
                            ? "Connect"
                            : "Disconnect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}