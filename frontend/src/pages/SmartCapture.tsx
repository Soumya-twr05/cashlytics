import { useState } from "react";

const PIPELINE_STAGES = ["Detected", "Understanding", "Categorizing", "Duplicate check", "Ready"];

const TRANSACTIONS = [
  { id: 1, initials: "SW", merchant: "SWIGGY", amount: 450, method: "UPI", source: "Notification", category: "Food & Dining", confidence: 96, stage: 4, time: "2 min ago", confirmed: false },
  { id: 2, initials: "Ol", merchant: "OLA CABS", amount: 280, method: "UPI", source: "SMS", category: "Transport", confidence: 99, stage: 4, time: "15 min ago", confirmed: true },
  { id: 3, initials: "Am", merchant: "AMAZON", amount: 8500, method: "UPI", source: "Notification", category: "Electronics", confidence: 78, stage: 4, time: "1h ago", confirmed: false },
  { id: 4, initials: "Zo", merchant: "ZOMATO", amount: 320, method: "UPI", source: "Notification", category: "Food & Dining", confidence: 94, stage: 3, time: "Processing", confirmed: false },
  { id: 5, initials: "Bl", merchant: "BLINKIT", amount: 175, method: "UPI", source: "SMS", category: "Groceries", confidence: 91, stage: 2, time: "Just now", confirmed: false },
  { id: 6, initials: "Ne", merchant: "NETFLIX", amount: 649, method: "Credit Card", source: "SMS", category: "Entertainment", confidence: 99, stage: 4, time: "3h ago", confirmed: true },
];

const CATEGORIES = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Electronics", "Groceries", "Bills", "Healthcare", "Transfer", "Income"];

