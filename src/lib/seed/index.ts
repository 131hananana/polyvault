import { Deck, VocabCard } from "@/lib/types";
import { FR_CARDS } from "./fr";
import { ES_CARDS } from "./es";
import { DARIJA_CARDS } from "./darija";
import { AR_CARDS } from "./ar";
import { EN_CARDS } from "./enpro";

const T0 = new Date("2026-07-01T09:00:00Z").getTime();

export const SEED_DECKS: Deck[] = [
  { id: "deck-fr-business", languageId: "fr", name: "Business French", description: "Vocabulary for the French workplace — meetings, deadlines, and formal connectors.", emoji: "💼", isAI: false, createdAt: T0 },
  { id: "deck-fr-slang", languageId: "fr", name: "French Slang & Spoken French", description: "How French people actually talk.", emoji: "🗣️", isAI: false, createdAt: T0 },
  { id: "deck-es-daily", languageId: "es", name: "Everyday Spanish", description: "High-frequency words and untranslatable gems of daily life in Spain.", emoji: "☀️", isAI: false, createdAt: T0 },
  { id: "deck-es-travel", languageId: "es", name: "Spanish for Travel", description: "Money, bookings, and practical situations.", emoji: "🧳", isAI: false, createdAt: T0 },
  { id: "deck-dj-travel", languageId: "darija", name: "Darija Travel Essentials", description: "Souks, taxis, and tea — survive and thrive in Morocco.", emoji: "🕌", isAI: false, createdAt: T0 },
  { id: "deck-dj-restaurant", languageId: "darija", name: "Darija Restaurant Expressions", description: "Order like a local.", emoji: "🍲", isAI: false, createdAt: T0 },
  { id: "deck-ar-msa", languageId: "ar", name: "Modern Standard Arabic Core", description: "Formal Arabic for work, news, and correspondence.", emoji: "📰", isAI: false, createdAt: T0 },
  { id: "deck-ar-quran", languageId: "ar", name: "Quranic & Classical Vocabulary", description: "Key concepts with their roots and contexts.", emoji: "📖", isAI: false, createdAt: T0 },
  { id: "deck-en-meetings", languageId: "en-pro", name: "Meetings & Corporate English", description: "The language of standups, syncs, and strategy decks.", emoji: "📊", isAI: false, createdAt: T0 },
  { id: "deck-en-negotiation", languageId: "en-pro", name: "Negotiation English", description: "Persuade, hedge, and close with precision.", emoji: "🤝", isAI: false, createdAt: T0 },
];

export const SEED_CARDS: VocabCard[] = [
  ...FR_CARDS,
  ...ES_CARDS,
  ...DARIJA_CARDS,
  ...AR_CARDS,
  ...EN_CARDS,
];
