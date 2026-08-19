import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize the Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to handle missing api key safely
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    return res.status(500).json({
      error: "مفتاح Gemini API غير متاح في خادم التطبيق. يرجى تهيئته في لوحة Secrets في AI Studio.",
    });
  }
  next();
};

// 1. Generate questions from content
app.post("/api/generate-questions", checkApiKey, async (req, res) => {
  try {
    const { content, qType, qCount, bloomTarget, lang } = req.body;

    if (!content) {
      return res.status(400).json({ error: "المحتوى العلمي مطلوب للتوليد" });
    }

    const isEnglish = lang === "en";
    const count = parseInt(qCount, 10) || 3;
    const typeLabel =
      qType === "mcq"
        ? isEnglish ? "Multiple Choice (MCQ) with 4 choices" : "اختيار من متعدد (إجابة واحدة) بأربعة بدائل"
        : qType === "tf"
        ? isEnglish ? "True / False" : "صواب وخطأ"
        : qType === "fill"
        ? isEnglish ? "Fill in the blank with '___'" : "إكمال الفراغ بجملة مفيدة تحتوي على فراغ واحد ___"
        : qType === "matching"
        ? isEnglish ? "Matching & Pairing (Column A items to Column B items)" : "المزاوَجة والربط (ربط عناصر القائمة أ بعناصر القائمة ب)"
        : qType === "essay"
        ? isEnglish ? "Short Essay Question (Requires a concise written response + Model Answer & Rubric)" : "سؤال مقالي قصير (يتطلب إجابة كتابية مركزة مع إجابة نموذجية ودليل تصحيح)"
        : qType === "multi_mcq"
        ? isEnglish ? "Multiple Answer (Select ALL correct options among 4-5 choices)" : "اختيار متعدد الإجابات (تحديد جميع الإجابات الصحيحة من بين 4-5 خيارات)"
        : isEnglish ? "Ordering / Sequential Ranking (Arrange items in correct chronological or logical sequence)" : "الترتيب والتسلسل المنطقي/الزمني (ترتيب المفاهيم أو الخطوات في تسلسل صحيح)";

    const prompt = isEnglish
      ? `You are an expert pedagogical item writer and psychometric assessment reviewer.
Formulate ${count} questions of format "${typeLabel}" targeting the cognitive level "${bloomTarget}" from Bloom's Taxonomy based on the following scientific content:

"${content}"

Strict Psychometric Standards & Guidelines:
1. Multiple Choice Questions (MCQ):
   - CRITICAL RULE: The stem MUST ALWAYS be written as a clear declarative statement ending with a colon (:). STRICTLY DO NOT start the stem with question words or phrases (e.g. 'Which of the following...', 'What is...', 'How does...'), and DO NOT end with a question mark (?).
     - Example GOOD: "The primary distinction between validity and reliability in measurement tools is:"
     - Example BAD (FORBIDDEN): "Which of the following represents the main difference between validity and reliability?"
   - The stem must contain a single clear concept.
   - Avoid repeating common phrases across choices — place shared words into the item stem.
   - Never provide grammatical or verbal clues pointing to the correct key.
   - Distractors and choices must be strictly homogeneous, plausible, and equal in length and grammatical pattern to minimize guessing.
   - Do NOT use negative phrasing unless absolutely essential.
   - Ensure exactly ONE clear, indisputably correct answer.
   - STRICTLY avoid "All of the above", "None of the above", absolute words ("always", "never"), and vague qualifiers ("sometimes", "usually").

2. True / False Questions:
   - State a single factual, unambiguous idea per statement.
   - Distribute True and False keys evenly to avoid guessing patterns.
   - Avoid compound clauses or ambiguous terms.

3. Fill in the Blank Questions:
   - Provide sufficient sentence context so the blank ('___') requires an exact word or short phrase.
   - Limit to a single blank per sentence.

4. Matching Questions:
   - Format Column A (Premises) in options array, and Column B (Responses) mapped in correctAnswer.
   - Ensure Column B contains MORE responses than Column A premises to eliminate guessing by deduction.

5. Ordering / Sequencing Questions:
   - Provide unordered steps or concepts in options array, and the exact chronological/logical sequence in correctAnswer.

6. Short Essay Questions:
   - Provide concise prompt in stem, leave options empty, and provide clear model rubric & answer key in correctAnswer.

CRITICAL 20 Educational Content Alignment & Contextual Fidelity Criteria (Must be strictly satisfied):
1. Direct linkage to the provided specific educational content.
2. Reflection of main concepts and core ideas within the text.
3. Strict reliance on explicit information and concepts located clearly in the content.
4. Preservation of original context and nuance in which information was introduced.
5. Respect for interconnections and relationships between presented concepts.
6. Alignment of wording style with the subject matter and domain.
7. Correct usage of specialized terms in their authentic educational context.
8. Complete absence of external facts/concepts outside the provided content unless required for target thinking skills.
9. Match cognitive depth to the complexity level of the source content.
10. Authentic reflection of intended learning outcomes and goals.
11. Preservation of original core meaning when transforming text into assessment items.
12. Avoidance of overgeneralization or distortive extrapolation.
13. Consideration of preceding and succeeding sentence context during phrasing.
14. Direct contextual linkage of MCQ choices/distractors to the educational theme.
15. Inclusion of adequate context in stem so students can answer without needing missing unstated data.
16. Item difficulty calibrated proportionally to content cognitive complexity.
17. Integration of real examples and applied cases provided in the text.
18. Nuanced distinction between similar or contrasting concepts as introduced in the content.
19. Explicit identification of the exact source text excerpt/passage ('contextReference') from which each item is derived.
20. Overall contextual coherence across the entire set of generated questions.`
      : `أنت خبير تربوي ومحكم اختبارات وأخصائي قياس وتقويم سيكومتري.
قم بصياغة ${count} أسئلة من نوع "${typeLabel}" مستهدفاً المستوى المعرفي "${bloomTarget}" من تصنيف بلوم المحدّث بناءً على المحتوى العلمي التالي:

"${content}"

معايير ضوابط الصياغة والتحكيم التربوي المعتمدة:

١. أسئلة الاختيار من متعدد (MCQ):
   - ضابط حاسم للجذع: يجب أن يصاغ رأس السؤال دائماً كجملة خبرية واضحة ومحددة تنتهي بنقطتين (:). يمنع منعاً باتاً البدء بأدوات أو صيغ استفهام مثل ("أي مما يلي"، "ما هو"، "ما هي"، "كيف"، "ما الفرق بين"، "أيها")، ويمنع الانتهاء بعلامة استفهام (؟).
     - مثال للرأس الصحيح (جملة خبرية): "الفرق الرئيسي بين الصدق والثبات في أدوات القياس يتمثل في:"
     - مثال للرأس الخاطئ الممنوع: "أي مما يلي يمثل الفرق الرئيسي بين الصدق والثبات في أدوات القياس؟"
   - أن يتضمن الجذع فكرة واحدة محددة وواضحة، مع صياغته بشكل موجز وتجنب تكرار الكلمات بالخيارات.
   - تجنب إعطاء الطالب أي دليل أو إيحاء لفظي أو نحوي على مفتاح الإجابة.
   - الخيارات/البدائل متجانسة ومتشابهة ومستقلة ومتساوية تماماً في الطول والنمط لتقليل عملية التخمين.
   - تجنب استخدام النفي أو النفي المزدوج إلا عند الضرورة القصوى.
   - وجود إجابة واحدة صحيحة ومحددة تماماً.
   - تجنب تماماً عبارات "كل ما سبق"، "لا شيء مما سبق"، والعبارات المطلقة مثل (دائماً، أبداً)، والكلمات الفضفاضة مثل (أحياناً، عادةً).

٢. أسئلة الصواب والخطأ (True/False):
   - احتواء الجملة على فكرة علمية واحدة محددة ودقيقة فقط.
   - توزيع الأسئلة بتوازن بين الصواب والخطأ للابتعاد عن النمطية والتخمين.
   - تجنب العبارات المركبة والعبارات الغامضة التي تحتمل التأويل.

٣. أسئلة إكمال الفراغ (Complete Questions):
   - صياغة جملة بسياق كافٍ يحدد الإجابة بدقة من خلال كلمة أو عبارة محددة بـ '___'.
   - اقتصار السؤال على فراغ واحد فقط في الجملة.

٤. أسئلة المزاوجة والربط (Matching):
   - عرض عناصر القائمة أ في الخيارات، واستجابات القائمة ب المزاوجة في الإجابة الصحيحة.
   - مراعاة أن يكون عدد الاستجابات (العمود ب) أكثر من عدد المثيرات (العمود أ) لتقليل التخمين بالاستبعاد.

٥. أسئلة الترتيب والتسلسل (Ordering/Sequencing):
   - عرض الخيارات غير المرتبة في الخيارات، والتسلسل الصحيح (الزمني أو المنطقي أو الإجرائي) في الإجابة الصحيحة.

٦. الأسئلة المقالية القصيرة (Short Essay):
   - صياغة السؤال بوضوح وإدراج دليل التصحيح والإجابة النموذجية في الإجابة الصحيحة.

٧. السلامة اللغوية والإملائية الصارمة:
   - الالتزام التام بالصحة الإملائية الدقيقة في الجذع والبدائل: ضبط همزات القطع (أن، إلى، إذا، أو، أكثر، أقل، أهمية) وهمزات الوصل (استخدام، اختبار، ابتكار، استنتاج، اكتشاف)، والتفريق الدقيق بين التاء المربوطة (ـة) والهاء (ـه)، والألف المقصورة (على، أخرى، حتى، لدى) والياء (ي)، وعلامات الترقيم الصحيحة.

══════════════════════════════════════════════════════════════════════
قائمة معايير الارتباط بالمحتوى التعليمي والاتساق السياقي والمعرفي (٢٠ معياراً إلزامياً):
══════════════════════════════════════════════════════════════════════
1. ترتبط الأسئلة المولدة مباشرة بالمحتوى التعليمي المحدد الذي تم إدخاله للنظام.
2. تعكس الأسئلة المفاهيم والأفكار الرئيسة الواردة في المحتوى المحدد.
3. تستند الأسئلة إلى معلومات ومفاهيم يمكن العثور عليها بوضوح في المحتوى المحدد.
4. تحافظ الأسئلة على السياق الذي وردت فيه المعلومات داخل المحتوى التعليمي.
5. تراعي الأسئلة العلاقات والترابطات بين المفاهيم الواردة في المحتوى.
6. تتوافق صياغة الأسئلة مع طبيعة الموضوع والمجال المعرفي للمحتوى.
7. تستخدم الأسئلة المصطلحات والمفاهيم الواردة في المحتوى بصورة صحيحة وفي سياقها المناسب.
8. لا تتضمن الأسئلة معلومات أو مفاهيم خارج نطاق المحتوى المحدد إلا إذا كان ذلك مطلوبًا لقياس مهارة التفكير المستهدفة.
9. تراعي الأسئلة المستوى المعرفي للمحتوى عند توليدها.
10. تعكس الأسئلة الأهداف التعليمية والمخرجات المتضمنة أو المستخلصة من المحتوى.
11. تحافظ الأسئلة على المعنى الأصلي للمعلومات عند تحويلها إلى أسئلة.
12. تتجنب الأسئلة المولدة التعميم أو التفسير الذي يؤدي إلى تغيير المعنى الوارد في المحتوى.
13. تراعي الأسئلة السياق السابق واللاحق للمعلومة عند صياغتها.
14. ترتبط البدائل في أسئلة الاختيار من متعدد بالسياق التعليمي للمحتوى.
15. تتضمن الأسئلة تفاصيل كافية من السياق تساعد المتعلم على فهم المطلوب دون الرجوع إلى معلومات غير متاحة.
16. تتناسب درجة صعوبة الأسئلة مع مستوى التعقيد المعرفي للمحتوى المحدد.
17. تعكس الأسئلة الأمثلة والتطبيقات الواردة في المحتوى عند استخدامها في توليد الأسئلة.
18. تراعي الأسئلة الفروق بين المفاهيم المتشابهة أو المتقابلة كما وردت في المحتوى.
19. تحديد الشاهد النصي أو الموضع الدقيق من المحتوى الذي استند إليه كل سؤال مولد في حقل contextReference.
20. تحافظ الأسئلة المولدة على الاتساق السياقي عند توليد مجموعة من الأسئلة من المحتوى نفسه.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              qType: { type: Type.STRING, description: "Type of question: 'mcq', 'tf', or 'fill'" },
              stem: { type: Type.STRING, description: "The question stem or sentence. For fill, contain '___'." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 4 choices (only for mcq type). Otherwise empty.",
              },
              correctAnswer: { type: Type.STRING, description: "The correct choice/answer." },
              bloom: { type: Type.STRING, description: "Cognitive level of Bloom's Taxonomy." },
              difficulty: { type: Type.STRING, description: "Estimated difficulty level." },
              difficultyIndex: { type: Type.NUMBER, description: "Estimated facility/difficulty index p-value between 0.15 and 0.90 (e.g., 0.65)" },
              discriminationIndex: { type: Type.NUMBER, description: "Estimated discrimination index D-value between 0.15 and 0.60 (e.g., 0.42)" },
              discriminationStatus: { type: Type.STRING, description: "Discrimination classification: 'ممتاز', 'جيد', 'مقبول', or 'ضعيف'" },
              contextReference: {
                type: Type.STRING,
                description: "Exact excerpt or contextual reference sentence from the source content that grounds this question (الموضع أو الشاهد النصي من المحتوى).",
              },
              contentAlignment: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 3-5 satisfied content-alignment criteria names for this item.",
              },
              notes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Brief educational reviews or design tips on this question.",
              },
            },
            required: ["qType", "stem", "correctAnswer", "bloom", "difficulty"],
          },
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    const questions = JSON.parse(resultText);
    res.json({ questions });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء توليد الأسئلة" });
  }
});

// 2. Audit/Improve question
const handleAuditQuestion = async (req: express.Request, res: express.Response) => {
  try {
    const { qType, stem, options, correctAnswer, lang, stage } = req.body;

    if (!stem) {
      return res.status(400).json({ error: "نص السؤال مطلوب" });
    }

    const isEnglish = lang === "en";
    const isStage3 = String(stage) === "3";
    const typeLabel =
      qType === "mcq" ? "Multiple Choice" : qType === "tf" ? "True / False" : "Fill in the Blank";
    const optionsText =
      options && options.length
        ? `\nCurrent choices:\n${options.map((o: string, i: number) => `${i + 1}- ${o}`).join("\n")}`
        : "";

    let prompt = "";
    if (isStage3) {
      prompt = isEnglish
        ? `You are a senior psychometrician and academic test auditing expert evaluating Stage 3: Comprehensive Psychometric Audit & Academic Certification.
Review the following academic test item of format "${typeLabel}":

Current Question Stem: "${stem}"${optionsText}
Current Correct Answer: "${correctAnswer || ""}"

Stage 3 Psychometric & Vetting Audit Criteria:
1. Cognitive Alignment & Bloom's Taxonomy: Ensure the item procedural verb aligns strictly with targeted cognitive depth without degradation.
2. Scientific Validity & Absolute Truth: Ensure complete scientific factual accuracy of the stem and model answer with zero ambiguity.
3. Linguistic Safety & Academic Elegance: Pristine grammar, spelling, orthography (Hamza/Ta-Marbuta), clear punctuation, and elimination of redundancy across all item types.
4. Distractor Misconception Diagnostic Power: Ensure distractors target genuine student misconceptions rather than arbitrary filler.
5. Psychometric Fairness & Bias-Free Wording: Ensure complete absence of cultural, gender, or contextual bias for all test takers.
6. Clear Scoring Rubric & Time Estimation: Ensure clear answer key, point weight, and estimated completion time.
7. Declarative Stem Format: For MCQ/Multi-MCQ, stem MUST be a clear DECLARATIVE STATEMENT ending with a colon (:), NOT a question. Remove question words ("Which of the following", "What is", "How...") and remove question mark (?).

Requirements:
1. Provide a psychometrically certified version of the question stem (declarative statement ending with a colon : where appropriate), optimized choices, correct answer, Bloom level, and difficulty.
2. Provide a psychometric quality score (0-100) based on Stage 3 audit rigor.
3. Provide a list of specific psychometric audit defect notes and recommendations in defectsFound.
4. Provide direct text replacement suggestions in 'criterionFixes' array for each criterion evaluated, specifying targetField ('stem', 'options', 'correctAnswer'), issueDescription, suggestedFixText, and action labels so teachers can apply fixes with a single click.`
        : `أنت خبير قياس وتقويم تربوي وأخصائي تحكيم اختبارات وسيكومترية أكاديمية لتقييم (المرحلة الثالثة: التقييم والتحكيم السيكومتري الشامل والاعتماد الأكاديمي).
قم بمراجعة ودراسة السؤال الأكاديمي التالي من نوع "${typeLabel}" وفحصه دقيقاً وفق معايير الاعتماد والتحكيم السيكومتري الشامل:

السؤال الحالي: "${stem}"${optionsText}
الإجابة الصحيحة الحالية: "${correctAnswer || ""}"

معايير التقييم والتحكيم السيكومتري للمرحلة الثالثة:
١. التوافق التام مع مستوى بلوم المعرفي ونواتج التعلم المستهدفة ومنع انخفاض المستوى المعرفي لسطحية الاسترجاع.
٢. الصدق العلمي والدقة الموضوعية القاطعة للمفهوم والإجابة النموذجية دون أي احتمالية للاختلاف الأكاديمي.
٣. معايير الصحة والسلامة اللغوية: تطبيق تدقيق لغوي ونحوي وإملائي صارم (صحة الإعراب، سلامة الهمزات والتاء المربوطة، علامات الترقيم، ورصانة الأسلوب الأكاديمي وخلوه من الحشو والركاكة) على كافة أنواع الأسئلة.
٤. فاعلية المشتتات والقدرة التشخيصية للمفاهيم الخاطئة الشائعة لدى المتعلمين وليس مجرد خيارات شكلية.
٥. العدالة السيكومترية وخلو السؤال تماماً من أي تحيّز ثقافي أو جندري أو سياقي لضمان فرصة متكافئة للجميع.
٦. وضوح مفتاح الإجابة والتقدير الزمني والدرجة وسُلم التقدير (Rubric).
٧. ضابط الجذع لأسئلة الاختيار: تحويل رأس السؤال إلى "جملة خبرية" تنتهي بنقطتين (:)، وحذف أي أدوات أو صيغ استفهام وعلامة الاستفهام (؟).

المهام المطلوبة منك:
١. صغ نسخة محكمة ومجازة أكاديمياً من السؤال (مع الالتزام بالسلامة اللغوية التامة وضوابط الجذع).
٢. احسب درجة جودة سيكومترية دقيقة من (٠ إلى ١٠٠) بناءً على صرامة تحكيم المرحلة الثالثة.
٣. حدد مستوى بلوم المعرفي، وسجل قائمة بملاحظات وعيوب التقييم السيكومتري المكتشفة (defectsFound/feedback) بوضوح.
٤. قدم اقتراحات تعديل نصية مباشرة لكل معيار في مصفوفة 'criterionFixes' تتضمن النص المعدل الجاهز للاستبدال المباشر بضغطة زر واحدة.`;
    } else {
      prompt = isEnglish
        ? `You are a professional psychometric measurement and evaluation expert evaluating Stage 2: Item Refinement & Phrasing Rules.
Review the following academic test item of format "${typeLabel}" against strict item-writing and linguistic correctness rules:

Current Question Stem: "${stem}"${optionsText}
Current Correct Answer: "${correctAnswer || ""}"

Stage 2 Evaluation & Linguistic Safety Criteria across all question types:
1. Linguistic Health & Correctness: Flawless Modern Standard Arabic, strict adherence to grammar rules, spelling/orthography (Hamza & Ta-Marbuta), precise punctuation, and elimination of wordiness or redundant filler.
2. For MCQ: STRICT REQUIREMENT: The enhanced stem MUST be a clear DECLARATIVE STATEMENT ending with a colon (:), NOT a question. Remove question words ("Which of the following", "What is", "How...") and remove question mark (?). Ensure stem contains ONE clear concept. Check if common words are repeated in options (should be in stem). Check if choices are homogeneous and equal in length. Check for clues/verbal hints, negative words, "All/None of above", absolute words ("always/never"), or vague words ("sometimes/usually").
3. For True/False: Check for single factual idea, declarative statement ending with a period, absence of double negatives or complex clauses.
4. For Fill-in-the-blank: Check for sufficient context and single blank ('___') in a syntactically correct position.
5. For Matching: Check that responses outnumber premises, clear matching instructions ending with ':', and items are homogeneous.
6. For Ordering: Check that sequence criterion is unambiguous, grammatically parallel, and logically linear.
7. For Short Essay: Check that prompt begins with a direct action verb, response boundaries are defined, and clear scoring rubrics are provided.

Requirements:
1. Provide an enhanced/corrected question stem (MUST BE A DECLARATIVE STATEMENT ending with a colon : for MCQ/Multi-MCQ, with NO question words or question marks), balanced options (for MCQ), accurate correct answer, Bloom level, and difficulty.
2. Provide a quality score (0-100) based on compliance with these rules.
3. Provide a list of specific defect notes (feedback/defects found) highlighting any violated rules.
4. Provide direct text replacement suggestions in 'criterionFixes' array for each evaluated quality rule, specifying targetField ('stem', 'options', 'correctAnswer'), issueDescription, suggestedFixText, suggestedOptions (if applicable), and action labels.`
        : `أنت خبير قياس وتقويم تربوي وأخصائي تحكيم اختبارات لتقييم (المرحلة الثانية: التحسين والتدقيق الصياغي واللغوي).
قم بمراجعة ودراسة السؤال الأكاديمي التالي من نوع "${typeLabel}" وفحصه دقيقاً وفق معايير وقواعد صياغة بنود الاختبارات والصحة اللغوية:

السؤال الحالي: "${stem}"${optionsText}
الإجابة الصحيحة الحالية: "${correctAnswer || ""}"

معايير التحكيم والتدقيق الصياغي والسلامة اللغوية لجميع أنواع الأسئلة:
١. معايير الصحة والسلامة اللغوية العامة (مطبقة على كل أنواع الأسئلة):
   - استخدام لغة فصحى ميسرة ومباشرة وتجنب الغموض والركاكة.
   - صحة التركيب النحوي والإعرابي وسلامة الضبط وتوافق الضمائر والصفات.
   - السلامة الإملائية والصرفية التامة (همزات الوصل والقطع، التاء المربوطة والهاء، الألف المقصورة).
   - صحة علامات الترقيم لضبط المعنى بدقة.
   - الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد غير المفيد.
   - تركيز السؤال على فكرة واحدة محددة.
٢. الضوابط الخاصة بنوع السؤال:
   - الاختيار من متعدد (MCQ): الجذع يجب أن يصاغ كـ "جملة خبرية" تنتهي بنقطتين (:) خالية من أي أدوات أو علامات استفهام، خلو الخيارات من تكرار كلمات الجذع، تكافئ الخيارات في الطول والنمط، وجود إجابة واحدة صحيحة.
   - الصواب والخطأ: جملة تقريرية تنتهي بنقطة (.)، فكرة واحدة، تجنب النفي المزدوج والكلمات المطلقة (دائماً/أبداً).
   - إكمال الفراغ: سياق كافٍ، فراغ واحد '___' في موقع نحوي سليم ومحدد للمصطلح الجوهري.
   - المزاوجة والربط: زيادة استجابات العمود ب عن مثيرات العمود أ، وتجانس المفردات.
   - الترتيب: وضوح معيار الترتيب وتجانس خطوات التسلسل.
   - المقالي القصير: صياغة المثير بفعل إجرائي مباشر، وتحديد نطاق الإجابة، وتوفير سلم التقدير (Rubric).

المهام المطلوبة منك:
١. صغ نسخة محسنة من السؤال مستوفية لكافة معايير السلامة اللغوية وضوابط نوع السؤال المحددة.
٢. احسب درجة جودة سيكومترية دقيقة من (٠ إلى ١٠٠) بناءً على مدى مطابقة السؤال لهذه الضوابط.
٣. حدد مستوى بلوم المعرفي، وسجل قائمة بملاحظات وعيوب الصياغة واللغة المكتشفة (defectsFound/feedback) بوضوح.
٤. قدم اقتراحات تعديل نصية مباشرة لكل معيار يواجه ملحوظة أو تحسيناً في مصفوفة 'criterionFixes' تتضمن النص المُعدل الجاهز للاستبدال المباشر بضغطة زر واحدة.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhancedStem: { type: Type.STRING, description: "The enhanced/refined question stem." },
            enhancedOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "For MCQ, 4 optimized choice strings. Otherwise empty.",
            },
            enhancedCorrectAnswer: { type: Type.STRING, description: "The optimized correct answer value." },
            bloomClassification: { type: Type.STRING, description: "Bloom taxonomy level." },
            difficultyLevel: { type: Type.STRING, description: "Estimated difficulty level." },
            difficultyIndex: { type: Type.NUMBER, description: "Estimated facility/difficulty index p-value between 0.15 and 0.90 (e.g., 0.62)" },
            discriminationIndex: { type: Type.NUMBER, description: "Estimated discrimination index D-value between 0.15 and 0.60 (e.g., 0.45)" },
            discriminationStatus: { type: Type.STRING, description: "Discrimination classification: 'ممتاز', 'جيد', 'مقبول', or 'ضعيف'" },
            qualityScore: { type: Type.INTEGER, description: "Quality score from 0 to 100." },
            defectsFound: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Audit feedback and defect report points.",
            },
            criterionFixes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterionId: { type: Type.STRING, description: "ID or rule title of criterion, e.g., 'mcq_stem_declarative', 'mcq_homogeneous_distractors', 'mcq_no_clues', 'stem_clarity', 'correct_answer_explicit', 'bloom_alignment'" },
                  issueDescription: { type: Type.STRING, description: "Short description of the identified flaw" },
                  targetField: { type: Type.STRING, description: "'stem', 'options', 'correctAnswer', or 'all'" },
                  suggestedFixText: { type: Type.STRING, description: "Direct replacement text for stem/answer" },
                  suggestedOptions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of proposed replacement options if options are targeted"
                  },
                  actionLabelAr: { type: Type.STRING, description: "Action button label in Arabic e.g. 'تطبيق التعديل على جذع السؤال'" },
                  actionLabelEn: { type: Type.STRING, description: "Action button label in English e.g. 'Apply Fix to Stem'" }
                },
                required: ["criterionId", "issueDescription", "targetField", "suggestedFixText"]
              },
              description: "Direct per-criterion text fix proposals for one-click approval"
            }
          },
          required: ["enhancedStem", "enhancedCorrectAnswer", "bloomClassification", "difficultyLevel", "qualityScore", "defectsFound"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    const evaluation = JSON.parse(resultText);
    res.json(evaluation);
  } catch (error: any) {
    console.error("Error auditing question:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء تحسين السؤال" });
  }
};

