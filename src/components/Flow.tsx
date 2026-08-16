import React from "react";
import { PenTool, CheckSquare, ShieldCheck, Layers } from "lucide-react";
import { Language, translations } from "../translations";

interface FlowProps {
  lang: Language;
  onSelectAxis?: (axis: string) => void;
}

export default function Flow({ lang, onSelectAxis }: FlowProps) {
  const t = translations[lang].flow;

  const steps = [
    {
      ...t.step1,
      icon: <PenTool className="w-5 h-5" />,
      color: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      ...t.step2,
      icon: <CheckSquare className="w-5 h-5" />,
      color: "from-indigo-600 to-violet-600",
      accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      ...t.step3,
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "from-violet-600 to-purple-600",
      accentBg: "bg-violet-50 text-violet-700 border-violet-200",
    },
    {
      ...t.step4,
      icon: <Layers className="w-5 h-5" />,
      color: "from-blue-700 via-indigo-700 to-violet-700",
      accentBg: "bg-blue-50 text-blue-800 border-blue-300",
    },
  ];

  return (
    <section id="flow-section" className="py-16 bg-slate-50/80 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full tracking-wider uppercase">
            {t.badge}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-3">
            {t.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {t.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => onSelectAxis && onSelectAxis(`${idx + 1}`)}
              className="bg-white rounded-2xl p-6 border-2 border-slate-200/80 hover:shadow-xl hover:border-blue-400 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 shadow-sm cursor-pointer"
            >
              {/* Highlight gradient top border */}
              <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${step.color}`}></div>

              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${step.accentBg}`}>
                  {step.stage}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r ${step.color} text-white shadow-md group-hover:scale-110 transition-all`}>
                  {step.icon}
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {step.desc}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-800">
                <span>{lang === "ar" ? "الانتقال لهذا المحور ↵" : "Go to this axis ↵"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
