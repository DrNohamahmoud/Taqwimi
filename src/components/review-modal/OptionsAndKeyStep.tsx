import React from "react";
import { Sparkles, ListOrdered, Plus, Trash2, ArrowUp, ArrowDown, Check, CheckSquare, Square } from "lucide-react";
import { Question, RubricCriterion } from "../../types";

interface OptionsAndKeyStepProps {
  question: Question;
  editedQType: Question["qType"];
  editedOptions: string[];
  setEditedOptions: (opts: string[]) => void;
  editedCorrectAnswer: string;
  setEditedCorrectAnswer: (ans: string) => void;
  editedRubrics: RubricCriterion[];
  setEditedRubrics: (rubrics: RubricCriterion[]) => void;
  matchingColumnB: string[];
  setMatchingColumnB: (b: string[]) => void;
  editedImageUrl: string;
  setEditedImageUrl: (url: string) => void;
  onAutoBalanceOptions: () => void;
  onAddOption: () => void;
  onRemoveOption: (idx: number) => void;
  onMoveOption: (idx: number, dir: "up" | "down") => void;
  onOptionChange: (idx: number, val: string) => void;
  onToggleMultiKey: (opt: string) => void;
  isRtl: boolean;
  isDark: boolean;
  cardBg: string;
  inputBg: string;
  reviewStage: 1 | 2 | 3;
  renderNavFooter: () => React.ReactNode;
}

export default function OptionsAndKeyStep({
  question,
  editedQType,
  editedOptions,
  setEditedOptions,
  editedCorrectAnswer,
  setEditedCorrectAnswer,
  editedRubrics,
  setEditedRubrics,
  matchingColumnB,
  setMatchingColumnB,
  editedImageUrl,
  setEditedImageUrl,
  onAutoBalanceOptions,
  onAddOption,
  onRemoveOption,
  onMoveOption,
  onOptionChange,
  onToggleMultiKey,
  isRtl,
  isDark,
  cardBg,
  inputBg,
  reviewStage,
  renderNavFooter,
}: OptionsAndKeyStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-violet-900 to-slate-900 border-2 border-indigo-400 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
            {reviewStage === 2 ? "3" : "2"}
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white">
              {reviewStage === 2
                ? isRtl
                  ? "موازنة البدائل لغوياً ونحوياً وتعيين المفتاح المعتمد"
                  : "Options Balance & Distractor Polish"
                : isRtl
                ? "البدائل والمشتتات وتعيين المفتاح المعتمد"
                : "Options, Distractors & Answer Key"}
            </h3>
            <p className="text-xs text-indigo-100 font-bold">
              {isRtl
                ? "موازنة أطوال البدائل، تجانس المشتتات، التحقق من خلو الخيارات من الإيحاء بالإجابة، وتثبيت المفتاح الصحيح"
                : "Ensure balanced option length, plausible distractors, and a certified single answer key"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAutoBalanceOptions}
          className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all border border-indigo-300"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isRtl ? "⚡ موازنة البدائل وتعيين المفتاح آلياً" : "⚡ Auto-Balance Options"}</span>
        </button>
      </div>

      {/* Format-Specific Options Workspace */}
      <div className={`p-6 rounded-3xl border-2 transition-all ${cardBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-300 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
              {editedQType === "essay"
                ? isRtl ? "سلم التقدير اللفظي (Rubric)" : "Essay Scoring Rubric"
                : editedQType === "tf"
                ? isRtl ? "تحديد مفتاح الصواب / الخطأ" : "True / False Key"
                : editedQType === "fill"
                ? isRtl ? "الكلمة المستهدفة في الفراغ" : "Target Fill Word"
                : editedQType === "matching"
                ? isRtl ? "قائمتي المزاوجة (أ و ب)" : "Matching Lists"
                : editedQType === "ordering"
                ? isRtl ? "عناصر الترتيب الصحيح" : "Sequence Elements"
                : editedQType === "diagram_labeling"
                ? isRtl ? "بيانات التعيين على الرسم" : "Diagram Pin Labels"
                : editedQType === "multi_mcq"
                ? isRtl ? "البدائل وتحديد الإجابات المتعددة" : "Multi-Answer Options"
                : isRtl ? "البدائل والخيارات والمشتتات" : "Options & Distractors"}
            </h3>
          </div>

          {(editedQType === "mcq" || editedQType === "multi_mcq" || editedQType === "ordering") && (
            <button
              type="button"
              onClick={onAddOption}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm border border-indigo-400"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isRtl ? "إضافة بديل جديد" : "Add Option"}</span>
            </button>
          )}
        </div>

        {/* 1. MCQ Single */}
        {editedQType === "mcq" && (
          <div className="space-y-3">
            {editedOptions.map((opt, idx) => {
              const isKey = opt === editedCorrectAnswer && opt.trim().length > 0;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    isKey
                      ? "bg-emerald-100/70 border-emerald-500 shadow-sm dark:bg-emerald-950/60 dark:border-emerald-500"
                      : isDark
                      ? "bg-slate-900 border-slate-700"
                      : "bg-slate-100 border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setEditedCorrectAnswer(opt)}
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs ${
                      isKey
                        ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {isKey ? <Check className="w-4 h-4 stroke-[3]" /> : String.fromCharCode(65 + idx)}
                  </button>

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => onOptionChange(idx, e.target.value)}
                    className={`flex-1 p-2.5 rounded-xl text-xs sm:text-sm font-bold border-2 ${inputBg}`}
                    placeholder={isRtl ? `اكتب البديل ${String.fromCharCode(65 + idx)}...` : `Option ${String.fromCharCode(65 + idx)}...`}
                  />

                  {editedOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onRemoveOption(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. True / False */}
        {editedQType === "tf" && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: isRtl ? "صواب" : "True", color: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60" },
              { val: isRtl ? "خطأ" : "False", color: "border-rose-500 bg-rose-50 dark:bg-rose-950/60" },
            ].map((tf) => {
              const isSelected = editedCorrectAnswer === tf.val;
              return (
                <button
                  key={tf.val}
                  type="button"
                  onClick={() => setEditedCorrectAnswer(tf.val)}
                  className={`p-6 rounded-3xl border-2 font-display font-black text-lg transition-all cursor-pointer text-center ${
                    isSelected
                      ? `${tf.color} shadow-lg scale-[1.02] ring-2 ring-indigo-400`
                      : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 opacity-60"
                  }`}
                >
                  {tf.val}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Fill Blank */}
        {editedQType === "fill" && (
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100">
              {isRtl ? "الإجابة النموذجية للفراغ (الكلمة أو القيمة المطلوبة):" : "Target Fill-in Answer:"}
            </label>
            <input
              type="text"
              value={editedCorrectAnswer}
              onChange={(e) => setEditedCorrectAnswer(e.target.value)}
              className={`w-full p-3.5 rounded-2xl text-base font-bold border-2 ${inputBg}`}
              placeholder={isRtl ? "اكتب الإجابة النموذجية للفراغ..." : "Enter fill blank answer..."}
            />
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {renderNavFooter()}
    </div>
  );
}
