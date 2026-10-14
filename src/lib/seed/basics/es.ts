import { BasicRow, basicsCards, basicsDeck } from "./builder";

const ROWS: BasicRow[] = [
  ["hello", "hola", "OH-lah (silent h)", "Greetings", "interjection", "Hola, ¿qué tal?", "Hi, how's it going?"],
  ["goodbye", "adiós", "ah-DYOHS", "Greetings", "interjection", "¡Adiós, hasta mañana!", "Goodbye, see you tomorrow!"],
  ["please", "por favor", "por fah-VOR", "Greetings", "expression", "Un café, por favor.", "A coffee, please."],
  ["thank you", "gracias", "GRAH-thee-ahs (Spain) / GRAH-see-ahs (Latin America)", "Greetings", "interjection", "Muchas gracias por todo.", "Thank you so much for everything."],
  ["yes", "sí", "SEE", "Greetings", "interjection", "Sí, claro.", "Yes, of course."],
  ["no", "no", "NOH", "Greetings", "interjection", "No, gracias.", "No, thank you."],
  ["excuse me / sorry", "perdón", "pehr-DOHN", "Greetings", "interjection", "Perdón, ¿dónde está el baño?", "Excuse me, where is the bathroom?"],
  ["good morning", "buenos días", "BWEH-nohs DEE-ahs", "Greetings", "expression", "Buenos días, señora.", "Good morning, madam."],
  ["good night", "buenas noches", "BWEH-nahs NOH-chehs", "Greetings", "expression", "Buenas noches, ¡que descanses!", "Good night, sleep well!"],
  ["how are you?", "¿cómo estás?", "KOH-moh ehs-TAHS", "Greetings", "expression", "Hola, Ana, ¿cómo estás?", "Hi Ana, how are you?"],
  ["my name is…", "me llamo…", "meh YAH-moh", "Greetings", "expression", "Me llamo Hana, ¿y tú?", "My name is Hana, and you?"],

  ["one", "uno", "OO-noh", "Numbers", "adjective", "Solo uno, por favor.", "Just one, please."],
  ["two", "dos", "DOHS", "Numbers", "adjective", "Dos cafés, por favor.", "Two coffees, please."],
  ["three", "tres", "TREHS (rolled r)", "Numbers", "adjective", "Son las tres.", "It's three o'clock."],
  ["four", "cuatro", "KWAH-troh", "Numbers", "adjective", "Somos cuatro.", "There are four of us."],
  ["five", "cinco", "THEEN-koh (Spain) / SEEN-koh", "Numbers", "adjective", "Llego en cinco minutos.", "I'll arrive in five minutes."],
  ["six", "seis", "SAYS", "Numbers", "adjective", "La tienda cierra a las seis.", "The shop closes at six."],
  ["seven", "siete", "SYEH-teh", "Numbers", "adjective", "La semana tiene siete días.", "The week has seven days."],
  ["eight", "ocho", "OH-choh", "Numbers", "adjective", "Me levanto a las ocho.", "I get up at eight."],
  ["nine", "nueve", "NWEH-beh", "Numbers", "adjective", "Mi hijo tiene nueve años.", "My son is nine years old."],
  ["ten", "diez", "DYETH (Spain) / DYES", "Numbers", "adjective", "Cuesta diez euros.", "It costs ten euros."],

  ["red", "rojo", "ROH-hoh", "Colors", "adjective", "Me encanta ese vestido rojo.", "I love that red dress."],
  ["blue", "azul", "ah-THOOL (Spain) / ah-SOOL", "Colors", "adjective", "El cielo está azul.", "The sky is blue."],
  ["green", "verde", "BEHR-deh", "Colors", "adjective", "Quiero un té verde.", "I'd like a green tea."],
  ["yellow", "amarillo", "ah-mah-REE-yoh", "Colors", "adjective", "El plátano es amarillo.", "The banana is yellow."],
  ["black", "negro", "NEH-groh", "Colors", "adjective", "Tengo un gato negro.", "I have a black cat."],
  ["white", "blanco", "BLAHN-koh", "Colors", "adjective", "Prefiero el vino blanco.", "I prefer white wine."],

  ["mother", "la madre", "lah MAH-dreh", "Family", "noun", "Mi madre es profesora.", "My mother is a teacher.", { gender: "feminine" }],
  ["father", "el padre", "el PAH-dreh", "Family", "noun", "Mi padre trabaja en Madrid.", "My father works in Madrid.", { gender: "masculine" }],
  ["brother", "el hermano", "el ehr-MAH-noh", "Family", "noun", "Mi hermano se llama Pablo.", "My brother's name is Pablo.", { gender: "masculine" }],
  ["sister", "la hermana", "lah ehr-MAH-nah", "Family", "noun", "Mi hermana vive en Sevilla.", "My sister lives in Seville.", { gender: "feminine" }],
  ["friend", "el amigo", "el ah-MEE-goh", "Family", "noun", "Este es mi amigo Carlos.", "This is my friend Carlos.", { gender: "masculine", note: "Female friend: la amiga." }],

  ["water", "el agua", "el AH-gwah", "Food & Drink", "noun", "Una botella de agua, por favor.", "A bottle of water, please.", { gender: "feminine", note: "Feminine, but takes 'el' because it starts with a stressed a-." }],
  ["bread", "el pan", "el PAHN", "Food & Drink", "noun", "Compro pan todas las mañanas.", "I buy bread every morning.", { gender: "masculine" }],
  ["coffee", "el café", "el kah-FEH", "Food & Drink", "noun", "¿Tomamos un café?", "Shall we have a coffee?", { gender: "masculine" }],
  ["tea", "el té", "el TEH", "Food & Drink", "noun", "¿Quieres un té?", "Do you want a tea?", { gender: "masculine" }],
  ["delicious", "delicioso", "deh-lee-THYOH-soh", "Food & Drink", "adjective", "¡Esta paella está deliciosa!", "This paella is delicious!"],

  ["today", "hoy", "OY", "Time", "adverb", "Hoy hace sol.", "It's sunny today."],
  ["tomorrow", "mañana", "mah-NYAH-nah", "Time", "adverb", "¡Hasta mañana!", "See you tomorrow!"],
  ["yesterday", "ayer", "ah-YEHR", "Time", "adverb", "Ayer vi una película.", "Yesterday I watched a film."],

  ["to eat", "comer", "koh-MEHR", "Verbs", "verb", "Comemos a las dos.", "We eat at two."],
  ["to drink", "beber", "beh-BEHR", "Verbs", "verb", "Bebo mucha agua.", "I drink a lot of water."],
  ["to go", "ir", "EER", "Verbs", "verb", "Voy al mercado.", "I'm going to the market."],
  ["to speak", "hablar", "ah-BLAR", "Verbs", "verb", "¿Hablas inglés?", "Do you speak English?"],
  ["to want", "querer", "keh-REHR", "Verbs", "verb", "Quiero aprender español.", "I want to learn Spanish."],

  ["I don't understand", "no entiendo", "noh en-TYEN-doh", "Survival", "expression", "Perdón, no entiendo.", "Sorry, I don't understand."],
  ["where is…?", "¿dónde está…?", "DOHN-deh ehs-TAH", "Survival", "expression", "¿Dónde está la estación?", "Where is the station?"],
  ["how much is it?", "¿cuánto cuesta?", "KWAHN-toh KWEHS-tah", "Survival", "expression", "¿Cuánto cuesta este bolso?", "How much is this bag?"],
];

export const ES_BASICS_DECK = basicsDeck("es", "Your first 48 Spanish words — greetings, numbers, colours, family, food and survival phrases. Start here!");
export const ES_BASICS = basicsCards("es", ROWS);
