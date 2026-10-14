/* ============================================================
   Speech: TTS (native + slow) and speech recognition scoring.
   Uses the Web Speech API — fully offline-capable on most OSes.
   ============================================================ */
"use client";

/* Voices load asynchronously (empty on first call in Safari/Chrome) — cache them early. */
let voiceCache: SpeechSynthesisVoice[] = [];
function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  voiceCache = window.speechSynthesis.getVoices();
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
}

/** When a device has no voice for a regional tag, fall back to one it's likely to have. */
const LANG_FALLBACK: Record<string, string[]> = {
  "ar-MA": ["ar-MA", "ar-SA", "ar-001", "ar"],
  "ar-SA": ["ar-SA", "ar-001", "ar"],
  "en-US": ["en-US", "en-GB", "en"],
  "es-ES": ["es-ES", "es-MX", "es"],
  "fr-FR": ["fr-FR", "fr-CA", "fr"],
  "de-DE": ["de-DE", "de"],
  "it-IT": ["it-IT", "it"],
  "pt-BR": ["pt-BR", "pt-PT", "pt"],
  "ru-RU": ["ru-RU", "ru"],
};

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  if (!voiceCache.length) loadVoices();
  const norm = (t: string) => t.replace("_", "-").toLowerCase();
  for (const tag of LANG_FALLBACK[lang] ?? [lang, lang.split("-")[0]]) {
    const t = norm(tag);
    const v = voiceCache.find((x) => norm(x.lang) === t) ?? voiceCache.find((x) => norm(x.lang).startsWith(t + "-") || norm(x.lang) === t);
    if (v) return v;
  }
  return undefined;
}

// Chrome garbage-collects in-flight utterances (onend never fires) unless we hold a reference.
let current: SpeechSynthesisUtterance | null = null;

/** Resolves `true` once speech finished, `false` if the browser never started speaking. */
export function speak(text: string, lang: string, rate = 1): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve(false);
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(lang);
    if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = (LANG_FALLBACK[lang] ?? [lang])[1] ?? lang; }
    u.rate = rate;
    // Some embedded browsers (e.g. in-app webviews) accept utterances but never play them.
    let started = false;
    const stall = setTimeout(() => { if (!started) { synth.cancel(); done(false); } }, 2500);
    // never leave the button stuck if the engine drops the utterance mid-way
    const fallback = setTimeout(() => done(started), 3000 + (text.length * 150) / rate);
    const done = (ok: boolean) => { clearTimeout(stall); clearTimeout(fallback); if (current === u) current = null; resolve(ok); };
    u.onstart = () => { started = true; };
    u.onend = () => done(true);
    u.onerror = () => done(started);
    current = u;
    // cancel() immediately followed by speak() drops the new utterance in Chrome — only cancel when needed
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(() => { synth.resume(); synth.speak(u); }, 80);
    } else {
      synth.resume();
      synth.speak(u);
    }
  });
}

export const speakSlow = (text: string, lang: string) => speak(text, lang, 0.55);

/* ------------------------------------------------------------
   Speech recognition → pronunciation score
   ------------------------------------------------------------ */
interface RecognitionResult {
  transcript: string;
  /** 0–100 similarity vs the target */
  score: number;
  feedback: string;
}

export function isRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function recognize(target: string, lang: string): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return reject(new Error("Speech recognition is not supported in this browser."));
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    let settled = false;
    rec.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      settled = true;
      const alternatives = Array.from(e.results[0] as ArrayLike<{ transcript: string }>).map((a) => a.transcript);
      const best = alternatives
        .map((t) => ({ t, s: similarity(normalize(t), normalize(target)) }))
        .sort((a, b) => b.s - a.s)[0];
      const score = Math.round(best.s * 100);
      resolve({ transcript: best.t, score, feedback: feedbackFor(score) });
    };
    rec.onerror = (e: { error: string }) => { if (!settled) reject(new Error(e.error)); };
    rec.onend = () => { if (!settled) reject(new Error("No speech detected — try again closer to the mic.")); };
    rec.start();
  });
}

export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "").trim();

/** Levenshtein-based similarity in [0,1] */
export function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - dp[m][n] / Math.max(m, n);
}

function feedbackFor(score: number): string {
  if (score >= 90) return "Excellent — native speakers would understand you perfectly.";
  if (score >= 75) return "Very good. Minor differences — listen to the native audio once more and mimic the rhythm.";
  if (score >= 55) return "Understandable, but some sounds drifted. Try the slow audio and repeat syllable by syllable.";
  return "Quite different from the target. Play the slow audio, watch the IPA, and try isolating the hardest syllable.";
}

/* ------------------------------------------------------------
   Timed read-aloud capture (native-speaker verification).
   Listens continuously until the speaker goes quiet, then
   reports accuracy vs the target and how long they spoke.
   ------------------------------------------------------------ */
export interface TimedRecognition {
  transcript: string;
  /** 0–100 similarity vs the target */
  accuracy: number;
  /** estimated ms of actual speaking */
  speakingMs: number;
}

export function recognizeTimed(
  target: string, lang: string, { timeoutMs = 20000, silenceMs = 1600 } = {},
): { result: Promise<TimedRecognition>; stop: () => void } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rec: any = null;
  const result = new Promise<TimedRecognition>((resolve, reject) => {
    if (!SR) return reject(new Error("not-supported"));
    rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    const startedAt = Date.now();
    let speechStart = 0;
    let lastHeard = 0;
    let finals = "";
    let interim = "";
    let error: string | null = null;
    let silenceTimer: ReturnType<typeof setTimeout> | undefined;
    const hardStop = setTimeout(() => rec.stop(), timeoutMs);

    rec.onspeechstart = () => { if (!speechStart) speechStart = Date.now(); };
    rec.onresult = (e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => {
      const now = Date.now();
      if (!speechStart) speechStart = now - 600;
      lastHeard = now;
      interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finals += " " + r[0].transcript;
        else interim += " " + r[0].transcript;
      }
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => rec.stop(), silenceMs);
    };
    rec.onerror = (e: { error: string }) => { error = e.error; };
    rec.onend = () => {
      clearTimeout(hardStop);
      clearTimeout(silenceTimer);
      const transcript = (finals + " " + interim).trim();
      if (!transcript) return reject(new Error(error ?? "no-speech"));
      const accuracy = Math.round(similarity(normalize(transcript), normalize(target)) * 100);
      const speakingMs = Math.max(300, (lastHeard || Date.now()) - (speechStart || startedAt));
      resolve({ transcript, accuracy, speakingMs });
    };
    rec.start();
  });
  return { result, stop: () => rec?.stop() };
}
