"use client";

/* ============================================================
   The five daily-lesson steps, always in this order:
   1 choose the meaning · 2 fill the blank · 3 build the sentence
   4 listen · 5 speak
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Eye, RotateCcw, Check } from "lucide-react";
import { VocabCard, languageById } from "@/lib/types";
import { speak } from "@/lib/audio";
import { blankOut, tilesOf } from "@/lib/lesson";
import { AudioButton } from "@/components/AudioButton";
import { ReadAs, ExampleLine } from "@/components/ReadAs";
import { Options, PronunciationQ, pick } from "../questions";

export interface StepProps {
  card: VocabCard;
  pool: VocabCard[];
  onAnswer: (correct: boolean) => void;
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();

/** Meanings of other cards, preferring the same part of speech. */
function meaningDistractors(card: VocabCard, pool: VocabCard[], n: number): string[] {
  // skip meanings that overlap the answer ("please" vs "please (warm)") — they make questions ambiguous
  const core = (t: string) => norm(t.replace(/\(.*?\)/g, "")).split(" ").filter((w) => w.length > 2);
  const answerWords = new Set(core(card.translation));
  const others = pool.filter((c) =>
    c.id !== card.id && norm(c.translation) !== norm(card.translation) &&
    !core(c.translation).some((w) => answerWords.has(w)));
  const same = others.filter((c) => c.partOfSpeech === card.partOfSpeech);
  return pick(same.length >= n ? same : others, n).map((c) => c.translation);
}

