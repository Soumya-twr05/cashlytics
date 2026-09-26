// import { useState, useEffect } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";
// import type { Page } from "../App";
// import * as api from "../lib/api";

// interface DashboardProps {
//   onNavigate: (page: Page) => void;
// }

// interface TrendData {
//   day: string;
//   savings: number;
//   expenses: number;
//   income: number;
// }

// interface CategorySpend {
//   name: string;
//   amount: number;
//   color: string;
//   pct: number;
// }

// const TIME_RANGES = ["7D", "30D", "3M", "1Y"];
// const CATEGORY_COLORS: Record<string, string> = {
//   Food: "#f59e0b",
//   Transport: "#06b6d4",
//   Shopping: "#f87171",
//   Bills: "#818cf8",
//   Entertainment: "#a78bfa",
//   Healthcare: "#34d399",
//   Lifestyle: "#0d9e7e",
//   Utilities: "#06b6d4",
//   Other: "#6b7280",
// };

// function HealthGauge({ score }: { score: number }) {
//   const r = 48;
//   const cx = 70;
//   const cy = 70;
//   const circ = 2 * Math.PI * r;
//   const filled = (score / 100) * circ * 0.75;

//   return (
//     <div className="relative shrink-0" style={{ width: "140px", height: "140px" }}>
//       <svg viewBox="0 0 140 140" className="w-full h-full" style={{ transform: "rotate(135deg)" }}>
//         <circle
//           cx={cx} cy={cy} r={r}
//           fill="none"
//           stroke="rgba(255,255,255,0.1)"
//           strokeWidth="8"
//           strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
//           strokeLinecap="round"
//         />
//         <circle
//           cx={cx} cy={cy} r={r}
//           fill="none"
//           stroke="#0d9e7e"
//           strokeWidth="8"
//           strokeDasharray={`${filled} ${circ - filled}`}
//           strokeLinecap="round"
//         />
//       </svg>
//       <div className="absolute inset-0 flex flex-col items-center justify-center">
//         <span
//           className="font-bold tabular-nums leading-none"
//           style={{ fontSize: "28px", fontFamily: "var(--font-jetbrains)", color: "#ffffff" }}
//         >
//           {score}
//         </span>
//         <span className="text-xs mt-0.5" style={{ color: "rgba(200,221,210,0.6)", fontSize: "10px" }}>
//           / 100
//         </span>
//       </div>
//     </div>
//   );
// }

// function ChartTooltip({ active, payload, label }: any) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div
//       className="px-3 py-2 rounded-md shadow-lg text-xs"
//       style={{ background: "#1b3d2b", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-jetbrains)" }}
//     >
//       <div className="mb-1 text-xs" style={{ color: "rgba(200,221,210,0.6)" }}>Day {label}</div>
//       {payload.map((p: any) => (
//         <div key={p.dataKey} className="flex items-center gap-2">
//           <span style={{ color: p.stroke }}>●</span>
//           <span style={{ color: "#fff" }}>₹{p.value.toLocaleString("en-IN")}</span>
//           <span style={{ color: "rgba(200,221,210,0.6)" }}>{p.name}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default function Dashboard({ onNavigate }: DashboardProps) {
//   const [timeRange, setTimeRange] = useState("30D");
//   const [snapshot, setSnapshot] = useState<any>(null);
//   const [trends, setTrends] = useState<TrendData[]>([]);
//   const [categories, setCategories] = useState<CategorySpend[]>([]);
//   const [healthScore, setHealthScore] = useState(75);
//   const [pendingCaptures, setPendingCaptures] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   useEffect(() => {
//     // Refetch when time range changes
//     if (!loading) {
//       fetchDashboardData();
//     }
//   }, [timeRange]);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Fetch snapshot
//       try {
//         const snapshotRes = await api.getFinancialSnapshot() as any;
//         setSnapshot(snapshotRes?.data || {
//           income: 0,
//           expenses: 0,
//           savings: 0,
//           netLiquid: 0,
//         });
//       } catch (e) {
//         console.error("Snapshot error:", e);
//         setSnapshot({ income: 0, expenses: 0, savings: 0, netLiquid: 0 });
//       }

//       // Fetch trends
//       try {
//         const trendsRes = await api.getTrends() as any;
//         const trendData = trendsRes?.data?.trends || trendsRes?.data || [];
//         setTrends(Array.isArray(trendData) ? trendData.slice(0, 15) : []);
//       } catch (e) {
//         console.error("Trends error:", e);
//         setTrends([]);
//       }

//       // Fetch transactions and calculate categories
//       try {
//         const txRes = await api.listTransactions({ limit: 1000 }) as any;
//         const transactions = txRes?.data || [];
        
