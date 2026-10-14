import { goalSet, GoalRows } from "./builder";

const ROWS: GoalRows = {
  travel: [
    ["boarding pass", "o cartão de embarque", "oo kar-TOWNG jee ehm-BAR-kee", "Airport & transport", "noun", "Aqui está o cartão de embarque.", "Here is the boarding pass.", { gender: "masculine" }],
    ["suitcase", "a mala", "ah MAH-lah", "Airport & transport", "noun", "Não encontro a mala na esteira.", "I can't find the suitcase on the carousel.", { gender: "feminine" }],
    ["bus", "o ônibus", "oo OH-nee-boos", "Airport & transport", "noun", "O ônibus para o centro já saiu.", "The bus to downtown has already left.", { gender: "masculine", note: "Brazil only. Portugal: o autocarro." }],
    ["flight", "o voo", "oo VOH-oo", "Airport & transport", "noun", "O voo está atrasado uma hora.", "The flight is delayed by an hour.", { gender: "masculine" }],

    ["booking / reservation", "a reserva", "ah heh-ZEHR-vah", "Hotel", "noun", "Quero confirmar a reserva para hoje.", "I'd like to confirm the booking for today.", { gender: "feminine" }],
    ["double room", "o quarto de casal", "oo KWAR-too jee kah-ZOW", "Hotel", "noun", "O quarto de casal tem varanda.", "The double room has a balcony.", { gender: "masculine", note: "Single room: quarto de solteiro." }],
    ["key (room key)", "a chave", "ah SHAH-vee", "Hotel", "noun", "Pode me dar a chave, por favor?", "Could you give me the key, please?", { gender: "feminine" }],
    ["breakfast", "o café da manhã", "oo kah-FEH dah mah-NYAHNG", "Hotel", "noun", "O café da manhã está incluído?", "Is breakfast included?", { gender: "masculine", note: "Brazil. Portugal: o pequeno-almoço." }],

    ["the bill / check", "a conta", "ah KOHN-tah", "Restaurant & café", "noun", "A conta, por favor, quando puder.", "The bill, please, when you can.", { gender: "feminine" }],
    ["menu", "o cardápio", "oo kar-DAH-pyoo", "Restaurant & café", "noun", "Pode trazer o cardápio, por favor?", "Could you bring the menu, please?", { gender: "masculine", note: "Brazil. Portugal: a ementa." }],
    ["waiter", "o garçom", "oo gar-SOHNG", "Restaurant & café", "noun", "Chama o garçom, por favor.", "Call the waiter, please.", { gender: "masculine", note: "Waitress: a garçonete." }],
    ["set plate (lunch special)", "o prato feito", "oo PRAH-too FAY-too", "Restaurant & café", "noun", "Hoje vou pedir o prato feito.", "Today I'll order the set plate.", { gender: "masculine", note: "Cheap everyday lunch: rice, beans, meat and salad. Often shortened to PF." }],

    ["straight ahead", "em frente", "ayng FREHN-chee", "Directions & help", "adverb", "Siga em frente até a praça.", "Go straight ahead to the square."],
    ["on the right", "à direita", "ah jee-RAY-tah", "Directions & help", "phrase", "Vire à direita no próximo sinal.", "Turn right at the next traffic light.", { note: "On the left: à esquerda. O sinal = traffic light (São Paulo also says o farol)." }],
    ["far (away)", "longe", "LOHN-zhee", "Directions & help", "adverb", "O museu fica muito longe daqui?", "Is the museum very far from here?", { note: "Near: perto." }],
    ["can you help me?", "pode me ajudar?", "POH-jee mee ah-zhoo-DAR", "Directions & help", "expression", "Com licença, pode me ajudar?", "Excuse me, can you help me?", { note: "Com licença is a polite way to get a stranger's attention." }],
  ],

  daily: [
    ["what's new?", "quais as novidades?", "kwys ahs noh-vee-DAH-jees", "Small talk", "expression", "Oi, Marta, quais as novidades?", "Hi Marta, what's new?"],
    ["the weather", "o tempo", "oo TEHM-poo", "Small talk", "noun", "Como está o tempo em Londres?", "How's the weather in London?", { gender: "masculine", note: "Also means 'time'." }],
    ["long time no see", "quanto tempo", "KWAHN-too TEHM-poo", "Small talk", "expression", "Quanto tempo sem te ver, Laura!", "Long time no see, Laura!"],
    ["what do you do (for work)?", "trabalha com o quê?", "trah-BAH-lyah kohng oo KAY", "Small talk", "expression", "E você, trabalha com o quê?", "And you, what do you do?"],

    ["I think that…", "acho que", "AH-shoo kee", "Feelings & opinions", "phrase", "Acho que você tem razão.", "I think you're right."],
    ["tired", "cansado", "kahn-SAH-doo", "Feelings & opinions", "adjective", "Hoje estou muito cansado.", "I'm very tired today.", { note: "Feminine: cansada. Use with estar." }],
    ["I agree", "concordo", "kohn-KOR-doo", "Feelings & opinions", "verb", "Concordo totalmente com você.", "I totally agree with you.", { note: "From concordar." }],
    ["I love (it)", "adoro", "ah-DOH-roo", "Feelings & opinions", "verb", "Eu adoro essa música nova!", "I love this new song!", { note: "From adorar. Used for things you really like; eu te amo is for people." }],

    ["I wake up", "acordo", "ah-KOR-doo", "Daily routine", "verb", "Normalmente eu acordo às sete.", "I usually wake up at seven.", { note: "From acordar." }],
    ["I take a shower", "tomo banho", "TOH-moo BAH-nyoo", "Daily routine", "expression", "Eu tomo banho todo dia de manhã.", "I take a shower every morning.", { note: "From tomar banho. Many Brazilians shower twice a day." }],
    ["to have lunch", "almoçar", "ahl-moh-SAR", "Daily routine", "verb", "Gosto de almoçar com a família.", "I like having lunch with the family."],
    ["I go to bed", "vou dormir", "voh dor-MEER", "Daily routine", "phrase", "Durante a semana vou dormir cedo.", "During the week I go to bed early."],

    ["let's… / shall we…?", "vamos", "VAH-moos", "Plans & invitations", "verb", "Vamos ao cinema hoje à noite?", "Shall we go to the cinema tonight?", { note: "Casual speech often shortens it to bora." }],
    ["this weekend", "esse fim de semana", "EH-see FEENG jee seh-MAH-nah", "Plans & invitations", "phrase", "O que você vai fazer esse fim de semana?", "What are you doing this weekend?", { note: "In speech Brazilians use esse more than este." }],
    ["I can't make it", "não vai dar", "nowng vy DAR", "Plans & invitations", "expression", "Desculpa, sábado não vai dar.", "Sorry, Saturday doesn't work for me.", { note: "A soft, very Brazilian way to say no." }],
    ["it's a deal / agreed", "combinado", "kohm-bee-NAH-doo", "Plans & invitations", "interjection", "Então às nove, combinado?", "So nine o'clock, deal?"],
  ],

  work: [
    ["meeting", "a reunião", "ah heh-oo-nee-OWNG", "Meetings", "noun", "A reunião começa às dez.", "The meeting starts at ten.", { gender: "feminine" }],
    ["agenda (of a meeting)", "a pauta", "ah POW-tah", "Meetings", "noun", "Vamos revisar a pauta de hoje.", "Let's go over today's agenda.", { gender: "feminine", note: "False friend: a agenda means a diary or planner." }],
    ["minutes (of a meeting)", "a ata", "ah AH-tah", "Meetings", "noun", "Quem vai fazer a ata hoje?", "Who's taking the minutes today?", { gender: "feminine" }],
    ["to present", "apresentar", "ah-preh-zehn-TAR", "Meetings", "verb", "Vou apresentar os resultados do trimestre.", "I'm going to present the quarter's results."],

    ["Dear… (formal email)", "prezado", "preh-ZAH-doo", "Email & messages", "adjective", "Prezado senhor Silva, obrigado pelo retorno.", "Dear Mr Silva, thank you for your reply.", { note: "Feminine: prezada. Caro/a is slightly warmer." }],
    ["attached", "em anexo", "ayng ah-NEHK-soo", "Email & messages", "phrase", "Segue em anexo o relatório final.", "Please find the final report attached.", { note: "Segue em anexo is the standard email formula." }],
    ["best regards (formal)", "atenciosamente", "ah-tehn-see-oh-zah-MEHN-chee", "Email & messages", "adverb", "Agradeço desde já. Atenciosamente, Pedro.", "Thanks in advance. Best regards, Pedro.", { note: "Formal sign-off. Friendlier: abraços or um abraço." }],
    ["I'm at your disposal", "fico à disposição", "FEE-koo ah jees-poh-zee-SOWNG", "Email & messages", "expression", "Qualquer dúvida, fico à disposição.", "If you have any questions, I'm at your disposal."],

    ["deadline", "o prazo", "oo PRAH-zoo", "Scheduling", "noun", "O prazo termina na sexta-feira.", "The deadline is Friday.", { gender: "masculine" }],
    ["to postpone", "adiar", "ah-jee-AR", "Scheduling", "verb", "Precisamos adiar a reunião.", "We need to postpone the meeting."],
    ["availability", "a disponibilidade", "ah jees-poh-nee-bee-lee-DAH-jee", "Scheduling", "noun", "Preciso saber a disponibilidade de todos.", "I need to know everyone's availability.", { gender: "feminine" }],
    ["to schedule / set up", "marcar", "mar-KAR", "Scheduling", "verb", "Podemos marcar uma conversa amanhã?", "Can we schedule a chat tomorrow?", { note: "Marcar uma reunião = to set up a meeting." }],

    ["work colleague", "o colega de trabalho", "oo koh-LEH-gah jee trah-BAH-lyoo", "Colleagues & office", "noun", "O colega de trabalho da Ana é italiano.", "Ana's work colleague is Italian.", { gender: "masculine", note: "Female colleague: a colega." }],
    ["boss", "o chefe", "oo SHEH-fee", "Colleagues & office", "noun", "O chefe está de férias.", "The boss is on holiday.", { gender: "masculine", note: "Female boss: a chefe (also a chefa, informal)." }],
    ["remote work", "o home office", "oo HOH-mee OH-fees", "Colleagues & office", "noun", "O home office economiza muito tempo.", "Working from home saves a lot of time.", { gender: "masculine", note: "Brazilians use the English term; also trabalho remoto." }],
    ["report", "o relatório", "oo heh-lah-TOH-ryoo", "Colleagues & office", "noun", "Amanhã entrego o relatório mensal.", "Tomorrow I'm handing in the monthly report.", { gender: "masculine" }],
  ],

  native: [
    ["cool / nice", "legal", "leh-GOW", "Slang", "adjective", "Que legal a sua jaqueta nova!", "Your new jacket is so cool!"],
    ["dude / man", "cara", "KAH-rah", "Slang", "noun", "Cara, você viu o jogo ontem?", "Dude, did you see the game yesterday?", { gender: "masculine", note: "Literally 'face'. Used for anyone, very informal." }],
    ["OK / cool / alright", "beleza", "beh-LEH-zah", "Slang", "interjection", "Beleza, a gente se vê às oito.", "Cool, see you at eight.", { note: "Literally 'beauty'. Also a greeting: Beleza? = All good?" }],
    ["money (slang)", "a grana", "ah GRAH-nah", "Slang", "noun", "Ele gastou toda a grana em roupa.", "He spent all the money on clothes.", { gender: "feminine" }],

    ["like (filler)", "tipo", "CHEE-poo", "Fillers & reactions", "interjection", "Tipo, eu não sei o que fazer.", "Like, I don't know what to do."],
    ["right? / isn't it?", "né", "NEH", "Fillers & reactions", "interjection", "Hoje está muito quente, né?", "It's really hot today, isn't it?", { note: "Short for não é. Tagged onto almost any sentence." }],
    ["wow! / gosh!", "nossa", "NOH-sah", "Fillers & reactions", "interjection", "Nossa, que coisa linda!", "Wow, how beautiful!", { note: "Short for Nossa Senhora (Our Lady). Surprise, good or bad." }],
    ["thanks (casual)", "valeu", "vah-LEH-oo", "Fillers & reactions", "interjection", "Valeu pela ajuda, cara!", "Thanks for the help, man!", { note: "Also used to say bye casually." }],

    ["a piece of cake", "moleza", "moh-LEH-zah", "Idioms", "noun", "Essa prova foi moleza.", "That exam was a piece of cake.", { gender: "feminine", note: "Literally 'softness'. É moleza! = It's easy!" }],
    ["to embarrass oneself", "pagar mico", "pah-GAR MEE-koo", "Idioms", "idiom", "Não quero pagar mico na festa.", "I don't want to embarrass myself at the party.", { note: "Literally 'to pay the monkey'." }],
    ["to drop the ball / mess up", "pisar na bola", "pee-ZAR nah BOH-lah", "Idioms", "idiom", "Ele não pode pisar na bola de novo.", "He can't mess up again.", { note: "Literally 'to step on the ball'." }],
    ["to waffle / stall", "encher linguiça", "ehn-SHEHR leen-GWEE-sah", "Idioms", "idiom", "Para de encher linguiça e fala logo!", "Stop waffling and just say it!", { note: "Literally 'to stuff sausage'." }],

    ["to / for (short)", "pra", "PRAH", "Casual shortcuts", "preposition", "Vou pra casa agora.", "I'm going home now.", { note: "Spoken form of para. Pro = para o, pra = para a too." }],
    ["OK / is (short)", "tá", "TAH", "Casual shortcuts", "interjection", "Tá bom, te vejo depois.", "OK, see you later.", { note: "Short for está. Tá bom = OK; tá? = OK? at the end of a sentence." }],
    ["I am (short)", "tô", "TOH", "Casual shortcuts", "verb", "Tô chegando, me espera aí!", "I'm almost there, wait for me!", { note: "Short for estou." }],
    ["we (casual)", "a gente", "ah ZHEHN-chee", "Casual shortcuts", "pronoun", "A gente se vê mais tarde.", "We'll see each other later.", { note: "Takes a singular verb (a gente vai). Far more common than nós in speech." }],
  ],
};

export const PT_GOALS = goalSet("pt", ROWS);
