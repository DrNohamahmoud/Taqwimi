import React from "react";
import { Sparkles, SpellCheck, CheckCircle2, ShieldCheck, Filter, FileText, Check } from "lucide-react";
import { Question } from "../../types";
import { LinguisticFulfillmentReport, LinguisticAxis } from "../../utils/linguisticAuditEngine";
import { SpellCheckIssue, QuestionSpellCheckResult } from "../../utils/spellChecker";
import AiProofreadingUnit from "../AiProofreadingUnit";

interface LinguisticAuditStepProps {
  question: Question;
  linguisticFulfillment: LinguisticFulfillmentReport;
  spellingReport: QuestionSpellCheckResult;
  linguisticSubMode: "unit" | "criteria";
  setLinguisticSubMode: (mode: "unit" | "criteria") => void;
  activeLinguisticAxisFilter: "all" | LinguisticAxis;
  setActiveLinguisticAxisFilter: (filter: "all" | LinguisticAxis) => void;
  onApplyAllSpelling: () => void;
  onApplySingleSpellingFix: (issue: SpellCheckIssue) => void;
  onApplyAiProofreading: (fixedQuestion: Question) => void;
  isRtl: boolean;
  isDark: boolean;
  cardBg: string;
  renderNavFooter: () => React.ReactNode;
}

export default function LinguisticAuditStep({
  question,
  linguisticFulfillment,
  spellingReport,
  linguisticSubMode,
  setLinguisticSubMode,
  activeLinguisticAxisFilter,
  setActiveLinguisticAxisFilter,
  onApplyAllSpelling,
  onApplySingleSpellingFix,
  onApplyAiProofreading,
  isRtl,
  isDark,
  cardBg,
  renderNavFooter,
}: LinguisticAuditStepProps) {
  const axes = [
    {
      id: "orthography" as LinguisticAxis,
      titleAr: "الهمزات والرسم الإملائي",
      titleEn: "Orthography & Hamzat",
      score: linguisticFulfillment.axisBreakdown.orthography.score,
      color: isDark
        ? "text-blue-200 bg-blue-950/80 border-blue-700"
        : "text-blue-950 bg-blue-50 border-blue-300 font-bold",
    },
    {
      id: "grammar" as LinguisticAxis,
      titleAr: "النحو والتركيب اللغوي",
      titleEn: "Grammar & Syntax",
      score: linguisticFulfillment.axisBreakdown.grammar.score,
      color: isDark
        ? "text-emerald-200 bg-emerald-950/80 border-emerald-700"
        : "text-emerald-950 bg-emerald-50 border-emerald-300 font-bold",
    },
    {
      id: "punctuation" as LinguisticAxis,
      titleAr: "علامات الترقيم والطباعة",
      titleEn: "Punctuation & Typography",
      score: linguisticFulfillment.axisBreakdown.punctuation.score,
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
            <SpellCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/40 text-emerald-100 border border-emerald-300/50 px-2.5 py-0.5 rounded-full">
                {isRtl ? "المرحلة 3: التدقيق اللغوي" : "Stage 3: Linguistic Audit"}
              </span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1">
              {isRtl ? "التدقيق اللغوي والإملائي ثلاثي المحاور" : "3-Axis Linguistic & Orthographic Audit"}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 font-bold mt-0.5">
              {isRtl
                ? "فحص الهمزات، التاء المربوطة، النحو والإعراب، وعلامات الترقيم بالذكاء الاصطناعي"
                : "Orthography, syntax, grammar, and punctuation verified by AI Linguistic Engine"}
            </p>
          </div>
        </div>

        {spellingReport.hasErrors && (
          <button
            type="button"
            onClick={onApplyAllSpelling}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all border-2 border-amber-300 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isRtl ? "تطبيق كافة الإصلاحات الإملائية فوراً" : "Apply All Spelling Fixes"}</span>
          </button>
        )}
      </div>

      {/* 3-Axes Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {axes.map((ax) => (
          <div
            key={ax.id}
            className={`p-4.5 rounded-2xl border-2 flex items-center justify-between shadow-xs ${ax.color}`}
          >
            <div>
              <span className="text-sm font-display font-black block">{isRtl ? ax.titleAr : ax.titleEn}</span>
              <span className="text-xs font-bold opacity-90">{isRtl ? "نسبة الاستيفاء" : "Fulfillment"}</span>
            </div>
            <span className="font-mono font-black text-2xl">{ax.score}%</span>
          </div>
        ))}
      </div>

      {/* AI Proofreading Unit */}
      <div className={`p-6 rounded-3xl border-2 space-y-4 shadow-sm ${cardBg}`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
            <SpellCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
            <span>{isRtl ? "وحدة التدقيق والمعالجة اللغوية المتقدمة:" : "Advanced AI Proofreading Unit:"}</span>
          </h4>
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
            {isRtl ? `درجة الاستيفاء: ${linguisticFulfillment.score}/100` : `Fulfillment: ${linguisticFulfillment.score}/100`}
          </span>
        </div>

        <AiProofreadingUnit
          stem={question.stem}
          options={question.options}
          correctAnswer={question.correctAnswer}
          qType={question.qType}
          lang={isRtl ? "ar" : "en"}
          onApplyStem={(newStem) => onApplyAiProofreading({ ...question, stem: newStem })}
          onApplyOptions={(newOpts) => onApplyAiProofreading({ ...question, options: newOpts })}
          onApplyCorrectAnswer={(newAns) => onApplyAiProofreading({ ...question, correctAnswer: newAns })}
          onApplyAll={(newStem, newOpts, newAns) =>
            onApplyAiProofreading({
              ...question,
              stem: newStem,
              options: newOpts || question.options,
              correctAnswer: newAns || question.correctAnswer,
            })
          }
        />
      </div>

      {/* Detected Spelling Issues Chips */}
      {spellingReport.hasErrors && (
        <div className={`p-5 rounded-3xl border-2 space-y-3 shadow-xs ${cardBg}`}>
          <span className="text-xs font-black text-slate-950 dark:text-slate-100 block">
            {isRtl ? "أخطاء إملائية مرصودة (انقر للإصلاح الفوري):" : "Detected Spelling Issues (Click to fix):"}
          </span>
          <div className="flex flex-wrap gap-2">
            {spellingReport.allIssues.map((issue, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onApplySingleSpellingFix(issue)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-200 hover:bg-rose-700 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="line-through opacity-85">{issue.originalWord}</span>
                <span>←</span>
                <span className="underline font-black">{issue.suggestedWord}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      {renderNavFooter()}
    </div>
  );
}
