/* ============================================================
   Speech: TTS (native + slow) and speech recognition scoring.
   Uses the Web Speech API — fully offline-capable on most OSes.
   ============================================================ */
"use client";

export function speak(text: string, lang: string, rate = 1): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang === lang) ??
      voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
    if (match) u.voice = match;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
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

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "").trim();

/** Levenshtein-based similarity in [0,1] */
function similarity(a: string, b: string): number {
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
