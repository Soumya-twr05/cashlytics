// import { useEffect, useState } from "react";
// import type { Page } from "../App";

// interface NavItem {
//   id: Page | "bills";
//   label: string;
//   icon: React.ReactNode;
//   badge?: string;
//   group?: string;
// }

// const NAV_ITEMS: NavItem[] = [
//   {
//     id: "overview", label: "Overview",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
//   },
//   {
//     id: "transactions", label: "Transactions",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
//   },
//   {
//     id: "smart-capture", label: "Smart Capture", badge: "7 NEW",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12z"/><path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/><path d="M12 8v-2M12 18v-2M8 12H6M18 12h-2"/></svg>,
//   },
//   {
//     id: "learning", label: "Adaptive Learning",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.85.99 6.57 2.61"/><path d="M21 3v4h-4"/></svg>,
//   },
//   {
//     id: "intelligence", label: "Financial Intelligence",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-8"/></svg>,
//   },
//   {
//     id: "simulator", label: "What-If Simulator",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
//   },
//   {
//     id: "analytics", label: "Analytics",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
//   },
//   {
//     id: "budgets", label: "Budgets",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
//   },
//   {
//     id: "goals", label: "Goals",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
//   },
//   {
//     id: "bills", label: "Bills & Subscriptions",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
//   },
//   {
//     id: "ai-assistant", label: "Ask Cashlytics",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
//   },
//   {
//     id: "profile", label: "Settings",
//     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
//   },
// ];

// const PAGE_LABELS: Record<string, string> = {
//   overview: "OVERVIEW",
//   transactions: "TRANSACTIONS",
//   "smart-capture": "SMART CAPTURE",
//   learning: "ADAPTIVE LEARNING",
//   intelligence: "FINANCIAL INTELLIGENCE",
//   simulator: "WHAT-IF SIMULATOR",
//   analytics: "ANALYTICS",
//   budgets: "BUDGETS",
//   goals: "GOALS",
//   bills: "BILLS & SUBSCRIPTIONS",
//   "ai-assistant": "ASK CASHLYTICS",
//   profile: "SETTINGS",
// };

// interface LayoutProps {
//   page: Page;
//   onNavigate: (page: Page) => void;
//   onSignOut: () => void;
//   children: React.ReactNode;
// }

// export default function Layout({ page, onNavigate, onSignOut, children }: LayoutProps) {
//   const [navOpen, setNavOpen] = useState(false);

//   useEffect(() => {
//     const onResize = () => {
//       if (window.matchMedia("(min-width: 1024px)").matches) setNavOpen(false);
//     };
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   useEffect(() => {
//     if (!navOpen) return;
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setNavOpen(false);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [navOpen]);

//   const goTo = (id: Page) => {
//     onNavigate(id);
//     setNavOpen(false);
//   };

//   return (
//     <div className="flex h-full overflow-hidden" style={{ background: "var(--background)" }}>
//       {navOpen && (
//         <button
//           type="button"
//           aria-label="Close navigation"
//           className="fixed inset-0 z-40 lg:hidden"
//           style={{ background: "rgba(0,0,0,0.45)" }}
//           onClick={() => setNavOpen(false)}
//         />
//       )}

//       <aside
//         className={`flex flex-col shrink-0 overflow-hidden fixed inset-y-0 left-0 z-50 w-[min(88vw,280px)] max-w-[280px] transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-[232px] lg:max-w-none lg:translate-x-0 ${
//           navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//         }`}
//         style={{ background: "var(--sidebar)" }}
//       >
//         <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
//           <div
//             className="flex items-center justify-center rounded shrink-0"
//             style={{ width: "32px", height: "32px", background: "rgba(13,158,126,0.25)", border: "1px solid rgba(13,158,126,0.4)" }}
//           >
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0d9e7e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//           </div>
//           <div className="min-w-0 flex-1">
//             <div className="font-bold text-sm tracking-tight leading-none" style={{ color: "#ffffff" }}>
//               CASHLYTICS
//             </div>
//             <div className="text-xs mt-0.5 tracking-wider" style={{ color: "rgba(200,221,210,0.6)", fontSize: "9px", letterSpacing: "0.1em" }}>
//               ADAPTIVE FINANCE
//             </div>
//           </div>
//           <button
//             type="button"
//             className="lg:hidden flex items-center justify-center rounded-md shrink-0"
//             style={{ width: "34px", height: "34px", color: "rgba(200,221,210,0.85)", border: "1px solid rgba(255,255,255,0.16)" }}
//             aria-label="Close menu"
//             onClick={() => setNavOpen(false)}
//           >
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//               <path d="M18 6L6 18M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <nav className="flex-1 overflow-y-auto py-4 px-3">
//           <div className="text-xs font-semibold mb-3 px-2" style={{ color: "rgba(200,221,210,0.45)", fontSize: "9px", letterSpacing: "0.12em" }}>
//             WORKSPACE
//           </div>
//           <div className="space-y-0.5">
//             {NAV_ITEMS.map((item) => {
//               const active = page === item.id || (item.id === "bills" && page === "bills");
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => goTo(item.id as Page)}
//                   className={`nav-item flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-left text-sm ${active ? "nav-item-active" : ""}`}
//                 >
//                   <span className="nav-item-icon shrink-0" style={{ color: active ? "#1b3d2b" : "rgba(200,221,210,0.6)" }}>
//                     {item.icon}
//                   </span>
//                   <span className="flex-1 truncate" style={{ fontSize: "14px" }}>{item.label}</span>
//                   {item.badge && (
//                     <span
//                       className="text-xs font-semibold rounded px-1.5 py-0.5 shrink-0"
//                       style={{
//                         background: active ? "rgba(13,158,126,0.15)" : "rgba(13,158,126,0.2)",
//                         color: active ? "#0d9e7e" : "#4ecca3",
//                         fontSize: "9px",
//                         letterSpacing: "0.04em",
//                       }}
//                     >
//                       {item.badge}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </nav>
//       </aside>

