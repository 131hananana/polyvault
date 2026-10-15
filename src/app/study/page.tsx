"use client";

/* ============================================================
   Study hub — pick a quiz mode or a review set, then run
   the session engine on the SM-2 queue.
   ============================================================ */

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Layers3, ListChecks, Keyboard, Ear, Mic, ArrowLeftRight, TextCursorInput,
  AlignLeft, Grid2X2, Zap, Timer, CalendarCheck, CalendarRange, CalendarClock, Bug,
} from "lucide-react";
import { useApp } from "@/components/Providers";
import { db } from "@/lib/db";
import { VocabCard, QuizMode, languageById, DAY_MS, goalById } from "@/lib/types";
import { Session } from "@/components/study/Session";
import { audioAvailable } from "@/lib/audio";
import { DailyLesson } from "@/components/study/lesson/DailyLesson";
import { buildDailyLesson, DailyLessonPlan } from "@/lib/lesson";
import { goalContext, goalStateFor, orderNewCardsForGoal } from "@/lib/goals";
import { GoalOnboarding, GoalSwitcher } from "@/components/goals/Goals";
import { TrackCards } from "@/components/study/TrackCards";
import { LANGUAGES } from "@/lib/types";
import { EmptyState, SectionTitle, PageHero } from "@/components/ui";

interface ModeDef {
  id: QuizMode | "daily" | "weekly" | "monthly";
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  mixed?: boolean;
  timeLimit?: number;
}

const QUIZ_MODES: ModeDef[] = [
  { id: "flashcards", label: "Flashcards", desc: "Classic flip cards with SM-2 grading", icon: Layers3 },
  { id: "multiple-choice", label: "Multiple choice", desc: "Pick the right meaning", icon: ListChecks },
  { id: "typing", label: "Typing", desc: "Produce the word from memory", icon: Keyboard },
  { id: "listening", label: "Listening", desc: "Train your ear with native audio", icon: Ear },
  { id: "pronunciation", label: "Pronunciation", desc: "Speak and get scored", icon: Mic },
  { id: "reverse", label: "Reverse translation", desc: "English → target language", icon: ArrowLeftRight },
  { id: "fill-blank", label: "Fill in the blank", desc: "Complete real sentences", icon: TextCursorInput },
  { id: "sentence-completion", label: "Sentence completion", desc: "Choose the missing word", icon: AlignLeft },
  { id: "match-pairs", label: "Match pairs", desc: "Connect words and meanings", icon: Grid2X2 },
  { id: "speed", label: "Speed review", desc: "6 seconds per answer", icon: Zap },
  { id: "timed", label: "Timed challenge", desc: "Score as much as you can in 90s", icon: Timer, timeLimit: 90 },
];

const REVIEW_SETS: ModeDef[] = [
  { id: "daily", label: "Daily lesson", desc: "Learn new words 3×, then 5 focused steps", icon: CalendarCheck },
  { id: "weekly", label: "Weekly review", desc: "Everything you studied this week", icon: CalendarRange, mixed: true },
  { id: "monthly", label: "Monthly review", desc: "Long-term consolidation pass", icon: CalendarClock, mixed: true },
  { id: "mistake-review", label: "Mistake review", desc: "Re-drill your recent errors", icon: Bug, mixed: true },
];

function StudyInner() {
  const { settings, ready, setLanguage } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const modeParam = params.get("mode");
  const deckId = params.get("deck");
  const lang = languageById(settings.activeLanguage);

  const [queue, setQueue] = useState<VocabCard[] | null>(null);
  const [lesson, setLesson] = useState<DailyLessonPlan | null>(null);
  const def = [...QUIZ_MODES, ...REVIEW_SETS].find((m) => m.id === modeParam);
  const isLesson = def?.id === "daily";

  useEffect(() => {
    if (!ready || !def) { setQueue(null); setLesson(null); return; }
    if (def.id === "daily") { setQueue(null); buildDailyLesson(settings.activeLanguage, deckId).then(setLesson); return; }
    setLesson(null);
    buildQueue(def, settings.activeLanguage, settings.newCardsPerDay, deckId).then(setQueue);
  }, [ready, modeParam, settings.activeLanguage, settings.newCardsPerDay, deckId]); // eslint-disable-line react-hooks/exhaustive-deps

  // right after switching language, never show a lesson built for the previous one
  if (isLesson && lesson && lesson.words[0] && lesson.words[0].languageId !== settings.activeLanguage) return null;
  if (isLesson && lesson) {
    if (lesson.words.length === 0) {
      return (
        <EmptyState
          emoji="🌤️"
          title="No lesson right now"
          sub={`You've learned every open ${lang.name} word and nothing is due. Come back tomorrow, unlock another goal, or create a deck.`}
          action={<button className="btn btn-primary" onClick={() => router.push("/study")}>Back to study</button>}
        />
      );
    }
    return <DailyLesson key={settings.activeLanguage} plan={lesson} onExit={() => router.push("/study")} />;
  }

  if (def && queue) {
    if (queue.length === 0) {
      return (
        <EmptyState
          emoji="🌤️"
          title="Nothing to study in this set"
          sub={`No matching ${lang.name} cards right now. Add new cards or come back when reviews are due.`}
          action={<button className="btn btn-primary" onClick={() => router.push("/study")}>Choose another mode</button>}
        />
      );
    }
    let sessionMode: QuizMode = (["daily", "weekly", "monthly"].includes(def.id) ? "multiple-choice" : def.id) as QuizMode;
    if (sessionMode === "listening" && !audioAvailable(lang.speechTag)) sessionMode = "multiple-choice";
    return (
      <Session
        key={def.id + settings.activeLanguage}
        mode={sessionMode}
        mixed={def.mixed}
        timeLimit={def.timeLimit}
        cards={queue}
        onExit={() => router.push("/study")}
      />
    );
  }

  return (
    <div className="fade-up">
      <PageHero pattern="zigzag" sticker={lang.flag} title="Study time" sub="Pick the language you want to learn, then start a lesson." action={<GoalSwitcher />} />

      {/* language picker — the only place (with the top-bar switcher) where the study language is chosen */}
      <div className="flex gap-2 overflow-x-auto pb-1 mt-3 -mx-1 px-1">
        {LANGUAGES.map((l) => {
          const active = l.id === settings.activeLanguage;
          return (
            <button key={l.id} onClick={() => setLanguage(l.id)}
              className={`shrink-0 flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 transition-all
                ${active ? "bg-accent text-white border-transparent shadow-md" : "bg-surface border-line hover:bg-surface-2"}`}>
              <span className="text-xl leading-none">{l.flag}</span>
              <span className="text-sm font-semibold whitespace-nowrap">{l.name}</span>
              {settings.goals?.[l.id] && <span className="text-xs">{goalById(settings.goals[l.id]!.focus).emoji}</span>}
            </button>
          );
        })}
      </div>

      {!goalStateFor(settings, settings.activeLanguage) ? (
        <div className="mt-4"><GoalOnboarding key={settings.activeLanguage} /></div>
      ) : (
      <>
      <div className="mt-3"><TrackCards /></div>

      <SectionTitle>Review sets</SectionTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REVIEW_SETS.map((m) => <ModeCard key={m.id} def={m} onClick={() => router.push(`/study?mode=${m.id}`)} accent />)}
      </div>

      <SectionTitle>Quiz modes</SectionTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUIZ_MODES.map((m) => {
          const soon = m.id === "listening" && !audioAvailable(lang.speechTag);
          return <ModeCard key={m.id} def={soon ? { ...m, desc: "Audio for this language is coming soon" } : m} disabled={soon} onClick={() => router.push(`/study?mode=${m.id}`)} />;
        })}
      </div>
      </>
      )}
    </div>
  );
}

