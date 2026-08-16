import React, { useState, useMemo } from "react";
import { Question } from "../types";
import { Language, translations } from "../translations";
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Eye,
  ShieldAlert,
  FileText,
  ExternalLink,
  Sparkles,
  Layers,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  HelpCircle as QuestionIcon,
} from "lucide-react";

interface ShareQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionsList: Question[];
  lang: Language;
  onOpenReadOnlyViewer?: (questions: Question[]) => void;
}

export default function ShareQuizModal({
  isOpen,
  onClose,
  questionsList,
  lang,
  onOpenReadOnlyViewer,
}: ShareQuizModalProps) {
  if (!isOpen) return null;

  const isRtl = lang === "ar";
  const t = translations[lang];

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "preview">("link");
  const [showAnswersInPreview, setShowAnswersInPreview] = useState(false);

  // Generate public share link with encoded questions list
  const shareUrl = useMemo(() => {
    try {
      if (!questionsList || questionsList.length === 0) {
        return window.location.origin + window.location.pathname;
      }
      // Compress questions slightly to keep URL clean
      const minified = questionsList.map((q) => ({
        id: q.id,
        qType: q.qType,
        stem: q.stem,
        options: q.options || [],
        answer: q.answer,
        bloom: q.bloom,
        difficulty: q.difficulty,
        explanation: q.explanation || "",
      }));

      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(minified)))));
      return `${window.location.origin}${window.location.pathname}#quiz=${encoded}`;
    } catch (e) {
      console.error("Error generating share URL:", e);
      return window.location.href;
    }
  }, [questionsList]);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    shareUrl
  )}&color=0f172a&bgcolor=ffffff&margin=10`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-5 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 sm:left-6 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
            title={isRtl ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pr-2 sm:pr-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner shrink-0">
              <Share2 className="w-6 h-6 text-blue-300" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {isRtl ? "مشاركة آمنة (قراءة فقط)" : "Secure Share (Read Only)"}
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  {questionsList.length} {t.share.itemCount}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-display text-white">
                {t.share.modalTitle}
              </h2>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab("link")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "link"
                  ? "bg-white text-slate-900 shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-slate-300"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{t.share.linkTab}</span>
            </button>

            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "preview"
                  ? "bg-white text-slate-900 shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-slate-300"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{t.share.previewTab}</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/60 flex-1">
          {questionsList.length === 0 ? (
            <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="font-bold text-amber-900 text-base">{t.share.emptyBankShareErr}</h3>
              <p className="text-xs text-amber-700">
                {isRtl
                  ? "قم بإضافة أو توليد أسئلة في بنك الأسئلة أولاً ليتم تضمينها في رابط ورمز المشاركة."
                  : "Add or generate questions in the bank first to include them in the shared link."}
              </p>
            </div>
          ) : activeTab === "link" ? (
            /* TAB 1: Link & QR Code */
            <div className="space-y-6">
              {/* Copyable Link Field */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-2xs">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{isRtl ? "رابط المشاركة العام المباشر:" : "Direct Shareable Link:"}</span>
                  {copied && (
                    <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {t.share.linkCopied}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{t.share.copyLinkBtn}</span>
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-2xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0">
                  <img
                    src={qrImageUrl}
                    alt="Quiz QR Code"
                    className="w-48 h-48 rounded-xl object-contain shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-3 text-center md:text-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base flex items-center justify-center md:justify-start gap-2">
                      <QrCode className="w-5 h-5 text-blue-600" />
                      <span>{t.share.qrTitle}</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                      {t.share.qrDesc}
                    </p>
                  </div>

                  <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{isRtl ? "حماية وخصوصية الاختبار:" : "Protected Access:"}</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-snug">
                      {isRtl
                        ? "هذا الرابط والرمز يتيحان فقط استعراض الأسئلة والإجابات في وضع قراءة محصن. لا يمكن للطلاب تعديل أو إحداث تغييرات بالبنك الرئيسي."
                        : "This link/QR provides read-only inspection. Students cannot edit or alter the primary question bank."}
                    </p>
                  </div>

                  {onOpenReadOnlyViewer && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReadOnlyViewer(questionsList);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-300" />
                      <span>{isRtl ? "فتح شاشة المعاينة الكاملة للطلاب" : "Open Student Read-Only View"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: Read-Only Preview */
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>{t.share.studentModeTitle}</span>
                  </h4>
                  <p className="text-xs text-slate-300">{t.share.studentModeNotice}</p>
                </div>

                <button
                  onClick={() => setShowAnswersInPreview(!showAnswersInPreview)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                    showAnswersInPreview
                      ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                  }`}
                >
                  {showAnswersInPreview ? t.share.hideKeyBtn : t.share.showKeyBtn}
                </button>
              </div>

              {/* Questions Read-Only List */}
              <div className="space-y-3">
                {questionsList.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        {isRtl ? `سؤال ${idx + 1}` : `Item #${idx + 1}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                        {q.qType} • {q.bloom || "عام"}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.stem}</p>

                    {/* MCQ Options */}
                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = q.answer && (opt === q.answer || opt.startsWith(q.answer));
                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between gap-2 ${
                                showAnswersInPreview && isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                  : "bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-500 w-16 shrink-0">
                                  {isRtl ? `الخيار ${oIdx + 1}` : `Option ${oIdx + 1}`}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {showAnswersInPreview && isCorrect && (
                                <span className="ms-2 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md shrink-0">
                                  {isRtl ? "الإجابة الصحيحة" : "Correct"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Key & Explanation */}
                    {showAnswersInPreview && (
                      <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-amber-900">
                          {isRtl ? "المفتاح والتفسير العلمي:" : "Answer Key & Rationale:"} {q.answer}
                        </div>
                        {q.explanation && (
                          <p className="text-amber-800 text-[11px] leading-relaxed">{q.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isRtl ? "رابط معتمد بصلاحية قراءة فقط" : "Authenticated Read-Only Link"}</span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {isRtl ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
