import React from "react";
import { Sparkles, ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Language, translations } from "../translations";

interface HeroProps {
  onStartClick: () => void;
  onExploreClick: () => void;
  lang: Language;
}

export default function Hero({ onStartClick, onExploreClick, lang }: HeroProps) {
  const t = translations[lang].hero;
  const isRtl = lang === "ar";

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-violet-950 text-white py-16 lg:py-24 border-b border-blue-500/20">
      {/* Background radial spotlights in Blue and Violet */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_900px_500px_at_85%_-10%,rgba(59,130,246,0.25),transparent)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_400px_at_8%_105%,rgba(139,92,246,0.28),transparent)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_28px)] pointer-events-none"></div>

      {/* Decorative glowing orbits */}
      <div className="absolute w-[520px] h-[520px] -top-[220px] -right-[160px] rounded-full border border-violet-500/20 pointer-events-none"></div>
      <div className="absolute w-[340px] h-[340px] -top-[90px] -right-[40px] rounded-full border border-blue-500/20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 text-xs font-semibold text-blue-300 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-pulse" />
              {t.badge}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white tracking-tight">
              {t.titleLine1}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300">
                {t.titleHighlight}
              </span>{" "}
              <br className="hidden sm:inline" />
              {t.titleLine2}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-light leading-relaxed">
              {t.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onStartClick}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-xl shadow-blue-600/25 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5 border border-white/20"
              >
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300/30 shrink-0" />
                <span>{t.startBtn}</span>
              </button>

              <button
                onClick={onExploreClick}
                className="border-2 border-emerald-500/40 hover:border-emerald-400 bg-slate-900/90 hover:bg-slate-800 text-slate-100 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center gap-2.5 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t.exploreBtn}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4 text-slate-400" /> : <ArrowRight className="w-4 h-4 text-slate-400" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-slate-800/80 max-w-lg">
              <div>
                <span className="block text-lg sm:text-xl font-extrabold text-blue-400 font-display leading-tight">{t.stat1Num}</span>
                <span className="text-xs text-slate-400 mt-0.5 block">{t.stat1Text}</span>
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-extrabold text-violet-400 font-display leading-tight">{t.stat2Num}</span>
                <span className="text-xs text-slate-400 mt-0.5 block">{t.stat2Text}</span>
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-extrabold text-blue-300 font-display leading-tight">{t.stat3Num}</span>
                <span className="text-xs text-slate-400 mt-0.5 block">{t.stat3Text}</span>
              </div>
            </div>
          </div>

          {/* Hero interactive preview card & Questions visual elements */}
          <div className="lg:col-span-5 flex justify-center relative">
            {/* Decorative Floating Question Icon Card (Fills the empty hero area with question iconography) */}
            <div className="hidden sm:flex absolute -top-10 -left-12 z-20 items-center gap-3 bg-slate-900/90 border border-blue-400/30 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl text-white hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                <svg className="w-6 h-6 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="text-start">
                <div className="text-xs font-bold text-blue-200">
                  {isRtl ? "بنك الأسئلة الذكي" : "Smart Question Bank"}
                </div>
                <div className="text-[10px] text-slate-300">
                  {isRtl ? "صياغة وتحكيم تربوي معتمد" : "Validated Items & Metrics"}
                </div>
              </div>
            </div>

            {/* Main Interactive Preview Card */}
            <div className="w-full max-w-sm bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200/80 rotate-[-1.5deg] relative transition-transform hover:rotate-0 duration-300 z-10">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <span>{t.previewTitle}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">{t.approvedTag}</span>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-900 mb-4 leading-relaxed">
                {t.previewStem}
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/40 bg-blue-50/80 text-xs sm:text-sm font-semibold text-blue-950 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  {t.opt1}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-700">
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></span>
                  {t.opt2}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-700">
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></span>
                  {t.opt3}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <div className="flex gap-1.5">
                  <span className="text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">{t.bloomTag}</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">{t.diffTag}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{t.qualityScore}</span>
              </div>
            </div>

            {/* Bottom Floating Question Type Pill */}
            <div className="hidden sm:flex absolute -bottom-6 -right-6 z-20 items-center gap-2 bg-gradient-to-r from-violet-950 to-slate-900 border border-violet-400/30 backdrop-blur-md px-3.5 py-2 rounded-xl text-white shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-violet-200">
                {isRtl ? "اختيار من متعدد (MCQ) · صواب/خطأ" : "MCQ · True/False · Fill Blank"}
              </span>
            </div>

            {/* Rotary Certified Stamp SVG in Blue & Violet */}
            <div className="absolute -top-12 -right-12 w-28 h-28 opacity-90 rotate-[-12deg] select-none pointer-events-none drop-shadow-xl animate-[spin_40s_linear_infinite] z-0">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="92" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                <circle cx="100" cy="100" r="76" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
                <defs>
                  <path id="badgePath" d="M100,100 m-70,0 a70,70 0 1,1 140,0 a70,70 0 1,1 -140,0" />
                </defs>
                <text fontSize="14" fill="#2563eb" fontWeight="700">
                  <textPath href="#badgePath" startOffset="5%">{t.stampPath}</textPath>
                </text>
                <text x="100" y="96" textAnchor="middle" fontSize="32" fill="#7c3aed" fontWeight="700">{t.stampTitle}</text>
                <text x="100" y="118" textAnchor="middle" fontSize="10" fill="#2563eb">{t.stampSub}</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
