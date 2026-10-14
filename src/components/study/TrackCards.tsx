"use client";

/* Level 1 basics + current goal track for the active language. */

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Play } from "lucide-react";
import { useApp } from "@/components/Providers";
import { Bar } from "@/components/ui";
import { db } from "@/lib/db";
import { goalById, languageById } from "@/lib/types";
import { goalStateFor } from "@/lib/goals";
import { goalDeckId } from "@/lib/seed/goals/builder";

export function TrackCards() {
  const { settings } = useApp();
  const lang = languageById(settings.activeLanguage);
  const goalState = goalStateFor(settings, lang.id);

  const progressOf = async (deckId: string) => {
    const cs = await db.cards.where("deckIds").equals(deckId).toArray();
    return {
      total: cs.length,
      started: cs.filter((c) => c.srs.stage !== "new").length,
      learned: cs.filter((c) => c.srs.stage === "review" || c.srs.stage === "mastered").length,
    };
  };
  const basics = useLiveQuery(() => progressOf(`deck-${lang.id}-basics`), [lang.id]);
  const track = useLiveQuery(
    () => (goalState ? progressOf(goalDeckId(lang.id, goalState.focus)) : Promise.resolve(null)),
    [lang.id, goalState?.focus],
  );

  return (
    <div className="grid gap-3">
      {basics && basics.total > 0 && basics.learned < basics.total && (
        <div className="hero pattern-plus p-5 flex flex-wrap items-center gap-4">
          <span className="sticker w-12 h-12 text-2xl bg-mint/20 border border-mint/40">🌱</span>
          <div className="flex-1 min-w-[200px]">
            <div className="text-xs font-semibold text-mint uppercase tracking-wider">Level 1 · Start here</div>
            <div className="font-display font-semibold text-lg">{lang.name} basics — {basics.total} essential words</div>
            <div className="mt-2 max-w-sm"><Bar pct={(basics.started / basics.total) * 100} color="var(--mint)" /></div>
            <div className="text-xs text-ink-muted mt-1">{basics.started} of {basics.total} started · {basics.learned} learned · each word comes with how to say it 🗣 and audio 🔊</div>
          </div>
          <div className="flex gap-2">
            <Link href={`/decks/deck-${lang.id}-basics`} className="btn btn-outline">Browse words</Link>
            <Link href={`/study?mode=daily&deck=deck-${lang.id}-basics`} className="btn btn-primary"><Play size={16} /> {basics.started ? "Continue" : "Start"}</Link>
          </div>
        </div>
      )}

      {goalState && track && track.total > 0 && (
        <div className="hero pattern-waves p-5 flex flex-wrap items-center gap-4">
          <span className="sticker w-12 h-12 text-2xl bg-sky/20 border border-sky/40">{goalById(goalState.focus).emoji}</span>
          <div className="flex-1 min-w-[200px]">
            <div className="text-xs font-semibold text-sky uppercase tracking-wider">Your focus</div>
            <div className="font-display font-semibold text-lg">{lang.name} {goalById(goalState.focus).purpose}</div>
            <div className="mt-2 max-w-sm"><Bar pct={(track.started / track.total) * 100} color="var(--sky)" /></div>
            <div className="text-xs text-ink-muted mt-1">
              {track.started} of {track.total} started · {goalById(goalState.focus).topics.join(" · ")}
              {basics && basics.started < basics.total && " · starts right after Level 1"}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/decks/${goalDeckId(lang.id, goalState.focus)}`} className="btn btn-outline">Browse</Link>
            <Link href="/study?mode=daily" className="btn btn-primary"><Play size={16} /> Daily lesson</Link>
          </div>
        </div>
      )}
    </div>
  );
}
