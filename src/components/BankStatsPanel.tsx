import React from "react";
import { Question } from "../types";
import { Language, translations } from "../translations";
import { Calculator, TrendingUp, Percent, Clock } from "lucide-react";

interface BankStatsPanelProps {
  questionsList: Question[];
  lang: Language;
}

export default function BankStatsPanel({ questionsList, lang }: BankStatsPanelProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";

  const totalCount = questionsList.length;

  if (totalCount === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 mb-0.5">
          <Calculator className="w-4 h-4 text-blue-600" />
          <span>{t.bank.statsTitle}</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {t.bank.noStatsYet}
        </p>
      </div>
    );
  }

  // Calculate estimated exam duration based on item types
  const estimatedBankMinutes = Math.round(
    questionsList.reduce((acc, q) => {
      if (q.qType === "essay") return acc + 10.0;
      if (q.qType === "tf") return acc + 0.6;
      if (q.qType === "fill") return acc + 1.25;
      if (q.qType === "matching" || q.qType === "ordering" || q.qType === "diagram_labeling") return acc + 2.5;
      return acc + 1.25;
    }, 0) + (totalCount > 0 ? 10 : 0) // +10 min buffer
  );

  // Format Duration
  const formatDurationText = (mins: number) => {
    if (mins < 60) {
      return `${mins} ${isRtl ? "دقيقة" : "mins"}`;
    }
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) {
      return isRtl ? (h === 1 ? "ساعة واحدة" : h === 2 ? "ساعتان" : `${h} ساعات`) : `${h}h`;
    }
    return isRtl ? `${h} س و ${m} د` : `${h}h ${m}m`;
  };

  // Calculate average difficultyIndex (p) and discriminationIndex (D)
  const totalP = questionsList.reduce((acc, q) => {
    const pVal =
      typeof q.difficultyIndex === "number"
        ? q.difficultyIndex
        : q.difficulty === "سهلة"
        ? 0.80
        : q.difficulty === "صعبة"
        ? 0.35
        : 0.60;
    return acc + pVal;
  }, 0);

  const totalD = questionsList.reduce((acc, q) => {
    const dVal = typeof q.discriminationIndex === "number" ? q.discriminationIndex : 0.42;
    return acc + dVal;
  }, 0);

  const avgP = totalP / totalCount;
  const avgD = totalD / totalCount;

  const getPBadge = (p: number) => {
    if (p >= 0.75) {
      return {
        label: isRtl ? "سهل مرتفع" : "Easy",
        color: "bg-amber-50 text-amber-900 border-amber-300",
      };
    } else if (p <= 0.35) {
      return {
        label: isRtl ? "صعب منخفض" : "Difficult",
        color: "bg-indigo-50 text-indigo-900 border-indigo-300",
      };
    } else {
      return {
        label: isRtl ? "مثالي متوازن" : "Optimal",
        color: "bg-emerald-50 text-emerald-900 border-emerald-300",
      };
    }
  };

  const getDBadge = (d: number) => {
    if (d >= 0.40) {
      return {
        label: isRtl ? "ممتاز" : "Excellent",
        color: "bg-emerald-50 text-emerald-900 border-emerald-300",
      };
    } else if (d >= 0.30) {
      return {
        label: isRtl ? "جيد جداً" : "Very Good",
        color: "bg-blue-50 text-blue-900 border-blue-300",
      };
    } else if (d >= 0.20) {
      return {
        label: isRtl ? "مقبول" : "Acceptable",
        color: "bg-amber-50 text-amber-900 border-amber-300",
      };
    } else {
      return {
        label: isRtl ? "ضعيف" : "Needs Review",
        color: "bg-rose-50 text-rose-900 border-rose-300",
      };
    }
  };

  const pBadge = getPBadge(avgP);
  const dBadge = getDBadge(avgD);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 p-3.5 rounded-2xl space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <span className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
          <Calculator className="w-4 h-4 text-blue-600" />
          <span>{t.bank.statsTitle}</span>
        </span>
        <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
          {totalCount} {isRtl ? "بند" : "items"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Average p (Facility Index) */}
        <div className="bg-white border border-slate-200/90 p-2.5 rounded-xl space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-blue-600 shrink-0" />
              <span className="truncate">{isRtl ? "متوسط السهولة (p)" : "Avg Facility (p)"}</span>
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-slate-900">
              {Math.round(avgP * 100)}%
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              ({avgP.toFixed(2)})
            </span>
          </div>
          <div className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border inline-block ${pBadge.color}`}>
            {pBadge.label}
          </div>
        </div>

        {/* Average D (Discrimination Index) */}
        <div className="bg-white border border-slate-200/90 p-2.5 rounded-xl space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-600 shrink-0" />
              <span className="truncate">{isRtl ? "متوسط التمييز (D)" : "Avg Discrim. (D)"}</span>
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-slate-900">
              {avgD.toFixed(2)}
            </span>
          </div>
          <div className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border inline-block ${dBadge.color}`}>
            {dBadge.label}
          </div>
        </div>
      </div>

      {/* Estimated Exam Solving Time Summary */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-2.5 rounded-xl flex items-center justify-between shadow-2xs border border-indigo-700/60">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
          <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>{isRtl ? "الوقت المتوقع لحل كامل البنك:" : "Estimated Exam Duration:"}</span>
        </span>
        <span className="text-xs font-black text-amber-300 bg-black/30 px-2 py-0.5 rounded-md border border-amber-400/30">
          ~ {formatDurationText(estimatedBankMinutes)}
        </span>
      </div>
    </div>
  );
}
