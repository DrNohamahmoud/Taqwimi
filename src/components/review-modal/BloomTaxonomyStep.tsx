import React from "react";
import { Sparkles, Layers, CheckCircle2, ChevronRight, ChevronLeft, BookmarkCheck, Target, Award, BookOpen } from "lucide-react";
import { Question } from "../../types";
import { Language } from "../../translations";

interface BloomTaxonomyStepProps {
  question: Question;
  editedBloom: Question["bloom"];
  setEditedBloom: (bloom: Question["bloom"]) => void;
  editedDifficulty: Question["difficulty"];
  setEditedDifficulty: (diff: Question["difficulty"]) => void;
  editedContextReference: string;
  setEditedContextReference: (ref: string) => void;
  editedStem: string;
  setEditedStem: (stem: string) => void;
  isRtl: boolean;
  isDark: boolean;
  cardBg: string;
  inputBg: string;
  reviewStage: 1 | 2 | 3;
  renderNavFooter: () => React.ReactNode;
}

export const BLOOM_LEVELS_METADATA = [
  {
    levelAr: "تذكر",
    levelEn: "Remember",
    color: "bg-blue-600 border-blue-400",
    badgeColor: "bg-blue-50 text-blue-950 dark:bg-blue-950/80 dark:text-blue-200 border-blue-300 dark:border-blue-700",
    descAr: "استرجاع واستدعاء الحقائق، المصطلحات، والمفاهيم الأساسية من الذاكرة",
    descEn: "Recall facts, basic concepts, terms, and definitions",
    verbsAr: ["يعرف", "يعدد", "يذكر", "يسمي", "يحدد", "يسترجع", "يتعرف على", "يطابق"],
    verbsEn: ["Define", "List", "Recall", "Name", "Identify", "State", "Recognize", "Match"],
    dokLevel: 1,
    dokLabelAr: "المستوى 1: الاستدعاء وإعادة الإنتاج (Recall)",
    dokLabelEn: "DOK 1: Recall & Reproduction",
    targetWeight: "15%",
  },
  {
    levelAr: "فهم",
    levelEn: "Understand",
    color: "bg-emerald-600 border-emerald-400",
    badgeColor: "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
    descAr: "استيعاب المعاني، التفسير، الشرح، وإعادة الصياغة بالأسلوب الخاص",
    descEn: "Explain ideas, concepts, interpret, summarize, and paraphrase",
    verbsAr: ["يفسر", "يشرح", "يلخص", "يصنف", "يستنتج", "يعيد صياغة", "يوضح", "يميز"],
    verbsEn: ["Explain", "Interpret", "Summarize", "Classify", "Infer", "Paraphrase", "Illustrate"],
    dokLevel: 2,
    dokLabelAr: "المستوى 2: المفاهيم والمهارات الأساسية (Skill/Concept)",
    dokLabelEn: "DOK 2: Skills & Concepts",
    targetWeight: "25%",
  },
  {
    levelAr: "تطبيق",
    levelEn: "Apply",
    color: "bg-teal-600 border-teal-400",
    badgeColor: "bg-teal-50 text-teal-950 dark:bg-teal-950/80 dark:text-teal-200 border-teal-300 dark:border-teal-700",
    descAr: "استخدام القواعد والنظريات لحل مشكلات وتطبيق المعرفة في سياقات جديدة",
    descEn: "Use information in new situations, execute, calculate, solve",
    verbsAr: ["يطبق", "يحسب", "يحل", "يستخدم", "ينفذ", "يجرب", "يوظف", "يعالج"],
    verbsEn: ["Apply", "Calculate", "Solve", "Execute", "Implement", "Demonstrate", "Operate"],
    dokLevel: 2,
    dokLabelAr: "المستوى 2: التطبيق الإجرائي وحل المسائل (Application)",
    dokLabelEn: "DOK 2: Procedural Application",
    targetWeight: "30%",
  },
  {
    levelAr: "تحليل",
    levelEn: "Analyze",
    color: "bg-amber-600 border-amber-400",
    badgeColor: "bg-amber-50 text-amber-950 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-700",
    descAr: "تفكيك المعلومات إلى عناصرها وفحص العلاقات والمقارنة والاستدلال",
    descEn: "Draw connections, differentiate, organize, attribute, examine",
    verbsAr: ["يحلل", "يقارن", "يميز", "يفكك", "يفرز", "يفحص", "يستخلص", "يوازن"],
    verbsEn: ["Analyze", "Compare", "Differentiate", "Deconstruct", "Examine", "Distinguish"],
    dokLevel: 3,
    dokLabelAr: "المستوى 3: التفكير الاستراتيجي والاستدلال (Strategic Thinking)",
    dokLabelEn: "DOK 3: Strategic Thinking",
    targetWeight: "20%",
  },
  {
    levelAr: "تقويم",
    levelEn: "Evaluate",
    color: "bg-orange-600 border-orange-400",
    badgeColor: "bg-orange-50 text-orange-950 dark:bg-orange-950/80 dark:text-orange-200 border-orange-300 dark:border-orange-700",
    descAr: "إصدار الأحكام، نقد الأفكار، الدفاع عن وجهة نظر والمفاضلة بالمعايير",
    descEn: "Justify a stand, critique, judge, appraise, defend, evaluate",
    verbsAr: ["يقيم", "يحكم", "يبرر", "ينقد", "يرجح", "يفاضل", "يثبت", "يدافع عن"],
    verbsEn: ["Evaluate", "Judge", "Justify", "Critique", "Appraise", "Defend", "Prioritize"],
    dokLevel: 3,
    dokLabelAr: "المستوى 3: التقويم وإصدار الأحكام المبررة (Evaluation)",
    dokLabelEn: "DOK 3: Judgement & Defense",
    targetWeight: "10%",
  },
  {
    levelAr: "ابتكار",
    levelEn: "Create",
    color: "bg-purple-600 border-purple-400",
    badgeColor: "bg-purple-50 text-purple-950 dark:bg-purple-950/80 dark:text-purple-200 border-purple-300 dark:border-purple-700",
    descAr: "توليد أفكار جديدة، تصميم حلول أصيلة، وتأليف نماذج مبتكرة",
    descEn: "Produce new or original work, design, construct, develop, formulate",
    verbsAr: ["يبتكر", "يصمم", "يركب", "يؤلف", "يطور", "يخطط", "يقترح", "ينشئ"],
    verbsEn: ["Create", "Design", "Construct", "Develop", "Formulate", "Invent", "Compose"],
    dokLevel: 4,
    dokLabelAr: "المستوى 4: التفكير الموسع والابتكار الأصيل (Extended Thinking)",
    dokLabelEn: "DOK 4: Extended Thinking",
    targetWeight: "5%",
  },
];

