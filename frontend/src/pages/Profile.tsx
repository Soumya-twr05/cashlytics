import { useState } from "react";

const SECTIONS = [
  { id: "account", label: "Account" },
  { id: "financial", label: "Financial Preferences" },
  { id: "ai", label: "AI Personalization" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy & Data" },
  { id: "security", label: "Security" },
  { id: "sources", label: "Data Sources" },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="relative cursor-pointer shrink-0"
      style={{ width: "36px", height: "20px" }}
      onClick={() => onChange(!value)}
    >
      <div
        className="absolute inset-0 rounded-full transition-colors"
        style={{ background: value ? "var(--primary)" : "var(--border)" }}
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
    </div>
  );
}

export default function Profile() {
  const [section, setSection] = useState("account");
  const [prefs, setPrefs] = useState({
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
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Avatar */}
          <div
            className="p-4 rounded-sm border mb-4 text-center"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div
              className="mx-auto mb-3 flex items-center justify-center rounded-full text-xl font-bold"
              style={{ width: "56px", height: "56px", background: "rgba(16,185,129,0.15)", color: "var(--primary)" }}
            >
              A
            </div>
            <div className="font-semibold text-sm">Arjun Sharma</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>arjun@example.com</div>
            <div
              className="text-xs mt-2 px-2 py-0.5 rounded-full inline-block"
              style={{ background: "rgba(16,185,129,0.1)", color: "var(--primary)", fontSize: "10px" }}
            >
              Pro Plan
            </div>
          </div>

          {/* Nav */}
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className="text-left px-3 py-2 rounded-sm text-xs shrink-0 lg:w-full"
                style={{
                  background: section === s.id ? "rgba(16,185,129,0.08)" : "transparent",
                  color: section === s.id ? "var(--primary)" : "var(--muted-foreground)",
                  border: section === s.id ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 min-w-0">
          {section === "account" && (
            <div className="space-y-4">
              <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="font-semibold text-sm mb-4">Account Information</div>
                <div className="space-y-3">
                  {[
                    { label: "Full Name", value: "Arjun Sharma" },
                    { label: "Email", value: "arjun@example.com" },
                    { label: "Phone", value: "+91 98765 43210" },
                    { label: "Member since", value: "January 2026" },
                  ].map((f) => (
                    <div key={f.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{f.value}</span>
                        <button className="text-xs" style={{ color: "var(--primary)" }}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="font-semibold text-sm mb-4">Export Data</div>
                <div className="flex flex-wrap gap-2">
                  {["Export as CSV", "Export as JSON", "Download PDF Report"].map((btn) => (
                    <button
                      key={btn}
                      className="text-xs px-3 py-2 rounded-sm border"
                      style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--secondary)" }}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="p-5 rounded-sm border"
                style={{ background: "rgba(248,113,113,0.04)", borderColor: "rgba(248,113,113,0.25)" }}
              >
                <div className="font-semibold text-sm mb-2" style={{ color: "var(--expense)" }}>Danger Zone</div>
                <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                  Permanently delete your account and all financial data. This action cannot be undone.
                </p>
                <button
                  className="text-xs px-4 py-2 rounded-sm"
                  style={{ background: "rgba(248,113,113,0.1)", color: "var(--expense)", border: "1px solid rgba(248,113,113,0.3)" }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {section === "financial" && (
            <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="font-semibold text-sm mb-4">Financial Preferences</div>
              <div className="space-y-4">
                {[
                  { label: "Primary Currency", value: "INR (₹)" },
                  { label: "Income range", value: "₹60,000 – ₹1,20,000 / month" },
                  { label: "Savings target", value: "20% of income" },
                  { label: "Fiscal month start", value: "1st of month" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                    <span className="text-sm">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{f.value}</span>
                      <button className="text-xs" style={{ color: "var(--primary)" }}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "ai" && (
            <div className="space-y-4">
              <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="font-semibold text-sm mb-1">AI Personalization</div>
                <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
                  Control how Cashlytics learns from your behavior and how it applies that intelligence.
                </p>
                <div className="space-y-4">
                  {[
                    { key: "aiLearning", label: "Adaptive Learning", desc: "Let Cashlytics learn from your category corrections" },
                    { key: "autoCateg", label: "Auto-Categorization", desc: "Automatically categorize new transactions based on learned preferences" },
                    { key: "patternDetection", label: "Behavioral Pattern Detection", desc: "Detect and surface unusual spending patterns" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <div className="text-sm font-medium mb-0.5">{item.label}</div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.desc}</div>
                      </div>
                      <Toggle value={prefs[item.key as keyof typeof prefs] as boolean} onChange={() => toggle(item.key as keyof typeof prefs)} />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-4 rounded-sm border flex items-start gap-3"
                style={{ background: "rgba(129,140,248,0.04)", borderColor: "rgba(129,140,248,0.2)" }}
              >
                <span style={{ color: "var(--ai-color)" }}>✦</span>
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--ai-color)" }}>Model accuracy</div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Your model has learned {6} merchant preferences with {84}% overall categorization accuracy.
                    The more you correct, the better it gets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="font-semibold text-sm mb-4">Notification Preferences</div>
              <div className="space-y-4">
                {[
                  { key: "emailReports", label: "Weekly Email Reports", desc: "A summary of your weekly financial activity" },
                  { key: "anomalyAlerts", label: "Anomaly Alerts", desc: "Notify when unusual spending is detected" },
                  { key: "weeklyInsights", label: "AI Insights Digest", desc: "Weekly behavioral pattern insights" },
                  { key: "budgetWarnings", label: "Budget Warnings", desc: "Alert when approaching or exceeding budget" },
                  { key: "goalUpdates", label: "Goal Milestones", desc: "Celebrate goal progress and milestone completions" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-sm font-medium mb-0.5">{item.label}</div>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.desc}</div>
                    </div>
                    <Toggle value={prefs[item.key as keyof typeof prefs] as boolean} onChange={() => toggle(item.key as keyof typeof prefs)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "privacy" && (
            <div className="space-y-4">
              <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="font-semibold text-sm mb-4">Privacy Controls</div>
                <div className="space-y-4">
                  {[
                    { key: "localProcessing", label: "Local Processing", desc: "Process transaction intelligence on-device whenever possible" },
                    { key: "shareAnonymous", label: "Anonymous Analytics", desc: "Share anonymized usage data to improve Cashlytics" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <div className="text-sm font-medium mb-0.5">{item.label}</div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.desc}</div>
                      </div>
                      <Toggle value={prefs[item.key as keyof typeof prefs] as boolean} onChange={() => toggle(item.key as keyof typeof prefs)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="font-semibold text-sm mb-2">Data Retention</div>
                <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                  Transaction data is retained indefinitely by default. You can request deletion at any time.
                </p>
                <button className="text-xs px-3 py-2 rounded-sm border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  Request data deletion
                </button>
              </div>
            </div>
          )}

          {section === "security" && (
            <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="font-semibold text-sm mb-4">Security Settings</div>
              <div className="space-y-4">
                {[
                  { key: "twoFactor", label: "Two-Factor Authentication", desc: "Require OTP on every login" },
                  { key: "biometric", label: "Biometric Lock", desc: "Use fingerprint/face to unlock the app" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-sm font-medium mb-0.5">{item.label}</div>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.desc}</div>
                    </div>
                    <Toggle value={prefs[item.key as keyof typeof prefs] as boolean} onChange={() => toggle(item.key as keyof typeof prefs)} />
                  </div>
                ))}
                <div className="py-3">
                  <button className="text-xs px-4 py-2 rounded-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--expense)", border: "1px solid rgba(248,113,113,0.3)" }}>
                    Sign out all other devices
                  </button>
                </div>
              </div>
            </div>
          )}

          {section === "sources" && (
            <div className="space-y-4">
              <div className="p-5 rounded-sm border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="font-semibold text-sm mb-4">Connected Data Sources</div>
                <div className="space-y-3">
                  {[
                    { name: "UPI Notifications", status: "Active", count: "142 transactions", color: "var(--primary)" },
                    { name: "SMS Bank Alerts", status: "Active", count: "87 transactions", color: "var(--primary)" },
                    { name: "HDFC Bank Feed", status: "Disconnected", count: "—", color: "var(--muted-foreground)" },
                    { name: "CSV Import", status: "Manual", count: "3 imports", color: "var(--ai-color)" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.count}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-sm"
                          style={{
                            background: `${s.color}14`,
                            color: s.color,
                            fontSize: "10px",
                          }}
                        >
                          {s.status}
                        </span>
                        <button className="text-xs" style={{ color: s.status === "Disconnected" ? "var(--primary)" : "var(--expense)" }}>
                          {s.status === "Disconnected" ? "Connect" : "Disconnect"}
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
