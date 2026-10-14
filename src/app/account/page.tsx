"use client";

/* ============================================================
   Account — identity, rank, native verification, progress
   across every vault, and account-level settings.
   ============================================================ */

import Link from "next/link";
import {
  Pencil, Eye, Settings, BadgeCheck, ShieldCheck, Clock, Download, Trash2,
  Sparkles, Globe2, ChevronRight, Lock,
} from "lucide-react";
import { useAccount } from "@/components/account/useAccount";
import { Avatar, RankBadge, Banner } from "@/components/account/ProfileView";
import { SectionTitle, Bar, ProgressRing, EmptyState } from "@/components/ui";
import {
  RANK_TIERS, worldLanguage, profileCompleteness, NativeLanguage, formatWait,
} from "@/lib/account";
import { ACHIEVEMENTS } from "@/lib/stats";
import { db } from "@/lib/db";
import { languageById } from "@/lib/types";

export default function AccountPage() {
  const { account, exists, rank, stats, vaults, xp } = useAccount();
  const completeness = profileCompleteness(account);
  const mastered = vaults.reduce((a, v) => a + v.mastered, 0);
  const unlocked = ACHIEVEMENTS.filter((a) => a.test({ xp, streak: stats.streak, mastered, reviews: stats.reviews }));

  const exportData = async () => {
    const data = {
      exportedAt: new Date().toISOString(),
      account: await db.account.get("me"),
      profile: await db.profile.get("me"),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `polyvault-account-${account.username || "me"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const resetProfile = async () => {
    if (!confirm("Reset your profile? Name, photo, bio, languages and verifications will be cleared. Your cards, XP and study history stay.")) return;
    await db.account.delete("me");
  };

  if (!exists && !account.displayName) {
    return (
      <div className="fade-up max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Account</h1>
        <div className="mt-6">
          <EmptyState
            emoji="👋"
            title="Create your PolyVault profile"
            sub="Add your name, photo, native language and what you're learning. Later this becomes your card for meeting native speakers and exchange partners."
            action={<Link href="/account/edit" className="btn btn-primary"><Pencil size={15} /> Set up profile</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up max-w-3xl mx-auto">
      {/* ---------- identity header ---------- */}
      <div className="card overflow-hidden">
        <Banner id={account.bannerId} className="h-24 md:h-32" />
        <div className="px-5 md:px-7 pb-5">
          <div className="relative z-10 -mt-10 md:-mt-12 flex items-end justify-between gap-3">
            <Avatar account={account} size={88} ring />
            <div className="flex gap-2">
              <Link href="/account/preview" className="btn btn-outline !px-3 !py-2 text-sm"><Eye size={15} /> <span className="hidden sm:inline">Preview</span></Link>
              <Link href="/account/edit" className="btn btn-primary !px-3 !py-2 text-sm"><Pencil size={15} /> Edit</Link>
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-3 flex items-center gap-2 flex-wrap">
            {account.displayName || "Unnamed learner"}
            {account.nativeLanguages.map((n) => <span key={n.code} className="text-xl leading-none">{worldLanguage(n.code).flag}</span>)}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-ink-muted">@{account.username || "username"}</span>
            <RankBadge rank={rank} />
          </div>

          {completeness < 100 && (
            <Link href="/account/edit" className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-3 hover:bg-surface-3 transition-colors">
              <ProgressRing value={completeness} size={44} stroke={5} />
              <div className="flex-1 text-sm">
                <div className="font-semibold">Profile {completeness}% complete</div>
                <div className="text-ink-muted text-xs">A complete profile gets better exchange matches.</div>
              </div>
              <ChevronRight size={16} className="text-ink-faint" />
            </Link>
          )}
        </div>
      </div>

      {/* ---------- rank ---------- */}
      <SectionTitle>Rank</SectionTitle>
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl grid place-items-center text-3xl shrink-0"
            style={{ background: `color-mix(in srgb, ${rank.tier.color} 15%, transparent)` }}>
            {rank.tier.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold" style={{ color: rank.tier.color }}>{rank.tier.name}</div>
            <div className="text-sm text-ink-muted">Level {rank.level} · {xp.toLocaleString()} XP</div>
            <div className="mt-2"><Bar pct={(rank.inLevel / rank.forNext) * 100} color={rank.tier.color} /></div>
            <div className="text-xs text-ink-faint mt-1">
              {rank.forNext - rank.inLevel} XP to level {rank.level + 1}
              {rank.next && <> · {rank.next.emoji} {rank.next.name} at level {rank.next.minLevel}</>}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-5 gap-1">
          {RANK_TIERS.map((t) => {
            const reached = rank.level >= t.minLevel;
            return (
              <div key={t.name} className={`flex-1 text-center ${reached ? "" : "opacity-35 grayscale"}`} title={`${t.name} — level ${t.minLevel}+`}>
                <div className="text-xl">{t.emoji}</div>
                <div className="text-[10px] font-medium text-ink-muted mt-0.5 truncate">{t.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- native verification ---------- */}
      <SectionTitle action={<Link href="/account/edit#languages" className="text-xs text-accent font-semibold">Manage</Link>}>
        Native speaker
      </SectionTitle>
      <div className="card p-2">
        {account.nativeLanguages.length === 0 ? (
          <div className="p-4 text-sm text-ink-muted">
            Add your native language(s) to show your flag and get verified.{" "}
            <Link href="/account/edit#languages" className="text-accent font-semibold">Add now</Link>
          </div>
        ) : account.nativeLanguages.map((n) => <NativeRow key={n.code} native={n} />)}
      </div>
      <p className="text-xs text-ink-faint mt-2 px-1 flex gap-1.5">
        <ShieldCheck size={13} className="shrink-0 mt-px" />
        Verified natives will be able to host exchanges and paid “Learn with Native” lessons.
      </p>

      {/* ---------- vaults ---------- */}
      <SectionTitle>Progress by language</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3">
        {vaults.map((v) => {
          const l = languageById(v.languageId);
          return (
            <div key={v.languageId} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-sm"><span className="text-lg">{l.flag}</span>{l.name}</span>
                <span className="pill !bg-accent-soft !text-accent !border-transparent font-bold" title="Estimated from cards in long-term memory">≈ {v.estimate}</span>
              </div>
              <div className="mt-3"><Bar pct={v.total ? (v.learned / v.total) * 100 : 0} /></div>
              <div className="text-xs text-ink-muted mt-1.5">{v.learned} learned · {v.mastered} mastered · {v.reviews} reviews</div>
            </div>
          );
        })}
      </div>

      {/* ---------- achievements ---------- */}
      <SectionTitle>Achievements · {unlocked.length}/{ACHIEVEMENTS.length}</SectionTitle>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.some((u) => u.id === a.id);
          return (
            <div key={a.id} title={`${a.name} — ${a.description}`}
              className={`card p-2.5 text-center ${got ? "" : "opacity-35 grayscale"}`}>
              <div className="text-2xl">{a.emoji}</div>
              <div className="text-[10px] font-medium text-ink-muted mt-1 truncate">{a.name}</div>
            </div>
          );
        })}
      </div>

      {/* ---------- coming soon ---------- */}
      <div className="card p-5 mt-8 !bg-accent-soft !border-transparent flex items-start gap-3">
        <Globe2 size={20} className="text-accent shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-accent">Coming soon: Discover & Learn with Native</div>
          <p className="text-sm text-ink-muted mt-1">
            Meet learners worldwide for culture and language exchange, and book lessons with verified native speakers.
            Your profile is what they&apos;ll see — check it with <Link href="/account/preview" className="text-accent font-semibold">Preview</Link>.
          </p>
        </div>
      </div>

      {/* ---------- account settings ---------- */}
      <SectionTitle>Account settings</SectionTitle>
      <div className="card divide-y divide-[var(--border)]">
        <SettingLink href="/account/edit#privacy" icon={<Lock size={16} />} label="Privacy" hint="Choose what other learners can see" />
        <SettingLink href="/account/edit#exchange" icon={<Sparkles size={16} />} label="Exchange & teaching" hint={account.openToExchange ? "Open to exchange" : "Not open to exchange"} />
        <SettingLink href="/settings" icon={<Settings size={16} />} label="App settings" hint="Theme, daily goal, audio, AI key" />
        <button onClick={exportData} className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2 transition-colors">
          <Download size={16} className="text-ink-muted" />
          <div className="flex-1"><div className="text-sm font-medium">Export account data</div><div className="text-xs text-ink-muted">Download your profile as JSON</div></div>
        </button>
        <button onClick={resetProfile} className="w-full flex items-center gap-3 p-4 text-left hover:bg-bad-soft transition-colors rounded-b-[1.25rem]">
          <Trash2 size={16} className="text-bad" />
          <div className="flex-1"><div className="text-sm font-medium text-bad">Reset profile</div><div className="text-xs text-ink-muted">Clears profile info only — study data is kept</div></div>
        </button>
      </div>
    </div>
  );
}

function NativeRow({ native }: { native: NativeLanguage }) {
  const lang = worldLanguage(native.code);
  const v = native.verification;
  const cooling = v.status === "failed" && v.cooldownUntil && v.cooldownUntil > Date.now();
  return (
    <div className="flex items-center gap-3 p-3">
      <span className="text-2xl">{lang.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{lang.name}</div>
        <div className="text-xs text-ink-muted">
          {v.status === "verified" && <span className="text-ok flex items-center gap-1"><BadgeCheck size={13} /> Verified native · score {v.score}</span>}
          {v.status === "unverified" && "Not verified yet"}
          {v.status === "failed" && (cooling
            ? <span className="flex items-center gap-1"><Clock size={12} /> Try again {formatWait(v.cooldownUntil! - Date.now())}</span>
            : "Last attempt didn't pass — you can try again")}
        </div>
      </div>
      {v.status !== "verified" && (
        cooling
          ? <span className="btn btn-outline !py-1.5 !px-3 text-xs opacity-50 pointer-events-none">Locked</span>
          : <Link href={`/account/verify?lang=${encodeURIComponent(native.code)}`} className="btn btn-primary !py-1.5 !px-3 text-xs"><ShieldCheck size={14} /> Verify</Link>
      )}
    </div>
  );
}

function SettingLink({ href, icon, label, hint }: { href: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors first:rounded-t-[1.25rem]">
      <span className="text-ink-muted">{icon}</span>
      <div className="flex-1"><div className="text-sm font-medium">{label}</div><div className="text-xs text-ink-muted">{hint}</div></div>
      <ChevronRight size={16} className="text-ink-faint" />
    </Link>
  );
}