app.post("/api/audit-question", checkApiKey, handleAuditQuestion);
app.post("/api/improve-question", checkApiKey, handleAuditQuestion);

// Advanced Linguistic and Grammatical Proofreading Endpoint
app.post("/api/proofread-question", checkApiKey, async (req, res) => {
  try {
    const { stem, options, correctAnswer, qType, lang } = req.body;

    if (!stem) {
      return res.status(400).json({ error: "نص السؤال مطلوب للتدقيق اللغوي والنحوي" });
    }

    const isEnglish = lang === "en";
    const typeLabel =
      qType === "mcq"
        ? "Multiple Choice (MCQ)"
        : qType === "tf"
        ? "True/False"
        : qType === "fill"
        ? "Fill in the blank"
        : qType === "matching"
        ? "Matching"
        : qType === "essay"
        ? "Short Essay"
        : qType === "multi_mcq"
        ? "Multiple Answer"
        : "Ordering / Sequencing";

    const optionsText =
      options && options.length
        ? `\nChoices/Options:\n${options.map((o: string, i: number) => `${i + 1}- ${o}`).join("\n")}`
        : "";

    const prompt = isEnglish
      ? `You are an elite academic linguistic editor and pedagogical item proofreader.
Perform a rigorous, professional grammatical, orthographical, and stylistic proofreading audit for the following academic test question (${typeLabel}):

Question Stem: "${stem}"${optionsText}
Correct Answer: "${correctAnswer || ""}"

Proofreading & Editorial Rigor Standards:
1. Orthography & Spelling: Check all typographical and spelling errors, strict punctuation, capitalization, and quotation rules.
2. Grammar & Syntax: Rigorously verify grammatical agreement (subject-verb, modifier-noun, pronoun antecedents, preposition usage, verb tenses).
3. Rhetoric, Academic Precision & Style: Eliminate awkward phrasing, ambiguous modifiers, redundant filler words, and elevate academic eloquence.
4. Item Stem Formulation Rule: If format is MCQ/Multi-MCQ, ensure the stem is phrased as a clear DECLARATIVE STATEMENT ending with a colon (:), NOT a conversational question with a question mark.
5. Option Parallelism: Ensure choices are syntactically parallel and grammatically consistent with the stem.

Return a comprehensive JSON breakdown with:
- overallLinguisticScore (0-100)
- linguisticSummary (brief summary of findings)
- improvedStem (the fully corrected and enhanced stem)
- improvedOptions (array of corrected options, if applicable)
- improvedCorrectAnswer (the corrected key)
- detailedSuggestions: list of itemized changes with category ('spelling', 'grammar', 'style', 'pedagogical_formatting'), targetField ('stem', 'options', 'correctAnswer'), originalText, suggestedText, ruleExplanation, severity ('error', 'warning', 'enhancement').
- grammarNotes: array of specific grammar rules applied
- spellingNotes: array of spelling/orthographic fixes
- styleNotes: array of stylistic and conciseness enhancements`
      : `أنت كبير المدققين اللغويين والنحويين وأخصائي الصياغة التربوية في هيئات التقويم الأكاديمي.
قم بإجراء تدقيق لغوي ونحوي وإملائي وبلاغي متقدم وشامل للسؤال الأكاديمي التالي من نوع "${typeLabel}":

متن السؤال / الجذع: "${stem}"${optionsText}
الإجابة الصحيحة / المفتاح: "${correctAnswer || ""}"

محاور ومعايير التدقيق اللغوي والنحوي والتحريري الصارم:
١. السلامة الإملائية والرسم الصرفي:
   - الضبط التام لهمزات القطع (أن، إلى، إذا، أو، أكثر، أقل، أهمية، إيجاد) وهمزات الوصل (استخدام، استنتاج، اختبار، ابتكار، اكتشاف).
   - التفريق القاطع بين التاء المربوطة (ـة) والهاء (ـه)، والألف المقصورة (ى) والياء (ي).
   - سلامة علامات الترقيم (حذف الفراغات قبل الفواصل، ضبط النقطتين الرأسيتين، وإزالة علامات الاستفهام غير المناسبة).
٢. الصحة النحوية وسلامة الإعراب والتراكيب:
   - استقامة التراكيب وفق قواعد النحو العربي السليم.
   - مطابقة الفعل للفاعل (تذكيراً وتأنيثاً وإفراداً وتثنية وجمعاً)، وتوافق الصفة والموصوف، وصحة المبتدأ والخبر، وتوافق الضمائر مع مراجعها.
   - صحة استخدام حروف الجر وتعدية الأفعال وتجنب التراكيب الركيكة أو المترجمة حرفياً.
٣. البلاغة والأصالة الأكاديمية والإيجاز:
   - حذف الكلمات الفضفاضة والحشو اللغوي والاستطراد الذي لا يخدم الهدف المعرفي.
   - الارتقاء بالصياغة إلى الأسلوب الأكاديمي العربي الرصين والموجز والدقيق.
٤. ضابط الصياغة التربوية للجذع والبدائل:
   - لأسئلة الاختيار: تحويل رأس السؤال إلى "جملة خبرية واضحة ومحددة" تنتهي بنقطتين (:) وحذف أدوات الاستفهام (مثل: أي مما يلي، ما هو، كيف) وحذف علامة الاستفهام (؟).
   - ضبط تجانس وتكافؤ البدائل نحويًا ولفظيًا لتكون متوازية في التركيب.

المخرجات المطلوبة بدقة:
- overallLinguisticScore: درجة السلامة اللغوية والنحوية الإجمالية من 0 إلى 100.
- linguisticSummary: ملخص وصفي عام ودقيق لحالة اللغة والصياغة.
- improvedStem: متن السؤال بعد التدقيق اللغوي والنحوي الكامل وصياغته كجملة خبرية رصينة تنتهي بنقطتين.
- improvedOptions: قائمة الخيارات بعد التصحيح اللغوي والنحوي والتجانس.
- improvedCorrectAnswer: نص الإجابة الصحيحة بعد التدقيق.
- detailedSuggestions: مصفوفة تفصيلية بكل ملحوظة واقتراح تحسين، تحتوي على (id, category: 'spelling' | 'grammar' | 'style' | 'pedagogical_formatting', categoryLabelAr, targetField: 'stem' | 'options' | 'correctAnswer', originalText, suggestedText, ruleExplanation, severity: 'error' | 'warning' | 'enhancement').
- grammarNotes: مصفوفة بقواعد النحو والإعراب المطبقة.
- spellingNotes: مصفوفة بقواعد الإملاء ورسم الهمزات المطبقة.
- styleNotes: مصفوفة بملاحظات التحسين البلاغي والإيجاز.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallLinguisticScore: { type: Type.INTEGER, description: "Linguistic and grammar safety score from 0 to 100" },
            linguisticSummary: { type: Type.STRING, description: "Concise summary of linguistic assessment" },
            improvedStem: { type: Type.STRING, description: "The perfectly proofread and enhanced question stem" },
            improvedOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The proofread choices/options if applicable",
            },
            improvedCorrectAnswer: { type: Type.STRING, description: "The proofread correct answer" },
            detailedSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING, description: "'spelling', 'grammar', 'style', or 'pedagogical_formatting'" },
                  categoryLabelAr: { type: Type.STRING, description: "Category label in Arabic" },
                  categoryLabelEn: { type: Type.STRING, description: "Category label in English" },
                  targetField: { type: Type.STRING, description: "'stem', 'options', or 'correctAnswer'" },
                  originalText: { type: Type.STRING, description: "Original word or phrase containing the issue" },
                  suggestedText: { type: Type.STRING, description: "Suggested improved replacement text" },
                  ruleExplanation: { type: Type.STRING, description: "Detailed grammatical, orthographic, or stylistic rule explanation" },
                  severity: { type: Type.STRING, description: "'error', 'warning', or 'enhancement'" },
                },
                required: ["id", "category", "categoryLabelAr", "targetField", "originalText", "suggestedText", "ruleExplanation", "severity"],
              },
              description: "Itemized proofreading suggestions for one-click adoption",
            },
            grammarNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific Arabic grammar notes and syntax rules applied",
            },
            spellingNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific spelling and orthographic corrections",
            },
            styleNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Stylistic, conciseness, and rhetoric refinement notes",
            },
          },
          required: ["overallLinguisticScore", "linguisticSummary", "improvedStem", "improvedCorrectAnswer", "detailedSuggestions"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    const proofreadData = JSON.parse(resultText);
    res.json(proofreadData);
  } catch (error: any) {
    console.error("Error proofreading question:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء التدقيق اللغوي والنحوي للسؤال" });
  }
});

// 3. Generate alternative phrasings
app.post("/api/generate-alternatives", checkApiKey, async (req, res) => {
  try {
    const { qType, stem, correctAnswer, lang } = req.body;

    if (!stem) {
      return res.status(400).json({ error: "نص السؤال مطلوب" });
    }

    const isEnglish = lang === "en";
    const prompt = isEnglish
      ? `Suggest 2 alternative attractive rephrasings for this item stem (format: ${qType}) while preserving core knowledge and correct answer "${correctAnswer || ""}":
"${stem}"`
      : `اقترح صياغتين بديلتين بأسلوبين مختلفين للسؤال التالي مع الحفاظ على الفكرة والإجابة الصحيحة "${correctAnswer || ""}":
"${stem}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of exactly 2 alternative phrased question strings",
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    const alternatives = JSON.parse(resultText);
    res.json({ alternatives });
  } catch (error: any) {
    console.error("Error generating alternatives:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء اقتراح الصياغات البديلة" });
  }
});

