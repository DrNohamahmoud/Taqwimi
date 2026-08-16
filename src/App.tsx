import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import LoginGate from "./components/LoginGate";
import Hero from "./components/Hero";
import Flow from "./components/Flow";
import QuestionTypes from "./components/QuestionTypes";
import BloomPyramid from "./components/BloomPyramid";
import GeneratorTab from "./components/GeneratorTab";
import ImproveTab from "./components/ImproveTab";
import SupportTools from "./components/SupportTools";
import BloomChartDashboard from "./components/BloomChartDashboard";
import BankStatsPanel from "./components/BankStatsPanel";
import UserStatsModal from "./components/UserStatsModal";
import PlatformStatsFooter from "./components/PlatformStatsFooter";
import ShareQuizModal from "./components/ShareQuizModal";
import ReadOnlyQuizViewerModal from "./components/ReadOnlyQuizViewerModal";
import QualityHintsBadge from "./components/QualityHintsBadge";
import FullscreenQuestionReviewModal from "./components/FullscreenQuestionReviewModal";
import BatchAuditModal from "./components/BatchAuditModal";
import { evaluateQuestionQuality } from "./utils/qualityEvaluator";
import { Question, QUESTION_BANK_STORAGE_KEY } from "./types";
import { Language, translations } from "./translations";
import {
  Award,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
  X,
  AlertCircle,
  Info,
  Wand2,
  ArrowRight,
  Database,
  Save,
  Trash2,
  BarChart2,
  Filter,
  SlidersHorizontal,
  Search,
  Maximize2,
  Zap,
  RefreshCw,
  Edit3,
  BookOpen,
} from "lucide-react";
import { runComprehensiveQuestionAutomation } from "./utils/questionAutomation";
import { notifyUserActivity } from "./utils/activityNotifier";

function generateSmartQuestionTips(q: Question, isRtl: boolean): string[] {
  const tips: string[] = [];

  // Check stem length
  if (q.stem.length < 20) {
    tips.push(
      isRtl
        ? "جذع السؤال قصير جداً؛ يُفضل توضيح السياق أو المسألة بشكل أكثر تحديداً لتجنب إرباك الطالب."
        : "Question stem is very short; consider providing clearer context."
    );
  } else if (q.stem.length > 260) {
    tips.push(
      isRtl
        ? "جذع السؤال طويل جداً؛ احرص على إزالة الكلمات الزائدة والتركيز على مشكلة السؤال المباشرة."
        : "Question stem is quite long; trim non-essential introductory text."
    );
  }

  // Check negative phrasing
  if (
    q.stem.includes("ليس") ||
    q.stem.includes("ما عدا") ||
    q.stem.includes("غير") ||
    q.stem.includes("لا ") ||
    q.stem.includes("NOT") ||
    q.stem.includes("EXCEPT")
  ) {
    tips.push(
      isRtl
        ? "تنبيه الصياغة المنفية: يتضمن السؤال أداة نفي (ليس / ما عدا / غير). يُوصى بتظليل كلمة النفي بخط عريض لإنذار الطالب."
        : "Contains negative phrasing. Highlight or bold negative keywords like NOT or EXCEPT."
    );
  }

  // Check options balance for MCQ
  if (q.qType === "mcq" && q.options && q.options.length > 0) {
    const optionLengths = q.options.map((o) => o.length);
    const maxLen = Math.max(...optionLengths);
    const minLen = Math.min(...optionLengths);
    if (maxLen > minLen * 2.5 && maxLen > 25) {
      tips.push(
        isRtl
          ? "توازن البدائل: أحد الخيارات أطول بكثير من باقي البدائل، وقد يوحِي للطالب بأنه الإجابة الصحيحة. يفضل موازنة الأطوال."
          : "Option length imbalance: avoid making the correct option significantly longer than distractors."
      );
    }
    const hasAllAbove = q.options.some(
      (o) =>
        o.includes("جميع ما سبق") ||
        o.includes("كل ما ذكر") ||
        o.includes("لا شيء مما سبق") ||
        o.includes("All of the above") ||
        o.includes("None of the above")
    );
    if (hasAllAbove) {
      tips.push(
        isRtl
          ? "تجنب استخدام 'جميع ما سبق' أو 'لا شيء مما سبق': يقلل من القوة التمييزية للبند السيكومتري ويشجع التخمين."
          : "Avoid using 'All of the above' or 'None of the above' as it reduces item discrimination."
      );
    }
  }

  // Difficulty Index (p-value)
  if (typeof q.difficultyIndex === "number") {
    if (q.difficultyIndex > 0.82) {
      tips.push(
        isRtl
          ? "معامل السهولة مرتفع (p > 80%): السؤال سهل جداً، صمم مشتتات أكثر جاذبية أو ارفع مستوى الصعوبة المعرفية."
          : "High facility index (p > 80%): item is too easy. Strengthen distractors."
      );
    } else if (q.difficultyIndex < 0.28) {
      tips.push(
        isRtl
          ? "معامل السهولة منخفض (p < 28%): السؤال صعب جداً، تحقق من عدم وجود إبهام في الصياغة أو خطأ في المفتاح."
          : "Low facility index (p < 28%): item is very difficult. Verify clarity and key accuracy."
      );
    }
  }

  // Discrimination Index (D-value)
  if (typeof q.discriminationIndex === "number" && q.discriminationIndex < 0.35) {
    tips.push(
      isRtl
        ? "معامل التمييز يحتاج تحسيناً (D < 0.35): السؤال لا يفرق بفاعلية كافية بين الطلبة المرتفعين والمنخفضين."
        : "Low discrimination index (D < 0.35): item does not effectively differentiate between high and low achievers."
    );
  }

  return tips;
}

