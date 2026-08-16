import React, { useState } from "react";
import { CheckCheck, SpellCheck, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, ArrowRight } from "lucide-react";
import { Question } from "../types";
import { Language } from "../translations";
import {
  checkQuestionSpelling,
  applyAllSpellingFixes,
  applySingleSpellingFix,
  SpellCheckIssue,
} from "../utils/spellChecker";

interface QuestionSpellCheckBannerProps {
  question: Question;
  lang: Language;
  onUpdateQuestion: (updatedQ: Question) => void;
}

export default function QuestionSpellCheckBanner({
  question,
  lang,
  onUpdateQuestion,
}: QuestionSpellCheckBannerProps) {
  const isRtl = lang === "ar";
  const [isExpanded, setIsExpanded] = useState(false);
  const [justFixedId, setJustFixedId] = useState<string | null>(null);

  const spellResult = checkQuestionSpelling(question, isRtl);

  const handleFixAll = () => {
    const fixed = applyAllSpellingFixes(question, isRtl);
    onUpdateQuestion(fixed);
    setJustFixedId("all");
    setTimeout(() => setJustFixedId(null), 2500);
  };

  const handleFixSingle = (issue: SpellCheckIssue) => {
    const fixed = applySingleSpellingFix(question, issue);
    onUpdateQuestion(fixed);
    setJustFixedId(issue.id);
    setTimeout(() => setJustFixedId(null), 2500);
  };

  if (!spellResult.hasErrors) {
    return (
      <div className="flex items-center justify-between gap-2 p-2.5 px-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isRtl
              ? "التدقيق الإملائي التلقائي: الصياغة سليمة ومطابقة لقواعد الإملاء والرسم العربي (٠ أخطاء)"
              : "Auto Spell-Check: Phrasing is orthographically sound (0 spelling errors)"}
          </span>
        </div>
        {justFixedId === "all" && (
          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-200/70 text-emerald-950 font-bold px-2 py-0.5 rounded-full animate-bounce">
            <Sparkles className="w-3 h-3 text-emerald-700" />
            {isRtl ? "تم تطبيق التصحيح بنجاح!" : "Fixed Successfully!"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300/80 bg-amber-50/60 overflow-hidden shadow-2xs transition-all">
      {/* Header Bar */}
      <div className="p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
            <SpellCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-950">
                {isRtl ? "التدقيق الإملائي التلقائي" : "Auto Spell-Check & Orthography"}
              </span>
              <span className="bg-amber-200/80 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                {isRtl
                  ? `${spellResult.totalErrors} ${spellResult.totalErrors === 1 ? "خطأ إملائي" : "أخطاء إملائية"}`
                  : `${spellResult.totalErrors} spelling ${spellResult.totalErrors === 1 ? "issue" : "issues"}`}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium mt-0.5">
              {isRtl
                ? "تم رصد أخطاء إملائية شائعة في متن السؤال أو البدائل يمكنك تصحيحها بنقرة واحدة."
                : "Common spelling typos detected in stem or choices. You can fix them in 1 click."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFixAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{isRtl ? "تصحيح كافة الأخطاء دفعة واحدة" : "Fix All Typos"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-200/50 rounded-lg transition-colors cursor-pointer"
            title={isRtl ? "عرض تفاصيل الأخطاء والمقترحات" : "Toggle error details"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Suggestions List */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-amber-200/60 bg-amber-50/40 space-y-2">
          <div className="text-[11px] font-bold text-amber-900 mb-1">
            {isRtl ? "تفاصيل الأخطاء المرصودة والمقترحات التصحيحية:" : "Detailed typo breakdown & suggestions:"}
          </div>

          <div className="space-y-1.5">
            {spellResult.allIssues.map((issue) => {
              const locationLabel =
                issue.location === "stem"
                  ? isRtl ? "في جذع السؤال" : "in Question Stem"
                  : issue.location === "correctAnswer"
                  ? isRtl ? "في الإجابة النموذجية" : "in Model Answer"
                  : isRtl
                  ? `في الخيار رقم ${(issue.optionIndex ?? 0) + 1}`
                  : `in Option ${(issue.optionIndex ?? 0) + 1}`;

              return (
                <div
                  key={issue.id}
                  className="p-2.5 rounded-lg bg-white border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        {locationLabel}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                        {isRtl ? issue.categoryLabelAr : issue.categoryLabelEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold pt-0.5">
                      <span className="line-through text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {issue.originalWord}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 text-slate-400 ${isRtl ? "rotate-180" : ""}`} />
                      <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {issue.suggestedWord}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-normal">
                      {isRtl ? issue.explanationAr : issue.explanationEn}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFixSingle(issue)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <span>{isRtl ? "تطبيق التصحيح" : "Apply Fix"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
