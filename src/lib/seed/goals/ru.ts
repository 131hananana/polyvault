import { goalSet, GoalRows } from "./builder";

/* Russian. `word` = Latin transliteration, `script` = Cyrillic. */
const ROWS: GoalRows = {
  travel: [
    ["ticket", "bilet", "bee-LYET", "Airport & transport", "noun", "Мне нужен билет до Москвы.", "I need a ticket to Moscow.", { script: "билет", reading: "Mne nuzhen bilet do Moskvy.", gender: "masculine" }],
    ["plane", "samolyot", "sa-ma-LYOT", "Airport & transport", "noun", "Наш самолёт опаздывает на час.", "Our plane is an hour late.", { script: "самолёт", reading: "Nash samolyot opazdyvaet na chas.", gender: "masculine", note: "Flight = рейс (reys)." }],
    ["train station", "vokzal", "vag-ZAL", "Airport & transport", "noun", "Где здесь вокзал?", "Where's the train station around here?", { script: "вокзал", reading: "Gde zdes vokzal?", gender: "masculine", note: "кз is pronounced gz. Airport = аэропорт." }],
    ["luggage", "bagazh", "ba-GASH", "Airport & transport", "noun", "Где можно получить багаж?", "Where can I collect my luggage?", { script: "багаж", reading: "Gde mozhno poluchit bagazh?", gender: "masculine" }],

    ["hotel room", "nomer", "NO-meer", "Hotel", "noun", "У вас есть свободный номер?", "Do you have a free room?", { script: "номер", reading: "U vas est svobodnyy nomer?", gender: "masculine", note: "Also means 'number'. A room in a home is комната." }],
    ["booking", "bron", "BRON", "Hotel", "noun", "У меня есть бронь на две ночи.", "I have a booking for two nights.", { script: "бронь", reading: "U menya est bron na dve nochi.", gender: "feminine", note: "Everyday word; formal: бронирование." }],
    ["key", "klyuch", "KLYOOCH", "Hotel", "noun", "Дайте, пожалуйста, ключ от номера.", "Please give me the room key.", { script: "ключ", reading: "Dayte, pozhaluysta, klyuch ot nomera.", gender: "masculine" }],
    ["breakfast", "zavtrak", "ZAF-trak", "Hotel", "noun", "Во сколько завтрак?", "What time is breakfast?", { script: "завтрак", reading: "Vo skolko zavtrak?", gender: "masculine", note: "Don't mix up завтрак (breakfast) and завтра (tomorrow)." }],

    ["the bill", "schyot", "SHCHOT", "Restaurant & café", "noun", "Принесите, пожалуйста, счёт.", "Please bring the bill.", { script: "счёт", reading: "Prinesite, pozhaluysta, schyot.", gender: "masculine", note: "сч is pronounced like a long soft shch." }],
    ["menu", "menyu", "mee-NYOO", "Restaurant & café", "noun", "Можно посмотреть меню?", "Can I see the menu?", { script: "меню", reading: "Mozhno posmotret menyu?", gender: "neuter", note: "Never changes its ending." }],
    ["to order", "zakazat", "za-ka-ZAT", "Restaurant & café", "verb", "Мы готовы заказать.", "We're ready to order.", { script: "заказать", reading: "My gotovy zakazat." }],
    ["tip", "chaevye", "cha-ee-VY-ye", "Restaurant & café", "noun", "Здесь принято оставлять чаевые?", "Is it customary to leave a tip here?", { script: "чаевые", reading: "Zdes prinyato ostavlyat chaevye?", note: "Always plural. Literally 'tea money'; around ten percent is usual." }],

    ["to the left", "nalevo", "na-LYE-va", "Directions & help", "adverb", "Потом поверните налево.", "Then turn left.", { script: "налево", reading: "Potom povernite nalevo." }],
    ["to the right", "napravo", "na-PRA-va", "Directions & help", "adverb", "Идите прямо, потом направо.", "Go straight, then right.", { script: "направо", reading: "Idite pryamo, potom napravo." }],
    ["straight ahead", "pryamo", "PRYA-ma", "Directions & help", "adverb", "Идите прямо до светофора.", "Go straight to the traffic lights.", { script: "прямо", reading: "Idite pryamo do svetofora." }],
    ["help!", "pomogite", "pa-ma-GEE-tye", "Directions & help", "verb", "Пожалуйста, помогите мне!", "Please help me!", { script: "помогите", reading: "Pozhaluysta, pomogite mne!", note: "Polite/plural. To one friend: помоги." }],
  ],

  daily: [
    ["what's new?", "chto novogo?", "SHTO NO-va-va", "Small talk", "expression", "Привет, что нового?", "Hi, what's new?", { script: "что нового?", reading: "Privet, chto novogo?", note: "что is pronounced shto, and the г in -ого sounds like v." }],
    ["nice to meet you", "ochen priyatno", "O-cheen pree-YAT-na", "Small talk", "expression", "Я Хана, очень приятно.", "I'm Hana, nice to meet you.", { script: "очень приятно", reading: "Ya Khana, ochen priyatno." }],
    ["the weather", "pogoda", "pa-GO-da", "Small talk", "noun", "Какая сегодня погода?", "What's the weather like today?", { script: "погода", reading: "Kakaya segodnya pogoda?", gender: "feminine" }],
    ["where are you from?", "otkuda vy?", "at-KOO-da VY", "Small talk", "expression", "Извините, откуда вы?", "Excuse me, where are you from?", { script: "откуда вы?", reading: "Izvinite, otkuda vy?", note: "Informal: откуда ты?" }],

    ["I think", "dumayu", "DOO-ma-yu", "Feelings & opinions", "verb", "Я думаю, это хорошая идея.", "I think it's a good idea.", { script: "думаю", reading: "Ya dumayu, eto khoroshaya ideya." }],
    ["tired", "ustal", "oos-TAL", "Feelings & opinions", "adjective", "Я сегодня очень устал.", "I'm very tired today.", { script: "устал", reading: "Ya segodnya ochen ustal.", note: "A woman says устала." }],
    ["I like it", "nravitsya", "NRA-vee-tsa", "Feelings & opinions", "verb", "Честно, мне нравится этот город.", "Honestly, I like this city.", { script: "нравится", reading: "Chestno, mne nravitsya etot gorod.", note: "Built as 'to me it pleases': мне нравится… The thing liked is the subject." }],
    ["glad", "rad", "RAT", "Feelings & opinions", "adjective", "Я очень рад тебя видеть.", "I'm really glad to see you.", { script: "рад", reading: "Ya ochen rad tebya videt.", note: "A woman says рада." }],

    ["I wake up", "prosypayus", "pra-sy-PA-yus", "Daily routine", "verb", "Я просыпаюсь в семь.", "I wake up at seven.", { script: "просыпаюсь", reading: "Ya prosypayus v sem." }],
    ["I work", "rabotayu", "ra-BO-ta-yu", "Daily routine", "verb", "Я работаю из дома.", "I work from home.", { script: "работаю", reading: "Ya rabotayu iz doma." }],
    ["shower", "dush", "DOOSH", "Daily routine", "noun", "Утром я принимаю душ.", "In the morning I take a shower.", { script: "душ", reading: "Utrom ya prinimayu dush.", gender: "masculine" }],
    ["I go to bed", "lozhus spat", "la-ZHOOS SPAT", "Daily routine", "expression", "Обычно я ложусь спать поздно.", "I usually go to bed late.", { script: "ложусь спать", reading: "Obychno ya lozhus spat pozdno." }],

    ["let's…", "davay", "da-VAI", "Plans & invitations", "expression", "Слушай, давай сходим в кино!", "Listen, let's go to the cinema!", { script: "давай", reading: "Slushay, davay skhodim v kino!", note: "Polite or to a group: давайте." }],
    ["free (not busy)", "svoboden", "sva-BO-deen", "Plans & invitations", "adjective", "Ты свободен в субботу?", "Are you free on Saturday?", { script: "свободен", reading: "Ty svoboden v subbotu?", note: "To a woman: свободна." }],
    ["let's meet", "vstretimsya", "FSTRYE-teem-sya", "Plans & invitations", "verb", "Давай встретимся у метро.", "Let's meet at the metro.", { script: "встретимся", reading: "Davay vstretimsya u metro." }],
    ["with pleasure", "s udovolstviem", "s oo-da-VOL-stvee-yem", "Plans & invitations", "expression", "Спасибо, с удовольствием!", "Thanks, I'd love to!", { script: "с удовольствием", reading: "Spasibo, s udovolstviem!" }],
  ],

  work: [
    ["meeting", "soveshchanie", "sa-vee-SHCHA-nee-ye", "Meetings", "noun", "У нас совещание в десять.", "We have a meeting at ten.", { script: "совещание", reading: "U nas soveshchanie v desyat.", gender: "neuter", note: "A smaller or one-to-one meeting: встреча." }],
    ["agenda", "povestka dnya", "pa-VYEST-ka DNYA", "Meetings", "noun", "Какая сегодня повестка дня?", "What's on today's agenda?", { script: "повестка дня", reading: "Kakaya segodnya povestka dnya?", gender: "feminine" }],
    ["to discuss", "obsudit", "ap-soo-DEET", "Meetings", "verb", "Нам нужно обсудить бюджет.", "We need to discuss the budget.", { script: "обсудить", reading: "Nam nuzhno obsudit byudzhet." }],
    ["I agree", "soglasen", "sa-GLA-seen", "Meetings", "adjective", "Я полностью согласен с вами.", "I completely agree with you.", { script: "согласен", reading: "Ya polnostyu soglasen s vami.", note: "A woman says согласна." }],

    ["kind regards", "s uvazheniem", "s oo-va-ZHE-nee-yem", "Email & messages", "expression", "Спасибо за помощь. С уважением, Анна.", "Thanks for your help. Kind regards, Anna.", { script: "с уважением", reading: "Spasibo za pomoshch. S uvazheniem, Anna.", note: "The standard formal email sign-off, followed by your name on the next line." }],
    ["attachment", "vlozhenie", "vla-ZHE-nee-ye", "Email & messages", "noun", "Я не вижу вложение.", "I can't see the attachment.", { script: "вложение", reading: "Ya ne vizhu vlozhenie.", gender: "neuter", note: "'Please find attached' = во вложении." }],
    ["to forward", "pereslat", "pee-ree-SLAT", "Email & messages", "verb", "Можете переслать мне это письмо?", "Could you forward me this email?", { script: "переслать", reading: "Mozhete pereslat mne eto pismo?" }],
    ["email / letter", "pismo", "pees-MO", "Email & messages", "noun", "Я отправил вам письмо.", "I sent you an email.", { script: "письмо", reading: "Ya otpravil vam pismo.", gender: "neuter", note: "A woman says отправила. Also heard: имейл." }],

    ["deadline", "dedlayn", "ded-LAIN", "Scheduling", "noun", "Когда у нас дедлайн?", "When is our deadline?", { script: "дедлайн", reading: "Kogda u nas dedlayn?", gender: "masculine", note: "Office slang; in formal writing use срок." }],
    ["to postpone", "perenesti", "pee-ree-nees-TEE", "Scheduling", "verb", "Можно перенести встречу на завтра?", "Can we move the meeting to tomorrow?", { script: "перенести", reading: "Mozhno perenesti vstrechu na zavtra?" }],
    ["this week", "na etoy nedele", "na E-tay nee-DYE-lye", "Scheduling", "expression", "Я занят на этой неделе.", "I'm busy this week.", { script: "на этой неделе", reading: "Ya zanyat na etoy nedele.", note: "A woman says занята." }],
    ["convenient", "udobno", "oo-DOB-na", "Scheduling", "adverb", "Вам удобно в четверг?", "Does Thursday work for you?", { script: "удобно", reading: "Vam udobno v chetverg?", note: "Literally 'is it convenient for you'." }],

    ["colleague", "kollega", "ka-LYE-ga", "Colleagues & office", "noun", "Это моя коллега Мария.", "This is my colleague Maria.", { script: "коллега", reading: "Eto moya kollega Mariya.", note: "Same form for men and women: мой коллега / моя коллега." }],
    ["boss", "nachalnik", "na-CHAL-neek", "Colleagues & office", "noun", "Мой начальник сейчас в отпуске.", "My boss is on holiday right now.", { script: "начальник", reading: "Moy nachalnik seychas v otpuske.", gender: "masculine" }],
    ["day off", "vykhodnoy", "vy-khad-NOY", "Colleagues & office", "noun", "Завтра у меня выходной.", "Tomorrow is my day off.", { script: "выходной", reading: "Zavtra u menya vykhodnoy.", gender: "masculine", note: "The weekend = выходные." }],
    ["lunch", "obed", "a-BYET", "Colleagues & office", "noun", "Пойдём на обед вместе?", "Shall we go for lunch together?", { script: "обед", reading: "Poydyom na obed vmeste?", gender: "masculine" }],
  ],

  native: [
    ["cool", "kruto", "KROO-ta", "Slang", "adverb", "Вау, это круто!", "Wow, that's cool!", { script: "круто", reading: "Vau, eto kruto!" }],
    ["dude", "chuvak", "choo-VAK", "Slang", "noun", "Слушай, чувак, ты где?", "Listen, dude, where are you?", { script: "чувак", reading: "Slushay, chuvak, ty gde?", gender: "masculine", note: "Very casual — friends only." }],
    ["damn (mild)", "blin", "BLEEN", "Slang", "interjection", "Ой, блин, я опоздал!", "Oh damn, I'm late!", { script: "блин", reading: "Oy, blin, ya opozdal!", note: "Literally 'pancake' — a mild, safe swear substitute." }],
    ["great / awesome", "klass", "KLASS", "Slang", "adjective", "Фильм просто класс!", "The film is just great!", { script: "класс", reading: "Film prosto klass!" }],

    ["well… / like…", "nu", "NOO", "Fillers & reactions", "interjection", "Это, ну, сложно объяснить.", "It's, well, hard to explain.", { script: "ну", reading: "Eto, nu, slozhno obyasnit.", note: "The most common Russian filler; also urges: ну давай! (come on!)" }],
    ["long story short", "koroche", "ka-RO-che", "Fillers & reactions", "expression", "Ну, короче, мы опоздали.", "So, long story short, we were late.", { script: "короче", reading: "Nu, koroche, my opozdali.", note: "Overused filler, like 'anyway' or 'so basically'." }],
    ["seriously?", "seryozno?", "see-RYOZ-na", "Fillers & reactions", "expression", "Ты что, серьёзно?", "Are you serious?", { script: "серьёзно?", reading: "Ty chto, seryozno?" }],
    ["okay / fine", "ladno", "LAD-na", "Fillers & reactions", "interjection", "Ну ладно, пойдём.", "Well, okay, let's go.", { script: "ладно", reading: "Nu ladno, poydyom." }],

    ["break a leg", "ni pukha ni pera", "nee POO-kha nee pee-RA", "Idioms", "expression", "Завтра экзамен? Ну, ни пуха ни пера!", "Exam tomorrow? Well, break a leg!", { script: "ни пуха ни пера", reading: "Zavtra ekzamen? Nu, ni pukha ni pera!", note: "The traditional reply is к чёрту! (to the devil!) — never 'thank you'." }],
    ["like clockwork", "kak po maslu", "kak pa MAS-loo", "Idioms", "expression", "Всё прошло как по маслу.", "Everything went like clockwork.", { script: "как по маслу", reading: "Vsyo proshlo kak po maslu.", note: "Literally 'as if on butter'." }],
    ["to beat around the bush", "vokrug da okolo", "va-KROOK da O-ka-la", "Idioms", "expression", "Хватит ходить вокруг да около!", "Stop beating around the bush!", { script: "вокруг да около", reading: "Khvatit khodit vokrug da okolo!", note: "Full phrase: ходить вокруг да около." }],
    ["when pigs fly", "kogda rak na gore svistnet", "kag-DA RAK na ga-RYE SVEES-nyet", "Idioms", "expression", "Он вернёт долг, когда рак на горе свистнет.", "He'll pay back the debt when pigs fly.", { script: "когда рак на горе свистнет", reading: "On vernyot dolg, kogda rak na gore svistnet.", note: "Literally 'when the crayfish whistles on the hill'." }],

    ["in a sec (now)", "shchas", "SHCHAS", "Casual shortcuts", "adverb", "Подожди, щас приду.", "Wait, I'll be right there.", { script: "щас", reading: "Podozhdi, shchas pridu.", note: "Spoken/texting form of сейчас. Ironic щас! also means 'yeah, right!'" }],
    ["thx", "sps", "es-pe-ES", "Casual shortcuts", "interjection", "Окей, спс за помощь!", "Okay, thx for the help!", { script: "спс", reading: "Okey, sps za pomoshch!", note: "Texting abbreviation of спасибо — written only." }],
    ["what? (casual)", "chyo", "CHO", "Casual shortcuts", "expression", "А чё такое?", "So what's up?", { script: "чё", reading: "A chyo takoe?", note: "Colloquial for что; can sound rude with strangers." }],
    ["totally (casual)", "vashche", "va-SHCHE", "Casual shortcuts", "adverb", "Это ваще не смешно.", "That's totally not funny.", { script: "ваще", reading: "Eto vashche ne smeshno.", note: "Spoken form of вообще (at all / generally)." }],
  ],
};

export const RU_GOALS = goalSet("ru", ROWS);
