/* ============================================================
   Learning goals — per-language focus, free first goal,
   paid unlocks, and which decks a learner may study.
   ============================================================ */
"use client";

import {
  AppSettings, Deck, LanguageId, LanguageGoalState, LearningGoal, VocabCard,
} from "@/lib/types";
import { db, getSettings, updateSettings } from "@/lib/db";

/**
 * Real payments need a backend (Stripe checkout + webhook) to be trustworthy.
 * Until that exists, unlocks are "test purchases" — available in development,
 * or in production when NEXT_PUBLIC_TEST_PURCHASES=1 is set.
 */
export const TEST_PURCHASES_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_TEST_PURCHASES === "1";

export function goalStateFor(settings: AppSettings, lang: LanguageId): LanguageGoalState | undefined {
  return settings.goals?.[lang];
}

async function patchGoal(lang: LanguageId, next: LanguageGoalState) {
  await db.transaction("rw", db.settings, async () => {
    const s = await getSettings();
    await updateSettings({ goals: { ...(s.goals ?? {}), [lang]: next } });
  });
}

/** First goal for a language — always free. */
export async function chooseFirstGoal(lang: LanguageId, goal: LearningGoal) {
  const cur = (await getSettings()).goals?.[lang];
  if (cur) return setFocus(lang, goal);
  await patchGoal(lang, { focus: goal, unlocked: [goal], chosenAt: Date.now() });
}

/** Switch focus — only between goals already unlocked. */
export async function setFocus(lang: LanguageId, goal: LearningGoal) {
  const cur = (await getSettings()).goals?.[lang];
  if (!cur || !cur.unlocked.includes(goal)) throw new Error("Goal is locked");
  await patchGoal(lang, { ...cur, focus: goal });
}

/** Grants a purchased goal and focuses it. Called after a (test) purchase succeeds. */
export async function grantGoal(lang: LanguageId, goal: LearningGoal) {
  const cur = (await getSettings()).goals?.[lang];
  const unlocked = Array.from(new Set([...(cur?.unlocked ?? []), goal]));
  await patchGoal(lang, { focus: goal, unlocked, chosenAt: cur?.chosenAt ?? Date.now() });
}

/* ------------------------------------------------------------
   Deck access + new-card ordering
   ------------------------------------------------------------ */
export function isDeckOpen(deck: Pick<Deck, "goal">, state?: LanguageGoalState): boolean {
  if (!deck.goal) return true;
  return Boolean(state?.unlocked.includes(deck.goal));
}

export interface GoalContext {
  state?: LanguageGoalState;
  /** deck id → goal for every tagged deck in the language */
  deckGoal: Map<string, LearningGoal>;
}

export function goalContext(decks: Deck[], state?: LanguageGoalState): GoalContext {
  const deckGoal = new Map<string, LearningGoal>();
  for (const d of decks) if (d.goal) deckGoal.set(d.id, d.goal);
  return { state, deckGoal };
}

const isBasic = (c: VocabCard) => c.deckIds.some((d) => d.endsWith("-basics"));

/** The goal track a card belongs to (undefined = open to everyone). */
function goalsOf(c: VocabCard, ctx: GoalContext): LearningGoal[] {
  return c.deckIds.map((d) => ctx.deckGoal.get(d)).filter(Boolean) as LearningGoal[];
}

/** Cards from locked goal tracks can't be introduced as new cards. */
export function isCardOpen(c: VocabCard, ctx: GoalContext): boolean {
  if (isBasic(c)) return true;
  const goals = goalsOf(c, ctx);
  if (!goals.length) return true;
  return goals.some((g) => ctx.state?.unlocked.includes(g));
}

/**
 * New-card order: Level 1 basics → focus goal track → untagged decks → other unlocked goals.
 * Locked goal tracks are dropped.
 */
export function orderNewCardsForGoal(cards: VocabCard[], ctx: GoalContext): VocabCard[] {
  const focus = ctx.state?.focus;
  const rank = (c: VocabCard) => {
    if (isBasic(c)) return 0;
    const goals = goalsOf(c, ctx);
    if (focus && goals.includes(focus)) return 1;
    if (!goals.length) return 2;
    return 3;
  };
  return cards
    .filter((c) => isCardOpen(c, ctx))
    .sort((a, b) => rank(a) - rank(b) ||
      (rank(a) <= 1 ? a.createdAt - b.createdAt : b.frequency - a.frequency || a.difficulty - b.difficulty));
}
