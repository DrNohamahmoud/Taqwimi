import { Question } from "../types";
import { checkQuestionSpelling } from "./spellChecker";

export type LinguisticAxis = "orthography" | "grammar" | "punctuation";

export interface LinguisticRuleCriterion {
  id: string;
  axis: LinguisticAxis;
  axisLabelAr: string;
  axisLabelEn: string;
  titleAr: string;
  titleEn: string;
  standardRuleAr: string;
  standardRuleEn: string;
  isFulfilled: boolean;
  notesAr: string;
  notesEn: string;
  detectedIssues: string[];
  suggestedFix?: string;
}

export interface LinguisticFulfillmentReport {
  score: number; // 0 to 100
  fulfilledCount: number;
  totalCount: number;
  status: "excellent" | "good" | "needs_attention";
  statusLabelAr: string;
  statusLabelEn: string;
  criteria: LinguisticRuleCriterion[];
  axisBreakdown: {
    orthography: { fulfilled: number; total: number; score: number };
    grammar: { fulfilled: number; total: number; score: number };
    punctuation: { fulfilled: number; total: number; score: number };
  };
}

export function auditLinguisticAndOrthographic(
  question: Partial<Question>,
  isRtl: boolean = true
): LinguisticFulfillmentReport {
  const stem = (question.stem || "").trim();
  const options = question.options || [];
  const correctAnswer = (question.correctAnswer || "").trim();
  const fullText = [stem, ...options, correctAnswer].filter(Boolean).join(" ");
  const qType = question.qType || "mcq";

  const spellingRes = checkQuestionSpelling(question as Question, isRtl);

  const criteria: LinguisticRuleCriterion[] = [];

  // =========================================================================
  // 1. محور ضبط الرسم الإملائي والحروف (Orthography & Letters)
  // =========================================================================

  // 1.1 ضبط الهمزات (همزة القطع والوصل ورسم الهمزة المتوسطة والمتطرفة)
  const hamzaWaslErrors = spellingRes.allIssues.filter((i) => i.category === "hamza_wasl");
  const hamzaQatErrors = spellingRes.allIssues.filter((i) => i.category === "hamza_qat");
  
  // Also check common incorrect hamza patterns in fullText
  const commonHamzaMistakes = [
    /\bإستخدام\b/, /\bإختبار\b/, /\bإختيار\b/, /\bإستنتاج\b/, /\bإستيعاب\b/, /\bإبتكار\b/, /\bإكتشاف\b/,
    /\bان\b/, /\bالى\b/, /\bاو\b/, /\bاذا\b/, /\bاكثر\b/, /\bاقل\b/, /\bاهمية\b/, /\bاي\b/,
    /\bمسؤل\b/, /\bرئيسي\b/, /\bشئ\b/, /\bجرء\b/, /\bبطئ\b/, /\bعبءاً\b/
  ];
  const detectedHamzaWords: string[] = [];
  hamzaWaslErrors.forEach((e) => detectedHamzaWords.push(`${e.originalWord} ⟶ ${e.suggestedWord}`));
  hamzaQatErrors.forEach((e) => detectedHamzaWords.push(`${e.originalWord} ⟶ ${e.suggestedWord}`));
  
  commonHamzaMistakes.forEach((regex) => {
    const match = fullText.match(regex);
    if (match && !detectedHamzaWords.some(w => w.includes(match[0]))) {
      detectedHamzaWords.push(match[0]);
    }
  });

  const isHamzaFulfilled = detectedHamzaWords.length === 0;
  criteria.push({
    id: "hamzat_mastery",
    axis: "orthography",
    axisLabelAr: "محور الرسم الإملائي وضبط الحروف",
    axisLabelEn: "Orthography & Letter Forms",
    titleAr: "ضبط الهمزات (القطع والوصل والمتوسطة والمتطرفة)",
    titleEn: "Hamza Rules (Qat, Wasl, Medial & Final)",
    standardRuleAr: "كتابة همزة القطع والوصل بشكل صحيح، ومعرفة رسم الهمزة المتوسطة والمتطرفة بحسب حركة الحرف وحركة ما قبله وفق سلم الحركات.",
    standardRuleEn: "Accurate drawing of Qat and Wasl hamzas, and placing medial/final hamzas based on vowel precedence.",
    isFulfilled: isHamzaFulfilled,
    notesAr: isHamzaFulfilled
      ? "كافة الهمزات (الوصل والقطع والمتوسطة والمتطرفة) منضبطة ودقيقة وفق المعايير الإملائية."
      : `تم رصد ملحوظات في رسم الهمزة: ${detectedHamzaWords.slice(0, 3).join("، ")}.`,
    notesEn: isHamzaFulfilled
      ? "All hamza instances are correctly placed."
      : `Hamza irregularities detected in: ${detectedHamzaWords.slice(0, 3).join(", ")}.`,
    detectedIssues: detectedHamzaWords,
    suggestedFix: detectedHamzaWords.length > 0 ? "تصحيح الهمزات وفق قواعد الوصل والقطع ورسم النبرة والسطر" : undefined,
  });

  // 1.2 الفرق بين التاء المربوطة والهاء والتاء المفتوحة
  const taMarbutaErrors = spellingRes.allIssues.filter((i) => i.category === "ta_marbuta");
  const commonTaMistakes = [
    /\bمدرسه\b/, /\bجامعه\b/, /\bعمليه\b/, /\bتربويه\b/, /\bدقيقه\b/, /\bنتيجه\b/, /\bقائمه\b/,
    /\bمياهاً\b/, /\bهذة\b/
  ];
  const detectedTaWords: string[] = [];
  taMarbutaErrors.forEach((e) => detectedTaWords.push(`${e.originalWord} ⟶ ${e.suggestedWord}`));
  commonTaMistakes.forEach((regex) => {
    const match = fullText.match(regex);
    if (match && !detectedTaWords.some(w => w.includes(match[0]))) {
      detectedTaWords.push(match[0]);
    }
  });

  const isTaFulfilled = detectedTaWords.length === 0;
  criteria.push({
    id: "ta_marbuta_ha",
    axis: "orthography",
    axisLabelAr: "محور الرسم الإملائي وضبط الحروف",
    axisLabelEn: "Orthography & Letter Forms",
    titleAr: "الفرق بين التاء المربوطة والهاء والتاء المفتوحة",
    titleEn: "Ta Marbuta (ة), Open Ta (ت) & Ha (ه)",
    standardRuleAr: "كتابة التاء المربوطة (ة) عند الوقف عليها هاءً ووصلها تاءً، والتاء المفتوحة (ت) تاءً في الحالين، والهاء (ه) هاءً في الوقف والوصل.",
    standardRuleEn: "Precise distinction between Ta Marbuta (ة), Ha (ه), and Open Ta (ت).",
    isFulfilled: isTaFulfilled,
    notesAr: isTaFulfilled
      ? "التمييز بين التاء المربوطة والهاء والتاء المفتوحة تام ودقيق في كافة مفردات السؤال."
      : `تم رصد خلط في رسم التاء المربوطة أو الهاء: ${detectedTaWords.slice(0, 3).join("، ")}.`,
    notesEn: isTaFulfilled
      ? "Ta Marbuta and Ha usage is entirely consistent."
      : `Confusion in Ta Marbuta or Ha detected: ${detectedTaWords.slice(0, 3).join(", ")}.`,
    detectedIssues: detectedTaWords,
    suggestedFix: detectedTaWords.length > 0 ? "تحويل الهاء إلى تاء مربوطة بنقطتين (ة) عند نطقها تاء في الوصل" : undefined,
  });

  // 1.3 الألف اللينة والمقصورة
  const alefMaksuraErrors = spellingRes.allIssues.filter((i) => i.category === "alef_maksura");
  const commonAlefMistakes = [
    /\bعلي\b(?=\s+[\u0600-\u06FF])/, // علي كحرف جر بدلاً من على
    /\bالي\b/, /\bحتي\b/, /\bلدي\b/, /\bاخري\b/, /\bمستوي\b/, /\bمعني\b/, /\bكبري\b/, /\bصغري\b/
  ];
  const detectedAlefWords: string[] = [];
  alefMaksuraErrors.forEach((e) => detectedAlefWords.push(`${e.originalWord} ⟶ ${e.suggestedWord}`));
  commonAlefMistakes.forEach((regex) => {
    const match = fullText.match(regex);
    if (match && !detectedAlefWords.some(w => w.includes(match[0]))) {
      detectedAlefWords.push(match[0]);
    }
  });

  const isAlefFulfilled = detectedAlefWords.length === 0;
  criteria.push({
    id: "alef_layyina_maqsura",
    axis: "orthography",
    axisLabelAr: "محور الرسم الإملائي وضبط الحروف",
    axisLabelEn: "Orthography & Letter Forms",
    titleAr: "الألف اللينة والمقصورة والقائمة",
    titleEn: "Soft Alif & Alif Maqsura (ى / ا)",
    standardRuleAr: "رسم الألف في أواخر الكلمات إما قائمة (ا) أو على صورة ياء غير منقوطة (ى) بناءً على أصلها الثلاثي أو موقعها فيما فوق الثلاثي.",
    standardRuleEn: "Drawing terminal Alif as straight (ا) or dotless Ya (ى) per morphological origin.",
    isFulfilled: isAlefFulfilled,
    notesAr: isAlefFulfilled
      ? "رسم الألف اللينة والمقصورة سليم ومطابق للأصل الصرفي في الأسماء والأفعال والحروف."
      : `تنبيه: رصد رسم غير دقيق للألف المقصورة: ${detectedAlefWords.slice(0, 3).join("، ")}.`,
    notesEn: isAlefFulfilled
      ? "Alif Maqsura correctly written."
      : `Issues in Alif Maqsura detected in: ${detectedAlefWords.slice(0, 3).join(", ")}.`,
    detectedIssues: detectedAlefWords,
    suggestedFix: detectedAlefWords.length > 0 ? "استبدال الياء المنقوطة بالألف المقصورة (ى) في أواخر الحروف والأسماء فوق الثلاثية" : undefined,
  });

  // 1.4 الوصل والفصل
  const waslFaslMistakes = [
    { pattern: /\bمنمن\b/, note: "من من (فصل)" },
    { pattern: /\bانلم\b/, note: "إن لم (فصل)" },
    { pattern: /\bحب ذا\b/, note: "حبذا (وصل)" },
    { pattern: /\bكل ما\b(?=\s+[\u0600-\u06FF]{3,})/, note: "كلما الشرطية (وصل)" },
    { pattern: /\bحين ئذ\b/, note: "حينئذ (وصل)" },
    { pattern: /\bيوم ئذ\b/, note: "يومئذ (وصل)" },
    { pattern: /\bعن من\b/, note: "عمن (وصل وإدغام)" },
    { pattern: /\bمن من\b(?!\s)/, note: "ممن (وصل)" },
    { pattern: /\bان لا\b/, note: "ألا (إدغام ووصل)" },
  ];
  const detectedWaslFasl: string[] = [];
  waslFaslMistakes.forEach((m) => {
    if (m.pattern.test(fullText)) {
      detectedWaslFasl.push(m.note);
    }
  });

  const isWaslFaslFulfilled = detectedWaslFasl.length === 0;
  criteria.push({
    id: "wasl_and_fasl",
    axis: "orthography",
    axisLabelAr: "محور الرسم الإملائي وضبط الحروف",
    axisLabelEn: "Orthography & Letter Forms",
    titleAr: "قواعد الوصل والفصل والإدغام الإملائي",
    titleEn: "Word Joining & Separation Rules",
    standardRuleAr: "عدم إدماج الكلمات التي يجب فصلها (مثل: من من، إن لم)، ووصل ما يجب وصله (مثل: حبذا، كلما الشرطية، حينئذ، ممن، عمن).",
    standardRuleEn: "Separating words that must be disjointed and joining prefixes/compounds that must be joined.",
    isFulfilled: isWaslFaslFulfilled,
    notesAr: isWaslFaslFulfilled
      ? "تطبيق منضبط لمواضع وصل وفصل الحروف والكلمات المركبة والموصولة."
      : `تنبيه في قواعد الفصل والوصل: ${detectedWaslFasl.join("، ")}.`,
    notesEn: isWaslFaslFulfilled
      ? "Word separation and ligature conventions respected."
      : `Separation/Joining discrepancies: ${detectedWaslFasl.join(", ")}.`,
    detectedIssues: detectedWaslFasl,
  });

  // 1.5 التنوين والنون الساكنة
  const tanweenMistakes = [
    /\bشكرن\b/, /\bعفون\b/, /\bجدن\b/, /\bايضن\b/, /\bدائمن\b/, /\bفعلن\b/,
    /\bبناءاً\b/, /\bسماءاً\b/, /\bجزاءاً\b/, /\bمساءاً\b/, /\bابتداءاً\b/ // ألف تنوين بعد همزة قبلها ألف
  ];
  const detectedTanweenWords: string[] = [];
  tanweenMistakes.forEach((regex) => {
    const match = fullText.match(regex);
    if (match) {
      detectedTanweenWords.push(match[0]);
    }
  });

  const isTanweenFulfilled = detectedTanweenWords.length === 0;
  criteria.push({
    id: "tanween_noon_sakina",
    axis: "orthography",
    axisLabelAr: "محور الرسم الإملائي وضبط الحروف",
    axisLabelEn: "Orthography & Letter Forms",
    titleAr: "التنوين والنون الساكنة وألف التنوين",
    titleEn: "Nunation (Tanween) & Silent Alif",
    standardRuleAr: "التفريق الدقيق بين النون الأصلية التي تنطق وتكتب نوناً، والتنوين الذي ينطق نوناً ويكتب حركتين، مع عدم وضع ألف بعد الهمزة المسبوقة بألف (بناءً وليس بناءاً).",
    standardRuleEn: "Distinguishing Tanween from Nun, and omitting Alif after Hamza preceded by Alif.",
    isFulfilled: isTanweenFulfilled,
    notesAr: isTanweenFulfilled
      ? "رسم التنوين سليم تماماً وخالٍ من كتابة النون اللفظية أو ألف التنوين الزائدة بعد الهمزة."
      : `تم رصد خطأ في رسم التنوين أو النون: ${detectedTanweenWords.join("، ")}.`,
    notesEn: isTanweenFulfilled
      ? "Tanween rules correctly adhered to."
      : `Tanween orthography issues detected in: ${detectedTanweenWords.join(", ")}.`,
    detectedIssues: detectedTanweenWords,
    suggestedFix: detectedTanweenWords.length > 0 ? "كتابة التنوين (ـً) دون نون صريحة أو حذف ألف التنوين بعد الهمزة المسبوقة بألف" : undefined,
  });

  // =========================================================================
  // 2. محور السلامة النحوية واللغوية (Grammar & Linguistic Rules)
  // =========================================================================

  // 2.1 المطابقة الإعرابية (علامات الإعراب الرئيسية والفرعية)
  const caseAgreementMistakes = [
    /\bكان\s+[\u0600-\u06FF]+\s+قائماً\b/, // Check kan predicates
    /\bلم\s+[\u0600-\u06FF]+(ون|ين)\b/, // Jazam with nun
    /\bلن\s+[\u0600-\u06FF]+(ون)\b/, // Nasab with nun
    /\bكلا\s+الطالبان\b/, // Should be الطالبين
    /\bكلتا\s+المعلمتان\b/, // Should be المعلمتين
    /\bمن\s+قبل\s+[\u0600-\u06FF]+(ون)\b/ // Jar with waw
  ];
  const detectedCaseIssues: string[] = [];
  caseAgreementMistakes.forEach((regex) => {
    const match = fullText.match(regex);
    if (match) detectedCaseIssues.push(match[0]);
  });

  const isCaseAgreementFulfilled = detectedCaseIssues.length === 0;
  criteria.push({
    id: "case_agreement",
    axis: "grammar",
    axisLabelAr: "محور السلامة النحوية والمعجمية",
    axisLabelEn: "Grammar & Lexical Correctness",
    titleAr: "المطابقة الإعرابية (المبتدأ والخبر والفاعل والمفعول والنواسخ)",
    titleEn: "Grammatical Case & Syntactic Concord",
    standardRuleAr: "الالتزام التام بعلامات الإعراب الرئيسية والفرعية لمواقع الرفع والنصب والجر، وصحة إعراب الفاعل والمفعول به، ومطابقة النواسخ (كان وإن وأخواتهما).",
    standardRuleEn: "Adherence to primary and secondary grammatical case markers across subjects, predicates, and modifiers.",
    isFulfilled: isCaseAgreementFulfilled,
    notesAr: isCaseAgreementFulfilled
      ? "التراكيب الإعرابية ومواقع الرفع والنصب والجر سليمة ومطابقة لقواعد النحو القياسي."
      : `تنبيه إعرابي: مراجعة العلامات الإعرابية في: ${detectedCaseIssues.join("، ")}.`,
    notesEn: isCaseAgreementFulfilled
      ? "Grammatical case syntax is sound."
      : `Case agreement discrepancy noted in: ${detectedCaseIssues.join(", ")}.`,
    detectedIssues: detectedCaseIssues,
  });

  // 2.2 التذكير والتأنيث ومطابقة الفعل والصفة
  const genderAgreementMistakes = [
    /\bقام\s+المعلمات\b/, /\bقامت\s+المعلمون\b/, /\bهذا\s+المشكلة\b/, /\bهذه\b\s+الهدف\b/,
    /\bهذا\s+النظرية\b/, /\bأهداف\s+رئيسي\b/, /\bنتائج\s+إيجابي\b/
  ];
  const detectedGenderIssues: string[] = [];
  genderAgreementMistakes.forEach((regex) => {
    const match = fullText.match(regex);
    if (match) detectedGenderIssues.push(match[0]);
  });

  const isGenderFulfilled = detectedGenderIssues.length === 0;
  criteria.push({
    id: "gender_agreement",
    axis: "grammar",
    axisLabelAr: "محور السلامة النحوية والمعجمية",
    axisLabelEn: "Grammar & Lexical Correctness",
    titleAr: "مطابقة التذكير والتأنيث (الفعل والصفة والضمير)",
    titleEn: "Gender Agreement (Verb, Adjective & Pronoun)",
    standardRuleAr: "مطابقة الفعل لفاعله والصفة لموصوفها واسم الإشارة والضمائر العائدة للمرجع تذكيراً وتأنيثاً وإفراداً وجمعاً لغير العاقل.",
    standardRuleEn: "Gender concord between verbs and subjects, adjectives and nouns, and relative pronouns.",
    isFulfilled: isGenderFulfilled,
    notesAr: isGenderFulfilled
      ? "مطابقة كاملة للتذكير والتأنيث بين الأفعال والأسماء والنعوت والضمائر."
      : `ملحوظة تذكير/تأنيث في العبارة: ${detectedGenderIssues.join("، ")}.`,
    notesEn: isGenderFulfilled
      ? "Gender agreement is consistent."
      : `Gender mismatch detected: ${detectedGenderIssues.join(", ")}.`,
    detectedIssues: detectedGenderIssues,
  });

  // 2.3 العدد والمعدود وتمييز الأعداد
  const numberRulesMistakes = [
    /\bثلاث\s+معلمين\b/, // يجب: ثلاثة معلمين
    /\bثلاثة\s+طالبات\b/, // يجب: ثلاث طالبات
    /\bأربع\s+كتب\b/, // يجب: أربعة كتب
    /\bخمس\s+أيام\b/, // يجب: خمسة أيام
    /\bخمسة\s+سنوات\b/, // يجب: خمس سنوات
    /\bعشر\s+طلاب\b/, // يجب: عشرة طلاب
    /\bعشرة\s+طالبات\b/, // يجب: عشر طالبات
    /\bإحدى\s+عشر\s+طالباً\b/, // يجب: أحد عشر
    /\bاثنا\s+عشر\s+طالبة\b/ // يجب: اثنتا عشرة
  ];
  const detectedNumberIssues: string[] = [];
  numberRulesMistakes.forEach((regex) => {
    const match = fullText.match(regex);
    if (match) detectedNumberIssues.push(match[0]);
  });

  const isNumberRulesFulfilled = detectedNumberIssues.length === 0;
  criteria.push({
    id: "number_rules",
    axis: "grammar",
    axisLabelAr: "محور السلامة النحوية والمعجمية",
    axisLabelEn: "Grammar & Lexical Correctness",
    titleAr: "أحكام العدد والمعدود والتمييز العددي",
    titleEn: "Numerals & Counted Noun Concord",
    standardRuleAr: "تطبيق قواعد العدد مع المعدود (الأعداد ١-٢ توافق، ٣-١٠ تخالف المعدود في التذكير والتأنيث، ١١-١٢ توافق في الجزأين، مع ضبط إعراب التمييز).",
    standardRuleEn: "Correct gender opposition/agreement for numerals 3-10, 11-12 and proper noun inflection.",
    isFulfilled: isNumberRulesFulfilled,
    notesAr: isNumberRulesFulfilled
      ? "صياغة الأعداد ومطابقة المعدود والتمييز منضبطة ودقيقة."
      : `تنبيه في صياغة العدد والمعدود: ${detectedNumberIssues.join("، ")}.`,
    notesEn: isNumberRulesFulfilled
      ? "Numeral syntax conforms to Arabic grammar."
      : `Numeral concord issue: ${detectedNumberIssues.join(", ")}.`,
    detectedIssues: detectedNumberIssues,
  });

  // 2.4 استخدام المعاجم وتجنب الألفاظ المولدة أو الركيكة
  const colloquialOrAwkwardTerms = [
    { pattern: /\bيتوجب على\b/, repl: "يجب على / يلزم" },
    { pattern: /\bتم القيام بـ\b/, repl: "قام بـ / أجرى" },
    { pattern: /\bتمت دراسة\b/, repl: "دُرست / جرت دراسة" },
    { pattern: /\bبشكل عام\b/, repl: "عموماً / بوجه عام" },
    { pattern: /\bلعب دوراً\b/, repl: "أدّى دوراً / أسهم في" },
    { pattern: /\bكافة الطلاب\b/, repl: "الطلاب كافة / جميع الطلاب" },
    { pattern: /\bنوعاً ما\b/, repl: "إلى حد محدد (تجنب اللفظ العائم)" },
    { pattern: /\bسوى\s+ان\b/, repl: "غير أن / إلا أن" },
  ];
  const detectedLexicalIssues: string[] = [];
  colloquialOrAwkwardTerms.forEach((item) => {
    if (item.pattern.test(fullText)) {
      detectedLexicalIssues.push(`${item.pattern.source.replace(/\\b/g, "")} (يُفضل: ${item.repl})`);
    }
  });

  const isLexicalFulfilled = detectedLexicalIssues.length === 0;
  criteria.push({
    id: "lexical_precision",
    axis: "grammar",
    axisLabelAr: "محور السلامة النحوية والمعجمية",
    axisLabelEn: "Grammar & Lexical Correctness",
    titleAr: "الفصاحة المعجمية وتجنب التراكيب المولدة والركيكة",
    titleEn: "Lexical Eloquence & Avoiding Awkward Calques",
    standardRuleAr: "استخدام الألفاظ المعجمية الفصيحة الدقيقة، والابتعاد عن التراكيب المترجمة ركيكاً (مثل: يتوجب، تم القيام بـ، لعب دوراً)، والتحقق من صحة الاشتقاق.",
    standardRuleEn: "Use of authentic classical lexicon; eliminating translation calques and weak idioms.",
    isFulfilled: isLexicalFulfilled,
    notesAr: isLexicalFulfilled
      ? "المفردات والتراكيب فصيحة ورصينة وخالية من التعبيرات المولدة أو الركيكة."
      : `اقتراح للارتقاء بالفصاحة: ${detectedLexicalIssues.slice(0, 2).join("، ")}.`,
    notesEn: isLexicalFulfilled
      ? "Vocabulary is academically eloquent."
      : `Lexical phrasing suggestions: ${detectedLexicalIssues.slice(0, 2).join(", ")}.`,
    detectedIssues: detectedLexicalIssues,
    suggestedFix: detectedLexicalIssues.length > 0 ? "استبدال التراكيب الركيكة بتعبيرات فصيحة مباشرة" : undefined,
  });

  // =========================================================================
  // 3. محور علامات الترقيم وتنظيم النص (Punctuation & Text Layout)
  // =========================================================================

  // 3.1 الفاصلة (،) وتنظيم الوقفات
  // Check space before comma or multiple commas or English comma used in Arabic
  const englishCommaInArabic = /[\u0600-\u06FF]+,\s*[\u0600-\u06FF]+/.test(fullText);
  const spaceBeforeComma = /\s+،/.test(fullText);
  const repeatedComma = /،{2,}/.test(fullText);
  const isCommaSound = !englishCommaInArabic && !spaceBeforeComma && !repeatedComma;

  const commaIssues: string[] = [];
  if (englishCommaInArabic) commaIssues.push("استخدام الفاصلة الإنجليزية (,) في نص عربي بدلاً من الفاصلة العربية (،)");
  if (spaceBeforeComma) commaIssues.push("وجود فراغ خاطئ قبل الفاصلة (،)");
  if (repeatedComma) commaIssues.push("تكرار الفواصل (،،)");

  criteria.push({
    id: "comma_usage",
    axis: "punctuation",
    axisLabelAr: "محور علامات الترقيم وتنظيم النص",
    axisLabelEn: "Punctuation & Text Organization",
    titleAr: "الفاصلة العربية (،) وتنظيم وقفات القراءة",
    titleEn: "Arabic Comma (،) Placement & Spacing",
    standardRuleAr: "وضع الفاصلة العربية (،) ملاصقة للكلمة التي قبلها مباشرة ومتبوعة بفراغ، وتوضع بين الجمل المعطوفة لتنظيم وقفة القراءة دون تكرار أو مسافات سابقة.",
    standardRuleEn: "Accurate placement of Arabic comma (،) attached to preceding word without preceding space.",
    isFulfilled: isCommaSound,
    notesAr: isCommaSound
      ? "رسم وموضع الفاصلة العربية (،) سليم تماماً ودون مسافات سابقة."
      : `ملحوظة ترقيم الفاصلة: ${commaIssues.join("، ")}.`,
    notesEn: isCommaSound
      ? "Arabic comma placement is flawless."
      : `Comma formatting issues: ${commaIssues.join(", ")}.`,
    detectedIssues: commaIssues,
    suggestedFix: !isCommaSound ? "إزالة المسافات قبل الفاصلة وتحويل الفاصلة اللاتينية إلى عربية (،)" : undefined,
  });

  // 3.2 النقطة (.) واكتمال المعنى
  // Check options ending with dot or space before dot
  const spaceBeforeDot = /\s+\./.test(fullText);
  const repeatedDot = /\.{2,}/.test(fullText.replace(/\.\.\./g, "")); // avoid ellipsis
  const isDotSound = !spaceBeforeDot && !repeatedDot;

  const dotIssues: string[] = [];
  if (spaceBeforeDot) dotIssues.push("وجود فراغ قبل النقطة");
  if (repeatedDot) dotIssues.push("تكرار النقطتين دون مسوغ");

  criteria.push({
    id: "period_point",
    axis: "punctuation",
    axisLabelAr: "محور علامات الترقيم وتنظيم النص",
    axisLabelEn: "Punctuation & Text Organization",
    titleAr: "النقطة (.) واكتمال الفكرة والجمل التامة",
    titleEn: "Period / Full Stop (.) Usage",
    standardRuleAr: "توضع النقطة (.) في نهاية الجملة التامة المعنى والفقرات المستقلة لتدل على اكتمال الفكرة، مع ملاصقتها للكلمة السابقة مباشرة.",
    standardRuleEn: "Period placement at end of complete ideas without preceding space.",
    isFulfilled: isDotSound,
    notesAr: isDotSound
      ? "استخدام النقطة منضبط ومطابق لمعايير إنهاء الجمل والفقرات المستقلة."
      : `ملحوظة في استخدام النقطة: ${dotIssues.join("، ")}.`,
    notesEn: isDotSound
      ? "Period usage follows standard typographic rules."
      : `Period placement issues: ${dotIssues.join(", ")}.`,
    detectedIssues: dotIssues,
  });

  // 3.3 الفاصلة المنقوطة (؛) للتعليل والسببية
  // Check if text has reasons (لأن / بسبب / نظراً لـ) without semicolon or semicolon with space before it
  const spaceBeforeSemicolon = /\s+[؛;]/.test(fullText);
  const hasReasonWithoutSemicolon = /(لأن|نظراً لـ|بسبب أن|حيث إن)\b/.test(stem) && !stem.includes("؛");
  const isSemicolonSound = !spaceBeforeSemicolon;

  const semicolonIssues: string[] = [];
  if (spaceBeforeSemicolon) semicolonIssues.push("وجود فراغ قبل الفاصلة المنقوطة");
  if (hasReasonWithoutSemicolon) semicolonIssues.push("يُستحسن وضع فاصلة منقوطة (؛) قبل الجملة التعليلية (لأن / بسبب)");

  criteria.push({
    id: "semicolon_causal",
    axis: "punctuation",
    axisLabelAr: "محور علامات الترقيم وتنظيم النص",
    axisLabelEn: "Punctuation & Text Organization",
    titleAr: "الفاصلة المنقوطة (؛) بين الجمل والسببية",
    titleEn: "Semicolon (؛) in Causal Clauses",
    standardRuleAr: "توضع الفاصلة المنقوطة (؛) بين جملتين إحداهما سبب أو تعليل للأخرى، أو لتفصيل جمل طويلة ومستقلة نسبياً.",
    standardRuleEn: "Semicolon usage between related causal or explanatory clauses.",
    isFulfilled: isSemicolonSound,
    notesAr: isSemicolonSound
      ? "مواضع الفاصلة المنقوطة والروابط السببية مستوفاة بدقة."
      : `ملحوظة الفاصلة المنقوطة: ${semicolonIssues.join("، ")}.`,
    notesEn: isSemicolonSound
      ? "Semicolon syntax is appropriate."
      : `Semicolon notes: ${semicolonIssues.join(", ")}.`,
    detectedIssues: semicolonIssues,
  });

  // 3.4 علامة الاستفهام (؟) وضبط الأسئلة
  const spaceBeforeQuestionMark = /\s+[؟?]/.test(fullText);
  const repeatedQuestionMark = /[؟?]{2,}/.test(fullText);
  const latinQuestionMarkInArabic = /[\u0600-\u06FF]+\s*\?/.test(fullText);
  // For MCQ, we prefer declarative stem ending with colon rather than interrogative
  const isMcqWithQuestionMark = (qType === "mcq" || qType === "multi_mcq") && stem.endsWith("؟");
  const isQuestionMarkSound = !spaceBeforeQuestionMark && !repeatedQuestionMark && !latinQuestionMarkInArabic && !isMcqWithQuestionMark;

  const questionMarkIssues: string[] = [];
  if (latinQuestionMarkInArabic) questionMarkIssues.push("استخدام علامة استفهام إنجليزية (?) في نص عربي بدلاً من (؟)");
  if (spaceBeforeQuestionMark) questionMarkIssues.push("وجود فراغ قبل علامة الاستفهام");
  if (repeatedQuestionMark) questionMarkIssues.push("تكرار علامة الاستفهام (؟؟)");
  if (isMcqWithQuestionMark) questionMarkIssues.push("في أسئلة الاختيار، يُفضل تحويل الجذع لجملة خبرية تنتهي بنقطتين (:) بدلاً من (؟)");

  criteria.push({
    id: "question_mark",
    axis: "punctuation",
    axisLabelAr: "محور علامات الترقيم وتنظيم النص",
    axisLabelEn: "Punctuation & Text Organization",
    titleAr: "علامة الاستفهام العربية (؟) وضبط الجمل الاستفهامية",
    titleEn: "Arabic Question Mark (؟) Rules",
    standardRuleAr: "توضع علامة الاستفهام العربية (؟) في نهاية الجمل الاستفهامية الحقيقية حصراً، مع تجنب الاستفهام المتكرر في جذع الاختيار من متعدد والاستعاضة عنه بصيغة خبرية.",
    standardRuleEn: "Accurate placement of Arabic question mark (؟) and preferring declarative stems for MCQs.",
    isFulfilled: isQuestionMarkSound,
    notesAr: isQuestionMarkSound
      ? "علامات الاستفهام منضبطة رسمياً وتنسيقياً ومطابقة للنمط الاختباري."
      : `تنبيه في علامة الاستفهام: ${questionMarkIssues.join("، ")}.`,
    notesEn: isQuestionMarkSound
      ? "Question mark usage conforms to style guide."
      : `Question mark issues: ${questionMarkIssues.join(", ")}.`,
    detectedIssues: questionMarkIssues,
    suggestedFix: isMcqWithQuestionMark ? "تحويل الجذع إلى جملة خبرية تنتهي بـ (:) وحذف أداة الاستفهام" : undefined,
  });

  // 3.5 النقطتان الرأسيتان (:) بعد القول وعند التعداد والشرح
  const spaceBeforeColon = /\s+[:：]/.test(fullText.replace(/:\s*$/, "")); // allow ending
  const hasDeclarativeEndingForMcq = (qType === "mcq" || qType === "multi_mcq") ? (stem.endsWith(":") || stem.endsWith("：")) : true;
  const isColonSound = !spaceBeforeColon && hasDeclarativeEndingForMcq;

  const colonIssues: string[] = [];
  if (spaceBeforeColon) colonIssues.push("فراغ غير منضبط قبل النقطتين الرأسيتين");
  if (!hasDeclarativeEndingForMcq) colonIssues.push("يُستحسن إنهاء جذع الاختيار من متعدد بنقطتين رأسيّتين (:) لربطه بالبدائل");

  criteria.push({
    id: "colon_elucidation",
    axis: "punctuation",
    axisLabelAr: "محور علامات الترقيم وتنظيم النص",
    axisLabelEn: "Punctuation & Text Organization",
    titleAr: "النقطتان الرأسيتان (:) بعد القول وللتعداد والشرح وربط الجذع",
    titleEn: "Colons (:) for Enumeration, Explanation & Stem Binding",
    standardRuleAr: "توضع النقطتان الرأسيتان (:) بعد القول أو عند التعداد والشرح وتفصيل المجمل، وفي نهاية جذع الاختيار من متعدد لربط العبارة الخبرية بالبدائل.",
    standardRuleEn: "Use of colons (:) for enumeration, explanation, and connecting declarative stems to answer choices.",
    isFulfilled: isColonSound,
    notesAr: isColonSound
      ? "استخدام النقطتين الرأسيتين (:) مستوفٍ لمعايير الصياغة الخبرية والربط الدلالي."
      : `ملحوظة النقطتين الرأسيتين: ${colonIssues.join("، ")}.`,
    notesEn: isColonSound
      ? "Colon formatting is optimal."
      : `Colon usage suggestions: ${colonIssues.join(", ")}.`,
    detectedIssues: colonIssues,
    suggestedFix: !hasDeclarativeEndingForMcq ? "إضافة نقطتين (:) في نهاية متن السؤال" : undefined,
  });

  // =========================================================================
  // Calculate Totals & Axis Breakdown
  // =========================================================================
  const totalCount = criteria.length;
  const fulfilledCount = criteria.filter((c) => c.isFulfilled).length;
  const score = Math.round((fulfilledCount / totalCount) * 100);

  const orthographyCriteria = criteria.filter((c) => c.axis === "orthography");
  const grammarCriteria = criteria.filter((c) => c.axis === "grammar");
  const punctuationCriteria = criteria.filter((c) => c.axis === "punctuation");

  const status: "excellent" | "good" | "needs_attention" =
    score >= 90 ? "excellent" : score >= 70 ? "good" : "needs_attention";

  const statusLabelAr =
    status === "excellent"
      ? "ممتاز ومستوفٍ للمعايير اللغوية والإملائية بدقة"
      : status === "good"
      ? "جيد مع وجود ملحوظات لغوية طفيفة"
      : "يتطلب مراجعة وضبط السلامة اللغوية";

  const statusLabelEn =
    status === "excellent"
      ? "Excellent: Fully compliant with linguistic & orthographic standards"
      : status === "good"
      ? "Good: Minor linguistic improvements recommended"
      : "Needs Review: Linguistic adjustments required";

  return {
    score,
    fulfilledCount,
    totalCount,
    status,
    statusLabelAr,
    statusLabelEn,
    criteria,
    axisBreakdown: {
      orthography: {
        fulfilled: orthographyCriteria.filter((c) => c.isFulfilled).length,
        total: orthographyCriteria.length,
        score: Math.round((orthographyCriteria.filter((c) => c.isFulfilled).length / orthographyCriteria.length) * 100),
      },
      grammar: {
        fulfilled: grammarCriteria.filter((c) => c.isFulfilled).length,
        total: grammarCriteria.length,
        score: Math.round((grammarCriteria.filter((c) => c.isFulfilled).length / grammarCriteria.length) * 100),
      },
      punctuation: {
        fulfilled: punctuationCriteria.filter((c) => c.isFulfilled).length,
        total: punctuationCriteria.length,
        score: Math.round((punctuationCriteria.filter((c) => c.isFulfilled).length / punctuationCriteria.length) * 100),
      },
    },
  };
}
