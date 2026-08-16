import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Question } from "../types";
import { Language } from "../translations";
import { BarChart2, PieChart as PieChartIcon, Brain, Sparkles, Layers, CheckCircle } from "lucide-react";

interface BloomChartDashboardProps {
  questionsList: Question[];
  lang: Language;
}

const BLOOM_CATEGORIES = [
  { key: "remember", labelAr: "تذكر", labelEn: "Remember", color: "#3B82F6", level: "دنيا" },
  { key: "understand", labelAr: "فهم", labelEn: "Understand", color: "#6366F1", level: "دنيا" },
  { key: "apply", labelAr: "تطبيق", labelEn: "Apply", color: "#8B5CF6", level: "دنيا" },
  { key: "analyze", labelAr: "تحليل", labelEn: "Analyze", color: "#EC4899", level: "عليا" },
  { key: "evaluate", labelAr: "تقييم", labelEn: "Evaluate", color: "#F59E0B", level: "عليا" },
  { key: "create", labelAr: "ابتكار / إبداع", labelEn: "Create", color: "#10B981", level: "عليا" },
];

function normalizeBloom(bloomText: string): string {
  if (!bloomText) return "understand";
  const str = bloomText.toLowerCase().trim();
  if (str.includes("تذكر") || str.includes("remember") || str.includes("معرفة")) return "remember";
  if (str.includes("فهم") || str.includes("understand") || str.includes("استيعاب")) return "understand";
  if (str.includes("تطبيق") || str.includes("apply")) return "apply";
  if (str.includes("تحليل") || str.includes("analy")) return "analyze";
  if (str.includes("تقييم") || str.includes("evalu")) return "evaluate";
  if (str.includes("ابتكار") || str.includes("إبداع") || str.includes("ابداع") || str.includes("create")) return "create";
  return "understand";
}

export default function BloomChartDashboard({ questionsList, lang }: BloomChartDashboardProps) {
  const isRtl = lang === "ar";
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Calculate counts per Bloom category
  const countsMap: Record<string, number> = {
    remember: 0,
    understand: 0,
    apply: 0,
    analyze: 0,
    evaluate: 0,
    create: 0,
  };

  questionsList.forEach((q) => {
    const key = normalizeBloom(q.bloom);
    countsMap[key] = (countsMap[key] || 0) + 1;
  });

  const total = questionsList.length;

  const chartData = BLOOM_CATEGORIES.map((cat) => {
    const count = countsMap[cat.key] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      name: isRtl ? cat.labelAr : cat.labelEn,
      count,
      percentage,
      color: cat.color,
      level: cat.level,
    };
  });

  const lowerCount = countsMap.remember + countsMap.understand + countsMap.apply;
  const higherCount = countsMap.analyze + countsMap.evaluate + countsMap.create;

  const lowerPct = total > 0 ? Math.round((lowerCount / total) * 100) : 0;
  const higherPct = total > 0 ? Math.round((higherCount / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-md space-y-5">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Brain className="w-5 h-5 text-blue-100" />
          </div>
          <div>
            <h4 className="font-display font-black text-sm text-slate-900">
              {isRtl ? "لوحة تحكم مستويات بلوم والمعرفة" : "Bloom's Taxonomy Cognitive Dashboard"}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              {isRtl ? "تحليل بياني تفاعلي لتوزيع المستويات المعرفية في البنك" : "Interactive chart breakdown of question cognitive levels"}
            </p>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300">
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === "bar"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{isRtl ? "أعمدة" : "Bar"}</span>
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === "pie"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>{isRtl ? "دائري" : "Pie"}</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 bg-blue-50/80 border-2 border-blue-200 rounded-xl space-y-0.5">
          <span className="text-[10px] text-blue-700 font-bold block">
            {isRtl ? "مستويات تفكير دنيا (تذكر، فهم، تطبيق)" : "Lower Order Skills (LOCS)"}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-blue-900">{lowerCount} {isRtl ? "سؤال" : "q"}</span>
            <span className="text-xs font-extrabold text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded-md">
              {lowerPct}%
            </span>
          </div>
        </div>

        <div className="p-3 bg-purple-50/80 border-2 border-purple-200 rounded-xl space-y-0.5">
          <span className="text-[10px] text-purple-700 font-bold block">
            {isRtl ? "مستويات تفكير عليا (تحليل، تقييم، ابتكار)" : "Higher Order Skills (HOCS)"}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-purple-900">{higherCount} {isRtl ? "سؤال" : "q"}</span>
            <span className="text-xs font-extrabold text-purple-700 bg-purple-200/60 px-2 py-0.5 rounded-md">
              {higherPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart Visual Representation */}
      <div className="bg-slate-50/60 p-3 rounded-xl border-2 border-slate-200 min-h-[220px]">
        {total === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-2">
            <Layers className="w-8 h-8 text-slate-300" />
            <p className="font-bold text-slate-600">
              {isRtl ? "لا توجد أسئلة حالياً في البنك لعرض التوزيع البياني" : "No questions in the bank yet to show analytics"}
            </p>
          </div>
        ) : chartType === "bar" ? (
          <div className="w-full h-[210px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} ${isRtl ? "سؤال" : "questions"} (${item.payload.percentage}%)`,
                    isRtl ? "العدد" : "Count",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    borderColor: "#CBD5E1",
                    fontWeight: "bold",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-[210px] text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.filter((d) => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {chartData
                    .filter((d) => d.count > 0)
                    .map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} ${isRtl ? "سؤال" : "questions"} (${item.payload.percentage}%)`,
                    item.payload.name,
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    borderColor: "#CBD5E1",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legend & Categories Legend List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
        {chartData.map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 bg-white">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
              <span className="font-bold text-slate-800 truncate">{cat.name}</span>
            </div>
            <span className="font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
              {cat.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