//         if (Array.isArray(transactions) && transactions.length > 0) {
//           const categoryMap: Record<string, number> = {};
//           const total = transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

//           transactions.forEach((tx: any) => {
//             const cat = tx.category || "Other";
//             categoryMap[cat] = (categoryMap[cat] || 0) + (tx.amount || 0);
//           });

//           const categoryList: CategorySpend[] = Object.entries(categoryMap)
//             .map(([category, amount]) => ({
//               name: category,
//               amount: amount as number,
//               color: CATEGORY_COLORS[category] || "#6b7280",
//               pct: total > 0 ? Math.round(((amount as number) / total) * 100) : 0,
//             }))
//             .sort((a, b) => b.amount - a.amount)
//             .slice(0, 5);

//           setCategories(categoryList);
//         } else {
//           setCategories([]);
//         }
//       } catch (e) {
//         console.error("Categories error:", e);
//         setCategories([]);
//       }

//       // Fetch pending captures
//       try {
//         const captureRes = await api.smartCaptureTransactions() as any;
//         const captures = captureRes?.data || [];
//         setPendingCaptures(Array.isArray(captures) ? captures.length : 0);
//       } catch (e) {
//         console.error("Capture error:", e);
//         setPendingCaptures(0);
//       }

//       // Fetch intelligence for health score
//       try {
//         const intelligenceRes = await api.getDashboardIntelligence() as any;
//         if (intelligenceRes?.data?.healthScore) {
//           setHealthScore(intelligenceRes.data.healthScore);
//         }
//       } catch (e) {
//         console.error("Intelligence error:", e);
//       }
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div
//         className="h-screen flex items-center justify-center"
//         style={{ background: "var(--background)" }}
//       >
//         <div className="text-center">
//           <div
//             className="inline-flex items-center justify-center rounded-sm text-xl font-bold mb-4"
//             style={{
//               width: "48px",
//               height: "48px",
//               background: "linear-gradient(135deg, #10b981, #059669)",
//               color: "#052e16",
//               fontFamily: "var(--font-jetbrains)",
//             }}
//           >
//             C
//           </div>
//           <p style={{ color: "var(--muted-foreground)" }}>Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto">
//       {/* Page header */}
//       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
//         <div>
//           <div
//             className="text-xs font-semibold tracking-widest mb-2"
//             style={{ color: "var(--primary)", fontSize: "10px", letterSpacing: "0.12em" }}
//           >
//             OVERVIEW / LIVE SYSTEM
//           </div>
//           <h1
//             className="font-bold leading-tight mb-1.5"
//             style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", color: "var(--foreground)", letterSpacing: "-0.02em" }}
//           >
//             Your Financial Dashboard
//           </h1>
//           <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
//             Real-time financial insights and analytics
//           </p>
//         </div>
//         <button
//           onClick={() => onNavigate("smart-capture")}
//           className="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium self-start sm:mt-6"
//           style={{
//             border: "1px solid var(--border)",
//             color: "var(--foreground)",
//             background: "var(--card)",
//           }}
//         >
//           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12z"/>
//             <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/>
//           </svg>
//           {pendingCaptures > 0 && `Review ${pendingCaptures} Captures`}
//           {pendingCaptures === 0 && "Smart Capture"}
//         </button>
//       </div>

//       {/* Row 1: Health · Snapshot · Smart Capture */}
//       <div className="grid grid-cols-1 xl:grid-cols-[2fr_2.4fr_1.6fr] gap-4 mb-4">

//         {/* Financial Health */}
//         <div
//           className="rounded-xl p-6 flex flex-col"
//           style={{ background: "var(--sidebar)", minHeight: "220px" }}
//         >
//           <div className="flex items-center justify-between mb-5">
//             <span
//               className="text-xs font-semibold tracking-widest"
//               style={{ color: "rgba(200,221,210,0.55)", fontSize: "9px", letterSpacing: "0.14em" }}
//             >
//               FINANCIAL HEALTH
//             </span>
//             <span
//               className="text-xs font-semibold px-2 py-0.5 rounded"
//               style={{ background: "rgba(13,158,126,0.2)", color: "#4ecca3", fontSize: "9px", letterSpacing: "0.06em" }}
//             >
//               LIVE
//             </span>
//           </div>

