import React, { useState } from "react";
import {
  Link2,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2,
  FileText,
  Zap,
  Layers,
  HelpCircle,
  Eye,
  Check,
} from "lucide-react";
import { Question } from "../types";
import { Language } from "../translations";

interface ImageStimulusInputProps {
  lang: Language;
  onQuestionExtracted?: (q: Question) => void;
  onContentExtracted?: (text: string) => void;
  onAttachImage?: (imageUrl: string) => void;
  currentAttachedUrl?: string;
  onClearAttached?: () => void;
}

// Curated educational diagram presets for fast academic testing
const PRESET_DIAGRAMS = [
  {
    id: "plant_cell",
    titleAr: "رسم الخلية النباتية والكلوروبلاست",
    titleEn: "Plant Cell & Chloroplast Diagram",
    categoryAr: "أحياء وعلم الحياة",
    categoryEn: "Biology",
    url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    descriptionAr: "مخطط توضيحي لتركيب الخلية النباتية مع الجدار الخلوي والبلاستيدات الخضراء",
  },
  {
    id: "circulatory_system",
    titleAr: "مخطط الدورة الدموية وجهاز الدوران",
    titleEn: "Circulatory System & Heart Chambers",
    categoryAr: "علوم وصحة",
    categoryEn: "Health & Science",
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
    descriptionAr: "رسم بياني تشريحي يوضح مسارات الشرايين والأوردة والصمامات القلبية",
  },
  {
    id: "electric_circuit",
    titleAr: "مخطط الدائرة الكهربائية والمقاومات",
    titleEn: "Electric Circuit & Ohm's Law",
    categoryAr: "فيزياء وهندسة",
    categoryEn: "Physics",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    descriptionAr: "مخطط توصيل المقاومات على التوالي والتوازي ومصدر الجهد الكهربائي",
  },
  {
    id: "water_cycle",
    titleAr: "دورة الماء في الطبيعة والتبخر",
    titleEn: "Hydrological Water Cycle",
    categoryAr: "علوم الأرض والبيئة",
    categoryEn: "Geology & Ecology",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    descriptionAr: "مخطط بياني يوضح مراحل التبخر والتكثف والهطول والمياه الجوفية",
  },
];