// 4. Extract text from uploaded document or file (PDF, DOCX, Images, etc.)
app.post("/api/extract-file-text", checkApiKey, async (req, res) => {
  try {
    const { fileData, mimeType, fileName, lang } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: "بيانات الملف مطلوبة لاستخراج النص" });
    }

    let base64String = fileData;
    if (base64String.includes(",")) {
      base64String = base64String.split(",")[1];
    }

    const isEnglish = lang === "en";

    // Handle DOCX or non-standard mime types gracefully
    let normalizedMimeType = mimeType || "application/pdf";
    if (fileName && fileName.endsWith(".pdf")) {
      normalizedMimeType = "application/pdf";
    } else if (fileName && (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg"))) {
      normalizedMimeType = mimeType || "image/jpeg";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            data: base64String,
            mimeType: normalizedMimeType,
          },
        },
        {
          text: isEnglish
            ? "Extract and output the full, complete educational and academic text content from this file clearly. Do not add intro/outro comments or summarize — provide the complete readable text so it can be used for test item generation."
            : "قم باستخراج جميع النص الأكاديمي والمضمون العلمي للمقرر الوارد في هذا الملف بدقة وكامل المضمون، دون اختصار ودون كتابة مقدمات أو تعليقات خارجية، ليتسنّى استخدامه مباشرة في صياغة الأسئلة.",
        },
      ],
    });

    const text = response.text || "";
    if (!text.trim()) {
      throw new Error("لم يتم العثور على نص مكتوب أو مقروء داخل الملف");
    }

    res.json({ extractedText: text.trim(), fileName });
  } catch (error: any) {
    console.error("Error extracting text from file:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء استخراج النص من الملف المرفق" });
  }
});

