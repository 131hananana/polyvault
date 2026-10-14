import { BasicRow, basicsCards, basicsDeck } from "./builder";

const ROWS: BasicRow[] = [
  ["hello", "hallo", "HAH-loh", "Greetings", "interjection", "Hallo, wie geht's?", "Hi, how's it going?"],
  ["bye", "tschüss", "CHUESS (ü = 'ee' with rounded lips)", "Greetings", "interjection", "Tschüss, bis morgen!", "Bye, see you tomorrow!", { note: "Casual. Formal goodbye: auf Wiedersehen (owf VEE-der-zay-en)." }],
  ["please", "bitte", "BIT-tuh", "Greetings", "expression", "Einen Kaffee, bitte.", "A coffee, please.", { note: "Also means 'you're welcome' and 'pardon?'." }],
  ["thank you", "danke", "DAHN-kuh", "Greetings", "interjection", "Danke schön für deine Hilfe.", "Thank you very much for your help."],
  ["yes", "ja", "YAH", "Greetings", "interjection", "Ja, natürlich!", "Yes, of course!"],
  ["no", "nein", "NINE", "Greetings", "interjection", "Nein, danke.", "No, thank you."],
  ["excuse me / sorry", "Entschuldigung", "ent-SHOOL-dee-goong", "Greetings", "interjection", "Entschuldigung, wo ist der Bahnhof?", "Excuse me, where is the station?"],
  ["good morning", "guten Morgen", "GOO-ten MOR-gen", "Greetings", "expression", "Guten Morgen, Frau Müller!", "Good morning, Mrs Müller!"],
  ["good night", "gute Nacht", "GOO-tuh NAHKHT (kh = throaty h)", "Greetings", "expression", "Gute Nacht, schlaf gut!", "Good night, sleep well!"],
  ["how are you?", "wie geht's?", "vee GAYTS", "Greetings", "expression", "Hallo Anna, wie geht's?", "Hi Anna, how are you?"],
  ["my name is…", "ich heiße…", "ikh HIGH-suh", "Greetings", "expression", "Ich heiße Hana. Und du?", "My name is Hana. And you?"],

  ["one", "eins", "EYNS", "Numbers", "adjective", "Nur eins, bitte.", "Just one, please."],
  ["two", "zwei", "TSVY", "Numbers", "adjective", "Zwei Kaffee, bitte.", "Two coffees, please."],
  ["three", "drei", "DRY", "Numbers", "adjective", "Es ist drei Uhr.", "It's three o'clock."],
  ["four", "vier", "FEER", "Numbers", "adjective", "Wir sind vier Personen.", "There are four of us."],
  ["five", "fünf", "FUENF (rounded 'ee')", "Numbers", "adjective", "Ich komme in fünf Minuten.", "I'll be there in five minutes."],
  ["six", "sechs", "ZEKS", "Numbers", "adjective", "Der Laden schließt um sechs.", "The shop closes at six."],
  ["seven", "sieben", "ZEE-ben", "Numbers", "adjective", "Die Woche hat sieben Tage.", "The week has seven days."],
  ["eight", "acht", "AHKHT", "Numbers", "adjective", "Ich stehe um acht Uhr auf.", "I get up at eight."],
  ["nine", "neun", "NOYN", "Numbers", "adjective", "Mein Sohn ist neun Jahre alt.", "My son is nine years old."],
  ["ten", "zehn", "TSAYN", "Numbers", "adjective", "Das kostet zehn Euro.", "That costs ten euros."],

  ["red", "rot", "ROHT", "Colors", "adjective", "Das Auto ist rot.", "The car is red."],
  ["blue", "blau", "BLOW (rhymes with 'how')", "Colors", "adjective", "Der Himmel ist heute blau.", "The sky is blue today."],
  ["green", "grün", "GRUEN", "Colors", "adjective", "Die Tür ist grün.", "The door is green."],
  ["yellow", "gelb", "GELP", "Colors", "adjective", "Die Banane ist gelb.", "The banana is yellow."],
  ["black", "schwarz", "SHVARTS", "Colors", "adjective", "Meine Katze ist schwarz.", "My cat is black."],
  ["white", "weiß", "VICE", "Colors", "adjective", "Der Schnee ist weiß.", "The snow is white."],

  ["mother", "die Mutter", "dee MOOT-ter", "Family", "noun", "Meine Mutter ist Lehrerin.", "My mother is a teacher.", { gender: "feminine" }],
  ["father", "der Vater", "dair FAH-ter", "Family", "noun", "Mein Vater arbeitet in Berlin.", "My father works in Berlin.", { gender: "masculine" }],
  ["brother", "der Bruder", "dair BROO-der", "Family", "noun", "Mein Bruder heißt Paul.", "My brother's name is Paul.", { gender: "masculine" }],
  ["sister", "die Schwester", "dee SHVES-ter", "Family", "noun", "Meine Schwester wohnt in München.", "My sister lives in Munich.", { gender: "feminine" }],
  ["friend", "der Freund", "dair FROYNT", "Family", "noun", "Das ist mein Freund Karim.", "This is my friend Karim.", { gender: "masculine", note: "Can also mean 'boyfriend'. Female friend: die Freundin." }],

  ["water", "das Wasser", "dahs VAHS-ser", "Food & Drink", "noun", "Eine Flasche Wasser, bitte.", "A bottle of water, please.", { gender: "neuter" }],
  ["bread", "das Brot", "dahs BROHT", "Food & Drink", "noun", "Ich kaufe jeden Morgen Brot.", "I buy bread every morning.", { gender: "neuter" }],
  ["coffee", "der Kaffee", "dair KAH-fay", "Food & Drink", "noun", "Trinken wir einen Kaffee?", "Shall we have a coffee?", { gender: "masculine" }],
  ["tea", "der Tee", "dair TAY", "Food & Drink", "noun", "Möchtest du Tee?", "Would you like some tea?", { gender: "masculine" }],
  ["delicious / tasty", "lecker", "LEK-er", "Food & Drink", "adjective", "Der Kuchen ist sehr lecker!", "The cake is really tasty!"],

  ["today", "heute", "HOY-tuh", "Time", "adverb", "Heute ist das Wetter schön.", "The weather is nice today."],
  ["tomorrow", "morgen", "MOR-gen", "Time", "adverb", "Bis morgen!", "See you tomorrow!"],
  ["yesterday", "gestern", "GES-tern", "Time", "adverb", "Gestern habe ich einen Film gesehen.", "Yesterday I watched a film."],

  ["to eat", "essen", "ES-sen", "Verbs", "verb", "Wir essen um zwölf Uhr.", "We eat at twelve."],
  ["to drink", "trinken", "TRING-ken", "Verbs", "verb", "Ich trinke viel Wasser.", "I drink a lot of water."],
  ["to go", "gehen", "GAY-en", "Verbs", "verb", "Ich gehe zum Markt.", "I'm going to the market."],
  ["to speak", "sprechen", "SHPREKH-en", "Verbs", "verb", "Sprechen Sie Englisch?", "Do you speak English?"],
  ["to want", "wollen", "VOL-len", "Verbs", "verb", "Ich will Deutsch lernen.", "I want to learn German."],

  ["I don't understand", "ich verstehe nicht", "ikh fair-SHTAY-uh nikht", "Survival", "expression", "Entschuldigung, ich verstehe nicht.", "Sorry, I don't understand."],
  ["where is…?", "wo ist…?", "voh IST", "Survival", "expression", "Wo ist der Bahnhof?", "Where is the station?"],
  ["how much is it?", "wie viel kostet das?", "vee FEEL KOS-tet dahs", "Survival", "expression", "Wie viel kostet die Tasche?", "How much is the bag?"],
];

export const DE_BASICS_DECK = basicsDeck("de", "Your first 48 German words — greetings, numbers, colours, family, food and survival phrases. Start here!");
export const DE_BASICS = basicsCards("de", ROWS);
