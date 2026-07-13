"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, KeyRound, Bell } from "lucide-react";
import { useApp } from "@/components/Providers";
import { LANGUAGES } from "@/lib/types";
import { SectionTitle } from "@/components/ui";

export default function SettingsPage() {
  const { settings, patchSettings, setLanguage } = useApp();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  useEffect(() => { setMounted(true); setApiKey(settings.anthropicApiKey ?? ""); }, [settings.anthropicApiKey]);

  const askNotifications = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    patchSettings({ remindersEnabled: perm === "granted" });
    if (perm === "granted") new Notification("PolyVault", { body: "Daily reminders enabled. À demain! 🇫🇷" });
  };

  return (
    <div className="fade-up max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>

      <SectionTitle>Appearance</SectionTitle>
      <div className="card p-5 grid gap-5">
        <Row label="Theme" hint="PolyVault follows your system by default">
          {mounted && (
            <div className="flex gap-1 bg-surface-2 rounded-xl p-1">
              {([["light", Sun], ["system", Monitor], ["dark", Moon]] as const).map(([t, Icon]) => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`btn !p-2 !px-3.5 !rounded-lg text-xs capitalize ${theme === t ? "!bg-surface shadow-sm" : "btn-ghost"}`}>
                  <Icon size={14} /> {t}
                </button>
              ))}
            </div>
          )}
        </Row>
        <Row label="Font size" hint="Applies across the whole app">
          <div className="flex gap-1 bg-surface-2 rounded-xl p-1">
            {(["small", "medium", "large"] as const).map((s) => (
              <button key={s} onClick={() => patchSettings({ fontSize: s })}
                className={`btn !p-2 !px-3.5 !rounded-lg text-xs capitalize ${settings.fontSize === s ? "!bg-surface shadow-sm" : "btn-ghost"}`}>
                {s}
              </button>
            ))}
          </div>
        </Row>
      </div>

      <SectionTitle>Learning</SectionTitle>
      <div className="card p-5 grid gap-5">
        <Row label="Active language" hint="Each language keeps its own dashboard, queue and stats">
          <select className="input !w-auto" value={settings.activeLanguage} onChange={(e) => setLanguage(e.target.value as typeof settings.activeLanguage)}>
            {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
          </select>
        </Row>
        <Row label="Daily goal" hint="Reviews per day to keep your streak meaningful">
          <input type="number" min={5} max={500} className="input !w-24 text-center" value={settings.dailyGoal}
            onChange={(e) => patchSettings({ dailyGoal: Math.max(1, Number(e.target.value) || 30) })} />
        </Row>
        <Row label="New cards / day" hint="How many unseen cards enter the queue daily">
          <input type="number" min={0} max={100} className="input !w-24 text-center" value={settings.newCardsPerDay}
            onChange={(e) => patchSettings({ newCardsPerDay: Math.max(0, Number(e.target.value) || 10) })} />
        </Row>
        <Row label="Audio playback speed" hint={`Current: ${settings.playbackSpeed.toFixed(2)}×`}>
          <input type="range" min={0.5} max={1.5} step={0.05} value={settings.playbackSpeed}
            onChange={(e) => patchSettings({ playbackSpeed: Number(e.target.value) })}
            className="w-40 accent-[var(--accent)]" />
        </Row>
        <Row label="Daily reminder" hint={settings.remindersEnabled ? "Enabled — we'll nudge you to study" : "Browser notifications"}>
          <button className={`btn ${settings.remindersEnabled ? "btn-outline" : "btn-primary"}`}
            onClick={settings.remindersEnabled ? () => patchSettings({ remindersEnabled: false }) : askNotifications}>
            <Bell size={14} /> {settings.remindersEnabled ? "Disable" : "Enable"}
          </button>
        </Row>
      </div>

      <SectionTitle>AI Tutor</SectionTitle>
      <div className="card p-5">
        <Row label="Anthropic API key" hint="Powers Claude tutoring, deck generation and imports. Without a key, the built-in offline tutor is used. Stored only on this device.">
          <span />
        </Row>
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input type="password" className="input !pl-10" placeholder="sk-ant-…" value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setKeySaved(false); }} />
          </div>
          <button className="btn btn-primary" onClick={() => { patchSettings({ anthropicApiKey: apiKey.trim() || undefined }); setKeySaved(true); }}>
            {keySaved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      <p className="text-xs text-ink-faint text-center mt-8">PolyVault · private, offline-first, yours.</p>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="font-medium text-sm">{label}</div>
        {hint && <div className="text-xs text-ink-muted mt-0.5 max-w-xs">{hint}</div>}
      </div>
      {children}
    </div>
  );
}
