"use client";

/* ============================================================
   Connect — practise with people by text, voice or video.

   Every user first signs the community declaration. Outgoing
   messages are moderated: sexual content bans immediately,
   moving to other apps / sharing contacts earns strikes then
   a ban. Until live matching ships, text practice runs with an
   AI partner (clearly labelled) and calls show a lobby.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle, Phone, Video, ShieldCheck, ShieldAlert, Flag, Send, ArrowLeft, Ban, Loader2, Languages, X, Bot,
} from "lucide-react";
import { useApp } from "@/components/Providers";
import { useAccount } from "@/components/account/useAccount";
import { PageHero } from "@/components/ui";
import { AudioButton } from "@/components/AudioButton";
import { LANGUAGES, LanguageId, languageById, goalById } from "@/lib/types";
import { COMMUNITY_RULES, OFF_PLATFORM_STRIKES_BEFORE_BAN } from "@/lib/moderation";
import { acceptCommunityRules, checkOutgoing } from "@/lib/safety";
import { getPartnerReply, PartnerTurn } from "@/lib/ai/client";
import { VAULT_TO_WORLD } from "@/lib/account";
import { goalStateFor } from "@/lib/goals";

type Format = "text" | "voice" | "video";
const FORMATS: { id: Format; label: string; icon: typeof Video; desc: string }[] = [
  { id: "text", label: "Text chat", icon: MessageCircle, desc: "Type at your own pace — great for beginners" },
  { id: "voice", label: "Voice call", icon: Phone, desc: "Practise listening and speaking out loud" },
  { id: "video", label: "Video call", icon: Video, desc: "Face to face, like a real conversation" },
];

export default function ConnectPage() {
  const { account } = useAccount();
  const { settings } = useApp();
  const [format, setFormat] = useState<Format | null>(null);
  const [practice, setPractice] = useState<LanguageId>(settings.activeLanguage);
  const [room, setRoom] = useState<Format | null>(null);

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("format");
    if (f === "text" || f === "voice" || f === "video") setFormat(f);
  }, []);

  const safety = account.safety;
  if (safety?.bannedAt) return <BannedScreen reason={safety.banReason} />;
  if (!safety?.rulesAcceptedAt) return <RulesGate />;

  if (room === "text") return <ChatRoom languageId={practice} onLeave={() => setRoom(null)} />;
  if (room) return <CallLobby format={room} languageId={practice} onLeave={() => setRoom(null)} onText={() => setRoom("text")} />;

  return (
    <div className="fade-up max-w-3xl mx-auto">
      <PageHero pattern="confetti" sticker="🌍" title="Connect" sub="Practise with real people — by text, voice or video." />

      <div className="card p-5 mt-4">
        <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">I want to practise</div>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button key={l.id} onClick={() => setPractice(l.id)}
              className={`pill !text-sm !py-1.5 !px-3 ${practice === l.id ? "!bg-accent !text-white !border-transparent" : "hover:!bg-surface-3"}`}>
              <span className="text-base">{l.flag}</span> {l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        {FORMATS.map(({ id, label, icon: Icon, desc }) => (
          <button key={id} onClick={() => setFormat(id)}
            className={`card p-5 text-left transition-all hover:-translate-y-0.5 ${format === id ? "!border-accent ring-2 ring-[var(--accent-soft)]" : ""}`}>
            <span className={`w-11 h-11 rounded-2xl grid place-items-center ${format === id ? "bg-accent text-white" : "bg-accent-soft text-accent"}`}><Icon size={20} /></span>
            <div className="font-display font-semibold text-lg mt-3">{label}</div>
            <div className="text-sm text-ink-muted mt-0.5">{desc}</div>
          </button>
        ))}
      </div>

      <button className="btn btn-primary w-full !py-3.5 mt-4 text-base" disabled={!format} onClick={() => setRoom(format)}>
        {format ? `Start ${FORMATS.find((f) => f.id === format)!.label.toLowerCase()} · ${languageById(practice).flag} ${languageById(practice).name}` : "Choose text, voice or video"}
      </button>

      <SafetyStrip strikes={safety.strikes.filter((s) => s.category === "off-platform").length} />
    </div>
  );
}

/* ---------------- community declaration ---------------- */
function RulesGate() {
  const [agree, setAgree] = useState(false);
  const [adult, setAdult] = useState(false);
  return (
    <div className="fade-up max-w-2xl mx-auto">
      <PageHero pattern="dots" sticker="🛡️" title="Community declaration" sub="Read this before you meet anyone on PolyVault." />
      <div className="card divide-y divide-line mt-4">
        {COMMUNITY_RULES.map((r) => (
          <div key={r.title} className="p-4 flex gap-3">
            <span className="text-2xl shrink-0">{r.emoji}</span>
            <div>
              <div className="font-semibold">{r.title}</div>
              <p className="text-sm text-ink-muted mt-0.5">{r.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-3 !bg-bad-soft !border-transparent">
        <div className="font-semibold text-bad flex items-center gap-2"><Ban size={17} /> Breaking these rules gets your account banned</div>
        <ul className="text-sm mt-2 grid gap-1.5 list-disc pl-5">
          <li><b>Sexual content</b> — immediate, permanent ban.</li>
          <li><b>Moving to another app</b> (WhatsApp, Instagram, Snapchat, X/Twitter, Facebook, Telegram, TikTok, Discord…) or <b>sharing @handles, phone numbers, emails or links</b> — the message is blocked; {OFF_PLATFORM_STRIKES_BEFORE_BAN - 1} warnings, then a ban.</li>
          <li>Messages are checked automatically before they are sent.</li>
        </ul>
      </div>

      <label className="flex items-start gap-3 mt-4 cursor-pointer">
        <input type="checkbox" className="mt-1 w-5 h-5 accent-[var(--accent)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span className="text-sm">I declare that I will follow these rules, and I understand that breaking them will get my account banned.</span>
      </label>
      <label className="flex items-start gap-3 mt-3 cursor-pointer">
        <input type="checkbox" className="mt-1 w-5 h-5 accent-[var(--accent)]" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
        <span className="text-sm">I am 18 years old or older.</span>
      </label>
      <button className="btn btn-primary w-full !py-3.5 mt-5" disabled={!agree || !adult} onClick={() => acceptCommunityRules()}>
        <ShieldCheck size={17} /> I agree — continue to Connect
      </button>
    </div>
  );
}

function BannedScreen({ reason }: { reason?: string }) {
  return (
    <div className="fade-up max-w-md mx-auto mt-6">
      <div className="card p-8 text-center !bg-bad-soft !border-transparent">
        <Ban size={44} className="text-bad mx-auto" />
        <h1 className="text-2xl font-bold mt-3">Account banned from Connect</h1>
        <p className="text-sm text-ink-muted mt-2">
          Reason: <b>{reason ?? "Community rules violation"}</b>. You agreed to the community declaration, and this rule carries a ban.
        </p>
        <p className="text-sm text-ink-muted mt-2">You can still use your own lessons and decks.</p>
        <Link href="/" className="btn btn-primary mt-5">Back home</Link>
      </div>
    </div>
  );
}

function SafetyStrip({ strikes }: { strikes: number }) {
  return (
    <div className={`mt-4 rounded-2xl px-4 py-3 text-sm flex items-start gap-2.5 ${strikes ? "bg-warn-soft" : "bg-surface-2"}`}>
      <ShieldAlert size={17} className={`shrink-0 mt-0.5 ${strikes ? "text-warn" : "text-ink-muted"}`} />
      <div className="text-ink-muted">
        Keep it on PolyVault — no sexual content, no other apps, no numbers, @handles or links.
        {strikes > 0 && <b className="text-warn"> You have {strikes} warning{strikes > 1 ? "s" : ""}; at {OFF_PLATFORM_STRIKES_BEFORE_BAN} your account is banned.</b>}
      </div>
    </div>
  );
}

/* ---------------- text chat ---------------- */
interface Bubble { role: "user" | "partner"; text: string; translation?: string; reading?: string; tip?: string | null }

function ChatRoom({ languageId, onLeave }: { languageId: LanguageId; onLeave: () => void }) {
  const { settings } = useApp();
  const { account } = useAccount();
  const lang = languageById(languageId);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [blocked, setBlocked] = useState<{ reason: string; strike: number; banned: boolean } | null>(null);
  const [reporting, setReporting] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [online, setOnline] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const level = account.learningLanguages.find((l) => l.code === VAULT_TO_WORLD[languageId])?.level ?? "A2";
  const goal = goalStateFor(settings, languageId);
  const explainIn = account.nativeLanguages.some((n) => n.code === "id" || n.code === "ms") ? "Indonesian" : "English";

  const ask = async (history: Bubble[]) => {
    setThinking(true);
    const turns: PartnerTurn[] = history.map((b) => ({ role: b.role, text: b.text }));
    const r = await getPartnerReply({ languageId, level, goal: goal ? goalById(goal.focus).label : undefined, explainIn, history: turns });
    setOnline(r.source === "claude");
    setBubbles([...history, { role: "partner", text: r.reply, translation: r.translation, reading: r.reading, tip: r.tip }]);
    setThinking(false);
  };

  useEffect(() => { ask([]); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [bubbles, thinking]);

  const send = async () => {
    const text = draft.trim();
    if (!text || thinking) return;
    const check = await checkOutgoing(text);
    if (!check.result.ok) {
      setBlocked({ reason: check.result.reason!, strike: check.strikeNumber, banned: check.banned });
      setDraft("");
      return;
    }
    const next = [...bubbles, { role: "user" as const, text }];
    setBubbles(next);
    setDraft("");
    await ask(next);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-11rem)] md:h-[calc(100dvh-5rem)]">
      {/* header */}
      <div className="card p-3 flex items-center gap-3">
        <button className="btn btn-ghost !p-2" onClick={onLeave} aria-label="Leave chat"><ArrowLeft size={18} /></button>
        <span className="w-10 h-10 rounded-full grid place-items-center text-white" style={{ background: "linear-gradient(135deg, var(--sky), var(--mint))" }}><Bot size={19} /></span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">Practice partner {lang.flag}</div>
          <div className="text-xs text-ink-muted">{online === false ? "Offline practice mode" : "AI partner"} · live native speakers coming soon</div>
        </div>
        <button className="btn btn-ghost !p-2 text-bad" onClick={() => setReporting(true)} aria-label="Report"><Flag size={17} /></button>
      </div>

      <div className="text-[11px] text-ink-faint text-center my-2 flex items-center justify-center gap-1">
        <ShieldCheck size={12} /> Messages are checked for safety · no sexual content · no other apps, numbers or links
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto grid content-start gap-3 px-1 pb-2">
        {bubbles.map((b, i) => b.role === "user" ? (
          <div key={i} className="justify-self-end max-w-[80%] rounded-2xl rounded-br-md bg-accent text-white px-4 py-2.5 text-[15px] native-script" dir="auto">{b.text}</div>
        ) : (
          <div key={i} className="justify-self-start max-w-[85%]">
            <div className="rounded-2xl rounded-bl-md bg-surface border border-line px-4 py-2.5">
              <div className="flex items-start gap-1">
                <p className="text-[15px] native-script flex-1" dir={lang.rtl ? "rtl" : "ltr"}>{b.text}</p>
                <AudioButton text={b.text} lang={lang.speechTag} className="!p-1.5 shrink-0 -mt-0.5" />
              </div>
              {b.reading && <p className="read-as text-xs text-ink-muted mt-1">🗣 {b.reading}</p>}
              {b.translation && (shown.has(i)
                ? <p className="text-xs text-ink-muted italic mt-1">{b.translation}</p>
                : <button className="text-[11px] text-accent mt-1 inline-flex items-center gap-1" onClick={() => setShown(new Set(shown).add(i))}><Languages size={11} /> Translate</button>)}
            </div>
            {b.tip && <div className="text-xs bg-sun/20 rounded-xl px-3 py-2 mt-1.5">💡 {b.tip}</div>}
          </div>
        ))}
        {thinking && <div className="justify-self-start text-ink-faint text-sm flex items-center gap-2 px-2"><Loader2 size={14} className="animate-spin" /> typing…</div>}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="card p-2 flex items-end gap-2">
        <textarea
          className="input !border-0 !shadow-none resize-none min-h-11 max-h-32"
          rows={1}
          dir="auto"
          placeholder={`Write in ${lang.name}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button className="btn btn-primary !p-3 !rounded-xl" disabled={!draft.trim() || thinking} onClick={send} aria-label="Send"><Send size={17} /></button>
      </div>

      <AnimatePresence>
        {blocked && <BlockedSheet {...blocked} onClose={() => setBlocked(null)} />}
        {reporting && <ReportSheet onClose={() => setReporting(false)} />}
      </AnimatePresence>
    </div>
  );
}

function BlockedSheet({ reason, strike, banned, onClose }: { reason: string; strike: number; banned: boolean; onClose: () => void }) {
  return (
    <Overlay onClose={banned ? () => {} : onClose}>
      <div className="text-center">
        <span className="sticker w-14 h-14 bg-bad-soft text-bad mx-auto">{banned ? <Ban size={26} /> : <ShieldAlert size={26} />}</span>
        <h3 className="text-xl font-display font-semibold mt-3">{banned ? "Your account has been banned" : "🚩 Message blocked"}</h3>
        <p className="text-sm mt-2">{reason}</p>
        {banned ? (
          <p className="text-sm text-ink-muted mt-2">This breaks the community declaration you agreed to.</p>
        ) : (
          <p className="text-sm text-ink-muted mt-2">
            Warning <b className="text-bad">{strike} of {OFF_PLATFORM_STRIKES_BEFORE_BAN - 1}</b>.
            {strike >= OFF_PLATFORM_STRIKES_BEFORE_BAN - 1 ? " One more and your account is banned." : " Repeated attempts get your account banned."}
          </p>
        )}
        <button className="btn btn-primary w-full mt-5" onClick={banned ? () => window.location.reload() : onClose}>
          {banned ? "OK" : "I understand"}
        </button>
      </div>
    </Overlay>
  );
}

const REPORT_REASONS = ["Sexual content", "Asked to move to another app", "Shared contact details", "Harassment or hate", "Something else"];

function ReportSheet({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  return (
    <Overlay onClose={onClose}>
      {sent ? (
        <div className="text-center py-2">
          <ShieldCheck size={36} className="text-ok mx-auto" />
          <h3 className="text-lg font-display font-semibold mt-2">Thanks for reporting</h3>
          <p className="text-sm text-ink-muted mt-1">Our team reviews every report. The person will be banned if they broke the rules.</p>
          <button className="btn btn-primary w-full mt-4" onClick={onClose}>Done</button>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-display font-semibold flex items-center gap-2"><Flag size={17} className="text-bad" /> Report this conversation</h3>
          <div className="grid gap-2 mt-4">
            {REPORT_REASONS.map((r) => (
              <button key={r} className="btn btn-outline justify-start" onClick={() => setSent(true)}>{r}</button>
            ))}
          </div>
        </>
      )}
    </Overlay>
  );
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div className="fixed inset-0 z-[60] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative card !rounded-3xl p-6 w-full max-w-sm">
        <button className="absolute right-3 top-3 btn btn-ghost !p-1.5" onClick={onClose} aria-label="Close"><X size={16} /></button>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- calls (lobby until live matching ships) ---------------- */
function CallLobby({ format, languageId, onLeave, onText }: { format: Format; languageId: LanguageId; onLeave: () => void; onText: () => void }) {
  const lang = languageById(languageId);
  const F = FORMATS.find((f) => f.id === format)!;
  const Icon = F.icon;
  return (
    <div className="fade-up max-w-md mx-auto">
      <button className="btn btn-ghost !px-2 -ml-2 mb-3 text-sm" onClick={onLeave}><ArrowLeft size={15} /> Connect</button>
      <div className="hero pattern-waves p-8 text-center">
        <span className="sticker w-16 h-16 bg-accent text-white mx-auto"><Icon size={28} /></span>
        <h1 className="text-2xl font-bold mt-4">{F.label} · {lang.flag} {lang.name}</h1>
        <p className="text-sm text-ink-muted mt-2">
          Live {format} calls with verified native speakers are launching soon. We&apos;ll match you by language, goal and level.
        </p>
      </div>
      <div className="card p-5 mt-3 text-sm grid gap-2">
        <div className="font-semibold flex items-center gap-2"><ShieldCheck size={16} className="text-ok" /> On every call</div>
        <p className="text-ink-muted">• Sexual behaviour on camera or voice = immediate ban.</p>
        <p className="text-ink-muted">• Asking to continue on WhatsApp, Instagram, Snapchat, X, Facebook or any other app = ban.</p>
        <p className="text-ink-muted">• One tap to end the call and report.</p>
      </div>
      <button className="btn btn-primary w-full mt-4" onClick={onText}><MessageCircle size={16} /> Practise by text now</button>
    </div>
  );
}
