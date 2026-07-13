"use client";

import { useState } from "react";
import { Volume2, Turtle } from "lucide-react";
import { speak, speakSlow } from "@/lib/audio";
import { useApp } from "./Providers";

export function AudioButton({ text, lang, slow = false, className = "" }: {
  text: string; lang: string; slow?: boolean; className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const { settings } = useApp();
  const Icon = slow ? Turtle : Volume2;
  return (
    <button
      aria-label={slow ? "Play slow audio" : "Play audio"}
      title={slow ? "Slow audio" : "Native audio"}
      className={`btn btn-ghost !p-2 rounded-lg ${playing ? "text-accent" : ""} ${className}`}
      onClick={async (e) => {
        e.stopPropagation();
        setPlaying(true);
        await (slow ? speakSlow(text, lang) : speak(text, lang, settings.playbackSpeed));
        setPlaying(false);
      }}
    >
      <Icon size={17} />
    </button>
  );
}
