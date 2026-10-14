import { BasicRow, basicsCards, basicsDeck } from "./builder";

const ROWS: BasicRow[] = [
  ["hello / good morning", "bonjour", "bohn-ZHOOR", "Greetings", "interjection", "Bonjour, je m'appelle Hana.", "Hello, my name is Hana.", { note: "Used all day until early evening — French has no separate 'good morning'." }],
  ["goodbye", "au revoir", "oh ruh-VWAHR", "Greetings", "interjection", "Au revoir et à demain !", "Goodbye and see you tomorrow!"],
  ["please", "s'il vous plaît", "seel voo PLEH", "Greetings", "expression", "Un café, s'il vous plaît.", "A coffee, please.", { note: "Formal/polite. With friends: s'il te plaît (seel tuh PLEH)." }],
  ["thank you", "merci", "mair-SEE", "Greetings", "interjection", "Merci beaucoup pour votre aide.", "Thank you very much for your help."],
  ["yes", "oui", "WEE", "Greetings", "interjection", "Oui, bien sûr !", "Yes, of course!"],
  ["no", "non", "NOHN (nasal)", "Greetings", "interjection", "Non, merci.", "No, thank you."],
  ["excuse me / sorry", "excusez-moi", "ex-kew-zay-MWAH", "Greetings", "expression", "Excusez-moi, où est la gare ?", "Excuse me, where is the station?"],
  ["good evening", "bonsoir", "bohn-SWAHR", "Greetings", "interjection", "Bonsoir, madame.", "Good evening, madam."],
  ["good night", "bonne nuit", "bun NWEE", "Greetings", "expression", "Bonne nuit, dors bien !", "Good night, sleep well!"],
  ["how are you?", "comment ça va ?", "koh-mahn sah VAH", "Greetings", "expression", "Salut ! Comment ça va ?", "Hi! How are you?"],
  ["my name is…", "je m'appelle…", "zhuh mah-PELL", "Greetings", "expression", "Je m'appelle Hana, et toi ?", "My name is Hana, and you?"],

  ["one", "un", "UHN (nasal)", "Numbers", "adjective", "J'ai un frère.", "I have one brother."],
  ["two", "deux", "DUH", "Numbers", "adjective", "Deux cafés, s'il vous plaît.", "Two coffees, please."],
  ["three", "trois", "TWAH", "Numbers", "adjective", "Il est trois heures.", "It's three o'clock."],
  ["four", "quatre", "KAT-ruh", "Numbers", "adjective", "Nous sommes quatre.", "There are four of us."],
  ["five", "cinq", "SANK", "Numbers", "adjective", "J'arrive dans cinq minutes.", "I'll be there in five minutes."],
  ["six", "six", "SEESS", "Numbers", "adjective", "Le magasin ferme à six heures.", "The shop closes at six."],
  ["seven", "sept", "SET", "Numbers", "adjective", "Il y a sept jours dans une semaine.", "There are seven days in a week."],
  ["eight", "huit", "WEET", "Numbers", "adjective", "Je me lève à huit heures.", "I get up at eight."],
  ["nine", "neuf", "NUFF", "Numbers", "adjective", "Mon fils a neuf ans.", "My son is nine years old."],
  ["ten", "dix", "DEESS", "Numbers", "adjective", "Ça coûte dix euros.", "That costs ten euros."],

  ["red", "rouge", "ROOZH", "Colors", "adjective", "J'adore cette robe rouge.", "I love this red dress."],
  ["blue", "bleu", "BLUH", "Colors", "adjective", "Le ciel est bleu aujourd'hui.", "The sky is blue today."],
  ["green", "vert", "VAIR", "Colors", "adjective", "Je voudrais un thé vert.", "I'd like a green tea."],
  ["yellow", "jaune", "ZHOHN", "Colors", "adjective", "La banane est jaune.", "The banana is yellow."],
  ["black", "noir", "NWAHR", "Colors", "adjective", "J'ai un chat noir.", "I have a black cat."],
  ["white", "blanc", "BLAHN (nasal)", "Colors", "adjective", "Je préfère le vin blanc.", "I prefer white wine."],

  ["mother", "la mère", "lah MAIR", "Family", "noun", "Ma mère est professeure.", "My mother is a teacher.", { gender: "feminine" }],
  ["father", "le père", "luh PAIR", "Family", "noun", "Mon père travaille à Paris.", "My father works in Paris.", { gender: "masculine" }],
  ["brother", "le frère", "luh FRAIR", "Family", "noun", "Mon frère s'appelle Paul.", "My brother's name is Paul.", { gender: "masculine" }],
  ["sister", "la sœur", "lah SUR", "Family", "noun", "Ma sœur habite à Lyon.", "My sister lives in Lyon.", { gender: "feminine" }],
  ["friend", "l'ami", "lah-MEE", "Family", "noun", "C'est mon ami Karim.", "This is my friend Karim.", { gender: "masculine", note: "A female friend is l'amie (same sound)." }],

  ["water", "l'eau", "LOH", "Food & Drink", "noun", "Une bouteille d'eau, s'il vous plaît.", "A bottle of water, please.", { gender: "feminine" }],
  ["bread", "le pain", "luh PAN (nasal)", "Food & Drink", "noun", "J'achète du pain tous les matins.", "I buy bread every morning.", { gender: "masculine" }],
  ["coffee", "le café", "luh kah-FAY", "Food & Drink", "noun", "On prend un café ?", "Shall we grab a coffee?", { gender: "masculine" }],
  ["tea", "le thé", "luh TAY", "Food & Drink", "noun", "Tu veux du thé ?", "Do you want some tea?", { gender: "masculine" }],
  ["delicious", "délicieux", "day-lee-SYUH", "Food & Drink", "adjective", "Ce gâteau est délicieux !", "This cake is delicious!"],

  ["today", "aujourd'hui", "oh-zhoor-DWEE", "Time", "adverb", "Il fait beau aujourd'hui.", "The weather is nice today."],
  ["tomorrow", "demain", "duh-MAN (nasal)", "Time", "adverb", "À demain !", "See you tomorrow!"],
  ["yesterday", "hier", "YAIR", "Time", "adverb", "Hier, j'ai vu un film.", "Yesterday I watched a film."],

  ["to eat", "manger", "mahn-ZHAY", "Verbs", "verb", "On mange à midi.", "We eat at noon."],
  ["to drink", "boire", "BWAHR", "Verbs", "verb", "Je bois beaucoup d'eau.", "I drink a lot of water."],
  ["to go", "aller", "ah-LAY", "Verbs", "verb", "Je vais au marché.", "I'm going to the market."],
  ["to speak", "parler", "par-LAY", "Verbs", "verb", "Vous parlez anglais ?", "Do you speak English?"],
  ["to want", "vouloir", "voo-LWAHR", "Verbs", "verb", "Je veux apprendre le français.", "I want to learn French."],

  ["I don't understand", "je ne comprends pas", "zhuh nuh kohm-PRAHN pah", "Survival", "expression", "Pardon, je ne comprends pas.", "Sorry, I don't understand."],
  ["where is…?", "où est… ?", "oo EH", "Survival", "expression", "Où est la gare ?", "Where is the station?"],
  ["how much is it?", "c'est combien ?", "say kohm-BYAN", "Survival", "expression", "C'est combien, ce sac ?", "How much is this bag?"],
];

export const FR_BASICS_DECK = basicsDeck("fr", "Your first 48 French words — greetings, numbers, colours, family, food and survival phrases. Start here!");
export const FR_BASICS = basicsCards("fr", ROWS);
