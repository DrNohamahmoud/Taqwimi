import React, { useState } from "react";
import { Grid, FileText, BarChart3, Download, Plus, Trash2, CheckCircle2, Printer, Share2, Clock } from "lucide-react";
import { Question, PsychometricsInput, PsychometricsResult } from "../types";
import { Language, translations } from "../translations";
import ExamTimeCalculator from "./ExamTimeCalculator";

interface SupportToolsProps {
  questionsList: Question[];
  lang: Language;
  onRestartPipeline?: () => void;
  onOpenShareModal?: () => void;
}

export default function SupportTools({
  questionsList,
  lang,
  onRestartPipeline,
  onOpenShareModal,
}: SupportToolsProps) {
  const t = translations[lang].support;
  const isRtl = lang === "ar";

  // Exam Duration state (customized or auto-recommended by ExamTimeCalculator)
  const [customExamTime, setCustomExamTime] = useState(
    isRtl ? "زمن الاختبار: ساعتان" : "Exam Time: 2 Hours"
  );

  // Matrix calculation state
  const [matrixTopics, setMatrixTopics] = useState(
    isRtl
      ? "الفصل الأول: المفاهيم الأساسية للقياس والتقويم\nالفصل الثاني: القواعد التربوية لصياغة الأسئلة الموضوعية\nالفصل الثالث: تحليل النتائج والمعاملات الإحصائية"
      : "Unit 1: Fundamentals of Measurement & Assessment\nUnit 2: Pedagogical Rules for Objective Item Writing\nUnit 3: Item Analysis & Statistical Indices"
  );
  const [matrixTotalCount, setMatrixTotalCount] = useState(30);
  const [matrixLowWeight, setMatrixLowWeight] = useState(40); // 40% Lower Bloom
  const [matrixHighWeight, setMatrixHighWeight] = useState(60); // 60% Higher Bloom
  const [matrixResult, setMatrixResult] = useState<any[]>([]);

  // Export state
  const [examTitle, setExamTitle] = useState(
    isRtl
      ? "الاختبار النهائي لمقرر القياس والتقويم التربوي - العام الجامعي ٢٠٢٦"
      : "Final Examination: Educational Assessment & Measurement - Academic Year 2026"
  );
  const [exportMessage, setExportMessage] = useState("");

  // Psychometrics state
  const [psyRows, setPsyRows] = useState<PsychometricsInput[]>([
    { id: "1", questionCode: "س1", totalStudents: 100, correctAll: 75, correctHigh: 25, correctLow: 10, groupSizeN: 27 },
    { id: "2", questionCode: "س2", totalStudents: 100, correctAll: 45, correctHigh: 22, correctLow: 5, groupSizeN: 27 },
  ]);
  const [psyResults, setPsyResults] = useState<PsychometricsResult[]>([]);

  // Calculate Specification Matrix
  const handleCalculateMatrix = () => {
    const topicsArr = matrixTopics
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    if (topicsArr.length === 0) return;

    const topicWeight = 100 / topicsArr.length;
    const itemsPerTopic = Math.round(matrixTotalCount / topicsArr.length);

    const calculated = topicsArr.map((topic) => {
      const lowItems = Math.round(itemsPerTopic * (matrixLowWeight / 100));
      const highItems = itemsPerTopic - lowItems;
      return {
        topic,
        topicWeight: topicWeight.toFixed(1),
        lowItems,
        highItems,
        totalItems: itemsPerTopic,
      };
    });

    setMatrixResult(calculated);
  };

  // Export Word Document
  const handleExportWord = () => {
    if (questionsList.length === 0) {
      setExportMessage(t.exportEmptyErr);
      return;
    }

    let docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${examTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: ${isRtl ? "rtl" : "ltr"}; text-align: ${isRtl ? "right" : "left"}; padding: 20px; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #2563eb; padding-bottom: 10px; font-size: 22px; }
          .q-box { margin-bottom: 25px; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc; }
          .q-stem { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #0f172a; }
          .q-options { margin-inline-start: 20px; }
          .q-opt { margin-bottom: 6px; font-size: 14px; color: #334155; }
          .q-meta { font-size: 11px; color: #64748b; margin-top: 10px; font-style: italic; }
        </style>
      </head>
      <body>
        <h1>${examTitle}</h1>
        <p><strong>${isRtl ? "إجمالي عدد الأسئلة:" : "Total Items:"}</strong> ${questionsList.length} &nbsp;|&nbsp; <strong>${isRtl ? "الزمن المخصص:" : "Exam Duration:"}</strong> ${customExamTime}</p>
        <hr />
        <br />
    `;

    questionsList.forEach((q, idx) => {
      docContent += `
        <div class="q-box">
          <div class="q-stem">${idx + 1}. ${q.stem}</div>
      `;

      if (q.imageUrl) {
        docContent += `<div style="margin: 10px 0;"><img src="${q.imageUrl}" style="max-width: 450px; max-height: 300px; border: 1px solid #cbd5e1; border-radius: 6px;" alt="Diagram" /></div>`;
      }

      if ((q.qType === "mcq" || q.qType === "multi_mcq" || q.qType === "matching" || q.qType === "ordering" || q.qType === "diagram_labeling") && q.options) {
        docContent += `<div class="q-options">`;
        q.options.forEach((opt, oIdx) => {
          docContent += `<div class="q-opt">(${String.fromCharCode(isRtl ? 1571 + oIdx : 65 + oIdx)}) ${opt}</div>`;
        });
        docContent += `</div>`;
      } else if (q.qType === "tf") {
        docContent += `<div class="q-options">
          <div class="q-opt">(   ) ${isRtl ? "صواب" : "True"}</div>
          <div class="q-opt">(   ) ${isRtl ? "خطأ" : "False"}</div>
        </div>`;
      } else if (q.qType === "essay" && q.rubrics && q.rubrics.length > 0) {
        const totalPts = q.rubrics.reduce((acc, r) => acc + (Number(r.points) || 0), 0);
        docContent += `
          <div style="margin-top: 10px; padding: 8px; border: 1px solid #93c5fd; border-radius: 6px; background-color: #eff6ff;">
            <div style="font-weight: bold; color: #1e40af; font-size: 13px; margin-bottom: 5px;">
              ${isRtl ? "سلم التقدير المعياري (Scoring Rubric)" : "Scoring Rubric"} - ${isRtl ? `إجمالي الدرجات: ${totalPts}` : `Total Points: ${totalPts}`}
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background-color: #dbeafe; color: #1e3a8a;">
                  <th style="border: 1px solid #bfdbfe; padding: 4px; text-align: ${isRtl ? "right" : "left"}; width: 30px;">#</th>
                  <th style="border: 1px solid #bfdbfe; padding: 4px; text-align: ${isRtl ? "right" : "left"};">${isRtl ? "معيار التقييم" : "Criterion"}</th>
                  <th style="border: 1px solid #bfdbfe; padding: 4px; text-align: ${isRtl ? "right" : "left"};">${isRtl ? "مؤشرات التحقق والأدلة" : "Indicators"}</th>
                  <th style="border: 1px solid #bfdbfe; padding: 4px; text-align: center; width: 60px;">${isRtl ? "الدرجة" : "Points"}</th>
                </tr>
              </thead>
              <tbody>
                ${q.rubrics.map((r, rIdx) => `
                  <tr>
                    <td style="border: 1px solid #bfdbfe; padding: 4px; text-align: center; font-weight: bold;">${rIdx + 1}</td>
                    <td style="border: 1px solid #bfdbfe; padding: 4px; font-weight: bold;">${r.criterion}</td>
                    <td style="border: 1px solid #bfdbfe; padding: 4px; color: #475569;">${r.description || "-"}</td>
                    <td style="border: 1px solid #bfdbfe; padding: 4px; text-align: center; font-weight: bold; color: #1e40af;">${r.points}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `;
      }

      docContent += `
          <div class="q-meta">${isRtl ? "مستوى بلوم:" : "Bloom Level:"} ${q.bloom} | ${isRtl ? "مستوى الصعوبة:" : "Difficulty:"} ${q.difficulty}</div>
        </div>
      `;
    });

    docContent += `</body></html>`;

    const blob = new Blob(["\ufeff", docContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${examTitle.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportMessage(t.exportSuccess);
  };

  // Print Exam Paper
  const handlePrintExam = () => {
    if (questionsList.length === 0) {
      setExportMessage(t.printEmptyErr);
      return;
    }
    setExportMessage("");
    window.print();
  };

  // Calculate Psychometrics
  const handleCalculatePsychometrics = () => {
    const res: PsychometricsResult[] = psyRows.map((row) => {
      // p = correctAll / totalStudents
      const p = row.totalStudents > 0 ? row.correctAll / row.totalStudents : 0;
      // D = (correctHigh - correctLow) / groupSizeN
      const D = row.groupSizeN > 0 ? (row.correctHigh - row.correctLow) / row.groupSizeN : 0;

      let diffEval = isRtl ? "مقبول (متوسط)" : "Moderate";
      if (p > 0.8) diffEval = isRtl ? "سهل جداً" : "Very Easy";
      else if (p < 0.3) diffEval = isRtl ? "صعب جداً" : "Very Hard";

      let discEval = isRtl ? "ممتاز (تمييز مرتفع)" : "Excellent Discrimination";
      if (D < 0.2) discEval = isRtl ? "ضعيف (يلزم مراجعة السند أو تعديله)" : "Weak (Needs Revision)";
      else if (D < 0.3) discEval = isRtl ? "مقبول" : "Acceptable";

      return {
        questionCode: row.questionCode,
        pIndex: parseFloat(p.toFixed(2)),
        dIndex: parseFloat(D.toFixed(2)),
        difficultyEval: diffEval,
        discriminationEval: discEval,
      };
    });

    setPsyResults(res);
  };

  const handleAddPsyRow = () => {
    const nextNum = psyRows.length + 1;
    setPsyRows([
      ...psyRows,
      {
        id: String(nextNum),
        questionCode: isRtl ? `س${nextNum}` : `Q${nextNum}`,
        totalStudents: 100,
        correctAll: 50,
        correctHigh: 20,
        correctLow: 8,
        groupSizeN: 27,
      },
    ]);
  };

  const handleDeletePsyRow = (id: string) => {
    setPsyRows(psyRows.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-12">
      {/* 0. Automated Workflow Pipeline Completion Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {isRtl ? "المرحلة الرابعة الأكاديمية" : "Stage 4 Academic"}
                </span>
                <span className="text-[10px] font-bold text-slate-300">
                  {questionsList.length} / 300 {isRtl ? "سؤال معتمد بالبنك" : "Items in Bank (Max 300)"}
                </span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white mt-0.5">
                {isRtl
                  ? "أدوات الاعتماد والتصدير وإعداد تقرير الاختبار (المرحلة 4)"
                  : "Accreditation, Export & Test Specification Tools (Stage 4)"}
              </h3>
            </div>
          </div>

          {onRestartPipeline && (
            <button
              type="button"
              onClick={onRestartPipeline}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              {isRtl ? "بدء دورة جديدة من المرحلة الأولى ←" : "Start New Cycle from Stage 1 →"}
            </button>
          )}
        </div>

        {/* 4-Stage Automated Progress Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 border border-emerald-500/40 p-2.5 rounded-xl flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
              ✓
            </span>
            <div>
              <span className="font-bold text-emerald-300 block text-[11px]">{isRtl ? "1. التوليد والصياغة" : "1. Generation"}</span>
              <span className="text-[10px] text-slate-400">{isRtl ? "اكتمل بنجاح" : "Completed"}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/40 p-2.5 rounded-xl flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
              ✓
            </span>
            <div>
              <span className="font-bold text-emerald-300 block text-[11px]">{isRtl ? "2. التدقيق التحريري" : "2. Editorial Audit"}</span>
              <span className="text-[10px] text-slate-400">{isRtl ? "اكتمل بنجاح" : "Completed"}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/40 p-2.5 rounded-xl flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
              ✓
            </span>
            <div>
              <span className="font-bold text-emerald-300 block text-[11px]">{isRtl ? "3. التحكيم السيكومتري" : "3. Psychometrics"}</span>
              <span className="text-[10px] text-slate-400">{isRtl ? "اكتمل بنجاح" : "Completed"}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border border-blue-400 p-2.5 rounded-xl flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <span className="font-bold text-white block text-[11px]">{isRtl ? "4. التصدير والاعتماد" : "4. Export & Bank"}</span>
              <span className="text-[10px] text-blue-200 font-bold">{isRtl ? "المرحلة الحالية" : "Active Stage"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Estimated Exam Time Calculator Tool */}
      <ExamTimeCalculator
        questionsList={questionsList}
        lang={lang}
        onApplyDurationToExam={(formatted) => setCustomExamTime(formatted)}
      />

      {/* 2. Specification Matrix Tool */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-md space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-200">
          <Grid className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">{t.matrixTitle}</h3>
            <p className="text-xs text-slate-500 font-medium">{t.matrixNote}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label htmlFor="matrixTopics" className="block text-xs font-bold text-slate-900 mb-1.5">
                {t.matrixTopicsLabel}
              </label>
              <textarea
                id="matrixTopics"
                value={matrixTopics}
                onChange={(e) => setMatrixTopics(e.target.value)}
                className="w-full min-h-[120px] p-3 border-2 border-slate-400 rounded-xl text-xs bg-white focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none text-slate-900 font-semibold leading-relaxed shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="flex flex-col justify-between h-full">
                <label htmlFor="matrixTotal" className="min-h-[38px] flex items-end font-bold text-xs text-slate-900 mb-1.5 leading-snug">
                  {t.matrixTotalLabel}
                </label>
                <input
                  type="number"
                  id="matrixTotal"
                  value={matrixTotalCount}
                  onChange={(e) => setMatrixTotalCount(parseInt(e.target.value, 10) || 10)}
                  className="w-full h-11 px-3 border-2 border-slate-400 rounded-xl text-sm text-center text-slate-900 font-extrabold bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all"
                />
              </div>
              <div className="flex flex-col justify-between h-full">
                <label htmlFor="matrixLow" className="min-h-[38px] flex items-end font-bold text-xs text-slate-900 mb-1.5 leading-snug">
                  {t.matrixLowLabel}
                </label>
                <input
                  type="number"
                  id="matrixLow"
                  value={matrixLowWeight}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setMatrixLowWeight(val);
                    setMatrixHighWeight(100 - val);
                  }}
                  className="w-full h-11 px-3 border-2 border-slate-400 rounded-xl text-sm text-center text-slate-900 font-extrabold bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all"
                />
              </div>
              <div className="flex flex-col justify-between h-full">
                <label htmlFor="matrixHigh" className="min-h-[38px] flex items-end font-bold text-xs text-slate-900 mb-1.5 leading-snug">
                  {t.matrixHighLabel}
                </label>
                <input
                  type="number"
                  id="matrixHigh"
                  value={matrixHighWeight}
                  disabled
                  className="w-full h-11 px-3 border-2 border-slate-300 bg-slate-100/90 rounded-xl text-sm text-center text-slate-700 font-extrabold outline-none shadow-xs transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateMatrix}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 border-2 border-blue-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Grid className="w-4 h-4" />
              {t.calcMatrixBtn}
            </button>
          </div>

          <div className="lg:col-span-7">
            {matrixResult.length > 0 ? (
              <div className="overflow-x-auto border-2 border-slate-400 rounded-2xl shadow-sm bg-white">
                <table className="w-full text-xs text-slate-800 text-start">
                  <thead className="bg-slate-900 text-white font-bold border-b-2 border-slate-900">
                    <tr>
                      <th className="p-3 text-start">{t.topicCol}</th>
                      <th className="p-3 text-center">{t.matrixLowLabel}</th>
                      <th className="p-3 text-center">{t.matrixHighLabel}</th>
                      <th className="p-3 text-center bg-blue-900 text-white">{t.totalCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200 bg-white">
                    {matrixResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50">
                        <td className="p-3 font-bold text-slate-900">{row.topic}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{row.lowItems}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{row.highItems}</td>
                        <td className="p-3 text-center font-extrabold bg-blue-50 text-blue-900 border-s-2 border-slate-200">{row.totalItems}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-2 border-slate-400 bg-slate-50/80 rounded-2xl p-8 text-center text-xs text-slate-700 font-bold shadow-sm leading-relaxed">
                {t.matrixEmpty}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Word Export & PDF Printing Tool */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-violet-600" />
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">{t.exportTitle}</h3>
              <p className="text-xs text-slate-500 font-medium">{t.exportSub}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 flex items-center gap-2 cursor-pointer transition-all border-2 border-emerald-400/30"
              >
                <Share2 className="w-4 h-4 text-emerald-100" />
                <span>{isRtl ? "مشاركة الاختبار ورمز QR" : "Share Quiz & QR"}</span>
              </button>
            )}
            <button
              onClick={handlePrintExam}
              className="bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-slate-900/20 flex items-center gap-2 cursor-pointer transition-all border-2 border-slate-800"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              {t.printBtn}
            </button>
            <button
              onClick={handleExportWord}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 active:scale-[0.99] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-violet-600/25 flex items-center gap-2 cursor-pointer transition-all border-2 border-violet-500/30"
            >
              <Download className="w-4 h-4" />
              {t.exportBtn}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="examTitle" className="block text-xs font-bold text-slate-900 mb-1.5">
              {t.exportLabel}
            </label>
            <input
              type="text"
              id="examTitle"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full max-w-2xl p-3 border-2 border-slate-400 rounded-xl text-xs bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-100 focus:outline-none text-slate-900 font-bold shadow-sm"
            />
          </div>

          {exportMessage && (
            <div className={`text-xs p-3.5 rounded-xl border-2 font-bold max-w-2xl ${questionsList.length === 0 ? "bg-rose-50 text-rose-800 border-rose-300" : "bg-blue-50 text-blue-900 border-blue-300"}`}>
              {exportMessage}
            </div>
          )}

          {/* Printable Exam Paper Template */}
          <div className="mt-6 border-2 border-slate-300 rounded-2xl bg-slate-100/70 p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold border-b-2 border-slate-200 pb-2.5">
              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Printer className="w-4 h-4 text-blue-600" />
                {t.printPreviewTitle}
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-extrabold border border-blue-700 shadow-xs">
                {questionsList.length} {t.totalCol}
              </span>
            </div>

            {/* The printable document container targeted by @media print */}
            <div
              id="printable-exam"
              className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-slate-400 shadow-md text-slate-900 space-y-6 text-start font-sans"
            >
              {/* Academic Exam Header */}
              <div className="border-b-2 border-slate-950 pb-4 text-center space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{isRtl ? "جامعة القاهرة · كلية التربية" : "Cairo University · Faculty of Education"}</span>
                  <span>{isRtl ? "تقويمي · وحدة القياس والتقويم" : "Taqwimi · Assessment Unit"}</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-black text-slate-950 pt-1">
                  {examTitle}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-slate-700 pt-3 border-t-2 border-slate-300">
                  <div>{t.studentName} ____________</div>
                  <div>{t.studentId} ____________</div>
                  <div className="text-blue-900 font-extrabold">{customExamTime}</div>
                  <div>{t.totalGrade}</div>
                </div>
              </div>

              {/* Exam Instructions */}
              <div className="bg-slate-100/90 p-3.5 rounded-xl text-xs font-bold text-slate-900 border-2 border-slate-300">
                {t.examInstructions}
              </div>

              {/* Questions List */}
              {questionsList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-bold border-2 border-slate-300 rounded-xl bg-slate-50 p-6">
                  {t.printEmptyErr}
                </div>
              ) : (
                <div className="space-y-6">
                  {questionsList.map((q, idx) => (
                    <div key={q.id} className="print-page-break space-y-2 text-xs sm:text-sm">
                      <div className="font-bold text-slate-950 flex gap-2">
                        <span>{idx + 1}.</span>
                        <span className="leading-relaxed">{q.stem}</span>
                      </div>

                      {q.qType === "mcq" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ps-6 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-start gap-2 text-slate-900 font-medium">
                              <span className="font-bold text-slate-700">
                                ({String.fromCharCode(isRtl ? 1571 + oIdx : 65 + oIdx)})
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.qType === "tf" && (
                        <div className="flex items-center gap-6 ps-6 pt-1 text-xs text-slate-900 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded border-2 border-slate-600 inline-block"></span>
                            {isRtl ? "صواب" : "True"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded border-2 border-slate-600 inline-block"></span>
                            {isRtl ? "خطأ" : "False"}
                          </span>
                        </div>
                      )}

                      {q.qType === "fill" && (
                        <div className="ps-6 text-xs text-slate-500 font-mono italic">
                          __________________________________________________
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Psychometric Analysis Tool */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">{t.psyTitle}</h3>
              <p className="text-xs text-slate-500 font-medium">{t.psySub}</p>
            </div>
          </div>
          <button
            onClick={handleAddPsyRow}
            className="text-xs bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all border-2 border-slate-800"
          >
            <Plus className="w-4 h-4" />
            {t.addPsyRow}
          </button>
        </div>

        <div className="overflow-x-auto border-2 border-slate-400 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-xs text-slate-800 text-start">
            <thead className="bg-slate-900 text-white font-bold border-b-2 border-slate-900">
              <tr>
                <th className="p-3">{t.colCode}</th>
                <th className="p-3">{t.colTotal}</th>
                <th className="p-3">{t.colCorrect}</th>
                <th className="p-3">{t.colHigh}</th>
                <th className="p-3">{t.colLow}</th>
                <th className="p-3">{t.colGroupSize}</th>
                <th className="p-3 text-center">{t.colDelete}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 bg-white">
              {psyRows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-indigo-50/40">
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={row.questionCode}
                      onChange={(e) => {
                        const updated = [...psyRows];
                        updated[idx].questionCode = e.target.value;
                        setPsyRows(updated);
                      }}
                      className="w-16 p-2 border-2 border-slate-400 rounded-xl text-center font-extrabold text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      value={row.totalStudents}
                      onChange={(e) => {
                        const updated = [...psyRows];
                        updated[idx].totalStudents = parseInt(e.target.value, 10) || 0;
                        setPsyRows(updated);
                      }}
                      className="w-20 p-2 border-2 border-slate-400 rounded-xl text-center font-bold text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      value={row.correctAll}
                      onChange={(e) => {
                        const updated = [...psyRows];
                        updated[idx].correctAll = parseInt(e.target.value, 10) || 0;
                        setPsyRows(updated);
                      }}
                      className="w-20 p-2 border-2 border-slate-400 rounded-xl text-center font-bold text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      value={row.correctHigh}
                      onChange={(e) => {
                        const updated = [...psyRows];
                        updated[idx].correctHigh = parseInt(e.target.value, 10) || 0;
                        setPsyRows(updated);
                      }}
                      className="w-20 p-2 border-2 border-slate-400 rounded-xl text-center font-bold text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      value={row.correctLow}
                      onChange={(e) => {
                        const updated = [...psyRows];
                        updated[idx].correctLow = parseInt(e.target.value, 10) || 0;
                        setPsyRows(updated);
                      }}
                      className="w-20 p-2 border-2 border-slate-400 rounded-xl text-center font-bold text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      value={row.groupSizeN}
                      onChange={(e) => {
                        const updated = [...psyRows];
                        updated[idx].groupSizeN = parseInt(e.target.value, 10) || 0;
                        setPsyRows(updated);
                      }}
                      className="w-20 p-2 border-2 border-slate-400 rounded-xl text-center font-bold text-slate-900 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => handleDeletePsyRow(row.id)}
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-2 rounded-xl border border-transparent hover:border-rose-200 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleCalculatePsychometrics}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 border-2 border-indigo-500/40 cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          {t.calcPsyBtn}
        </button>

        {psyResults.length > 0 && (
          <div className="space-y-3 pt-4 border-t-2 border-slate-200">
            <h4 className="font-display font-bold text-sm text-slate-900">{t.psyReportTitle}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {psyResults.map((res, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border-2 border-slate-300 rounded-xl space-y-1.5 text-xs shadow-xs">
                  <div className="font-bold text-slate-900 text-sm border-b-2 border-slate-200 pb-1 flex justify-between">
                    <span>{res.questionCode}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{t.diffIndex}</span>{" "}
                    <span className="font-bold text-blue-800">{res.pIndex}</span> ({res.difficultyEval})
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{t.discIndex}</span>{" "}
                    <span className="font-bold text-violet-800">{res.dIndex}</span> ({res.discriminationEval})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
