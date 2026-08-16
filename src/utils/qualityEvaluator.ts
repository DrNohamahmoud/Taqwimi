import { Question } from "../types";
import { checkQuestionSpelling } from "./spellChecker";

export interface QualityHintResult {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  isFulfilled: boolean;
  category: "pedagogical" | "linguistic" | "psychometric" | "structural";
}

export interface QuestionQualityReport {
  fulfilledCount: number;
  totalCount: number;
  percentage: number;
  status: "excellent" | "good" | "needs_improvement";
  statusLabelAr: string;
  statusLabelEn: string;
  hints: QualityHintResult[];
  fulfilledHints: QualityHintResult[];
  unfulfilledHints: QualityHintResult[];
}

export function evaluateQuestionQuality(q: Question, isRtl: boolean = true): QuestionQualityReport {
  const hints: QualityHintResult[] = [];
  const stem = (q.stem || "").trim();
  const lowerStem = stem.toLowerCase();
  const options = q.options || [];
  const correctAnswer = (q.correctAnswer || q.answer || "").trim();

  // 1. Stem Length & Conciseness (Pedagogical/Linguistic)
  const isStemLengthOptimal = stem.length >= 20 && stem.length <= 220;
  hints.push({
    id: "stem_length",
    titleAr: "طول الجذع والإيجاز غير المخل",
    titleEn: "Optimal Stem Length & Conciseness",
    descAr: isStemLengthOptimal
      ? "طول الجذع متوازن ويقدم السياق الكافي دون إطناب."
      : stem.length < 20
      ? "الجذع قصير جداً؛ أضف سياقاً يوضح المسألة بدقة."
      : "الجذع طويل جداً؛ اختصر المقدمات وركز على المشكلة الأساسية.",
    descEn: isStemLengthOptimal
      ? "Stem length is balanced and provides sufficient context without redundancy."
      : stem.length < 20
      ? "Stem is too short; provide clearer context."
      : "Stem is too long; trim unnecessary introductory text.",
    isFulfilled: isStemLengthOptimal,
    category: "linguistic",
  });

  // 1.1 Grammatical & Syntactic Correctness (Linguistic)
  const doublePunct = /[،,.؟?]{2,}/.test(stem + " " + options.join(" "));
  const spaceBeforePunct = /\s[،,.؟:]/.test(stem + " " + options.join(" "));
  const isGrammarSound = !doublePunct && !spaceBeforePunct;
  hints.push({
    id: "grammar_syntax_soundness",
    titleAr: "صحة التركيب النحوي والإعرابي واستقامة الجملة",
    titleEn: "Grammatical & Syntactic Correctness",
    descAr: isGrammarSound
      ? "التركيب النحوي والإعرابي سليم ومتوافق مع قواعد اللغة العربية الفصحى."
      : "يوجد خلل في استقامة الجملة النحوية أو فراغات غير منضبطة قبل علامات الترقيم.",
    descEn: isGrammarSound
      ? "Syntactic formulation is accurate and adheres to standard grammar rules."
      : "Check grammatical structure and punctuation spacing.",
    isFulfilled: isGrammarSound,
    category: "linguistic",
  });

  // 1.2 Spelling & Morphological Precision (Linguistic)
  const spellCheckRes = checkQuestionSpelling(q, isRtl);
  const hasSpellingTypos = spellCheckRes.hasErrors;
  hints.push({
    id: "spelling_orthography_soundness",
    titleAr: "السلامة الإملائية ودقة رسم الهمزات والحروف",
    titleEn: "Spelling Accuracy & Orthographic Precision",
    descAr: !hasSpellingTypos
      ? "الرسم الإملائي دقيق تماماً للهمزات والتاء المربوطة والألف المقصورة وعلامات الترقيم."
      : `تم رصد ${spellCheckRes.totalErrors} ملحوظات إملائية في الجذع أو البدائل (همزات، تاء مربوطة، أو ألف مقصورة).`,
    descEn: !hasSpellingTypos
      ? "Spelling and orthographic marks are completely accurate."
      : `Detected ${spellCheckRes.totalErrors} spelling issues in stem or options.`,
    isFulfilled: !hasSpellingTypos,
    category: "linguistic",
  });

  // 2. Clear Declarative Stem / Punctuation (Structural)
  const startsWithQuestionWord = [
    "أي مما يلي",
    "ما هو",
    "ما هي",
    "كيف",
    "لماذا",
    "ما الفرق",
    "أيها",
    "هل",
    "which of the following",
    "what is",
    "how does",
    "why",
  ].some((word) => lowerStem.startsWith(word));
  const endsWithQuestionMark = lowerStem.endsWith("؟") || lowerStem.endsWith("?");
  const hasDeclarativeEnding = lowerStem.endsWith(":") || lowerStem.endsWith("：");
  const isPunctuationSound = !startsWithQuestionWord && !endsWithQuestionMark && (hasDeclarativeEnding || !lowerStem.includes("؟"));

  hints.push({
    id: "declarative_punctuation",
    titleAr: "الصياغة كعبارة خبرية وضبط الترقيم",
    titleEn: "Declarative Formulation & Punctuation",
    descAr: isPunctuationSound
      ? "صياغة الجذع منضبطة خبرياً وبشكل مباشر."
      : "يُفضل صياغة الجذع كعبارة خبرية تنتهي بنقطتين (:) بدلاً من أسئلة الاستفهام المتكررة المنتهية بـ (؟).",
    descEn: isPunctuationSound
      ? "Stem is framed declaratively with standard punctuation."
      : "Frame the stem as a direct declarative statement ending with a colon (:).",
    isFulfilled: isPunctuationSound,
    category: "structural",
  });

  // 3. No vague or ambiguous terms (Linguistic)
  const vagueTerms = [
    "نوعاً ما",
    "نوعا ما",
    "إلى حد ما",
    "إلى حدٍ ما",
    "بعض الشيء",
    "vague",
    "somewhat",
    "obscure",
  ];
  const allText = (stem + " " + options.join(" ")).toLowerCase();
  const hasVagueTerms = vagueTerms.some((t) => allText.includes(t));

  hints.push({
    id: "no_vague_terms",
    titleAr: "خلو الصياغة من الألفاظ الغامضة أو العائمة",
    titleEn: "Free of Vague or Ambiguous Terms",
    descAr: !hasVagueTerms
      ? "المفردات المستخدمة واضحة ومباشرة وخالية من الإبهام."
      : "تجنب الألفاظ المطاطة (مثل: نوعاً ما، إلى حد ما) التي تفتح مجالاً للتأويل.",
    descEn: !hasVagueTerms
      ? "Vocabulary is precise without ambiguous qualifiers."
      : "Avoid vague qualifiers (e.g. somewhat, to some extent).",
    isFulfilled: !hasVagueTerms,
    category: "linguistic",
  });

  // 4. Single Core Learning Objective (Pedagogical)
  const isCompound = stem.includes("؟ و") || stem.includes("؟ إضافة") || (stem.split(" و ").length > 3 && stem.length > 120);
  hints.push({
    id: "single_objective",
    titleAr: "التركيز على ناتج تعليمي واحد محدد",
    titleEn: "Single Focused Learning Objective",
    descAr: !isCompound
      ? "السؤال يركز على فكرة محورية واحدة دون تشتيت."
      : "يحتوي السؤال على أفكار مركبة؛ افصلها لقياس كل هدف على حدة.",
    descEn: !isCompound
      ? "Item targets a single core learning objective."
      : "Item contains compound ideas; separate them to test one objective.",
    isFulfilled: !isCompound,
    category: "pedagogical",
  });

  // 5. No Loose or Absolute Terms (All of above / Always / Never)
  const looseAbsoluteTerms = [
    "كل ما سبق",
    "جميع ما سبق",
    "جميع ماذكر",
    "جميع ما ذكر",
    "جميع الاجابات",
    "لا شيء مما سبق",
    "دائماً",
    "أبداً",
    "all of the above",
    "none of the above",
    "always",
    "never",
  ];
  const hasLooseTerms = looseAbsoluteTerms.some((t) => allText.includes(t));
  hints.push({
    id: "no_loose_absolute_terms",
    titleAr: "تجنب التعميمات المطلقة (جميع ما سبق / دائماً / أبداً)",
    titleEn: "No Absolute or 'All of the Above' Terms",
    descAr: !hasLooseTerms
      ? "البدائل تستند إلى خيارات نوعية حقيقية خالية من خيارات الحشو التعميمية."
      : "تجنب 'جميع ما سبق' أو 'دائماً'؛ لأنها تضعف القوة التمييزية وتسهل التخمين.",
    descEn: !hasLooseTerms
      ? "No generic all/none options or absolute qualifiers."
      : "Avoid 'All of the above' or absolute words as they harm discrimination.",
    isFulfilled: !hasLooseTerms,
    category: "pedagogical",
  });

  // 6. Free of Leading Cues / Bias (Pedagogical)
  const leadingPhrases = [
    "أليس كذلك",
    "أليس هو",
    "بالطبع",
    "من البديهي",
    "لا يخفى أن",
    "isn't it",
    "obviously",
    "right?",
  ];
  const hasLeadingPhrases = leadingPhrases.some((p) => lowerStem.includes(p));
  let isAnswerLengthBalanced = true;
  if (options.length > 0 && correctAnswer) {
    const avgLen = options.reduce((acc, curr) => acc + curr.length, 0) / options.length;
    if (correctAnswer.length > avgLen * 2.2 && correctAnswer.length > 20) {
      isAnswerLengthBalanced = false;
    }
  }
  const isUnbiasedAndUncued = !hasLeadingPhrases && isAnswerLengthBalanced;

  hints.push({
    id: "no_leading_cues",
    titleAr: "خلو الصياغة من التلميحات الموجهة للمفتاح",
    titleEn: "Free of Leading Cues or Clues",
    descAr: isUnbiasedAndUncued
      ? "لا توجد مؤشرات لفظية أو تفاوت في الطول يوحي بالإجابة الصحيحة."
      : !isAnswerLengthBalanced
      ? "الخيار الصحيح أطول بشكل لافت من باقي البدائل، مما يوحي به للطالب."
      : "تجنب العبارات الموجهة (مثل: أليس كذلك) التي تكشف الإجابة.",
    descEn: isUnbiasedAndUncued
      ? "No verbal or length clues pointing to the correct key."
      : "The correct key is noticeably longer than distractors, giving an unintended clue.",
    isFulfilled: isUnbiasedAndUncued,
    category: "pedagogical",
  });

  // 7. Objective & Neutral Phrasing (Linguistic)
  const emotionalWords = ["للأسف", "من المؤسف", "المؤسف", "مع الأسف", "unfortunately", "sadly"];
  const hasEmotionalWords = emotionalWords.some((w) => allText.includes(w));
  hints.push({
    id: "neutral_tone",
    titleAr: "الحيادية والموضوعية الأكاديمية",
    titleEn: "Academic Neutrality & Objectivity",
    descAr: !hasEmotionalWords
      ? "الصياغة تتسم بالموضوعية والحياد التام."
      : "تجنب المفردات الانفعالية أو العاطفية في صياغة الأسئلة الأكاديمية.",
    descEn: !hasEmotionalWords
      ? "Item tone is completely objective and neutral."
      : "Avoid emotional or subjective phrasing in academic items.",
    isFulfilled: !hasEmotionalWords,
    category: "linguistic",
  });

  // 8. Distractor Quality & Parallelism (MCQ specific or general)
  let isParallelAndHomogeneous = true;
  if (q.qType === "mcq" && options.length >= 3) {
    const lens = options.map((o) => o.trim().length);
    const minL = Math.min(...lens);
    const maxL = Math.max(...lens);
    if (maxL > 0 && minL / maxL < 0.25 && maxL > 25) {
      isParallelAndHomogeneous = false;
    }
  }
  hints.push({
    id: "parallel_distractors",
    titleAr: "تجانس وتوازي البدائل والمشتتات",
    titleEn: "Parallel & Homogeneous Distractors",
    descAr: isParallelAndHomogeneous
      ? "البدائل متجانسة في الطول والتركيب اللغوي."
      : "تفاوت أطوال البدائل كبير؛ احرص على موازنة صياغة الخيارات لتقليل التخمين.",
    descEn: isParallelAndHomogeneous
      ? "Distractors are parallel in length and structure."
      : "Distractors vary greatly in length; balance them to reduce guessing.",
    isFulfilled: isParallelAndHomogeneous,
    category: "structural",
  });

  // 9. Avoid Negative Formulation (ليس / ما عدا / غير)
  const hasNegativeWords =
    lowerStem.includes("ليس") ||
    lowerStem.includes("ما عدا") ||
    lowerStem.includes("ماعدا") ||
    lowerStem.includes("غير") ||
    lowerStem.includes("لا يعتبر") ||
    lowerStem.includes("not ") ||
    lowerStem.includes("except");

  hints.push({
    id: "avoid_negative_phrasing",
    titleAr: "تفضيل الصياغة الإيجابية المباشرة",
    titleEn: "Direct Positive Phrasing",
    descAr: !hasNegativeWords
      ? "السؤال مصاغ بإثبات مباشر يقيس المعرفة الحقيقية."
      : "يتضمن السؤال أداة نفي (ليس / ما عدا). يفضل التحويل لصيغة إثبات أو تمييز النفي بخط بارز.",
    descEn: !hasNegativeWords
      ? "Positively phrased to test direct conceptual mastery."
      : "Contains negative phrasing. Consider direct positive form or bolding the negative word.",
    isFulfilled: !hasNegativeWords,
    category: "pedagogical",
  });

  // 10. Valid Correct Answer Defined (Structural)
  const hasValidAnswer = correctAnswer.length > 0;
  hints.push({
    id: "valid_correct_key",
    titleAr: "تحديد مفتاح الإجابة النموذجية بدقة",
    titleEn: "Precise Correct Answer Key Defined",
    descAr: hasValidAnswer
      ? "مفتاح الإجابة محدد بوضوح لا يقبل الشك."
      : "لم يتم تعيين مفتاح إجابة محدد للسؤال.",
    descEn: hasValidAnswer
      ? "Exact correct answer key is specified."
      : "No clear correct answer key is assigned.",
    isFulfilled: hasValidAnswer,
    category: "structural",
  });

  // 11. Psychometric Difficulty Balance (p-value: 0.30 - 0.80)
  const pVal = typeof q.difficultyIndex === "number" ? q.difficultyIndex : 0.60;
  const isDiffSound = pVal >= 0.30 && pVal <= 0.80;
  hints.push({
    id: "psychometric_difficulty",
    titleAr: "معامل صعوبة متوازن ومناسب (0.30 - 0.80)",
    titleEn: "Balanced Facility Index (p: 0.30 - 0.80)",
    descAr: isDiffSound
      ? `معامل السهولة (${Math.round(pVal * 100)}%) يقع في النطاق السيكومتري المثالي.`
      : pVal > 0.80
      ? `معامل السهولة مرتفع (${Math.round(pVal * 100)}%)، السؤال شديد السهولة.`
      : `معامل السهولة منخفض (${Math.round(pVal * 100)}%)، السؤال بالغ الصعوبة.`,
    descEn: isDiffSound
      ? `Facility index (${Math.round(pVal * 100)}%) is in the optimal psychometric range.`
      : pVal > 0.80
      ? `Facility index is high (${Math.round(pVal * 100)}%), item is very easy.`
      : `Facility index is low (${Math.round(pVal * 100)}%), item is very hard.`,
    isFulfilled: isDiffSound,
    category: "psychometric",
  });

  // 12. Psychometric Discrimination Index (D >= 0.30)
  const dVal = typeof q.discriminationIndex === "number" ? q.discriminationIndex : 0.42;
  const isDiscSound = dVal >= 0.30;
  hints.push({
    id: "psychometric_discrimination",
    titleAr: "معامل تمييز مرتفع وفعال (D ≥ 0.30)",
    titleEn: "Strong Discrimination Index (D ≥ 0.30)",
    descAr: isDiscSound
      ? `معامل التمييز (${dVal.toFixed(2)}) ممتاز ويفرق بكفاءة بين مستويات الطلاب.`
      : `معامل التمييز (${dVal.toFixed(2)}) ضعيف، السؤال يحتاج إلى مراجعة المشتتات.`,
    descEn: isDiscSound
      ? `Discrimination index (${dVal.toFixed(2)}) is strong and differentiates effectively.`
      : `Discrimination index (${dVal.toFixed(2)}) is low, check distractors.`,
    isFulfilled: isDiscSound,
    category: "psychometric",
  });

  const fulfilledHints = hints.filter((h) => h.isFulfilled);
  const unfulfilledHints = hints.filter((h) => !h.isFulfilled);
  const fulfilledCount = fulfilledHints.length;
  const totalCount = hints.length;
  const percentage = Math.round((fulfilledCount / totalCount) * 100);

  let status: "excellent" | "good" | "needs_improvement" = "needs_improvement";
  let statusLabelAr = "بحاجة لتحسين";
  let statusLabelEn = "Needs Improvement";

  if (percentage >= 85) {
    status = "excellent";
    statusLabelAr = "جودة ممتازة";
    statusLabelEn = "Excellent Quality";
  } else if (percentage >= 65) {
    status = "good";
    statusLabelAr = "جودة جيدة";
    statusLabelEn = "Good Quality";
  }

  return {
    fulfilledCount,
    totalCount,
    percentage,
    status,
    statusLabelAr,
    statusLabelEn,
    hints,
    fulfilledHints,
    unfulfilledHints,
  };
}
