"use client";

/* ============================================================
   Home — language-neutral hub. Which language to study is
   chosen in Study (or the switcher in the top bar); home shows
   the learner's day across every language, recent sessions,
   and the way in to Connect.
   ============================================================ */

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Flame, Sparkles, BookOpenCheck, Play, Plus, MessageCircle, Phone, Video, ShieldCheck, Clock, ChevronRight, X,
} from "lucide-react";
import { useApp } from "@/components/Providers";
import { useAccount } from "@/components/account/useAccount";
import { RankBadge } from "@/components/account/ProfileView";
import { StatTile, SectionTitle, Bar, EmptyState } from "@/components/ui";
import { db } from "@/lib/db";
import { LANGUAGES, LanguageId, QuizMode, goalById, languageById, todayKey } from "@/lib/types";

const MODE_LABEL: Partial<Record<QuizMode, string>> = {
  "daily-lesson": "Daily lesson", flashcards: "Flashcards", "multiple-choice": "Multiple choice", typing: "Typing",
  listening: "Listening", pronunciation: "Pronunciation", reverse: "Reverse translation", "fill-blank": "Fill in the blank",
  "sentence-completion": "Sentence completion", "match-pairs": "Match pairs", speed: "Speed review", timed: "Timed challenge",
  "mistake-review": "Mistake review",
};

