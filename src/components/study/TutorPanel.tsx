"use client";

/* ============================================================
   AI Personal Tutor — appears after a wrong answer.
   Explains the mistake, compares confusable vocabulary,
   then drills personalized follow-up exercises until the
   learner answers everything correctly (mastery loop).
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Lightbulb, Scale, ListChecks, ArrowRight, Loader2 } from "lucide-react";
import { VocabCard, TutorExercise, QuizMode, languageById } from "@/lib/types";
import { getTutorFeedback, TutorResult } from "@/lib/ai/client";

interface Props {
  card: VocabCard;
  userAnswer: string;
  correctAnswer: string;
  mode: QuizMode;
  mistakeCount: number;
  distractors: string[];
  /** called when the learner has demonstrated mastery */
  onMastered: () => void;
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();

export function TutorPanel({ card, userAnswer, correctAnswer, mode, mistakeCount, distractors, onMastered }: Props) {
  const [feedback, setFeedback] = useState<TutorResult | null>(null);
  const [phase, setPhase] = useState<"explain" | "drill" | "done">("explain");
  const [queue, setQueue] = useState<TutorExercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [streakNeeded, setStreakNeeded] = useState(0);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    getTutorFeedback(card, userAnswer, correctAnswer, mode, mistakeCount, distractors).then((f) => {
      setFeedback(f);
      setQueue(f.exercises);
      setStreakNeeded(f.exercises.length);
    });
  }, [card, userAnswer, correctAnswer, mode, mistakeCount, distractors]);

  const current = queue[idx];

  const handleExercise = (correct: boolean) => {
    if (correct) {
      if (idx + 1 >= queue.length) {
        setPhase("done");
      } else {
        setIdx(idx + 1);
      }
    } else {
      // mastery loop: a miss re-queues the exercise at the end
      setQueue((q) => [...q.slice(0, idx), ...q.slice(idx + 1), q[idx]]);
      // idx stays — next exercise slides into place
    }
  };

  if (!feedback) {
    return (
      <div className="card p-8 flex flex-col items-center gap-3 mt-4">
        <Loader2 className="animate-spin text-accent" size={22} />
        <p className="text-sm text-ink-muted">Your tutor is analyzing the mistake…</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
      <div className="card !border-accent/30 overflow-hidden">
        <div className="bg-accent-soft px-5 py-3 flex items-center gap-2">
          <GraduationCap size={17} className="text-accent" />
          <span className="font-semibold text-sm text-accent">AI Tutor</span>
          <span className="text-xs text-ink-muted ml-auto">
            {feedback.source === "claude" ? "Claude" : "offline tutor"}
            {phase === "drill" && ` · exercise ${Math.min(idx + 1, queue.length)}/${queue.length}`}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {phase === "explain" && (
            <motion.div key="explain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 grid gap-4">
              <Section icon={<Lightbulb size={15} />} title="Why that was wrong">
                {feedback.whyWrong}
              </Section>
              <Section icon={<Scale size={15} />} title="Compare & contrast">
                {feedback.comparison}
              </Section>
              {feedback.subtleDifferences.length > 0 && (
                <Section icon={<ListChecks size={15} />} title="Subtle differences">
                  <ul className="list-disc ml-4 space-y-1">
                    {feedback.subtleDifferences.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </Section>
              )}
              <Section icon={<Lightbulb size={15} />} title="Memory technique">
                {feedback.memoryTechnique}
              </Section>
              <button className="btn btn-primary mt-1" onClick={() => setPhase("drill")}>
                Practice until it sticks ({queue.length} exercises) <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {phase === "drill" && current && (
            <motion.div key={`drill-${idx}-${queue.length}-${current.prompt}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5">
              <ExerciseView exercise={current} card={card} onDone={handleExercise} />
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center">
              <div className="text-4xl">🎯</div>
              <h3 className="font-bold text-lg mt-2">Mastery demonstrated</h3>
              <p className="text-sm text-ink-muted mt-1">You answered all {streakNeeded} follow-up exercises correctly.</p>
              <button className="btn btn-primary mt-4" onClick={onMastered}>Continue session <ArrowRight size={15} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
        {icon} {title}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------
   Single tutor exercise (MCQ / typing / fill-blank)
   ------------------------------------------------------------ */
function ExerciseView({ exercise, card, onDone }: {
  exercise: TutorExercise; card: VocabCard; onDone: (correct: boolean) => void;
}) {
  const lang = languageById(card.languageId);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<"idle" | "right" | "wrong">("idle");
  const [chosen, setChosen] = useState<string | null>(null);

  const options = useMemo(() => exercise.options ?? [], [exercise]);

  const finish = (ok: boolean) => {
    setResult(ok ? "right" : "wrong");
    setTimeout(() => {
      setResult("idle"); setTyped(""); setChosen(null);
      onDone(ok);
    }, ok ? 800 : 1800);
  };

  return (
    <div>
      <p className="font-semibold text-[15px]">{exercise.prompt}</p>
      {exercise.sentence && (
        <p dir={lang.rtl ? "rtl" : "ltr"} className="mt-2 text-lg native-script bg-surface-2 rounded-xl px-4 py-3">{exercise.sentence}</p>
      )}

      {exercise.type === "multiple-choice" && options.length > 0 ? (
        <div className="grid gap-2 mt-4">
          {options.map((o) => {
            const state = chosen === null ? "idle" : o === exercise.answer ? "right" : o === chosen ? "wrong" : "dim";
            return (
              <button key={o} disabled={chosen !== null}
                onClick={() => { setChosen(o); finish(norm(o) === norm(exercise.answer)); }}
                className={`btn justify-start btn-outline !py-3 text-left
                  ${state === "right" ? "!bg-ok-soft !border-ok !text-ok" : ""}
                  ${state === "wrong" ? "!bg-bad-soft !border-bad !text-bad" : ""}
                  ${state === "dim" ? "opacity-50" : ""}`}>
                {o}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4">
          <input
            className={`input text-center
              ${result === "right" ? "!border-ok !bg-ok-soft" : ""}
              ${result === "wrong" ? "!border-bad !bg-bad-soft" : ""}`}
            dir={lang.rtl ? "rtl" : "ltr"}
            placeholder="Your answer…"
            value={typed}
            disabled={result !== "idle"}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && typed.trim() && finish(norm(typed) === norm(exercise.answer))}
          />
          <button className="btn btn-primary w-full mt-2.5" disabled={!typed.trim() || result !== "idle"}
            onClick={() => finish(norm(typed) === norm(exercise.answer))}>
            Check
          </button>
        </div>
      )}

      {result === "wrong" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm bg-bad-soft text-bad rounded-xl px-4 py-3">
          <b>{exercise.answer}</b> — {exercise.explanation}
          <div className="text-xs mt-1 opacity-80">This one will come back until you get it right.</div>
        </motion.div>
      )}
      {result === "right" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm bg-ok-soft text-ok rounded-xl px-4 py-3">
          Correct! {exercise.explanation}
        </motion.div>
      )}
    </div>
  );
}
