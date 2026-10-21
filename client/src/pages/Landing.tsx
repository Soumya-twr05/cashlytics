import { useState } from "react";
import Logo from "../components/Logo";

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function Landing({ onGetStarted, onSignIn }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"spending" | "income">("spending");

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [activeNav, setActiveNav] = useState("Home");
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const navItems = [
    { label: "Home", id: "hero" },
    { label: "About", id: "how-it-works" },
    { label: "Services", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "Blog", id: "insights" },
    { label: "Contact", id: "contact" },
  ];

  const handleNavClick = (item: { label: string; id: string }) => {
    setActiveNav(item.label);
    scrollTo(item.id);
  };

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-[#F7F6F0] text-[#050505] antialiased selection:bg-[#C8FF45] selection:text-[#050505]">
      {/* ========================================================= */}
      {/* SLEEK DARK NAVIGATION BAR — CASHLYTICS PALETTE             */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => handleNavClick({ label: "Home", id: "hero" })}
          >
            <Logo size={30} showText={false} rounded="rounded-lg" />
            <span className="font-extrabold text-[15px] sm:text-base tracking-[0.14em] text-white font-mono uppercase group-hover:text-[#C8FF45] transition-colors">
              CASHLYTICS
            </span>
          </div>

          {/* Center: Horizontal Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-[#C8FF45] font-semibold"
                      : "text-[#A4A49C] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions (Sign In + Get Started + Moon Icon) */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button
              type="button"
              onClick={onSignIn}
              className="text-xs lg:text-sm font-medium text-[#A4A49C] hover:text-white transition-colors cursor-pointer px-2 py-1"
            >
              Sign In
            </button>

            {/* Signature Electric Lime Button matching Cashlytics Brand */}
            <button
              type="button"
              onClick={onGetStarted}
              className="text-xs lg:text-sm font-extrabold px-5 py-2.5 rounded-xl bg-[#C8FF45] text-[#050505] hover:bg-[#A8E63B] hover:shadow-lg hover:shadow-[#C8FF45]/25 transition-all transform active:scale-95 cursor-pointer shadow-sm"
            >
              Get Started
            </button>

            {/* Dark Theme / Moon Icon matching Cashlytics Brand */}
            <button
              type="button"
              onClick={() => setIsDarkTheme((prev) => !prev)}
              title={isDarkTheme ? "Switch theme" : "Dark theme"}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-[#A4A49C] hover:text-[#C8FF45] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>
          </div>

          {/* Mobile Actions: Moon Icon & Hamburger */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsDarkTheme((prev) => !prev)}
              aria-label="Toggle theme"
              className="p-2 text-[#A4A49C] hover:text-[#C8FF45]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              className="p-2 text-white cursor-pointer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 px-6 py-5 bg-[#050505]/98 backdrop-blur-lg space-y-3 text-sm">
            {navItems.map((item) => {
              const isActive = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`block w-full text-left py-1.5 transition-colors cursor-pointer ${
                    isActive ? "text-[#C8FF45] font-semibold" : "text-[#A4A49C] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onSignIn}
                className="w-full py-2.5 text-center font-medium text-white rounded-xl border border-white/15 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-2.5 text-center font-extrabold bg-[#C8FF45] hover:bg-[#A8E63B] text-[#050505] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-12 sm:space-y-16">
        {/* ========================================================= */}
        {/* HERO SECTION — EXACT MATCH WITH REFERENCE COMPOSITION     */}
        {/* ========================================================= */}
        <section id="hero" className="relative rounded-[28px] sm:rounded-[36px] bg-[#050505] text-white p-6 sm:p-10 lg:p-14 overflow-hidden border border-[#050505]">
          {/* Subtle Corner Glow */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none"
            style={{ background: "#C8FF45" }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Bold Typography & Actions */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#C8FF45] flex items-center justify-center font-bold text-[11px] text-[#050505] ring-2 ring-[#050505]">
                    C
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#1b3d2b] flex items-center justify-center font-bold text-[11px] text-[#C8FF45] ring-2 ring-[#050505]">
                    AI
                  </div>
                </div>
                <span className="text-xs font-mono text-[#A4A49C] tracking-wider uppercase">
                  Adaptive Personal Finance
                </span>
              </div>

              {/* Massive Reference Headline */}
              <h1 className="font-heading font-black tracking-[-0.04em] uppercase text-4xl sm:text-6xl lg:text-[76px] leading-[0.92] text-white">
                TRACK YOUR <br />
                <span className="text-[#C8FF45]">FINANCIAL</span> <br />
                ACTIVITY
              </h1>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-[#A4A49C] leading-relaxed max-w-lg">
                Understand your spending. Build better habits. Make confident financial decisions with Cashlytics.
              </p>

              {/* CTA Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="px-7 py-3.5 rounded-full font-extrabold text-sm bg-[#C8FF45] text-[#050505] hover:bg-[#A8E63B] transition-all transform active:scale-95 text-center cursor-pointer shadow-lg shadow-[#C8FF45]/15"
                >
                  Get Started for Free
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("features")}
                  className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  Explore Features
                  <span className="text-[#C8FF45]">→</span>
                </button>
              </div>

              {/* Verified Product Signal */}
              <div className="pt-4 flex items-center gap-4 text-xs font-mono text-[#A4A49C]">
                <div className="flex items-center text-[#C8FF45]">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-sm">{star}</span>
                  ))}
                  <span className="ml-2 font-bold text-white">4.9 / 5.0</span>
                </div>
                <span className="text-[#A4A49C]/40">|</span>
                <span>13 CANONICAL CATEGORIES</span>
              </div>
            </div>

            {/* Right Column: Hero Mobile / Dashboard Interface Mockup */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end z-10">
              <div className="w-full max-w-[340px] sm:max-w-[360px] rounded-[38px] bg-[#0D0E0D] border-[6px] border-[#1D1E1C] p-4 shadow-2xl shadow-black relative text-white">
                {/* Phone Notch/Speaker */}
                <div className="w-24 h-4 bg-[#1D1E1C] rounded-full mx-auto mb-4" />

                {/* Account Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div>
                    <div className="text-[11px] text-[#A4A49C] tracking-wide">Total Balance</div>
                    <div className="text-2xl font-bold font-mono tracking-tight text-white mt-0.5">
                      ₹78,450.00
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#1b3d2b] flex items-center justify-center text-[#C8FF45] font-bold text-xs">
                    ₹
                  </div>
                </div>

                {/* Virtual Card (Lime & Dark Pattern) */}
                <div className="rounded-2xl bg-gradient-to-br from-[#C8FF45] to-[#A8E63B] p-4 text-[#050505] mb-5 relative overflow-hidden shadow-md">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase">CASHLYTICS INTELLIGENCE</span>
                    <span className="text-xs font-bold">●●●</span>
                  </div>
                  <div className="mt-6 font-mono text-sm font-black tracking-wider">
                    **** 5678
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] font-semibold">
                    <span>MONTHLY SAVINGS</span>
                    <span className="font-mono">56.1% RATE</span>
                  </div>
                </div>

                {/* Income / Spending Segment Tabs */}
                <div className="flex rounded-xl bg-[#181917] p-1 mb-4 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("spending")}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                      activeTab === "spending"
                        ? "bg-[#C8FF45] text-[#050505]"
                        : "text-[#A4A49C] hover:text-white"
                    }`}
                  >
                    Spending
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("income")}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                      activeTab === "income"
                        ? "bg-[#C8FF45] text-[#050505]"
                        : "text-[#A4A49C] hover:text-white"
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Transactions Inside Phone Frame */}
                <div className="space-y-2 text-xs">
                  {/* Item 1 */}
                  <div className="p-2.5 rounded-xl bg-[#141513] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C8FF45]/15 text-[#C8FF45] flex items-center justify-center font-bold text-xs">
                        Z
                      </div>
                      <div>
                        <div className="font-semibold text-white">Zudio Surat</div>
                        <div className="text-[10px] text-[#A4A49C]">Shopping · ML 94%</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-white">
                      -₹799
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-2.5 rounded-xl bg-[#141513] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C8FF45]/15 text-[#C8FF45] flex items-center justify-center font-bold text-xs">
                        D
                      </div>
                      <div>
                        <div className="font-semibold text-white">DMart Grocery</div>
                        <div className="text-[10px] text-[#A4A49C]">Groceries · ML 98%</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-white">
                      -₹2,140
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-2.5 rounded-xl bg-[#141513] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C8FF45]/15 text-[#C8FF45] flex items-center justify-center font-bold text-xs">
                        S
                      </div>
                      <div>
                        <div className="font-semibold text-white">Swiggy Delivery</div>
                        <div className="text-[10px] text-[#A4A49C]">Food & Dining · ML 98%</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-white">
                      -₹420
                    </div>
                  </div>
                </div>

                {/* Bottom Bar Pill */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A4A49C]">
                  <span className="flex items-center gap-1.5 text-[#C8FF45]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF45] animate-pulse" />
                    Automated Ingestion
                  </span>
                  <span>UPI / SMS / CSV</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* MINIMAL CREDIBILITY AND FEATURE STRIP                     */}
        {/* ========================================================= */}
        <section className="py-2 border-y border-[#050505]/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-semibold uppercase text-[#050505]">
              <span className="text-[#A8E63B] text-base">✦</span>
              Smart Expense Tracking
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-semibold uppercase text-[#050505]">
              <span className="text-[#A8E63B] text-base">✦</span>
              Budget Planning
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-semibold uppercase text-[#050505]">
              <span className="text-[#A8E63B] text-base">✦</span>
              Spending Insights
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-semibold uppercase text-[#050505]">
              <span className="text-[#A8E63B] text-base">✦</span>
              Financial Goals
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* EDITORIAL IMPACT SECTION — ASYMMETRIC REFERENCE COMPOSITION */}
        {/* ========================================================= */}
        <section id="how-it-works" className="py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Big Typography */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tighter text-[#050505]">
                100%
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase leading-[0.95] text-[#050505]">
                FINANCIAL <br />
                FREEDOM <br />
                STARTS HERE
              </h2>
              <p className="text-sm sm:text-base text-[#6E6E66] max-w-md leading-relaxed">
                See where your money goes. Understand your habits. Plan what comes next.
              </p>
            </div>

            {/* Right Staggered Editorial Cards */}
            <div className="lg:col-span-6 space-y-4">
              {/* Card 01 — Lime Green Card */}
              <div className="rounded-2xl p-6 bg-[#C8FF45] text-[#050505] space-y-3 shadow-sm transform lg:translate-x-4">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span>01</span>
                  <span>INSIGHTS</span>
                </div>
                <h3 className="font-heading font-extrabold uppercase text-lg sm:text-xl leading-tight">
                  OUR APPROACH IS DRIVEN BY REAL-TIME FINANCIAL CONTEXT
                </h3>
                <p className="text-xs text-[#050505]/80 font-medium">
                  We translate every incoming debit and credit into canonical categories, giving you clarity on daily burn rates without manual spreadsheets.
                </p>
              </div>

              {/* Card 02 — Dark Card */}
              <div className="rounded-2xl p-6 bg-[#050505] text-white space-y-3 shadow-md transform lg:translate-x-12">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#A4A49C]">
                  <span>02</span>
                  <span className="text-[#C8FF45]">ML ENGINE</span>
                </div>
                <h3 className="font-heading font-extrabold uppercase text-lg sm:text-xl leading-tight">
                  WE TAKE THE TIME TO UNDERSTAND YOUR UNIQUE CASH FLOW
                </h3>
                <p className="text-xs text-[#A4A49C] leading-relaxed">
                  Machine learning models adapt to your corrections permanently. Correct an Indian merchant once, and it remembers forever.
                </p>
              </div>

              {/* Card 03 — Dark Card */}
              <div className="rounded-2xl p-6 bg-[#050505] text-white space-y-3 shadow-md transform lg:translate-x-20">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#A4A49C]">
                  <span>03</span>
                  <span className="text-[#C8FF45]">SECURITY</span>
                </div>
                <h3 className="font-heading font-extrabold uppercase text-lg sm:text-xl leading-tight">
                  WE PRIORITIZE THE INTEGRITY OF YOUR FINANCIAL DATA
                </h3>
                <p className="text-xs text-[#A4A49C] leading-relaxed">
                  Tokenized sessions, zero storage of banking passwords, and localized preferences ensure your private financial profile stays protected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FINANCIAL INTELLIGENCE SECTION                             */}
        {/* ========================================================= */}
        <section id="features" className="py-8 sm:py-12 border-t border-[#050505]/10">
          <div className="space-y-8">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#2E7D32]">
                CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase leading-none text-[#050505] mt-2">
                YOUR MONEY. <br />
                YOUR NEXT MOVE.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 sm:p-8 rounded-[24px] bg-[#050505] text-white space-y-4 border border-[#050505]">
                <div className="w-10 h-10 rounded-xl bg-[#C8FF45] text-[#050505] flex items-center justify-center font-bold text-lg font-heading">
                  1
                </div>
                <h3 className="text-lg font-heading font-extrabold uppercase text-white tracking-wide">
                  Track with clarity
                </h3>
                <p className="text-xs sm:text-sm text-[#A4A49C] leading-relaxed">
                  Review income, expenses, and transaction history in one centralized ledger. Filter by 13 canonical categories and verify confidence levels in real time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 sm:p-8 rounded-[24px] bg-[#050505] text-white space-y-4 border border-[#050505]">
                <div className="w-10 h-10 rounded-xl bg-[#C8FF45] text-[#050505] flex items-center justify-center font-bold text-lg font-heading">
                  2
                </div>
                <h3 className="text-lg font-heading font-extrabold uppercase text-white tracking-wide">
                  Understand your habits
                </h3>
                <p className="text-xs sm:text-sm text-[#A4A49C] leading-relaxed">
                  Explore category velocity charts, monthly trends, and recurring merchant patterns. Know exactly whether dining or shopping drives your discretionary budget.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 sm:p-8 rounded-[24px] bg-[#050505] text-white space-y-4 border border-[#050505]">
                <div className="w-10 h-10 rounded-xl bg-[#C8FF45] text-[#050505] flex items-center justify-center font-bold text-lg font-heading">
                  3
                </div>
                <h3 className="text-lg font-heading font-extrabold uppercase text-white tracking-wide">
                  Plan ahead
                </h3>
                <p className="text-xs sm:text-sm text-[#A4A49C] leading-relaxed">
                  Manage proactive monthly budgets and track milestones for emergency funds or investments. Simulate lifestyle shifts before committing real funds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PRODUCT SHOWCASE — MATCHING LOWER VISUAL GRID              */}
        {/* ========================================================= */}
        <section id="insights" className="py-8 sm:py-12 border-t border-[#050505]/10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Panel 1: Transactions & Security (Left Panel) */}
            <div className="lg:col-span-6 rounded-[28px] bg-[#050505] text-white p-6 sm:p-10 flex flex-col justify-between border border-[#050505]">
              {/* Mini Interactive Preview */}
              <div className="p-4 rounded-2xl bg-[#0F100E] border border-white/5 space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Smart Categorization Engine</span>
                  <span className="text-[#C8FF45] font-mono text-[11px]">Active</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-[#181916] flex justify-between">
                    <span>Zudio Apparel Purchase</span>
                    <span className="text-[#C8FF45] font-mono">Shopping · 94%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181916] flex justify-between">
                    <span>Swiggy Dinner Order</span>
                    <span className="text-[#C8FF45] font-mono">Food & Dining · 98%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181916] flex justify-between">
                    <span>DMart Essentials</span>
                    <span className="text-[#C8FF45] font-mono">Groceries · 98%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
                  SECURE YOUR FINANCIAL FUTURE
                </h3>
                <p className="text-xs sm:text-sm text-[#A4A49C] leading-relaxed mt-2">
                  Track every transaction with automated classification and understand real-time expense ratios across lifestyle categories.
                </p>
              </div>
            </div>

            {/* Panel 2: Goals & What-If Simulation (Right Panel) */}
            <div className="lg:col-span-6 rounded-[28px] bg-[#050505] text-white p-6 sm:p-10 flex flex-col justify-between border border-[#050505]">
              {/* Visual Goals & Milestone Gauge */}
              <div className="p-4 rounded-2xl bg-[#0F100E] border border-white/5 space-y-4 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Active Savings Targets</span>
                  <span className="text-[#C8FF45] font-mono text-[11px]">₹68,000 / ₹1,00,000</span>
                </div>

                <div className="h-3 rounded-full bg-[#1F201D] overflow-hidden">
                  <div className="h-full bg-[#C8FF45] rounded-full" style={{ width: "68%" }} />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-[#A4A49C]">
                  <span>Emergency Fund: 68%</span>
                  <span className="text-white">+₹6,800 this month</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
                  PLAN SMARTER. REACH YOUR GOALS.
                </h3>
                <p className="text-xs sm:text-sm text-[#A4A49C] leading-relaxed mt-2">
                  Set realistic budgets, project savings with the What-If calculator, and keep milestone funds on steady progress.
                </p>
              </div>
            </div>
          </div>

          {/* Panel 3: Bottom Full-Width Feature Card matching Reference Lower Section */}
          <div id="benefits" className="rounded-[28px] bg-[#050505] text-white p-6 sm:p-10 border border-[#050505]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono font-bold text-[#C8FF45] uppercase tracking-wider">
                  AI & CONTEXTUAL GUIDANCE
                </span>
                <h3 className="text-2xl sm:text-4xl font-heading font-black uppercase text-white tracking-tight leading-tight">
                  EMPOWERING YOU TO ACHIEVE YOUR GOALS
                </h3>
                <p className="text-xs sm:text-sm text-[#A4A49C] leading-relaxed max-w-lg">
                  Cashlytics pairs machine learning categorization with a contextual financial assistant that answers queries based on your verified account data.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-[#C8FF45]">
                  <span className="px-3 py-1 rounded-full bg-[#181916] border border-[#C8FF45]/20">✓ 13 Categories</span>
                  <span className="px-3 py-1 rounded-full bg-[#181916] border border-[#C8FF45]/20">✓ What-If Simulator</span>
                  <span className="px-3 py-1 rounded-full bg-[#181916] border border-[#C8FF45]/20">✓ Contextual AI</span>
                </div>
              </div>

              <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0F100E] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#A4A49C]">
                  <span className="w-2 h-2 rounded-full bg-[#C8FF45]" />
                  <span>Assistant Query Example</span>
                </div>
                <div className="text-xs font-mono text-white p-2.5 rounded-lg bg-[#181916]">
                  "Where did I overspend this month compared to my budget?"
                </div>
                <div className="text-xs text-[#A4A49C] p-2.5 rounded-lg bg-[#141512] border border-white/5 leading-relaxed">
                  "Shopping exceeded its ₹8,000 cap by ₹900. Your dining and groceries are currently within limits."
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PRICING PLANS SECTION                                     */}
        {/* ========================================================= */}
        <section id="pricing" className="py-8 sm:py-12 border-t border-[#050505]/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#15803D]">
              TRANSPARENT PRICING
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase leading-none text-[#050505]">
              SIMPLE PLANS. <br />
              POWERFUL INSIGHTS.
            </h2>
            <p className="text-sm text-[#6E6E66]">
              Choose the plan that fits your financial journey. Upgrade or cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Free */}
            <div className="rounded-[28px] bg-[#050505] text-white p-7 flex flex-col justify-between border border-white/10 space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Starter</span>
                <div className="text-3xl font-black font-mono">₹0 <span className="text-xs text-zinc-400 font-sans font-normal">/ forever</span></div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Basic transaction tracking and automated category tagging for personal budgeting.
                </p>
                <div className="pt-2 space-y-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">✓ Up to 100 transactions/mo</div>
                  <div className="flex items-center gap-2">✓ 13 canonical categories</div>
                  <div className="flex items-center gap-2">✓ CSV & SMS upload</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl border border-white/20 text-white font-semibold text-xs hover:bg-white/10 transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="rounded-[28px] bg-[#0A0C0A] text-white p-7 flex flex-col justify-between border-2 border-[#C8FF45] relative shadow-xl shadow-[#C8FF45]/10 space-y-6">
              <div className="absolute -top-3 right-6 bg-[#C8FF45] text-[#050505] text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <span className="text-xs font-mono text-[#C8FF45] uppercase tracking-wider">Pro Intelligence</span>
                <div className="text-3xl font-black font-mono">₹299 <span className="text-xs text-zinc-400 font-sans font-normal">/ month</span></div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Contextual AI financial assistant, What-If simulator & unlimited transactions.
                </p>
                <div className="pt-2 space-y-2 text-xs text-zinc-200">
                  <div className="flex items-center gap-2 text-[#C8FF45]">✓ Everything in Starter</div>
                  <div className="flex items-center gap-2">✓ Unlimited AI Assistant queries</div>
                  <div className="flex items-center gap-2">✓ What-If scenario simulator</div>
                  <div className="flex items-center gap-2">✓ Real-time anomaly alerts</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl bg-[#C8FF45] hover:bg-[#A8E63B] text-[#050505] font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Start Free 14-Day Trial
              </button>
            </div>

            {/* Lifetime Access */}
            <div className="rounded-[28px] bg-[#050505] text-white p-7 flex flex-col justify-between border border-white/10 space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Lifetime Pass</span>
                <div className="text-3xl font-black font-mono">₹2,499 <span className="text-xs text-zinc-400 font-sans font-normal">/ one-time</span></div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Pay once, own forever. Full access to all current and future intelligence features.
                </p>
                <div className="pt-2 space-y-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">✓ All Pro features forever</div>
                  <div className="flex items-center gap-2">✓ Priority model responses</div>
                  <div className="flex items-center gap-2">✓ Early access to new tools</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl border border-white/20 text-white font-semibold text-xs hover:bg-white/10 transition-colors cursor-pointer"
              >
                Get Lifetime Access
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FINAL CALL TO ACTION                                       */}
        {/* ========================================================= */}
        <section className="rounded-[28px] sm:rounded-[36px] bg-[#050505] text-white p-8 sm:p-14 lg:p-16 text-center space-y-6 border border-[#050505] relative overflow-hidden">
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[120px] opacity-20 pointer-events-none"
            style={{ background: "#C8FF45" }}
          />

          <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-white tracking-tight leading-tight max-w-3xl mx-auto">
            YOUR MONEY DESERVES A <span className="text-[#C8FF45]">BETTER PLAN</span>.
          </h2>

          <p className="text-sm sm:text-base text-[#A4A49C] max-w-md mx-auto leading-relaxed">
            Start understanding your finances with Cashlytics.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="px-8 py-3.5 rounded-full font-extrabold text-sm bg-[#C8FF45] text-[#050505] hover:bg-[#A8E63B] transition-all transform active:scale-95 cursor-pointer shadow-lg shadow-[#C8FF45]/20"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="text-sm font-semibold text-[#A4A49C] hover:text-white px-4 py-2 transition-colors cursor-pointer"
            >
              Already have an account? Sign In
            </button>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* MINIMAL FOOTER                                            */}
      {/* ========================================================= */}
      <footer id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12 border-t border-[#050505]/10 text-xs text-[#6E6E66] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo size={20} showText={true} rounded="rounded" />
          <span className="text-[#A4A49C]">· Personal Finance Intelligence</span>
        </div>
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => scrollTo("features")} className="hover:text-[#050505] cursor-pointer">
            Features
          </button>
          <button type="button" onClick={() => scrollTo("how-it-works")} className="hover:text-[#050505] cursor-pointer">
            How It Works
          </button>
          <button type="button" onClick={() => scrollTo("insights")} className="hover:text-[#050505] cursor-pointer">
            Insights
          </button>
          <button type="button" onClick={onSignIn} className="hover:text-[#050505] cursor-pointer">
            Sign In
          </button>
        </div>
        <div className="font-mono text-[11px] text-[#A4A49C]">
          © {new Date().getFullYear()} Cashlytics.
        </div>
      </footer>
    </div>
  );
}
