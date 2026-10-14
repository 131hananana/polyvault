/* ============================================================
   Offline practice partner — used when there's no API key or
   no connection. Not a language model, but it reads the
   learner's last message and answers in context:
   greetings, "and you?", "I don't understand", low-effort
   replies, "how do you say…" / "what does … mean" lookups,
   goodbyes — then keeps the conversation moving topic by topic.
   ============================================================ */
import { LanguageId, VocabCard } from "@/lib/types";
import { PARTNER_SCRIPTS, Line } from "./partnerScripts";

export interface OfflineTurn { role: "user" | "partner"; text: string }
export interface OfflineReply { reply: string; translation: string; reading?: string; tip: string | null }

const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const has = (text: string, re: RegExp) => re.test(n(text));

const BYE = /\b(bye|goodbye|see (you|ya)|gotta go|dah|daah|sampai jumpa|duluan|adios|hasta luego|au revoir|a bientot|ciao|tschuss|tchau|ate logo|poka|пока|до свидания|bslama)\b|بسلامة/;
const CONFUSED = /(don'?t understand|dont get it|i'?m confused|tidak mengerti|gak ngerti|ga ngerti|nggak ngerti|ngga ngerti|bingung|maksudnya\??$|^what\??$|^huh\??$|^apa\??$|no entiendo|je ne comprends pas|j'?comprends pas|non capisco|ich verstehe (das )?nicht|nao entendi|nao entendo|не понимаю|ma fhemtch|^\?+$)/;
const HOW_ARE_YOU = /(how are you|how r u|how'?s it going|apa kabar|gimana kabar|que tal|como estas|ca va\?|comment ca va|come stai|wie geht'?s|wie geht es dir|tudo bem\?|como vai|как дела|labas)/;
const AND_YOU = /(and you\??$|what about you|how about you|kalau kamu|kamu sendiri|y tu\??$|et toi\??$|und du\??$|e tu\??$|e voce\??$|а ты\??$|و نتا|wnta|w nta)/;
const LOW_EFFORT = /^(ok+|oke+|okay|okey|k+|ya+|yes|yep|yup|no|nope|nah|lol+|lmao|haha+|hehe+|wkwk+|hmm+|mm+|idk|iya|gak|ga|nggak|si|sí|oui|non|ja|nein|да|нет|sim|nao|não|iyeh|la|cool|nice|good|fine|bien|gut|bene|bem|ok\.|sure)[!.?]*$/;
const HOW_SAY = /(?:how (?:do|to|would) (?:you |i )?say|how is|gimana (?:bilang|ngomong)|bahasa \w+nya|cara bilang|como se dice|comment (?:on )?dit[- ]on|come si dice|wie sagt man|como se diz|как сказать)\s+["“']?([^"”'?]+)["”']?/;
const MEANING = /(?:what does|what'?s|apa arti(?:nya)?|artinya apa|que significa|ca veut dire quoi|que veut dire|cosa significa|was bedeutet|o que significa|что значит)\s+["“']?([^"”'?]+?)["”']?(?:\s+mean)?\??$/;

const pickAt = <T,>(list: T[], i: number) => list[((i % list.length) + list.length) % list.length];

function join(...lines: (Line | undefined)[]): Omit<OfflineReply, "tip"> {
  const ls = lines.filter(Boolean) as Line[];
  const readings = ls.map((l) => l[2]).filter(Boolean);
  return {
    reply: ls.map((l) => l[0]).join(" "),
    translation: ls.map((l) => l[1]).join(" "),
    reading: readings.length ? readings.join(" ") : undefined,
  };
}

/** Finds a vault card for an English/Indonesian meaning ("how do you say thank you"). */
function findByMeaning(cards: VocabCard[], q: string): VocabCard | undefined {
  const t = n(q).replace(/[.!]+$/, "");
  return cards.find((c) => n(c.translation) === t) ??
    cards.find((c) => n(c.translation).split(/\s*[/,(]\s*/).includes(t)) ??
    cards.find((c) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(n(c.translation)));
}

function findByWord(cards: VocabCard[], q: string): VocabCard | undefined {
  const t = n(q).replace(/[.!]+$/, "");
  return cards.find((c) => [c.word, c.nativeScript, c.romanization ?? ""].some((w) => n(w) === t));
}

export function offlineReply(lang: LanguageId, history: OfflineTurn[], cards: VocabCard[]): OfflineReply {
  const s = PARTNER_SCRIPTS[lang];
  const partnerTurns = history.filter((t) => t.role === "partner").length;
  const last = [...history].reverse().find((t) => t.role === "user")?.text ?? "";

  if (!partnerTurns || !last) {
    return { ...join(s.greet), tip: "Offline practice mode — add an Anthropic API key in Settings for a smarter, free-flowing partner." };
  }

  // remember what was already said so topics and small talk never repeat
  const said = history.filter((t) => t.role === "partner").map((t) => t.text).join(" \n ");
  const fresh = (list: Line[], offset: number) => list.find((l) => !said.includes(l[0])) ?? pickAt(list, offset);
  const nextQuestion = fresh(s.questions, partnerTurns);
  // small facts about the partner are shared once each, then it just asks
  const aboutMe = s.aboutMe.find((l) => !said.includes(l[0]));
  const easy = fresh(s.easy, partnerTurns);
  const ack = pickAt(s.ack, partnerTurns);
  // "and you?" right after the greeting means "how are you?"
  const lastPartner = [...history].reverse().find((t) => t.role === "partner")?.text ?? "";
  const answeredGreeting = lastPartner === s.greet[0];

  if (has(last, BYE)) return { ...join(s.bye), tip: null };

  const howSay = n(last).match(HOW_SAY);
  if (howSay) {
    const card = findByMeaning(cards, howSay[1]);
    if (!card) return { ...join(s.dontKnow), tip: null };
    const word: Line = [card.nativeScript || card.word, card.translation, card.romanization];
    return { ...join(s.sayIt, word), tip: card.pronunciation ? `🗣 ${card.pronunciation}` : null };
  }
  const meaning = last.match(MEANING) ?? n(last).match(MEANING);
  if (meaning) {
    const card = findByWord(cards, meaning[1]);
    if (card) return { ...join([`${card.nativeScript || card.word} = ${card.translation}`, card.translation, card.romanization], nextQuestion), tip: null };
  }

  if (has(last, CONFUSED)) {
    // say it more simply: an easy either/or question instead of the last open one
    return { ...join(s.clarify, easy), tip: null };
  }
  if (has(last, HOW_ARE_YOU)) return { ...join(s.howAreYou, nextQuestion), tip: null };
  if (has(last, AND_YOU)) return { ...join(answeredGreeting ? s.howAreYou : aboutMe ?? s.howAreYou, nextQuestion), tip: null };

  // one-word / "ok" / "haha" replies: stay curious, make the next answer easy
  const words = n(last).split(/\s+/).filter(Boolean);
  const emojiOnly = !/[\p{L}\p{N}]/u.test(last);
  if (emojiOnly || LOW_EFFORT.test(n(last)) || words.length <= 1) {
    return { ...join(ack, aboutMe, easy), tip: null };
  }

  // a real answer: react, sometimes share something, then the next topic
  return { ...join(ack, partnerTurns % 2 === 0 ? aboutMe : undefined, nextQuestion), tip: null };
}