// 5. Analyze question image or diagram (Camera capture or External Image URL)
app.post("/api/analyze-question-image", checkApiKey, async (req, res) => {
  try {
    const { imageData, imageUrl, mimeType, lang, mode } = req.body;

    if (!imageData && !imageUrl) {
      return res.status(400).json({ error: "بيانات الصورة أو رابط الصورة مطلوب للتحليل" });
    }

    let base64String = imageData || "";
    let normalizedMimeType = mimeType || "image/jpeg";

    // If external imageUrl is provided, download it server-side
    if (imageUrl && !imageData) {
      try {
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) {
          throw new Error(`فشل جلب الصورة من الرابط (رمز الحالة: ${imgRes.status})`);
        }
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64String = buffer.toString("base64");
        const detectedType = imgRes.headers.get("content-type");
        if (detectedType && detectedType.startsWith("image/")) {
          normalizedMimeType = detectedType;
        }
      } catch (fetchErr: any) {
        return res.status(400).json({ error: `تعذر الوصول لرابط الصورة الخارجي: ${fetchErr.message}` });
      }
    }

    if (base64String.includes(",")) {
      base64String = base64String.split(",")[1];
    }

    const isEnglish = lang === "en";

    // If user only asked to extract text content
    if (mode === "extract_content") {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            inlineData: {
              data: base64String,
              mimeType: normalizedMimeType,
            },
          },
          {
            text: isEnglish
              ? "Extract all academic, educational, and scientific text from this image accurately and comprehensively, including any formulas or diagram labels, so it can be used as study text for question generation."
              : "استخرج النص الأكاديمي والتعليمي والبيانات العلمية أو شروحات الرسم الموجودة في هذه الصورة بدقة وبشكل كامل لتُستخدم كمحتوى علمي لبناء الأسئلة.",
          },
        ],
      });

      return res.json({
        success: true,
        extractedText: response.text?.trim() || "",
        imageUrl: imageUrl || undefined,
      });
    }

    // Default mode: Comprehensive item parsing & psychometric calibration
    const systemPrompt = isEnglish
      ? `You are an expert psychometrician and academic item reviewer.
Analyze this image (which may be a printed test question, textbook diagram, exam snapshot, whiteboard problem, or educational graphic).
Perform comprehensive OCR, pedagogical structuring, and psychometric calibration:

1. Identify the question stem clearly. If it is an MCQ, format the stem as a clean declarative statement ending with a colon (:).
2. Detect question type ('mcq', 'tf', 'fill', 'matching', 'essay', or 'diagram_labeling').
3. Extract all options/choices if applicable (balanced and clear).
4. Identify the indisputably correct answer key and provide pedagogical rationale.
5. Identify Bloom's taxonomy cognitive level ('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create' / Arabic equivalent: 'تذكر' | 'فهم' | 'تطبيق' | 'تحليل' | 'تقويم' | 'إبداع').
6. Estimate difficulty ('سهلة' | 'متوسطة' | 'صعبة') and psychometric difficulty index (p-value, 0.20-0.85) and discrimination index (D-value, 0.25-0.55).
7. If there is a diagram/graphic/chart, describe its core pedagogical elements in 'diagramExplanation'.
8. Output strictly the structured JSON according to schema.`
      : `أنت خبير قياس وتقويم سيكومتري ومحكّم أسئلة أكاديمية.
قم بتحليل هذه الصورة الملتقطة (والتي قد تكون ورقة اختبار، سؤالاً مطبوعاً، رسماً توضيحياً أو بيانياً، مسألة سبورة، أو فقرة تعليمية مصورة).
قم باستخراج البند وتحليله سيكومترياً وتربوياً بدقة عالية:

١. استخراج متن السؤال (الجذع): إذا كان اختياراً من متعدد، صغه كجملة خبرية واضحة ومحددة تنتهي بنقطتين (:) وخالية من أدوات الاستفهام.
٢. تحديد نمط السؤال ('mcq' | 'tf' | 'fill' | 'matching' | 'essay' | 'diagram_labeling').
٣. استخراج الخيارات والبدائل كاملة مع مراعاة التجانس اللغوي وتساوي الأطوال.
٤. استخراج مفتاح الإجابة الصحيحة مع تعليل تربوي سليم.
٥. تصنيف المستوى المعرفي في بلوم ('تذكر' | 'فهم' | 'تطبيق' | 'تحليل' | 'تقويم' | 'إبداع').
٦. تقدير مستوى الصعوبة ('سهلة' | 'متوسطة' | 'صعبة') ومعامل السهولة p (بين 0.25 و 0.85) ومعامل التمييز D (بين 0.25 و 0.55).
٧. في حال وجود رسم أو شكل توضيحي، قم بوصفه وتحليله في diagramExplanation.
٨. التزام تام بالسلامة اللغوية والإملائية (الهمزات والتاء المربوطة).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            data: base64String,
            mimeType: normalizedMimeType,
          },
        },
        {
          text: systemPrompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            qType: { type: Type.STRING, description: "Item type: 'mcq', 'tf', 'fill', 'matching', 'essay', or 'diagram_labeling'" },
            stem: { type: Type.STRING, description: "Question stem / stimulus" },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of choices/options for MCQ, matching, or diagram labeling",
            },
            correctAnswer: { type: Type.STRING, description: "The correct key / answer text" },
            bloom: { type: Type.STRING, description: "Bloom's taxonomy cognitive level: 'تذكر' | 'فهم' | 'تطبيق' | 'تحليل' | 'تقويم' | 'إبداع'" },
            difficulty: { type: Type.STRING, description: "Difficulty: 'سهلة' | 'متوسطة' | 'صعبة'" },
            difficultyIndex: { type: Type.NUMBER, description: "Estimated p-value between 0.15 and 0.90" },
            discriminationIndex: { type: Type.NUMBER, description: "Estimated D-value between 0.15 and 0.60" },
            discriminationStatus: { type: Type.STRING, description: "'ممتاز' | 'جيد' | 'مقبول'" },
            diagramExplanation: { type: Type.STRING, description: "Pedagogical explanation of the diagram or visual element" },
            contextReference: { type: Type.STRING, description: "Source reference or topic" },
            notes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Pedagogical review hints",
            },
          },
          required: ["qType", "stem", "correctAnswer", "bloom", "difficulty"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("لم يتم استلام استجابة صالحة من نموذج الذكاء الاصطناعي");
    }

    const parsedQuestion = JSON.parse(resultText);
    
    // Attach source imageUrl or keep base64 if needed
    const finalQuestion = {
      ...parsedQuestion,
      id: `img_q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      imageUrl: imageUrl || (imageData ? `data:${normalizedMimeType};base64,${base64String}` : undefined),
    };

    res.json({
      success: true,
      question: finalQuestion,
      diagramExplanation: parsedQuestion.diagramExplanation,
    });
  } catch (error: any) {
    console.error("Error analyzing question image:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء تحليل صورة السؤال" });
  }
});

