/* ============================================================
   Message moderation for Connect (text chat, call/video chat).

   Two hard rules, both bannable:
   1. No sexual content.
   2. Stay on PolyVault — no moving to other apps, no sharing
      handles, phone numbers, emails or links.

   Pure functions (no browser APIs) so the same checks can run
   on the client before sending and on the server when messages
   are relayed between real users.
   ============================================================ */

export type ViolationCategory = "sexual" | "off-platform";

export interface ModerationResult {
  ok: boolean;
  category?: ViolationCategory;
  /** short human explanation of what was detected */
  reason?: string;
}

/** lowercase, strip accents, undo common letter-for-digit swaps */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[0]/g, "o").replace(/[1!|]/g, "i").replace(/[3]/g, "e")
    .replace(/[4]/g, "a").replace(/[5$]/g, "s").replace(/[7]/g, "t");
}

/** "w h a t s a p p", "w.h.a.t.s" → joined, so spaced-out spellings are caught */
function joinSpacedLetters(text: string): string {
  return text.replace(/\b(?:[a-z][\s._\-*]+){2,}[a-z]\b/g, (m) => m.replace(/[\s._\-*]+/g, ""));
}

const word = (list: string[]) => new RegExp(`(?:^|[^a-z])(?:${list.join("|")})(?:$|[^a-z])`, "i");

/* ---------------- 1 · sexual content ---------------- */
const SEXUAL_WORDS = word([
  // English
  "sex", "sexy", "sexting", "sext", "nudes?", "naked", "horny", "porn\\w*", "nsfw", "xxx", "boobs?", "tits?",
  "dick", "cock", "pussy", "blowjob", "handjob", "cum", "orgasm", "masturbat\\w*", "onlyfans", "hook ?up",
  "make love", "send (?:me )?(?:hot |naughty |private )?(?:pics?|pictures?|photos?)", "fetish", "kinky", "erotic",
  "strip ?(?:for me|tease)", "i8\\+",
  // Indonesian / Malay
  "seks", "bugil", "telanjang", "ngentot", "entot", "sange", "bokep", "vcs", "pap (?:tt|toket|body|bugil)", "toket",
  "memek", "kontol", "colmek", "coli", "ml yuk",
  // Spanish / French / Italian / German
  "sexo", "desnud[oa]s?", "follar", "sexe", "toute? nue?", "baise", "nackt", "ficken", "scopare",
]);

/* ---------------- 2 · leaving the platform ---------------- */
// distinctive app names, also checked with every separator removed ("whats-app", "t e l e g r a m")
const APP_NAMES = [
  "whatsapp", "watsapp", "whatsap", "telegram", "snapchat", "instagram", "facebook", "messenger", "onlyfans",
  "discord", "tiktok", "wechat", "kakaotalk", "skype", "viber", "signalapp", "tinder", "bumble", "hinge",
];
const SHORT_APP_HINTS = word([
  // short names only count when someone is clearly pointing at an account there
  "(?:my|add me on|follow me on|dm me on|text me on|message me on|find me on|call me on) (?:ig|insta|snap|sc|fb|tg|wa|x|twitter|line|kik|zoom|gmail|email|e-mail)",
  "(?:on|di|ke|pake|pakai|via|lewat|sur|por) (?:ig|insta|snap|snapchat|fb|tg|wa|zoom|gmail)",
  "(?:ig|insta|snap|sc|fb|tg|wa|twitter|line|kik)(?: ?(?:id|me|account|akun|username|handle))",
  "wa\\.me", "t\\.me", "x\\.com", "twitter\\.com", "fb\\.com", "ig\\.me", "snapchat\\.com",
  "google meet", "zoom (?:link|call|id)",
]);
const CONTACT_PHRASES = word([
  "add me", "dm me", "text me", "call me on", "hit me up on", "my (?:number|phone|handle|username|insta|snap|email|contact)",
  "what(?:'s| is) your (?:number|insta|snap|ig|whatsapp|email)", "give me your (?:number|contact|insta|snap|email)",
  "outside (?:this |the )?app", "off (?:this |the )?app", "(?:another|other|different) app",
  // Indonesian / Malay
  "nomor (?:wa|hp|kamu|mu|aku|saya)", "minta (?:nomor|kontak|wa|ig)", "no (?:wa|hp)", "kontak (?:aku|saya|kamu)",
  "hubungi (?:aku|saya) di", "follow (?:ig|insta)", "aplikasi lain",
  // Spanish / French / German / Italian
  "mi numero", "tu numero", "agregame", "mon numero", "ton numero", "ajoute[- ]moi", "meine nummer", "deine nummer",
  "il mio numero", "il tuo numero",
]);
const LINK = /(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|me|co|id|app|link|ly|gg)\b/i;
const EMAIL = /[a-z0-9._%+-]+\s*(?:@|\(at\)|\[at\]| at )\s*[a-z0-9.-]+\s*(?:\.|\(dot\)| dot )\s*[a-z]{2,}/i;
const HANDLE = /(?:^|\s)@[a-z0-9_.]{2,}/i;
// 9+ digits, allowing spaces/dashes/dots/brackets between them ("+62 812-3456-789"); two years in a row stay below it
const PHONE = /(?:\+?\d[\s().-]{0,3}){9,}/;
// numbers written as words in a row ("eight one two three four five six seven")
const SPELLED_DIGITS = /(?:\b(?:zero|one|two|three|four|five|six|seven|eight|nine|nol|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|kosong)\b[\s,.-]*){6,}/i;

