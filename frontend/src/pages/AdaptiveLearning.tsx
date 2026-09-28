import { useState, useEffect } from "react";
import * as api from "../lib/api";

interface LearningEntry {
  id: number;
  merchant: string;
  aiPrediction: string;
  userCorrection: string | null;
  learnedCategory: string;
  futureConfidence: number;
  transactionCount: number;
  lastSeen: string;
  status: "learned" | "predicting" | "pending";
}


// Animated flow diagram for a single learning entry
function LearningFlow({ entry }: { entry: LearningEntry }) {
  const [step, setStep] = useState(0);

  const steps = [
    { label: "Transaction", value: entry.merchant, color: "var(--muted-foreground)" },
    { label: "AI Prediction", value: entry.aiPrediction, color: "var(--ai-color)" },
    ...(entry.userCorrection
      ? [{ label: "User Correction", value: entry.userCorrection, color: "var(--warning)" }]
      : []),
    { label: "Preference Learned", value: "✓ Stored", color: "var(--primary)" },
    { label: "Future Prediction", value: `${entry.learnedCategory} — ${entry.futureConfidence}%`, color: "var(--forecast)" },
  ];

  return (
    <div
      className="p-6 rounded-sm border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "var(--font-jetbrains)", letterSpacing: "-0.02em" }}>
            {entry.merchant}
          </h3>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {entry.transactionCount} transactions · Last seen {entry.lastSeen}
          </div>
        </div>
        <div>
          {entry.status === "learned" && (
            <span
              className="text-xs px-2 py-1 rounded-sm font-semibold"
              style={{ background: "rgba(16,185,129,0.1)", color: "var(--primary)", border: "1px solid rgba(16,185,129,0.25)" }}
            >
              ✓ Preference Learned
            </span>
          )}
          {entry.status === "predicting" && (
            <span
              className="text-xs px-2 py-1 rounded-sm font-semibold"
              style={{ background: "rgba(34,211,238,0.1)", color: "var(--forecast)", border: "1px solid rgba(34,211,238,0.25)" }}
            >
              ◎ Predicting
            </span>
          )}
          {entry.status === "pending" && (
            <span
              className="text-xs px-2 py-1 rounded-sm font-semibold"
              style={{ background: "rgba(245,158,11,0.1)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              ◌ Needs correction
            </span>
          )}
        </div>
      </div>

      {/* Flow visualization */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setStep(i)}
            >
              <div
                className="px-3 py-2 rounded-sm border mb-1 text-center"
                style={{
                  minWidth: "100px",
                  background: step >= i ? `${s.color}12` : "var(--secondary)",
                  borderColor: step >= i ? `${s.color}40` : "var(--border)",
                  transition: "all 0.3s",
                }}
              >
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.08em" }}
                >
                  {s.label.toUpperCase()}
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{
                    color: step >= i ? s.color : "var(--muted-foreground)",
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "11px",
                  }}
                >
                  {s.value}
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className="text-xs shrink-0"
                style={{ color: step > i ? "var(--primary)" : "var(--border)" }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Animate button */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => {
            setStep(0);
            let s = 0;
            const interval = setInterval(() => {
              s++;
              setStep(s);
              if (s >= steps.length - 1) clearInterval(interval);
            }, 600);
          }}
          className="text-xs px-3 py-1.5 rounded-sm"
          style={{ background: "rgba(129,140,248,0.1)", color: "var(--ai-color)", border: "1px solid rgba(129,140,248,0.2)" }}
        >
          ▶ Replay Learning Flow
        </button>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Future transactions: <span style={{ color: "var(--forecast)", fontFamily: "var(--font-jetbrains)" }}>
            {entry.learnedCategory} — {entry.futureConfidence}% confidence
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdaptiveLearning() {
  const [learningData, setLearningData] = useState<LearningEntry[]>([]);
  const [selected, setSelected] = useState<LearningEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLearning() {
      setLoading(true);
      try {
        const res = await api.getLearning() as any;
        const raw: any[] = res?.data?.items || [];
        const mapped: LearningEntry[] = raw.map((item: any, i: number) => ({
          id: i + 1,
          merchant: item.merchant || item.pattern || "Unknown",
          aiPrediction: item.originalCategory || item.aiPrediction || "Other",
          userCorrection: item.correctedCategory || item.userCorrection || null,
          learnedCategory: item.learnedCategory || item.correctedCategory || item.originalCategory || "Other",
          futureConfidence: Math.round((item.confidence || 0.85) * 100),
          transactionCount: item.count || item.transactionCount || 1,
          lastSeen: item.lastSeen || new Date(item.updatedAt || new Date()).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          status: item.userCorrection || item.correctedCategory
            ? "learned"
            : (item.confidence || 0) > 0.9
            ? "predicting"
            : "pending",
        }));
        setLearningData(mapped);
        if (mapped.length > 0) setSelected(mapped[0]);
      } catch (e) {
        console.error("Learning data error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLearning();
  }, []);

  const accuracyRate = learningData.length > 0
    ? Math.round((learningData.filter((e) => e.status === "learned").length / learningData.length) * 100)
    : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header stats */}
      <div
        className="mb-6 p-5 rounded-sm border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base mb-1">How Cashlytics Learns You</h2>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Every correction you make trains the system. The more you interact, the more accurate it becomes.
            </p>
          </div>
          <div
            className="text-xs px-3 py-1.5 rounded-sm font-semibold"
            style={{ background: "rgba(129,140,248,0.1)", color: "var(--ai-color)", border: "1px solid rgba(129,140,248,0.2)" }}
          >
            ✦ Adaptive Model Active
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Merchant Rules Learned", value: String(learningData.filter((e) => e.status === "learned").length), color: "var(--primary)" },
            { label: "Accuracy Rate", value: `${accuracyRate}%`, color: "var(--forecast)" },
            { label: "Merchants Recognized", value: String(learningData.length), color: "var(--ai-color)" },
            { label: "Auto-categorized Today", value: loading ? "..." : `${learningData.filter(e => e.status !== "pending").length}`, color: "var(--primary)" },
          ].map((s) => (
            <div key={s.label}>
              <div
                className="font-bold tabular-nums text-xl mb-0.5"
                style={{ fontFamily: "var(--font-jetbrains)", color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading learning data...</div>
      ) : learningData.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: "var(--muted-foreground)" }}>
          No learning data yet. As you use Cashlytics and recategorize transactions, the model builds your preferences here.
        </div>
      ) : (
      <div className="grid grid-cols-3 gap-4">
        {/* Merchant list */}
        <div
          className="rounded-sm border overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="px-4 py-3 border-b text-xs font-semibold tracking-wide" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.08em" }}>
            MERCHANT PATTERNS
          </div>
          <div>
            {learningData.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-4 py-3 border-b cursor-pointer last:border-b-0"
                style={{
                  borderColor: "var(--border)",
                  background: selected?.id === entry.id ? "rgba(16,185,129,0.06)" : "transparent",
                  borderLeft: selected?.id === entry.id ? "2px solid var(--primary)" : "2px solid transparent",
                }}
                onClick={() => setSelected(entry)}
              >
                <div>
                  <div
                    className="text-sm font-semibold mb-0.5"
                    style={{ fontFamily: "var(--font-jetbrains)", color: "var(--foreground)" }}
                  >
                    {entry.merchant}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>
                    {entry.learnedCategory} · {entry.transactionCount} txns
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {entry.status === "learned" && (
                    <span style={{ color: "var(--primary)", fontSize: "12px" }}>✓</span>
                  )}
                  {entry.status === "pending" && (
                    <span style={{ color: "var(--warning)", fontSize: "12px" }}>!</span>
                  )}
                  <span
                    className="tabular-nums text-xs"
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      color: entry.futureConfidence >= 90 ? "var(--primary)" : "var(--warning)",
                      fontSize: "10px",
                    }}
                  >
                    {entry.futureConfidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow detail */}
        {selected && (
        <div className="col-span-2">
          <LearningFlow entry={selected} />

          {/* Explanation */}
          <div
            className="mt-4 p-5 rounded-sm border"
            style={{ background: "rgba(129,140,248,0.04)", borderColor: "rgba(129,140,248,0.15)" }}
          >
            <div className="flex items-start gap-3">
              <span style={{ color: "var(--ai-color)", fontSize: "16px", marginTop: "2px" }}>✦</span>
              <div>
                <div className="text-sm font-semibold mb-1" style={{ color: "var(--ai-color)" }}>
                  How this preference was learned
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {selected.userCorrection
                    ? `When you changed "${selected.aiPrediction}" to "${selected.userCorrection}" for ${selected.merchant}, Cashlytics stored this as a permanent preference. After ${selected.transactionCount} transactions, it now predicts ${selected.learnedCategory} with ${selected.futureConfidence}% confidence.`
                    : `Cashlytics correctly predicted "${selected.learnedCategory}" for ${selected.merchant} across ${selected.transactionCount} transactions without any manual correction. Confidence: ${selected.futureConfidence}%.`}
                </p>
              </div>
            </div>
          </div>

          {selected.status === "pending" && (
            <div
              className="mt-4 p-5 rounded-sm border"
              style={{ background: "rgba(245,158,11,0.04)", borderColor: "rgba(245,158,11,0.25)" }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: "var(--warning)" }}>
                ▲ Correction needed
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                Cashlytics predicted "{selected.aiPrediction}" but isn't confident about {selected.merchant}.
                Correcting this once will train all future transactions.
              </p>
              <div className="flex gap-2">
                {["Transport", "Food & Dining", "Services", "Shopping"].map((c) => (
                  <button
                    key={c}
                    className="text-xs px-3 py-1.5 rounded-sm border"
                    style={{ borderColor: "rgba(245,158,11,0.3)", color: "var(--warning)", background: "rgba(245,158,11,0.06)" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
      )}
    </div>
  );
}
