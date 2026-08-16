import React, { useState } from "react";
import {
  SlidersHorizontal,
  Sparkles,
  BarChart2,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  Info,
  Check,
  FileText,
  ToggleLeft,
  PenTool,
  ArrowDownUp,
  Grid,
  Image as ImageIcon,
  ListOrdered,
  Eye,
} from "lucide-react";
import { Question } from "../../types";
import {
  QUESTION_TYPE_PSYCHOMETRIC_RULES,
  QuestionTypeTip,
  CATEGORY_METADATA,
  TipCategory,
} from "../../utils/questionTypeTips";

interface PsychometricsCalibrationStepProps {
  question: Question;
  editedQType?: Question["qType"];
  onSwitchQType?: (type: Question["qType"]) => void;
  editedDiffIndex: number;
  setEditedDiffIndex: (val: number) => void;
  editedDiscIndex: number;
  setEditedDiscIndex: (val: number) => void;
  editedDifficulty: Question["difficulty"];
  setEditedDifficulty: (diff: Question["difficulty"]) => void;
  editedBloom: Question["bloom"];
  onAutoCalibrate: () => void;
  isRtl: boolean;
  isDark: boolean;
  cardBg: string;
  renderNavFooter: () => React.ReactNode;
}

const QUESTION_TYPES_CONFIG: Array<{
  type: Question["qType"];
  labelAr: string;
  labelEn: string;
  badgeAr: string;
  icon: any;
}> = [
  { type: "mcq", labelAr: "اختيار من متعدد", labelEn: "MCQ (Single)", badgeAr: "4 خيارات", icon: CheckCircle2 },
  { type: "multi_mcq", labelAr: "متعدد الإجابات", labelEn: "Multi-Response", badgeAr: "أكثر من مفتاح", icon: Check },
  { type: "tf", labelAr: "صواب وخطأ", labelEn: "True / False", badgeAr: "ثنائي البدائل", icon: ToggleLeft },
  { type: "fill", labelAr: "إكمال الفراغ", labelEn: "Fill in Blank", badgeAr: "استدعاء مباشر", icon: PenTool },
  { type: "matching", labelAr: "المزاوجة والربط", labelEn: "Matching Columns", badgeAr: "عمودان أ و ب", icon: Grid },
  { type: "ordering", labelAr: "الترتيب والتسلسل", labelEn: "Ordering / Sequence", badgeAr: "خطوات متسلسلة", icon: ListOrdered },
  { type: "essay", labelAr: "المقالي وسلالم التقدير", labelEn: "Essay / Rubrics", badgeAr: "إنتاج معرفي حر", icon: FileText },
  { type: "diagram_labeling", labelAr: "التعيين على الرسم", labelEn: "Diagram Labeling", badgeAr: "تسمية مخطط", icon: ImageIcon },
];

