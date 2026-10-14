"use client";

import Link from "next/link";
import { ArrowLeft, Eye, Pencil } from "lucide-react";
import { useAccount } from "@/components/account/useAccount";
import { ProfileView } from "@/components/account/ProfileView";
import { ACHIEVEMENTS } from "@/lib/stats";

export default function AccountPreviewPage() {
  const { account, rank, stats, vaults, xp } = useAccount();
  const mastered = vaults.reduce((a, v) => a + v.mastered, 0);
  const unlocked = ACHIEVEMENTS.filter((a) => a.test({ xp, streak: stats.streak, mastered, reviews: stats.reviews }));

  return (
    <div className="fade-up max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href="/account" className="btn btn-ghost !px-2 -ml-2 text-sm"><ArrowLeft size={15} /> Account</Link>
        <Link href="/account/edit" className="btn btn-outline !py-2 !px-3 text-sm"><Pencil size={14} /> Edit</Link>
      </div>

      <div className="flex items-center gap-2 text-sm text-ink-muted rounded-2xl bg-surface-2 px-4 py-3 mb-4">
        <Eye size={16} className="shrink-0" />
        This is how other learners and native speakers will see your profile.
      </div>

      <ProfileView account={account} rank={rank} stats={stats} />

      {account.privacy.showAchievements && unlocked.length > 0 && (
        <div className="card p-5 mt-3">
          <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Achievements</div>
          <div className="flex flex-wrap gap-2">
            {unlocked.map((a) => (
              <span key={a.id} className="pill !text-sm !py-1" title={a.description}>{a.emoji} {a.name}</span>
            ))}
          </div>
        </div>
      )}

      <button disabled className="btn btn-primary w-full mt-4">Send exchange request · coming soon</button>
    </div>
  );
}
