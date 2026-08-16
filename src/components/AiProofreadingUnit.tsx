import React, { useState } from "react";
import {
  Sparkles,
  SpellCheck,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  HelpCircle,
  Lightbulb,
  X
} from "lucide-react";
import { ProofreadResult, ProofreadSuggestion } from "../types";
import { Language } from "../translations";

interface AiProofreadingUnitProps {
  stem: string;
  options?: string[];
  correctAnswer: string;
  qType: string;
  lang: Language;
  onApplyStem: (newStem: string) => void;
  onApplyOptions?: (newOptions: string[]) => void;
  onApplyCorrectAnswer?: (newAnswer: string) => void;
  onApplyAll: (newStem: string, newOptions?: string[], newAnswer?: string) => void;
}

export default function AiProofreadingUnit({
  stem,
  options,
  correctAnswer,
  qType,
  lang,
  onApplyStem,
  onApplyOptions,
  onApplyCorrectAnswer,
  onApplyAll,
}: AiProofreadingUnitProps) {
  const isRtl = lang === "ar";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [appliedSuggestions, setAppliedSuggestions] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);
  const [isAllApplied, setIsAllApplied] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState<ProofreadSuggestion | null>(null);

  const handleRunProofreading = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://taqwimi-backend.noha-mahmoud.workers.dev/api/proofread-question",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stem,
            options,
            correctAnswer,
            qType,
            lang,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            (isRtl
              ? "فشل التدقيق اللغوي والنحوي"
              : "Proofreading failed")
        );
      }

      setResult(data);
      setAppliedSuggestions({});
    } catch (err: any) {
      console.error("Proofreading error:", err);
      setError(err.message || (isRtl ? "حدث خطأ أثناء إجراء التدقيق اللغوي والنحوي" : "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySingleSuggestion = (suggestion: ProofreadSuggestion) => {
    if (suggestion.targetField === "stem") {
      // If we have full improvedStem and this is the main stem fix, or string replacement
      if (result?.improvedStem && suggestion.originalText && stem.includes(suggestion.originalText)) {
        const updated = stem.replace(suggestion.originalText, suggestion.suggestedText);
        onApplyStem(updated);
      } else if (result?.improvedStem) {
        onApplyStem(result.improvedStem);
      }
    } else if (suggestion.targetField === "options" && options && onApplyOptions) {
      if (result?.improvedOptions) {
        onApplyOptions(result.improvedOptions);
      }
    } else if (suggestion.targetField === "correctAnswer" && onApplyCorrectAnswer) {
      if (result?.improvedCorrectAnswer) {
        onApplyCorrectAnswer(result.improvedCorrectAnswer);
      }
    }

    setAppliedSuggestions((prev) => ({ ...prev, [suggestion.id]: true }));
  };

  const handleApplyAllProofread = () => {
    if (!result) return;
    onApplyAll(
      result.improvedStem,
      result.improvedOptions && result.improvedOptions.length > 0 ? result.improvedOptions : undefined,
      result.improvedCorrectAnswer
    );
    setIsAllApplied(true);
    const allAppliedMap: Record<string, boolean> = {};
    result.detailedSuggestions.forEach((s) => {
      allAppliedMap[s.id] = true;
    });
    setAppliedSuggestions(allAppliedMap);
  };

  const handleCopyImprovedText = () => {
    if (!result) return;
    let full = `[النص بعد التدقيق اللغوي والنحوي]\n${result.improvedStem}\n`;
    if (result.improvedOptions && result.improvedOptions.length > 0) {
      result.improvedOptions.forEach((opt, idx) => {
        full += `${String.fromCharCode(65 + idx)}) ${opt}\n`;
      });
    }
    if (result.improvedCorrectAnswer) {
      full += `الإجابة الصحيحة: ${result.improvedCorrectAnswer}\n`;
    }
    navigator.clipboard.writeText(full);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredSuggestions = result?.detailedSuggestions.filter((s) => {
    if (activeCategoryFilter === "all") return true;
    return s.category === activeCategoryFilter;
  }) || [];

  return (
    <div className="bg-white dark:bg-slate-950 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <SpellCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                {isRtl ? "وحدة التدقيق اللغوي والنحوي والإملائي المتقدمة" : "Advanced Linguistic, Grammar & Orthography Proofreading Unit"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 font-extrabold text-[11px]">
                {isRtl ? "تحكيم لغوي معتمد" : "Linguistic Audit"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              {isRtl
                ? "فحص الصياغة الأكاديمية، ضبط الإعراب والتراكيب النحوية، تصحيح الهمزات والتاء المربوطة، وتجانس البدائل."
                : "Deep syntax verification, grammar concord, Arabic orthography, and academic rhetoric refinement."}
            </p>
          </div>
        </div>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleRunProofreading}
          disabled={isLoading || !stem.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0 border border-indigo-400"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>{isRtl ? "جارٍ التدقيق اللغوي والنحوي..." : "Proofreading item..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isRtl ? "بدء التدقيق اللغوي والنحوي" : "Run Linguistic Proofreader"}</span>
            </>
          )}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-900 dark:text-rose-200 font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display Area */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Score and Status Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Score Gauge */}
            <div className="md:col-span-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white border border-indigo-900 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-indigo-300 font-bold mb-2">
                  <span>{isRtl ? "مؤشر السلامة اللغوية والنحوية" : "Linguistic Safety Index"}</span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-display text-white">
                    {result.overallLinguisticScore}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 100</span>
                  <span
                    className={`ms-auto px-2.5 py-1 rounded-xl text-xs font-black ${
                      result.overallLinguisticScore >= 85
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : result.overallLinguisticScore >= 70
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {result.overallLinguisticScore >= 85
                      ? isRtl ? "ممتاز لغوياً" : "Flawless"
                      : result.overallLinguisticScore >= 70
                      ? isRtl ? "جيد مع ملاحظات" : "Acceptable"
                      : isRtl ? "يحتاج تصحيحاً فورياً" : "Needs Corrections"}
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4 border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.overallLinguisticScore >= 85
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                      : result.overallLinguisticScore >= 70
                      ? "bg-gradient-to-r from-amber-400 to-orange-400"
                      : "bg-gradient-to-r from-rose-500 to-red-500"
                  }`}
                  style={{ width: `${Math.max(5, result.overallLinguisticScore)}%` }}
                />
              </div>
            </div>

            {/* Summary & Quick All Apply */}
            <div className="md:col-span-8 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{isRtl ? "التقرير والتشخيص التحريري الشامل:" : "Linguistic Assessment Summary:"}</span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {result.linguisticSummary}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {isRtl
                    ? `تم رصد ${result.detailedSuggestions.length} ملاحظات وفرص تحسين صياغي`
                    : `${result.detailedSuggestions.length} proofreading suggestions available`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyImprovedText}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title={isRtl ? "نسخ النص المدقق" : "Copy Proofread Text"}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />}
                    <span>{isCopied ? (isRtl ? "تم النسخ" : "Copied") : (isRtl ? "نسخ النص" : "Copy")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyAllProofread}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAllApplied
                        ? "bg-emerald-700 text-white"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    }`}
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>{isAllApplied ? (isRtl ? "✓ تم تطبيق كافة التحسينات" : "✓ All Applied") : (isRtl ? "تطبيق كافة التحسينات اللغوية" : "Apply All Linguistic Fixes")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Before and After Side-by-Side Comparison Box */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-amber-300 font-extrabold">
                <Lightbulb className="w-4 h-4" />
                {isRtl ? "معاينة الصياغة المحكمة بعد التدقيق اللغوي والنحوي:" : "Proofread Item Formulation Preview:"}
              </span>
              <span className="text-[10px] text-indigo-300">
                {isRtl ? "جملة خبرية منتهية بنقطتين للـ MCQ" : "Declarative ending with colon"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              {/* Original */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-rose-400 font-black block uppercase tracking-wider">
                  {isRtl ? "الصياغة الأصلية قبل التدقيق:" : "Original Phrasing:"}
                </span>
                <p className="text-slate-300 line-clamp-3 leading-relaxed">{stem}</p>
              </div>

              {/* Enhanced */}
              <div className="p-3.5 bg-indigo-950/50 rounded-xl border border-indigo-700/60 space-y-1.5">
                <span className="text-[10px] text-emerald-400 font-black block uppercase tracking-wider">
                  {isRtl ? "الصياغة المحسنة المعتمدة (الجديدة):" : "Proofread & Refined Version:"}
                </span>
                <p className="text-emerald-100 leading-relaxed font-bold">{result.improvedStem}</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs by Error Category */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{isRtl ? "تفاصيل الملاحظات وقواعد التدقيق:" : "Itemized Proofreading Suggestions:"}</span>
              </h4>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("all")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeCategoryFilter === "all"
                      ? "bg-white dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 shadow-xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isRtl ? `الكل (${result.detailedSuggestions.length})` : `All (${result.detailedSuggestions.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("spelling")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeCategoryFilter === "spelling"
                      ? "bg-white dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 shadow-xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isRtl ? "الإملاء والهمزات" : "Spelling"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("grammar")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeCategoryFilter === "grammar"
                      ? "bg-white dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 shadow-xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isRtl ? "النحو والإعراب" : "Grammar"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("style")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeCategoryFilter === "style"
                      ? "bg-white dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 shadow-xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isRtl ? "البلاغة والإيجاز" : "Style & Rhetoric"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("pedagogical_formatting")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeCategoryFilter === "pedagogical_formatting"
                      ? "bg-white dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 shadow-xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isRtl ? "ضوابط الجذع" : "Stem Rules"}
                </button>
              </div>
            </div>

            {/* Suggestions List */}
            {filteredSuggestions.length === 0 ? (
              <div className="p-6 bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500 font-bold">
                {isRtl ? "لا توجد ملاحظات في هذا التصنيف." : "No suggestions found in this category."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSuggestions.map((item) => {
                  const isApplied = appliedSuggestions[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                        isApplied
                          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 text-slate-900 dark:text-slate-100"
                          : item.severity === "error"
                          ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 text-slate-900 dark:text-slate-100"
                          : item.severity === "warning"
                          ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 text-slate-900 dark:text-slate-100"
                          : "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-400 text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                              item.category === "spelling"
                                ? "bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200"
                                : item.category === "grammar"
                                ? "bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-200"
                                : item.category === "style"
                                ? "bg-purple-200 dark:bg-purple-900 text-purple-950 dark:text-purple-200"
                                : "bg-blue-200 dark:bg-blue-900 text-blue-950 dark:text-blue-200"
                            }`}
                          >
                            {item.categoryLabelAr || item.category}
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                            {item.targetField === "stem"
                              ? isRtl ? "متن السؤال" : "Item Stem"
                              : item.targetField === "options"
                              ? isRtl ? "البدائل والخيارات" : "Options"
                              : isRtl ? "الإجابة النموذجية" : "Answer Key"}
                          </span>
                        </div>

                        {/* Apply Single Button */}
                        <button
                          type="button"
                          onClick={() => handleApplySingleSuggestion(item)}
                          disabled={isApplied}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                            isApplied
                              ? "bg-emerald-700 text-white cursor-default"
                              : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white"
                          }`}
                        >
                          {isApplied ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                          <span>{isApplied ? (isRtl ? "تم التطبيق" : "Applied") : (isRtl ? "تطبيق هذا التعديل" : "Apply This Fix")}</span>
                        </button>
                      </div>

                      {/* Diff Replacement Row */}
                      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white/95 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
                        <span className="text-rose-700 dark:text-rose-400 line-through font-bold bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-md">
                          {item.originalText}
                        </span>
                        <span className="text-slate-400 font-black">⟶</span>
                        <span className="text-emerald-800 dark:text-emerald-300 font-black bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                          {item.suggestedText}
                        </span>
                      </div>

                      {/* Rule Explanation */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium ps-1">
                        <strong className="text-slate-900 dark:text-white font-bold">{isRtl ? "القاعدة والتعليل: " : "Rule & Reason: "}</strong>
                        {item.ruleExplanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grammar & Orthographic Notes Pills Banner */}
          {(result.grammarNotes?.length || result.spellingNotes?.length || result.styleNotes?.length) && (
            <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl space-y-3">
              <h5 className="text-xs font-black text-slate-900 dark:text-white">
                {isRtl ? "قواعد وضوابط لغوية مطبقة في هذا البند:" : "Applied Linguistic Rules:"}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {result.spellingNotes?.map((note, i) => (
                  <span key={`sp-${i}`} className="px-2.5 py-1 rounded-lg bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-bold text-[11px]">
                    ✍️ {note}
                  </span>
                ))}
                {result.grammarNotes?.map((note, i) => (
                  <span key={`gr-${i}`} className="px-2.5 py-1 rounded-lg bg-indigo-100/90 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 font-bold text-[11px]">
                    ⚖️ {note}
                  </span>
                ))}
                {result.styleNotes?.map((note, i) => (
                  <span key={`st-${i}`} className="px-2.5 py-1 rounded-lg bg-purple-100/90 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-200 font-bold text-[11px]">
                    ✨ {note}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
