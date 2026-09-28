import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const INCOME_RANGES = [
  { id: "lt30k", label: "Under ₹30,000", sub: "Per month" },
  { id: "30-60k", label: "₹30,000 – ₹60,000", sub: "Per month" },
  { id: "60-120k", label: "₹60,000 – ₹1,20,000", sub: "Per month" },
  { id: "gt120k", label: "Above ₹1,20,000", sub: "Per month" },
];

const GOALS = [
  { id: "emergency", label: "Emergency fund", icon: "▣" },
  { id: "invest", label: "Start investing", icon: "◎" },
  { id: "debt", label: "Pay off debt", icon: "⊗" },
  { id: "travel", label: "Travel fund", icon: "◑" },
  { id: "gadget", label: "Buy a gadget", icon: "⊞" },
  { id: "home", label: "Save for home", icon: "◈" },
  { id: "education", label: "Education", icon: "∿" },
  { id: "other", label: "Other", icon: "✦" },
];

const PRIORITIES = [
  { id: "food", label: "Food & Dining" },
  { id: "transport", label: "Transport" },
  { id: "shopping", label: "Shopping" },
  { id: "bills", label: "Bills & Utilities" },
  { id: "health", label: "Healthcare" },
  { id: "entertainment", label: "Entertainment" },
];

const SAVINGS_TARGETS = ["10%", "20%", "30%", "40%", "Custom"];

