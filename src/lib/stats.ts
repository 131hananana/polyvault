"use client";

import { db } from "@/lib/db";
import { LanguageId, ReviewLog, VocabCard, todayKey, DAY_MS } from "@/lib/types";

export interface LanguageStats {
  dueToday: number;
  newAvailable: number;
  streak: number;
  retention: number; // 0-100 over last 30 days
  reviewsToday: number;
  cardsLearned: number;   // stage review or mastered
  cardsMastered: number;
  totalCards: number;
  studyMinutes: number;   // all time
  weeklyReviews: { day: string; count: number; correct: number }[];
  heatmap: Record<string, number>; // day -> review count (last 140 days)
  weakestTopics: { topic: string; accuracy: number; n: number }[];
  strongestTopics: { topic: string; accuracy: number; n: number }[];
  recentlyLearned: VocabCard[];
  mostDifficult: VocabCard[];
  upcoming: { label: string; count: number }[];
}

export async function computeStats(languageId: LanguageId): Promise<LanguageStats> {
  const now = Date.now();
  const [cards, reviews, sessions] = await Promise.all([
    db.cards.where("languageId").equals(languageId).toArray(),
    db.reviews.where("languageId").equals(languageId).toArray(),
    db.sessions.where("languageId").equals(languageId).toArray(),
  ]);

  const byDay = new Map<string, ReviewLog[]>();
  for (const r of reviews) {
    const arr = byDay.get(r.day) ?? [];
    arr.push(r);
    byDay.set(r.day, arr);
  }

  // streak: consecutive days with ≥1 review ending today or yesterday
  let streak = 0;
  const d = new Date();
  if (!byDay.has(todayKey(d))) d.setDate(d.getDate() - 1); // grace: streak alive if yesterday studied
  while (byDay.has(todayKey(d))) { streak++; d.setDate(d.getDate() - 1); }

  const cutoff30 = now - 30 * DAY_MS;
  const recent = reviews.filter((r) => r.at >= cutoff30);
  const retention = recent.length
    ? Math.round((recent.filter((r) => r.correct).length / recent.length) * 100)
    : 0;

  const today = todayKey();
  const reviewsToday = (byDay.get(today) ?? []).length;

  // weekly bars (last 7 days)
  const weeklyReviews: LanguageStats["weeklyReviews"] = [];
  for (let i = 6; i >= 0; i--) {
    const day = todayKey(new Date(now - i * DAY_MS));
    const logs = byDay.get(day) ?? [];
    weeklyReviews.push({ day, count: logs.length, correct: logs.filter((l) => l.correct).length });
  }

  // heatmap (last 140 days)
  const heatmap: Record<string, number> = {};
  for (let i = 0; i < 140; i++) {
    const day = todayKey(new Date(now - i * DAY_MS));
    const n = (byDay.get(day) ?? []).length;
    if (n) heatmap[day] = n;
  }

  // topic accuracy
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const topicAgg = new Map<string, { ok: number; n: number }>();
  for (const r of reviews) {
    const topic = cardById.get(r.cardId)?.topic;
    if (!topic) continue;
    const agg = topicAgg.get(topic) ?? { ok: 0, n: 0 };
    agg.n++; if (r.correct) agg.ok++;
    topicAgg.set(topic, agg);
  }
  const topics = [...topicAgg.entries()]
    .filter(([, v]) => v.n >= 3)
    .map(([topic, v]) => ({ topic, accuracy: Math.round((v.ok / v.n) * 100), n: v.n }));
  const weakestTopics = [...topics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  const strongestTopics = [...topics].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);

  // difficult cards = most lapses, then lowest ease
  const mostDifficult = cards
    .filter((c) => c.srs.lapses > 0 || (c.srs.stage !== "new" && c.srs.ease < 2.3))
    .sort((a, b) => b.srs.lapses - a.srs.lapses || a.srs.ease - b.srs.ease)
    .slice(0, 5);

  const recentlyLearned = cards
    .filter((c) => c.srs.stage !== "new")
    .sort((a, b) => b.srs.lastReviewedAt - a.srs.lastReviewedAt)
    .slice(0, 5);

  // upcoming reviews buckets
  const buckets: [string, number, number][] = [
    ["Today", 0, 1], ["Tomorrow", 1, 2], ["Next 7 days", 2, 8], ["Later", 8, 10000],
  ];
  const upcoming = buckets.map(([label, from, to]) => ({
    label: label as string,
    count: cards.filter((c) => {
      if (c.srs.stage === "new") return false;
      const days = (c.srs.dueAt - now) / DAY_MS;
      return (label === "Today" ? c.srs.dueAt <= now || days < to : days >= from && days < to);
    }).length,
  }));

  const studyMinutes = Math.round(
    sessions.reduce((acc, s) => acc + Math.max(0, s.endedAt - s.startedAt), 0) / 60000,
  );

  return {
    dueToday: cards.filter((c) => c.srs.stage !== "new" && c.srs.dueAt <= now).length,
    newAvailable: cards.filter((c) => c.srs.stage === "new").length,
    streak,
    retention,
    reviewsToday,
    cardsLearned: cards.filter((c) => c.srs.stage === "review" || c.srs.stage === "mastered").length,
    cardsMastered: cards.filter((c) => c.srs.stage === "mastered").length,
    totalCards: cards.length,
    studyMinutes,
    weeklyReviews,
    heatmap,
    weakestTopics,
    strongestTopics,
    recentlyLearned,
    mostDifficult,
    upcoming,
  };
}

/* ------------------------------------------------------------
   XP / levels
   ------------------------------------------------------------ */
export function levelFromXp(xp: number): { level: number; inLevel: number; forNext: number } {
  // level n requires 50·n² cumulative xp
  let level = 1;
  while (50 * (level + 1) ** 2 <= xp + 50 * 1) level++;
  const base = 50 * level ** 2 - 50;
  const next = 50 * (level + 1) ** 2 - 50;
  return { level, inLevel: xp - base, forNext: next - base };
}

export interface AchievementDef { id: string; name: string; description: string; emoji: string; test: (ctx: { xp: number; streak: number; mastered: number; reviews: number }) => boolean }

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-review", name: "First Step", description: "Complete your first review", emoji: "🌱", test: (c) => c.reviews >= 1 },
  { id: "streak-3", name: "Warming Up", description: "3-day study streak", emoji: "🔥", test: (c) => c.streak >= 3 },
  { id: "streak-7", name: "One Week Strong", description: "7-day study streak", emoji: "⚡", test: (c) => c.streak >= 7 },
  { id: "streak-30", name: "Unstoppable", description: "30-day study streak", emoji: "🏆", test: (c) => c.streak >= 30 },
  { id: "mastered-10", name: "Collector", description: "Master 10 cards", emoji: "💎", test: (c) => c.mastered >= 10 },
  { id: "mastered-50", name: "Vault Keeper", description: "Master 50 cards", emoji: "🗝️", test: (c) => c.mastered >= 50 },
  { id: "reviews-100", name: "Centurion", description: "100 total reviews", emoji: "💯", test: (c) => c.reviews >= 100 },
  { id: "xp-1000", name: "Scholar", description: "Earn 1,000 XP", emoji: "🎓", test: (c) => c.xp >= 1000 },
];
