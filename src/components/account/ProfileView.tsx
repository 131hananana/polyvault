"use client";

/* ============================================================
   Public profile — exactly what other learners will see.
   Respects the account's privacy switches.
   ============================================================ */

import { ReactNode } from "react";
import { BadgeCheck, MapPin, Clock, Briefcase, MessageCircle, Video, Mic, Users, Sparkles, Cake, Flame } from "lucide-react";
import {
  UserAccount, BANNERS, worldLanguage, flagOf, countryName, ageFrom, localTimeIn,
  Rank, MeetingFormat, NativeLanguage,
} from "@/lib/account";
import { Bar } from "@/components/ui";

/** Gradient banner with a confetti pattern on top. */
export function Banner({ id, className = "", children }: { id: number; className?: string; children?: ReactNode }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: BANNERS[id] ?? BANNERS[0] }}>
      <div className="absolute inset-0 bg-confetti banner-pattern" />
      {children}
    </div>
  );
}

export function Avatar({ account, size = 96, ring = false }: { account: Pick<UserAccount, "avatar" | "displayName">; size?: number; ring?: boolean }) {
  const initials = (account.displayName || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  return (
    <div
      className={`rounded-full overflow-hidden grid place-items-center text-white font-bold font-display shrink-0 ${ring ? "ring-4 ring-[var(--surface)]" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.4, background: "linear-gradient(135deg, var(--sky), var(--mint))" }}
    >
      {account.avatar
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={account.avatar} alt="" className="w-full h-full object-cover" />
        : initials}
    </div>
  );
}

export function NativeFlag({ native, showName = true }: { native: NativeLanguage; showName?: boolean }) {
  const lang = worldLanguage(native.code);
  const verified = native.verification.status === "verified";
  return (
    <span
      className={`pill !text-[0.78rem] !py-1 ${verified ? "!bg-ok-soft !text-ok !border-transparent" : ""}`}
      title={verified ? `Verified native ${lang.name} speaker` : `Native ${lang.name} (not verified yet)`}
    >
      <span className="text-[15px] leading-none">{lang.flag}</span>
      {showName && lang.name}
      {verified && <BadgeCheck size={14} />}
    </span>
  );
}

export function RankBadge({ rank, compact = false }: { rank: Rank; compact?: boolean }) {
  return (
    <span
      className="pill !border-transparent font-semibold"
      style={{ background: `color-mix(in srgb, ${rank.tier.color} 15%, transparent)`, color: rank.tier.color }}
    >
      {rank.tier.emoji} {rank.tier.name}{!compact && ` · Lv ${rank.level}`}
    </span>
  );
}

const MEETING: Record<MeetingFormat, { label: string; icon: typeof Video }> = {
  text: { label: "Text chat", icon: MessageCircle },
  voice: { label: "Voice call", icon: Mic },
  video: { label: "Video call", icon: Video },
  "in-person": { label: "In person", icon: Users },
};

export interface PublicStats { streak: number; reviews: number; learned: number }

export function ProfileView({ account, rank, stats }: { account: UserAccount; rank: Rank; stats: PublicStats }) {
  const p = account.privacy;
  const age = ageFrom(account.birthDate);
  const verifiedNatives = account.nativeLanguages.filter((n) => n.verification.status === "verified");
  const canTeach = account.interestedInTeaching && verifiedNatives.length > 0;

  return (
    <div className="card overflow-hidden">
      <Banner id={account.bannerId} className="h-28 md:h-36" />
      <div className="px-5 md:px-7 pb-6">
        <div className="relative z-10 -mt-12 md:-mt-14 flex items-end justify-between gap-3">
          <Avatar account={account} size={104} ring />
          <RankBadge rank={rank} />
        </div>

        <div className="mt-3">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
            {account.displayName || "Unnamed learner"}
            {account.nativeLanguages.map((n) => (
              <span key={n.code} className="text-xl leading-none" title={worldLanguage(n.code).name}>{worldLanguage(n.code).flag}</span>
            ))}
            {verifiedNatives.length > 0 && <BadgeCheck size={20} className="text-ok" />}
          </h2>
          <div className="text-sm text-ink-muted mt-0.5">
            {account.username ? `@${account.username}` : "@username"}
            {account.pronouns && <> · {account.pronouns}</>}
          </div>
        </div>

        {account.bio && <p className="text-[15px] mt-3 whitespace-pre-line">{account.bio}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm text-ink-muted">
          {p.showLocation && account.countryFrom && (
            <Meta icon={<span>{flagOf(account.countryFrom)}</span>}>From {countryName(account.countryFrom)}</Meta>
          )}
          {p.showLocation && (account.city || account.countryLiving) && (
            <Meta icon={<MapPin size={14} />}>
              Lives in {[account.city, countryName(account.countryLiving)].filter(Boolean).join(", ")}
            </Meta>
          )}
          {p.showLocalTime && account.timezone && <Meta icon={<Clock size={14} />}>{localTimeIn(account.timezone)} local time</Meta>}
          {p.showAge && age !== null && <Meta icon={<Cake size={14} />}>{age} years old</Meta>}
          {account.occupation && <Meta icon={<Briefcase size={14} />}>{account.occupation}</Meta>}
        </div>

        {canTeach && (
          <div className="mt-4 rounded-2xl p-4 bg-accent-soft flex items-start gap-3">
            <Sparkles size={18} className="text-accent mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="font-semibold text-accent">Learn with Native</div>
              <div className="text-ink-muted">
                Verified native tutor for {verifiedNatives.map((n) => worldLanguage(n.code).name).join(", ")} · lessons coming soon
              </div>
            </div>
          </div>
        )}

        <Group title="Native speaker">
          {account.nativeLanguages.length
            ? account.nativeLanguages.map((n) => <NativeFlag key={n.code} native={n} />)
            : <span className="text-sm text-ink-faint">Not set</span>}
        </Group>

        <Group title="Learning">
          {account.learningLanguages.length
            ? account.learningLanguages.map((l) => {
                const lang = worldLanguage(l.code);
                return (
                  <span key={l.code} className="pill !text-[0.78rem] !py-1">
                    <span className="text-[15px] leading-none">{lang.flag}</span>{lang.name}
                    <span className="font-bold text-accent">{l.level}</span>
                  </span>
                );
              })
            : <span className="text-sm text-ink-faint">Not set</span>}
        </Group>

        {account.openToExchange && (
          <Group title="Open to exchange">
            {account.meetingFormats.map((m) => {
              const { label, icon: Icon } = MEETING[m];
              return <span key={m} className="pill !text-[0.78rem] !py-1"><Icon size={13} /> {label}</span>;
            })}
          </Group>
        )}

        {account.interests.length > 0 && (
          <Group title="Interests">
            {account.interests.map((i) => <span key={i} className="pill !text-[0.78rem] !py-1">{i}</span>)}
          </Group>
        )}

        {account.goals && (
          <div className="mt-5">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Goals</div>
            <p className="text-sm">{account.goals}</p>
          </div>
        )}

        {p.showStats && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
              <span className="font-semibold uppercase tracking-wider">Level {rank.level}</span>
              <span>{rank.xp.toLocaleString()} XP</span>
            </div>
            <Bar pct={(rank.inLevel / rank.forNext) * 100} color={rank.tier.color} />
            <div className="grid grid-cols-3 gap-2 mt-3">
              <MiniStat label="Streak" value={<span className="flex items-center justify-center gap-1">{stats.streak}<Flame size={15} className="text-warn" /></span>} />
              <MiniStat label="Words learned" value={stats.learned} />
              <MiniStat label="Reviews" value={stats.reviews.toLocaleString()} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <span className="flex items-center gap-1.5">{icon}{children}</span>;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2.5 text-center">
      <div className="font-bold">{value}</div>
      <div className="text-[11px] text-ink-muted">{label}</div>
    </div>
  );
}
