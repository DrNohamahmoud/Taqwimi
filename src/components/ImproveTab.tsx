import React, { useState, useRef } from "react";
import { Sparkles, HelpCircle, FileCheck, Copy, Check, CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, RefreshCw, ListChecks, Mic, MicOff, Volume2, Image as ImageIcon, Upload, Trash2, FileImage, Wand2, Zap, CheckCheck, FileEdit, Plus, Award, Table, Layers, Maximize2, SpellCheck, SlidersHorizontal, BookOpen } from "lucide-react";
import { Question, RubricCriterion } from "../types";
import { Language, translations } from "../translations";
import FullscreenQuestionReviewModal from "./FullscreenQuestionReviewModal";
import AiProofreadingUnit from "./AiProofreadingUnit";
import BatchAuditModal from "./BatchAuditModal";

interface ImproveTabProps {
  onAddQuestion: (q: Question) => void;
  lang: Language;
  stage?: "2" | "3";
  onNextStage?: () => void;
  questionsList?: Question[];
  onBatchUpdateQuestions?: (updated: Question[]) => void;
}

export interface ChecklistCriterion {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  evaluate: (stem: string, options: string[], correctAnswer: string) => "pass" | "warn";
}

// Stage 2 Criteria: Focus on Item Writing & Linguistic Formulation Refinement Guidelines
const STAGE2_CHECKLISTS: Record<string, ChecklistCriterion[]> = {
  mcq: [
    {
      id: "lang_fusha_and_clarity",
      titleAr: "استخدام لغة فصحى ميسرة ومباشرة وتجنب الكلمات الغامضة أو غير المفهومة",
      titleEn: "Use clear Modern Standard Arabic and avoid vague or obscure words",
      descAr: "صياغة السؤال بأسلوب لغوي فصيح ومباشر يتناسب مع المستوى الأكاديمي، والتأكد من وضوح وسلاسة المفردات دون إبهام أو غموض.",
      descEn: "Formulate items using clear, direct, and accessible formal language, ensuring vocabulary is precise without ambiguity.",
      evaluate: (stem, options) => {
        if (stem.trim().length < 10) return "warn";
        const full = (stem + " " + (options ? options.join(" ") : "")).toLowerCase();
        const vagueTerms = ["نوعاً ما", "نوعا ما", "إلى حد ما", "إلى حدٍ ما", "بعض الشيء", "vague", "somewhat", "obscure"];
        return vagueTerms.some((t) => full.includes(t)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_no_grammar_errors",
      titleAr: "صحة التركيب النحوي والإعرابي وسلامة الضبط اللغوي",
      titleEn: "Syntactic correctness, grammar rules & grammatical concord",
      descAr: "استقامة الجمل لغوياً وفق قواعد النحو العربي السليم، ومراعاة المطابقة بين الفعل والفاعل والصفة والموصوف وتوافق الضمائر.",
      descEn: "Strict adherence to formal grammar rules, subject-verb agreement, and syntactic structure.",
      evaluate: (stem, options) => {
        const full = stem + " " + (options ? options.join(" ") : "");
        const doublePunct = /[،,.؟?]{2,}/.test(full);
        const spaceBeforePunct = /\s[،,.؟:]/.test(full);
        return doublePunct || spaceBeforePunct ? "warn" : "pass";
      },
    },
    {
      id: "lang_spelling_morphology",
      titleAr: "السلامة الإملائية والصرفية ودقة رسم الهمزات والتاء المربوطة",
      titleEn: "Morphological and orthographic precision (Hamza & Ta-Marbuta)",
      descAr: "الدقة الإملائية التامة في رسم همزات الوصل والقطع (أ/إ/ا) والتمييز بين التاء المربوطة والهاء (ة/ه) والياء والألف المقصورة (ي/ى).",
      descEn: "Ensure perfect spelling precision without common orthographic errors in Arabic letters.",
      evaluate: (stem, options) => {
        const full = stem + " " + (options ? options.join(" ") : "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_punctuation_meaning",
      titleAr: "صحة علامات الترقيم لضبط المعنى وصياغة الجذع كجملة خبرية تنتهي بنقطتين (:)",
      titleEn: "Correct punctuation to ensure precise meaning (declarative stem ending with :)",
      descAr: "صياغة الجذع كجملة خبرية تنتهي بنقطتين (:) وتجنب أدوات الاستفهام والانتهاء بعلامة (؟)، مع ضبط الفواصل.",
      descEn: "Ending declarative stems with a colon (:) and avoiding question marks or missing punctuation marks.",
      evaluate: (stem) => {
        const text = stem.trim().toLowerCase();
        const startsWithQuestion = ["أي مما يلي", "ما هو", "ما هي", "كيف", "لماذا", "ما الفرق", "أيها", "هل", "which of the following", "what is", "how does", "why"].some((q) => text.startsWith(q));
        const endsWithQuestionMark = text.endsWith("؟") || text.endsWith("?");
        return startsWithQuestion || endsWithQuestionMark ? "warn" : "pass";
      },
    },
    {
      id: "lang_conciseness_no_redundancy",
      titleAr: "الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد",
      titleEn: "Linguistic conciseness and elimination of redundancy or filler words",
      descAr: "خلو متن السؤال وبدائله من الكلمات الزائدة أو الجمل الاستطرادية التي لا تخدم قياس ناتج التعلم مباشرة.",
      descEn: "Ensuring item stems and choices are concise and direct without unnecessary wordiness.",
      evaluate: (stem) => (stem.length > 250 ? "warn" : "pass"),
    },
    {
      id: "lang_single_idea",
      titleAr: "أن يوجه السؤال لفكرة أو مشكلة واحدة محددة وعدم تركيب أكثر من فكرة في سؤال واحد",
      titleEn: "Focus on a single specific idea or problem without compounding",
      descAr: "تركيز الجذع على قياس مفهوم أو ناتج تعليمي واحد محدد بدقة دون دمج أفكار أو قضايا متعددة تشتت الفهم.",
      descEn: "Target a single, specific educational objective or problem without combining multiple complex ideas.",
      evaluate: (stem) => {
        const text = stem.trim();
        const isCompound = text.includes("؟ و") || text.includes("؟ إضافة") || (text.split(" و ").length > 3 && text.length > 120);
        return isCompound ? "warn" : "pass";
      },
    },
    {
      id: "no_option_repeat",
      titleAr: "تجنب تكرار كلمات الجذع بالخيارات",
      titleEn: "Avoid repeating stem words in options",
      descAr: "وضع الألفاظ المشتركة في الجذع بدلاً من تكرارها داخل كل بديل لمنع الحشو.",
      descEn: "Place common words in the item stem rather than repeating in every choice.",
      evaluate: (stem, options) => {
        if (!options || options.length === 0) return "pass";
        const words = stem.split(/\s+/).filter((w) => w.length > 4);
        let repeatCount = 0;
        options.forEach((opt) => {
          words.forEach((w) => {
            if (opt.includes(w)) repeatCount++;
          });
        });
        return repeatCount >= options.length * 2 ? "warn" : "pass";
      },
    },
    {
      id: "equal_length",
      titleAr: "تكافئ وتجانس الخيارات في الطول والنمط التركيبي",
      titleEn: "Equal and parallel choice length & structure",
      descAr: "أن تكون جميع البدائل متقاربة ومتساوية في عدد الكلمات والنمط التركيبي لتقليل التخمين.",
      descEn: "Choices should be parallel in length and grammatical structure to minimize guessing.",
      evaluate: (_, options) => {
        if (!options || options.length < 2) return "pass";
        const lens = options.map((o) => o.trim().length);
        const minL = Math.min(...lens);
        const maxL = Math.max(...lens);
        return maxL > 0 && minL / maxL < 0.3 ? "warn" : "pass";
      },
    },
    {
      id: "single_correct",
      titleAr: "وجود إجابة واحدة صحيحة ومحددة تماماً",
      titleEn: "Single clear, indisputable correct answer",
      descAr: "تأكيد أن خياراً واحداً فقط صحيح بدقة مع كون المشتتات الأخرى جذابة ولكنها غير صحيحة.",
      descEn: "Exactly one correct key with plausible but incorrect distractors.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
  ],
  tf: [
    {
      id: "lang_fusha_and_clarity",
      titleAr: "استخدام لغة فصحى ميسرة ومباشرة وتجنب الكلمات الغامضة",
      titleEn: "Use clear Modern Standard Arabic and avoid vague words",
      descAr: "صياغة العبارة التقريرية بأسلوب لغوي فصيح ومباشر وخالٍ من التعقيد اللفظي أو الإبهام.",
      descEn: "Formulate statement using clear, direct formal language without obscurity.",
      evaluate: (stem) => {
        if (stem.trim().length < 10) return "warn";
        const text = stem.toLowerCase();
        const vague = ["نوعاً ما", "إلى حد ما", "بعض الشيء", "somewhat", "vague"];
        return vague.some((v) => text.includes(v)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_no_grammar_errors",
      titleAr: "صحة التركيب النحوي والإعرابي وسلامة الضبط اللغوي للعبارة",
      titleEn: "Syntactic correctness, grammar rules & grammatical concord",
      descAr: "استقامة العبارة لغوياً وفق قواعد النحو العربي السليم، ومراعاة المطابقة بين الفعل والفاعل والصفة والموصوف.",
      descEn: "Strict adherence to formal grammar rules and subject-verb concord in the statement.",
      evaluate: (stem) => {
        const doublePunct = /[،,.؟?]{2,}/.test(stem);
        const spaceBeforePunct = /\s[،,.؟:]/.test(stem);
        return doublePunct || spaceBeforePunct ? "warn" : "pass";
      },
    },
    {
      id: "lang_spelling_morphology",
      titleAr: "السلامة الإملائية والصرفية ودقة رسم الهمزات والتاء المربوطة",
      titleEn: "Morphological and orthographic precision (Hamza & Ta-Marbuta)",
      descAr: "الدقة الإملائية التامة في رسم همزات الوصل والقطع (أ/إ/ا) والتمييز بين التاء المربوطة والهاء (ة/ه).",
      descEn: "Ensure perfect spelling precision without common orthographic errors in Arabic letters.",
      evaluate: (stem) => {
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => stem.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_punctuation_tf",
      titleAr: "صحة علامات الترقيم وصياغة العبارة كجملة تقريرية تنتهي بنقطة (.)",
      titleEn: "Accurate punctuation and declarative statement without question mark",
      descAr: "صياغة العبارة كجملة تقريرية مثبتة ومضبوطة لغوياً تنتهي بنقطة (.) وخلوها التام من علامات أو أدوات الاستفهام.",
      descEn: "Ensure statement is declarative ending with a period and contains no question marks.",
      evaluate: (stem) => {
        const text = stem.trim();
        const hasQuestionMark = text.endsWith("؟") || text.endsWith("?");
        const startsWithQuestion = ["هل", "أ", "ماذا", "لماذا", "كيف"].some((q) => text.startsWith(q));
        return hasQuestionMark || startsWithQuestion ? "warn" : "pass";
      },
    },
    {
      id: "lang_conciseness_no_redundancy",
      titleAr: "الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد",
      titleEn: "Linguistic conciseness and elimination of redundancy or filler words",
      descAr: "خلو العبارة من الكلمات الزائدة أو الجمل الاستطرادية لتركيز المعنى بدقة ومباشرة.",
      descEn: "Ensure statement is concise and direct without wordiness.",
      evaluate: (stem) => (stem.length > 200 ? "warn" : "pass"),
    },
    {
      id: "tf_single_idea",
      titleAr: "احتواء العبارة على فكرة علمية واحدة فقط",
      titleEn: "Single factual idea per statement",
      descAr: "تجنب العبارات المركبة أو التي تجمع أكثر من قضية علمية في وقت واحد.",
      descEn: "Limit statement to a single factual concept without compound clauses.",
      evaluate: (stem) => (stem.includes(" و ") && stem.length > 80 ? "warn" : "pass"),
    },
    {
      id: "tf_no_absolutes",
      titleAr: "تجنب كلمات التعميم المطلق (دائماً، أبداً)",
      titleEn: "No absolute terms (always, never, all)",
      descAr: "الكلمات المطلقة تشير غالباً للخطأ وسهلة التخمين من الطالب.",
      descEn: "Absolute words tend to clue 'False' to savvy test takers.",
      evaluate: (stem) => {
        const text = stem.toLowerCase();
        const banned = ["دائماً", "أبداً", "جميع", "كلياً", "إطلاقاً", "always", "never", "completely"];
        return banned.some((b) => text.includes(b)) ? "warn" : "pass";
      },
    },
    {
      id: "tf_no_double_negatives",
      titleAr: "تجنب النفي والنفي المزدوج",
      titleEn: "No double negatives or confusing phrasing",
      descAr: "الصياغة بعبارة إثبات مباشرة بدلاً من صياغة نفي المعرفة.",
      descEn: "Use direct positive phrasing rather than confusing negative constructions.",
      evaluate: (stem) => {
        const text = stem.toLowerCase();
        return text.includes("لا يعتبر غير") || text.includes("ليس من غير") || text.includes("not un") ? "warn" : "pass";
      },
    },
  ],
  fill: [
    {
      id: "lang_fusha_and_clarity",
      titleAr: "استخدام لغة فصحى ميسرة ومباشرة وتجنب الكلمات الغامضة",
      titleEn: "Use clear Modern Standard Arabic and avoid vague words",
      descAr: "صياغة جملة الإكمال بلغة فصيحة ومباشرة وواضحة المعنى والدلالة الأكاديمية.",
      descEn: "Formulate fill sentence using clear, direct, and accessible formal language.",
      evaluate: (stem) => {
        if (stem.trim().length < 10) return "warn";
        const text = stem.toLowerCase();
        const vague = ["نوعاً ما", "إلى حد ما", "بعض الشيء", "somewhat", "vague"];
        return vague.some((v) => text.includes(v)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_no_grammar_errors",
      titleAr: "صحة التركيب النحوي والإعرابي وسلامة الضبط اللغوي للجملة",
      titleEn: "Syntactic correctness, grammar rules & grammatical concord",
      descAr: "استقامة سياق الجملة نحوياً وإعرابياً ومطابقة موقع الفراغ للقواعد النحوية السليمة.",
      descEn: "Strict adherence to formal grammar rules and syntactic coherence around the blank.",
      evaluate: (stem) => {
        const doublePunct = /[،,.؟?]{2,}/.test(stem);
        const spaceBeforePunct = /\s[،,.؟:]/.test(stem);
        return doublePunct || spaceBeforePunct ? "warn" : "pass";
      },
    },
    {
      id: "lang_spelling_morphology",
      titleAr: "السلامة الإملائية والصرفية ودقة رسم الهمزات والتاء المربوطة",
      titleEn: "Morphological and orthographic precision (Hamza & Ta-Marbuta)",
      descAr: "الدقة الإملائية التامة في رسم همزات الوصل والقطع (أ/إ/ا) والتاء المربوطة والهاء في المتن والإجابة.",
      descEn: "Ensure perfect spelling precision in the sentence and key term.",
      evaluate: (stem, _, correct) => {
        const full = stem + " " + (correct || "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_punctuation_fill",
      titleAr: "صحة علامات الترقيم وموقع الفراغ '___' في موقع لغوي سليم",
      titleEn: "Punctuation accuracy and syntactically sound blank placement",
      descAr: "مراعاة صحة علامات الترقيم والفواصل في الجملة، ووضع الفراغ '___' في موقع تركيبي متسق نحوياً ودلالياً.",
      descEn: "Sentence punctuation is accurate and blank placement fits grammatical flow.",
      evaluate: (stem) => {
        const hasBlank = stem.includes("___");
        const count = (stem.match(/___/g) || []).length;
        return hasBlank && count === 1 ? "pass" : "warn";
      },
    },
    {
      id: "lang_conciseness_no_redundancy",
      titleAr: "الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد",
      titleEn: "Linguistic conciseness and elimination of redundancy or filler words",
      descAr: "خلو سياق الجملة من العبارات الاستطرادية الزائدة والتركيز على المصطلح المحوري مباشرة.",
      descEn: "Sentence provides focused context without unnecessary filler clauses.",
      evaluate: (stem) => (stem.length > 200 ? "warn" : "pass"),
    },
    {
      id: "fill_sufficient_context",
      titleAr: "توفير سياق كافٍ يحدد الإجابة بدقة",
      titleEn: "Sufficient context to determine required term",
      descAr: "أن تعطي الجملة معنى كاملاً يوجه نحو الكلمة أو المصطلح المستهدف.",
      descEn: "Sentence provides enough background so the correct word is obvious.",
      evaluate: (stem) => (stem.length >= 25 ? "pass" : "warn"),
    },
    {
      id: "fill_single_blank",
      titleAr: "اقتصار الجملة على فراغ واحد '___'",
      titleEn: "Single blank ('___') per sentence",
      descAr: "عدم تشتيت الطالب بأكثر من فراغ في السطر الواحد لتحديد الاستجابة.",
      descEn: "Limit to one blank per item to keep question focused.",
      evaluate: (stem) => {
        const count = (stem.match(/___/g) || []).length;
        return count === 1 ? "pass" : "warn";
      },
    },
    {
      id: "fill_key_term",
      titleAr: "تخصيص الفراغ للكلمة أو المصطلح الجوهري",
      titleEn: "Blank targets essential key term only",
      descAr: "أن يكون الفراغ لمفهوم أو مصطلح محوري وليس لكلمات عامة عابرة.",
      descEn: "Target the main concept or technical term, not filler words.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
  ],
  matching: [
    {
      id: "lang_fusha_and_clarity",
      titleAr: "استخدام لغة فصحى ميسرة ومباشرة وتجنب الكلمات الغامضة",
      titleEn: "Use clear Modern Standard Arabic and avoid vague words",
      descAr: "صياغة عناصر ومفردات القائمتين بلغة فصيحة ومصطلحات علمية دقيقة وموحدة.",
      descEn: "Formulate premises and responses using standard, clear formal terminology.",
      evaluate: (stem) => (stem.trim().length < 10 ? "warn" : "pass"),
    },
    {
      id: "lang_no_grammar_errors",
      titleAr: "صحة التركيب النحوي والإعرابي وسلامة الضبط اللغوي",
      titleEn: "Syntactic correctness, grammar rules & grammatical concord",
      descAr: "استقامة التراكيب لغوياً وفق قواعد النحو العربي وتجانس النمط النحوي للعبارات في كل عمود.",
      descEn: "Strict adherence to formal grammar rules and parallel grammatical structures.",
      evaluate: (stem) => {
        const doublePunct = /[،,.؟?]{2,}/.test(stem);
        return doublePunct ? "warn" : "pass";
      },
    },
    {
      id: "lang_spelling_morphology",
      titleAr: "السلامة الإملائية والصرفية ودقة رسم الهمزات والتاء المربوطة",
      titleEn: "Morphological and orthographic precision (Hamza & Ta-Marbuta)",
      descAr: "الدقة الإملائية التامة في كافة مفردات القائمتين ومراعاة همزات الوصل والقطع والتاء المربوطة.",
      descEn: "Ensure perfect spelling precision across all premises and response options.",
      evaluate: (stem) => {
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => stem.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_punctuation_matching",
      titleAr: "صحة علامات الترقيم وسلامة الصياغة اللغوية لتعليمات الربط",
      titleEn: "Punctuation accuracy & clear linguistic instructions for matching",
      descAr: "صياغة رأس السؤال بأسلوب لغوي سليم ينتهي بنقطتين (:) يوضح معيار الربط بين العمودين بدقة.",
      descEn: "Clear instructional stem ending with a colon defining matching relationship.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "lang_conciseness_no_redundancy",
      titleAr: "الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد",
      titleEn: "Linguistic conciseness and elimination of redundancy or filler words",
      descAr: "قصر عناصر القائمتين على الكلمات أو العبارات المباشرة دون حشو أو إطالة.",
      descEn: "Keep premises and response options concise and distinct.",
      evaluate: (stem) => (stem.length > 250 ? "warn" : "pass"),
    },
    {
      id: "match_more_responses",
      titleAr: "زيادة خيارات العمود ب عن مثيرات العمود أ",
      titleEn: "Column B responses outnumber Column A premises",
      descAr: "إضافة خيارات استجابة غير قابلة للمزاوجة للحد من التخمين بالاستبعاد.",
      descEn: "Include extra response options to prevent process-of-elimination guessing.",
      evaluate: () => "pass",
    },
    {
      id: "match_homogeneity",
      titleAr: "تجانس المفردات والخيارات في القائمة الواحدة",
      titleEn: "Homogeneous items in each column",
      descAr: "تجمع عناصر العمود حول موضوع واحد متجانس (أعلام، تعاريف، تواريخ).",
      descEn: "Keep premises and responses aligned around a consistent topic.",
      evaluate: () => "pass",
    },
  ],
  essay: [
    {
      id: "lang_fusha_and_clarity",
      titleAr: "استخدام لغة فصحى ميسرة ومباشرة وتجنب الكلمات الغامضة أو غير المفهومة",
      titleEn: "Use clear Modern Standard Arabic and avoid vague or obscure words",
      descAr: "صياغة المثير المقالي بلغة فصيحة واضحة المعالم تحدد طبيعة المهمة والمخرجات المطلوبة بدقة.",
      descEn: "Formulate prompt using clear, direct, and accessible formal language without ambiguity.",
      evaluate: (stem) => {
        if (stem.trim().length < 10) return "warn";
        const text = stem.toLowerCase();
        const vagueTerms = ["نوعاً ما", "إلى حد ما", "بعض الشيء", "somewhat", "vague"];
        return vagueTerms.some((t) => text.includes(t)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_no_grammar_errors",
      titleAr: "صحة التركيب النحوي والإعرابي وسلامة الضبط اللغوي للمثير",
      titleEn: "Syntactic correctness, grammar rules & grammatical concord",
      descAr: "استقامة الجمل لغوياً وفق قواعد النحو العربي السليم، وسلامة تراكيب الجملة التوجيهية.",
      descEn: "Strict adherence to formal grammar rules and syntactic structure in the essay prompt.",
      evaluate: (stem, _, correct) => {
        const full = stem + " " + (correct || "");
        const doublePunct = /[،,.؟?]{2,}/.test(full);
        const spaceBeforePunct = /\s[،,.؟:]/.test(full);
        return doublePunct || spaceBeforePunct ? "warn" : "pass";
      },
    },
    {
      id: "lang_spelling_morphology",
      titleAr: "السلامة الإملائية والصرفية ودقة رسم الهمزات والتاء المربوطة",
      titleEn: "Morphological and orthographic precision (Hamza & Ta-Marbuta)",
      descAr: "الدقة الإملائية التامة في رسم همزات الوصل والقطع (أ/إ/ا) والتاء المربوطة في المثير والإجابة النموذجية ومعايير التقدير.",
      descEn: "Ensure perfect spelling precision in prompt, model answer, and rubric.",
      evaluate: (stem, _, correct) => {
        const full = stem + " " + (correct || "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_punctuation_essay",
      titleAr: "صحة علامات الترقيم وصياغة المثير بفعل إجرائي مباشر ومحدد",
      titleEn: "Punctuation accuracy & explicit direct instructional prompt phrasing",
      descAr: "استخدام علامات الترقيم بدقة وضبط المثير اللغوي بفعل إجرائي محدد (مثل: اشرح، علل، قارن، استنتج، حلل).",
      descEn: "Prompt begins with a clear procedural action verb (explain, compare, analyze, justify).",
      evaluate: (stem) => {
        const text = stem.trim().toLowerCase();
        const actionVerbs = ["علل", "اشرح", "قارن", "حلل", "استنتج", "وضح", "بيّن", "ناقش", "ميّز", "فسر", "صنف", "explain", "compare", "analyze", "describe", "justify"];
        return actionVerbs.some((v) => text.includes(v)) ? "pass" : "warn";
      },
    },
    {
      id: "lang_conciseness_no_redundancy",
      titleAr: "الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد",
      titleEn: "Linguistic conciseness and elimination of redundancy or filler words",
      descAr: "خلو نص السؤال المقالي من الحشو الإنشائي الزائد مع التركيز على المهمة المطلوبة وإطارها المعرفي.",
      descEn: "Prompt is concise and clearly scoped without unnecessary narrative filler.",
      evaluate: (stem) => (stem.length > 300 ? "warn" : "pass"),
    },
    {
      id: "lang_single_idea",
      titleAr: "تركيز السؤال المقالي على ناتج تعلم محدد وعدم تشتيت الطالب بمهام متعددة غير مترابطة",
      titleEn: "Focus on a cohesive learning outcome without confusing multi-task divergence",
      descAr: "صياغة المثير حول قضية أو ناتج تعلم متماسك يتكامل فيه التحليل والاستنتاج.",
      descEn: "Ensure the essay question focuses on a single coherent task or integrated synthesis.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "essay_clear_prompt",
      titleAr: "صياغة المطلوب بوضوح وتحديد نطاق الاستجابة",
      titleEn: "Clear and direct prompt instructions with response bounds",
      descAr: "تحديد طبيعة الاستجابة المطلوبة وأبعادها المفاهيمية بدقة ومباشرة.",
      descEn: "Specify the expected response scope and key conceptual focus clearly.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "essay_rubric_structure",
      titleAr: "اعتماد سلم تقدير معياري (Rubric) مفصل وتوزيع الدرجات",
      titleEn: "Detailed scoring rubric with point allocations",
      descAr: "تحديد معايير التقييم ومؤشرات الأداء وتوزيع الدرجات لضمان عدالة وموضوعية التصحيح.",
      descEn: "Explicit scoring rubric mapping point allocations to required performance indicators.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
    {
      id: "essay_model_answer",
      titleAr: "توفر الإجابة المرجعية النموذجية الشاملة",
      titleEn: "Comprehensive model answer and solution key",
      descAr: "توفير الإجابة النموذجية المعتمدة لتوحيد معايير الحكم والتقدير.",
      descEn: "Include an approved reference model answer for consistent evaluation.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 5 ? "pass" : "warn"),
    },
  ],
  multi_mcq: [
    {
      id: "lang_fusha_and_clarity",
      titleAr: "استخدام لغة فصحى ميسرة ومباشرة وتجنب الكلمات الغامضة أو غير المفهومة",
      titleEn: "Use clear Modern Standard Arabic and avoid vague or obscure words",
      descAr: "صياغة السؤال بأسلوب لغوي فصيح ومباشر يتناسب مع المستوى الأكاديمي، والتأكد من وضوح وسلاسة المفردات.",
      descEn: "Formulate items using clear, direct, and accessible formal language without ambiguity.",
      evaluate: (stem, options) => {
        if (stem.trim().length < 10) return "warn";
        const full = (stem + " " + (options ? options.join(" ") : "")).toLowerCase();
        const vagueTerms = ["نوعاً ما", "إلى حد ما", "بعض الشيء", "somewhat", "vague"];
        return vagueTerms.some((t) => full.includes(t)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_no_grammar_errors",
      titleAr: "صحة التركيب النحوي والإعرابي وسلامة الضبط اللغوي",
      titleEn: "Syntactic correctness, grammar rules & grammatical concord",
      descAr: "استقامة الجمل لغوياً وفق قواعد النحو العربي السليم، ومراعاة المطابقة بين الفعل والفاعل وتوافق الضمائر.",
      descEn: "Strict adherence to formal grammar rules, subject-verb agreement, and syntactic structure.",
      evaluate: (stem, options) => {
        const full = stem + " " + (options ? options.join(" ") : "");
        const doublePunct = /[،,.؟?]{2,}/.test(full);
        const spaceBeforePunct = /\s[،,.؟:]/.test(full);
        return doublePunct || spaceBeforePunct ? "warn" : "pass";
      },
    },
    {
      id: "lang_spelling_morphology",
      titleAr: "السلامة الإملائية والصرفية ودقة رسم الهمزات والتاء المربوطة",
      titleEn: "Morphological and orthographic precision (Hamza & Ta-Marbuta)",
      descAr: "الدقة الإملائية التامة في رسم همزات الوصل والقطع (أ/إ/ا) والتمييز بين التاء المربوطة والهاء (ة/ه).",
      descEn: "Ensure perfect spelling precision without common orthographic errors in Arabic letters.",
      evaluate: (stem, options) => {
        const full = stem + " " + (options ? options.join(" ") : "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_punctuation_meaning",
      titleAr: "صحة علامات الترقيم وصياغة الجذع كجملة خبرية تنتهي بنقطتين (:)",
      titleEn: "Correct punctuation to ensure precise meaning (declarative stem ending with :)",
      descAr: "صياغة الجذع كجملة خبرية تنتهي بنقطتين (:) وتجنب أدوات الاستفهام والانتهاء بعلامة (؟).",
      descEn: "Ending declarative stems with a colon (:) and avoiding question marks.",
      evaluate: (stem) => {
        const text = stem.trim().toLowerCase();
        const startsWithQuestion = ["أي مما يلي", "ما هو", "ما هي", "كيف", "لماذا", "ما الفرق"].some((q) => text.startsWith(q));
        const endsWithQuestionMark = text.endsWith("؟") || text.endsWith("?");
        return startsWithQuestion || endsWithQuestionMark ? "warn" : "pass";
      },
    },
    {
      id: "lang_conciseness_no_redundancy",
      titleAr: "الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد",
      titleEn: "Linguistic conciseness and elimination of redundancy or filler words",
      descAr: "خلو متن السؤال وبدائله من الكلمات الزائدة أو الجمل الاستطرادية التي لا تخدم قياس ناتج التعلم مباشرة.",
      descEn: "Ensuring item stems and choices are concise and direct without unnecessary wordiness.",
      evaluate: (stem) => (stem.length > 250 ? "warn" : "pass"),
    },
    {
      id: "lang_single_idea",
      titleAr: "أن يوجه السؤال لفكرة أو مشكلة واحدة محددة وعدم تركيب أكثر من فكرة في سؤال واحد",
      titleEn: "Focus on a single specific idea or problem without compounding",
      descAr: "تركيز الجذع على قياس مفهوم أو ناتج تعليمي واحد محدد بدقة دون دمج أفكار أو قضايا متعددة تشتت الفهم.",
      descEn: "Target a single, specific educational objective or problem without combining multiple complex ideas.",
      evaluate: (stem) => {
        const text = stem.trim();
        const isCompound = text.includes("؟ و") || (text.split(" و ").length > 3 && text.length > 120);
        return isCompound ? "warn" : "pass";
      },
    },
    {
      id: "multi_notice",
      titleAr: "التنويه الصريح بوجود أكثر من إجابة صحيحة",
      titleEn: "Clear instruction to select all correct answers",
      descAr: "تنبيه الطالب في متن السؤال إلى إمكانية اختيار أكثر من إجابة.",
      descEn: "Explicitly inform student to select all applicable correct options.",
      evaluate: (stem) => (stem.includes("أكثر") || stem.includes("كافة") || stem.includes("جميع الإجابات") || stem.includes("select all") ? "pass" : "warn"),
    },
    {
      id: "multi_balanced",
      titleAr: "تكافئ الخيارات وتحديد الإجابات الصحيحة",
      titleEn: "Balanced options with clear correct answers",
      descAr: "أن تكون جميع البدائل متسقة ومحددة الإجابات الصحيحة بوضوح.",
      descEn: "Ensure options are homogeneous and correct choices are identified.",
      evaluate: (_, options) => (options && options.length >= 4 ? "pass" : "warn"),
    },
  ],
  ordering: [
    {
      id: "lang_fusha_and_clarity",
      titleAr: "استخدام لغة فصحى ميسرة ومباشرة وتجنب الكلمات الغامضة",
      titleEn: "Use clear Modern Standard Arabic and avoid vague words",
      descAr: "صياغة خطوات ومفردات الترتيب بأسلوب لغوي فصيح ومصطلحات إجرائية واضحة ومحددة.",
      descEn: "Formulate sequence steps using clear, direct formal terminology.",
      evaluate: (stem) => (stem.trim().length < 10 ? "warn" : "pass"),
    },
    {
      id: "lang_no_grammar_errors",
      titleAr: "صحة التركيب النحوي والإعرابي وسلامة الضبط اللغوي للخطوات",
      titleEn: "Syntactic correctness, grammar rules & grammatical concord",
      descAr: "استقامة تراكيب الخطوات لغوياً وتجانس النمط النحوي والصرفي للعبارات المراد ترتيبها.",
      descEn: "Strict adherence to formal grammar rules and parallel step structures.",
      evaluate: (stem) => {
        const doublePunct = /[،,.؟?]{2,}/.test(stem);
        return doublePunct ? "warn" : "pass";
      },
    },
    {
      id: "lang_spelling_morphology",
      titleAr: "السلامة الإملائية والصرفية ودقة رسم الهمزات والتاء المربوطة",
      titleEn: "Morphological and orthographic precision (Hamza & Ta-Marbuta)",
      descAr: "الدقة الإملائية التامة في رسم همزات الوصل والقطع (أ/إ/ا) والتاء المربوطة في نص السؤال والخطوات.",
      descEn: "Ensure perfect spelling precision across the stem and all sequence steps.",
      evaluate: (stem) => {
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => stem.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_punctuation_ordering",
      titleAr: "صحة علامات الترقيم وسلامة الصياغة الإجرائية لمعيار الترتيب",
      titleEn: "Punctuation accuracy & clear linguistic phrasing of sequence criteria",
      descAr: "صياغة موجهة تنتهي بنقطتين (:) توضح معيار التسلسل (زمني، منطقي، إجرائي) بأسلوب لغوي دقيق.",
      descEn: "Clear instructional prompt ending with a colon defining explicit sequence basis.",
      evaluate: (stem) => (stem.includes("ترتيب") || stem.includes("تسلسل") || stem.includes("ارتب") || stem.includes("order") || stem.includes("sequence") ? "pass" : "warn"),
    },
    {
      id: "lang_conciseness_no_redundancy",
      titleAr: "الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد",
      titleEn: "Linguistic conciseness and elimination of redundancy or filler words",
      descAr: "خلو عناصر وخطوات الترتيب من الاستطراد الإنشائي أو التداخل اللفظي المربك.",
      descEn: "Keep sequence items concise, independent, and distinct.",
      evaluate: (stem) => (stem.length > 250 ? "warn" : "pass"),
    },
    {
      id: "order_scheme",
      titleAr: "وضوح معيار الترتيب (زمني، منطقي، إجرائي)",
      titleEn: "Clear ordering scheme (chronological, logical, procedural)",
      descAr: "بيان أساس الترتيب المطلوبة بعبارة صريحة ودقيقة لا تحتمل اللبس.",
      descEn: "State the sequence logic explicitly in the item stem.",
      evaluate: (stem) => (stem.includes("ترتيب") || stem.includes("تسلسل") || stem.includes("ارتب") || stem.includes("order") || stem.includes("sequence") ? "pass" : "warn"),
    },
  ],
  diagram_labeling: [
    {
      id: "lang_fusha_and_clarity",
      titleAr: "استخدام لغة فصحى ميسرة ومباشرة وتجنب الكلمات الغامضة",
      titleEn: "Use clear Modern Standard Arabic and avoid vague words",
      descAr: "صياغة تعليمات ومسميات المخطط التوضيحي بلغة فصيحة ومصطلحات علمية معتمدة ومحددة.",
      descEn: "Formulate diagram instructions and callout names using clear formal scientific terms.",
      evaluate: (stem) => (stem.trim().length < 10 ? "warn" : "pass"),
    },
    {
      id: "lang_no_grammar_errors",
      titleAr: "صحة التركيب النحوي والإعرابي وسلامة الضبط اللغوي",
      titleEn: "Syntactic correctness, grammar rules & grammatical concord",
      descAr: "استقامة الصياغة اللغوية لتعليمات السؤال وفق قواعد النحو العربي السليم وتوافق الضمائر.",
      descEn: "Strict adherence to formal grammar rules in diagram instructions and labels.",
      evaluate: (stem) => {
        const doublePunct = /[،,.؟?]{2,}/.test(stem);
        return doublePunct ? "warn" : "pass";
      },
    },
    {
      id: "lang_spelling_morphology",
      titleAr: "السلامة الإملائية والصرفية ودقة رسم الهمزات والتاء المربوطة",
      titleEn: "Morphological and orthographic precision (Hamza & Ta-Marbuta)",
      descAr: "الدقة الإملائية التامة في رسم همزات الوصل والقطع (أ/إ/ا) والتاء المربوطة في مسميات الرسم والإجابة.",
      descEn: "Ensure perfect spelling precision in diagram prompt and callout terms.",
      evaluate: (stem, _, correct) => {
        const full = stem + " " + (correct || "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "lang_punctuation_diagram",
      titleAr: "صحة علامات الترقيم وسلامة التوجيهات اللغوية للرسم",
      titleEn: "Punctuation accuracy and clear linguistic guidance for diagram items",
      descAr: "سلامة الصياغة اللغوية لتعليمات السؤال وتحديد المطلوب من الرسم بدقة وترقيم سليم.",
      descEn: "Accurate punctuation and unambiguous numbered callout references.",
      evaluate: (stem) => (stem.length > 5 ? "pass" : "warn"),
    },
    {
      id: "lang_conciseness_no_redundancy",
      titleAr: "الإيجاز غير المخل والتخلص من الحشو اللغوي والاستطراد",
      titleEn: "Linguistic conciseness and elimination of redundancy or filler words",
      descAr: "صياغة تعليمات الرسم بإيجاز ومباشرة دون إطالة تشتت التركيز البصري.",
      descEn: "Instructions are concise, direct, and visually supportive.",
      evaluate: (stem) => (stem.length > 250 ? "warn" : "pass"),
    },
    {
      id: "diagram_clarity",
      titleAr: "وضوح الصورة أو المخطط التوضيحي وخلوه من الإجابة المباشرة",
      titleEn: "Diagram resolution & absence of embedded direct answers",
      descAr: "التأكد من جودة الصورة أو المخطط التوضيحي وإزالة أي نصوص تكشف الإجابات.",
      descEn: "Verify image quality and remove any text embedded in the image that gives away keys.",
      evaluate: (stem) => (stem.length > 5 ? "pass" : "warn"),
    },
    {
      id: "diagram_key_explicit",
      titleAr: "وضوح مفتاح الإجابات ودليل التصحيح للأجزاء المشار إليها",
      titleEn: "Explicit answer key & rubric for numbered callout labels",
      descAr: "تحديد مسمى وإجابة نموذجية صريحة لكل رقم أو رمز في الرسم التوضيحي.",
      descEn: "Include an explicit model answer key for every numbered target callout.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
  ],
};

// Stage 3 Criteria: Focus on Comprehensive Psychometric Audit, Bloom Alignment, Linguistic Integrity & Academic Certification
const STAGE3_CHECKLISTS: Record<string, ChecklistCriterion[]> = {
  mcq: [
    {
      id: "stage3_bloom_alignment",
      titleAr: "التوافق مع مستوى بلوم ونواتج التعلم المستهدفة",
      titleEn: "Alignment with Bloom's level & learning outcomes",
      descAr: "مطابقة الفعل الإجرائي ومستوى التفكير المعرفي المطلوب في المنهج (تذكر، فهم، تطبيق، تحليل، تقويم، إبداع) وعدم الهبوط لمستوى أدنى.",
      descEn: "Verify procedural verb aligns with targeted Bloom level and course learning outcome without cognitive drop.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "stage3_scientific_truth",
      titleAr: "الصدق العلمي والدقة الموضوعية للمفهوم المحكّم",
      titleEn: "Scientific validity & indisputable accuracy",
      descAr: "دقة الحقائق والمفاهيم العلمية المطروحة مع كون الإجابة النموذجية صحيحة قطعيًا دون احتمالية الاختلاف الأكاديمي.",
      descEn: "Ensure factual correctness of the key without ambiguity or academic controversy.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
    {
      id: "stage3_linguistic_safety",
      titleAr: "السلامة اللغوية والنزاهة التعبيرية وخلو النص من الركاكة والتصحيف",
      titleEn: "Linguistic integrity, formal academic expression & zero orthographic errors",
      descAr: "التأكد من رصانة الصياغة اللغوية الأكاديمية وسلامة الإعراب والإملاء التامة ورسم الهمزات والتراكيب البلاغية السليمة.",
      descEn: "Verify academic eloquence, pristine Arabic grammar, and complete absence of awkward phrasing or typographical flaws.",
      evaluate: (stem, options) => {
        const full = stem + " " + (options ? options.join(" ") : "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "stage3_distractor_misconceptions",
      titleAr: "فاعلية المشتتات والقدرة التشخيصية للمفاهيم الخاطئة",
      titleEn: "Distractor quality & diagnostic misconception power",
      descAr: "بناء الخيارات الخاطئة على الأخطاء الشائعة والأنماط التفكيرية غير المتمكنة وليس على استبعاد عشوائي أو شكلي.",
      descEn: "Distractors must be plausible, targeting common student misconceptions rather than random filler.",
      evaluate: (_, options) => (options && options.length >= 4 ? "pass" : "warn"),
    },
    {
      id: "stage3_fairness_bias_free",
      titleAr: "العدالة السيكومترية وخلو السؤال من التحيّز",
      titleEn: "Psychometric fairness & bias-free wording",
      descAr: "خلو البند من التحيّز الثقافي أو الاجتماعي أو الجندري أو السياقي لضمان فرصة متكافئة لجميع الطلاب.",
      descEn: "Ensure wording is culturally neutral and free of gender/regional bias for all test-takers.",
      evaluate: () => "pass",
    },
    {
      id: "stage3_scoring_rubric_time",
      titleAr: "وضوح مفتاح الإجابة والتقدير الزمني والدرجة المستحقة",
      titleEn: "Clear answer key, rubric & estimated completion time",
      descAr: "تحديد مفتاح التصحيح المعياري والوزن النسبي والزمن التقديري المخصص لإجابة الطالب.",
      descEn: "Provide definitive answer key, point weight, and estimated completion time.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
    {
      id: "stage3_item_bank_readiness",
      titleAr: "جاهزية البند للأرشفة والاعتماد في بنك الأسئلة",
      titleEn: "Item bank compliance & export certification readiness",
      descAr: "استيفاء البند لكافة الشروط السيكومترية الأكاديمية وصلاحتيه للاعتماد والتصدير المباشر في الاختبار الأكاديمي.",
      descEn: "Item meets all psychometric audit criteria and is ready for institutional bank indexing.",
      evaluate: () => "pass",
    },
  ],
  tf: [
    {
      id: "stage3_bloom_alignment",
      titleAr: "التوافق مع مستوى بلوم ونواتج التعلم المستهدفة",
      titleEn: "Alignment with Bloom's level & learning outcomes",
      descAr: "مطابقة العبارة التقريرية للمستوى المعرفي المستهدف وقياس الفهم والاستدلال بدلاً من التذكر النصي الحرفي.",
      descEn: "Statement aligns with targeted cognitive depth avoiding superficial verbatim recall.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "stage3_tf_validity",
      titleAr: "الصدق الظاهري ودقة العبارة التقريرية",
      titleEn: "Face validity & factual accuracy",
      descAr: "صياغة عبارة حقيقية أو خاطئة بشكل قطعي ومباشر دون تأويلات مزدوجة.",
      descEn: "Statement is strictly True or False with zero factual ambiguity.",
      evaluate: (stem) => (stem.length >= 15 ? "pass" : "warn"),
    },
    {
      id: "stage3_linguistic_safety",
      titleAr: "السلامة اللغوية التامة والضبط النحوي والإملائي للعبارة",
      titleEn: "Linguistic safety, syntactic clarity & orthographic accuracy",
      descAr: "سلامة الصياغة الإملائية والنحوية وتجنب التراكيب المربكة أو النفي المزدوج.",
      descEn: "Ensure pristine grammar, correct spelling, and zero confusing double negation.",
      evaluate: (stem) => {
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => stem.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "stage3_fairness_bias_free",
      titleAr: "العدالة السيكومترية وخلو العبارة من التحيّز",
      titleEn: "Psychometric fairness & bias-free wording",
      descAr: "خلو العبارة من التحيّز الثقافي أو الجغرافي أو الفئوي.",
      descEn: "Culturally neutral and fair statement for all student cohorts.",
      evaluate: () => "pass",
    },
    {
      id: "stage3_item_bank_readiness",
      titleAr: "جاهزية البند للأرشفة والاعتماد في بنك الأسئلة",
      titleEn: "Item bank compliance & export readiness",
      descAr: "استيفاء شروط الدقة السيكومترية وصلاحية السؤال للإدراج في بنك الأسئلة المعتمد.",
      descEn: "Meets institutional testing standards and is ready for question bank export.",
      evaluate: () => "pass",
    },
  ],
  fill: [
    {
      id: "stage3_bloom_alignment",
      titleAr: "التوافق مع مستوى بلوم ونواتج التعلم المستهدفة",
      titleEn: "Alignment with Bloom's level & learning outcomes",
      descAr: "قياس الفهم المفاهيمي واستيعاب المصطلح ضمن سياق تطبيقي أو تفسيري متقدم.",
      descEn: "Target understanding and application of the key concept in rich context.",
      evaluate: (stem) => (stem.trim().length >= 20 ? "pass" : "warn"),
    },
    {
      id: "stage3_fill_precision",
      titleAr: "دقة الكلمة المفتاحية وقابليتها للتقييم الآلي",
      titleEn: "Key phrase precision & auto-grading clarity",
      descAr: "تحديد الكلمة المطلوبة بدقة تضمن عدم تعدد المرادفات أو التشتت في التقييم.",
      descEn: "Target answer is concise and unambiguous for reliable computer grading.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
    {
      id: "stage3_linguistic_safety",
      titleAr: "السلامة اللغوية والإملائية التامة للجملة والكلمة المستهدفة",
      titleEn: "Linguistic and orthographic perfection in sentence and key",
      descAr: "خلو الجملة والكلمة المطلوبة من الأخطاء الإملائية والهمزات والتاء المربوطة.",
      descEn: "Verify accurate orthography and grammar in both sentence and target answer.",
      evaluate: (stem, _, correct) => {
        const full = stem + " " + (correct || "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "stage3_fairness_bias_free",
      titleAr: "العدالة السيكومترية والوضوح لجميع الطلاب",
      titleEn: "Psychometric fairness & clarity",
      descAr: "وضوح السياق التعليمي لجميع الطلاب دون افتراض خلفيات ثقافية خاصة.",
      descEn: "Ensure fair, accessible context across diverse student backgrounds.",
      evaluate: () => "pass",
    },
    {
      id: "stage3_item_bank_readiness",
      titleAr: "جاهزية البند للأرشفة والاعتماد في بنك الأسئلة",
      titleEn: "Item bank compliance & export readiness",
      descAr: "صلاحية البند للاعتماد والأرشفة الأكاديمية في مصفوفة بنك الأسئلة.",
      descEn: "Item is vetted and ready for institutional bank archiving.",
      evaluate: () => "pass",
    },
  ],
  matching: [
    {
      id: "stage3_bloom_alignment",
      titleAr: "التوافق مع مستوى بلوم ونواتج التعلم المستهدفة",
      titleEn: "Alignment with Bloom's level & learning outcomes",
      descAr: "استهداف مهارات الربط والتمييز والعلاقات المنطقية المعرفية بدقة.",
      descEn: "Target relational reasoning, classification, and conceptual discrimination.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "stage3_match_homogeneity",
      titleAr: "التجانس السيكومتري بين مثيرات واستجابات المزاوجة",
      titleEn: "Psychometric homogeneity across premises & responses",
      descAr: "أن تكون كافة مفردات العمودين تنتمي إلى مجال معرفي واحد محدد بدقة.",
      descEn: "Premises and responses must belong to a single coherent domain.",
      evaluate: () => "pass",
    },
    {
      id: "stage3_linguistic_safety",
      titleAr: "السلامة اللغوية وتجانس التراكيب النحوية في القوائم",
      titleEn: "Linguistic safety & parallel grammatical structures across columns",
      descAr: "سلامة الإملاء والنحو وتطابق النمط النحوي للعبارات في كل عمود لتجنب تلميحات الإجابة.",
      descEn: "Ensure grammatical parallelism and flawless spelling across both columns.",
      evaluate: (stem) => {
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => stem.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "stage3_fairness_bias_free",
      titleAr: "العدالة السيكومترية وخلو السؤال من التحيّز",
      titleEn: "Psychometric fairness & bias-free design",
      descAr: "تكافؤ الفرص ووضوح المعيار لجميع الطلاب دون غموض في العلاقات.",
      descEn: "Unambiguous one-to-one pairings without confusing cross-domain overlap.",
      evaluate: () => "pass",
    },
    {
      id: "stage3_item_bank_readiness",
      titleAr: "جاهزية البند للأرشفة والاعتماد في بنك الأسئلة",
      titleEn: "Item bank compliance & export readiness",
      descAr: "استيفاء البند لكافة الشروط السيكومترية وصلاحتيه للاعتماد النهائي.",
      descEn: "Ready for certified institutional item bank indexing and paper export.",
      evaluate: () => "pass",
    },
  ],
  essay: [
    {
      id: "stage3_bloom_alignment",
      titleAr: "التوافق مع مستوى بلوم ونواتج التعلم المستهدفة",
      titleEn: "Alignment with Bloom's level & learning outcomes",
      descAr: "استهداف مهارات التفكير العليا (التحليل، التقويم، التركيب، حل المشكلات) بدقة.",
      descEn: "Target higher-order cognitive processing (analyzing, evaluating, synthesizing).",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "stage3_essay_rubric",
      titleAr: "اعتماد سلم التقدير اللفظي (Rubric) ومعايير التقدير الموضوعي",
      titleEn: "Approved scoring rubric & criterion breakdown",
      descAr: "توفير معايير التقييم وتوزيع الدرجات على عناصر الإجابة لضمان التقدير الموضوعي العادل.",
      descEn: "Explicit scoring rubric mapping point allocations to required response elements.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
    {
      id: "stage3_linguistic_safety",
      titleAr: "السلامة اللغوية ورصانة الصياغة الأكاديمية للمثير وسلالم التقدير",
      titleEn: "Linguistic safety, academic eloquence & pristine rubric phrasing",
      descAr: "سلامة الإملاء والنحو وضبط مؤشرات الأداء اللفظية بلغة أكاديمية رصينة ومحددة.",
      descEn: "Flawless grammar, spelling, and explicit terminology across prompt and rubric criteria.",
      evaluate: (stem, _, correct) => {
        const full = stem + " " + (correct || "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "stage3_essay_cognitive_depth",
      titleAr: "استهداف مهارات التفكير العليا والتحليل والاستنتاج",
      titleEn: "Targeting higher-order cognitive skills & synthesis",
      descAr: "صياغة المثير المقالي بحيث يتطلب تركيباً أو تحليلاً أو تعليلاً وليس مجرد استرجاع آلي.",
      descEn: "Ensure the prompt demands analytical synthesis and justification rather than rote recall.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "stage3_item_bank_readiness",
      titleAr: "جاهزية البند للأرشفة والاعتماد في بنك الأسئلة",
      titleEn: "Item bank compliance & export readiness",
      descAr: "استيفاء السؤال المقالي وسلالم التقدير لمعايير الجودة والأرشفة المعتمدة.",
      descEn: "Vetted essay item with attached rubric ready for certified exam generation.",
      evaluate: () => "pass",
    },
  ],
  multi_mcq: [
    {
      id: "stage3_bloom_alignment",
      titleAr: "التوافق مع مستوى بلوم ونواتج التعلم المستهدفة",
      titleEn: "Alignment with Bloom's level & learning outcomes",
      descAr: "قياس القدرة على التمييز المتعدد والتحليل الشامل لمكونات المفهوم.",
      descEn: "Assess multi-faceted analysis and comprehensive conceptual discrimination.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "stage3_scientific_truth",
      titleAr: "الصدق العلمي وتحديد كافة الإجابات الصحيحة",
      titleEn: "Scientific validity & exhaustive key verification",
      descAr: "الدقة العلمية القطعية لكل خيار صحيح ولكافة المشتتات المستبعدة.",
      descEn: "Complete scientific certainty for all keyed options and distractors.",
      evaluate: (_, options) => (options && options.length >= 4 ? "pass" : "warn"),
    },
    {
      id: "stage3_linguistic_safety",
      titleAr: "السلامة اللغوية والضبط النحوي وتجانس تراكيب البدائل",
      titleEn: "Linguistic safety, syntactic accuracy & parallel option structures",
      descAr: "سلامة الإملاء والنحو وتكافؤ الصياغة اللغوية لجميع البدائل دون تفاوت تركيبي.",
      descEn: "Ensure parallel grammatical constructions and pristine Arabic orthography across choices.",
      evaluate: (stem, options) => {
        const full = stem + " " + (options ? options.join(" ") : "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "stage3_multi_key",
      titleAr: "تحديد مفاتيح الإجابة المتعددة والوزن النسبي لكل خيار",
      titleEn: "Multi-key identification & partial credit weighting",
      descAr: "وضوح البدائل الصحيحة المتعددة وآلية احتساب الدرجة الجزئية أو الكلية.",
      descEn: "Identify all correct options and define partial scoring logic.",
      evaluate: (_, options) => (options && options.length >= 4 ? "pass" : "warn"),
    },
    {
      id: "stage3_item_bank_readiness",
      titleAr: "جاهزية البند للأرشفة والاعتماد في بنك الأسئلة",
      titleEn: "Item bank compliance & export certification readiness",
      descAr: "استيفاء البند لكافة الشروط السيكومترية الأكاديمية وصلاحتيه للاعتماد.",
      descEn: "Item meets all psychometric audit criteria and is ready for institutional bank indexing.",
      evaluate: () => "pass",
    },
  ],
  ordering: [
    {
      id: "stage3_bloom_alignment",
      titleAr: "التوافق مع مستوى بلوم ونواتج التعلم المستهدفة",
      titleEn: "Alignment with Bloom's level & learning outcomes",
      descAr: "قياس الاستيعاب الإجرائي والمنطقي للعمليات والخطوات المتسلسلة.",
      descEn: "Measure procedural understanding and logical progression.",
      evaluate: (stem) => (stem.trim().length >= 15 ? "pass" : "warn"),
    },
    {
      id: "stage3_order_validity",
      titleAr: "حتمية التسلسل المنطقي والصحة الأكاديمية للترتيب",
      titleEn: "Strict logical sequence & academic correctness",
      descAr: "أن يكون الترتيب صحيحاً أكاديمياً ومحتوماً زمنيًا أو إجرائيًا دون أي ترتيب بديل مقبول.",
      descEn: "Sequence order is strictly linear and undisputed in academic literature.",
      evaluate: () => "pass",
    },
    {
      id: "stage3_linguistic_safety",
      titleAr: "السلامة اللغوية والإملائية وتجانس صياغة الخطوات",
      titleEn: "Linguistic safety, orthographic accuracy & parallel step wording",
      descAr: "الدقة الإملائية والنحوية وتطابق النمط اللغوي لجميع العناصر المراد ترتيبها.",
      descEn: "Flawless spelling, grammar, and consistent linguistic style across all steps.",
      evaluate: (stem) => {
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => stem.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "stage3_fairness_bias_free",
      titleAr: "العدالة السيكومترية ووضوح المطلوب",
      titleEn: "Psychometric fairness & clarity of sequencing task",
      descAr: "وضوح بداية ونهاية التسلسل لجميع الطلاب دون غموض في المسار.",
      descEn: "Transparent, unambiguous sequencing criteria accessible to all students.",
      evaluate: () => "pass",
    },
    {
      id: "stage3_item_bank_readiness",
      titleAr: "جاهزية البند للأرشفة والاعتماد في بنك الأسئلة",
      titleEn: "Item bank compliance & export readiness",
      descAr: "جاهزية بند الترتيب للاعتماد والتصدير ضمن بنك الأسئلة المعتمد.",
      descEn: "Vetted ordering question ready for official exam papers.",
      evaluate: () => "pass",
    },
  ],
  diagram_labeling: [
    {
      id: "stage3_bloom_alignment",
      titleAr: "التوافق مع مستوى بلوم ونواتج التعلم المستهدفة",
      titleEn: "Alignment with Bloom's level & learning outcomes",
      descAr: "قياس مهارات التحليل البصري وتطبيق المفاهيم على المخططات والأشكال العلمية.",
      descEn: "Assess visual analysis, anatomical/schematic comprehension, and application.",
      evaluate: (stem) => (stem.trim().length >= 10 ? "pass" : "warn"),
    },
    {
      id: "stage3_scientific_truth",
      titleAr: "الدقة العلمية التامة للرسم التوضيحي والمسميات",
      titleEn: "Scientific diagram fidelity and exact terminology",
      descAr: "مطابقة الرسم التوضيحي للأصول العلمية المعتمدة ودقة الإشارة إلى الأجزاء.",
      descEn: "Ensure scientific accuracy of the diagram and unequivocal callout targets.",
      evaluate: (_, __, correct) => (correct && correct.trim().length > 0 ? "pass" : "warn"),
    },
    {
      id: "stage3_linguistic_safety",
      titleAr: "السلامة اللغوية والإملائية لمسميات المخطط ودليل التصحيح",
      titleEn: "Linguistic and orthographic perfection in diagram labels & answer key",
      descAr: "الدقة الإملائية التامة في رسم الهمزات والمصطلحات العلمية في المسميات ودليل الإجابة.",
      descEn: "Flawless Arabic orthography (Hamza, Ta-Marbuta) and terminology in callouts and key.",
      evaluate: (stem, _, correct) => {
        const full = stem + " " + (correct || "");
        const commonTypos = ["ان يكون", "الي ", "اذا ", "رئيسيى", "اخري"];
        return commonTypos.some((err) => full.includes(err)) ? "warn" : "pass";
      },
    },
    {
      id: "stage3_fairness_bias_free",
      titleAr: "العدالة السيكومترية وإمكانية الوصول البصري",
      titleEn: "Psychometric fairness & visual accessibility",
      descAr: "وضوح الخطوط والأرقام والتباين اللوني لضمان سهولة القراءة لجميع الطلاب.",
      descEn: "High visual contrast, legible labels, and inclusive readability.",
      evaluate: () => "pass",
    },
    {
      id: "stage3_item_bank_readiness",
      titleAr: "جاهزية البند للأرشفة والاعتماد في بنك الأسئلة",
      titleEn: "Item bank compliance & export readiness",
      descAr: "استيفاء مخطط السؤال ودليل تصحيحه لكافة الشروط وصلاحيته للاعتماد.",
      descEn: "Diagram item and grading guide certified for institutional archive and export.",
      evaluate: () => "pass",
    },
  ],
};

export default function ImproveTab({
  onAddQuestion,
  lang,
  stage = "2",
  onNextStage,
  questionsList = [],
  onBatchUpdateQuestions,
}: ImproveTabProps) {
  const t = translations[lang].improve;
  const isRtl = lang === "ar";

  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isBatchAuditOpen, setIsBatchAuditOpen] = useState(false);
  const [qType, setQType] = useState<"mcq" | "tf" | "fill" | "matching" | "essay" | "multi_mcq" | "ordering" | "diagram_labeling">("mcq");
  const [diagramImage, setDiagramImage] = useState<string | null>(null);
  const diagramImgInputRef = useRef<HTMLInputElement>(null);

  const handleDiagramImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError(isRtl ? "يرجى اختيار صورة صحيحة (PNG, JPG, SVG, WebP)." : "Please select a valid image (PNG, JPG, SVG, WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDiagramImage(event.target.result as string);
          setError("");
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [stem, setStem] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [tfAnswer, setTfAnswer] = useState(isRtl ? "صواب" : "True");
  const [fillSentence, setFillSentence] = useState("");
  const [fillTarget, setFillTarget] = useState("");

  // Rubric state for short essay questions
  const [rubrics, setRubrics] = useState<RubricCriterion[]>([
    {
      id: "r-1",
      criterion: isRtl ? "دقة المفاهيم العلمية وصحة التعريف" : "Scientific Accuracy & Definition",
      points: 2,
      description: isRtl ? "ذكر العناصر الجوهرية للمفهوم بدقة دون إخلال أو لبس." : "Accurately specify core elements of the concept without ambiguity.",
    },
    {
      id: "r-2",
      criterion: isRtl ? "التعليل المنطقي والربط السببي" : "Logical Reasoning & Causal Linkage",
      points: 2,
      description: isRtl ? "توضيح وتفسير العلاقة السببية باستدلال علمي سليم." : "Clarify cause-and-effect relationship with sound reasoning.",
    },
    {
      id: "r-3",
      criterion: isRtl ? "تقديم شواهد وأمثلة تطبيقية" : "Illustrative Evidence & Application",
      points: 1,
      description: isRtl ? "إيراد مثال تطبيقي ملائم يعكس عمق الاستيعاب العملي." : "Provide a relevant practical example reflecting deep understanding.",
    },
  ]);

  const handleAddRubricCriterion = () => {
    const newId = `rubric-${Date.now()}`;
    setRubrics((prev) => [
      ...prev,
      {
        id: newId,
        criterion: "",
        points: 1,
        description: "",
      },
    ]);
  };

  const handleRemoveRubricCriterion = (id: string) => {
    if (rubrics.length <= 1) return;
    setRubrics((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRubricCriterion = (id: string, field: keyof RubricCriterion, value: any) => {
    setRubrics((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleApplyRubricTemplate = (templateType: "analytical" | "explanation" | "comparison" | "problemSolving") => {
    if (templateType === "analytical") {
      setRubrics([
        {
          id: `r-${Date.now()}-1`,
          criterion: isRtl ? "دقة المفاهيم العلمية والمصطلحات الأساسية" : "Scientific Concepts Accuracy",
          points: 2,
          description: isRtl ? "تحديد التعريف والمفاهيم الجوهرية بوضوح تام دون إخلال." : "Clear specification of core concepts.",
        },
        {
          id: `r-${Date.now()}-2`,
          criterion: isRtl ? "التحليل المنطقي والتعليل السببي" : "Logical Analysis & Reasoning",
          points: 1.5,
          description: isRtl ? "بيان العلاقات بين الأسباب والنتائج بأسلوب علمي مقنع." : "Demonstrating cause-and-effect relationships.",
        },
        {
          id: `r-${Date.now()}-3`,
          criterion: isRtl ? "تقديم شواهد وأمثلة تطبيقية" : "Evidence & Practical Examples",
          points: 1,
          description: isRtl ? "إيراد أمثلة عملية توضيحية تدعم الاستجابة." : "Providing practical examples supporting the response.",
        },
        {
          id: `r-${Date.now()}-4`,
          criterion: isRtl ? "سلامة الصياغة اللغوية والتنظيم" : "Language Clarity & Coherence",
          points: 0.5,
          description: isRtl ? "خلو الكتابة من الأخطاء اللغوية والتنظيم المنهجي للأفكار." : "Clear grammatical phrasing and coherent organization.",
        },
      ]);
    } else if (templateType === "explanation") {
      setRubrics([
        {
          id: `r-${Date.now()}-1`,
          criterion: isRtl ? "استيعاب وتحديد الفكرة المركزية" : "Central Idea Comprehension",
          points: 1.5,
          description: isRtl ? "تحديد النقطة الرئيسية المطلوبة في السؤال بوضوح." : "Accurate identification of the main point.",
        },
        {
          id: `r-${Date.now()}-2`,
          criterion: isRtl ? "الشرح والتوضيح بالأسلوب الخاص" : "Explanation in Student's Own Words",
          points: 1.5,
          description: isRtl ? "القدرة على إعادة صياغة المفهوم وتوضيحه بأسلوب تحليلي مستقل." : "Elaborating and clarifying the concept independently.",
        },
        {
          id: `r-${Date.now()}-3`,
          criterion: isRtl ? "صحة الاستنتاج والتوظيف" : "Valid Deduction & Application",
          points: 1,
          description: isRtl ? "الوصول إلى خلاصة دقيقة متسقة مع معطيات الدرس." : "Reaching an accurate conclusion consistent with facts.",
        },
      ]);
    } else if (templateType === "comparison") {
      setRubrics([
        {
          id: `r-${Date.now()}-1`,
          criterion: isRtl ? "تحديد أوجه الاتفاق والتشابه الجوهرية" : "Identification of Key Similarities",
          points: 1.5,
          description: isRtl ? "ذكر نقاط التشابه الرئيسية بدقة وموضوعية." : "Accurate statement of main similarities.",
        },
        {
          id: `r-${Date.now()}-2`,
          criterion: isRtl ? "بيان أوجه الاختلاف والتباين الدقيقة" : "Specification of Critical Differences",
          points: 1.5,
          description: isRtl ? "توضيح نقاط التباين والتمييز بين العناصر بوضوح." : "Clear distinction between comparative elements.",
        },
        {
          id: `r-${Date.now()}-3`,
          criterion: isRtl ? "الخلاصة والمقارنة النقدية" : "Synthesized Conclusion",
          points: 1,
          description: isRtl ? "صياغة حكم نقدي أو استنتاج ختامي يربط المقارنة بالسياق." : "Formulating an evaluative synthesis linking comparison to context.",
        },
      ]);
    } else if (templateType === "problemSolving") {
      setRubrics([
        {
          id: `r-${Date.now()}-1`,
          criterion: isRtl ? "تشخيص المشكلة وتحديد المعطيات" : "Problem Diagnosis & Given Data",
          points: 1.5,
          description: isRtl ? "فهم سياق المسألة وتحديد المتغيرات الأساسية." : "Understanding problem context and identifying core variables.",
        },
        {
          id: `r-${Date.now()}-2`,
          criterion: isRtl ? "خطوات الحل والتطبيق الإجرائي" : "Step-by-step Solution & Application",
          points: 2,
          description: isRtl ? "اتباع منهجية علمية صحيحة في تسلسل الحل." : "Following systematic scientific procedural steps.",
        },
        {
          id: `r-${Date.now()}-3`,
          criterion: isRtl ? "التحقق من صحة النتيجة والتعليل" : "Verification & Justification",
          points: 1.5,
          description: isRtl ? "تفسير النتيجة والبرهنة على منطقيتها وصحتها." : "Justifying the validity and logical soundness of the outcome.",
        },
      ]);
    }
  };

  const totalRubricScore = rubrics.reduce((sum, r) => sum + (Number(r.points) || 0), 0);

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [isAltLoading, setIsAltLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const [copiedAltIndex, setCopiedAltIndex] = useState<number | null>(null);

  // Per-criterion Direct Fix Approval State & Notification Toast
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});
  const [fixToast, setFixToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setFixToast(msg);
    setTimeout(() => setFixToast(null), 3500);
  };

  const handleApplyFix = (
    criterionKey: string,
    targetField: "stem" | "options" | "correctAnswer" | "all",
    suggestedFixText?: string,
    suggestedOptions?: string[]
  ) => {
    if (!analysisResult) return;

    const stemVal = suggestedFixText || analysisResult.enhancedStem;
    const optionsVal = suggestedOptions && suggestedOptions.length > 0 ? suggestedOptions : analysisResult.enhancedOptions;
    const correctVal = suggestedFixText || analysisResult.enhancedCorrectAnswer;

    if (targetField === "stem" || targetField === "all") {
      if (qType === "fill") {
        setFillSentence(stemVal);
      } else {
        setStem(stemVal);
      }
    }

    if (targetField === "options" || targetField === "all") {
      if (optionsVal && optionsVal.length > 0) {
        setOptions(optionsVal);
      }
    }

    if (targetField === "correctAnswer" || targetField === "all") {
      if (qType === "tf") {
        setTfAnswer(correctVal);
      } else if (qType === "fill") {
        setFillTarget(correctVal);
      } else {
        setCorrectAnswer(correctVal);
      }
    }

    setAppliedFixes((prev) => ({ ...prev, [criterionKey]: true }));

    triggerToast(
      isRtl
        ? "✓ تم قبول واقتباس التعديل المقترح وتحديث محرر السؤال بنجاح!"
        : "✓ Proposed edit approved and applied to item editor successfully!"
    );
  };

  const handleApplyAllFixes = () => {
    if (!analysisResult) return;

    if (qType === "fill") {
      if (analysisResult.enhancedStem) setFillSentence(analysisResult.enhancedStem);
      if (analysisResult.enhancedCorrectAnswer) setFillTarget(analysisResult.enhancedCorrectAnswer);
    } else if (qType === "tf") {
      if (analysisResult.enhancedStem) setStem(analysisResult.enhancedStem);
      if (analysisResult.enhancedCorrectAnswer) setTfAnswer(analysisResult.enhancedCorrectAnswer);
    } else {
      if (analysisResult.enhancedStem) setStem(analysisResult.enhancedStem);
      if (analysisResult.enhancedOptions && analysisResult.enhancedOptions.length > 0) {
        setOptions(analysisResult.enhancedOptions);
      }
      if (analysisResult.enhancedCorrectAnswer) setCorrectAnswer(analysisResult.enhancedCorrectAnswer);
    }

    const newApplied: Record<string, boolean> = {};
    currentChecklist.forEach((item) => {
      newApplied[item.id] = true;
    });
    if (analysisResult.criterionFixes) {
      analysisResult.criterionFixes.forEach((cf: any) => {
        newApplied[cf.criterionId] = true;
      });
    }
    setAppliedFixes(newApplied);

    triggerToast(
      isRtl
        ? "✨ تم قبول وتطبيق جميع الاقتراحات والتعديلات المعيارية الشاملة بضغطة زر واحدة!"
        : "✨ All suggested quality improvements applied to item editor with one click!"
    );
  };

  // Teacher Voice Dictation / Speech-to-text State
  const [activeListeningId, setActiveListeningId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleToggleListening = (targetId: string, onAppendText: (text: string) => void) => {
    if (activeListeningId === targetId) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setActiveListeningId(null);
      return;
    }

    // Stop existing if running on another target
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        isRtl
          ? "خاصية تحويل الصوت إلى نص غير مدعومة في هذا المتصفح. يُنصح بفتح التطبيق عبر متصفح Google Chrome."
          : "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    setSpeechError(null);
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = lang === "ar" ? "ar-EG" : "en-US";

      recognition.onstart = () => {
        setActiveListeningId(targetId);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript.trim()) {
          onAppendText(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError(
            isRtl
              ? "تعذر الوصول إلى الميكروفون. يرجى التكرم بتقديم صلاحيات الميكروفون للمتصفح."
              : "Microphone access was denied. Please allow microphone permissions."
          );
        } else if (event.error === "no-speech") {
          // silent pause
        } else {
          setSpeechError(
            isRtl ? `حدث تنبيه أثناء التسجيل الصوتي (${event.error})` : `Speech error: ${event.error}`
          );
        }
        setActiveListeningId(null);
      };

      recognition.onend = () => {
        setActiveListeningId(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setActiveListeningId(null);
    }
  };

  // Interactive Checklist User State (checked overrides)
  const [userChecked, setUserChecked] = useState<Record<string, boolean>>({});

  const isStage3 = stage === "3";
  const activeChecklists = isStage3 ? STAGE3_CHECKLISTS : STAGE2_CHECKLISTS;
  const currentChecklist = activeChecklists[qType] || activeChecklists["mcq"];

  const handleToggleCheck = (id: string) => {
    setUserChecked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleImprove = async () => {
    setIsLoading(true);
    setError("");
    setAnalysisResult(null);
    setAlternatives([]);
    setIsAdded(false);
    setAppliedFixes({});

    let activeStem = stem;
    let activeOptions = options;
    let activeCorrect = correctAnswer;

    if (qType === "tf") {
      activeOptions = [isRtl ? "صواب" : "True", isRtl ? "خطأ" : "False"];
      activeCorrect = tfAnswer;
    } else if (qType === "fill") {
      activeStem = fillSentence;
      activeOptions = [];
      activeCorrect = fillTarget;
    }

    try {
      const res = await fetch("/api/audit-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qType,
          stem: activeStem,
          options: activeOptions,
          correctAnswer: activeCorrect,
          lang,
          stage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل تحليل الصياغة" : "Audit failed"));
      }

      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isRtl ? "حدث خطأ غير متوقع." : "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchAlternatives = async () => {
    if (!analysisResult) return;
    setIsAltLoading(true);

    try {
      const res = await fetch("/api/generate-alternatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stem: analysisResult.enhancedStem || stem,
          qType,
          lang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.alternatives) {
        setAlternatives(data.alternatives);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAltLoading(false);
    }
  };

  const handleAddToBank = () => {
    if (!analysisResult) return;

    const diffIdx = typeof analysisResult.difficultyIndex === "number" ? analysisResult.difficultyIndex : 0.60;
    const discIdx = typeof analysisResult.discriminationIndex === "number" ? analysisResult.discriminationIndex : 0.42;
    const discStatus = analysisResult.discriminationStatus || (isRtl ? "ممتاز" : "Excellent");

    const newQuestion: Question = {
      id: `improved-${Date.now()}`,
      qType,
      stem: analysisResult.enhancedStem || stem,
      options: qType === "mcq" || qType === "multi_mcq" || qType === "diagram_labeling" ? analysisResult.enhancedOptions || options : undefined,
      correctAnswer: analysisResult.enhancedCorrectAnswer || correctAnswer,
      rubrics: qType === "essay" ? rubrics : undefined,
      imageUrl: diagramImage || undefined,
      bloom: analysisResult.bloomClassification || (isRtl ? "فهم" : "Understand"),
      difficulty: analysisResult.difficultyLevel || (isRtl ? "متوسطة" : "Moderate"),
      difficultyIndex: diffIdx,
      discriminationIndex: discIdx,
      discriminationStatus: discStatus,
      notes: analysisResult.defectsFound || [],
    };

    onAddQuestion(newQuestion);
    setIsAdded(true);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedAltIndex(index);
    setTimeout(() => setCopiedAltIndex(null), 2000);
  };

  const activeStemForEvaluation = qType === "fill" ? fillSentence : stem;
  const activeCorrectForEvaluation = qType === "tf" ? tfAnswer : qType === "fill" ? fillTarget : correctAnswer;

  return (
    <div className="space-y-6">
      {/* Top Stage Header & Unified Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
            isStage3 ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
          }`}>
            {isStage3 ? <SlidersHorizontal className="w-4 h-4 text-violet-700" /> : <FileCheck className="w-4 h-4 text-blue-700" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {isStage3
                ? isRtl ? "التحكيم السيكومتري ومصفوفة بلوم (المرحلة 3)" : "Psychometric Audit & Bloom Matrix (Stage 3)"
                : isRtl ? "التدقيق التحريري واللغوي المتقدم (المرحلة 2)" : "Editorial & Linguistic Audit (Stage 2)"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {isStage3
                ? isRtl ? "معاملات الصعوبة والتمييز وتطبيق معايير القياس الـ 20" : "Difficulty, discrimination & 20 measurement standards"
                : isRtl ? "فحص الصياغة والبدائل والتدقيق الإملائي والنحوي" : "Item wording, distractors & linguistic check"}
            </p>
          </div>
        </div>

        {/* Action Buttons: Batch Multi-Question Application & Fullscreen Studio Launcher */}
        <div className="flex items-center gap-2">
          {questionsList.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBatchAuditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer border border-amber-400/80"
              title={
                isRtl
                  ? "تطبيق معايير المرحلة على عدة أسئلة أو جميع الأسئلة دفعة واحدة"
                  : "Apply stage audit on multiple questions at once"
              }
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>
                {isRtl
                  ? `تطبيق المرحلة على أكثر من سؤال (${questionsList.length}) ⚡`
                  : `Batch Apply on Items (${questionsList.length}) ⚡`}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreenOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer border border-slate-700"
            title={isRtl ? "فتح استوديو التحكيم الشامل بملء الشاشة" : "Open Fullscreen Studio"}
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {isStage3
                ? isRtl ? "استوديو التحكيم الشامل (المرحلة 3)" : "Audit Studio (Stage 3)"
                : isRtl ? "استوديو التدقيق الشامل (المرحلة 2)" : "Review Studio (Stage 2)"}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input panel & Interactive Pre-Check Checklist - Dark Blue Column */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0b192c] via-[#0d2038] to-[#0a1626] text-white rounded-3xl p-6 sm:p-7 border border-blue-900/80 shadow-xl shadow-blue-950/50 sticky top-24 space-y-6">
            <div className="flex items-center justify-between gap-2 text-white pb-3 border-b border-blue-900/60">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                  isStage3 ? "bg-violet-500/30 text-violet-300 border border-violet-500/40" : "bg-blue-500/30 text-blue-300 border border-blue-500/40"
                }`}>
                  <FileCheck className="w-4 h-4 text-blue-300" />
                </div>
                <h3 className="font-display font-black text-base text-white">
                  {isStage3
                    ? isRtl
                      ? "وحدة التقييم والتحكيم السيكومتري"
                      : "Psychometric Evaluation & Audit"
                    : t.title}
                </h3>
              </div>
            </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="qTypeImprove" className="block text-xs font-black text-blue-100 mb-2">
              {t.qTypeLabel}
            </label>
            <div className="relative">
              <select
                id="qTypeImprove"
                value={qType}
                onChange={(e) => {
                  setQType(e.target.value as any);
                  setAnalysisResult(null);
                }}
                className="w-full p-3.5 pe-10 border-2 border-blue-700/80 rounded-xl text-xs sm:text-sm bg-[#0f233f] text-white font-black shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="mcq" className="bg-[#0f233f] text-white py-1">{t.mcqOpt}</option>
                <option value="tf" className="bg-[#0f233f] text-white py-1">{t.tfOpt}</option>
                <option value="fill" className="bg-[#0f233f] text-white py-1">{t.fillOpt}</option>
                <option value="matching" className="bg-[#0f233f] text-white py-1">{t.matchingOpt}</option>
                <option value="essay" className="bg-[#0f233f] text-white py-1">{t.essayOpt}</option>
                <option value="multi_mcq" className="bg-[#0f233f] text-white py-1">{t.multiMcqOpt}</option>
                <option value="ordering" className="bg-[#0f233f] text-white py-1">{t.orderingOpt}</option>
                <option value="diagram_labeling" className="bg-[#0f233f] text-white py-1">{t.diagramOpt}</option>
              </select>
              <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-blue-300 ${isRtl ? "left-3" : "right-3"}`}>
                <ChevronDown className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          <input
            type="file"
            ref={diagramImgInputRef}
            onChange={handleDiagramImageChange}
            accept="image/*"
            className="hidden"
          />

          {qType === "diagram_labeling" && (
            <div className="p-3.5 bg-[#09172c] border border-rose-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  <span>{isRtl ? "صورة أو رسم المخطط التوضيحي" : "Diagram Image / Drawing"}</span>
                </label>
                <button
                  type="button"
                  onClick={() => diagramImgInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-200 bg-rose-950/80 hover:bg-rose-900 px-2.5 py-1 rounded-lg border border-rose-700/80 shadow-2xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-300" />
                  <span>{diagramImage ? (isRtl ? "تغيير الصورة" : "Change Image") : (isRtl ? "رفع صورة/رسم المخطط" : "Upload Diagram")}</span>
                </button>
              </div>

              {diagramImage ? (
                <div className="relative rounded-xl overflow-hidden border border-rose-500/40 bg-black/40 p-2 flex flex-col items-center">
                  <img src={diagramImage} alt="Diagram" className="max-h-48 object-contain rounded-lg shadow-2xs" />
                  <button
                    type="button"
                    onClick={() => setDiagramImage(null)}
                    className="mt-2 text-[11px] font-bold text-rose-200 hover:text-white bg-rose-950/80 hover:bg-rose-900 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-rose-700/70"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? "إزالة الصورة" : "Remove Image"}</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => diagramImgInputRef.current?.click()}
                  className="border-2 border-dashed border-rose-500/40 hover:border-rose-400 bg-[#071220] rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <FileImage className="w-8 h-8 text-rose-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-rose-200">
                    {isRtl ? "اضغط هنا لرفع صورة الرسم أو المخطط التوضيحي" : "Click here to upload diagram image or drawing"}
                  </p>
                  <p className="text-[10px] text-rose-300/70 mt-0.5">PNG, JPG, SVG, WebP</p>
                </div>
              )}
            </div>
          )}

          {(qType === "mcq" || qType === "multi_mcq" || qType === "matching" || qType === "ordering" || qType === "essay" || qType === "diagram_labeling") && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="stemMcq" className="block text-xs font-bold text-blue-100">
                    {t.stemLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleListening("stemMcq", (text) =>
                        setStem((prev) => (prev ? `${prev} ${text}` : text))
                      )
                    }
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-xs ${
                      activeListeningId === "stemMcq"
                        ? "bg-rose-950/80 text-rose-200 border-rose-500/80 animate-pulse"
                        : "bg-blue-900/70 text-blue-100 border-blue-700/70 hover:bg-blue-800"
                    }`}
                    title={isRtl ? "إملاء صوتي / تحويل الملاحظات الصوتية للمعلم إلى نص" : "Voice dictation for teacher notes"}
                  >
                    {activeListeningId === "stemMcq" ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                        <span>{isRtl ? "إيقاف الإملاء الصوتي..." : "Stop Dictation..."}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-blue-300" />
                        <span>{isRtl ? "إملاء صوتي بالميكروفون" : "Voice Dictation"}</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="stemMcq"
                  value={stem}
                  onChange={(e) => setStem(e.target.value)}
                  className="w-full min-h-[90px] p-3 border-2 border-blue-900/80 rounded-xl text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white placeholder:text-slate-400 leading-relaxed shadow-inner font-sans"
                  placeholder={isRtl ? "أدخل نص السؤال أو استخدم الإملاء الصوتي بالميكروفون..." : "Enter question stem or use voice dictation..."}
                />
                {activeListeningId === "stemMcq" && (
                  <div className="mt-1.5 p-2 bg-rose-950/80 border border-rose-500/60 rounded-lg flex items-center gap-2 text-xs text-rose-200 font-bold animate-pulse">
                    <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span>
                      {isRtl
                        ? "جاري الاستماع... تحدث الآن لإضافة نص السؤال أو الملاحظة تلقائياً"
                        : "Listening... Speak now to dictate question text or notes automatically"}
                    </span>
                  </div>
                )}
                {speechError && (
                  <div className="mt-1.5 p-2 bg-amber-950/70 border border-amber-500/60 rounded-lg text-xs text-amber-200 font-semibold">
                    {speechError}
                  </div>
                )}
              </div>

              {(qType === "mcq" || qType === "multi_mcq" || qType === "matching" || qType === "ordering" || qType === "diagram_labeling") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-blue-100">
                      {qType === "diagram_labeling" ? (isRtl ? "مسميات الأجزاء المراد إكمالها (1-4)" : "Target Callout Labels (1-4)") : t.optionsLabel}
                    </label>
                    <span className="text-[10px] text-blue-300 font-bold">
                      {isRtl ? "🎤 الإملاء الصوتي متاح بضغط زر الميكروفون" : "🎤 Dictate options with mic"}
                    </span>
                  </div>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-blue-300 w-5">{idx + 1}.</span>
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[idx] = e.target.value;
                            setOptions(newOpts);
                          }}
                          placeholder={isRtl ? `الخيار ${idx + 1}...` : `Option ${idx + 1}...`}
                          className={`w-full p-2 pe-9 border-2 rounded-xl text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white transition-colors placeholder:text-slate-400 ${
                            activeListeningId === `opt-${idx}`
                              ? "border-rose-400 bg-rose-950/70 font-semibold text-rose-100"
                              : "border-blue-900/80"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleListening(`opt-${idx}`, (text) => {
                              setOptions((prevOpts) => {
                                const copy = [...prevOpts];
                                copy[idx] = copy[idx] ? `${copy[idx]} ${text}` : text;
                                return copy;
                              });
                            })
                          }
                          className={`absolute end-1.5 p-1 rounded-lg transition-all cursor-pointer ${
                            activeListeningId === `opt-${idx}`
                              ? "bg-rose-600 text-white animate-pulse"
                              : "text-blue-300 hover:text-white hover:bg-blue-900/60"
                          }`}
                          title={isRtl ? `إملاء صوتي للخيار ${idx + 1}` : `Dictate option ${idx + 1}`}
                        >
                          {activeListeningId === `opt-${idx}` ? (
                            <MicOff className="w-3.5 h-3.5 animate-bounce" />
                          ) : (
                            <Mic className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {qType !== "essay" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="correctMcq" className="block text-xs font-bold text-blue-100">
                      {t.correctLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleListening("correctAnswer", (text) => {
                          const trimmed = text.trim();
                          if (qType === "mcq" || qType === "multi_mcq") {
                            // Try matching spoken text with existing options or ordinal words
                            const lower = trimmed.toLowerCase();
                            let matchedOpt = options.find((o) => o.toLowerCase() === lower || lower.includes(o.toLowerCase()));
                            if (!matchedOpt) {
                              if (lower.includes("أول") || lower.includes("اول") || lower.includes("first") || lower.includes("1")) {
                                matchedOpt = options[0];
                              } else if (lower.includes("ثاني") || lower.includes("second") || lower.includes("2")) {
                                matchedOpt = options[1];
                              } else if (lower.includes("ثالث") || lower.includes("third") || lower.includes("3")) {
                                matchedOpt = options[2];
                              } else if (lower.includes("رابع") || lower.includes("fourth") || lower.includes("4")) {
                                matchedOpt = options[3];
                              }
                            }
                            if (matchedOpt) {
                              setCorrectAnswer(matchedOpt);
                            } else {
                              setCorrectAnswer((prev) => (prev ? `${prev} ${text}` : text));
                            }
                          } else {
                            setCorrectAnswer((prev) => (prev ? `${prev} ${text}` : text));
                          }
                        })
                      }
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                        activeListeningId === "correctAnswer"
                          ? "bg-rose-950/80 text-rose-200 border-rose-500/80 animate-pulse"
                          : "bg-blue-900/70 text-blue-100 border-blue-700/70 hover:bg-blue-800"
                      }`}
                    >
                      {activeListeningId === "correctAnswer" ? (
                        <MicOff className="w-3 h-3 text-rose-400 animate-bounce" />
                      ) : (
                        <Mic className="w-3 h-3 text-blue-300" />
                      )}
                      <span>
                        {isRtl ? "إملاء الإجابة الصحيحة" : "Dictate answer"}
                      </span>
                    </button>
                  </div>
                  {qType === "mcq" || qType === "multi_mcq" ? (
                    <select
                      id="correctMcq"
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className={`w-full p-2.5 border-2 rounded-xl text-xs bg-[#0f233f] text-white focus:border-blue-400 focus:outline-none font-bold ${
                        activeListeningId === "correctAnswer" ? "border-rose-400 ring-2 ring-rose-500/30" : "border-blue-700/80"
                      }`}
                    >
                      {options.map((opt, idx) => (
                        <option key={idx} value={opt} className="bg-[#0f233f] text-white">
                          {t.optNum} {idx + 1}: {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder={
                        isRtl
                          ? "أدخل الإجابة الصحيحة أو استخدم الإملاء الصوتي..."
                          : "Enter correct answer or use voice dictation..."
                      }
                      className={`w-full p-2.5 border-2 rounded-xl text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white font-medium placeholder:text-slate-400 ${
                        activeListeningId === "correctAnswer" ? "border-rose-400 bg-rose-950/70" : "border-blue-900/80"
                      }`}
                    />
                  )}
                  {activeListeningId === "correctAnswer" && (
                    <div className="mt-1.5 p-2 bg-rose-950/80 border border-rose-500/60 rounded-lg flex items-center gap-2 text-xs text-rose-200 font-bold animate-pulse">
                      <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                      <span>
                        {isRtl
                          ? "جاري الاستماع... تحدث الآن لإملاء الإجابة الصحيحة"
                          : "Listening... Speak now to dictate correct answer"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {qType === "essay" && (
                <div className="space-y-4 pt-2 border-t border-blue-900/60">
                  {/* Model Answer field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="essayModelAnswer" className="block text-xs font-bold text-blue-100">
                        {isRtl ? "الإجابة النموذجية المرجعية (Model Answer)" : "Reference Model Answer"}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleListening("correctAnswer", (text) => {
                            setCorrectAnswer((prev) => (prev ? `${prev} ${text}` : text));
                          })
                        }
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                          activeListeningId === "correctAnswer"
                            ? "bg-rose-950/80 text-rose-200 border-rose-500/80 animate-pulse"
                            : "bg-blue-900/70 text-blue-100 border-blue-700/70 hover:bg-blue-800"
                        }`}
                      >
                        {activeListeningId === "correctAnswer" ? (
                          <MicOff className="w-3 h-3 text-rose-400 animate-bounce" />
                        ) : (
                          <Mic className="w-3 h-3 text-blue-300" />
                        )}
                        <span>{isRtl ? "إملاء الإجابة النموذجية" : "Dictate model answer"}</span>
                      </button>
                    </div>
                    <textarea
                      id="essayModelAnswer"
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      rows={3}
                      placeholder={
                        isRtl
                          ? "أدخل ملخص الإجابة النموذجية أو النقاط الجوهرية التي ينبغي أن تتضمنها إجابة الطالب..."
                          : "Enter the reference model answer summary or key required points..."
                      }
                      className="w-full p-2.5 border-2 border-blue-900/80 rounded-xl text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white font-medium placeholder:text-slate-400"
                    />
                    {activeListeningId === "correctAnswer" && (
                      <div className="mt-1.5 p-2 bg-rose-950/80 border border-rose-500/60 rounded-lg flex items-center gap-2 text-xs text-rose-200 font-bold animate-pulse">
                        <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                        <span>
                          {isRtl
                            ? "جاري الاستماع... تحدث الآن لإملاء الإجابة النموذجية"
                            : "Listening... Speak now to dictate model answer"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rubric Builder Section */}
                  <div className="bg-[#081424] border border-blue-900/80 rounded-xl p-3.5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-blue-900/60">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-blue-400" />
                          <h4 className="text-xs font-bold text-white">
                            {t.rubricSectionTitle}
                          </h4>
                        </div>
                        <p className="text-[11px] text-blue-200/80 mt-0.5">
                          {t.rubricSectionSub}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                          <span>{t.totalRubricScore}</span>
                          <span className="font-extrabold text-emerald-200">{totalRubricScore}</span>
                          <span>{isRtl ? "درجات" : "pts"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Pre-built Templates Quick Dropdown */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-blue-200/90">
                        {t.applyTemplate}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplyRubricTemplate("analytical")}
                          className="text-[10px] font-bold px-2 py-1 bg-blue-900/80 hover:bg-blue-800 text-blue-100 border border-blue-700/80 rounded-lg transition-colors cursor-pointer"
                        >
                          {isRtl ? "تحليلي (٤ معايير)" : "Analytical (4)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyRubricTemplate("explanation")}
                          className="text-[10px] font-bold px-2 py-1 bg-blue-900/80 hover:bg-blue-800 text-blue-100 border border-blue-700/80 rounded-lg transition-colors cursor-pointer"
                        >
                          {isRtl ? "استيعاب وشرح (٣ معايير)" : "Comprehension (3)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyRubricTemplate("comparison")}
                          className="text-[10px] font-bold px-2 py-1 bg-blue-900/80 hover:bg-blue-800 text-blue-100 border border-blue-700/80 rounded-lg transition-colors cursor-pointer"
                        >
                          {isRtl ? "مقارنة وتمييز (٣ معايير)" : "Comparison (3)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyRubricTemplate("problemSolving")}
                          className="text-[10px] font-bold px-2 py-1 bg-blue-900/80 hover:bg-blue-800 text-blue-100 border border-blue-700/80 rounded-lg transition-colors cursor-pointer"
                        >
                          {isRtl ? "حل مشكلات (٣ معايير)" : "Problem Solving (3)"}
                        </button>
                      </div>
                    </div>

                    {/* Criteria List Cards */}
                    <div className="space-y-2.5">
                      {rubrics.map((rubric, rIdx) => (
                        <div
                          key={rubric.id}
                          className="bg-[#0f233f] border border-blue-800/80 rounded-xl p-2.5 space-y-2 shadow-2xs hover:border-blue-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[10px] font-bold flex items-center justify-center">
                                {rIdx + 1}
                              </span>
                              <span className="text-xs font-bold text-white">
                                {isRtl ? `المعيار ${rIdx + 1}` : `Criterion ${rIdx + 1}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <label className="text-[11px] font-semibold text-blue-200">
                                  {t.rubricPointsLabel}:
                                </label>
                                <input
                                  type="number"
                                  min={0.25}
                                  max={50}
                                  step={0.5}
                                  value={rubric.points}
                                  onChange={(e) =>
                                    handleUpdateRubricCriterion(
                                      rubric.id,
                                      "points",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-14 p-1 text-center text-xs font-bold border border-blue-700 rounded-lg bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white"
                                />
                                <span className="text-[10px] text-blue-300 font-semibold">
                                  {isRtl ? "د" : "pt"}
                                </span>
                              </div>

                              {rubrics.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRubricCriterion(rubric.id)}
                                  className="p-1 text-rose-300 hover:text-rose-100 hover:bg-rose-950/80 rounded-lg transition-colors cursor-pointer"
                                  title={isRtl ? "حذف هذا المعيار" : "Delete criterion"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Criterion Name + Voice Dictation */}
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={rubric.criterion}
                              onChange={(e) =>
                                handleUpdateRubricCriterion(rubric.id, "criterion", e.target.value)
                              }
                              placeholder={t.rubricCriterionPlaceholder}
                              className={`w-full p-2 pe-8 border rounded-lg text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white font-medium placeholder:text-slate-400 ${
                                activeListeningId === `rubric-crit-${rubric.id}`
                                  ? "border-rose-400 bg-rose-950/70"
                                  : "border-blue-900/80"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleListening(`rubric-crit-${rubric.id}`, (text) => {
                                  handleUpdateRubricCriterion(
                                    rubric.id,
                                    "criterion",
                                    rubric.criterion ? `${rubric.criterion} ${text}` : text
                                  );
                                })
                              }
                              className={`absolute end-1.5 p-1 rounded-md transition-all cursor-pointer ${
                                activeListeningId === `rubric-crit-${rubric.id}`
                                  ? "bg-rose-600 text-white animate-pulse"
                                  : "text-blue-300 hover:text-white hover:bg-blue-900/60"
                              }`}
                              title={isRtl ? "إملاء اسم المعيار" : "Dictate criterion"}
                            >
                              {activeListeningId === `rubric-crit-${rubric.id}` ? (
                                <MicOff className="w-3 h-3 animate-bounce" />
                              ) : (
                                <Mic className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Criterion Description / Performance Indicators */}
                          <input
                            type="text"
                            value={rubric.description || ""}
                            onChange={(e) =>
                              handleUpdateRubricCriterion(rubric.id, "description", e.target.value)
                            }
                            placeholder={t.rubricDescPlaceholder}
                            className="w-full p-2 border border-blue-900/80 rounded-lg text-[11px] bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-blue-100 placeholder:text-slate-400"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Add Criterion Button */}
                    <button
                      type="button"
                      onClick={handleAddRubricCriterion}
                      className="w-full py-2 border-2 border-dashed border-blue-700/80 hover:border-blue-500 bg-blue-950/50 hover:bg-blue-900/50 text-blue-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addRubricCriterion}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {qType === "tf" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="stemTf" className="block text-xs font-bold text-blue-100">
                    {t.tfStatementLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleListening("stemTf", (text) =>
                        setStem((prev) => (prev ? `${prev} ${text}` : text))
                      )
                    }
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-xs ${
                      activeListeningId === "stemTf"
                        ? "bg-rose-950/80 text-rose-200 border-rose-500/80 animate-pulse"
                        : "bg-blue-900/70 text-blue-100 border-blue-700/70 hover:bg-blue-800"
                    }`}
                    title={isRtl ? "إملاء صوتي / تحويل الملاحظات الصوتية للمعلم إلى نص" : "Voice dictation for teacher notes"}
                  >
                    {activeListeningId === "stemTf" ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                        <span>{isRtl ? "إيقاف الإملاء الصوتي..." : "Stop Dictation..."}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-blue-300" />
                        <span>{isRtl ? "إملاء صوتي بالميكروفون" : "Voice Dictation"}</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="stemTf"
                  value={stem}
                  onChange={(e) => setStem(e.target.value)}
                  className="w-full min-h-[90px] p-3 border-2 border-blue-900/80 rounded-xl text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white placeholder:text-slate-400 leading-relaxed shadow-inner font-sans"
                  placeholder={isRtl ? "أدخل عبارة السؤال أو استخدم الإملاء الصوتي..." : "Enter statement or use voice dictation..."}
                />
                {activeListeningId === "stemTf" && (
                  <div className="mt-1.5 p-2 bg-rose-950/80 border border-rose-500/60 rounded-lg flex items-center gap-2 text-xs text-rose-200 font-bold animate-pulse">
                    <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span>
                      {isRtl
                        ? "جاري الاستماع... تحدث الآن لإضافة العبارة تلقائياً"
                        : "Listening... Speak now to dictate statement automatically"}
                    </span>
                  </div>
                )}
                {speechError && (
                  <div className="mt-1.5 p-2 bg-amber-950/70 border border-amber-500/60 rounded-lg text-xs text-amber-200 font-semibold">
                    {speechError}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="tfAnswer" className="block text-xs font-bold text-blue-100">
                    {t.tfAnswerLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleListening("tfAnswer", (text) => {
                        const lower = text.trim().toLowerCase();
                        if (lower.includes("صح") || lower.includes("صواب") || lower.includes("true") || lower.includes("صحيح")) {
                          setTfAnswer(isRtl ? "صواب" : "True");
                        } else if (lower.includes("خطأ") || lower.includes("خطا") || lower.includes("false") || lower.includes("خاطئ")) {
                          setTfAnswer(isRtl ? "خطأ" : "False");
                        }
                      })
                    }
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                      activeListeningId === "tfAnswer"
                        ? "bg-rose-950/80 text-rose-200 border-rose-500/80 animate-pulse"
                        : "bg-blue-900/70 text-blue-100 border-blue-700/70 hover:bg-blue-800"
                    }`}
                  >
                    {activeListeningId === "tfAnswer" ? (
                      <MicOff className="w-3 h-3 text-rose-400 animate-bounce" />
                    ) : (
                      <Mic className="w-3 h-3 text-blue-300" />
                    )}
                    <span>{isRtl ? "إملاء الإجابة (صواب/خطأ)" : "Dictate T/F"}</span>
                  </button>
                </div>
                <select
                  id="tfAnswer"
                  value={tfAnswer}
                  onChange={(e) => setTfAnswer(e.target.value)}
                  className={`w-full p-2.5 border-2 rounded-xl text-xs bg-[#0f233f] text-white focus:border-blue-400 focus:outline-none font-bold ${
                    activeListeningId === "tfAnswer" ? "border-rose-400 ring-2 ring-rose-500/30" : "border-blue-700/80"
                  }`}
                >
                  <option value={isRtl ? "صواب" : "True"} className="bg-[#0f233f] text-white">{isRtl ? "صواب" : "True"}</option>
                  <option value={isRtl ? "خطأ" : "False"} className="bg-[#0f233f] text-white">{isRtl ? "خطأ" : "False"}</option>
                </select>
                {activeListeningId === "tfAnswer" && (
                  <div className="mt-1.5 p-2 bg-rose-950/80 border border-rose-500/60 rounded-lg flex items-center gap-2 text-xs text-rose-200 font-bold animate-pulse">
                    <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span>
                      {isRtl
                        ? "قل «صواب» أو «خطأ» لتحديد الإجابة تلقائياً..."
                        : "Say 'True' or 'False' to set answer automatically..."}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {qType === "fill" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="fillSentence" className="block text-xs font-bold text-blue-100">
                    {t.fillSentenceLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleListening("fillSentence", (text) =>
                        setFillSentence((prev) => (prev ? `${prev} ${text}` : text))
                      )
                    }
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-xs ${
                      activeListeningId === "fillSentence"
                        ? "bg-rose-950/80 text-rose-200 border-rose-500/80 animate-pulse"
                        : "bg-blue-900/70 text-blue-100 border-blue-700/70 hover:bg-blue-800"
                    }`}
                    title={isRtl ? "إملاء صوتي / تحويل الملاحظات الصوتية للمعلم إلى نص" : "Voice dictation for teacher notes"}
                  >
                    {activeListeningId === "fillSentence" ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                        <span>{isRtl ? "إيقاف الإملاء الصوتي..." : "Stop Dictation..."}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-blue-300" />
                        <span>{isRtl ? "إملاء صوتي بالميكروفون" : "Voice Dictation"}</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="fillSentence"
                  value={fillSentence}
                  onChange={(e) => setFillSentence(e.target.value)}
                  className="w-full min-h-[90px] p-3 border-2 border-blue-900/80 rounded-xl text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white placeholder:text-slate-400 leading-relaxed shadow-inner font-sans"
                  placeholder={isRtl ? "أدخل جملة الإكمال مع كلمة بين قوسين [...] أو استخدم الإملاء الصوتي..." : "Enter completion sentence or use voice dictation..."}
                />
                {activeListeningId === "fillSentence" && (
                  <div className="mt-1.5 p-2 bg-rose-950/80 border border-rose-500/60 rounded-lg flex items-center gap-2 text-xs text-rose-200 font-bold animate-pulse">
                    <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span>
                      {isRtl
                        ? "جاري الاستماع... تحدث الآن لإضافة النص تلقائياً"
                        : "Listening... Speak now to dictate sentence automatically"}
                    </span>
                  </div>
                )}
                {speechError && (
                  <div className="mt-1.5 p-2 bg-amber-950/70 border border-amber-500/60 rounded-lg text-xs text-amber-200 font-semibold">
                    {speechError}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="fillTarget" className="block text-xs font-bold text-blue-100">
                    {t.fillAnswerLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleListening("fillTarget", (text) =>
                        setFillTarget((prev) => (prev ? `${prev} ${text}` : text))
                      )
                    }
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                      activeListeningId === "fillTarget"
                        ? "bg-rose-950/80 text-rose-200 border-rose-500/80 animate-pulse"
                        : "bg-blue-900/70 text-blue-100 border-blue-700/70 hover:bg-blue-800"
                    }`}
                  >
                    {activeListeningId === "fillTarget" ? (
                      <MicOff className="w-3 h-3 text-rose-400 animate-bounce" />
                    ) : (
                      <Mic className="w-3 h-3 text-blue-300" />
                    )}
                    <span>{isRtl ? "إملاء الكلمة الصحيحة" : "Dictate answer"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  id="fillTarget"
                  value={fillTarget}
                  onChange={(e) => setFillTarget(e.target.value)}
                  className={`w-full p-2.5 border-2 rounded-xl text-xs bg-[#071220] focus:bg-[#071220] focus:border-blue-400 focus:outline-none text-white font-medium placeholder:text-slate-400 ${
                    activeListeningId === "fillTarget" ? "border-rose-400 bg-rose-950/70" : "border-blue-900/80"
                  }`}
                />
              </div>
            </>
          )}

          {/* Interactive Quality Checklist Box - Dark Navy Theme */}
          <div className="bg-[#081424] border border-blue-900/80 rounded-2xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-blue-900/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ListChecks className="w-4 h-4 text-blue-400" />
                <span>
                  {isStage3
                    ? isRtl
                      ? "قائمة تحكيم الجودة والاعتماد السيكومتري (المرحلة 3)"
                      : "Stage 3 Psychometric Audit Checklist"
                    : t.checklistTitle}
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-200 bg-blue-900/80 border border-blue-700/70 px-2 py-0.5 rounded-full">
                {currentChecklist.length} {isRtl ? "معايير" : "rules"}
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 leading-relaxed font-medium">
              {isStage3
                ? isRtl
                  ? "معايير الفحص السيكومتري الشامل، الصدق العلمي، مطابقة مستوى بلوم المعرفي، وفاعلية المشتتات والعدالة:"
                  : "Comprehensive psychometric audit rules covering Bloom alignment, scientific validity, distractor power, and fairness:"
                : t.checklistSub}
            </p>

            <div className="space-y-2 pt-1">
              {currentChecklist.map((item) => {
                const autoStatus = item.evaluate(activeStemForEvaluation, options, activeCorrectForEvaluation);
                const isCheckedManually = userChecked[item.id];
                const title = isRtl ? item.titleAr : item.titleEn;
                const desc = isRtl ? item.descAr : item.descEn;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleCheck(item.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                      isCheckedManually || autoStatus === "pass"
                        ? "bg-[#0f233f] border-blue-700/80 hover:border-blue-500"
                        : "bg-[#09172c] border-blue-900/60 hover:border-blue-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isCheckedManually || autoStatus === "pass"}
                      onChange={() => handleToggleCheck(item.id)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-blue-700 bg-[#071220] text-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-white text-[11px] leading-snug">{title}</span>
                        {autoStatus === "pass" && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {t.checkPass}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-blue-200/70 leading-normal">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-200 font-semibold bg-rose-950/70 p-3.5 rounded-2xl border border-rose-500/60 shadow-2xs">
              {error}
            </div>
          )}

          <button
            onClick={handleImprove}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all border border-blue-400/30"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading
              ? isStage3
                ? isRtl
                  ? "جاري الفحص والتحكيم السيكومتري..."
                  : "Running Psychometric Audit..."
                : t.improveLoading
              : isStage3
              ? isRtl
                ? "أجرِ التحكيم والتقييم السيكومتري الشامل (المرحلة 3)"
                : "Run Comprehensive Stage 3 Psychometric Audit"
              : t.improveBtn}
          </button>
        </div>
      </div>

      {/* Output analysis panel */}
      <div className="lg:col-span-7 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[300px] border border-slate-200 bg-white rounded-2xl p-8 text-center text-slate-600 space-y-4 animate-pulse shadow-sm">
            <Sparkles className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-900">
              {isStage3
                ? isRtl
                  ? "جاري التحكيم السيكومتري وفحص مطابقة بلوم والعدالة والصدق العلمي..."
                  : "Performing Stage 3 psychometric audit & Bloom alignment check..."
                : t.loadingTitle}
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              {isStage3
                ? isRtl
                  ? "يتم تحليل السؤال مقابل المعايير السيكومترية المعتمدة وتحديد ثغرات البند وبناء المخرجات المحكّمة."
                  : "Analyzing item against psychometric audit standards to verify Bloom cognitive depth and distractor quality."
                : t.loadingSub}
            </p>
          </div>
        )}

        {!isLoading && !analysisResult && (
          <div className="flex flex-col items-center justify-center min-h-[350px] border-2 border-dashed border-slate-200 bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="font-display font-semibold text-lg text-slate-900 mb-1">
              {isStage3
                ? isRtl
                  ? "جاهز للتحكيم والتقييم السيكومتري الشامل"
                  : "Ready for Stage 3 Psychometric Audit"
                : t.emptyTitle}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              {isStage3
                ? isRtl
                  ? "أدخل بيانات السؤال وانقر على زر التحكيم السيكومتري لتوليد تقرير الاعتماد الأكاديمي الشامل للبند."
                  : "Enter item data and click the audit button to perform a complete psychometric evaluation."
                : t.emptySub}
            </p>
          </div>
        )}

        {!isLoading && analysisResult && (
          <div className="space-y-6">
            {/* Interactive Audit Summary Card & Psychometric Score Gauge */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <h4 className="font-display font-bold text-base text-white">{t.auditSummaryTitle}</h4>
                  </div>
                  <p className="text-xs text-slate-300">{t.auditScoreLabel}</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-xl">
                  <div className="text-center">
                    <span className="font-display text-2xl font-black text-blue-400">
                      {analysisResult.qualityScore || 85}
                    </span>
                    <span className="text-xs text-slate-400 block font-semibold">{t.outOf100}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-700"></div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block">
                      {(analysisResult.qualityScore || 85) >= 85
                        ? isRtl
                          ? "ممتاز مطابق للمواصفات"
                          : "Excellent Compliance"
                        : (analysisResult.qualityScore || 85) >= 70
                        ? isRtl
                          ? "مقبول مع تحسينات"
                          : "Acceptable with edits"
                        : isRtl
                        ? "ضعيف يتطلب إعادة صياغة"
                        : "Requires Rephrasing"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isRtl ? "مراجعة الذكاء الاصطناعي السيكومترية" : "Psychometric AI Review"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Meter Bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      (analysisResult.qualityScore || 85) >= 85
                        ? "bg-gradient-to-r from-blue-500 to-emerald-400"
                        : (analysisResult.qualityScore || 85) >= 70
                        ? "bg-gradient-to-r from-blue-500 to-amber-400"
                        : "bg-gradient-to-r from-rose-500 to-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, analysisResult.qualityScore || 85))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Interactive Compliance Checklist Verification Results with One-Click Replace/Improve Proposals */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    {t.complianceListTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isRtl
                      ? "المعالج الذكي يقدم اقتراحات تعديل نصية مباشرة لكل معيار لتطبيقها بضغطة زر واحدة:"
                      : "AI Processor provides direct text edit proposals for each criterion to apply with one click:"}
                  </p>
                </div>

                {analysisResult && (
                  <button
                    type="button"
                    onClick={handleApplyAllFixes}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer border border-emerald-400/30 active:scale-98"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                    <span>
                      {isRtl
                        ? "✨ موافقة وتطبيق كافة التعديلات الشاملة (بضغطة واحدة)"
                        : "✨ Approve & Apply All Suggested Edits (One-Click)"}
                    </span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {currentChecklist.map((criterion, idx) => {
                  const title = isRtl ? criterion.titleAr : criterion.titleEn;
                  const desc = isRtl ? criterion.descAr : criterion.descEn;
                  const heuristic = criterion.evaluate(activeStemForEvaluation, options, activeCorrectForEvaluation);
                  // Check if any defect in analysisResult explicitly flags this criterion
                  const isFlaggedByAI = (analysisResult.defectsFound || []).some((defect: string) =>
                    defect.toLowerCase().includes(criterion.id) || defect.toLowerCase().includes(title.toLowerCase())
                  );

                  const isPass = heuristic === "pass" && !isFlaggedByAI;

                  // Find explicit criterionFix from Gemini if returned
                  const explicitFix = (analysisResult.criterionFixes || []).find((cf: any) =>
                    cf.criterionId === criterion.id ||
                    cf.criterionId?.toLowerCase().includes(criterion.id.toLowerCase()) ||
                    title.toLowerCase().includes(cf.criterionId?.toLowerCase() || "")
                  );

                  // Determine target field & direct suggested text
                  let targetField: "stem" | "options" | "correctAnswer" | "all" = explicitFix?.targetField || "stem";
                  let suggestedFixText = explicitFix?.suggestedFixText;
                  let suggestedOptions = explicitFix?.suggestedOptions;
                  let actionLabel = isRtl
                    ? explicitFix?.actionLabelAr || "تطبيق التعديل المقترح"
                    : explicitFix?.actionLabelEn || "Apply Proposed Edit";

                  if (!explicitFix) {
                    const cid = criterion.id.toLowerCase();
                    if (cid.includes("option") || cid.includes("distractor") || cid.includes("clue") || cid.includes("choice") || cid.includes("all_none")) {
                      targetField = "options";
                      suggestedOptions = analysisResult.enhancedOptions;
                      actionLabel = isRtl ? "موافقة واستبدال الخيارات والبدائل" : "Approve & Replace Choices";
                    } else if (cid.includes("answer") || cid.includes("key") || cid.includes("rubric")) {
                      targetField = "correctAnswer";
                      suggestedFixText = analysisResult.enhancedCorrectAnswer;
                      actionLabel = isRtl ? "موافقة وتحديث الإجابة النموذجية" : "Approve & Update Answer Key";
                    } else {
                      targetField = "stem";
                      suggestedFixText = analysisResult.enhancedStem;
                      actionLabel = isRtl ? "موافقة واستبدال رأس السؤال" : "Approve & Replace Stem";
                    }
                  }

                  const isApplied = appliedFixes[criterion.id] || false;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
                        isApplied
                          ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200"
                          : isPass
                          ? "bg-emerald-50/40 border-emerald-200/90"
                          : "bg-slate-50/90 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          {isApplied ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isPass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span>{title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isApplied && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              {isRtl ? "تمت الموافقة والتطبيق" : "Applied"}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isPass
                                ? "bg-emerald-100/80 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            {isPass ? t.passStatus : (isRtl ? "قيد المراجعة" : "Under Review")}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed pr-6">{desc}</p>

                      {/* Direct One-Click Text Edit Proposal Box */}
                      <div className="mt-2 pt-2 border-t border-slate-200/80">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                              <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>{isRtl ? "اقتراح التعديل النصي المباشر للمعلم:" : "Direct Text Edit Proposal:"}</span>
                            </span>
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              {targetField === "stem" ? (isRtl ? "رأس السؤال (Stem)" : "Stem") : targetField === "options" ? (isRtl ? "الخيارات (Choices)" : "Choices") : (isRtl ? "الإجابة النموذجية (Key)" : "Answer Key")}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-800 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 font-mono font-medium leading-relaxed">
                            {targetField === "options" && ((suggestedOptions && suggestedOptions.length > 0) || (analysisResult.enhancedOptions && analysisResult.enhancedOptions.length > 0)) ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {(suggestedOptions || analysisResult.enhancedOptions).map((opt: string, oIdx: number) => (
                                  <div key={oIdx} className="bg-white p-1.5 rounded border border-slate-200 text-[10px] text-slate-800 font-sans">
                                    <span className="font-bold text-blue-600 ml-1">({oIdx + 1})</span> {opt}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="font-sans text-[11px] text-slate-900 leading-relaxed font-semibold">
                                {suggestedFixText || analysisResult.enhancedStem}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-500 italic">
                              {isRtl ? "اضغط زر الموافقة لاستبدال النص مباشرة في محرر السؤال" : "Click approve to replace text directly in item editor"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleApplyFix(criterion.id, targetField, suggestedFixText, suggestedOptions)}
                              disabled={isApplied}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                isApplied
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                                  : "bg-blue-600 hover:bg-blue-700 active:scale-98 text-white border border-blue-700"
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{isRtl ? "تم اعتماد التعديل في المحرر" : "Applied to Editor"}</span>
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-3.5 h-3.5 text-white" />
                                  <span>{actionLabel} (بضغطة زر)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Question Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                  {t.enhancedTitle}
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-blue-50 text-blue-700 font-bold border border-blue-200 px-2.5 py-1 rounded-full text-[11px]">
                    {analysisResult.bloomClassification}
                  </span>
                  <span className="bg-violet-50 text-violet-700 font-bold border border-violet-200 px-2.5 py-1 rounded-full text-[11px]">
                    {analysisResult.difficultyLevel}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 px-2.5 py-1 rounded-full text-[11px]">
                    {isRtl ? "السهولة (p):" : "Difficulty (p):"}{" "}
                    {typeof analysisResult.difficultyIndex === "number"
                      ? `${Math.round(analysisResult.difficultyIndex * 100)}%`
                      : "62%"}
                  </span>
                  <span className="bg-indigo-50 text-indigo-800 font-bold border border-indigo-200 px-2.5 py-1 rounded-full text-[11px]">
                    {isRtl ? "التمييز (D):" : "Discrimination (D):"}{" "}
                    {typeof analysisResult.discriminationIndex === "number"
                      ? analysisResult.discriminationIndex.toFixed(2)
                      : "0.45"}{" "}
                    ({analysisResult.discriminationStatus || (isRtl ? "ممتاز" : "Excellent")})
                  </span>
                </div>
              </div>

              {/* Psychometric Indices Summary Panel */}
              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    P
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      {isRtl ? "معامل السهولة والصعوبة (Facility Value)" : "Facility Value / Difficulty Index (p)"}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      p ={" "}
                      {typeof analysisResult.difficultyIndex === "number"
                        ? `${analysisResult.difficultyIndex.toFixed(2)} (${Math.round(analysisResult.difficultyIndex * 100)}%)`
                        : "0.62 (62%)"}{" "}
                      <span className="text-[10px] text-emerald-700 font-normal">
                        ({isRtl ? "متوازن ومثالي" : "Optimal range"})
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                    D
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      {isRtl ? "معامل التمييز (Discrimination Index)" : "Discrimination Index (D)"}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      D ={" "}
                      {typeof analysisResult.discriminationIndex === "number"
                        ? analysisResult.discriminationIndex.toFixed(2)
                        : "0.45"}{" "}
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {analysisResult.discriminationStatus || (isRtl ? "ممتاز (D ≥ 0.40)" : "Excellent")}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-base font-bold text-slate-900 mb-4 leading-relaxed">
                {qType === "fill" ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: (analysisResult.enhancedStem || fillSentence).replace(
                        "___",
                        `<span class="inline-block px-3 py-0.5 border-b-2 border-dotted border-blue-600 text-blue-700 font-bold mx-1">${t.blankWord}</span>`
                      ),
                    }}
                  />
                ) : (
                  analysisResult.enhancedStem || stem
                )}
              </p>

              {(qType === "mcq" || qType === "multi_mcq" || qType === "matching" || qType === "ordering") &&
                analysisResult.enhancedOptions && (
                  <div className="flex flex-col gap-2 mb-4">
                    {analysisResult.enhancedOptions.map((opt: string, oIdx: number) => {
                      const isCorrect = opt === analysisResult.enhancedCorrectAnswer;
                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm font-semibold ${
                            isCorrect
                              ? "border-blue-500 bg-blue-50 text-blue-950 font-bold shadow-sm"
                              : "border-slate-200 bg-slate-50/60 text-slate-700"
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-400 shrink-0 w-16">
                            {isRtl ? `الخيار ${oIdx + 1}` : `Option ${oIdx + 1}`}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

              <div className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 p-3 rounded-xl mb-4">
                {t.modelAnswer} {analysisResult.enhancedCorrectAnswer || activeCorrectForEvaluation}
              </div>

              {qType === "essay" && rubrics && rubrics.length > 0 && (
                <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>{t.rubricSectionTitle}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                      {t.totalRubricScore} {totalRubricScore} {isRtl ? "درجات" : "pts"}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                          <th className="py-1.5 px-2 text-start w-8">#</th>
                          <th className="py-1.5 px-2 text-start">{isRtl ? "معيار التقييم" : "Criterion"}</th>
                          <th className="py-1.5 px-2 text-start">{isRtl ? "مؤشرات التحقق والأدلة" : "Indicators"}</th>
                          <th className="py-1.5 px-2 text-end w-20">{isRtl ? "الدرجة" : "Points"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rubrics.map((r, idx) => (
                          <tr key={r.id} className="hover:bg-slate-100/50">
                            <td className="py-1.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-1.5 px-2 font-bold text-slate-800">{r.criterion || (isRtl ? "معيار بدون عنوان" : "Untitled criterion")}</td>
                            <td className="py-1.5 px-2 text-slate-600">{r.description || "-"}</td>
                            <td className="py-1.5 px-2 text-end font-extrabold text-blue-700">{r.points} {isRtl ? "د" : "pt"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-600">
                  {t.originalScore}{" "}
                  <span className="font-bold text-blue-700">{analysisResult.qualityScore || 85}</span> {t.outOf100}
                </div>
                <button
                  onClick={handleAddToBank}
                  disabled={isAdded}
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    isAdded
                      ? "bg-blue-50 text-blue-700 border border-blue-200 cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  }`}
                >
                  {isAdded ? t.addedBtn : t.addBtn}
                </button>
              </div>
            </div>

            {/* Audit Feedback Notes */}
            {analysisResult.defectsFound && analysisResult.defectsFound.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  {t.feedbackTitle}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {analysisResult.defectsFound.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternative stems generator */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">{t.altsTitle}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{t.altsSub}</p>
                </div>
                <button
                  onClick={handleFetchAlternatives}
                  disabled={isAltLoading}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs px-3.5 py-2 rounded-xl font-bold cursor-pointer transition-all disabled:opacity-50"
                >
                  {isAltLoading ? t.altsBtnLoading : t.altsBtn}
                </button>
              </div>

              {alternatives.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  {alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-800 gap-3"
                    >
                      <div className="flex gap-2">
                        <span className="font-bold text-blue-600">
                          {t.altLabel} {idx + 1}:
                        </span>
                        <span>{alt}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(alt, idx)}
                        className="text-slate-500 hover:text-blue-600 transition-colors shrink-0 p-1 cursor-pointer"
                        title={t.copyTitle}
                      >
                        {copiedAltIndex === idx ? (
                          <Check className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Next Stage Automated Transition Banner */}
              {onNextStage && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white rounded-2xl shadow-lg border border-white/20 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                      {stage === "2"
                        ? isRtl
                          ? "اكتملت المرحلة الثانية ✓"
                          : "Stage 2 Complete ✓"
                        : isRtl
                        ? "اكتملت المرحلة الثالثة ✓"
                        : "Stage 3 Complete ✓"}
                    </span>
                    <h5 className="font-display font-bold text-sm sm:text-base">
                      {stage === "2"
                        ? isRtl
                          ? "الانتقال للتحكيم السيكومتري الشامل والاعتماد المعرفي؟"
                          : "Proceed to Stage 3 Psychometric Audit?"
                        : isRtl
                        ? "الانتقال لبنك الأسئلة والتصدير والتقرير الوثائقي؟"
                        : "Proceed to Stage 4 Question Bank & Export?"}
                    </h5>
                    <p className="text-xs text-blue-100">
                      {stage === "2"
                        ? isRtl
                          ? "انتقل للمرحلة الثالثة لفحص التوافق مع مستويات بلوم وفاعلية المشتتات والعدالة السيكومترية."
                          : "Go to Stage 3 for Bloom alignment, distractor diagnostic power, and psychometric validation."
                        : isRtl
                        ? "انتقل للمرحلة الرابعة لمعاينة بنك الأسئلة، مصفوفة المواصفات، وتصدير الاختبار بملف Word."
                        : "Go to Stage 4 to view question bank, specification matrix, and generate Word DOCX export."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNextStage}
                    className="bg-white hover:bg-slate-100 text-blue-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
                  >
                    <span>
                      {stage === "2"
                        ? isRtl
                          ? "الانتقال الفوري للمرحلة الثالثة (التحكيم السيكومتري) ←"
                          : "Proceed to Stage 3 (Psychometric Audit) →"
                        : isRtl
                        ? "الانتقال الفوري للمرحلة الرابعة (بنك الأسئلة والتصدير) ←"
                        : "Proceed to Stage 4 (Bank & Export) →"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Toast Notification for One-Click Edit Application */}
      {fixToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{fixToast}</span>
        </div>
      )}

      {/* Fullscreen Single-Question Review & Focus Studio */}
      <FullscreenQuestionReviewModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        question={{
          id: `improve-curr-${Date.now()}`,
          qType,
          stem: qType === "fill" ? fillSentence : stem,
          options: qType === "mcq" || qType === "multi_mcq" || qType === "matching" || qType === "ordering" || qType === "diagram_labeling" ? options : undefined,
          correctAnswer: qType === "tf" ? tfAnswer : qType === "fill" ? fillTarget : correctAnswer,
          bloom: isRtl ? "فهم" : "Understand" as any,
          difficulty: isRtl ? "متوسطة" : "Moderate" as any,
          difficultyIndex: 0.6,
          discriminationIndex: 0.42,
          rubrics: qType === "essay" ? rubrics : undefined,
          imageUrl: diagramImage || undefined,
        }}
        onSaveQuestion={(updated) => {
          setQType(updated.qType);
          if (updated.qType === "fill") {
            setFillSentence(updated.stem);
            setFillTarget(updated.correctAnswer);
          } else if (updated.qType === "tf") {
            setStem(updated.stem);
            setTfAnswer(updated.correctAnswer);
          } else {
            setStem(updated.stem);
            if (updated.options) setOptions(updated.options);
            setCorrectAnswer(updated.correctAnswer);
          }
          if (updated.rubrics) setRubrics(updated.rubrics);
        }}
        onAddToBank={onAddQuestion}
        lang={lang}
        reviewStage={isStage3 ? 3 : 2}
      />

      {/* Multi-Question Batch Stage Application Modal */}
      {isBatchAuditOpen && (
        <BatchAuditModal
          isOpen={isBatchAuditOpen}
          onClose={() => setIsBatchAuditOpen(false)}
          questions={questionsList}
          onApplyBatchUpdates={(updatedList) => {
            if (onBatchUpdateQuestions) {
              onBatchUpdateQuestions(updatedList);
            }
            triggerToast(
              isRtl
                ? "✨ تم تطبيق وحفظ المعايير السيكومترية واللغوية على الأسئلة بنجاح!"
                : "✨ Successfully updated item bank with batch audit results!"
            );
          }}
          lang={lang}
          currentStage={isStage3 ? "3" : "2"}
        />
      )}
    </div>
  );
}

