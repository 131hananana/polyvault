"use client";

/* ============================================================
   "Say it like…" — how to read a word in Latin letters, with
   native-speed and slow audio right next to it.
   ============================================================ */

import { VocabCard, languageById } from "@/lib/types";
import { AudioButton } from "./AudioButton";

export function ReadAs({ card, center = false, audio = true, compact = false }: {
  card: Pick<VocabCard, "word" | "nativeScript" | "romanization" | "pronunciation" | "languageId">;
  center?: boolean;
  audio?: boolean;
  compact?: boolean;
}) {
  const lang = languageById(card.languageId);
  const spoken = card.nativeScript || card.word;
  const latin = card.romanization && card.romanization !== spoken ? card.romanization : null;
  if (!latin && !card.pronunciation && !audio) return null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${center ? "justify-center" : ""}`}>
      {(latin || card.pronunciation) && (
        <span className={`inline-flex items-center gap-2 rounded-full bg-sun/20 border border-sun/40 ${compact ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1.5 text-sm"}`}>
          {latin && <b className="font-semibold">{latin}</b>}
          {latin && card.pronunciation && <span className="text-ink-faint">·</span>}
          {card.pronunciation && <span className="read-as text-ink-muted">🗣 {card.pronunciation}</span>}
        </span>
      )}
      {audio && (
        <span className="inline-flex gap-0.5">
          <AudioButton text={spoken} lang={lang.speechTag} className={compact ? "!p-1.5" : ""} />
          <AudioButton text={spoken} lang={lang.speechTag} slow className={compact ? "!p-1.5" : ""} />
        </span>
      )}
    </div>
  );
}

/** Example sentence with its Latin reading (for non-Latin scripts) and audio. */
export function ExampleLine({ native, reading, translation, languageId, center = false }: {
  native: string; reading?: string; translation?: string; languageId: VocabCard["languageId"]; center?: boolean;
}) {
  const lang = languageById(languageId);
  return (
    <div className={center ? "text-center" : ""}>
      <div className={`flex items-start gap-1 ${center ? "justify-center" : "justify-between"}`}>
        <p dir={lang.rtl ? "rtl" : "ltr"} className="font-medium native-script">{native}</p>
        <AudioButton text={native} lang={lang.speechTag} className="shrink-0 !p-1.5 -mt-0.5" />
      </div>
      {reading && <p className="read-as text-xs text-ink-muted mt-0.5">🗣 {reading}</p>}
      {translation && translation !== "—" && <p className="text-ink-muted italic mt-1 text-sm">{translation}</p>}
    </div>
  );
}
