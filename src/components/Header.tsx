import React from "react";
import { LogOut, ShieldCheck, Globe, BarChart2, Share2 } from "lucide-react";
import Logo from "./Logo";
import { Language, translations } from "../translations";

interface HeaderProps {
  onLogout: () => void;
  userEmail: string;
  lang: Language;
  onToggleLang: () => void;
  onOpenUserStats?: () => void;
  onOpenShareModal?: () => void;
}

export default function Header({
  onLogout,
  userEmail,
  lang,
  onToggleLang,
  onOpenUserStats,
  onOpenShareModal,
}: HeaderProps) {
  const t = translations[lang].nav;
  const isRtl = lang === "ar";

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-blue-500/20 shadow-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Title */}
          <Logo size="md" showText={true} lang={lang} />

          {/* User Email & Control Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Share Quiz Button */}
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 border border-emerald-400/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={isRtl ? "مشاركة الاختبار ورمز QR مع الطلاب والأكاديميين" : "Share Quiz & QR Code"}
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-100" />
                <span className="hidden sm:inline">{isRtl ? "مشاركة الاختبار" : "Share Quiz"}</span>
              </button>
            )}

            {/* User Statistics Button */}
            {onOpenUserStats && (
              <button
                type="button"
                onClick={onOpenUserStats}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-blue-300 hover:text-white border border-blue-500/30 font-bold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={isRtl ? "عرض إحصائيات مستخدم التطبيق والأنشطة الأكاديمية" : "View User Analytics & Statistics"}
              >
                <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{isRtl ? "إحصائيات المستخدم" : "User Stats"}</span>
              </button>
            )}

            {userEmail && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400">{t.verifiedSession}</span>
                  <span className="text-white font-semibold text-xs">{userEmail}</span>
                </div>
              </div>
            )}

            {/* Language Switch Button EN / AR */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={t.langTitle}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.langBtn}</span>
            </button>

            {userEmail && (
              <button
                onClick={onLogout}
                className="text-xs bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-medium"
                title={t.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.logout}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
