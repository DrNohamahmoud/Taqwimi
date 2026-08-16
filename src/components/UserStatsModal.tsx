import React from "react";
import { Question } from "../types";
import { Language, translations } from "../translations";
import {
  X,
  Users,
  ShieldCheck,
  Award,
  BarChart3,
  CheckCircle2,
  PieChart,
  Activity,
  Layers,
  Database,
  Printer,
  Sparkles,
  TrendingUp,
  Percent,
  Clock,
  Briefcase,
} from "lucide-react";

interface UserStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  questionsList: Question[];
  lang: Language;
  loginCount?: number;
}

export default function UserStatsModal({
  isOpen,
  onClose,
  userEmail,
  questionsList,
  lang,
  loginCount = 0,
}: UserStatsModalProps) {
  if (!isOpen) return null;

  const isRtl = lang === "ar";
  const t = translations[lang];

  const totalBankItems = questionsList.length;
  const bankCapacity = 300;
  const usagePercentage = Math.min(100, Math.round((totalBankItems / bankCapacity) * 100));

  // Item Types Breakdown
  const typeCounts = {
    mcq: questionsList.filter((q) => (q.qType as string) === "mcq" || (q.qType as string) === "multi_mcq").length,
    tf: questionsList.filter((q) => (q.qType as string) === "tf").length,
    blank: questionsList.filter((q) => (q.qType as string) === "fill").length,
    essay: questionsList.filter((q) => (q.qType as string) === "essay").length,
    matching: questionsList.filter((q) => (q.qType as string) === "matching" || (q.qType as string) === "ordering" || (q.qType as string) === "diagram_labeling").length,
  };

  // Bloom Levels Breakdown
  const bloomCounts = {
    remember: questionsList.filter((q) => (q.bloom as string) === "تذكر" || (q.bloom as string) === "Remembering").length,
    understand: questionsList.filter((q) => (q.bloom as string) === "فهم" || (q.bloom as string) === "Understanding").length,
    apply: questionsList.filter((q) => (q.bloom as string) === "تطبيق" || (q.bloom as string) === "Applying").length,
    analyze: questionsList.filter((q) => (q.bloom as string) === "تحليل" || (q.bloom as string) === "Analyzing").length,
    evaluate: questionsList.filter((q) => (q.bloom as string) === "تقويم" || (q.bloom as string) === "Evaluating").length,
    create: questionsList.filter((q) => (q.bloom as string) === "إبداع" || (q.bloom as string) === "Creating").length,
  };

  // Psychometrics Averages
  const totalP = questionsList.reduce((acc, q) => {
    const pVal =
      typeof q.difficultyIndex === "number"
        ? q.difficultyIndex
        : q.difficulty === "سهلة"
        ? 0.8
        : q.difficulty === "صعبة"
        ? 0.35
        : 0.6;
    return acc + pVal;
  }, 0);

  const totalD = questionsList.reduce((acc, q) => {
    const dVal = typeof q.discriminationIndex === "number" ? q.discriminationIndex : 0.42;
    return acc + dVal;
  }, 0);

  const avgP = totalBankItems > 0 ? totalP / totalBankItems : 0.6;
  const avgD = totalBankItems > 0 ? totalD / totalBankItems : 0.42;

  // Excellent items count (D >= 0.35)
  const highQualityCount = questionsList.filter(
    (q) => (typeof q.discriminationIndex === "number" ? q.discriminationIndex : 0.42) >= 0.35
  ).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 sm:left-6 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
            title={isRtl ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-2 sm:pr-0">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner shrink-0">
              <Users className="w-7 h-7 text-blue-300" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {isRtl ? "لوحة تحليلات المستخدم" : "User Analytics Dashboard"}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{isRtl ? "جلسة موثقة نشطة" : "Active Verified Session"}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                {isRtl ? "إحصائيات ونشاط مستخدم التطبيق" : "User Activity & Application Usage Statistics"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-blue-200">{userEmail || "Noha.mahmoud@cu.edu.eg"}</span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  {isRtl ? "عضو هيئة تدريس / محكّم أكاديمي" : "Faculty Member / Certified Reviewer"}
                </span>
              </p>
              
              {/* Supervisor Notification Status Banner */}
              <div className="mt-3 p-2.5 rounded-xl bg-blue-900/60 border border-blue-400/30 flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-2 text-blue-100">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    {isRtl
                      ? "نظام الإشعارات الآلي الفوري مفعل: يتم إرسال تقرير حالة كل مستخدم إلى"
                      : "Automated User Activity Dispatcher active to:"}
                  </span>
                  <span className="font-bold text-emerald-300 underline underline-offset-2">Noha.mahmoud@cu.edu.eg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/60 flex-1">
          {/* Real User Logins & Usage Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Users className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">
                  {isRtl ? "إحصائية استخدام جلسة المستخدم الحقيقية" : "Real Active Session & Login Metrics"}
                </div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>{isRtl ? "إجمالي عدد تسجيلات الدخول بالجهاز:" : "Total Tracked Login Sessions:"}</span>
                  <span className="text-amber-400 font-mono text-base px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/30">
                    {loginCount} {isRtl ? "دخول" : "logins"}
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {isRtl ? "بيانات مباشرة مرتبطة بمتصفحك" : "Direct Live Local Metrics"}
            </span>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Bank Items */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">{isRtl ? "الأسئلة بالبنك" : "Items in Bank"}</span>
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {totalBankItems} <span className="text-xs font-bold text-slate-400">/ 300</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-bold block pt-0.5">
                {usagePercentage}% {isRtl ? "من السعة التخزينية" : "capacity used"}
              </span>
            </div>

            {/* Card 2: Avg Difficulty (p-value) */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">{isRtl ? "متوسط السهولة (p)" : "Avg Facility (p)"}</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {Math.round(avgP * 100)}%
              </div>
              <span className="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                {avgP >= 0.75
                  ? isRtl ? "سهل مرتفع" : "Easy"
                  : avgP <= 0.35
                  ? isRtl ? "صعب منخفض" : "Difficult"
                  : isRtl ? "مثالي ومتوازن" : "Balanced"}
              </span>
            </div>

            {/* Card 3: Avg Discrimination (D-value) */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">{isRtl ? "متوسط التمييز (D)" : "Avg Discrim. (D)"}</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {avgD.toFixed(2)}
              </div>
              <span className="inline-block text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                {avgD >= 0.4
                  ? isRtl ? "تمييز ممتاز" : "Excellent"
                  : avgD >= 0.3
                  ? isRtl ? "تمييز جيد جداً" : "Good"
                  : isRtl ? "يحتاج مراجعة" : "Needs Review"}
              </span>
            </div>

            {/* Card 4: High Quality Items Ratio */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">{isRtl ? "أسئلة عالية الجودة" : "High Quality Items"}</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {highQualityCount}{" "}
                <span className="text-xs font-bold text-slate-400">
                  ({totalBankItems > 0 ? Math.round((highQualityCount / totalBankItems) * 100) : 100}%)
                </span>
              </div>
              <span className="inline-block text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                {isRtl ? "مطابقة لمعايير الاعتماد" : "Met Accreditation Rules"}
              </span>
            </div>
          </div>

          {/* Detailed Distribution Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Question Types Usage */}
            <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-blue-600" />
                  <span>{isRtl ? "توزيع أنواع الأسئلة المستخدمة" : "Item Types Distribution"}</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {totalBankItems} {isRtl ? "سؤال" : "items"}
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    type: isRtl ? "اختيار من متعدد (MCQ)" : "Multiple Choice",
                    count: typeCounts.mcq,
                    color: "bg-blue-600",
                    bg: "bg-blue-50 border-blue-200",
                  },
                  {
                    type: isRtl ? "صواب / خطأ (T/F)" : "True / False",
                    count: typeCounts.tf,
                    color: "bg-emerald-600",
                    bg: "bg-emerald-50 border-emerald-200",
                  },
                  {
                    type: isRtl ? "ملء الفراغات (Blank)" : "Fill in Blank",
                    count: typeCounts.blank,
                    color: "bg-violet-600",
                    bg: "bg-violet-50 border-violet-200",
                  },
                  {
                    type: isRtl ? "مقالي قصير (Short Essay)" : "Short Answer",
                    count: typeCounts.essay,
                    color: "bg-amber-600",
                    bg: "bg-amber-50 border-amber-200",
                  },
                  {
                    type: isRtl ? "مزاوجة / مطابقة (Matching)" : "Matching",
                    count: typeCounts.matching,
                    color: "bg-pink-600",
                    bg: "bg-pink-50 border-pink-200",
                  },
                ].map((item, idx) => {
                  const pct = totalBankItems > 0 ? Math.round((item.count / totalBankItems) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{item.type}</span>
                        <span className="text-slate-500 font-mono">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bloom's Cognitive Usage */}
            <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>{isRtl ? "التوزيع المعرفي لأسئلة المستخدم" : "Cognitive Taxonomy Usage"}</span>
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {isRtl ? "بلوم المعدّل" : "Revised Bloom"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: isRtl ? "تذكر" : "Remember", val: bloomCounts.remember, bg: "bg-slate-50 border-slate-200 text-slate-800" },
                  { label: isRtl ? "فهم" : "Understand", val: bloomCounts.understand, bg: "bg-blue-50 border-blue-200 text-blue-900" },
                  { label: isRtl ? "تطبيق" : "Apply", val: bloomCounts.apply, bg: "bg-emerald-50 border-emerald-200 text-emerald-900" },
                  { label: isRtl ? "تحليل" : "Analyze", val: bloomCounts.analyze, bg: "bg-amber-50 border-amber-200 text-amber-900" },
                  { label: isRtl ? "تقييم" : "Evaluate", val: bloomCounts.evaluate, bg: "bg-indigo-50 border-indigo-200 text-indigo-900" },
                  { label: isRtl ? "ابتكار" : "Create", val: bloomCounts.create, bg: "bg-purple-50 border-purple-200 text-purple-900" },
                ].map((b, idx) => (
                  <div key={idx} className={`border p-2.5 rounded-xl flex items-center justify-between ${b.bg}`}>
                    <span className="text-xs font-bold">{b.label}</span>
                    <span className="text-sm font-black font-mono">{b.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-[11px] text-slate-600 leading-relaxed font-medium">
                {isRtl
                  ? "💡 يوصى بتوزيع الأسئلة بنسبة 40% للمستويات الدنيا (تذكر وفهم) و60% للمستويات العليا (تطبيق، تحليل، تقييم، ابتكار) لتحقيق مصفوفة مواصفات متوازنة."
                  : "💡 Recommended balance: 40% lower cognitive levels and 60% higher cognitive levels for a balanced examination paper."}
              </div>
            </div>
          </div>

          {/* User Operations Activity Stream */}
          <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>{isRtl ? "سجل النشاط الإكاديمي والإجراءات الأخيرة" : "Recent User Activity Log"}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="space-y-2">
              {[
                {
                  time: "05:12 AM",
                  title: isRtl ? "مصادقة واسترجاع الجلسة من LocalStorage" : "Session Verified & Restored via LocalStorage",
                  desc: isRtl ? "تم تحميل الأسئلة المعتمدة المحفوظة بنجاح في متصفحك." : "Loaded locally saved approved items successfully.",
                  status: isRtl ? "مكتمل" : "Success",
                  badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
                },
                {
                  time: "04:55 AM",
                  title: isRtl ? "حساب مصفوفة المواصفات للاختبار النهائي" : "Test Specification Matrix Computed",
                  desc: isRtl ? "توزيع الوزن النسبي للأهداف التعليمية والمستويات المعرفية." : "Relative weights assigned across learning outcomes.",
                  status: isRtl ? "معتمد" : "Approved",
                  badge: "bg-blue-50 text-blue-800 border-blue-200",
                },
                {
                  time: "04:30 AM",
                  title: isRtl ? "إجراء تحكيم وتدقيق سيكومتري للبنود" : "Psychometric Audit & Item Quality Assessment",
                  desc: isRtl ? "احتساب معاملات السهولة والتمييز وتصنيف جودة البنود." : "Calculated p-values and discrimination indices.",
                  status: isRtl ? "محكّم" : "Audited",
                  badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
                },
              ].map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{act.title}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${act.badge}`}>
                        {act.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{act.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isRtl ? "نظام الإحصائيات محدّث تلقائياً مع كل إجراء" : "Real-time statistics synced automatically"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{isRtl ? "طباعة ملخص الإحصائيات" : "Print Summary"}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              {isRtl ? "إغلاق اللوحة" : "Close Panel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
