import React from "react";
import { Check, Layers } from "lucide-react";
import { Language, translations } from "../translations";

interface BloomPyramidProps {
  lang: Language;
}

export default function BloomPyramid({ lang }: BloomPyramidProps) {
  const t = translations[lang].bloom;

  const gradients = [
    { gradient: "from-violet-600 via-indigo-600 to-blue-600", border: "border-violet-500/30" },
    { gradient: "from-blue-600 to-indigo-600", border: "border-blue-500/30" },
    { gradient: "from-indigo-600 to-violet-600", border: "border-indigo-500/30" },
    { gradient: "from-blue-500 to-indigo-600", border: "border-blue-400/30" },
    { gradient: "from-indigo-500 to-slate-800", border: "border-indigo-400/30" },
    { gradient: "from-slate-800 to-slate-900", border: "border-slate-700/30" },
  ];

  return (
    <section id="bloom-section" className="py-16 bg-slate-50/80 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6 text-start">
            <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full tracking-wider uppercase inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {t.badge}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {t.heading}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.subheading}
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-start text-sm sm:text-base text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>{t.check1}</span>
              </div>
              <div className="flex gap-3 items-start text-sm sm:text-base text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>{t.check2}</span>
              </div>
            </div>
          </div>

          {/* Pyramid Bar Display */}
          <div className="lg:col-span-7 space-y-3">
            {t.levels.map((level, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-r ${gradients[idx % gradients.length].gradient} text-white rounded-xl px-6 py-3.5 flex items-center justify-between shadow-md hover:shadow-lg hover:-translate-x-1 transition-all duration-200 border ${gradients[idx % gradients.length].border} cursor-default select-none`}
              >
                <div className="flex flex-col text-start">
                  <span className="font-display font-bold text-lg leading-tight">{level.name}</span>
                  <span className="text-xs text-white/85 font-light mt-0.5">{level.desc}</span>
                </div>
                <span className="font-display text-2xl font-bold text-white/30">0{6 - idx}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
