"use client";

/* ============================================================
   Goal UI: first-run onboarding per language, the focus
   switcher, and the unlock (paywall) sheet.
   ============================================================ */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Check, X, Sparkles, ChevronDown } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/components/Providers";
import { db } from "@/lib/db";
import {
  GOALS, GoalDef, LanguageId, LearningGoal, GOAL_UNLOCK_PRICE_USD, goalById, languageById,
} from "@/lib/types";
import { chooseFirstGoal, setFocus, grantGoal, goalStateFor, TEST_PURCHASES_ENABLED } from "@/lib/goals";
import { goalDeckId } from "@/lib/seed/goals/builder";

/** Number of words in a language's goal track (for "what's included"). */
function useGoalWordCount(lang: LanguageId, goal: LearningGoal) {
  return useLiveQuery(() => db.cards.where("deckIds").equals(goalDeckId(lang, goal)).count(), [lang, goal]) ?? 0;
}

/* ---------------- onboarding ---------------- */
export function GoalOnboarding() {
  const { settings } = useApp();
  const lang = languageById(settings.activeLanguage);
  const [picked, setPicked] = useState<LearningGoal | null>(null);
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    if (!picked) return;
    setSaving(true);
    await chooseFirstGoal(lang.id, picked);
  };

  return (
    <div className="fade-up max-w-2xl mx-auto">
      <div className="hero pattern-confetti p-6 md:p-8 text-center">
        <span className="sticker w-16 h-16 text-4xl bg-surface border border-line mx-auto">{lang.flag}</span>
        <h1 className="text-2xl md:text-3xl font-bold mt-4">Why are you learning {lang.name}?</h1>
        <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
          Pick your focus and we&apos;ll tailor every lesson to it. Your first goal is free — you can add the others later for ${GOAL_UNLOCK_PRICE_USD} each.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {GOALS.map((g) => (
          <GoalCard key={g.id} goal={g} lang={lang.id} selected={picked === g.id} onClick={() => setPicked(g.id)} />
        ))}
      </div>

      <button className="btn btn-primary w-full !py-3.5 mt-5 text-base" disabled={!picked || saving} onClick={confirm}>
        {picked ? <>Start: {lang.name} {goalById(picked).purpose} {goalById(picked).emoji}</> : "Choose a goal to continue"}
      </button>
      <p className="text-xs text-ink-faint text-center mt-3">Everyone also gets the free Level 1 basics for {lang.name}.</p>
    </div>
  );
}