//           <div className="flex items-center gap-5 flex-1 flex-wrap">
//             <HealthGauge score={healthScore} />
//             <div>
//               <div className="flex items-center gap-1.5 mb-2">
//                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ecca3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M7 17L17 7M7 7h10v10"/>
//                 </svg>
//                 <span className="text-sm font-semibold" style={{ color: "#4ecca3" }}>
//                   System Status
//                 </span>
//               </div>
//               <p className="text-sm leading-relaxed" style={{ color: "rgba(200,221,210,0.7)", fontSize: "13px" }}>
//                 Your financial metrics are being monitored in real-time.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Monthly Snapshot */}
//         <div
//           className="rounded-xl p-6"
//           style={{ background: "var(--card)", border: "1px solid var(--border)" }}
//         >
//           <div className="flex items-center justify-between mb-5">
//             <span
//               className="text-xs font-semibold tracking-widest"
//               style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
//             >
//               MONTHLY SNAPSHOT
//             </span>
//           </div>

//           <div className="grid grid-cols-2 gap-x-6 gap-y-5">
//             <div>
//               <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
//                 INCOME
//               </div>
//               <div
//                 className="font-bold tabular-nums mb-1"
//                 style={{ fontSize: "24px", fontFamily: "var(--font-jetbrains)", color: "var(--primary)", letterSpacing: "-0.02em" }}
//               >
//                 ₹{(snapshot?.income || 0).toLocaleString("en-IN")}
//               </div>
//             </div>

//             <div>
//               <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
//                 EXPENSES
//               </div>
//               <div
//                 className="font-bold tabular-nums mb-1"
//                 style={{ fontSize: "24px", fontFamily: "var(--font-jetbrains)", color: "var(--foreground)", letterSpacing: "-0.02em" }}
//               >
//                 ₹{(snapshot?.expenses || 0).toLocaleString("en-IN")}
//               </div>
//             </div>

//             <div>
//               <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
//                 SAVINGS
//               </div>
//               <div
//                 className="font-bold tabular-nums mb-1"
//                 style={{ fontSize: "24px", fontFamily: "var(--font-jetbrains)", color: "var(--primary)", letterSpacing: "-0.02em" }}
//               >
//                 ₹{(snapshot?.savings || 0).toLocaleString("en-IN")}
//               </div>
//             </div>

//             <div>
//               <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.12em" }}>
//                 NET LIQUID
//               </div>
//               <div
//                 className="font-bold tabular-nums"
//                 style={{ fontSize: "24px", fontFamily: "var(--font-jetbrains)", color: "var(--foreground)", letterSpacing: "-0.02em" }}
//               >
//                 ₹{(snapshot?.netLiquid || 0).toLocaleString("en-IN")}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Smart Capture */}
//         <div
//           className="rounded-xl p-6 flex flex-col"
//           style={{ background: "var(--card)", border: "1px solid var(--border)" }}
//         >
//           <span
//             className="text-xs font-semibold tracking-widest mb-5"
//             style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
//           >
//             SMART CAPTURE
//           </span>

//           <div className="flex-1">
//             <div
//               className="font-bold tabular-nums leading-none mb-1"
//               style={{ fontSize: "48px", fontFamily: "var(--font-jetbrains)", color: "var(--foreground)", letterSpacing: "-0.04em" }}
//             >
//               {pendingCaptures}
//             </div>
//             <div className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
//               {pendingCaptures === 1 ? "transaction" : "transactions"} pending
//             </div>

//             <button
//               onClick={() => onNavigate("smart-capture")}
//               className="text-sm font-medium"
//               style={{ color: "var(--primary)" }}
//             >
//               Review queue →
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Chart · Category Spend */}
//       <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">

//         {/* Spending Behavior Chart */}
//         <div
//           className="rounded-xl p-6"
//           style={{ background: "var(--card)", border: "1px solid var(--border)" }}
//         >
//           <div className="flex items-center justify-between gap-3 mb-4">
//             <span
//               className="text-xs font-semibold tracking-widest"
//               style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
//             >
//               SPENDING BEHAVIOR
//             </span>
//             <div
//               className="flex rounded-md overflow-hidden"
//               style={{ border: "1px solid var(--border)" }}
//             >
//               {TIME_RANGES.map((r) => (
//                 <button
//                   key={r}
//                   onClick={() => setTimeRange(r)}
//                   className="px-3 py-1 text-xs font-medium transition-all"
//                   style={{
//                     background: timeRange === r ? "var(--sidebar)" : "transparent",
//                     color: timeRange === r ? "#ffffff" : "var(--muted-foreground)",
//                     borderRight: r !== "1Y" ? "1px solid var(--border)" : "none",
//                     fontSize: "11px",
//                   }}
//                 >
//                   {r}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <h2 className="font-semibold text-base mb-4" style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}>
//             Income, expenses & savings
//           </h2>

