import React, { useState, useEffect } from "react";
import { Clock, Calculator, ArrowRightLeft, Sparkles, AlertCircle, CheckCircle2, RefreshCw, BookOpen, Layers, ShieldCheck } from "lucide-react";
import { Question } from "../types";
import { Language } from "../translations";

interface ExamTimeCalculatorProps {
  questionsList: Question[];
  lang: Language;
  onApplyDurationToExam?: (formattedTime: string, minutes: number) => void;
}

export default function ExamTimeCalculator({
  questionsList,
  lang,
  onApplyDurationToExam,
}: ExamTimeCalculatorProps) {
  const isRtl = lang === "ar";

  // Item counts by type
  const [mcqCount, setMcqCount] = useState<number>(0);
  const [essayCount, setEssayCount] = useState<number>(0);
  const [tfCount, setTfCount] = useState<number>(0);
  const [fillCount, setFillCount] = useState<number>(0);
  const [matchingCount, setMatchingCount] = useState<number>(0);

  // Settings & Adjusters
  const [academicLevel, setAcademicLevel] = useState<"school" | "undergrad" | "postgrad">("undergrad");
  const [cognitiveComplexity, setCognitiveComplexity] = useState<"balanced" | "advanced">("balanced");
  const [reviewBufferMin, setReviewBufferMin] = useState<number>(10);

  // Sync from questionsList on mount or when bank items change
  const syncFromBank = () => {
    let mcq = 0;
    let essay = 0;
    let tf = 0;
    let fill = 0;
    let matching = 0;

    questionsList.forEach((q) => {
      if (q.qType === "essay") {
        essay += 1;
      } else if (q.qType === "tf") {
        tf += 1;
      } else if (q.qType === "fill") {
        fill += 1;
      } else if (q.qType === "matching" || q.qType === "ordering" || q.qType === "diagram_labeling") {
        matching += 1;
      } else {
        mcq += 1;
      }
    });

    // If bank is empty, provide standard defaults
    if (questionsList.length === 0) {
      setMcqCount(15);
      setEssayCount(2);
      setTfCount(10);
      setFillCount(5);
      setMatchingCount(2);
    } else {
      setMcqCount(mcq);
      setEssayCount(essay);
      setTfCount(tf);
      setFillCount(fill);
      setMatchingCount(matching);
    }
  };

  useEffect(() => {
    syncFromBank();
  }, [questionsList]);

  // Base Minutes per Item by Type (Standard Psychometric Benchmarks)
  // MCQ: ~1.25 mins (Range: 1.0 - 1.5)
  // Essay: ~10.0 mins (Range: 8.0 - 15.0)
  // True/False: ~0.60 mins (35-40 sec)
  // Fill-in: ~1.25 mins
  // Matching/Ordering: ~2.50 mins
  const baseMinutes = {
    mcq: 1.25,
    essay: 10.0,
    tf: 0.6,
    fill: 1.25,
    matching: 2.5,
  };

  // Multipliers
  const levelMultiplier = academicLevel === "school" ? 1.15 : academicLevel === "postgrad" ? 0.90 : 1.0;
  const cognitiveMultiplier = cognitiveComplexity === "advanced" ? 1.20 : 1.0;
  const overallFactor = levelMultiplier * cognitiveMultiplier;

  // Exact Calculation in Minutes
  const rawMcqTime = mcqCount * baseMinutes.mcq * overallFactor;
  const rawTfTime = tfCount * baseMinutes.tf * overallFactor;
  const rawFillTime = fillCount * baseMinutes.fill * overallFactor;
  const rawMatchingTime = matchingCount * baseMinutes.matching * overallFactor;
  const rawEssayTime = essayCount * baseMinutes.essay * overallFactor;

  // Objective vs. Essay Subtotals
  const objectiveTotalMinutes = rawMcqTime + rawTfTime + rawFillTime + rawMatchingTime;
  const essayTotalMinutes = rawEssayTime;
  const totalQuestionsCount = mcqCount + essayCount + tfCount + fillCount + matchingCount;

  // Total Estimated Raw Minutes
  const totalSolvingTime = objectiveTotalMinutes + essayTotalMinutes;
  const grandTotalMinutes = totalSolvingTime + reviewBufferMin;

  // Fast students (Min Time) vs. Max Safe Time
  const minFastMinutes = Math.round(grandTotalMinutes * 0.75);
  const avgStandardMinutes = Math.round(grandTotalMinutes);
  const maxSafeMinutes = Math.round(grandTotalMinutes * 1.25);

  // Rounded recommended academic slot (e.g. 30 min, 45 min, 60 min, 90 min, 120 min)
  const roundToExamSlot = (mins: number) => {
    if (mins <= 35) return 30;
    if (mins <= 50) return 45;
    if (mins <= 70) return 60;
    if (mins <= 85) return 75;
    if (mins <= 105) return 90;
    if (mins <= 135) return 120;
    if (mins <= 165) return 150;
    return Math.ceil(mins / 30) * 30;
  };

  const recommendedSlotMinutes = roundToExamSlot(avgStandardMinutes);

  // Format Duration into readable Arabic/English
  const formatTimeSlot = (mins: number) => {
    if (isRtl) {
      if (mins === 30) return "نصف ساعة (٣٠ دقيقة)";
      if (mins === 45) return "٤٥ دقيقة";
      if (mins === 60) return "ساعة واحدة (٦٠ دقيقة)";
      if (mins === 75) return "ساعة وربع (٧٥ دقيقة)";
      if (mins === 90) return "ساعة ونصف (٩٠ دقيقة)";
      if (mins === 120) return "ساعتان (١٢٠ دقيقة)";
      if (mins === 150) return "ساعتان ونصف (١٥٠ دقيقة)";
      if (mins === 180) return "٣ ساعات (١٨٠ دقيقة)";
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      if (hours > 0 && remainingMins > 0) {
        return `${hours} ساعة و ${remainingMins} دقيقة (${mins} دقيقة)`;
      }
      return `${mins} دقيقة`;
    } else {
      if (mins === 30) return "30 Minutes (Half Hour)";
      if (mins === 45) return "45 Minutes";
      if (mins === 60) return "1 Hour (60 Minutes)";
      if (mins === 75) return "1 Hour 15 Mins (75 Mins)";
      if (mins === 90) return "1.5 Hours (90 Minutes)";
      if (mins === 120) return "2 Hours (120 Minutes)";
      if (mins === 150) return "2.5 Hours (150 Minutes)";
      if (mins === 180) return "3 Hours (180 Minutes)";
      return `${mins} Minutes`;
    }
  };

  // Percentages for distribution bar
  const safeGrandTotal = grandTotalMinutes > 0 ? grandTotalMinutes : 1;
  const essayPct = Math.round((essayTotalMinutes / safeGrandTotal) * 100);
  const objectivePct = Math.round((objectiveTotalMinutes / safeGrandTotal) * 100);
  const bufferPct = 100 - essayPct - objectivePct;

  // Sync duration automatically to parent / exam header whenever calculated slot or lang changes
  useEffect(() => {
    const formatted = isRtl
      ? `زمن الاختبار: ${formatTimeSlot(recommendedSlotMinutes)}`
      : `Exam Duration: ${formatTimeSlot(recommendedSlotMinutes)}`;
    if (onApplyDurationToExam) {
      onApplyDurationToExam(formatted, recommendedSlotMinutes);
    }
  }, [recommendedSlotMinutes, isRtl]);

  // Pedagogical Insights
  const getPedagogicalAdvice = () => {
    if (totalQuestionsCount === 0) {
      return isRtl
        ? "أدخل أعداد الأسئلة لحساب الزمن التقديري المناسب."
        : "Enter item counts to compute estimated duration.";
    }

    if (essayPct > 55) {
      return isRtl
        ? "⚠️ الأسئلة المقالية تستحوذ على أكثر من نصف زمن الاختبار. يُوصى بالتنبيه على الطلاب بضرورة توزيع جهدهم وتفادي استنزاف الوقت في البنود الأولى، أو تخصيص درجات أكبر للمقالي توازي هذا العبء الزمني."
        : "⚠️ Essay questions account for over 50% of the exam time. It is recommended to advise students on pacing, or assign higher point weight reflecting the cognitive investment.";
    }

    if (recommendedSlotMinutes > 120) {
      return isRtl
        ? "⚠️ الزمن المقدر يتجاوز الساعتين. لتفادي إجهاد الطلاب (Test Fatigue)، يُنصح بتقليص عدد البنود، أو تقسيم الاختبار على فترتين لضمان دقة القياس وثبات الاستجابات."
        : "⚠️ Estimated duration exceeds 2 hours. To avoid student test fatigue, consider trimming item count or dividing the test into sessions.";
    }

    if (essayCount === 0 && mcqCount >= 30) {
      return isRtl
        ? "💡 الاختبار موضوعي بالكامل. هذا التوزيع يسمح بتغطية واسعة لمحتوى المنهج وسرعة في التصحيح، مع معدل دقيقة وربع لكل بند موضوعي."
        : "💡 Purely objective test structure. Excellent for broad curriculum coverage and rapid scoring, averaging 1.25 mins per item.";
    }

    return isRtl
      ? "✅ توزيع زمن الاختبار متوازن وتربوي بين الأسئلة الموضوعية والمقالية، مع وقت كافٍ للمراجعة وقراءة التعليمات ومراعاة الفروق الفردية."
      : "✅ Well-balanced pedagogical time allocation between objective and constructed-response items with sufficient buffer for review.";
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                {isRtl ? "معيار القياس السيكومتري" : "Psychometric Standard"}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {isRtl ? "تقدير زمن الحل والتوصية المعيارية" : "Duration Estimation & Pacing"}
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mt-0.5">
              {isRtl ? "حاسبة الوقت المتوقع لحل الاختبار (المقالي مقابل الموضوعي)" : "Expected Exam Time Calculator (Essay vs. Objective)"}
            </h3>
          </div>
        </div>

        {/* Sync from Bank Button */}
        <button
          type="button"
          onClick={syncFromBank}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-2xs"
          title={isRtl ? "استيراد أعداد ونوعيات الأسئلة الموجودة حالياً بالبنك" : "Sync item counts from question bank"}
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>{isRtl ? "مزامنة تلقائية من البنك" : "Sync from Bank"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Input Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Question Counts Grid */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{isRtl ? "أعداد الأسئلة حسب النوعية (المدخلات):" : "Question Counts by Typology:"}</span>
              </span>
              <span className="text-blue-700 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {totalQuestionsCount} {isRtl ? "سؤال إجمالي" : "Total Items"}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* MCQ */}
              <div className="p-3 bg-slate-50 border-2 border-slate-300 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="truncate">{isRtl ? "اختيار من متعدد" : "MCQ"}</span>
                  <span className="text-[10px] text-blue-600 font-black">~1.25 د</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={mcqCount}
                  onChange={(e) => setMcqCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-10 px-2 text-center text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              {/* Essay */}
              <div className="p-3 bg-violet-50/80 border-2 border-violet-300 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-violet-950">
                  <span className="truncate font-black">{isRtl ? "الأسئلة المقالية" : "Essay Items"}</span>
                  <span className="text-[10px] text-violet-700 font-black">~10.0 د</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={essayCount}
                  onChange={(e) => setEssayCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-10 px-2 text-center text-sm font-black text-violet-950 bg-white border border-violet-300 rounded-lg focus:border-violet-600 outline-none"
                />
              </div>

              {/* True/False */}
              <div className="p-3 bg-slate-50 border-2 border-slate-300 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="truncate">{isRtl ? "صواب وخطأ" : "True / False"}</span>
                  <span className="text-[10px] text-emerald-600 font-black">~0.60 د</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={tfCount}
                  onChange={(e) => setTfCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-10 px-2 text-center text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              {/* Fill-in */}
              <div className="p-3 bg-slate-50 border-2 border-slate-300 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="truncate">{isRtl ? "إكمال الفراغ" : "Fill-in"}</span>
                  <span className="text-[10px] text-blue-600 font-black">~1.25 د</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={fillCount}
                  onChange={(e) => setFillCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-10 px-2 text-center text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              {/* Matching / Ordering */}
              <div className="p-3 bg-slate-50 border-2 border-slate-300 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="truncate">{isRtl ? "المزاوجة والترتيب" : "Matching / Order"}</span>
                  <span className="text-[10px] text-amber-600 font-black">~2.50 د</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={matchingCount}
                  onChange={(e) => setMatchingCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-10 px-2 text-center text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              {/* Review Buffer */}
              <div className="p-3 bg-amber-50/80 border-2 border-amber-300 rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                  <span className="truncate">{isRtl ? "وقت المراجعة والتعليمات" : "Review Buffer"}</span>
                  <span className="text-[10px] text-amber-700 font-black">+إضافي</span>
                </div>
                <select
                  value={reviewBufferMin}
                  onChange={(e) => setReviewBufferMin(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-10 px-2 text-center text-xs font-black text-amber-950 bg-white border border-amber-300 rounded-lg focus:border-amber-600 outline-none"
                >
                  <option value={5}>{isRtl ? "٥ دقائق" : "5 Mins"}</option>
                  <option value={10}>{isRtl ? "١٠ دقائق (معياري)" : "10 Mins (Std)"}</option>
                  <option value={15}>{isRtl ? "١٥ دقيقة" : "15 Mins"}</option>
                  <option value={20}>{isRtl ? "٢٠ دقيقة" : "20 Mins"}</option>
                  <option value={0}>{isRtl ? "بدون وقت إضافي" : "0 Min"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Level & Cognitive Complexity Adjusters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-100/80 border border-slate-300 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>{isRtl ? "المرحلة التعليمية للطلاب:" : "Target Academic Level:"}</span>
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold text-slate-900 focus:border-blue-600 outline-none"
              >
                <option value="school">{isRtl ? "التعليم العام / المدارس (تفكير أوسع +15%)" : "K-12 / Schools (+15% time)"}</option>
                <option value="undergrad">{isRtl ? "المرحلة الجامعية / البكالوريوس (المعياري القياسي)" : "Undergraduate (Standard)"}</option>
                <option value="postgrad">{isRtl ? "الدراسات العليا (سرعة معالجة عالية -10%)" : "Postgraduate / Master-PhD (-10%)"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isRtl ? "العمق المعرفي للأسئلة:" : "Cognitive Complexity:"}</span>
              </label>
              <select
                value={cognitiveComplexity}
                onChange={(e) => setCognitiveComplexity(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold text-slate-900 focus:border-blue-600 outline-none"
              >
                <option value="balanced">{isRtl ? "مستوى متوازن (تذكر، فهم، تطبيق)" : "Balanced (Remember, Understand, Apply)"}</option>
                <option value="advanced">{isRtl ? "مستويات تفكير عليا مكثفة (تحليل، تركيب، تقويم +20%)" : "Higher-Order Thinking (Analyze, Evaluate +20%)"}</option>
              </select>
            </div>
          </div>

          {/* Time Distribution Ratio Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
                <span>{isRtl ? "توزيع زمن الاختبار (المقالي مقابل الموضوعي):" : "Time Ratio (Essay vs. Objective):"}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {essayTotalMinutes.toFixed(0)} {isRtl ? "د مقالي" : "m essay"} · {objectiveTotalMinutes.toFixed(0)} {isRtl ? "د موضوعي" : "m obj"} · {reviewBufferMin} {isRtl ? "د مراجعة" : "m buffer"}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300 shadow-inner">
              {essayPct > 0 && (
                <div
                  className="bg-violet-600 h-full text-[9px] font-black text-white flex items-center justify-center transition-all"
                  style={{ width: `${essayPct}%` }}
                  title={isRtl ? `الأسئلة المقالية: ${essayPct}%` : `Essay: ${essayPct}%`}
                >
                  {essayPct >= 10 ? `${essayPct}%` : ""}
                </div>
              )}
              {objectivePct > 0 && (
                <div
                  className="bg-blue-600 h-full text-[9px] font-black text-white flex items-center justify-center transition-all"
                  style={{ width: `${objectivePct}%` }}
                  title={isRtl ? `الأسئلة الموضوعية: ${objectivePct}%` : `Objective: ${objectivePct}%`}
                >
                  {objectivePct >= 10 ? `${objectivePct}%` : ""}
                </div>
              )}
              {bufferPct > 0 && (
                <div
                  className="bg-amber-500 h-full text-[9px] font-black text-amber-950 flex items-center justify-center transition-all"
                  style={{ width: `${bufferPct}%` }}
                  title={isRtl ? `وقت المراجعة: ${bufferPct}%` : `Buffer: ${bufferPct}%`}
                >
                  {bufferPct >= 8 ? `${bufferPct}%` : ""}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-700 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-violet-600 inline-block"></span>
                <span>{isRtl ? `المقالي (${essayPct}%)` : `Essay (${essayPct}%)`}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                <span>{isRtl ? `الموضوعي (${objectivePct}%)` : `Objective (${objectivePct}%)`}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span>{isRtl ? `المراجعة والتعليمات (${bufferPct}%)` : `Buffer (${bufferPct}%)`}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right / Recommendation Output Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl border-2 border-indigo-900/80 shadow-xl space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-1">
                <span>{isRtl ? "التوصية الزمنية المعتمدة" : "Official Recommendation"}</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {isRtl ? "المعيار الأكاديمي" : "Standard Slot"}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight leading-snug">
                {formatTimeSlot(recommendedSlotMinutes)}
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-1">
                {isRtl
                  ? `الزمن الفعلي المحسوب: ${avgStandardMinutes} دقيقة (مقرّب لأقرب فترة اختبار رسمية)`
                  : `Exact computed: ${avgStandardMinutes} mins (Rounded to standard exam schedule)`}
              </div>
            </div>

            {/* Range Breakdown (Min / Avg / Max) */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400 font-bold">{isRtl ? "الحد الأدنى (سريع)" : "Min (Fast)"}</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{minFastMinutes} {isRtl ? "د" : "m"}</div>
              </div>
              <div className="p-2 bg-indigo-900/60 rounded-xl border border-indigo-600/60">
                <div className="text-[10px] text-indigo-300 font-bold">{isRtl ? "المتوسط المعياري" : "Standard"}</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{avgStandardMinutes} {isRtl ? "د" : "m"}</div>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400 font-bold">{isRtl ? "الحد الأقصى (فروق)" : "Max (Buffer)"}</div>
                <div className="text-sm font-extrabold text-amber-400 mt-0.5">{maxSafeMinutes} {isRtl ? "د" : "m"}</div>
              </div>
            </div>

            {/* Dynamic Real-time Sync Status to Exam Header */}
            <div className="p-3.5 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center gap-3 text-xs text-indigo-100 shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-[11px] leading-relaxed">
                <span className="font-extrabold text-emerald-300 block mb-0.5">
                  {isRtl ? "مزامنة فورية وديناميكية مع ترويسة الاختبار" : "Live Dynamic Sync to Exam Header"}
                </span>
                <span className="text-slate-300 font-medium">
                  {isRtl
                    ? "يتم تطبيق وتحديث التوقيت تلقائياً في ترويسة ورقة الاختبار وملفات التصدير وفقاً لمعادلة زمن الحل وعدد الأسئلة."
                    : "Exam duration in header & exports dynamically updates in real time based on question counts and solving benchmarks."}
                </span>
              </div>
            </div>
          </div>

          {/* Pedagogical Advice Box */}
          <div className="p-4 bg-blue-50/80 border-2 border-blue-200 rounded-2xl text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-black text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{isRtl ? "التوجيه والتحليل السيكومتري لزمن الاختبار:" : "Pedagogical Pacing Analysis:"}</span>
            </div>
            <p className="text-slate-800 font-bold leading-relaxed text-[11px]">
              {getPedagogicalAdvice()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
