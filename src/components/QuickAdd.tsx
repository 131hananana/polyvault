"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "./Providers";
import { addCard } from "@/lib/db";
import { languageById, PartOfSpeech, CEFR } from "@/lib/types";

/** Minimal, fast capture — full card fields can be enriched later. */
export function QuickAddModal({ onClose }: { onClose: () => void }) {
  const { settings } = useApp();
  const lang = languageById(settings.activeLanguage);
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [pos, setPos] = useState<PartOfSpeech>("noun");
  const [cefr, setCefr] = useState<CEFR>("B1");
  const [topic, setTopic] = useState("General");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(0);

  const save = async () => {
    if (!word.trim() || !translation.trim()) return;
    setSaving(true);
    await addCard({
      languageId: settings.activeLanguage, deckIds: [],
      word: word.trim(), nativeScript: word.trim(), translation: translation.trim(),
      partOfSpeech: pos, cefr, topic: topic.trim() || "General",
      difficulty: 3, frequency: 3, pronunciation: "", ipa: "",
      collocations: [], synonyms: [], antonyms: [], relatedWords: [],
      memoryTips: "", commonMistakes: "", register: "neutral",
      examples: [],
    });
    setSaved((n) => n + 1);
    setWord(""); setTranslation("");
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Quick add · {lang.flag} {lang.name}</h2>
          <button onClick={onClose} className="btn btn-ghost !p-2" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="grid gap-3">
          <input autoFocus className="input" placeholder={`Word in ${lang.name}`} value={word}
            dir={lang.rtl ? "rtl" : "ltr"}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()} />
          <input className="input" placeholder="English translation" value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()} />
          <div className="grid grid-cols-3 gap-2">
            <select className="input" value={pos} onChange={(e) => setPos(e.target.value as PartOfSpeech)}>
              {["noun", "verb", "adjective", "adverb", "phrase", "idiom", "expression"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <select className="input" value={cefr} onChange={(e) => setCefr(e.target.value as CEFR)}>
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="input" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-ink-muted">{saved > 0 && `✓ ${saved} added`}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-ghost">Done</button>
            <button onClick={save} disabled={saving || !word.trim() || !translation.trim()} className="btn btn-primary">
              Add card
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
