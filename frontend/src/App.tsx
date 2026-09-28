import { useState } from "react";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
import SmartCapture from "./pages/SmartCapture";
import FinancialIntelligence from "./pages/FinancialIntelligence";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import AIAssistant from "./pages/AIAssistant";
import AdaptiveLearning from "./pages/AdaptiveLearning";
import WhatIfSimulator from "./pages/WhatIfSimulator";
import Profile from "./pages/Profile";

import { useAuth } from "./lib/auth-context";

export type Page =
  | "overview"
  | "transactions"
  | "smart-capture"
  | "intelligence"
  | "analytics"
  | "budgets"
  | "goals"
  | "bills"
  | "ai-assistant"
  | "learning"
  | "simulator"
  | "profile";

export type AppView =
  | "landing"
  | "auth"
  | "onboarding"
  | "app";

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [page, setPage] = useState<Page>("overview");

  /*
   * This remembers how the current authentication happened.
   *
   * signin → existing user → Dashboard
   * signup → new user → Onboarding
   * null   → normal authenticated app / guest
   */
  const [authMode, setAuthMode] = useState<
    "signin" | "signup" | null
  >(null);

  const {
    isAuthenticated,
    loading,
    onboardingCompleted,
    markOnboardingComplete,
    logout,
  } = useAuth();

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
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
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            C
          </div>

          <p style={{ color: "var(--muted-foreground)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Authenticated user
  // ---------------------------------------------------------

  if (isAuthenticated) {
    if (!onboardingCompleted) {
      return (
        <Onboarding
          onComplete={() => {
            markOnboardingComplete();
            setAuthMode(null);
            setView("app");
            setPage("overview");
          }}
        />
      );
    }

    // -------------------------------------------------------
    // Render application pages
    // -------------------------------------------------------

    const renderPage = () => {
      switch (page) {
        case "overview":
          return <Dashboard onNavigate={setPage} />;

        case "transactions":
          return <TransactionsPage />;

        case "smart-capture":
          return <SmartCapture />;

        case "intelligence":
          return <FinancialIntelligence />;

        case "analytics":
          return <Analytics />;

        case "budgets":
          return <Budgets />;

        case "goals":
          return <Goals />;

        case "ai-assistant":
          return <AIAssistant />;

        case "learning":
          return <AdaptiveLearning />;

        case "simulator":
          return <WhatIfSimulator />;

        case "profile":
          return <Profile />;

        case "bills":
          return <Budgets />;

        default:
          return <Dashboard onNavigate={setPage} />;
      }
    };

    return (
      <Layout
        page={page}
        onNavigate={setPage}
        onSignOut={() => {
          logout();
          setAuthMode(null);
          setView("landing");
          setPage("overview");
        }}
      >
        {renderPage()}
      </Layout>
    );
  }

  // ---------------------------------------------------------
  // Not authenticated → Landing
  // ---------------------------------------------------------

  if (view === "landing") {
    return (
      <Landing
        onGetStarted={() => {
          setAuthMode(null);
          setView("auth");
        }}
        onSignIn={() => {
          setAuthMode("signin");
          setView("auth");
        }}
      />
    );
  }

  // ---------------------------------------------------------
  // Authentication page
  // ---------------------------------------------------------

  if (view === "auth") {
    return (
      <Auth
        onSignInSuccess={(
          onboardingCompletedFromAuth,
          mode
        ) => {
          const currentMode = mode ?? "signin";

          setAuthMode(currentMode);
          setPage("overview");

          if (onboardingCompletedFromAuth) {
            setAuthMode(null);
          }

          setView("app");
        }}
        onGuestStart={() => {
          /*
           * Guest users don't need onboarding.
           */
          setAuthMode(null);
          setView("app");
          setPage("overview");
        }}
      />
    );
  }

  return null;
}