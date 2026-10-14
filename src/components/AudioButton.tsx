"use client";

import { useState } from "react";
import { Volume2, Turtle } from "lucide-react";
import { speak, speakSlow } from "@/lib/audio";
import { useApp } from "./Providers";

export function AudioButton({ text, lang, slow = false, className = "" }: {
  text: string; lang: string; slow?: boolean; className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [silent, setSilent] = useState(false);
  const { settings } = useApp();
  const Icon = slow ? Turtle : Volume2;
  return (
    <button
      aria-label={slow ? "Play slow audio" : "Play audio"}
      title={slow ? "Slow audio" : "Native audio"}
      className={`btn btn-ghost !p-2 rounded-lg relative ${playing ? "text-accent" : ""} ${className}`}
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault(); // may sit inside a <Link>
        setPlaying(true);
        setSilent(false);
        const ok = await (slow ? speakSlow(text, lang) : speak(text, lang, settings.playbackSpeed));
        setPlaying(false);
        if (!ok) { setSilent(true); setTimeout(() => setSilent(false), 5000); }
      }}
    >
      <Icon size={17} />
      {silent && (
        <span role="status" className="absolute z-50 top-full mt-1.5 left-1/2 -translate-x-1/2 w-56 rounded-xl bg-ink text-bg text-xs font-medium px-3 py-2 shadow-lg text-center normal-case">
          🔇 This browser isn&apos;t playing audio. Open PolyVault in Safari or Chrome — and check your iPhone isn&apos;t on silent.
        </span>
      )}
    </button>
  );
}
