/* ============================================================
   PolyVault — Core domain types
   ============================================================ */

export type LanguageId = "fr" | "es" | "darija" | "ar" | "en-pro";

export interface Language {
  id: LanguageId;
  name: string;
  nativeName: string;
  flag: string;
  /** BCP-47 tag used for speech synthesis / recognition */
  speechTag: string;
  rtl: boolean;
  /** whether romanization applies (Arabic script languages) */
  hasRomanization: boolean;
}

export const LANGUAGES: Language[] = [
  { id: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", speechTag: "fr-FR", rtl: false, hasRomanization: false },
  { id: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", speechTag: "es-ES", rtl: false, hasRomanization: false },
  { id: "darija", name: "Moroccan Darija", nativeName: "الدارجة", flag: "🇲🇦", speechTag: "ar-MA", rtl: true, hasRomanization: true },
  { id: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", speechTag: "ar-SA", rtl: true, hasRomanization: true },
  { id: "en-pro", name: "Professional English", nativeName: "English", flag: "🇺🇸", speechTag: "en-US", rtl: false, hasRomanization: false },
];

export const languageById = (id: LanguageId): Language =>
  LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];

export type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type PartOfSpeech =
  | "noun" | "verb" | "adjective" | "adverb" | "pronoun"
  | "preposition" | "conjunction" | "interjection" | "phrase" | "idiom" | "expression";
export type Register = "formal" | "neutral" | "casual";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
/** 1 = very rare … 5 = extremely common */
export type Frequency = 1 | 2 | 3 | 4 | 5;

export interface ExampleSentence {
  native: string;
  translation: string;
  explanation: string;
  whyUseful: string;
}

export interface Conjugation {
  tense: string;
  forms: Record<string, string>;
}

/* ------------------------------------------------------------
   Vocabulary card — the heart of PolyVault
   ------------------------------------------------------------ */
export interface VocabCard {
  id: string;
  languageId: LanguageId;
  deckIds: string[];

  word: string;
  nativeScript: string;
  translation: string;
  partOfSpeech: PartOfSpeech;
  cefr: CEFR;
  topic: string;
  difficulty: Difficulty;
  frequency: Frequency;

  pronunciation: string;
  ipa: string;
  romanization?: string;

  gender?: "masculine" | "feminine" | "neuter" | "none";
  plural?: string;
  conjugations?: Conjugation[];
  irregularForms?: string[];

  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];

  memoryTips: string;
  commonMistakes: string;
  culturalNotes?: string;
  grammarNotes?: string;
  usageNotes?: string;
  register: Register;

  examples: ExampleSentence[];

  /* --- SM-2 scheduling state --- */
  srs: SrsState;

  createdAt: number;
  updatedAt: number;
}

export interface SrsState {
  /** SM-2 ease factor, min 1.3 */
  ease: number;
  /** current interval in days */
  interval: number;
  /** consecutive successful reviews */
  repetitions: number;
  /** epoch ms of next due review; 0 = new card */
  dueAt: number;
  /** learning | review | mastered | new */
  stage: "new" | "learning" | "review" | "mastered";
  lapses: number;
  lastReviewedAt: number;
}

export const NEW_SRS: SrsState = {
  ease: 2.5, interval: 0, repetitions: 0, dueAt: 0,
  stage: "new", lapses: 0, lastReviewedAt: 0,
};

export type Grade = 0 | 1 | 2 | 3; // Again | Hard | Good | Easy
export const GRADE_LABELS = ["Again", "Hard", "Good", "Easy"] as const;

/* ------------------------------------------------------------
   Decks
   ------------------------------------------------------------ */
export interface Deck {
  id: string;
  languageId: LanguageId;
  name: string;
  description: string;
  emoji: string;
  isAI: boolean;
  createdAt: number;
}

/* ------------------------------------------------------------
   Review history (for stats + retention)
   ------------------------------------------------------------ */
export type QuizMode =
  | "flashcards" | "multiple-choice" | "typing" | "listening"
  | "pronunciation" | "reverse" | "fill-blank" | "sentence-completion"
  | "match-pairs" | "speed" | "timed" | "mistake-review";

export interface ReviewLog {
  id?: number;
  cardId: string;
  languageId: LanguageId;
  mode: QuizMode;
  grade: Grade;
  correct: boolean;
  /** ms spent on the answer */
  tookMs: number;
  at: number; // epoch ms
  day: string; // YYYY-MM-DD for fast grouping
}

/* ------------------------------------------------------------
   Study sessions / time tracking
   ------------------------------------------------------------ */
export interface StudySession {
  id?: number;
  languageId: LanguageId;
  mode: QuizMode;
  startedAt: number;
  endedAt: number;
  cardsSeen: number;
  correct: number;
  xpEarned: number;
  day: string;
}

/* ------------------------------------------------------------
   Notebook
   ------------------------------------------------------------ */
export type NoteKind = "word" | "phrase" | "idiom" | "grammar";
export interface NotebookEntry {
  id: string;
  languageId: LanguageId;
  kind: NoteKind;
  text: string;
  translation: string;
  note: string;
  createdAt: number;
  /** set once promoted into a full card */
  promotedCardId?: string;
}

/* ------------------------------------------------------------
   Gamification
   ------------------------------------------------------------ */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: number;
}

export interface Profile {
  id: "me";
  xp: number;
  dailyGoal: number; // reviews per day
  achievements: Achievement[];
}

/* ------------------------------------------------------------
   Settings
   ------------------------------------------------------------ */
export interface AppSettings {
  id: "app";
  activeLanguage: LanguageId;
  fontSize: "small" | "medium" | "large";
  playbackSpeed: number;
  dailyGoal: number;
  newCardsPerDay: number;
  remindersEnabled: boolean;
  reminderTime: string; // HH:MM
  anthropicApiKey?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: "app",
  activeLanguage: "fr",
  fontSize: "medium",
  playbackSpeed: 1,
  dailyGoal: 30,
  newCardsPerDay: 10,
  remindersEnabled: false,
  reminderTime: "19:00",
};

/* ------------------------------------------------------------
   AI tutor
   ------------------------------------------------------------ */
export interface TutorExercise {
  type: "multiple-choice" | "typing" | "fill-blank";
  prompt: string;
  /** sentence with ___ for fill-blank */
  sentence?: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface TutorFeedback {
  whyWrong: string;
  comparison: string;
  subtleDifferences: string[];
  memoryTechnique: string;
  exercises: TutorExercise[];
}

export interface WordExplanation {
  realMeaning: string;
  whenUsed: string;
  whenNotToUse: string;
  confusedWith: string[];
  similarWordsDiff: string;
  situations: { realLife: string; business: string; daily: string; travel: string };
  learnerMistakes: string;
  memoryTricks: string;
}

/* ------------------------------------------------------------
   Utils
   ------------------------------------------------------------ */
export const uid = (): string =>
  (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));

export const todayKey = (d = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const DAY_MS = 24 * 60 * 60 * 1000;
