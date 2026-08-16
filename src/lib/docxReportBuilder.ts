import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from "docx";

export async function generateFullAppDocxReport(): Promise<Buffer> {
  const tableBorderGrid = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,
              bottom: 1200,
              left: 1200,
              right: 1200,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "تطبيق تقويمي (Taqwimi) | تقرير وثائقي وفني شامل للتطبيق",
                    size: 18,
                    color: "1E3A8A",
                    bold: true,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "صفحة ",
                    size: 18,
                    color: "64748B",
                    font: "Arial",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: "64748B",
                    font: "Arial",
                  }),
                  new TextRun({
                    text: " من ",
                    size: 18,
                    color: "64748B",
                    font: "Arial",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: "64748B",
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Banner / Header Block
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "بسم الله الرحمن الرحيم",
                bold: true,
                size: 24,
                color: "1E293B",
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "التقرير الوثائقي والتنفيذي الشامل لتطبيق تقويمي (Taqwimi)",
                bold: true,
                size: 38,
                color: "1E3A8A",
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "تطبيق توليد وتحكيم بنود الاختبارات بالذكاء الاصطناعي والتحليل السيكومتري الأكاديمي",
                bold: true,
                size: 24,
                color: "0D9488",
                font: "Arial",
              }),
            ],
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderGrid,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "اسم النظام:", bold: true, size: 20, font: "Arial", color: "0F172A" })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "تطبيق تقويمي لتقويم وتحكيم بنود الاختبارات (Taqwimi Assessment System)", size: 20, font: "Arial", color: "334155" })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "الجهة المستفيدة:", bold: true, size: 20, font: "Arial", color: "0F172A" })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "المؤسسات التعليمية والأكاديمية، المعلمون، والمشرفون التربويون", size: 20, font: "Arial", color: "334155" })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "محرك الذكاء الاصطناعي:", bold: true, size: 20, font: "Arial", color: "0F172A" })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "Google Gemini 2.5 Flash / Google GenAI SDK (@google/genai)", size: 20, font: "Arial", color: "334155" })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "تاريخ الإصدار والنسخة:", bold: true, size: 20, font: "Arial", color: "0F172A" })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "يوليو 2026 - الإصدار المتقدم (المحتوي على المعالج الذكي للتعديل المباشر بضغطة زر)", size: 20, font: "Arial", color: "334155" })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 400 }, children: [] }),

          // SECTION 1: EXECUTIVE SUMMARY
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "١. الملخص التنفيذي ورؤية النظام",
                bold: true,
                size: 28,
                color: "1E3A8A",
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "تعتبر عملية صياغة وتحكيم بنود الاختبارات الأكاديمية إحدى أهم الركائز في العملية التعليمية، حيث تنعكس جودة السؤال مباشرة على دقة قياس تحصيل الطالب وقدرته على التفكير النقدي. ومن هذا المنطلق، تم تطوير تطبيق \"تقويمي (Taqwimi)\" كمنظومة متكاملة وذكية تعتمد على تقنيات الذكاء الاصطناعي المتقدمة (Google Gemini 2.5) لتغطية كامل دورة حياة بند الاختبار من التوليد، والمراجعة، والتحكيم السيكومتري، وحتى التصدير بمختلف الصيغ المعيارية.",
                size: 22,
                color: "334155",
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "يتميز النظام بمعالجة الثغرات التقليدية في صياغة الأسئلة، مثل: غموض رؤوس الأسئلة، وجود تلميحات مجانية للإجابة، عدم تكافؤ الخيارات المشتتة، أو الاقتصار على مستويات التذكر الأدنى. كما يقدم النظام ميزة حصرية وفريدة وهي \"المعالج الذكي ذو الاقتراحات النصية المباشرة\" التي تسمح للمعلم بمراجعة الملاحظات وتطبيق التعديل المقترح بضغطة زر واحدة على محرر السؤال مباشرة.",
                size: 22,
                color: "334155",
                font: "Arial",
              }),
            ],
          }),

          // SECTION 2: TECHNICAL ARCHITECTURE
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 200 },
            children: [
              new TextRun({
                text: "٢. المعمارية التقنية والهيكلية المبرمجة",
                bold: true,
                size: 28,
                color: "1E3A8A",
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "تم بناء التطبيق باستخدام أحدث التقنيات البرمجية الشاملة (Full-Stack Architecture) لضمان السرعة، المرونة، والأمان العالي:",
                size: 22,
                color: "334155",
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "واجهة المستخدم (Frontend): ", bold: true, size: 21, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "مبنية باستخدام React 19 ولغة TypeScript مع حزمة Vite السريعة للتجميع، وتنسيقات Tailwind CSS v4 المعيارية للتصميم التكيفي الجذاب.", size: 21, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "خادم التطبيق (Backend Server): ", bold: true, size: 21, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "خادم بلغة Node.js وأطر إكسبريس (Express.js) ويعمل على منفذ القياسي 3000 بمعمارية RESTful API آمنة تعزل مفاتيح السيرفر عن المتصفح.", size: 21, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "محرك الذكاء الاصطناعي (AI Core): ", bold: true, size: 21, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "اعتماد حزمة Google GenAI Official SDK (@google/genai) وتفعيل نموذج Gemini 2.5 Flash المخصص للتوليد والتحكيم السيكومتري الدقيق بصيغة Structured JSON Outputs.", size: 21, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "المكتبات والتفاعلات: ", bold: true, size: 21, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "Lucide React للأيقونات، Recharts للرسوم البيانية والإحصائيات، Motion للحركات السلسة، و docx لتوليد التقارير المباشرة.", size: 21, color: "334155", font: "Arial" }),
            ],
          }),

          // SECTION 3: SYSTEM MODULES
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 200 },
            children: [
              new TextRun({
                text: "٣. الوحدات الوظيفية والميزات التفصيلية بالنظام",
                bold: true,
                size: 28,
                color: "1E3A8A",
                font: "Arial",
              }),
            ],
          }),

          // Submodule A: Generator
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({
                text: "أ) وحدة المولد الذكي لبنود الاختبارات (AI Item Generator)",
                bold: true,
                size: 24,
                color: "0D9488",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "تسمح هذه الوحدة للمعلم بإدخال النص الأكاديمي أو رفع ملفات المقرر (PDF, Word, Images) واستخراج النص تلقائياً، ثم توليد بنود اختبارية احترافية وفق الضوابط التالية:",
                size: 21,
                color: "334155",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "دعم 8 أنواع من الأسئلة الأكاديمية: ", bold: true, size: 20, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "اختيار من متعدد (MCQ)، صواب وخطأ (T/F)، إكمال الفراغ (Fill in blanks)، التناظر والمزاوَجة (Matching)، المقالي القصير مع دليل التصحيح (Essay + Rubric)، متعدد الإجابات (Multi-MCQ)، الترتيب والتسلسل (Ordering)، وإكمال المخططات والرسوم (Diagram Labeling).", size: 20, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "استهداف مستويات بلوم المعرفية: ", bold: true, size: 20, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "إمكانية تحديد المستوى المطلوب (تذكر، فهم، تطبيق، تحليل، تقييم، ابتكار) لتوليد سؤال يركز بدقة على هذا المستوى.", size: 20, color: "334155", font: "Arial" }),
            ],
          }),

          // Submodule B: Reviewer & Smart Processor
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({
                text: "ب) وحدة التحكيم والمعالج الذكي (Smart Reviewer & Psychometric Audit)",
                bold: true,
                size: 24,
                color: "0D9488",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "تعتبر قلب النظام النابض، حيث تتولى فحص السؤال وتحكيمه عبر ثلاث مراحل متدرجة مع ميزة التعديل الفوري بضغطة زر:",
                size: 21,
                color: "334155",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "المرحلة الأولى (الفحص الفوري السريع): ", bold: true, size: 20, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "فحص البنية الأولية للسؤال والتأكد من وجود خيارات كافية وإجابة نموذجية محددة.", size: 20, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "المرحلة الثانية (التدقيق الصياغي وقواعد التحرير): ", bold: true, size: 20, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "التحقق من خلو رأس السؤال من أدوات الاستفهام ليكون جملة خبرية تنتهي بنقطتين : وتكافؤ الخيارات وتجنب عبارات 'كل ما سبق'.", size: 20, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "المرحلة الثالثة (التحكيم والاعتماد السيكومتري الشامل): ", bold: true, size: 20, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "تقييم السؤال وفق مصفوفة الاعتماد الأكاديمي، واحتساب درجات جودة سيكومترية من (0 إلى 100%).", size: 20, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "المرحلة الرابعة (بنك الأسئلة المعتمد والتصدير): ", bold: true, size: 20, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "تخزين وأرشفة الأسئلة المعتمدة في بنك ذكي بسعة تتسع لـ 300 سؤال معتمد ومصنف سيكومترياً، مع إمكانية تصدير مصفوفات المواصفات والامتحانات بصيغة Word الطباعية.", size: 20, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "🌟 ميزة المعالج الذكي (تعديلات بضغطة زر واحدة): ", bold: true, size: 20, color: "2563EB", font: "Arial" }),
              new TextRun({ text: "يقوم الذكاء الاصطناعي بتوليد كائن 'criterionFixes' يحتوي على النص المعدل المباشر لكل معيار. يظهر زر 'موافقة واستبدال' بجانب كل ملحوظة، وبضغطة زر واحدة يتم اقتباس النص وتحديث رأس السؤال أو الخيارات فوراً في محرر المعلم مع إشعار تأكيدي.", size: 20, color: "334155", font: "Arial" }),
            ],
          }),

          // Submodule C: Analytics
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({
                text: "ج) لوحة التحليلات وهرم بلوم المعرفي (Bloom Pyramid & Quality Dashboard)",
                bold: true,
                size: 24,
                color: "0D9488",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "تقدم هذه الوحدة عرضاً بيانيا تفاعلياً لهرم بلوم والتوزيع النسيجي لأسئلة الاختبار، لحساب نسبة تمثيل مهارات التفكير العليا والتحقق من الملاءمة السيكومترية الموصى بها أكاديمياً.",
                size: 21,
                color: "334155",
                font: "Arial",
              }),
            ],
          }),

          // SECTION 4: PSYCHOMETRIC MATRIX TABLE
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 200 },
            children: [
              new TextRun({
                text: "٤. مصفوفة معايير التحكيم السيكومتري الـ 12 المعتمدة بالمشروع",
                bold: true,
                size: 28,
                color: "1E3A8A",
                font: "Arial",
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderGrid,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "#", bold: true, color: "FFFFFF", size: 20, font: "Arial" })] })],
                  }),
                  new TableCell({
                    shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "المعيار السيكومتري", bold: true, color: "FFFFFF", size: 20, font: "Arial" })] })],
                  }),
                  new TableCell({
                    shading: { fill: "1E3A8A", type: ShadingType.CLEAR },
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "التوصيف والهدف التربوي المقاس", bold: true, color: "FFFFFF", size: 20, font: "Arial" })] })],
                  }),
                ],
              }),
              ...[
                { id: "1", name: "الجذع جملة خبرية محددة", desc: "أن يتكون رأس السؤال من جملة خبرية واضحة تنتهي بنقطتين (:) مع تجنب الأسئلة المفتوحة وأدوات الاستفهام." },
                { id: "2", name: "تجانس وتكافؤ البدائل", desc: "أن تكون جميع الخيارات المشتتة متقاربة في الطول والتركيب اللغوي والمفهوم العلمي لمنع التخمين." },
                { id: "3", name: "تجنب التلميحات المباشرة", desc: "خلّو الجذع أو المشتتات من أي إشارات قواعدية أو لفظية تشير للإجابة الصحيحة بشكل مجاني." },
                { id: "4", name: "استبعاد 'كل ما سبق' و 'لاشيء'", desc: "منع استخدام عبارات الشمول مثل 'جميع ما ذكر' لأنها تخل بالقيمة التمييزية للبند سيكومترياً." },
                { id: "5", name: "وضوح وصحة الإجابة النموذجية", desc: "وجود إجابة صحيحة واحدة فقط لا تقبل الجدل وتتوافق تماماً مع المفاهيم الأكاديمية المعتمدة." },
                { id: "6", name: "التوافق مع مستويات بلوم", desc: "قياس مستوى معرفي محدد ومطابقة الفعل السلوكي في السؤال مع الناتج التعليمي المراد قياسه." },
                { id: "7", name: "تجنب الصياغة النفيّة المركبة", desc: "عدم استخدام صيغ النفي أو النفي المزدوج (مثل: ليس من غير المحتمل) لتجنب تشتيت الذهن." },
                { id: "8", name: "استقلالية بنود الاختبار", desc: "ألا تعتمد إجابة سؤال على إجابة سؤال آخر في نفس النموذج الاختباري." },
                { id: "9", name: "ملاءمة لغة السؤال", desc: "سلامة اللغة العربية والضبط اللغوي والإملائي الخالي من الأخطاء التعبيرية أو النحوية." },
                { id: "10", name: "وضوح المخططات والرسوم", desc: "في أسئلة R-Labeling، التأكد من جودة الصورة وتحديد أرقام الأجزاء بوضوح تام على المخطط." },
                { id: "11", name: "دقة دليل تصحيح المقالي (Rubric)", desc: "توفير توزيع الدرجات والمؤشرات السلوكية للأسئلة المقالية لضمان موضوعية التصحيح." },
                { id: "12", name: "القدرة التمييزية للسؤال", desc: "قدرة السؤال على التمييز الفعال بين الطلبة ذوي التحصيل العالي والطلبة متوسطي التحصيل." },
              ].map((item) => (
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.id, bold: true, size: 20, font: "Arial", color: "1E3A8A" })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: item.name, bold: true, size: 20, font: "Arial", color: "0F172A" })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: item.desc, size: 20, font: "Arial", color: "334155" })] })],
                    }),
                  ],
                })
              )),
            ],
          }),

          // SECTION 5: OPERATIONAL USER GUIDE
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 200 },
            children: [
              new TextRun({
                text: "٥. دليل التشغيل والاستخدام للمشرفين والمعلمين",
                bold: true,
                size: 28,
                color: "1E3A8A",
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "الخطوة الأولى - توليد الأسئلة: ", bold: true, size: 21, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "انتقل إلى تبويب 'مولد الأسئلة'، ضع النص العلمي أو ارفع ملف المقرر، حدد نوع السؤال ومستوى بلوم، ثم اضغط 'توليد الأسئلة'.", size: 21, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "الخطوة الثانية - التحكيم المباشر: ", bold: true, size: 21, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "انتقل إلى تبويب 'المعالج الذكي'، واضغط زر 'التحكيم والتحسين السيكومتري الشامل'.", size: 21, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "الخطوة الثالثة - تطبيق التعديلات بضغطة زر: ", bold: true, size: 21, color: "2563EB", font: "Arial" }),
              new TextRun({ text: "راجع بطاقات المعايير المرفقة باقتراحات التعديل، واضغط زر 'موافقة واستبدال (بضغطة زر)' ليتم تطبيق النص المعدل فوراً في محرر السؤال، أو اضغط زر 'موافقة وتطبيق كافة التعديلات الشاملة' لتطبيق جميع التعديلات دفعة واحدة.", size: 21, color: "334155", font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "الخطوة الرابعة - التصدير والطباعة: ", bold: true, size: 21, color: "0F172A", font: "Arial" }),
              new TextRun({ text: "استخدم وحدة أدوات المساندة لتصدير بنود الاختبار المجازة بصيغ Word (.docx)، PDF، HTML، أو استخراج التقرير الشامل.", size: 21, color: "334155", font: "Arial" }),
            ],
          }),

          // CONCLUSION
          new Paragraph({
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "تم بحمد الله وتوفيقه إعداد هذا التقرير الوثائقي الشامل لتطبيق تقويمي (Taqwimi)",
                bold: true,
                size: 22,
                color: "1E3A8A",
                font: "Arial",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