export default function Home() {
  const router = useRouter();
  const { settings, setLanguage } = useApp();
  const { account, rank, stats, xp } = useAccount();

  const today = useLiveQuery(async () => {
    const logs = await db.reviews.where("day").equals(todayKey()).toArray();
    return { reviews: logs.length, correct: logs.filter((l) => l.correct).length };
  }, []);

  const recent = useLiveQuery(() => db.sessions.orderBy("startedAt").reverse().limit(6).toArray(), []);

  // languages the learner has actually started (studied, or picked a goal for)
  const languages = useLiveQuery(async () => {
    const [cards, reviews] = await Promise.all([db.cards.toArray(), db.reviews.toArray()]);
    return LANGUAGES.map((l) => {
      const mine = cards.filter((c) => c.languageId === l.id);
      const lastAt = reviews.filter((r) => r.languageId === l.id).reduce((m, r) => Math.max(m, r.at), 0);
      return {
        id: l.id,
        total: mine.length,
        learned: mine.filter((c) => c.srs.stage === "review" || c.srs.stage === "mastered").length,
        due: mine.filter((c) => c.srs.stage !== "new" && c.srs.dueAt <= Date.now()).length,
        lastAt,
      };
    })
      .filter((l) => l.lastAt > 0 || settings.goals?.[l.id])
      .sort((a, b) => b.lastAt - a.lastAt);
  }, [settings.goals]);

  const [adding, setAdding] = useState(false);
  const continueIn = (id: LanguageId) => { setLanguage(id); router.push("/study?mode=daily"); };
  // a new language goes to Study, which asks for the learning goal first
  const startLanguage = (id: LanguageId) => { setAdding(false); setLanguage(id); router.push("/study"); };
  const notStarted = LANGUAGES.filter((l) => !languages?.some((x) => x.id === l.id));
  const name = account.displayName.split(" ")[0];

  return (
    <div className="fade-up">
      {/* ---------- hero ---------- */}
      <div className="hero pattern-confetti p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-ink-muted">{greeting()}{name ? `, ${name}` : ""} 👋</div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {today?.reviews ? `${today.reviews} answers today — keep going!` : "Ready for today's practice?"}
            </h1>
          </div>
          <RankBadge rank={rank} />
        </div>
        <div className="mt-4 max-w-md">
          <Bar pct={(rank.inLevel / rank.forNext) * 100} color={rank.tier.color} />
          <div className="text-xs text-ink-faint mt-1">Level {rank.level} · {xp.toLocaleString()} XP · {rank.forNext - rank.inLevel} XP to level {rank.level + 1}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <StatTile label="Streak" value={<span className="flex items-center gap-1.5">{stats.streak}<Flame size={20} className="text-warn" /></span>} sub="days in a row" accent />
        <StatTile label="Today" value={today?.reviews ?? 0} sub={today?.reviews ? `${Math.round((today.correct / today.reviews) * 100)}% correct` : `goal ${settings.dailyGoal}`} icon={<BookOpenCheck size={14} />} />
        <StatTile label="Words learned" value={stats.learned} sub="all languages" icon={<Sparkles size={14} />} />
      </div>

      {/* ---------- continue learning ---------- */}
      <SectionTitle action={<Link href="/study" className="text-xs text-accent font-semibold">Choose language</Link>}>Continue learning</SectionTitle>
      {languages && languages.length === 0 ? (
        <EmptyState emoji="🌍" title="Pick your first language" sub="Choose a language in Study and tell us why you're learning it — every lesson is tailored to your goal."
          action={<button onClick={() => setAdding(true)} className="btn btn-primary"><Plus size={16} /> Choose a language</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {languages?.map((l) => {
            const lang = languageById(l.id);
            const goal = settings.goals?.[l.id];
            return (
              <button key={l.id} onClick={() => continueIn(l.id)} className="card p-4 text-left hover:-translate-y-0.5 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{lang.name}</div>
                    <div className="text-xs text-ink-muted truncate">
                      {goal ? `${goalById(goal.focus).emoji} ${goalById(goal.focus).label}` : "No goal yet"}
                      {l.lastAt > 0 && ` · ${timeAgo(l.lastAt)}`}
                    </div>
                  </div>
                  {l.due > 0 && <span className="pill !bg-accent-soft !text-accent !border-transparent">{l.due} due</span>}
                </div>
                <div className="mt-3"><Bar pct={l.total ? (l.learned / l.total) * 100 : 0} /></div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-ink-muted">{l.learned} words learned</span>
                  <span className="text-accent font-semibold inline-flex items-center gap-1"><Play size={12} /> Continue</span>
                </div>
              </button>
            );
          })}
          {notStarted.length > 0 && (
            <button onClick={() => setAdding(true)} className="card p-4 border-dashed grid place-items-center text-center text-ink-muted hover:bg-surface-2 transition-colors min-h-32">
              <div>
                <div className="flex justify-center -space-x-1.5 text-xl">{notStarted.slice(0, 4).map((l) => <span key={l.id}>{l.flag}</span>)}</div>
                <div className="text-sm font-medium mt-1.5 flex items-center gap-1 justify-center"><Plus size={15} /> Add a language</div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* ---------- recent study ---------- */}
      <SectionTitle>Recent study</SectionTitle>
      <div className="card divide-y divide-line">
        {recent && recent.length === 0 && <div className="p-5 text-sm text-ink-muted">Your finished lessons and quizzes will show up here.</div>}
        {recent?.map((s) => {
          const lang = languageById(s.languageId);
          const acc = s.cardsSeen ? Math.round((s.correct / s.cardsSeen) * 100) : 0;
          return (
            <div key={s.id} className="flex items-center gap-3 p-3.5">
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{MODE_LABEL[s.mode] ?? s.mode} · {lang.name}</div>
                <div className="text-xs text-ink-muted flex items-center gap-1">
                  <Clock size={11} /> {timeAgo(s.startedAt)} · {s.cardsSeen} words · {Math.max(1, Math.round((s.endedAt - s.startedAt) / 60000))} min
                </div>
              </div>
              <span className={`pill ${acc >= 80 ? "!bg-ok-soft !text-ok !border-transparent" : ""}`}>{acc}%</span>
              <span className="pill !bg-accent-soft !text-accent !border-transparent">+{s.xpEarned} XP</span>
            </div>
          );
        })}
      </div>

      {/* ---------- connect ---------- */}
      <SectionTitle action={<Link href="/connect" className="text-xs text-accent font-semibold">Open Connect</Link>}>Practise with people</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {([
          ["text", "Text", MessageCircle, "var(--mint)"],
          ["voice", "Call", Phone, "var(--sky)"],
          ["video", "Video", Video, "var(--pink)"],
        ] as const).map(([id, label, Icon, color]) => (
          <Link key={id} href={`/connect?format=${id}`} className="card p-4 md:p-5 text-center hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <span className="w-12 h-12 rounded-2xl grid place-items-center mx-auto text-white" style={{ background: color }}><Icon size={22} /></span>
            <div className="font-display font-semibold mt-2">{label}</div>
          </Link>
        ))}
      </div>
      <AnimatePresence>
        {adding && (
          <motion.div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAdding(false)} />
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              className="relative card !rounded-b-none sm:!rounded-3xl w-full sm:max-w-md p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg">Which language do you want to learn?</h3>
                <button className="btn btn-ghost !p-1.5" onClick={() => setAdding(false)} aria-label="Close"><X size={18} /></button>
              </div>
              <div className="grid gap-2 mt-4">
                {notStarted.map((l) => (
                  <button key={l.id} onClick={() => startLanguage(l.id)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-line hover:bg-surface-2 hover:border-accent text-left transition-colors">
                    <span className="text-3xl">{l.flag}</span>
                    <span className="flex-1">
                      <span className="font-semibold block">{l.name}</span>
                      <span className="text-xs text-ink-muted native-script">{l.nativeName}</span>
                    </span>
                    <ChevronRight size={16} className="text-ink-faint" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-faint text-center mt-3">Next you&apos;ll choose your goal — your first goal is free.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link href="/connect" className="mt-3 rounded-2xl px-4 py-3 text-sm flex items-center gap-2.5 bg-surface-2 hover:bg-surface-3 transition-colors">
        <ShieldCheck size={17} className="text-ok shrink-0" />
        <span className="flex-1 text-ink-muted">Community rules: no sexual content, no moving to other apps or sharing contacts — breaking them gets you banned.</span>
        <ChevronRight size={16} className="text-ink-faint" />
      </Link>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Studying late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}
