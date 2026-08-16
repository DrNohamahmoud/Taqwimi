import React from "react";
import { Question } from "../types";
import { CheckCircle2, FileText, Image as ImageIcon, ArrowRightLeft, Shuffle, CheckSquare } from "lucide-react";

interface StudentExamPreviewProps {
  question: Question;
  isRtl: boolean;
  isDark: boolean;
}

export default function StudentExamPreview({ question, isRtl, isDark }: StudentExamPreviewProps) {
  const { stem, qType, options = [], correctAnswer = "", imageUrl, rubrics = [] } = question;

  return (
    <div
      className={`p-6 rounded-3xl border-2 space-y-6 transition-all ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-100 shadow-xl"
          : "bg-white border-slate-300 text-slate-950 shadow-md"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header of the Exam Paper Sheet */}
      <div
        className={`flex items-center justify-between pb-4 border-b border-dashed ${
          isDark ? "border-slate-700" : "border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <FileText className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-700"}`} />
          <span
            className={`font-display font-black text-sm sm:text-base ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            {isRtl ? "معاينة السؤال في ورقة الاختبار (منظور الطالب):" : "Student Exam Paper Preview:"}
          </span>
        </div>
      </div>

      {/* Question Prompt / Stem */}
      <div className="space-y-2">
        <div className="flex items-start gap-2.5">
          <span
            className={`w-7 h-7 rounded-full font-black text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
              isDark ? "bg-indigo-600 text-white" : "bg-slate-950 text-white"
            }`}
          >
            1
          </span>
          <p
            className={`text-base sm:text-lg font-bold leading-relaxed ${
              stem
                ? isDark
                  ? "text-white"
                  : "text-slate-950"
                : isDark
                ? "text-slate-400 italic"
                : "text-slate-600 italic font-medium"
            }`}
          >
            {stem || (isRtl ? "[لم يتم إدخال متن السؤال بعد]" : "[No stem provided]")}
          </p>
        </div>

        {/* Diagram Image if available */}
        {qType === "diagram_labeling" && imageUrl && (
          <div
            className={`my-4 p-2 rounded-2xl border flex justify-center ${
              isDark ? "border-slate-700 bg-slate-950" : "border-slate-300 bg-slate-50"
            }`}
          >
            <img
              src={imageUrl}
              alt="Exam Diagram"
              className="max-h-56 rounded-xl object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* Answer Area by Type */}
      <div className="space-y-3 pt-2">
        {/* Single Choice MCQ */}
        {qType === "mcq" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 text-sm font-bold shadow-xs ${
                  isDark
                    ? "bg-slate-950/80 border-slate-700 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-950"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                    isDark
                      ? "border-slate-500 bg-slate-800 text-slate-200"
                      : "border-slate-400 bg-white text-slate-950"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 leading-snug">{opt || `(الخيار ${idx + 1})`}</span>
              </div>
            ))}
          </div>
        )}

        {/* Multi-MCQ */}
        {qType === "multi_mcq" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 text-sm font-bold shadow-xs ${
                  isDark
                    ? "bg-slate-950/80 border-slate-700 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-950"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                    isDark
                      ? "border-slate-500 bg-slate-800"
                      : "border-slate-400 bg-white"
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-transparent" />
                </div>
                <span className="flex-1 leading-snug">{opt || `(الخيار ${idx + 1})`}</span>
              </div>
            ))}
          </div>
        )}

        {/* True / False */}
        {qType === "tf" && (
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-2xl border-2 text-center font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xs ${
                isDark
                  ? "bg-slate-950/80 border-slate-700 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-950"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 ${
                  isDark ? "border-slate-400 bg-slate-800" : "border-slate-500 bg-white"
                }`}
              />
              <span>{isRtl ? "صواب (True)" : "True"}</span>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 text-center font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xs ${
                isDark
                  ? "bg-slate-950/80 border-slate-700 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-950"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 ${
                  isDark ? "border-slate-400 bg-slate-800" : "border-slate-500 bg-white"
                }`}
              />
              <span>{isRtl ? "خطأ (False)" : "False"}</span>
            </div>
          </div>
        )}

        {/* Fill Blank */}
        {qType === "fill" && (
          <div
            className={`p-5 rounded-2xl border-2 border-dashed ${
              isDark ? "bg-slate-950/70 border-slate-700" : "bg-slate-50 border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-black mb-3">
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                {isRtl ? "مساحة إجابة الطالب:" : "Student Answer Line:"}
              </span>
            </div>
            <div
              className={`h-10 border-b-2 flex items-center px-2 ${
                isDark ? "border-slate-500 text-slate-300" : "border-slate-400 text-slate-600"
              }`}
            >
              <span className="text-xs font-semibold">
                {isRtl ? "اكتب الإجابة هنا ........................................................" : "Write answer here ........................................................"}
              </span>
            </div>
          </div>
        )}

        {/* Matching */}
        {qType === "matching" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-2">
                <span className={`block font-black ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                  {isRtl ? "العمود أ (المفاهيم):" : "Column A:"}
                </span>
                {options.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 shadow-xs ${
                      isDark
                        ? "bg-slate-950/80 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-300 text-slate-950"
                    }`}
                  >
                    <span className="font-black text-blue-600 dark:text-blue-400">{idx + 1}.</span>
                    <span className="font-bold">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <span className={`block font-black ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                  {isRtl ? "العمود ب (الاستجابات):" : "Column B (Responses):"}
                </span>
                {options.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 shadow-xs ${
                      isDark
                        ? "bg-slate-950/80 border-slate-700 text-slate-100"
                        : "bg-slate-50 border-slate-300 text-slate-950"
                    }`}
                  >
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ordering */}
        {qType === "ordering" && (
          <div className="space-y-2">
            <span className={`text-xs font-black block ${isDark ? "text-slate-300" : "text-slate-800"}`}>
              {isRtl ? "رتب العناصر التالية في تسلسلها الصحيح:" : "Order the following steps:"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2.5 text-xs font-bold shadow-xs ${
                    isDark
                      ? "bg-slate-950/80 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-950"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-[10px] font-black ${
                      isDark
                        ? "border-slate-500 bg-slate-800 text-slate-300"
                        : "border-slate-400 bg-white text-slate-800"
                    }`}
                  >
                    [ ]
                  </div>
                  <span className="font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Essay */}
        {qType === "essay" && (
          <div className="space-y-3">
            <div
              className={`p-5 rounded-2xl border-2 border-dashed min-h-[130px] flex flex-col justify-between ${
                isDark ? "bg-slate-950/70 border-slate-700" : "bg-slate-50 border-slate-300"
              }`}
            >
              <span className={`text-xs font-black ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {isRtl ? "مساحة تحرير الإجابة المقالية للطالب:" : "Student Essay Response Area:"}
              </span>
              <div className={`border-b-2 my-2 ${isDark ? "border-slate-700" : "border-slate-300"}`} />
              <div className={`border-b-2 my-2 ${isDark ? "border-slate-700" : "border-slate-300"}`} />
              <div className={`border-b-2 my-2 ${isDark ? "border-slate-700" : "border-slate-300"}`} />
            </div>

            {/* Rubrics Preview for Teacher / Student */}
            {rubrics && rubrics.length > 0 && (
              <div
                className={`p-4 rounded-2xl border-2 space-y-2.5 ${
                  isDark
                    ? "bg-indigo-950/40 border-indigo-800/80 text-indigo-100"
                    : "bg-indigo-50 border-indigo-200 text-indigo-950"
                }`}
              >
                <span className="text-xs font-black block">
                  {isRtl ? "سلالم التقدير والدرجات المقررة:" : "Scoring Rubric & Points:"}
                </span>
                <div className="space-y-1.5">
                  {rubrics.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between text-xs font-bold ${
                        isDark ? "text-slate-200" : "text-slate-900"
                      }`}
                    >
                      <span>• {r.criterion}</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400">
                        {r.points} {isRtl ? "درجة" : "pts"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Model Answer Teacher Key Footer */}
      <div
        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs font-bold ${
          isDark
            ? "bg-emerald-950/50 border-emerald-800 text-emerald-200"
            : "bg-emerald-50 border-emerald-300 text-emerald-950"
        }`}
      >
        <span className="font-black flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {isRtl ? "مفتاح الإجابة النموذجية المعتمد:" : "Certified Answer Key:"}
        </span>
        <span className="font-mono font-black text-sm">
          {correctAnswer || (isRtl ? "غير محدد" : "None")}
        </span>
      </div>
    </div>
  );
}
