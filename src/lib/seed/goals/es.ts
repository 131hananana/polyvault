import { goalSet, GoalRows } from "./builder";

const ROWS: GoalRows = {
  travel: [
    ["boarding pass", "la tarjeta de embarque", "lah tar-HEH-tah deh em-BAR-keh", "Airport & transport", "noun", "Aquí tiene la tarjeta de embarque.", "Here is the boarding pass.", { gender: "feminine" }],
    ["suitcase", "la maleta", "lah mah-LEH-tah", "Airport & transport", "noun", "No encuentro la maleta en la cinta.", "I can't find the suitcase on the carousel.", { gender: "feminine" }],
    ["return ticket", "el billete de ida y vuelta", "el bee-YEH-teh deh EE-dah ee BWEL-tah", "Airport & transport", "noun", "Quiero el billete de ida y vuelta.", "I'd like the return ticket.", { gender: "masculine", note: "Spain: el billete. Latin America: el boleto. One-way = de ida." }],
    ["platform (train)", "el andén", "el ahn-DEN", "Airport & transport", "noun", "¿Dónde está el andén para Toledo?", "Where is the platform for Toledo?", { gender: "masculine" }],

    ["booking / reservation", "la reserva", "lah reh-SEHR-bah", "Hotel", "noun", "Quiero confirmar la reserva para esta noche.", "I'd like to confirm the booking for tonight.", { gender: "feminine", note: "Latin America often says la reservación." }],
    ["double room", "la habitación doble", "lah ah-bee-tah-THYOHN DOH-bleh", "Hotel", "noun", "La habitación doble tiene vistas al mar.", "The double room has a sea view.", { gender: "feminine", note: "Single room: habitación individual." }],
    ["key (room key)", "la llave", "lah YAH-beh", "Hotel", "noun", "¿Me da la llave, por favor?", "Could you give me the key, please?", { gender: "feminine" }],
    ["included", "incluido", "een-kloo-EE-doh", "Hotel", "adjective", "¿El desayuno está incluido en el precio?", "Is breakfast included in the price?"],

    ["the bill / check", "la cuenta", "lah KWEN-tah", "Restaurant & café", "noun", "Cuando pueda, la cuenta, por favor.", "When you can, the bill, please.", { gender: "feminine" }],
    ["set lunch menu", "el menú del día", "el meh-NOO del DEE-ah", "Restaurant & café", "noun", "Hoy tomamos el menú del día.", "Today we're having the set lunch menu.", { gender: "masculine", note: "Spain: a fixed-price weekday lunch with starter, main, dessert and a drink." }],
    ["to share (dishes)", "para compartir", "PAH-rah kohm-par-TEER", "Restaurant & café", "phrase", "Queremos unas tapas para compartir.", "We'd like some tapas to share."],
    ["can I have…? (ordering)", "me pone", "meh POH-neh", "Restaurant & café", "expression", "¿Me pone un cortado, por favor?", "Can I have a cortado, please?", { note: "Very common at bars in Spain. In Latin America, ¿me da…? or ¿me trae…? is more usual." }],

    ["straight ahead", "todo recto", "TOH-doh REK-toh", "Directions & help", "adverb", "Siga todo recto hasta la plaza.", "Go straight ahead to the square.", { note: "Latin America: derecho / todo derecho." }],
    ["on the right", "a la derecha", "ah lah deh-REH-chah", "Directions & help", "phrase", "Gire a la derecha en el semáforo.", "Turn right at the traffic light.", { note: "On the left: a la izquierda." }],
    ["far (away)", "lejos", "LEH-hohs", "Directions & help", "adverb", "¿El museo está muy lejos de aquí?", "Is the museum very far from here?", { note: "Near: cerca." }],
    ["can you help me?", "¿me puede ayudar?", "meh PWEH-deh ah-yoo-DAR", "Directions & help", "expression", "Disculpe, ¿me puede ayudar?", "Excuse me, can you help me?", { note: "Polite usted form. Disculpe is a polite way to get a stranger's attention." }],
  ],

  daily: [
    ["what's new?", "¿qué hay de nuevo?", "keh AY deh NWEH-boh", "Small talk", "expression", "Hola, Marta, ¿qué hay de nuevo?", "Hi Marta, what's new?"],
    ["the weather", "el tiempo", "el TYEM-poh", "Small talk", "noun", "¿Qué tal el tiempo en Londres?", "How's the weather in London?", { gender: "masculine", note: "Also means 'time'. 'Hace buen tiempo' = the weather is nice." }],
    ["long time no see", "cuánto tiempo", "KWAHN-toh TYEM-poh", "Small talk", "expression", "¡Cuánto tiempo sin verte, Laura!", "Long time no see, Laura!"],
    ["what do you do (for work)?", "¿a qué te dedicas?", "ah KEH teh deh-DEE-kahs", "Small talk", "expression", "Y tú, ¿a qué te dedicas?", "And you, what do you do?"],

    ["I think that…", "creo que", "KREH-oh keh", "Feelings & opinions", "phrase", "Creo que tienes razón.", "I think you're right."],
    ["tired", "cansado", "kahn-SAH-doh", "Feelings & opinions", "adjective", "Hoy estoy muy cansado.", "I'm very tired today.", { note: "Feminine: cansada. Use with estar." }],
    ["I agree", "estoy de acuerdo", "ehs-TOY deh ah-KWEHR-doh", "Feelings & opinions", "expression", "Estoy de acuerdo contigo.", "I agree with you."],
    ["I love it", "me encanta", "meh en-KAHN-tah", "Feelings & opinions", "expression", "Me encanta esta canción.", "I love this song.", { note: "The thing loved is the subject: plural things take me encantan." }],

    ["I get up", "me levanto", "meh leh-BAHN-toh", "Daily routine", "verb", "Normalmente me levanto a las siete.", "I usually get up at seven.", { note: "From levantarse." }],
    ["I have a shower", "me ducho", "meh DOO-choh", "Daily routine", "verb", "Me ducho siempre por la mañana.", "I always shower in the morning.", { note: "From ducharse." }],
    ["to have breakfast", "desayunar", "deh-sah-yoo-NAR", "Daily routine", "verb", "Me gusta desayunar en la terraza.", "I like having breakfast on the terrace."],
    ["I go to bed", "me acuesto", "meh ah-KWEHS-toh", "Daily routine", "verb", "Entre semana me acuesto temprano.", "On weekdays I go to bed early.", { note: "From acostarse (o → ue)." }],

    ["do you fancy…?", "te apetece", "teh ah-peh-TEH-theh (Spain) / ah-peh-TEH-seh", "Plans & invitations", "expression", "¿Te apetece ir al cine?", "Do you fancy going to the cinema?", { note: "Typical of Spain. Latin America: ¿tienes ganas de…? or ¿se te antoja…? (Mexico)." }],
    ["this weekend", "este fin de semana", "EHS-teh feen deh seh-MAH-nah", "Plans & invitations", "phrase", "¿Qué haces este fin de semana?", "What are you doing this weekend?"],
    ["it's a bad time for me", "me viene mal", "meh BYEH-neh MAHL", "Plans & invitations", "expression", "Lo siento, el sábado me viene mal.", "Sorry, Saturday is bad for me.", { note: "Opposite: me viene bien (that suits me)." }],
    ["sounds good to me", "me parece bien", "meh pah-REH-theh BYEN", "Plans & invitations", "expression", "Cenar a las nueve me parece bien.", "Having dinner at nine sounds good to me."],
  ],

  work: [
    ["meeting", "la reunión", "lah reh-oo-NYOHN", "Meetings", "noun", "La reunión empieza a las diez.", "The meeting starts at ten.", { gender: "feminine" }],
    ["agenda (of a meeting)", "el orden del día", "el OR-den del DEE-ah", "Meetings", "noun", "Repasemos el orden del día.", "Let's go over the agenda.", { gender: "masculine", note: "False friend: la agenda usually means a diary or planner." }],
    ["minutes (of a meeting)", "el acta", "el AHK-tah", "Meetings", "noun", "¿Quién redacta el acta de hoy?", "Who's writing up today's minutes?", { gender: "feminine", note: "Feminine, but takes el because it starts with a stressed a-: las actas." }],
    ["to raise (an issue)", "plantear", "plahn-teh-AR", "Meetings", "verb", "Quiero plantear una duda importante.", "I'd like to raise an important question."],

    ["Dear… (formal letter)", "estimado", "ehs-tee-MAH-doh", "Email & messages", "adjective", "Estimado señor Martín, gracias por su mensaje.", "Dear Mr Martín, thank you for your message.", { note: "Feminine: estimada. Querido/a is only for people you know well." }],
    ["attached", "adjunto", "ad-HOON-toh", "Email & messages", "adjective", "Le envío adjunto el informe final.", "I'm sending you the final report attached.", { note: "Also a noun: el archivo adjunto (the attachment)." }],
    ["kind regards", "un saludo", "oon sah-LOO-doh", "Email & messages", "expression", "Gracias de antemano. Un saludo, Pablo.", "Thanks in advance. Kind regards, Pablo.", { note: "Friendly-professional. More formal: atentamente." }],
    ["I look forward to your reply", "quedo a la espera", "KEH-doh ah lah ehs-PEH-rah", "Email & messages", "expression", "Quedo a la espera de su respuesta.", "I look forward to your reply."],

    ["deadline", "el plazo", "el PLAH-thoh", "Scheduling", "noun", "El plazo termina el viernes.", "The deadline is Friday.", { gender: "masculine", note: "Also common: la fecha límite." }],
    ["to postpone", "aplazar", "ah-plah-THAR", "Scheduling", "verb", "Tenemos que aplazar la reunión.", "We have to postpone the meeting."],
    ["availability", "la disponibilidad", "lah dees-poh-nee-bee-lee-DAHD", "Scheduling", "noun", "Necesito saber la disponibilidad de todos.", "I need to know everyone's availability.", { gender: "feminine" }],
    ["to set a date", "fijar una fecha", "fee-HAR OO-nah FEH-chah", "Scheduling", "phrase", "Debemos fijar una fecha para la presentación.", "We need to set a date for the presentation."],

    ["work colleague", "el compañero de trabajo", "el kohm-pah-NYEH-roh deh trah-BAH-hoh", "Colleagues & office", "noun", "El compañero de trabajo de Ana es italiano.", "Ana's work colleague is Italian.", { gender: "masculine", note: "Female colleague: la compañera. Often shortened to compañero." }],
    ["boss", "el jefe", "el HEH-feh", "Colleagues & office", "noun", "El jefe está de vacaciones.", "The boss is on holiday.", { gender: "masculine", note: "Female boss: la jefa." }],
    ["remote work", "el teletrabajo", "el teh-leh-trah-BAH-hoh", "Colleagues & office", "noun", "El teletrabajo me ahorra mucho tiempo.", "Working from home saves me a lot of time.", { gender: "masculine" }],
    ["report", "el informe", "el een-FOR-meh", "Colleagues & office", "noun", "Mañana entrego el informe trimestral.", "Tomorrow I'm handing in the quarterly report.", { gender: "masculine" }],
  ],

  native: [
    ["cool / great", "guay", "GWAY", "Slang", "adjective", "¡Qué guay tu chaqueta nueva!", "Your new jacket is so cool!", { note: "Spain only. Latin America: chévere, padre (Mexico), bacán (Chile)." }],
    ["dude / mate", "tío", "TEE-oh", "Slang", "noun", "Tío, ¿has visto el partido?", "Dude, did you see the match?", { gender: "masculine", note: "Spain, very informal; tía for women. Literally 'uncle'." }],
    ["money (slang)", "la pasta", "lah PAHS-tah", "Slang", "noun", "Se ha gastado toda la pasta en ropa.", "He's spent all the money on clothes.", { gender: "feminine", note: "Spain. Latin America: la plata, la lana (Mexico)." }],
    ["to work (slang)", "currar", "koo-RAR", "Slang", "verb", "Mañana tengo que currar temprano.", "Tomorrow I have to work early.", { note: "Spain, informal. El curro = the job." }],

    ["OK / alright", "vale", "BAH-leh", "Fillers & reactions", "interjection", "Vale, nos vemos a las ocho.", "OK, see you at eight.", { note: "Hugely common in Spain; rarely heard in Latin America (dale, bueno, ok)." }],
    ["I mean / like", "o sea", "oh SEH-ah", "Fillers & reactions", "expression", "O sea, que no vienes, ¿no?", "So, I mean, you're not coming, right?"],
    ["well… / so…", "pues", "PWEHS", "Fillers & reactions", "interjection", "Pues no sé qué decirte.", "Well, I don't know what to tell you."],
    ["no way! / that's crazy!", "qué fuerte", "keh FWEHR-teh", "Fillers & reactions", "interjection", "¡Qué fuerte lo que me cuentas!", "That's crazy, what you're telling me!", { note: "Spain, informal; reacts to shocking news." }],

    ["exhausted (worn out)", "hecho polvo", "EH-choh POHL-boh", "Idioms", "idiom", "Después del viaje estoy hecho polvo.", "After the trip I'm exhausted.", { note: "Used with estar. Literally 'turned to dust'. Feminine: hecha polvo." }],
    ["to have a nerve (cheek)", "mucha cara", "MOO-chah KAH-rah", "Idioms", "idiom", "Ese chico tiene mucha cara.", "That guy has a lot of nerve.", { note: "Full idiom: tener mucha cara. Someone shameless is un caradura." }],
    ["a piece of cake", "pan comido", "pahn koh-MEE-doh", "Idioms", "idiom", "Este examen es pan comido.", "This exam is a piece of cake."],
    ["to pull someone's leg", "tomar el pelo", "toh-MAR el PEH-loh", "Idioms", "idiom", "A Juan le encanta tomar el pelo.", "Juan loves pulling people's leg.", { note: "Literally 'to take the hair'. ¿Me estás tomando el pelo? = Are you kidding me?" }],

    ["please (short)", "porfa", "POR-fah", "Casual shortcuts", "interjection", "¿Me pasas la sal, porfa?", "Can you pass me the salt, please?", { note: "Short for por favor; friends and family only." }],
    ["the weekend (short)", "el finde", "el FEEN-deh", "Casual shortcuts", "noun", "¿Qué haces el finde?", "What are you up to at the weekend?", { gender: "masculine", note: "Spain. Short for el fin de semana." }],
    ["the movie (short)", "la peli", "lah PEH-lee", "Casual shortcuts", "noun", "¿Vemos la peli esta noche?", "Shall we watch the movie tonight?", { gender: "feminine", note: "Short for la película." }],
    ["school (short)", "el cole", "el KOH-leh", "Casual shortcuts", "noun", "Los niños ya están en el cole.", "The kids are already at school.", { gender: "masculine", note: "Short for el colegio (primary/secondary school)." }],
  ],
};

export const ES_GOALS = goalSet("es", ROWS);
