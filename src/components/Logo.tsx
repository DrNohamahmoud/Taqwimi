import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  lang?: "ar" | "en";
}

export default function Logo({ className = "", size = "md", showText = true, lang = "ar" }: LogoProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Innovative Logo Badge Icon */}
      <div
        className={`${sizeMap[size]} relative rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-blue-600/25 group transition-transform duration-300 hover:scale-105 select-none`}
      >
        <div className="w-full h-full rounded-[14px] bg-slate-950/20 backdrop-blur-sm flex items-center justify-center relative overflow-hidden border border-white/20">
          {/* Subtle internal shine */}
          <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-white/20 blur-md pointer-events-none"></div>
          
          <svg
            viewBox="0 0 100 100"
            className="w-3/4 h-3/4 text-white drop-shadow-md"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Graduation Cap Top Diamond */}
            <path
              d="M50 16 L88 34 L50 52 L12 34 Z"
              fill="url(#logoGrad)"
              stroke="white"
              strokeWidth="4"
            />
            {/* Graduation Cap Base */}
            <path
              d="M26 42 V60 C26 70 74 70 74 60 V42"
              stroke="white"
              strokeWidth="4"
              fill="none"
            />
            {/* Tassel */}
            <path d="M80 38 V56" stroke="#c084fc" strokeWidth="3" />
            <circle cx="80" cy="58" r="3" fill="#c084fc" />

            {/* Checkmark Ribbon in Foreground */}
            <path
              d="M28 66 L44 82 L82 44"
              stroke="#38bdf8"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* AI Sparkle Star top right */}
            <path
              d="M74 12 L76 18 L82 20 L76 22 L74 28 L72 22 L66 20 L72 18 Z"
              fill="#fbbf24"
            />

            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold text-white leading-none tracking-tight flex items-center gap-2 ${textSizes[size]}`}>
            {lang === "ar" ? "تقويمي" : "Taqwimi"}
            <span className="text-[10px] font-sans bg-violet-500/20 text-violet-300 border border-violet-400/30 px-2 py-0.5 rounded-full font-bold">
              {lang === "ar" ? "إصدار الأكاديمي" : "Academic Edition"}
            </span>
          </span>
          <span className="text-[10px] text-blue-300 font-medium tracking-widest mt-1">
            TAQWIMI • ACADEMIC EVALUATION
          </span>
        </div>
      )}
    </div>
  );
}
