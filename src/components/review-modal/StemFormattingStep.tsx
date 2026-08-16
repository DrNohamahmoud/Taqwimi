import React from "react";
import { Sparkles, Edit3, Layers, Mic, MicOff } from "lucide-react";
import { Question } from "../../types";

interface StemFormattingStepProps {
  question: Question;
  editedStem: string;
  setEditedStem: (stem: string) => void;
  editedQType: Question["qType"];
  onSwitchQType: (type: Question["qType"]) => void;
  onAutoTuneStem: () => void;
  onInsertTag: (tag: string) => void;
  onToggleListening: () => void;
  isListening: boolean;
  isRtl: boolean;
  isDark: boolean;
  cardBg: string;
  inputBg: string;
  reviewStage: 1 | 2 | 3;
  renderNavFooter: () => React.ReactNode;
}

export default function StemFormattingStep({
  question,
  editedStem,
  setEditedStem,
  editedQType,
  onSwitchQType,
  onAutoTuneStem,
  onInsertTag,
  onToggleListening,
  isListening,
  isRtl,
  isDark,
  cardBg,
  inputBg,
  reviewStage,
  renderNavFooter,
}: StemFormattingStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 border-2 border-blue-600 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-blue-900 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {reviewStage === 2 ? "2" : "1"}
          </div>
          <div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white">
              {reviewStage === 2
                ? isRtl
                  ? "تحسين الصياغة وتنقيح الجذع لغوياً"
                  : "Stem Phrasing & Linguistic Refinement"
                : isRtl
                ? "الجذع وصياغة المثير ونمط السؤال"
                : "Stem, Stimulus & Question Format"}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 font-bold mt-0.5">
              {isRtl
                ? "التحقق من وضوح متن السؤال، الصياغة الخبرية، علامات الترقيم، وخلوه من التعقيد اللفظي"
                : "Ensure clear stimulus phrasing, declarative ending colon, and standard punctuation"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAutoTuneStem}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all border-2 border-amber-300"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{isRtl ? "إصلاح وضبط الجذع آلياً" : "Auto-Tune Stem"}</span>
        </button>
      </div>

      {/* A. Question Type Selector */}
      <div className={`p-5 rounded-3xl border-2 space-y-3 ${cardBg}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {isRtl ? "تحديد نمط السؤال المعتمد:" : "Target Question Type:"}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { type: "mcq", labelAr: "اختيار من متعدد", labelEn: "MCQ (Single)" },
            { type: "multi_mcq", labelAr: "اختيار متعدد الإجابات", labelEn: "Multiple Answers" },
            { type: "tf", labelAr: "صواب وخطأ", labelEn: "True / False" },
            { type: "fill", labelAr: "إكمال الفراغ", labelEn: "Fill-in Blank" },
            { type: "matching", labelAr: "المزاوجة والربط", labelEn: "Matching" },
            { type: "ordering", labelAr: "الترتيب والتسلسل", labelEn: "Ordering" },
            { type: "essay", labelAr: "المقالي وسلم التقدير", labelEn: "Short Essay" },
            { type: "diagram_labeling", labelAr: "التعيين على الرسم", labelEn: "Diagram Labeling" },
          ].map((item) => {
            const isCurrent = editedQType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => onSwitchQType(item.type as any)}
                className={`p-3 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-md font-black"
                    : isDark
                    ? "bg-slate-950 border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-white"
                    : "bg-slate-50 border-slate-300 text-slate-800 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-900"
                }`}
              >
                <span className="truncate">{isRtl ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* B. Stem Editor Card */}
      <div className={`p-6 rounded-3xl border-2 transition-all ${cardBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
              {isRtl ? "محرر متن السؤال / المثير" : "Item Stem & Prompt Editor"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-3 py-1 rounded-xl border-2 ${
                editedStem.length >= 20 && editedStem.length <= 220
                  ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700"
                  : "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700"
              }`}
            >
              {editedStem.length} {isRtl ? "حرف" : "chars"} ·{" "}
              {editedStem.trim().split(/\s+/).filter(Boolean).length} {isRtl ? "كلمة" : "words"}
            </span>

            <button
              type="button"
              onClick={onToggleListening}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border-2 ${
                isListening
                  ? "bg-rose-600 text-white border-rose-500 animate-pulse shadow-md"
                  : isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300"
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? (isRtl ? "استماع..." : "Listening...") : isRtl ? "إملاء صوتي" : "Dictate"}</span>
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={editedStem}
          onChange={(e) => setEditedStem(e.target.value)}
          className={`w-full p-4 rounded-2xl text-base sm:text-lg font-bold leading-relaxed outline-none transition-all resize-y border-2 ${inputBg}`}
          placeholder={
            isRtl
              ? "اكتب أو حرر متن السؤال كجملة خبرية واضحة تنتهي بنقطتين (:)..."
              : "Type or edit question stem here..."
          }
        />

        {/* Quick Insertion Palette */}
        <div className="mt-4 pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">
              {isRtl ? "إدراج سريع:" : "Quick Insert:"}
            </span>
            <button
              type="button"
              onClick={() => onInsertTag("___")}
              className="px-3 py-1 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:bg-indigo-100 hover:text-indigo-900 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              ___ {isRtl ? "(فراغ)" : "(Blank)"}
            </button>
            <button
              type="button"
              onClick={() => onInsertTag(":")}
              className="px-3 py-1 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:bg-indigo-100 hover:text-indigo-900 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              : {isRtl ? "(نقطتان)" : "(Colon)"}
            </button>
            <button
              type="button"
              onClick={() => onInsertTag("«»")}
              className="px-3 py-1 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:bg-indigo-100 hover:text-indigo-900 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              « » {isRtl ? "(تنصيص)" : "(Quotes)"}
            </button>
            <button
              type="button"
              onClick={() => onInsertTag("،")}
              className="px-3 py-1 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:bg-indigo-100 hover:text-indigo-900 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              ، {isRtl ? "(فاصلة)" : "(Comma)"}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      {renderNavFooter()}
    </div>
  );
}
