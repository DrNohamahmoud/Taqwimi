import { Question } from "../types";

export type TipCategory = "psychometric" | "construction" | "distractor" | "bloom" | "rubric";

export interface QuestionTypeTip {
  id: string;
  category: TipCategory;
  titleAr: string;
  titleEn: string;
  ruleAr: string;
  ruleEn: string;
  idealStandardAr: string;
  idealStandardEn: string;
  psychometricImpactAr: string;
  psychometricImpactEn: string;
  warningAr?: string;
  warningEn?: string;
}

export interface TypeSpecificPsychometrics {
  optimalFacilityRange: { min: number; max: number; labelAr: string; labelEn: string };
  optimalDiscriminationMin: number;
  bloomSuitabilityAr: string;
  bloomSuitabilityEn: string;
  guessingProbability: string;
  tips: QuestionTypeTip[];
}

export const CATEGORY_METADATA: Record<
  TipCategory,
  {
    labelAr: string;
    labelEn: string;
    lightBadge: string;
    darkBadge: string;
    lightBorder: string;
    darkBorder: string;
    lightIconBg: string;
    darkIconBg: string;
    activeBtnCls: string;
    headerBgLight: string;
    headerBgDark: string;
  }
> = {
  distractor: {
    labelAr: "المشتتات والبدائل",
    labelEn: "Distractors & Options",
    lightBadge: "bg-emerald-200 text-emerald-950 border-2 border-emerald-600 font-black",
    darkBadge: "bg-emerald-950 text-emerald-200 border-2 border-emerald-600 font-black",
    lightBorder: "border-emerald-400 hover:border-emerald-600",
    darkBorder: "border-emerald-700 hover:border-emerald-500",
    lightIconBg: "bg-emerald-700 text-white",
    darkIconBg: "bg-emerald-800 text-emerald-100",
    activeBtnCls: "bg-emerald-800 text-white border-2 border-emerald-950 shadow-md ring-2 ring-emerald-500/50",
    headerBgLight: "bg-emerald-900 text-white",
    headerBgDark: "bg-emerald-950 text-white border-b-2 border-emerald-800",
  },
  psychometric: {
    labelAr: "القياس والتمييز",
    labelEn: "Psychometrics & Scoring",
    lightBadge: "bg-purple-200 text-purple-950 border-2 border-purple-600 font-black",
    darkBadge: "bg-purple-950 text-purple-200 border-2 border-purple-600 font-black",
    lightBorder: "border-purple-400 hover:border-purple-600",
    darkBorder: "border-purple-700 hover:border-purple-500",
    lightIconBg: "bg-purple-700 text-white",
    darkIconBg: "bg-purple-800 text-purple-100",
    activeBtnCls: "bg-purple-800 text-white border-2 border-purple-950 shadow-md ring-2 ring-purple-500/50",
    headerBgLight: "bg-purple-900 text-white",
    headerBgDark: "bg-purple-950 text-white border-b-2 border-purple-800",
  },
  construction: {
    labelAr: "البناء الإجرائي",
    labelEn: "Item Construction",
    lightBadge: "bg-blue-200 text-blue-950 border-2 border-blue-600 font-black",
    darkBadge: "bg-blue-950 text-blue-200 border-2 border-blue-600 font-black",
    lightBorder: "border-blue-400 hover:border-blue-600",
    darkBorder: "border-blue-700 hover:border-blue-500",
    lightIconBg: "bg-blue-700 text-white",
    darkIconBg: "bg-blue-800 text-blue-100",
    activeBtnCls: "bg-blue-800 text-white border-2 border-blue-950 shadow-md ring-2 ring-blue-500/50",
    headerBgLight: "bg-blue-900 text-white",
    headerBgDark: "bg-blue-950 text-white border-b-2 border-blue-800",
  },
  bloom: {
    labelAr: "المستوى المعرفي",
    labelEn: "Cognitive Alignment",
    lightBadge: "bg-amber-200 text-amber-950 border-2 border-amber-600 font-black",
    darkBadge: "bg-amber-950 text-amber-200 border-2 border-amber-600 font-black",
    lightBorder: "border-amber-400 hover:border-amber-600",
    darkBorder: "border-amber-700 hover:border-amber-500",
    lightIconBg: "bg-amber-700 text-white",
    darkIconBg: "bg-amber-800 text-amber-100",
    activeBtnCls: "bg-amber-800 text-white border-2 border-amber-950 shadow-md ring-2 ring-amber-500/50",
    headerBgLight: "bg-amber-900 text-white",
    headerBgDark: "bg-amber-950 text-white border-b-2 border-amber-800",
  },
  rubric: {
    labelAr: "سلالم التقدير والروبرك",
    labelEn: "Rubrics & Criteria",
    lightBadge: "bg-rose-200 text-rose-950 border-2 border-rose-600 font-black",
    darkBadge: "bg-rose-950 text-rose-200 border-2 border-rose-600 font-black",
    lightBorder: "border-rose-400 hover:border-rose-600",
    darkBorder: "border-rose-700 hover:border-rose-500",
    lightIconBg: "bg-rose-700 text-white",
    darkIconBg: "bg-rose-800 text-rose-100",
    activeBtnCls: "bg-rose-800 text-white border-2 border-rose-950 shadow-md ring-2 ring-rose-500/50",
    headerBgLight: "bg-rose-900 text-white",
    headerBgDark: "bg-rose-950 text-white border-b-2 border-rose-800",
  },
};

