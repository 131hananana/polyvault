"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Flame, Clock, Brain, Trophy } from "lucide-react";
import { useApp } from "@/components/Providers";
import { computeStats, LanguageStats, levelFromXp, ACHIEVEMENTS } from "@/lib/stats";
import { db } from "@/lib/db";
import { languageById } from "@/lib/types";
import { StatTile, SectionTitle, Heatmap, Bar } from "@/components/ui";

export default function StatsPage() {
  const { settings, ready } = useApp();
  const lang = languageById(settings.activeLanguage);
  const [stats, setStats] = useState<LanguageStats | null>(null);
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const totalReviews = useLiveQuery(() => db.reviews.count(), []);

  useEffect(() => {
    if (ready) computeStats(settings.activeLanguage).then(setStats);
  }, [ready, settings.activeLanguage]);

  if (!stats) return null;
  const level = levelFromXp(profile?.xp ?? 0);
  const unlocked = ACHIEVEMENTS.filter((a) =>
    a.test({ xp: profile?.xp ?? 0, streak: stats.streak, mastered: stats.cardsMastered, reviews: totalReviews ?? 0 }),
  );

  return (
    <div className="fade-up">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Statistics {lang.flag}</h1>
      <p className="text-sm text-ink-muted mt-1">{lang.name} · Level {level.level} · {(profile?.xp ?? 0).toLocaleString()} XP total</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <StatTile label="Retention rate" value={`${stats.retention}%`} sub="last 30 days" icon={<Brain size={14} />} accent />
        <StatTile label="Study time" value={`${stats.studyMinutes}m`} sub="all time" icon={<Clock size={14} />} />
        <StatTile label="Learning streak" value={<span className="flex items-center gap-1.5">{stats.streak}<Flame size={20} className="text-warn" /></span>} sub="days" icon={<Flame size={14} />} />
        <StatTile label="Review accuracy" value={`${stats.retention}%`} sub={`${totalReviews ?? 0} reviews total`} />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <StatTile label="Cards learned" value={stats.cardsLearned} sub={`of ${stats.totalCards}`} />
        <StatTile label="Cards mastered" value={stats.cardsMastered} sub="21+ day intervals" />
        <StatTile label="Reviews today" value={stats.reviewsToday} sub={`goal ${settings.dailyGoal}`} />
      </div>

      <SectionTitle>Daily heatmap</SectionTitle>
      <div className="card p-5">
        <Heatmap data={stats.heatmap} />
        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-ink-faint">
          less
          {["var(--surface-3)", "color-mix(in srgb, var(--accent) 25%, var(--surface-3))", "color-mix(in srgb, var(--accent) 50%, transparent)", "color-mix(in srgb, var(--accent) 75%, transparent)", "var(--accent)"].map((c) => (
            <span key={c} className="w-[11px] h-[11px] rounded-[3px] inline-block" style={{ background: c }} />
          ))}
          more
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-x-3">
        <div>
          <SectionTitle>Weakest topics</SectionTitle>
          <div className="card p-5 grid gap-4">
            {stats.weakestTopics.length === 0 && <p className="text-sm text-ink-muted">Not enough review data yet — accuracy per topic appears after a few sessions.</p>}
            {stats.weakestTopics.map((t) => (
              <div key={t.topic}>
                <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{t.topic}</span><span className="text-bad font-semibold">{t.accuracy}%</span></div>
                <Bar pct={t.accuracy} color="var(--danger)" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Strongest topics</SectionTitle>
          <div className="card p-5 grid gap-4">
            {stats.strongestTopics.length === 0 && <p className="text-sm text-ink-muted">Keep studying to reveal your strengths.</p>}
            {stats.strongestTopics.map((t) => (
              <div key={t.topic}>
                <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{t.topic}</span><span className="text-ok font-semibold">{t.accuracy}%</span></div>
                <Bar pct={t.accuracy} color="var(--success)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle>Monthly progress</SectionTitle>
      <div className="card p-5">
        <div className="flex items-end gap-1 h-24">
          {stats.weeklyReviews.map((d) => {
            const max = Math.max(1, ...stats.weeklyReviews.map((x) => x.count));
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end" title={`${d.day}: ${d.count} reviews, ${d.correct} correct`}>
                <div className="w-full rounded-md bg-accent/85" style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }} />
                <span className="text-[9px] text-ink-faint">{d.day.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <SectionTitle>Achievements · {unlocked.length}/{ACHIEVEMENTS.length}</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.includes(a);
          return (
            <div key={a.id} className={`card p-4 text-center transition-opacity ${got ? "" : "opacity-40 grayscale"}`}>
              <div className="text-3xl">{a.emoji}</div>
              <div className="font-semibold text-sm mt-1.5 flex items-center justify-center gap-1">
                {got && <Trophy size={11} className="text-warn" />}{a.name}
              </div>
              <div className="text-[11px] text-ink-muted mt-0.5">{a.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
