import { goalSet, GoalRows } from "./builder";

const ROWS: GoalRows = {
  travel: [
    ["boarding pass", "die Bordkarte", "dee BORT-kar-tuh", "Airport & transport", "noun", "Wo bekomme ich die Bordkarte?", "Where do I get the boarding pass?", { gender: "feminine" }],
    ["platform / track", "das Gleis", "dahs GLICE", "Airport & transport", "noun", "Wo ist das Gleis für den Zug nach Hamburg?", "Where is the platform for the train to Hamburg?", { gender: "neuter" }],
    ["ticket (bus/train)", "die Fahrkarte", "dee FAR-kar-tuh", "Airport & transport", "noun", "Ich kaufe die Fahrkarte am Automaten.", "I'm buying the ticket at the machine.", { gender: "feminine", note: "Plane ticket: das Ticket or der Flugschein." }],
    ["delay", "die Verspätung", "dee fair-SHPAY-toong", "Airport & transport", "noun", "Die Verspätung beträgt zwanzig Minuten.", "The delay is twenty minutes.", { gender: "feminine", note: "Common on trains: Der Zug hat Verspätung (the train is late)." }],

    ["reservation", "die Reservierung", "dee reh-zer-VEE-roong", "Hotel", "noun", "Ich möchte die Reservierung bestätigen.", "I'd like to confirm the reservation.", { gender: "feminine" }],
    ["room key", "der Zimmerschlüssel", "dair TSIM-mer-shlues-sel", "Hotel", "noun", "Der Zimmerschlüssel funktioniert leider nicht.", "Unfortunately the room key doesn't work.", { gender: "masculine" }],
    ["with breakfast", "mit Frühstück", "mit FRUE-shtuek", "Hotel", "phrase", "Ist das Zimmer mit Frühstück?", "Does the room include breakfast?"],
    ["to check out", "auschecken", "OWS-chek-en", "Hotel", "verb", "Wir müssen um zehn Uhr auschecken.", "We have to check out at ten.", { note: "Separable verb: Ich checke morgen aus." }],

    ["the bill, please", "die Rechnung, bitte", "dee REKH-noong BIT-tuh", "Restaurant & café", "expression", "Wir sind fertig, die Rechnung, bitte.", "We're done, the bill, please.", { note: "Also common: Zahlen, bitte! (Pay, please!)" }],
    ["menu", "die Speisekarte", "dee SHPY-zuh-kar-tuh", "Restaurant & café", "noun", "Können wir bitte die Speisekarte haben?", "Could we have the menu, please?", { gender: "feminine", note: "das Menü usually means a set meal, not the menu." }],
    ["keep the change", "stimmt so", "SHTIMT zoh", "Restaurant & café", "expression", "Zwanzig Euro, stimmt so, danke!", "Twenty euros, keep the change, thanks!", { note: "How Germans tip: round up and say 'stimmt so'." }],
    ["to pay separately", "getrennt zahlen", "geh-TRENT TSAH-len", "Restaurant & café", "verb", "Können wir bitte getrennt zahlen?", "Can we pay separately, please?", { note: "Waiters often ask: Zusammen oder getrennt? (Together or separate?)" }],

    ["straight ahead", "geradeaus", "geh-RAH-duh-OWS", "Directions & help", "adverb", "Gehen Sie immer geradeaus bis zur Ampel.", "Keep going straight ahead to the traffic light."],
    ["(to the) left", "links", "LINKS", "Directions & help", "adverb", "Biegen Sie an der Kreuzung links ab.", "Turn left at the intersection.", { note: "Right = rechts (REKHTS)." }],
    ["pharmacy", "die Apotheke", "dee ah-poh-TAY-kuh", "Directions & help", "noun", "Ist die Apotheke heute geöffnet?", "Is the pharmacy open today?", { gender: "feminine" }],
    ["can you help me?", "Können Sie mir helfen?", "KUEN-nen zee meer HEL-fen", "Directions & help", "expression", "Entschuldigung, können Sie mir helfen?", "Excuse me, can you help me?", { note: "Polite Sie form for strangers. Casual: Kannst du mir helfen?" }],
  ],

  daily: [
    ["what do you do for work?", "Was machst du beruflich?", "vahs MAKHST doo beh-ROOF-likh", "Small talk", "expression", "Und du, was machst du beruflich?", "And you, what do you do for work?", { note: "Formal: Was machen Sie beruflich?" }],
    ["where are you from?", "Woher kommst du?", "voh-HAIR KOMST doo", "Small talk", "expression", "Ich komme aus Kanada. Woher kommst du?", "I'm from Canada. Where are you from?", { note: "Formal: Woher kommen Sie?" }],
    ["the weather", "das Wetter", "dahs VET-ter", "Small talk", "noun", "Das Wetter ist heute echt schön.", "The weather is really nice today.", { gender: "neuter" }],
    ["nice to meet you", "freut mich", "FROYT mikh", "Small talk", "expression", "Freut mich, dich kennenzulernen!", "Nice to meet you!"],

    ["in my opinion / I think", "ich finde", "ikh FIN-duh", "Feelings & opinions", "expression", "Ich finde, der Film war zu lang.", "I think the film was too long.", { note: "Use 'finden' (not 'denken') to give an opinion." }],
    ["I'm tired", "ich bin müde", "ikh bin MUE-duh", "Feelings & opinions", "expression", "Ich bin müde, ich gehe schlafen.", "I'm tired, I'm going to bed."],
    ["annoyed", "genervt", "geh-NAIRFT", "Feelings & opinions", "adjective", "Sie ist heute total genervt.", "She's really annoyed today."],
    ["you're right (about that)", "da hast du recht", "dah HAHST doo REKHT", "Feelings & opinions", "expression", "Stimmt, da hast du recht.", "True, you're right about that."],

    ["to get up", "aufstehen", "OWF-shtay-en", "Daily routine", "verb", "Am Wochenende will ich spät aufstehen.", "At the weekend I want to get up late.", { note: "Separable verb: Ich stehe um sieben auf." }],
    ["to go (grocery) shopping", "einkaufen", "INE-kow-fen", "Daily routine", "verb", "Nach der Arbeit muss ich noch einkaufen.", "After work I still have to go shopping.", { note: "Separable verb: Ich kaufe heute ein." }],
    ["to cook", "kochen", "KOKH-en", "Daily routine", "verb", "Heute Abend möchte ich Pasta kochen.", "Tonight I'd like to cook pasta."],
    ["to take a shower", "duschen", "DOO-shen", "Daily routine", "verb", "Ich muss noch schnell duschen.", "I just need to have a quick shower."],

    ["do you feel like…?", "Hast du Lust", "hahst doo LOOST", "Plans & invitations", "expression", "Hast du Lust, ins Kino zu gehen?", "Do you feel like going to the cinema?", { note: "The friendliest way to invite someone." }],
    ["are you free?", "Hast du Zeit?", "hahst doo TSITE", "Plans & invitations", "expression", "Ich koche heute Abend. Hast du Zeit?", "I'm cooking tonight. Are you free?"],
    ["shall we meet…?", "Treffen wir uns", "TREF-fen veer oons", "Plans & invitations", "expression", "Treffen wir uns um acht am Bahnhof?", "Shall we meet at eight at the station?"],
    ["gladly / I'd love to", "gerne", "GAIR-nuh", "Plans & invitations", "adverb", "Ja, gerne, ich komme mit!", "Yes, I'd love to, I'll come along!", { note: "Also a warm 'you're welcome': Danke! – Gerne!" }],
  ],

  work: [
    ["meeting", "die Besprechung", "dee beh-SHPREKH-oong", "Meetings", "noun", "Die Besprechung beginnt um zehn Uhr.", "The meeting starts at ten.", { gender: "feminine", note: "Many offices also just say das Meeting." }],
    ["agenda", "die Tagesordnung", "dee TAH-ges-ort-noong", "Meetings", "noun", "Haben alle die Tagesordnung bekommen?", "Has everyone received the agenda?", { gender: "feminine" }],
    ["to present / to introduce", "vorstellen", "FOR-shtel-len", "Meetings", "verb", "Ich möchte kurz das Projekt vorstellen.", "I'd like to briefly present the project.", { note: "Separable verb: Ich stelle das Projekt vor." }],
    ["to summarize", "zusammenfassen", "tsoo-ZAHM-men-fahs-sen", "Meetings", "verb", "Kann jemand die Ergebnisse kurz zusammenfassen?", "Can someone briefly summarize the results?", { note: "Separable verb: Ich fasse kurz zusammen." }],

    ["kind regards (email sign-off)", "Mit freundlichen Grüßen", "mit FROYNT-likh-en GRUE-sen", "Email & messages", "expression", "Vielen Dank für Ihre Hilfe. Mit freundlichen Grüßen", "Thank you for your help. Kind regards", { note: "Standard formal sign-off. Friendlier: Viele Grüße or Beste Grüße." }],
    ["attached / in the attachment", "im Anhang", "im AHN-hahng", "Email & messages", "phrase", "Im Anhang finden Sie den Bericht.", "Please find the report attached."],
    ["Dear Sir or Madam", "Sehr geehrte Damen und Herren", "zair geh-AIR-tuh DAH-men oont HAIR-ren", "Email & messages", "expression", "Sehr geehrte Damen und Herren, vielen Dank.", "Dear Sir or Madam, thank you very much.", { note: "When you know the name: Sehr geehrte Frau Weber / Sehr geehrter Herr Weber." }],
    ["I'll get back to you", "ich melde mich", "ikh MEL-duh mikh", "Email & messages", "expression", "Ich melde mich nächste Woche bei Ihnen.", "I'll get back to you next week."],

    ["appointment", "der Termin", "dair tair-MEEN", "Scheduling", "noun", "Der Termin ist am Montag um neun.", "The appointment is on Monday at nine.", { gender: "masculine" }],
    ["to postpone / to reschedule", "verschieben", "fair-SHEE-ben", "Scheduling", "verb", "Können wir das Meeting verschieben?", "Can we postpone the meeting?"],
    ["deadline", "die Frist", "dee FRIST", "Scheduling", "noun", "Die Frist endet am Freitag.", "The deadline is on Friday.", { gender: "feminine", note: "In many offices people also say die Deadline." }],
    ["that works for me", "passt mir", "PAHST meer", "Scheduling", "expression", "Dienstag um drei passt mir gut.", "Tuesday at three works well for me.", { note: "Ask politely: Passt es Ihnen am Dienstag?" }],

    ["colleague", "der Kollege", "dair koh-LAY-guh", "Colleagues & office", "noun", "Der Kollege aus dem Vertrieb ruft gleich an.", "The colleague from sales is about to call.", { gender: "masculine", note: "Female: die Kollegin. Ask before switching from Sie to du." }],
    ["boss", "der Chef", "dair SHEF", "Colleagues & office", "noun", "Der Chef möchte dich kurz sprechen.", "The boss wants a quick word with you.", { gender: "masculine", note: "Female boss: die Chefin." }],
    ["lunch break", "die Mittagspause", "dee MIT-tahks-pow-zuh", "Colleagues & office", "noun", "Die Mittagspause dauert eine Stunde.", "The lunch break lasts an hour.", { gender: "feminine" }],
    ["working from home", "im Homeoffice", "im HOHM-of-fis", "Colleagues & office", "phrase", "Ich arbeite freitags im Homeoffice.", "I work from home on Fridays.", { note: "An English-looking word that is purely German usage." }],
  ],

  native: [
    ["crazy / intense / wow", "krass", "KRAHS", "Slang", "adjective", "Das Konzert gestern war echt krass!", "The concert yesterday was insane!", { note: "Can be positive or negative depending on tone." }],
    ["awesome (very casual)", "geil", "GILE", "Slang", "adjective", "Die Party war richtig geil!", "The party was totally awesome!", { note: "Very common among young people, but avoid it at work or with strangers." }],
    ["can't be bothered / no desire", "keinen Bock", "KY-nen BOK", "Slang", "idiom", "Ich hab heute keinen Bock auf Arbeit.", "I really can't be bothered with work today.", { note: "Positive: Ich hab Bock! (I'm up for it!)" }],
    ["dude / mate", "Alter", "AHL-ter", "Slang", "interjection", "Alter, hast du das gesehen?", "Dude, did you see that?", { note: "Literally 'old one'. Used between friends, also as 'oh man!'." }],

    ["well… / oh well", "na ja", "nah YAH", "Fillers & reactions", "interjection", "Na ja, war nicht so toll.", "Well, it wasn't that great."],
    ["right? / isn't it?", "oder?", "OH-der", "Fillers & reactions", "interjection", "Der Film war gut, oder?", "The film was good, right?", { note: "Tag question at the end of a sentence, like 'right?'." }],
    ["seriously? / no way!", "echt jetzt?", "EKHT YETST", "Fillers & reactions", "expression", "Du hast gekündigt? Echt jetzt?", "You quit your job? Seriously?"],
    ["exactly", "genau", "geh-NOW", "Fillers & reactions", "interjection", "Genau, das meine ich ja!", "Exactly, that's what I mean!", { note: "Germans say genau constantly to show they're listening." }],

    ["it's all Greek to me", "ich verstehe nur Bahnhof", "ikh fair-SHTAY-uh noor BAHN-hohf", "Idioms", "idiom", "Sorry, ich verstehe nur Bahnhof.", "Sorry, it's all Greek to me.", { note: "Literally 'I only understand train station'." }],
    ["not my problem", "das ist nicht mein Bier", "dahs ist nikht mine BEER", "Idioms", "idiom", "Sorry, aber das ist nicht mein Bier.", "Sorry, but that's not my problem.", { note: "Literally 'that's not my beer'." }],
    ["to keep one's fingers crossed", "die Daumen drücken", "dee DOW-men DRUEK-en", "Idioms", "idiom", "Ich werde dir die Daumen drücken!", "I'll keep my fingers crossed for you!", { note: "Germans press their thumbs instead of crossing fingers. Often: Ich drück dir die Daumen!" }],
    ["lucky you! / that was lucky", "Schwein gehabt", "SHVINE geh-HAHPT", "Idioms", "idiom", "Wow, da hast du Schwein gehabt!", "Wow, you got lucky there!", { note: "Literally 'had pig' — pigs are a German luck symbol." }],

    ["I have no idea", "ich hab keinen Plan", "ikh HAHP KY-nen PLAHN", "Casual shortcuts", "expression", "Sorry, ich hab keinen Plan davon.", "Sorry, I have no idea about that.", { note: "hab = habe; dropping the -e is normal in speech." }],
    ["what's up?", "was geht?", "vahs GAYT", "Casual shortcuts", "expression", "Hey Leute, was geht?", "Hey guys, what's up?", { note: "Very casual greeting among friends." }],
    ["is there / what's there (gibt es)", "gibt's", "GIPTS", "Casual shortcuts", "expression", "Was gibt's heute zum Essen?", "What's for dinner today?", { note: "Spoken short form of 'gibt es'." }],
    ["just / for a sec (softener)", "mal", "MAHL", "Casual shortcuts", "adverb", "Komm mal kurz her!", "Come over here for a sec!", { note: "Short for 'einmal'; makes requests sound relaxed: Guck mal!" }],
  ],
};

export const DE_GOALS = goalSet("de", ROWS);
