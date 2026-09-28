import { useState, useEffect } from "react";
import * as api from "../lib/api";

interface Goal {
  id: string;
  _id?: string;
  name: string;
  icon: string;
  target: number;
  current: number;
  monthly: number;
  color: string;
  deadline?: string;
}

const GOAL_COLORS = ["#10b981", "#818cf8", "#22d3ee", "#f59e0b", "#f87171", "#34d399", "#8b5cf6"];
const GOAL_ICONS = ["▣", "⊞", "◑", "∿", "◈", "⬡", "◎"];

function GoalCard({ goal, onUpdated }: { goal: Goal; onUpdated: () => void }) {
  const [monthly, setMonthly] = useState(goal.monthly);
  const [saving, setSaving] = useState(false);

  const pct = Math.min(100, Math.round((goal.current / Math.max(1, goal.target)) * 100));
  const remaining = Math.max(0, goal.target - goal.current);
  const monthsLeft = monthly > 0 ? Math.ceil(remaining / monthly) : 999;
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsLeft);
  const completionStr = monthsLeft < 999
    ? completionDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";

  const handleMonthlyChange = async (val: number) => {
    setMonthly(val);
    if (!goal._id) return;
    setSaving(true);
    try {
      await api.updateGoal(goal._id, { monthly: val });
      onUpdated();
    } catch (e) {
      console.error("Update goal error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="p-5 rounded-sm border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex items-center justify-center rounded-sm shrink-0"
          style={{ width: "36px", height: "36px", background: `${goal.color}18`, color: goal.color, fontSize: "16px" }}
        >
          {goal.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-0.5">{goal.name}</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Target: ₹{goal.target.toLocaleString("en-IN")}
          </div>
        </div>
        <div
          className="font-bold tabular-nums"
          style={{ fontFamily: "var(--font-jetbrains)", color: goal.color, fontSize: "18px" }}
        >
          {pct}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full overflow-hidden mb-3" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: goal.color }}
        />
      </div>

      <div className="flex items-center justify-between mb-4 text-xs">
        <div>
          <span
            className="font-semibold tabular-nums"
            style={{ fontFamily: "var(--font-jetbrains)", color: "var(--foreground)" }}
          >
            ₹{goal.current.toLocaleString("en-IN")}
          </span>
          <span style={{ color: "var(--muted-foreground)" }}> saved</span>
        </div>
        <div style={{ color: "var(--muted-foreground)" }}>
          ₹{remaining.toLocaleString("en-IN")} to go
        </div>
      </div>

      {/* Monthly contribution slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Monthly contribution</span>
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ fontFamily: "var(--font-jetbrains)", color: goal.color }}
          >
            ₹{monthly.toLocaleString("en-IN")}
            {saving && <span className="ml-1 text-xs" style={{ color: "var(--muted-foreground)" }}>•</span>}
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={50000}
          step={500}
          value={monthly}
          onChange={(e) => handleMonthlyChange(Number(e.target.value))}
          className="w-full"
          style={{
            height: "4px",
            appearance: "none",
            background: `linear-gradient(to right, ${goal.color} 0%, ${goal.color} ${((monthly - 500) / 49500) * 100}%, var(--border) ${((monthly - 500) / 49500) * 100}%, var(--border) 100%)`,
            borderRadius: "2px",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Completion prediction */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-sm text-xs"
        style={{ background: `${goal.color}0d`, border: `1px solid ${goal.color}25` }}
      >
        <span style={{ color: "var(--muted-foreground)" }}>Estimated completion</span>
        <span className="font-semibold" style={{ color: goal.color, fontFamily: "var(--font-jetbrains)" }}>
          {completionStr}
        </span>
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newCurrent, setNewCurrent] = useState("");
  const [newMonthly, setNewMonthly] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.listGoals() as any;
      const raw: any[] = res?.data?.items || [];
      const mapped: Goal[] = raw.map((g: any, i: number) => ({
        id: g._id || g.id || String(i),
        _id: g._id || g.id,
        name: g.name || "Goal",
        icon: g.icon || GOAL_ICONS[i % GOAL_ICONS.length],
        target: Number(g.target || 0),
        current: Number(g.current || g.saved || 0),
        monthly: Number(g.monthly || g.monthlyContribution || 0),
        color: g.color || GOAL_COLORS[i % GOAL_COLORS.length],
        deadline: g.deadline,
      }));
      setGoals(mapped);
    } catch (e) {
      console.error("Goals load error:", e);
      setError("Failed to load goals.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName || !newTarget) return;
    setSaving(true);
    try {
      await api.createGoal({
        name: newName,
        target: Number(newTarget),
        current: Number(newCurrent) || 0,
        monthly: Number(newMonthly) || 0,
        icon: GOAL_ICONS[goals.length % GOAL_ICONS.length],
        color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
      });
      setShowAdd(false);
      setNewName("");
      setNewTarget("");
      setNewCurrent("");
      setNewMonthly("");
      await loadGoals();
    } catch (e) {
      console.error("Create goal error:", e);
    } finally {
      setSaving(false);
    }
  };

  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalMonthly = goals.reduce((s, g) => s + g.monthly, 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p style={{ color: "var(--muted-foreground)" }}>Loading goals...</p>
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
          { label: "Total Saved", value: `₹${totalSaved.toLocaleString("en-IN")}`, color: "var(--primary)" },
          { label: "Total Target", value: `₹${totalTarget.toLocaleString("en-IN")}`, color: "var(--foreground)" },
          { label: "Monthly Allocated", value: `₹${totalMonthly.toLocaleString("en-IN")}`, color: "var(--ai-color)" },
          { label: "Active Goals", value: String(goals.length), color: "var(--forecast)" },
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

      <div className="flex items-center justify-between mb-4">
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {goals.length} active {goals.length === 1 ? "goal" : "goals"} · ₹{totalMonthly.toLocaleString("en-IN")}/month allocated
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="text-xs px-4 py-2 rounded-sm font-semibold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          + New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: "var(--muted-foreground)" }}>
          No goals yet. Create your first financial goal!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onUpdated={loadGoals} />
          ))}
        </div>
      )}

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
            <div className="font-semibold text-sm mb-4">New Financial Goal</div>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Goal name</div>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border text-sm"
                  style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none" }}
                />
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Target amount (₹)</div>
                <input
                  type="number"
                  placeholder="500000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border text-sm"
                  style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none", fontFamily: "var(--font-jetbrains)" }}
                />
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Already saved (₹)</div>
                <input
                  type="number"
                  placeholder="0"
                  value={newCurrent}
                  onChange={(e) => setNewCurrent(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border text-sm"
                  style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none", fontFamily: "var(--font-jetbrains)" }}
                />
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Monthly contribution (₹)</div>
                <input
                  type="number"
                  placeholder="5000"
                  value={newMonthly}
                  onChange={(e) => setNewMonthly(e.target.value)}
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
                disabled={saving || !newName || !newTarget}
                className="flex-1 py-2 text-xs rounded-sm font-semibold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", opacity: saving || !newName || !newTarget ? 0.6 : 1 }}
              >
                {saving ? "Creating..." : "Create Goal"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
