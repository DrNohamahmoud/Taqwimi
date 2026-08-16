import React from "react";
import { Sparkles, Wand2, CheckCircle2, AlertCircle, RefreshCw, Check, ArrowRight } from "lucide-react";
import { Question } from "../../types";

interface AiRefinementsStepProps {
  question: Question;
  isAiAuditing: boolean;
  aiAuditResult: any;
  aiAuditError: string;
  onRunAiAudit: () => void;
  onApplyStemSuggestion: (stem: string) => void;
  isRtl: boolean;
  isDark: boolean;
  cardBg: string;
  renderNavFooter: () => React.ReactNode;
}

export default function AiRefinementsStep({
  question,
  isAiAuditing,
  aiAuditResult,
  aiAuditError,
  onRunAiAudit,
  onApplyStemSuggestion,
  isRtl,
  isDark,
  cardBg,
  renderNavFooter,
}: AiRefinementsStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border-2 border-indigo-400 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-500/40 text-indigo-100 border border-indigo-300/50 px-2.5 py-0.5 rounded-full">
                {isRtl ? "المرحلة 3: التحسين الذكي" : "Stage 3: AI Refinements"}
              </span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1">
              {isRtl ? "المحرك الذكي والأتمتة السيكومترية الفائقة" : "AI Psychometric Auto-Pilot & Refinements"}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 font-bold mt-0.5">
              {isRtl
                ? "توليد بدائل منافسة، تنقيح الجذع تربوياً، والتحقق الآلي من جودة الصياغة القياسية"
                : "Generate plausible distractors, refine stem phrasing, and audit psychometric power"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunAiAudit}
          disabled={isAiAuditing}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all border-2 border-amber-300 disabled:opacity-50 active:scale-95"
        >
          {isAiAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isAiAuditing ? (isRtl ? "جارٍ التحليل الذكي..." : "Auditing...") : isRtl ? "تشغيل الفحص والتحسين الذكي" : "Run AI Audit"}</span>
        </button>
      </div>

      {/* Audit Error */}
      {aiAuditError && (
        <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-100 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{aiAuditError}</span>
        </div>
      )}

      {/* AI Recommendations Panel */}
      {aiAuditResult ? (
        <div className={`p-6 rounded-3xl border-2 space-y-5 shadow-sm ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
              <span>{isRtl ? "نتائج التحسين والتوصيات السيكومترية:" : "AI Recommendations & Enhancements:"}</span>
            </h4>
            <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
              {isRtl ? "مكتمل التحليل" : "Audit Complete"}
            </span>
          </div>

          {/* Stem Improvement */}
          {aiAuditResult.suggestedStem && (
            <div className="p-4.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-300 dark:border-indigo-700 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                  {isRtl ? "الصياغة المقترحة لمتن السؤال:" : "Suggested Refined Stem:"}
                </span>
                <button
                  type="button"
                  onClick={() => onApplyStemSuggestion(aiAuditResult.suggestedStem)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isRtl ? "تطبيق هذه الصياغة" : "Apply This Stem"}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800">
                {aiAuditResult.suggestedStem}
              </p>
            </div>
          )}

          {/* AI Feedback */}
          {aiAuditResult.feedback && (
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-950 dark:text-slate-100">
                {isRtl ? "التقرير والتعليل التربوي:" : "Pedagogical Justification:"}
              </span>
              <p className="text-xs sm:text-sm text-slate-950 dark:text-slate-100 font-bold leading-relaxed p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xs">
                {aiAuditResult.feedback}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={`p-8 rounded-3xl border-2 text-center space-y-3 shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 mx-auto flex items-center justify-center font-black">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="font-display font-black text-base text-slate-950 dark:text-white">
            {isRtl ? "جاهز للتحليل الذكي المتقدم" : "Ready for AI Psychometric Audit"}
          </h4>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 max-w-md mx-auto font-bold leading-relaxed">
            {isRtl
              ? "اضغط على زر (تشغيل الفحص والتحسين الذكي) أعلاه للتحقق من كفاءة السؤال وتحسين صياغته بالذكاء الاصطناعي."
              : "Click 'Run AI Audit' above to automatically evaluate and optimize this question."}
          </p>
        </div>
      )}

      {/* Navigation Footer */}
      {renderNavFooter()}
    </div>
  );
}
