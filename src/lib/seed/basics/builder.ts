import { Deck, LanguageId, PartOfSpeech, VocabCard } from "@/lib/types";
import { card } from "../builder";

/* ============================================================
   Level 1 · Basics — the starter vocabulary every learner
   meets first. Rows stay compact so each language file reads
   like a phrasebook.
   ============================================================ */

export type BasicTopic =
  | "Greetings" | "Numbers" | "Colors" | "Family" | "Food & Drink" | "Time" | "Verbs" | "Survival";

export const BASIC_TOPICS: { id: BasicTopic; emoji: string }[] = [
  { id: "Greetings", emoji: "👋" },
  { id: "Numbers", emoji: "🔢" },
  { id: "Colors", emoji: "🎨" },
  { id: "Family", emoji: "👨‍👩‍👧" },
  { id: "Food & Drink", emoji: "🥖" },
  { id: "Time", emoji: "⏰" },
  { id: "Verbs", emoji: "🏃" },
  { id: "Survival", emoji: "🆘" },
];

export interface BasicExtra {
  /** native script when `word` is a romanization (Arabic, Darija) */
  script?: string;
  /** Latin-letter reading of the example sentence */
  reading?: string;
  gender?: VocabCard["gender"];
  note?: string;
}

/** [meaning, word, how to say it, topic, part of speech, example, example translation, extras] */
export type BasicRow = [string, string, string, BasicTopic, PartOfSpeech, string, string, BasicExtra?];

const T0 = new Date("2026-07-01T09:00:00Z").getTime();
export const basicsDeckId = (lang: LanguageId) => `deck-${lang}-basics`;

export function basicsDeck(languageId: LanguageId, description: string): Deck {
  return {
    id: basicsDeckId(languageId), languageId, name: "Level 1 · Basics", description,
    emoji: "🌱", isAI: false, createdAt: T0 - 1,
  };
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function basicsCards(languageId: LanguageId, rows: BasicRow[]): VocabCard[] {
  return rows.map(([meaning, word, say, topic, pos, exNative, exTranslation, extra = {}], i) =>
    card({
      id: `${languageId}-l1-${slug(meaning)}`,
      languageId,
      deckIds: [basicsDeckId(languageId)],
      word,
      nativeScript: extra.script ?? word,
      romanization: extra.script ? word : undefined,
      translation: meaning,
      pronunciation: say,
      partOfSpeech: pos,
      topic,
      cefr: "A1",
      difficulty: 1,
      frequency: 5,
      gender: extra.gender ?? "none",
      usageNotes: extra.note,
      register: "neutral",
      examples: [{ native: exNative, reading: extra.reading, translation: exTranslation, explanation: "", whyUseful: "" }],
      // keep phrasebook order inside the deck
      createdAt: T0 + i,
      updatedAt: T0 + i,
    }),
  );
}
