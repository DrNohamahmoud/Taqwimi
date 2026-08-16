import { Question } from "../types";

export type SpellCheckCategory =
  | "hamza_qat"
  | "hamza_wasl"
  | "ta_marbuta"
  | "alef_maksura"
  | "tanween_hamza"
  | "punctuation_spacing"
  | "general_spelling";

export interface SpellCheckIssue {
  id: string;
  location: "stem" | "option" | "correctAnswer";
  optionIndex?: number;
  originalWord: string;
  suggestedWord: string;
  category: SpellCheckCategory;
  categoryLabelAr: string;
  categoryLabelEn: string;
  explanationAr: string;
  explanationEn: string;
}

export interface QuestionSpellCheckResult {
  hasErrors: boolean;
  totalErrors: number;
  stemErrors: SpellCheckIssue[];
  optionsErrors: Record<number, SpellCheckIssue[]>;
  answerErrors: SpellCheckIssue[];
  allIssues: SpellCheckIssue[];
  correctedStem: string;
  correctedOptions: string[];
  correctedAnswer: string;
}

// Comprehensive dictionary of common Arabic spelling errors & their exact corrections
const ARABIC_SPELLING_DICTIONARY: Array<{
  pattern: RegExp;
  replacement: string;
  category: SpellCheckCategory;
  labelAr: string;
  labelEn: string;
  explanationAr: string;
  explanationEn: string;
}> = [
  // 1. Common Hamzat Wasl mistakenly written with Qat (همزة قطع خاطئة في مواضع الوصل)
  {
    pattern: /\bإستخدام\b/g,
    replacement: "استخدام",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر الفعل السداسي يكتب بهمزة وصل (استخدام) وليس قطع.",
    explanationEn: "Hexaliteral source word uses Wasl Hamza without under-hamza.",
  },
  {
    pattern: /\bإستخدامات\b/g,
    replacement: "استخدامات",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "تكتب بهمزة وصل (استخدامات) وليس قطع.",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإختبار\b/g,
    replacement: "اختبار",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر الفعل الخماسي يكتب بهمزة وصل (اختبار) دون همزة قطع.",
    explanationEn: "Quintiliteral source word uses Wasl Hamza (اختبار).",
  },
  {
    pattern: /\bإختبارات\b/g,
    replacement: "اختبارات",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "تكتب بهمزة وصل (اختبارات) وليس قطع.",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإختيار\b/g,
    replacement: "اختيار",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر الفعل الخماسي يكتب بهمزة وصل (اختيار).",
    explanationEn: "Uses Wasl Hamza (اختيار).",
  },
  {
    pattern: /\bإختيارات\b/g,
    replacement: "اختيارات",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "تكتب بهمزة وصل (اختيارات) دون همزة قطع.",
    explanationEn: "Uses Wasl Hamza (اختيارات).",
  },
  {
    pattern: /\bإستنتاج\b/g,
    replacement: "استنتاج",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر سداسي يكتب بهمزة وصل (استنتاج).",
    explanationEn: "Uses Wasl Hamza (استنتاج).",
  },
  {
    pattern: /\bإستنتاجات\b/g,
    replacement: "استنتاجات",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "تكتب بهمزة وصل (استنتاجات).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإستيعاب\b/g,
    replacement: "استيعاب",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر سداسي يكتب بهمزة وصل (استيعاب).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإسترجاع\b/g,
    replacement: "استرجاع",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر سداسي يكتب بهمزة وصل (استرجاع).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإستجابة\b/g,
    replacement: "استجابة",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر سداسي يكتب بهمزة وصل (استجابة).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإستجابات\b/g,
    replacement: "استجابات",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "تكتب بهمزة وصل (استجابات).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإستراتيجية\b/g,
    replacement: "استراتيجية",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "المصطلح يكتب بهمزة وصل قياسية (استراتيجية).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإستراتيجيات\b/g,
    replacement: "استراتيجيات",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "تكتب بهمزة وصل (استراتيجيات).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإكتساب\b/g,
    replacement: "اكتساب",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (اكتساب).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإكتشاف\b/g,
    replacement: "اكتشاف",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (اكتشاف).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإبتكار\b/g,
    replacement: "ابتكار",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (ابتكار).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإعتماد\b/g,
    replacement: "اعتماد",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (اعتماد).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإعتبار\b/g,
    replacement: "اعتبار",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (اعتبار).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإرتباط\b/g,
    replacement: "ارتباط",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (ارتباط).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإتصال\b/g,
    replacement: "اتصال",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (اتصال).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإنتقال\b/g,
    replacement: "انتقال",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (انتقال).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإنتشار\b/g,
    replacement: "انتشار",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (انتشار).",
    explanationEn: "Uses Wasl Hamza.",
  },
  {
    pattern: /\bإحتواء\b/g,
    replacement: "احتواء",
    category: "hamza_wasl",
    labelAr: "همزة وصل",
    labelEn: "Wasl Hamza",
    explanationAr: "مصدر خماسي يكتب بهمزة وصل (احتواء).",
    explanationEn: "Uses Wasl Hamza.",
  },

  // 2. Missing Hamzat Qat on Particles, Pronouns, and Common Nouns (همزات قطع ساقطة)
  {
    pattern: /\bان يكون\b/g,
    replacement: "أن يكون",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الحرف المصدري (أنْ) يكتب بهمزة قطع مفتوحة.",
    explanationEn: "Subordinating particle (أن) requires Qat Hamza.",
  },
  {
    pattern: /\bان\b/g,
    replacement: "أن",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الحرف (أنّ / أنْ) يكتب بهمزة قطع علوية.",
    explanationEn: "Particle (أن) requires Qat Hamza.",
  },
  {
    pattern: /\bانها\b/g,
    replacement: "أنها",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الضمير المتصل بالحرف (أنّها) يكتب بهمزة قطع.",
    explanationEn: "Word (أنها) requires Qat Hamza.",
  },
  {
    pattern: /\bانه\b/g,
    replacement: "أنه",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الكلمة (أنّه) تكتب بهمزة قطع.",
    explanationEn: "Word (أنه) requires Qat Hamza.",
  },
  {
    pattern: /\bالي\b/g,
    replacement: "إلى",
    category: "hamza_qat",
    labelAr: "همزة قطع وألف مقصورة",
    labelEn: "Qat Hamza & Alef Maksura",
    explanationAr: "حرف الجر (إلى) يكتب بهمزة مكسورة وألف مقصورة (ى).",
    explanationEn: "Preposition (إلى) requires bottom Hamza and Alef Maksura.",
  },
  {
    pattern: /\bإلي\b/g,
    replacement: "إلى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "حرف الجر ينتهي بألف مقصورة (إلى) وليس ياء منقوطة.",
    explanationEn: "Preposition ends with Alef Maksura (إلى).",
  },
  {
    pattern: /\bاذا\b/g,
    replacement: "إذا",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "أداة الشرط والظرف (إذا) تكتب بهمزة قطع مكسورة.",
    explanationEn: "Particle (إذا) requires bottom Qat Hamza.",
  },
  {
    pattern: /\bاو\b/g,
    replacement: "أو",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "حرف العطف (أو) يكتب بهمزة قطع مفتوحة.",
    explanationEn: "Conjunction (أو) requires top Qat Hamza.",
  },
  {
    pattern: /\bايضا\b/g,
    replacement: "أيضاً",
    category: "hamza_qat",
    labelAr: "همزة وتنوين",
    labelEn: "Hamza & Tanween",
    explanationAr: "تكتب الكلمة بهمزة قطع وتنوين نصب (أيضاً).",
    explanationEn: "Word (أيضاً) requires Qat Hamza and Tanween.",
  },
  {
    pattern: /\bاي\b/g,
    replacement: "أي",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "اسم الشرط أو الاستفهام (أيّ) يكتب بهمزة قطع.",
    explanationEn: "Word (أي) requires Qat Hamza.",
  },
  {
    pattern: /\bاكثر\b/g,
    replacement: "أكثر",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "اسم التفضيل على وزن أفعل (أكثر) يكتب بهمزة قطع.",
    explanationEn: "Superlative noun (أكثر) requires Qat Hamza.",
  },
  {
    pattern: /\bاقل\b/g,
    replacement: "أقل",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "اسم التفضيل (أقل) يكتب بهمزة قطع.",
    explanationEn: "Superlative noun (أقل) requires Qat Hamza.",
  },
  {
    pattern: /\bاهمية\b/g,
    replacement: "أهمية",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الاسم (أهمية) يبدأ بهمزة قطع.",
    explanationEn: "Noun (أهمية) starts with Qat Hamza.",
  },
  {
    pattern: /\bاهم\b/g,
    replacement: "أهم",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "اسم التفضيل (أهمّ) يكتب بهمزة قطع.",
    explanationEn: "Superlative noun (أهم) requires Qat Hamza.",
  },
  {
    pattern: /\bاحد\b/g,
    replacement: "أحد",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الاسم (أحد) يكتب بهمزة قطع.",
    explanationEn: "Noun (أحد) requires Qat Hamza.",
  },
  {
    pattern: /\bاول\b/g,
    replacement: "أول",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الاسم (أول) يكتب بهمزة قطع.",
    explanationEn: "Noun (أول) requires Qat Hamza.",
  },
  {
    pattern: /\bاداة\b/g,
    replacement: "أداة",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الاسم (أداة) يبدأ بهمزة قطع وينتهي بتاء مربوطة.",
    explanationEn: "Noun (أداة) starts with Qat Hamza.",
  },
  {
    pattern: /\bادوات\b/g,
    replacement: "أدوات",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الجمع (أدوات) يبدأ بهمزة قطع.",
    explanationEn: "Plural noun (أدوات) requires Qat Hamza.",
  },
  {
    pattern: /\bاسئلة\b/g,
    replacement: "أسئلة",
    category: "hamza_qat",
    labelAr: "همزة قطع ونبرة",
    labelEn: "Qat Hamza",
    explanationAr: "الجمع (أسئلة) يبدأ بهمزة قطع وهمزة متوسطة على نبرة.",
    explanationEn: "Plural noun (أسئلة) starts with Qat Hamza.",
  },
  {
    pattern: /\bاجابة\b/g,
    replacement: "إجابة",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "مصدر الفعل الرباعي (إجابة) يكتب بهمزة قطع سفلية.",
    explanationEn: "Noun (إجابة) requires bottom Qat Hamza.",
  },
  {
    pattern: /\bاجابات\b/g,
    replacement: "إجابات",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "الجمع (إجابات) يكتب بهمزة قطع سفلية.",
    explanationEn: "Plural noun (إجابات) requires bottom Qat Hamza.",
  },
  {
    pattern: /\bامكانية\b/g,
    replacement: "إمكانية",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "الاسم (إمكانية) يكتب بهمزة قطع سفلية.",
    explanationEn: "Noun (إمكانية) requires bottom Qat Hamza.",
  },
  {
    pattern: /\bانتاج\b/g,
    replacement: "إنتاج",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "مصدر الفعل الرباعي (إنتاج) يكتب بهمزة قطع سفلية.",
    explanationEn: "Quadraliteral source word (إنتاج) requires Qat Hamza.",
  },
  {
    pattern: /\bانشاء\b/g,
    replacement: "إنشاء",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "مصدر الفعل الرباعي (إنشاء) يكتب بهمزة قطع سفلية.",
    explanationEn: "Quadraliteral source word (إنشاء) requires Qat Hamza.",
  },
  {
    pattern: /\bاجراء\b/g,
    replacement: "إجراء",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "مصدر الفعل الرباعي (إجراء) يكتب بهمزة قطع سفلية.",
    explanationEn: "Quadraliteral source word (إجراء) requires Qat Hamza.",
  },
  {
    pattern: /\bاجراءات\b/g,
    replacement: "إجراءات",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "الجمع (إجراءات) يكتب بهمزة قطع سفلية.",
    explanationEn: "Plural noun (إجراءات) requires Qat Hamza.",
  },
  {
    pattern: /\bارقام\b/g,
    replacement: "أرقام",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الجمع (أرقام) يكتب بهمزة قطع علوية.",
    explanationEn: "Plural noun (أرقام) requires Qat Hamza.",
  },
  {
    pattern: /\bاشكال\b/g,
    replacement: "أشكال",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الجمع (أشكال) يكتب بهمزة قطع علوية.",
    explanationEn: "Plural noun (أشكال) requires Qat Hamza.",
  },
  {
    pattern: /\bافكار\b/g,
    replacement: "أفكار",
    category: "hamza_qat",
    labelAr: "همزة قطع",
    labelEn: "Qat Hamza",
    explanationAr: "الجمع (أفكار) يكتب بهمزة قطع علوية.",
    explanationEn: "Plural noun (أفكار) requires Qat Hamza.",
  },
  {
    pattern: /\bاعداد\b/g,
    replacement: "إعداد",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "مصدر الفعل الرباعي (إعداد) يكتب بهمزة قطع سفلية.",
    explanationEn: "Quadraliteral source word (إعداد) requires Qat Hamza.",
  },
  {
    pattern: /\bاعطاء\b/g,
    replacement: "إعطاء",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "مصدر الفعل الرباعي (إعطاء) يكتب بهمزة قطع سفلية.",
    explanationEn: "Quadraliteral source word (إعطاء) requires Qat Hamza.",
  },
  {
    pattern: /\bادارة\b/g,
    replacement: "إدارة",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "الاسم (إدارة) يكتب بهمزة قطع سفلية.",
    explanationEn: "Noun (إدارة) requires Qat Hamza.",
  },
  {
    pattern: /\bاشارة\b/g,
    replacement: "إشارة",
    category: "hamza_qat",
    labelAr: "همزة قطع مكسورة",
    labelEn: "Qat Hamza",
    explanationAr: "الاسم (إشارة) يكتب بهمزة قطع سفلية.",
    explanationEn: "Noun (إشارة) requires Qat Hamza.",
  },

  // 3. Ta-Marbuta vs Haa (التاء المربوطة والهاء)
  {
    pattern: /\bرئيسيى\b/g,
    replacement: "رئيسية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (رئيسية) وليست ألفاً مقصورة أو ياء.",
    explanationEn: "Word ends with Ta-Marbuta (رئيسية).",
  },
  {
    pattern: /\bمباشره\b/g,
    replacement: "مباشرة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (مباشرة) وليس بالهاء.",
    explanationEn: "Word ends with Ta-Marbuta (مباشرة).",
  },
  {
    pattern: /\bدقيقه\b/g,
    replacement: "دقيقة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (دقيقة) وليس بالهاء.",
    explanationEn: "Word ends with Ta-Marbuta (دقيقة).",
  },
  {
    pattern: /\bصحيحه\b/g,
    replacement: "صحيحة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "الصفة المؤنثة تكتب بالتاء المربوطة (صحيحة).",
    explanationEn: "Word ends with Ta-Marbuta (صحيحة).",
  },
  {
    pattern: /\bخاطئه\b/g,
    replacement: "خاطئة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (خاطئة).",
    explanationEn: "Word ends with Ta-Marbuta (خاطئة).",
  },
  {
    pattern: /\bمئويه\b/g,
    replacement: "مئوية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (مئوية).",
    explanationEn: "Word ends with Ta-Marbuta (مئوية).",
  },
  {
    pattern: /\bتربويه\b/g,
    replacement: "تربوية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (تربوية).",
    explanationEn: "Word ends with Ta-Marbuta (تربوية).",
  },
  {
    pattern: /\bأكاديميه\b/g,
    replacement: "أكاديمية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (أكاديمية).",
    explanationEn: "Word ends with Ta-Marbuta (أكاديمية).",
  },
  {
    pattern: /\bعلميه\b/g,
    replacement: "علمية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (علمية).",
    explanationEn: "Word ends with Ta-Marbuta (علمية).",
  },
  {
    pattern: /\bنتيجه\b/g,
    replacement: "نتيجة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (نتيجة).",
    explanationEn: "Word ends with Ta-Marbuta (نتيجة).",
  },
  {
    pattern: /\bقدره\b/g,
    replacement: "قدرة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (قدرة).",
    explanationEn: "Word ends with Ta-Marbuta (قدرة).",
  },
  {
    pattern: /\bطريقه\b/g,
    replacement: "طريقة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (طريقة).",
    explanationEn: "Word ends with Ta-Marbuta (طريقة).",
  },
  {
    pattern: /\bفكره\b/g,
    replacement: "فكرة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (فكرة).",
    explanationEn: "Word ends with Ta-Marbuta (فكرة).",
  },
  {
    pattern: /\bنسبه\b/g,
    replacement: "نسبة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (نسبة).",
    explanationEn: "Word ends with Ta-Marbuta (نسبة).",
  },
  {
    pattern: /\bدرجه\b/g,
    replacement: "درجة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (درجة).",
    explanationEn: "Word ends with Ta-Marbuta (درجة).",
  },
  {
    pattern: /\bخطوه\b/g,
    replacement: "خطوة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (خطوة).",
    explanationEn: "Word ends with Ta-Marbuta (خطوة).",
  },
  {
    pattern: /\bحاله\b/g,
    replacement: "حالة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (حالة).",
    explanationEn: "Word ends with Ta-Marbuta (حالة).",
  },
  {
    pattern: /\bمعرفه\b/g,
    replacement: "معرفة",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (معرفة).",
    explanationEn: "Word ends with Ta-Marbuta (معرفة).",
  },
  {
    pattern: /\bعمليه\b/g,
    replacement: "عملية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (عملية).",
    explanationEn: "Word ends with Ta-Marbuta (عملية).",
  },
  {
    pattern: /\bتقنيه\b/g,
    replacement: "تقنية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (تقنية).",
    explanationEn: "Word ends with Ta-Marbuta (تقنية).",
  },
  {
    pattern: /\bاحصائيه\b/g,
    replacement: "إحصائية",
    category: "ta_marbuta",
    labelAr: "همزة وتاء مربوطة",
    labelEn: "Ta-Marbuta & Hamza",
    explanationAr: "تكتب بهمز قطع سفلية وتاء مربوطة (إحصائية).",
    explanationEn: "Word is written (إحصائية).",
  },
  {
    pattern: /\bمنهجيه\b/g,
    replacement: "منهجية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (منهجية).",
    explanationEn: "Word ends with Ta-Marbuta (منهجية).",
  },
  {
    pattern: /\bموضوعيه\b/g,
    replacement: "موضوعية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (موضوعية).",
    explanationEn: "Word ends with Ta-Marbuta (موضوعية).",
  },
  {
    pattern: /\bذاتيه\b/g,
    replacement: "ذاتية",
    category: "ta_marbuta",
    labelAr: "تاء مربوطة",
    labelEn: "Ta-Marbuta",
    explanationAr: "تكتب بالتاء المربوطة (ذاتية).",
    explanationEn: "Word ends with Ta-Marbuta (ذاتية).",
  },

  // 4. Alef Maksura vs Yaa (الألف المقصورة والياء)
  {
    pattern: /\bاخري\b/g,
    replacement: "أخرى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة وهمزة قطع",
    labelEn: "Alef Maksura & Hamza",
    explanationAr: "تكتب بهمزة قطع مفتوحة وتنتهي بألف مقصورة (أخرى).",
    explanationEn: "Word is spelled (أخرى).",
  },
  {
    pattern: /\bأخري\b/g,
    replacement: "أخرى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "تنتهي بألف مقصورة غير منقوطة (أخرى).",
    explanationEn: "Ends with Alef Maksura (أخرى).",
  },
  {
    pattern: /\bحتي\b/g,
    replacement: "حتى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "حرف الغاية ينتهي بألف مقصورة (حتى) دون نقاط.",
    explanationEn: "Particle ends with Alef Maksura (حتى).",
  },
  {
    pattern: /\bعلي\b/g,
    replacement: "على",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "حرف الجر ينتهي بألف مقصورة (على) وليس ياء منقوطة.",
    explanationEn: "Preposition ends with Alef Maksura (على).",
  },
  {
    pattern: /\bلدي\b/g,
    replacement: "لدى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "الظرف ينتهي بألف مقصورة (لدى).",
    explanationEn: "Adverb ends with Alef Maksura (لدى).",
  },
  {
    pattern: /\bمستوي\b/g,
    replacement: "مستوى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "الاسم المقصور ينتهي بألف مقصورة غير منقوطة (مستوى).",
    explanationEn: "Noun ends with Alef Maksura (مستوى).",
  },
  {
    pattern: /\bأقسي\b/g,
    replacement: "أقصى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "اسم التفضيل ينتهي بألف مقصورة (أقصى).",
    explanationEn: "Superlative ends with Alef Maksura (أقصى).",
  },
  {
    pattern: /\bأدني\b/g,
    replacement: "أدنى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "اسم التفضيل ينتهي بألف مقصورة (أدنى).",
    explanationEn: "Superlative ends with Alef Maksura (أدنى).",
  },
  {
    pattern: /\bمعني\b/g,
    replacement: "معنى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "الاسم المقصور ينتهي بألف مقصورة (معنى).",
    explanationEn: "Noun ends with Alef Maksura (معنى).",
  },
  {
    pattern: /\bمبني\b/g,
    replacement: "مبنى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "الاسم المقصور ينتهي بألف مقصورة (مبنى).",
    explanationEn: "Noun ends with Alef Maksura (مبنى).",
  },
  {
    pattern: /\bمدي\b/g,
    replacement: "مدى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "الاسم المقصور ينتهي بألف مقصورة (مدى).",
    explanationEn: "Noun ends with Alef Maksura (مدى).",
  },
  {
    pattern: /\bكبري\b/g,
    replacement: "كبرى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "الاسم المقصور ينتهي بألف مقصورة (كبرى).",
    explanationEn: "Noun ends with Alef Maksura (كبرى).",
  },
  {
    pattern: /\bصغري\b/g,
    replacement: "صغرى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "الاسم المقصور ينتهي بألف مقصورة (صغرى).",
    explanationEn: "Noun ends with Alef Maksura (صغرى).",
  },
  {
    pattern: /\bعظمي\b/g,
    replacement: "عظمى",
    category: "alef_maksura",
    labelAr: "ألف مقصورة",
    labelEn: "Alef Maksura",
    explanationAr: "الاسم المقصور ينتهي بألف مقصورة (عظمى).",
    explanationEn: "Noun ends with Alef Maksura (عظمى).",
  },

  // 5. Tanween and Hamzas (التنوين ورسم الهمزات)
  {
    pattern: /\bشيئ\b/g,
    replacement: "شيء",
    category: "tanween_hamza",
    labelAr: "همزة متطرفة على السطر",
    labelEn: "Isolated Hamza",
    explanationAr: "الهمزة المتطرفة بعد ياء ساكنة تكتب على السطر (شيء) وليس على الياء.",
    explanationEn: "Hamza after silent Yaa is on line (شيء).",
  },
  {
    pattern: /\bعبئ\b/g,
    replacement: "عبء",
    category: "tanween_hamza",
    labelAr: "همزة متطرفة على السطر",
    labelEn: "Isolated Hamza",
    explanationAr: "تكتب الهمزة المتطرفة على السطر (عبء).",
    explanationEn: "Hamza is on line (عبء).",
  },
  {
    pattern: /\bبدئ\b/g,
    replacement: "بدء",
    category: "tanween_hamza",
    labelAr: "همزة متطرفة على السطر",
    labelEn: "Isolated Hamza",
    explanationAr: "تكتب الهمزة المتطرفة على السطر (بدء).",
    explanationEn: "Hamza is on line (بدء).",
  },
  {
    pattern: /\bكفئ\b/g,
    replacement: "كفء",
    category: "tanween_hamza",
    labelAr: "همزة متطرفة على السطر",
    labelEn: "Isolated Hamza",
    explanationAr: "تكتب الهمزة المتطرفة على السطر (كفء).",
    explanationEn: "Hamza is on line (كفء).",
  },
  {
    pattern: /\bمسؤلية\b/g,
    replacement: "مسؤولية",
    category: "tanween_hamza",
    labelAr: "همزة متوسطة",
    labelEn: "Medial Hamza",
    explanationAr: "تكتب الهمزة المضمومة بعد ساكن على واو (مسؤولية).",
    explanationEn: "Hamza on Waw (مسؤولية).",
  },
  {
    pattern: /\bجزءا\b/g,
    replacement: "جزءاً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب على الألف (جزءاً).",
    explanationEn: "Requires Tanween (جزءاً).",
  },
  {
    pattern: /\bدائما\b/g,
    replacement: "دائماً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب الكلمة بتنوين النصب (دائماً).",
    explanationEn: "Requires Tanween (دائماً).",
  },
  {
    pattern: /\bابدا\b/g,
    replacement: "أبداً",
    category: "tanween_hamza",
    labelAr: "همزة وتنوين",
    labelEn: "Hamza & Tanween",
    explanationAr: "تكتب بهمزة قطع وتنوين نصب (أبداً).",
    explanationEn: "Requires Qat Hamza & Tanween (أبداً).",
  },
  {
    pattern: /\bتقريبا\b/g,
    replacement: "تقريباً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (تقريباً).",
    explanationEn: "Requires Tanween (تقريباً).",
  },
  {
    pattern: /\bنهائيا\b/g,
    replacement: "نهائياً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (نهائياً).",
    explanationEn: "Requires Tanween (نهائياً).",
  },
  {
    pattern: /\bكليا\b/g,
    replacement: "كلياً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (كلياً).",
    explanationEn: "Requires Tanween (كلياً).",
  },
  {
    pattern: /\bجزئيا\b/g,
    replacement: "جزئياً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب على نبرة (جزئياً).",
    explanationEn: "Requires Tanween (جزئياً).",
  },
  {
    pattern: /\bمسبقا\b/g,
    replacement: "مسبقاً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (مسبقاً).",
    explanationEn: "Requires Tanween (مسبقاً).",
  },
  {
    pattern: /\bلاحقا\b/g,
    replacement: "لاحقاً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (لاحقاً).",
    explanationEn: "Requires Tanween (لاحقاً).",
  },
  {
    pattern: /\bمؤخرا\b/g,
    replacement: "مؤخراً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (مؤخراً).",
    explanationEn: "Requires Tanween (مؤخراً).",
  },
  {
    pattern: /\bمجددا\b/g,
    replacement: "مجدداً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (مجدداً).",
    explanationEn: "Requires Tanween (مجدداً).",
  },
  {
    pattern: /\bتلقائيا\b/g,
    replacement: "تلقائياً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (تلقائياً).",
    explanationEn: "Requires Tanween (تلقائياً).",
  },
  {
    pattern: /\bاليا\b/g,
    replacement: "آلياً",
    category: "tanween_hamza",
    labelAr: "ألف مد وتنوين",
    labelEn: "Alef Madd & Tanween",
    explanationAr: "تكتب بألف مد وتنوين نصب (آلياً).",
    explanationEn: "Requires Alef Madd & Tanween (آلياً).",
  },
  {
    pattern: /\bفورا\b/g,
    replacement: "فوراً",
    category: "tanween_hamza",
    labelAr: "تنوين نصب",
    labelEn: "Tanween Nasb",
    explanationAr: "تكتب بتنوين النصب (فوراً).",
    explanationEn: "Requires Tanween (فوراً).",
  },
  {
    pattern: /\bبنائا\b/g,
    replacement: "بناءً",
    category: "tanween_hamza",
    labelAr: "تنوين همزة متطرفة",
    labelEn: "Tanween on Hamza",
    explanationAr: "الهمزة المسبوقة بألف مد لا يلحق بها ألف تنوين إضافية (بناءً).",
    explanationEn: "Hamza preceded by Alef does not take trailing Alef for Tanween (بناءً).",
  },
  {
    pattern: /\bمسائا\b/g,
    replacement: "مساءً",
    category: "tanween_hamza",
    labelAr: "تنوين همزة متطرفة",
    labelEn: "Tanween on Hamza",
    explanationAr: "تكتب الهمزة منونة دون ألف بعدها (مساءً).",
    explanationEn: "Spelled (مساءً).",
  },

  // 6. Punctuation spacing & duplicate marks
  {
    pattern: /\s+([،,.؟:!])/g,
    replacement: "$1",
    category: "punctuation_spacing",
    labelAr: "فراغ قبل علامة الترقيم",
    labelEn: "Space before punctuation",
    explanationAr: "تلتصق علامة الترقيم بالكلمة التي قبلها مباشرة دون فاصل مسافة.",
    explanationEn: "Punctuation marks must immediately attach to previous word without space.",
  },
  {
    pattern: /([،,.؟:!])([^\s،,.؟:!0-9])/g,
    replacement: "$1 $2",
    category: "punctuation_spacing",
    labelAr: "مسافة بعد علامة الترقيم",
    labelEn: "Space after punctuation",
    explanationAr: "يجب ترك مسافة واحدة بعد علامة الترقيم قبل الكلمة التالية.",
    explanationEn: "A single space should follow punctuation marks.",
  },
  {
    pattern: /[،]{2,}/g,
    replacement: "،",
    category: "punctuation_spacing",
    labelAr: "تكرار الفواصل",
    labelEn: "Duplicate commas",
    explanationAr: "حذف الفواصل المكررة غير القياسية.",
    explanationEn: "Remove duplicate commas.",
  },
  {
    pattern: /[؟?]{2,}/g,
    replacement: "؟",
    category: "punctuation_spacing",
    labelAr: "تكرار علامة الاستفهام",
    labelEn: "Duplicate question marks",
    explanationAr: "استخدام علامة استفهام واحدة فقط.",
    explanationEn: "Single question mark.",
  },
];