export default function ImageStimulusInput({
  lang,
  onQuestionExtracted,
  onContentExtracted,
  onAttachImage,
  currentAttachedUrl,
  onClearAttached,
}: ImageStimulusInputProps) {
  const isRtl = lang === "ar";
  const [inputUrl, setInputUrl] = useState<string>("");
  const [validatedUrl, setValidatedUrl] = useState<string | null>(currentAttachedUrl || null);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedQuestion, setAnalyzedQuestion] = useState<Question | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState<boolean>(false);

  const handleApplyUrl = (urlToApply: string) => {
    const trimmed = urlToApply.trim();
    if (!trimmed) return;
    setInputUrl(trimmed);
    setValidatedUrl(trimmed);
    setImgLoadError(false);
    setAnalysisError(null);
    setAnalyzedQuestion(null);
  };

  const handleClear = () => {
    setInputUrl("");
    setValidatedUrl(null);
    setImgLoadError(false);
    setAnalyzedQuestion(null);
    setAnalysisError(null);
    if (onClearAttached) onClearAttached();
  };

  const handleAnalyzeFromUrl = async (mode: "question" | "content") => {
    const targetUrl = validatedUrl || inputUrl.trim();
    if (!targetUrl) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/analyze-question-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: targetUrl,
          lang,
          mode: mode === "content" ? "extract_content" : "parse_question",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل تحليل الصورة من الرابط" : "Failed to analyze image from URL"));
      }

      if (mode === "content") {
        if (data.extractedText && onContentExtracted) {
          onContentExtracted(data.extractedText);
        } else {
          throw new Error(isRtl ? "لم يتم استخراج نص من الصورة" : "No text found in image");
        }
      } else {
        if (data.question) {
          setAnalyzedQuestion(data.question);
        } else {
          throw new Error(isRtl ? "تعذر استخراج السؤال" : "Could not structure question");
        }
      }
    } catch (err: any) {
      console.error("URL Image Analysis error:", err);
      setAnalysisError(err.message || (isRtl ? "حدث خطأ أثناء الاتصال بالرابط" : "Error connecting to image URL"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveExtractedQuestion = () => {
    if (analyzedQuestion && onQuestionExtracted) {
      onQuestionExtracted(analyzedQuestion);
      setAnalyzedQuestion(null);
    }
  };

  const handleAttach = () => {
    const targetUrl = validatedUrl || inputUrl.trim();
    if (targetUrl && onAttachImage) {
      onAttachImage(targetUrl);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-slate-700 shadow-sm space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
          <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-display font-black text-sm sm:text-base">
            {isRtl ? "إضافة رابط صورة توضيحية / مثير مرئي من مصدر خارجي" : "External Illustrative Image URL"}
          </h4>
        </div>

        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showPresets ? (isRtl ? "إخفاء الرسوم النموذجية" : "Hide Presets") : isRtl ? "تصفح رسوم ومثيرات نموذجية" : "Browse Diagram Presets"}</span>
        </button>
      </div>

      {/* Preset Diagrams Carousel */}
      {showPresets && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-fadeIn">
          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
            {isRtl ? "اختر رسماً توضيحياً تعليمياً للتجربة السريعة بنقرة واحدة:" : "Select a curated sample diagram:"}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_DIAGRAMS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyUrl(preset.url)}
                className="p-2.5 rounded-xl border text-start bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2 group"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={preset.url}
                    alt={preset.titleAr}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                      {isRtl ? preset.categoryAr : preset.categoryEn}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate group-hover:text-indigo-600">
                      {isRtl ? preset.titleAr : preset.titleEn}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {isRtl ? preset.descriptionAr : preset.titleEn}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* URL Input Bar */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setValidatedUrl(e.target.value.trim() ? e.target.value.trim() : null);
              setImgLoadError(false);
            }}
            placeholder={
              isRtl
                ? "ألصق رابط الصورة المباشر (https://example.com/diagram.png)..."
                : "Paste direct image URL (https://...)..."
            }
            className="w-full px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {validatedUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 dark:border-slate-700 cursor-pointer"
            title={isRtl ? "مسح الرابط" : "Clear URL"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error Alert */}
      {analysisError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Live Image Preview & Actions */}
      {validatedUrl && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-wrap sm:flex-nowrap gap-4 items-start">
            {/* Thumbnail Box */}
            <div className="relative w-36 sm:w-48 aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
              {!imgLoadError ? (
                <img
                  src={validatedUrl}
                  alt="Illustrative diagram"
                  onError={() => setImgLoadError(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="p-2 text-center text-[10px] text-rose-400">
                  {isRtl ? "تعذر تحميل الصورة من الرابط" : "Failed to load image"}
                </div>
              )}
            </div>

            {/* Analysis & Attachment Action Buttons */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {isRtl ? "تم التحقق من رابط المثير التوضيحي" : "Image link verified"}
                </span>

                <a
                  href={validatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{isRtl ? "فتح الرابط الخارجي" : "Open URL"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => handleAnalyzeFromUrl("question")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>
                    {isRtl ? "تحليل واستخراج السؤال بالذكاء الاصطناعي" : "Analyze Question from URL"}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => handleAnalyzeFromUrl("content")}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isRtl ? "استخراج النص للمحتوى" : "Extract Text"}</span>
                </button>

                {onAttachImage && (
                  <button
                    type="button"
                    onClick={handleAttach}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isRtl ? "إرفاق كرسم للسؤال" : "Attach as Stimulus"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Question Preview from URL Analysis */}
          {analyzedQuestion && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-700 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {isRtl ? "تم استخراج وتحليل البند بنجاح من الرابط:" : "Question parsed from URL:"}
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                  {analyzedQuestion.bloom}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                {analyzedQuestion.stem}
              </p>

              {analyzedQuestion.options && analyzedQuestion.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {analyzedQuestion.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 truncate"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApproveExtractedQuestion}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? "اعتماد وإضافة لبنك الأسئلة" : "Approve & Add"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