//           {trends.length > 0 ? (
//             <div style={{ height: "200px" }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={trends} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
//                   <CartesianGrid strokeDasharray="2 6" stroke="rgba(0,0,0,0.06)" vertical={false} />
//                   <XAxis
//                     dataKey="day"
//                     tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <YAxis
//                     tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
//                     axisLine={false}
//                     tickLine={false}
//                     tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
//                   />
//                   <Tooltip content={<ChartTooltip />} />
//                   <Line type="monotone" dataKey="savings" name="Savings" stroke="#0d9e7e" strokeWidth={2} dot={false} />
//                   <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2} dot={false} />
//                   <Line type="monotone" dataKey="income" name="Income" stroke="#06b6d4" strokeWidth={2} dot={false} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <p style={{ color: "var(--muted-foreground)" }}>No trend data available</p>
//             </div>
//           )}
//         </div>

//         {/* Category Spend */}
//         <div
//           className="rounded-xl p-6"
//           style={{ background: "var(--card)", border: "1px solid var(--border)" }}
//         >
//           <span
//             className="text-xs font-semibold tracking-widest"
//             style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.14em" }}
//           >
//             CATEGORY BREAKDOWN
//           </span>

//           <h2 className="font-semibold text-base mb-5 mt-3" style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}>
//             Top spending categories
//           </h2>

//           {categories.length > 0 ? (
//             <div className="space-y-4">
//               {categories.map((cat) => (
//                 <div key={cat.name}>
//                   <div className="flex items-center justify-between mb-1.5">
//                     <div className="flex items-center gap-2">
//                       <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
//                       <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
//                         {cat.name}
//                       </span>
//                     </div>
//                     <span
//                       className="text-sm font-semibold tabular-nums"
//                       style={{ fontFamily: "var(--font-jetbrains)", color: "var(--foreground)" }}
//                     >
//                       ₹{cat.amount.toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                   <div
//                     className="relative h-1.5 rounded-full overflow-hidden"
//                     style={{ background: "#f0f0ea" }}
//                   >
//                     <div
//                       className="absolute left-0 top-0 h-full rounded-full"
//                       style={{ width: `${cat.pct}%`, background: cat.color }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p style={{ color: "var(--muted-foreground)" }}>No transaction data</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Page } from "../App";
import * as api from "../lib/api";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

interface TrendData {
  day: string;
  savings: number;
  expenses: number;
  income: number;
}

interface CategorySpend {
  name: string;
  amount: number;
  color: string;
  pct: number;
}

interface Snapshot {
  income: number;
  expenses: number;
  savings: number;
  netLiquid: number;
  savingsRate?: number;
  trajectory?: string;
}

interface DashboardHealth {
  score: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  budgetsExceeded: number;
  trajectory: string;
}

interface DashboardCategory {
  _id: string;
  total: number;
  count: number;
}

const TIME_RANGES = ["7D", "30D", "3M", "1Y"];

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f59e0b",
  "Food & Dining": "#f59e0b",
  Transport: "#06b6d4",
  Transportation: "#06b6d4",
  Shopping: "#f87171",
  Bills: "#818cf8",
  Entertainment: "#a78bfa",
  Healthcare: "#34d399",
  Lifestyle: "#0d9e7e",
  Utilities: "#06b6d4",
  Education: "#8b5cf6",
  Financial: "#14b8a6",
  Groceries: "#84cc16",
  Rent: "#6366f1",
  Income: "#22c55e",
  Other: "#6b7280",
};