//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         <header
//           className="flex items-center justify-between gap-3 px-3 sm:px-5 lg:px-8 shrink-0"
//           style={{ minHeight: "56px", background: "var(--header-bg)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
//         >
//           <div className="flex items-center gap-2 min-w-0">
//             <button
//               type="button"
//               className="lg:hidden flex items-center justify-center rounded-md shrink-0"
//               style={{ width: "36px", height: "36px", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(200,221,210,0.9)" }}
//               aria-label={navOpen ? "Close menu" : "Open menu"}
//               aria-expanded={navOpen}
//               onClick={() => setNavOpen((open) => !open)}
//             >
//               {navOpen ? (
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                   <path d="M18 6L6 18M6 6l12 12" />
//                 </svg>
//               ) : (
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                   <path d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               )}
//             </button>
//             <div className="min-w-0">
//               <div className="text-xs font-semibold tracking-widest truncate" style={{ color: "rgba(200,221,210,0.5)", fontSize: "9px", letterSpacing: "0.15em" }}>
//                 WORKSPACE / {PAGE_LABELS[page] || "OVERVIEW"}
//               </div>
//               <div className="text-xs mt-0.5 hidden sm:block" style={{ color: "rgba(200,221,210,0.45)", fontSize: "12px" }}>
//                 Your financial system is observing · Last sync 2 min ago
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
//             <button
//               className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium"
//               style={{
//                 border: "1px solid rgba(255,255,255,0.18)",
//                 color: "rgba(200,221,210,0.85)",
//                 background: "transparent",
//                 fontSize: "13px",
//               }}
//             >
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M21 12a9 9 0 11-9-9c2.52 0 4.85.99 6.57 2.61"/><path d="M21 3v4h-4"/>
//               </svg>
//               Sync feeds
//             </button>
//             <button
//               className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium"
//               style={{
//                 border: "1px solid rgba(255,255,255,0.18)",
//                 color: "rgba(200,221,210,0.85)",
//                 background: "transparent",
//                 fontSize: "13px",
//               }}
//             >
//               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
//               </svg>
//               Run simulation
//             </button>
//             <button
//               className="relative flex items-center justify-center rounded-md"
//               style={{ width: "34px", height: "34px", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(200,221,210,0.7)" }}
//             >
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
//               </svg>
//               <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#f87171" }} />
//             </button>
//             <button
//               onClick={onSignOut}
//               className="flex items-center justify-center rounded-md text-xs font-bold"
//               style={{ width: "34px", height: "34px", background: "rgba(13,158,126,0.25)", color: "#0d9e7e", border: "1px solid rgba(13,158,126,0.3)" }}
//             >
//               A
//             </button>
//           </div>
//         </header>

//         <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0" style={{ background: "var(--background)" }}>
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }



