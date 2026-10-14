import { BasicRow, basicsCards, basicsDeck } from "./builder";

/* English basics are translated into Bahasa Indonesia. */
const ROWS: BasicRow[] = [
  ["halo", "hello", "heh-LOH", "Greetings", "interjection", "Hello, nice to meet you.", "Halo, senang bertemu denganmu."],
  ["selamat tinggal", "goodbye", "good-BYE", "Greetings", "interjection", "Goodbye, see you tomorrow!", "Sampai jumpa, sampai besok!"],
  ["tolong / silakan", "please", "PLEEZ", "Greetings", "expression", "Could you help me, please?", "Bisakah kamu tolong membantu saya?"],
  ["terima kasih", "thank you", "THANK yoo (th = tongue between teeth)", "Greetings", "expression", "Thank you so much for your help.", "Terima kasih banyak atas bantuanmu."],
  ["ya", "yes", "YES", "Greetings", "interjection", "Yes, of course!", "Ya, tentu saja!"],
  ["tidak", "no", "NOH", "Greetings", "interjection", "No, thank you.", "Tidak, terima kasih."],
  ["permisi / maaf", "excuse me", "ik-SKYOOZ mee", "Greetings", "expression", "Excuse me, where is the station?", "Permisi, di mana stasiunnya?"],
  ["selamat pagi", "good morning", "good MOR-ning", "Greetings", "expression", "Good morning, everyone!", "Selamat pagi, semuanya!"],
  ["selamat malam (tidur)", "good night", "good NITE", "Greetings", "expression", "Good night, sleep well!", "Selamat malam, tidur yang nyenyak!"],
  ["apa kabar?", "how are you?", "how AR yoo", "Greetings", "expression", "Hi Anna, how are you?", "Hai Anna, apa kabar?"],
  ["nama saya…", "my name is…", "my NAYM iz", "Greetings", "expression", "My name is Hana. What's yours?", "Nama saya Hana. Siapa namamu?"],

  ["satu", "one", "WUN", "Numbers", "adjective", "Just one, please.", "Satu saja, tolong."],
  ["dua", "two", "TOO", "Numbers", "adjective", "Two coffees, please.", "Dua kopi, tolong."],
  ["tiga", "three", "THREE (th = tongue between teeth)", "Numbers", "adjective", "It's three o'clock.", "Sekarang jam tiga."],
  ["empat", "four", "FOR", "Numbers", "adjective", "There are four of us.", "Kami berempat."],
  ["lima", "five", "FIVE", "Numbers", "adjective", "I'll be there in five minutes.", "Saya sampai dalam lima menit."],
  ["enam", "six", "SIKS", "Numbers", "adjective", "The shop closes at six.", "Tokonya tutup jam enam."],
  ["tujuh", "seven", "SEV-en", "Numbers", "adjective", "There are seven days in a week.", "Ada tujuh hari dalam seminggu."],
  ["delapan", "eight", "AYT", "Numbers", "adjective", "I get up at eight.", "Saya bangun jam delapan."],
  ["sembilan", "nine", "NINE", "Numbers", "adjective", "My son is nine years old.", "Anak laki-laki saya berumur sembilan tahun."],
  ["sepuluh", "ten", "TEN", "Numbers", "adjective", "It costs ten dollars.", "Harganya sepuluh dolar."],

  ["merah", "red", "RED", "Colors", "adjective", "I love this red dress.", "Saya suka gaun merah ini."],
  ["biru", "blue", "BLOO", "Colors", "adjective", "The sky is blue today.", "Langit biru hari ini."],
  ["hijau", "green", "GREEN", "Colors", "adjective", "I'd like a green tea.", "Saya mau teh hijau."],
  ["kuning", "yellow", "YEL-oh", "Colors", "adjective", "The banana is yellow.", "Pisangnya kuning."],
  ["hitam", "black", "BLAK", "Colors", "adjective", "I have a black cat.", "Saya punya kucing hitam."],
  ["putih", "white", "WITE", "Colors", "adjective", "The snow is white.", "Saljunya putih."],

  ["ibu", "mother", "MUH-ther", "Family", "noun", "My mother is a teacher.", "Ibu saya seorang guru."],
  ["ayah", "father", "FAH-ther", "Family", "noun", "My father works in Jakarta.", "Ayah saya bekerja di Jakarta."],
  ["saudara laki-laki", "brother", "BRUH-ther", "Family", "noun", "My brother's name is Adi.", "Nama saudara laki-laki saya Adi."],
  ["saudara perempuan", "sister", "SIS-ter", "Family", "noun", "My sister lives in Bandung.", "Saudara perempuan saya tinggal di Bandung."],
  ["teman", "friend", "FREND", "Family", "noun", "This is my friend Karim.", "Ini teman saya, Karim."],

  ["air", "water", "WAW-ter", "Food & Drink", "noun", "A bottle of water, please.", "Satu botol air, tolong."],
  ["roti", "bread", "BRED", "Food & Drink", "noun", "I buy bread every morning.", "Saya membeli roti setiap pagi."],
  ["kopi", "coffee", "KAW-fee", "Food & Drink", "noun", "Shall we grab a coffee?", "Mau ngopi bareng?"],
  ["teh", "tea", "TEE", "Food & Drink", "noun", "Would you like some tea?", "Mau teh?"],
  ["enak / lezat", "delicious", "dih-LISH-us", "Food & Drink", "adjective", "This cake is delicious!", "Kue ini enak sekali!"],

  ["hari ini", "today", "tuh-DAY", "Time", "adverb", "The weather is nice today.", "Cuacanya bagus hari ini."],
  ["besok", "tomorrow", "tuh-MOR-oh", "Time", "adverb", "See you tomorrow!", "Sampai jumpa besok!"],
  ["kemarin", "yesterday", "YES-ter-day", "Time", "adverb", "Yesterday I watched a film.", "Kemarin saya menonton film."],

  ["makan", "to eat", "too EET", "Verbs", "verb", "We eat at noon.", "Kami makan siang jam dua belas."],
  ["minum", "to drink", "too DRINK", "Verbs", "verb", "I drink a lot of water.", "Saya minum banyak air."],
  ["pergi", "to go", "too GOH", "Verbs", "verb", "I'm going to the market.", "Saya pergi ke pasar."],
  ["berbicara", "to speak", "too SPEEK", "Verbs", "verb", "Do you speak Indonesian?", "Apakah kamu bisa berbahasa Indonesia?"],
  ["mau / ingin", "to want", "too WONT", "Verbs", "verb", "I want to learn English.", "Saya ingin belajar bahasa Inggris."],

  ["saya tidak mengerti", "I don't understand", "eye DOHNT un-der-STAND", "Survival", "expression", "Sorry, I don't understand.", "Maaf, saya tidak mengerti."],
  ["di mana…?", "where is…?", "WAIR iz", "Survival", "expression", "Where is the station?", "Di mana stasiunnya?"],
  ["berapa harganya?", "how much is it?", "how MUCH iz it", "Survival", "expression", "How much is this bag?", "Berapa harga tas ini?"],
];

export const EN_BASICS_DECK = basicsDeck("en-pro", "Your first 48 English words with Bahasa Indonesia translations — greetings, numbers, colours, family, food and survival phrases.");
export const EN_BASICS = basicsCards("en-pro", ROWS);