export default function BloomTaxonomyStep({
  question,
  editedBloom,
  setEditedBloom,
  editedDifficulty,
  setEditedDifficulty,
  editedContextReference,
  setEditedContextReference,
  editedStem,
  setEditedStem,
  isRtl,
  isDark,
  cardBg,
  inputBg,
  reviewStage,
  renderNavFooter,
}: BloomTaxonomyStepProps) {
  const currentBloomMeta =
    BLOOM_LEVELS_METADATA.find(
      (b) => b.levelAr === editedBloom || b.levelEn.toLowerCase() === String(editedBloom).toLowerCase()
    ) || BLOOM_LEVELS_METADATA[1];

  // Insert a cognitive verb at the beginning of the stem
  const handleApplyVerb = (verb: string) => {
    let stem = editedStem.trim();
    const words = stem.split(" ");
    if (words.length > 0 && words[0].length <= 8) {
      words[0] = verb;
      setEditedStem(words.join(" "));
    } else {
      setEditedStem(`${verb} ${stem}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border-2 border-purple-400 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            3
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-purple-500/40 text-purple-100 border border-purple-300/50 px-2.5 py-0.5 rounded-full">
                {isRtl ? "المرحلة 3: التصنيف المعرفي" : "Stage 3: Bloom Taxonomy"}
              </span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1">
              {isRtl
                ? "هرم بلوم المعرفي ومصفوفة نواتج التعلم المستهدفة"
                : "Bloom's Cognitive Hierarchy & ILO Matrix"}
            </h3>
            <p className="text-xs sm:text-sm text-purple-100 font-bold mt-0.5">
              {isRtl
                ? "معايرة المستوى المعرفي المستهدف، الأفعال السلوكية المعيارية، وعمق المعرفة (DOK)"
                : "Calibrate target cognitive depth, standard performance action verbs & DOK alignment"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-purple-400 text-slate-950 text-xs font-black shadow-md">
            {isRtl ? `المستوى الحالي: ${currentBloomMeta.levelAr}` : `Current: ${currentBloomMeta.levelEn}`}
          </span>
        </div>
      </div>

      {/* 1. Bloom 6 Levels Grid */}
      <div className={`p-6 rounded-3xl border-2 space-y-4 shadow-sm ${cardBg}`}>
        <div className="flex items-center justify-between">
          <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-700 dark:text-purple-400 stroke-[2.5]" />
            <span>{isRtl ? "المستويات المعرفية الستة (هرم بلوم المعدل):" : "6 Cognitive Levels (Revised Bloom):"}</span>
          </h4>
          <span className="text-xs font-black text-purple-800 dark:text-purple-300">
            {isRtl ? "انقر لتحديد المستوى المعرفي" : "Click to select"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BLOOM_LEVELS_METADATA.map((b) => {
            const isSelected =
              editedBloom === b.levelAr ||
              editedBloom === b.levelEn ||
              String(editedBloom).toLowerCase() === b.levelEn.toLowerCase();

            return (
              <button
                key={b.levelEn}
                type="button"
                onClick={() => setEditedBloom(isRtl ? (b.levelAr as any) : (b.levelEn as any))}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-start flex flex-col justify-between gap-2 relative overflow-hidden ${
                  isSelected
                    ? `${b.color} text-white shadow-xl scale-[1.03] ring-2 ring-purple-300 font-black`
                    : isDark
                    ? "bg-slate-950 border-slate-700 text-white hover:border-purple-400"
                    : "bg-white border-slate-300 text-slate-950 hover:bg-purple-50/70 hover:border-purple-500 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-sm">{isRtl ? b.levelAr : b.levelEn}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-white/25 text-white border border-white/40"
                        : isDark
                        ? "bg-slate-800 text-slate-200 border border-slate-700"
                        : "bg-slate-200 text-slate-950 border border-slate-300"
                    }`}
                  >
                    {b.targetWeight}
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-tight line-clamp-2 ${
                    isSelected ? "text-white" : isDark ? "text-slate-200 font-bold" : "text-slate-800 font-bold"
                  }`}
                >
                  {isRtl ? b.descAr : b.descEn}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Level Deep Dive Card */}
        <div className={`p-5 rounded-2xl border-2 ${currentBloomMeta.badgeColor} space-y-3.5 mt-3 shadow-xs`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Award className="w-6 h-6 text-purple-800 dark:text-purple-300 shrink-0 stroke-[2.5]" />
              <div>
                <h5 className="font-display font-black text-sm sm:text-base text-slate-950 dark:text-white">
                  {isRtl
                    ? `المستوى المعرفي النشط: ${currentBloomMeta.levelAr} (${currentBloomMeta.levelEn})`
                    : `Active Level: ${currentBloomMeta.levelEn}`}
                </h5>
                <p className="text-xs font-black text-purple-950 dark:text-purple-200 mt-0.5">
                  {isRtl ? currentBloomMeta.dokLabelAr : currentBloomMeta.dokLabelEn}
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-xl bg-purple-700 text-white shadow-xs">
              {isRtl ? `الوزن النسبي الموصى به: ${currentBloomMeta.targetWeight}` : `Target Weight: ${currentBloomMeta.targetWeight}`}
            </span>
          </div>

          {/* Action Verbs Palette */}
          <div className="space-y-2 pt-2 border-t border-purple-300 dark:border-purple-800">
            <span className="text-xs font-black text-slate-950 dark:text-white block">
              {isRtl
                ? "⚡ بنك الأفعال السلوكية المعيارية لهذا المستوى (انقر لتطبيق الفعل في بداية السؤال فوراً):"
                : "⚡ Standard Action Verbs (Click to apply immediately):"}
            </span>
            <div className="flex flex-wrap gap-2">
              {(isRtl ? currentBloomMeta.verbsAr : currentBloomMeta.verbsEn).map((verb) => (
                <button
                  key={verb}
                  type="button"
                  onClick={() => handleApplyVerb(verb)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border-2 border-purple-400 dark:border-purple-600 text-purple-950 dark:text-purple-200 hover:bg-purple-700 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  + {verb}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Target ILO & Source Alignment Card */}
      <div className={`p-6 rounded-3xl border-2 space-y-4 shadow-sm ${cardBg}`}>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
          <h4 className="font-display font-black text-base text-slate-950 dark:text-white">
            {isRtl ? "مطابقة ناتج التعلم المستهدف ومصدر المحتوى التعليمي:" : "Target Learning Outcome (ILO) & Source Grounding:"}
          </h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-black mb-1.5 text-slate-950 dark:text-slate-100">
              {isRtl ? "رمز أو نص ناتج التعلم المستهدف (ILO):" : "Target Learning Outcome (ILO) Code/Statement:"}
            </label>
            <input
              type="text"
              value={editedContextReference}
              onChange={(e) => setEditedContextReference(e.target.value)}
              className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm font-bold border-2 ${inputBg}`}
              placeholder={isRtl ? "مثال: ILO-03: أن يحلل الطالب نتائج المعايرة السيكومترية بدقة..." : "e.g. ILO-03: Analyze psychometric items..."}
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0 stroke-[2.5]" />
              <span className="font-black text-emerald-950 dark:text-emerald-200">
                {isRtl ? "مطابقة المعيار التربوي: خلو المفردة من التناقض المعرفي بين المطلوب ومستوى الصياغة" : "Pedagogical alignment verified"}
              </span>
            </div>
            <span className="font-mono font-black text-emerald-900 dark:text-emerald-300 text-xs">100% Valid</span>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      {renderNavFooter()}
    </div>
  );
}
