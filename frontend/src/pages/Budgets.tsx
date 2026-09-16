import { useState } from "react";

interface Budget {
  id: string;
  category: string;
  budget: number;
  spent: number;
  color: string;
  velocity: number; // spending per day
  daysLeft: number; // days left in month
  aiNote?: string;
}

const BUDGETS: Budget[] = [
  {
    id: "food",
    category: "Food & Dining",
    budget: 10000,
    spent: 8420,
    color: "#10b981",
    velocity: 560,
    daysLeft: 21,
    aiNote: "At current pace, budget may be exceeded in 2 days.",
  },
  {
    id: "shopping",
    category: "Shopping",
    budget: 4000,
    spent: 6800,
    color: "#f87171",
    velocity: 453,
    daysLeft: 21,
    aiNote: "Budget exceeded by ₹2,800. Consider pausing non-essential purchases.",
  },
  {
    id: "transport",
    category: "Transport",
    budget: 5000,
    spent: 3240,
    color: "#22d3ee",
    velocity: 216,
    daysLeft: 21,
  },
  {
    id: "entertainment",
    category: "Entertainment",
    budget: 3000,
    spent: 1850,
    color: "#f59e0b",
    velocity: 123,
    daysLeft: 21,
  },
  {
    id: "bills",
    category: "Bills & Utilities",
    budget: 5000,
    spent: 4200,
    color: "#818cf8",
    velocity: 280,
    daysLeft: 21,
  },
  {
    id: "health",
    category: "Healthcare",
    budget: 2000,
    spent: 920,
    color: "#34d399",
    velocity: 61,
    daysLeft: 21,
  },
];

function BudgetCard({ budget, onAdjust }: { budget: Budget; onAdjust: () => void }) {
  const pct = Math.round((budget.spent / budget.budget) * 100);
  const exceeded = pct > 100;
  const remaining = budget.budget - budget.spent;
  const daysUntilExhausted = remaining > 0 ? Math.floor(remaining / budget.velocity) : 0;
  const willExceed = !exceeded && daysUntilExhausted < budget.daysLeft;

  const statusColor = exceeded
    ? "var(--expense)"
    : willExceed
    ? "var(--warning)"
    : "var(--primary)";

  return (
    <div
      className="p-5 rounded-sm border"
      style={{
        background: exceeded ? "rgba(248,113,113,0.03)" : "var(--card)",
        borderColor: exceeded ? "rgba(248,113,113,0.3)" : willExceed ? "rgba(245,158,11,0.25)" : "var(--border)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-sm mb-0.5">{budget.category}</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            ₹{budget.budget.toLocaleString("en-IN")} budget · Sep 2026
          </div>
        </div>
        <div className="text-right">
          <div
            className="font-bold tabular-nums text-lg"
            style={{ fontFamily: "var(--font-jetbrains)", color: exceeded ? "var(--expense)" : "var(--foreground)" }}
          >
            ₹{budget.spent.toLocaleString("en-IN")}
          </div>
          <div
            className="text-xs tabular-nums"
            style={{ fontFamily: "var(--font-jetbrains)", color: statusColor, fontSize: "10px" }}
          >
            {pct}% used
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full overflow-hidden mb-3" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: exceeded ? "var(--expense)" : willExceed ? "var(--warning)" : budget.color,
          }}
        />
        {exceeded && (
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(248,113,113,0.5) 4px, rgba(248,113,113,0.5) 8px)" }}
          />
        )}
      </div>

      {/* Velocity + status */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)", fontSize: "9px" }}>REMAINING</div>
          <div
            className="text-xs font-semibold tabular-nums"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: exceeded ? "var(--expense)" : remaining < budget.budget * 0.1 ? "var(--warning)" : "var(--foreground)",
              fontSize: "12px",
            }}
          >
            {exceeded ? `-₹${Math.abs(remaining).toLocaleString("en-IN")}` : `₹${remaining.toLocaleString("en-IN")}`}
          </div>
        </div>
        <div>
          <div className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)", fontSize: "9px" }}>DAILY PACE</div>
          <div
            className="text-xs font-semibold tabular-nums"
            style={{ fontFamily: "var(--font-jetbrains)", color: "var(--foreground)", fontSize: "12px" }}
          >
            ₹{budget.velocity}/day
          </div>
        </div>
        <div>
          <div className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)", fontSize: "9px" }}>
            {exceeded ? "OVERSPENT BY" : willExceed ? "EXHAUSTED IN" : "SAFE FOR"}
          </div>
          <div
            className="text-xs font-semibold tabular-nums"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: statusColor,
              fontSize: "12px",
            }}
          >
            {exceeded
              ? `₹${Math.abs(remaining).toLocaleString("en-IN")}`
              : willExceed
              ? `${daysUntilExhausted} days`
              : `${budget.daysLeft}+ days`}
          </div>
        </div>
      </div>

      {/* AI note */}
      {budget.aiNote && (
        <div
          className="flex items-start gap-2 px-3 py-2 rounded-sm text-xs mb-3"
          style={{
            background: exceeded ? "rgba(248,113,113,0.08)" : "rgba(245,158,11,0.08)",
            color: exceeded ? "var(--expense)" : "var(--warning)",
          }}
        >
          <span className="shrink-0">✦</span>
          <span>{budget.aiNote}</span>
        </div>
      )}

      <button
        onClick={onAdjust}
        className="text-xs px-3 py-1.5 rounded-sm border"
        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }}
      >
        Adjust budget
      </button>
    </div>
  );
}

