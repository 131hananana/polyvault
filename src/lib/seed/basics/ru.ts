import { BasicRow, basicsCards, basicsDeck } from "./builder";

/* Russian. `word` = Latin transliteration, `script` = Cyrillic. */
const ROWS: BasicRow[] = [
  ["hello", "zdravstvuyte", "ZDRAST-vooy-tye", "Greetings", "interjection", "Анна Петровна, здравствуйте!", "Hello, Anna Petrovna!", { script: "здравствуйте", reading: "Anna Petrovna, zdravstvuyte!", note: "Formal/polite — the first в is silent. With friends and family: привет (privet)." }],
  ["goodbye", "do svidaniya", "da svee-DA-nya", "Greetings", "interjection", "Спасибо, до свидания!", "Thank you, goodbye!", { script: "до свидания", reading: "Spasibo, do svidaniya!", note: "Neutral/polite. With friends: пока (paka)." }],
  ["please", "pozhaluysta", "pa-ZHA-loos-ta", "Greetings", "expression", "Мне чай, пожалуйста.", "Tea for me, please.", { script: "пожалуйста", reading: "Mne chay, pozhaluysta.", note: "Also means 'you're welcome' and 'here you go'. The й is barely heard." }],
  ["thank you", "spasibo", "spa-SEE-ba", "Greetings", "interjection", "Большое спасибо за помощь.", "Thank you very much for the help.", { script: "спасибо", reading: "Bolshoe spasibo za pomoshch." }],
  ["yes", "da", "DA", "Greetings", "interjection", "Думаю, что да.", "I think so (yes).", { script: "да", reading: "Dumayu, chto da." }],
  ["no", "net", "NYET", "Greetings", "interjection", "Спасибо, но нет.", "Thanks, but no.", { script: "нет", reading: "Spasibo, no net.", note: "Also means 'there isn't': здесь нет воды = there's no water here." }],
  ["excuse me / sorry", "izvinite", "eez-vee-NEE-tye", "Greetings", "expression", "Ой, извините, я не знал.", "Oh, sorry, I didn't know.", { script: "извините", reading: "Oy, izvinite, ya ne znal.", note: "Polite/plural form. To a friend: извини (izvini). A woman says я не знала." }],
  ["good evening", "dobryy vecher", "DOB-ry VYE-cheer", "Greetings", "expression", "Всем добрый вечер!", "Good evening, everyone!", { script: "добрый вечер", reading: "Vsem dobryy vecher!", note: "Also добрый день (good afternoon) and доброе утро (good morning)." }],
  ["good night", "spokoynoy nochi", "spa-KOY-nay NO-chee", "Greetings", "expression", "Дети, спокойной ночи!", "Good night, kids!", { script: "спокойной ночи", reading: "Deti, spokoynoy nochi!" }],
  ["how are you?", "kak dela?", "KAK dee-LA", "Greetings", "expression", "Привет, как дела?", "Hi, how are you?", { script: "как дела?", reading: "Privet, kak dela?", note: "Informal. Politely: как у вас дела? Typical reply: нормально (fine)." }],
  ["my name is…", "menya zovut…", "mee-NYA za-VOOT", "Greetings", "expression", "Привет, меня зовут Хана.", "Hi, my name is Hana.", { script: "меня зовут", reading: "Privet, menya zovut Khana.", note: "Literally 'they call me'. Ask: как тебя зовут? (informal) / как вас зовут? (polite)" }],

  ["one", "odin", "a-DEEN", "Numbers", "adjective", "один, два, три", "One, two, three", { script: "один", reading: "odin, dva, tri", note: "Changes with gender: одна (feminine), одно (neuter)." }],
  ["two", "dva", "DVA", "Numbers", "adjective", "один, два, три", "One, two, three", { script: "два", reading: "odin, dva, tri", note: "With feminine nouns: две." }],
  ["three", "tri", "TREE", "Numbers", "adjective", "два, три, четыре", "Two, three, four", { script: "три", reading: "dva, tri, chetyre" }],
  ["four", "chetyre", "chee-TY-rye", "Numbers", "adjective", "три, четыре, пять", "Three, four, five", { script: "четыре", reading: "tri, chetyre, pyat" }],
  ["five", "pyat", "PYAT", "Numbers", "adjective", "четыре, пять, шесть", "Four, five, six", { script: "пять", reading: "chetyre, pyat, shest" }],
  ["six", "shest", "SHEST", "Numbers", "adjective", "пять, шесть, семь", "Five, six, seven", { script: "шесть", reading: "pyat, shest, sem" }],
  ["seven", "sem", "SYEM", "Numbers", "adjective", "шесть, семь, восемь", "Six, seven, eight", { script: "семь", reading: "shest, sem, vosem" }],
  ["eight", "vosem", "VO-seem", "Numbers", "adjective", "семь, восемь, девять", "Seven, eight, nine", { script: "восемь", reading: "sem, vosem, devyat" }],
  ["nine", "devyat", "DYE-veet", "Numbers", "adjective", "восемь, девять, десять", "Eight, nine, ten", { script: "девять", reading: "vosem, devyat, desyat" }],
  ["ten", "desyat", "DYE-seet", "Numbers", "adjective", "восемь, девять, десять", "Eight, nine, ten", { script: "десять", reading: "vosem, devyat, desyat" }],

  ["red", "krasnyy", "KRAS-ny", "Colors", "adjective", "Мне нравится этот красный шарф.", "I like this red scarf.", { script: "красный", reading: "Mne nravitsya etot krasnyy sharf." }],
  ["blue", "siniy", "SEE-nee", "Colors", "adjective", "У меня синий свитер.", "I have a blue sweater.", { script: "синий", reading: "U menya siniy sviter.", note: "Russian splits blue in two: синий (dark blue) and голубой (light/sky blue)." }],
  ["green", "zelyonyy", "zee-LYO-ny", "Colors", "adjective", "Я люблю зелёный чай.", "I love green tea.", { script: "зелёный", reading: "Ya lyublyu zelyonyy chay." }],
  ["yellow", "zhyoltyy", "ZHOL-ty", "Colors", "adjective", "Банан уже жёлтый.", "The banana is already yellow.", { script: "жёлтый", reading: "Banan uzhe zhyoltyy." }],
  ["black", "chyornyy", "CHOR-ny", "Colors", "adjective", "У меня чёрный кот.", "I have a black cat.", { script: "чёрный", reading: "U menya chyornyy kot." }],
  ["white", "belyy", "BYE-ly", "Colors", "adjective", "Наш дом белый.", "Our house is white.", { script: "белый", reading: "Nash dom belyy." }],

  ["mother / mom", "mama", "MA-ma", "Family", "noun", "Моя мама работает учителем.", "My mom works as a teacher.", { script: "мама", reading: "Moya mama rabotaet uchitelem.", gender: "feminine", note: "Formal/written: мать." }],
  ["father / dad", "papa", "PA-pa", "Family", "noun", "Мой папа работает в Москве.", "My dad works in Moscow.", { script: "папа", reading: "Moy papa rabotaet v Moskve.", gender: "masculine", note: "Grammatically masculine despite the -a ending (мой папа). Formal: отец." }],
  ["brother", "brat", "BRAT", "Family", "noun", "Это мой брат Павел.", "This is my brother Pavel.", { script: "брат", reading: "Eto moy brat Pavel.", gender: "masculine" }],
  ["sister", "sestra", "sees-TRA", "Family", "noun", "Моя сестра живёт в Казани.", "My sister lives in Kazan.", { script: "сестра", reading: "Moya sestra zhivyot v Kazani.", gender: "feminine" }],
  ["friend", "drug", "DROOK", "Family", "noun", "Это мой друг Карим.", "This is my friend Karim.", { script: "друг", reading: "Eto moy drug Karim.", gender: "masculine", note: "The final г sounds like k. A female friend is подруга (podruga)." }],

  ["water", "voda", "va-DA", "Food & Drink", "noun", "Эта вода без газа?", "Is this water still?", { script: "вода", reading: "Eta voda bez gaza?", gender: "feminine", note: "Unstressed о sounds like a: va-DA, not vo-DA." }],
  ["bread", "khleb", "KHLYEP", "Food & Drink", "noun", "Я покупаю хлеб каждое утро.", "I buy bread every morning.", { script: "хлеб", reading: "Ya pokupayu khleb kazhdoe utro.", gender: "masculine" }],
  ["coffee", "kofe", "KO-fye", "Food & Drink", "noun", "Ты хочешь кофе?", "Do you want some coffee?", { script: "кофе", reading: "Ty khochesh kofe?", gender: "masculine", note: "Classic trap: кофе is masculine (мой кофе) and never changes its ending." }],
  ["tea", "chay", "CHAI", "Food & Drink", "noun", "Я пью чай без сахара.", "I drink tea without sugar.", { script: "чай", reading: "Ya pyu chay bez sakhara.", gender: "masculine" }],
  ["tasty / delicious", "vkusno", "FKOOS-na", "Food & Drink", "adverb", "Очень вкусно, спасибо!", "Very tasty, thank you!", { script: "вкусно", reading: "Ochen vkusno, spasibo!", note: "Adjective form: вкусный (a tasty dish = вкусное блюдо)." }],

  ["today", "segodnya", "see-VOD-nya", "Time", "adverb", "Что ты делаешь сегодня?", "What are you doing today?", { script: "сегодня", reading: "Chto ty delaesh segodnya?", note: "The г is pronounced v." }],
  ["tomorrow", "zavtra", "ZAF-tra", "Time", "adverb", "Увидимся завтра утром!", "See you tomorrow morning!", { script: "завтра", reading: "Uvidimsya zavtra utrom!" }],
  ["yesterday", "vchera", "fchee-RA", "Time", "adverb", "Я вчера смотрел фильм.", "I watched a film yesterday.", { script: "вчера", reading: "Ya vchera smotrel film.", note: "A woman says смотрела." }],

  ["to eat", "est", "YEST", "Verbs", "verb", "Я очень хочу есть.", "I'm really hungry.", { script: "есть", reading: "Ya ochen khochu est.", note: "Literally 'I really want to eat'. Same spelling as есть 'there is'. I eat = я ем." }],
  ["to drink", "pit", "PEET", "Verbs", "verb", "Что ты будешь пить?", "What will you drink?", { script: "пить", reading: "Chto ty budesh pit?" }],
  ["to go (on foot)", "idti", "eet-TEE", "Verbs", "verb", "Нам пора идти.", "It's time for us to go.", { script: "идти", reading: "Nam pora idti.", note: "On foot only; by transport use ехать. I'm going = я иду." }],
  ["to speak", "govorit", "ga-va-REET", "Verbs", "verb", "Я учусь говорить по-русски.", "I'm learning to speak Russian.", { script: "говорить", reading: "Ya uchus govorit po-russki." }],
  ["I want", "khochu", "kha-CHOO", "Verbs", "verb", "Я хочу выучить русский язык.", "I want to learn Russian.", { script: "хочу", reading: "Ya khochu vyuchit russkiy yazyk.", note: "From хотеть (to want). Politer in shops: я хотел бы… / я хотела бы… (I would like)." }],

  ["I don't understand", "ya ne ponimayu", "ya nee pa-nee-MA-yu", "Survival", "expression", "Извините, я не понимаю.", "Sorry, I don't understand.", { script: "я не понимаю", reading: "Izvinite, ya ne ponimayu." }],
  ["where is…?", "gde…?", "GDYE", "Survival", "expression", "Скажите, где метро?", "Tell me, where is the metro?", { script: "где", reading: "Skazhite, gde metro?" }],
  ["how much is it?", "skolko stoit", "SKOL-ka STO-eet", "Survival", "expression", "Скажите, сколько стоит билет?", "Tell me, how much is a ticket?", { script: "сколько стоит", reading: "Skazhite, skolko stoit bilet?" }],
];

export const RU_BASICS_DECK = basicsDeck("ru", "Your first 48 Russian words in Cyrillic with Latin readings — greetings, numbers, colours, family, food and survival phrases. Start here!");
export const RU_BASICS = basicsCards("ru", ROWS);
