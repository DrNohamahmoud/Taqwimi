import React from "react";
import { Award, CheckCircle2, BookmarkCheck, FileText, Copy, ShieldCheck } from "lucide-react";
import { Question } from "../../types";
import StudentExamPreview from "../StudentExamPreview";

interface PreviewAndCertifyStepProps {
  question: Question;
  reviewStage: 1 | 2 | 3;
  onSave: () => void;
  onCopy: () => void;
  copiedSuccess: boolean;
  isRtl: boolean;
  isDark: boolean;
  isZenTheme: boolean;
  cardBg: string;
  renderNavFooter: () => React.ReactNode;
}

export default function PreviewAndCertifyStep({
  question,
  reviewStage,
  onSave,
  onCopy,
  copiedSuccess,
  isRtl,
  isDark,
  isZenTheme,
  cardBg,
  renderNavFooter,
}: PreviewAndCertifyStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 border-2 border-emerald-400 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {reviewStage === 3 ? "4" : reviewStage === 2 ? "4" : "4"}
          </div>
          <div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white">
              {reviewStage === 3
                ? isRtl
                  ? "شهادة الصلاحية السيكومترية والاعتماد النهائي"
                  : "Psychometric Passport & Final Bank Certification"
                : reviewStage === 2
                ? isRtl
                  ? "شهادة الاستيفاء اللغوي والمحاكاة الحية"
                  : "Linguistic Clearance & Live Exam Preview"
                : isRtl
                ? "ورقة الاختبار وبنك الأسئلة المعتمد"
                : "Live Exam Sheet & Bank Certification"}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 font-bold mt-0.5">
              {isRtl
                ? "معاينة تجربة الطالب الحقيقية، التحقق من جاهزية الطباعة، وتثبيت المفردة في بنك الأسئلة"
                : "Live student exam simulation, print readiness verification, and official bank export"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer border border-white/40 shadow-xs"
          >
            {copiedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSuccess ? (isRtl ? "تم النسخ!" : "Copied!") : isRtl ? "نسخ السؤال" : "Copy Item"}</span>
          </button>
        </div>
      </div>

      {/* Readiness Certification Badges with High Contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-slate-900 border-2 border-emerald-500 shadow-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">{isRtl ? "الصدق البنائي:" : "Construct Validity:"}</span>
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">{isRtl ? "معتمد ومستوفٍ" : "Certified"}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-100 dark:bg-slate-900 border-2 border-blue-500 shadow-sm flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">{isRtl ? "المستوى المعرفي:" : "Cognitive Level:"}</span>
            <span className="text-xs font-black text-blue-900 dark:text-blue-300">{question.bloom || (isRtl ? "فهم" : "Understand")}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-100 dark:bg-slate-900 border-2 border-purple-500 shadow-sm flex items-center gap-2.5">
          <Award className="w-5 h-5 text-purple-700 dark:text-purple-400 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">{isRtl ? "معامل الصعوبة:" : "Difficulty (p):"}</span>
            <span className="text-xs font-black text-purple-900 dark:text-purple-300 font-mono">p = {question.difficultyIndex || 0.6}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-100 dark:bg-slate-900 border-2 border-indigo-500 shadow-sm flex items-center gap-2.5">
          <BookmarkCheck className="w-5 h-5 text-indigo-700 dark:text-indigo-400 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">{isRtl ? "معامل التمييز:" : "Discrimination:"}</span>
            <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 font-mono">D = +{question.discriminationIndex || 0.42}</span>
          </div>
        </div>
      </div>

      {/* Live Exam Simulation Card */}
      <div
        className={`p-4 sm:p-6 rounded-3xl border-2 shadow-2xl transition-all ${
          isDark
            ? "bg-slate-950 border-slate-800"
            : isZenTheme
            ? "bg-stone-200 border-stone-300"
            : "bg-slate-200/80 border-slate-300"
        }`}
      >
        <StudentExamPreview
          question={question}
          isRtl={isRtl}
          isDark={isDark}
        />
      </div>

      {/* Navigation Footer */}
      {renderNavFooter()}
    </div>
  );
}