export default function SmartCapture() {
  const [txns, setTxns] = useState(TRANSACTIONS);
  const [editingCat, setEditingCat] = useState<number | null>(null);

  const confirm = (id: number) => setTxns((p) => p.map((t) => t.id === id ? { ...t, confirmed: true } : t));
  const ignore = (id: number) => setTxns((p) => p.filter((t) => t.id !== id));
  const changeCategory = (id: number, cat: string) => { setTxns((p) => p.map((t) => t.id === id ? { ...t, category: cat, confidence: 100 } : t)); setEditingCat(null); };

  const pending = txns.filter((t) => !t.confirmed && t.stage === 4);
  const processing = txns.filter((t) => t.stage < 4);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto">
      <div className="mb-7">
        <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--primary)", fontSize: "10px", letterSpacing: "0.12em" }}>SMART CAPTURE / LIVE FEED</div>
        <h1 className="font-bold leading-tight mb-1.5" style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", color: "var(--foreground)", letterSpacing: "-0.02em" }}>Captured today.</h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Transactions detected from all sources, processed in real time.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Detected Today", value: String(txns.length), color: "var(--foreground)" },
          { label: "Processing", value: String(processing.length), color: "#f59e0b" },
          { label: "Pending Review", value: String(pending.length), color: "#06b6d4" },
          { label: "Confirmed", value: String(txns.filter((t) => t.confirmed).length), color: "var(--primary)" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="text-xs mb-2 font-semibold tracking-widest" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>{s.label}</div>
            <div className="font-bold tabular-nums text-3xl" style={{ fontFamily: "var(--font-jetbrains)", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="p-6 rounded-xl border mb-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="text-xs font-semibold tracking-widest mb-4" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}>INTELLIGENCE PIPELINE</div>
        <div className="flex items-center overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center justify-center rounded-full text-xs font-semibold mb-2" style={{ width: "32px", height: "32px", background: i < 4 ? "rgba(13,158,126,0.1)" : "#f0f0ea", border: `1px solid ${i < 4 ? "rgba(13,158,126,0.3)" : "var(--border)"}`, color: i < 4 ? "var(--primary)" : "var(--muted-foreground)", fontFamily: "var(--font-jetbrains)", fontSize: "11px" }}>
                  {i < 4 ? "✓" : "○"}
                </div>
                <span className="text-xs text-center" style={{ color: i < 4 ? "var(--foreground)" : "var(--muted-foreground)", fontSize: "10px" }}>{stage}</span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="h-px flex-none" style={{ width: "40px", background: i < 3 ? "var(--primary)" : "var(--border)", marginBottom: "20px" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Source filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex gap-1.5 flex-1 overflow-x-auto pb-1">
          {["All Sources", "UPI Notification", "SMS", "CSV Import", "Manual"].map((s, i) => (
            <button key={s} className="text-xs px-3 py-1.5 rounded-md shrink-0" style={{ background: i === 0 ? "var(--sidebar)" : "var(--card)", color: i === 0 ? "#fff" : "var(--muted-foreground)", border: `1px solid ${i === 0 ? "var(--sidebar)" : "var(--border)"}` }}>
              {s}
            </button>
          ))}
        </div>
        <button className="text-xs px-4 py-2 rounded-md font-semibold" style={{ background: "var(--primary)", color: "#fff" }}>
          + Manual Entry
        </button>
      </div>

      {/* Transactions */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {txns.map((t, i) => (
          <div
            key={t.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4"
            style={{
              borderBottom: i < txns.length - 1 ? "1px solid var(--border)" : "none",
              background: t.confirmed ? "rgba(13,158,126,0.02)" : t.stage < 4 ? "rgba(245,158,11,0.02)" : "transparent",
            }}
          >
            {/* Initials */}
            <div className="flex items-center justify-center rounded-md shrink-0 text-xs font-semibold" style={{ width: "36px", height: "36px", background: "#f0f0ea", color: "var(--foreground)", fontFamily: "var(--font-jetbrains)", fontSize: "11px" }}>
              {t.initials}
            </div>

            {/* Merchant */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-jetbrains)" }}>{t.merchant}</span>
                {t.confirmed && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(13,158,126,0.1)", color: "var(--primary)", fontSize: "9px" }}>✓ Confirmed</span>}
                {!t.confirmed && t.stage < 4 && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: "9px" }}>◌ Processing</span>}
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <span>{t.method}</span><span>·</span><span>{t.source}</span><span>·</span><span>{t.time}</span>
              </div>
            </div>

            {/* Category */}
            {editingCat === t.id ? (
              <select autoFocus onBlur={() => setEditingCat(null)} onChange={(e) => changeCategory(t.id, e.target.value)} className="text-xs rounded-md border px-2 py-1.5" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none" }} defaultValue={t.category}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            ) : (
              <button onClick={() => !t.confirmed && setEditingCat(t.id)} className="text-xs px-3 py-1.5 rounded-md border" style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)", cursor: t.confirmed ? "default" : "pointer" }}>
                {t.category}{!t.confirmed && <span style={{ color: "var(--muted-foreground)", marginLeft: "4px" }}>✎</span>}
              </button>
            )}

            {/* Confidence */}
            <div className="shrink-0 w-28">
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)", fontSize: "9px" }}>AI Confidence</div>
              <div className="flex items-center gap-2">
                <div className="relative rounded-full overflow-hidden" style={{ width: "60px", height: "4px", background: "#f0f0ea" }}>
                  <div className="h-full rounded-full" style={{ width: `${t.confidence}%`, background: t.confidence >= 90 ? "var(--primary)" : "#f59e0b" }} />
                </div>
                <span className="text-xs tabular-nums" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--muted-foreground)", fontSize: "10px" }}>{t.confidence}%</span>
              </div>
            </div>

            {/* Amount */}
            <div className="font-bold tabular-nums shrink-0 text-right" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--foreground)", fontSize: "15px", minWidth: "80px" }}>
              ₹{t.amount.toLocaleString("en-IN")}
            </div>

            {/* Actions */}
            {!t.confirmed && t.stage === 4 && (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => confirm(t.id)} className="text-xs px-3 py-1.5 rounded-md font-semibold" style={{ background: "rgba(13,158,126,0.1)", color: "var(--primary)", border: "1px solid rgba(13,158,126,0.3)" }}>Confirm</button>
                <button onClick={() => ignore(t.id)} className="text-xs px-3 py-1.5 rounded-md" style={{ background: "var(--background)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>Ignore</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
