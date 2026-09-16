import { useState, useEffect } from "react";

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const FEATURES = [
  { icon: "◎", color: "#0d9e7e", title: "Transaction Intelligence", desc: "Every transaction is automatically understood, categorized, and cross-referenced against your behavioral baseline." },
  { icon: "⟳", color: "#818cf8", title: "Adaptive Learning", desc: "Cashlytics learns your spending patterns. Corrections made once become permanent preferences across all future transactions." },
  { icon: "⊗", color: "#06b6d4", title: "Predictive Forecasting", desc: "Forward-looking financial projections built from your real spending velocity, not static templates." },
  { icon: "▲", color: "#f59e0b", title: "Anomaly Detection", desc: "Unusual spending is surfaced in real time before it becomes a problem — with context, not just alerts." },
  { icon: "✦", color: "#818cf8", title: "AI Financial Guidance", desc: "Ask natural-language questions about your finances and receive answers backed by your actual data." },
  { icon: "⊞", color: "#0d9e7e", title: "Smart Budgets", desc: "Budgets that forecast their own exhaustion date and warn you before you overspend — not after." },
];

const STATS = [
  { value: "97%", label: "Categorization accuracy" },
  { value: "< 2s", label: "Processing time per transaction" },
  { value: "₹0", label: "Manual entry required" },
  { value: "100%", label: "Local data processing" },
];

function IntelligenceViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const nodes = [
    { x: 50, y: 50, label: "CAPTURE", color: "#0d9e7e", size: 10 },
    { x: 82, y: 30, label: "SMS", color: "#6b7280", size: 6 },
    { x: 82, y: 50, label: "UPI", color: "#6b7280", size: 6 },
    { x: 82, y: 70, label: "CSV", color: "#6b7280", size: 6 },
    { x: 20, y: 30, label: "UNDERSTAND", color: "#818cf8", size: 8 },
    { x: 20, y: 70, label: "DETECT", color: "#f59e0b", size: 8 },
    { x: 50, y: 15, label: "LEARN", color: "#818cf8", size: 8 },
    { x: 50, y: 85, label: "PREDICT", color: "#06b6d4", size: 8 },
  ];
  const active = tick % nodes.length;

  return (
    <div className="relative rounded-xl border overflow-hidden" style={{ background: "#f8f8f4", borderColor: "var(--border)", aspectRatio: "16/9", maxHeight: "300px" }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ padding: "4px" }}>
        {[
          [50, 50, 82, 30], [50, 50, 82, 50], [50, 50, 82, 70],
          [50, 50, 20, 30], [50, 50, 20, 70], [50, 50, 50, 15], [50, 50, 50, 85],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.08)" strokeWidth="0.4" />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.size} fill={i === active ? n.color : "transparent"} stroke={n.color} strokeWidth="0.4" opacity={i === active ? 1 : 0.4} />
            <text x={n.x} y={n.y + n.size + 3} textAnchor="middle" fontSize="2.5" fill={n.color} opacity={i === active ? 1 : 0.4} fontFamily="JetBrains Mono">{n.label}</text>
            {i === active && (
              <circle cx={n.x} cy={n.y} r={n.size} fill="none" stroke={n.color} strokeWidth="0.3" opacity="0.4">
                <animate attributeName="r" from={n.size} to={n.size * 3} dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 left-3 text-xs" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--primary)", fontSize: "10px" }}>
        ● PROCESSING — {7 + (tick % 5)} transactions today
      </div>
    </div>
  );
}

export default function Landing({ onGetStarted, onSignIn }: LandingProps) {
  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 sm:px-8"
        style={{ minHeight: "56px", background: "var(--sidebar)", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded shrink-0" style={{ width: "30px", height: "30px", background: "rgba(13,158,126,0.25)", border: "1px solid rgba(13,158,126,0.4)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0d9e7e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight" style={{ color: "#fff" }}>CASHLYTICS</div>
            <div className="text-xs" style={{ color: "rgba(200,221,210,0.5)", fontSize: "8px", letterSpacing: "0.1em" }}>ADAPTIVE FINANCE</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-sm rounded-md px-3 py-2 transition-colors"
            style={{ color: "rgba(200,221,210,0.75)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(200,221,210,0.75)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Sign in
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm font-semibold px-4 py-2 rounded-md transition-opacity hover:opacity-90"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            Get started
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero */}
        <div className="mb-20">
          <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-widest uppercase" style={{ background: "rgba(13,158,126,0.1)", color: "var(--primary)", border: "1px solid rgba(13,158,126,0.2)", fontSize: "10px" }}>
            AI-Powered Financial Intelligence
          </div>
          <h1 className="font-bold mb-6 leading-tight" style={{ fontSize: "clamp(36px, 6vw, 68px)", letterSpacing: "-0.03em", maxWidth: "700px", color: "var(--foreground)" }}>
            Your money should not need manual tracking.
          </h1>
          <p className="mb-10 max-w-xl leading-relaxed text-base" style={{ color: "var(--muted-foreground)" }}>
            Cashlytics understands your financial activity, learns your behavior, and helps you make better financial decisions — automatically.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={onGetStarted} className="font-semibold px-6 py-3 rounded-md text-sm" style={{ background: "var(--sidebar)", color: "#fff" }}>
              Start for free →
            </button>
            <button onClick={onSignIn} className="font-medium px-6 py-3 rounded-md text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--card)" }}>
              View demo
            </button>
          </div>
        </div>

        {/* Intelligence viz */}
        <div className="mb-16 sm:mb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <h2 className="font-bold text-2xl mb-4 leading-tight" style={{ letterSpacing: "-0.02em" }}>Actively analyzing, not just recording.</h2>
            <p className="mb-6 leading-relaxed text-sm" style={{ color: "var(--muted-foreground)" }}>
              Traditional apps wait for you to categorize transactions. Cashlytics understands them the moment they arrive — using behavioral patterns, merchant intelligence, and machine learning.
            </p>
            {["97% categorization accuracy out-of-the-box", "Learns your corrections permanently", "Detects anomalies before they become problems"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                <span style={{ color: "var(--primary)" }}>✓</span>{t}
              </div>
            ))}
          </div>
          <IntelligenceViz />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-16 sm:mb-20 rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-6" style={{ background: "var(--card)" }}>
              <div className="font-bold mb-1 tabular-nums" style={{ fontSize: "28px", fontFamily: "var(--font-jetbrains)", color: "var(--primary)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="font-bold text-2xl mb-8" style={{ letterSpacing: "-0.02em" }}>Built for financial intelligence, not expense logging.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-5 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-xl mb-3" style={{ color: f.color }}>{f.icon}</div>
                <div className="font-semibold text-sm mb-2">{f.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="text-center py-16 rounded-xl"
          style={{ background: "var(--sidebar)" }}
        >
          <h2 className="font-bold text-2xl sm:text-3xl mb-4 px-4" style={{ letterSpacing: "-0.02em", color: "#fff" }}>Stop tracking. Start understanding.</h2>
          <p className="mb-8 text-sm" style={{ color: "rgba(200,221,210,0.6)" }}>Join users who let Cashlytics do the thinking.</p>
          <button onClick={onGetStarted} className="font-semibold px-8 py-3 rounded-md text-sm" style={{ background: "var(--primary)", color: "#fff" }}>
            Get started — it's free →
          </button>
        </div>
      </div>

      <footer className="border-t px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        <span>© 2026 Cashlytics. All rights reserved.</span>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Security"].map((t) => <span key={t} className="cursor-pointer hover:opacity-70">{t}</span>)}
        </div>
      </footer>
    </div>
  );
}