import { sendUserActivityNotification, getRecentNotifications } from "./src/lib/notificationService.js";

// Endpoint to send user status & activity notification to supervisor email
app.post("/api/notify-user-activity", async (req, res) => {
  try {
    const { userEmail, actionType, details, metadata } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: "البريد الإلكتروني للمستخدم مطلوب" });
    }

    const result = await sendUserActivityNotification({
      userEmail,
      actionType: actionType || "login",
      details,
      metadata,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error sending user notification:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء إرسال إشعار النشاط" });
  }
});

// Endpoint to view notification delivery status & audit logs
app.get("/api/notification-logs", (req, res) => {
  res.json({
    recipient: process.env.NOTIFICATION_RECIPIENT_EMAIL || "Noha.mahmoud@cu.edu.eg",
    logs: getRecentNotifications(),
  });
});

// Endpoint to generate and download full Word (.docx) report for the application
app.get("/api/export-app-report-docx", async (req, res) => {
  try {
    const { generateFullAppDocxReport } = await import("./src/lib/docxReportBuilder.js");
    const docxBuffer = await generateFullAppDocxReport();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Itqan_System_Comprehensive_Report.docx"'
    );
    res.send(docxBuffer);
  } catch (error: any) {
    console.error("Error generating DOCX report:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء تقرير وورد (.docx) للتطبيق" });
  }
});

// Setup Vite or Static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Taqwimi server booted at http://localhost:${PORT}`);
  });
}

setupServer();