// English common spelling dictionary
const ENGLISH_SPELLING_DICTIONARY: Array<{
  pattern: RegExp;
  replacement: string;
  category: SpellCheckCategory;
  labelAr: string;
  labelEn: string;
  explanationAr: string;
  explanationEn: string;
}> = [
  {
    pattern: /\bteh\b/gi,
    replacement: "the",
    category: "general_spelling",
    labelAr: "خطأ إملائي",
    labelEn: "Typo",
    explanationAr: "تصحيح الكلمة إلى (the).",
    explanationEn: "Correct spelling is 'the'.",
  },
  {
    pattern: /\brecieve\b/gi,
    replacement: "receive",
    category: "general_spelling",
    labelAr: "قاعدة i قبل e",
    labelEn: "i before e rule",
    explanationAr: "تصحيح رسم الكلمة إلى (receive).",
    explanationEn: "Correct spelling is 'receive'.",
  },
  {
    pattern: /\bseperate\b/gi,
    replacement: "separate",
    category: "general_spelling",
    labelAr: "خطأ إملائي",
    labelEn: "Typo",
    explanationAr: "تصحيح الكلمة إلى (separate).",
    explanationEn: "Correct spelling is 'separate'.",
  },
  {
    pattern: /\boccured\b/gi,
    replacement: "occurred",
    category: "general_spelling",
    labelAr: "تضعيف الحرف",
    labelEn: "Double consonant",
    explanationAr: "تضعيف حرف r لتصبح (occurred).",
    explanationEn: "Spelling requires double 'r' (occurred).",
  },
  {
    pattern: /\buntill\b/gi,
    replacement: "until",
    category: "general_spelling",
    labelAr: "خطأ إملائي",
    labelEn: "Typo",
    explanationAr: "تكتب بلام واحدة (until).",
    explanationEn: "Spelled with a single 'l' (until).",
  },
  {
    pattern: /\bdefinately\b/gi,
    replacement: "definitely",
    category: "general_spelling",
    labelAr: "خطأ إملائي",
    labelEn: "Typo",
    explanationAr: "تصحيح الكلمة إلى (definitely).",
    explanationEn: "Correct spelling is 'definitely'.",
  },
  {
    pattern: /\baccomodate\b/gi,
    replacement: "accommodate",
    category: "general_spelling",
    labelAr: "تضعيف الحرف",
    labelEn: "Double consonant",
    explanationAr: "تكتب بـ mm و cc (accommodate).",
    explanationEn: "Spelled 'accommodate'.",
  },
  {
    pattern: /\s+([,.:?!])/g,
    replacement: "$1",
    category: "punctuation_spacing",
    labelAr: "فراغ قبل الترقيم",
    labelEn: "Space before punctuation",
    explanationAr: "إزالة الفراغ قبل علامة الترقيم.",
    explanationEn: "Remove leading space before punctuation.",
  },
];

