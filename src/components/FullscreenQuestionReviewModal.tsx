import React, { useState, useEffect, useRef } from "react";
import {
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  Copy,
  Check,
  Wand2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  SpellCheck,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Sliders,
  BarChart2,
  Target,
  RefreshCw,
  Scale,
  Edit3,
  ListOrdered,
  AlertCircle,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Shuffle,
  ArrowRightLeft,
  AlignLeft,
  ShieldCheck,
  Filter,
  Columns,
  Layout,
  GraduationCap,
  Play,
  FastForward,
  Zap,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  BookmarkCheck,
  Quote,
  FileCheck
} from "lucide-react";
import { Question, RubricCriterion } from "../types";
import { Language, translations } from "../translations";
import { evaluateQuestionQuality, QuestionQualityReport } from "../utils/qualityEvaluator";
import { checkQuestionSpelling, applyAllSpellingFixes, applySingleSpellingFix, SpellCheckIssue } from "../utils/spellChecker";
import {
  auditLinguisticAndOrthographic,
  LinguisticFulfillmentReport,
  LinguisticAxis,
  LinguisticRuleCriterion
} from "../utils/linguisticAuditEngine";
import AiProofreadingUnit from "./AiProofreadingUnit";
import StudentExamPreview from "./StudentExamPreview";
import { ContentAlignmentStandardsModal } from "./ContentAlignmentStandardsModal";
import LinguisticAuditStep from "./review-modal/LinguisticAuditStep";
import StemFormattingStep from "./review-modal/StemFormattingStep";
import OptionsAndKeyStep from "./review-modal/OptionsAndKeyStep";
import PedagogicalStandardsStep from "./review-modal/PedagogicalStandardsStep";
import PsychometricsCalibrationStep from "./review-modal/PsychometricsCalibrationStep";
import BloomTaxonomyStep from "./review-modal/BloomTaxonomyStep";
import AiRefinementsStep from "./review-modal/AiRefinementsStep";
import PreviewAndCertifyStep from "./review-modal/PreviewAndCertifyStep";

interface FullscreenQuestionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  questionsList?: Question[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  onSaveQuestion: (updatedQuestion: Question) => void;
  onAddToBank?: (q: Question) => void;
  lang: Language;
  reviewStage?: 1 | 2 | 3;
}

