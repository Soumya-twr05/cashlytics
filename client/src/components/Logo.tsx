import React, { useState } from "react";
import logoImg from "../assets/logo.png";

interface LogoProps {
  size?: number;
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  textClassName?: string;
  subtitle?: string | null;
  rounded?: string;
}

export default function Logo({
  size = 32,
  className = "",
  imgClassName = "",
  showText = false,
  textClassName = "",
  subtitle = "ADAPTIVE FINANCE",
  rounded = "rounded-lg",
}: LogoProps) {
  const [hasError, setHasError] = useState(false);

  const iconElement = (
    <div
      className={`flex items-center justify-center shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: "rgba(13,158,126,0.15)",
        border: "1px solid rgba(13,158,126,0.35)",
        boxShadow: "0 0 12px rgba(13,158,126,0.15)",
      }}
    >
      {!hasError ? (
        <img
          src={logoImg}
          alt="Cashlytics"
          className={`w-full h-full object-contain ${imgClassName}`}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-bold text-xs"
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#052e16",
            fontFamily: "var(--font-jetbrains, monospace)",
          }}
        >
          C
        </div>
      )}
    </div>
  );

  if (!showText) {
    return iconElement;
  }

  return (
    <div className="flex items-center gap-3">
      {iconElement}
      <div className="min-w-0 flex-1">
        <div
          className={`font-bold text-sm tracking-tight leading-none ${textClassName}`}
          style={{ color: "#ffffff" }}
        >
          CASHLYTICS
        </div>
        {subtitle && (
          <div
            className="text-xs mt-0.5 tracking-wider"
            style={{
              color: "rgba(200,221,210,0.6)",
              fontSize: "9px",
              letterSpacing: "0.1em",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
