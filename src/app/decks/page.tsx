"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Sparkles, X } from "lucide-react";
import { useApp } from "@/components/Providers";
import { db, addDeck } from "@/lib/db";
import { languageById } from "@/lib/types";
import { EmptyState } from "@/components/ui";
import { motion } from "framer-motion";

export default function DecksPage() {
  const { settings } = useApp();
  const lang = languageById(settings.activeLanguage);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📚");

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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Decks {lang.flag}</h1>
          <p className="text-sm text-ink-muted mt-1">Unlimited custom decks — every card still shares one SM-2 schedule.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/generate" className="btn btn-outline"><Sparkles size={15} /> AI generate</Link>
          <button onClick={() => setCreating(true)} className="btn btn-primary"><Plus size={15} /> New deck</button>
        </div>
      </div>

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
        {decks?.map((d) => (
          <Link key={d.id} href={`/decks/${d.id}`}
            className="card p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <span className="text-3xl">{d.emoji}</span>
              {d.isAI && <span className="pill !bg-accent-soft !text-accent !border-transparent"><Sparkles size={10} /> AI</span>}
            </div>
            <h3 className="font-semibold mt-3">{d.name}</h3>
            <p className="text-xs text-ink-muted mt-1 line-clamp-2">{d.description}</p>
            <p className="text-xs text-ink-faint mt-3">{countFor(d.id)} cards</p>
          </Link>
        ))}
      </div>

      {decks?.length === 0 && (
        <div className="mt-6">
          <EmptyState emoji="🗂️" title={`No ${lang.name} decks yet`}
            sub="Create one manually or let the AI generate a themed deck for you." />
        </div>
      )}
    </div>
  );
}
