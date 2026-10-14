import { goalSet, GoalRows } from "./builder";

/* Moroccan Darija. `word` = chat-style romanization (3 = ع, 7 = ح, 9 = ق), `script` = Arabic. */
const ROWS: GoalRows = {
  travel: [
    ["plane / flight", "tiyara", "tee-YAA-ra", "Airport & transport", "noun", "عندي طيارة مع العشرة.", "I have a flight at ten.", { script: "طيارة", reading: "3ndi tiyara m3a l3chra.", gender: "feminine" }],
    ["train station", "lagar", "la-GAAR", "Airport & transport", "noun", "فين كاينة لاكار عافاك؟", "Where is the train station, please?", { script: "لاكار", reading: "fin kayna lagar 3afak?", gender: "feminine", note: "From French la gare. Bus station: lmo7atta." }],
    ["ticket", "wer9a", "WER-qa", "Airport & transport", "noun", "عطيني ورقة لمراكش عافاك.", "Give me a ticket to Marrakech, please.", { script: "ورقة", reading: "3tini wer9a l Marrakech 3afak.", gender: "feminine", note: "Literally 'paper'. You'll also hear biyi (French billet) or tiki." }],
    ["suitcase", "lbaliza", "l-ba-LEE-za", "Airport & transport", "noun", "الباليزا ديالي ما وصلاتش.", "My suitcase didn't arrive.", { script: "الباليزا", reading: "lbaliza dyali ma wslatch.", gender: "feminine" }],

    ["room", "bit", "BEET", "Hotel", "noun", "عندكم شي بيت خاوي؟", "Do you have a free room?", { script: "بيت", reading: "3ndkom chi bit khawi?", gender: "masculine", note: "In Darija bit means 'room'; the house is ddar." }],
    ["the key", "ssarout", "s-sa-ROOT", "Hotel", "noun", "عطيني الساروت ديال البيت عافاك.", "Give me the room key, please.", { script: "الساروت", reading: "3tini ssarout dyal lbit 3afak.", gender: "masculine" }],
    ["I have a booking", "7ajez", "HAA-jez", "Hotel", "verb", "أنا حاجز بيت على سمية كريم.", "I have a room booked under Karim's name.", { script: "حاجز", reading: "ana 7ajez bit 3la smiyt Karim.", note: "A woman says 7ajza. Many people simply say 3ndi réservation." }],
    ["breakfast", "lftour", "l-FTOOR", "Hotel", "noun", "الفطور مع شحال عافاك؟", "What time is breakfast, please?", { script: "الفطور", reading: "lftour m3a ch7al 3afak?", gender: "masculine" }],

    ["the bill", "l7ssab", "l-hsaab", "Restaurant & café", "noun", "جيب لينا الحساب عافاك.", "Bring us the bill, please.", { script: "الحساب", reading: "jib lina l7ssab 3afak.", gender: "masculine" }],
    ["spicy (hot)", "7arr", "HARR", "Restaurant & café", "adjective", "واش هادا حار؟", "Is this spicy?", { script: "حار", reading: "wach hada 7arr?", note: "Feminine: 7arra." }],
    ["without sugar", "bla sokkar", "bla SOOK-kar", "Restaurant & café", "phrase", "عطيني قهوة بلا سكر عافاك.", "Give me a coffee without sugar, please.", { script: "بلا سكر", reading: "3tini qahwa bla sokkar 3afak.", note: "Moroccan tea and coffee come very sweet by default." }],
    ["half coffee, half milk", "nss nss", "NUSS NUSS", "Restaurant & café", "noun", "عطيني واحد نص نص عافاك.", "One half-and-half, please.", { script: "نص نص", reading: "3tini wa7ed nss nss 3afak.", gender: "masculine", note: "The classic Moroccan café order: half espresso, half hot milk." }],

    ["straight ahead", "nichan", "nee-SHAAN", "Directions & help", "adverb", "سير نيشان ومن بعد دور.", "Go straight ahead and then turn.", { script: "نيشان", reading: "sir nichan w mn b3d dour." }],
    ["near / close", "9rib", "qreeb", "Directions & help", "adjective", "واش قريب من هنا؟", "Is it close to here?", { script: "قريب", reading: "wach 9rib mn hna?", note: "Opposite: b3id (far)." }],
    ["take me (to…)", "ddini", "D-dee-nee", "Directions & help", "verb", "ديني لجامع الفنا عافاك.", "Take me to Jemaa el-Fna, please.", { script: "ديني", reading: "ddini l jam3 lfna 3afak.", note: "Taxi phrase. Also ask: wach dayer lcompteur? (is the meter on?)" }],
    ["your final price", "akhir taman", "AA-kher ta-MAAN", "Directions & help", "phrase", "شنو آخر ثمن ديالك؟", "What's your final price?", { script: "آخر ثمن", reading: "chno akhir taman dyalek?", note: "Bargaining in the souk — start around half the first price." }],
  ],

  daily: [
    ["what's new?", "achnou jdid?", "ash-NOO jdeed", "Small talk", "expression", "سلام آ خويا، أشنو جديد؟", "Hi bro, what's new?", { script: "أشنو جديد؟", reading: "salam a khouya, achnou jdid?" }],
    ["how are you doing?", "kidayr?", "kee-DAA-yer", "Small talk", "expression", "أهلا كريم، كيداير؟", "Hey Karim, how are you doing?", { script: "كيداير؟", reading: "ahlan Karim, kidayr?", note: "To a woman: kidayra? To a group: kidayrin?" }],
    ["the weather", "ljaw", "l-JAW", "Small talk", "noun", "الجو بارد هاد الأيام.", "It's been cold these days.", { script: "الجو", reading: "ljaw bared had liyyam.", gender: "masculine" }],
    ["where are you from?", "mnin nta?", "m-NEEN n-TA", "Small talk", "expression", "منين نتا؟ أنا من فاس.", "Where are you from? I'm from Fes.", { script: "منين نتا؟", reading: "mnin nta? ana mn Fas.", note: "To a woman: mnin nti?" }],

    ["happy", "fer7an", "fer-HAAN", "Feelings & opinions", "adjective", "أنا فرحان بزاف اليوم.", "I'm very happy today.", { script: "فرحان", reading: "ana fer7an bzzaf lyoum.", note: "Feminine: fer7ana." }],
    ["tired", "3yyan", "ay-YAAN", "Feelings & opinions", "adjective", "راني عيان، خاصني نعس.", "I'm tired, I need to sleep.", { script: "عيان", reading: "rani 3yyan, khassni n3ess.", note: "Feminine: 3yyana." }],
    ["I think (that)", "kandenn", "kan-DENN", "Feelings & opinions", "expression", "كنظن بلي عندك الحق.", "I think you're right.", { script: "كنظن", reading: "kandenn belli 3ndek l7e9." }],
    ["I liked it", "3jbni", "AJ-bnee", "Feelings & opinions", "verb", "هاد الفيلم عجبني بزاف.", "I really liked this film.", { script: "عجبني", reading: "had lfilm 3jbni bzzaf.", note: "Literally 'it pleased me' — the thing liked is the subject." }],

    ["I wake up", "kanfi9", "kan-FEEQ", "Daily routine", "verb", "كنفيق مع السبعة كل صباح.", "I wake up at seven every morning.", { script: "كنفيق", reading: "kanfi9 m3a sb3a kol sba7." }],
    ["work (the job)", "lkhedma", "l-KHED-ma", "Daily routine", "noun", "الخدمة بعيدة على الدار.", "Work is far from home.", { script: "الخدمة", reading: "lkhedma b3ida 3la ddar.", gender: "feminine" }],
    ["I take a shower", "kandouch", "kan-DOOSH", "Daily routine", "verb", "كندوش قبل ما نخرج.", "I shower before I go out.", { script: "كندوش", reading: "kandouch 9bel ma nkhrej.", note: "From French douche." }],
    ["early", "bekri", "BEK-ree", "Daily routine", "adverb", "نعست بكري البارح.", "I went to bed early yesterday.", { script: "بكري", reading: "n3est bekri lbare7." }],

    ["free (not busy)", "fadi", "FAA-dee", "Plans & invitations", "adjective", "واش نتا فاضي هاد العشية؟", "Are you free this evening?", { script: "فاضي", reading: "wach nta fadi had l3chiya?", note: "Feminine: fadya." }],
    ["let's go / come on", "yallah", "YAL-lah", "Plans & invitations", "interjection", "يالاه نمشيو نشربو قهوة.", "Let's go have a coffee.", { script: "يالاه", reading: "yallah nmchiw nchrbo qahwa." }],
    ["the weekend", "lwikand", "l-wee-KAND", "Plans & invitations", "noun", "الويكاند جاي غادي نمشي للبحر.", "Next weekend I'm going to the beach.", { script: "الويكاند", reading: "lwikand jay ghadi nmchi l lb7er.", gender: "masculine", note: "From French le week-end." }],
    ["come over to our place", "aji 3ndna", "AA-jee AND-na", "Plans & invitations", "phrase", "أجي عندنا للعشا غدا.", "Come over to ours for dinner tomorrow.", { script: "أجي عندنا", reading: "aji 3ndna l l3cha ghedda.", note: "To a group: ajiw 3ndna." }],
  ],

  work: [
    ["meeting", "réunion", "ray-oo-NYON", "Meetings", "noun", "عندنا ريونيون من بعد الغدا.", "We have a meeting after lunch.", { script: "ريونيون", reading: "3ndna réunion mn b3d lghda.", gender: "feminine", note: "French loanword — the normal word in Moroccan offices. Formal Arabic: ijtima3." }],
    ["let's start", "nbdaw", "n-BDAW", "Meetings", "verb", "يالاه نبداو، كلشي هنا؟", "Let's start, is everyone here?", { script: "نبداو", reading: "yallah nbdaw, kolchi hna?" }],
    ["I agree", "ana mtafe9", "A-na mta-FEQ", "Meetings", "expression", "أنا متافق معاك فهاد النقطة.", "I agree with you on this point.", { script: "أنا متافق", reading: "ana mtafe9 m3ak f had nno9ta.", note: "Just as common in meetings: d'accord." }],
    ["the project", "lprojet", "l-pro-ZHAY", "Meetings", "noun", "البروجي خاصو يتسالا هاد السيمانة.", "The project has to be finished this week.", { script: "البروجي", reading: "lprojet khasso ytsala had ssimana.", gender: "masculine", note: "French projet. Simana (week) comes from Spanish semana." }],

    ["send me", "sift liya", "SEFT LEE-ya", "Email & messages", "verb", "صيفط ليا الإيمايل عافاك.", "Send me the email, please.", { script: "صيفط ليا", reading: "sift liya l'email 3afak." }],
    ["I'll call you", "ghadi n3iyet lik", "GHA-dee n-AY-yet leek", "Email & messages", "phrase", "غادي نعيط ليك من بعد.", "I'll call you later.", { script: "غادي نعيط ليك", reading: "ghadi n3iyet lik mn b3d.", note: "3iyet = to call (on the phone) or to shout." }],
    ["the file (attachment)", "lfichier", "l-fee-SHYAY", "Email & messages", "noun", "الفيشي راه فالإيمايل.", "The file is in the email.", { script: "الفيشي", reading: "lfichier rah f l'email.", gender: "masculine", note: "French fichier; people write it in French letters in messages." }],
    ["get back to me", "rdd 3liya", "RUDD a-LEE-ya", "Email & messages", "phrase", "رد عليا ملي تشوف الميساج.", "Get back to me when you see the message.", { script: "رد عليا", reading: "rdd 3liya mlli tchouf lmessage.", note: "lmessage / lmisaj = text message, from French." }],

    ["appointment", "maw3id", "MAW-id", "Scheduling", "noun", "عندي موعد مع كليان غدا.", "I have an appointment with a client tomorrow.", { script: "موعد", reading: "3ndi maw3id m3a client ghedda.", gender: "masculine", note: "Also very common: rendez-vous." }],
    ["we postpone", "nejjlo", "n-AJ-loo", "Scheduling", "verb", "خاصنا نأجلو الريونيون لغدا.", "We need to postpone the meeting to tomorrow.", { script: "نأجلو", reading: "khassna nejjlo réunion l ghedda.", note: "Colloquially also: nkhllewha l ghedda (let's leave it till tomorrow)." }],
    ["when suits you?", "fo9ach mnasbek?", "foo-QASH m-NAA-sbek", "Scheduling", "expression", "فوقاش مناسبك نتلاقاو؟", "When suits you for us to meet?", { script: "فوقاش مناسبك", reading: "fo9ach mnasbek ntla9aw?" }],
    ["busy", "mchghoul", "mesh-GHOOL", "Scheduling", "adjective", "سمح ليا، أنا مشغول دابا.", "Sorry, I'm busy right now.", { script: "مشغول", reading: "smeh liya, ana mchghoul daba.", note: "Feminine: mchghoula." }],

    ["my colleague", "zmili", "zmee-LEE", "Colleagues & office", "noun", "هادا زميلي فالخدمة.", "This is my colleague from work.", { script: "زميلي", reading: "hada zmili f lkhedma.", gender: "masculine", note: "Female colleague: zmilti. French collègue is also common." }],
    ["the boss / manager", "lmudir", "l-moo-DEER", "Colleagues & office", "noun", "المدير باغي يشوفك دابا.", "The boss wants to see you now.", { script: "المدير", reading: "lmudir baghi ychoufek daba.", gender: "masculine", note: "Also: chef or patron (French)." }],
    ["the office", "lbiro", "l-bee-RO", "Colleagues & office", "noun", "البيرو ديالي فالطابق التاني.", "My office is on the second floor.", { script: "البيرو", reading: "lbiro dyali f ttabe9 ttani.", gender: "masculine", note: "From French bureau." }],
    ["salary (pay)", "lkhlas", "l-KHLAAS", "Colleagues & office", "noun", "الخلاص كيدخل فالآخر ديال الشهر.", "The salary comes in at the end of the month.", { script: "الخلاص", reading: "lkhlas kaydkhol f lakher dyal ch-hr.", gender: "masculine" }],
  ],

  native: [
    ["nice / beautiful", "zwin", "ZWEEN", "Slang", "adjective", "الفيلم كان زوين بزاف.", "The film was really nice.", { script: "زوين", reading: "lfilm kan zwin bzzaf.", note: "Feminine: zwina. Used for anything good, not just looks." }],
    ["the guys / the kids", "ddrari", "d-DRAA-ree", "Slang", "noun", "الدراري كيتسناو فالقهوة.", "The guys are waiting at the café.", { script: "الدراري", reading: "ddrari kaytsennaw f lqahwa.", gender: "masculine", note: "Literally 'kids', but used for your group of friends. Girls: lbnat." }],
    ["awesome", "nadi", "NAA-dee", "Slang", "adjective", "الكونسير كان نادي!", "The concert was awesome!", { script: "نادي", reading: "lconcert kan nadi!", note: "Very common youth slang. Feminine: nadya." }],
    ["to grind hard / struggle", "kandreb tamara", "kan-DREB ta-MAA-ra", "Slang", "idiom", "هاد السيمانة كنضرب تمارة فالخدمة.", "This week I'm grinding hard at work.", { script: "كنضرب تمارة", reading: "had ssimana kandreb tamara f lkhedma.", note: "tamara = hardship, exhausting effort." }],

    ["I mean / well", "ya3ni", "YA-nee", "Fillers & reactions", "interjection", "يعني، ما عرفتش آش نقول.", "Well, I don't know what to say.", { script: "يعني", reading: "ya3ni, ma 3reftch ach ngoul." }],
    ["really?", "bse77?", "b-SAHH", "Fillers & reactions", "interjection", "بصح؟ ما تيقتش!", "Really? I don't believe it!", { script: "بصح؟", reading: "bse77? ma tiqtch!" }],
    ["well done / bless you", "tbarkallah", "t-BAR-ka-LLAH", "Fillers & reactions", "interjection", "تبارك الله عليك، خدمة زوينة!", "Well done, great work!", { script: "تبارك الله", reading: "tbarkallah 3lik, khedma zwina!", note: "Praise that also wards off the evil eye — say it when complimenting." }],
    ["shame! (that's not done)", "7chouma", "h-SHOO-ma", "Fillers & reactions", "interjection", "حشومة عليك، هضر مزيان.", "Shame on you, speak properly.", { script: "حشومة", reading: "7chouma 3lik, hder mzyan.", note: "A core Moroccan value: what's improper in front of others." }],

    ["getting by / so-so", "3la 9edd l7al", "a-la QEDD l-HAAL", "Idioms", "idiom", "لاباس، على قد الحال.", "Fine, just getting by.", { script: "على قد الحال", reading: "labas, 3la 9edd l7al.", note: "Modest answer about money or how things are going." }],
    ["each day brings its own bread", "kol nhar w rz9o", "kol n-HAAR oo RIZ-qoo", "Idioms", "idiom", "ما تخممش بزاف، كل نهار ورزقو.", "Don't overthink it, each day brings its own provision.", { script: "كل نهار ورزقو", reading: "ma tkhemmemch bzzaf, kol nhar w rz9o." }],
    ["let bygones be bygones", "lli fat mat", "LLEE FAAT MAAT", "Idioms", "idiom", "خلي داكشي، اللي فات مات.", "Forget it, what's past is past.", { script: "اللي فات مات", reading: "khlli dakchi, lli fat mat.", note: "Literally 'what has passed has died'." }],
    ["no pain, no gain", "lli bgha l3sel ysber l9ris n7el", "LLEE b-GHA L-a-SEL ys-BER l-QREES n-HAL", "Idioms", "idiom", "كيقولو: اللي بغا العسل يصبر لقريص النحل", "As they say: whoever wants honey must put up with bee stings.", { script: "اللي بغا العسل يصبر لقريص النحل", reading: "kaygoulo: lli bgha l3sel ysber l9ris n7el" }],

    ["that's it / enough / done", "safi", "SAA-fee", "Casual shortcuts", "interjection", "صافي، سالينا لليوم.", "That's it, we're done for today.", { script: "صافي", reading: "safi, salina l lyoum.", note: "Ends a conversation, a deal or an argument. Also 'okay, fine'." }],
    ["please (warm)", "lah ykhlik", "LAH y-KHEL-leek", "Casual shortcuts", "expression", "الله يخليك، عاوني شوية.", "Please, help me a bit.", { script: "الله يخليك", reading: "lah ykhlik, 3awenni chwiya.", note: "Literally 'may God keep you' — warmer than 3afak." }],
    ["quickly / right away", "dghya", "DGHEE-ya", "Casual shortcuts", "adverb", "أجي دغيا، راه تعطلنا!", "Come quick, we're late!", { script: "دغيا", reading: "aji dghya, rah t3ttelna!" }],
    ["no problem", "machi mouchkil", "MAA-shee moosh-KEEL", "Casual shortcuts", "expression", "ماشي مشكل، نعاونك غدا.", "No problem, I'll help you tomorrow.", { script: "ماشي مشكل", reading: "machi mouchkil, n3awnek ghedda." }],
  ],
};

export const DARIJA_GOALS = goalSet("darija", ROWS);
