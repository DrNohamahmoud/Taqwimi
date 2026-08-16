import React from "react";
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp, HelpCircle } from "lucide-react";
import { Question } from "../types";
import { evaluateQuestionQuality } from "../utils/qualityEvaluator";
import { Language } from "../translations";

interface QualityHintsBadgeProps {
  question: Question;
  lang: Language;
  onClick?: () => void;
  showProgressBar?: boolean;
  size?: "sm" | "md";
}

export default function QualityHintsBadge({
  question,
  lang,
  onClick,
  showProgressBar = true,
  size = "sm",
}: QualityHintsBadgeProps) {
  const isRtl = lang === "ar";
  const report = evaluateQuestionQuality(question, isRtl);

  const { fulfilledCount, totalCount, percentage, status } = report;

  // Color schemes based on quality level
  const colors =
    status === "excellent"
      ? {
          bg: "bg-emerald-50 hover:bg-emerald-100/90",
          border: "border-emerald-300",
          text: "text-emerald-900",
          icon: "text-emerald-600",
          bar: "bg-emerald-500",
          pillBg: "bg-emerald-600 text-white",
        }
      : status === "good"
      ? {
          bg: "bg-amber-50 hover:bg-amber-100/90",
          border: "border-amber-300",
          text: "text-amber-900",
          icon: "text-amber-600",
          bar: "bg-amber-500",
          pillBg: "bg-amber-600 text-white",
        }
      : {
          bg: "bg-rose-50 hover:bg-rose-100/90",
          border: "border-rose-300",
          text: "text-rose-900",
          icon: "text-rose-600",
          bar: "bg-rose-500",
          pillBg: "bg-rose-600 text-white",
        };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={
        isRtl
          ? `استيفاء ${fulfilledCount} من ${totalCount} من معايير وتلميحات الجودة (${percentage}%) - اضغط للمعاينة والتحسين`
          : `Fulfilled ${fulfilledCount} of ${totalCount} quality hints (${percentage}%) - Click to review and improve`
      }
      className={`group/badge flex flex-col gap-1.5 p-2 rounded-xl border ${colors.bg} ${colors.border} transition-all ${
        onClick ? "cursor-pointer hover:shadow-xs hover:scale-[1.01]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className={`w-3.5 h-3.5 ${colors.icon} shrink-0 animate-pulse`} />
          <span className={`text-[11px] font-extrabold ${colors.text}`}>
            {isRtl ? "تلميحات الجودة:" : "Quality Hints:"}
          </span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${colors.pillBg}`}>
            {fulfilledCount} / {totalCount}
          </span>
        </div>

        <span className={`text-[10px] font-bold ${colors.text} shrink-0`}>
          {isRtl ? report.statusLabelAr : report.statusLabelEn} ({percentage}%)
        </span>
      </div>

      {showProgressBar && (
        <div className="w-full h-1.5 bg-slate-200/90 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colors.bar}`}
            style={{ width: `${Math.max(8, percentage)}%` }}
          />
        </div>
      )}
    </div>
  );
}
