/* ============================================================
   PolyVault — Account: identity, public profile, rank and
   native-speaker verification.

   Everything lives locally for now; the shape is designed so it
   can be synced to a backend unchanged once community features
   ("Learn with Native", culture/language exchange) launch.
   ============================================================ */
"use client";

import { db } from "@/lib/db";
import { CEFR, LANGUAGES, LanguageId, DAY_MS } from "@/lib/types";
import { levelFromXp } from "@/lib/stats";

/* ------------------------------------------------------------
   World languages (native + learning, beyond the 5 study vaults)
   ------------------------------------------------------------ */
export interface WorldLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  /** BCP-47 tag for speech recognition */
  speechTag: string;
  /** base language — shares reading prompts across regional variants */
  base: string;
  rtl?: boolean;
}

export const WORLD_LANGUAGES: WorldLanguage[] = [
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", speechTag: "id-ID", base: "id" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", speechTag: "ms-MY", base: "ms" },
  { code: "en-US", name: "English (US)", nativeName: "English", flag: "🇺🇸", speechTag: "en-US", base: "en" },
  { code: "en-GB", name: "English (UK)", nativeName: "English", flag: "🇬🇧", speechTag: "en-GB", base: "en" },
  { code: "en-AU", name: "English (Australia)", nativeName: "English", flag: "🇦🇺", speechTag: "en-AU", base: "en" },
  { code: "fr-FR", name: "French (France)", nativeName: "Français", flag: "🇫🇷", speechTag: "fr-FR", base: "fr" },
  { code: "fr-CA", name: "French (Canada)", nativeName: "Français", flag: "🇨🇦", speechTag: "fr-CA", base: "fr" },
  { code: "es-ES", name: "Spanish (Spain)", nativeName: "Español", flag: "🇪🇸", speechTag: "es-ES", base: "es" },
  { code: "es-MX", name: "Spanish (Mexico)", nativeName: "Español", flag: "🇲🇽", speechTag: "es-MX", base: "es" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português", flag: "🇧🇷", speechTag: "pt-BR", base: "pt" },
  { code: "pt-PT", name: "Portuguese (Portugal)", nativeName: "Português", flag: "🇵🇹", speechTag: "pt-PT", base: "pt" },
  { code: "ar", name: "Arabic (MSA)", nativeName: "العربية", flag: "🇸🇦", speechTag: "ar-SA", base: "ar", rtl: true },
  { code: "ar-EG", name: "Arabic (Egypt)", nativeName: "العربية", flag: "🇪🇬", speechTag: "ar-EG", base: "ar", rtl: true },
  { code: "ary", name: "Moroccan Darija", nativeName: "الدارجة", flag: "🇲🇦", speechTag: "ar-MA", base: "ary", rtl: true },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", speechTag: "de-DE", base: "de" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", speechTag: "it-IT", base: "it" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", speechTag: "nl-NL", base: "nl" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", speechTag: "tr-TR", base: "tr" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", speechTag: "ru-RU", base: "ru" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", speechTag: "ja-JP", base: "ja" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", speechTag: "ko-KR", base: "ko" },
  { code: "zh", name: "Mandarin Chinese", nativeName: "中文", flag: "🇨🇳", speechTag: "zh-CN", base: "zh" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", speechTag: "hi-IN", base: "hi" },
];

export const worldLanguage = (code: string): WorldLanguage =>
  WORLD_LANGUAGES.find((l) => l.code === code) ?? WORLD_LANGUAGES[0];

/** Maps PolyVault's study vaults onto world languages */
export const VAULT_TO_WORLD: Record<LanguageId, string> = {
  fr: "fr-FR", es: "es-ES", pt: "pt-BR", de: "de", it: "it", ru: "ru", darija: "ary", "en-pro": "en-US",
};

/* ------------------------------------------------------------
   Reading prompts for native verification.
   Shown only once recording starts, so they can't be rehearsed.
   No digits (recognizers spell them inconsistently).
   ------------------------------------------------------------ */
export const VERIFY_PROMPTS: Record<string, string[]> = {
  id: [
    "Kemarin sore saya pergi ke pasar bersama ibu untuk membeli sayuran segar.",
    "Kalau besok tidak hujan, kita bisa jalan-jalan ke pantai setelah makan siang.",
    "Adik saya baru saja pindah kerja ke Surabaya dan katanya kantornya sangat nyaman.",
    "Tolong matikan lampunya sebelum tidur, ya, supaya tagihan listrik tidak membengkak.",
    "Saya lebih suka minum teh hangat daripada kopi kalau pagi hari.",
  ],
  ms: [
    "Semalam saya pergi ke pasar malam bersama kawan-kawan untuk makan satay.",
    "Kalau esok tidak hujan, kita boleh pergi bersiar-siar di tepi pantai.",
    "Abang saya baru sahaja mendapat kerja baharu di Kuala Lumpur bulan lepas.",
    "Tolong tutup tingkap itu sebelum keluar kerana cuaca agak berangin hari ini.",
    "Saya lebih suka minum teh tarik daripada kopi pada waktu pagi.",
  ],
  en: [
    "I usually grab a coffee on my way to work, but today I was running late.",
    "If the weather stays nice this weekend, we should go for a long walk by the river.",
    "My neighbour has been learning to play the guitar, and honestly he's getting pretty good.",
    "Could you remind me to call my sister tonight? I keep forgetting.",
    "The restaurant around the corner closed down, which is a shame because the food was amazing.",
  ],
  fr: [
    "Ce matin, j'ai raté mon bus, donc je suis arrivé au travail avec un peu de retard.",
    "S'il fait beau ce week-end, on pourrait aller pique-niquer au bord du lac.",
    "Ma voisine apprend le piano depuis quelques mois et elle se débrouille plutôt bien.",
    "Tu peux me rappeler d'appeler ma mère ce soir ? J'oublie tout le temps.",
    "Le petit restaurant du coin a fermé, c'est dommage parce qu'on y mangeait vraiment bien.",
  ],
  es: [
    "Esta mañana perdí el autobús, así que llegué al trabajo un poco tarde.",
    "Si hace buen tiempo este fin de semana, podríamos ir a la playa con los niños.",
    "Mi vecino está aprendiendo a tocar la guitarra y la verdad es que lo hace bastante bien.",
    "¿Me puedes recordar que llame a mi hermana esta noche? Siempre se me olvida.",
    "Cerraron el restaurante de la esquina, qué pena, porque la comida era buenísima.",
  ],
  pt: [
    "Hoje de manhã perdi o ônibus, então cheguei ao trabalho um pouco atrasado.",
    "Se o tempo estiver bom no fim de semana, podemos ir à praia com a família.",
    "O meu vizinho está aprendendo a tocar violão e, sinceramente, já toca muito bem.",
    "Você pode me lembrar de ligar para a minha irmã hoje à noite? Eu sempre esqueço.",
    "O restaurante da esquina fechou, que pena, porque a comida era maravilhosa.",
  ],
  ar: [
    "ذهبت صباح اليوم إلى المكتبة لأستعير كتابا عن تاريخ المدينة القديمة.",
    "إذا كان الطقس جميلا في نهاية الأسبوع فسنذهب في رحلة إلى البحر.",
    "يتعلم أخي الصغير العزف على العود وقد أصبح ماهرا جدا.",
    "هل يمكنك أن تذكرني بالاتصال بأمي هذا المساء لأنني أنسى دائما.",
    "أغلق المطعم الصغير في آخر الشارع وهذا مؤسف لأن طعامه كان لذيذا.",
  ],
  ary: [
    "كنمشي للخدمة كل نهار فالطوبيس ديال الصباح.",
    "واش بغيتي تشرب شي أتاي ولا شي قهوة؟",
    "البارح مشيت للسوق وشريت الخضرة والفواكه.",
    "خويا كيخدم فكازا ولكن ساكن فالرباط.",
    "هاد الماكلة بنينة بزاف، شكون اللي طيبها؟",
  ],
  de: [
    "Heute Morgen habe ich den Bus verpasst und bin deshalb etwas zu spät zur Arbeit gekommen.",
    "Wenn das Wetter am Wochenende schön bleibt, könnten wir am See picknicken.",
    "Mein Nachbar lernt seit ein paar Monaten Gitarre und spielt inzwischen richtig gut.",
    "Kannst du mich heute Abend daran erinnern, meine Schwester anzurufen?",
    "Das kleine Restaurant an der Ecke hat zugemacht, schade, das Essen war wirklich lecker.",
  ],
  it: [
    "Stamattina ho perso l'autobus e sono arrivato al lavoro un po' in ritardo.",
    "Se il tempo resta bello nel fine settimana, potremmo fare un picnic al lago.",
    "Il mio vicino sta imparando a suonare la chitarra e ormai è piuttosto bravo.",
    "Mi ricordi di chiamare mia sorella stasera? Me ne dimentico sempre.",
    "Il ristorantino all'angolo ha chiuso, peccato, perché si mangiava benissimo.",
  ],
  nl: [
    "Vanochtend heb ik de bus gemist, dus ik kwam iets te laat op mijn werk.",
    "Als het weer dit weekend mooi blijft, kunnen we bij het meer gaan picknicken.",
    "Mijn buurman leert sinds een paar maanden gitaar spelen en hij is al best goed.",
    "Kun je me eraan herinneren dat ik vanavond mijn zus moet bellen?",
    "Het restaurantje op de hoek is dicht, jammer, want het eten was echt lekker.",
  ],
  tr: [
    "Bu sabah otobüsü kaçırdım, bu yüzden işe biraz geç kaldım.",
    "Hafta sonu hava güzel olursa göl kenarında piknik yapabiliriz.",
    "Komşum birkaç aydır gitar çalmayı öğreniyor ve artık gerçekten iyi çalıyor.",
    "Bu akşam kız kardeşimi aramamı bana hatırlatır mısın? Hep unutuyorum.",
    "Köşedeki küçük lokanta kapanmış, çok yazık, yemekleri harikaydı.",
  ],
  ru: [
    "Сегодня утром я опоздал на автобус, поэтому пришёл на работу немного позже.",
    "Если в выходные будет хорошая погода, мы можем устроить пикник у озера.",
    "Мой сосед уже несколько месяцев учится играть на гитаре и у него неплохо получается.",
    "Напомни мне, пожалуйста, позвонить сестре сегодня вечером, я всё время забываю.",
    "Маленький ресторан на углу закрылся, очень жаль, там было вкусно.",
  ],
  ja: [
    "今朝はバスに乗り遅れてしまったので、会社に少し遅れて着きました。",
    "週末に天気が良かったら、湖のそばでピクニックをしましょう。",
    "隣の人は最近ギターを習っていて、もうかなり上手になりました。",
    "今晩、姉に電話するのを思い出させてくれませんか。いつも忘れてしまうんです。",
    "角の小さなレストランが閉店してしまって、本当に残念です。",
  ],
  ko: [
    "오늘 아침에 버스를 놓쳐서 회사에 조금 늦게 도착했어요.",
    "주말에 날씨가 좋으면 호숫가에서 피크닉을 하는 게 어때요?",
    "옆집 사람은 요즘 기타를 배우고 있는데 실력이 꽤 늘었어요.",
    "오늘 저녁에 언니한테 전화하라고 좀 알려 줄래요? 자꾸 잊어버려요.",
    "모퉁이에 있던 작은 식당이 문을 닫아서 정말 아쉬워요.",
  ],
  zh: [
    "今天早上我没赶上公交车，所以上班迟到了一会儿。",
    "如果周末天气好的话，我们可以去湖边野餐。",
    "我的邻居最近在学弹吉他，现在已经弹得挺不错了。",
    "你今晚能提醒我给姐姐打个电话吗？我老是忘记。",
    "街角那家小饭馆关门了，真可惜，那里的菜特别好吃。",
  ],
  hi: [
    "आज सुबह मेरी बस छूट गई, इसलिए मैं ऑफिस थोड़ा देर से पहुँचा।",
    "अगर इस हफ़्ते के आख़िर में मौसम अच्छा रहा तो हम झील के किनारे पिकनिक करेंगे।",
    "मेरा पड़ोसी कुछ महीनों से गिटार बजाना सीख रहा है और अब काफ़ी अच्छा बजाता है।",
    "क्या तुम मुझे आज शाम दीदी को फ़ोन करने की याद दिला सकते हो?",
    "कोने वाला छोटा रेस्टोरेंट बंद हो गया, बड़े अफ़सोस की बात है।",
  ],
};

/**
 * Typical native read-aloud pace in normalized characters per second.
 * Learners reading unfamiliar text land well below this.
 */
const NATIVE_PACE: Record<string, number> = {
  ja: 6, zh: 4.5, ko: 5, ar: 9, ary: 9, hi: 9,
};
export const nativePaceFor = (base: string) => NATIVE_PACE[base] ?? 12;

/** Speech recognizers handle some dialects less reliably — relax the accuracy bar. */
const PASS_ACCURACY: Record<string, number> = { ary: 65, ja: 75, hi: 75 };
export const passAccuracyFor = (base: string) => PASS_ACCURACY[base] ?? 80;

export const VERIFY_PROMPT_COUNT = 3;
/** Escalating cooldown after each failed attempt */
const COOLDOWNS_MS = [1 * DAY_MS, 3 * DAY_MS, 7 * DAY_MS];
export const cooldownAfter = (failedAttempts: number) =>
  COOLDOWNS_MS[Math.min(failedAttempts, COOLDOWNS_MS.length) - 1] ?? COOLDOWNS_MS[0];

export function pickPrompts(base: string, n = VERIFY_PROMPT_COUNT): string[] {
  const pool = [...(VERIFY_PROMPTS[base] ?? [])];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/* ------------------------------------------------------------
   Account model
   ------------------------------------------------------------ */
export type VerificationStatus = "unverified" | "verified" | "failed";

export interface NativeVerification {
  status: VerificationStatus;
  attempts: number;
  failedAttempts: number;
  lastAttemptAt?: number;
  cooldownUntil?: number;
  verifiedAt?: number;
  /** 0–100 overall score of the latest attempt */
  score?: number;
  /** camera stills captured during the attempt (JPEG data URLs) — kept for future human review */
  evidence?: string[];
}

export interface NativeLanguage {
  code: string;
  verification: NativeVerification;
}

export interface LearningLanguage {
  code: string;
  level: CEFR;
}

export type MeetingFormat = "text" | "voice" | "video" | "in-person";

export interface AccountPrivacy {
  showAge: boolean;
  showLocation: boolean;
  showStats: boolean;
  showAchievements: boolean;
  showLocalTime: boolean;
}

export interface UserAccount {
  id: "me";
  displayName: string;
  username: string;
  avatar?: string; // data URL
  bannerId: number;
  pronouns: string;
  bio: string;
  birthDate: string; // YYYY-MM-DD or ""
  countryFrom: string; // ISO alpha-2 or ""
  countryLiving: string;
  city: string;
  timezone: string;
  occupation: string;
  interests: string[];
  goals: string;

  nativeLanguages: NativeLanguage[];
  learningLanguages: LearningLanguage[];

  openToExchange: boolean;
  meetingFormats: MeetingFormat[];
  /** wants to offer paid lessons once "Learn with Native" launches (verified natives only) */
  interestedInTeaching: boolean;

  privacy: AccountPrivacy;
  /** Connect safety: accepted rules, strikes and bans */
  safety?: AccountSafety;
  createdAt: number;
  updatedAt: number;
}

export interface SafetyStrike {
  at: number;
  category: "sexual" | "off-platform";
  /** first characters of the blocked message, kept for review */
  excerpt: string;
}

export interface AccountSafety {
  rulesAcceptedAt?: number;
  strikes: SafetyStrike[];
  bannedAt?: number;
  banReason?: string;
}

export const BANNERS = [
  "linear-gradient(135deg, #ff6b4a 0%, #ffc83d 100%)",
  "linear-gradient(135deg, #2ec4a5 0%, #3da5ff 100%)",
  "linear-gradient(135deg, #ff5fa2 0%, #ff9a5a 100%)",
  "linear-gradient(135deg, #3da5ff 0%, #8fd3ff 100%)",
  "linear-gradient(135deg, #ffc83d 0%, #2ec4a5 100%)",
  "linear-gradient(135deg, #0f1e2e 0%, #27415c 100%)",
];

export const INTEREST_SUGGESTIONS = [
  "Travel", "Food", "Music", "Films", "Books", "Football", "Business", "Tech",
  "Art", "History", "Photography", "Fashion", "Gaming", "Fitness", "Culture", "Religion",
];

export function newVerification(): NativeVerification {
  return { status: "unverified", attempts: 0, failedAttempts: 0 };
}

export function defaultAccount(): UserAccount {
  const now = Date.now();
  return {
    id: "me",
    displayName: "",
    username: "",
    bannerId: 0,
    pronouns: "",
    bio: "",
    birthDate: "",
    countryFrom: "",
    countryLiving: "",
    city: "",
    timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
    occupation: "",
    interests: [],
    goals: "",
    nativeLanguages: [],
    learningLanguages: LANGUAGES.map((l) => ({ code: VAULT_TO_WORLD[l.id], level: "A1" as CEFR })),
    openToExchange: true,
    meetingFormats: ["text", "video"],
    interestedInTeaching: false,
    privacy: { showAge: false, showLocation: true, showStats: true, showAchievements: true, showLocalTime: true },
    createdAt: now,
    updatedAt: now,
  };
}

export async function getAccount(): Promise<UserAccount> {
  return (await db.account.get("me")) ?? defaultAccount();
}

export async function saveAccount(patch: Partial<UserAccount>): Promise<UserAccount> {
  const cur = await getAccount();
  const next: UserAccount = { ...cur, ...patch, id: "me", updatedAt: Date.now() };
  await db.account.put(next);
  return next;
}

async function updateVerification(code: string, fn: (v: NativeVerification) => NativeVerification): Promise<NativeVerification> {
  const acc = await getAccount();
  let result = newVerification();
  const nativeLanguages = acc.nativeLanguages.map((n) => {
    if (n.code !== code) return n;
    result = fn(n.verification);
    return { ...n, verification: result };
  });
  await saveAccount({ nativeLanguages });
  return result;
}

/**
 * Called when the first sentence is revealed. The attempt is pre-recorded
 * as a fail so abandoning a bad attempt midway can't dodge the cooldown.
 */
export function startVerificationAttempt(code: string): Promise<NativeVerification> {
  const now = Date.now();
  return updateVerification(code, (v) => {
    const failedAttempts = v.failedAttempts + 1;
    return {
      ...v, attempts: v.attempts + 1, failedAttempts, lastAttemptAt: now,
      status: v.status === "verified" ? "verified" : "failed",
      score: 0,
      cooldownUntil: now + cooldownAfter(failedAttempts),
    };
  });
}

/** Undo a started attempt that failed for technical reasons (mic blocked, unsupported). */
export function restoreVerification(code: string, previous: NativeVerification): Promise<NativeVerification> {
  return updateVerification(code, () => previous);
}

export function completeVerificationAttempt(
  code: string, passed: boolean, score: number, evidence: string[],
): Promise<NativeVerification> {
  const now = Date.now();
  return updateVerification(code, (v) => passed
    ? { ...v, status: "verified", score, evidence, verifiedAt: now, cooldownUntil: undefined, failedAttempts: Math.max(0, v.failedAttempts - 1) }
    : { ...v, status: "failed", score, evidence });
}

/* ------------------------------------------------------------
   Validation + presentation helpers
   ------------------------------------------------------------ */
export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

export function ageFrom(birthDate: string): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}

export function flagOf(iso: string): string {
  if (!/^[A-Z]{2}$/.test(iso)) return "🏳️";
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const ISO_CODES =
  "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW";

export function countryList(): { code: string; name: string; flag: string }[] {
  const names = typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;
  return ISO_CODES.split(" ")
    .map((code) => ({ code, name: names?.of(code) ?? code, flag: flagOf(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function countryName(code: string): string {
  if (!code) return "";
  try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code; } catch { return code; }
}

export function localTimeIn(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date());
  } catch { return ""; }
}

/** Shrinks an uploaded image to a square JPEG data URL. */
export function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that image.")); };
    img.src = url;
  });
}

/* ------------------------------------------------------------
   Rank — overall tier from XP, plus a per-vault level estimate
   ------------------------------------------------------------ */
export interface RankTier { name: string; emoji: string; minLevel: number; color: string }

export const RANK_TIERS: RankTier[] = [
  { name: "Seedling", emoji: "🌱", minLevel: 1, color: "#10b981" },
  { name: "Explorer", emoji: "🧭", minLevel: 5, color: "#0ea5e9" },
  { name: "Voyager", emoji: "⛵", minLevel: 10, color: "#6366f1" },
  { name: "Linguist", emoji: "📜", minLevel: 15, color: "#a855f7" },
  { name: "Polyglot", emoji: "🌍", minLevel: 20, color: "#f59e0b" },
  { name: "Legend", emoji: "👑", minLevel: 30, color: "#ef4444" },
];

export interface Rank {
  tier: RankTier;
  next?: RankTier;
  level: number;
  xp: number;
  inLevel: number;
  forNext: number;
}

export function rankFromXp(xp: number): Rank {
  const { level, inLevel, forNext } = levelFromXp(xp);
  let idx = 0;
  RANK_TIERS.forEach((t, i) => { if (level >= t.minLevel) idx = i; });
  return { tier: RANK_TIERS[idx], next: RANK_TIERS[idx + 1], level, xp, inLevel, forNext };
}

/** Rough CEFR estimate from the number of cards held in long-term memory. */
export function estimateCefr(learned: number): CEFR {
  if (learned >= 1500) return "C2";
  if (learned >= 1000) return "C1";
  if (learned >= 600) return "B2";
  if (learned >= 300) return "B1";
  if (learned >= 100) return "A2";
  return "A1";
}

export interface VaultSummary {
  languageId: LanguageId;
  learned: number;
  mastered: number;
  total: number;
  reviews: number;
  estimate: CEFR;
}

export async function vaultSummaries(): Promise<VaultSummary[]> {
  const [cards, reviews] = await Promise.all([db.cards.toArray(), db.reviews.toArray()]);
  return LANGUAGES.map((l) => {
    const mine = cards.filter((c) => c.languageId === l.id);
    const learned = mine.filter((c) => c.srs.stage === "review" || c.srs.stage === "mastered").length;
    return {
      languageId: l.id,
      learned,
      mastered: mine.filter((c) => c.srs.stage === "mastered").length,
      total: mine.length,
      reviews: reviews.filter((r) => r.languageId === l.id).length,
      estimate: estimateCefr(learned),
    };
  });
}

/** Days with at least one review, counted back from today (yesterday grace). */
export async function globalStreak(): Promise<number> {
  const days = new Set((await db.reviews.toArray()).map((r) => r.day));
  const d = new Date();
  const key = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  if (!days.has(key(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(key(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export function profileCompleteness(a: UserAccount): number {
  const checks = [
    a.displayName, a.username, a.avatar, a.bio, a.countryFrom, a.countryLiving,
    a.nativeLanguages.length > 0, a.learningLanguages.length > 0, a.interests.length > 0, a.goals,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function formatWait(ms: number): string {
  const h = Math.ceil(ms / 3_600_000);
  if (h < 24) return `in ${h}h`;
  return `in ${Math.ceil(h / 24)} days`;
}