/**
 * Proofreads a single text string and returns detected issues and corrected text.
 */
export function proofreadText(
  text: string,
  location: "stem" | "option" | "correctAnswer",
  optionIndex?: number,
  isRtl: boolean = true
): { issues: SpellCheckIssue[]; correctedText: string } {
  if (!text || typeof text !== "string") {
    return { issues: [], correctedText: text || "" };
  }

  const issues: SpellCheckIssue[] = [];
  let workingText = text;
  const dict = isRtl ? ARABIC_SPELLING_DICTIONARY : ENGLISH_SPELLING_DICTIONARY;

  dict.forEach((entry, idx) => {
    // Reset regex state
    entry.pattern.lastIndex = 0;
    const matches = Array.from(workingText.matchAll(entry.pattern));

    if (matches.length > 0) {
      matches.forEach((match, mIdx) => {
        const originalWord = match[0];
        // Don't add duplicate identical issues at the exact same location
        const issueId = `spell-${location}-${optionIndex ?? 0}-${idx}-${mIdx}-${encodeURIComponent(originalWord)}`;

        // Check if this pattern actually changed something
        const potentialFix = originalWord.replace(entry.pattern, entry.replacement);
        if (potentialFix !== originalWord) {
          issues.push({
            id: issueId,
            location,
            optionIndex,
            originalWord,
            suggestedWord: potentialFix,
            category: entry.category,
            categoryLabelAr: entry.labelAr,
            categoryLabelEn: entry.labelEn,
            explanationAr: entry.explanationAr,
            explanationEn: entry.explanationEn,
          });
        }
      });

      // Apply the fix to workingText
      workingText = workingText.replace(entry.pattern, entry.replacement);
    }
  });

  return { issues, correctedText: workingText };
}

