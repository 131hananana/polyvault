"use client";

/* ============================================================
   Native-speaker verification.

   The learner turns on their camera, then reads sentences that
   only appear once recording starts (so they can't rehearse).
   Each reading is scored on accuracy (speech recognition vs the
   text) and pace (natives read unfamiliar text much faster than
   learners). Pass → verified badge. Fail → escalating cooldown.

   NOTE: this runs on-device, so it's a first filter rather than
   proof. When paid "Learn with Native" launches, the captured
   stills + scores should be re-checked server-side / by a human.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Camera, Mic, ShieldCheck, BadgeCheck, Clock, AlertTriangle, Loader2, RotateCcw, CameraOff,
} from "lucide-react";
import { useAccount } from "@/components/account/useAccount";
import { Bar } from "@/components/ui";
import {
  worldLanguage, pickPrompts, nativePaceFor, passAccuracyFor, formatWait,
  startVerificationAttempt, completeVerificationAttempt, restoreVerification,
  VERIFY_PROMPT_COUNT, NativeVerification,
} from "@/lib/account";
import { recognizeTimed, isRecognitionSupported, normalize } from "@/lib/audio";

type Phase = "intro" | "camera" | "reading" | "scoring" | "done";
interface Reading { prompt: string; transcript: string; accuracy: number; pace: number; fluency: number }

const MAX_RETRIES_PER_PROMPT = 1;

export default function VerifyPage() {
  const { account } = useAccount();
  const [code, setCode] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("intro");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [retries, setRetries] = useState(0);
  const [message, setMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [outcome, setOutcome] = useState<{ passed: boolean; score: number; v: NativeVerification } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const evidenceRef = useRef<string[]>([]);
  const stopRef = useRef<(() => void) | null>(null);
  const beforeAttemptRef = useRef<NativeVerification | null>(null);

  // preselect from ?lang=… (read directly to avoid a Suspense boundary for useSearchParams)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q) setCode(q);
  }, []);
  useEffect(() => {
    if (!code && account.nativeLanguages.length) setCode(account.nativeLanguages[0].code);
  }, [account.nativeLanguages, code]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);
  useEffect(() => () => { stopRef.current?.(); stopCamera(); }, [stopCamera]);

  const native = account.nativeLanguages.find((n) => n.code === code);
  const lang = worldLanguage(code || "en-US");
  const v = native?.verification;
  const cooling = v?.status === "failed" && v.cooldownUntil && v.cooldownUntil > Date.now();

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      setPhase("camera");
      requestAnimationFrame(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
      });
    } catch {
      setCameraError("Camera access is needed to verify. Allow camera access in your browser settings and try again.");
    }
  };

  const snapshot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = Math.round((video.videoHeight / video.videoWidth) * 240);
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
    evidenceRef.current.push(canvas.toDataURL("image/jpeg", 0.6));
  };

  const begin = () => {
    setPrompts(pickPrompts(lang.base));
    setIndex(0);
    setReadings([]);
    setRetries(0);
    setMessage("");
    evidenceRef.current = [];
    setPhase("reading");
  };

  const finish = async (all: Reading[]) => {
    setPhase("scoring");
    stopCamera();
    const avgAccuracy = all.reduce((a, r) => a + r.accuracy, 0) / all.length;
    const avgFluency = all.reduce((a, r) => a + r.fluency, 0) / all.length;
    const score = Math.round(avgAccuracy * 0.7 + avgFluency * 0.3);
    const passed = all.length === VERIFY_PROMPT_COUNT && avgAccuracy >= passAccuracyFor(lang.base) && score >= 75;
    const result = await completeVerificationAttempt(code, passed, score, evidenceRef.current);
    setOutcome({ passed, score, v: result });
    setPhase("done");
  };

  /** Reveal the sentence and listen. */
  const readCurrent = async () => {
    const prompt = prompts[index];
    if (index === 0 && retries === 0 && native) {
      beforeAttemptRef.current = native.verification;
      await startVerificationAttempt(code);
    }
    setListening(true);
    setMessage("");
    const expectedMs = (normalize(prompt).replace(/\s/g, "").length / nativePaceFor(lang.base)) * 1000;
    const { result, stop } = recognizeTimed(prompt, lang.speechTag, { timeoutMs: expectedMs * 3 + 4000 });
    stopRef.current = stop;
    setTimeout(snapshot, 1200);
    try {
      const r = await result;
      const chars = normalize(r.transcript).replace(/\s/g, "").length;
      const pace = chars / (r.speakingMs / 1000);
      const fluency = Math.min(100, Math.round((pace / nativePaceFor(lang.base)) * 100));
      const next = [...readings, { prompt, transcript: r.transcript, accuracy: r.accuracy, pace, fluency }];
      setReadings(next);
      setRetries(0);
      if (next.length >= prompts.length) await finish(next);
      else setIndex(index + 1);
    } catch (e) {
      const err = (e as Error).message;
      if (err === "not-allowed" || err === "service-not-allowed") {
        if (readings.length === 0 && beforeAttemptRef.current) await restoreVerification(code, beforeAttemptRef.current);
        setMessage("Microphone or speech recognition is blocked. Allow microphone access — on iPhone, open PolyVault in Safari instead of the home-screen app.");
      } else if (retries < MAX_RETRIES_PER_PROMPT) {
        setRetries(retries + 1);
        setMessage("We didn't catch that. Get closer to the mic and read it again.");
      } else {
        // nothing usable twice in a row → the attempt ends as a fail
        await finish(readings.length ? readings : [{ prompt, transcript: "", accuracy: 0, pace: 0, fluency: 0 }]);
      }
    } finally {
      setListening(false);
      stopRef.current = null;
    }
  };

  /* ---------------- render ---------------- */
  const supported = typeof window === "undefined" || isRecognitionSupported();

  return (
    <div className="fade-up max-w-xl mx-auto">
      <Link href="/account" className="btn btn-ghost !px-2 -ml-2 mb-2 text-sm"><ArrowLeft size={15} /> Account</Link>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
        <ShieldCheck className="text-accent" /> Native verification
      </h1>

      {account.nativeLanguages.length === 0 ? (
        <div className="card p-6 mt-6 text-sm">
          Add a native language to your profile first.{" "}
          <Link href="/account/edit#languages" className="text-accent font-semibold">Add native language</Link>
        </div>
      ) : (
        <>
          {phase === "intro" && (
            <div className="mt-6 grid gap-4">
              <div className="card p-5">
                <label className="text-xs font-medium text-ink-muted">Language to verify</label>
                <select className="input mt-1.5" value={code} onChange={(e) => setCode(e.target.value)}>
                  {account.nativeLanguages.map((n) => {
                    const l = worldLanguage(n.code);
                    return <option key={n.code} value={n.code}>{l.flag} {l.name}{n.verification.status === "verified" ? " ✓" : ""}</option>;
                  })}
                </select>
              </div>

              {v?.status === "verified" ? (
                <div className="card p-6 text-center">
                  <BadgeCheck size={40} className="text-ok mx-auto" />
                  <div className="font-semibold mt-2">You&apos;re a verified native {lang.name} speaker</div>
                  <div className="text-sm text-ink-muted mt-1">Score {v.score} · verified {new Date(v.verifiedAt!).toLocaleDateString()}</div>
                </div>
              ) : cooling ? (
                <div className="card p-6 text-center">
                  <Clock size={36} className="text-warn mx-auto" />
                  <div className="font-semibold mt-2">Try again {formatWait(v!.cooldownUntil! - Date.now())}</div>
                  <div className="text-sm text-ink-muted mt-1">
                    Your last attempt scored {v!.score}. Each failed attempt adds a longer wait (1 day → 3 days → 7 days).
                  </div>
                </div>
              ) : !supported ? (
                <div className="card p-5 flex gap-3 text-sm">
                  <AlertTriangle className="text-warn shrink-0" size={18} />
                  <div>This browser can&apos;t do speech recognition. Open PolyVault in <b>Chrome</b> (Mac) or <b>Safari</b> (iPhone/Mac) to verify.</div>
                </div>
              ) : (
                <div className="card p-5">
                  <div className="font-semibold">How it works</div>
                  <ol className="text-sm text-ink-muted mt-2 grid gap-2 list-decimal pl-5">
                    <li>Turn on your camera and sit in a quiet place.</li>
                    <li>{VERIFY_PROMPT_COUNT} sentences in {lang.name} will appear <b>one at a time</b>, only after you press <i>Read</i>.</li>
                    <li>Read each one aloud naturally, at your normal speed.</li>
                    <li>We check accuracy and natural pace. Pass → you get the <BadgeCheck size={13} className="inline text-ok" /> verified badge. Not this time → you can try again later.</li>
                  </ol>
                  {v && v.attempts > 0 && <div className="text-xs text-ink-faint mt-3">Previous attempts: {v.attempts}</div>}
                  {cameraError && <div className="text-sm text-bad mt-3 flex gap-2"><CameraOff size={16} className="shrink-0" />{cameraError}</div>}
                  <button className="btn btn-primary w-full mt-4" onClick={startCamera} disabled={!code}>
                    <Camera size={16} /> Turn on camera
                  </button>
                </div>
              )}
            </div>
          )}

          {(phase === "camera" || phase === "reading") && (
            <div className="mt-6 grid gap-4">
              <div className="card overflow-hidden relative aspect-[4/3] bg-black">
                <video ref={videoRef} muted playsInline className="w-full h-full object-cover -scale-x-100" />
                <div className="absolute top-3 left-3 pill !bg-black/50 !text-white !border-transparent">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Camera on
                </div>
                {phase === "reading" && (
                  <div className="absolute top-3 right-3 pill !bg-black/50 !text-white !border-transparent">
                    {Math.min(index + 1, prompts.length)} / {prompts.length}
                  </div>
                )}
              </div>

              {phase === "camera" && (
                <div className="card p-5 text-center">
                  <div className="text-sm text-ink-muted">Make sure your face is clearly visible. The first sentence appears when you press Read.</div>
                  <button className="btn btn-primary w-full mt-4" onClick={begin}>I&apos;m ready</button>
                </div>
              )}

              {phase === "reading" && (
                <div className="card p-5">
                  {listening ? (
                    <>
                      <div className="text-xs font-semibold text-accent flex items-center gap-1.5 mb-3">
                        <Mic size={14} className="animate-pulse" /> Listening — read aloud now
                      </div>
                      <p dir={lang.rtl ? "rtl" : "ltr"} className="text-xl md:text-2xl font-medium leading-relaxed native-script">
                        {prompts[index]}
                      </p>
                      <button className="btn btn-outline w-full mt-4" onClick={() => stopRef.current?.()}>Done reading</button>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-ink-muted text-center">
                        Sentence {index + 1} of {prompts.length} is hidden until you start.
                      </div>
                      {message && <div className="text-sm text-warn mt-3 text-center">{message}</div>}
                      <button className="btn btn-primary w-full mt-4" onClick={readCurrent}>
                        {retries > 0 ? <><RotateCcw size={15} /> Read again</> : <><Mic size={15} /> Read</>}
                      </button>
                    </>
                  )}
                  <div className="mt-4"><Bar pct={(readings.length / Math.max(1, prompts.length)) * 100} /></div>
                </div>
              )}
            </div>
          )}

          {phase === "scoring" && (
            <div className="card p-10 mt-6 text-center">
              <Loader2 className="animate-spin mx-auto text-accent" />
              <div className="text-sm text-ink-muted mt-3">Checking your readings…</div>
            </div>
          )}

          {phase === "done" && outcome && (
            <div className="mt-6 grid gap-4">
              <div className={`card p-6 text-center ${outcome.passed ? "!bg-ok-soft !border-transparent" : ""}`}>
                {outcome.passed
                  ? <BadgeCheck size={48} className="text-ok mx-auto" />
                  : <Clock size={44} className="text-warn mx-auto" />}
                <div className="text-lg font-bold mt-2">
                  {outcome.passed ? `Verified native ${lang.name} speaker!` : "Not verified this time"}
                </div>
                <div className="text-sm text-ink-muted mt-1">
                  Score {outcome.score}/100
                  {!outcome.passed && outcome.v.cooldownUntil && <> · you can try again {formatWait(outcome.v.cooldownUntil - Date.now())}</>}
                </div>
                {outcome.passed && <div className="text-sm mt-2">{lang.flag} Your flag now shows a <b>verified</b> badge on your profile.</div>}
              </div>

              <div className="card p-5">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Your readings</div>
                <div className="grid gap-3">
                  {readings.map((r, i) => (
                    <div key={i} className="rounded-xl bg-surface-2 p-3 text-sm">
                      <div dir={lang.rtl ? "rtl" : "ltr"} className="font-medium">{r.prompt}</div>
                      <div dir={lang.rtl ? "rtl" : "ltr"} className="text-ink-muted mt-1">Heard: “{r.transcript || "—"}”</div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span>Accuracy <b>{r.accuracy}%</b></span>
                        <span>Pace <b>{r.fluency}%</b> of native</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/account" className="btn btn-primary flex-1">Back to account</Link>
                {outcome.passed && <Link href="/account/preview" className="btn btn-outline flex-1">See my profile</Link>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
