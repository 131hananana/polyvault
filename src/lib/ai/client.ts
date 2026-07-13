/* ============================================================
   Client-side AI facade: tries the Claude-backed API route,
   silently falls back to the offline tutor when there's no
   key or no network.
   ============================================================ */
"use client";

import { VocabCard, TutorFeedback, WordExplanation, QuizMode, uid, NEW_SRS, LanguageId, languageById } from "@/lib/types";
import { getSettings } from "@/lib/db";
import { offlineTutorFeedback, offlineExplanation } from "./fallback";

async function callAI<T>(task: string, payload: Record<string, unknown>): Promise<T | null> {
  try {
    const settings = await getSettings();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (settings.anthropicApiKey) headers["x-api-key"] = settings.anthropicApiKey;
    const res = await fetch("/api/ai", { method: "POST", headers, body: JSON.stringify({ task, payload }) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null; // offline
  }
}

export interface TutorResult extends TutorFeedback { source: "claude" | "offline" }

export async function getTutorFeedback(
  card: VocabCard, userAnswer: string, correctAnswer: string,
  mode: QuizMode, mistakeCount: number, distractors: string[] = [],
): Promise<TutorResult> {
  const lang = languageById(card.languageId);
  const remote = await callAI<TutorFeedback>("tutor", {
    language: lang.name, word: card.word, translation: card.translation,
    userAnswer, correctAnswer, mode, mistakeCount,
    cardContext: {
      synonyms: card.synonyms, commonMistakes: card.commonMistakes,
      usageNotes: card.usageNotes, register: card.register,
      examples: card.examples.map((e) => e.native),
    },
  });
  if (remote?.exercises?.length) return { ...remote, source: "claude" };
  return { ...offlineTutorFeedback(card, userAnswer, correctAnswer, distractors), source: "offline" };
}

export async function getWordExplanation(card: VocabCard): Promise<WordExplanation & { source: "claude" | "offline" }> {
  const lang = languageById(card.languageId);
  const remote = await callAI<WordExplanation>("explain", {
    language: lang.name, word: card.word, translation: card.translation,
    cardContext: {
      partOfSpeech: card.partOfSpeech, cefr: card.cefr, register: card.register,
      synonyms: card.synonyms, collocations: card.collocations,
      commonMistakes: card.commonMistakes, memoryTips: card.memoryTips,
      examples: card.examples,
    },
  });
  if (remote?.realMeaning) return { ...remote, source: "claude" };
  return { ...offlineExplanation(card), source: "offline" };
}

/* ------------------------------------------------------------
   AI deck generation / import extraction
   ------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawCard = any;

function hydrate(raw: RawCard, languageId: LanguageId, deckId: string): VocabCard {
  const now = Date.now();
  return {
    id: uid(), languageId, deckIds: [deckId],
    word: String(raw.word ?? ""), nativeScript: String(raw.nativeScript ?? raw.word ?? ""),
    translation: String(raw.translation ?? ""),
    partOfSpeech: raw.partOfSpeech ?? "noun", cefr: raw.cefr ?? "B1",
    topic: String(raw.topic ?? "General"),
    difficulty: raw.difficulty ?? 3, frequency: raw.frequency ?? 3,
    pronunciation: String(raw.pronunciation ?? ""), ipa: String(raw.ipa ?? ""),
    romanization: raw.romanization ?? undefined,
    gender: raw.gender ?? "none", plural: raw.plural ?? undefined,
    collocations: raw.collocations ?? [], synonyms: raw.synonyms ?? [],
    antonyms: raw.antonyms ?? [], relatedWords: raw.relatedWords ?? [],
    memoryTips: String(raw.memoryTips ?? ""), commonMistakes: String(raw.commonMistakes ?? ""),
    culturalNotes: raw.culturalNotes ?? undefined, grammarNotes: raw.grammarNotes ?? undefined,
    usageNotes: raw.usageNotes ?? undefined, register: raw.register ?? "neutral",
    examples: (raw.examples ?? []).map((e: RawCard) => ({
      native: String(e.native ?? ""), translation: String(e.translation ?? ""),
      explanation: String(e.explanation ?? ""), whyUseful: String(e.whyUseful ?? ""),
    })),
    srs: { ...NEW_SRS }, createdAt: now, updatedAt: now,
  };
}

export async function generateDeckCards(opts: {
  languageId: LanguageId; topic: string; cefr: string; difficulty: string;
  count: number; scenario?: string; deckId: string;
}): Promise<VocabCard[] | null> {
  const lang = languageById(opts.languageId);
  const res = await callAI<{ cards: RawCard[] }>("generate", {
    language: lang.name, languageId: opts.languageId, topic: opts.topic,
    cefr: opts.cefr, difficulty: opts.difficulty, count: opts.count, scenario: opts.scenario,
  });
  if (!res?.cards?.length) return null;
  return res.cards.filter((c) => c.word && c.translation).map((c) => hydrate(c, opts.languageId, opts.deckId));
}

export async function extractCardsFromText(opts: {
  languageId: LanguageId; text: string; deckId: string; count?: number;
}): Promise<VocabCard[] | null> {
  const lang = languageById(opts.languageId);
  const res = await callAI<{ cards: RawCard[] }>("extract", {
    language: lang.name, languageId: opts.languageId, text: opts.text, count: opts.count ?? 20,
  });
  if (!res?.cards?.length) return null;
  return res.cards.filter((c) => c.word && c.translation).map((c) => hydrate(c, opts.languageId, opts.deckId));
}
