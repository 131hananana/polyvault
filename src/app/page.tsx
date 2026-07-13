"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import {
  Flame, Target, Brain, Plus, Sparkles, Play, TrendingUp, Clock, AlertTriangle,
} from "lucide-react";
import { useApp } from "@/components/Providers";
import { StatTile, ProgressRing, SectionTitle, Bar } from "@/components/ui";
import { computeStats, LanguageStats, levelFromXp } from "@/lib/stats";
import { db } from "@/lib/db";
import { languageById, todayKey } from "@/lib/types";
import { QuickAddModal } from "@/components/QuickAdd";

export default function Dashboard() {
  const { settings, ready } = useApp();
  const lang = languageById(settings.activeLanguage);
  const [stats, setStats] = useState<LanguageStats | null>(null);
  const [quickAdd, setQuickAdd] = useState(false);

  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const reviewTick = useLiveQuery(
    () => db.reviews.where("[languageId+day]").equals([settings.activeLanguage, todayKey()]).count(),
    [settings.activeLanguage],
  );

  useEffect(() => {
    if (!ready) return;
    computeStats(settings.activeLanguage).then(setStats);
  }, [ready, settings.activeLanguage, reviewTick]);

  if (!stats) return null;

  const goalPct = settings.dailyGoal ? (stats.reviewsToday / settings.dailyGoal) * 100 : 0;
  const level = levelFromXp(profile?.xp ?? 0);
  const totalDue = stats.dueToday + Math.min(stats.newAvailable, settings.newCardsPerDay);

  return (
    <div className="fade-up">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-ink-muted">{greeting()} · {lang.flag} {lang.name}</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
            {totalDue > 0 ? `${totalDue} cards waiting for you` : "All caught up ✨"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setQuickAdd(true)} className="btn btn-outline"><Plus size={16} /> Quick add</button>
          <Link href="/generate" className="btn btn-outline"><Sparkles size={16} /> AI deck</Link>
          <Link href="/study" className="btn btn-primary"><Play size={16} /> Continue learning</Link>
        </div>
      </div>

      {/* stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <StatTile label="Today's reviews" value={stats.dueToday} sub={`${stats.reviewsToday} done today`} accent icon={<Clock size={14} />} />
        <StatTile label="New cards" value={Math.min(stats.newAvailable, settings.newCardsPerDay)} sub={`${stats.newAvailable} available`} icon={<Plus size={14} />} />
        <StatTile label="Streak" value={<span className="flex items-center gap-1.5">{stats.streak}<Flame size={20} className="text-warn" /></span>} sub="days in a row" icon={<Flame size={14} />} />
        <StatTile label="Retention" value={`${stats.retention}%`} sub="last 30 days" icon={<Brain size={14} />} />
      </div>

      {/* goal + weekly + level */}
      <div className="grid md:grid-cols-3 gap-3 mt-3">
        <div className="card p-5 flex items-center gap-4">
          <ProgressRing value={goalPct} size={64} />
          <div>
            <div className="text-xs font-medium text-ink-muted flex items-center gap-1"><Target size={13} /> Daily goal</div>
            <div className="text-xl font-bold">{stats.reviewsToday} / {settings.dailyGoal}</div>
            <div className="text-xs text-ink-faint">{goalPct >= 100 ? "Goal reached — brilliant!" : "reviews today"}</div>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-medium text-ink-muted flex items-center gap-1 mb-3"><TrendingUp size={13} /> Weekly progress</div>
          <div className="flex items-end gap-1.5 h-16">
            {stats.weeklyReviews.map((d) => {
              const max = Math.max(1, ...stats.weeklyReviews.map((x) => x.count));
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <motion.div
                    className="w-full rounded-md bg-accent/80 min-h-[3px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                    title={`${d.day}: ${d.count}`}
                  />
                  <span className="text-[9px] text-ink-faint">{d.day.slice(8)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-medium text-ink-muted mb-2">Level {level.level} · {(profile?.xp ?? 0).toLocaleString()} XP</div>
          <Bar pct={(level.inLevel / level.forNext) * 100} />
          <div className="text-xs text-ink-faint mt-2">{level.forNext - level.inLevel} XP to level {level.level + 1}</div>
          <div className="mt-3 text-xs text-ink-muted">{stats.cardsLearned} learned · {stats.cardsMastered} mastered · {stats.totalCards} total</div>
        </div>
      </div>

      {/* upcoming */}
      <SectionTitle>Upcoming reviews</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.upcoming.map((u) => (
          <div key={u.label} className="card p-4">
            <div className="text-xs text-ink-muted">{u.label}</div>
            <div className="text-xl font-bold mt-0.5">{u.count}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-x-3">
        {/* recently learned */}
        <div>
          <SectionTitle>Recently learned</SectionTitle>
          <div className="card divide-y divide-line">
            {stats.recentlyLearned.length === 0 && <div className="p-5 text-sm text-ink-muted">Start studying to see progress here.</div>}
            {stats.recentlyLearned.map((c) => (
              <Link key={c.id} href={`/cards/${c.id}`} className="flex items-center justify-between p-4 hover:bg-surface-2 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                <div>
                  <div className="font-semibold text-sm">{c.word}</div>
                  <div className="text-xs text-ink-muted">{c.translation}</div>
                </div>
                <span className="pill">{c.srs.stage}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* difficult */}
        <div>
          <SectionTitle>Most difficult words</SectionTitle>
          <div className="card divide-y divide-line">
            {stats.mostDifficult.length === 0 && <div className="p-5 text-sm text-ink-muted">No struggles yet — keep it up!</div>}
            {stats.mostDifficult.map((c) => (
              <Link key={c.id} href={`/cards/${c.id}`} className="flex items-center justify-between p-4 hover:bg-surface-2 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                <div>
                  <div className="font-semibold text-sm">{c.word}</div>
                  <div className="text-xs text-ink-muted">{c.translation}</div>
                </div>
                <span className="pill !bg-bad-soft !text-bad !border-transparent"><AlertTriangle size={11} /> {c.srs.lapses} lapses</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {quickAdd && <QuickAddModal onClose={() => setQuickAdd(false)} />}
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
