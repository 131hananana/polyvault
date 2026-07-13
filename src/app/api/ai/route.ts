/* ============================================================
   AI endpoint — Claude-powered tutoring, explanations,
   deck generation, and vocabulary extraction.

   Returns 503 when no API key is configured; the client then
   falls back to the built-in offline tutor so the app never
   breaks without connectivity or a key.
   ============================================================ */
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

const MODEL = "claude-sonnet-5";

type Task = "tutor" | "explain" | "generate" | "extract";

const SYSTEM = `You are the AI tutor inside PolyVault, a private vocabulary learning app.
You are an experienced, warm but rigorous language teacher.
Always respond with ONLY valid JSON matching the requested schema — no markdown fences, no prose outside JSON.`;

function buildPrompt(task: Task, payload: Record<string, unknown>): string {
  switch (task) {
    case "tutor":
      return `A learner made a mistake in a ${payload.language} vocabulary quiz.
Word being tested: "${payload.word}" (${payload.translation})
The learner answered: "${payload.userAnswer}"
Correct answer: "${payload.correctAnswer}"
Quiz mode: ${payload.mode}
Card context: ${JSON.stringify(payload.cardContext)}
Previous mistakes on this word this session: ${payload.mistakeCount}

Act as a personal tutor. Do NOT just reveal the answer. Explain WHY the learner's answer was wrong,
compare it with the correct word, highlight subtle differences, give a memory technique,
and create ${Number(payload.mistakeCount) > 1 ? "5 harder" : "4"} personalized follow-up exercises that
test the exact confusion until mastery. Adapt difficulty upward if mistakeCount > 1.

JSON schema:
{
  "whyWrong": string,
  "comparison": string,
  "subtleDifferences": string[],
  "memoryTechnique": string,
  "exercises": [{ "type": "multiple-choice"|"typing"|"fill-blank", "prompt": string, "sentence": string|null, "options": string[]|null, "answer": string, "explanation": string }]
}`;
    case "explain":
      return `Explain the ${payload.language} word "${payload.word}" (${payload.translation}) like an expert native teacher.
Card context: ${JSON.stringify(payload.cardContext)}

JSON schema:
{
  "realMeaning": string,        // what the word REALLY means beyond the dictionary
  "whenUsed": string,           // when native speakers actually use it
  "whenNotToUse": string,
  "confusedWith": string[],     // words people confuse it with
  "similarWordsDiff": string,   // differences between similar vocabulary
  "situations": { "realLife": string, "business": string, "daily": string, "travel": string },
  "learnerMistakes": string,
  "memoryTricks": string
}`;
    case "generate":
      return `Generate ${payload.count} vocabulary cards for learning ${payload.language}.
Topic: ${payload.topic}. CEFR level: ${payload.cefr}. Difficulty: ${payload.difficulty}.
${payload.scenario ? `Scenario/industry/occupation: ${payload.scenario}.` : ""}
Language id: ${payload.languageId} ("darija" = Moroccan Darija in Arabic script with Latin romanization using 3/7/9 digits; "ar" = MSA with academic romanization).

Every card must be complete and pedagogically rich. JSON schema — return { "cards": [...] } where each card is:
{
  "word": string, "nativeScript": string, "translation": string,
  "partOfSpeech": "noun"|"verb"|"adjective"|"adverb"|"phrase"|"idiom"|"expression"|"preposition"|"interjection",
  "cefr": "A1"|"A2"|"B1"|"B2"|"C1"|"C2", "topic": string,
  "difficulty": 1|2|3|4|5, "frequency": 1|2|3|4|5,
  "pronunciation": string, "ipa": string, "romanization": string|null,
  "gender": "masculine"|"feminine"|"none", "plural": string|null,
  "collocations": string[], "synonyms": string[], "antonyms": string[], "relatedWords": string[],
  "memoryTips": string, "commonMistakes": string, "culturalNotes": string|null,
  "grammarNotes": string|null, "usageNotes": string|null,
  "register": "formal"|"neutral"|"casual",
  "examples": [{ "native": string, "translation": string, "explanation": string, "whyUseful": string }]  // at least 3
}`;
    case "extract":
      return `Extract the most valuable vocabulary for a ${payload.language} learner from this text, and build complete learning cards.
Extract up to ${payload.count ?? 20} items (words, phrases, idioms). Skip trivial words the learner surely knows below ${payload.cefr ?? "B1"}.

TEXT:
"""
${String(payload.text).slice(0, 20000)}
"""

Use the same JSON schema as deck generation: { "cards": [...] } (same card fields, at least 3 examples each — you may write new example sentences beyond the source text).`;
  }
}

export async function POST(req: NextRequest) {
  let body: { task: Task; payload: Record<string, unknown> };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const apiKey = req.headers.get("x-api-key") || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "no-api-key", hint: "Set ANTHROPIC_API_KEY or add a key in Settings. Using offline tutor." },
      { status: 503 },
    );
  }

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: body.task === "generate" || body.task === "extract" ? 16000 : 3000,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(body.task, body.payload) }],
    });
    const text = msg.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return NextResponse.json(parsed);
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