export default function FullscreenQuestionReviewModal({
  isOpen,
  onClose,
  question,
  questionsList,
  currentIndex = 0,
  onNavigate,
  onSaveQuestion,
  onAddToBank,
  lang,
  reviewStage = 3,
}: FullscreenQuestionReviewModalProps) {
  const isRtl = lang === "ar";

  // Editable local state initialized from current question
  const [editedStem, setEditedStem] = useState(question.stem || "");
  const [editedQType, setEditedQType] = useState<Question["qType"]>(question.qType || "mcq");
  const [editedOptions, setEditedOptions] = useState<string[]>(
    question.options ? [...question.options] : ["", "", "", ""]
  );
  const [editedCorrectAnswer, setEditedCorrectAnswer] = useState(question.correctAnswer || "");
  const [editedImageUrl, setEditedImageUrl] = useState<string>(question.imageUrl || "");
  const [editedBloom, setEditedBloom] = useState<Question["bloom"]>(question.bloom || (isRtl ? "فهم" : ("Understand" as any)));
  const [editedDifficulty, setEditedDifficulty] = useState<Question["difficulty"]>(question.difficulty || (isRtl ? "متوسطة" : ("Moderate" as any)));
  const [editedDiffIndex, setEditedDiffIndex] = useState<number>(
    typeof question.difficultyIndex === "number" ? question.difficultyIndex : 0.6
  );
  const [editedDiscIndex, setEditedDiscIndex] = useState<number>(
    typeof question.discriminationIndex === "number" ? question.discriminationIndex : 0.42
  );
  const [editedRubrics, setEditedRubrics] = useState<RubricCriterion[]>(
    question.rubrics && question.rubrics.length > 0
      ? [...question.rubrics]
      : [
          {
            id: "r-1",
            criterion: isRtl ? "دقة المفاهيم والتعريفات العلمية" : "Scientific Accuracy",
            points: 2,
            description: isRtl ? "ذكر العناصر الجوهرية للمفهوم بدقة واستخدام مصطلحات علمية رصينة." : "Accurate core conceptual elements.",
          },
          {
            id: "r-2",
            criterion: isRtl ? "التعليل المنطقي وربط الأسباب" : "Logical Reasoning",
            points: 2,
            description: isRtl ? "توضيح العلاقة السببية باستدلال سليم وتسلسل أفكار محكم." : "Clear causal justification.",
          },
        ]
  );

  // Matching Specific Helper State
  const [matchingColumnB, setMatchingColumnB] = useState<string[]>([
    isRtl ? "استجابة 1" : "Response 1",
    isRtl ? "استجابة 2" : "Response 2",
    isRtl ? "استجابة 3" : "Response 3",
    isRtl ? "مشتت إضافي (لتقليل التخمين)" : "Distractor (anti-guessing)",
  ]);

  // Workflow Wizard state
  const [workflowMode, setWorkflowMode] = useState<"wizard" | "canvas">("wizard");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Content Alignment & Source Grounding State (20 Pedagogical Standards)
  const [editedContextReference, setEditedContextReference] = useState(question.contextReference || "");
  const [editedContentAlignment, setEditedContentAlignment] = useState<string[]>(
    question.contentAlignment || [
      isRtl ? "الارتباط المباشر بالمحتوى" : "Direct Content Grounding",
      isRtl ? "حفظ المعنى الأصلي" : "Preserving Original Meaning",
    ]
  );
  const [standardsModalOpen, setStandardsModalOpen] = useState<boolean>(false);

  // View Preferences: theme, layout mode, and active side tab
  const [themeMode, setThemeMode] = useState<"light" | "zen" | "dark">("light");
  const [layoutMode, setLayoutMode] = useState<"split" | "wide" | "zen">("split");
  const [activeSideTab, setActiveSideTab] = useState<"linguistic" | "pedagogical" | "ai_assist" | "preview">("linguistic");
  const [linguisticSubMode, setLinguisticSubMode] = useState<"unit" | "criteria">("unit");
  const [activeLinguisticAxisFilter, setActiveLinguisticAxisFilter] = useState<"all" | LinguisticAxis>("all");
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // AI Audit state
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any>(null);
  const [aiAuditError, setAiAuditError] = useState("");

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<any>(null);

  // Synchronize state when question changes
  useEffect(() => {
    if (question) {
      setEditedStem(question.stem || "");
      setEditedQType(question.qType || "mcq");
      setEditedOptions(
        question.options && question.options.length > 0
          ? [...question.options]
          : ["", "", "", ""]
      );
      setEditedCorrectAnswer(question.correctAnswer || "");
      setEditedImageUrl(question.imageUrl || "");
      setEditedBloom(question.bloom || (isRtl ? "فهم" : ("Understand" as any)));
      setEditedDifficulty(question.difficulty || (isRtl ? "متوسطة" : ("Moderate" as any)));
      setEditedDiffIndex(typeof question.difficultyIndex === "number" ? question.difficultyIndex : 0.6);
      setEditedDiscIndex(typeof question.discriminationIndex === "number" ? question.discriminationIndex : 0.42);
      if (question.rubrics && question.rubrics.length > 0) {
        setEditedRubrics([...question.rubrics]);
      }
      setEditedContextReference(question.contextReference || "");
      setEditedContentAlignment(question.contentAlignment || []);
      setAiAuditResult(null);
      setAiAuditError("");
      setCurrentStep(1);
    }
  }, [question, isRtl]);

  // Construct current question snapshot for live quality & linguistic fulfillment evaluation
  const currentSnapshot: Question = {
    ...question,
    stem: editedStem,
    qType: editedQType,
    options:
      editedQType === "mcq" ||
      editedQType === "multi_mcq" ||
      editedQType === "matching" ||
      editedQType === "ordering" ||
      editedQType === "diagram_labeling"
        ? editedOptions
        : undefined,
    correctAnswer: editedCorrectAnswer,
    imageUrl: editedQType === "diagram_labeling" ? editedImageUrl : undefined,
    bloom: editedBloom,
    difficulty: editedDifficulty,
    difficultyIndex: editedDiffIndex,
    discriminationIndex: editedDiscIndex,
    rubrics: editedQType === "essay" ? editedRubrics : undefined,
    contextReference: editedContextReference,
    contentAlignment: editedContentAlignment,
  };

  // Run live evaluations
  const qualityReport: QuestionQualityReport = evaluateQuestionQuality(currentSnapshot, isRtl);
  const spellingReport = checkQuestionSpelling(currentSnapshot, isRtl);
  const linguisticFulfillment: LinguisticFulfillmentReport = auditLinguisticAndOrthographic(
    currentSnapshot,
    isRtl
  );

  // Step Validation Status Checks
  const isStep1Valid = editedStem.trim().length >= 10;
  const isStep2Valid =
    editedQType === "tf"
      ? Boolean(editedCorrectAnswer)
      : editedQType === "essay"
      ? (editedRubrics?.length || 0) >= 1
      : editedQType === "fill"
      ? Boolean(editedCorrectAnswer.trim())
      : editedOptions.filter((o) => o.trim().length > 0).length >= 2 && Boolean(editedCorrectAnswer);
  const isStep3Valid = !spellingReport.hasErrors && linguisticFulfillment.score >= 80;
  const isStep4Valid = Boolean(editedBloom) && typeof editedDiffIndex === "number" && typeof editedDiscIndex === "number";
  const isStep5Valid = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  // Keyboard Shortcuts (Esc to close, Ctrl+S to save, Alt+Left/Right to navigate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      } else if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        if (questionsList && questionsList.length > 1 && onNavigate) {
          const delta = e.key === "ArrowLeft" ? (isRtl ? 1 : -1) : isRtl ? -1 : 1;
          const nextIdx = (currentIndex + delta + questionsList.length) % questionsList.length;
          onNavigate(nextIdx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, questionsList, editedStem, editedOptions, editedCorrectAnswer, isRtl]);

  if (!isOpen) return null;

  // Handle Save
  const handleSave = () => {
    const updated: Question = {
      ...question,
      stem: editedStem.trim(),
      qType: editedQType,
      options:
        editedQType === "mcq" ||
        editedQType === "multi_mcq" ||
        editedQType === "matching" ||
        editedQType === "ordering" ||
        editedQType === "diagram_labeling"
          ? editedOptions.map((o) => o.trim())
          : undefined,
      correctAnswer: editedCorrectAnswer.trim(),
      imageUrl: editedQType === "diagram_labeling" ? editedImageUrl : undefined,
      bloom: editedBloom,
      difficulty: editedDifficulty,
      difficultyIndex: editedDiffIndex,
      discriminationIndex: editedDiscIndex,
      discriminationStatus:
        editedDiscIndex >= 0.4
          ? isRtl ? "ممتاز" : "Excellent"
          : editedDiscIndex >= 0.3
          ? isRtl ? "جيد" : "Good"
          : isRtl ? "يحتاج مراجعة" : "Needs Review",
      rubrics: editedQType === "essay" ? editedRubrics : undefined,
      contextReference: editedContextReference.trim() || undefined,
      contentAlignment: editedContentAlignment && editedContentAlignment.length > 0 ? editedContentAlignment : undefined,
    };

    onSaveQuestion(updated);
    if (onAddToBank) {
      onAddToBank(updated);
    }

    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  // Apply all spelling fixes in one click
  const handleApplyAllSpelling = () => {
    const fixed = applyAllSpellingFixes(currentSnapshot, isRtl);
    setEditedStem(fixed.stem);
    if (fixed.options) setEditedOptions(fixed.options);
    if (fixed.correctAnswer) setEditedCorrectAnswer(fixed.correctAnswer);
  };

  // Automated Stem Optimization
  const handleAutoTuneStem = () => {
    let clean = editedStem
      .replace(/\s+([،,.؟:!])/g, "$1")
      .replace(/([،,.؟:!]){2,}/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    // Ensure proper colon for declarative stems if MCQ
    if (editedQType === "mcq" || editedQType === "multi_mcq") {
      if (!clean.endsWith(":")) {
        clean = clean.replace(/[؟?.!]+$/, "") + " :";
      }
    }
    setEditedStem(clean);
  };

  // Options Distractor Parity & Key Assignment
  const handleAutoBalanceOptions = () => {
    if (editedQType === "mcq" || editedQType === "multi_mcq") {
      let opts = [...editedOptions];
      while (opts.length < 4) {
        opts.push("");
      }
      let key = editedCorrectAnswer;
      if (!key || !opts.includes(key)) {
        key = opts.find((o) => o.trim().length > 0) || opts[0] || "";
      }
      setEditedOptions(opts);
      setEditedCorrectAnswer(key);
    } else if (editedQType === "tf") {
      if (!editedCorrectAnswer) {
        setEditedCorrectAnswer(isRtl ? "صواب" : "True");
      }
    }
  };

  // Automated Psychometric Calibration
  const handleAutoCalibratePsychometrics = () => {
    // Calibrate difficulty based on cognitive level
    if (editedBloom === "تذكر" || editedBloom === "Remember") {
      setEditedDiffIndex(0.75);
      setEditedDiscIndex(0.38);
      setEditedDifficulty(isRtl ? "سهلة" : ("Easy" as any));
    } else if (editedBloom === "فهم" || editedBloom === "تطبيق" || editedBloom === "Understand" || editedBloom === "Apply") {
      setEditedDiffIndex(0.58);
      setEditedDiscIndex(0.46);
      setEditedDifficulty(isRtl ? "متوسطة" : ("Moderate" as any));
    } else {
      setEditedDiffIndex(0.42);
      setEditedDiscIndex(0.52);
      setEditedDifficulty(isRtl ? "صعبة" : ("Hard" as any));
    }
  };

  // Voice dictation toggle
  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        isRtl
          ? "خاصية التعرف الصوتي غير مدعومة في هذا المتصفح. يُوصى بمتصفح Chrome."
          : "Speech recognition not supported in this browser. Please use Chrome."
      );
      return;
    }

    setSpeechError("");
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = lang === "ar" ? "ar-EG" : "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript.trim()) {
          setEditedStem((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };
      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setSpeechError(isRtl ? "صلاحيات الميكروفون مرفوضة." : "Microphone permission denied.");
        }
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Quick insertion helpers for stem
  const handleInsertTag = (tag: string) => {
    setEditedStem((prev) => `${prev} ${tag}`);
  };

  // Trigger AI Audit
  const handleRunAiAudit = async () => {
    setIsAiAuditing(true);
    setAiAuditError("");
    try {
      const res = await fetch("/api/audit-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qType: editedQType,
          stem: editedStem,
          options: editedOptions,
          correctAnswer: editedCorrectAnswer,
          lang,
          stage: "2",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isRtl ? "تعذر التدقيق" : "Audit failed"));
      setAiAuditResult(data);
    } catch (err: any) {
      setAiAuditError(err.message || (isRtl ? "حدث خطأ أثناء التدقيق" : "Error"));
    } finally {
      setIsAiAuditing(false);
    }
  };

  // Adopt AI Audit suggestions
  const handleAdoptAiSuggestions = () => {
    if (!aiAuditResult) return;
    if (aiAuditResult.enhancedStem) setEditedStem(aiAuditResult.enhancedStem);
    if (aiAuditResult.enhancedOptions && aiAuditResult.enhancedOptions.length > 0) {
      setEditedOptions(aiAuditResult.enhancedOptions);
    }
    if (aiAuditResult.enhancedCorrectAnswer) setEditedCorrectAnswer(aiAuditResult.enhancedCorrectAnswer);
    if (aiAuditResult.bloomClassification) {
      setEditedBloom(aiAuditResult.bloomClassification as any);
    }
  };

  // Copy formatted question text
  const handleCopyFormatted = () => {
    let full = `[${editedQType.toUpperCase()}] ${editedStem}\n`;
    if (editedOptions && editedOptions.length > 0) {
      editedOptions.forEach((opt, idx) => {
        const isKey =
          editedQType === "multi_mcq"
            ? editedCorrectAnswer.includes(opt)
            : opt === editedCorrectAnswer;
        const isKeyMarker = isKey ? " (✓ المفتاح الصحيح)" : "";
        full += `  ${String.fromCharCode(65 + idx)}) ${opt}${isKeyMarker}\n`;
      });
    } else {
      full += `  الإجابة النموذجية: ${editedCorrectAnswer}\n`;
    }
    full += `المستوى المعرفي: ${editedBloom} | الصعوبة: ${editedDifficulty}`;
    navigator.clipboard.writeText(full);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Option actions for MCQ / Multi-MCQ / Ordering / Matching
  const handleOptionChange = (idx: number, val: string) => {
    const next = [...editedOptions];
    const prevVal = next[idx];
    next[idx] = val;
    setEditedOptions(next);
    if (editedCorrectAnswer === prevVal) {
      setEditedCorrectAnswer(val);
    } else if (editedQType === "multi_mcq" && editedCorrectAnswer.includes(prevVal)) {
      setEditedCorrectAnswer(
        editedCorrectAnswer
          .split(",")
          .map((s) => s.trim())
          .map((s) => (s === prevVal ? val : s))
          .join(", ")
      );
    }
  };

  const handleAddOption = () => {
    if (editedOptions.length >= 8) return;
    setEditedOptions((prev) => [...prev, ""]);
  };

  const handleRemoveOption = (idx: number) => {
    if (editedOptions.length <= 2) return;
    const toRemove = editedOptions[idx];
    const next = editedOptions.filter((_, i) => i !== idx);
    setEditedOptions(next);
    if (editedCorrectAnswer === toRemove) {
      setEditedCorrectAnswer(next[0] || "");
    }
  };

  const handleMoveOption = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= editedOptions.length) return;
    const next = [...editedOptions];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setEditedOptions(next);
  };

  // Multi-MCQ key toggle
  const handleToggleMultiKey = (optText: string) => {
    const currentKeys = editedCorrectAnswer
      ? editedCorrectAnswer.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    let updatedKeys: string[];
    if (currentKeys.includes(optText)) {
      updatedKeys = currentKeys.filter((k) => k !== optText);
    } else {
      updatedKeys = [...currentKeys, optText];
    }
    setEditedCorrectAnswer(updatedKeys.join(", "));
  };

  // Switch question type safely
  const handleSwitchQType = (newType: Question["qType"]) => {
    setEditedQType(newType);
    if (newType === "tf") {
      if (editedCorrectAnswer !== "صواب" && editedCorrectAnswer !== "خطأ") {
        setEditedCorrectAnswer(isRtl ? "صواب" : "True");
      }
    } else if (newType === "mcq" || newType === "multi_mcq") {
      if (editedOptions.length < 4) {
        setEditedOptions(["", "", "", ""]);
      }
      if (!editedCorrectAnswer && editedOptions[0]) {
        setEditedCorrectAnswer(editedOptions[0]);
      }
    } else if (newType === "ordering") {
      if (editedOptions.length < 3) {
        setEditedOptions([
          isRtl ? "الخطوة الأولى: تحديد الهدف" : "Step 1: Goal setting",
          isRtl ? "الخطوة الثانية: جمع البيانات" : "Step 2: Data collection",
          isRtl ? "الخطوة الثالثة: التحليل والتقويم" : "Step 3: Evaluation",
        ]);
      }
    } else if (newType === "matching") {
      if (editedOptions.length < 3) {
        setEditedOptions([
          isRtl ? "المفهوم أ (الصدق)" : "Concept A (Validity)",
          isRtl ? "المفهوم ب (الثبات)" : "Concept B (Reliability)",
          isRtl ? "المفهوم ج (الموضوعية)" : "Concept C (Objectivity)",
        ]);
      }
    } else if (newType === "diagram_labeling") {
      if (!editedImageUrl) {
        setEditedImageUrl("https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=60");
      }
      if (editedOptions.length < 3) {
        setEditedOptions([
          isRtl ? "1: النواة" : "1: Nucleus",
          isRtl ? "2: الغشاء البلازمي" : "2: Plasma Membrane",
          isRtl ? "3: الميتوكوندريا" : "3: Mitochondria",
        ]);
      }
    }
  };

  // Determine theme styles with high contrast
  const isDark = themeMode === "dark";
  const isZenTheme = themeMode === "zen";

  const containerBg = isDark
    ? "dark bg-slate-950 text-slate-100"
    : isZenTheme
    ? "bg-stone-100 text-stone-900"
    : "bg-slate-100 text-slate-900";

  const cardBg = isDark
    ? "bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-lg"
    : isZenTheme
    ? "bg-white border-2 border-stone-300 text-stone-900 shadow-sm"
    : "bg-white border-2 border-slate-200 text-slate-900 shadow-sm";

  const inputBg = isDark
    ? "bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-900/40"
    : isZenTheme
    ? "bg-white border-2 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
    : "bg-white border-2 border-slate-300 text-slate-950 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100";

  // Filter linguistic criteria
  const filteredLinguisticCriteria = linguisticFulfillment.criteria.filter((c) => {
    if (activeLinguisticAxisFilter === "all") return true;
    return c.axis === activeLinguisticAxisFilter;
  });

  // Steps Definition metadata dynamically configured by review stage
  const STEPS_DATA =
    reviewStage === 1
      ? [
          {
            step: 1 as const,
            id: "pedagogical_standards" as const,
            titleAr: "1. المعايير السياقية والتحكيم التربوي (الـ20)",
            titleEn: "1. 20 Pedagogical & Contextual Standards",
            descAr: "مطابقة معايير القياس الـ20، فحص الشاهد النصي (معيار 19)، والارتباط بالمحتوى الأصلي",
            descEn: "20 measurement standards, source grounding (#19), and contextual fidelity",
            isValid: isStep1Valid,
            icon: FileCheck,
          },
          {
            step: 2 as const,
            id: "stem_formatting" as const,
            titleAr: "2. متن السؤال والشاهد والمثير",
            titleEn: "2. Stem & Source Excerpt",
            descAr: "تحرير متن السؤال، علامات الترقيم، وتوثيق الشاهد النصي والمثير المصور",
            descEn: "Stem text, punctuation, source excerpt grounding & stimulus",
            isValid: isStep1Valid,
            icon: Edit3,
          },
          {
            step: 3 as const,
            id: "options_and_key" as const,
            titleAr: "3. البدائل وتجانس المشتتات",
            titleEn: "3. Options & Contextual Distractors",
            descAr: "موازنة الخيارات وتعيين الإجابة الصحيحة المستندة لسياق المحتوى الأصلي",
            descEn: "Contextual options & correct key assignment",
            isValid: isStep2Valid,
            icon: ListOrdered,
          },
          {
            step: 4 as const,
            id: "preview_and_certify" as const,
            titleAr: "4. المعاينة واعتماد المطابقة التربوية",
            titleEn: "4. Contextual Preview & Certification",
            descAr: "المعاينة الحية للبند واستيفاء معايير الارتباط بالمحتوى واعتماده في البنك",
            descEn: "Live item preview & 20 standards certification",
            isValid: isStep1Valid && isStep2Valid,
            icon: BookmarkCheck,
          },
        ]
      : reviewStage === 2
      ? [
          {
            step: 1 as const,
            id: "linguistic_audit" as const,
            titleAr: "1. التدقيق اللغوي والإملائي",
            titleEn: "1. Linguistic & Spell Audit",
            descAr: "فحص الهمزات، التاء المربوطة، والنحو والرسم القياسي ثلاثي المحاور ووحدة التدقيق الذكية",
            descEn: "3-axis orthographic & syntax audit and instant AI fixes",
            isValid: isStep3Valid,
            icon: SpellCheck,
          },
          {
            step: 2 as const,
            id: "stem_formatting" as const,
            titleAr: "2. تحسين الصياغة والجذع",
            titleEn: "2. Stem & Prompt",
            descAr: "تحرير متن السؤال، علامات الترقيم، ووضوح المشكلة المطروحة وخلوها من اللبس",
            descEn: "Stimulus wording & prompt clarity",
            isValid: isStep1Valid,
            icon: Edit3,
          },
          {
            step: 3 as const,
            id: "options_and_key" as const,
            titleAr: "3. موازنة البدائل والمشتتات",
            titleEn: "3. Options & Distractors",
            descAr: "موازنة الخيارات والمشتتات وتعيين الإجابة الصحيحة المعتمدة",
            descEn: "Key & distractor balance",
            isValid: isStep2Valid,
            icon: ListOrdered,
          },
          {
            step: 4 as const,
            id: "preview_and_certify" as const,
            titleAr: "4. الاعتماد اللغوي والمعاينة",
            titleEn: "4. Linguistic Certification",
            descAr: "بطاقة الاستيفاء اللغوي والمعاينة الحية لورقة الاختبار والاعتماد في البنك",
            descEn: "Linguistic clearance & live student exam sheet",
            isValid: isStep1Valid && isStep2Valid && isStep3Valid,
            icon: BookmarkCheck,
          },
        ]
      : [
          {
            step: 1 as const,
            id: "psychometrics_calibration" as const,
            titleAr: "1. المعايرة السيكومترية ودليل معايير نوع السؤال",
            titleEn: "1. Psychometrics Calibration & Type Standards",
            descAr: "معامل الصعوبة p-value، معامل التمييز D-index، وإرشادات ومعايير نوع السؤال",
            descEn: "Difficulty, discrimination, distractors & question-type tips",
            isValid: isStep4Valid,
            icon: SlidersHorizontal,
          },
          {
            step: 2 as const,
            id: "bloom_taxonomy" as const,
            titleAr: "2. هرم بلوم ومصفوفة الأهداف",
            titleEn: "2. Bloom Cognitive Hierarchy",
            descAr: "تحديد المستوى المعرفي المستهدف ومطابقة نواتج التعلم المستهدفة",
            descEn: "Target cognitive level & ILO alignment",
            isValid: Boolean(editedBloom),
            icon: Layers,
          },
          {
            step: 3 as const,
            id: "ai_refinements" as const,
            titleAr: "3. التحسين الذكي والأتمتة السيكومترية",
            titleEn: "3. AI Auto-Pilot",
            descAr: "اقتراح البدائل المصوبة والتوليد الآلي للتحسينات التحريرية والسيكومترية",
            descEn: "AI smart recommendations & instant fixes",
            isValid: true,
            icon: Sparkles,
          },
          {
            step: 4 as const,
            id: "preview_and_certify" as const,
            titleAr: "4. شهادة الاعتماد السيكومتري وبنك الأسئلة",
            titleEn: "4. Psychometric Certification",
            descAr: "إصدار بطاقة الصلاحية السيكومترية والاعتماد النهائي للقياس في بنك الأسئلة",
            descEn: "Psychometric quality card & question bank certification",
            isValid: isStep5Valid,
            icon: Award,
          },
        ];

  // Active current step metadata
  const currentStepIndex = Math.min(Math.max(currentStep - 1, 0), STEPS_DATA.length - 1);
  const currentStepItem = STEPS_DATA[currentStepIndex] || STEPS_DATA[0];
  const currentStepId = currentStepItem?.id || "stem_formatting";

  // Reusable Wizard Navigation Footer
  const renderWizardNavFooter = () => {
    const isFirst = currentStep === 1;
    const isLast = currentStep === STEPS_DATA.length;
    const prevItem = STEPS_DATA[currentStep - 2];
    const nextItem = STEPS_DATA[currentStep];

    return (
      <div className="flex items-center justify-between pt-5 border-t-2 border-slate-200 dark:border-slate-800">
        {!isFirst && prevItem ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 font-black text-xs flex items-center gap-2 cursor-pointer transition-all border border-slate-300 dark:border-slate-700"
          >
            {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{isRtl ? `العودة: ${prevItem.titleAr}` : `Back: ${prevItem.titleEn}`}</span>
          </button>
        ) : (
          <div />
        )}

        {!isLast && nextItem ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(STEPS_DATA.length, prev + 1))}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all border border-indigo-400"
          >
            <span>{isRtl ? `الانتقال: ${nextItem.titleAr}` : `Next: ${nextItem.titleEn}`}</span>
            {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all border border-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isRtl ? "اعتماد فوري وحفظ في البنك" : "Instant Certify & Save"}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden animate-fadeIn select-text ${containerBg}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* 1. TOP ERGONOMIC COMMAND & NAVIGATION BAR */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b-2 border-slate-800 text-white flex items-center justify-between gap-4 shrink-0 shadow-md z-30">
        {/* Left Side: Brand Icon, Studio Title & Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
            reviewStage === 2 ? "bg-emerald-600" : reviewStage === 1 ? "bg-blue-600" : "bg-indigo-600"
          }`}>
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-sm sm:text-base text-white tracking-tight">
                {reviewStage === 2
                  ? isRtl
                    ? "استوديو التدقيق والتحسين اللغوي والإملائي - المرحلة الثانية"
                    : "Advanced Linguistic & Editorial Studio - Stage 2"
                  : reviewStage === 1
                  ? isRtl
                    ? "استوديو التوليد والتحكيم التربوي ومطابقة معايير القياس الـ20 - المرحلة الأولى"
                    : "Contextual Generation & 20 Standards Studio - Stage 1"
                  : isRtl
                  ? "استوديو التحكيم السيكومتري ومصفوفة بلوم - المرحلة الثالثة"
                  : "Psychometric Audit & Bloom Matrix Studio - Stage 3"}
              </h2>
              <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${
                reviewStage === 2
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                  : reviewStage === 1
                  ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                  : "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
              }`}>
                {reviewStage === 2
                  ? isRtl ? "المرحلة 2: التدقيق والتحسين اللغوي" : "Stage 2: Linguistic Audit"
                  : reviewStage === 1
                  ? isRtl ? "المرحلة 1: التوليد والتحكيم التربوي (20 معيار)" : "Stage 1: 20 Standards & Generation"
                  : isRtl ? "المرحلة 3: التحكيم السيكومتري وبلوم" : "Stage 3: Psychometrics & Bloom"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium hidden md:block">
              {reviewStage === 2
                ? isRtl
                  ? "التدقيق اللغوي والإملائي ثلاثي المحاور (الهمزات، النحو، علامات الترقيم)، معالجة الثغرات اللغوية، ووحدة الذكاء الاصطناعي للإصلاح الفوري"
                  : "3-axis linguistic audit, phrasing refinement & instant AI fixes"
                : reviewStage === 1
                ? isRtl
                  ? "المعايير السياقية والتحكيم التربوي ومطابقة معايير القياس الـ20 وفحص الشواهد النصية من المحتوى الأصلي"
                  : "Contextual pedagogical standards, 20 measurement rubrics & source excerpts verification"
                : isRtl
                ? "معايرة معاملات الصعوبة والتمييز، تصنيف مستويات بلوم الستة، وقياس كفاءة المشتتات والاعتماد السيكومتري"
                : "Difficulty & discrimination calibration, Bloom's cognitive taxonomy, and distractor efficiency"}
            </p>
          </div>
        </div>

        {/* Center: Item Carousel Navigator */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Item Carousel Navigator */}
          {questionsList && questionsList.length > 1 && onNavigate && (
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  const prev = (currentIndex - 1 + questionsList.length) % questionsList.length;
                  onNavigate(prev);
                }}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                title={isRtl ? "السؤال السابق (Alt + ←)" : "Previous Item (Alt + ←)"}
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <span className="text-xs font-black text-slate-200 px-2 min-w-[75px] text-center">
                {currentIndex + 1} / {questionsList.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = (currentIndex + 1) % questionsList.length;
                  onNavigate(next);
                }}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                title={isRtl ? "السؤال التالي (Alt + →)" : "Next Item (Alt + →)"}
              >
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Mode Switcher, Themes, Actions & Close */}
        <div className="flex items-center gap-2">
          {/* Automation Wizard Mode vs All-in-One Canvas */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setWorkflowMode("wizard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                workflowMode === "wizard"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
              title={isRtl ? "نمط الخطوات المتسلسلة والمؤتمتة" : "Automated Wizard Steps"}
            >
              <FastForward className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{isRtl ? "الخطوات المؤتمتة" : "Auto-Steps"}</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkflowMode("canvas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                workflowMode === "canvas"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
              title={isRtl ? "العرض المفتوح الشامل" : "All-in-One Canvas"}
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRtl ? "العرض المفتوح" : "Canvas"}</span>
            </button>
          </div>

          {/* Theme Mode Switcher */}
          <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setThemeMode("light")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                themeMode === "light" ? "bg-slate-700 text-amber-300 shadow-xs font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
              title={isRtl ? "مظهر الورقة الفاتح" : "Light"}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("zen")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                themeMode === "zen" ? "bg-amber-900/80 text-amber-300 shadow-xs font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
              title={isRtl ? "مظهر دافئ للعين" : "Warm"}
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("dark")}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                themeMode === "dark" ? "bg-slate-700 text-cyan-300 shadow-xs font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
              title={isRtl ? "المظهر الليلي" : "Dark"}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyFormatted}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title={isRtl ? "نسخ السؤال منسقاً" : "Copy Item"}
          >
            {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Save & Certify Button */}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer border-2 border-emerald-400"
          >
            <Save className="w-4 h-4" />
            <span>{isRtl ? "حفظ واعتماد" : "Save & Certify"}</span>
          </button>

          {/* Close Fullscreen */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900 hover:text-white border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isRtl ? "الخروج من ملء الشاشة (Esc)" : "Exit Fullscreen (Esc)"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      
</header>

      {/* 2. STEPPER PROGRESS BAR (Visible in Wizard Mode) */}
      {workflowMode === "wizard" && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 shrink-0">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {STEPS_DATA.map((stepItem) => {
              const isCurrent = currentStep === stepItem.step;
              const isPast = currentStep > stepItem.step;
              const StepIcon = stepItem.icon;

              return (
                <button
                  key={stepItem.id}
                  type="button"
                  onClick={() => setCurrentStep(stepItem.step)}
                  className={`flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl transition-all cursor-pointer border-2 shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600 border-indigo-300 text-white shadow-xl scale-[1.02] font-black"
                      : isPast
                      ? "bg-slate-800 border-emerald-500 text-white hover:bg-slate-750 shadow-sm"
                      : "bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-500 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isCurrent
                        ? "bg-white text-indigo-700 shadow-sm"
                        : isPast
                        ? "bg-emerald-400 text-slate-950 shadow-xs"
                        : "bg-slate-700 border border-slate-600 text-slate-100"
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : stepItem.step}
                  </div>

                  <div className="text-start hidden md:block">
                    <span className="font-display font-black text-xs block truncate text-white">
                      {isRtl ? stepItem.titleAr : stepItem.titleEn}
                    </span>
                    <span
                      className={`text-[10px] truncate max-w-[140px] block ${
                        isCurrent ? "text-indigo-100 font-bold" : isPast ? "text-emerald-300 font-medium" : "text-slate-300 font-medium"
                      }`}
                    >
                      {isRtl ? stepItem.descAr : stepItem.descEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ========================================================
              WIZARD AUTOMATED STEP-BY-STEP VIEW
             ======================================================== */}
          {workflowMode === "wizard" && (
            <div className="space-y-6 animate-fadeIn">
              {currentStepId === "pedagogical_standards" && (
                <PedagogicalStandardsStep
                  question={currentSnapshot}
                  qualityReport={qualityReport}
                  onOpenStandardsModal={() => setStandardsModalOpen(true)}
                  isRtl={isRtl}
                  isDark={isDark}
                  cardBg={cardBg}
                  renderNavFooter={renderWizardNavFooter}
                />
              )}

              {currentStepId === "psychometrics_calibration" && (
                <PsychometricsCalibrationStep
                  question={currentSnapshot}
                  editedQType={editedQType}
                  onSwitchQType={handleSwitchQType}
                  editedDiffIndex={editedDiffIndex}
                  setEditedDiffIndex={setEditedDiffIndex}
                  editedDiscIndex={editedDiscIndex}
                  setEditedDiscIndex={setEditedDiscIndex}
                  editedDifficulty={editedDifficulty}
                  setEditedDifficulty={setEditedDifficulty}
                  editedBloom={editedBloom}
                  onAutoCalibrate={handleAutoCalibratePsychometrics}
                  isRtl={isRtl}
                  isDark={isDark}
                  cardBg={cardBg}
                  renderNavFooter={renderWizardNavFooter}
                />
              )}

              {currentStepId === "bloom_taxonomy" && (
                <BloomTaxonomyStep
                  question={currentSnapshot}
                  editedBloom={editedBloom}
                  setEditedBloom={setEditedBloom}
                  editedDifficulty={editedDifficulty}
                  setEditedDifficulty={setEditedDifficulty}
                  editedContextReference={editedContextReference}
                  setEditedContextReference={setEditedContextReference}
                  editedStem={editedStem}
                  setEditedStem={setEditedStem}
                  isRtl={isRtl}
                  isDark={isDark}
                  cardBg={cardBg}
                  inputBg={inputBg}
                  reviewStage={reviewStage}
                  renderNavFooter={renderWizardNavFooter}
                />
              )}

              {currentStepId === "ai_refinements" && (
                <AiRefinementsStep
                  question={currentSnapshot}
                  isAiAuditing={isAiAuditing}
                  aiAuditResult={aiAuditResult}
                  aiAuditError={aiAuditError}
                  onRunAiAudit={handleRunAiAudit}
                  onApplyStemSuggestion={(stem) => setEditedStem(stem)}
                  isRtl={isRtl}
                  isDark={isDark}
                  cardBg={cardBg}
                  renderNavFooter={renderWizardNavFooter}
                />
              )}

              {currentStepId === "linguistic_audit" && (
                <LinguisticAuditStep
                  question={currentSnapshot}
                  linguisticFulfillment={linguisticFulfillment}
                  spellingReport={spellingReport}
                  linguisticSubMode={linguisticSubMode}
                  setLinguisticSubMode={setLinguisticSubMode}
                  activeLinguisticAxisFilter={activeLinguisticAxisFilter}
                  setActiveLinguisticAxisFilter={setActiveLinguisticAxisFilter}
                  onApplyAllSpelling={handleApplyAllSpelling}
                  onApplySingleSpellingFix={(issue) => {
                    const fixed = applySingleSpellingFix(currentSnapshot, issue);
                    setEditedStem(fixed.stem);
                    if (fixed.options) setEditedOptions(fixed.options);
                    if (fixed.correctAnswer) setEditedCorrectAnswer(fixed.correctAnswer);
                  }}
                  onApplyAiProofreading={(fixedQ) => {
                    setEditedStem(fixedQ.stem);
                    if (fixedQ.options) setEditedOptions(fixedQ.options);
                    if (fixedQ.correctAnswer) setEditedCorrectAnswer(fixedQ.correctAnswer);
                  }}
                  isRtl={isRtl}
                  isDark={isDark}
                  cardBg={cardBg}
                  renderNavFooter={renderWizardNavFooter}
                />
              )}

              {currentStepId === "stem_formatting" && (
                <StemFormattingStep
                  question={currentSnapshot}
                  editedStem={editedStem}
                  setEditedStem={setEditedStem}
                  editedQType={editedQType}
                  onSwitchQType={handleSwitchQType}
                  onAutoTuneStem={handleAutoTuneStem}
                  onInsertTag={handleInsertTag}
                  onToggleListening={handleToggleListening}
                  isListening={isListening}
                  isRtl={isRtl}
                  isDark={isDark}
                  cardBg={cardBg}
                  inputBg={inputBg}
                  reviewStage={reviewStage}
                  renderNavFooter={renderWizardNavFooter}
                />
              )}

              {currentStepId === "options_and_key" && (
                <OptionsAndKeyStep
                  question={currentSnapshot}
                  editedQType={editedQType}
                  editedOptions={editedOptions}
                  setEditedOptions={setEditedOptions}
                  editedCorrectAnswer={editedCorrectAnswer}
                  setEditedCorrectAnswer={setEditedCorrectAnswer}
                  editedRubrics={editedRubrics}
                  setEditedRubrics={setEditedRubrics}
                  matchingColumnB={matchingColumnB}
                  setMatchingColumnB={setMatchingColumnB}
                  editedImageUrl={editedImageUrl}
                  setEditedImageUrl={setEditedImageUrl}
                  onAutoBalanceOptions={handleAutoBalanceOptions}
                  onAddOption={handleAddOption}
                  onRemoveOption={handleRemoveOption}
                  onMoveOption={handleMoveOption}
                  onOptionChange={handleOptionChange}
                  onToggleMultiKey={handleToggleMultiKey}
                  isRtl={isRtl}
                  isDark={isDark}
                  cardBg={cardBg}
                  inputBg={inputBg}
                  reviewStage={reviewStage}
                  renderNavFooter={renderWizardNavFooter}
                />
              )}

              {currentStepId === "preview_and_certify" && (
                <PreviewAndCertifyStep
                  question={currentSnapshot}
                  reviewStage={reviewStage}
                  onSave={handleSave}
                  onCopy={() => {
                    navigator.clipboard?.writeText?.(
                      `${currentSnapshot.stem}\n${(currentSnapshot.options || []).join("\n")}`
                    );
                    setCopiedSuccess(true);
                    setTimeout(() => setCopiedSuccess(false), 2000);
                  }}
                  copiedSuccess={copiedSuccess}
                  isRtl={isRtl}
                  isDark={isDark}
                  isZenTheme={themeMode === "zen"}
                  cardBg={cardBg}
                  renderNavFooter={renderWizardNavFooter}
                />
              )}
            </div>
          )}

          {/* ========================================================
              CANVAS MODE: ALL SECTIONS OPEN SIMULTANEOUSLY
             ======================================================== */}
          {workflowMode === "canvas" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
              <div className="lg:col-span-7 space-y-6">

                {/* 1. Question Type Selector */}
                <div className={`p-4 rounded-3xl border-2 space-y-2.5 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      {isRtl ? "نمط السؤال المعتمد في المحرر المفتوح:" : "Active Question Format:"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { type: "mcq", labelAr: "اختيار من متعدد", labelEn: "MCQ (Single)" },
                      { type: "multi_mcq", labelAr: "متعدد الإجابات", labelEn: "Multiple Answers" },
                      { type: "tf", labelAr: "صواب وخطأ", labelEn: "True / False" },
                      { type: "fill", labelAr: "إكمال الفراغ", labelEn: "Fill-in Blank" },
                      { type: "matching", labelAr: "المزاوجة والربط", labelEn: "Matching" },
                      { type: "ordering", labelAr: "الترتيب والتسلسل", labelEn: "Ordering" },
                      { type: "essay", labelAr: "المقالي وسلالم التقدير", labelEn: "Short Essay" },
                      { type: "diagram_labeling", labelAr: "التعيين على الرسم", labelEn: "Diagram Labeling" },
                    ].map((item) => {
                      const isCurrent = editedQType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => handleSwitchQType(item.type as any)}
                          className={`p-2.5 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                            isCurrent
                              ? "bg-indigo-600 text-white border-indigo-700 shadow-md font-black"
                              : isDark
                              ? "bg-slate-950 border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-white"
                              : "bg-slate-50 border-slate-300 text-slate-800 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-900"
                          }`}
                        >
                          <span className="truncate">{isRtl ? item.labelAr : item.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Stem Editor */}
                <div className={`p-6 rounded-3xl border-2 ${cardBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{isRtl ? "متن السؤال (نص المسألة أو الفقرة):" : "Question Stem:"}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500">
                      {editedStem.length} {isRtl ? "حرف" : "chars"}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={editedStem}
                    onChange={(e) => setEditedStem(e.target.value)}
                    className={`w-full p-3.5 rounded-2xl text-base font-bold outline-none border-2 leading-relaxed ${inputBg}`}
                    placeholder={isRtl ? "اكتب متن السؤال هنا..." : "Write question stem here..."}
                  />
                </div>

                {/* 3. Format-Specific Answer & Key Workspace */}
                <div className={`p-6 rounded-3xl border-2 transition-all ${cardBg}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-300 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <ListOrdered className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                        {editedQType === "essay"
                          ? isRtl ? "سلم التقدير اللفظي (Rubric)" : "Essay Scoring Rubric"
                          : editedQType === "tf"
                          ? isRtl ? "تحديد مفتاح الصواب / الخطأ المعتمد" : "True / False Key"
                          : editedQType === "fill"
                          ? isRtl ? "الكلمة المستهدفة في الفراغ" : "Target Fill Word"
                          : editedQType === "matching"
                          ? isRtl ? "قائمتي المزاوجة (أ و ب)" : "Matching Lists"
                          : editedQType === "ordering"
                          ? isRtl ? "عناصر الترتيب الصحيح" : "Sequence Elements"
                          : editedQType === "diagram_labeling"
                          ? isRtl ? "بيانات التعيين على الرسم" : "Diagram Pin Labels"
                          : editedQType === "multi_mcq"
                          ? isRtl ? "البدائل وتحديد الإجابات المتعددة" : "Multi-Answer Options"
                          : isRtl ? "البدائل والخيارات ومفتاح الإجابة" : "Options & Answer Key"}
                      </h3>
                    </div>

                    {(editedQType === "mcq" || editedQType === "multi_mcq" || editedQType === "ordering") && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm border border-indigo-400"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>{isRtl ? "إضافة بديل جديد" : "Add Option"}</span>
                      </button>
                    )}
                  </div>

                  {/* A. Single Choice MCQ */}
                  {editedQType === "mcq" && (
                    <div className="space-y-3">
                      {editedOptions.map((opt, idx) => {
                        const isKey = opt === editedCorrectAnswer && opt.trim().length > 0;
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                              isKey
                                ? isDark
                                  ? "bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-md"
                                  : "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm"
                                : isDark
                                ? "bg-slate-900/90 border-slate-700 text-slate-100"
                                : "bg-slate-100/90 border-slate-300 text-slate-900"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setEditedCorrectAnswer(opt)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer shrink-0 ${
                                isKey
                                  ? "bg-emerald-600 text-white shadow-md scale-105 border-2 border-emerald-300"
                                  : isDark
                                  ? "bg-slate-800 border-2 border-slate-600 text-slate-200 hover:border-emerald-400"
                                  : "bg-white border-2 border-slate-400 text-slate-900 hover:border-emerald-500"
                              }`}
                              title={isRtl ? "انقر لتعيين هذا البديل كمفتاح صحيح" : "Click to mark as key"}
                            >
                              {String.fromCharCode(65 + idx)}
                            </button>

                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                              className={`flex-1 p-2.5 rounded-xl text-sm font-black outline-none border-2 transition-all ${inputBg}`}
                              placeholder={isRtl ? `نص الخيار ${idx + 1}...` : `Option ${idx + 1}...`}
                            />

                            <div className="flex items-center gap-1">
                              {isKey && (
                                <span className="hidden sm:flex items-center gap-1 text-[11px] font-black text-emerald-800 dark:text-emerald-300 px-2.5 py-1 bg-emerald-200/80 dark:bg-emerald-900/80 rounded-lg border border-emerald-400">
                                  <Check className="w-3.5 h-3.5" />
                                  {isRtl ? "المفتاح الصحيح" : "Key"}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleMoveOption(idx, "up")}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOption(idx, "down")}
                                disabled={idx === editedOptions.length - 1}
                                className="p-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              {editedOptions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx)}
                                  className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* B. Multi-Choice MCQ */}
                  {editedQType === "multi_mcq" && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>
                          {isRtl
                            ? "حدد جميع البدائل الصحيحة بالنقر على الأحرف أو المربعات (يمكن اختيار أكثر من بديل كمفتاح معتمد):"
                            : "Select all correct options as keys (multiple selections allowed):"}
                        </span>
                      </div>
                      {editedOptions.map((opt, idx) => {
                        const keysList = editedCorrectAnswer
                          ? editedCorrectAnswer.split(",").map((s) => s.trim()).filter(Boolean)
                          : [];
                        const isKey = keysList.includes(opt) && opt.trim().length > 0;
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                              isKey
                                ? isDark
                                  ? "bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-md"
                                  : "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm"
                                : isDark
                                ? "bg-slate-900/90 border-slate-700 text-slate-100"
                                : "bg-slate-100/90 border-slate-300 text-slate-900"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleMultiKey(opt)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer shrink-0 ${
                                isKey
                                  ? "bg-emerald-600 text-white shadow-md scale-105 border-2 border-emerald-300"
                                  : isDark
                                  ? "bg-slate-800 border-2 border-slate-600 text-slate-200 hover:border-emerald-400"
                                  : "bg-white border-2 border-slate-400 text-slate-900 hover:border-emerald-500"
                              }`}
                              title={isRtl ? "انقر للتبديل بين تضمين أو استبعاد هذا الخيار" : "Toggle key"}
                            >
                              {isKey ? "✓" : String.fromCharCode(65 + idx)}
                            </button>

                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                              className={`flex-1 p-2.5 rounded-xl text-sm font-black outline-none border-2 transition-all ${inputBg}`}
                              placeholder={isRtl ? `نص الخيار ${idx + 1}...` : `Option ${idx + 1}...`}
                            />

                            <div className="flex items-center gap-1">
                              {isKey && (
                                <span className="hidden sm:flex items-center gap-1 text-[11px] font-black text-emerald-800 dark:text-emerald-300 px-2.5 py-1 bg-emerald-200/80 dark:bg-emerald-900/80 rounded-lg border border-emerald-400">
                                  <Check className="w-3.5 h-3.5" />
                                  {isRtl ? "إجابة صحيحة" : "Correct Key"}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleMoveOption(idx, "up")}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOption(idx, "down")}
                                disabled={idx === editedOptions.length - 1}
                                className="p-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              {editedOptions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx)}
                                  className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* C. True / False - ONLY 2 buttons, NO option inputs */}
                  {editedQType === "tf" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { val: isRtl ? "صواب" : "True", labelAr: "صواب (True)", labelEn: "True" },
                        { val: isRtl ? "خطأ" : "False", labelAr: "خطأ (False)", labelEn: "False" },
                      ].map((tf) => {
                        const isKey = editedCorrectAnswer === tf.val;
                        return (
                          <button
                            key={tf.val}
                            type="button"
                            onClick={() => setEditedCorrectAnswer(tf.val)}
                            className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                              isKey
                                ? "bg-emerald-600 text-white border-emerald-400 shadow-xl scale-102 font-black"
                                : isDark
                                ? "bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500"
                                : "bg-slate-100 border-slate-300 text-slate-900 hover:border-emerald-500"
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
                                isKey ? "bg-white text-emerald-700 shadow-md" : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            >
                              {isKey ? "✓" : "○"}
                            </div>
                            <span className="text-lg font-black">{isRtl ? tf.labelAr : tf.labelEn}</span>
                            <span className="text-xs font-bold opacity-90">
                              {isKey ? (isRtl ? "المفتاح المعتمد للإجابة" : "Certified Answer Key") : isRtl ? "انقر للتعيين" : "Click to select"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* D. Fill in Blank */}
                  {editedQType === "fill" && (
                    <div className="space-y-3">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100">
                        {isRtl ? "الكلمة أو المصطلح النموذجي المطلوب كتابته في الفراغ:" : "Target word/term in blank:"}
                      </label>
                      <input
                        type="text"
                        value={editedCorrectAnswer}
                        onChange={(e) => setEditedCorrectAnswer(e.target.value)}
                        className={`w-full p-3.5 rounded-2xl text-base font-bold outline-none border-2 ${inputBg}`}
                        placeholder={isRtl ? "مثال: الصدق الظاهري / معامل ألفا كرونباخ..." : "Target keyword..."}
                      />
                    </div>
                  )}

                  {/* E. Essay Rubrics */}
                  {editedQType === "essay" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {isRtl ? "معايير سلم التقدير اللفظي والدرجات المستحقة:" : "Rubric Criteria & Points:"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditedRubrics((prev) => [
                              ...prev,
                              {
                                id: `r-${Date.now()}`,
                                criterion: isRtl ? "معيار تقدير إضافي" : "Additional criterion",
                                points: 2,
                                description: isRtl ? "وصف الأداء المطلوب لتحقيق الدرجة..." : "Performance description...",
                              },
                            ])
                          }
                          className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer border border-indigo-400"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isRtl ? "إضافة معيار" : "Add Criterion"}</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {editedRubrics.map((rubric, rIdx) => (
                          <div
                            key={rubric.id || rIdx}
                            className="p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={rubric.criterion}
                                onChange={(e) => {
                                  const next = [...editedRubrics];
                                  next[rIdx].criterion = e.target.value;
                                  setEditedRubrics(next);
                                }}
                                className={`flex-1 p-2.5 rounded-xl text-xs font-bold border-2 ${inputBg}`}
                                placeholder={isRtl ? "اسم المعيار..." : "Criterion title..."}
                              />
                              <div className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-950 px-2.5 py-1 rounded-xl border border-indigo-300 dark:border-indigo-800">
                                <input
                                  type="number"
                                  value={rubric.points}
                                  onChange={(e) => {
                                    const next = [...editedRubrics];
                                    next[rIdx].points = Number(e.target.value) || 1;
                                    setEditedRubrics(next);
                                  }}
                                  className="w-12 text-center text-xs font-black bg-transparent outline-none text-indigo-950 dark:text-indigo-200"
                                />
                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300">{isRtl ? "درجات" : "pts"}</span>
                              </div>
                              {editedRubrics.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setEditedRubrics((prev) => prev.filter((_, i) => i !== rIdx))}
                                  className="p-1.5 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* F. Matching */}
                  {editedQType === "matching" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs font-black block text-slate-900 dark:text-slate-100">
                            {isRtl ? "العمود أ (المفاهيم والمقدمات):" : "Column A (Concepts):"}
                          </span>
                          {editedOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                className={`flex-1 p-2.5 rounded-xl text-xs font-bold border-2 ${inputBg}`}
                                placeholder={isRtl ? `مفهوم ${idx + 1}...` : `Concept ${idx + 1}...`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-black block text-slate-900 dark:text-slate-100">
                            {isRtl ? "العمود ب (الاستجابات والتفسيرات):" : "Column B (Responses):"}
                          </span>
                          {matchingColumnB.map((resp, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <input
                                type="text"
                                value={resp}
                                onChange={(e) => {
                                  const next = [...matchingColumnB];
                                  next[idx] = e.target.value;
                                  setMatchingColumnB(next);
                                }}
                                className={`flex-1 p-2.5 rounded-xl text-xs font-bold border-2 ${inputBg}`}
                                placeholder={isRtl ? `استجابة ${idx + 1}...` : `Response ${idx + 1}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* G. Ordering */}
                  {editedQType === "ordering" && (
                    <div className="space-y-3">
                      <span className="text-xs font-black block text-slate-900 dark:text-slate-100">
                        {isRtl
                          ? "عناصر التسلسل والترتيب الصحيح (استخدم الأسهم لإعادة الترتيب):"
                          : "Sequence items in correct order:"}
                      </span>
                      {editedOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/60">
                          <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            className={`flex-1 p-2.5 rounded-xl text-xs font-bold border-2 ${inputBg}`}
                            placeholder={isRtl ? `خطوة ${idx + 1}...` : `Step ${idx + 1}...`}
                          />
                          <button
                            type="button"
                            onClick={() => handleMoveOption(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOption(idx, "down")}
                            disabled={idx === editedOptions.length - 1}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* H. Diagram Labeling */}
                  {editedQType === "diagram_labeling" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black mb-1.5 text-slate-900 dark:text-slate-100">
                          {isRtl ? "رابط صورة المخطط / الرسم البياني:" : "Diagram Image URL:"}
                        </label>
                        <input
                          type="text"
                          value={editedImageUrl}
                          onChange={(e) => setEditedImageUrl(e.target.value)}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold border-2 ${inputBg}`}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-black block text-slate-900 dark:text-slate-100">
                          {isRtl ? "بيانات التعيين والأجزاء المراد تسميتها:" : "Pin Labels / Parts:"}
                        </span>
                        {editedOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                              className={`flex-1 p-2.5 rounded-xl text-xs font-bold border-2 ${inputBg}`}
                              placeholder={isRtl ? `تسمية جزء ${idx + 1}...` : `Label ${idx + 1}...`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Calibration & Bloom Taxonomy */}
                <div className={`p-6 rounded-3xl border-2 space-y-4 ${cardBg}`}>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-300 dark:border-slate-800">
                    <SlidersHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {isRtl ? "المعايرة السيكومترية وتصنيف بلوم المعرفي:" : "Psychometrics & Bloom Calibration:"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Difficulty */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{isRtl ? "معامل الصعوبة (p-value):" : "Difficulty (p-value):"}</span>
                        <span className="font-black text-purple-600 dark:text-purple-400">{editedDiffIndex}</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.95"
                        step="0.05"
                        value={editedDiffIndex}
                        onChange={(e) => setEditedDiffIndex(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    {/* Discrimination */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{isRtl ? "معامل التمييز (D-Index):" : "Discrimination:"}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">{editedDiscIndex.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.80"
                        step="0.05"
                        value={editedDiscIndex}
                        onChange={(e) => setEditedDiscIndex(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Bloom Level */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-900 dark:text-slate-100">
                      {isRtl ? "المستوى المعرفي (هرم بلوم المعدل):" : "Bloom's Cognitive Level:"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                      {[
                        { level: isRtl ? "تذكر" : "Remember", color: "bg-blue-600 border-blue-400" },
                        { level: isRtl ? "فهم" : "Understand", color: "bg-emerald-600 border-emerald-400" },
                        { level: isRtl ? "تطبيق" : "Apply", color: "bg-teal-600 border-teal-400" },
                        { level: isRtl ? "تحليل" : "Analyze", color: "bg-amber-600 border-amber-400" },
                        { level: isRtl ? "تقويم" : "Evaluate", color: "bg-orange-600 border-orange-400" },
                        { level: isRtl ? "ابتكار" : "Create", color: "bg-purple-600 border-purple-400" },
                      ].map((bl) => {
                        const isSelected = editedBloom === bl.level;
                        return (
                          <button
                            key={bl.level}
                            type="button"
                            onClick={() => setEditedBloom(bl.level as any)}
                            className={`p-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer text-center ${
                              isSelected
                                ? `${bl.color} text-white shadow-sm font-black`
                                : isDark
                                ? "bg-slate-900 border-slate-700 text-slate-300 hover:border-purple-500"
                                : "bg-slate-100 border-slate-300 text-slate-800 hover:border-purple-500"
                            }`}
                          >
                            <div className="truncate">{bl.level}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Preview Side (5 Columns) */}
              <div className="lg:col-span-5 space-y-6">
                <div
                  className={`p-2 sm:p-4 rounded-3xl border-2 shadow-2xl transition-all ${
                    isDark
                      ? "bg-slate-950 border-slate-800"
                      : isZenTheme
                      ? "bg-stone-200 border-stone-300"
                      : "bg-slate-200/80 border-slate-300"
                  }`}
                >
                  <StudentExamPreview
                    question={currentSnapshot}
                    isRtl={isRtl}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Success Toast */}
      {isSavedToast && (
        <div className="fixed bottom-6 end-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/50 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-bold text-xs">
            {isRtl
              ? "✓ تم حفظ وتحديث السؤال واعتماده في بنك الأسئلة بنجاح!"
              : "✓ Item saved and certified in bank successfully!"}
          </span>
        </div>
      )}

      {/* Content Alignment Standards Modal (20 Criteria) */}
      <ContentAlignmentStandardsModal
        isOpen={standardsModalOpen}
        onClose={() => setStandardsModalOpen(false)}
        lang={lang}
        question={currentSnapshot}
      />
    </div>
  );
}
