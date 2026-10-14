import { BasicRow, basicsCards, basicsDeck } from "./builder";

const ROWS: BasicRow[] = [
  ["hi / bye", "ciao", "CHOW", "Greetings", "interjection", "Ciao, come va?", "Hi, how's it going?", { note: "Casual — works for both hello and goodbye." }],
  ["goodbye", "arrivederci", "ah-ree-veh-DEHR-chee", "Greetings", "interjection", "Arrivederci e a domani!", "Goodbye and see you tomorrow!"],
  ["please", "per favore", "pehr fah-VOH-reh", "Greetings", "expression", "Un caffè, per favore.", "A coffee, please."],
  ["thank you", "grazie", "GRAHT-see-eh", "Greetings", "interjection", "Grazie mille per l'aiuto.", "Thanks a lot for the help."],
  ["yes", "sì", "SEE", "Greetings", "interjection", "Sì, certo!", "Yes, of course!"],
  ["no", "no", "NOH", "Greetings", "interjection", "No, grazie.", "No, thank you."],
  ["excuse me / sorry", "scusi", "SKOO-zee", "Greetings", "interjection", "Scusi, dov'è la stazione?", "Excuse me, where is the station?", { note: "Formal. With friends: scusa (SKOO-zah)." }],
  ["good morning", "buongiorno", "bwon-JOR-noh", "Greetings", "interjection", "Buongiorno, signora!", "Good morning, madam!"],
  ["good night", "buonanotte", "bwoh-nah-NOT-teh", "Greetings", "interjection", "Buonanotte, dormi bene!", "Good night, sleep well!"],
  ["how are you?", "come stai?", "KOH-meh STY", "Greetings", "expression", "Ciao Marco, come stai?", "Hi Marco, how are you?"],
  ["my name is…", "mi chiamo…", "mee KYAH-moh", "Greetings", "expression", "Mi chiamo Hana, e tu?", "My name is Hana, and you?"],

  ["one", "uno", "OO-noh", "Numbers", "adjective", "Solo uno, per favore.", "Just one, please."],
  ["two", "due", "DOO-eh", "Numbers", "adjective", "Due caffè, per favore.", "Two coffees, please."],
  ["three", "tre", "TREH (rolled r)", "Numbers", "adjective", "Sono le tre.", "It's three o'clock."],
  ["four", "quattro", "KWAHT-troh", "Numbers", "adjective", "Siamo in quattro.", "There are four of us."],
  ["five", "cinque", "CHEEN-kweh", "Numbers", "adjective", "Arrivo tra cinque minuti.", "I'll arrive in five minutes."],
  ["six", "sei", "SAY", "Numbers", "adjective", "Il negozio chiude alle sei.", "The shop closes at six."],
  ["seven", "sette", "SET-teh", "Numbers", "adjective", "La settimana ha sette giorni.", "The week has seven days."],
  ["eight", "otto", "OT-toh", "Numbers", "adjective", "Mi alzo alle otto.", "I get up at eight."],
  ["nine", "nove", "NOH-veh", "Numbers", "adjective", "Mio figlio ha nove anni.", "My son is nine years old."],
  ["ten", "dieci", "DYEH-chee", "Numbers", "adjective", "Costa dieci euro.", "It costs ten euros."],

  ["red", "rosso", "ROHS-soh", "Colors", "adjective", "Adoro quel vestito rosso.", "I love that red dress."],
  ["blue", "blu", "BLOO", "Colors", "adjective", "Il mare è blu.", "The sea is blue."],
  ["green", "verde", "VEHR-deh", "Colors", "adjective", "Vorrei un tè verde.", "I'd like a green tea."],
  ["yellow", "giallo", "JAHL-loh", "Colors", "adjective", "La banana è gialla.", "The banana is yellow."],
  ["black", "nero", "NEH-roh", "Colors", "adjective", "Ho un gatto nero.", "I have a black cat."],
  ["white", "bianco", "BYAHN-koh", "Colors", "adjective", "Preferisco il vino bianco.", "I prefer white wine."],

  ["mother", "la madre", "lah MAH-dreh", "Family", "noun", "Mia madre è insegnante.", "My mother is a teacher.", { gender: "feminine", note: "Everyday: la mamma." }],
  ["father", "il padre", "eel PAH-dreh", "Family", "noun", "Mio padre lavora a Roma.", "My father works in Rome.", { gender: "masculine", note: "Everyday: il papà." }],
  ["brother", "il fratello", "eel frah-TEL-loh", "Family", "noun", "Mio fratello si chiama Luca.", "My brother's name is Luca.", { gender: "masculine" }],
  ["sister", "la sorella", "lah soh-REL-lah", "Family", "noun", "Mia sorella vive a Milano.", "My sister lives in Milan.", { gender: "feminine" }],
  ["friend", "l'amico", "lah-MEE-koh", "Family", "noun", "Questo è il mio amico Karim.", "This is my friend Karim.", { gender: "masculine", note: "Female friend: l'amica." }],

  ["water", "l'acqua", "LAHK-kwah", "Food & Drink", "noun", "Una bottiglia d'acqua, per favore.", "A bottle of water, please.", { gender: "feminine" }],
  ["bread", "il pane", "eel PAH-neh", "Food & Drink", "noun", "Compro il pane ogni mattina.", "I buy bread every morning.", { gender: "masculine" }],
  ["coffee", "il caffè", "eel kahf-FEH", "Food & Drink", "noun", "Prendiamo un caffè?", "Shall we have a coffee?", { gender: "masculine", note: "Ordering 'un caffè' in Italy gets you an espresso." }],
  ["tea", "il tè", "eel TEH", "Food & Drink", "noun", "Vuoi un tè?", "Do you want a tea?", { gender: "masculine" }],
  ["delicious", "buonissimo", "bwoh-NEES-see-moh", "Food & Drink", "adjective", "Questa pizza è buonissima!", "This pizza is delicious!"],

  ["today", "oggi", "OD-jee", "Time", "adverb", "Oggi fa bel tempo.", "The weather is nice today."],
  ["tomorrow", "domani", "doh-MAH-nee", "Time", "adverb", "A domani!", "See you tomorrow!"],
  ["yesterday", "ieri", "YEH-ree", "Time", "adverb", "Ieri ho visto un film.", "Yesterday I watched a film."],

  ["to eat", "mangiare", "mahn-JAH-reh", "Verbs", "verb", "Mangiamo all'una.", "We eat at one."],
  ["to drink", "bere", "BEH-reh", "Verbs", "verb", "Bevo molta acqua.", "I drink a lot of water."],
  ["to go", "andare", "ahn-DAH-reh", "Verbs", "verb", "Vado al mercato.", "I'm going to the market."],
  ["to speak", "parlare", "par-LAH-reh", "Verbs", "verb", "Parli inglese?", "Do you speak English?"],
  ["to want", "volere", "voh-LEH-reh", "Verbs", "verb", "Voglio imparare l'italiano.", "I want to learn Italian."],

  ["I don't understand", "non capisco", "nohn kah-PEES-koh", "Survival", "expression", "Scusi, non capisco.", "Sorry, I don't understand."],
  ["where is…?", "dov'è…?", "doh-VEH", "Survival", "expression", "Dov'è la stazione?", "Where is the station?"],
  ["how much is it?", "quanto costa?", "KWAHN-toh KOS-tah", "Survival", "expression", "Quanto costa questa borsa?", "How much is this bag?"],
];

export const IT_BASICS_DECK = basicsDeck("it", "Your first 48 Italian words — greetings, numbers, colours, family, food and survival phrases. Start here!");
export const IT_BASICS = basicsCards("it", ROWS);
