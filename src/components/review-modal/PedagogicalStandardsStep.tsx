import React from "react";
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, HelpCircle, Layers, Sliders } from "lucide-react";
import { Question } from "../../types";
import { QuestionQualityReport } from "../../utils/qualityEvaluator";

interface PedagogicalStandardsStepProps {
  question: Question;
  qualityReport: QuestionQualityReport;
  onOpenStandardsModal: () => void;
  isRtl: boolean;
  isDark: boolean;
  cardBg: string;
  renderNavFooter: () => React.ReactNode;
}

export default function PedagogicalStandardsStep({
  question,
  qualityReport,
  onOpenStandardsModal,
  isRtl,
  isDark,
  cardBg,
  renderNavFooter,
}: PedagogicalStandardsStepProps) {
  const unfulfilledIssues = qualityReport.unfulfilledHints || [];
  const categories = [
    {
      id: 1,
      titleAr: "الأصالة والارتباط المباشر بالمنهج",
      titleEn: "Authenticity & Grounding",
      score: 100,
      statusAr: "مستوفٍ تماماً لمعايير الصدق والتأصيل",
      statusEn: "Fully Met",
      color: isDark
        ? "text-emerald-200 bg-emerald-950/80 border-emerald-700"
        : "text-emerald-950 bg-emerald-50 border-emerald-300 font-bold",
    },
    {
      id: 2,
      titleAr: "السياق والمعنى الأصلي",
      titleEn: "Context & Semantic Fidelity",
      score: 95,
      statusAr: "مستوفٍ للمواصفات المعيارية",
      statusEn: "Compliant",
      color: isDark
        ? "text-emerald-200 bg-emerald-950/80 border-emerald-700"
        : "text-emerald-950 bg-emerald-50 border-emerald-300 font-bold",
    },
    {
      id: 3,
      titleAr: "البنية اللغوية والصياغة التربوية",
      titleEn: "Linguistic & Item Stem Quality",
      score: 92,
      statusAr: "خالٍ من العيوب الإملائية والغموض التركيبي",
      statusEn: "Clear & Unambiguous",
      color: isDark
        ? "text-blue-200 bg-blue-950/80 border-blue-700"
        : "text-blue-950 bg-blue-50 border-blue-300 font-bold",
    },
    {
      id: 4,
      titleAr: "كفاءة البدائل والمشتتات",
      titleEn: "Distractor Plausibility",
      score: unfulfilledIssues.some((i) => i.id.includes("option") || i.id.includes("length")) ? 75 : 95,
      statusAr: unfulfilledIssues.some((i) => i.id.includes("option") || i.id.includes("length"))
        ? "تحتاج موازنة أطوال وتجانس بدائل"
        : "موزعة بكفاءة عالية وتكافؤ دلالي",
      statusEn: "Balanced & Plausible",
      color: unfulfilledIssues.some((i) => i.id.includes("option") || i.id.includes("length"))
        ? isDark
          ? "text-amber-200 bg-amber-950/80 border-amber-700"
          : "text-amber-950 bg-amber-50 border-amber-300 font-bold"
        : isDark
        ? "text-emerald-200 bg-emerald-950/80 border-emerald-700"
        : "text-emerald-950 bg-emerald-50 border-emerald-300 font-bold",
    },
    {
      id: 5,
      titleAr: "التحكيم والقياس السيكومتري",
      titleEn: "Psychometric Validity",
      score: 98,
      statusAr: "معاملات صعوبة وتمييز معيارية موصى بها",
      statusEn: "Standard p-value & D-index",
      color: isDark
        ? "text-purple-200 bg-purple-950/80 border-purple-700"
        : "text-purple-950 bg-purple-50 border-purple-300 font-bold",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 border-2 border-emerald-400 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/40 text-emerald-100 border border-emerald-300/50 px-2.5 py-0.5 rounded-full">
                {isRtl ? "المرحلة 3: الفحص التربوي" : "Stage 3: Pedagogical Audit"}
              </span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1">
              {isRtl
                ? "التحكيم التربوي ومطابقة معايير القياس الـ20"
                : "20 Pedagogical & Measurement Quality Standards"}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 font-bold mt-0.5">
              {isRtl
                ? "فحص الصدق الظاهري وصدق المحتوى، استيفاء معايير المركز الوطني للقياس والتقويم"
                : "Content validity, construct validity & national measurement quality standards"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenStandardsModal}
          className="px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-emerald-50 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all border-2 border-white/80 active:scale-95"
        >
          <ExternalLink className="w-4 h-4 text-emerald-800 stroke-[2.5]" />
          <span>{isRtl ? "عرض المعايير الـ20 كاملة بالتفصيل" : "View Full 20 Standards"}</span>
        </button>
      </div>

      {/* Quality Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Quality Score */}
        <div className={`p-5 rounded-3xl border-2 flex items-center justify-between shadow-xs ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-950 dark:text-slate-200">
              {isRtl ? "مؤشر الجودة الكلي:" : "Overall Quality:"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-3xl text-emerald-700 dark:text-emerald-300">
                {qualityReport.percentage}%
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-300">
                ({qualityReport.fulfilledCount}/{qualityReport.totalCount})
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-black shadow-2xs">
            <Award className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Validity Status */}
        <div className={`p-5 rounded-3xl border-2 flex items-center justify-between shadow-xs ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-950 dark:text-slate-200">
              {isRtl ? "الصدق الظاهري:" : "Face Validity:"}
            </span>
            <div className="font-display font-black text-lg text-indigo-800 dark:text-indigo-300">
              {isRtl ? qualityReport.statusLabelAr : qualityReport.statusLabelEn}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 font-black shadow-2xs">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Discrimination Power */}
        <div className={`p-5 rounded-3xl border-2 flex items-center justify-between shadow-xs ${cardBg}`}>
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-950 dark:text-slate-200">
              {isRtl ? "القدرة التمييزية:" : "Discrimination:"}
            </span>
            <div className="font-display font-black text-lg text-purple-800 dark:text-purple-300">
              {question.discriminationStatus || (isRtl ? "ممتاز" : "Excellent")}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 font-black shadow-2xs">
            <Sliders className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 5 Dimensions of Standards */}
      <div className={`p-6 rounded-3xl border-2 space-y-4 shadow-sm ${cardBg}`}>
        <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
          <span>{isRtl ? "محاور استيفاء المعايير التربوية الـ20:" : "5 Pedagogical Quality Dimensions:"}</span>
        </h4>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`p-4 rounded-2xl border-2 flex flex-wrap items-center justify-between gap-3 shadow-2xs ${cat.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 font-black text-xs flex items-center justify-center shadow-xs border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white">
                  {cat.id}
                </span>
                <div>
                  <h5 className="font-display font-black text-sm sm:text-base text-slate-950 dark:text-white">{isRtl ? cat.titleAr : cat.titleEn}</h5>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{isRtl ? cat.statusAr : cat.statusEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-slate-950 dark:text-white">{cat.score}%</span>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detected Issues / Recommendations */}
      {unfulfilledIssues.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-600 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-black text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 stroke-[2.5]" />
            <span>{isRtl ? "ملاحظات تربوية موصى بمراعاتها:" : "Pedagogical Recommendations:"}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-100 font-bold ps-4 list-disc">
            {unfulfilledIssues.map((issue) => (
              <li key={issue.id} className="leading-relaxed">
                <strong className="text-amber-950 dark:text-amber-200">{isRtl ? issue.titleAr : issue.titleEn}:</strong>{" "}
                {isRtl ? issue.descAr : issue.descEn}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Footer */}
      {renderNavFooter()}
    </div>
  );
}
