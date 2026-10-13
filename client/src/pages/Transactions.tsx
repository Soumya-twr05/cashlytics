import { useState } from "react";

interface Transaction {
  id: number;
  initials: string;
  merchant: string;
  datetime: string;
  method: string;
  category: string;
  amount: number;
  type: "debit" | "credit";
  source: string;
  confidence: number;
  verified: boolean;
}

const ALL_TRANSACTIONS: Transaction[] = [
  { id: 1, initials: "Ub", merchant: "Uber", datetime: "Yesterday, 19:28", method: "Card", category: "Transport", amount: 620, type: "debit", source: "Notification", confidence: 94, verified: true },
  { id: 2, initials: "Ne", merchant: "Netflix", datetime: "Yesterday, 08:10", method: "Card", category: "Entertainment", amount: 649, type: "debit", source: "Bank feed", confidence: 99, verified: true },
  { id: 3, initials: "Am", merchant: "Amazon", datetime: "Today, 10:42", method: "UPI", category: "Electronics", amount: 8500, type: "debit", source: "Notification", confidence: 98, verified: true },
  { id: 4, initials: "SW", merchant: "SWIGGY", datetime: "Today, 09:15", method: "UPI", category: "Food", amount: 450, type: "debit", source: "SMS", confidence: 96, verified: true },
  { id: 5, initials: "Bl", merchant: "Blinkit", datetime: "18 Jun, 21:04", method: "UPI", category: "Food", amount: 1280, type: "debit", source: "SMS", confidence: 91, verified: true },
  { id: 6, initials: "Ai", merchant: "Airtel", datetime: "17 Jun, 12:00", method: "Auto-pay", category: "Bills", amount: 899, type: "debit", source: "Bank feed", confidence: 100, verified: true },
  { id: 7, initials: "Zo", merchant: "Zomato", datetime: "16 Jun, 20:30", method: "UPI", category: "Food", amount: 320, type: "debit", source: "SMS", confidence: 94, verified: true },
  { id: 8, initials: "BM", merchant: "BookMyShow", datetime: "15 Jun, 15:00", method: "Card", category: "Entertainment", amount: 520, type: "debit", source: "Notification", confidence: 97, verified: true },
  { id: 9, initials: "PE", merchant: "PharmEasy", datetime: "14 Jun, 10:00", method: "UPI", category: "Healthcare", amount: 920, type: "debit", source: "Notification", confidence: 90, verified: false },
  { id: 10, initials: "SA", merchant: "Salary", datetime: "1 Sep, 09:00", method: "NEFT", category: "Income", amount: 142000, type: "credit", source: "Bank feed", confidence: 99, verified: true },
];

const FILTER_TABS = ["All", "Transport", "Entertainment", "Electronics", "Food", "Bills", "Shopping", "Healthcare"];

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 95 ? "var(--income)" : value >= 85 ? "var(--warning)" : "var(--expense)";
  return (
    <div className="flex items-center gap-2">
      <div className="relative rounded-full overflow-hidden" style={{ width: "72px", height: "5px", background: "var(--secondary)" }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span
        className="text-xs tabular-nums"
        style={{ fontFamily: "var(--font-jetbrains)", color: "var(--muted-foreground)", fontSize: "11px", minWidth: "28px" }}
      >
        {value}%
      </span>
    </div>
  );
}

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selected, setSelected] = useState<number[]>([]);

  const filtered = ALL_TRANSACTIONS.filter((t) => {
    const matchSearch = !search || t.merchant.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "All" || t.category === activeTab;
    return matchSearch && matchTab;
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <div
            className="text-xs font-semibold tracking-widest mb-2"
            style={{ color: "var(--primary)", fontSize: "10px", letterSpacing: "0.12em" }}
          >
            TRANSACTIONS / WORKSPACE
          </div>
          <h1
            className="font-bold leading-tight mb-1.5"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Everything, understood.
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Search, verify, and teach the system from one focused workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:mt-6 flex-wrap">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
            style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "var(--card)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Bulk verify
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
            style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "var(--card)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import
          </button>
        </div>
      </div>

      {/* Search + filter tabs */}
      <div
        className="rounded-xl p-4 mb-1"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-md min-w-0" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search merchant, category, method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "var(--foreground)" }}
            />
          </div>

          <div className="flex items-center gap-2">
          {/* Filter icon */}
          <button
            className="flex items-center justify-center rounded-md"
            style={{ width: "36px", height: "36px", border: "1px solid var(--border)", color: "var(--muted-foreground)", background: "var(--background)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          </button>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 rounded-md text-xs font-medium shrink-0"
                style={{
                  background: activeTab === tab ? "var(--sidebar)" : "var(--background)",
                  color: activeTab === tab ? "#ffffff" : "var(--muted-foreground)",
                  border: activeTab === tab ? "none" : "1px solid var(--border)",
                  fontSize: "12px",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-x-auto"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="min-w-[760px]">
        {/* Table header */}
        <div
          className="grid px-5 py-3 text-xs font-semibold tracking-widest"
          style={{
            gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 1.2fr 0.8fr",
            color: "var(--muted-foreground)",
            borderBottom: "1px solid var(--border)",
            fontSize: "9px",
            letterSpacing: "0.1em",
          }}
        >
          <span>MERCHANT</span>
          <span>CLASSIFICATION</span>
          <span>AMOUNT</span>
          <span>SOURCE</span>
          <span>CONFIDENCE</span>
          <span>STATUS</span>
        </div>

        {/* Rows */}
        {filtered.map((t, i) => (
          <div
            key={t.id}
            className="grid px-5 py-4 items-center cursor-pointer"
            style={{
              gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 1.2fr 0.8fr",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
              background: selected.includes(t.id) ? "rgba(13,158,126,0.04)" : "transparent",
            }}
            onClick={() => toggleSelect(t.id)}
          >
            {/* Merchant */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-md shrink-0 text-xs font-semibold"
                style={{
                  width: "34px",
                  height: "34px",
                  background: "#f0f0ea",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "11px",
                }}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {t.merchant}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
                  {t.datetime} · {t.method}
                </div>
              </div>
            </div>

            {/* Classification */}
            <div>
              <div className="text-sm" style={{ color: "var(--foreground)" }}>{t.category}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--primary)", fontSize: "11px" }}>
                AI classified
              </div>
            </div>

            {/* Amount */}
            <div
              className="text-sm font-semibold tabular-nums"
              style={{
                fontFamily: "var(--font-jetbrains)",
                color: t.type === "credit" ? "var(--primary)" : "var(--foreground)",
              }}
            >
              {t.type === "credit" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
            </div>

            {/* Source */}
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {t.source}
            </div>

            {/* Confidence */}
            <ConfidenceBar value={t.confidence} />

            {/* Status */}
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--primary)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
              Verified
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
