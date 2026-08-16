export const QUESTION_BANK_STORAGE_KEY = "taqwimi-question-bank";

export interface RubricCriterion {
  id: string;
  criterion: string; // المعيار / المهارة المقاسة
  points: number; // الدرجة المخصصة
  description?: string; // مؤشرات الأداء والأدلة
}

export interface Question {
  id: string;
  qType: 'mcq' | 'tf' | 'fill' | 'matching' | 'essay' | 'multi_mcq' | 'ordering' | 'diagram_labeling';
  stem: string;
  options?: string[]; // for mcq, multi_mcq, matching, ordering, diagram_labeling
  correctAnswer: string; // the correct option text, 'صواب'/'خطأ', fill-in word, matching pairs, rubric key, correct order, or diagram labels
  rubrics?: RubricCriterion[]; // scoring rubrics for short essay questions
  answer?: string; // alias for correctAnswer
  explanation?: string; // alias for notes/pedagogical feedback
  imageUrl?: string; // Optional image/drawing URL for diagram completion questions
  bloom: 'تذكر' | 'فهم' | 'تطبيق' | 'تحليل' | 'تقويم' | 'إبداع';
  difficulty: 'سهلة' | 'متوسطة' | 'صعبة';
  notes?: string[]; // quality checks / pedagogical reviews
  contextReference?: string; // الموضع أو الشاهد النصي من المحتوى الأصلي المستند إليه السؤال
  contentAlignment?: string[]; // معايير الارتباط بالمحتوى التعليمي الـ20 المستوفاة
  score?: number; // 0 to 100
  difficultyIndex?: number; // p-value e.g. 0.65 or 65%
  discriminationIndex?: number; // D-value e.g. 0.42
  discriminationStatus?: string; // e.g. 'ممتاز' | 'جيد' | 'مقبول' | 'ضعيف'
}

export interface SpecificationItem {
  topic: string;
  totalQuestions: number;
  lowLevelPct: number; // weight of lower-order levels (Remember, Understand, Apply)
  highLevelPct: number; // weight of higher-order levels (Analyze, Evaluate, Create)
}

export interface PsychometricsInput {
  id: string;
  questionLabel: string;
  totalStudents: number;
  correctAnswersTotal: number;
  correctAnswersHighGroup: number;
  correctAnswersLowGroup: number;
  groupSize: number; // size of high/low group (usually 27% of total)
}

export interface PsychometricsResult {
  questionLabel: string;
  difficultyIndex: number; // p = R / N
  discriminationIndex: number; // D = (Rh - Rl) / n
  difficultyLabel: 'سهل' | 'متوسط' | 'صعب';
  discriminationLabel: 'ممتاز' | 'جيد' | 'مقبول' | 'ضعيف (يتطلب مراجعة)';
  isDiscriminationHealthy: boolean;
}

export interface ProofreadSuggestion {
  id: string;
  category: "spelling" | "grammar" | "style" | "pedagogical_formatting";
  categoryLabelAr: string;
  categoryLabelEn?: string;
  targetField: "stem" | "options" | "correctAnswer";
  originalText: string;
  suggestedText: string;
  ruleExplanation: string;
  severity: "error" | "warning" | "enhancement";
}

export interface ProofreadResult {
  overallLinguisticScore: number;
  linguisticSummary: string;
  improvedStem: string;
  improvedOptions?: string[];
  improvedCorrectAnswer: string;
  detailedSuggestions: ProofreadSuggestion[];
  grammarNotes?: string[];
  spellingNotes?: string[];
  styleNotes?: string[];
}

