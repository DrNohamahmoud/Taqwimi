import React, { useState } from "react";
import {
  Lock,
  Mail,
  KeyRound,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Globe,
  Users,
  Target,
  Award,
  CheckCircle2,
  Info,
  BookOpen,
  GraduationCap,
  Copyright,
  ShieldCheck,
} from "lucide-react";
import Logo from "./Logo";
import { Language, translations } from "../translations";

interface LoginGateProps {
  onLoginSuccess: (email: string) => void;
  lang: Language;
  onToggleLang: () => void;
}

export default function LoginGate({ onLoginSuccess, lang, onToggleLang }: LoginGateProps) {
  const t = translations[lang].login;
  const isRtl = lang === "ar";

  const [viewMode, setViewMode] = useState<"intro" | "login">("intro");
  const [email, setEmail] = useState("academic.reviewer@cu.edu.eg");
  const [password, setPassword] = useState("••••••••");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError(t.emailReqErr);
      return;
    }

    const emailLower = email.trim().toLowerCase();
    const hasAcademicDomain =
      emailLower.endsWith(".edu") ||
      emailLower.endsWith(".edu.eg") ||
      emailLower.endsWith(".ac.uk") ||
      emailLower.includes("cu.edu.eg") ||
      emailLower.includes("eun.eg");

    if (!hasAcademicDomain) {
      setError(t.domainErr);
      return;
    }

    if (password.length < 4) {
      setError(t.passLenErr);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email.trim());
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background soft ambient radial highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_600px_at_50%_-20%,rgba(59,130,246,0.25),transparent)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_50%_120%,rgba(139,92,246,0.2),transparent)] pointer-events-none"></div>

      {/* Language switcher top right */}
      <div className="absolute top-6 end-6 z-20">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition-all cursor-pointer shadow-lg"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{lang === "ar" ? "En" : "عربي"}</span>
        </button>
      </div>

      <div className={`w-full relative z-10 space-y-6 transition-all duration-300 ${viewMode === "intro" ? "max-w-3xl" : "max-w-md"}`}>
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="xl" showText={false} lang={lang} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {lang === "ar" ? "تقويمي" : "Taqwimi"}
          </h1>
          <p className="text-xs text-blue-400 font-bold tracking-wider uppercase">
            TAQWIMI • ACADEMIC EVALUATION & QUESTION VETTING
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-900/90 border border-slate-800/90 rounded-2xl p-1.5 backdrop-blur-md shadow-xl max-w-md mx-auto">
          <button
            onClick={() => setViewMode("intro")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              viewMode === "intro"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Info className={`w-4 h-4 ${viewMode === "intro" ? "text-blue-200" : "text-slate-400"}`} />
            <span>{t.introTab}</span>
          </button>
          <button
            onClick={() => setViewMode("login")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              viewMode === "login"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Lock className={`w-4 h-4 ${viewMode === "login" ? "text-violet-200" : "text-slate-400"}`} />
            <span>{t.loginTab}</span>
          </button>
        </div>

        {/* VIEW 1: INTRODUCTORY INTERFACE (اسم التطبيق + الفئة المستهدفة + الهدف منه) */}
        {viewMode === "intro" && (
          <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative space-y-8 text-start animate-fade-in">
            {/* Title & Badge */}
            <div className="space-y-2 border-b border-slate-800/80 pb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-950/80 border border-blue-800/80 px-3.5 py-1 rounded-full uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                {isRtl ? "اسم التطبيق: منصة «تقويمي» الأكاديمية" : "Application: Taqwimi Academic Platform"}
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white pt-1">
                {t.aboutTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {t.aboutSubtitle}
              </p>
            </div>

            {/* Target Audience & Goals Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card A: Target Audience */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-inner hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      {t.targetAudienceTitle}
                    </h3>
                    <p className="text-[10px] text-blue-300 font-bold">
                      {isRtl ? "المستخدمون والجهات المعنية" : "Intended Academic Users"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.targetAudienceDesc}
                </p>

                <ul className="space-y-2 pt-1">
                  {t.targetAudienceItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card B: Core Purpose & Goals */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-inner hover:border-violet-500/50 transition-colors">
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      {t.goalsTitle}
                    </h3>
                    <p className="text-[10px] text-violet-300 font-bold">
                      {isRtl ? "الغايات والوظائف الأكاديمية" : "Primary Objectives & Functions"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.goalsDesc}
                </p>

                <ul className="space-y-2 pt-1">
                  {t.goalsItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-200 font-medium">
                      <Award className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action CTA Button to Login */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>
                  {isRtl
                    ? "المنصة متوافقة مع متطلبات جامعة القاهرة والجامعات والمؤسسات التعليمية"
                    : "Fully aligned with university & educational accreditation standards"}
                </span>
              </div>

              <button
                onClick={() => setViewMode("login")}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/10"
              >
                <span>{t.proceedToLoginBtn}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: LOGIN FORM */}
        {viewMode === "login" && (
          <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative space-y-6 animate-fade-in">
            <div className="space-y-1 text-start">
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-400" />
                {t.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              <div>
                <label htmlFor="loginEmail" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    id="loginEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full ps-10 pe-3 py-3 border border-slate-800 rounded-xl text-xs bg-slate-950 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all dir-ltr font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="loginPass" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    id="loginPass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full ps-10 pe-3 py-3 border border-slate-800 rounded-xl text-xs bg-slate-950 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all dir-ltr font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className="flex gap-2 items-start text-xs text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-800/60 leading-relaxed font-medium">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/10"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    {t.authenticating}
                  </>
                ) : (
                  <>
                    {t.submitBtn}
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>

            {/* Intellectual Property Card in Login Form */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 border border-indigo-500/30 flex items-center gap-3 text-start shadow-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
                <GraduationCap className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    {isRtl ? "حقوق الملكية الفكرية" : "Intellectual Property"}
                  </span>
                  <span className="text-xs font-black text-white font-display">
                    {isRtl ? "أ.م.د/ نهى محمود أحمد" : "Assoc. Prof. Dr. Noha Mahmoud Ahmed"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-semibold">
                  {isRtl
                    ? "أستاذ مساعد تكنولوجيا التعليم · كلية الدراسات العليا للتربية - جامعة القاهرة"
                    : "Associate Professor of Educational Technology · Faculty of Graduate Studies for Education - Cairo University"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isRtl
                    ? "تقويمي © ٢٠٢٦ جميع الحقوق محفوظة"
                    : "Taqwimi © 2026 All Rights Reserved"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

