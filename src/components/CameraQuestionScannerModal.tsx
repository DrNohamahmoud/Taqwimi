import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  X,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FlipHorizontal,
  Upload,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  Zap,
} from "lucide-react";
import { Question } from "../types";
import { Language } from "../translations";

interface CameraQuestionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onQuestionExtracted: (q: Question) => void;
  onContentExtracted?: (text: string) => void;
  onAttachImage?: (imageDataUrl: string) => void;
}

export default function CameraQuestionScannerModal({
  isOpen,
  onClose,
  lang,
  onQuestionExtracted,
  onContentExtracted,
  onAttachImage,
}: CameraQuestionScannerModalProps) {
  const isRtl = lang === "ar";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisMode, setAnalysisMode] = useState<"question" | "content">("question");
  const [extractedQuestion, setExtractedQuestion] = useState<Question | null>(null);
  const [diagramExplanation, setDiagramExplanation] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          isRtl
            ? "متصفحك لا يدعم الوصول المباشر لكاميرا الويب. يمكنك رفع صورة للسؤال من جهازك."
            : "Camera access is not supported on this browser. You can upload an image file instead."
        );
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Camera init error:", err);
      let msg = isRtl
        ? "تعذر تشغيل الكاميرا. يرجى منح إذن الوصول للكاميرا في إعدادات المتصفح أو رفع صورة مباشرة."
        : "Could not access camera. Please allow camera permissions or upload an image.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = isRtl
          ? "تم رفض إذن الوصول للكاميرا. يرجى تفعيل إذن الكاميرا لتقويمي في شريط عنوان المتصفح."
          : "Camera permission was denied. Please allow camera permissions in your browser.";
      }
      setCameraError(msg);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedQuestion(null);
    setDiagramExplanation(null);
    setErrorMessage(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        setCameraError(null);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async (mode: "question" | "content") => {
    if (!capturedImage) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisMode(mode);

    try {
      const res = await fetch("/api/analyze-question-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: capturedImage,
          mimeType: "image/jpeg",
          lang,
          mode: mode === "content" ? "extract_content" : "parse_question",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل تحليل الصورة" : "Failed to analyze image"));
      }

      if (mode === "content") {
        if (data.extractedText && onContentExtracted) {
          onContentExtracted(data.extractedText);
          onClose();
        } else {
          throw new Error(isRtl ? "لم يتم استخراج نص من الصورة" : "No text found in image");
        }
      } else {
        if (data.question) {
          setExtractedQuestion(data.question);
          setDiagramExplanation(data.diagramExplanation || null);
        } else {
          throw new Error(isRtl ? "تعذر استخراج بيانات السؤال" : "Could not extract question structure");
        }
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      setErrorMessage(err.message || (isRtl ? "حدث خطأ أثناء تحليل الصورة" : "Error analyzing image"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveExtractedQuestion = () => {
    if (extractedQuestion) {
      onQuestionExtracted(extractedQuestion);
      onClose();
    }
  };

  const handleAttachAsFigure = () => {
    if (capturedImage && onAttachImage) {
      onAttachImage(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between border-b border-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-300 border border-white/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg">
                {isRtl ? "ماسح الكاميرا الذكي لالتقاط وتحليل الأسئلة" : "Smart Camera Question Scanner"}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                {isRtl
                  ? "التقط صورة لورقة امتحان أو رسم توضيحي أو سبورة ليقوم الذكاء الاصطناعي بتحليلها فورياً"
                  : "Capture a test paper, diagram, or textbook question for instant AI analysis"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-xs sm:text-sm font-bold">{errorMessage}</p>
            </div>
          )}

          {/* Viewfinder / Capture Canvas */}
          {!capturedImage ? (
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-700 aspect-video max-h-[420px] flex items-center justify-center shadow-inner">
              {isInitializing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  <span className="text-xs font-bold">
                    {isRtl ? "جارٍ تفعيل الكاميرا..." : "Starting camera..."}
                  </span>
                </div>
              )}

              {cameraError ? (
                <div className="p-6 text-center space-y-4 max-w-md">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {isRtl ? "تعذر تشغيل الكاميرا المباشرة" : "Camera Access Unavailable"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isRtl ? "إعادة المحاولة" : "Retry"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isRtl ? "رفع صورة من الجهاز" : "Upload File"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Optical Document Scanner Guides */}
                  <div className="absolute inset-4 sm:inset-8 pointer-events-none border-2 border-dashed border-white/60 rounded-2xl flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                      <div className="w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                      <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold border border-white/20">
                        {isRtl ? "وجّه الكاميرا نحو السؤال أو ورقة الاختبار" : "Align question inside the frame"}
                      </div>
                      <div className="w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                      <div className="w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                    </div>
                  </div>

                  {/* Floating Camera Controls */}
                  <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-4 px-4">
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      title={isRtl ? "تبديل الكاميرا (الأمامية / الخلفية)" : "Flip camera"}
                      className="w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-lg"
                    >
                      <FlipHorizontal className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-xl transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer border-2 border-amber-300"
                    >
                      <Camera className="w-5 h-5 text-slate-950" />
                      <span>{isRtl ? "التقاط الصورة الآن" : "Capture Snapshot"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title={isRtl ? "اختيار صورة من جهازك" : "Upload image file"}
                      className="w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-lg"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Post-Capture Review & Analysis Workspace */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Captured Image Preview Column */}
                <div className="md:col-span-5 space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-slate-950 shadow-md aspect-video md:aspect-4/3 flex items-center justify-center">
                    <img
                      src={capturedImage}
                      alt="Captured Question"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold">
                      {isRtl ? "الصورة الملتقطة" : "Captured Photo"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isRtl ? "إعادة التقاط" : "Retake"}</span>
                    </button>

                    {onAttachImage && (
                      <button
                        type="button"
                        onClick={handleAttachAsFigure}
                        className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300 dark:border-emerald-700 transition-colors cursor-pointer"
                        title={isRtl ? "استخدام كصورة توضيحية للسؤال" : "Attach as figure"}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{isRtl ? "إرفاق كرسم" : "Attach"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Analysis Triggers & Results Column */}
                <div className="md:col-span-7 space-y-4">
                  {!extractedQuestion ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/80 to-slate-50 border-2 border-indigo-200 dark:bg-slate-800 dark:border-slate-700 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-display font-black text-sm sm:text-base">
                          {isRtl ? "اختر نوع التحليل المطلوب بواسطة Gemini Vision:" : "Select Analysis Action:"}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          disabled={isAnalyzing}
                          onClick={() => handleAnalyzeImage("question")}
                          className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm text-start flex items-center justify-between gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-300" />
                              <span className="font-black text-sm">
                                {isRtl
                                  ? "تحليل واستخراج السؤال سيكومترياً (OCR & Question Item)"
                                  : "Extract & Structure Complete Question"}
                              </span>
                            </div>
                            <p className="text-[11px] text-blue-100 font-normal leading-relaxed">
                              {isRtl
                                ? "استخراج الجذع، الخيارات، مفتاح الإجابة، تصنيف بلوم، ومعاملات الصعوبة والتمييز"
                                : "Extracts stem, choices, answer key, bloom level, and psychometrics"}
                            </p>
                          </div>
                          {isAnalyzing && analysisMode === "question" ? (
                            <Loader2 className="w-5 h-5 animate-spin text-white shrink-0" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isAnalyzing}
                          onClick={() => handleAnalyzeImage("content")}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs text-start flex items-center justify-between gap-3 border-2 border-slate-300 dark:border-slate-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="font-bold text-xs">
                                {isRtl
                                  ? "استخراج كامل النص الأكاديمي كمحتوى علمي للتوليد"
                                  : "Extract Academic Text into Content Box"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                              {isRtl
                                ? "يضع محتوى الصفحة المصورة مباشرة في صندوق المحتوى لبناء أسئلة جديدة منه"
                                : "Puts extracted text in the content box for generating fresh questions"}
                            </p>
                          </div>
                          {isAnalyzing && analysisMode === "content" ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Structured Question Result Card */
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 shadow-md space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-display font-black text-sm">
                            {isRtl ? "تم استخراج السؤال وتحكيمه بنجاح!" : "Question Extracted & Certified!"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 text-[11px] font-black">
                            {extractedQuestion.bloom}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-[11px] font-black">
                            {extractedQuestion.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Question Stem */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {isRtl ? "متن السؤال (الجذع):" : "Question Stem:"}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          {extractedQuestion.stem}
                        </p>
                      </div>

                      {/* Options / Answer */}
                      {extractedQuestion.options && extractedQuestion.options.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            {isRtl ? "البدائل ومفتاح الإجابة:" : "Options & Answer Key:"}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {extractedQuestion.options.map((opt, idx) => {
                              const isKey =
                                opt === extractedQuestion.correctAnswer ||
                                (extractedQuestion.correctAnswer &&
                                  opt.includes(extractedQuestion.correctAnswer));
                              return (
                                <div
                                  key={idx}
                                  className={`p-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                                    isKey
                                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                      isKey
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span className="truncate">{opt}</span>
                                  {isKey && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ms-auto" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            {isRtl ? "الإجابة النموذجية:" : "Model Answer:"}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            {extractedQuestion.correctAnswer}
                          </span>
                        </div>
                      )}

                      {diagramExplanation && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                          <span className="font-bold block mb-0.5">
                            {isRtl ? "💡 تحليل الرسم والشكل التوضيحي:" : "💡 Visual Diagram Analysis:"}
                          </span>
                          {diagramExplanation}
                        </div>
                      )}

                      {/* Action Approval Buttons */}
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleApproveExtractedQuestion}
                          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>
                            {isRtl ? "اعتماد وإضافة لبنك الأسئلة" : "Approve & Add to Question Bank"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExtractedQuestion(null)}
                          className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
                        >
                          {isRtl ? "تحليل آخر" : "Analyze Another"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas and File Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            {isRtl
              ? "مدعوم بنماذج الرؤية الحاسوبية ومعايير القياس السيكومتري"
              : "Powered by Multimodal Vision & Psychometric Item Analytics"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            {isRtl ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