export default function Budgets() {
  const [budgets, setBudgets] = useState(BUDGETS);
  const [adjusting, setAdjusting] = useState<string | null>(null);

  const totalBudget = budgets.reduce((s, b) => s + b.budget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const exceeded = budgets.filter((b) => b.spent > b.budget);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Budget", value: `₹${totalBudget.toLocaleString("en-IN")}`, color: "var(--foreground)" },
          { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, color: "var(--foreground)" },
          { label: "Remaining", value: `₹${(totalBudget - totalSpent).toLocaleString("en-IN")}`, color: totalBudget > totalSpent ? "var(--primary)" : "var(--expense)" },
          { label: "Categories Exceeded", value: String(exceeded.length), color: exceeded.length > 0 ? "var(--warning)" : "var(--primary)" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-sm border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
            <div
              className="font-bold tabular-nums text-xl"
              style={{ fontFamily: "var(--font-jetbrains)", color: s.color }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* AI recommendation */}
      <div
        className="p-4 rounded-sm border mb-6 flex items-start gap-3"
        style={{ background: "rgba(129,140,248,0.04)", borderColor: "rgba(129,140,248,0.2)" }}
      >
        <span style={{ color: "var(--ai-color)", fontSize: "16px", marginTop: "1px" }}>✦</span>
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: "var(--ai-color)" }}>
            Cashlytics Recommendation
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Your Shopping budget has been exceeded this month. Consider shifting ₹2,800 from your Entertainment surplus to cover it, or reduce your shopping target going forward. Your Transport and Healthcare budgets have healthy headroom.
          </p>
        </div>
      </div>

      {/* Budget grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => (
          <BudgetCard
            key={b.id}
            budget={b}
            onAdjust={() => setAdjusting(b.id)}
          />
        ))}
      </div>

      {/* Adjust modal */}
      {adjusting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setAdjusting(null)}
        >
          <div
            className="p-6 rounded-sm border w-[min(20rem,calc(100vw-2rem))]"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-semibold text-sm mb-4">
              Adjust {budgets.find((b) => b.id === adjusting)?.category} Budget
            </div>
            {(() => {
              const b = budgets.find((bud) => bud.id === adjusting)!;
              return (
                <>
                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>New monthly budget</div>
                    <input
                      type="number"
                      defaultValue={b.budget}
                      className="w-full px-3 py-2 rounded-sm border text-sm"
                      style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none", fontFamily: "var(--font-jetbrains)" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = Number((e.target as HTMLInputElement).value);
                          setBudgets((prev) => prev.map((bu) => bu.id === adjusting ? { ...bu, budget: val } : bu));
                          setAdjusting(null);
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAdjusting(null)}
                      className="flex-1 py-2 text-xs rounded-sm border"
                      style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setAdjusting(null)}
                      className="flex-1 py-2 text-xs rounded-sm font-semibold"
                      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                    >
                      Save
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
