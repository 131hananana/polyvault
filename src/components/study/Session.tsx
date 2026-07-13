"use client";

/* ============================================================
   Study session engine — builds the queue, renders the right
   question type per mode, applies SM-2 grades, and hands
   mistakes to the AI tutor for the mastery loop.
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Timer } from "lucide-react";
import Link from "next/link";
import {
  VocabCard, QuizMode, Grade, GRADE_LABELS, languageById,
} from "@/lib/types";
import { previewIntervals } from "@/lib/srs/sm2";
import { recordAnswer, logSession } from "@/lib/db";
import {
  MultipleChoiceQ, ReverseQ, TypingQ, ListeningQ, FillBlankQ,
  SentenceCompletionQ, PronunciationQ, FlashcardQ, distractorsFor,
} from "./questions";
import { TutorPanel } from "./TutorPanel";
import { MatchPairs } from "./MatchPairs";
import { Bar } from "@/components/ui";

interface Props {
  mode: QuizMode;
  cards: VocabCard[];
  onExit: () => void;
  /** mixed = rotate question types (daily/weekly/monthly review) */
  mixed?: boolean;
  /** seconds for the timed challenge */
  timeLimit?: number;
}

const MIXED_ROTATION: QuizMode[] = ["multiple-choice", "typing", "listening", "reverse", "fill-blank", "sentence-completion"];
/** modes where a wrong answer opens the AI tutor mastery loop */
const TUTORED: QuizMode[] = ["multiple-choice", "typing", "listening", "reverse", "fill-blank", "sentence-completion", "daily-review" as QuizMode, "mistake-review"];

