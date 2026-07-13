"use client";

/* ============================================================
   Import — paste text, upload TXT/Markdown/PDF, or fetch a
   URL; Claude extracts vocabulary and builds complete cards.
   ============================================================ */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Link2, ClipboardPaste, Loader2, Sparkles } from "lucide-react";
import { useApp } from "@/components/Providers";
import { db, addDeck } from "@/lib/db";
import { extractCardsFromText } from "@/lib/ai/client";
import { LANGUAGES, LanguageId } from "@/lib/types";

type Source = "paste" | "file" | "url";

export default function ImportPage() {
  const { settings } = useApp();
  const router = useRouter();
  const [source, setSource] = useState<Source>("paste");
  const [languageId, setLanguageId] = useState<LanguageId>(settings.activeLanguage);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [deckName, setDeckName] = useState("");
  const [count, setCount] = useState(20);
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = async (f: File) => {
    if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
      // light-touch PDF text extraction (works for text-based PDFs)
      const buf = new Uint8Array(await f.arrayBuffer());
      const raw = new TextDecoder("latin1").decode(buf);
      const matches = raw.match(/\(((?:[^()\\]|\\.)+)\)\s*T[Jj]/g) ?? [];
      const extracted = matches.map((m) => m.replace(/\)\s*T[Jj]$/, "").slice(1).replace(/\\([()\\])/g, "$1")).join(" ");
      if (extracted.trim().length > 50) { setText(extracted); return; }
      setError("This PDF appears to be scanned or compressed — copy the text and paste it instead.");
      setState("error");
      return;
    }
    setText(await f.text());
  };

  const run = async () => {
    setState("working"); setError("");
    let content = text;

    if (source === "url") {
      try {
        const res = await fetch(url);
        const html = await res.text();
        content = html
          .replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      } catch {
        setError("Couldn't fetch that URL directly (the site may block cross-origin requests). Open the page, copy the text, and use Paste instead.");
        setState("error");
        return;
      }
    }

    if (content.trim().length < 40) {
      setError("Not enough text to extract vocabulary from.");
      setState("error");
      return;
    }

    const lang = LANGUAGES.find((l) => l.id === languageId)!;
    const deck = await addDeck({
      languageId,
      name: deckName.trim() || `Imported · ${new Date().toLocaleDateString()}`,
      description: `Vocabulary extracted by Claude from imported ${source === "url" ? "web page" : "text"} (${lang.name}).`,
      emoji: "📥", isAI: true,
    });
    const cards = await extractCardsFromText({ languageId, text: content, deckId: deck.id, count });
    if (!cards) {
      await db.decks.delete(deck.id);
      setError("Vocabulary extraction needs the Claude API. Add your Anthropic API key in Settings and make sure you're online.");
      setState("error");
      return;
    }
    await db.cards.bulkPut(cards);
    router.push(`/decks/${deck.id}`);
  };

  return (
    <div className="fade-up max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Import vocabulary</h1>
      <p className="text-sm text-ink-muted mt-1">PDF, TXT, Markdown, copy-paste, or a URL — Claude extracts the words worth learning and builds full cards.</p>

      <div className="flex gap-1.5 mt-5">
        {([["paste", ClipboardPaste, "Paste"], ["file", FileUp, "File"], ["url", Link2, "URL"]] as const).map(([id, Icon, label]) => (
          <button key={id} onClick={() => setSource(id as Source)}
            className={`btn ${source === id ? "btn-primary" : "btn-outline"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="card p-6 mt-4 grid gap-3">
        {source === "paste" && (
          <textarea className="input min-h-[180px] resize-y" placeholder="Paste an article, book chapter, email, lyrics — anything…"
            value={text} onChange={(e) => setText(e.target.value)} />
        )}
        {source === "file" && (
          <div
            className="border-2 border-dashed border-line rounded-2xl p-10 text-center cursor-pointer hover:border-accent transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) readFile(f); }}
          >
            <FileUp className="mx-auto text-ink-faint" />
            <p className="text-sm mt-2 font-medium">Drop a file or click to browse</p>
            <p className="text-xs text-ink-muted mt-1">.txt · .md · .pdf</p>
            {text && <p className="text-xs text-ok mt-2">✓ {text.length.toLocaleString()} characters loaded</p>}
            <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.pdf,text/plain" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
          </div>
        )}
        {source === "url" && (
          <input className="input" placeholder="https://example.com/article" value={url} onChange={(e) => setUrl(e.target.value)} />
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <label className="grid gap-1 text-xs font-medium text-ink-muted">Target language
            <select className="input" value={languageId} onChange={(e) => setLanguageId(e.target.value as LanguageId)}>
              {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-ink-muted">Max words to extract
            <input type="number" min={5} max={50} className="input" value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(5, Number(e.target.value) || 20)))} />
          </label>
        </div>
        <label className="grid gap-1 text-xs font-medium text-ink-muted">Deck name (optional)
          <input className="input" placeholder="e.g. Le Petit Prince — Chapter 1" value={deckName} onChange={(e) => setDeckName(e.target.value)} />
        </label>

        <button onClick={run} disabled={state === "working" || (source === "url" ? !url.trim() : !text.trim())} className="btn btn-primary !py-3">
          {state === "working" ? <><Loader2 size={16} className="animate-spin" /> Extracting vocabulary…</> : <><Sparkles size={16} /> Extract & build cards</>}
        </button>
        {state === "error" && <p className="text-sm text-bad bg-bad-soft rounded-xl px-4 py-3">{error}</p>}
      </div>
    </div>
  );
}
