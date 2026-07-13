/* ============================================================
   PolyVault — local-first storage (IndexedDB via Dexie)
   The database is the single source of truth; everything
   works fully offline.
   ============================================================ */
"use client";

import Dexie, { Table } from "dexie";
import {
  VocabCard, Deck, ReviewLog, StudySession, NotebookEntry,
  Profile, AppSettings, DEFAULT_SETTINGS, LanguageId, NEW_SRS,
  uid, todayKey, Grade, QuizMode,
} from "@/lib/types";
import { review as sm2Review } from "@/lib/srs/sm2";
import { SEED_DECKS, SEED_CARDS } from "@/lib/seed";

class PolyVaultDB extends Dexie {
  cards!: Table<VocabCard, string>;
  decks!: Table<Deck, string>;
  reviews!: Table<ReviewLog, number>;
  sessions!: Table<StudySession, number>;
  notebook!: Table<NotebookEntry, string>;
  profile!: Table<Profile, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("polyvault");
    this.version(1).stores({
      cards: "id, languageId, *deckIds, srs.dueAt, srs.stage, topic, updatedAt",
      decks: "id, languageId, createdAt",
      reviews: "++id, cardId, languageId, at, day, [languageId+day]",
      sessions: "++id, languageId, day, startedAt",
      notebook: "id, languageId, kind, createdAt",
      profile: "id",
      settings: "id",
    });
  }
}

export const db = new PolyVaultDB();

/* ------------------------------------------------------------
   Bootstrap: seed the vault on first launch
   ------------------------------------------------------------ */
let seedPromise: Promise<void> | null = null;
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const count = await db.cards.count();
      if (count > 0) return;
      await db.transaction("rw", db.cards, db.decks, db.profile, db.settings, async () => {
        await db.decks.bulkPut(SEED_DECKS);
        await db.cards.bulkPut(SEED_CARDS);
        await db.profile.put({ id: "me", xp: 0, dailyGoal: 30, achievements: [] });
        await db.settings.put(DEFAULT_SETTINGS);
      });
    })();
  }
  return seedPromise;
}

/* ------------------------------------------------------------
   Settings / profile helpers
   ------------------------------------------------------------ */
export async function getSettings(): Promise<AppSettings> {
  return (await db.settings.get("app")) ?? DEFAULT_SETTINGS;
}
export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  const cur = await getSettings();
  await db.settings.put({ ...cur, ...patch, id: "app" });
}

/* ------------------------------------------------------------
   Queue selection
   ------------------------------------------------------------ */
export async function getDueCards(languageId: LanguageId, now = Date.now()): Promise<VocabCard[]> {
  const cards = await db.cards.where("languageId").equals(languageId).toArray();
  return cards
    .filter((c) => c.srs.stage !== "new" && c.srs.dueAt <= now)
    .sort((a, b) => a.srs.dueAt - b.srs.dueAt);
}

export async function getNewCards(languageId: LanguageId, limit: number): Promise<VocabCard[]> {
  const cards = await db.cards.where("languageId").equals(languageId).toArray();
  const introducedToday = await countNewIntroducedToday(languageId);
  const remaining = Math.max(0, limit - introducedToday);
  return cards.filter((c) => c.srs.stage === "new").slice(0, remaining);
}

async function countNewIntroducedToday(languageId: LanguageId): Promise<number> {
  const logs = await db.reviews.where("[languageId+day]").equals([languageId, todayKey()]).toArray();
  const firstSeen = new Set<string>();
  for (const l of logs) firstSeen.add(l.cardId);
  // approximation: cards reviewed today that are still in learning stage were new today
  const cards = await db.cards.bulkGet([...firstSeen]);
  return cards.filter((c) => c && c.srs.repetitions <= 1 && c.srs.stage === "learning").length;
}

/* ------------------------------------------------------------
   Recording an answer (SM-2 + log + XP)
   ------------------------------------------------------------ */
const XP_PER_GRADE: Record<Grade, number> = { 0: 1, 1: 3, 2: 5, 3: 7 };

export async function recordAnswer(
  card: VocabCard, grade: Grade, mode: QuizMode, tookMs: number,
): Promise<VocabCard> {
  const now = Date.now();
  const nextSrs = sm2Review(card.srs, grade, now);
  const updated: VocabCard = { ...card, srs: nextSrs, updatedAt: now };
  await db.transaction("rw", db.cards, db.reviews, db.profile, async () => {
    await db.cards.put(updated);
    await db.reviews.add({
      cardId: card.id, languageId: card.languageId, mode, grade,
      correct: grade >= 2, tookMs, at: now, day: todayKey(),
    });
    const profile = await db.profile.get("me");
    if (profile) await db.profile.put({ ...profile, xp: profile.xp + XP_PER_GRADE[grade] });
  });
  return updated;
}

/* ------------------------------------------------------------
   Card / deck CRUD
   ------------------------------------------------------------ */
export async function addCard(card: Omit<VocabCard, "id" | "srs" | "createdAt" | "updatedAt">): Promise<VocabCard> {
  const now = Date.now();
  const full: VocabCard = { ...card, id: uid(), srs: { ...NEW_SRS }, createdAt: now, updatedAt: now };
  await db.cards.put(full);
  return full;
}

export async function addDeck(deck: Omit<Deck, "id" | "createdAt">): Promise<Deck> {
  const full: Deck = { ...deck, id: uid(), createdAt: Date.now() };
  await db.decks.put(full);
  return full;
}

export async function deleteDeck(deckId: string): Promise<void> {
  await db.transaction("rw", db.decks, db.cards, async () => {
    const cards = await db.cards.where("deckIds").equals(deckId).toArray();
    for (const c of cards) {
      await db.cards.put({ ...c, deckIds: c.deckIds.filter((d) => d !== deckId) });
    }
    await db.decks.delete(deckId);
  });
}

/* ------------------------------------------------------------
   Search across every language
   ------------------------------------------------------------ */
export async function searchCards(query: string): Promise<VocabCard[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await db.cards.toArray();
  return all
    .filter((c) =>
      c.word.toLowerCase().includes(q) ||
      c.translation.toLowerCase().includes(q) ||
      c.nativeScript.includes(query.trim()) ||
      (c.romanization ?? "").toLowerCase().includes(q) ||
      c.synonyms.some((s) => s.toLowerCase().includes(q)) ||
      c.topic.toLowerCase().includes(q),
    )
    .slice(0, 100);
}

/* ------------------------------------------------------------
   Sessions
   ------------------------------------------------------------ */
export async function logSession(s: Omit<StudySession, "id" | "day">): Promise<void> {
  await db.sessions.add({ ...s, day: todayKey(new Date(s.startedAt)) });
}
