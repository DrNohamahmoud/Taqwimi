import React from "react";
import { CheckCircle2, BookOpen } from "lucide-react";
import { Language, translations } from "../translations";

interface QuestionTypesProps {
  lang: Language;
}

export default function QuestionTypes({ lang }: QuestionTypesProps) {
  const t = translations[lang].types;

  const types = [
    {
      title: t.mcqTitle,
      desc: t.mcqDesc,
      tag: t.mcqTag,
      accentColor: "border-blue-500/30 bg-blue-50/70 text-blue-700",
      rules: t.mcqRules,
    },
    {
      title: t.tfTitle,
      desc: t.tfDesc,
      tag: t.tfTag,
      accentColor: "border-indigo-500/30 bg-indigo-50/70 text-indigo-700",
      rules: t.tfRules,
    },
    {
      title: t.fillTitle,
      desc: t.fillDesc,
      tag: t.fillTag,
      accentColor: "border-violet-500/30 bg-violet-50/70 text-violet-700",
      rules: t.fillRules,
    },
    {
      title: t.matchingTitle,
      desc: t.matchingDesc,
      tag: t.matchingTag,
      accentColor: "border-emerald-500/30 bg-emerald-50/70 text-emerald-700",
      rules: t.matchingRules,
    },
    {
      title: t.orderingTitle,
      desc: t.orderingDesc,
      tag: t.orderingTag,
      accentColor: "border-amber-500/30 bg-amber-50/70 text-amber-700",
      rules: t.orderingRules,
    },
    {
      title: t.diagramTitle,
      desc: t.diagramDesc,
      tag: t.diagramTag,
      accentColor: "border-rose-500/30 bg-rose-50/70 text-rose-700",
      rules: t.diagramRules,
    },
  ];

  return (
    <section id="question-types" className="py-16 bg-blue-50/30 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full tracking-wider uppercase inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {t.badge}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-3">
            {t.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {t.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">{type.title}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${type.accentColor}`}>
                    {type.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">{type.desc}</p>
                <ul className="space-y-2.5">
                  {type.rules.map((rule, rIdx) => (
                    <li key={rIdx} className="flex gap-2 items-start text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
