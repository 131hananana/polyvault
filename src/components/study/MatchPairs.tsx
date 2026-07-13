"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VocabCard, languageById } from "@/lib/types";

interface Tile { id: string; cardId: string; text: string; side: "word" | "translation" }

export function MatchPairs({ cards, onComplete }: {
  cards: VocabCard[]; onComplete: (results: { cardId: string; misses: number }[]) => void;
}) {
  const tiles = useMemo<Tile[]>(() => {
    const t: Tile[] = [];
    for (const c of cards) {
      t.push({ id: c.id + ":w", cardId: c.id, text: c.nativeScript || c.word, side: "word" });
      t.push({ id: c.id + ":t", cardId: c.id, text: c.translation, side: "translation" });
    }
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  }, [cards]);

  const [selected, setSelected] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState<string | null>(null);
  const [misses, setMisses] = useState<Record<string, number>>({});

  const pick = (tile: Tile) => {
    if (matched.has(tile.cardId + tile.side) || tile.id === selected?.id) return;
    if (!selected) { setSelected(tile); return; }
    if (selected.cardId === tile.cardId && selected.side !== tile.side) {
      const next = new Set(matched);
      next.add(tile.cardId + "word"); next.add(tile.cardId + "translation");
      setMatched(next); setSelected(null);
      if (next.size === tiles.length) {
        setTimeout(() => onComplete(cards.map((c) => ({ cardId: c.id, misses: misses[c.id] ?? 0 }))), 500);
      }
    } else {
      setShake(tile.id);
      setMisses((m) => ({ ...m, [tile.cardId]: (m[tile.cardId] ?? 0) + 1, [selected.cardId]: (m[selected.cardId] ?? 0) + 1 }));
      setTimeout(() => setShake(null), 400);
      setSelected(null);
    }
  };

  return (
    <div>
      <p className="text-sm text-ink-muted text-center mb-5">Match each word with its meaning</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tiles.map((t) => {
          const isMatched = matched.has(t.cardId + t.side);
          const isSelected = selected?.id === t.id;
          const lang = languageById(cards[0].languageId);
          return (
            <motion.button
              key={t.id}
              animate={shake === t.id ? { x: [-6, 6, -4, 4, 0] } : isMatched ? { scale: [1, 1.06, 1] } : {}}
              onClick={() => pick(t)}
              disabled={isMatched}
              dir={t.side === "word" && lang.rtl ? "rtl" : "ltr"}
              className={`card !rounded-xl px-3 py-4 text-sm font-medium min-h-[64px] grid place-items-center transition-all
                ${isMatched ? "opacity-30 !border-ok" : "hover:-translate-y-0.5 cursor-pointer"}
                ${isSelected ? "!border-accent !bg-accent-soft" : ""}
                ${t.side === "word" ? "native-script" : ""}`}
            >
              {t.text}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
