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

export type AppView = "landing" | "auth" | "onboarding" | "app";

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [page, setPage] = useState<Page>("overview");
  const { isAuthenticated, loading, onboardingCompleted, markOnboardingComplete } = useAuth();

  // Show loading screen while checking auth
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
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#052e16",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            C
          </div>
          <p style={{ color: "var(--muted-foreground)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, determine whether to show onboarding or app
  if (isAuthenticated) {
    if (!onboardingCompleted) {
      return (
        <Onboarding
          onComplete={() => {
            markOnboardingComplete();
            setView("app");
            setPage("overview");
          }}
        />
      );
    }

    // User is authenticated and onboarding is complete, show app
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
      <Layout page={page} onNavigate={setPage} onSignOut={() => setView("landing")}>
        {renderPage()}
      </Layout>
    );
  }

  // Not authenticated - show landing or auth
  if (view === "landing") {
    return (
      <Landing
        onGetStarted={() => setView("auth")}
        onSignIn={() => setView("auth")}
      />
    );
  }

  if (view === "auth") {
    return (
      <Auth
        onSignInSuccess={(onboardingCompleted) => {
          // If user already completed onboarding, go directly to app
          if (onboardingCompleted) {
            setView("app");
            setPage("overview");
          }
          // Otherwise, onboarding will be shown via the isAuthenticated check above
        }}
        onGuestStart={() => {
          // Guest users skip onboarding and go directly to app
          setView("app");
          setPage("overview");
        }}
      />
    );
  }

  return null;
}
