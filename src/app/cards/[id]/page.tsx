"use client";

/* ============================================================
   Full vocabulary card view — every field of the card
   structure, plus the AI Explanation Mode tutor section.
   ============================================================ */

import { use, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Sparkles, Loader2, BookOpen, MessageSquareQuote, Landmark, ScrollText, Info } from "lucide-react";
import { db } from "@/lib/db";
import { languageById, WordExplanation } from "@/lib/types";
import { getWordExplanation } from "@/lib/ai/client";
import { AudioButton } from "@/components/AudioButton";
import { EmptyState } from "@/components/ui";

export default function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const card = useLiveQuery(() => db.cards.get(id), [id]);
  const [explanation, setExplanation] = useState<(WordExplanation & { source: string }) | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  if (card === undefined) return null;
  if (!card) return <EmptyState emoji="🫥" title="Card not found" action={<Link href="/" className="btn btn-primary">Home</Link>} />;

  const lang = languageById(card.languageId);
  const dir = lang.rtl ? "rtl" : "ltr";

  const loadExplanation = async () => {
    setLoadingAI(true);
    setExplanation(await getWordExplanation(card));
    setLoadingAI(false);
  };

  return (
    <div className="fade-up max-w-3xl mx-auto">
      <Link href="/decks" className="btn btn-ghost !px-2 -ml-2 mb-4 text-sm"><ArrowLeft size={15} /> Back</Link>

      {/* ---------- header ---------- */}
      <div className="card !rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="pill">{lang.flag} {lang.name}</span>
          <span className="pill">{card.partOfSpeech}</span>
          <span className="pill">{card.cefr}</span>
          <span className="pill">{card.topic}</span>
          <span className="pill">difficulty {"●".repeat(card.difficulty)}{"○".repeat(5 - card.difficulty)}</span>
          <span className="pill">frequency {"●".repeat(card.frequency)}{"○".repeat(5 - card.frequency)}</span>
          <span className={`pill ${card.register === "formal" ? "!bg-accent-soft !text-accent" : card.register === "casual" ? "!bg-warn-soft !text-warn" : ""}`}>{card.register}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 dir={dir} className="text-4xl font-bold tracking-tight native-script">{card.nativeScript || card.word}</h1>
            {card.nativeScript && card.nativeScript !== card.word && <div className="text-lg text-ink-muted mt-1">{card.word}</div>}
            {card.romanization && <div className="text-ink-muted mt-1">{card.romanization}</div>}
            <div className="text-xl mt-2 font-medium">{card.translation}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <AudioButton text={card.nativeScript || card.word} lang={lang.speechTag} />
            <AudioButton text={card.nativeScript || card.word} lang={lang.speechTag} slow />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-sm text-ink-muted">
          {card.pronunciation && <span>🗣 {card.pronunciation}</span>}
          {card.ipa && <span className="font-mono">{card.ipa}</span>}
          {card.gender && card.gender !== "none" && <span>{card.gender === "masculine" ? "♂ masculine" : card.gender === "feminine" ? "♀ feminine" : card.gender}</span>}
          {card.plural && <span>plural: <b dir={dir}>{card.plural}</b></span>}
        </div>
      </div>

      {/* ---------- SRS state ---------- */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        <Mini label="stage" value={card.srs.stage} />
        <Mini label="interval" value={card.srs.interval ? `${card.srs.interval}d` : "—"} />
        <Mini label="ease" value={card.srs.ease.toFixed(2)} />
        <Mini label="lapses" value={String(card.srs.lapses)} />
      </div>

      {/* ---------- examples ---------- */}
      <Section icon={<MessageSquareQuote size={15} />} title="Example sentences">
        <div className="grid gap-3">
          {card.examples.map((ex, i) => (
            <div key={i} className="bg-surface-2 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <p dir={dir} className="font-semibold native-script text-[15px]">{ex.native}</p>
                <AudioButton text={ex.native} lang={lang.speechTag} className="shrink-0 -mt-1" />
              </div>
              <p className="text-sm text-ink-muted italic mt-1">{ex.translation}</p>
              {ex.explanation && <p className="text-xs mt-2"><b className="text-ink-muted">How it works:</b> {ex.explanation}</p>}
              {ex.whyUseful && <p className="text-xs mt-1 text-accent">✦ {ex.whyUseful}</p>}
            </div>
          ))}
          {card.examples.length === 0 && <p className="text-sm text-ink-muted">No examples yet.</p>}
        </div>
      </Section>

      {/* ---------- word network ---------- */}
      {(card.collocations.length + card.synonyms.length + card.antonyms.length + card.relatedWords.length > 0) && (
        <Section icon={<BookOpen size={15} />} title="Word network">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <ChipList label="Collocations" items={card.collocations} dir={dir} />
            <ChipList label="Synonyms" items={card.synonyms} dir={dir} />
            <ChipList label="Antonyms" items={card.antonyms} dir={dir} />
            <ChipList label="Related words" items={card.relatedWords} dir={dir} />
          </div>
        </Section>
      )}

      {/* ---------- conjugation ---------- */}
      {card.conjugations && card.conjugations.length > 0 && (
        <Section icon={<ScrollText size={15} />} title="Conjugation">
          <div className="grid sm:grid-cols-2 gap-3">
            {card.conjugations.map((c) => (
              <div key={c.tense} className="bg-surface-2 rounded-xl p-4">
                <div className="text-xs font-semibold text-accent mb-2">{c.tense}</div>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(c.forms).map(([person, form]) => (
                      <tr key={person}>
                        <td className="text-ink-muted py-0.5 pr-3 whitespace-nowrap">{person}</td>
                        <td dir={dir} className="font-medium">{form}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          {card.irregularForms && card.irregularForms.length > 0 && (
            <p className="text-xs text-warn mt-2">⚠ Irregular: {card.irregularForms.join(" · ")}</p>
          )}
        </Section>
      )}

      {/* ---------- notes ---------- */}
      <Section icon={<Info size={15} />} title="Learning notes">
        <div className="grid gap-3">
          <Note label="💡 Memory tips" text={card.memoryTips} />
          <Note label="⚠️ Common mistakes" text={card.commonMistakes} tone="bad" />
          <Note label="✍️ Grammar" text={card.grammarNotes} />
          <Note label="🎯 Usage" text={card.usageNotes} />
        </div>
      </Section>

      {card.culturalNotes && (
        <Section icon={<Landmark size={15} />} title="Cultural notes">
          <p className="text-sm leading-relaxed">{card.culturalNotes}</p>
        </Section>
      )}

      {/* ---------- AI explanation mode ---------- */}
      <div className="card !border-accent/30 mt-4 overflow-hidden">
        <div className="bg-accent-soft px-5 py-3 flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <span className="font-semibold text-sm text-accent">AI Tutor · Explanation Mode</span>
          {explanation && <span className="text-xs text-ink-muted ml-auto">{explanation.source === "claude" ? "Claude" : "offline tutor"}</span>}
        </div>
        <div className="p-5">
          {!explanation && !loadingAI && (
            <div className="text-center py-4">
              <p className="text-sm text-ink-muted max-w-md mx-auto">
                Get a native-teacher deep-dive: what this word <i>really</i> means, when (not) to use it,
                what it gets confused with, and how it behaves in business, travel, and daily life.
              </p>
              <button className="btn btn-primary mt-4" onClick={loadExplanation}><Sparkles size={15} /> Explain like a native teacher</button>
            </div>
          )}
          {loadingAI && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
              <Loader2 size={17} className="animate-spin text-accent" /> Preparing your lesson…
            </div>
          )}
          {explanation && (
            <div className="grid gap-4 fade-up">
              <Explain label="What it really means" text={explanation.realMeaning} />
              <Explain label="When natives use it" text={explanation.whenUsed} />
              <Explain label="When NOT to use it" text={explanation.whenNotToUse} />
              {explanation.confusedWith.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">Often confused with</div>
                  <div className="flex flex-wrap gap-1.5">{explanation.confusedWith.map((w) => <span key={w} className="pill">{w}</span>)}</div>
                </div>
              )}
              <Explain label="Similar words, different jobs" text={explanation.similarWordsDiff} />
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">In real situations</div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <Situation emoji="🌍" label="Real life" text={explanation.situations.realLife} dir={dir} />
                  <Situation emoji="💼" label="Business" text={explanation.situations.business} dir={dir} />
                  <Situation emoji="💬" label="Daily talk" text={explanation.situations.daily} dir={dir} />
                  <Situation emoji="✈️" label="Travel" text={explanation.situations.travel} dir={dir} />
                </div>
              </div>
              <Explain label="Learner mistakes" text={explanation.learnerMistakes} />
              <Explain label="Memory tricks" text={explanation.memoryTricks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-ink-faint">{label}</div>
      <div className="text-sm font-bold mt-0.5">{value}</div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 md:p-6 mt-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">{icon} {title}</div>
      {children}
    </div>
  );
}

function ChipList({ label, items, dir }: { label: string; items: string[]; dir: "rtl" | "ltr" }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-ink-muted mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">{items.map((i) => <span key={i} dir={dir} className="pill !text-[13px] !py-1">{i}</span>)}</div>
    </div>
  );
}

function Note({ label, text, tone }: { label: string; text?: string; tone?: "bad" }) {
  if (!text) return null;
  return (
    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${tone === "bad" ? "bg-bad-soft" : "bg-surface-2"}`}>
      <b className="block text-xs mb-1">{label}</b>{text}
    </div>
  );
}

function Explain({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">{label}</div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Situation({ emoji, label, text, dir }: { emoji: string; label: string; text: string; dir: string }) {
  return (
    <div className="bg-surface-2 rounded-xl p-3">
      <div className="text-xs font-semibold mb-1">{emoji} {label}</div>
      <p className="text-[13px] leading-relaxed" dir={dir as "rtl" | "ltr"}>{text}</p>
    </div>
  );
}