function HealthGauge({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  const r = 48;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;

  const filled = (safeScore / 100) * circ * 0.75;

  return (
    <div
      className="relative shrink-0"
      style={{ width: "140px", height: "140px" }}
    >
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full"
        style={{ transform: "rotate(135deg)" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeLinecap="round"
        />

        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#0d9e7e"
          strokeWidth="8"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold tabular-nums leading-none"
          style={{
            fontSize: "28px",
            fontFamily: "var(--font-jetbrains)",
            color: "#ffffff",
          }}
        >
          {Math.round(safeScore)}
        </span>

        <span
          className="text-xs mt-0.5"
          style={{
            color: "rgba(200,221,210,0.6)",
            fontSize: "10px",
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="px-3 py-2 rounded-md shadow-lg text-xs"
      style={{
        background: "#1b3d2b",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "var(--font-jetbrains)",
      }}
    >
      <div
        className="mb-1 text-xs"
        style={{ color: "rgba(200,221,210,0.6)" }}
      >
        Day {label}
      </div>

      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center gap-2"
        >
          <span style={{ color: p.stroke }}>●</span>

          <span style={{ color: "#fff" }}>
            ₹{Number(p.value || 0).toLocaleString("en-IN")}
          </span>

          <span style={{ color: "rgba(200,221,210,0.6)" }}>
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({
  onNavigate,
}: DashboardProps) {
  const [timeRange, setTimeRange] = useState("30D");

  const [snapshot, setSnapshot] = useState<Snapshot>({
    income: 0,
    expenses: 0,
    savings: 0,
    netLiquid: 0,
    savingsRate: 0,
    trajectory: "Needs attention",
  });

  const [trends, setTrends] = useState<TrendData[]>([]);

  const [categories, setCategories] = useState<CategorySpend[]>([]);

  const [healthScore, setHealthScore] = useState(0);

  const [trajectory, setTrajectory] = useState("Needs attention");

  const [pendingCaptures, setPendingCaptures] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchDashboardData();
    }
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * ============================================================
       * 1. DASHBOARD INTELLIGENCE
       * ============================================================
       *
       * Backend response:
       *
       * {
       *   success: true,
       *   data: {
       *     health: {
       *       score,
       *       income,
       *       expenses,
       *       savings,
       *       savingsRate,
       *       budgetsExceeded,
       *       trajectory
       *     },
       *     categories: [
       *       {
       *         _id,
       *         total,
       *         count
       *       }
       *     ],
       *     range
       *   }
       * }
       */

      let dashboardData: any = null;

      try {
        const intelligenceResponse =
          (await api.getDashboardIntelligence()) as any;

        dashboardData = intelligenceResponse?.data || null;

        console.log(
          "Dashboard intelligence:",
          dashboardData
        );

        const health: DashboardHealth =
          dashboardData?.health || {
            score: 0,
            income: 0,
            expenses: 0,
            savings: 0,
            savingsRate: 0,
            budgetsExceeded: 0,
            trajectory: "Needs attention",
          };

        /*
         * Health score
         */
        setHealthScore(
          Number(health.score ?? 0)
        );

        /*
         * Trajectory
         */
        setTrajectory(
          health.trajectory || "Needs attention"
        );

        /*
         * Use intelligence data for the snapshot
         * because it is already calculated from transactions.
         */
        setSnapshot({
          income: Number(health.income ?? 0),
          expenses: Number(health.expenses ?? 0),
          savings: Number(health.savings ?? 0),
          netLiquid:
            Number(health.income ?? 0) -
            Number(health.expenses ?? 0),
          savingsRate: Number(
            health.savingsRate ?? 0
          ),
          trajectory:
            health.trajectory ||
            "Needs attention",
        });

        /*
         * ========================================================
         * Categories
         * ========================================================
         *
         * Backend:
         *
         * [
         *   {
         *     _id: "Entertainment",
         *     total: 9700,
         *     count: 2
         *   }
         * ]
         */

        const backendCategories: DashboardCategory[] =
          Array.isArray(dashboardData?.categories)
            ? dashboardData.categories
            : [];

        const totalCategorySpend =
          backendCategories.reduce(
            (sum, category) =>
              sum + Number(category.total || 0),
            0
          );

        const categoryList: CategorySpend[] =
          backendCategories
            .map((category) => {
              const name =
                category._id || "Other";

              const amount =
                Number(category.total || 0);

              return {
                name,
                amount,
                color:
                  CATEGORY_COLORS[name] ||
                  "#6b7280",
                pct:
                  totalCategorySpend > 0
                    ? Math.round(
                        (amount /
                          totalCategorySpend) *
                          100
                      )
                    : 0,
              };
            })
            .sort(
              (a, b) =>
                b.amount - a.amount
            )
            .slice(0, 5);

        setCategories(categoryList);
      } catch (e) {
        console.error(
          "Dashboard intelligence error:",
          e
        );

        /*
         * Do not break the entire dashboard if
         * intelligence fails.
         */
      }

      /*
       * ============================================================
       * 2. FINANCIAL SNAPSHOT
       * ============================================================
       */

      try {
        const snapshotResponse =
          (await api.getFinancialSnapshot()) as any;

        const snapshotData =
          snapshotResponse?.data;

        if (snapshotData) {
          setSnapshot((previous) => ({
            income: Number(
              snapshotData.income ??
                previous.income ??
                0
            ),

            expenses: Number(
              snapshotData.expenses ??
                previous.expenses ??
                0
            ),

            savings: Number(
              snapshotData.savings ??
                previous.savings ??
                0
            ),

            netLiquid: Number(
              snapshotData.netLiquid ??
                (
                  Number(
                    snapshotData.income ??
                      previous.income ??
                      0
                  ) -
                  Number(
                    snapshotData.expenses ??
                      previous.expenses ??
                      0
                  )
                )
            ),

            savingsRate: Number(
              snapshotData.savingsRate ??
                previous.savingsRate ??
                0
            ),

            trajectory:
              snapshotData.trajectory ??
              previous.trajectory ??
              "Needs attention",
          }));
        }
      } catch (e) {
        console.error(
          "Snapshot error:",
          e
        );
      }

      /*
       * ============================================================
       * 3. TRENDS
       * ============================================================
       */

      try {
        const trendsResponse =
          (await api.getTrends()) as any;

        const rawTrends =
          trendsResponse?.data?.trends ??
          trendsResponse?.data ??
          [];

        if (Array.isArray(rawTrends)) {
          const normalizedTrends =
            rawTrends
              .map((item: any, index: number) => ({
                day:
                  item.day ??
                  item.date ??
                  item.label ??
                  String(index + 1),

                savings: Number(
                  item.savings ??
                    item.saved ??
                    0
                ),

                expenses: Number(
                  item.expenses ??
                    item.expense ??
                    0
                ),

                income: Number(
                  item.income ??
                    0
                ),
              }))
              .slice(0, 15);

          setTrends(normalizedTrends);
        } else {
          setTrends([]);
        }
      } catch (e) {
        console.error(
          "Trends error:",
          e
        );

        setTrends([]);
      }

      /*
       * ============================================================
       * 4. TRANSACTION FALLBACK FOR CATEGORIES
       * ============================================================
       *
       * If the intelligence endpoint does not return categories,
       * calculate them from real transactions.
       */

      try {
        if (categories.length === 0) {
          const transactionResponse =
            (await api.listTransactions({
              limit: 1000,
            })) as any;

          const transactionItems =
            transactionResponse?.data?.items ??
            transactionResponse?.data ??
            [];

          if (
            Array.isArray(transactionItems) &&
            transactionItems.length > 0
          ) {
            const categoryMap: Record<
              string,
              number
            > = {};

            transactionItems.forEach(
              (transaction: any) => {
                /*
                 * Only count debit transactions
                 * as spending.
                 */
                if (
                  transaction.type ===
                  "credit"
                ) {
                  return;
                }

                const category =
                  transaction.category ||
                  "Other";

                const amount =
                  Number(
                    transaction.amount || 0
                  );

                categoryMap[category] =
                  (categoryMap[category] ||
                    0) + amount;
              }
            );

            const total =
              Object.values(
                categoryMap
              ).reduce(
                (sum, amount) =>
                  sum + amount,
                0
              );

            const fallbackCategories =
              Object.entries(categoryMap)
                .map(
                  ([category, amount]) => ({
                    name: category,
                    amount,
                    color:
                      CATEGORY_COLORS[
                        category
                      ] || "#6b7280",
                    pct:
                      total > 0
                        ? Math.round(
                            (amount /
                              total) *
                              100
                          )
                        : 0,
                  })
                )
                .sort(
                  (a, b) =>
                    b.amount -
                    a.amount
                )
                .slice(0, 5);

            /*
             * Only use fallback when the
             * intelligence endpoint did not
             * provide categories.
             */
            if (
              fallbackCategories.length >
              0
            ) {
              setCategories(
                fallbackCategories
              );
            }
          }
        }
      } catch (e) {
        console.error(
          "Transaction category fallback error:",
          e
        );
      }

      /*
       * ============================================================
       * 5. SMART CAPTURE
       * ============================================================
       */

      try {
        const captureResponse =
          (await api.smartCaptureTransactions()) as any;

        const captureData =
          captureResponse?.data?.items ??
          captureResponse?.data ??
          [];

        setPendingCaptures(
          Array.isArray(captureData)
            ? captureData.length
            : 0
        );
      } catch (e) {
        console.error(
          "Capture error:",
          e
        );

        setPendingCaptures(0);
      }
    } catch (error) {
      console.error(
        "Error fetching dashboard data:",
        error
      );

      setError(
        "Unable to load some dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==============================================================
   * LOADING SCREEN
   * ==============================================================
   */

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{
          background: "var(--background)",
        }}
      >
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center rounded-sm text-xl font-bold mb-4"
            style={{
              width: "48px",
              height: "48px",
              background:
                "linear-gradient(135deg, #10b981, #059669)",
              color: "#052e16",
              fontFamily:
                "var(--font-jetbrains)",
            }}
          >
            C
          </div>

          <p
            style={{
              color:
                "var(--muted-foreground)",
            }}
          >
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ==============================================================
   * DASHBOARD
   * ==============================================================
   */

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto">

      {/* =========================================================
          PAGE HEADER
          ========================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <div
            className="text-xs font-semibold tracking-widest mb-2"
            style={{
              color: "var(--primary)",
              fontSize: "10px",
              letterSpacing: "0.12em",
            }}
          >
            OVERVIEW / LIVE SYSTEM
          </div>

          <h1
            className="font-bold leading-tight mb-1.5"
            style={{
              fontSize:
                "clamp(1.6rem, 3vw, 2.25rem)",
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
            }}
          >
            Your Financial Dashboard
          </h1>

          <p
            className="text-sm"
            style={{
              color:
                "var(--muted-foreground)",
            }}
          >
            Real-time financial insights and analytics
          </p>

          {error && (
            <p
              className="text-xs mt-2"
              style={{
                color: "#f87171",
              }}
            >
              {error}
            </p>
          )}
        </div>

        <button
          onClick={() =>
            onNavigate("smart-capture")
          }
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium self-start sm:mt-6"
          style={{
            border:
              "1px solid var(--border)",
            color: "var(--foreground)",
            background: "var(--card)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12z" />
            <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" />
          </svg>

          {pendingCaptures > 0
            ? `Review ${pendingCaptures} Captures`
            : "Smart Capture"}
        </button>
      </div>

      {/* =========================================================
          ROW 1
          ========================================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_2.4fr_1.6fr] gap-4 mb-4">

        {/* =======================================================
            FINANCIAL HEALTH
            ======================================================= */}

        <div
          className="rounded-xl p-6 flex flex-col"
          style={{
            background:
              "var(--sidebar)",
            minHeight: "220px",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-xs font-semibold tracking-widest"
              style={{
                color:
                  "rgba(200,221,210,0.55)",
                fontSize: "9px",
                letterSpacing: "0.14em",
              }}
            >
              FINANCIAL HEALTH
            </span>

            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{
                background:
                  "rgba(13,158,126,0.2)",
                color: "#4ecca3",
                fontSize: "9px",
                letterSpacing: "0.06em",
              }}
            >
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-5 flex-1 flex-wrap">
            <HealthGauge
              score={healthScore}
            />

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4ecca3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>

                <span
                  className="text-sm font-semibold"
                  style={{
                    color: "#4ecca3",
                  }}
                >
                  {trajectory}
                </span>
              </div>

              <p
                className="text-sm leading-relaxed"
                style={{
                  color:
                    "rgba(200,221,210,0.7)",
                  fontSize: "13px",
                }}
              >
                Your financial metrics are being monitored in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================
            MONTHLY SNAPSHOT
            ======================================================= */}

        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--card)",
            border:
              "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-xs font-semibold tracking-widest"
              style={{
                color:
                  "var(--muted-foreground)",
                fontSize: "9px",
                letterSpacing: "0.14em",
              }}
            >
              MONTHLY SNAPSHOT
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">

            {/* Income */}
            <div>
              <div
                className="text-xs font-semibold tracking-widest mb-2"
                style={{
                  color:
                    "var(--muted-foreground)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                }}
              >
                INCOME
              </div>

              <div
                className="font-bold tabular-nums mb-1"
                style={{
                  fontSize: "24px",
                  fontFamily:
                    "var(--font-jetbrains)",
                  color: "var(--primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                ₹
                {Number(
                  snapshot.income
                ).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Expenses */}
            <div>
              <div
                className="text-xs font-semibold tracking-widest mb-2"
                style={{
                  color:
                    "var(--muted-foreground)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                }}
              >
                EXPENSES
              </div>

              <div
                className="font-bold tabular-nums mb-1"
                style={{
                  fontSize: "24px",
                  fontFamily:
                    "var(--font-jetbrains)",
                  color:
                    "var(--foreground)",
                  letterSpacing: "-0.02em",
                }}
              >
                ₹
                {Number(
                  snapshot.expenses
                ).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Savings */}
            <div>
              <div
                className="text-xs font-semibold tracking-widest mb-2"
                style={{
                  color:
                    "var(--muted-foreground)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                }}
              >
                SAVINGS
              </div>

              <div
                className="font-bold tabular-nums mb-1"
                style={{
                  fontSize: "24px",
                  fontFamily:
                    "var(--font-jetbrains)",
                  color: "var(--primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                ₹
                {Number(
                  snapshot.savings
                ).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Net liquid */}
            <div>
              <div
                className="text-xs font-semibold tracking-widest mb-2"
                style={{
                  color:
                    "var(--muted-foreground)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                }}
              >
                NET LIQUID
              </div>

              <div
                className="font-bold tabular-nums"
                style={{
                  fontSize: "24px",
                  fontFamily:
                    "var(--font-jetbrains)",
                  color:
                    "var(--foreground)",
                  letterSpacing: "-0.02em",
                }}
              >
                ₹
                {Number(
                  snapshot.netLiquid
                ).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            SMART CAPTURE
            ======================================================= */}

        <div
          className="rounded-xl p-6 flex flex-col"
          style={{
            background: "var(--card)",
            border:
              "1px solid var(--border)",
          }}
        >
          <span
            className="text-xs font-semibold tracking-widest mb-5"
            style={{
              color:
                "var(--muted-foreground)",
              fontSize: "9px",
              letterSpacing: "0.14em",
            }}
          >
            SMART CAPTURE
          </span>

          <div className="flex-1">
            <div
              className="font-bold tabular-nums leading-none mb-1"
              style={{
                fontSize: "48px",
                fontFamily:
                  "var(--font-jetbrains)",
                color:
                  "var(--foreground)",
                letterSpacing: "-0.04em",
              }}
            >
              {pendingCaptures}
            </div>

            <div
              className="text-sm mb-4"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              {pendingCaptures === 1
                ? "transaction"
                : "transactions"}{" "}
              pending
            </div>

            <button
              onClick={() =>
                onNavigate("smart-capture")
              }
              className="text-sm font-medium"
              style={{
                color: "var(--primary)",
              }}
            >
              Review queue →
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          ROW 2
          ========================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">

        {/* =======================================================
            SPENDING BEHAVIOR
            ======================================================= */}

        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--card)",
            border:
              "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <span
              className="text-xs font-semibold tracking-widest"
              style={{
                color:
                  "var(--muted-foreground)",
                fontSize: "9px",
                letterSpacing: "0.14em",
              }}
            >
              SPENDING BEHAVIOR
            </span>

            <div
              className="flex rounded-md overflow-hidden"
              style={{
                border:
                  "1px solid var(--border)",
              }}
            >
              {TIME_RANGES.map(
                (range) => (
                  <button
                    key={range}
                    onClick={() =>
                      setTimeRange(range)
                    }
                    className="px-3 py-1 text-xs font-medium transition-all"
                    style={{
                      background:
                        timeRange === range
                          ? "var(--sidebar)"
                          : "transparent",

                      color:
                        timeRange === range
                          ? "#ffffff"
                          : "var(--muted-foreground)",

                      borderRight:
                        range !== "1Y"
                          ? "1px solid var(--border)"
                          : "none",

                      fontSize: "11px",
                    }}
                  >
                    {range}
                  </button>
                )
              )}
            </div>
          </div>

          <h2
            className="font-semibold text-base mb-4"
            style={{
              color:
                "var(--foreground)",
              letterSpacing:
                "-0.01em",
            }}
          >
            Income, expenses & savings
          </h2>

          {trends.length > 0 ? (
            <div style={{ height: "200px" }}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={trends}
                  margin={{
                    top: 4,
                    right: 8,
                    bottom: 0,
                    left: -10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="2 6"
                    stroke="rgba(0,0,0,0.06)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 10,
                      fontFamily:
                        "var(--font-jetbrains)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 10,
                      fontFamily:
                        "var(--font-jetbrains)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `${(
                        Number(value) /
                        1000
                      ).toFixed(0)}k`
                    }
                  />

                  <Tooltip
                    content={
                      <ChartTooltip />
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="savings"
                    name="Savings"
                    stroke="#0d9e7e"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#f87171"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              style={{
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                No trend data available
              </p>
            </div>
          )}
        </div>

        {/* =======================================================
            CATEGORY BREAKDOWN
            ======================================================= */}

        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--card)",
            border:
              "1px solid var(--border)",
          }}
        >
          <span
            className="text-xs font-semibold tracking-widest"
            style={{
              color:
                "var(--muted-foreground)",
              fontSize: "9px",
              letterSpacing: "0.14em",
            }}
          >
            CATEGORY BREAKDOWN
          </span>

          <h2
            className="font-semibold text-base mb-5 mt-3"
            style={{
              color:
                "var(--foreground)",
              letterSpacing:
                "-0.01em",
            }}
          >
            Top spending categories
          </h2>

          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map(
                (category) => (
                  <div
                    key={category.name}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            background:
                              category.color,
                          }}
                        />

                        <span
                          className="text-sm font-medium"
                          style={{
                            color:
                              "var(--foreground)",
                          }}
                        >
                          {category.name}
                        </span>
                      </div>

                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{
                          fontFamily:
                            "var(--font-jetbrains)",
                          color:
                            "var(--foreground)",
                        }}
                      >
                        ₹
                        {Number(
                          category.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div
                      className="relative h-1.5 rounded-full overflow-hidden"
                      style={{
                        background:
                          "#f0f0ea",
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              category.pct
                            )
                          )}%`,
                          background:
                            category.color,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              No transaction data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}