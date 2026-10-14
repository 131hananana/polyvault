import { goalSet, GoalRows } from "./builder";

/* English goal tracks — meanings and translations in Bahasa Indonesia. */
const ROWS: GoalRows = {
  travel: [
    ["kartu naik pesawat", "boarding pass", "BOR-ding pas", "Airport & transport", "noun", "Please show your boarding pass here.", "Silakan tunjukkan boarding pass Anda di sini."],
    ["bagasi", "luggage", "LUG-ij", "Airport & transport", "noun", "My luggage didn't arrive.", "Bagasi saya tidak sampai.", { note: "Uncountable: say \"two bags\" or \"two pieces of luggage\", not \"two luggages\". US also says \"baggage\"." }],
    ["tertunda (penerbangan)", "delayed", "dih-LAYD", "Airport & transport", "adjective", "Our flight is delayed again.", "Penerbangan kami tertunda lagi."],
    ["tiket sekali jalan", "one-way ticket", "WUN-way TIK-it", "Airport & transport", "noun", "I'd like a one-way ticket, please.", "Saya mau tiket sekali jalan, ya.", { note: "Pulang-pergi: US \"round-trip ticket\", UK \"return ticket\"." }],

    ["check-in (lapor masuk hotel)", "check in", "chek IN", "Hotel", "phrase", "What time can we check in?", "Jam berapa kami bisa check-in?"],
    ["check-out (keluar dari hotel)", "check out", "chek OWT", "Hotel", "phrase", "We need to check out by noon.", "Kami harus check-out sebelum jam dua belas siang."],
    ["saya sudah pesan kamar", "I have a reservation", "eye HAV uh rez-er-VAY-shun", "Hotel", "expression", "Hi, I have a reservation under Putri.", "Halo, saya sudah reservasi atas nama Putri."],
    ["handuk tambahan", "extra towels", "EK-struh TOW-elz", "Hotel", "noun", "Could we get some extra towels?", "Bisakah kami minta handuk tambahan?"],

    ["boleh minta bonnya?", "Could I get the bill?", "kood eye get thuh BIL", "Restaurant & café", "expression", "Excuse me, could I get the bill?", "Permisi, boleh minta bonnya?", { note: "US English often says \"the check\" instead of \"the bill\"." }],
    ["meja untuk dua orang", "a table for two", "uh TAY-bul for TOO", "Restaurant & café", "phrase", "Hi, a table for two, please.", "Halo, meja untuk dua orang, ya."],
    ["makan di sini atau dibungkus?", "for here or to go", "for HEER or tuh GOH", "Restaurant & café", "expression", "Is that for here or to go?", "Makan di sini atau dibawa pulang?", { note: "UK: \"Eat in or take away?\"" }],
    ["saya alergi…", "I'm allergic to", "aim uh-LER-jik too", "Restaurant & café", "expression", "I'm allergic to peanuts.", "Saya alergi kacang tanah."],

    ["jauh dari sini", "far from here", "FAR frum HEER", "Directions & help", "phrase", "Is the museum far from here?", "Apakah museumnya jauh dari sini?"],
    ["belok kiri", "turn left", "turn LEFT", "Directions & help", "phrase", "Turn left at the traffic lights.", "Belok kiri di lampu merah."],
    ["jalan lurus", "go straight", "goh STRAYT", "Directions & help", "phrase", "Go straight for two blocks.", "Jalan lurus terus sejauh dua blok."],
    ["saya tersesat", "I'm lost", "aim LOST", "Directions & help", "expression", "Sorry, I'm lost. Can you help?", "Maaf, saya tersesat. Bisa bantu?"],
  ],

  daily: [
    ["gimana kabarnya? (santai)", "how's it going?", "howz it GOH-ing", "Small talk", "expression", "Hey Sam, how's it going?", "Hai Sam, gimana kabarnya?"],
    ["cuacanya bagus", "lovely weather", "LUV-lee WETH-er", "Small talk", "phrase", "Lovely weather today, isn't it?", "Cuacanya bagus hari ini, ya?"],
    ["kamu kerja apa?", "what do you do", "wut doo yoo DOO", "Small talk", "expression", "So, what do you do these days?", "Jadi, sekarang kamu kerja apa?", { note: "Asks about someone's job, not what they're doing right now." }],
    ["kamu berasal dari mana?", "where are you from", "WAIR ar yoo FRUM", "Small talk", "expression", "Where are you from originally?", "Kamu asalnya dari mana?"],

    ["menurut saya", "I think", "eye THINK (th = tongue between teeth)", "Feelings & opinions", "phrase", "I think it's a great idea.", "Menurut saya itu ide yang bagus."],
    ["saya setuju", "I agree", "eye uh-GREE", "Feelings & opinions", "expression", "I agree with you completely.", "Saya setuju sepenuhnya denganmu.", { note: "Say \"I agree\", not \"I am agree\"." }],
    ["capek sekali", "exhausted", "ig-ZAW-stid", "Feelings & opinions", "adjective", "I'm exhausted after work today.", "Saya capek sekali setelah kerja hari ini."],
    ["antusias / tidak sabar", "excited", "ik-SY-tid", "Feelings & opinions", "adjective", "I'm so excited about the trip!", "Saya sangat antusias soal liburan itu!"],

    ["bangun tidur", "wake up", "wayk UP", "Daily routine", "verb", "I usually wake up at seven.", "Saya biasanya bangun jam tujuh."],
    ["mandi", "take a shower", "tayk uh SHOW-er", "Daily routine", "phrase", "I take a shower every morning.", "Saya mandi setiap pagi."],
    ["perjalanan ke tempat kerja", "commute", "kuh-MYOOT", "Daily routine", "noun", "My commute takes about an hour.", "Perjalanan saya ke kantor sekitar satu jam."],
    ["beres-beres rumah", "do the chores", "doo thuh CHORZ", "Daily routine", "phrase", "I do the chores on Sundays.", "Saya beres-beres rumah setiap hari Minggu."],

    ["kamu ada waktu?", "are you free", "ar yoo FREE", "Plans & invitations", "expression", "Are you free on Saturday night?", "Kamu ada waktu Sabtu malam?"],
    ["mau ikut?", "do you want to come", "doo yoo WONT tuh KUM", "Plans & invitations", "expression", "Do you want to come with us?", "Mau ikut dengan kami?"],
    ["boleh / kedengarannya oke", "sounds good", "sowndz GOOD", "Plans & invitations", "expression", "Dinner at eight? Sounds good!", "Makan malam jam delapan? Oke, boleh!"],
    ["lain kali saja", "maybe next time", "MAY-bee nekst TIME", "Plans & invitations", "expression", "I can't tonight, maybe next time.", "Malam ini nggak bisa, lain kali saja ya."],
  ],

  work: [
    ["agenda rapat", "agenda", "uh-JEN-duh", "Meetings", "noun", "Let's go through today's agenda.", "Mari kita bahas agenda hari ini."],
    ["membahas lagi nanti", "circle back", "SUR-kul BAK", "Meetings", "phrase", "Let's circle back to this tomorrow.", "Mari kita bahas lagi hal ini besok."],
    ["daftar tindak lanjut", "action items", "AK-shun EYE-tumz", "Meetings", "noun", "Let's review the action items now.", "Mari kita tinjau daftar tindak lanjutnya sekarang."],
    ["maaf menyela", "sorry to interrupt", "SOR-ee tuh in-tuh-RUPT", "Meetings", "expression", "Sorry to interrupt, but I have a question.", "Maaf menyela, tapi saya punya pertanyaan."],

    ["menindaklanjuti", "follow up", "FOL-oh UP", "Email & messages", "verb", "I'll follow up with the client tomorrow.", "Saya akan menindaklanjuti klien itu besok."],
    ["nanti saya kabari", "I'll keep you posted", "ile KEEP yoo POH-stid", "Email & messages", "expression", "No news yet, but I'll keep you posted.", "Belum ada kabar, tapi nanti saya kabari terus."],
    ["terlampir", "attached", "uh-TACHT", "Email & messages", "adjective", "Please find the report attached.", "Laporannya terlampir."],
    ["salam (penutup email)", "best regards", "best rih-GARDZ", "Email & messages", "expression", "Thanks again. Best regards, Dewi.", "Terima kasih lagi. Salam, Dewi.", { note: "Safe, neutral sign-off. \"Best\" alone is more casual." }],

    ["menjadwal ulang", "reschedule", "ree-SKED-jool", "Scheduling", "verb", "Can we reschedule our call to Friday?", "Bisakah kita jadwal ulang panggilan kita ke Jumat?", { note: "UK often says \"ree-SHED-yool\"." }],
    ["tenggat waktu", "deadline", "DED-line", "Scheduling", "noun", "The deadline is next Monday.", "Tenggat waktunya Senin depan."],
    ["cocok untukmu? (jadwal)", "work for you", "WERK for yoo", "Scheduling", "phrase", "Does Thursday afternoon work for you?", "Apakah Kamis sore cocok untukmu?"],
    ["undangan kalender", "calendar invite", "KAL-en-der IN-vite", "Scheduling", "noun", "I'll send you a calendar invite.", "Saya akan kirimkan undangan kalendernya."],

    ["rekan kerja", "coworker", "KOH-wer-ker", "Colleagues & office", "noun", "My coworker helped me with the project.", "Rekan kerja saya membantu saya dengan proyek itu.", { note: "\"Colleague\" is more formal and common in UK English." }],
    ["kerja dari rumah", "work from home", "werk frum HOHM", "Colleagues & office", "phrase", "I work from home on Fridays.", "Saya kerja dari rumah setiap Jumat."],
    ["hari libur / cuti", "day off", "day OFF", "Colleagues & office", "noun", "I'm taking a day off tomorrow.", "Saya ambil cuti besok."],
    ["kewalahan (banyak kerjaan)", "swamped", "SWOMPT", "Colleagues & office", "adjective", "Sorry, I'm swamped this week.", "Maaf, minggu ini kerjaan saya numpuk banget."],
  ],

  native: [
    ["keren banget", "awesome", "AW-sum", "Slang", "adjective", "That concert was awesome!", "Konser itu keren banget!"],
    ["bro / sob", "dude", "DOOD", "Slang", "noun", "Dude, you have to see this.", "Bro, kamu harus lihat ini."],
    ["sayang banget / nyebelin", "that's a bummer", "thats uh BUM-er", "Slang", "expression", "You missed the party? That's a bummer.", "Kamu nggak datang ke pesta? Sayang banget."],
    ["nongkrong", "hang out", "hang OWT", "Slang", "verb", "Want to hang out this weekend?", "Mau nongkrong akhir pekan ini?"],

    ["ya gitu deh (pengisi)", "you know", "yoo NOH", "Fillers & reactions", "expression", "It's just, you know, complicated.", "Cuma, ya gitu deh, rumit."],
    ["masa sih! / nggak mungkin!", "no way", "noh WAY", "Fillers & reactions", "interjection", "No way! You met her?", "Masa sih! Kamu ketemu dia?"],
    ["santai aja / nggak apa-apa", "no worries", "noh WUR-eez", "Fillers & reactions", "expression", "No worries, it happens to everyone.", "Santai aja, semua orang pernah begitu."],
    ["beneran? / serius?", "for real", "for REEL", "Fillers & reactions", "expression", "Wait, for real? That's amazing!", "Tunggu, beneran? Keren banget!"],

    ["gampang banget", "a piece of cake", "uh PEES uv KAYK", "Idioms", "idiom", "The exam was a piece of cake.", "Ujiannya gampang banget."],
    ["pergi tidur", "hit the sack", "hit thuh SAK", "Idioms", "idiom", "I'm tired, so I'll hit the sack.", "Aku capek, jadi mau tidur dulu."],
    ["kurang enak badan", "under the weather", "UN-der thuh WETH-er", "Idioms", "idiom", "I'm feeling a bit under the weather.", "Aku lagi agak kurang enak badan."],
    ["mahal banget", "cost an arm and a leg", "kost an ARM and uh LEG", "Idioms", "idiom", "That phone cost an arm and a leg.", "Ponsel itu harganya mahal banget."],

    ["akan (santai: going to)", "gonna", "GUH-nuh", "Casual shortcuts", "verb", "I'm gonna grab some food.", "Aku mau beli makanan dulu.", { note: "Speech and texting only — write \"going to\" in formal writing." }],
    ["mau (santai: want to)", "wanna", "WAH-nuh", "Casual shortcuts", "verb", "Do you wanna watch a movie?", "Kamu mau nonton film?", { note: "Speech and texting only — write \"want to\" in formal writing." }],
    ["agak (santai: kind of)", "kinda", "KYN-duh", "Casual shortcuts", "adverb", "I'm kinda tired right now.", "Aku agak capek sekarang."],
    ["harus (santai: have got to)", "gotta", "GAH-tuh", "Casual shortcuts", "verb", "Sorry, I gotta go now.", "Maaf, aku harus pergi sekarang."],
  ],
};

export const EN_GOALS = goalSet("en-pro", ROWS);
