import { goalSet, GoalRows } from "./builder";

const ROWS: GoalRows = {
  travel: [
    ["platform (train)", "il binario", "eel bee-NAH-ryoh", "Airport & transport", "noun", "Scusi, qual è il binario per Firenze?", "Excuse me, which platform is it for Florence?", { gender: "masculine" }],
    ["boarding pass", "la carta d'imbarco", "lah KAR-tah deem-BAR-koh", "Airport & transport", "noun", "Ecco la carta d'imbarco e il passaporto.", "Here's the boarding pass and the passport.", { gender: "feminine" }],
    ["ticket", "il biglietto", "eel beel-YET-toh", "Airport & transport", "noun", "Dove posso comprare il biglietto del treno?", "Where can I buy the train ticket?", { gender: "masculine", note: "Validate (convalidare) regional train tickets before boarding." }],
    ["delay", "il ritardo", "eel ree-TAR-doh", "Airport & transport", "noun", "Il ritardo è di venti minuti.", "The delay is twenty minutes.", { gender: "masculine", note: "Running late = in ritardo." }],

    ["I have a reservation", "ho una prenotazione", "oh OO-nah preh-noh-tah-TSYOH-neh", "Hotel", "phrase", "Buonasera, ho una prenotazione a nome Rossi.", "Good evening, I have a reservation under Rossi."],
    ["key", "la chiave", "lah KYAH-veh", "Hotel", "noun", "Ho perso la chiave della camera.", "I've lost the room key.", { gender: "feminine" }],
    ["a double room", "una camera doppia", "OO-nah KAH-meh-rah DOP-pyah", "Hotel", "noun", "Vorrei una camera doppia per due notti.", "I'd like a double room for two nights.", { gender: "feminine", note: "One big bed: camera matrimoniale." }],
    ["breakfast", "la colazione", "lah koh-lah-TSYOH-neh", "Hotel", "noun", "A che ora è la colazione?", "What time is breakfast?", { gender: "feminine" }],

    ["the bill", "il conto", "eel KOHN-toh", "Restaurant & café", "noun", "Ci porta il conto, per favore?", "Could you bring us the bill, please?", { gender: "masculine" }],
    ["a table for two", "un tavolo per due", "oon TAH-voh-loh pehr DOO-eh", "Restaurant & café", "phrase", "Buonasera, avete un tavolo per due?", "Good evening, do you have a table for two?"],
    ["I'd like", "vorrei", "vor-RAY", "Restaurant & café", "verb", "Vorrei un cappuccino e un cornetto.", "I'd like a cappuccino and a croissant.", { note: "The polite way to order — softer than voglio." }],
    ["tip (gratuity)", "la mancia", "lah MAHN-chah", "Restaurant & café", "noun", "In Italia la mancia non è obbligatoria.", "In Italy a tip isn't compulsory.", { gender: "feminine" }],

    ["straight ahead", "sempre dritto", "SEM-preh DREET-toh", "Directions & help", "adverb", "Vada sempre dritto fino alla piazza.", "Go straight ahead as far as the square."],
    ["on the left", "a sinistra", "ah see-NEES-trah", "Directions & help", "adverb", "La farmacia è a sinistra.", "The pharmacy is on the left.", { note: "On the right: a destra." }],
    ["can you help me?", "può aiutarmi", "PWOH ah-yoo-TAR-mee", "Directions & help", "phrase", "Scusi, può aiutarmi un momento?", "Excuse me, can you help me for a moment?", { note: "Formal. With friends: puoi aiutarmi?" }],
    ["I'm lost", "mi sono perso", "mee SOH-noh PEHR-soh", "Directions & help", "phrase", "Scusi, mi sono perso, dov'è il Duomo?", "Excuse me, I'm lost, where's the cathedral?", { note: "Women say: mi sono persa." }],
  ],
  daily: [
    ["nice to meet you", "piacere", "pyah-CHEH-reh", "Small talk", "interjection", "Piacere, io sono Giulia.", "Nice to meet you, I'm Giulia."],
    ["where are you from?", "di dove sei", "dee DOH-veh SAY", "Small talk", "phrase", "Ciao! Di dove sei?", "Hi! Where are you from?", { note: "Formal: di dov'è?" }],
    ["what do you do for work?", "che lavoro fai", "keh lah-VOH-roh FY", "Small talk", "phrase", "E tu, che lavoro fai?", "And you, what do you do for work?"],
    ["what's the weather like?", "che tempo fa", "keh TEM-poh FAH", "Small talk", "phrase", "Che tempo fa oggi a Napoli?", "What's the weather like in Naples today?"],

    ["in my opinion", "secondo me", "seh-KOHN-doh MEH", "Feelings & opinions", "phrase", "Secondo me, è un'ottima idea.", "In my opinion, it's a great idea."],
    ["I'm tired", "sono stanco", "SOH-noh STAHN-koh", "Feelings & opinions", "phrase", "Scusa, sono stanco e vado a letto.", "Sorry, I'm tired and I'm going to bed.", { note: "Women say: sono stanca." }],
    ["I like it", "mi piace", "mee PYAH-cheh", "Feelings & opinions", "phrase", "Mi piace molto questa città.", "I really like this city.", { note: "For plural things: mi piacciono." }],
    ["I agree", "sono d'accordo", "SOH-noh dahk-KOR-doh", "Feelings & opinions", "phrase", "Sì, sono d'accordo con te.", "Yes, I agree with you."],

    ["I wake up", "mi sveglio", "mee ZVEL-yoh", "Daily routine", "verb", "Di solito mi sveglio alle sette.", "I usually wake up at seven."],
    ["to take a shower", "fare la doccia", "FAH-reh lah DOH-chah", "Daily routine", "verb", "Vado a fare la doccia e arrivo.", "I'm going to take a shower and I'll be right there."],
    ["to do the grocery shopping", "fare la spesa", "FAH-reh lah SPEH-zah", "Daily routine", "verb", "Domani devo fare la spesa.", "Tomorrow I have to do the grocery shopping."],
    ["to go to bed", "andare a letto", "ahn-DAH-reh ah LET-toh", "Daily routine", "verb", "Stasera voglio andare a letto presto.", "Tonight I want to go to bed early."],

    ["are you free tonight?", "sei libero stasera", "SAY LEE-beh-roh stah-SEH-rah", "Plans & invitations", "phrase", "Sei libero stasera per una pizza?", "Are you free tonight for a pizza?", { note: "To a woman: sei libera stasera?" }],
    ["shall we meet? / see you", "ci vediamo", "chee veh-DYAH-moh", "Plans & invitations", "phrase", "Ci vediamo alle otto in piazza?", "Shall we meet at eight in the square?"],
    ["let's go / shall we go?", "andiamo", "ahn-DYAH-moh", "Plans & invitations", "verb", "Andiamo a prendere un gelato?", "Shall we go and get an ice cream?"],
    ["gladly / with pleasure", "volentieri", "voh-len-TYEH-ree", "Plans & invitations", "adverb", "Grazie dell'invito, vengo volentieri!", "Thanks for the invitation, I'd love to come!"],
  ],
  work: [
    ["the meeting", "la riunione", "lah ryoo-NYOH-neh", "Meetings", "noun", "La riunione inizia tra dieci minuti.", "The meeting starts in ten minutes.", { gender: "feminine" }],
    ["the agenda", "l'ordine del giorno", "LOR-dee-neh del JOR-noh", "Meetings", "noun", "Ecco l'ordine del giorno di oggi.", "Here's today's agenda.", { gender: "masculine" }],
    ["to share the screen", "condividere lo schermo", "kohn-dee-VEE-deh-reh loh SKEHR-moh", "Meetings", "verb", "Posso condividere lo schermo un attimo?", "Can I share my screen for a moment?"],
    ["to take notes", "prendere appunti", "PREN-deh-reh ahp-POON-tee", "Meetings", "verb", "Chi può prendere appunti durante la riunione?", "Who can take notes during the meeting?"],

    ["kind regards", "cordiali saluti", "kor-DYAH-lee sah-LOO-tee", "Email & messages", "expression", "Grazie per la collaborazione. Cordiali saluti.", "Thank you for your cooperation. Kind regards."],
    ["attached (in an email)", "in allegato", "een ahl-leh-GAH-toh", "Email & messages", "phrase", "In allegato trova il documento richiesto.", "Attached you'll find the requested document."],
    ["Dear… (formal email)", "gentile", "jen-TEE-leh", "Email & messages", "adjective", "Gentile dottoressa Bianchi, la ringrazio.", "Dear Dr Bianchi, thank you.", { note: "Gentile + title/surname for formal emails; Caro/Cara is for people you know." }],
    ["I look forward to your reply", "in attesa di un suo riscontro", "een aht-TEH-zah dee oon SOO-oh rees-KOHN-troh", "Email & messages", "expression", "Resto in attesa di un suo riscontro.", "I look forward to hearing from you."],

    ["deadline", "la scadenza", "lah skah-DEN-tsah", "Scheduling", "noun", "La scadenza è venerdì prossimo.", "The deadline is next Friday.", { gender: "feminine" }],
    ["to postpone", "rimandare", "ree-mahn-DAH-reh", "Scheduling", "verb", "Possiamo rimandare la riunione a lunedì?", "Can we postpone the meeting to Monday?"],
    ["does that suit you? (formal)", "le va bene", "leh vah BEH-neh", "Scheduling", "phrase", "Giovedì alle dieci le va bene?", "Does Thursday at ten suit you?", { note: "Informal: ti va bene?" }],
    ["appointment", "l'appuntamento", "lahp-poon-tah-MEN-toh", "Scheduling", "noun", "Devo spostare l'appuntamento di domani.", "I need to move tomorrow's appointment.", { gender: "masculine" }],

    ["colleague", "il collega", "eel kohl-LEH-gah", "Colleagues & office", "noun", "Ti presento il collega del marketing.", "Let me introduce my colleague from marketing.", { gender: "masculine", note: "Female colleague: la collega." }],
    ["the boss", "il capo", "eel KAH-poh", "Colleagues & office", "noun", "Il capo vuole il report entro stasera.", "The boss wants the report by tonight.", { gender: "masculine" }],
    ["lunch break", "la pausa pranzo", "lah POW-zah PRAHN-dzoh", "Colleagues & office", "noun", "Facciamo la pausa pranzo insieme?", "Shall we take our lunch break together?", { gender: "feminine" }],
    ["to work from home", "lavorare da casa", "lah-voh-RAH-reh dah KAH-zah", "Colleagues & office", "verb", "Il venerdì preferisco lavorare da casa.", "On Fridays I prefer to work from home.", { note: "Italians often just say 'smart working'." }],
  ],
  native: [
    ["how awesome!", "che figata", "keh fee-GAH-tah", "Slang", "expression", "Che figata questo concerto!", "This concert is so awesome!", { note: "Very casual — friends only." }],
    ["some guy", "un tizio", "oon TEET-syoh", "Slang", "noun", "C'era un tizio strano alla festa.", "There was some weird guy at the party.", { gender: "masculine" }],
    ["nonsense / something silly", "una cavolata", "OO-nah kah-voh-LAH-tah", "Slang", "noun", "Ho detto una cavolata, scusa.", "I said something stupid, sorry.", { gender: "feminine" }],
    ["a mess / a ton", "un casino", "oon kah-ZEE-noh", "Slang", "noun", "Ho un casino di lavoro oggi.", "I've got a ton of work today.", { gender: "masculine", note: "Not a casino! That's un casinò." }],

    ["dunno / who knows", "boh", "BOH", "Fillers & reactions", "interjection", "Boh, non so cosa fare.", "Dunno, I don't know what to do.", { note: "Often with a shrug." }],
    ["come on", "dai", "DY", "Fillers & reactions", "interjection", "Dai, vieni con noi!", "Come on, come with us!"],
    ["if only! / maybe", "magari", "mah-GAH-ree", "Fillers & reactions", "interjection", "Una vacanza alle Maldive? Magari!", "A holiday in the Maldives? If only!"],
    ["don't mention it / no way", "figurati", "fee-GOO-rah-tee", "Fillers & reactions", "interjection", "Grazie mille! Figurati, nessun problema!", "Thanks so much! Don't mention it, no problem!", { note: "Formal: si figuri." }],

    ["good luck (break a leg)", "in bocca al lupo", "een BOK-kah ahl LOO-poh", "Idioms", "idiom", "Domani hai l'esame? In bocca al lupo!", "You have the exam tomorrow? Good luck!", { note: "Reply: Crepi! (not grazie)." }],
    ["I'm broke", "sono al verde", "SOH-noh ahl VEHR-deh", "Idioms", "idiom", "Non posso uscire, sono al verde.", "I can't go out, I'm broke."],
    ["(sleep) like a log", "come un ghiro", "KOH-meh oon GHEE-roh", "Idioms", "idiom", "Stanotte ho dormito come un ghiro.", "Last night I slept like a log.", { note: "Literally 'like a dormouse'." }],
    ["an arm and a leg", "un occhio della testa", "oon OK-kyoh DEL-lah TES-tah", "Idioms", "idiom", "Quella borsa costa un occhio della testa.", "That bag costs an arm and a leg."],

    ["talk soon", "ci sentiamo", "chee sen-TYAH-moh", "Casual shortcuts", "phrase", "Va bene, ci sentiamo dopo!", "OK, talk to you later!"],
    ["what's up?", "che si dice", "keh see DEE-cheh", "Casual shortcuts", "phrase", "Ciao bello, che si dice?", "Hey man, what's up?"],
    ["oh well / whatever", "va be'", "vah BEH", "Casual shortcuts", "interjection", "Va be', non importa.", "Oh well, it doesn't matter.", { note: "Clipped form of va bene." }],
    ["tell me / go ahead", "dimmi", "DEEM-mee", "Casual shortcuts", "verb", "Pronto, Marco? Dimmi tutto.", "Hello, Marco? Go ahead, I'm listening.", { note: "Typical way to answer a friend's call." }],
  ],
};

export const IT_GOALS = goalSet("it", ROWS);