export const QUESTION_TYPE_PSYCHOMETRIC_RULES: Record<Question["qType"], TypeSpecificPsychometrics> = {
  mcq: {
    optimalFacilityRange: { min: 0.45, max: 0.70, labelAr: "0.45 - 0.70 (معتدل الصعوبة)", labelEn: "0.45 - 0.70 (Optimal Moderate)" },
    optimalDiscriminationMin: 0.35,
    bloomSuitabilityAr: "الفهم، التطبيق، والتحليل (مع إمكانية التذكر للحقائق الأساسية)",
    bloomSuitabilityEn: "Understand, Apply, Analyze (and Recall for core facts)",
    guessingProbability: "25% (في حالة 4 خيارات متكافئة)",
    tips: [
      {
        id: "mcq_homogeneity",
        category: "distractor",
        titleAr: "تجانس وتكافؤ البدائل والمشتتات",
        titleEn: "Distractor Homogeneity & Parallelism",
        ruleAr: "يجب أن تكون جميع البدائل متقاربة في الطول، الصيغة النحوية، والمجال المفهومي لضمان عدم لفت النظر للمفتاح الصحيح.",
        ruleEn: "All distractors must share similar length, grammar, and conceptual domain.",
        idealStandardAr: "تفاوت أطوال البدائل لا يتعدى 25% مع تشابه الصياغة التركيبية.",
        idealStandardEn: "Length difference across options under 25% with uniform syntax.",
        psychometricImpactAr: "يرفع معامل التمييز (D) ويمنع اكتشاف الإجابة عبر التخمين الذكي واستبعاد الشاذ.",
        psychometricImpactEn: "Enhances Discrimination Index (D) by preventing elimination of outlier options."
      },
      {
        id: "mcq_no_all_none",
        category: "distractor",
        titleAr: "حظر 'جميع ما سبق' و 'لا شيء مما سبق'",
        titleEn: "Prohibit 'All of the Above' / 'None of the Above'",
        ruleAr: "تجنب الخيارات التعميمية كلياً لأنها تتيح للطالب معرفة الإجابة بمجرد استبعاد خيار واحد أو تذكر خيارين فقط.",
        ruleEn: "Avoid global collective options as they allow easy guessing with partial knowledge.",
        idealStandardAr: "4 بدائل نوعية حقيقية مستقلة تماماً ومقبولة منطقياً للطلاب الضعاف.",
        idealStandardEn: "4 distinct, plausible, independent options.",
        psychometricImpactAr: "يحمي معامل الصعوبة (p) من التضخم ويحافظ على صدق البناء السيكومتري.",
        psychometricImpactEn: "Preserves construct validity and prevents artificial inflation of facility index."
      },
      {
        id: "mcq_key_randomization",
        category: "psychometric",
        titleAr: "توزيع مواقع المفتاح الصحيح بالتساوي",
        titleEn: "Equitable Key Position Balance (A, B, C, D)",
        ruleAr: "توزيع مفاتيح الإجابة الصحيحة بنسب متقاربة (حوالي 25% لكل حرف أ، ب، ج، د) عبر كامل الاختبار.",
        ruleEn: "Distribute correct key evenly across positions (approx 25% each).",
        idealStandardAr: "عدم تكرار نفس الحرف لأكثر من 3 أسئلة متتالية في ورقة الاختبار.",
        idealStandardEn: "No identical correct option letter more than 3 times sequentially.",
        psychometricImpactAr: "يمنع تحيزات الاستجابة الاستراتيجية والأنماط التخمينية العشوائية.",
        psychometricImpactEn: "Eliminates response position bias and guessing patterns."
      },
      {
        id: "mcq_positive_stem",
        category: "construction",
        titleAr: "الصياغة الإيجابية وتفادي النفي في الجذع",
        titleEn: "Positive Stem Phrasing & Highlighting Negatives",
        ruleAr: "قياس المعرفة المباشرة؛ وفي حال الضرورة القصوى للنفي (ليس / ما عدا) يجب تمييزه بخط بارز وغامق.",
        ruleEn: "Test direct knowledge; if negative words are mandatory, highlight them prominently.",
        idealStandardAr: "جذع خبري واضح ينتهي بنقطتين (:) ويحدد المشكلة بدقة متناهية.",
        idealStandardEn: "Declarative stem ending with a colon defining problem explicitly.",
        psychometricImpactAr: "يقلل التباين الخطئي الناتج عن سوء قراءة صيغة النفي ويزيد ثبات الاختبار.",
        psychometricImpactEn: "Reduces measurement error caused by misreading negative phrasing."
      }
    ]
  },
  multi_mcq: {
    optimalFacilityRange: { min: 0.35, max: 0.60, labelAr: "0.35 - 0.60 (صعب إلى معتدل)", labelEn: "0.35 - 0.60 (Moderate to Hard)" },
    optimalDiscriminationMin: 0.40,
    bloomSuitabilityAr: "التحليل، المقارنة، والتقويم (مستويات تفكير عليا)",
    bloomSuitabilityEn: "Analysis, Synthesis, and Evaluation (Higher Order Thinking)",
    guessingProbability: "أقل من 10% (بسبب تعدد التوافيق الممكنة)",
    tips: [
      {
        id: "multi_clear_count",
        category: "construction",
        titleAr: "تحديد عدد الإجابات المطلوبة صراحة في رأس السؤال",
        titleEn: "Explicit Required Count Specification",
        ruleAr: "يجب التنصيص بوضوح تام على عدد البدائل الصحيحة المطلوبة (مثال: 'اختر إجابتين صحيحتين').",
        ruleEn: "Explicitly state the exact number of required correct choices in the stem.",
        idealStandardAr: "التنصيص الدقيق: 'اختر (2) من البدائل التالية' مع وضع العدد بين قوسين بارزين.",
        idealStandardEn: "Exact statement: 'Select (2) correct options'.",
        psychometricImpactAr: "يضمن عدالة القياس وتوجيه جهد الطالب نحو المعيار المستهدف دون غموض إجرائي.",
        psychometricImpactEn: "Ensures measurement fairness and eliminates procedural ambiguity."
      },
      {
        id: "multi_distractor_balance",
        category: "distractor",
        titleAr: "قوة جاذبية المشتتات الخاطئة في البدائل المتعددة",
        titleEn: "High Distractor Attractiveness in Multi-Select",
        ruleAr: "يجب أن تحتوي قائمة البدائل (5 أو 6 بدائل) على مشتتات تمثل أخطاء مفاهيمية شائعة لدى الطلاب.",
        ruleEn: "Provide 5-6 options with plausible distractors targeting common misconceptions.",
        idealStandardAr: "كل مشتت يختاره على الأقل 5% من أفراد الفئة ذات التحصيل المنخفض.",
        idealStandardEn: "Each distractor attracts at least 5% of low-performing students.",
        psychometricImpactAr: "يرفع القوة التمييزية للبند ويمنع اختيار البدائل الصحيحة بالمصادفة.",
        psychometricImpactEn: "Sharpens item discrimination power against blind guessing."
      },
      {
        id: "multi_scoring_model",
        category: "psychometric",
        titleAr: "معيار التصحيح الجزئي واحتساب الدرجات",
        titleEn: "Partial Credit Psychometric Scoring Model",
        ruleAr: "تطبيق نموذج التصحيح السيكومتري الجزئي مع حسم درجات عند اختيار مشتت خاطئ لمنع التحديد الشامل.",
        ruleEn: "Apply calibrated partial credit model with distractor penalty against mass selection.",
        idealStandardAr: "درجة لكل خيار صحيح محدد، أو نموذج التصحيح التناظري الدقيق.",
        idealStandardEn: "1 point per correct key selected, with penalty for wrong choices.",
        psychometricImpactAr: "يرفع حساسية التمييز الدقيق بين المتمكن جزئياً والمتمكن كلياً.",
        psychometricImpactEn: "Sharpens sensitivity between full mastery and partial knowledge."
      }
    ]
  },
  tf: {
    optimalFacilityRange: { min: 0.55, max: 0.80, labelAr: "0.55 - 0.80 (معتدل)", labelEn: "0.55 - 0.80 (Moderate)" },
    optimalDiscriminationMin: 0.25,
    bloomSuitabilityAr: "التذكر، الفهم، واستيعاب الحقائق المحددة",
    bloomSuitabilityEn: "Recall, Understanding, and Factual Comprehension",
    guessingProbability: "50% (احتمال تخمين مرتفع بطبيعته)",
    tips: [
      {
        id: "tf_single_fact",
        category: "construction",
        titleAr: "اقتصار العبارة على حقيقة أو قضية علمية واحدة فقط",
        titleEn: "Single Fact per Statement Constraint",
        ruleAr: "ممنوع دمج عبارتين علميتين تكون إحداهما صحيحة والأخرى خاطئة، لأن ذلك يربك الطالب ويخل بصدق البند.",
        ruleEn: "Never combine two independent facts where one is true and the other false.",
        idealStandardAr: "عبارة تقريرية مباشرة بسيطة لا تتعدى 25 كلمة خالية من أدوات الربط المركبة.",
        idealStandardEn: "Direct concise statement under 25 words with zero compound conjunctions.",
        psychometricImpactAr: "يحافظ على صدق المحتوى ويضمن قياس مفهوم واحد بدقة دون تداخل.",
        psychometricImpactEn: "Maintains content validity and measures a single target concept cleanly."
      },
      {
        id: "tf_no_absolute_qualifiers",
        category: "construction",
        titleAr: "تجنب ألفاظ الإطلاق والتعميم (دائماً، أبداً، قطعاً، جميع)",
        titleEn: "Eliminate Absolute Qualifiers (Always, Never, All)",
        ruleAr: "ألفاظ التعميم المطلق تكشف للطالب الذكي أن العبارة خاطئة بنسبة 95% دون الحاجة للمعرفة.",
        ruleEn: "Absolute words signal 'False' to test-wise students automatically.",
        idealStandardAr: "صياغة علمية موضوعية دقيقة خالية من المبالغات أو الكلمات الإيحائية.",
        idealStandardEn: "Objective, fact-grounded declarative syntax without leading qualifiers.",
        psychometricImpactAr: "يمنع الاستفادة من مهارة حيل الاختبار (Test-wiseness) ويرفع التمييز الحقيقي.",
        psychometricImpactEn: "Prevents gaming via test-wiseness and restores genuine discrimination."
      },
      {
        id: "tf_balance_ratio",
        category: "psychometric",
        titleAr: "موازنة نسبة العبارات الصائبة والخاطئة (50% / 50%)",
        titleEn: "50/50 Balance of True and False Items",
        ruleAr: "توزيع متساوٍ تقريباً للعبارات الصحيحة والخاطئة في بنك الاختبار لتفادي نزعة الموافقة (Acquiescence bias).",
        ruleEn: "Maintain equal proportion of True and False items to counter acquiescence bias.",
        idealStandardAr: "تساوي عدد بنود (صواب) مع بنود (خطأ) في ورقة التقييم النهائي.",
        idealStandardEn: "Exact parity between True and False keys in final exam paper.",
        psychometricImpactAr: "يضبط معامل التخمين العشوائي ويقلل التحيز النفسي للمختبر.",
        psychometricImpactEn: "Minimizes guessing bias and controls psychometric error margin."
      }
    ]
  },
  fill: {
    optimalFacilityRange: { min: 0.40, max: 0.65, labelAr: "0.40 - 0.65 (معتدل الصعوبة)", labelEn: "0.40 - 0.65 (Moderate)" },
    optimalDiscriminationMin: 0.35,
    bloomSuitabilityAr: "التذكر الدقيق للمصطلحات، الفهم، والتطبيق",
    bloomSuitabilityEn: "Precise Terminology Recall, Comprehension, Application",
    guessingProbability: "أقل من 5% (بند إنتاج واستدعاء مباشر)",
    tips: [
      {
        id: "fill_single_blank",
        category: "construction",
        titleAr: "اقتصار الجملة على فراغ واحد '___' وفي موقع مناسب",
        titleEn: "Single Blank Constraint ('___') in Strategic Position",
        ruleAr: "لا تضع أكثر من فراغ في السطر الواحد، ويفضل وضع الفراغ في نهاية الجملة أو بعد سياق كافٍ.",
        ruleEn: "Limit to exactly one blank per sentence, preferably at or near the end.",
        idealStandardAr: "سياق متكامل مسبق يوجه الذهن مباشرة للمصطلح المستهدف المحدد.",
        idealStandardEn: "Sufficient antecedent context directing examinee to the target term.",
        psychometricImpactAr: "يمنع غموض الجملة وتشتت القارئ ويحقق ثبات القياس اللغوي.",
        psychometricImpactEn: "Prevents semantic ambiguity and enhances measurement reliability."
      },
      {
        id: "fill_key_term_only",
        category: "bloom",
        titleAr: "استهداف المصطلح الجوهري وليس الكلمات الحشوية",
        titleEn: "Target Essential Term, Not Incidental Words",
        ruleAr: "يجب أن يكون الفراغ مخصصاً للكلمة المفتاحية (المفهوم، القانون، العلم) وليس لحروف جر أو أفعال مساعدة.",
        ruleEn: "The blank must hide the core concept or technical term, not filler words.",
        idealStandardAr: "المصطلح المحذوف هو قلب المفهوم التربوي المستهدف بالاختبار.",
        idealStandardEn: "The missing word is the nucleus of the learning ILO.",
        psychometricImpactAr: "يضمن صدق البناء وقياس الناتج التعليمي بدقة متناهية.",
        psychometricImpactEn: "Guarantees construct validity and ILO alignment."
      },
      {
        id: "fill_synonyms_spelling",
        category: "psychometric",
        titleAr: "اعتماد المرادفات والبدائل الإملائية المقبولة في مفتاح الإجابة",
        titleEn: "Accept Valid Synonyms & Spelling Variations in Key",
        ruleAr: "تضمين كافة التهجئات الصحيحة (مثل: همزات القطع، التاء المربوطة والهاء) في نموذج الإجابة لتفادي ظلم الطالب المتقن.",
        ruleEn: "Include all valid spelling variations and accepted synonyms in the grading key.",
        idealStandardAr: "قائمة مرادفات محددة بدقة في نموذج التصحيح الآلي أو اليدوي.",
        idealStandardEn: "Explicit dictionary of accepted synonyms configured in the grading engine.",
        psychometricImpactAr: "يرفع موثوقية الدرجة وثبات القياس (Test Reliability).",
        psychometricImpactEn: "Enhances test score reliability and eliminates grading bias."
      }
    ]
  },
  matching: {
    optimalFacilityRange: { min: 0.45, max: 0.70, labelAr: "0.45 - 0.70 (معتدل)", labelEn: "0.45 - 0.70 (Optimal)" },
    optimalDiscriminationMin: 0.38,
    bloomSuitabilityAr: "الربط، الفهم، التصنيف، وتحليل العلاقات",
    bloomSuitabilityEn: "Association, Comprehension, Classification, Relationship Analysis",
    guessingProbability: "تناقصية (تقل مع كل إجابة صحيحة ما لم توضع مشتتات فائضة)",
    tips: [
      {
        id: "match_unequal_columns",
        category: "psychometric",
        titleAr: "زيادة عدد عناصر قائمة الاستجابة (ب) عن قائمة المثيرات (أ)",
        titleEn: "Unequal Column Count (Column B > Column A)",
        ruleAr: "وضع 1-2 مشتتات إضافية في العمود الثاني (مثلاً 4 مثيرات مقابل 5 أو 6 استجابات).",
        ruleEn: "Include 1-2 extra response options in Column B (e.g. 4 premises vs 5 or 6 responses).",
        idealStandardAr: "قائمة (أ) 4 عناصر، وقائمة (ب) 5 أو 6 عناصر لتجنب الحل التلقائي لآخر عنصر.",
        idealStandardEn: "4 items in column A vs 5-6 in column B to stop process of elimination on the final item.",
        psychometricImpactAr: "يمنع التخمين بالاستبعاد (Process of Elimination) ويحافظ على معامل الصعوبة لآخر عنصر.",
        psychometricImpactEn: "Eliminates free points on the last item via elimination reasoning."
      },
      {
        id: "match_homogeneity",
        category: "construction",
        titleAr: "التجانس التام لموضوع القائمتين",
        titleEn: "Homogeneous Theme Across Columns",
        ruleAr: "يجب أن تدور كل عناصر السؤال حول موضوع واحد متجانس (مثال: علماء واكتشافاتهم، أو مفاهيم وتعريفاتها).",
        ruleEn: "All elements in both columns must belong to a single homogeneous subject matter.",
        idealStandardAr: "سياق تخصصي موحد خالٍ من خلط التواريخ مع الأعلام والمصطلحات في سؤال واحد.",
        idealStandardEn: "Uniform disciplinary scope without mixing unrelated categories in one item.",
        psychometricImpactAr: "يمنع استبعاد الخيارات استناداً لاختلاف التصنيف النحوي أو المعرفي.",
        psychometricImpactEn: "Prevents easy matching based on broad category differences."
      },
      {
        id: "match_distractor_options",
        category: "distractor",
        titleAr: "كفاءة البدائل الإضافية غير المقترنة في عمود الاستجابة",
        titleEn: "Plausibility of Extra Unmatched Response Options",
        ruleAr: "يجب أن تكون العناصر الفائضة في العمود الثاني مقنعة ومرتبطة بنفس الموضوع العلمي لتشكل مشتتاً فعالاً.",
        ruleEn: "Surplus items in column B must be plausible and subject-relevant.",
        idealStandardAr: "مشتتات إضافية تمثل مفاهيم حقيقية درسها الطالب في نفس الوحدة التعليمية.",
        idealStandardEn: "Extra options representing authentic curricular concepts from the same unit.",
        psychometricImpactAr: "يحافظ على ثبات معامل التمييز للسؤال ككل.",
        psychometricImpactEn: "Maintains high discrimination power across all matching pairs."
      }
    ]
  },
  ordering: {
    optimalFacilityRange: { min: 0.35, max: 0.65, labelAr: "0.35 - 0.65 (معتدل إلى صعب)", labelEn: "0.35 - 0.65 (Moderate to Hard)" },
    optimalDiscriminationMin: 0.40,
    bloomSuitabilityAr: "التحليل، التسلسل المنطقي، الإجراءات، وتطبيق الخوارزميات",
    bloomSuitabilityEn: "Analysis, Logical Sequencing, Procedural Algorithms",
    guessingProbability: "1/n! (شديدة الانخفاض: 1 من 24 لـ 4 خطوات)",
    tips: [
      {
        id: "order_independent_steps",
        category: "construction",
        titleAr: "وضوح وتسلسل الخطوات المنطقي والزمني",
        titleEn: "Distinct & Logical Chronological Steps",
        ruleAr: "يجب أن تكون الخطوات واضحة التمايز مع وجود علاقة سببية أو زمنية أو منطقية قطعية لا تحتمل ترتيبين مختلفين.",
        ruleEn: "Steps must have an unambiguous single sequence with definitive chronological or causal flow.",
        idealStandardAr: "3 إلى 5 خطوات محددة ومصاغة بأسلوب متسق لغوياً وإجرائياً.",
        idealStandardEn: "3 to 5 clear steps with uniform imperative or nominal grammatical phrasing.",
        psychometricImpactAr: "يضمن صدق المحتوى وخلو السؤال من الاعتراضات والتفسيرات الترتيبية البديلة.",
        psychometricImpactEn: "Guarantees content validity and eliminates conflicting alternative sequences."
      },
      {
        id: "order_scoring_model",
        category: "psychometric",
        titleAr: "نموذج تقدير الدرجات الجزئية للتسلسل والترتيب",
        titleEn: "Partial Credit Kendall/Pairwise Scoring Calibration",
        ruleAr: "استخدام نموذج احتساب أزواج الترتيب الصحيحة (Pairwise scoring) لمنح الطالب درجة جزئية عند صحة التتابع الداخلي.",
        ruleEn: "Apply pairwise adjacency scoring to award partial credit for intact sub-sequences.",
        idealStandardAr: "احتساب الدرجة وفق مصفوفة التتابع النسبي بدلاً من نموذج الصفر/الكل الحدي.",
        idealStandardEn: "Calibrated relative sequence scoring rather than all-or-nothing threshold.",
        psychometricImpactAr: "يزيد من حساسية التمييز بين الطالب الذي أخطأ في موقع خطوة واحدة والطالب العشوائي.",
        psychometricImpactEn: "Differentiates minor displacement from total lack of procedural knowledge."
      },
      {
        id: "order_bloom_procedural",
        category: "bloom",
        titleAr: "قياس الفهم الإجرائي والتسلسل الخوارزمي المستهدف",
        titleEn: "Procedural Cognition & Algorithmic ILO Alignment",
        ruleAr: "استهداف نواتج تعلم تتطلب خطوات متتابعة (تجارب علمية، خوارزميات برمجية، مراحل تاريخية مترابطة).",
        ruleEn: "Target ILOs demanding algorithmic procedural thinking and causal progression.",
        idealStandardAr: "ربط كل خطوة بمدخلات الخطوة السابقة ومخرجات الخطوة اللاحقة.",
        idealStandardEn: "Each step causally rooted in predecessors and feeding subsequent stages.",
        psychometricImpactAr: "يحقق الصدق التكويني للقياس السيكومتري للمهارات الإجرائية.",
        psychometricImpactEn: "Establishes construct validity for procedural psychometric measurement."
      }
    ]
  },
  essay: {
    optimalFacilityRange: { min: 0.40, max: 0.65, labelAr: "0.40 - 0.65 (معتدل)", labelEn: "0.40 - 0.65 (Moderate)" },
    optimalDiscriminationMin: 0.45,
    bloomSuitabilityAr: "التقويم، الابتكار، التحليل النقدي، والتركيب الأصيل",
    bloomSuitabilityEn: "Evaluation, Creation, Critical Analysis, Synthesis",
    guessingProbability: "0% (استجابة مفتوحة تتطلب إنتاجاً معرفياً حراً)",
    tips: [
      {
        id: "essay_explicit_action_verb",
        category: "construction",
        titleAr: "الصياغة بفعل إجرائي محدد ودقيق",
        titleEn: "Explicit Action-Oriented Procedural Verb",
        ruleAr: "استخدام أفعال قياس محددة (علل، قارن من حيث كذا، حلل مبيناً كذا) وتجنب 'اكتب ما تعرفه عن'.",
        ruleEn: "Use targeted operational verbs (Compare regarding X, Justify, Analyze) and avoid 'Discuss everything you know'.",
        idealStandardAr: "مهمة مقننة المعالم بحدود واضحة لنطاق الإجابة المتوقعة وحجمها التقريبي.",
        idealStandardEn: "Tightly scoped prompt defining boundaries, scope and expected deliverables.",
        psychometricImpactAr: "يرفع ثبات التصحيح (Inter-rater reliability) ويحدد معيار التقدير بدقة.",
        psychometricImpactEn: "Maximizes inter-rater scoring reliability and consistency."
      },
      {
        id: "essay_rubric_calibration",
        category: "rubric",
        titleAr: "مصفوفة تقدير معيارية (Rubric) واضحة وتوزيع دقيق للدرجات",
        titleEn: "Objective Scoring Rubric & Analytic Point Distribution",
        ruleAr: "ضرورة إرفاق معايير تقدير تفصيلية محددة العناصر والدرجات لكل جزء من الإجابة النموذجية.",
        ruleEn: "Provide a detailed multi-criterion scoring rubric with explicit points per component.",
        idealStandardAr: "روبريك تحليلي يحدد درجات كل فكرة رئيسية، الشواهد، والتبرير العلمي.",
        idealStandardEn: "Analytic rubric breaking down points for key arguments, evidence, and synthesis.",
        psychometricImpactAr: "يقلل الذاتية في التصحيح ويرفع الصدق العام للاختبار.",
        psychometricImpactEn: "Minimizes marker subjectivity and maximizes measurement objectivity."
      },
      {
        id: "essay_psychometric_objectivity",
        category: "psychometric",
        titleAr: "تقنين معايير التصحيح لضمان الموضوعية الإحصائية",
        titleEn: "Standardized Correction Criteria for Inter-Rater Reliability",
        ruleAr: "وضع إجابة نموذجية معتمدة مع تحديد الكلمات المفتاحية المقبولة والنقاط الإلزامية.",
        ruleEn: "Establish canonical exemplar answers with required keywords and benchmarks.",
        idealStandardAr: "معامل ثبات المصححين (Inter-rater) يتجاوز 0.85.",
        idealStandardEn: "Inter-rater reliability index exceeding 0.85.",
        psychometricImpactAr: "يضمن عدالة الدرجات واستقرار التوزيع التكراري للاختبار.",
        psychometricImpactEn: "Ensures grading equity and stabilized score distributions."
      }
    ]
  },
  diagram_labeling: {
    optimalFacilityRange: { min: 0.45, max: 0.70, labelAr: "0.45 - 0.70 (معتدل)", labelEn: "0.45 - 0.70 (Moderate)" },
    optimalDiscriminationMin: 0.38,
    bloomSuitabilityAr: "التعرف، الفهم البصري، وتطبيق النماذج والرسوم البيانية",
    bloomSuitabilityEn: "Visual Recognition, Comprehension, Diagrammatic Modeling",
    guessingProbability: "منخفضة (حسب عدد الأجزاء المؤشر عليها)",
    tips: [
      {
        id: "diagram_visual_clarity",
        category: "construction",
        titleAr: "وضوح المخطط البصري ودقة خطوط التأشير",
        titleEn: "High Visual Clarity & Unambiguous Pointer Lines",
        ruleAr: "يجب أن تكون الصورة أو الرسم التخطيطي عالية الدقة مع أسهم تأشير واضحة نحو الموضع التشريحي أو الهيكلي المحدد.",
        ruleEn: "Ensure high-resolution diagram with pinpoint indicator arrows.",
        idealStandardAr: "رسم علمي واضح الدلالة مع ترقيم أو أحرف مميزة لا تتداخل مع تفاصيل الرسم.",
        idealStandardEn: "Crisp diagram with prominent alphanumeric tags outside crowded areas.",
        psychometricImpactAr: "يمنع الخطأ السيكومتري الناتج عن تشويش الرؤية أو غموض موضع السهم.",
        psychometricImpactEn: "Prevents measurement error caused by visual noise or ambiguous pointers."
      },
      {
        id: "diagram_key_independence",
        category: "psychometric",
        titleAr: "استقلال مسميات الأجزاء وعدم ترتب إجابة على أخرى",
        titleEn: "Independent Key Labels & Isolated Error Bounds",
        ruleAr: "يجب ألا يؤدي الخطأ في تسمية جزء معين إلى إجبار الطالب على الخطأ في باقي الأجزاء.",
        ruleEn: "An error in identifying one part must not cascade into errors for subsequent parts.",
        idealStandardAr: "مفتاح تصحيح مستقل لكل مؤشر برقم منفصل ودرجة معيارية مخصصة.",
        idealStandardEn: "Independent grading key for each pointer with dedicated isolated point weight.",
        psychometricImpactAr: "يحافظ على استقلالية البنود (Local Independence) وفق نظرية استجابة الفقرة (IRT).",
        psychometricImpactEn: "Satisfies Local Item Independence assumption in IRT modeling."
      },
      {
        id: "diagram_bloom_spatial",
        category: "bloom",
        titleAr: "المطابقة المكانية والفهم البصري والوظيفي",
        titleEn: "Spatial & Functional Cognitive ILO Alignment",
        ruleAr: "اختبار القدرة على ربط المظهر البصري بالوظيفة الحيوية أو الدور الهندسي للجزء المشار إليه.",
        ruleEn: "Test ability to correlate spatial features with functional or anatomical roles.",
        idealStandardAr: "المطلوب يتعدى مجرد التذكر الشكلي إلى استيعاب دور الجزء في النظام ككل.",
        idealStandardEn: "Targeting structural comprehension over superficial rote memory.",
        psychometricImpactAr: "يرفع الصدق التكويني للسؤال ونوعية النواتج المعرفية المقاسة.",
        psychometricImpactEn: "Elevates construct validity and depth of spatial cognition."
      }
    ]
  }
};

