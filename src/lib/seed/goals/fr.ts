import { goalSet, GoalRows } from "./builder";

const ROWS: GoalRows = {
  travel: [
    ["boarding pass", "la carte d'embarquement", "lah kart dahm-bar-kuh-MAHN", "Airport & transport", "noun", "Vous avez imprimé la carte d'embarquement ?", "Did you print the boarding pass?", { gender: "feminine" }],
    ["return ticket", "un aller-retour", "uhn ah-lay ruh-TOOR", "Airport & transport", "noun", "Un aller-retour pour Lyon, s'il vous plaît.", "A return ticket to Lyon, please.", { gender: "masculine", note: "A one-way ticket is un aller simple." }],
    ["platform", "le quai", "luh KAY", "Airport & transport", "noun", "Attendez le train sur le quai.", "Wait for the train on the platform.", { gender: "masculine" }],
    ["to miss (a train, a flight)", "rater", "rah-TAY", "Airport & transport", "verb", "Dépêche-toi, on va rater le train !", "Hurry up, we're going to miss the train!", { note: "Everyday word. More formal: manquer." }],

    ["I have a reservation", "j'ai une réservation", "zhay oon ray-zair-vah-SYOHN", "Hotel", "expression", "Bonsoir, j'ai une réservation au nom de Martin.", "Good evening, I have a reservation under Martin."],
    ["breakfast", "le petit-déjeuner", "luh puh-TEE day-zhuh-NAY", "Hotel", "noun", "Le petit-déjeuner est servi jusqu'à dix heures.", "Breakfast is served until ten.", { gender: "masculine" }],
    ["key", "la clé", "lah KLAY", "Hotel", "noun", "Pardon, la clé de ma chambre ne marche pas.", "Sorry, my room key doesn't work.", { gender: "feminine" }],
    ["to check out (of a room)", "libérer la chambre", "lee-bay-RAY lah SHAHMBR", "Hotel", "phrase", "Il faut libérer la chambre avant midi.", "You have to check out before noon."],

    ["the bill, please", "l'addition, s'il vous plaît", "lah-dee-SYOHN seel voo PLEH", "Restaurant & café", "expression", "Excusez-moi, l'addition, s'il vous plaît.", "Excuse me, the bill, please.", { note: "Waiters won't bring the bill until you ask — it's considered rude to rush you." }],
    ["jug of tap water", "une carafe d'eau", "oon kah-RAHF DOH", "Restaurant & café", "noun", "Pour moi, une carafe d'eau, s'il vous plaît.", "For me, a jug of tap water, please.", { gender: "feminine", note: "Tap water is free in French restaurants — ask for this instead of bottled water." }],
    ["dish of the day", "le plat du jour", "luh PLAH dew ZHOOR", "Restaurant & café", "noun", "Quel est le plat du jour ?", "What is the dish of the day?", { gender: "masculine" }],
    ["rare (steak)", "saignant", "seh-NYAHN", "Restaurant & café", "adjective", "Je voudrais mon steak saignant, s'il vous plaît.", "I'd like my steak rare, please.", { note: "Medium = à point, well done = bien cuit. French 'à point' is pinker than you may expect." }],

    ["straight ahead", "tout droit", "too DRWAH", "Directions & help", "adverb", "Continuez tout droit jusqu'au feu.", "Keep going straight ahead to the traffic light.", { note: "Don't mix up with à droite (to the right)." }],
    ["on the left", "à gauche", "ah GOHSH", "Directions & help", "adverb", "Tournez à gauche après la boulangerie.", "Turn left after the bakery."],
    ["can you help me", "pouvez-vous m'aider", "poo-vay VOO meh-DAY", "Directions & help", "expression", "Excusez-moi, pouvez-vous m'aider, s'il vous plaît ?", "Excuse me, can you help me, please?"],
    ["I'm lost", "je suis perdu", "zhuh swee pair-DEW", "Directions & help", "expression", "Pardon, je suis perdu, où est le métro ?", "Sorry, I'm lost, where is the metro?", { note: "A woman says je suis perdue (same sound)." }],
  ],

  daily: [
    ["what do you do for a living?", "qu'est-ce que tu fais dans la vie", "kess-kuh tew FEH dahn lah VEE", "Small talk", "expression", "Et toi, qu'est-ce que tu fais dans la vie ?", "And you, what do you do for a living?"],
    ["long time no see", "ça fait longtemps", "sah feh lohn-TAHN", "Small talk", "expression", "Salut Marie, ça fait longtemps !", "Hi Marie, long time no see!"],
    ["where are you from?", "tu viens d'où", "tew vyan DOO", "Small talk", "expression", "Et toi, tu viens d'où ?", "And you, where are you from?", { note: "Polite form: vous venez d'où ?" }],
    ["nice to meet you", "enchanté", "ahn-shahn-TAY", "Small talk", "interjection", "Enchanté, moi c'est Thomas.", "Nice to meet you, I'm Thomas.", { note: "Written enchantée when a woman says it." }],

    ["I think that", "je pense que", "zhuh PAHNSS kuh", "Feelings & opinions", "expression", "Je pense que c'est une bonne idée.", "I think that it's a good idea."],
    ["I'm tired", "je suis fatigué", "zhuh swee fah-tee-GAY", "Feelings & opinions", "expression", "Ce soir, je suis fatigué après le travail.", "Tonight I'm tired after work.", { note: "A woman writes fatiguée (same sound)." }],
    ["it's great", "c'est génial", "say zhay-NYAHL", "Feelings & opinions", "expression", "On part en vacances ? C'est génial !", "We're going on holiday? That's great!"],
    ["I agree", "je suis d'accord", "zhuh swee dah-KOR", "Feelings & opinions", "expression", "Je suis d'accord avec toi.", "I agree with you.", { note: "Never 'j'agrée' — always être d'accord." }],

    ["I wake up", "je me réveille", "zhuh muh ray-VAY", "Daily routine", "verb", "Le matin, je me réveille vers sept heures.", "In the morning I wake up around seven."],
    ["I take a shower", "je prends une douche", "zhuh prahn oon DOOSH", "Daily routine", "expression", "D'habitude, je prends une douche le soir.", "Usually I take a shower in the evening."],
    ["to do the grocery shopping", "faire les courses", "fair lay KOORSS", "Daily routine", "phrase", "Je dois faire les courses après le travail.", "I have to do the shopping after work."],
    ["I go to bed", "je me couche", "zhuh muh KOOSH", "Daily routine", "verb", "Je me couche souvent vers minuit.", "I often go to bed around midnight."],

    ["are you free tonight?", "tu es libre ce soir", "tew eh LEE-bruh suh SWAHR", "Plans & invitations", "expression", "Salut, tu es libre ce soir ?", "Hi, are you free tonight?"],
    ["shall we go for a drink?", "on va boire un verre", "ohn vah bwahr uhn VAIR", "Plans & invitations", "expression", "Après le travail, on va boire un verre ?", "After work, shall we go for a drink?", { note: "'On' (we) is how French people really say 'nous' in conversation." }],
    ["good idea", "bonne idée", "bun ee-DAY", "Plans & invitations", "expression", "Un pique-nique dimanche ? Bonne idée !", "A picnic on Sunday? Good idea!"],
    ["I can't (make it)", "je ne peux pas", "zhuh nuh puh PAH", "Plans & invitations", "expression", "Désolé, je ne peux pas ce week-end.", "Sorry, I can't make it this weekend."],
  ],

  work: [
    ["agenda (of a meeting)", "l'ordre du jour", "LOR-druh dew ZHOOR", "Meetings", "noun", "Passons au premier point de l'ordre du jour.", "Let's move to the first item on the agenda.", { gender: "masculine", note: "False friend: 'l'agenda' means a diary/calendar, not a meeting agenda." }],
    ["to take the floor", "prendre la parole", "PRAHN-druh lah pah-ROLL", "Meetings", "phrase", "Je voudrais prendre la parole un instant.", "I'd like to say a few words for a moment."],
    ["minutes (of a meeting)", "le compte rendu", "luh kohnt rahn-DEW", "Meetings", "noun", "Qui rédige le compte rendu de la réunion ?", "Who is writing up the meeting minutes?", { gender: "masculine" }],
    ["to postpone", "reporter", "ruh-por-TAY", "Meetings", "verb", "Nous devons reporter la réunion à jeudi.", "We need to postpone the meeting to Thursday.", { note: "False friend: it doesn't mean 'to report' (that's signaler / faire un rapport)." }],

    ["attached (in an email)", "en pièce jointe", "ahn pyess ZHWANT", "Email & messages", "phrase", "Vous trouverez le document en pièce jointe.", "Please find the document attached."],
    ["kind regards", "cordialement", "kor-dyal-MAHN", "Email & messages", "adverb", "Dans l'attente de votre retour, cordialement.", "Looking forward to your reply, kind regards.", { note: "The standard neutral email sign-off." }],
    ["thank you (formal)", "je vous remercie", "zhuh voo ruh-mair-SEE", "Email & messages", "expression", "Je vous remercie pour votre réponse rapide.", "Thank you for your quick reply."],
    ["following (our call, etc.)", "suite à", "SWEET ah", "Email & messages", "preposition", "Suite à notre échange, voici le devis.", "Following our conversation, here is the quote.", { note: "Very common way to open a follow-up email." }],

    ["to set up an appointment", "fixer un rendez-vous", "feek-SAY uhn rahn-day-VOO", "Scheduling", "phrase", "Pouvons-nous fixer un rendez-vous la semaine prochaine ?", "Can we set up a meeting next week?"],
    ["available", "disponible", "dee-spoh-NEE-bluh", "Scheduling", "adjective", "Êtes-vous disponible jeudi après-midi ?", "Are you available on Thursday afternoon?"],
    ["diary / calendar", "l'agenda", "lah-zhahn-DAH", "Scheduling", "noun", "Je regarde l'agenda et je vous confirme.", "I'll check the calendar and confirm with you.", { gender: "masculine", note: "False friend: means your schedule/diary, not a meeting agenda." }],
    ["as soon as possible", "dès que possible", "day kuh poh-SEE-bluh", "Scheduling", "expression", "Merci de me répondre dès que possible.", "Please reply as soon as possible."],

    ["colleague", "un collègue", "uhn koh-LEG", "Colleagues & office", "noun", "Je déjeune souvent avec un collègue.", "I often have lunch with a colleague.", { gender: "masculine", note: "For a woman: une collègue (same spelling)." }],
    ["the boss", "le patron", "luh pah-TROHN", "Colleagues & office", "noun", "Le patron arrive à quelle heure ?", "What time does the boss arrive?", { gender: "masculine", note: "Slightly informal. Formal titles: le directeur, le/la responsable." }],
    ["remote work", "le télétravail", "luh tay-lay-trah-VYE", "Colleagues & office", "noun", "Le télétravail est autorisé deux jours par semaine.", "Remote work is allowed two days a week.", { gender: "masculine", note: "'Je suis en télétravail' = I'm working from home." }],
    ["lunch break", "la pause déjeuner", "lah POHZ day-zhuh-NAY", "Colleagues & office", "noun", "On se voit pendant la pause déjeuner ?", "Shall we meet during the lunch break?", { gender: "feminine" }],
  ],

  native: [
    ["job / work (slang)", "le boulot", "luh boo-LOH", "Slang", "noun", "Je finis le boulot à six heures.", "I finish work at six.", { gender: "masculine", note: "Informal but used by everyone; fine with friends and colleagues." }],
    ["it's so annoying", "c'est chiant", "say SHYAHN", "Slang", "expression", "Attendre le bus sous la pluie, c'est chiant.", "Waiting for the bus in the rain is so annoying.", { note: "Mildly vulgar — fine with friends, avoid at work. Softer: c'est pénible." }],
    ["guy / dude", "le mec", "luh MEK", "Slang", "noun", "Le mec à côté parle trop fort.", "The guy next to us is talking too loudly.", { gender: "masculine", note: "Informal. Also means 'boyfriend' (mon mec)." }],
    ["I can't be bothered", "j'ai la flemme", "zhay lah FLEM", "Slang", "expression", "Ce soir, j'ai la flemme de cuisiner.", "Tonight I can't be bothered to cook.", { note: "Informal. Very common among young people." }],

    ["phew", "ouf", "OOF", "Fillers & reactions", "interjection", "Ouf, on a eu le train !", "Phew, we made the train!"],
    ["so / as a result", "du coup", "dew KOO", "Fillers & reactions", "adverb", "Il pleuvait, du coup on est restés.", "It was raining, so we stayed in.", { note: "Hugely common spoken filler; some people overuse it at the start of every sentence." }],
    ["well / um", "bah", "BAH", "Fillers & reactions", "interjection", "Bah, je sais pas trop.", "Well, I don't really know.", { note: "Casual hesitation sound, also spelled ben or beh." }],
    ["anyway / long story short", "bref", "BREF", "Fillers & reactions", "adverb", "Bref, on est rentrés très tard.", "Anyway, we got home really late.", { note: "Used to wrap up a story or cut to the point." }],

    ["it costs an arm and a leg", "ça coûte les yeux de la tête", "sah KOOT layz-YUH duh lah TET", "Idioms", "idiom", "Ce sac, ça coûte les yeux de la tête !", "This bag costs an arm and a leg!", { note: "Literally 'it costs the eyes of the head'." }],
    ["he stood me up", "il m'a posé un lapin", "eel mah poh-ZAY uhn lah-PAN", "Idioms", "idiom", "Hier soir, il m'a posé un lapin.", "Last night he stood me up.", { note: "Literally 'he put down a rabbit for me'." }],
    ["it's a piece of cake", "c'est du gâteau", "say dew gah-TOH", "Idioms", "idiom", "Cet examen ? C'est du gâteau !", "This exam? It's a piece of cake!"],
    ["in a bad mood", "de mauvais poil", "duh moh-veh PWAHL", "Idioms", "idiom", "Il est de mauvais poil ce matin.", "He's in a bad mood this morning.", { note: "Informal. Literally 'of bad hair (fur)'." }],

    ["I dunno", "j'sais pas", "shay PAH", "Casual shortcuts", "expression", "J'sais pas, on verra demain.", "I dunno, we'll see tomorrow.", { note: "Spoken form of je ne sais pas — often sounds like 'chais pas'." }],
    ["there's (casual)", "y a", "YAH", "Casual shortcuts", "expression", "Y a personne ici ce soir.", "There's nobody here tonight.", { note: "Spoken shortcut for il y a." }],
    ["don't worry (casual)", "t'inquiète", "tan-KYET", "Casual shortcuts", "expression", "T'inquiète, je m'en occupe.", "Don't worry, I'll handle it.", { note: "Short for ne t'inquiète pas. Only with friends." }],
    ["it's no big deal", "c'est pas grave", "say pah GRAHV", "Casual shortcuts", "expression", "Tu as oublié ? C'est pas grave.", "You forgot? No big deal.", { note: "Spoken French drops the 'ne' (correct: ce n'est pas grave)." }],
  ],
};

export const FR_GOALS = goalSet("fr", ROWS);
