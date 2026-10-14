import { Deck, LanguageId, LearningGoal, PartOfSpeech, VocabCard, GOALS, goalById, languageById } from "@/lib/types";
import { card } from "../builder";
import type { BasicExtra } from "../basics/builder";

/* ============================================================
   Goal tracks — vocabulary tailored to WHY someone learns:
   travel, daily conversation, work, or sounding native.
   Each language file supplies phrasebook-style rows per goal.
   ============================================================ */

/**
 * [meaning, word, how to say it, topic, part of speech, example, example translation, extras]
 * - `word` must appear verbatim in the example (or `extras.script` for Arabic-script languages)
 * - `topic` must be one of the goal's topics (see GOALS in types.ts)
 */
export type GoalRow = [string, string, string, string, PartOfSpeech, string, string, BasicExtra?];

export type GoalRows = Record<LearningGoal, GoalRow[]>;

const T0 = new Date("2026-10-01T09:00:00Z").getTime();
export const goalDeckId = (lang: LanguageId, goal: LearningGoal) => `deck-${lang}-goal-${goal}`;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function goalSet(languageId: LanguageId, rows: GoalRows): { decks: Deck[]; cards: VocabCard[] } {
  const lang = languageById(languageId);
  const decks: Deck[] = [];
  const cards: VocabCard[] = [];
  GOALS.forEach((g, gi) => {
    const deckId = goalDeckId(languageId, g.id);
    decks.push({
      id: deckId, languageId, goal: g.id, isAI: false, createdAt: T0 + gi,
      name: `${g.label}`, emoji: g.emoji,
      description: `${lang.name} ${g.purpose} — ${g.description}`,
    });
    (rows[g.id] ?? []).forEach(([meaning, word, say, topic, pos, exNative, exTranslation, extra = {}], i) => {
      cards.push(card({
        id: `${languageId}-${g.id}-${slug(meaning)}`,
        languageId,
        deckIds: [deckId],
        word,
        nativeScript: extra.script ?? word,
        romanization: extra.script ? word : undefined,
        translation: meaning,
        pronunciation: say,
        partOfSpeech: pos,
        topic,
        cefr: goalById(g.id).cefr,
        difficulty: g.id === "travel" || g.id === "daily" ? 2 : 3,
        frequency: 4,
        gender: extra.gender ?? "none",
        usageNotes: extra.note,
        register: g.id === "work" ? "formal" : g.id === "native" ? "casual" : "neutral",
        examples: [{ native: exNative, reading: extra.reading, translation: exTranslation, explanation: "", whyUseful: "" }],
        createdAt: T0 + gi * 1000 + i,
        updatedAt: T0 + gi * 1000 + i,
      }));
    });
  });
  return { decks, cards };
}