export default function PsychometricsCalibrationStep({
  question,
  editedQType,
  onSwitchQType,
  editedDiffIndex,
  setEditedDiffIndex,
  editedDiscIndex,
  setEditedDiscIndex,
  editedDifficulty,
  setEditedDifficulty,
  editedBloom,
  onAutoCalibrate,
  isRtl,
  isDark,
  cardBg,
  renderNavFooter,
}: PsychometricsCalibrationStepProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | TipCategory>("all");
  const [expandedTipIds, setExpandedTipIds] = useState<Record<string, boolean>>({});

  // Active question type - prioritize editedQType prop if passed, fallback to question.qType or "mcq"
  const currentQType = editedQType || question.qType || "mcq";

  // Question Type specific psychometrics specs
  const typeRules = QUESTION_TYPE_PSYCHOMETRIC_RULES[currentQType] || QUESTION_TYPE_PSYCHOMETRIC_RULES.mcq;

  // Dynamically extract categories that actually exist for this specific question type
  const availableCategories = Array.from(new Set(typeRules.tips.map((t) => t.category))) as TipCategory[];

  // If the active filter is no longer applicable to the current question type, gracefully show all
  const effectiveFilter =
    activeCategoryFilter === "all" || availableCategories.includes(activeCategoryFilter)
      ? activeCategoryFilter
      : "all";

  // Toggle tip expand
  const toggleTip = (id: string) => {
    setExpandedTipIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Interpretations with ultra high-contrast styling
  const getDifficultyLabel = (pVal: number) => {
    if (pVal >= 0.75) {
      return {
        ar: "سهل جداً (نسبة إجابة مرتفعة)",
        en: "Very Easy (High Facility)",
        color: isDark ? "text-sky-300" : "text-sky-950",
      };
    }
    if (pVal >= 0.50) {
      return {
        ar: "متوسط الصعوبة (المدى التربوي المثالي 0.50 - 0.70)",
        en: "Optimal Moderate (Target Range 0.50 - 0.70)",
        color: isDark ? "text-emerald-300" : "text-emerald-950",
      };
    }
    if (pVal >= 0.35) {
      return {
        ar: "صعب نسبياً (يتطلب مهارات تفكير عليا)",
        en: "Relatively Hard (Requires Higher Order Thinking)",
        color: isDark ? "text-amber-300" : "text-amber-950",
      };
    }
    return {
      ar: "شديد الصعوبة (تحدٍّ سيكومتري مرتفع)",
      en: "Very Hard (High Cognitive Challenge)",
      color: isDark ? "text-rose-300" : "text-rose-950",
    };
  };

  const getDiscriminationLabel = (dVal: number) => {
    if (dVal >= 0.40) {
      return {
        ar: "قدرة تمييزية فائقة (ممتاز D ≥ 0.40)",
        en: "Excellent Discrimination (D ≥ 0.40)",
        color: isDark ? "text-emerald-300" : "text-emerald-950",
      };
    }
    if (dVal >= 0.30) {
      return {
        ar: "قدرة تمييزية جيدة (D: 0.30 - 0.39)",
        en: "Good Discrimination (D: 0.30 - 0.39)",
        color: isDark ? "text-teal-300" : "text-teal-950",
      };
    }
    if (dVal >= 0.20) {
      return {
        ar: "مقبول يحتاج تدقيق للمشتتات (D: 0.20 - 0.29)",
        en: "Acceptable (D: 0.20 - 0.29)",
        color: isDark ? "text-amber-300" : "text-amber-950",
      };
    }
    return {
      ar: "ضعيف التمييز أو مشتتات غير فعالة (D < 0.20)",
      en: "Poor Discrimination (D < 0.20)",
      color: isDark ? "text-rose-300" : "text-rose-950",
    };
  };

  const diffInfo = getDifficultyLabel(editedDiffIndex);
  const discInfo = getDiscriminationLabel(editedDiscIndex);

  // Category Meta Helper
  const getCategoryMeta = (category: TipCategory) => {
    return (
      CATEGORY_METADATA[category] || {
        labelAr: "معيار نوعي",
        labelEn: "Quality Standard",
        lightBadge: "bg-slate-200 text-slate-950 border-2 border-slate-600 font-black",
        darkBadge: "bg-slate-900 text-slate-100 border-2 border-slate-600 font-black",
        lightBorder: "border-slate-400 hover:border-slate-600",
        darkBorder: "border-slate-700 hover:border-slate-500",
        lightIconBg: "bg-slate-700 text-white",
        darkIconBg: "bg-slate-800 text-slate-100",
        activeBtnCls: "bg-slate-900 text-white border-2 border-slate-950 shadow-md ring-2 ring-slate-500/50",
        headerBgLight: "bg-slate-900 text-white",
        headerBgDark: "bg-slate-950 text-white border-b-2 border-slate-800",
      }
    );
  };

  // Filtered tips
  const filteredTips = typeRules.tips.filter((t) => {
    if (effectiveFilter === "all") return true;
    return t.category === effectiveFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 border-2 border-blue-400 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <SlidersHorizontal className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-blue-500/40 text-blue-100 border border-blue-300/50 px-2.5 py-0.5 rounded-full">
                {isRtl ? "المرحلة 3: التحكيم والمعايرة السيكومترية" : "Stage 3: Psychometrics & Item Type Calibration"}
              </span>
              <span className="text-xs font-black text-amber-300 bg-amber-950 border border-amber-400 px-2.5 py-0.5 rounded-md">
                {isRtl ? `النمط المختار: ${currentQType.toUpperCase()}` : `Selected: ${currentQType.toUpperCase()}`}
              </span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1">
              {isRtl ? "المعايرة السيكومترية ودليل معايير نوع السؤال" : "Psychometrics Calibration & Question-Type Quality Guidelines"}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 font-bold mt-0.5">
              {isRtl
                ? "حدد نوع السؤال لمعايرة مؤشرات الصعوبة والتمييز والاطلاع على إرشادات البناء السيكومتري المتخصصة"
                : "Select question type to inspect specific psychometric ranges, discrimination thresholds & review standards"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAutoCalibrate}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all border-2 border-amber-300 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{isRtl ? "معايرة سيكومترية آلية ذكية" : "Smart Auto-Calibrate"}</span>
        </button>
      </div>


      {/* 2. Interactive Question Type Selector (All 8 Types Available) */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border-2 shadow-sm space-y-4 ${
          isDark ? "bg-slate-900 border-indigo-500/40" : "bg-white border-slate-300 shadow-sm"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
            <h4 className="font-display font-black text-sm sm:text-base text-slate-950 dark:text-white">
              {isRtl ? "تحديد نوع السؤال (متاح لكافة الأنماط الـ8):" : "Select Question Type (All 8 Formats):"}
            </h4>
          </div>
          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
            {isRtl ? "انقر لاختيار نوع السؤال وتحديث المعايير السيكومترية فوراً" : "Click to switch type & update psychometric benchmarks"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUESTION_TYPES_CONFIG.map((item) => {
            const isCurrent = currentQType === item.type;
            const IconComp = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => onSwitchQType && onSwitchQType(item.type)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-start flex flex-col justify-between gap-2.5 ${
                  isCurrent
                    ? "bg-indigo-600 border-indigo-700 text-white shadow-lg ring-2 ring-indigo-400 scale-[1.02]"
                    : isDark
                    ? "bg-slate-950 border-slate-700 text-white hover:border-indigo-400 hover:bg-slate-800"
                    : "bg-slate-50 border-slate-300 text-slate-950 hover:border-indigo-600 hover:bg-indigo-50/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                      isCurrent
                        ? "bg-white text-indigo-900 shadow-sm"
                        : isDark
                        ? "bg-slate-800 text-indigo-300"
                        : "bg-indigo-100 text-indigo-900 border border-indigo-200"
                    }`}
                  >
                    <IconComp className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isCurrent
                        ? "bg-white/20 text-white border border-white/40"
                        : isDark
                        ? "bg-slate-800 text-slate-200 border border-slate-700"
                        : "bg-slate-200 text-slate-900 border border-slate-300"
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div
                    className={`font-display font-black text-xs sm:text-sm ${
                      isCurrent ? "text-white" : isDark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {isRtl ? item.labelAr : item.labelEn}
                  </div>
                  <div
                    className={`text-[11px] font-bold mt-0.5 truncate ${
                      isCurrent ? "text-indigo-100" : isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {isRtl ? item.badgeAr : item.labelEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Type-Specific Psychometrics Specifications Grid (Tips & Parameters) */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border-2 shadow-sm space-y-5 ${
          isDark
            ? "bg-slate-900 border-indigo-500/50"
            : "bg-slate-50 border-slate-300 shadow-sm"
        }`}
      >
        {/* Top bar with type heading & guessing probability badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Lightbulb className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-display font-black text-base sm:text-lg text-slate-950 dark:text-white">
                {isRtl
                  ? `المحددات والمعايير السيكومترية لنوع (${currentQType.toUpperCase()}):`
                  : `Psychometric Specifications for (${currentQType.toUpperCase()}):`}
              </h4>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                {isRtl
                  ? "معايير القياس السيكومتري، النطاق الموصى به لمعامل السهولة، ونسبة التخمين المحتملة"
                  : "Target psychometric benchmarks, facility range, and guessing probability"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-950 dark:text-slate-100">
              {isRtl ? "احتمال التخمين العشوائي:" : "Guessing Odds:"}
            </span>
            <span className="text-xs font-black text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 border-2 border-amber-400 dark:border-amber-600 px-3.5 py-1.5 rounded-xl shadow-xs">
              {typeRules.guessingProbability}
            </span>
          </div>
        </div>

        {/* 3 Metric Cards for this Question Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Facility Range */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-purple-300 dark:border-purple-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-purple-700 dark:text-purple-400 stroke-[2.5]" />
                {isRtl ? "نطاق السهولة المستهدف (p):" : "Target Facility (p):"}
              </span>
            </div>
            <div className="font-display font-black text-sm sm:text-base text-slate-950 dark:text-white mt-2">
              {isRtl ? typeRules.optimalFacilityRange.labelAr : typeRules.optimalFacilityRange.labelEn}
            </div>
          </div>

          {/* 2. Minimum Discrimination */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-300 dark:border-emerald-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
                {isRtl ? "الحد الأدنى للتمييز (D):" : "Min Discrimination (D):"}
              </span>
            </div>
            <div className="font-display font-black text-sm sm:text-base text-emerald-900 dark:text-emerald-300 mt-2">
              D ≥ {typeRules.optimalDiscriminationMin.toFixed(2)} ({isRtl ? "فوق المعياري" : "Above Standard"})
            </div>
          </div>

          {/* 3. Bloom Suitability */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-300 dark:border-blue-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-950 dark:text-blue-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-700 dark:text-blue-400 stroke-[2.5]" />
                {isRtl ? "مستويات بلوم الأنسب:" : "Best Bloom Levels:"}
              </span>
            </div>
            <div className="font-display font-bold text-xs sm:text-sm text-slate-950 dark:text-blue-100 mt-2 line-clamp-2">
              {isRtl ? typeRules.bloomSuitabilityAr : typeRules.bloomSuitabilityEn}
            </div>
          </div>
        </div>

        {/* Category Filter Chips for Tips */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t-2 border-slate-300 dark:border-slate-800">
          <span className={`text-xs sm:text-sm font-black me-2 ${isDark ? "text-white" : "text-slate-950"}`}>
            {isRtl ? "تصفية محاور المعايير:" : "Filter by Dimension:"}
          </span>

          {/* All button */}
          <button
            type="button"
            onClick={() => setActiveCategoryFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              effectiveFilter === "all"
                ? "bg-slate-950 text-white shadow-md border-2 border-black ring-2 ring-blue-500/50"
                : isDark
                ? "bg-slate-900 text-white border-2 border-slate-700 hover:border-slate-500"
                : "bg-white text-slate-950 border-2 border-slate-400 hover:border-slate-700 hover:bg-slate-100"
            }`}
          >
            {isRtl ? "جميع المحاور" : "All Dimensions"} ({typeRules.tips.length})
          </button>

          {/* Dynamically render category chips only for categories relevant to current question type */}
          {availableCategories.map((cat) => {
            const meta = getCategoryMeta(cat);
            const count = typeRules.tips.filter((t) => t.category === cat).length;
            const isCatActive = effectiveFilter === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  isCatActive
                    ? meta.activeBtnCls
                    : isDark
                    ? "bg-slate-900 text-white border-2 border-slate-700 hover:border-slate-500"
                    : "bg-white text-slate-950 border-2 border-slate-400 hover:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{isRtl ? meta.labelAr : meta.labelEn}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isCatActive
                      ? "bg-white text-slate-950"
                      : isDark
                      ? "bg-slate-800 text-white"
                      : "bg-slate-200 text-slate-950"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grouped Category Guidelines Sections - Eliminates badge repetition & provides maximum contrast */}
        <div className="space-y-5 pt-2">
          {availableCategories
            .filter((cat) => effectiveFilter === "all" || effectiveFilter === cat)
            .map((cat) => {
              const meta = getCategoryMeta(cat);
              const categoryTips = typeRules.tips.filter((t) => t.category === cat);
              if (categoryTips.length === 0) return null;

              return (
                <div
                  key={cat}
                  className={`rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${
                    isDark ? "bg-slate-950 border-slate-700" : "bg-white border-slate-300"
                  }`}
                >
                  {/* High Contrast Section Header - Shown ONCE per category */}
                  <div
                    className={`px-4 py-3 flex items-center justify-between gap-3 border-b-2 ${
                      isDark ? meta.headerBgDark : meta.headerBgLight
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white text-slate-950 flex items-center justify-center font-black shadow-xs">
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      </div>
                      <h4 className="font-display font-black text-sm sm:text-base text-white tracking-wide">
                        {isRtl ? `محور: ${meta.labelAr}` : `Dimension: ${meta.labelEn}`}
                      </h4>
                    </div>
                    <span className="text-xs font-black bg-white/20 text-white border border-white/40 px-3 py-1 rounded-full">
                      {isRtl ? `${categoryTips.length} معايير تفصيلية` : `${categoryTips.length} Guidelines`}
                    </span>
                  </div>

                  {/* Rules under this Category */}
                  <div className="divide-y-2 divide-slate-200 dark:divide-slate-800 p-2 sm:p-3 space-y-2">
                    {categoryTips.map((tip, idx) => {
                      const isExp = !!expandedTipIds[tip.id];

                      return (
                        <div
                          key={tip.id}
                          className={`rounded-xl p-3.5 sm:p-4 transition-colors ${
                            isDark
                              ? "bg-slate-900/90 hover:bg-slate-900 border border-slate-800"
                              : "bg-slate-50 hover:bg-slate-100/80 border border-slate-200"
                          }`}
                        >
                          <div
                            className="flex items-start justify-between gap-3.5 cursor-pointer select-none"
                            onClick={() => toggleTip(tip.id)}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <span
                                className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-black mt-0.5 shadow-xs ${
                                  isDark ? "bg-white text-slate-950" : "bg-slate-950 text-white"
                                }`}
                              >
                                {idx + 1}
                              </span>

                              <div className="flex-1 space-y-1.5">
                                <h5
                                  className={`font-display font-black text-sm sm:text-base leading-snug ${
                                    isDark ? "text-white" : "text-slate-950"
                                  }`}
                                >
                                  {isRtl ? tip.titleAr : tip.titleEn}
                                </h5>

                                <p
                                  className={`text-xs sm:text-sm font-bold leading-relaxed ${
                                    isDark ? "text-slate-200" : "text-slate-900"
                                  }`}
                                >
                                  {isRtl ? tip.ruleAr : tip.ruleEn}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTip(tip.id);
                              }}
                              className={`p-2 rounded-xl border-2 transition-colors shrink-0 ${
                                isDark
                                  ? "bg-slate-800 border-slate-600 text-white hover:border-slate-400"
                                  : "bg-white border-slate-400 text-slate-950 hover:border-slate-700"
                              }`}
                              title={isExp ? (isRtl ? "طي" : "Collapse") : isRtl ? "عرض تفاصيل المعيار والأثر" : "Expand"}
                            >
                              {isExp ? (
                                <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                              )}
                            </button>
                          </div>

                          {/* Expandable Box with Ideal Standard & Psychometric Impact */}
                          {isExp && (
                            <div
                              className={`mt-3.5 pt-3.5 border-t-2 space-y-3 p-4 rounded-xl border-2 shadow-xs text-xs sm:text-sm ${
                                isDark
                                  ? "bg-slate-950 border-slate-700"
                                  : "bg-white border-slate-300"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shrink-0 text-xs">
                                  {isRtl ? "المعيار المثالي:" : "Ideal Standard:"}
                                </span>
                                <span
                                  className={`font-black leading-relaxed ${
                                    isDark ? "text-white" : "text-slate-950"
                                  }`}
                                >
                                  {isRtl ? tip.idealStandardAr : tip.idealStandardEn}
                                </span>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <span className="font-black px-2 py-0.5 rounded bg-purple-100 text-purple-950 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shrink-0 text-xs">
                                  {isRtl ? "الأثر السيكومتري:" : "Psychometric Impact:"}
                                </span>
                                <span
                                  className={`font-black leading-relaxed ${
                                    isDark ? "text-white" : "text-slate-950"
                                  }`}
                                >
                                  {isRtl ? tip.psychometricImpactAr : tip.psychometricImpactEn}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 4. Calibration Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty p-value */}
        <div className={`p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 flex items-center justify-center font-black border border-purple-300 dark:border-purple-700">
                <BarChart2 className="w-4 h-4 text-purple-800 dark:text-purple-300 stroke-[2.5]" />
              </div>
              <h4 className="font-display font-black text-base text-slate-950 dark:text-white">
                {isRtl ? "معامل الصعوبة (p-value):" : "Difficulty Index (p-value):"}
              </h4>
            </div>
            <span className="font-mono font-black text-xl sm:text-2xl px-3 py-1 rounded-xl bg-purple-900 text-white dark:bg-purple-600 dark:text-white shadow-xs">
              {editedDiffIndex.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-slate-950 dark:text-slate-100 font-bold leading-relaxed">
            {isRtl
              ? "يمثل النسبة المئوية للمختبرين المتوقع إجابتهم إجابة صحيحة. النطاق المثالي للاختبارات المعيارية هو (0.45 - 0.70)."
              : "Expected percentage of examinees answering correctly. Standard optimal range is (0.45 - 0.70)."}
          </p>

          <div className="space-y-2 py-1">
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.01"
              value={editedDiffIndex}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEditedDiffIndex(val);
                if (val >= 0.70) setEditedDifficulty(isRtl ? "سهلة" : ("Easy" as any));
                else if (val >= 0.40) setEditedDifficulty(isRtl ? "متوسطة" : ("Moderate" as any));
                else setEditedDifficulty(isRtl ? "صعبة" : ("Hard" as any));
              }}
              className="w-full accent-purple-700 dark:accent-purple-500 cursor-pointer h-3 bg-slate-300 dark:bg-slate-700 rounded-lg"
            />

            <div className="flex items-center justify-between text-xs font-black">
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                0.10 ({isRtl ? "صعب جداً" : "Hard"})
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border-2 border-emerald-400 dark:border-emerald-600 font-black">
                0.55 ({isRtl ? "مثالي تربوياً" : "Optimal"})
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                0.95 ({isRtl ? "سهل جداً" : "Easy"})
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-100/90 dark:bg-purple-950 border-2 border-purple-400 dark:border-purple-600 text-xs sm:text-sm shadow-xs flex flex-wrap items-center gap-2">
            <span className="text-purple-950 dark:text-purple-200 font-black shrink-0">
              {isRtl ? "التفسير السيكومتري:" : "Interpretation:"}
            </span>
            <span className="font-black text-slate-950 dark:text-white">
              {isRtl ? diffInfo.ar : diffInfo.en}
            </span>
          </div>
        </div>

        {/* Discrimination D-index */}
        <div className={`p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 flex items-center justify-center font-black border border-emerald-300 dark:border-emerald-700">
                <TrendingUp className="w-4 h-4 text-emerald-800 dark:text-emerald-300 stroke-[2.5]" />
              </div>
              <h4 className="font-display font-black text-base text-slate-950 dark:text-white">
                {isRtl ? "معامل التمييز (D-Index):" : "Discrimination Index (D-Index):"}
              </h4>
            </div>
            <span className="font-mono font-black text-xl sm:text-2xl px-3 py-1 rounded-xl bg-emerald-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs">
              +{editedDiscIndex.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-slate-950 dark:text-slate-100 font-bold leading-relaxed">
            {isRtl
              ? "يقيس قدرة السؤال على التمييز بين الطلاب المتميزين والضعفاء. القيمة الممتازة تتجاوز +0.35."
              : "Measures item power to distinguish high and low achievers. Excellent value exceeds +0.35."}
          </p>

          <div className="space-y-2 py-1">
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.01"
              value={editedDiscIndex}
              onChange={(e) => setEditedDiscIndex(Number(e.target.value))}
              className="w-full accent-emerald-700 dark:accent-emerald-500 cursor-pointer h-3 bg-slate-300 dark:bg-slate-700 rounded-lg"
            />

            <div className="flex items-center justify-between text-xs font-black">
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                0.05 ({isRtl ? "ضعيف" : "Poor"})
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-200 border-2 border-teal-400 dark:border-teal-600 font-black">
                0.35 ({isRtl ? "جيد جداً" : "Good"})
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                0.80 ({isRtl ? "فائق" : "Peak"})
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-100/90 dark:bg-emerald-950 border-2 border-emerald-400 dark:border-emerald-600 text-xs sm:text-sm shadow-xs flex flex-wrap items-center gap-2">
            <span className="text-emerald-950 dark:text-emerald-200 font-black shrink-0">
              {isRtl ? "التفسير السيكومتري:" : "Interpretation:"}
            </span>
            <span className="font-black text-slate-950 dark:text-white">
              {isRtl ? discInfo.ar : discInfo.en}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Type-Specific Response & Structure Calibration Card */}
      {(() => {
        if (currentQType === "mcq" || currentQType === "multi_mcq") {
          const opts = question.options && question.options.length > 0 ? question.options : ["خيار أ", "خيار ب", "خيار ج", "خيار د"];
          return (
            <div className="p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
                  <span>{isRtl ? "تحليل كفاءة المشتتات والجاذبية التنافسية:" : "Distractor Plausibility & Attractiveness:"}</span>
                </h4>
                <span className="text-xs font-black text-slate-950 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1 rounded-xl">
                  {isRtl ? "توزيع نسب الاستجابة المتوقعة وفق معامل الصعوبة" : "Expected Response Distribution by Difficulty"}
                </span>
              </div>

              <div className="space-y-3">
                {opts.map((opt, idx) => {
                  const isKey =
                    opt === question.correctAnswer ||
                    (currentQType === "multi_mcq" && question.correctAnswer?.includes(opt)) ||
                    idx === 0;
                  const percentage = isKey
                    ? Math.round(editedDiffIndex * 100)
                    : Math.round(((1 - editedDiffIndex) / Math.max(1, opts.length - 1)) * 100);

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                        isKey
                          ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 dark:border-emerald-700 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                            isKey
                              ? "bg-emerald-800 text-white"
                              : "bg-slate-800 text-white dark:bg-slate-700 dark:text-white"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white truncate">
                          {opt || `(خيار ${idx + 1})`}
                        </span>
                        {isKey && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-emerald-800 text-white shrink-0 shadow-2xs">
                            {isRtl ? "المفتاح الصحيح" : "Key"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-24 bg-slate-300 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-400 dark:border-slate-700">
                          <div
                            className={`h-full ${isKey ? "bg-emerald-600" : "bg-indigo-600"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-black text-xs w-10 text-end text-slate-950 dark:text-white">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (currentQType === "tf") {
          const isTrueKey =
            question.correctAnswer === "صواب" ||
            question.correctAnswer === "صح" ||
            question.correctAnswer === "True" ||
            question.correctAnswer === "true";
          const truePct = isTrueKey ? Math.round(editedDiffIndex * 100) : Math.round((1 - editedDiffIndex) * 100);
          const falsePct = 100 - truePct;

          return (
            <div className="p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <ToggleLeft className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
                  <span>{isRtl ? "موازنة قطبي الصواب والخطأ ومقاومة التخمين (50%):" : "True/False Polarization & Guessing Control:"}</span>
                </h4>
                <span className="text-xs font-black text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 border border-amber-400 px-3 py-1 rounded-xl">
                  {isRtl ? "احتمال التخمين الأساسي: 50%" : "Base Guessing Odds: 50%"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-2xl border-2 space-y-2 ${
                    isTrueKey
                      ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 dark:border-emerald-700"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      {isRtl ? "خيار (صواب / True)" : "Option (True)"}
                    </span>
                    {isTrueKey && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-800 text-white">
                        {isRtl ? "المفتاح الصحيح" : "Key"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs font-black text-slate-950 dark:text-white">
                    <span>{isRtl ? "الاستجابة المتوقعة:" : "Expected Response:"}</span>
                    <span className="font-mono text-sm">{truePct}%</span>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-400 dark:border-slate-700">
                    <div className="h-full bg-emerald-600" style={{ width: `${truePct}%` }} />
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border-2 space-y-2 ${
                    !isTrueKey
                      ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 dark:border-emerald-700"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 stroke-[3]" />
                      {isRtl ? "خيار (خطأ / False)" : "Option (False)"}
                    </span>
                    {!isTrueKey && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-800 text-white">
                        {isRtl ? "المفتاح الصحيح" : "Key"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs font-black text-slate-950 dark:text-white">
                    <span>{isRtl ? "الاستجابة المتوقعة:" : "Expected Response:"}</span>
                    <span className="font-mono text-sm">{falsePct}%</span>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-400 dark:border-slate-700">
                    <div className="h-full bg-indigo-600" style={{ width: `${falsePct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (currentQType === "fill") {
          return (
            <div className="p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
                  <span>{isRtl ? "معايير مفتاح الفراغ والتفاوت اللغوي المقبول:" : "Fill-in-Blank Key & Linguistic Tolerance:"}</span>
                </h4>
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 px-3 py-1 rounded-xl">
                  {isRtl ? "تخمين منخفض < 5%" : "Low Guessing < 5%"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-1.5">
                  <div className="text-xs font-black text-indigo-950 dark:text-indigo-300">
                    {isRtl ? "المفتاح النموذجي الصريح:" : "Exact Model Answer:"}
                  </div>
                  <div className="font-mono font-black text-sm text-slate-950 dark:text-white bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-300 dark:border-slate-700">
                    {question.correctAnswer || (isRtl ? "[المصطلح المحدد]" : "[Target Term]")}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-1.5">
                  <div className="text-xs font-black text-purple-950 dark:text-purple-300">
                    {isRtl ? "المرادفات المقبولة برمجياً:" : "Accepted Synonyms:"}
                  </div>
                  <div className="text-xs font-bold text-slate-950 dark:text-white bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-300 dark:border-slate-700">
                    {isRtl ? "تضمين همزات الوصل والقطع والتاء المربوطة" : "Includes casing & punctuation variants"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-1.5">
                  <div className="text-xs font-black text-teal-950 dark:text-teal-300">
                    {isRtl ? "حساسية التقييم الآلي:" : "Scoring Sensitivity:"}
                  </div>
                  <div className="text-xs font-bold text-slate-950 dark:text-white bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-300 dark:border-slate-700">
                    {isRtl ? "مطابقة دقيقة (Fuzzy Tolerance: Strict)" : "Exact Match / Fuzzy Tolerance"}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (currentQType === "matching") {
          return (
            <div className="p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
                  <span>{isRtl ? "تحليل مصفوفة أزواج الربط وعدم التماثل العددي:" : "Matching Pairs & Distractor Ratio Matrix:"}</span>
                </h4>
                <span className="text-xs font-black text-purple-950 dark:text-purple-200 bg-purple-100 dark:bg-purple-950 border border-purple-400 px-3 py-1 rounded-xl">
                  {isRtl ? "معيار: عناصر (ب) > عناصر (أ)" : "Rule: Col B > Col A (+1 Distractor)"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-black text-indigo-950 dark:text-indigo-300 block">
                    {isRtl ? "العمود (أ) - المقدمات أو الأسئلة (3-5 عناصر):" : "Column A - Premises (3-5 items):"}
                  </span>
                  <div className="space-y-1.5 text-xs font-bold text-slate-950 dark:text-slate-100">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700">1. {isRtl ? "المقدمة الأولى (مفهوم مستقل)" : "Premise 1"}</div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700">2. {isRtl ? "المقدمة الثانية (مفهوم مستقل)" : "Premise 2"}</div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700">3. {isRtl ? "المقدمة الثالثة (مفهوم مستقل)" : "Premise 3"}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 block">
                    {isRtl ? "العمود (ب) - الاستجابات + مشتت إضافي (4-6 عناصر):" : "Column B - Responses + Extra Distractor:"}
                  </span>
                  <div className="space-y-1.5 text-xs font-bold text-slate-950 dark:text-slate-100">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/70 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-black">أ. {isRtl ? "استجابة مطابقة (1)" : "Matching Key 1"}</div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/70 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-black">ب. {isRtl ? "استجابة مطابقة (2)" : "Matching Key 2"}</div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/70 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-black">ج. {isRtl ? "استجابة مطابقة (3)" : "Matching Key 3"}</div>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/70 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-black">د. {isRtl ? "مشتت إضافي لمنع الحل بالاستبعاد" : "Extra Distractor"}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (currentQType === "ordering") {
          return (
            <div className="p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
                  <span>{isRtl ? "تحليل خطوات التسلسل المنطقي ومعيار التصحيح الجزئي:" : "Ordering Sequence & Partial Credit Calibration:"}</span>
                </h4>
                <span className="text-xs font-black text-teal-950 dark:text-teal-200 bg-teal-100 dark:bg-teal-950 border border-teal-400 px-3 py-1 rounded-xl">
                  {isRtl ? "تسلسل قطعي أحادي" : "Strict Unambiguous Flow"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="text-xs font-black text-slate-950 dark:text-white">{isRtl ? "الخطوة الأولى (المبدأ):" : "Step 1:"}</div>
                  <div className="text-xs font-bold text-slate-950 dark:text-slate-200">{isRtl ? "نقطة بداية واضحة لا تحتمل التقديم" : "Clear entry point"}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="text-xs font-black text-slate-950 dark:text-white">{isRtl ? "الخطوات الوسيطة (2-4):" : "Middle Steps:"}</div>
                  <div className="text-xs font-bold text-slate-950 dark:text-slate-200">{isRtl ? "ترتيب سببي أو زمني حصري" : "Causal / Chronological order"}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="text-xs font-black text-slate-950 dark:text-white">{isRtl ? "المخرج النهائي (الخطوة الأخيرة):" : "Final Step:"}</div>
                  <div className="text-xs font-bold text-slate-950 dark:text-slate-200">{isRtl ? "النتيجة أو المنتج النهائي للمهمة" : "Target concluding deliverable"}</div>
                </div>
              </div>
            </div>
          );
        }

        if (currentQType === "essay") {
          return (
            <div className="p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
                  <span>{isRtl ? "مصفوفة سلم التقدير اللفظي (Rubric) ومعايير التصحيح:" : "Analytical Scoring Rubric & Weight Calibration:"}</span>
                </h4>
                <span className="text-xs font-black text-purple-950 dark:text-purple-200 bg-purple-100 dark:bg-purple-950 border border-purple-400 px-3 py-1 rounded-xl">
                  {isRtl ? "تخمين 0% - إنتاج حر" : "0% Guessing - Open Construct"}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-700 text-white font-black text-xs flex items-center justify-center">1</span>
                    <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">
                      {isRtl ? "المحتوى العلمي والدقة المفاهيمية (40%)" : "Conceptual Accuracy & Scientific Rigor (40%)"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-indigo-950 dark:text-indigo-300 font-mono">4.0 / 10</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black text-xs flex items-center justify-center">2</span>
                    <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">
                      {isRtl ? "الاستدلال والتحليل النقدي وتقديم الشواهد (40%)" : "Critical Analysis, Reasoning & Evidence (40%)"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-purple-950 dark:text-purple-300 font-mono">4.0 / 10</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center">3</span>
                    <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">
                      {isRtl ? "التنظيم الهيكلي وسلامة التعبير اللغوي (20%)" : "Structure, Coherence & Expression (20%)"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-teal-950 dark:text-teal-300 font-mono">2.0 / 10</span>
                </div>
              </div>
            </div>
          );
        }

        // diagram_labeling
        return (
          <div className="p-6 rounded-3xl border-2 space-y-4 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-display font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-700 dark:text-indigo-400 stroke-[2.5]" />
                <span>{isRtl ? "معايير التعيين البصري وتحديد المؤشرات على الرسم:" : "Spatial Pointers & Diagrammatic Label Calibration:"}</span>
              </h4>
              <span className="text-xs font-black text-blue-950 dark:text-blue-200 bg-blue-100 dark:bg-blue-950 border border-blue-400 px-3 py-1 rounded-xl">
                {isRtl ? "استقلال درجات المؤشرات" : "Independent Key Points"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-2">
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-300 block">
                  {isRtl ? "وضوح سهم التأشير ونقاء الصورة:" : "Visual Pointer Integrity:"}
                </span>
                <p className="text-xs font-bold text-slate-950 dark:text-white leading-relaxed">
                  {isRtl
                    ? "أسهم واضحة تشير بدقة إلى العضو أو المركب المستهدف دون تداخل أو تشويش خلفي."
                    : "High resolution diagram with clear non-overlapping pointer indices."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 space-y-2">
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 block">
                  {isRtl ? "استقلال بنود التعيين (Local Independence):" : "Local Item Independence:"}
                </span>
                <p className="text-xs font-bold text-slate-950 dark:text-white leading-relaxed">
                  {isRtl
                    ? "الخطأ في تسمية جزء لا يترتب عليه حتماً الخطأ في تسمية بقية الأجزاء المؤشر عليها."
                    : "Grading is partitioned such that error on one label does not cascade."}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Navigation Footer */}
      {renderNavFooter()}
    </div>
  );
}
