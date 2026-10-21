import React, { useState } from "react";
import logoImg from "../assets/logo.png";
import logoSvg from "../assets/logo.svg";

export const CashlyticsBrandMark = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-full p-0.5 ${className}`}
  >
    <defs>
      <linearGradient id="cashlytics-brand-inline" x1="15%" y1="15%" x2="85%" y2="85%">
        <stop offset="0%" stopColor="#a3e635" />
        <stop offset="50%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
      <linearGradient id="cashlytics-bars-inline" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#bef264" />
      </linearGradient>
      <filter id="cashlytics-glow-inline" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#22c55e" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#cashlytics-glow-inline)">
      {/* Stylized 'C' shape */}
      <path
        d="M 64 24 L 44 24 C 30 24 20 34 20 49 C 20 63 30 73 45 73 C 53 73 60 70 65 65 C 63 60 55 64 45 64 C 36 64 29 58 29 49 C 29 40 36 33 45 33 L 64 33 C 66 33 67 31 67 28.5 C 67 26 66 24 64 24 Z"
        fill="url(#cashlytics-brand-inline)"
      />
      {/* Financial Chart Bars */}
      <rect x="42" y="47" width="7" height="19" rx="2" fill="url(#cashlytics-bars-inline)" />
      <rect x="52" y="38" width="7" height="28" rx="2" fill="url(#cashlytics-bars-inline)" />
      <rect x="62" y="29" width="7" height="37" rx="2" fill="url(#cashlytics-bars-inline)" />
      {/* Dynamic Orbit Swoosh */}
      <path
        d="M 23 72 C 33 84 57 86 78 69 C 81 66.5 82 64.5 79.5 65 C 62 78 40 78 28 69 C 25 66.8 21.5 69.5 23 72 Z"
        fill="url(#cashlytics-brand-inline)"
      />
    </g>
  </svg>
);

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
  const [imgSrc, setImgSrc] = useState<string>(logoImg);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);

  const handleImageError = () => {
    if (imgSrc === logoImg) {
      // Fallback to vector SVG if PNG cannot be decoded (e.g. Git LFS pointer)
      setImgSrc(logoSvg);
    } else {
      // If asset file also fails, fall back to embedded vector component
      setLoadFailed(true);
    }
  };

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
      {!loadFailed ? (
        <img
          src={imgSrc}
          alt="Cashlytics"
          className={`w-full h-full object-contain ${imgClassName}`}
          onError={handleImageError}
        />
      ) : (
        <CashlyticsBrandMark className={imgClassName} />
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
