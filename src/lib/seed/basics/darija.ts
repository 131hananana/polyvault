import { BasicRow, basicsCards, basicsDeck } from "./builder";

/* Moroccan Darija. `word` = chat-style romanization (3 = ع, 7 = ح, 9 = ق), `script` = Arabic. */
const ROWS: BasicRow[] = [
  ["hello", "salam", "sa-LAAM", "Greetings", "interjection", "سلام، لاباس عليك؟", "Hi, how are you?", { script: "سلام", reading: "salam, labas 3lik?" }],
  ["goodbye", "bslama", "b-sla-MA", "Greetings", "interjection", "بسلامة، نتلاقاو غدا.", "Bye, see you tomorrow.", { script: "بسلامة", reading: "bslama, ntlaqaw ghedda." }],
  ["please", "3afak", "AA-fak (3 = deep throaty 'a')", "Greetings", "expression", "عطيني الما عافاك.", "Give me some water, please.", { script: "عافاك", reading: "3tini lma 3afak." }],
  ["thank you", "chokran", "SHOOK-ran", "Greetings", "interjection", "شكرا بزاف على المساعدة.", "Thanks a lot for the help.", { script: "شكرا", reading: "chokran bzzaf 3la lmosa3ada." }],
  ["yes", "iyeh", "EE-yeh", "Greetings", "interjection", "إيه، مزيان.", "Yes, good.", { script: "إيه", reading: "iyeh, mzyan.", note: "Also very common: ah." }],
  ["no", "la", "LAA", "Greetings", "interjection", "لا، شكرا.", "No, thanks.", { script: "لا", reading: "la, chokran." }],
  ["excuse me / sorry", "smeh liya", "SMEH lee-ya", "Greetings", "expression", "سمح ليا، فين كاينة المحطة؟", "Excuse me, where is the station?", { script: "سمح ليا", reading: "smeh liya, fin kayna lmo7atta?" }],
  ["good morning", "sbah lkhir", "sbah l-KHEER", "Greetings", "expression", "صباح الخير آ ماما.", "Good morning, Mom.", { script: "صباح الخير", reading: "sbah lkhir a mama." }],
  ["good night", "tsbe7 3la khir", "TSBAH a-la KHEER", "Greetings", "expression", "تصبح على خير آ صاحبي.", "Good night, my friend.", { script: "تصبح على خير", reading: "tsbe7 3la khir a sa7bi." }],
  ["how are you?", "labas?", "la-BAAS", "Greetings", "expression", "سلام آ سارة، لاباس؟", "Hi Sara, how are you?", { script: "لاباس؟", reading: "salam a Sara, labas?", note: "Reply: labas, l7amdoulillah (fine, thank God)." }],
  ["my name is…", "smiyti…", "smee-TEE", "Greetings", "expression", "سميتي هناء، ونتا شنو سميتك؟", "My name is Hana, and what's your name?", { script: "سميتي", reading: "smiyti Hana, w nta chno smiytek?" }],

  ["one", "wa7ed", "WAA-hed (7 = breathy h)", "Numbers", "adjective", "واحد، جوج، تلاتة", "One, two, three", { script: "واحد", reading: "wa7ed, jouj, tlata" }],
  ["two", "jouj", "JOOJ", "Numbers", "adjective", "واحد، جوج، تلاتة", "One, two, three", { script: "جوج", reading: "wa7ed, jouj, tlata" }],
  ["three", "tlata", "TLAA-ta", "Numbers", "adjective", "جوج، تلاتة، ربعة", "Two, three, four", { script: "تلاتة", reading: "jouj, tlata, rb3a" }],
  ["four", "rb3a", "RUB-a", "Numbers", "adjective", "تلاتة، ربعة، خمسة", "Three, four, five", { script: "ربعة", reading: "tlata, rb3a, khamsa" }],
  ["five", "khamsa", "KHAM-sa", "Numbers", "adjective", "ربعة، خمسة، ستة", "Four, five, six", { script: "خمسة", reading: "rb3a, khamsa, stta" }],
  ["six", "stta", "SET-ta", "Numbers", "adjective", "خمسة، ستة، سبعة", "Five, six, seven", { script: "ستة", reading: "khamsa, stta, sb3a" }],
  ["seven", "sb3a", "SEB-a", "Numbers", "adjective", "ستة، سبعة، تمنية", "Six, seven, eight", { script: "سبعة", reading: "stta, sb3a, tmanya" }],
  ["eight", "tmanya", "TMEN-ya", "Numbers", "adjective", "سبعة، تمنية، تسعود", "Seven, eight, nine", { script: "تمنية", reading: "sb3a, tmanya, ts3ud" }],
  ["nine", "ts3ud", "ts-AOOD", "Numbers", "adjective", "تمنية، تسعود، عشرة", "Eight, nine, ten", { script: "تسعود", reading: "tmanya, ts3ud, 3chra" }],
  ["ten", "3chra", "ASH-ra", "Numbers", "adjective", "تمنية، تسعود، عشرة", "Eight, nine, ten", { script: "عشرة", reading: "tmanya, ts3ud, 3chra" }],

  ["red", "7mer", "HMAR", "Colors", "adjective", "هاد الكاس حمر.", "This glass is red.", { script: "حمر", reading: "had lkas 7mer." }],
  ["blue", "zre9", "ZRAQ", "Colors", "adjective", "البحر زرق.", "The sea is blue.", { script: "زرق", reading: "lb7er zre9." }],
  ["green", "khder", "KHDAR", "Colors", "adjective", "الباب خضر.", "The door is green.", { script: "خضر", reading: "lbab khder." }],
  ["yellow", "sfer", "SFAR", "Colors", "adjective", "البنان صفر.", "Bananas are yellow.", { script: "صفر", reading: "lbanan sfer." }],
  ["black", "k7el", "K-HAL", "Colors", "adjective", "عندي مش كحل.", "I have a black cat.", { script: "كحل", reading: "3ndi mech k7el." }],
  ["white", "byed", "BYAD", "Colors", "adjective", "الحليب بيض.", "Milk is white.", { script: "بيض", reading: "l7lib byed." }],

  ["mother", "lwalida", "l-wa-LEE-da", "Family", "noun", "الوالدة كتخدم أستاذة.", "My mother works as a teacher.", { script: "الوالدة", reading: "lwalida katkhdem ostada.", gender: "feminine", note: "Everyday: mama." }],
  ["father", "lwalid", "l-WAA-lid", "Family", "noun", "الوالد خدام فكازا.", "My father works in Casablanca.", { script: "الوالد", reading: "lwalid khddam f Casa.", gender: "masculine", note: "Everyday: baba." }],
  ["my brother", "khouya", "KHOO-ya", "Family", "noun", "خويا سميتو علي.", "My brother's name is Ali.", { script: "خويا", reading: "khouya smito 3li.", gender: "masculine" }],
  ["my sister", "khti", "KHTEE", "Family", "noun", "ختي ساكنة فالرباط.", "My sister lives in Rabat.", { script: "ختي", reading: "khti sakna f rbat.", gender: "feminine" }],
  ["my friend", "sa7bi", "SAH-bee", "Family", "noun", "هادا صاحبي كريم.", "This is my friend Karim.", { script: "صاحبي", reading: "hada sa7bi Karim.", gender: "masculine", note: "Female friend: sa7bti." }],

  ["water", "lma", "l-MA", "Food & Drink", "noun", "عطيني قرعة ديال الما عافاك.", "Give me a bottle of water, please.", { script: "الما", reading: "3tini 9er3a dyal lma 3afak.", gender: "masculine" }],
  ["bread", "lkhobz", "l-KHOBZ", "Food & Drink", "noun", "كنشري الخبز كل صباح.", "I buy bread every morning.", { script: "الخبز", reading: "kanchri lkhobz kol sba7.", gender: "masculine" }],
  ["coffee", "qahwa", "QAH-wa", "Food & Drink", "noun", "نشربو شي قهوة؟", "Shall we have a coffee?", { script: "قهوة", reading: "nchrbo chi qahwa?", gender: "feminine" }],
  ["mint tea", "atay", "a-TAY", "Food & Drink", "noun", "أتاي بالنعناع ديما.", "Mint tea, always.", { script: "أتاي", reading: "atay b n3na3 dima.", gender: "masculine" }],
  ["delicious", "bnin", "b-NEEN", "Food & Drink", "adjective", "هاد الطاجين بنين!", "This tagine is delicious!", { script: "بنين", reading: "had tajine bnin!" }],

  ["today", "lyoum", "l-YOOM", "Time", "adverb", "الجو زوين اليوم.", "The weather is nice today.", { script: "اليوم", reading: "ljaw zwin lyoum." }],
  ["tomorrow", "ghedda", "GHED-da (gh = gargled r)", "Time", "adverb", "نتلاقاو غدا إن شاء الله.", "See you tomorrow, God willing.", { script: "غدا", reading: "ntlaqaw ghedda inchallah." }],
  ["yesterday", "lbare7", "l-BAA-reh", "Time", "adverb", "البارح شفت فيلم.", "Yesterday I watched a film.", { script: "البارح", reading: "lbare7 chft film." }],

  ["to eat", "kla", "KLA", "Verbs", "verb", "كناكلو الغدا مع الوحدة.", "We eat lunch at one.", { script: "كلا", reading: "kanaklo lghda m3a lwe7da.", note: "Dictionary form = 'he ate'. I eat: kanakol." }],
  ["to drink", "chrob", "SHROB", "Verbs", "verb", "كنشرب الما بزاف.", "I drink a lot of water.", { script: "شرب", reading: "kanchreb lma bzzaf." }],
  ["to go", "mcha", "MSHA", "Verbs", "verb", "غادي نمشي للسوق.", "I'm going to the market.", { script: "مشى", reading: "ghadi nmchi l souq." }],
  ["to speak", "hder", "HDER", "Verbs", "verb", "واش كتهضر النكليزية؟", "Do you speak English?", { script: "هضر", reading: "wach kathder ngliziya?" }],
  ["to know", "3ref", "AREF", "Verbs", "verb", "ما عرفتش.", "I don't know.", { script: "عرف", reading: "ma 3reftch." }],

  ["I didn't understand", "ma fhemtch", "ma FHEMTSH", "Survival", "expression", "سمح ليا، ما فهمتش.", "Sorry, I didn't understand.", { script: "ما فهمتش", reading: "smeh liya, ma fhemtch." }],
  ["where is…?", "fin…?", "FEEN", "Survival", "expression", "فين كاينة المحطة؟", "Where is the station?", { script: "فين", reading: "fin kayna lmo7atta?" }],
];

export const DARIJA_BASICS_DECK = basicsDeck("darija", "Your first Darija words in Arabic script with Latin readings (the digits 3, 7 and 9 stand for Arabic sounds English doesn't have) — greetings, numbers, colours, family, food and survival phrases.");
export const DARIJA_BASICS = basicsCards("darija", ROWS);