function ModeCard({ def, onClick, accent = false, disabled = false }: { def: ModeDef; onClick: () => void; accent?: boolean; disabled?: boolean }) {
  const Icon = def.icon;
  return (
    <button onClick={onClick} disabled={disabled}
      className={`card p-4 md:p-5 text-left flex items-start gap-3.5 transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"}`}>
      <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${accent ? "bg-accent text-white" : "bg-accent-soft text-accent"}`}>
        <Icon size={18} />
      </span>
      <span>
        <span className="font-semibold text-[15px] block">{def.label}</span>
        <span className="text-xs text-ink-muted block mt-0.5">{def.desc}</span>
      </span>
    </button>
  );
}

async function buildQueue(
  def: ModeDef, languageId: string, newPerDay: number, deckId: string | null,
): Promise<VocabCard[]> {
  const now = Date.now();
  let cards = await db.cards.where("languageId").equals(languageId).toArray();
  if (deckId) cards = cards.filter((c) => c.deckIds.includes(deckId));

  const due = cards.filter((c) => c.srs.stage !== "new" && c.srs.dueAt <= now)
    .sort((a, b) => a.srs.dueAt - b.srs.dueAt);
  const [settingsNow, decks] = await Promise.all([db.settings.get("app"), db.decks.where("languageId").equals(languageId).toArray()]);
  const ctx = goalContext(decks, settingsNow ? goalStateFor(settingsNow, languageId as VocabCard["languageId"]) : undefined);
  const fresh = orderNewCardsForGoal(cards.filter((c) => c.srs.stage === "new"), ctx).slice(0, newPerDay);

  const shuffle = <T,>(a: T[]) => {
    const arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  switch (def.id) {
    case "daily":
      return shuffle([...due, ...fresh]).slice(0, 40);
    case "weekly": {
      const weekAgo = now - 7 * DAY_MS;
      const studied = cards.filter((c) => c.srs.lastReviewedAt >= weekAgo);
      return shuffle(studied.length ? studied : [...due, ...fresh]).slice(0, 50);
    }
    case "monthly": {
      const learned = cards.filter((c) => c.srs.stage !== "new");
      return shuffle(learned.length ? learned : fresh).slice(0, 60);
    }
    case "mistake-review": {
      const recentWrong = await db.reviews
        .where("languageId").equals(languageId)
        .and((r) => !r.correct && r.at >= now - 7 * DAY_MS)
        .toArray();
      const ids = new Set(recentWrong.map((r) => r.cardId));
      const lapsed = cards.filter((c) => ids.has(c.id) || c.srs.lapses > 0);
      return shuffle(lapsed).slice(0, 30);
    }
    case "match-pairs":
      return shuffle(cards.filter((c) => c.translation)).slice(0, 12);
    case "speed":
    case "timed":
      return shuffle(cards).slice(0, 40);
    default:
      // single-mode drills: due first, then new, topped up with learned cards
      {
        const base = [...due, ...fresh];
        if (base.length < 8) {
          const extra = shuffle(cards.filter((c) => !base.includes(c))).slice(0, 8 - base.length);
          base.push(...extra);
        }
        return shuffle(base).slice(0, 30);
      }
  }
}

export default function StudyPage() {
  return (
    <Suspense fallback={null}>
      <StudyInner />
    </Suspense>
  );
}