/**
 * Evaluates the full question (stem, each option, and correct answer) for spelling and orthography errors.
 */
export function checkQuestionSpelling(q: Question, isRtl: boolean = true): QuestionSpellCheckResult {
  const stem = q.stem || "";
  const options = q.options || [];
  const correctAnswer = q.correctAnswer || q.answer || "";

  // 1. Stem proofreading
  const stemResult = proofreadText(stem, "stem", undefined, isRtl);

  // 2. Options proofreading
  const optionsErrors: Record<number, SpellCheckIssue[]> = {};
  const correctedOptions: string[] = [];

  options.forEach((opt, idx) => {
    const optResult = proofreadText(opt, "option", idx, isRtl);
    if (optResult.issues.length > 0) {
      optionsErrors[idx] = optResult.issues;
    }
    correctedOptions.push(optResult.correctedText);
  });

  // 3. Answer proofreading
  const answerResult = proofreadText(correctAnswer, "correctAnswer", undefined, isRtl);

  // Consolidate all issues
  const allIssues: SpellCheckIssue[] = [
    ...stemResult.issues,
    ...Object.values(optionsErrors).flat(),
    ...answerResult.issues,
  ];

  return {
    hasErrors: allIssues.length > 0,
    totalErrors: allIssues.length,
    stemErrors: stemResult.issues,
    optionsErrors,
    answerErrors: answerResult.issues,
    allIssues,
    correctedStem: stemResult.correctedText,
    correctedOptions,
    correctedAnswer: answerResult.correctedText,
  };
}

