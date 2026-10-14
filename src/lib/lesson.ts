/* ============================================================
   Daily lesson builder — a small set of words to learn first,
   then drill through five fixed steps.
   ============================================================ */
"use client";

import { db, getSettings } from "@/lib/db";
import { LanguageId, VocabCard } from "@/lib/types";
import { goalContext, goalStateFor, orderNewCardsForGoal } from "@/lib/goals";

export const LESSON_NEW_WORDS = 5;
export const LESSON_REVIEW_WORDS = 5;

export interface DailyLessonPlan {
  /** words taught in the learning phase */
  learn: VocabCard[];
  /** every word drilled in the quiz steps (new + due) */
  words: VocabCard[];
  /** same-language cards used for distractors */
  pool: VocabCard[];
}

export async function buildDailyLesson(lang: LanguageId, deckId?: string | null): Promise<DailyLessonPlan> {
  const now = Date.now();
  const [settings, decks, all] = await Promise.all([
    getSettings(),
    db.decks.where("languageId").equals(lang).toArray(),
    db.cards.where("languageId").equals(lang).toArray(),
  ]);
  const ctx = goalContext(decks, goalStateFor(settings, lang));
  const scoped = deckId ? all.filter((c) => c.deckIds.includes(deckId)) : all;

  const due = scoped
    .filter((c) => c.srs.stage !== "new" && c.srs.dueAt <= now)
    .sort((a, b) => a.srs.dueAt - b.srs.dueAt)
    .slice(0, LESSON_REVIEW_WORDS);
  const fresh = orderNewCardsForGoal(scoped.filter((c) => c.srs.stage === "new"), ctx)
    .slice(0, Math.min(LESSON_NEW_WORDS, Math.max(1, settings.newCardsPerDay)));

  return {
    learn: fresh.length ? fresh : due,
    words: [...fresh, ...due],
    pool: all,
  };
}

/* ------------------------------------------------------------
   Sentence helpers shared by the lesson steps
   ------------------------------------------------------------ */
const ARTICLES = /^(le |la |les |l'|el |los |las |un |una |der |die |das |il |lo |gli |i |the )/i;

/** The form of the word most likely to appear inside its example sentence. */
export function headwordOf(c: VocabCard): string {
  return c.word.replace(ARTICLES, "").trim();
}

/** Example sentence with the card's word replaced by a blank, or null if it can't be found. */
export function blankOut(c: VocabCard): { before: string; after: string; answer: string } | null {
  const ex = c.examples[0];
  if (!ex) return null;
  const src = ex.native;
  const candidates = [c.nativeScript, c.word, headwordOf(c)].filter(Boolean);
  for (const cand of candidates) {
    const i = src.toLowerCase().indexOf(cand.toLowerCase());
    if (i >= 0) return { before: src.slice(0, i), after: src.slice(i + cand.length), answer: src.slice(i, i + cand.length) };
  }
  return null;
}

/** Splits an example into word tiles (punctuation stays attached to its word). */
export function tilesOf(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean);
}
