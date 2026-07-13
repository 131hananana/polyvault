"use client";

/* ============================================================
   Question renderers for every quiz mode.
   Each receives the card + distractor pool and reports
   (correct, userAnswer) exactly once via onAnswer.
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, Eye } from "lucide-react";
import { VocabCard, languageById } from "@/lib/types";
import { AudioButton } from "@/components/AudioButton";
import { speak } from "@/lib/audio";
import { recognize, isRecognitionSupported } from "@/lib/audio";

export interface QuestionProps {
  card: VocabCard;
  pool: VocabCard[]; // other cards in the same language, for distractors
  onAnswer: (correct: boolean, userAnswer: string) => void;
}

/* ---------- helpers ---------- */
const headword = (c: VocabCard) =>
  c.word.replace(/^(le |la |les |l'|el |la |los |las |un |una |the )/i, "").trim();

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();

function pick<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export function distractorsFor(card: VocabCard, pool: VocabCard[], field: "word" | "translation", n = 3): string[] {
  const others = pool.filter((c) => c.id !== card.id);
  const same = others.filter((c) => c.partOfSpeech === card.partOfSpeech);
  const source = same.length >= n ? same : others;
  return pick(source, n).map((c) => (field === "word" ? c.word : c.translation));
}

/* ---------- option buttons ---------- */
function Options({ options, answer, onPick, dir }: {
  options: string[]; answer: string; onPick: (correct: boolean, chosen: string) => void; dir?: "rtl" | "ltr";
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div className="grid gap-2.5 mt-6">
      {options.map((o, i) => {
        const state = chosen === null ? "idle" : o === answer ? "right" : o === chosen ? "wrong" : "dim";
        return (
          <motion.button
            key={o + i}
            dir={dir}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: state === "dim" ? 0.45 : 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            disabled={chosen !== null}
            onClick={() => { setChosen(o); setTimeout(() => onPick(o === answer, o), 650); }}
            className={`btn justify-start !py-3.5 !rounded-xl text-[15px] border text-left
              ${state === "right" ? "!bg-ok-soft !border-ok !text-ok" :
                state === "wrong" ? "!bg-bad-soft !border-bad !text-bad" :
                "btn-outline"}`}
          >
            <span className="w-6 h-6 rounded-lg bg-surface-2 grid place-items-center text-xs font-bold mr-1 shrink-0">{i + 1}</span>
            {o}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---------- typing input ---------- */
function TypeAnswer({ answer, placeholder, dir, onSubmit, acceptAlso = [] }: {
  answer: string; placeholder: string; dir?: "rtl" | "ltr";
  onSubmit: (correct: boolean, typed: string) => void; acceptAlso?: string[];
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "right" | "wrong">("idle");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);

  const submit = () => {
    if (!value.trim() || state !== "idle") return;
    const ok = [answer, ...acceptAlso].some((a) => norm(a) === norm(value));
    setState(ok ? "right" : "wrong");
    setTimeout(() => onSubmit(ok, value.trim()), 700);
  };

  return (
    <div className="mt-6">
      <input
        ref={ref}
        dir={dir}
        className={`input !py-3.5 text-lg text-center
          ${state === "right" ? "!border-ok !shadow-none !bg-ok-soft" : ""}
          ${state === "wrong" ? "!border-bad !shadow-none !bg-bad-soft" : ""}`}
        placeholder={placeholder}
        value={value}
        disabled={state !== "idle"}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      {state === "wrong" && <div className="text-center text-sm mt-2 text-bad">Correct answer: <b>{answer}</b></div>}
      <button onClick={submit} disabled={!value.trim() || state !== "idle"} className="btn btn-primary w-full mt-3">Check</button>
    </div>
  );
}

/* ============================================================
   Modes
   ============================================================ */

export function MultipleChoiceQ({ card, pool, onAnswer }: QuestionProps) {
  const options = useMemo(
    () => pick([card.translation, ...distractorsFor(card, pool, "translation")], 4),
    [card.id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const lang = languageById(card.languageId);
  return (
    <div>
      <p className="text-sm text-ink-muted text-center">What does this mean?</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <h2 dir={lang.rtl ? "rtl" : "ltr"} className="text-3xl font-bold text-center native-script">{card.nativeScript || card.word}</h2>
        <AudioButton text={card.nativeScript || card.word} lang={lang.speechTag} />
      </div>
      {card.romanization && <p className="text-center text-ink-muted mt-1">{card.romanization}</p>}
      <Options options={options} answer={card.translation} onPick={onAnswer} />
    </div>
  );
}

export function ReverseQ({ card, pool, onAnswer }: QuestionProps) {
  const options = useMemo(
    () => pick([card.word, ...distractorsFor(card, pool, "word")], 4),
    [card.id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const lang = languageById(card.languageId);
  return (
    <div>
      <p className="text-sm text-ink-muted text-center">How do you say…</p>
      <h2 className="text-3xl font-bold text-center mt-3">“{card.translation}”</h2>
      <Options options={options} answer={card.word} onPick={onAnswer} dir={lang.rtl ? "rtl" : "ltr"} />
    </div>
  );
}

export function TypingQ({ card, onAnswer }: QuestionProps) {
  const lang = languageById(card.languageId);
  return (
    <div>
      <p className="text-sm text-ink-muted text-center">Type the {lang.name} word for</p>
      <h2 className="text-3xl font-bold text-center mt-3">“{card.translation}”</h2>
      {card.pronunciation && <p className="text-center text-ink-faint text-sm mt-1">{card.pronunciation}</p>}
      <TypeAnswer
        answer={headword(card)}
        acceptAlso={[card.word, card.nativeScript, card.romanization ?? ""]}
        placeholder={`Type in ${lang.name}…`}
        dir={lang.rtl ? "rtl" : "ltr"}
        onSubmit={onAnswer}
      />
    </div>
  );
}

export function ListeningQ({ card, pool, onAnswer }: QuestionProps) {
  const lang = languageById(card.languageId);
  const options = useMemo(
    () => pick([card.translation, ...distractorsFor(card, pool, "translation")], 4),
    [card.id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  useEffect(() => { speak(card.nativeScript || card.word, lang.speechTag); }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <p className="text-sm text-ink-muted text-center">Listen — what does it mean?</p>
      <div className="flex justify-center gap-3 mt-5">
        <button onClick={() => speak(card.nativeScript || card.word, lang.speechTag)} className="btn btn-primary !rounded-full !p-5" aria-label="Play">
          <Volume2 size={24} />
        </button>
        <AudioButton text={card.nativeScript || card.word} lang={lang.speechTag} slow className="!p-5 !rounded-full border border-line" />
      </div>
      <Options options={options} answer={card.translation} onPick={onAnswer} />
    </div>
  );
}

export function FillBlankQ({ card, onAnswer }: QuestionProps) {
  const lang = languageById(card.languageId);
  const ex = card.examples[0];
  const head = headword(card);
  const blanked = useMemo(() => {
    if (!ex) return null;
    const src = ex.native;
    const idx = src.toLowerCase().indexOf(head.toLowerCase());
    if (idx >= 0) return src.slice(0, idx) + " ______ " + src.slice(idx + head.length);
    const nsIdx = src.indexOf(card.nativeScript);
    if (nsIdx >= 0) return src.slice(0, nsIdx) + " ______ " + src.slice(nsIdx + card.nativeScript.length);
    return null;
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ex || !blanked) return <TypingQ card={card} pool={[]} onAnswer={onAnswer} />;
  return (
    <div>
      <p className="text-sm text-ink-muted text-center">Fill in the blank</p>
      <p dir={lang.rtl ? "rtl" : "ltr"} className="text-xl font-semibold text-center mt-4 native-script leading-relaxed">{blanked}</p>
      <p className="text-center text-ink-muted text-sm mt-2 italic">“{ex.translation}”</p>
      <TypeAnswer
        answer={head}
        acceptAlso={[card.word, card.nativeScript]}
        placeholder="Missing word…"
        dir={lang.rtl ? "rtl" : "ltr"}
        onSubmit={onAnswer}
      />
    </div>
  );
}

export function SentenceCompletionQ({ card, pool, onAnswer }: QuestionProps) {
  const lang = languageById(card.languageId);
  const ex = card.examples[Math.min(1, card.examples.length - 1)];
  const head = headword(card);
  const options = useMemo(
    () => pick([card.word, ...distractorsFor(card, pool, "word")], 4),
    [card.id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const blanked = useMemo(() => {
    if (!ex) return null;
    const src = ex.native;
    const idx = src.toLowerCase().indexOf(head.toLowerCase());
    if (idx >= 0) return src.slice(0, idx) + " ______ " + src.slice(idx + head.length);
    const nsIdx = src.indexOf(card.nativeScript);
    if (nsIdx >= 0) return src.slice(0, nsIdx) + " ______ " + src.slice(nsIdx + card.nativeScript.length);
    return null;
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ex || !blanked) return <MultipleChoiceQ card={card} pool={pool} onAnswer={onAnswer} />;
  return (
    <div>
      <p className="text-sm text-ink-muted text-center">Complete the sentence</p>
      <p dir={lang.rtl ? "rtl" : "ltr"} className="text-xl font-semibold text-center mt-4 native-script leading-relaxed">{blanked}</p>
      <p className="text-center text-ink-muted text-sm mt-2 italic">“{ex.translation}”</p>
      <Options options={options} answer={card.word} onPick={onAnswer} dir={lang.rtl ? "rtl" : "ltr"} />
    </div>
  );
}

export function PronunciationQ({ card, onAnswer }: QuestionProps) {
  const lang = languageById(card.languageId);
  const [state, setState] = useState<"idle" | "listening" | "done">("idle");
  const [result, setResult] = useState<{ transcript: string; score: number; feedback: string } | null>(null);
  const supported = isRecognitionSupported();

  const start = async () => {
    setState("listening");
    try {
      const r = await recognize(card.nativeScript || card.word, lang.speechTag);
      setResult(r);
      setState("done");
    } catch (e) {
      setResult({ transcript: "", score: 0, feedback: e instanceof Error ? e.message : "Recognition failed." });
      setState("done");
    }
  };

  return (
    <div className="text-center">
      <p className="text-sm text-ink-muted">Say this out loud</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <h2 dir={lang.rtl ? "rtl" : "ltr"} className="text-3xl font-bold native-script">{card.nativeScript || card.word}</h2>
        <AudioButton text={card.nativeScript || card.word} lang={lang.speechTag} />
        <AudioButton text={card.nativeScript || card.word} lang={lang.speechTag} slow />
      </div>
      {card.ipa && <p className="text-ink-muted mt-1 font-mono text-sm">{card.ipa}</p>}
      {card.romanization && <p className="text-ink-muted text-sm">{card.romanization}</p>}

      {!supported && (
        <div className="mt-6">
          <p className="text-sm text-warn">Speech recognition isn&apos;t available in this browser — self-assess instead.</p>
          <div className="flex justify-center gap-2 mt-4">
            <button className="btn btn-outline" onClick={() => onAnswer(false, "self: needs work")}>Needs work</button>
            <button className="btn btn-primary" onClick={() => onAnswer(true, "self: nailed it")}>Nailed it</button>
          </div>
        </div>
      )}

      {supported && state !== "done" && (
        <motion.button
          onClick={start}
          disabled={state === "listening"}
          animate={state === "listening" ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className={`btn !rounded-full !p-6 mt-8 ${state === "listening" ? "!bg-bad text-white" : "btn-primary"}`}
          aria-label="Record"
        >
          <Mic size={26} />
        </motion.button>
      )}
      {state === "listening" && <p className="text-sm text-ink-muted mt-3">Listening…</p>}

      {state === "done" && result && (
        <div className="mt-6 fade-up">
          <div className={`text-5xl font-bold ${result.score >= 75 ? "text-ok" : result.score >= 55 ? "text-warn" : "text-bad"}`}>
            {result.score}
          </div>
          <div className="text-xs text-ink-muted">pronunciation score</div>
          {result.transcript && <p className="text-sm mt-2">Heard: “{result.transcript}”</p>}
          <p className="text-sm text-ink-muted mt-2 max-w-sm mx-auto">{result.feedback}</p>
          <div className="flex justify-center gap-2 mt-5">
            <button className="btn btn-outline" onClick={start}>Try again</button>
            <button className="btn btn-primary" onClick={() => onAnswer(result.score >= 60, result.transcript)}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- classic flashcard with flip + grade buttons handled by Session ---------- */
export function FlashcardQ({ card, revealed, onReveal }: {
  card: VocabCard; revealed: boolean; onReveal: () => void;
}) {
  const lang = languageById(card.languageId);
  return (
    <div className="flip-scene cursor-pointer select-none" onClick={() => !revealed && onReveal()}>
      <div className={`flip-inner min-h-[300px] ${revealed ? "flipped" : ""}`}>
        <div className="flip-face card !rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center gap-3">
          <span className="pill">{card.partOfSpeech} · {card.cefr}</span>
          <h2 dir={lang.rtl ? "rtl" : "ltr"} className="text-4xl font-bold text-center native-script">{card.nativeScript || card.word}</h2>
          {card.romanization && <p className="text-ink-muted">{card.romanization}</p>}
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <AudioButton text={card.nativeScript || card.word} lang={lang.speechTag} />
            <AudioButton text={card.nativeScript || card.word} lang={lang.speechTag} slow />
          </div>
          <p className="text-xs text-ink-faint flex items-center gap-1 mt-2"><Eye size={12} /> tap to reveal</p>
        </div>

        <div className="flip-back flip-face card !rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center gap-2 overflow-y-auto">
          <h3 className="text-2xl font-bold text-center">{card.translation}</h3>
          {card.ipa && <p className="text-ink-muted font-mono text-sm">{card.ipa}</p>}
          {card.examples[0] && (
            <div className="text-center mt-3 text-sm">
              <p dir={lang.rtl ? "rtl" : "ltr"} className="font-medium native-script">{card.examples[0].native}</p>
              <p className="text-ink-muted italic mt-1">{card.examples[0].translation}</p>
            </div>
          )}
          {card.memoryTips && <p className="text-xs text-ink-muted bg-surface-2 rounded-xl px-3 py-2 mt-3 max-w-sm text-center">💡 {card.memoryTips}</p>}
        </div>
      </div>
    </div>
  );
}
