/* ============================================================
   PolyVault — Core domain types
   ============================================================ */

export type LanguageId = "fr" | "es" | "pt" | "de" | "it" | "ru" | "darija" | "en-pro";

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
  { id: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", speechTag: "pt-BR", rtl: false, hasRomanization: false },
  { id: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", speechTag: "de-DE", rtl: false, hasRomanization: false },
  { id: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", speechTag: "it-IT", rtl: false, hasRomanization: false },
  { id: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", speechTag: "ru-RU", rtl: false, hasRomanization: true },
  { id: "darija", name: "Moroccan Darija", nativeName: "الدارجة", flag: "🇲🇦", speechTag: "ar-MA", rtl: true, hasRomanization: true },
  { id: "en-pro", name: "English", nativeName: "English", flag: "🇺🇸", speechTag: "en-US", rtl: false, hasRomanization: false },
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
  /** how to read the sentence in Latin letters (non-Latin scripts) */
  reading?: string;
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
   Learning goals — every language is learned toward one focus.
   The first goal per language is free; others unlock for a fee.
   ------------------------------------------------------------ */
export type LearningGoal = "travel" | "daily" | "work" | "native";

export interface GoalDef {
  id: LearningGoal;
  label: string;
  short: string;
  emoji: string;
  /** reads after a language name: "Spanish for traveling", "Spanish like a native" */
  purpose: string;
  description: string;
  topics: string[];
  /** CEFR level of the goal vocabulary */
  cefr: CEFR;
}

export const GOALS: GoalDef[] = [
  { id: "travel", label: "Traveling", short: "Travel", emoji: "✈️", purpose: "for traveling",
    description: "Airports, hotels, ordering food, asking for directions — get around with confidence.",
    topics: ["Airport & transport", "Hotel", "Restaurant & café", "Directions & help"], cefr: "A2" },
  { id: "daily", label: "Daily conversation", short: "Daily", emoji: "☕", purpose: "for daily conversation",
    description: "Small talk, feelings, routines and plans — chat naturally with friends and neighbours.",
    topics: ["Small talk", "Feelings & opinions", "Daily routine", "Plans & invitations"], cefr: "A2" },
  { id: "work", label: "Work & career", short: "Work", emoji: "💼", purpose: "for work",
    description: "Meetings, emails, scheduling and colleagues — sound professional at work.",
    topics: ["Meetings", "Email & messages", "Scheduling", "Colleagues & office"], cefr: "B1" },
  { id: "native", label: "Sound like a native", short: "Native", emoji: "🗣️", purpose: "like a native",
    description: "Slang, fillers, idioms and casual shortcuts — talk the way locals really talk.",
    topics: ["Slang", "Fillers & reactions", "Idioms", "Casual shortcuts"], cefr: "B1" },
];

export const goalById = (id: LearningGoal): GoalDef => GOALS.find((g) => g.id === id) ?? GOALS[0];

/** Price to unlock an extra goal for one language (USD) */
export const GOAL_UNLOCK_PRICE_USD = 3;

export interface LanguageGoalState {
  /** the goal currently studied */
  focus: LearningGoal;
  /** goals the learner may study (first one free, the rest purchased) */
  unlocked: LearningGoal[];
  chosenAt: number;
}

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
  /** goal track this deck belongs to; untagged decks are open to everyone */
  goal?: LearningGoal;
}

/* ------------------------------------------------------------
   Review history (for stats + retention)
   ------------------------------------------------------------ */
export type QuizMode =
  | "flashcards" | "multiple-choice" | "typing" | "listening"
  | "pronunciation" | "reverse" | "fill-blank" | "sentence-completion"
  | "match-pairs" | "speed" | "timed" | "mistake-review"
  | "sentence-puzzle" | "daily-lesson";

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
  /** which seed content version this vault has received */
  seedVersion?: number;
  /** learning goal per language */
  goals?: Partial<Record<LanguageId, LanguageGoalState>>;
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
