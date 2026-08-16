import React, { useState } from "react";
import {
  Sparkles,
  CheckCheck,
  RefreshCw,
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  SpellCheck,
  Award,
  Layers,
  Check,
  Flame,
} from "lucide-react";
import { Question } from "../types";
import { Language } from "../translations";
import { checkQuestionSpelling, applyAllSpellingFixes } from "../utils/spellChecker";
import { autoTuneStem, autoBalanceOptionsAndKey, autoCalibratePsychometrics } from "../utils/questionAutomation";

interface BatchAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onApplyBatchUpdates: (updatedQuestions: Question[]) => void;
  lang: Language;
  currentStage: "1" | "2" | "3" | "4";
}

interface ItemAuditState {
  original: Question;
  updated: Question;
  applied: boolean;
  status: "idle" | "processing" | "audited" | "error";
  changesCount: number;
  detectedIssues: string[];
  improvements: string[];
}

export default function BatchAuditModal({
  isOpen,
  onClose,
  questions,
  onApplyBatchUpdates,
  lang,
  currentStage,
}: BatchAuditModalProps) {
  const isRtl = lang === "ar";

  // Selected Question IDs to process
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    questions.map((q) => q.id)
  );

  // Target stage of batch transformation
  const [targetBatchStage, setTargetBatchStage] = useState<"stage2" | "stage3" | "all">(
    currentStage === "3" ? "stage3" : currentStage === "2" ? "stage2" : "all"
  );

  const [isRunning, setIsRunning] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number>(-1);
  const [auditResults, setAuditResults] = useState<Record<string, ItemAuditState>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((q) => q.id));
    }
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Run Batch Processing Engine on Selected Questions
  const handleStartBatchAudit = async () => {
    const targetQuestions = questions.filter((q) => selectedIds.includes(q.id));
    if (targetQuestions.length === 0) return;

    setIsRunning(true);
    setIsCompleted(false);

    const initialMap: Record<string, ItemAuditState> = {};
    targetQuestions.forEach((q) => {
      initialMap[q.id] = {
        original: { ...q },
        updated: { ...q },
        applied: true,
        status: "processing",
        changesCount: 0,
        detectedIssues: [],
        improvements: [],
      };
    });
    setAuditResults(initialMap);

    // Process sequentially for smooth visual feedback
    for (let i = 0; i < targetQuestions.length; i++) {
      const q = targetQuestions[i];
      setCurrentProcessingIndex(i);

      try {
        let updatedQuestion: Question = { ...q };
        const detectedIssues: string[] = [];
        const improvements: string[] = [];

        // 1. Linguistic & Spell Check Audit
        const spellCheck = checkQuestionSpelling(q, isRtl);
        if (spellCheck.hasErrors) {
          const cleaned = applyAllSpellingFixes(updatedQuestion, isRtl);
          updatedQuestion.stem = cleaned.stem;
          updatedQuestion.options = cleaned.options;
          updatedQuestion.correctAnswer = cleaned.correctAnswer;
          improvements.push(
            isRtl
              ? `تصحيح ${spellCheck.totalErrors} موضعاً إملائياً ولغوياً (الهمزات والتاء المربوطة والمصطلحات)`
              : `Corrected ${spellCheck.totalErrors} orthographic and spelling inaccuracies`
          );
        }

        // Stem punctuation & clarity auto-tune
        const tuned = autoTuneStem(updatedQuestion.stem, isRtl);
        if (tuned !== updatedQuestion.stem) {
          updatedQuestion.stem = tuned;
          improvements.push(
            isRtl
              ? "ضبط علامات الترقيم وصياغة الجذع الأكاديمية"
              : "Standardized stem punctuation and declarative style"
          );
        }

        // 2. Stage 2 Formulation & Item Construction Audit (Double Negatives, Redundancies, Guessing Clues)
        if (targetBatchStage === "stage2" || targetBatchStage === "all") {
          const { options: balancedOpts, correctAnswer: balancedKey } = autoBalanceOptionsAndKey(
            updatedQuestion.options,
            updatedQuestion.correctAnswer,
            updatedQuestion.qType,
            isRtl
          );
          if (balancedOpts) {
            updatedQuestion.options = balancedOpts;
            updatedQuestion.correctAnswer = balancedKey;
            improvements.push(
              isRtl
                ? "تطهير البدائل من العبارات الإيحائية ('جميع ما سبق') وموازنة الأطوال لتقليل التخمين"
                : "Removed cueing distractors and balanced option lengths"
            );
          }

          // Stem Negative Word Bold Highlighting
          const negativeWords = ["ليس", "ما عدا", "غير", "لا "];
          const hasNeg = negativeWords.some((w) => updatedQuestion.stem.includes(w));
          if (hasNeg && !updatedQuestion.stem.includes("**")) {
            detectedIssues.push(
              isRtl ? "صياغة منفية قد تربك الطالب" : "Negative phrasing in stem"
            );
            let newStem = updatedQuestion.stem;
            negativeWords.forEach((nw) => {
              if (newStem.includes(nw)) {
                newStem = newStem.replace(new RegExp(`(${nw})`, "g"), "**$1**");
              }
            });
            updatedQuestion.stem = newStem;
            improvements.push(
              isRtl ? "تظليل أداة النفي بخط بارز لحماية الطالب من اللبس" : "Highlighted negative keyword in stem"
            );
          }
        }

        // 3. Stage 3 Psychometric Calibration Audit (Difficulty p, Discrimination D, Bloom Alignment)
        if (targetBatchStage === "stage3" || targetBatchStage === "all") {
          const psychometrics = autoCalibratePsychometrics(updatedQuestion.bloom, isRtl);
          updatedQuestion.difficulty = psychometrics.difficulty;
          updatedQuestion.difficultyIndex = psychometrics.difficultyIndex;
          updatedQuestion.discriminationIndex = psychometrics.discriminationIndex;
          updatedQuestion.discriminationStatus = psychometrics.discriminationStatus;

          improvements.push(
            isRtl
              ? `معايرة القياس السيكومتري: معامل السهولة (${Math.round(psychometrics.difficultyIndex * 100)}%) والتمييز (${psychometrics.discriminationIndex})`
              : `Calibrated psychometrics: facility (${Math.round(psychometrics.difficultyIndex * 100)}%) and discrimination (${psychometrics.discriminationIndex})`
          );
        }

        const changesCount = improvements.length;

        // Artificial small step delay for realistic smooth visual progress
        await new Promise((r) => setTimeout(r, 180));

        setAuditResults((prev) => ({
          ...prev,
          [q.id]: {
            original: q,
            updated: updatedQuestion,
            applied: true,
            status: "audited",
            changesCount,
            detectedIssues: detectedIssues.length > 0 ? detectedIssues : [isRtl ? "لا توجد ثغرات صياغية حرجة" : "No critical flaws"],
            improvements: improvements.length > 0 ? improvements : [isRtl ? "تم تدقيق المعايير وتأكيد صلاحية البند" : "Audited & confirmed compliant"],
          },
        }));
      } catch (err) {
        setAuditResults((prev) => ({
          ...prev,
          [q.id]: {
            ...prev[q.id],
            status: "error",
          },
        }));
      }
    }

    setIsRunning(false);
    setCurrentProcessingIndex(-1);
    setIsCompleted(true);
  };

  // Toggle acceptance of a single question update in batch
  const toggleItemApplied = (id: string) => {
    setAuditResults((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          applied: !prev[id].applied,
        },
      };
    });
  };

  // Save all applied updates to Parent Question List
  const handleCommitAll = () => {
    const updatedList = questions.map((q) => {
      const audit = auditResults[q.id];
      if (audit && audit.applied && audit.status === "audited") {
        return audit.updated;
      }
      return q;
    });

    onApplyBatchUpdates(updatedList);
    onClose();
  };

  const resultsList: ItemAuditState[] = Object.values(auditResults);
  const totalAudited = resultsList.filter((r) => r.status === "audited").length;
  const totalImprovements = resultsList.reduce(
    (sum, r) => sum + (r.improvements ? r.improvements.length : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  {isRtl ? "المعالجة والتطبيق الجماعي" : "Batch Multi-Item Studio"}
                </span>
                <span className="text-xs text-blue-100 font-bold">
                  ({questions.length} {isRtl ? "أسئلة متاحة" : "items available"})
                </span>
              </div>
              <h2 className="font-display font-black text-lg sm:text-xl text-white mt-0.5">
                {isRtl
                  ? "استوديو تطبيق المراحل والمعايير على أسئلة متعددة دفعة واحدة"
                  : "Batch Item Auditing & Multi-Question Stage Execution"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {selectedIds.length === questions.length
                  ? isRtl ? "إلغاء تحديد الكل" : "Deselect All"
                  : isRtl ? "تحديد جميع الأسئلة" : "Select All"}
              </span>
            </button>

            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
              {isRtl
                ? `تم تحديد ${selectedIds.length} من أصل ${questions.length} سؤال`
                : `Selected ${selectedIds.length} of ${questions.length} items`}
            </span>
          </div>

          {/* Target Stage Mode Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 ps-2">
              {isRtl ? "نطاق التطبيق:" : "Target Scope:"}
            </span>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => setTargetBatchStage("stage2")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                targetBatchStage === "stage2"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {isRtl ? "المرحلة 2 (التدقيق اللغوي والصياغة)" : "Stage 2 (Editorial)"}
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => setTargetBatchStage("stage3")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                targetBatchStage === "stage3"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {isRtl ? "المرحلة 3 (التحكيم السيكومتري)" : "Stage 3 (Psychometrics)"}
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => setTargetBatchStage("all")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                targetBatchStage === "all"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {isRtl ? "جميع المراحل (أتمتة شاملة ⚡)" : "Full Pipeline (All Stages ⚡)"}
            </button>
          </div>
        </div>

        {/* Progress Bar when running */}
        {isRunning && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-800 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span>
                  {isRtl
                    ? `جاري تطبيق المعايير على السؤال رقم ${currentProcessingIndex + 1} من ${selectedIds.length}...`
                    : `Auditing & applying criteria to item ${currentProcessingIndex + 1} of ${selectedIds.length}...`}
                </span>
              </span>
              <span>
                {Math.round(((currentProcessingIndex + 1) / Math.max(1, selectedIds.length)) * 100)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{
                  width: `${((currentProcessingIndex + 1) / Math.max(1, selectedIds.length)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Completion Banner */}
        {isCompleted && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-300 dark:border-emerald-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {isRtl
                  ? `اكتملت المعالجة الجماعية بنجاح! تم تدقيق ${totalAudited} أسئلة وإجراء ${totalImprovements} تحسينات ومعايرات قياسية.`
                  : `Batch audit complete! Processed ${totalAudited} items with ${totalImprovements} structural improvements.`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCommitAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{isRtl ? "اعتماد وحفظ جميع التعديلات في بنك الأسئلة" : "Apply All Changes to Bank"}</span>
            </button>
          </div>
        )}

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {questions.map((q, idx) => {
            const isSelected = selectedIds.includes(q.id);
            const audit = auditResults[q.id];
            const isExpanded = !!expandedItemIds[q.id];

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900/90 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isRunning}
                      onChange={() => toggleSelectQuestion(q.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600 shrink-0"
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {isRtl ? `السؤال ${idx + 1}` : `Item ${idx + 1}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {q.qType}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {q.bloom}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          {q.difficulty}
                        </span>

                        {audit && audit.status === "audited" && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>
                              {isRtl
                                ? `${audit.changesCount} تحسينات مطبقة`
                                : `${audit.changesCount} fixes applied`}
                            </span>
                          </span>
                        )}

                        {audit && audit.status === "processing" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 flex items-center gap-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>{isRtl ? "جاري التدقيق والمعايرة..." : "Auditing..."}</span>
                          </span>
                        )}
                      </div>

                      {/* Question Stem Text */}
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {audit && audit.status === "audited" ? audit.updated.stem : q.stem}
                      </p>

                      {/* Options Preview for MCQ */}
                      {(q.options || (audit && audit.updated.options)) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {(audit && audit.status === "audited" && audit.updated.options
                            ? audit.updated.options
                            : q.options || []
                          ).map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg text-xs font-medium border ${
                                opt === (audit ? audit.updated.correctAnswer : q.correctAnswer)
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold"
                                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span className="font-bold opacity-60 me-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Psychometric Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {isRtl ? "السهولة (p):" : "Facility (p):"}{" "}
                          {typeof (audit ? audit.updated.difficultyIndex : q.difficultyIndex) === "number"
                            ? `${Math.round(Number(audit ? audit.updated.difficultyIndex : q.difficultyIndex) * 100)}%`
                            : "55%"}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          {isRtl ? "التمييز (D):" : "Discrimination (D):"}{" "}
                          {typeof (audit ? audit.updated.discriminationIndex : q.discriminationIndex) === "number"
                            ? Number(audit ? audit.updated.discriminationIndex : q.discriminationIndex).toFixed(2)
                            : "0.42"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-2 shrink-0">
                    {audit && audit.status === "audited" && (
                      <button
                        type="button"
                        onClick={() => toggleItemApplied(q.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          audit.applied
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }`}
                      >
                        {audit.applied
                          ? isRtl ? "معتمد ✓" : "Accepted ✓"
                          : isRtl ? "مستبعد" : "Ignored"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(q.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details / Audit Report */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2 bg-slate-50/80 dark:bg-slate-950/60 p-3 rounded-xl">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {isRtl ? "تقرير فحص المعايير السيكومترية واللغوية:" : "Audit Log & Criteria Evaluation:"}
                    </div>

                    {audit && audit.improvements && audit.improvements.length > 0 ? (
                      <ul className="space-y-1">
                        {audit.improvements.map((imp, iIdx) => (
                          <li key={iIdx} className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500">
                        {isRtl
                          ? "اضغط على 'بدء تطبيق المراحل على الأسئلة المحددة' لتوليد تقرير الفحص والمعايرة الفورية."
                          : "Click 'Run Batch Processing' to evaluate criteria and calibrate."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRtl ? "إغلاق" : "Close"}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleStartBatchAudit}
              disabled={isRunning || selectedIds.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{isRtl ? "جاري التطبيق الشامل..." : "Applying..."}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>
                    {isRtl
                      ? `بدء تطبيق المراحل على (${selectedIds.length}) أسئلة دفعة واحدة ⚡`
                      : `Run Batch Processing on (${selectedIds.length}) Items ⚡`}
                  </span>
                </>
              )}
            </button>

            {isCompleted && (
              <button
                type="button"
                onClick={handleCommitAll}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{isRtl ? "اعتماد الكل" : "Commit All"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
