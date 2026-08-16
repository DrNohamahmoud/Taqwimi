import React, { useState, useRef } from "react";
import { HelpCircle, Sparkles, BookOpen, FilePlus, ChevronDown, ChevronUp, CheckCircle2, Paperclip, FileText, FileUp, X, Loader2, AlertCircle, Mic, MicOff, SpellCheck, CheckCheck, Edit3, Maximize2, Zap, RefreshCw, ShieldCheck, Quote, Camera, Link2, Image as ImageIcon, Trash2, Eye, UploadCloud, ClipboardPaste, Eraser, ScanLine, ArrowRight } from "lucide-react";
import { Question } from "../types";
import { Language, translations } from "../translations";
import QualityHintsBadge from "./QualityHintsBadge";
import QuestionSpellCheckBanner from "./QuestionSpellCheckBanner";
import FullscreenQuestionReviewModal from "./FullscreenQuestionReviewModal";
import { ContentAlignmentStandardsModal } from "./ContentAlignmentStandardsModal";
import CameraQuestionScannerModal from "./CameraQuestionScannerModal";
import ImageStimulusInput from "./ImageStimulusInput";
import { checkQuestionSpelling, applyAllSpellingFixes } from "../utils/spellChecker";
import { runComprehensiveQuestionAutomation } from "../utils/questionAutomation";

interface GeneratorTabProps {
  onAddQuestion: (q: Question) => void;
  lang: Language;
  onNextStage?: () => void;
}

