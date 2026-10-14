/* ============================================================
   Connect safety state — rule acceptance, strikes, bans.

   NOTE: stored on-device for now. When Connect goes live with
   real users, strikes and bans must be enforced server-side
   (a local flag can be cleared by wiping browser data).
   ============================================================ */
"use client";

import { getAccount, saveAccount, AccountSafety } from "@/lib/account";
import { moderateMessage, ModerationResult, OFF_PLATFORM_STRIKES_BEFORE_BAN } from "@/lib/moderation";

const empty = (): AccountSafety => ({ strikes: [] });

export async function acceptCommunityRules() {
  const acc = await getAccount();
  await saveAccount({ safety: { ...(acc.safety ?? empty()), rulesAcceptedAt: Date.now() } });
}

export interface SendCheck {
  result: ModerationResult;
  /** 0 when allowed */
  strikeNumber: number;
  banned: boolean;
}

/** Moderates an outgoing message; on a violation records a strike and bans when the policy says so. */
export async function checkOutgoing(text: string): Promise<SendCheck> {
  const result = moderateMessage(text);
  if (result.ok) return { result, strikeNumber: 0, banned: false };

  const acc = await getAccount();
  const safety = acc.safety ?? empty();
  const strikes = [...safety.strikes, { at: Date.now(), category: result.category!, excerpt: text.slice(0, 80) }];
  const offPlatform = strikes.filter((s) => s.category === "off-platform").length;
  const ban = result.category === "sexual" || offPlatform >= OFF_PLATFORM_STRIKES_BEFORE_BAN;
  await saveAccount({
    safety: {
      ...safety,
      strikes,
      ...(ban ? { bannedAt: Date.now(), banReason: result.category === "sexual" ? "Sexual content" : "Repeatedly trying to move conversations off PolyVault" } : {}),
    },
  });
  return { result, strikeNumber: offPlatform, banned: ban };
}
