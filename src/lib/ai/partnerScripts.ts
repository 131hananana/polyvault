/* ============================================================
   Offline practice-partner phrasebook, per language.
   Each line: [text, translation, Latin reading for non-Latin scripts].
   English lines are translated into Bahasa Indonesia.
   ============================================================ */
import { LanguageId } from "@/lib/types";

export type Line = [string, string, string?];

export interface PartnerScript {
  greet: Line;
  ack: Line[];
  /** conversation ladder — one topic per turn */
  questions: Line[];
  /** small facts about the partner, so short answers get something to react to */
  aboutMe: Line[];
  /** easy either/or questions for low-effort replies */
  easy: Line[];
  howAreYou: Line;
  clarify: Line;
  bye: Line;
  sayIt: Line;
  dontKnow: Line;
}

export const PARTNER_SCRIPTS: Record<LanguageId, PartnerScript> = {
  fr: {
    greet: ["Salut ! Je suis ton partenaire de conversation. Comment ça va aujourd'hui ?", "Hi! I'm your conversation partner. How are you today?"],
    ack: [["Super !", "Great!"], ["Ah, intéressant !", "Oh, interesting!"], ["Cool !", "Cool!"], ["Je vois !", "I see!"]],
    questions: [
      ["Tu viens d'où ?", "Where are you from?"],
      ["Pourquoi tu apprends le français ?", "Why are you learning French?"],
      ["Qu'est-ce que tu fais dans la vie ?", "What do you do for a living?"],
      ["Qu'est-ce que tu aimes faire pendant ton temps libre ?", "What do you like doing in your free time?"],
      ["C'est quoi ton plat préféré ?", "What's your favourite dish?"],
      ["Quel pays tu aimerais visiter ?", "Which country would you like to visit?"],
      ["Tu fais quoi ce week-end ?", "What are you doing this weekend?"],
      ["Tu écoutes quel genre de musique ?", "What kind of music do you listen to?"],
    ],
    aboutMe: [["Moi, j'adore le café le matin.", "I love coffee in the morning."], ["J'habite dans une grande ville.", "I live in a big city."], ["Ce week-end, je veux aller au parc.", "This weekend I want to go to the park."]],
    easy: [["Plutôt café ou thé ?", "Coffee or tea?"], ["Tu préfères la plage ou la montagne ?", "Beach or mountains?"], ["Tu es plutôt du matin ou du soir ?", "Morning person or night person?"], ["Dis-moi un mot sur ta journée !", "Tell me one word about your day!"]],
    howAreYou: ["Ça va très bien, merci de demander !", "I'm doing great, thanks for asking!"],
    clarify: ["Pas de souci, je le dis plus simplement :", "No problem, I'll say it more simply:"],
    bye: ["Salut ! C'était super de parler avec toi. À bientôt !", "Bye! It was great talking with you. See you soon!"],
    sayIt: ["En français, on dit :", "In French we say:"],
    dontKnow: ["Hmm, je ne connais pas encore ce mot. Essaie un autre !", "Hmm, I don't know that word yet. Try another one!"],
  },
  es: {
    greet: ["¡Hola! Soy tu compañero de conversación. ¿Qué tal estás hoy?", "Hi! I'm your conversation partner. How are you today?"],
    ack: [["¡Genial!", "Great!"], ["¡Ah, qué interesante!", "Oh, how interesting!"], ["¡Guay!", "Cool!"], ["¡Ya veo!", "I see!"]],
    questions: [
      ["¿De dónde eres?", "Where are you from?"],
      ["¿Por qué aprendes español?", "Why are you learning Spanish?"],
      ["¿A qué te dedicas?", "What do you do for a living?"],
      ["¿Qué te gusta hacer en tu tiempo libre?", "What do you like doing in your free time?"],
      ["¿Cuál es tu comida favorita?", "What's your favourite food?"],
      ["¿Qué país te gustaría visitar?", "Which country would you like to visit?"],
      ["¿Qué vas a hacer este fin de semana?", "What are you doing this weekend?"],
      ["¿Qué música escuchas?", "What music do you listen to?"],
    ],
    aboutMe: [["A mí me encanta el café por la mañana.", "I love coffee in the morning."], ["Vivo en una ciudad grande.", "I live in a big city."], ["Este fin de semana quiero ir al parque.", "This weekend I want to go to the park."]],
    easy: [["¿Café o té?", "Coffee or tea?"], ["¿Prefieres la playa o la montaña?", "Beach or mountains?"], ["¿Eres más de mañana o de noche?", "Morning person or night person?"], ["¡Dime una palabra sobre tu día!", "Tell me one word about your day!"]],
    howAreYou: ["¡Muy bien, gracias por preguntar!", "Very well, thanks for asking!"],
    clarify: ["¡No pasa nada! Lo digo más fácil:", "No worries! I'll say it more simply:"],
    bye: ["¡Adiós! Me ha encantado hablar contigo. ¡Hasta pronto!", "Bye! I loved talking with you. See you soon!"],
    sayIt: ["En español se dice:", "In Spanish we say:"],
    dontKnow: ["Mmm, todavía no conozco esa palabra. ¡Prueba con otra!", "Hmm, I don't know that word yet. Try another one!"],
  },
  pt: {
    greet: ["Oi! Eu sou seu parceiro de conversa. Tudo bem com você hoje?", "Hi! I'm your conversation partner. How are you today?"],
    ack: [["Que legal!", "How cool!"], ["Ah, interessante!", "Oh, interesting!"], ["Massa!", "Awesome!"], ["Entendi!", "Got it!"]],
    questions: [
      ["De onde você é?", "Where are you from?"],
      ["Por que você está aprendendo português?", "Why are you learning Portuguese?"],
      ["O que você faz da vida?", "What do you do for a living?"],
      ["O que você gosta de fazer no tempo livre?", "What do you like doing in your free time?"],
      ["Qual é a sua comida favorita?", "What's your favourite food?"],
      ["Que país você gostaria de visitar?", "Which country would you like to visit?"],
      ["O que você vai fazer no fim de semana?", "What are you doing this weekend?"],
      ["Que tipo de música você ouve?", "What kind of music do you listen to?"],
    ],
    aboutMe: [["Eu adoro café de manhã.", "I love coffee in the morning."], ["Eu moro numa cidade grande.", "I live in a big city."], ["Neste fim de semana, quero ir ao parque.", "This weekend I want to go to the park."]],
    easy: [["Café ou chá?", "Coffee or tea?"], ["Você prefere praia ou montanha?", "Beach or mountains?"], ["Você é mais da manhã ou da noite?", "Morning person or night person?"], ["Me diz uma palavra sobre o seu dia!", "Tell me one word about your day!"]],
    howAreYou: ["Tudo ótimo, obrigado por perguntar!", "All great, thanks for asking!"],
    clarify: ["Sem problema! Vou falar de um jeito mais simples:", "No problem! I'll say it more simply:"],
    bye: ["Tchau! Foi muito bom conversar com você. Até logo!", "Bye! It was great talking with you. See you soon!"],
    sayIt: ["Em português, a gente diz:", "In Portuguese we say:"],
    dontKnow: ["Hmm, ainda não conheço essa palavra. Tenta outra!", "Hmm, I don't know that word yet. Try another one!"],
  },
  de: {
    greet: ["Hallo! Ich bin dein Gesprächspartner. Wie geht's dir heute?", "Hi! I'm your conversation partner. How are you today?"],
    ack: [["Super!", "Great!"], ["Oh, interessant!", "Oh, interesting!"], ["Cool!", "Cool!"], ["Ach so!", "I see!"]],
    questions: [
      ["Woher kommst du?", "Where are you from?"],
      ["Warum lernst du Deutsch?", "Why are you learning German?"],
      ["Was machst du beruflich?", "What do you do for work?"],
      ["Was machst du gern in deiner Freizeit?", "What do you like doing in your free time?"],
      ["Was ist dein Lieblingsessen?", "What's your favourite food?"],
      ["Welches Land möchtest du besuchen?", "Which country would you like to visit?"],
      ["Was machst du am Wochenende?", "What are you doing at the weekend?"],
      ["Welche Musik hörst du gern?", "What music do you like?"],
    ],
    aboutMe: [["Ich trinke morgens total gern Kaffee.", "I really love coffee in the morning."], ["Ich wohne in einer großen Stadt.", "I live in a big city."], ["Am Wochenende will ich in den Park gehen.", "At the weekend I want to go to the park."]],
    easy: [["Kaffee oder Tee?", "Coffee or tea?"], ["Lieber Strand oder Berge?", "Beach or mountains?"], ["Bist du eher ein Morgen- oder ein Abendmensch?", "Morning person or night person?"], ["Sag mir ein Wort über deinen Tag!", "Tell me one word about your day!"]],
    howAreYou: ["Mir geht's super, danke der Nachfrage!", "I'm great, thanks for asking!"],
    clarify: ["Kein Problem! Ich sage es einfacher:", "No problem! I'll say it more simply:"],
    bye: ["Tschüss! Es war toll, mit dir zu reden. Bis bald!", "Bye! It was great talking to you. See you soon!"],
    sayIt: ["Auf Deutsch sagt man:", "In German we say:"],
    dontKnow: ["Hmm, das Wort kenne ich noch nicht. Probier ein anderes!", "Hmm, I don't know that word yet. Try another one!"],
  },
  it: {
    greet: ["Ciao! Sono il tuo compagno di conversazione. Come stai oggi?", "Hi! I'm your conversation partner. How are you today?"],
    ack: [["Fantastico!", "Fantastic!"], ["Ah, interessante!", "Oh, interesting!"], ["Che bello!", "How nice!"], ["Capisco!", "I see!"]],
    questions: [
      ["Di dove sei?", "Where are you from?"],
      ["Perché studi l'italiano?", "Why are you studying Italian?"],
      ["Che lavoro fai?", "What do you do for work?"],
      ["Cosa ti piace fare nel tempo libero?", "What do you like doing in your free time?"],
      ["Qual è il tuo piatto preferito?", "What's your favourite dish?"],
      ["Quale paese ti piacerebbe visitare?", "Which country would you like to visit?"],
      ["Cosa fai questo fine settimana?", "What are you doing this weekend?"],
      ["Che musica ascolti?", "What music do you listen to?"],
    ],
    aboutMe: [["Io adoro il caffè la mattina.", "I love coffee in the morning."], ["Abito in una grande città.", "I live in a big city."], ["Questo fine settimana voglio andare al parco.", "This weekend I want to go to the park."]],
    easy: [["Caffè o tè?", "Coffee or tea?"], ["Preferisci il mare o la montagna?", "Sea or mountains?"], ["Sei più mattiniero o nottambulo?", "Morning person or night owl?"], ["Dimmi una parola sulla tua giornata!", "Tell me one word about your day!"]],
    howAreYou: ["Sto benissimo, grazie per avermelo chiesto!", "I'm very well, thanks for asking!"],
    clarify: ["Nessun problema! Lo dico in modo più semplice:", "No problem! I'll say it more simply:"],
    bye: ["Ciao! È stato bello parlare con te. A presto!", "Bye! It was lovely talking with you. See you soon!"],
    sayIt: ["In italiano si dice:", "In Italian we say:"],
    dontKnow: ["Mmm, questa parola non la conosco ancora. Prova con un'altra!", "Hmm, I don't know that word yet. Try another one!"],
  },
  ru: {
    greet: ["Привет! Я твой собеседник для практики. Как дела сегодня?", "Hi! I'm your practice partner. How are you today?", "Privet! Ya tvoy sobesednik dlya praktiki. Kak dela segodnya?"],
    ack: [["Класс!", "Great!", "Klass!"], ["О, интересно!", "Oh, interesting!", "O, interesno!"], ["Круто!", "Cool!", "Kruto!"], ["Понятно!", "I see!", "Ponyatno!"]],
    questions: [
      ["Откуда ты?", "Where are you from?", "Otkuda ty?"],
      ["Почему ты учишь русский?", "Why are you learning Russian?", "Pochemu ty uchish russkiy?"],
      ["Кем ты работаешь?", "What do you do for work?", "Kem ty rabotaesh?"],
      ["Что ты любишь делать в свободное время?", "What do you like doing in your free time?", "Chto ty lyubish delat v svobodnoe vremya?"],
      ["Какая твоя любимая еда?", "What's your favourite food?", "Kakaya tvoya lyubimaya eda?"],
      ["Какую страну ты хочешь посетить?", "Which country do you want to visit?", "Kakuyu stranu ty khochesh posetit?"],
      ["Что ты делаешь на выходных?", "What are you doing this weekend?", "Chto ty delaesh na vykhodnykh?"],
      ["Какую музыку ты слушаешь?", "What music do you listen to?", "Kakuyu muzyku ty slushaesh?"],
    ],
    aboutMe: [["Я очень люблю кофе по утрам.", "I really love coffee in the morning.", "Ya ochen lyublyu kofe po utram."], ["Я живу в большом городе.", "I live in a big city.", "Ya zhivu v bolshom gorode."], ["На выходных я хочу пойти в парк.", "This weekend I want to go to the park.", "Na vykhodnykh ya khochu poyti v park."]],
    easy: [["Кофе или чай?", "Coffee or tea?", "Kofe ili chay?"], ["Море или горы?", "Sea or mountains?", "More ili gory?"], ["Ты жаворонок или сова?", "Are you a morning person or a night owl?", "Ty zhavoronok ili sova?"], ["Скажи одно слово о своём дне!", "Tell me one word about your day!", "Skazhi odno slovo o svoyom dne!"]],
    howAreYou: ["У меня всё отлично, спасибо за вопрос!", "I'm doing great, thanks for asking!", "U menya vsyo otlichno, spasibo za vopros!"],
    clarify: ["Ничего страшного! Скажу проще:", "No worries! I'll say it more simply:", "Nichego strashnogo! Skazhu proshche:"],
    bye: ["Пока! Было здорово поговорить. До скорого!", "Bye! It was great to chat. See you soon!", "Poka! Bylo zdorovo pogovorit. Do skorogo!"],
    sayIt: ["По-русски говорят:", "In Russian we say:", "Po-russki govoryat:"],
    dontKnow: ["Хм, я пока не знаю это слово. Попробуй другое!", "Hmm, I don't know that word yet. Try another one!", "Khm, ya poka ne znayu eto slovo. Poprobuy drugoe!"],
  },
  darija: {
    greet: ["سلام! أنا صاحبك ديال الهضرة. لاباس عليك اليوم؟", "Hi! I'm your chat buddy. How are you today?", "salam! ana sa7bek dyal lhedra. labas 3lik lyoum?"],
    ack: [["زوين!", "Nice!", "zwin!"], ["واو، مزيان!", "Wow, great!", "waw, mzyan!"], ["هايل!", "Awesome!", "hayel!"], ["فهمتك!", "I get you!", "fhemtek!"]],
    questions: [
      ["منين نتا؟", "Where are you from?", "mnin nta?"],
      ["علاش كتعلم الدارجة؟", "Why are you learning Darija?", "3lach kat3allem ddarija?"],
      ["شنو كتخدم؟", "What do you do for work?", "chno katkhdem?"],
      ["شنو كتبغي دير فوقت الفراغ؟", "What do you like doing in your free time?", "chno katbghi dir f we9t lfragh?"],
      ["شنو هي الماكلة اللي كتبغي بزاف؟", "What food do you love most?", "chno hiya lmakla lli katbghi bzzaf?"],
      ["شمن بلاد بغيتي تزور؟", "Which country do you want to visit?", "chmen blad bghiti tzour?"],
      ["شنو غادي دير فالويكاند؟", "What are you doing this weekend?", "chno ghadi dir f lwikand?"],
      ["شنو من موسيقى كتسمع؟", "What music do you listen to?", "chno men mousi9a katsme3?"],
    ],
    aboutMe: [["أنا كنموت على أتاي فالصباح.", "I'm crazy about mint tea in the morning.", "ana kanmout 3la atay f sba7."], ["أنا ساكن فمدينة كبيرة.", "I live in a big city.", "ana saken f mdina kbira."], ["فالويكاند بغيت نمشي للبحر.", "This weekend I want to go to the beach.", "f lwikand bghit nmchi l lb7er."]],
    easy: [["أتاي ولا قهوة؟", "Mint tea or coffee?", "atay wla qahwa?"], ["البحر ولا الجبل؟", "Beach or mountains?", "lb7er wla ljbel?"], ["الصباح ولا الليل؟", "Morning or night?", "sba7 wla lil?"], ["قول ليا كلمة وحدة على نهارك!", "Tell me one word about your day!", "goul liya kelma we7da 3la nharek!"]],
    howAreYou: ["أنا بخير، الحمد لله! شكرا على السؤال.", "I'm good, thank God! Thanks for asking.", "ana bikhir, l7amdoulillah! chokran 3la ssoual."],
    clarify: ["ماشي مشكل! غادي نقولها ساهلة:", "No problem! I'll say it simply:", "machi mochkil! ghadi ngoulha sahla:"],
    bye: ["بسلامة! فرحت بزاف بالهضرة معاك. نتلاقاو!", "Bye! I really enjoyed talking with you. See you!", "bslama! fr7t bzzaf b lhedra m3ak. ntla9aw!"],
    sayIt: ["بالدارجة كنقولو:", "In Darija we say:", "b ddarija kangoulou:"],
    dontKnow: ["ممم، مازال ما عرفتش هاد الكلمة. جرب وحدة أخرى!", "Hmm, I don't know that word yet. Try another one!", "mmm, mazal ma 3reftch had lkelma. jerreb we7da khra!"],
  },
  "en-pro": {
    greet: ["Hi! I'm your practice partner. How are you today?", "Hai! Aku partner latihanmu. Apa kabar hari ini?"],
    ack: [["Nice!", "Bagus!"], ["Oh, interesting!", "Oh, menarik!"], ["Cool!", "Keren!"], ["I see!", "Oh begitu!"]],
    questions: [
      ["Where are you from?", "Kamu dari mana?"],
      ["Why are you learning English?", "Kenapa kamu belajar bahasa Inggris?"],
      ["What do you do for work or study?", "Kamu kerja atau kuliah apa?"],
      ["What do you like to do in your free time?", "Apa yang kamu suka lakukan di waktu luang?"],
      ["What's your favorite food?", "Makanan favoritmu apa?"],
      ["Which country would you love to visit?", "Negara mana yang ingin kamu kunjungi?"],
      ["What are your plans for the weekend?", "Apa rencanamu akhir pekan ini?"],
      ["What kind of music do you listen to?", "Kamu suka dengar musik apa?"],
    ],
    aboutMe: [["I'm a big coffee person in the morning.", "Aku suka banget kopi di pagi hari."], ["I live in a big city.", "Aku tinggal di kota besar."], ["This weekend I want to go to the park.", "Akhir pekan ini aku mau ke taman."]],
    easy: [["Coffee or tea?", "Kopi atau teh?"], ["Beach or mountains?", "Pantai atau gunung?"], ["Are you a morning person or a night owl?", "Kamu tipe pagi atau malam?"], ["Tell me one word about your day!", "Ceritakan satu kata tentang harimu!"]],
    howAreYou: ["I'm doing great, thanks for asking!", "Aku baik banget, makasih udah nanya!"],
    clarify: ["No worries! Let me say it more simply:", "Santai! Aku bilang dengan lebih sederhana:"],
    bye: ["Bye! It was great chatting with you. See you soon!", "Dah! Senang ngobrol sama kamu. Sampai jumpa!"],
    sayIt: ["In English, we say:", "Dalam bahasa Inggris, kita bilang:"],
    dontKnow: ["Hmm, I don't know that word yet. Try another one!", "Hmm, aku belum tahu kata itu. Coba kata lain!"],
  },
};