export default function App() {
  const [lang, setLang] = useState<Language>("ar");
  const [userEmail, setUserEmail] = useState("");
  const [currentAxis, setCurrentAxis] = useState<"1" | "2" | "3" | "4">("1");
  const [isUserStatsOpen, setIsUserStatsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReadOnlyViewerOpen, setIsReadOnlyViewerOpen] = useState(false);
  const [customSharedQuestions, setCustomSharedQuestions] = useState<Question[] | null>(null);

  const [loginCount, setLoginCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("taqwimi-user-login-count");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) return val;
      }
    } catch (e) {
      console.error("Error reading login count from LocalStorage:", e);
    }
    return 0;
  });

  const [questionsList, setQuestionsList] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(QUESTION_BANK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error loading question bank from LocalStorage:", e);
    }
    return [];
  });
  const [selectedAdviceQuestion, setSelectedAdviceQuestion] = useState<Question | null>(null);
  const [fullscreenFocusQuestion, setFullscreenFocusQuestion] = useState<{ q: Question; index: number } | null>(null);
  const [automatingBankId, setAutomatingBankId] = useState<string | null>(null);
  const [isGlobalBatchAuditOpen, setIsGlobalBatchAuditOpen] = useState(false);

  const handleAutomateBankQuestion = async (qId: string) => {
    setAutomatingBankId(qId);
    await new Promise((r) => setTimeout(r, 400));
    setQuestionsList((prev) =>
      prev.map((item) => {
        if (item.id === qId) {
          return runComprehensiveQuestionAutomation(item, isRtl);
        }
        return item;
      })
    );
    setAutomatingBankId(null);
  };

  // Question Bank Filtering state
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState<string>("all");
  const [bankBloomFilter, setBankBloomFilter] = useState<string>("all");
  const [bankSearchQuery, setBankSearchQuery] = useState<string>("");

  const filteredQuestionsList = useMemo(() => {
    return questionsList.filter((q) => {
      // Difficulty Filter
      if (bankDifficultyFilter !== "all") {
        if (bankDifficultyFilter === "easy" || bankDifficultyFilter === "سهلة") {
          if (q.difficulty !== "سهلة" && q.difficulty !== "easy") return false;
        } else if (bankDifficultyFilter === "medium" || bankDifficultyFilter === "متوسطة") {
          if (q.difficulty !== "متوسطة" && q.difficulty !== "medium") return false;
        } else if (bankDifficultyFilter === "hard" || bankDifficultyFilter === "صعبة") {
          if (q.difficulty !== "صعبة" && q.difficulty !== "hard") return false;
        } else if (q.difficulty !== bankDifficultyFilter) {
          return false;
        }
      }

      // Bloom Level Filter
      if (bankBloomFilter !== "all") {
        const bloomMap: Record<string, string[]> = {
          remember: ["تذكر", "Remember"],
          understand: ["فهم", "Understand"],
          apply: ["تطبيق", "Apply"],
          analyze: ["تحليل", "Analyze"],
          evaluate: ["تقويم", "Evaluate"],
          create: ["إبداع", "Create"],
          "تذكر": ["تذكر", "Remember"],
          "فهم": ["فهم", "Understand"],
          "تطبيق": ["تطبيق", "Apply"],
          "تحليل": ["تحليل", "Analyze"],
          "تقويم": ["تقويم", "Evaluate"],
          "إبداع": ["إبداع", "Create"],
        };
        const allowed = bloomMap[bankBloomFilter] || [bankBloomFilter];
        if (!allowed.includes(q.bloom)) {
          return false;
        }
      }

      // Search Query Filter
      if (bankSearchQuery.trim()) {
        const query = bankSearchQuery.trim().toLowerCase();
        const matchStem = q.stem?.toLowerCase().includes(query);
        const matchOptions = q.options?.some((o) => o.toLowerCase().includes(query));
        if (!matchStem && !matchOptions) return false;
      }

      return true;
    });
  }, [questionsList, bankDifficultyFilter, bankBloomFilter, bankSearchQuery]);

  const hasActiveBankFilters = bankDifficultyFilter !== "all" || bankBloomFilter !== "all" || bankSearchQuery.trim() !== "";

  const handleResetBankFilters = () => {
    setBankDifficultyFilter("all");
    setBankBloomFilter("all");
    setBankSearchQuery("");
  };

  const t = translations[lang];
  const isRtl = lang === "ar";

  // Persist question bank automatically to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(QUESTION_BANK_STORAGE_KEY, JSON.stringify(questionsList));
    } catch (e) {
      console.error("Error saving question bank to LocalStorage:", e);
    }
  }, [questionsList]);

  // Synchronize document dir and lang attribute
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  // Check URL hash for shared quiz payload (#quiz=...)
  useEffect(() => {
    const handleCheckHash = () => {
      const hash = window.location.hash;
      if (hash && hash.includes("quiz=")) {
        try {
          const rawParam = hash.split("quiz=")[1];
          if (rawParam) {
            const decodedStr = decodeURIComponent(escape(atob(decodeURIComponent(rawParam))));
            const parsed = JSON.parse(decodedStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCustomSharedQuestions(parsed);
              setIsReadOnlyViewerOpen(true);
            }
          }
        } catch (e) {
          console.error("Error parsing shared quiz hash payload:", e);
        }
      }
    };

    handleCheckHash();
    window.addEventListener("hashchange", handleCheckHash);
    return () => window.removeEventListener("hashchange", handleCheckHash);
  }, []);

  // Check existing login session and initialize login count if needed
  useEffect(() => {
    const savedEmail = localStorage.getItem("taqwimi-remember-email");
    const sessionOk = sessionStorage.getItem("taqwimi-session-ok");
    if (savedEmail || sessionOk === "1") {
      setUserEmail(savedEmail || (isRtl ? "عضو هيئة التدريس" : "Faculty Member"));
      setLoginCount((prev) => {
        if (prev === 0) {
          try {
            localStorage.setItem("taqwimi-user-login-count", "1");
          } catch (e) {}
          return 1;
        }
        return prev;
      });
    }
  }, [isRtl]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setLoginCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem("taqwimi-user-login-count", next.toString());
      } catch (e) {}
      
      // Send notification to supervisor email Noha.mahmoud@cu.edu.eg
      notifyUserActivity(
        email,
        "login",
        `تم تسجيل الدخول بنجاح للمنصة (الجلسة رقم ${next})`,
        { loginCount: next, questionCount: questionsList.length }
      );
      
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("taqwimi-remember-email");
    sessionStorage.removeItem("taqwimi-session-ok");
    setUserEmail("");
  };

  const handleResetLoginStats = () => {
    if (
      window.confirm(
        isRtl
          ? "هل ترغب بإعادة ضبط وتصفير عداد تسجيلات الدخول؟"
          : "Reset user login session counter?"
      )
    ) {
      setLoginCount(0);
      try {
        localStorage.setItem("taqwimi-user-login-count", "0");
      } catch (e) {}
    }
  };

  // Synchronize document dir and lang attribute
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  const handleAddQuestion = (q: Question) => {
    setQuestionsList((prev) => {
      if (prev.length >= 300) {
        alert(
          isRtl
            ? "تنبيه: وصل بنك الأسئلة للحد الأقصى المسموح وهو 300 سؤال معتمد."
            : "Notice: Question bank has reached its maximum capacity of 300 approved items."
        );
        return prev;
      }
      // Prevent duplicates in final list
      if (prev.some((item) => item.stem === q.stem)) return prev;
      return [...prev, q];
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestionsList((prev) => prev.filter((q) => q.id !== id));
  };

  const handleClearBank = () => {
    if (window.confirm(t.bank.clearBankConfirm)) {
      setQuestionsList([]);
      localStorage.removeItem(QUESTION_BANK_STORAGE_KEY);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans transition-colors duration-300">
      {/* 1. Login Gate Overlay */}
      {!userEmail && (
        <LoginGate
          onLoginSuccess={handleLoginSuccess}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
      )}

      {/* 2. Top Header and Navigation */}
      <Header
        userEmail={userEmail}
        onLogout={handleLogout}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenUserStats={() => setIsUserStatsOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* 3. Hero Band */}
      <Hero
        lang={lang}
        onStartClick={() => {
          setCurrentAxis("1");
          scrollToSection("interactive-board");
        }}
        onExploreClick={() => {
          setCurrentAxis("2");
          scrollToSection("interactive-board");
        }}
      />

      {/* 4. Educational Workflow */}
      <Flow
        lang={lang}
        onSelectAxis={(axis) => {
          setCurrentAxis(axis);
          scrollToSection("interactive-board");
        }}
      />

      {/* 5. Standards Guides & Bloom Hierarchy */}
      <QuestionTypes lang={lang} />
      <BloomPyramid lang={lang} />

      {/* 6. Active Interactive Board (The four main axes) */}
      <main id="interactive-board" className="py-16 bg-blue-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Axis Subheader */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
              {t.board.badge}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-3 mb-2">
              {t.board.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.board.subtitle}
            </p>
          </div>

          {/* Unified Clean & Modern 4-Stage Interactive Navigation Bar */}
          <div className="sticky top-16 z-30 mb-8 max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 shadow-lg shadow-slate-200/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
                {[
                  {
                    id: "1",
                    stageNum: 1,
                    titleAr: "المرحلة 1: التوليد من محتوى والتحكيم التربوي",
                    titleEn: "Stage 1: Content Gen & 20 Standards",
                    subAr: "المعايير السياقية والتحكيم التربوي ومعايير القياس الـ 20",
                    subEn: "Contextual pedagogical review & 20 standards",
                    icon: Sparkles,
                  },
                  {
                    id: "2",
                    stageNum: 2,
                    titleAr: "المرحلة 2: التدقيق والتحسين اللغوي",
                    titleEn: "Stage 2: Linguistic Proofreading",
                    subAr: "ضبط الإملاء والنحو وتجانس البدائل والترقيم",
                    subEn: "Spelling, grammar, punctuation & options",
                    icon: Edit3,
                  },
                  {
                    id: "3",
                    stageNum: 3,
                    titleAr: "المرحلة 3: التحكيم السيكومتري ومصفوفة بلوم",
                    titleEn: "Stage 3: Psychometrics & Bloom",
                    subAr: "معاملات الصعوبة (p) والتمييز (D) وتصنيف بلوم",
                    subEn: "Facility (p), discrimination (D) & Bloom's depth",
                    icon: SlidersHorizontal,
                  },
                  {
                    id: "4",
                    stageNum: 4,
                    titleAr: "المرحلة 4: بنك الأسئلة والتصدير",
                    titleEn: "Stage 4: Bank & Export",
                    subAr: "جدول المواصفات وتصدير Word",
                    subEn: "TOS matrix & Word export",
                    icon: BookOpen,
                  },
                ].map((item) => {
                  const isCurrent = currentAxis === item.id;
                  const isPassed = Number(currentAxis) > item.stageNum;
                  const IconComp = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCurrentAxis(item.id);
                        setTimeout(() => scrollToSection("interactive-board"), 100);
                      }}
                      className={`relative p-2.5 sm:p-3 rounded-xl border text-start transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-[1.01]"
                          : isPassed
                          ? "bg-emerald-50/70 hover:bg-emerald-100/80 text-slate-800 border-emerald-200"
                          : "bg-slate-50/80 hover:bg-white text-slate-700 hover:text-slate-900 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? "bg-white text-blue-900 shadow-xs"
                                : isPassed
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {isPassed ? "✓" : item.stageNum}
                          </span>
                          <span
                            className={`font-black text-xs truncate ${
                              isCurrent ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {isRtl ? item.titleAr : item.titleEn}
                          </span>
                        </div>
                        <IconComp
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent
                              ? "text-amber-300"
                              : isPassed
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-medium truncate ${
                          isCurrent
                            ? "text-blue-100"
                            : isPassed
                            ? "text-emerald-800"
                            : "text-slate-500"
                        }`}
                      >
                        {isRtl ? item.subAr : item.subEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Layout: Active Tab Panel + Approved Question Bank Column */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Active tool column */}
            <div className="xl:col-span-8">
              {currentAxis === "1" && (
                <GeneratorTab
                  onAddQuestion={handleAddQuestion}
                  lang={lang}
                  onNextStage={() => {
                    setCurrentAxis("2");
                    setTimeout(() => scrollToSection("interactive-board"), 150);
                  }}
                />
              )}
              {currentAxis === "2" && (
                <ImproveTab
                  stage="2"
                  onAddQuestion={handleAddQuestion}
                  lang={lang}
                  questionsList={questionsList}
                  onBatchUpdateQuestions={(updated) => setQuestionsList(updated)}
                  onNextStage={() => {
                    setCurrentAxis("3");
                    setTimeout(() => scrollToSection("interactive-board"), 150);
                  }}
                />
              )}
              {currentAxis === "3" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 border border-violet-200 rounded-2xl p-4 flex gap-3 items-center">
                    <span className="w-8 h-8 rounded-xl bg-violet-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {t.board.stage3Note}
                    </p>
                  </div>
                  <ImproveTab
                    stage="3"
                    onAddQuestion={handleAddQuestion}
                    lang={lang}
                    questionsList={questionsList}
                    onBatchUpdateQuestions={(updated) => setQuestionsList(updated)}
                    onNextStage={() => {
                      setCurrentAxis("4");
                      setTimeout(() => scrollToSection("interactive-board"), 150);
                    }}
                  />
                </div>
              )}
              {currentAxis === "4" && (
                <SupportTools
                  questionsList={questionsList}
                  lang={lang}
                  onRestartPipeline={() => {
                    setCurrentAxis("1");
                    setTimeout(() => scrollToSection("interactive-board"), 150);
                  }}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                />
              )}
            </div>

            {/* Approved question bank column */}
            <div className="xl:col-span-4 bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-md space-y-5 sticky top-36">
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-slate-900">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h3 className="font-display font-bold text-base">{t.bank.title}</h3>
                </div>
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {questionsList.length}
                </span>
              </div>

              {/* LocalStorage Persistence Indicator & Clear Button */}
              <div className="flex items-center justify-between text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl font-bold">
                <span className="flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{t.bank.autoSaved}</span>
                </span>
                {questionsList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearBank}
                    className="text-rose-600 hover:text-rose-800 hover:bg-rose-100/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 font-extrabold shrink-0"
                    title={t.bank.clearBankBtn}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.bank.clearBankBtn}</span>
                  </button>
                )}
              </div>

              {/* 300 Questions Capacity Progress Meter */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>{t.bank.capacityTitle}</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    questionsList.length >= 300
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-blue-100 text-blue-900 border border-blue-200"
                  }`}>
                    {questionsList.length} / 300 {isRtl ? "سؤال" : "items"}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      questionsList.length >= 300
                        ? "bg-rose-600 animate-pulse"
                        : questionsList.length >= 250
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, (questionsList.length / 300) * 100))}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {t.bank.capacityNotice}
                </p>
              </div>

              {/* Psychometric Statistics Panel */}
              <BankStatsPanel questionsList={filteredQuestionsList} lang={lang} />

              {/* Multi-Question Batch Processing Banner / Button */}
              {questionsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsGlobalBatchAuditOpen(true)}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-slate-950 p-3 rounded-2xl flex items-center justify-between shadow-md transition-all cursor-pointer border border-amber-400 font-bold group"
                >
                  <div className="flex items-center gap-2.5 text-right">
                    <div className="w-8 h-8 rounded-xl bg-slate-950/15 border border-slate-950/20 flex items-center justify-center text-slate-950 shrink-0">
                      <Zap className="w-4 h-4 fill-slate-950" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-950">
                        {isRtl ? "تطبيق المراحل على أسئلة متعددة ⚡" : "Batch Apply Stages on Items ⚡"}
                      </div>
                      <div className="text-[10px] text-slate-900/80 font-medium">
                        {isRtl
                          ? `تدقيق ومعايرة جماعية لـ (${questionsList.length}) أسئلة`
                          : `Batch audit & calibrate ${questionsList.length} items`}
                      </div>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 text-slate-950 transition-transform ${isRtl ? "group-hover:-translate-x-0.5" : "rotate-180 group-hover:translate-x-0.5"}`} />
                </button>
              )}

              {/* User Analytics Shortcut Banner */}
              <button
                type="button"
                onClick={() => setIsUserStatsOpen(true)}
                className="w-full bg-gradient-to-r from-slate-900 to-blue-950 hover:from-slate-800 hover:to-blue-900 text-white p-3 rounded-2xl flex items-center justify-between shadow-md transition-all cursor-pointer border border-blue-500/30 group hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5 text-right">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 group-hover:bg-blue-500/30 transition-colors shrink-0">
                    <BarChart2 className="w-4 h-4 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isRtl ? "إحصائيات المستخدم والأنشطة" : "User Analytics & Activity"}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {isRtl ? "عرض تفصيلي لأداء الجلسة وأنواعه" : "View detailed session analytics"}
                    </div>
                  </div>
                </div>
                <ChevronLeft className={`w-4 h-4 text-slate-400 group-hover:text-white transition-colors ${isRtl ? "" : "rotate-180"}`} />
              </button>

              {/* Bloom's Taxonomy Cognitive Distribution Dashboard */}
              <BloomChartDashboard questionsList={filteredQuestionsList} lang={lang} />

              {/* Filter Dropdowns Panel (Difficulty & Bloom Levels) */}
              {questionsList.length > 0 && (
                <div className="bg-slate-50/90 border border-slate-200/90 p-3.5 rounded-2xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Filter className="w-4 h-4 text-blue-600" />
                      <span>{t.bank.filterTitle}</span>
                    </div>
                    {hasActiveBankFilters && (
                      <button
                        type="button"
                        onClick={handleResetBankFilters}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-extrabold hover:bg-rose-50 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" />
                        <span>{t.bank.resetFilters}</span>
                      </button>
                    )}
                  </div>

                  {/* Dropdowns Row */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Difficulty Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <SlidersHorizontal className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{t.bank.diffWord}</span>
                      </label>
                      <select
                        value={bankDifficultyFilter}
                        onChange={(e) => setBankDifficultyFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                      >
                        <option value="all">{t.bank.filterAllDiff}</option>
                        <option value="easy">{t.bank.filterEasy}</option>
                        <option value="medium">{t.bank.filterMedium}</option>
                        <option value="hard">{t.bank.filterHard}</option>
                      </select>
                    </div>

                    {/* Bloom Level Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Award className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{t.bank.bloomWord}</span>
                      </label>
                      <select
                        value={bankBloomFilter}
                        onChange={(e) => setBankBloomFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                      >
                        <option value="all">{t.bank.filterAllBloom}</option>
                        <option value="remember">{t.bank.bloomRemember}</option>
                        <option value="understand">{t.bank.bloomUnderstand}</option>
                        <option value="apply">{t.bank.bloomApply}</option>
                        <option value="analyze">{t.bank.bloomAnalyze}</option>
                        <option value="evaluate">{t.bank.bloomEvaluate}</option>
                        <option value="create">{t.bank.bloomCreate}</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-2.5" : "left-2.5"}`} />
                    <input
                      type="text"
                      value={bankSearchQuery}
                      onChange={(e) => setBankSearchQuery(e.target.value)}
                      placeholder={t.bank.searchPlaceholder}
                      className={`w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl py-1.5 ${
                        isRtl ? "pr-8 pl-2.5" : "pl-8 pr-2.5"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>

                  {/* Active filter counter & tags */}
                  {hasActiveBankFilters && (
                    <div className="pt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600 font-bold border-t border-slate-200/80">
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                        {isRtl
                          ? `عرض ${filteredQuestionsList.length} من ${questionsList.length}`
                          : `Showing ${filteredQuestionsList.length} of ${questionsList.length}`}
                      </span>
                      {bankDifficultyFilter !== "all" && (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                          <span>
                            {bankDifficultyFilter === "easy"
                              ? t.bank.filterEasy
                              : bankDifficultyFilter === "medium"
                              ? t.bank.filterMedium
                              : t.bank.filterHard}
                          </span>
                          <button
                            type="button"
                            onClick={() => setBankDifficultyFilter("all")}
                            className="hover:text-amber-950 font-black cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {bankBloomFilter !== "all" && (
                        <span className="bg-indigo-50 text-indigo-900 border border-indigo-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                          <span>
                            {bankBloomFilter === "remember"
                              ? t.bank.bloomRemember
                              : bankBloomFilter === "understand"
                              ? t.bank.bloomUnderstand
                              : bankBloomFilter === "apply"
                              ? t.bank.bloomApply
                              : bankBloomFilter === "analyze"
                              ? t.bank.bloomAnalyze
                              : bankBloomFilter === "evaluate"
                              ? t.bank.bloomEvaluate
                              : bankBloomFilter === "create"
                              ? t.bank.bloomCreate
                              : bankBloomFilter}
                          </span>
                          <button
                            type="button"
                            onClick={() => setBankBloomFilter("all")}
                            className="hover:text-indigo-950 font-black cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {questionsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[160px] text-center text-xs text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 opacity-80" />
                  <p className="font-medium text-slate-700">{t.bank.emptyTitle}</p>
                  <p className="text-[10px] text-slate-400 max-w-[200px]">
                    {t.bank.emptySub}
                  </p>
                </div>
              ) : filteredQuestionsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                  <Filter className="w-6 h-6 text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">{t.bank.noFilteredResults}</p>
                  <button
                    type="button"
                    onClick={handleResetBankFilters}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    {t.bank.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pe-1">
                  {filteredQuestionsList.map((q, idx) => (
                    <div
                      key={q.id}
                      className="group border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 hover:bg-slate-50 transition-colors relative"
                    >
                      <button
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="absolute top-2 end-2 text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {t.bank.deleteBtn}
                      </button>

                      <div className="text-[10px] text-slate-500 font-bold mb-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>
                          {t.bank.itemWord} {idx + 1} · {t.bank.bloomWord}: {q.bloom} · {t.bank.diffWord}: {q.difficulty}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          p: {typeof q.difficultyIndex === "number" ? `${Math.round(q.difficultyIndex * 100)}%` : "60%"}
                        </span>
                        <span className="text-indigo-700 font-bold">
                          D: {typeof q.discriminationIndex === "number" ? q.discriminationIndex.toFixed(2) : "0.42"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-2 pe-12 ps-1 leading-relaxed">
                        {q.stem}
                      </p>

                      {q.qType === "essay" && q.rubrics && q.rubrics.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md w-fit">
                          <Award className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>
                            {isRtl
                              ? `سلم تقدير: ${q.rubrics.length} معايير (${q.rubrics.reduce((s, r) => s + (Number(r.points) || 0), 0)} درجات)`
                              : `Rubric: ${q.rubrics.length} criteria (${q.rubrics.reduce((s, r) => s + (Number(r.points) || 0), 0)} pts)`}
                          </span>
                        </div>
                      )}

                      {/* Quality Hints Counter Badge */}
                      <div className="mt-2.5">
                        <QualityHintsBadge
                          question={q}
                          lang={lang}
                          onClick={() => setSelectedAdviceQuestion(q)}
                        />
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleAutomateBankQuestion(q.id)}
                          disabled={automatingBankId === q.id}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300/90 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          title={isRtl ? "تشغيل الأتمتة الشاملة وضبط المعايرة للبند" : "Run Comprehensive Automation on this item"}
                        >
                          {automatingBankId === q.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          )}
                          <span>{isRtl ? "الأتمتة الشاملة" : "Auto-Pilot"}</span>
                        </button>

                        <button
                          onClick={() => setSelectedAdviceQuestion(q)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/90 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
                          title={isRtl ? "مساعدة ذكية وتوصيات الجودة بالسؤال" : "Smart advice and quality tips"}
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
                          <span>{isRtl ? "تلميحات الجودة" : "Quality Hints"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFullscreenFocusQuestion({ q, index: idx })}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300/90 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
                          title={isRtl ? "معاينة السؤال وضبط معايير البناء والصياغة" : "Item Preview & Construction Studio"}
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isRtl ? "معاينة وضبط الصياغة (المرحلة 2)" : "Item Review (Stage 2)"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {questionsList.length > 0 && (
                <button
                  onClick={() => {
                    setCurrentAxis("4");
                    setTimeout(() => scrollToSection("interactive-board"), 200);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {t.bank.exportBtn}
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Platform & User Usage Statistics and Intellectual Property Footer */}
      <PlatformStatsFooter
        lang={lang}
        questionsList={questionsList}
        userEmail={userEmail}
        loginCount={loginCount}
        onOpenUserStats={() => setIsUserStatsOpen(true)}
        onResetLoginStats={handleResetLoginStats}
      />

      {/* Smart Advice Modal Dialog */}
      {selectedAdviceQuestion && (() => {
        const qualityReport = evaluateQuestionQuality(selectedAdviceQuestion, isRtl);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white flex items-center justify-between border-b border-amber-400">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-100">
                  <Sparkles className="w-5 h-5 fill-amber-200" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base">
                    {isRtl ? "مؤشر جودة السؤال والتلميحات التربوية" : "Question Quality Meter & Pedagogical Hints"}
                  </h3>
                  <p className="text-[11px] text-amber-100 font-medium">
                    {isRtl ? "مراجعة استيفاء معايير الجودة السيكومترية واللغوية للبند" : "Psychometric and linguistic quality standards checklist"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdviceQuestion(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Quality Score Meter Banner */}
              <div className="p-4 rounded-2xl border-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-black tracking-wide text-slate-200">
                      {isRtl ? "معدل استيفاء تلميحات الجودة:" : "Quality Hints Fulfillment:"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                      {isRtl ? qualityReport.statusLabelAr : qualityReport.statusLabelEn}
                    </span>
                    <span className="text-sm font-black text-amber-300">
                      {qualityReport.fulfilledCount} / {qualityReport.totalCount} ({qualityReport.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      qualityReport.status === "excellent"
                        ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                        : qualityReport.status === "good"
                        ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                        : "bg-gradient-to-r from-rose-400 to-amber-400"
                    }`}
                    style={{ width: `${Math.max(6, qualityReport.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Question Stem Box */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span>{isRtl ? "نص السؤال الحالي:" : "Current Question Stem:"}</span>
                  <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                    {selectedAdviceQuestion.qType.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">
                  {selectedAdviceQuestion.stem}
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                  <span className="bg-blue-50 text-blue-700 font-bold border border-blue-200 px-2 py-0.5 rounded-md">
                    {isRtl ? "بلوم:" : "Bloom:"} {selectedAdviceQuestion.bloom}
                  </span>
                  <span className="bg-violet-50 text-violet-700 font-bold border border-violet-200 px-2 py-0.5 rounded-md">
                    {isRtl ? "الصعوبة:" : "Difficulty:"} {selectedAdviceQuestion.difficulty}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 px-2 py-0.5 rounded-md">
                    {isRtl ? "السهولة (p):" : "Facility (p):"}{" "}
                    {typeof selectedAdviceQuestion.difficultyIndex === "number"
                      ? `${Math.round(selectedAdviceQuestion.difficultyIndex * 100)}%`
                      : "60%"}
                  </span>
                  <span className="bg-indigo-50 text-indigo-800 font-bold border border-indigo-200 px-2 py-0.5 rounded-md">
                    {isRtl ? "التمييز (D):" : "Discrimination (D):"}{" "}
                    {typeof selectedAdviceQuestion.discriminationIndex === "number"
                      ? selectedAdviceQuestion.discriminationIndex.toFixed(2)
                      : "0.42"}
                  </span>
                </div>
              </div>

              {/* Unfulfilled Quality Hints (Actionable suggestions to improve) */}
              {qualityReport.unfulfilledHints.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs border-b border-rose-200 pb-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>
                      {isRtl
                        ? `تلميحات الجودة المتبقية للتحسين (${qualityReport.unfulfilledHints.length} تلميحات):`
                        : `Pending Quality Hints to Address (${qualityReport.unfulfilledHints.length} items):`}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {qualityReport.unfulfilledHints.map((hint, hIdx) => (
                      <div
                        key={hIdx}
                        className="p-3 bg-rose-50/70 border-2 border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-950 leading-relaxed shadow-2xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          !
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-rose-950">
                            {isRtl ? hint.titleAr : hint.titleEn}
                          </div>
                          <div className="text-[11px] text-rose-800/90 font-medium">
                            {isRtl ? hint.descAr : hint.descEn}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fulfilled Quality Criteria */}
              {qualityReport.fulfilledHints.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs border-b border-emerald-200 pb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isRtl
                        ? `معايير وتلميحات الجودة المستوفاة بنجاح (${qualityReport.fulfilledHints.length} معياراً):`
                        : `Fulfilled Quality Criteria (${qualityReport.fulfilledHints.length} items):`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {qualityReport.fulfilledHints.map((hint, hIdx) => (
                      <div
                        key={hIdx}
                        className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2 text-[11px] text-emerald-950 font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>{isRtl ? hint.titleAr : hint.titleEn}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options review if available */}
              {selectedAdviceQuestion.options && selectedAdviceQuestion.options.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block">
                    {isRtl ? "الخيارات والبدائل المتاحة:" : "Options & Distractors:"}
                  </span>
                  <div className="flex flex-col gap-2 text-xs">
                    {selectedAdviceQuestion.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border font-medium flex items-center gap-2 ${
                          opt === selectedAdviceQuestion.correctAnswer
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="text-slate-500 font-bold w-16 shrink-0">
                          {isRtl ? `الخيار ${oIdx + 1}:` : `Option ${oIdx + 1}:`}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {opt === selectedAdviceQuestion.correctAnswer && (
                          <span className="ms-1.5 text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md shrink-0">
                            {isRtl ? "المفتاح الصحيح" : "Key"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedAdviceQuestion(null)}
                className="px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {isRtl ? "إغلاق" : "Close"}
              </button>

              <button
                onClick={() => {
                  setSelectedAdviceQuestion(null);
                  setCurrentAxis("2");
                  setTimeout(() => {
                    const el = document.getElementById("interactive-board");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 200);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all border-2 border-blue-500/30"
              >
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>{isRtl ? "تحسين وتطوير هذا السؤال في وحدة التحكيم" : "Improve in Refinement Unit"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* 5. User Analytics & Activity Statistics Modal */}
      <UserStatsModal
        isOpen={isUserStatsOpen}
        onClose={() => setIsUserStatsOpen(false)}
        userEmail={userEmail}
        questionsList={questionsList}
        lang={lang}
        loginCount={loginCount}
      />

      {/* 6. Share Quiz Modal (Link & QR Code) */}
      <ShareQuizModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        questionsList={questionsList}
        lang={lang}
        onOpenReadOnlyViewer={(list) => {
          setCustomSharedQuestions(list);
          setIsReadOnlyViewerOpen(true);
        }}
      />

      {/* 7. Student & Faculty Read-Only Quiz Viewer */}
      <ReadOnlyQuizViewerModal
        isOpen={isReadOnlyViewerOpen}
        onClose={() => {
          setIsReadOnlyViewerOpen(false);
          setCustomSharedQuestions(null);
        }}
        questionsList={customSharedQuestions || questionsList}
        lang={lang}
      />

      {/* 8. Fullscreen Single-Item Review & Pedagogical Studio Modal */}
      {fullscreenFocusQuestion && (
        <FullscreenQuestionReviewModal
          isOpen={!!fullscreenFocusQuestion}
          onClose={() => setFullscreenFocusQuestion(null)}
          question={fullscreenFocusQuestion.q}
          questionsList={questionsList}
          currentIndex={fullscreenFocusQuestion.index}
          onNavigate={(newIdx) => {
            if (questionsList[newIdx]) {
              setFullscreenFocusQuestion({ q: questionsList[newIdx], index: newIdx });
            }
          }}
          onSaveQuestion={(updated) => {
            setQuestionsList((prev) =>
              prev.map((it) => (it.id === updated.id ? updated : it))
            );
            setFullscreenFocusQuestion({ q: updated, index: fullscreenFocusQuestion.index });
          }}
          lang={lang}
          reviewStage={currentAxis === "3" ? 3 : currentAxis === "2" ? 2 : 1}
        />
      )}

      {/* 9. Global Multi-Question Batch Audit & Pipeline Modal */}
      {isGlobalBatchAuditOpen && (
        <BatchAuditModal
          isOpen={isGlobalBatchAuditOpen}
          onClose={() => setIsGlobalBatchAuditOpen(false)}
          questions={questionsList}
          onApplyBatchUpdates={(updatedList) => {
            setQuestionsList(updatedList);
          }}
          lang={lang}
          currentStage={currentAxis as any}
        />
      )}
    </div>
  );
}
