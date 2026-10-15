"use client";

/* ============================================================
   Daily lesson
   1. Learn — every word shown 3× in shuffled rounds
      (round 1 meet it, rounds 2–3 recall before revealing)
   2. Quiz — five steps in a fixed order, one question type each:
      choose → blank → puzzle → listen → speak
   3. Grade — one SM-2 grade per word from its mistakes
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, BookOpen, ListChecks, TextCursorInput, Puzzle, Ear, Mic, ArrowRight, Eye, Check,
} from "lucide-react";
import { VocabCard, Grade, languageById } from "@/lib/types";
import { recordAnswer, logSession } from "@/lib/db";
import { speak, audioAvailable } from "@/lib/audio";
import { DailyLessonPlan } from "@/lib/lesson";
import { ReadAs, ExampleLine } from "@/components/ReadAs";
import { Bar } from "@/components/ui";
import { pick } from "../questions";
import {
  ChoiceStep, BlankStep, PuzzleStep, ListenStep, SpeakStep, canBlank, canPuzzle,
} from "./steps";

const LEARN_ROUNDS = 3;

const STEPS = [
  { id: "choice", title: "Choose the meaning", short: "A · B · C", icon: ListChecks, eligible: () => true },
  { id: "blank", title: "Fill in the blank", short: "Blanks", icon: TextCursorInput, eligible: canBlank },
  { id: "puzzle", title: "Build the sentence", short: "Puzzle", icon: Puzzle, eligible: canPuzzle },
  // skipped for languages whose audio is still coming soon (Darija)
  { id: "listen", title: "Listen", short: "Listen", icon: Ear, eligible: (c: VocabCard) => audioAvailable(languageById(c.languageId).speechTag) },
  { id: "speak", title: "Speak", short: "Speak", icon: Mic, eligible: () => true },
] as const;
type StepId = (typeof STEPS)[number]["id"];

type Phase =
  | { kind: "learn"; round: number; order: VocabCard[]; pos: number; revealed: boolean; unsure: string[] }
  | { kind: "learn-break"; round: number; unsure: string[] }
  | { kind: "step-intro"; step: number }
  | { kind: "quiz"; step: number; queue: VocabCard[]; pos: number }
  | { kind: "saving" }
  | { kind: "done" };

const shuffle = <T,>(a: T[]) => pick(a, a.length);

export function DailyLesson({ plan, onExit }: { plan: DailyLessonPlan; onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>({ kind: "learn", round: 1, order: shuffle(plan.learn), pos: 0, revealed: false, unsure: [] });
  const mistakes = useRef<Record<string, number>>({});
  const retried = useRef<Set<string>>(new Set());
  const [stepScore, setStepScore] = useState<Record<StepId, { ok: number; total: number }>>(
    () => Object.fromEntries(STEPS.map((s) => [s.id, { ok: 0, total: 0 }])) as Record<StepId, { ok: number; total: number }>,
  );
  const [xp, setXp] = useState(0);
  const startedAt = useRef(Date.now());
  const lang = languageById(plan.words[0].languageId);
  // handlers read the live phase (closures on cards that are animating out are stale)
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const go = (next: Phase) => { phaseRef.current = next; setPhase(next); };

  /* ---------------- learn phase ---------------- */
  // every action names its card so taps on a card that is animating out are ignored
  const nextLearn = (cardId: string, knew?: boolean) => {
    const phase = phaseRef.current;
    if (phase.kind !== "learn") return;
    const card = phase.order[phase.pos];
    if (card.id !== cardId) return;
    const unsure = knew === false ? [...phase.unsure, card.id] : phase.unsure;
    if (phase.pos + 1 < phase.order.length) {
      go({ ...phase, pos: phase.pos + 1, revealed: false, unsure });
    } else {
      go({ kind: "learn-break", round: phase.round, unsure });
    }
  };

  const startRound = (round: number, cards: VocabCard[]) =>
    go({ kind: "learn", round, order: shuffle(cards), pos: 0, revealed: false, unsure: [] });

  /* ---------------- quiz phase ---------------- */
  const startStep = (step: number) => {
    if (step >= STEPS.length) return finish();
    const queue = shuffle(plan.words.filter((c) => STEPS[step].eligible(c)));
    if (!queue.length) return startStep(step + 1);
    retried.current = new Set();
    go({ kind: "step-intro", step });
    setTimeout(() => go({ kind: "quiz", step, queue, pos: 0 }), 1100);
  };

  const answer = (cardId: string, correct: boolean | "skip") => {
    const phase = phaseRef.current;
    if (phase.kind !== "quiz") return;
    const card = phase.queue[phase.pos];
    if (card.id !== cardId) return;
    const stepId = STEPS[phase.step].id;
    let queue = phase.queue;
    if (correct !== "skip") {
      setStepScore((s) => ({ ...s, [stepId]: { ok: s[stepId].ok + (correct ? 1 : 0), total: s[stepId].total + 1 } }));
      if (correct) setXp((x) => x + 2);
      if (!correct) {
        mistakes.current[card.id] = (mistakes.current[card.id] ?? 0) + 1;
        // one retry per word per step, at the end of the step
        if (!retried.current.has(card.id)) { retried.current.add(card.id); queue = [...queue, card]; }
      }
    }
    if (phase.pos + 1 < queue.length) go({ ...phase, queue, pos: phase.pos + 1 });
    else startStep(phase.step + 1);
  };

  /* ---------------- grading ---------------- */
  const finish = async () => {
    go({ kind: "saving" });
    let earned = 0;
    for (const c of plan.words) {
      const m = mistakes.current[c.id] ?? 0;
      const grade: Grade = m === 0 ? 2 : m === 1 ? 1 : 0;
      await recordAnswer(c, grade, "daily-lesson", 0);
      earned += [1, 3, 5, 7][grade];
    }
    const seen = Object.values(stepScore).reduce((a, s) => a + s.total, 0);
    const ok = Object.values(stepScore).reduce((a, s) => a + s.ok, 0);
    await logSession({
      languageId: plan.words[0].languageId, mode: "daily-lesson",
      startedAt: startedAt.current, endedAt: Date.now(),
      cardsSeen: plan.words.length, correct: Math.round((ok / Math.max(1, seen)) * plan.words.length), xpEarned: earned + xp,
    });
    setXp((x) => x + earned);
    go({ kind: "done" });
  };

  /* ---------------- progress bar ---------------- */
  const learnTotal = plan.learn.length * LEARN_ROUNDS;
  const progress = useMemo(() => {
    if (phase.kind === "learn") return (((phase.round - 1) * plan.learn.length + phase.pos) / learnTotal) * 35;
    if (phase.kind === "learn-break") return (phase.round / LEARN_ROUNDS) * 35;
    if (phase.kind === "step-intro") return 35 + (phase.step / STEPS.length) * 65;
    if (phase.kind === "quiz") return 35 + ((phase.step + phase.pos / phase.queue.length) / STEPS.length) * 65;
    return 100;
  }, [phase, plan.learn.length, learnTotal]);

  const activeStep = phase.kind === "quiz" || phase.kind === "step-intro" ? phase.step : phase.kind === "done" || phase.kind === "saving" ? STEPS.length : -1;

  /* ---------------- render ---------------- */
  if (phase.kind === "done") {
    return <Summary plan={plan} stepScore={stepScore} xp={xp} mistakes={mistakes.current} minutes={Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))} onExit={onExit} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-3 mb-3">
        <button onClick={onExit} className="btn btn-ghost !p-2" aria-label="Exit lesson"><X size={18} /></button>
        <div className="flex-1"><Bar pct={progress} /></div>
        <span className="text-lg">{lang.flag}</span>
      </div>

      {/* stepper */}
      <div className="flex items-center justify-between gap-1 mb-5 px-1">
        <StepDot icon={BookOpen} label="Learn" state={activeStep === -1 ? "active" : "done"} />
        {STEPS.map((s, i) => (
          <StepDot key={s.id} icon={s.icon} label={s.short} state={activeStep === i ? "active" : activeStep > i ? "done" : "todo"} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase.kind === "learn" && (
          <motion.div key={`learn-${phase.round}-${phase.pos}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
            <LearnCard
              card={phase.order[phase.pos]}
              round={phase.round}
              index={phase.pos}
              total={phase.order.length}
              revealed={phase.revealed || phase.round === 1}
              onReveal={() => go({ ...phase, revealed: true })}
              onNext={(knew) => nextLearn(phase.order[phase.pos].id, knew)}
            />
          </motion.div>
        )}

        {phase.kind === "learn-break" && (
          <motion.div key={`break-${phase.round}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <LearnBreak
              round={phase.round}
              unsure={plan.learn.filter((c) => phase.unsure.includes(c.id))}
              onNextRound={() => startRound(phase.round + 1, plan.learn)}
              onPracticeUnsure={() => startRound(phase.round + 1, plan.learn.filter((c) => phase.unsure.includes(c.id)))}
              onQuiz={() => startStep(0)}
            />
          </motion.div>
        )}

        {phase.kind === "step-intro" && (
          <motion.div key={`intro-${phase.step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-10 text-center">
            {(() => { const S = STEPS[phase.step]; const Icon = S.icon; return (
              <>
                <span className="sticker w-16 h-16 bg-accent-soft text-accent mx-auto"><Icon size={28} /></span>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mt-4">Step {phase.step + 1} of {STEPS.length}</div>
                <h2 className="text-2xl font-display font-semibold mt-1">{S.title}</h2>
              </>
            ); })()}
          </motion.div>
        )}

        {phase.kind === "quiz" && (
          <motion.div key={`q-${phase.step}-${phase.pos}-${phase.queue[phase.pos].id}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
            <div className="card !rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between text-xs text-ink-muted mb-4">
                <span className="font-semibold">Step {phase.step + 1} · {STEPS[phase.step].title}</span>
                <span>{phase.pos + 1} / {phase.queue.length}</span>
              </div>
              <QuizStep step={STEPS[phase.step].id} card={phase.queue[phase.pos]} pool={plan.pool} onAnswer={(c) => answer(phase.queue[phase.pos].id, c)} />
            </div>
          </motion.div>
        )}

        {phase.kind === "saving" && (
          <motion.div key="saving" className="card p-10 text-center text-sm text-ink-muted">Saving your progress…</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuizStep({ step, card, pool, onAnswer }: { step: StepId; card: VocabCard; pool: VocabCard[]; onAnswer: (c: boolean | "skip") => void }) {
  switch (step) {
    case "choice": return <ChoiceStep card={card} pool={pool} onAnswer={onAnswer} />;
    case "blank": return <BlankStep card={card} pool={pool} onAnswer={onAnswer} />;
    case "puzzle": return <PuzzleStep card={card} pool={pool} onAnswer={onAnswer} />;
    case "listen": return <ListenStep card={card} pool={pool} onAnswer={onAnswer} />;
    case "speak": return <SpeakStep card={card} pool={pool} onAnswer={onAnswer} onSkip={() => onAnswer("skip")} />;
  }
}

function StepDot({ icon: Icon, label, state }: { icon: React.ComponentType<{ size?: number }>; label: string; state: "todo" | "active" | "done" }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <span className={`w-8 h-8 rounded-full grid place-items-center transition-colors
        ${state === "active" ? "bg-accent text-white shadow-md" : state === "done" ? "bg-ok-soft text-ok" : "bg-surface-2 text-ink-faint"}`}>
        {state === "done" ? <Check size={15} /> : <Icon size={15} />}
      </span>
      <span className={`text-[10px] truncate max-w-full ${state === "active" ? "text-accent font-semibold" : "text-ink-faint"}`}>{label}</span>
    </div>
  );
}

/* ---------------- learning card ---------------- */
function LearnCard({ card, round, index, total, revealed, onReveal, onNext }: {
  card: VocabCard; round: number; index: number; total: number; revealed: boolean;
  onReveal: () => void; onNext: (knew?: boolean) => void;
}) {
  const lang = languageById(card.languageId);
  const spoken = card.nativeScript || card.word;
  useEffect(() => { speak(spoken, lang.speechTag); }, [card.id, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const recall = round > 1;

  return (
    <div className="card !rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span className="font-semibold">{recall ? `Round ${round} · Recall it` : "Round 1 · Meet the words"}</span>
        <span>{index + 1} / {total}</span>
      </div>

      <div className="text-center mt-6">
        <span className="pill">{card.topic}</span>
        <h2 dir={lang.rtl ? "rtl" : "ltr"} className="text-4xl md:text-5xl font-bold mt-3 native-script">{spoken}</h2>
        <div className="mt-3"><ReadAs card={card} center /></div>
      </div>

      {revealed ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div className="text-center text-2xl font-semibold text-accent">{card.translation}</div>
          {card.examples[0] && (
            <div className="mt-5 rounded-2xl bg-surface-2 p-4 text-sm">
              <ExampleLine {...card.examples[0]} languageId={card.languageId} />
            </div>
          )}
          {card.usageNotes && <p className="text-xs text-ink-muted bg-sun/15 rounded-xl px-3 py-2 mt-3">💡 {card.usageNotes}</p>}

          {recall ? (
            <div className="grid grid-cols-2 gap-2 mt-6">
              <button className="btn btn-outline !py-3" onClick={() => onNext(false)}>😅 Not yet</button>
              <button className="btn btn-primary !py-3" onClick={() => onNext(true)}>👍 I knew it</button>
            </div>
          ) : (
            <button className="btn btn-primary w-full !py-3 mt-6" onClick={() => onNext()}>Next <ArrowRight size={16} /></button>
          )}
        </motion.div>
      ) : (
        <div className="mt-8">
          <p className="text-center text-sm text-ink-muted">Say the meaning in your head first…</p>
          <button className="btn btn-primary w-full !py-3 mt-3" onClick={onReveal}><Eye size={16} /> Show meaning</button>
        </div>
      )}
    </div>
  );
}

function LearnBreak({ round, unsure, onNextRound, onPracticeUnsure, onQuiz }: {
  round: number; unsure: VocabCard[]; onNextRound: () => void; onPracticeUnsure: () => void; onQuiz: () => void;
}) {
  const allRoundsDone = round >= LEARN_ROUNDS;
  return (
    <div className="hero pattern-confetti p-8 text-center">
      <div className="text-4xl">{allRoundsDone ? (unsure.length ? "🤔" : "🧠") : round === 1 ? "👀" : "💪"}</div>
      {!allRoundsDone ? (
        <>
          <h2 className="text-xl font-display font-semibold mt-3">Round {round} done!</h2>
          <p className="text-sm text-ink-muted mt-1 max-w-sm mx-auto">
            Round {round + 1} of {LEARN_ROUNDS}: the words come back in a new order. Try to recall each meaning before you reveal it.
          </p>
          <button className="btn btn-primary mt-5" onClick={onNextRound}>Start round {round + 1} <ArrowRight size={16} /></button>
        </>
      ) : unsure.length ? (
        <>
          <h2 className="text-xl font-display font-semibold mt-3">Almost there</h2>
          <p className="text-sm text-ink-muted mt-1">You&apos;re still unsure about {unsure.length} word{unsure.length > 1 ? "s" : ""}:</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {unsure.map((c) => <span key={c.id} className="pill !text-sm">{c.nativeScript || c.word}</span>)}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <button className="btn btn-outline" onClick={onPracticeUnsure}>Practice these again</button>
            <button className="btn btn-primary" onClick={onQuiz}>Start the quiz <ArrowRight size={16} /></button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-display font-semibold mt-3">You&apos;ve got them!</h2>
          <p className="text-sm text-ink-muted mt-1">Now 5 short steps to lock them in: choose, fill, build, listen, speak.</p>
          <button className="btn btn-primary mt-5" onClick={onQuiz}>Start the quiz <ArrowRight size={16} /></button>
        </>
      )}
    </div>
  );
}

/* ---------------- summary ---------------- */
function Summary({ plan, stepScore, xp, mistakes, minutes, onExit }: {
  plan: DailyLessonPlan; stepScore: Record<StepId, { ok: number; total: number }>; xp: number;
  mistakes: Record<string, number>; minutes: number; onExit: () => void;
}) {
  const ok = Object.values(stepScore).reduce((a, s) => a + s.ok, 0);
  const total = Object.values(stepScore).reduce((a, s) => a + s.total, 0);
  const accuracy = total ? Math.round((ok / total) * 100) : 0;
  return (
    <div className="max-w-md mx-auto fade-up">
      <div className="hero pattern-confetti p-8 text-center">
        <div className="text-5xl">{accuracy >= 90 ? "🏆" : accuracy >= 70 ? "🎉" : "💪"}</div>
        <h2 className="text-2xl font-display font-semibold mt-3">Lesson complete</h2>
        <p className="text-sm text-ink-muted mt-1">{minutes} min · {plan.words.length} words</p>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div><div className="text-2xl font-bold">{plan.learn.length}</div><div className="text-xs text-ink-muted">words learned</div></div>
          <div><div className="text-2xl font-bold text-ok">{accuracy}%</div><div className="text-xs text-ink-muted">accuracy</div></div>
          <div><div className="text-2xl font-bold text-accent">+{xp}</div><div className="text-xs text-ink-muted">XP</div></div>
        </div>
      </div>

      <div className="card p-5 mt-3 grid gap-2.5">
        {STEPS.map((s) => {
          const sc = stepScore[s.id];
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex items-center gap-3 text-sm">
              <Icon size={15} />
              <span className="flex-1">{s.title}</span>
              <span className="text-ink-muted">{sc.total ? `${sc.ok}/${sc.total}` : "skipped"}</span>
            </div>
          );
        })}
      </div>

      <div className="card divide-y divide-line mt-3">
        {plan.words.map((c) => (
          <div key={c.id} className="p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-sm native-script">{c.nativeScript || c.word} <span className="text-ink-muted font-normal">· {c.translation}</span></div>
              <div className="mt-1"><ReadAs card={c} compact audio={false} /></div>
            </div>
            <span className={`pill shrink-0 ${(mistakes[c.id] ?? 0) === 0 ? "!bg-ok-soft !text-ok !border-transparent" : "!bg-warn-soft !text-warn !border-transparent"}`}>
              {(mistakes[c.id] ?? 0) === 0 ? "perfect" : `${mistakes[c.id]} slip${mistakes[c.id] > 1 ? "s" : ""}`}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center mt-5">
        <button onClick={onExit} className="btn btn-outline">Back to study</button>
        <Link href="/" className="btn btn-primary">Dashboard</Link>
      </div>
    </div>
  );
}
