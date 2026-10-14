/* ============================================================
   Cloud text-to-speech for languages devices have no voice for.

   Moroccan Darija has no built-in voice on any OS/browser, so
   devices read it with a Modern Standard Arabic voice. This
   route uses Microsoft Azure's Moroccan Arabic (ar-MA) neural
   voices instead. Responses are cacheable by URL, so each word
   is synthesised once and then served from the CDN/browser.

   Needs AZURE_SPEECH_KEY + AZURE_SPEECH_REGION; returns 503
   without them and the client falls back to device voices.
   ============================================================ */
import { NextRequest, NextResponse } from "next/server";

/** BCP-47 tag → Azure neural voice */
const VOICES: Record<string, string> = {
  "ar-MA": "ar-MA-MounaNeural",
};

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET(req: NextRequest) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return NextResponse.json({ error: "tts-not-configured" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") ?? "";
  const text = (searchParams.get("text") ?? "").trim().slice(0, 400);
  const slow = searchParams.get("slow") === "1";
  const voice = VOICES[lang];
  if (!voice || !text) return NextResponse.json({ error: "unsupported" }, { status: 400 });

  const ssml =
    `<speak version="1.0" xml:lang="${lang}"><voice name="${voice}">` +
    `<prosody rate="${slow ? "-35%" : "-5%"}">${escapeXml(text)}</prosody></voice></speak>`;

  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "polyvault",
    },
    body: ssml,
  });
  if (!res.ok) return NextResponse.json({ error: `tts-failed-${res.status}` }, { status: 502 });

  return new NextResponse(await res.arrayBuffer(), {
    headers: {
      "Content-Type": "audio/mpeg",
      // same text + voice always gives the same audio: cache it for a year
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