import { useEffect, useRef, useState } from "react";
import type { Page } from "../App";

interface NavItem {
  id: Page | "bills";
  label: string;
  icon: React.ReactNode;
  badge?: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    id: "smart-capture",
    label: "Smart Capture",
    badge: "7 NEW",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12z" />
        <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" />
        <path d="M12 8v-2M12 18v-2M8 12H6M18 12h-2" />
      </svg>
    ),
  },
  {
    id: "learning",
    label: "Adaptive Learning",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-9-9c2.52 0 4.85.99 6.57 2.61" />
        <path d="M21 3v4h-4" />
      </svg>
    ),
  },
  {
    id: "intelligence",
    label: "Financial Intelligence",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-8" />
      </svg>
    ),
  },
  {
    id: "simulator",
    label: "What-If Simulator",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: "budgets",
    label: "Budgets",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: "goals",
    label: "Goals",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "bills",
    label: "Bills & Subscriptions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    id: "ai-assistant",
    label: "Ask Cashlytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

const PAGE_LABELS: Record<string, string> = {
  overview: "OVERVIEW",
  transactions: "TRANSACTIONS",
  "smart-capture": "SMART CAPTURE",
  learning: "ADAPTIVE LEARNING",
  intelligence: "FINANCIAL INTELLIGENCE",
  simulator: "WHAT-IF SIMULATOR",
  analytics: "ANALYTICS",
  budgets: "BUDGETS",
  goals: "GOALS",
  bills: "BILLS & SUBSCRIPTIONS",
  "ai-assistant": "ASK CASHLYTICS",
  profile: "SETTINGS",
};

interface LayoutProps {
  page: Page;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

export default function Layout({
  page,
  onNavigate,
  onSignOut,
  children,
}: LayoutProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setNavOpen(false);
      }
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!navOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNavOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  // Close profile menu with Escape
  useEffect(() => {
    if (!profileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [profileOpen]);

  const goTo = (id: Page) => {
    onNavigate(id);
    setNavOpen(false);
  };

  const handleProfile = () => {
    setProfileOpen(false);
    onNavigate("profile");
  };

  const handleSignOut = () => {
    setProfileOpen(false);
    onSignOut();
  };

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={`flex flex-col shrink-0 overflow-hidden fixed inset-y-0 left-0 z-50 w-[min(88vw,280px)] max-w-[280px] transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-[232px] lg:max-w-none lg:translate-x-0 ${
          navOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "var(--sidebar)" }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="flex items-center justify-center rounded shrink-0"
            style={{
              width: "32px",
              height: "32px",
              background: "rgba(13,158,126,0.25)",
              border: "1px solid rgba(13,158,126,0.4)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#0d9e7e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="font-bold text-sm tracking-tight leading-none"
              style={{ color: "#ffffff" }}
            >
              CASHLYTICS
            </div>

            <div
              className="text-xs mt-0.5 tracking-wider"
              style={{
                color: "rgba(200,221,210,0.6)",
                fontSize: "9px",
                letterSpacing: "0.1em",
              }}
            >
              ADAPTIVE FINANCE
            </div>
          </div>

          <button
            type="button"
            className="lg:hidden flex items-center justify-center rounded-md shrink-0"
            style={{
              width: "34px",
              height: "34px",
              color: "rgba(200,221,210,0.85)",
              border: "1px solid rgba(255,255,255,0.16)",
            }}
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div
            className="text-xs font-semibold mb-3 px-2"
            style={{
              color: "rgba(200,221,210,0.45)",
              fontSize: "9px",
              letterSpacing: "0.12em",
            }}
          >
            WORKSPACE
          </div>

          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active =
                page === item.id ||
                (item.id === "bills" && page === "bills");

              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.id as Page)}
                  className={`nav-item flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-left text-sm ${
                    active ? "nav-item-active" : ""
                  }`}
                >
                  <span
                    className="nav-item-icon shrink-0"
                    style={{
                      color: active
                        ? "#1b3d2b"
                        : "rgba(200,221,210,0.6)",
                    }}
                  >
                    {item.icon}
                  </span>

                  <span
                    className="flex-1 truncate"
                    style={{ fontSize: "14px" }}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className="text-xs font-semibold rounded px-1.5 py-0.5 shrink-0"
                      style={{
                        background: active
                          ? "rgba(13,158,126,0.15)"
                          : "rgba(13,158,126,0.2)",
                        color: active ? "#0d9e7e" : "#4ecca3",
                        fontSize: "9px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="flex items-center justify-between gap-3 px-3 sm:px-5 lg:px-8 shrink-0"
          style={{
            minHeight: "56px",
            background: "var(--header-bg)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="lg:hidden flex items-center justify-center rounded-md shrink-0"
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(200,221,210,0.9)",
              }}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((open) => !open)}
            >
              {navOpen ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <div className="min-w-0">
              <div
                className="text-xs font-semibold tracking-widest truncate"
                style={{
                  color: "rgba(200,221,210,0.5)",
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                }}
              >
                WORKSPACE / {PAGE_LABELS[page] || "OVERVIEW"}
              </div>

              <div
                className="text-xs mt-0.5 hidden sm:block"
                style={{
                  color: "rgba(200,221,210,0.45)",
                  fontSize: "12px",
                }}
              >
                Your financial system is observing · Last sync 2 min ago
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium"
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(200,221,210,0.85)",
                background: "transparent",
                fontSize: "13px",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 11-9-9c2.52 0 4.85.99 6.57 2.61" />
                <path d="M21 3v4h-4" />
              </svg>
              Sync feeds
            </button>

            <button
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium"
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(200,221,210,0.85)",
                background: "transparent",
                fontSize: "13px",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              Run simulation
            </button>

            <button
              className="relative flex items-center justify-center rounded-md"
              style={{
                width: "34px",
                height: "34px",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(200,221,210,0.7)",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>

              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#f87171" }}
              />
            </button>

            {/* PROFILE / ACCOUNT MENU */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className="flex items-center justify-center rounded-md text-xs font-bold transition-all duration-150"
                style={{
                  width: "36px",
                  height: "36px",
                  background: profileOpen
                    ? "rgba(13,158,126,0.4)"
                    : "rgba(13,158,126,0.25)",
                  color: "#0d9e7e",
                  border: "1px solid rgba(13,158,126,0.4)",
                }}
              >
                A
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[230px] overflow-hidden rounded-xl shadow-2xl"
                  style={{
                    background: "#10231d",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow:
                      "0 18px 45px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Account header */}
                  <div
                    className="px-4 py-3.5"
                    style={{
                      borderBottom:
                        "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0 font-bold text-sm"
                        style={{
                          width: "38px",
                          height: "38px",
                          background:
                            "rgba(13,158,126,0.22)",
                          color: "#4ecca3",
                          border:
                            "1px solid rgba(13,158,126,0.35)",
                        }}
                      >
                        A
                      </div>

                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: "#ffffff" }}
                        >
                          Account
                        </div>

                        <div
                          className="text-xs truncate mt-0.5"
                          style={{
                            color:
                              "rgba(200,221,210,0.55)",
                          }}
                        >
                          Cashlytics user
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleProfile}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors"
                      style={{
                        color:
                          "rgba(230,245,238,0.9)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.07)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "transparent";
                      }}
                    >
                      <span
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: "30px",
                          height: "30px",
                          color: "#4ecca3",
                        }}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 21c0-4 3.2-7 8-7s8 3 8 7" />
                        </svg>
                      </span>

                      <span className="flex-1">
                        <span
                          className="block text-sm font-medium"
                          style={{ color: "#ffffff" }}
                        >
                          Profile
                        </span>

                        <span
                          className="block text-xs mt-0.5"
                          style={{
                            color:
                              "rgba(200,221,210,0.48)",
                          }}
                        >
                          Account & preferences
                        </span>
                      </span>

                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          color:
                            "rgba(200,221,210,0.35)",
                        }}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors"
                      style={{
                        color: "#fca5a5",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(248,113,113,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "transparent";
                      }}
                    >
                      <span
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: "30px",
                          height: "30px",
                          color: "#f87171",
                        }}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 17l5-5-5-5" />
                          <path d="M15 12H3" />
                          <path d="M21 19V5a2 2 0 00-2-2h-6" />
                        </svg>
                      </span>

                      <span className="flex-1">
                        <span
                          className="block text-sm font-medium"
                          style={{ color: "#fca5a5" }}
                        >
                          Log out
                        </span>

                        <span
                          className="block text-xs mt-0.5"
                          style={{
                            color:
                              "rgba(252,165,165,0.5)",
                          }}
                        >
                          Sign out of Cashlytics
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
          style={{ background: "var(--background)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}