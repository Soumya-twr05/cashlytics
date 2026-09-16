import { useState } from "react";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import SmartCapture from "./pages/SmartCapture";
import FinancialIntelligence from "./pages/FinancialIntelligence";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import AIAssistant from "./pages/AIAssistant";
import AdaptiveLearning from "./pages/AdaptiveLearning";
import WhatIfSimulator from "./pages/WhatIfSimulator";
import Profile from "./pages/Profile";

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

export type AppView = "landing" | "onboarding" | "app";

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [page, setPage] = useState<Page>("overview");

  if (view === "landing") {
    return (
      <Landing
        onGetStarted={() => setView("onboarding")}
        onSignIn={() => {
          setView("app");
          setPage("overview");
        }}
      />
    );
  }

  if (view === "onboarding") {
    return (
      <Onboarding
        onComplete={() => {
          setView("app");
          setPage("overview");
        }}
      />
    );
  }

  const renderPage = () => {
    switch (page) {
      case "overview":
        return <Dashboard onNavigate={setPage} />;
      case "transactions":
        return <Transactions />;
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