const STEPS = [
  { id: 1, label: "Income" },
  { id: 2, label: "Goals" },
  { id: 3, label: "Priorities" },
  { id: 4, label: "Savings" },
  { id: 5, label: "Done" },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [savings, setSavings] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (id: string) => {
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const togglePriority = (id: string) => {
    setPriorities((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      try {
        const { completeOnboarding } = await import("../lib/api");
        
        let monthlyIncome = 50000;
        if (income === "lt30k") monthlyIncome = 25000;
        else if (income === "30-60k") monthlyIncome = 45000;
        else if (income === "60-120k") monthlyIncome = 90000;
        else if (income === "gt120k") monthlyIncome = 150000;

        let savingsPercent = 0.2;
        if (savings === "10%") savingsPercent = 0.1;
        else if (savings === "30%") savingsPercent = 0.3;
        else if (savings === "40%") savingsPercent = 0.4;

        const desiredMonthlySavings = monthlyIncome * savingsPercent;
        const averageMonthlyExpenses = monthlyIncome - desiredMonthlySavings;

        // Map selected goal IDs to goal objects
        const goalObjects = goals.map((goalId) => {
          const goalData = GOALS.find((g) => g.id === goalId);
          return {
            name: goalData?.label || goalId,
            target: 100000,
            icon: goalData?.icon || "",
          };
        });

        // Single atomic call: saves profile + seeds income transaction + creates goals
        await completeOnboarding({
          monthlyIncome,
          averageMonthlyExpenses,
          desiredMonthlySavings,
          spendingStyle: "moderate",
          priorities,
          goals: goalObjects,
        });

        setStep(5);
      } catch (err) {
        console.error("Failed to complete onboarding:", err);
        alert("Failed to save profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const canContinue = () => {
    if (step === 1) return income !== null;
    if (step === 2) return goals.length > 0;
    if (step === 3) return true;
    if (step === 4) return savings !== null;
    return true;
  };

  return (
    <div
      className="h-full flex items-center justify-center overflow-y-auto"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-lg px-6 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div
            className="flex items-center justify-center rounded-sm text-xs font-bold"
            style={{
              width: "26px", height: "26px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#052e16",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            C
          </div>
          <span className="font-bold text-sm tracking-tight">CASHLYTICS</span>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    width: "22px",
                    height: "22px",
                    background: step > s.id ? "var(--primary)" : step === s.id ? "rgba(16,185,129,0.15)" : "var(--muted)",
                    color: step > s.id ? "var(--primary-foreground)" : step === s.id ? "var(--primary)" : "var(--muted-foreground)",
                    border: step === s.id ? "1px solid rgba(16,185,129,0.4)" : "none",
                    fontSize: "10px",
                    fontFamily: "var(--font-jetbrains)",
                  }}
                >
                  {step > s.id ? "✓" : s.id}
                </div>
                <span
                  className="text-xs hidden sm:block"
                  style={{ color: step === s.id ? "var(--foreground)" : "var(--muted-foreground)", fontSize: "11px" }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px"
                  style={{
                    width: "24px",
                    background: step > s.id ? "var(--primary)" : "var(--border)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 1 && (
          <div>
            <h2 className="font-bold text-2xl mb-2" style={{ letterSpacing: "-0.02em" }}>
              What's your monthly income?
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
              This helps Cashlytics establish your financial baseline and set intelligent benchmarks.
            </p>
            <div className="space-y-2">
              {INCOME_RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setIncome(r.id)}
                  className="w-full flex items-center justify-between p-4 rounded-sm border text-left"
                  style={{
                    background: income === r.id ? "rgba(16,185,129,0.08)" : "var(--card)",
                    borderColor: income === r.id ? "rgba(16,185,129,0.4)" : "var(--border)",
                    color: income === r.id ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  <span className="font-medium text-sm">{r.label}</span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-bold text-2xl mb-2" style={{ letterSpacing: "-0.02em" }}>
              What are you saving for?
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
              Select one or more. Cashlytics will align your financial guidance to these goals.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => {
                const selected = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className="flex items-center gap-3 p-4 rounded-sm border text-left"
                    style={{
                      background: selected ? "rgba(16,185,129,0.08)" : "var(--card)",
                      borderColor: selected ? "rgba(16,185,129,0.4)" : "var(--border)",
                    }}
                  >
                    <span style={{ color: selected ? "var(--primary)" : "var(--muted-foreground)", fontSize: "16px" }}>
                      {g.icon}
                    </span>
                    <span className="text-sm font-medium" style={{ color: selected ? "var(--foreground)" : "var(--muted-foreground)" }}>
                      {g.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-bold text-2xl mb-2" style={{ letterSpacing: "-0.02em" }}>
              Where do you spend most?
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
              This helps Cashlytics focus its intelligence where it matters most for you.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map((p) => {
                const selected = priorities.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePriority(p.id)}
                    className="p-4 rounded-sm border text-left"
                    style={{
                      background: selected ? "rgba(16,185,129,0.08)" : "var(--card)",
                      borderColor: selected ? "rgba(16,185,129,0.4)" : "var(--border)",
                      color: selected ? "var(--foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    <span className="text-sm font-medium">{p.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
              Skip if you're not sure — Cashlytics will figure it out.
            </p>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-bold text-2xl mb-2" style={{ letterSpacing: "-0.02em" }}>
              What's your savings target?
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
              A percentage of monthly income. Cashlytics will track your progress automatically.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {SAVINGS_TARGETS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSavings(t)}
                  className="py-4 rounded-sm border font-mono font-semibold text-lg"
                  style={{
                    background: savings === t ? "rgba(16,185,129,0.08)" : "var(--card)",
                    borderColor: savings === t ? "rgba(16,185,129,0.4)" : "var(--border)",
                    color: savings === t ? "var(--primary)" : "var(--muted-foreground)",
                    fontFamily: "var(--font-jetbrains)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div
              className="p-4 rounded-sm border text-sm"
              style={{ background: "rgba(16,185,129,0.04)", borderColor: "rgba(16,185,129,0.15)", color: "var(--muted-foreground)" }}
            >
              <span style={{ color: "var(--primary)" }}>✦ </span>
              Financial experts recommend saving at least 20% of monthly income for financial stability.
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-8">
            <div
              className="inline-flex items-center justify-center rounded-full mb-6 text-2xl"
              style={{ width: "72px", height: "72px", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)" }}
            >
              ✓
            </div>
            <h2 className="font-bold text-2xl mb-3" style={{ letterSpacing: "-0.02em", color: "var(--primary)" }}>
              Cashlytics is ready.
            </h2>
            <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Your financial intelligence profile has been created. Start by reviewing your dashboard.
            </p>
            <button
              onClick={onComplete}
              className="font-semibold px-8 py-3 rounded-sm text-sm"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Open Dashboard →
            </button>
          </div>
        )}

        {step < 5 && (
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
              disabled={step === 1}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canContinue() || loading}
              className="font-semibold px-6 py-2.5 rounded-sm text-sm flex items-center gap-2"
              style={{
                background: canContinue() && !loading ? "var(--primary)" : "var(--muted)",
                color: canContinue() && !loading ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">◌</span>
                  Personalizing...
                </>
              ) : step === 4 ? (
                "Finish setup →"
              ) : (
                "Continue →"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
