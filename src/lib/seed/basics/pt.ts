import { BasicRow, basicsCards, basicsDeck } from "./builder";

const ROWS: BasicRow[] = [
  ["hello", "oi", "OY", "Greetings", "interjection", "Oi! Prazer em te conhecer.", "Hi! Nice to meet you.", { note: "The everyday Brazilian hello. Olá is a bit more formal." }],
  ["goodbye", "tchau", "CHOW", "Greetings", "interjection", "Tchau, a gente se vê amanhã!", "Bye, see you tomorrow!"],
  ["please", "por favor", "poor fah-VOR", "Greetings", "expression", "Um café, por favor.", "A coffee, please."],
  ["thank you", "obrigado", "oh-bree-GAH-doo", "Greetings", "interjection", "Muito obrigado pela ajuda.", "Thank you so much for the help.", { note: "Men say obrigado, women say obrigada." }],
  ["yes", "sim", "SEENG (nasal)", "Greetings", "interjection", "Sim, claro, pode entrar.", "Yes, of course, come in."],
  ["no", "não", "NOWNG (nasal)", "Greetings", "interjection", "Não, obrigado, estou bem.", "No, thank you, I'm fine."],
  ["excuse me / sorry", "desculpa", "dehs-KOOL-pah", "Greetings", "interjection", "Desculpa, onde fica o banheiro?", "Excuse me, where is the bathroom?", { note: "To get past someone or get attention, com licença is also used." }],
  ["good morning", "bom dia", "bohng JEE-ah", "Greetings", "expression", "Bom dia, dona Maria!", "Good morning, Mrs Maria!"],
  ["good night", "boa noite", "BOH-ah NOY-chee", "Greetings", "expression", "Boa noite, durma bem!", "Good night, sleep well!", { note: "Also used as 'good evening' when arriving." }],
  ["how are you?", "tudo bem?", "TOO-doo BAYNG", "Greetings", "expression", "Oi, Ana, tudo bem?", "Hi Ana, how are you?", { note: "Literally 'all good?'. The usual reply is tudo bem / tudo ótimo." }],
  ["my name is…", "meu nome é…", "MEH-oo NOH-mee EH", "Greetings", "expression", "Meu nome é Hana, e o seu?", "My name is Hana, and yours?"],

  ["one", "um", "OONG (nasal)", "Numbers", "adjective", "Só um, por favor.", "Just one, please.", { note: "Feminine: uma." }],
  ["two", "dois", "DOYS", "Numbers", "adjective", "Dois cafés, por favor.", "Two coffees, please.", { note: "Feminine: duas." }],
  ["three", "três", "TREHS", "Numbers", "adjective", "São três horas da tarde.", "It's three in the afternoon."],
  ["four", "quatro", "KWAH-troo", "Numbers", "adjective", "Somos quatro na mesa.", "There are four of us at the table."],
  ["five", "cinco", "SEEN-koo", "Numbers", "adjective", "Chego em cinco minutos.", "I'll arrive in five minutes."],
  ["six", "seis", "SAYS", "Numbers", "adjective", "A loja fecha às seis.", "The shop closes at six.", { note: "When reading phone numbers, Brazilians often say meia (half a dozen) instead of seis." }],
  ["seven", "sete", "SEH-chee", "Numbers", "adjective", "A semana tem sete dias.", "The week has seven days."],
  ["eight", "oito", "OY-too", "Numbers", "adjective", "Eu acordo às oito.", "I wake up at eight."],
  ["nine", "nove", "NOH-vee", "Numbers", "adjective", "Meu filho tem nove anos.", "My son is nine years old."],
  ["ten", "dez", "DEHS", "Numbers", "adjective", "Isso custa dez reais.", "This costs ten reais."],

  ["red", "vermelho", "vehr-MEH-lyoo", "Colors", "adjective", "Adoro esse vestido vermelho.", "I love that red dress."],
  ["blue", "azul", "ah-ZOOW", "Colors", "adjective", "O céu está azul hoje.", "The sky is blue today."],
  ["green", "verde", "VEHR-jee", "Colors", "adjective", "Quero um chá verde.", "I'd like a green tea."],
  ["yellow", "amarelo", "ah-mah-REH-loo", "Colors", "adjective", "O ônibus escolar é amarelo.", "The school bus is yellow."],
  ["black", "preto", "PREH-too", "Colors", "adjective", "Eu tenho um gato preto.", "I have a black cat."],
  ["white", "branco", "BRAHN-koo", "Colors", "adjective", "Prefiro vinho branco, por favor.", "I prefer white wine, please."],

  ["mother", "a mãe", "ah MYNG (nasal)", "Family", "noun", "A mãe da Júlia é professora.", "Júlia's mother is a teacher.", { gender: "feminine" }],
  ["father", "o pai", "oo PIE", "Family", "noun", "O pai do Pedro trabalha em São Paulo.", "Pedro's father works in São Paulo.", { gender: "masculine" }],
  ["brother", "o irmão", "oo eer-MOWNG", "Family", "noun", "O irmão da Ana se chama Paulo.", "Ana's brother is called Paulo.", { gender: "masculine" }],
  ["sister", "a irmã", "ah eer-MAHNG", "Family", "noun", "A irmã do Lucas mora no Rio.", "Lucas's sister lives in Rio.", { gender: "feminine" }],
  ["friend", "o amigo", "oo ah-MEE-goo", "Family", "noun", "O amigo da Carla é muito legal.", "Carla's friend is really nice.", { gender: "masculine", note: "Female friend: a amiga." }],

  ["water", "a água", "ah AH-gwah", "Food & Drink", "noun", "A água está bem gelada.", "The water is nice and cold.", { gender: "feminine" }],
  ["bread", "o pão", "oo POWNG (nasal)", "Food & Drink", "noun", "O pão de queijo está quentinho.", "The cheese bread is nice and warm.", { gender: "masculine" }],
  ["coffee", "o café", "oo kah-FEH", "Food & Drink", "noun", "O café aqui é muito bom.", "The coffee here is very good.", { gender: "masculine" }],
  ["tea", "o chá", "oo SHAH", "Food & Drink", "noun", "O chá de hortelã está pronto.", "The mint tea is ready.", { gender: "masculine" }],
  ["delicious", "delicioso", "deh-lee-see-OH-zoo", "Food & Drink", "adjective", "O bolo da vovó é delicioso!", "Grandma's cake is delicious!", { note: "Feminine: deliciosa." }],

  ["today", "hoje", "OH-zhee", "Time", "adverb", "Hoje está fazendo sol.", "It's sunny today."],
  ["tomorrow", "amanhã", "ah-mah-NYAHNG", "Time", "adverb", "Até amanhã, a gente se fala!", "See you tomorrow, we'll talk!"],
  ["yesterday", "ontem", "OHN-tayng", "Time", "adverb", "Ontem eu vi um filme.", "Yesterday I watched a film."],

  ["to eat", "comer", "koh-MEHR", "Verbs", "verb", "Vamos comer às duas horas?", "Shall we eat at two o'clock?"],
  ["to drink", "beber", "beh-BEHR", "Verbs", "verb", "Preciso beber mais água.", "I need to drink more water.", { note: "For drinks like coffee or juice, Brazilians often say tomar." }],
  ["to go", "ir", "EER", "Verbs", "verb", "Eu quero ir à praia.", "I want to go to the beach."],
  ["to speak", "falar", "fah-LAR", "Verbs", "verb", "Você sabe falar inglês?", "Can you speak English?"],
  ["to want", "querer", "keh-REHR", "Verbs", "verb", "Você vai querer sobremesa?", "Will you want dessert?"],

  ["I don't understand", "não entendo", "nowng ehn-TEHN-doo", "Survival", "expression", "Desculpa, não entendo português.", "Sorry, I don't understand Portuguese.", { note: "Não entendi (I didn't get that) is also very common." }],
  ["where is…?", "onde fica…?", "OHN-jee FEE-kah", "Survival", "expression", "Onde fica a estação de metrô?", "Where is the metro station?", { note: "Onde está…? also works, especially for things that move." }],
  ["how much is it?", "quanto custa?", "KWAHN-too KOOS-tah", "Survival", "expression", "Quanto custa essa bolsa?", "How much is this bag?"],
];

export const PT_BASICS_DECK = basicsDeck("pt", "Your first 48 Brazilian Portuguese words — greetings, numbers, colours, family, food and survival phrases. Start here!");
export const PT_BASICS = basicsCards("pt", ROWS);
