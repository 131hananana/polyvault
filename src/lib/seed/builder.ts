import { VocabCard, LanguageId, NEW_SRS } from "@/lib/types";

const T0 = new Date("2026-07-01T09:00:00Z").getTime();

type Overrides = Partial<VocabCard> &
  Pick<VocabCard, "id" | "word" | "translation" | "topic" | "examples"> & {
    languageId: LanguageId;
  };

/** Card factory with sensible defaults so seed files stay readable. */
export function card(o: Overrides): VocabCard {
  return {
    nativeScript: o.word,
    partOfSpeech: "noun",
    cefr: "A2",
    difficulty: 2,
    frequency: 4,
    pronunciation: "",
    ipa: "",
    gender: "none",
    collocations: [],
    synonyms: [],
    antonyms: [],
    relatedWords: [],
    memoryTips: "",
    commonMistakes: "",
    register: "neutral",
    deckIds: [],
    srs: { ...NEW_SRS },
    createdAt: T0,
    updatedAt: T0,
    ...o,
  } as VocabCard;
}
