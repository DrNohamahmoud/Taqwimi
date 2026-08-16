import React, { useState } from "react";
import { Question } from "../types";
import { Language, translations } from "../translations";
import {
  X,
  Eye,
  CheckCircle2,
  HelpCircle,
  FileCheck2,
  Lock,
  Award,
  BookOpen,
  Printer,
  Sparkles,
  Share2,
} from "lucide-react";

interface ReadOnlyQuizViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionsList: Question[];
  lang: Language;
}

export default function ReadOnlyQuizViewerModal({
  isOpen,
  onClose,
  questionsList,
  lang,
}: ReadOnlyQuizViewerModalProps) {
  if (!isOpen) return null;

  const isRtl = lang === "ar";
  const t = translations[lang];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qIdx: number, option: string) => {
    if (showResults) return; // Locked once checked
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: option,
    }));
  };

  const scoreCount = questionsList.reduce((acc, q, idx) => {
    const sel = selectedAnswers[idx];
    if (!sel || !q.answer) return acc;
    if (sel === q.answer || sel.startsWith(q.answer) || q.answer.startsWith(sel)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="bg-slate-50 border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header Band */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 relative flex-shrink-0 border-b border-blue-500/20">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 sm:left-6 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
            title={isRtl ? "إغلاق المعاينة" : "Close Viewer"}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-2 sm:pr-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <BookOpen className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t.share.readOnlyBadge}
                  </span>
                  <span className="text-slate-400 text-xs font-mono">
                    {questionsList.length} {t.share.itemCount}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black font-display text-white">
                  {isRtl ? "اختبار التقييم الذاتي للطلاب (عرض فقط)" : "Student Self-Assessment Quiz"}
                </h2>
              </div>
            </div>

            {/* Score & Toggle Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResults(!showResults)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 shadow-md ${
                  showResults
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/30"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{showResults ? t.share.hideKeyBtn : t.share.showKeyBtn}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700 hidden sm:flex items-center gap-1.5"
                title={isRtl ? "طباعة الاختبار" : "Print Quiz"}
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs text-blue-900 font-medium flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {isRtl
                ? "وضع معاينة الطالب المعتمد: يمكنك تحديد الإجابات لاختبار معرفتك الذاتية، دون إمكانية التعديل على بنك الأسئلة الأصلية."
                : "Student Preview Mode: Select answers to practice self-assessment. Editing original bank items is locked."}
            </span>
          </div>

          {showResults && (
            <div className="bg-emerald-600 text-white font-mono font-bold px-3 py-0.5 rounded-lg text-xs shrink-0">
              {isRtl ? `النتيجة: ${scoreCount} / ${questionsList.length}` : `Score: ${scoreCount} / ${questionsList.length}`}
            </div>
          )}
        </div>

        {/* Quiz Items List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {questionsList.length === 0 ? (
            <div className="p-8 text-center text-slate-500">{t.share.emptyBankShareErr}</div>
          ) : (
            questionsList.map((q, idx) => {
              const selected = selectedAnswers[idx];
              return (
                <div
                  key={q.id || idx}
                  className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-3 hover:border-blue-300/80 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {q.qType} • {q.bloom || "عام"}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {isRtl ? `المستوى: ${q.difficulty || "متوسط"}` : `Difficulty: ${q.difficulty || "Medium"}`}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-relaxed pt-1">{q.stem}</p>

                  {/* Options List */}
                  {q.options && q.options.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selected === opt;
                        const isCorrect = q.answer && (opt === q.answer || opt.startsWith(q.answer));

                        let borderBg = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80";

                        if (showResults) {
                          if (isCorrect) {
                            borderBg = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400";
                          } else if (isSelected && !isCorrect) {
                            borderBg = "bg-rose-50 border-rose-300 text-rose-900 font-bold";
                          }
                        } else if (isSelected) {
                          borderBg = "bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-500";
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectOption(idx, opt)}
                            className={`p-3 rounded-xl border text-xs text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${borderBg}`}
                          >
                            <div className="flex items-center gap-2.5 leading-snug">
                              <span className="font-bold text-slate-500 w-16 shrink-0">
                                {isRtl ? `الخيار ${oIdx + 1}` : `Option ${oIdx + 1}`}
                              </span>
                              <span className="text-slate-800">{opt}</span>
                            </div>

                            {showResults && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation box */}
                  {showResults && (
                    <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1 mt-2 border border-slate-800">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isRtl ? "المفتاح والتفسير الأكاديمي:" : "Correct Key & Rationale:"}</span>
                        <span className="text-white font-mono">{q.answer}</span>
                      </div>
                      {q.explanation && (
                        <p className="text-slate-300 text-[11px] leading-relaxed">{q.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-white border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium text-center sm:text-start">
            {isRtl
              ? "حقوق الملكية الفكرية: أ.م.د/ نهى محمود أحمد · أستاذ مساعد تكنولوجيا التعليم · كلية الدراسات العليا للتربية - جامعة القاهرة"
              : "Intellectual Property: Assoc. Prof. Dr. Noha Mahmoud Ahmed · Cairo University"}
          </div>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {isRtl ? "إغلاق العرض" : "Close View"}
          </button>
        </div>
      </div>
    </div>
  );
}