export function moderateMessage(raw: string): ModerationResult {
  const text = raw.trim();
  if (!text) return { ok: true };

  const n = joinSpacedLetters(normalize(text));
  const squashed = n.replace(/[^a-z]/g, "");

  if (SEXUAL_WORDS.test(n)) {
    return { ok: false, category: "sexual", reason: "Sexual content isn't allowed on PolyVault." };
  }
  if (APP_NAMES.some((a) => squashed.includes(a)) || SHORT_APP_HINTS.test(n)) {
    return { ok: false, category: "off-platform", reason: "Moving the conversation to another app isn't allowed." };
  }
  if (CONTACT_PHRASES.test(n)) {
    return { ok: false, category: "off-platform", reason: "Asking for or sharing contact details isn't allowed." };
  }
  if (HANDLE.test(text)) {
    return { ok: false, category: "off-platform", reason: "Sharing @usernames or social handles isn't allowed." };
  }
  if (EMAIL.test(text) || LINK.test(text)) {
    return { ok: false, category: "off-platform", reason: "Sharing emails or links isn't allowed." };
  }
  if (PHONE.test(text) || SPELLED_DIGITS.test(n)) {
    return { ok: false, category: "off-platform", reason: "Sharing phone numbers isn't allowed." };
  }
  return { ok: true };
}

/* ---------------- policy ---------------- */
/** Sexual content bans at once; off-platform attempts get two warnings, then a ban. */
export const OFF_PLATFORM_STRIKES_BEFORE_BAN = 3;

export const COMMUNITY_RULES: { emoji: string; title: string; body: string }[] = [
  { emoji: "🚫", title: "No sexual content", body: "No sexual messages, requests, jokes, photos or behaviour on text, voice or video. Zero tolerance — your account is banned immediately." },
  { emoji: "🔒", title: "Stay on PolyVault", body: "Don't move the conversation to WhatsApp, Instagram, Snapchat, X/Twitter, Facebook, Telegram, TikTok, Discord or any other app, and don't share @usernames, phone numbers, emails or links." },
  { emoji: "🤝", title: "Be respectful", body: "No harassment, hate speech, threats or pressure. Language exchange is about curiosity and kindness." },
  { emoji: "🧒", title: "Adults only for calls", body: "Voice and video calls are for users 18+." },
  { emoji: "🚩", title: "Report anything wrong", body: "Use the report button. Reports are reviewed, and conversations may be checked automatically to keep everyone safe." },
];