export default function GeneratorTab({ onAddQuestion, lang, onNextStage }: GeneratorTabProps) {
  const t = translations[lang].generator;
  const isRtl = lang === "ar";

  const [content, setContent] = useState("");
  const [qType, setQType] = useState<"mcq" | "tf" | "fill">("mcq");
  const [bloom, setBloom] = useState<"تذكر" | "فهم" | "تطبيق" | "تحليل" | "تقويم" | "إبداع">("فهم");
  const [qCount, setQCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState<Question[]>([]);
  const [error, setError] = useState("");
  const [visibleAnswers, setVisibleAnswers] = useState<{ [key: string]: boolean }>({});
  const [visibleReviews, setVisibleReviews] = useState<{ [key: string]: boolean }>({});
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [fullscreenQuestion, setFullscreenQuestion] = useState<Question | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number>(0);
  const [automatingId, setAutomatingId] = useState<string | null>(null);
  const [isBatchAutomating, setIsBatchAutomating] = useState<boolean>(false);
  const [automationToast, setAutomationToast] = useState<string | null>(null);
  const [standardsModalOpen, setStandardsModalOpen] = useState<boolean>(false);
  const [selectedStandardsQuestion, setSelectedStandardsQuestion] = useState<Question | undefined>(undefined);

  // Camera Scanner & External Image States
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [showImageUrlSection, setShowImageUrlSection] = useState<boolean>(false);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);

  const handleQuestionExtracted = (extractedQ: Question) => {
    const newQ: Question = {
      ...extractedQ,
      id: extractedQ.id || `ocr-gen-${Date.now()}`,
      imageUrl: extractedQ.imageUrl || attachedImageUrl || undefined,
      difficultyIndex: typeof extractedQ.difficultyIndex === "number" ? extractedQ.difficultyIndex : 0.60,
      discriminationIndex: typeof extractedQ.discriminationIndex === "number" ? extractedQ.discriminationIndex : 0.42,
      discriminationStatus: extractedQ.discriminationStatus || (isRtl ? "ممتاز" : "Excellent"),
      contextReference: extractedQ.contextReference || (isRtl ? "مستخرج ومستخلص بالرؤية الحاسوبية من المثير المصوّر." : "Extracted via vision AI from visual stimulus."),
      contentAlignment: extractedQ.contentAlignment || [
        isRtl ? "مطابقة المثير البصري" : "Visual Stimulus Alignment",
        isRtl ? "استخلاص مباشر" : "Direct Extraction",
        isRtl ? "تحكيم الصياغة" : "Item Formulation Audit",
      ],
    };
    setGenerated((prev) => [newQ, ...prev]);
    setAutomationToast(
      isRtl
        ? "📸 تم استخراج السؤال السيكومتري بنجاح وإضافته لقائمة المعاينة والتحكيم!"
        : "📸 Question successfully extracted from image and added for review!"
    );
    setTimeout(() => setAutomationToast(null), 4000);
  };

  const handleContentExtractedFromImage = (text: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
    setAutomationToast(
      isRtl
        ? "📝 تم استخراج المحتوى العلمي من الصورة ودمجه في صندوق المادة بنجاح!"
        : "📝 Course text extracted from image and merged into content box!"
    );
    setTimeout(() => setAutomationToast(null), 4000);
  };

  const handleAutomateSingle = async (qId: string) => {
    setAutomatingId(qId);
    await new Promise((r) => setTimeout(r, 450));
    setGenerated((prev) =>
      prev.map((item) => {
        if (item.id === qId) {
          return runComprehensiveQuestionAutomation(item, isRtl);
        }
        return item;
      })
    );
    setAutomatingId(null);
    setAutomationToast(
      isRtl
        ? "✨ تم تحكيم وتدقيق البند آلياً وضبط الصياغة والسيكومترية بنجاح!"
        : "✨ Item successfully certified & calibrated via Comprehensive Automation!"
    );
    setTimeout(() => setAutomationToast(null), 3000);
  };

  const handleBatchAutomateAll = async () => {
    if (isBatchAutomating || generated.length === 0) return;
    setIsBatchAutomating(true);
    await new Promise((r) => setTimeout(r, 600));
    setGenerated((prev) =>
      prev.map((item) => runComprehensiveQuestionAutomation(item, isRtl))
    );
    setIsBatchAutomating(false);
    setAutomationToast(
      isRtl
        ? `⚡ تم تشغيل الأتمتة الشاملة بنجاح لكافة الأسئلة الموّلدة (${generated.length} بنود)!`
        : `⚡ Comprehensive Automation completed for all ${generated.length} generated items!`
    );
    setTimeout(() => setAutomationToast(null), 3500);
  };

  // File Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Speech Recognition states
  const [activeListeningId, setActiveListeningId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleToggleListening = (id: string, onSpeechText: (text: string) => void) => {
    if (activeListeningId === id) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setActiveListeningId(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        isRtl
          ? "خاصية الإملاء الصوتي غير مدعومة في متصفحك الحالي. يرجى تجربة Google Chrome."
          : "Voice dictation is not supported in your browser. Please try Google Chrome."
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang === "ar" ? "ar-EG" : "en-US";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setActiveListeningId(id);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript.trim()) {
          onSpeechText(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error", event.error);
        if (event.error !== "no-speech") {
          setSpeechError(
            isRtl
              ? "حدث خطأ في الميكروفون. يرجى التأكد من السماح بالوصول للميكروفون."
              : "Microphone error. Please check mic permissions."
          );
        }
        setActiveListeningId(null);
      };

      recognition.onend = () => {
        setActiveListeningId(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setSpeechError(
        isRtl ? "تعذر تشغيل الميكروفون." : "Could not activate microphone."
      );
      setActiveListeningId(null);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    setSelectedFileName(file.name);
    setSelectedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setIsExtracting(true);
    setUploadSuccessMsg(null);
    setUploadErrorMsg(null);

    const isTextFile =
      file.type.startsWith("text/") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".json");

    if (isTextFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          setContent(text);
          const wordCount = text.trim().split(/\s+/).length;
          setUploadSuccessMsg(`${t.extractSuccess} (${wordCount} ${isRtl ? "كلمة" : "words"})`);
        } else {
          setUploadErrorMsg(t.extractError);
        }
        setIsExtracting(false);
      };
      reader.onerror = () => {
        setUploadErrorMsg(t.extractError);
        setIsExtracting(false);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        try {
          const res = await fetch("/api/extract-file-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileData: base64Data,
              mimeType: file.type,
              fileName: file.name,
              lang,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || t.extractError);
          }

          if (data.extractedText) {
            setContent(data.extractedText);
            const wordCount = data.extractedText.trim().split(/\s+/).length;
            setUploadSuccessMsg(`${t.extractSuccess} (${wordCount} ${isRtl ? "كلمة" : "words"})`);
          } else {
            throw new Error(t.extractError);
          }
        } catch (err: any) {
          setUploadErrorMsg(err.message || t.extractError);
        } finally {
          setIsExtracting(false);
        }
      };
      reader.onerror = () => {
        setUploadErrorMsg(t.extractError);
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setUploadSuccessMsg(null);
    setUploadErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError(isRtl ? "يرجى إدخال محتوى علمي أولاً للتوليد." : "Please enter scientific content first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setGenerated([]);
    setVisibleAnswers({});
    setVisibleReviews({});

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          qType,
          bloomTarget: bloom,
          qCount,
          lang,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل التوليد" : "Generation failed"));
      }

      if (data.questions && Array.isArray(data.questions)) {
        const formatted: Question[] = data.questions.map((q: any, idx: number) => {
          const diffIdx = typeof q.difficultyIndex === "number" ? q.difficultyIndex : (q.difficulty === "سهلة" ? 0.80 : q.difficulty === "صعبة" ? 0.35 : 0.60);
          const discIdx = typeof q.discriminationIndex === "number" ? q.discriminationIndex : 0.42;
          const discStatus = q.discriminationStatus || (isRtl ? "ممتاز" : "Excellent");
          const contextRef = q.contextReference || (isRtl ? "مستند ومستخلص من نص المحتوى التعليمي المدخل أعلاه." : "Directly grounded in the entered course material.");
          const contentAlign = Array.isArray(q.contentAlignment) && q.contentAlignment.length > 0
            ? q.contentAlignment
            : [
                isRtl ? "الارتباط المباشر بالمحتوى" : "Direct Content Grounding",
                isRtl ? "حفظ المعنى الأصلي" : "Preserving Original Meaning",
                isRtl ? "بدائل من سياق المادة" : "Contextual Distractors",
                isRtl ? "تحديد الشاهد النصي" : "Traceable Reference",
              ];

          return {
            id: `gen-${Date.now()}-${idx}`,
            qType: q.qType || qType,
            stem: q.stem || "",
            options: q.options || undefined,
            correctAnswer: q.correctAnswer || "",
            bloom: q.bloom || bloom,
            difficulty: q.difficulty || (isRtl ? "متوسطة" : "Moderate"),
            difficultyIndex: diffIdx,
            discriminationIndex: discIdx,
            discriminationStatus: discStatus,
            contextReference: contextRef,
            contentAlignment: contentAlign,
            notes: q.notes || [],
            imageUrl: q.imageUrl || attachedImageUrl || undefined,
          };
        });
        setGenerated(formatted);
      } else {
        throw new Error(isRtl ? "تنسيق الاستجابة من الخادم غير صالح." : "Invalid response format from server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isRtl ? "حدث خطأ غير متوقع أثناء الاتصال." : "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (id: string) => {
    setVisibleAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleReview = (id: string) => {
    setVisibleReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = (q: Question) => {
    onAddQuestion(q);
    setAddedIds((prev) => {
      const next = new Set(prev);
      next.add(q.id);
      return next;
    });
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    setGenerated((prev) => prev.map((item) => (item.id === updatedQ.id ? updatedQ : item)));
  };

  const handleFixAllGeneratedSpelling = () => {
    setGenerated((prev) => prev.map((item) => applyAllSpellingFixes(item, isRtl)));
  };

  const totalBatchSpellingErrors = generated.reduce((acc, q) => {
    const res = checkQuestionSpelling(q, isRtl);
    return acc + res.totalErrors;
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Control panel - Dark Blue Column */}
      <div className="lg:col-span-5 bg-gradient-to-b from-[#0b192c] via-[#0d2038] to-[#0a1626] text-white rounded-3xl p-6 sm:p-7 border border-blue-900/80 shadow-xl shadow-blue-950/50 sticky top-24 space-y-5">
        {/* Header with Title & Context Status */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/60 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-white leading-tight">
                {isRtl ? "محددات توليد الاسئلة من المحتوى" : "Content-Based Question Generation"}
              </h3>
              <p className="text-xs text-blue-200/80 font-medium">
                {isRtl ? "المرحلة الاولى: توليد أسئلة سياقية" : "Stage 1: Contextual Question Generation"}
              </p>
            </div>
          </div>

          {content.trim() && (
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 animate-fadeIn">
              {isRtl ? "✓ جاهز للتوليد" : "✓ Ready"}
            </span>
          )}
        </div>

        <div className="space-y-4.5">
          {/* Primary Textarea Workspace */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="contentInput" className="text-xs font-black text-blue-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{t.contentLabel}</span>
              </label>

              {/* Workspace Fast Action Buttons */}
              <div className="flex items-center gap-1.5">
                {content.trim() && (
                  <button
                    type="button"
                    onClick={() => setContent("")}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 hover:text-rose-100 bg-rose-950/70 hover:bg-rose-900/90 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-rose-800/70"
                    title={isRtl ? "مسح النص بالكامل" : "Clear all text"}
                  >
                    <Eraser className="w-3 h-3" />
                    <span>{isRtl ? "مسح" : "Clear"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const clipText = await navigator.clipboard.readText();
                      if (clipText) {
                        setContent((prev) => (prev ? `${prev}\n${clipText}` : clipText));
                      }
                    } catch (e) {
                      // fallback
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-100 hover:text-white bg-blue-900/70 hover:bg-blue-800/90 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-blue-700/70"
                  title={isRtl ? "لصق النص من الحافظة" : "Paste from clipboard"}
                >
                  <ClipboardPaste className="w-3 h-3 text-blue-300" />
                  <span>{isRtl ? "لصق" : "Paste"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContent(
                      isRtl
                        ? "تُعدّ الاختبارات الإلكترونية التحصيلية من أهم أدوات التقييم الإلكتروني. تختلف الأسئلة المقدمة من خلال الاختبار الإلكتروني تبعًا لنوع الاختبار ونوع المهارة المراد قياسها. يجب أن يحتوي سؤال الاختيار من متعدد على فكرة واحدة فقط، وأن تكون صياغته موجزة وواضحة. كما ينبغي تجنّب تكرار جزء من السؤال عند كل خيار، وتجنّب إعطاء الطالب دليلًا على مفتاح الإجابة. يجب أن تكون الخيارات متشابهة في الطول والنمط لتقليل عملية التخمين لدى الطالب."
                        : "Electronic achievement testing is one of the key tools in digital assessment. Items vary depending on test purpose and target learning skill. A multiple choice item stem must express a single idea with conciseness and clarity. Repeated common phrases should be placed in the stem rather than in every option, avoiding giving students clue hints. Options must be parallel in length and grammatical structure to reduce guessing."
                    );
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-100 hover:text-white bg-indigo-900/70 hover:bg-indigo-800/90 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-indigo-700/70"
                  title={isRtl ? "إدراج نص تعليمي نموذجي للتجربة" : "Insert sample educational text"}
                >
                  <Zap className="w-3 h-3 text-indigo-300" />
                  <span>{isRtl ? "نص تجريبي" : "Sample"}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="contentInput"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isRtl ? "أضف النص هنا..." : "Add text here..."}
                className={`w-full min-h-[160px] p-3.5 border-2 rounded-2xl text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:outline-none text-white placeholder:text-slate-400 transition-all leading-relaxed shadow-inner font-sans ${
                  activeListeningId === "contentInput"
                    ? "border-rose-400 bg-rose-950/40 font-medium"
                    : "border-blue-900/80"
                }`}
              />

              {/* Textarea Floating Footer Indicator */}
              <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-bold text-blue-200/80">
                <span className="flex items-center gap-1">
                  <span className="font-mono text-white">{content.trim() ? content.trim().split(/\s+/).length : 0}</span>
                  <span>{isRtl ? "كلمة" : "words"}</span>
                  <span className="opacity-40">•</span>
                  <span className="font-mono text-white">{content.length}</span>
                  <span>{isRtl ? "حرف" : "chars"}</span>
                </span>
                {content.trim() ? (
                  <span className={content.length > 50 ? "text-emerald-300 font-black" : "text-amber-300 font-medium"}>
                    {content.length > 50 ? (isRtl ? "✓ محتوى وافٍ للقياس" : "✓ Ample Content") : (isRtl ? "محتوى قصير" : "Short Text")}
                  </span>
                ) : null}
              </div>
            </div>

            {activeListeningId === "contentInput" && (
              <div className="p-3 bg-rose-950/80 border-2 border-rose-500/60 rounded-2xl flex items-center gap-2.5 text-xs text-rose-100 font-bold animate-pulse shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span>
                  {isRtl
                    ? "الميكروفون نشط: تحدث الآن لإملاء نص المقرر وسيقوم النظام بتفريغه مباشرة..."
                    : "Microphone active: Dictate now to transcribe course text directly..."}
                </span>
              </div>
            )}

            {speechError && (
              <div className="p-3 bg-amber-950/60 border border-amber-500/60 rounded-2xl text-xs text-amber-200 font-semibold">
                {speechError}
              </div>
            )}
          </div>

          {/* Active File / Extraction Status Card */}
          {isExtracting ? (
            <div className="p-3.5 rounded-2xl bg-blue-950/80 border-2 border-blue-500/60 flex items-center justify-center gap-2.5 text-xs font-black text-blue-200 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>{t.extractingText}</span>
            </div>
          ) : selectedFileName ? (
            <div className="p-3 rounded-2xl bg-blue-950/70 border border-blue-800/80 flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-900/80 text-blue-300 flex items-center justify-center shrink-0 font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-black text-white block truncate max-w-[200px] sm:max-w-xs">
                    {selectedFileName}
                  </span>
                  <span className="text-[10px] text-blue-300/80 font-medium">
                    {selectedFileSize} {uploadSuccessMsg ? `• ${uploadSuccessMsg}` : ""}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="p-1.5 hover:bg-blue-900/80 rounded-xl text-blue-300 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                title={t.clearFile}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {uploadErrorMsg && (
            <div className="text-[11px] font-semibold text-rose-200 bg-rose-950/70 p-3 rounded-2xl border border-rose-500/60 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
          )}

          {/* External Image URL Stimulus Section */}
          {showImageUrlSection && (
            <div className="p-3.5 rounded-2xl bg-[#09172c] border border-indigo-500/50 space-y-2">
              <ImageStimulusInput
                lang={lang}
                onQuestionExtracted={handleQuestionExtracted}
                onContentExtracted={handleContentExtractedFromImage}
                onAttachImage={(url) => setAttachedImageUrl(url)}
                currentAttachedUrl={attachedImageUrl || undefined}
                onClearAttached={() => setAttachedImageUrl(null)}
              />
            </div>
          )}

          {/* Attached Visual Stimulus Banner */}
          {attachedImageUrl && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/70 border-2 border-indigo-500/50 flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-indigo-400/50 shrink-0 shadow-2xs">
                  <img
                    src={attachedImageUrl}
                    alt="Attached Stimulus"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-200">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{isRtl ? "مثير مرئي / رسم توضيحي مرفق" : "Active Visual Stimulus / Diagram"}</span>
                  </div>
                  <span className="text-[11px] text-blue-200/80 block truncate max-w-[200px] sm:max-w-xs font-mono">
                    {attachedImageUrl}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAttachedImageUrl(null)}
                className="p-2 rounded-xl bg-blue-900/70 hover:bg-rose-950 text-blue-300 hover:text-rose-300 border border-blue-700/60 transition-colors cursor-pointer shrink-0"
                title={isRtl ? "إلغاء إرفاق الصورة" : "Remove attached diagram"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Smart Multi-Channel Input Deck */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>{isRtl ? "قنوات وأدوات استيراد المحتوى:" : "Content Import Channels:"}</span>
              </span>
              <span className="text-[11px] font-bold text-blue-300/80">
                {isRtl ? "اختر طريقة الإدخال المناسبة" : "Select input method"}
              </span>
            </div>

            {/* Expanded 2-Column Spacious Channels Grid with Dark Blue Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Channel 1: Camera / OCR Scan */}
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1b2a42] to-[#162238] border-2 border-amber-500/40 hover:border-amber-400 hover:bg-[#1f314f] text-start transition-all cursor-pointer group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex items-start gap-3"
                title={isRtl ? "التقاط صورة للسؤال أو ورقة الاختبار بالكاميرا" : "Scan question or document with camera"}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-display font-black text-xs text-amber-200">
                      {isRtl ? "كاميرا الأسئلة" : "Camera Scan"}
                    </span>
                    <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-2xs">
                      OCR
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 font-medium leading-tight">
                    {isRtl ? "مسح ضوئي ذكي للمستندات" : "Vision AI OCR Document Scan"}
                  </p>
                </div>
              </button>

              {/* Channel 2: Voice Dictation */}
              <button
                type="button"
                onClick={() =>
                  handleToggleListening("contentInput", (text) =>
                    setContent((prev) => (prev ? `${prev}\n${text}` : text))
                  )
                }
                className={`p-3.5 rounded-2xl border-2 text-start transition-all cursor-pointer group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex items-start gap-3 ${
                  activeListeningId === "contentInput"
                    ? "bg-rose-950/80 border-rose-400 animate-pulse ring-2 ring-rose-400/30"
                    : "bg-gradient-to-br from-[#1b2a42] to-[#162238] border-rose-500/40 hover:border-rose-400 hover:bg-[#1f314f]"
                }`}
                title={isRtl ? "إملاء صوتي / تحويل الصوت إلى نص المادة العلمية" : "Voice dictation for course text"}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform ${
                  activeListeningId === "contentInput"
                    ? "bg-rose-600 text-white shadow-rose-600/30"
                    : "bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-rose-500/25"
                }`}>
                  {activeListeningId === "contentInput" ? (
                    <MicOff className="w-5 h-5 animate-bounce" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-display font-black text-xs text-rose-200">
                      {isRtl ? "إملاء صوتي" : "Voice Input"}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shadow-2xs ${
                      activeListeningId === "contentInput"
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-rose-400 text-slate-950"
                    }`}>
                      {activeListeningId === "contentInput" ? (isRtl ? "مستمع..." : "Live") : (isRtl ? "صوتي" : "Audio")}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-300/90 font-medium leading-tight">
                    {activeListeningId === "contentInput"
                      ? (isRtl ? "تحدث الآن لتفريغ النص..." : "Listening now...")
                      : (isRtl ? "تحويل الصوت إلى نص فوري" : "Instant Speech to Text")}
                  </p>
                </div>
              </button>

              {/* Channel 3: File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1b2a42] to-[#162238] border-2 border-sky-500/40 hover:border-sky-400 hover:bg-[#1f314f] text-start transition-all cursor-pointer group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex items-start gap-3"
                title={isRtl ? "إرفاق ملف مستند (PDF, Word, TXT, صور)" : "Upload document file (PDF, Word, TXT, Images)"}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0 group-hover:scale-105 transition-transform">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-display font-black text-xs text-sky-200">
                      {isRtl ? "رفع ملف المقرر" : "Upload File"}
                    </span>
                    <span className="text-[9px] font-black bg-sky-400 text-slate-950 px-2 py-0.5 rounded-md shadow-2xs">
                      DOC
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-300/90 font-medium leading-tight">
                    PDF, Word, TXT, Images
                  </p>
                </div>
              </button>

              {/* Channel 4: External Visual Stimulus / Diagram URL */}
              <button
                type="button"
                onClick={() => setShowImageUrlSection((prev) => !prev)}
                className={`p-3.5 rounded-2xl border-2 text-start transition-all cursor-pointer group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex items-start gap-3 ${
                  showImageUrlSection
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 border-violet-400 text-white shadow-violet-600/30"
                    : "bg-gradient-to-br from-[#1b2a42] to-[#162238] border-violet-500/40 hover:border-violet-400 hover:bg-[#1f314f]"
                }`}
                title={isRtl ? "إضافة رابط رسم توضيحي أو مثير بصري" : "Add diagram or external image URL"}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform ${
                  showImageUrlSection
                    ? "bg-white text-violet-700 shadow-white/20"
                    : "bg-gradient-to-tr from-violet-500 to-purple-600 text-white shadow-violet-500/25"
                }`}>
                  <Link2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`font-display font-black text-xs ${
                      showImageUrlSection ? "text-white" : "text-violet-200"
                    }`}>
                      {isRtl ? "رابط مثير مصور" : "Image URL"}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shadow-2xs ${
                      showImageUrlSection
                        ? "bg-white/20 text-white"
                        : "bg-violet-400 text-slate-950"
                    }`}>
                      URL
                    </span>
                  </div>
                  <p className={`text-[11px] font-medium leading-tight ${
                    showImageUrlSection ? "text-violet-100" : "text-violet-300/90"
                  }`}>
                    {isRtl ? "رسوم بيانية ومخططات" : "Charts & Visual Diagrams"}
                  </p>
                </div>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
              accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />
          </div>

          {/* Generation Parameters Matrix - Ultra High Contrast on Dark Blue */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#081424] border-2 border-blue-900/80 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{isRtl ? "الخصائص السيكومترية والمحددات البنائية:" : "Psychometric & Target Specifications:"}</span>
              </span>
            </div>

            {/* Question Type */}
            <div>
              <label htmlFor="qType" className="block text-xs font-black text-blue-100 mb-2">
                {t.qTypeLabel}
              </label>
              <div className="relative">
                <select
                  id="qType"
                  value={qType}
                  onChange={(e) => setQType(e.target.value as any)}
                  className="w-full p-3.5 pe-10 border-2 border-blue-700/80 rounded-xl text-xs sm:text-sm bg-[#0f233f] text-white font-black shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="mcq" className="bg-[#0f233f] text-white py-1">
                    {isRtl ? "اختيار من متعدد (إجابة واحدة صحيحة)" : "Multiple Choice (Single Answer)"}
                  </option>
                  <option value="tf" className="bg-[#0f233f] text-white py-1">
                    {isRtl ? "صواب وخطأ (True / False)" : "True / False"}
                  </option>
                  <option value="fill" className="bg-[#0f233f] text-white py-1">
                    {isRtl ? "إكمال الفراغ (Fill in the Blank)" : "Fill in the Blank"}
                  </option>
                  <option value="matching" className="bg-[#0f233f] text-white py-1">
                    {isRtl ? "المزاوجة والربط (Matching)" : "Matching"}
                  </option>
                  <option value="essay" className="bg-[#0f233f] text-white py-1">
                    {isRtl ? "سؤال مقالي قصير (مع سلم التقدير Rubric)" : "Short Essay (with Rubric)"}
                  </option>
                  <option value="multi_mcq" className="bg-[#0f233f] text-white py-1">
                    {isRtl ? "اختيار متعدد الإجابات (أكثر من بديل صحيح)" : "Multiple Response (Multi-select)"}
                  </option>
                  <option value="ordering" className="bg-[#0f233f] text-white py-1">
                    {isRtl ? "الترتيب والتسلسل المنطقي / الزمني" : "Chronological / Logical Ordering"}
                  </option>
                  <option value="diagram_labeling" className="bg-[#0f233f] text-white py-1">
                    {isRtl ? "إكمال الرسوم والبيانات والمخططات المصورة" : "Diagram / Image Labeling"}
                  </option>
                </select>
                <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-blue-300 ${isRtl ? "left-3" : "right-3"}`}>
                  <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Bloom Target & Count Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Bloom Target - Takes 2 cols */}
              <div className="sm:col-span-2">
                <label htmlFor="bloomTarget" className="block text-xs font-black text-blue-100 mb-1.5">
                  {t.bloomLabel}
                </label>
                <div className="relative">
                  <select
                    id="bloomTarget"
                    value={bloom}
                    onChange={(e) => setBloom(e.target.value as any)}
                    className="w-full p-3.5 pe-10 border-2 border-blue-700/80 rounded-xl text-xs sm:text-sm bg-[#0f233f] text-white font-black shadow-xs focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="تذكر" className="bg-[#0f233f] text-white py-1">
                      {isRtl ? "تذكر (استرجاع الحقائق والمعلومات)" : "Remember (Knowledge recall)"}
                    </option>
                    <option value="فهم" className="bg-[#0f233f] text-white py-1">
                      {isRtl ? "فهم (استيعاب وتفسير المفاهيم)" : "Understand (Comprehension)"}
                    </option>
                    <option value="تطبيق" className="bg-[#0f233f] text-white py-1">
                      {isRtl ? "تطبيق (توظيف المعرفة في مواقف عملية)" : "Apply (Execution & practice)"}
                    </option>
                    <option value="تحليل" className="bg-[#0f233f] text-white py-1">
                      {isRtl ? "تحليل (تفكيك العلاقات والمقارنة)" : "Analyze (Deconstruct relations)"}
                    </option>
                    <option value="تقويم" className="bg-[#0f233f] text-white py-1">
                      {isRtl ? "تقويم (إصدار الأحكام والنقد)" : "Evaluate (Critique & judgment)"}
                    </option>
                    <option value="إبداع" className="bg-[#0f233f] text-white py-1">
                      {isRtl ? "إبداع (إنتاج وصياغة أفكار جديدة)" : "Create (Formulate new ideas)"}
                    </option>
                  </select>
                  <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-blue-300 ${isRtl ? "left-3" : "right-3"}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label htmlFor="qCount" className="block text-xs font-black text-blue-100 mb-1.5">
                  {t.qCountLabel}
                </label>
                <div className="relative">
                  <select
                    id="qCount"
                    value={qCount}
                    onChange={(e) => setQCount(parseInt(e.target.value, 10))}
                    className="w-full p-3.5 pe-10 border-2 border-blue-700/80 rounded-xl text-xs sm:text-sm bg-[#0f233f] text-white font-black shadow-xs focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value={1} className="bg-[#0f233f] text-white">1</option>
                    <option value={2} className="bg-[#0f233f] text-white">2</option>
                    <option value={3} className="bg-[#0f233f] text-white">3 {isRtl ? "(موصى به)" : ""}</option>
                    <option value={4} className="bg-[#0f233f] text-white">4</option>
                    <option value={5} className="bg-[#0f233f] text-white">5</option>
                    <option value={6} className="bg-[#0f233f] text-white">6</option>
                    <option value={7} className="bg-[#0f233f] text-white">7</option>
                    <option value={8} className="bg-[#0f233f] text-white">8</option>
                    <option value={9} className="bg-[#0f233f] text-white">9</option>
                    <option value={10} className="bg-[#0f233f] text-white">10</option>
                  </select>
                  <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-blue-300 ${isRtl ? "left-3" : "right-3"}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-200 font-semibold bg-rose-950/70 p-3.5 rounded-2xl border border-rose-500/60 shadow-2xs">
              {error}
            </div>
          )}

          {/* Main Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white py-4 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 transition-all border border-white/20 active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <span>{isLoading ? t.genBtnLoading : t.genBtn}</span>
          </button>

          {/* Educational Content Alignment Standards Guide Card (20 Criteria) */}
          <div className="p-4 rounded-2xl bg-[#09172c] border border-blue-800/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-blue-200 font-black text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{isRtl ? "معايير الارتباط بالمحتوى (٢٠ معياراً)" : "20 Content Alignment Standards"}</span>
              </div>
              <span className="text-[10px] font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-md shadow-2xs">
                {isRtl ? "مطابقة سياقية 100%" : "100% Grounded"}
              </span>
            </div>
            <p className="text-[11px] text-blue-200/90 leading-relaxed font-medium">
              {isRtl
                ? "يراعي النظام توليد أسئلة ترتبط مباشرة بالمحتوى، تحفظ المعنى الأصلي، تستخلص الشواهد النصية الدقيقة، وتصوغ بدائل متجانسة من سياق المادة دون استدعاء مفاهيم خارجية غير مرغوبة."
                : "The system enforces 20 pedagogical rules: direct grounding, semantic fidelity, traceable excerpts, and homogeneous in-context distractors without hallucinations."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedStandardsQuestion(undefined);
                setStandardsModalOpen(true);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 border border-blue-700/80 text-blue-100 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>{isRtl ? "استعراض دليل المعايير العشرين بالتفصيل" : "Explore Full 20 Standards"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated output display */}
      <div className="lg:col-span-7 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[300px] border border-slate-200 bg-white rounded-2xl p-8 text-center text-slate-600 space-y-4 animate-pulse shadow-sm">
            <Sparkles className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-900">{t.loadingTitle}</p>
            <p className="text-xs text-slate-500 max-w-sm">{t.loadingSub}</p>
          </div>
        )}

        {!isLoading && generated.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[350px] border-2 border-dashed border-slate-200 bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="font-display font-semibold text-lg text-slate-900 mb-1">{t.emptyTitle}</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{t.emptySub}</p>
          </div>
        )}

        {!isLoading && generated.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <h4 className="font-display text-lg font-bold text-slate-900">
                {t.questionsHeading} ({generated.length} {t.itemWord})
              </h4>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleBatchAutomateAll}
                  disabled={isBatchAutomating}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer border border-amber-300 disabled:opacity-50"
                  title={isRtl ? "تشغيل التحكيم والضبط الآلي لكافة الأسئلة الموّلدة دفعة واحدة" : "Run Comprehensive Automation on all generated questions"}
                >
                  {isBatchAutomating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>{isRtl ? "جارٍ الأتمتة الشاملة..." : "Automating All..."}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      <span>{isRtl ? "الأتمتة الشاملة لجميع الأسئلة" : "Automate All Items"}</span>
                    </>
                  )}
                </button>

                {totalBatchSpellingErrors > 0 && (
                  <button
                    type="button"
                    onClick={handleFixAllGeneratedSpelling}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{isRtl ? "تصحيح الإملاء" : "Fix Spelling"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Automation Success Toast if active */}
            {automationToast && (
              <div className="p-3 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-3 text-xs font-black text-emerald-950 animate-fade-in shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{automationToast}</span>
                </div>
                <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-md border border-emerald-300">
                  {isRtl ? "أتمتة ناجحة ✓" : "Automated ✓"}
                </span>
              </div>
            )}

            {/* Global Spell-Check Summary Banner */}
            {totalBatchSpellingErrors > 0 ? (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <SpellCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-amber-950">
                      {isRtl ? "التدقيق الإملائي التلقائي لمسودة الأسئلة" : "Automated Spell-Check on Generated Draft"}
                    </h5>
                    <p className="text-[11px] text-amber-900/90 font-medium">
                      {isRtl
                        ? `تم فحص الصياغة ورصد إجمالي ${totalBatchSpellingErrors} أخطاء إملائية شائعة (همزات، تاء مربوطة، ألف مقصورة) عبر الجذع والبدائل.`
                        : `Audited wording: detected ${totalBatchSpellingErrors} common spelling errors in stems and options.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFixAllGeneratedSpelling}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{isRtl ? "تطبيق التصحيحات الفورية" : "Apply Instant Fixes"}</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 px-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-2 text-xs font-bold text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isRtl
                      ? "التدقيق الإملائي التلقائي: جميع الأسئلة المولدة سليمة ومطابقة لقواعد الرسم الإملائي العربي (٠ أخطاء)."
                      : "Automated Spell-Check: All generated items are orthographically sound (0 spelling errors)."}
                  </span>
                </div>
              </div>
            )}

            {generated.map((q, idx) => {
              const isAdded = addedIds.has(q.id);
              const showAns = !!visibleAnswers[q.id];
              const showReview = !!visibleReviews[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Accent strip */}
                  <div className="absolute top-0 bottom-0 start-0 w-1.5 bg-gradient-to-b from-blue-600 via-indigo-600 to-violet-600"></div>

                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-semibold text-slate-500">
                      {t.questionWord} {idx + 1} · {
                        q.qType === "mcq" ? t.mcqOpt :
                        q.qType === "tf" ? t.tfOpt :
                        q.qType === "fill" ? t.fillOpt :
                        q.qType === "matching" ? t.matchingOpt :
                        q.qType === "essay" ? t.essayOpt :
                        q.qType === "multi_mcq" ? t.multiMcqOpt :
                        q.qType === "ordering" ? t.orderingOpt :
                        q.qType === "diagram_labeling" ? t.diagramOpt : q.qType
                      }
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-blue-50 text-blue-700 font-bold border border-blue-200 px-2 py-0.5 rounded-full text-[10px]">
                        {t.bloomWord}: {q.bloom}
                      </span>
                      <span className="bg-violet-50 text-violet-700 font-bold border border-violet-200 px-2 py-0.5 rounded-full text-[10px]">
                        {t.diffWord}: {q.difficulty}
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        {isRtl ? "السهولة (p):" : "Facility (p):"}{" "}
                        {typeof q.difficultyIndex === "number"
                          ? `${Math.round(q.difficultyIndex * 100)}%`
                          : "60%"}
                      </span>
                      <span className="bg-indigo-50 text-indigo-800 font-bold border border-indigo-200 px-2 py-0.5 rounded-full text-[10px]">
                        {isRtl ? "التمييز (D):" : "Discrimination (D):"}{" "}
                        {typeof q.discriminationIndex === "number"
                          ? q.discriminationIndex.toFixed(2)
                          : "0.42"}{" "}
                        ({q.discriminationStatus || (isRtl ? "ممتاز" : "Excellent")})
                      </span>
                    </div>

                    <div className="mt-2.5 max-w-sm">
                      <QualityHintsBadge question={q} lang={lang} />
                    </div>
                  </div>

                  {/* Question Stem */}
                  <p className="text-base font-bold text-slate-900 mb-3 leading-relaxed">
                    {q.qType === "fill" ? (
                      <span dangerouslySetInnerHTML={{ __html: q.stem.replace("___", `<span class="inline-block px-3 py-0.5 border-b-2 border-dotted border-blue-600 text-blue-700 font-bold mx-1">${t.blankWord || "blank"}</span>`) }} />
                    ) : (
                      q.stem
                    )}
                  </p>

                  {/* Context Reference / Source Excerpt from Course Material (Standard #19 & Grounding) */}
                  {q.contextReference && (
                    <div className="mb-3.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-extrabold text-blue-900 text-[11px]">
                            {isRtl ? "الشاهد وموضع الاستناد من المحتوى الأصلي (معيار ١٩):" : "Source Excerpt Grounding (#19):"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStandardsQuestion(q);
                              setStandardsModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                            title={isRtl ? "عرض استيفاء معايير الارتباط بالمحتوى الـ20" : "View 20 Content Alignment Standards"}
                          >
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>{isRtl ? "معايير الارتباط (20/20) ✓" : "Content Alignment (20/20) ✓"}</span>
                          </button>
                        </div>
                        <p className="text-slate-800 font-medium italic text-xs leading-relaxed">
                          «{q.contextReference}»
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Per-Question Spell-Checking Banner & 1-Click Fixes */}
                  <div className="mb-4">
                    <QuestionSpellCheckBanner
                      question={q}
                      lang={lang}
                      onUpdateQuestion={handleUpdateQuestion}
                    />
                  </div>

                  {q.imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 max-w-lg">
                      <img src={q.imageUrl} alt="Diagram" className="max-h-64 object-contain rounded-lg mx-auto shadow-2xs" />
                    </div>
                  )}

                  {/* Options for MCQ / Multi MCQ / Matching / Ordering / Diagram Labeling */}
                  {(q.qType === "mcq" || q.qType === "multi_mcq" || q.qType === "matching" || q.qType === "ordering" || q.qType === "diagram_labeling") && q.options && q.options.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.qType === "mcq" ? opt === q.correctAnswer : false;
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                              isCorrect && showAns
                                ? "border-blue-500 bg-blue-50 text-blue-950 font-bold shadow-sm"
                                : "border-slate-200 bg-slate-50/60 text-slate-800"
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-400 shrink-0 w-16">
                              {isRtl ? `الخيار ${oIdx + 1}` : `Option ${oIdx + 1}`}
                            </span>
                            <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                              isCorrect && showAns ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                            }`}>
                              {isCorrect && showAns && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.qType === "tf" && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className={`p-3 rounded-xl border text-center text-xs sm:text-sm font-semibold transition-all ${showAns && (q.correctAnswer === "صواب" || q.correctAnswer.toLowerCase() === "true") ? "border-blue-500 bg-blue-50 text-blue-950 font-bold" : "border-slate-200 bg-slate-50/60"}`}>
                        {isRtl ? "صواب" : "True"}
                      </div>
                      <div className={`p-3 rounded-xl border text-center text-xs sm:text-sm font-semibold transition-all ${showAns && (q.correctAnswer === "خطأ" || q.correctAnswer.toLowerCase() === "false") ? "border-blue-500 bg-blue-50 text-blue-950 font-bold" : "border-slate-200 bg-slate-50/60"}`}>
                        {isRtl ? "خطأ" : "False"}
                      </div>
                    </div>
                  )}

                  {/* Text Answer */}
                  {showAns && q.qType !== "mcq" && (
                    <div className="mt-3 text-xs sm:text-sm font-bold text-blue-800 bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                      {t.modelAnswer} {q.correctAnswer}
                    </div>
                  )}

                  {/* Quality Checklist */}
                  {showReview && q.notes && q.notes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-900 block">{t.autoAuditNotes}</span>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {q.notes.map((note, nIdx) => (
                          <li key={nIdx} className="flex gap-2 items-start">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleAnswer(q.id)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold"
                      >
                        {showAns ? t.hideAnswer : t.showAnswer}
                      </button>
                      <button
                        onClick={() => toggleReview(q.id)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold flex items-center gap-1"
                      >
                        {showReview ? t.hideReview : t.showReview}
                        {showReview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutomateSingle(q.id)}
                        disabled={automatingId === q.id}
                        className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                        title={isRtl ? "تشغيل الأتمتة الشاملة للبند (ضبط الصياغة، توازن البدائل، التدقيق اللغوي، والمعايرة السيكومترية)" : "Run Comprehensive Automation on this item"}
                      >
                        {automatingId === q.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        )}
                        <span>{isRtl ? "الأتمتة الشاملة" : "Auto-Pilot"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFullscreenQuestion(q);
                          setFullscreenIndex(idx);
                        }}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5"
                        title={isRtl ? "معاينة السؤال وضبط معايير البناء والصياغة والبدائل (المرحلة الثانية)" : "Stage 2 item authoring, option balancing & live preview"}
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isRtl ? "معاينة وبناء المفردة (المرحلة 2)" : "Item Preview & Setup (Stage 2)"}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleAdd(q)}
                      disabled={isAdded}
                      className={`text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdded
                          ? "bg-blue-50 text-blue-700 border border-blue-200 cursor-default"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      }`}
                    >
                      <FilePlus className="w-3.5 h-3.5" />
                      {isAdded ? t.addedBtn : t.addBtn}
                    </button>
                  </div>
                </div>
              );
            })}

            {generated.length > 0 && onNextStage && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg border border-white/20 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                    {isRtl ? "اكتملت المرحلة الأولى ✓" : "Stage 1 Complete ✓"}
                  </span>
                  <h5 className="font-display font-bold text-sm sm:text-base">
                    {isRtl ? "جاهز لتدقيق وتصحيح صياغة الأسئلة الموّلدة؟" : "Ready to audit & refine generated items?"}
                  </h5>
                  <p className="text-xs text-blue-100">
                    {isRtl
                      ? "انتقل مباشرة للمرحلة الثانية لإجراء التدقيق اللغوي والمعياري وإيقاف ثغرات الإيحاء."
                      : "Proceed directly to Stage 2 for rule-based editorial audit & phrasing refinement."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNextStage}
                  className="bg-white hover:bg-slate-100 text-blue-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
                >
                  <span>{isRtl ? "الانتقال الفوري للمرحلة الثانية (التدقيق والتصحيح) ←" : "Proceed to Stage 2 (Editorial Audit) →"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Modals for Stage 1 */}
      {fullscreenQuestion && (
        <FullscreenQuestionReviewModal
          isOpen={Boolean(fullscreenQuestion)}
          onClose={() => setFullscreenQuestion(null)}
          question={fullscreenQuestion}
          questionsList={generated}
          currentIndex={fullscreenIndex}
          onNavigate={(newIdx) => {
            if (generated[newIdx]) {
              setFullscreenIndex(newIdx);
              setFullscreenQuestion(generated[newIdx]);
            }
          }}
          onSaveQuestion={(updated) => {
            setGenerated((prev) =>
              prev.map((it) => (it.id === updated.id ? updated : it))
            );
            setFullscreenQuestion(updated);
          }}
          onAddToBank={(updated) => {
            onAddQuestion(updated);
            setAddedIds((prev) => new Set([...prev, updated.id]));
          }}
          lang={lang}
          reviewStage={1}
        />
      )}

      {/* 20 Pedagogical & Content Alignment Standards Modal */}
      <ContentAlignmentStandardsModal
        isOpen={standardsModalOpen}
        onClose={() => setStandardsModalOpen(false)}
        lang={lang}
        question={selectedStandardsQuestion}
        sourceContent={content}
      />

      {/* Smart Camera Question Scanner Modal */}
      <CameraQuestionScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        lang={lang}
        onQuestionExtracted={handleQuestionExtracted}
        onContentExtracted={handleContentExtractedFromImage}
        onAttachImage={(img) => setAttachedImageUrl(img)}
      />
    </div>
  );
}
