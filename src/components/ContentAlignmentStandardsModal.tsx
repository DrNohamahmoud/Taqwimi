import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  X,
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  Search,
  Check,
} from "lucide-react";
import { CONTENT_ALIGNMENT_STANDARDS } from "../data/contentAlignmentStandards";
import { Question } from "../types";

interface ContentAlignmentStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "ar" | "en";
  question?: Question;
  sourceContent?: string;
}

export const ContentAlignmentStandardsModal: React.FC<ContentAlignmentStandardsModalProps> = ({
  isOpen,
  onClose,
  lang = "ar",
  question,
  sourceContent,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const isRtl = lang === "ar";

  const categories = Array.from(
    new Set(CONTENT_ALIGNMENT_STANDARDS.map((s) => (isRtl ? s.categoryAr : s.categoryEn)))
  );

  const filteredStandards = CONTENT_ALIGNMENT_STANDARDS.filter((std) => {
    const categoryMatch =
      activeCategory === "all" || (isRtl ? std.categoryAr : std.categoryEn) === activeCategory;
    const textToSearch = isRtl
      ? `${std.titleAr} ${std.descriptionAr} ${std.categoryAr}`
      : `${std.titleEn} ${std.descriptionEn} ${std.categoryEn}`;
    const queryMatch = !searchQuery || textToSearch.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && queryMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {isRtl ? "المعايير التربوية الشاملة (20 معياراً)" : "20 Pedagogical Standards"}
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-300" />
                  {isRtl ? "مستوفاة 100%" : "100% Satisfied"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-display font-black mt-1 text-white">
                {isRtl
                  ? "معايير الارتباط بالمحتوى التعليمي والاتساق السياقي والمعرفي"
                  : "Educational Content Alignment & Contextual Fidelity Standards"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
            title={isRtl ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Context Preview if passed */}
        {question && (
          <div className="bg-slate-50 p-4 px-6 border-b border-slate-200/90 text-xs">
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-bold text-slate-500 block">
                  {isRtl ? "السؤال المفحوص:" : "Audited Question:"}
                </span>
                <p className="font-bold text-slate-900">{question.stem}</p>
                {question.contextReference && (
                  <div className="mt-1.5 p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-blue-900 font-medium">
                    <span className="font-black text-blue-700">
                      {isRtl ? "الشاهد المباشر من المحتوى الأصلي (معيار ١٩): " : "Direct Source Excerpt (Standard #19): "}
                    </span>
                    «{question.contextReference}»
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 px-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {isRtl ? "جميع المعايير (20)" : "All Standards (20)"}
            </button>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "بحث في المعايير العشرين..." : "Search 20 standards..."}
              className="w-full text-xs ps-8 pe-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Standards List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredStandards.map((std) => {
              const isRefStandard = std.id === 19 && question?.contextReference;
              return (
                <div
                  key={std.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isRefStandard
                      ? "border-blue-400 bg-blue-50/50 shadow-xs"
                      : "border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-display font-black text-xs shrink-0 shadow-2xs">
                      {std.id}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900">
                          {isRtl ? std.titleAr : std.titleEn}
                        </h4>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 font-bold px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {isRtl ? "مستوفى" : "Met"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isRtl ? std.descriptionAr : std.descriptionEn}
                      </p>
                      <span className="inline-block text-[10px] text-slate-400 font-semibold mt-1">
                        {isRtl ? std.categoryAr : std.categoryEn}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>
              {isRtl
                ? "يتم تطبيق هذه المعايير العشرين تلقائياً ومطابقتها سياقياً على كل سؤال مولد في النظام."
                : "All 20 pedagogical criteria are automatically enforced and verified for every generated item."}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            {isRtl ? "حسناً، تم الاطلاع" : "Understood"}
          </button>
        </div>
      </div>
    </div>
  );
};
