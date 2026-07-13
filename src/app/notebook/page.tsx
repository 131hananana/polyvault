"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2, ArrowUpRight } from "lucide-react";
import { db, addCard } from "@/lib/db";
import { useApp } from "@/components/Providers";
import { languageById, NoteKind, NotebookEntry, uid } from "@/lib/types";
import { EmptyState } from "@/components/ui";

const KINDS: { id: NoteKind; label: string; emoji: string }[] = [
  { id: "word", label: "Word", emoji: "💬" },
  { id: "phrase", label: "Phrase", emoji: "🧩" },
  { id: "idiom", label: "Idiom", emoji: "🎭" },
  { id: "grammar", label: "Grammar", emoji: "📐" },
];

export default function NotebookPage() {
  const { settings } = useApp();
  const lang = languageById(settings.activeLanguage);
  const [kind, setKind] = useState<NoteKind>("word");
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [note, setNote] = useState("");

  const entries = useLiveQuery(
    () => db.notebook.where("languageId").equals(settings.activeLanguage).reverse().sortBy("createdAt"),
    [settings.activeLanguage],
  );

  const save = async () => {
    if (!text.trim()) return;
    const entry: NotebookEntry = {
      id: uid(), languageId: settings.activeLanguage, kind,
      text: text.trim(), translation: translation.trim(), note: note.trim(),
      createdAt: Date.now(),
    };
    await db.notebook.put(entry);
    setText(""); setTranslation(""); setNote("");
  };

  const promote = async (e: NotebookEntry) => {
    const card = await addCard({
      languageId: e.languageId, deckIds: [],
      word: e.text, nativeScript: e.text, translation: e.translation || "(add translation)",
      partOfSpeech: e.kind === "grammar" ? "phrase" : e.kind === "word" ? "noun" : e.kind,
      cefr: "B1", topic: e.kind === "grammar" ? "Grammar" : "Notebook",
      difficulty: 3, frequency: 3, pronunciation: "", ipa: "",
      collocations: [], synonyms: [], antonyms: [], relatedWords: [],
      memoryTips: e.note, commonMistakes: "", register: "neutral", examples: [],
    });
    await db.notebook.update(e.id, { promotedCardId: card.id });
  };

  return (
    <div className="fade-up max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notebook {lang.flag}</h1>
      <p className="text-sm text-ink-muted mt-1">Capture now, turn into full cards later.</p>

      <div className="card p-5 mt-5">
        <div className="flex gap-1.5 mb-3">
          {KINDS.map((k) => (
            <button key={k.id} onClick={() => setKind(k.id)}
              className={`pill !py-1.5 !px-3 cursor-pointer transition-colors ${kind === k.id ? "!bg-accent !text-white !border-transparent" : "hover:bg-surface-3"}`}>
              {k.emoji} {k.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2.5">
          <input className="input" dir={lang.rtl ? "rtl" : "ltr"} placeholder={`${KINDS.find(k => k.id === kind)?.label} in ${lang.name}…`}
            value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} />
          <input className="input" placeholder="Meaning / translation (optional)"
            value={translation} onChange={(e) => setTranslation(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} />
          <textarea className="input min-h-[60px] resize-y" placeholder="Context, where you heard it, notes…"
            value={note} onChange={(e) => setNote(e.target.value)} />
          <button onClick={save} disabled={!text.trim()} className="btn btn-primary justify-self-end">Save to notebook</button>
        </div>
      </div>

      <div className="mt-6 grid gap-2.5">
        {entries?.map((e) => (
          <div key={e.id} className="card p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="pill">{KINDS.find((k) => k.id === e.kind)?.emoji} {e.kind}</span>
                {e.promotedCardId && <span className="pill !bg-ok-soft !text-ok !border-transparent">→ card</span>}
              </div>
              <div className="font-semibold mt-1.5" dir={lang.rtl ? "rtl" : "ltr"}>{e.text}</div>
              {e.translation && <div className="text-sm text-ink-muted">{e.translation}</div>}
              {e.note && <div className="text-xs text-ink-faint mt-1">{e.note}</div>}
            </div>
            <div className="flex gap-1 shrink-0">
              {!e.promotedCardId && (
                <button className="btn btn-ghost !p-2" title="Turn into flashcard" onClick={() => promote(e)}>
                  <ArrowUpRight size={16} />
                </button>
              )}
              <button className="btn btn-ghost !p-2 !text-bad" title="Delete" onClick={() => db.notebook.delete(e.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {entries?.length === 0 && (
          <EmptyState emoji="📓" title="Empty notebook" sub="Jot down words, phrases, idioms, and grammar you encounter in the wild." />
        )}
      </div>
    </div>
  );
}
