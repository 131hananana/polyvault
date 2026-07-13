/* ============================================================
   SM-2 spaced-repetition algorithm (SuperMemo 2, adapted)

   Grades map to the classic SM-2 quality scale:
     Again = 0  → q 2 (failure, reset repetitions)
     Hard  = 1  → q 3
     Good  = 2  → q 4
     Easy  = 3  → q 5

   Learning steps (sub-day) are handled before graduating to
   day-based intervals, like Anki does.
   ============================================================ */

import { Grade, SrsState, DAY_MS } from "@/lib/types";

const MIN_EASE = 1.3;
/** learning steps in minutes before a card graduates */
const LEARNING_STEPS_MIN = [1, 10];
const GRADUATING_INTERVAL_DAYS = 1;
const EASY_INTERVAL_DAYS = 4;
/** intervals beyond this are considered mastered */
const MASTERED_INTERVAL_DAYS = 21;

const QUALITY: Record<Grade, number> = { 0: 2, 1: 3, 2: 4, 3: 5 };

function nextEase(ease: number, grade: Grade): number {
  const q = QUALITY[grade];
  const e = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return Math.max(MIN_EASE, Math.round(e * 100) / 100);
}

export function review(prev: SrsState, grade: Grade, now = Date.now()): SrsState {
  const s: SrsState = { ...prev, lastReviewedAt: now };

  // --- failure: back to learning ---
  if (grade === 0) {
    return {
      ...s,
      ease: nextEase(prev.ease, grade),
      repetitions: 0,
      interval: 0,
      lapses: prev.stage === "review" || prev.stage === "mastered" ? prev.lapses + 1 : prev.lapses,
      stage: "learning",
      dueAt: now + LEARNING_STEPS_MIN[0] * 60_000,
    };
  }

  // --- new / learning cards climb the learning steps ---
  if (prev.stage === "new" || prev.stage === "learning") {
    if (grade === 3) {
      // Easy: skip straight to a longer graduation
      return {
        ...s, stage: "review", repetitions: 1,
        interval: EASY_INTERVAL_DAYS,
        ease: nextEase(prev.ease, grade),
        dueAt: now + EASY_INTERVAL_DAYS * DAY_MS,
      };
    }
    const step = prev.repetitions;
    if (step < LEARNING_STEPS_MIN.length - 1) {
      return {
        ...s, stage: "learning", repetitions: step + 1,
        interval: 0, ease: nextEase(prev.ease, grade),
        dueAt: now + LEARNING_STEPS_MIN[step + 1] * 60_000,
      };
    }
    // graduate
    return {
      ...s, stage: "review", repetitions: 1,
      interval: GRADUATING_INTERVAL_DAYS,
      ease: nextEase(prev.ease, grade),
      dueAt: now + GRADUATING_INTERVAL_DAYS * DAY_MS,
    };
  }

  // --- review cards: SM-2 proper ---
  const ease = nextEase(prev.ease, grade);
  let interval: number;
  if (prev.repetitions === 0) interval = 1;
  else if (prev.repetitions === 1) interval = 6;
  else interval = Math.round(prev.interval * ease);

  // Hard shortens, Easy lengthens
  if (grade === 1) interval = Math.max(1, Math.round(prev.interval * 1.2));
  if (grade === 3) interval = Math.round(interval * 1.3);
  interval = Math.min(interval, 365);

  return {
    ...s,
    ease,
    interval,
    repetitions: prev.repetitions + 1,
    stage: interval >= MASTERED_INTERVAL_DAYS ? "mastered" : "review",
    dueAt: now + interval * DAY_MS,
  };
}

/** Human preview of what each button will schedule ("<1m", "10m", "3d"…) */
export function previewIntervals(state: SrsState, now = Date.now()): string[] {
  return ([0, 1, 2, 3] as Grade[]).map((g) => {
    const next = review(state, g, now);
    const ms = next.dueAt - now;
    if (ms < 60 * 60_000) return `${Math.max(1, Math.round(ms / 60_000))}m`;
    if (ms < DAY_MS) return `${Math.round(ms / 3_600_000)}h`;
    const days = Math.round(ms / DAY_MS);
    if (days < 30) return `${days}d`;
    return `${(days / 30).toFixed(1).replace(/\.0$/, "")}mo`;
  });
}

export const isDue = (s: SrsState, now = Date.now()): boolean =>
  s.stage !== "new" && s.dueAt <= now;
