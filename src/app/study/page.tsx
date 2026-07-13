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
import { VocabCard, QuizMode, languageById, DAY_MS } from "@/lib/types";
import { Session } from "@/components/study/Session";
import { EmptyState, SectionTitle } from "@/components/ui";

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
  { id: "daily", label: "Daily review", desc: "Today's due + new cards, mixed drills", icon: CalendarCheck, mixed: true },
  { id: "weekly", label: "Weekly review", desc: "Everything you studied this week", icon: CalendarRange, mixed: true },
  { id: "monthly", label: "Monthly review", desc: "Long-term consolidation pass", icon: CalendarClock, mixed: true },
  { id: "mistake-review", label: "Mistake review", desc: "Re-drill your recent errors", icon: Bug, mixed: true },
];

function StudyInner() {
  const { settings, ready } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const modeParam = params.get("mode");
  const deckId = params.get("deck");
  const lang = languageById(settings.activeLanguage);

  const [queue, setQueue] = useState<VocabCard[] | null>(null);
  const def = [...QUIZ_MODES, ...REVIEW_SETS].find((m) => m.id === modeParam);

  useEffect(() => {
    if (!ready || !def) { setQueue(null); return; }
    buildQueue(def, settings.activeLanguage, settings.newCardsPerDay, deckId).then(setQueue);
  }, [ready, modeParam, settings.activeLanguage, settings.newCardsPerDay, deckId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const sessionMode: QuizMode = (["daily", "weekly", "monthly"].includes(def.id) ? "multiple-choice" : def.id) as QuizMode;
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
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Study {lang.flag}</h1>
      <p className="text-sm text-ink-muted mt-1">Every mode feeds the same SM-2 schedule — mistakes summon your AI tutor.</p>

      <SectionTitle>Review sets</SectionTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REVIEW_SETS.map((m) => <ModeCard key={m.id} def={m} onClick={() => router.push(`/study?mode=${m.id}`)} accent />)}
      </div>

      <SectionTitle>Quiz modes</SectionTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUIZ_MODES.map((m) => <ModeCard key={m.id} def={m} onClick={() => router.push(`/study?mode=${m.id}`)} />)}
      </div>
    </div>
  );
}

function ModeCard({ def, onClick, accent = false }: { def: ModeDef; onClick: () => void; accent?: boolean }) {
  const Icon = def.icon;
  return (
    <button onClick={onClick}
      className="card p-4 md:p-5 text-left flex items-start gap-3.5 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer">
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
  const fresh = cards.filter((c) => c.srs.stage === "new").slice(0, newPerDay);

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
