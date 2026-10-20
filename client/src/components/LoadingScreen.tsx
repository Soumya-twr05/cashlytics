import React from "react";
import Logo from "./Logo";

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = "Loading...",
  subtitle = "ADAPTIVE FINANCIAL INTELLIGENCE",
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? "h-screen" : "min-h-[400px] h-full"
      } w-full flex flex-col items-center justify-center select-none transition-all duration-300`}
      style={{ background: "var(--background)" }}
    >
      <div className="flex flex-col items-center text-center px-4">
        {/* Animated Brand Logo Container */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Ambient Glow */}
          <div
            className="absolute -inset-2 rounded-2xl opacity-40 blur-lg animate-pulse pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.1) 70%, transparent 100%)",
            }}
          />

          {/* Logo Card with subtle border and shadow */}
          <div
            className="relative p-1.5 rounded-2xl transition-transform duration-300 hover:scale-105"
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              boxShadow: "0 0 25px rgba(16, 185, 129, 0.2)",
            }}
          >
            <Logo size={60} rounded="rounded-xl" />
          </div>
        </div>

        {/* Brand Name */}
        <h1
          className="font-bold text-lg tracking-wider mb-1"
          style={{
            color: "var(--foreground, #ffffff)",
            fontFamily: "var(--font-jetbrains, monospace)",
            letterSpacing: "0.14em",
          }}
        >
          CASHLYTICS
        </h1>

        {/* Optional Subtitle */}
        {subtitle && (
          <p
            className="text-[10px] tracking-widest uppercase mb-4 opacity-60 font-medium"
            style={{
              color: "var(--muted-foreground, #9ca3af)",
              letterSpacing: "0.2em",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Loading Indicator with Animated Dots */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <div
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: "#10b981",
              animationDuration: "0.9s",
              animationDelay: "0ms",
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: "#10b981",
              animationDuration: "0.9s",
              animationDelay: "150ms",
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: "#10b981",
              animationDuration: "0.9s",
              animationDelay: "300ms",
            }}
          />
          <span
            className="text-xs font-medium ml-1.5"
            style={{ color: "var(--muted-foreground, #9ca3af)" }}
          >
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
