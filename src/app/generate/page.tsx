"use client";

/* ============================================================
   AI Deck Generator — describe what you need; Claude builds
   a complete deck of fully-structured cards.
   ============================================================ */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, WandSparkles } from "lucide-react";
import { useApp } from "@/components/Providers";
import { db, addDeck } from "@/lib/db";
import { generateDeckCards } from "@/lib/ai/client";
import { LANGUAGES, LanguageId } from "@/lib/types";

const PRESETS = [
  { label: "50 French business words · B2", languageId: "fr", topic: "Business", cefr: "B2", count: 50, scenario: "" },
  { label: "100 Spanish travel vocabulary", languageId: "es", topic: "Travel", cefr: "A2", count: 100, scenario: "" },
  { label: "30 Darija restaurant expressions", languageId: "darija", topic: "Restaurants & Food", cefr: "A1", count: 30, scenario: "ordering food in Morocco" },
  { label: "English for Marketing Managers", languageId: "en-pro", topic: "Marketing", cefr: "C1", count: 40, scenario: "marketing manager at a tech company" },
] as const;

export default function GeneratePage() {
  const { settings } = useApp();
  const router = useRouter();
  const [languageId, setLanguageId] = useState<LanguageId>(settings.activeLanguage);
  const [topic, setTopic] = useState("");
  const [cefr, setCefr] = useState("B1");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(25);
  const [scenario, setScenario] = useState("");
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState("");

  const generate = async (opts?: typeof PRESETS[number]) => {
    const cfg = opts
      ? { languageId: opts.languageId as LanguageId, topic: opts.topic, cefr: opts.cefr, count: opts.count, scenario: opts.scenario, difficulty: "medium" }
      : { languageId, topic: topic.trim(), cefr, count, scenario: scenario.trim(), difficulty };
    if (!cfg.topic) return;
    setState("working");
    setError("");

    const lang = LANGUAGES.find((l) => l.id === cfg.languageId)!;
    const deck = await addDeck({
      languageId: cfg.languageId,
      name: `${cfg.topic} · ${cfg.cefr}`,
      description: `AI-generated ${lang.name} deck — ${cfg.count} ${cfg.topic.toLowerCase()} words at ${cfg.cefr}${cfg.scenario ? ` for ${cfg.scenario}` : ""}.`,
      emoji: "✨", isAI: true,
    });

    const cards = await generateDeckCards({ ...cfg, deckId: deck.id });
    if (!cards) {
      await db.decks.delete(deck.id);
      setState("error");
      setError("Deck generation needs the Claude API. Add your Anthropic API key in Settings (or set ANTHROPIC_API_KEY) and make sure you're online.");
      return;
    }
    await db.cards.bulkPut(cards);
    router.push(`/decks/${deck.id}`);
  };

  return (
    <div className="fade-up max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"><WandSparkles className="text-accent" /> AI Deck Generator</h1>
      <p className="text-sm text-ink-muted mt-1">Describe what you need — Claude writes complete cards: examples, IPA, memory tips, cultural notes, everything.</p>

      <div className="grid sm:grid-cols-2 gap-2 mt-5">
        {PRESETS.map((p) => (
          <button key={p.label} disabled={state === "working"} onClick={() => generate(p)}
            className="card p-4 text-left text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <Sparkles size={14} className="text-accent mb-1.5" />
            {p.label}
          </button>
        ))}
      </div>

      <div className="card p-6 mt-4">
        <h2 className="font-semibold mb-4">Custom deck</h2>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            <label className="grid gap-1 text-xs font-medium text-ink-muted">Language
              <select className="input" value={languageId} onChange={(e) => setLanguageId(e.target.value as LanguageId)}>
                {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-ink-muted">Topic
              <input className="input" placeholder="e.g. Negotiation, Medical, Slang" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <label className="grid gap-1 text-xs font-medium text-ink-muted">CEFR
              <select className="input" value={cefr} onChange={(e) => setCefr(e.target.value)}>
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-ink-muted">Difficulty
              <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {["easy", "medium", "hard"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-ink-muted">Cards
              <input type="number" min={5} max={100} className="input" value={count} onChange={(e) => setCount(Math.min(100, Math.max(5, Number(e.target.value) || 25)))} />
            </label>
          </div>
          <label className="grid gap-1 text-xs font-medium text-ink-muted">Industry / occupation / scenario (optional)
            <input className="input" placeholder="e.g. nurse in an ER, IELTS exam, startup fundraising" value={scenario} onChange={(e) => setScenario(e.target.value)} />
          </label>

          <button onClick={() => generate()} disabled={!topic.trim() || state === "working"} className="btn btn-primary !py-3 mt-1">
            {state === "working" ? <><Loader2 size={16} className="animate-spin" /> Claude is writing your deck… (up to a minute)</> : <><Sparkles size={16} /> Generate deck</>}
          </button>

          {state === "error" && <p className="text-sm text-bad bg-bad-soft rounded-xl px-4 py-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}
