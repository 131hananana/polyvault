"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Play, Trash2, ArrowLeft } from "lucide-react";
import { db, deleteDeck } from "@/lib/db";
import { languageById } from "@/lib/types";
import { EmptyState } from "@/components/ui";

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const deck = useLiveQuery(() => db.decks.get(id), [id]);
  const cards = useLiveQuery(() => db.cards.where("deckIds").equals(id).toArray(), [id]);

  if (deck === undefined) return null;
  if (deck === null || !deck) {
    return <EmptyState emoji="🫥" title="Deck not found" action={<Link href="/decks" className="btn btn-primary">All decks</Link>} />;
  }
  const lang = languageById(deck.languageId);

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
              <Link href={`/study?mode=daily&deck=${id}`} className="btn btn-primary"><Play size={15} /> Study this deck</Link>
            </>
          )}
        </div>
      </div>
      {deck.description && <p className="text-sm text-ink-muted mt-3 max-w-xl">{deck.description}</p>}

      <div className="card mt-6 divide-y divide-line">
        {cards?.map((c) => (
          <Link key={c.id} href={`/cards/${c.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-surface-2 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate" dir={lang.rtl ? "rtl" : "ltr"}>{c.nativeScript || c.word}</div>
              <div className="text-xs text-ink-muted truncate">{c.translation}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="pill">{c.cefr}</span>
              <span className={`pill ${c.srs.stage === "mastered" ? "!bg-ok-soft !text-ok !border-transparent" : c.srs.stage === "new" ? "" : "!bg-accent-soft !text-accent !border-transparent"}`}>
                {c.srs.stage}
              </span>
            </div>
          </Link>
        ))}
        {cards?.length === 0 && <div className="p-8 text-sm text-ink-muted text-center">This deck is empty — add cards from Quick Add or the AI generator.</div>}
      </div>
    </div>
  );
}
