import { useState, useEffect } from "react";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
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
import AdminDashboard from "./pages/AdminDashboard";

import * as api from "./lib/api";
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
  | "profile"
  | "admin";

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

  /*
   * When true, show the Onboarding screen even if onboardingCompleted is true.
   * Used when the user wants to update their profile from the Profile page.
   */
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [authError, setAuthError] = useState("");

  const {
    isAuthenticated,
    loading,
    onboardingCompleted,
    markOnboardingComplete,
    logout,
    login,
  } = useAuth();

  // Listen for OAuth redirects (e.g. Google OAuth redirect ?token=... or ?auth_error=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenParam = searchParams.get("token");
      const authErrorParam = searchParams.get("auth_error");
      const onboardingParam = searchParams.get("onboardingCompleted");

      if (tokenParam) {
        window.history.replaceState({}, document.title, window.location.pathname);
        api.saveToken(tokenParam);
        api
          .getAuthMe()
          .then((res) => {
            const userData = (res.data as any)?.user;
            if (userData) {
              const isCompleted = onboardingParam === "true" || !!userData.onboardingCompleted;
              login(tokenParam, userData, isCompleted);
              setView("app");
              setPage("overview");
            }
          })
          .catch((err) => {
            setAuthError(err.message || "Failed to load authenticated profile");
            setView("auth");
          });
      } else if (authErrorParam) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setAuthError(authErrorParam);
        setView("auth");
      }
    } catch (e) {
      console.error("OAuth param handling error:", e);
    }
  }, [login]);

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  // ---------------------------------------------------------
  // Authenticated user
  // ---------------------------------------------------------

  if (isAuthenticated || isGuest) {
    // Show onboarding if: authenticated and not yet completed, OR user explicitly requested update
    if (isAuthenticated && (!onboardingCompleted || showOnboarding)) {
      return (
        <Onboarding
          onComplete={() => {
            markOnboardingComplete();
            setAuthMode(null);
            setShowOnboarding(false);
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
          return (
            <Profile
              onUpdateProfile={() => {
                setShowOnboarding(true);
              }}
            />
          );

        case "bills":
          return <Budgets />;

        case "admin":
          return <AdminDashboard onNavigate={setPage} />;

        default:
          return <Dashboard onNavigate={setPage} />;
      }
    };

    return (
      <Layout
        page={page}
        onNavigate={setPage}
        onSignOut={() => {
          setIsGuest(false);
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
        initialError={authError}
        onSignInSuccess={(
          onboardingCompletedFromAuth,
          mode
        ) => {
          const currentMode = mode ?? "signin";
          setAuthMode(currentMode);
          setPage("overview");
          setView("app");
        }}
        onGuestStart={() => {
          setIsGuest(true);
          setAuthMode(null);
          setView("app");
          setPage("overview");
        }}
      />
    );
  }

  // Safe fallback to prevent blank screen
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