export function Session({ mode, cards, onExit, mixed = false, timeLimit }: Props) {
  const [queue, setQueue] = useState<VocabCard[]>(cards);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [wrong, setWrong] = useState<{ userAnswer: string; correctAnswer: string } | null>(null);
  const [mistakeCounts, setMistakeCounts] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ seen: 0, correct: 0, xp: 0 });
  const startedAt = useRef(Date.now());
  const cardShownAt = useRef(Date.now());
  const [timeLeft, setTimeLeft] = useState(timeLimit ?? 0);
  const loggedRef = useRef(false);

  const card = queue[idx];
  const lang = card ? languageById(card.languageId) : null;

  // per-card question mode when mixed
  const cardMode: QuizMode = useMemo(() => {
    if (!mixed) return mode;
    return MIXED_ROTATION[idx % MIXED_ROTATION.length];
  }, [mixed, mode, idx]);

  /* ---- timed challenge countdown ---- */
  useEffect(() => {
    if (!timeLimit || done) return;
    const t = setInterval(() => setTimeLeft((s) => {
      if (s <= 1) { clearInterval(t); setDone(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [timeLimit, done]);

  /* ---- finish & log session ---- */
  useEffect(() => {
    if (!done || loggedRef.current || stats.seen === 0) return;
    loggedRef.current = true;
    logSession({
      languageId: cards[0]?.languageId ?? "fr", mode,
      startedAt: startedAt.current, endedAt: Date.now(),
      cardsSeen: stats.seen, correct: stats.correct, xpEarned: stats.xp,
    });
  }, [done, stats, cards, mode]);

  const advance = useCallback(() => {
    setRevealed(false);
    setWrong(null);
    cardShownAt.current = Date.now();
    if (idx + 1 >= queue.length) setDone(true);
    else setIdx(idx + 1);
  }, [idx, queue.length]);

  const applyGrade = useCallback(async (grade: Grade) => {
    if (!card) return;
    const took = Date.now() - cardShownAt.current;
    await recordAnswer(card, grade, cardMode, took);
    setStats((s) => ({
      seen: s.seen + 1,
      correct: s.correct + (grade >= 2 ? 1 : 0),
      xp: s.xp + [1, 3, 5, 7][grade],
    }));
  }, [card, cardMode]);

  /* ---- flashcard grading ---- */
  const gradeFlashcard = async (grade: Grade) => {
    await applyGrade(grade);
    if (grade === 0) {
      // "Again" re-queues the card later in this session
      setQueue((q) => [...q, card]);
    }
    advance();
  };

  /* ---- quiz answer handling ---- */
  const handleAnswer = async (correct: boolean, userAnswer: string) => {
    if (!card) return;
    if (correct) {
      const took = Date.now() - cardShownAt.current;
      await applyGrade(took < 6000 ? 2 : 2);
      advance();
    } else {
      setMistakeCounts((m) => ({ ...m, [card.id]: (m[card.id] ?? 0) + 1 }));
      await applyGrade(0);
      if (TUTORED.includes(mixed ? "multiple-choice" : mode)) {
        setWrong({ userAnswer, correctAnswer: answerFor(cardMode, card) });
      } else {
        setQueue((q) => [...q, card]); // speed/timed: silently re-queue
        advance();
      }
    }
  };

  const tutorDone = () => {
    // after mastery, the card returns later in the session for a clean pass
    setQueue((q) => [...q, card]);
    advance();
  };

  /* ---- match pairs is a batch mode ---- */
  if (mode === "match-pairs" && !done) {
    const batch = queue.slice(0, 6);
    return (
      <SessionFrame onExit={onExit} progress={0} label="Match pairs">
        <MatchPairs
          cards={batch}
          onComplete={async (results) => {
            for (const r of results) {
              const c = batch.find((b) => b.id === r.cardId);
              if (c) await recordAnswer(c, r.misses === 0 ? 2 : r.misses === 1 ? 1 : 0, "match-pairs", 0);
            }
            setStats((s) => ({
              seen: s.seen + results.length,
              correct: s.correct + results.filter((r) => r.misses === 0).length,
              xp: s.xp + results.reduce((a, r) => a + (r.misses === 0 ? 5 : 3), 0),
            }));
            if (queue.length > 6) setQueue((q) => q.slice(6));
            else setDone(true);
          }}
        />
      </SessionFrame>
    );
  }

  /* ---- summary screen ---- */
  if (done || !card) {
    const accuracy = stats.seen ? Math.round((stats.correct / stats.seen) * 100) : 0;
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    return (
      <div className="max-w-md mx-auto mt-10 fade-up">
        <div className="card p-8 text-center">
          <div className="text-5xl">{accuracy >= 90 ? "🏆" : accuracy >= 70 ? "🎉" : "💪"}</div>
          <h2 className="text-2xl font-bold mt-3">Session complete</h2>
          <p className="text-sm text-ink-muted mt-1">{minutes} min · {mode.replace(/-/g, " ")}</p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div><div className="text-2xl font-bold">{stats.seen}</div><div className="text-xs text-ink-muted">answers</div></div>
            <div><div className="text-2xl font-bold text-ok">{accuracy}%</div><div className="text-xs text-ink-muted">accuracy</div></div>
            <div><div className="text-2xl font-bold text-accent">+{stats.xp}</div><div className="text-xs text-ink-muted">XP</div></div>
          </div>
          <div className="flex gap-2 justify-center mt-7">
            <button onClick={onExit} className="btn btn-outline">Back to study</button>
            <Link href="/" className="btn btn-primary">Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---- active question ---- */
  const progress = (idx / queue.length) * 100;
  const isFlash = cardMode === "flashcards" || mode === "flashcards";
  const previews = previewIntervals(card.srs);

  return (
    <SessionFrame
      onExit={onExit}
      progress={progress}
      label={`${idx + 1} / ${queue.length}`}
      timer={timeLimit ? timeLeft : undefined}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id + ":" + idx}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {isFlash ? (
            <>
              <FlashcardQ card={card} revealed={revealed} onReveal={() => setRevealed(true)} />
              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2 mt-5">
                    {([0, 1, 2, 3] as Grade[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => gradeFlashcard(g)}
                        className={`btn flex-col !gap-0.5 !py-3 border
                          ${g === 0 ? "!bg-bad-soft !text-bad !border-transparent hover:!border-bad" :
                            g === 1 ? "!bg-warn-soft !text-warn !border-transparent hover:!border-warn" :
                            g === 2 ? "!bg-ok-soft !text-ok !border-transparent hover:!border-ok" :
                            "!bg-accent-soft !text-accent !border-transparent hover:!border-accent"}`}
                      >
                        <span className="text-sm font-bold">{GRADE_LABELS[g]}</span>
                        <span className="text-[10px] opacity-70">{previews[g]}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : wrong ? (
            <TutorPanel
              card={card}
              userAnswer={wrong.userAnswer}
              correctAnswer={wrong.correctAnswer}
              mode={cardMode}
              mistakeCount={mistakeCounts[card.id] ?? 1}
              distractors={distractorsFor(card, queue, cardMode === "reverse" || cardMode === "sentence-completion" ? "word" : "translation")}
              onMastered={tutorDone}
            />
          ) : (
            <div className="card !rounded-3xl p-6 md:p-8">
              {renderQuestion(cardMode, card, queue, handleAnswer, timeLimit ? 6 : undefined)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {lang && !isFlash && !wrong && (
        <p className="text-center text-xs text-ink-faint mt-4">{lang.flag} {lang.name} · {card.topic} · {card.cefr}</p>
      )}
    </SessionFrame>
  );
}

function answerFor(mode: QuizMode, card: VocabCard): string {
  switch (mode) {
    case "reverse":
    case "typing":
    case "fill-blank":
    case "sentence-completion":
      return card.word;
    default:
      return card.translation;
  }
}

function renderQuestion(
  mode: QuizMode, card: VocabCard, pool: VocabCard[],
  onAnswer: (c: boolean, a: string) => void, speedSeconds?: number,
) {
  const props = { card, pool, onAnswer };
  switch (mode) {
    case "multiple-choice": return <MultipleChoiceQ {...props} />;
    case "reverse": return <ReverseQ {...props} />;
    case "typing": return <TypingQ {...props} />;
    case "listening": return <ListeningQ {...props} />;
    case "fill-blank": return <FillBlankQ {...props} />;
    case "sentence-completion": return <SentenceCompletionQ {...props} />;
    case "pronunciation": return <PronunciationQ {...props} />;
    case "speed": return <SpeedQ {...props} seconds={speedSeconds ?? 6} />;
    case "timed": return <MultipleChoiceQ {...props} />;
    default: return <MultipleChoiceQ {...props} />;
  }
}

/** MCQ with a per-question countdown; timeout = wrong */
function SpeedQ({ card, pool, onAnswer, seconds }: {
  card: VocabCard; pool: VocabCard[]; onAnswer: (c: boolean, a: string) => void; seconds: number;
}) {
  const [left, setLeft] = useState(seconds);
  const answeredRef = useRef(false);
  useEffect(() => {
    setLeft(seconds);
    answeredRef.current = false;
    const t = setInterval(() => setLeft((s) => {
      if (s <= 1) {
        clearInterval(t);
        if (!answeredRef.current) { answeredRef.current = true; onAnswer(false, "(time out)"); }
        return 0;
      }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <div className="flex justify-center mb-2">
        <span className={`pill ${left <= 2 ? "!bg-bad-soft !text-bad" : ""}`}><Timer size={11} /> {left}s</span>
      </div>
      <MultipleChoiceQ card={card} pool={pool} onAnswer={(c, a) => {
        if (answeredRef.current) return;
        answeredRef.current = true;
        onAnswer(c, a);
      }} />
    </div>
  );
}

function SessionFrame({ children, onExit, progress, label, timer }: {
  children: React.ReactNode; onExit: () => void; progress: number; label: string; timer?: number;
}) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onExit} className="btn btn-ghost !p-2" aria-label="Exit session"><X size={18} /></button>
        <div className="flex-1"><Bar pct={progress} /></div>
        {timer !== undefined && (
          <span className={`pill ${timer <= 10 ? "!bg-bad-soft !text-bad" : ""}`}><Timer size={11} /> {timer}s</span>
        )}
        <span className="text-xs font-medium text-ink-muted whitespace-nowrap">{label}</span>
      </div>
      {children}
    </div>
  );
}