function GoalCard({ goal, lang, selected, onClick, badge }: {
  goal: GoalDef; lang: LanguageId; selected: boolean; onClick: () => void; badge?: React.ReactNode;
}) {
  const words = useGoalWordCount(lang, goal.id);
  return (
    <button onClick={onClick}
      className={`card p-5 text-left transition-all hover:-translate-y-0.5 ${selected ? "!border-accent ring-2 ring-[var(--accent-soft)]" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl">{goal.emoji}</span>
        {badge ?? (selected && <span className="w-6 h-6 rounded-full bg-accent text-white grid place-items-center"><Check size={14} /></span>)}
      </div>
      <div className="font-display font-semibold text-lg mt-2">{goal.label}</div>
      <p className="text-sm text-ink-muted mt-1">{goal.description}</p>
      <div className="flex flex-wrap gap-1 mt-3">
        {goal.topics.map((t) => <span key={t} className="pill !text-[11px]">{t}</span>)}
      </div>
      {words > 0 && <div className="text-xs text-ink-faint mt-3">{words} tailored words & phrases · {goal.cefr}</div>}
    </button>
  );
}

/* ---------------- focus switcher ---------------- */
export function GoalSwitcher({ compact = false }: { compact?: boolean }) {
  const { settings } = useApp();
  const lang = languageById(settings.activeLanguage);
  const state = goalStateFor(settings, lang.id);
  const [open, setOpen] = useState(false);
  const [unlocking, setUnlocking] = useState<LearningGoal | null>(null);
  if (!state) return null;
  const focus = goalById(state.focus);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full bg-surface border border-line shadow-sm hover:bg-surface-2 transition-colors ${compact ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"}`}>
        <span>{focus.emoji}</span>
        <span className="font-semibold">{compact ? focus.short : `Goal: ${focus.label}`}</span>
        <ChevronDown size={13} className="text-ink-faint" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={`Your ${lang.name} goal`}>
        <p className="text-sm text-ink-muted -mt-1 mb-4">You focus on one goal at a time. Switch freely between goals you&apos;ve unlocked.</p>
        <div className="grid gap-2">
          {GOALS.map((g) => {
            const unlocked = state.unlocked.includes(g.id);
            const active = state.focus === g.id;
            return (
              <button key={g.id}
                onClick={async () => {
                  if (active) return setOpen(false);
                  if (unlocked) { await setFocus(lang.id, g.id); setOpen(false); }
                  else { setOpen(false); setUnlocking(g.id); }
                }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-colors
                  ${active ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"}`}>
                <span className="text-2xl">{g.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="font-semibold block">{g.label}</span>
                  <span className="text-xs text-ink-muted block truncate">{g.topics.join(" · ")}</span>
                </span>
                {active ? <span className="pill !bg-accent !text-white !border-transparent">Focus</span>
                  : unlocked ? <span className="pill">Switch</span>
                  : <span className="pill !bg-sun/25 !border-sun/50 !text-ink"><Lock size={11} /> ${GOAL_UNLOCK_PRICE_USD}</span>}
              </button>
            );
          })}
        </div>
      </Sheet>

      {unlocking && <UnlockSheet lang={lang.id} goal={unlocking} onClose={() => setUnlocking(null)} />}
    </>
  );
}

/* ---------------- unlock / paywall ---------------- */
export function UnlockSheet({ lang, goal, onClose }: { lang: LanguageId; goal: LearningGoal; onClose: () => void }) {
  const g = goalById(goal);
  const language = languageById(lang);
  const words = useGoalWordCount(lang, goal);
  const [done, setDone] = useState(false);

  const purchase = async () => {
    await grantGoal(lang, goal);
    setDone(true);
  };

  return (
    <Sheet open onClose={onClose} title="">
      {done ? (
        <div className="text-center py-4">
          <div className="text-5xl">{g.emoji}</div>
          <h3 className="text-xl font-display font-semibold mt-3">{g.label} unlocked!</h3>
          <p className="text-sm text-ink-muted mt-1">It&apos;s now your {language.name} focus. Your next daily lesson uses it.</p>
          <button className="btn btn-primary w-full mt-5" onClick={onClose}>Let&apos;s go</button>
        </div>
      ) : (
        <>
          <div className="hero pattern-dots p-5 text-center -mt-2">
            <div className="text-4xl">{g.emoji}</div>
            <h3 className="text-xl font-display font-semibold mt-2">{language.name} {g.purpose}</h3>
            <p className="text-sm text-ink-muted mt-1">{g.description}</p>
          </div>
          <ul className="grid gap-2 mt-4 text-sm">
            {words > 0 && <li className="flex gap-2"><Check size={16} className="text-ok shrink-0" /> {words} tailored words & phrases with readings and audio</li>}
            <li className="flex gap-2"><Check size={16} className="text-ok shrink-0" /> Topics: {g.topics.join(", ")}</li>
            <li className="flex gap-2"><Check size={16} className="text-ok shrink-0" /> Daily lessons built around this goal</li>
            <li className="flex gap-2"><Check size={16} className="text-ok shrink-0" /> One-time purchase for {language.name} — keep it forever</li>
          </ul>

          <div className="flex items-end justify-between mt-5">
            <span className="text-sm text-ink-muted">One-time</span>
            <span className="text-3xl font-display font-semibold">${GOAL_UNLOCK_PRICE_USD}<span className="text-base text-ink-muted"> USD</span></span>
          </div>

          {TEST_PURCHASES_ENABLED ? (
            <>
              <button className="btn btn-primary w-full !py-3.5 mt-3" onClick={purchase}>
                <Sparkles size={16} /> Unlock for ${GOAL_UNLOCK_PRICE_USD}
              </button>
              <p className="text-[11px] text-warn text-center mt-2">Test mode — no real payment is taken yet.</p>
            </>
          ) : (
            <>
              <button className="btn btn-primary w-full !py-3.5 mt-3" disabled>Payments coming soon</button>
              <p className="text-[11px] text-ink-faint text-center mt-2">Card payments are being set up. Check back soon!</p>
            </>
          )}
        </>
      )}
    </Sheet>
  );
}

/* ---------------- bottom sheet ---------------- */
function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            className="relative card !rounded-b-none sm:!rounded-3xl w-full sm:max-w-md p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-lg">{title}</h3>
              <button className="btn btn-ghost !p-1.5" onClick={onClose} aria-label="Close"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
