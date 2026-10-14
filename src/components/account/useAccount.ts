"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { defaultAccount, rankFromXp, vaultSummaries, globalStreak, VaultSummary } from "@/lib/account";

/** Live account + derived rank and cross-language stats. */
export function useAccount() {
  const stored = useLiveQuery(() => db.account.get("me"), []);
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const reviewCount = useLiveQuery(() => db.reviews.count(), []);
  const [vaults, setVaults] = useState<VaultSummary[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    vaultSummaries().then(setVaults);
    globalStreak().then(setStreak);
  }, [reviewCount]);

  const account = stored ?? defaultAccount();
  const rank = rankFromXp(profile?.xp ?? 0);
  const stats = {
    streak,
    reviews: reviewCount ?? 0,
    learned: vaults.reduce((a, v) => a + v.learned, 0),
  };
  return { account, exists: Boolean(stored), loading: stored === undefined && reviewCount === undefined, rank, stats, vaults, xp: profile?.xp ?? 0 };
}
