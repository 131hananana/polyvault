"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Play, Trash2, ArrowLeft, Lock } from "lucide-react";
import { useApp } from "@/components/Providers";
import { isDeckOpen, goalStateFor } from "@/lib/goals";
import { UnlockSheet } from "@/components/goals/Goals";
import { db, deleteDeck } from "@/lib/db";
import { languageById, VocabCard, goalById, GOAL_UNLOCK_PRICE_USD } from "@/lib/types";
import { ReadAs } from "@/components/ReadAs";
import { BASIC_TOPICS } from "@/lib/seed/basics/builder";
import { EmptyState } from "@/components/ui";

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const { settings } = useApp();

  const deck = useLiveQuery(() => db.decks.get(id), [id]);
  const cards = useLiveQuery(
    () => db.cards.where("deckIds").equals(id).toArray().then((cs) => cs.sort((a, b) => a.createdAt - b.createdAt)),
    [id],
  );

  if (deck === undefined) return null;
  if (deck === null || !deck) {
    return <EmptyState emoji="🫥" title="Deck not found" action={<Link href="/decks" className="btn btn-primary">All decks</Link>} />;
  }
  const lang = languageById(deck.languageId);
  const open = isDeckOpen(deck, goalStateFor(settings, deck.languageId));
  // phrasebook decks (Level 1 + goal tracks) are shown grouped by topic
  const topics = id.endsWith("-basics")
    ? BASIC_TOPICS
    : id.includes("-goal-") && deck.goal
      ? goalById(deck.goal).topics.map((t) => ({ id: t, emoji: goalById(deck.goal!).emoji }))
      : null;

  return (
    <div className="fade-up">
      <Link href="/decks" className="btn btn-ghost !px-2 -ml-2 mb-4 text-sm"><ArrowLeft size={15} /> Decks</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{deck.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{deck.name}</h1>
            <p className="text-sm text-ink-muted">{lang.flag} {lang.name} · {cards?.length ?? 0} cards</p>
          </div>
        </div>
        <div className="flex gap-2">
          {confirming ? (
            <>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn !bg-bad !text-white" onClick={async () => { await deleteDeck(id); router.push("/decks"); }}>
                Delete deck
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost !text-bad" onClick={() => setConfirming(true)} aria-label="Delete deck"><Trash2 size={15} /></button>
              {open && <Link href={`/study?mode=daily&deck=${id}`} className="btn btn-primary"><Play size={15} /> Study this deck</Link>}
            </>
          )}
        </div>
      </div>
      {deck.description && <p className="text-sm text-ink-muted mt-3 max-w-xl">{deck.description}</p>}

      {!open && deck.goal ? (
        <div className="mt-6">
          <div className="card divide-y divide-line relative overflow-hidden">
            {cards?.slice(0, 3).map((c) => <CardRow key={c.id} card={c} rtl={lang.rtl} />)}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--surface)] to-transparent" />
          </div>
          <div className="hero pattern-dots p-6 mt-3 text-center">
            <Lock className="mx-auto text-ink-muted" />
            <div className="font-display font-semibold text-lg mt-2">{goalById(deck.goal).emoji} {goalById(deck.goal).label} is locked</div>
            <p className="text-sm text-ink-muted mt-1">Unlock {cards?.length ?? 0} tailored {lang.name} words & phrases for ${GOAL_UNLOCK_PRICE_USD}.</p>
            <button className="btn btn-primary mt-4" onClick={() => setUnlocking(true)}>Unlock for ${GOAL_UNLOCK_PRICE_USD}</button>
          </div>
          {unlocking && <UnlockSheet lang={deck.languageId} goal={deck.goal} onClose={() => setUnlocking(false)} />}
        </div>
      ) : topics && cards ? (
        <div className="grid gap-4 mt-6">
          {topics.map(({ id: topic, emoji }) => {
            const group = cards.filter((c) => c.topic === topic);
            if (!group.length) return null;
            return (
              <section key={topic} className="card overflow-hidden">
                <div className="hero !rounded-none !border-0 !shadow-none pattern-dots px-4 py-3 flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <h2 className="font-display font-semibold">{topic}</h2>
                  <span className="pill ml-auto">{group.filter((c) => c.srs.stage !== "new").length}/{group.length}</span>
                </div>
                <div className="divide-y divide-line">
                  {group.map((c) => <CardRow key={c.id} card={c} rtl={lang.rtl} />)}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="card mt-6 divide-y divide-line">
          {cards?.map((c) => <CardRow key={c.id} card={c} rtl={lang.rtl} />)}
          {cards?.length === 0 && <div className="p-8 text-sm text-ink-muted text-center">This deck is empty — add cards from Quick Add or the AI generator.</div>}
        </div>
      )}
    </div>
  );
}

function CardRow({ card: c, rtl }: { card: VocabCard; rtl: boolean }) {
  return (
    <Link href={`/cards/${c.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-surface-2 transition-colors">
      <div className="min-w-0 grid gap-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold native-script" dir={rtl ? "rtl" : "ltr"}>{c.nativeScript || c.word}</span>
          <span className="text-sm text-ink-muted">{c.translation}</span>
        </div>
        <ReadAs card={c} compact />
      </div>
      <span className={`pill shrink-0 ${c.srs.stage === "mastered" ? "!bg-ok-soft !text-ok !border-transparent" : c.srs.stage === "new" ? "" : "!bg-accent-soft !text-accent !border-transparent"}`}>
        {c.srs.stage}
      </span>
    </Link>
  );
}
