import { Deck, VocabCard } from "@/lib/types";
import { FR_CARDS } from "./fr";
import { ES_CARDS } from "./es";
import { DARIJA_CARDS } from "./darija";
import { EN_CARDS } from "./enpro";
import { FR_BASICS, FR_BASICS_DECK } from "./basics/fr";
import { ES_BASICS, ES_BASICS_DECK } from "./basics/es";
import { DE_BASICS, DE_BASICS_DECK } from "./basics/de";
import { IT_BASICS, IT_BASICS_DECK } from "./basics/it";
import { DARIJA_BASICS, DARIJA_BASICS_DECK } from "./basics/darija";
import { EN_BASICS, EN_BASICS_DECK } from "./basics/en";
import { FR_GOALS } from "./goals/fr";
import { ES_GOALS } from "./goals/es";
import { DE_GOALS } from "./goals/de";
import { IT_GOALS } from "./goals/it";
import { DARIJA_GOALS } from "./goals/darija";
import { EN_GOALS } from "./goals/en";
import { PT_BASICS, PT_BASICS_DECK } from "./basics/pt";
import { RU_BASICS, RU_BASICS_DECK } from "./basics/ru";
import { PT_GOALS } from "./goals/pt";
import { RU_GOALS } from "./goals/ru";

const GOAL_SETS = [FR_GOALS, ES_GOALS, DE_GOALS, IT_GOALS, DARIJA_GOALS, EN_GOALS, PT_GOALS, RU_GOALS];

/** Bump when seed content is added so existing vaults receive the new decks/cards. */
export const SEED_VERSION = 6;

const T0 = new Date("2026-07-01T09:00:00Z").getTime();

export const SEED_DECKS: Deck[] = [
  FR_BASICS_DECK, ES_BASICS_DECK, DE_BASICS_DECK, IT_BASICS_DECK, DARIJA_BASICS_DECK, EN_BASICS_DECK, PT_BASICS_DECK, RU_BASICS_DECK,
  ...GOAL_SETS.flatMap((g) => g.decks),
  { id: "deck-fr-business", languageId: "fr", goal: "work", name: "Business French", description: "Vocabulary for the French workplace — meetings, deadlines, and formal connectors.", emoji: "💼", isAI: false, createdAt: T0 },
  { id: "deck-fr-slang", languageId: "fr", goal: "native", name: "French Slang & Spoken French", description: "How French people actually talk.", emoji: "🗣️", isAI: false, createdAt: T0 },
  { id: "deck-es-daily", languageId: "es", goal: "daily", name: "Everyday Spanish", description: "High-frequency words and untranslatable gems of daily life in Spain.", emoji: "☀️", isAI: false, createdAt: T0 },
  { id: "deck-es-travel", languageId: "es", goal: "travel", name: "Spanish for Travel", description: "Money, bookings, and practical situations.", emoji: "🧳", isAI: false, createdAt: T0 },
  { id: "deck-dj-travel", languageId: "darija", goal: "travel", name: "Darija Travel Essentials", description: "Souks, taxis, and tea — survive and thrive in Morocco.", emoji: "🕌", isAI: false, createdAt: T0 },
  { id: "deck-dj-restaurant", languageId: "darija", goal: "travel", name: "Darija Restaurant Expressions", description: "Order like a local.", emoji: "🍲", isAI: false, createdAt: T0 },
  { id: "deck-en-meetings", languageId: "en-pro", goal: "work", name: "Meetings & Corporate English", description: "The language of standups, syncs, and strategy decks.", emoji: "📊", isAI: false, createdAt: T0 },
  { id: "deck-en-negotiation", languageId: "en-pro", goal: "work", name: "Negotiation English", description: "Persuade, hedge, and close with precision.", emoji: "🤝", isAI: false, createdAt: T0 },
];

export const SEED_CARDS: VocabCard[] = [
  ...FR_BASICS, ...ES_BASICS, ...DE_BASICS, ...IT_BASICS, ...DARIJA_BASICS, ...EN_BASICS, ...PT_BASICS, ...RU_BASICS,
  ...GOAL_SETS.flatMap((g) => g.cards),
  ...FR_CARDS,
  ...ES_CARDS,
  ...DARIJA_CARDS,
  ...EN_CARDS,
];
