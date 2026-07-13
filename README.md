# PolyVault 🔮

A private, offline-first multilingual vocabulary vault — spaced repetition, AI tutoring, and calm, focused design. Built for one learner: you.

## Features

- **5 independent language libraries** — 🇫🇷 French, 🇪🇸 Spanish, 🇲🇦 Moroccan Darija, 🇸🇦 Arabic, 🇺🇸 Professional English — each with its own dashboard, queue, streak, and statistics.
- **SM-2 spaced repetition** with Again / Hard / Good / Easy grading, learning steps, lapse tracking, and interval previews.
- **12 quiz modes**: flashcards, multiple choice, typing, listening, pronunciation (speech-recognition scored), reverse translation, fill-in-the-blank, sentence completion, match pairs, speed review, timed challenge, and mistake review — plus mixed daily/weekly/monthly review sets.
- **AI Personal Tutor** — answer wrong and the tutor explains *why*, contrasts confusable vocabulary, gives memory techniques, then drills 3–5 personalized follow-up exercises until you demonstrate mastery (missed drills re-queue automatically).
- **AI Explanation Mode** on every card — what the word really means, when natives (don't) use it, business/travel/daily situations, learner traps.
- **AI Deck Generator & Importer** — generate themed decks by topic/CEFR/scenario, or extract vocabulary cards from pasted text, TXT/Markdown/PDF files, and URLs.
- **Rich cards**: native script, IPA, romanization, gender, plurals, conjugations, collocations, synonyms/antonyms, memory tips, common mistakes, cultural/grammar/usage notes, register, and 3+ annotated example sentences with native + slow audio.
- **Notebook** for quick capture of words/phrases/idioms/grammar, promotable to full cards.
- **Statistics**: retention, accuracy, streaks, study time, weakest/strongest topics, activity heatmap, achievements, XP and levels.
- **Installable PWA**, fully offline: all data lives in IndexedDB on your device.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

## AI features (optional)

The app is fully usable offline with a built-in deterministic tutor. To unlock Claude-powered tutoring, deck generation, and imports, either:

- set `ANTHROPIC_API_KEY` in `.env.local` (see `.env.example`), or
- paste your key in **Settings → AI Tutor** (stored only in your browser's IndexedDB).

## Architecture notes

- **Local-first by design.** IndexedDB (Dexie) is the single source of truth, so the app works with zero connectivity and zero accounts. A sync backend (e.g. Supabase/Postgres) can be layered on later by replicating the Dexie tables; for a single private user, local storage is simpler, faster, and more private.
- `src/lib/srs/sm2.ts` — the scheduling algorithm; `src/lib/db.ts` — storage + queue selection; `src/lib/ai/` — Claude client with offline fallback; `src/components/study/` — the session engine, question renderers, and tutor panel.
- The service worker (`public/sw.js`) caches the app shell for offline navigation; API calls are network-only with a client-side fallback.
