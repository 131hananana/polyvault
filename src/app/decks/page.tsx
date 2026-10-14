"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Sparkles, X, Lock } from "lucide-react";
import { isDeckOpen, goalStateFor } from "@/lib/goals";
import { UnlockSheet } from "@/components/goals/Goals";
import { useApp } from "@/components/Providers";
import { db, addDeck } from "@/lib/db";
import { languageById, goalById, LearningGoal } from "@/lib/types";
import { EmptyState, PageHero } from "@/components/ui";
import { motion } from "framer-motion";

export default function DecksPage() {
  const { settings } = useApp();
  const lang = languageById(settings.activeLanguage);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [unlocking, setUnlocking] = useState<LearningGoal | null>(null);
  const goalState = goalStateFor(settings, settings.activeLanguage);

  const decks = useLiveQuery(
    () => db.decks.where("languageId").equals(settings.activeLanguage).toArray(),
    [settings.activeLanguage],
  );
  const cards = useLiveQuery(
    () => db.cards.where("languageId").equals(settings.activeLanguage).toArray(),
    [settings.activeLanguage],
  );

  const countFor = (deckId: string) => cards?.filter((c) => c.deckIds.includes(deckId)).length ?? 0;

  const create = async () => {
    if (!name.trim()) return;
    await addDeck({ languageId: settings.activeLanguage, name: name.trim(), description: description.trim(), emoji, isAI: false });
    setName(""); setDescription(""); setCreating(false);
  };

  return (
    <div className="fade-up">
      <PageHero pattern="confetti" sticker="🗂️" title={<>Decks {lang.flag}</>}
        sub="Unlimited custom decks — every card still shares one SM-2 schedule."
        action={
          <div className="flex gap-2">
            <Link href="/generate" className="btn btn-outline"><Sparkles size={15} /> AI generate</Link>
            <button onClick={() => setCreating(true)} className="btn btn-primary"><Plus size={15} /> New deck</button>
          </div>
        } />

      {creating && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Create deck</h2>
            <button className="btn btn-ghost !p-1.5" onClick={() => setCreating(false)} aria-label="Cancel"><X size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-[70px_1fr_1fr_auto] gap-2.5">
            <input className="input text-center" value={emoji} onChange={(e) => setEmoji(e.target.value)} aria-label="Emoji" />
            <input className="input" placeholder="Deck name (e.g. Medical Spanish)" value={name} autoFocus
              onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} />
            <input className="input" placeholder="Description (optional)" value={description}
              onChange={(e) => setDescription(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} />
            <button onClick={create} disabled={!name.trim()} className="btn btn-primary">Create</button>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {decks
          ?.slice()
          .sort((a, b) => Number(!isDeckOpen(a, goalState)) - Number(!isDeckOpen(b, goalState)) || a.createdAt - b.createdAt)
          .map((d) => {
            const open = isDeckOpen(d, goalState);
            const focus = d.goal && goalState?.focus === d.goal;
            const body = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-3xl ${open ? "" : "grayscale opacity-60"}`}>{d.emoji}</span>
                  <span className="flex gap-1 flex-wrap justify-end">
                    {focus && <span className="pill !bg-accent !text-white !border-transparent">Focus</span>}
                    {d.goal && !focus && open && <span className="pill">{goalById(d.goal).emoji} {goalById(d.goal).short}</span>}
                    {!open && <span className="pill !bg-sun/25 !border-sun/50 !text-ink"><Lock size={10} /> {goalById(d.goal!).short} · $3</span>}
                    {d.isAI && <span className="pill !bg-accent-soft !text-accent !border-transparent"><Sparkles size={10} /> AI</span>}
                  </span>
                </div>
                <h3 className={`font-semibold mt-3 ${open ? "" : "text-ink-muted"}`}>{d.name}</h3>
                <p className="text-xs text-ink-muted mt-1 line-clamp-2">{d.description}</p>
                <p className="text-xs text-ink-faint mt-3">{countFor(d.id)} cards{!open && " · tap to unlock"}</p>
              </>
            );
            return open ? (
              <Link key={d.id} href={`/decks/${d.id}`} className="card p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">{body}</Link>
            ) : (
              <button key={d.id} onClick={() => setUnlocking(d.goal!)} className="card p-5 text-left border-dashed hover:-translate-y-0.5 transition-all">{body}</button>
            );
          })}
      </div>
      {unlocking && <UnlockSheet lang={settings.activeLanguage} goal={unlocking} onClose={() => setUnlocking(null)} />}

      {decks?.length === 0 && (
        <div className="mt-6">
          <EmptyState emoji="🗂️" title={`No ${lang.name} decks yet`}
            sub="Create one manually or let the AI generate a themed deck for you." />
        </div>
      )}
    </div>
  );
}
