"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { searchCards } from "@/lib/db";
import { VocabCard, LANGUAGES, languageById, LanguageId } from "@/lib/types";
import { EmptyState } from "@/components/ui";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VocabCard[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.trim().length < 2) { setResults([]); setSearched(false); return; }
      setResults(await searchCards(query));
      setSearched(true);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<LanguageId, VocabCard[]>();
    for (const c of results) {
      const arr = map.get(c.languageId) ?? [];
      arr.push(c);
      map.set(c.languageId, arr);
    }
    return LANGUAGES.filter((l) => map.has(l.id)).map((l) => ({ lang: l, cards: map.get(l.id)! }));
  }, [results]);

  return (
    <div className="fade-up max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Search everywhere</h1>
      <p className="text-sm text-ink-muted mt-1">One query across all five language libraries.</p>

      <div className="relative mt-5">
        <SearchIcon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          autoFocus
          className="input !pl-11 !py-3.5 !rounded-2xl text-base"
          placeholder="Try “meeting”, “bghit”, “sobremesa”…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {grouped.map(({ lang, cards }) => (
        <div key={lang.id} className="mt-6">
          <h2 className="text-sm font-semibold text-ink-muted mb-2">{lang.flag} {lang.name} · {cards.length}</h2>
          <div className="card divide-y divide-line">
            {cards.map((c) => (
              <Link key={c.id} href={`/cards/${c.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-surface-2 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" dir={languageById(c.languageId).rtl ? "rtl" : "ltr"}>
                    {c.nativeScript || c.word}
                    {c.romanization && <span className="text-ink-faint font-normal ml-2">{c.romanization}</span>}
                  </div>
                  <div className="text-xs text-ink-muted truncate">{c.translation} · {c.topic}</div>
                </div>
                <span className="pill shrink-0">{c.cefr}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {searched && results.length === 0 && (
        <div className="mt-8">
          <EmptyState emoji="🔍" title={`No results for “${query}”`} sub="Try the translation, romanization, or a topic name." />
        </div>
      )}
    </div>
  );
}
