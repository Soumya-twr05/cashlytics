import React, { createContext, useContext, useState, useEffect } from "react";
import * as api from "./api";

interface User {
  id: string;
  email: string;
  name?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  login: (token: string, user: User, onboardingCompleted?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Initialize from localStorage
    const savedToken = api.getToken();
    const savedOnboarding = localStorage.getItem("cashlytics_onboarding_completed") === "true";
    
    if (savedToken) {
      setToken(savedToken);
      setOnboardingCompleted(savedOnboarding);
      // Try to fetch user profile
      api
        .getAuthMe()
        .then((response) => {
          setUser((response.data as any)?.user || null);
          // Update onboarding status from server
          if ((response.data as any)?.user?.onboardingCompleted) {
            setOnboardingCompleted(true);
            localStorage.setItem("cashlytics_onboarding_completed", "true");
          }
        })
        .catch(() => {
          api.clearToken();
          setToken(null);
          setUser(null);
          setOnboardingCompleted(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User, onboardingCompletedFlag?: boolean) => {
    setToken(newToken);
    setUser(newUser);
    const hasCompletedOnboarding = onboardingCompletedFlag ?? newUser.onboardingCompleted ?? false;
    setOnboardingCompleted(hasCompletedOnboarding);
    api.saveToken(newToken);
    
    if (hasCompletedOnboarding) {
      localStorage.setItem("cashlytics_onboarding_completed", "true");
    } else {
      localStorage.removeItem("cashlytics_onboarding_completed");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOnboardingCompleted(false);
    api.clearToken();
    localStorage.removeItem("cashlytics_onboarding_completed");
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await api.getAuthMe();
      setUser((response.data as any)?.user || null);
    } catch (err) {
      logout();
    }
  };

  const markOnboardingComplete = () => {
    setOnboardingCompleted(true);
    localStorage.setItem("cashlytics_onboarding_completed", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        onboardingCompleted,
        login,
        logout,
        refreshUser,
        markOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
