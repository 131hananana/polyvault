/* ============================================================
   Offline tutor — deterministic fallback when no API key is
   configured or the device is offline. Builds pedagogically
   sound feedback and drills from the card's own rich data.
   ============================================================ */
import { VocabCard, TutorFeedback, TutorExercise, WordExplanation } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function offlineTutorFeedback(
  card: VocabCard, userAnswer: string, correctAnswer: string, distractors: string[],
): TutorFeedback {
  const confusable = card.synonyms[0] ?? distractors[0] ?? "";
  // was the learner asked for the meaning (word→translation) or the word itself?
  const askedForMeaning = correctAnswer === card.translation;
  const exercises: TutorExercise[] = [];

  // 1. recognition
  exercises.push({
    type: "multiple-choice",
    prompt: askedForMeaning ? `What does "${card.word}" mean?` : `Which word means "${card.translation}"?`,
    options: shuffle([correctAnswer, ...distractors.slice(0, 3)].filter(Boolean)),
    answer: correctAnswer,
    explanation: card.memoryTips || `"${card.word}" means "${card.translation}".`,
  });

  // 2. contextual fill-blank from a real example
  const ex = card.examples[0];
  if (ex) {
    const blanked = blankOut(ex.native, card);
    if (blanked) {
      exercises.push({
        type: "fill-blank",
        prompt: `Complete the sentence (${ex.translation})`,
        sentence: blanked,
        answer: extractHeadword(card),
        explanation: ex.explanation,
      });
    }
  }

  // 3. reverse production
  exercises.push({
    type: "typing",
    prompt: `Type the word that means "${card.translation}"`,
    answer: extractHeadword(card),
    explanation: `Pronunciation: ${card.pronunciation || card.ipa || "—"}. ${card.memoryTips}`,
  });

  // 4. discrimination vs the confused answer
  if (userAnswer && userAnswer.toLowerCase() !== correctAnswer.toLowerCase()) {
    exercises.push({
      type: "multiple-choice",
      prompt: `You mixed up "${userAnswer}" and "${correctAnswer}". Which one fits: "${card.translation}"?`,
      options: shuffle([correctAnswer, userAnswer]),
      answer: correctAnswer,
      explanation: card.commonMistakes || `Focus on the core meaning: ${card.translation}.`,
    });
  }

  return {
    whyWrong: userAnswer && userAnswer !== "(time out)"
      ? `"${userAnswer}" isn't right here — "${card.word}" means "${card.translation}". ${card.commonMistakes || ""}`.trim()
      : `The correct answer is "${correctAnswer}": "${card.word}" means "${card.translation}". ${card.commonMistakes || ""}`.trim(),
    comparison: confusable && confusable !== card.word
      ? `Compare: "${card.word}" vs "${confusable}" — they can overlap, but "${card.word}" specifically means "${card.translation}"${card.usageNotes ? `. ${card.usageNotes}` : "."}`
      : card.usageNotes || `"${card.word}" = ${card.translation}.`,
    subtleDifferences: [
      card.register !== "neutral" ? `Register: it's ${card.register} — mind where you use it.` : "",
      card.grammarNotes ?? "",
      card.culturalNotes ?? "",
    ].filter(Boolean),
    memoryTechnique: card.memoryTips || `Link "${correctAnswer}" to a vivid image of "${card.translation}" and say it aloud three times.`,
    exercises,
  };
}

function extractHeadword(card: VocabCard): string {
  // strip leading articles for typing answers ("l'entretien" → "entretien")
  return card.word.replace(/^(le |la |les |l'|el |la |los |las |un |una |the )/i, "").trim();
}

function blankOut(sentence: string, card: VocabCard): string | null {
  const head = extractHeadword(card);
  const idx = sentence.toLowerCase().indexOf(head.toLowerCase());
  if (idx === -1) {
    const nsIdx = sentence.indexOf(card.nativeScript);
    if (nsIdx === -1) return null;
    return sentence.slice(0, nsIdx) + "______" + sentence.slice(nsIdx + card.nativeScript.length);
  }
  return sentence.slice(0, idx) + "______" + sentence.slice(idx + head.length);
}

export function offlineExplanation(card: VocabCard): WordExplanation {
  const ex = card.examples;
  return {
    realMeaning: `${card.word} means "${card.translation}" (${card.partOfSpeech}, ${card.cefr}). ${card.usageNotes ?? ""}`.trim(),
    whenUsed: ex[0] ? `Typically in contexts like: “${ex[0].native}” — ${ex[0].translation}. ${ex[0].whyUseful}` : card.topic,
    whenNotToUse: card.register === "formal"
      ? "Avoid it in casual chat — it can sound stiff. Prefer a lighter synonym with friends."
      : card.register === "casual"
        ? "Avoid it in formal writing, exams, or professional email — it's conversational."
        : card.commonMistakes || "No strong restrictions, but check the examples for natural contexts.",
    confusedWith: [...card.synonyms, ...card.relatedWords].slice(0, 4),
    similarWordsDiff: card.commonMistakes || (card.synonyms.length ? `Close to ${card.synonyms.join(", ")}, but the examples show its specific niche.` : "It has no dangerous lookalikes — focus on collocations."),
    situations: {
      realLife: ex[0] ? `${ex[0].native} — ${ex[0].translation}` : "—",
      business: ex.find((e) => /meeting|work|report|entretien|réunion|اجتماع|presupuesto|deadline/i.test(e.native + e.translation))?.native ?? (card.topic.match(/business/i) ? ex[0]?.native ?? "—" : "Less common in business contexts."),
      daily: ex[1] ? `${ex[1].native} — ${ex[1].translation}` : "—",
      travel: ex.find((e) => /travel|hotel|ticket|souk|train|viaj|voyage/i.test(e.native + e.translation))?.native ?? "Useful anywhere people talk!",
    },
    learnerMistakes: card.commonMistakes || "The main risk is overusing it where a simpler word fits.",
    memoryTricks: card.memoryTips || "Create a vivid mental image linking sound and meaning, then use the word in a sentence about your own life.",
  };
}