/**
 * Applies all automated spelling fixes to a question object.
 */
export function applyAllSpellingFixes(q: Question, isRtl: boolean = true): Question {
  const result = checkQuestionSpelling(q, isRtl);
  if (!result.hasErrors) return q;

  return {
    ...q,
    stem: result.correctedStem,
    options: q.options ? result.correctedOptions : undefined,
    correctAnswer: result.correctedAnswer || q.correctAnswer,
  };
}

/**
 * Applies a specific single spelling fix to a question object.
 */
export function applySingleSpellingFix(q: Question, issue: SpellCheckIssue): Question {
  if (issue.location === "stem") {
    const updatedStem = (q.stem || "").replace(issue.originalWord, issue.suggestedWord);
    return { ...q, stem: updatedStem };
  }

  if (issue.location === "option" && typeof issue.optionIndex === "number" && q.options) {
    const updatedOptions = [...q.options];
    if (updatedOptions[issue.optionIndex]) {
      updatedOptions[issue.optionIndex] = updatedOptions[issue.optionIndex].replace(
        issue.originalWord,
        issue.suggestedWord
      );
    }
    return { ...q, options: updatedOptions };
  }

  if (issue.location === "correctAnswer") {
    const updatedAnswer = (q.correctAnswer || "").replace(issue.originalWord, issue.suggestedWord);
    return { ...q, correctAnswer: updatedAnswer };
  }

  return q;
}