/* ---------- 1 · choose the meaning (A / B / C) ---------- */
export function ChoiceStep({ card, pool, onAnswer }: StepProps) {
  const lang = languageById(card.languageId);
  const options = useMemo(() => pick([card.translation, ...meaningDistractors(card, pool, 2)], 3), [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <p className="text-sm text-ink-muted text-center">What does this mean?</p>
      <h2 dir={lang.rtl ? "rtl" : "ltr"} className="text-3xl md:text-4xl font-bold text-center mt-3 native-script">{card.nativeScript || card.word}</h2>
      <div className="mt-3"><ReadAs card={card} center /></div>
      <Options options={options} answer={card.translation} onPick={(ok) => onAnswer(ok)} />
    </div>
  );
}

/* ---------- 2 · fill in the blank (word bank) ---------- */
export function canBlank(card: VocabCard) { return blankOut(card) !== null; }

export function BlankStep({ card, pool, onAnswer }: StepProps) {
  const lang = languageById(card.languageId);
  const dir = lang.rtl ? "rtl" : "ltr";
  const parts = blankOut(card)!;
  const options = useMemo(() => {
    const others = pool
      .filter((c) => c.id !== card.id)
      .map((c) => blankOut(c)?.answer ?? (c.nativeScript || c.word))
      .filter((w) => norm(w) !== norm(parts.answer));
    return pick([parts.answer, ...pick(Array.from(new Set(others)), 2)], 3);
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [chosen, setChosen] = useState<string | null>(null);
  const ok = chosen !== null && norm(chosen) === norm(parts.answer);

  const choose = (o: string) => {
    if (chosen) return;
    setChosen(o);
    if (norm(o) === norm(parts.answer)) speak(card.examples[0].native, lang.speechTag);
    setTimeout(() => onAnswer(norm(o) === norm(parts.answer)), norm(o) === norm(parts.answer) ? 1100 : 1800);
  };

  return (
    <div>
      <p className="text-sm text-ink-muted text-center">Fill in the blank</p>
      <p dir={dir} className="text-xl md:text-2xl font-semibold text-center mt-4 native-script leading-relaxed">
        {parts.before}
        <span className={`inline-block min-w-16 mx-1 px-2 rounded-lg border-b-2 ${chosen === null ? "border-accent text-transparent" : ok ? "border-ok text-ok bg-ok-soft" : "border-bad text-bad bg-bad-soft"}`}>
          {chosen ?? "____"}
        </span>
        {parts.after}
      </p>
      <p className="text-center text-ink-muted text-sm mt-2 italic">“{card.examples[0].translation}”</p>
      {chosen && !ok && <p className="text-center text-sm mt-2">Correct: <b dir={dir}>{parts.answer}</b></p>}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {options.map((o) => (
          <button key={o} dir={dir} disabled={chosen !== null} onClick={() => choose(o)}
            className={`btn btn-outline !py-3 !px-5 text-base native-script ${chosen === o ? (ok ? "!bg-ok-soft !border-ok" : "!bg-bad-soft !border-bad") : ""}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- 3 · build the sentence from tiles ---------- */
export function canPuzzle(card: VocabCard) {
  const n = card.examples[0] ? tilesOf(card.examples[0].native).length : 0;
  return n >= 3 && n <= 10;
}

export function PuzzleStep({ card, onAnswer }: StepProps) {
  const lang = languageById(card.languageId);
  const dir = lang.rtl ? "rtl" : "ltr";
  const target = useMemo(() => tilesOf(card.examples[0].native), [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const shuffled = useMemo(() => {
    const idx = target.map((_, i) => i);
    for (let tries = 0; tries < 10; tries++) {
      const s = pick(idx, idx.length);
      if (s.some((v, i) => v !== i)) return s;
    }
    return idx.reverse();
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);

  const answer = picked.map((i) => target[i]).join(" ");
  const check = () => {
    const right = norm(answer) === norm(target.join(" "));
    setResult(right ? "right" : "wrong");
    if (right) {
      speak(card.examples[0].native, lang.speechTag);
      setTimeout(() => onAnswer(true), 1200);
    }
  };

  return (
    <div>
      <p className="text-sm text-ink-muted text-center">Build the sentence</p>
      <p className="text-center text-lg font-semibold mt-3">“{card.examples[0].translation}”</p>

      <div dir={dir}
        className={`mt-5 min-h-16 rounded-2xl border-2 border-dashed p-3 flex flex-wrap gap-2 content-start
          ${result === "right" ? "border-ok bg-ok-soft" : result === "wrong" ? "border-bad bg-bad-soft" : "border-line"}`}>
        {picked.length === 0 && <span className="text-sm text-ink-faint m-auto">Tap the words in the right order</span>}
        {picked.map((ti, pos) => (
          <motion.button layout key={ti} disabled={result !== null}
            onClick={() => setPicked(picked.filter((_, p) => p !== pos))}
            className="btn btn-outline !py-2 !px-3 !rounded-xl native-script">
            {target[ti]}
          </motion.button>
        ))}
      </div>

      <div dir={dir} className="mt-4 flex flex-wrap justify-center gap-2">
        {shuffled.map((ti) => picked.includes(ti) ? (
          <span key={ti} className="rounded-xl px-3 py-2 bg-surface-2 text-transparent select-none native-script">{target[ti]}</span>
        ) : (
          <motion.button layout key={ti} disabled={result !== null} onClick={() => setPicked([...picked, ti])}
            className="btn !py-2 !px-3 !rounded-xl bg-surface border border-line shadow-sm native-script">
            {target[ti]}
          </motion.button>
        ))}
      </div>

      {result === "wrong" ? (
        <div className="mt-5 text-center">
          <div className="text-sm text-bad font-semibold">Not quite — the sentence is:</div>
          <div className="mt-2 inline-block text-left"><ExampleLine {...card.examples[0]} languageId={card.languageId} /></div>
          <button className="btn btn-primary w-full mt-4" onClick={() => onAnswer(false)}>Continue</button>
        </div>
      ) : (
        <div className="flex gap-2 mt-6">
          <button className="btn btn-ghost" disabled={!picked.length || result !== null} onClick={() => setPicked([])}><RotateCcw size={15} /> Reset</button>
          <button className="btn btn-primary flex-1" disabled={picked.length !== target.length || result !== null} onClick={check}>
            <Check size={16} /> Check
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- 4 · listen and pick the meaning ---------- */
export function ListenStep({ card, pool, onAnswer }: StepProps) {
  const lang = languageById(card.languageId);
  const spoken = card.nativeScript || card.word;
  const options = useMemo(() => pick([card.translation, ...meaningDistractors(card, pool, 2)], 3), [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showText, setShowText] = useState(false);
  useEffect(() => { speak(spoken, lang.speechTag); }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <p className="text-sm text-ink-muted text-center">Listen — what does it mean?</p>
      <div className="flex justify-center items-center gap-3 mt-5">
        <button onClick={() => speak(spoken, lang.speechTag)} className="btn btn-primary !rounded-full !p-5" aria-label="Play">
          <Volume2 size={26} />
        </button>
        <AudioButton text={spoken} lang={lang.speechTag} slow className="!p-4 !rounded-full border border-line" />
      </div>
      <div className="text-center mt-3">
        {showText
          ? <span dir={lang.rtl ? "rtl" : "ltr"} className="text-xl font-semibold native-script">{spoken}</span>
          : <button className="text-xs text-ink-faint inline-flex items-center gap-1" onClick={() => setShowText(true)}><Eye size={12} /> Can&apos;t listen right now? Show the word</button>}
      </div>
      <Options options={options} answer={card.translation} onPick={(ok) => onAnswer(ok)} />
    </div>
  );
}

/* ---------- 5 · speak it ---------- */
export function SpeakStep({ card, pool, onAnswer, onSkip }: StepProps & { onSkip: () => void }) {
  return (
    <div>
      <PronunciationQ card={card} pool={pool} onAnswer={(ok) => onAnswer(ok)} />
      <div className="text-center mt-4">
        <button className="text-xs text-ink-faint underline-offset-2 hover:underline" onClick={onSkip}>Can&apos;t speak right now — skip</button>
      </div>
    </div>
  );
}
