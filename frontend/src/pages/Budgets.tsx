import { useState, useEffect } from "react";
import * as api from "../lib/api";

interface Budget {
  id: string;
  _id?: string;
  category: string;
  budget: number;
  spent: number;
  color: string;
  velocity: number;
  daysLeft: number;
  aiNote?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#10b981",
  Food: "#10b981",
  Shopping: "#f87171",
  Transport: "#22d3ee",
  Transportation: "#22d3ee",
  Entertainment: "#f59e0b",
  "Bills & Utilities": "#818cf8",
  Bills: "#818cf8",
  Utilities: "#818cf8",
  Healthcare: "#34d399",
  Lifestyle: "#0d9e7e",
  Education: "#8b5cf6",
  Other: "#6b7280",
};

function daysLeftInMonth() {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.getDate() - now.getDate();
}

function BudgetCard({ budget, onAdjust }: { budget: Budget; onAdjust: () => void }) {
  const pct = Math.round((budget.spent / Math.max(1, budget.budget)) * 100);
  const exceeded = pct > 100;
  const remaining = budget.budget - budget.spent;
  const daysUntilExhausted = remaining > 0 && budget.velocity > 0 ? Math.floor(remaining / budget.velocity) : 0;
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
            ₹{budget.budget.toLocaleString("en-IN")} budget
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
            ₹{Math.round(budget.velocity)}/day
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
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    setError("");
    try {
      const [budgetsRes, txRes] = await Promise.all([
        api.listBudgets() as any,
        api.listTransactions({ limit: 1000 }) as any,
      ]);

      const rawBudgets: any[] = budgetsRes?.data?.items || [];
      const txns: any[] = txRes?.data?.items || [];

      // Compute current-month spending per category from transactions
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysElapsed = Math.max(1, now.getDate());
      const dl = daysLeftInMonth();

      const spentMap: Record<string, number> = {};
      txns.forEach((tx: any) => {
        if (tx.type !== "debit") return;
        const d = new Date(tx.occurredAt || tx.date);
        if (d < monthStart) return;
        const cat = tx.category || "Other";
        spentMap[cat] = (spentMap[cat] || 0) + Number(tx.amount || 0);
      });

      const mapped: Budget[] = rawBudgets.map((b: any) => {
        const cat = b.category || "Other";
        const spent = spentMap[cat] || 0;
        const budget = Number(b.amount || b.budget || 0);
        const velocity = spent / daysElapsed;
        const remaining = budget - spent;
        const daysUntilExhausted = remaining > 0 && velocity > 0 ? Math.floor(remaining / velocity) : 9999;
        const exceeded = spent > budget;
        const willExceed = !exceeded && daysUntilExhausted < dl;

        let aiNote: string | undefined;
        if (exceeded) {
          aiNote = `Budget exceeded by ₹${Math.abs(remaining).toLocaleString("en-IN")}. Consider pausing non-essential purchases.`;
        } else if (willExceed) {
          aiNote = `At current pace, budget may be exceeded in ${daysUntilExhausted} day${daysUntilExhausted !== 1 ? "s" : ""}.`;
        }

        return {
          id: b._id || b.id || cat,
          _id: b._id || b.id,
          category: cat,
          budget,
          spent,
          color: CATEGORY_COLORS[cat] || "#6b7280",
          velocity,
          daysLeft: dl,
          aiNote,
        };
      });

      setBudgets(mapped);
    } catch (e) {
      console.error("Budget load error:", e);
      setError("Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async (budgetId: string) => {
    const b = budgets.find((bud) => bud.id === budgetId);
    if (!b || !b._id) return;

    setSaving(true);
    try {
      await api.updateBudget(b._id, { amount: adjustValue });
      setAdjusting(null);
      await loadBudgets();
    } catch (e) {
      console.error("Update budget error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newCategory || !newAmount) return;
    setSaving(true);
    try {
      await api.createBudget({ category: newCategory, amount: Number(newAmount) });
      setShowAdd(false);
      setNewCategory("");
      setNewAmount("");
      await loadBudgets();
    } catch (e) {
      console.error("Create budget error:", e);
    } finally {
      setSaving(false);
    }
  };

  // Summary
  const totalBudget = budgets.reduce((s, b) => s + b.budget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const exceededBudgets = budgets.filter((b) => b.spent > b.budget);

  // Dynamic AI recommendation based on real data
  const aiRecommendation = (() => {
    if (budgets.length === 0) return "Add your first budget to start tracking spending limits.";
    const overspent = exceededBudgets.map((b) => b.category).join(", ");
    const safe = budgets.filter((b) => b.spent < b.budget * 0.7).map((b) => b.category).join(", ");
    if (overspent) {
      return `Your ${overspent} budget has been exceeded this month.${safe ? ` Your ${safe} budget${safe.includes(",") ? "s" : ""} have healthy headroom.` : ""}`;
    }
    return `Great job! All budgets are on track this month. Keep monitoring your spending pace.`;
  })();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p style={{ color: "var(--muted-foreground)" }}>Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {error && (
        <div className="mb-4 px-4 py-2 rounded-sm text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--expense)", border: "1px solid rgba(248,113,113,0.25)" }}>
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Budget", value: `₹${totalBudget.toLocaleString("en-IN")}`, color: "var(--foreground)" },
          { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, color: "var(--foreground)" },
          { label: "Remaining", value: `₹${(totalBudget - totalSpent).toLocaleString("en-IN")}`, color: totalBudget > totalSpent ? "var(--primary)" : "var(--expense)" },
          { label: "Categories Exceeded", value: String(exceededBudgets.length), color: exceededBudgets.length > 0 ? "var(--warning)" : "var(--primary)" },
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
            {aiRecommendation}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {budgets.length} active budgets
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="text-xs px-4 py-2 rounded-sm font-semibold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          + New Budget
        </button>
      </div>

      {/* Budget grid */}
      {budgets.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: "var(--muted-foreground)" }}>
          No budgets yet. Create your first budget to start tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onAdjust={() => {
                setAdjusting(b.id);
                setAdjustValue(b.budget);
              }}
            />
          ))}
        </div>
      )}

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
            <div className="mb-4">
              <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>New monthly budget (₹)</div>
              <input
                type="number"
                value={adjustValue}
                onChange={(e) => setAdjustValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-sm border text-sm"
                style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none", fontFamily: "var(--font-jetbrains)" }}
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
                onClick={() => handleAdjust(adjusting)}
                disabled={saving}
                className="flex-1 py-2 text-xs rounded-sm font-semibold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Budget modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowAdd(false)}
        >
          <div
            className="p-6 rounded-sm border w-[min(22rem,calc(100vw-2rem))]"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-semibold text-sm mb-4">New Budget</div>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Category</div>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border text-sm"
                  style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none" }}
                >
                  <option value="">Select category...</option>
                  {["Food & Dining", "Shopping", "Transport", "Entertainment", "Bills", "Healthcare", "Education", "Lifestyle", "Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Monthly budget (₹)</div>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 rounded-sm border text-sm"
                  style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none", fontFamily: "var(--font-jetbrains)" }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 text-xs rounded-sm border"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !newCategory || !newAmount}
                className="flex-1 py-2 text-xs rounded-sm font-semibold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", opacity: saving || !newCategory || !newAmount ? 0.6 : 1 }}
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
