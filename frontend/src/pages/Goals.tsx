import { useState } from "react";

interface Goal {
  id: string;
  name: string;
  icon: string;
  target: number;
  current: number;
  monthly: number;
  color: string;
  deadline?: string;
}

const GOALS: Goal[] = [
  {
    id: "emergency",
    name: "Emergency Fund",
    icon: "▣",
    target: 300000,
    current: 142000,
    monthly: 8000,
    color: "#10b981",
    deadline: "Jun 2027",
  },
  {
    id: "laptop",
    name: "New Laptop",
    icon: "⊞",
    target: 80000,
    current: 52000,
    monthly: 5000,
    color: "#818cf8",
    deadline: "Jan 2027",
  },
  {
    id: "travel",
    name: "Europe Trip",
    icon: "◑",
    target: 150000,
    current: 28000,
    monthly: 6000,
    color: "#22d3ee",
    deadline: "Dec 2027",
  },
  {
    id: "education",
    name: "Online Courses",
    icon: "∿",
    target: 40000,
    current: 12000,
    monthly: 3000,
    color: "#f59e0b",
    deadline: "Mar 2027",
  },
];

function GoalCard({ goal }: { goal: Goal }) {
  const [monthly, setMonthly] = useState(goal.monthly);
  const pct = Math.round((goal.current / goal.target) * 100);
  const remaining = goal.target - goal.current;
  const monthsLeft = Math.ceil(remaining / monthly);
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsLeft);
  const completionStr = completionDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

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
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={20000}
          step={500}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="w-full"
          style={{
            height: "4px",
            appearance: "none",
            background: `linear-gradient(to right, ${goal.color} 0%, ${goal.color} ${((monthly - 1000) / 19000) * 100}%, var(--border) ${((monthly - 1000) / 19000) * 100}%, var(--border) 100%)`,
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
  const [showAdd, setShowAdd] = useState(false);

  const totalSaved = GOALS.reduce((s, g) => s + g.current, 0);
  const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);
  const totalMonthly = GOALS.reduce((s, g) => s + g.monthly, 0);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Saved", value: `₹${totalSaved.toLocaleString("en-IN")}`, color: "var(--primary)" },
          { label: "Total Target", value: `₹${totalTarget.toLocaleString("en-IN")}`, color: "var(--foreground)" },
          { label: "Monthly Allocated", value: `₹${totalMonthly.toLocaleString("en-IN")}`, color: "var(--ai-color)" },
          { label: "Active Goals", value: String(GOALS.length), color: "var(--forecast)" },
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
          {GOALS.length} active goals · ₹{totalMonthly.toLocaleString("en-IN")}/month allocated
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="text-xs px-4 py-2 rounded-sm font-semibold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          + New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GOALS.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}
      </div>

      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowAdd(false)}
        >
          <div
            className="p-6 rounded-sm border w-[min(20rem,calc(100vw-2rem))]"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-semibold text-sm mb-4">New Financial Goal</div>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Goal name</div>
                <input
                  type="text"
                  placeholder="e.g. New Car"
                  className="w-full px-3 py-2 rounded-sm border text-sm"
                  style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none" }}
                />
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Target amount (₹)</div>
                <input
                  type="number"
                  placeholder="500000"
                  className="w-full px-3 py-2 rounded-sm border text-sm"
                  style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", outline: "none", fontFamily: "var(--font-jetbrains)" }}
                />
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Monthly contribution (₹)</div>
                <input
                  type="number"
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
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 text-xs rounded-sm font-semibold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Create Goal
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
