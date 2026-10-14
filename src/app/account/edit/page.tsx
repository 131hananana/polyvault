"use client";

/* ============================================================
   Edit profile — personal info, languages, exchange
   preferences and privacy.
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, X, Plus, BadgeCheck, Check, Trash2 } from "lucide-react";
import { SectionTitle } from "@/components/ui";
import { Avatar, Banner } from "@/components/account/ProfileView";
import {
  UserAccount, getAccount, saveAccount, BANNERS, WORLD_LANGUAGES, worldLanguage, countryList,
  INTEREST_SUGGESTIONS, USERNAME_RE, resizeImage, newVerification, MeetingFormat, AccountPrivacy,
} from "@/lib/account";
import { CEFR } from "@/lib/types";

const CEFR_LEVELS: CEFR[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const MEETING_OPTIONS: { id: MeetingFormat; label: string }[] = [
  { id: "text", label: "Text chat" }, { id: "voice", label: "Voice call" },
  { id: "video", label: "Video call" }, { id: "in-person", label: "In person" },
];
const PRIVACY_OPTIONS: { key: keyof AccountPrivacy; label: string; hint: string }[] = [
  { key: "showLocation", label: "Show location", hint: "Country of origin, city and country you live in" },
  { key: "showLocalTime", label: "Show local time", hint: "Helps partners pick a good time to talk" },
  { key: "showAge", label: "Show age", hint: "Calculated from your birth date — the date itself is never shown" },
  { key: "showStats", label: "Show level & stats", hint: "Level, XP, streak, words learned" },
  { key: "showAchievements", label: "Show achievements", hint: "Badges you've unlocked" },
];

export default function EditAccountPage() {
  const router = useRouter();
  const [form, setForm] = useState<UserAccount | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [interestDraft, setInterestDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const countries = useMemo(() => countryList(), []);

  useEffect(() => { getAccount().then(setForm); }, []);

  // jump to #section after the form renders
  useEffect(() => {
    if (form && window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [form === null]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!form) return null;
  const set = <K extends keyof UserAccount>(k: K, v: UserAccount[K]) => { setForm({ ...form, [k]: v }); setSaved(false); };

  const onAvatar = async (file?: File) => {
    if (!file) return;
    try {
      const avatar = await resizeImage(file);
      set("avatar", avatar);
      await saveAccount({ avatar }); // photos save immediately so they're never lost
    } catch (e) { setError((e as Error).message); }
  };

  const addNative = (code: string) => {
    if (!code || form.nativeLanguages.some((n) => n.code === code)) return;
    set("nativeLanguages", [...form.nativeLanguages, { code, verification: newVerification() }]);
  };
  const addLearning = (code: string) => {
    if (!code || form.learningLanguages.some((l) => l.code === code)) return;
    set("learningLanguages", [...form.learningLanguages, { code, level: "A1" }]);
  };
  const addInterest = (raw: string) => {
    const v = raw.trim();
    if (!v || form.interests.includes(v) || form.interests.length >= 12) return;
    set("interests", [...form.interests, v]);
    setInterestDraft("");
  };

  const hasVerifiedNative = form.nativeLanguages.some((n) => n.verification.status === "verified");

  const save = async () => {
    setError("");
    const username = form.username.trim().toLowerCase();
    if (!form.displayName.trim()) return setError("Please enter your name.");
    if (username && !USERNAME_RE.test(username)) return setError("Username: 3–20 characters, lowercase letters, numbers, _ or . only.");
    await saveAccount({
      ...form,
      displayName: form.displayName.trim(),
      username,
      interestedInTeaching: form.interestedInTeaching && hasVerifiedNative,
    });
    setSaved(true);
    router.push("/account");
  };

  return (
    <div className="fade-up max-w-2xl mx-auto pb-24">
      <Link href="/account" className="btn btn-ghost !px-2 -ml-2 mb-2 text-sm"><ArrowLeft size={15} /> Account</Link>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit profile</h1>

      {/* ---------- photo + banner ---------- */}
      <div className="card overflow-hidden mt-6">
        <Banner id={form.bannerId} className="h-24">
          <div className="absolute right-3 bottom-3 flex gap-1.5">
            {BANNERS.map((b, i) => (
              <button key={i} aria-label={`Banner ${i + 1}`} onClick={() => set("bannerId", i)}
                className={`w-6 h-6 rounded-full border-2 ${form.bannerId === i ? "border-white scale-110" : "border-white/40"} transition-transform`}
                style={{ background: b }} />
            ))}
          </div>
        </Banner>
        <div className="relative z-10 px-5 pb-5 -mt-10 flex items-end gap-3">
          <button onClick={() => fileRef.current?.click()} className="relative group" aria-label="Change photo">
            <Avatar account={form} size={84} ring />
            <span className="absolute inset-0 rounded-full bg-black/40 grid place-items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} />
            </span>
          </button>
          <div className="flex gap-2 pb-1">
            <button className="btn btn-outline !py-1.5 !px-3 text-xs" onClick={() => fileRef.current?.click()}><Camera size={13} /> Photo</button>
            {form.avatar && <button className="btn btn-ghost !py-1.5 !px-3 text-xs" onClick={() => { set("avatar", undefined); saveAccount({ avatar: undefined }); }}><Trash2 size={13} /> Remove</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onAvatar(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </div>

      {/* ---------- basics ---------- */}
      <SectionTitle><span id="basics">About you</span></SectionTitle>
      <div className="card p-5 grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name *">
            <input className="input" value={form.displayName} maxLength={40} placeholder="Your name"
              onChange={(e) => set("displayName", e.target.value)} />
          </Field>
          <Field label="Username">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint text-sm">@</span>
              <input className="input !pl-8" value={form.username} maxLength={20} placeholder="hana"
                onChange={(e) => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))} />
            </div>
          </Field>
          <Field label="Pronouns">
            <input className="input" value={form.pronouns} maxLength={20} placeholder="e.g. she/her"
              onChange={(e) => set("pronouns", e.target.value)} />
          </Field>
          <Field label="Birth date" hint="Only your age is ever shown, and only if you allow it">
            <input type="date" className="input" value={form.birthDate} max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("birthDate", e.target.value)} />
          </Field>
          <Field label="Occupation">
            <input className="input" value={form.occupation} maxLength={50} placeholder="e.g. Social media specialist"
              onChange={(e) => set("occupation", e.target.value)} />
          </Field>
          <Field label="Time zone">
            <input className="input" value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
          </Field>
          <Field label="From">
            <select className="input" value={form.countryFrom} onChange={(e) => set("countryFrom", e.target.value)}>
              <option value="">—</option>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </Field>
          <Field label="Lives in">
            <select className="input" value={form.countryLiving} onChange={(e) => set("countryLiving", e.target.value)}>
              <option value="">—</option>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </Field>
          <Field label="City">
            <input className="input" value={form.city} maxLength={40} placeholder="e.g. Singapore"
              onChange={(e) => set("city", e.target.value)} />
          </Field>
        </div>
        <Field label="Bio" hint={`${form.bio.length}/280`}>
          <textarea className="input min-h-24 resize-y" value={form.bio} maxLength={280}
            placeholder="A few lines about you, your culture, and why you're learning languages"
            onChange={(e) => set("bio", e.target.value)} />
        </Field>
        <Field label="Learning goals">
          <textarea className="input min-h-20 resize-y" value={form.goals} maxLength={200}
            placeholder="e.g. Hold a 20-minute conversation in Darija with my in-laws by summer"
            onChange={(e) => set("goals", e.target.value)} />
        </Field>
      </div>

      {/* ---------- languages ---------- */}
      <SectionTitle><span id="languages">Languages</span></SectionTitle>
      <div className="card p-5 grid gap-5">
        <div>
          <div className="text-sm font-medium">Native language(s)</div>
          <div className="text-xs text-ink-muted mb-2.5">Shown as your flag. Verify each one to earn the ✓ badge.</div>
          <div className="flex flex-wrap gap-2">
            {form.nativeLanguages.map((n) => {
              const l = worldLanguage(n.code);
              const verified = n.verification.status === "verified";
              return (
                <span key={n.code} className={`pill !text-sm !py-1.5 !pl-2.5 ${verified ? "!bg-ok-soft !text-ok !border-transparent" : ""}`}>
                  <span className="text-base leading-none">{l.flag}</span>{l.name}
                  {verified && <BadgeCheck size={14} />}
                  <button aria-label={`Remove ${l.name}`} className="ml-0.5 hover:text-bad"
                    onClick={() => {
                      if (verified && !confirm(`Remove ${l.name}? You'll lose its verified badge.`)) return;
                      set("nativeLanguages", form.nativeLanguages.filter((x) => x.code !== n.code));
                    }}>
                    <X size={13} />
                  </button>
                </span>
              );
            })}
            <LanguagePicker exclude={form.nativeLanguages.map((n) => n.code)} onPick={addNative} label="Add native" />
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">Learning</div>
          <div className="text-xs text-ink-muted mb-2.5">Your self-assessed level is shown on your public profile.</div>
          <div className="grid gap-2">
            {form.learningLanguages.map((ll, idx) => {
              const l = worldLanguage(ll.code);
              return (
                <div key={ll.code} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <span className="text-lg">{l.flag}</span>
                  <span className="flex-1 text-sm font-medium">{l.name}</span>
                  <select className="input !w-auto !py-1 !px-2 text-sm" value={ll.level}
                    onChange={(e) => {
                      const next = [...form.learningLanguages];
                      next[idx] = { ...ll, level: e.target.value as CEFR };
                      set("learningLanguages", next);
                    }}>
                    {CEFR_LEVELS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button aria-label={`Remove ${l.name}`} className="btn btn-ghost !p-1.5"
                    onClick={() => set("learningLanguages", form.learningLanguages.filter((x) => x.code !== ll.code))}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
            <div><LanguagePicker exclude={form.learningLanguages.map((l) => l.code)} onPick={addLearning} label="Add language" /></div>
          </div>
        </div>
      </div>

      {/* ---------- interests ---------- */}
      <SectionTitle>Interests</SectionTitle>
      <div className="card p-5">
        <div className="flex flex-wrap gap-1.5">
          {form.interests.map((i) => (
            <span key={i} className="pill !text-sm !py-1 !bg-accent-soft !text-accent !border-transparent">
              {i}
              <button aria-label={`Remove ${i}`} onClick={() => set("interests", form.interests.filter((x) => x !== i))}><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input className="input" value={interestDraft} placeholder="Add an interest…" maxLength={24}
            onChange={(e) => setInterestDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(interestDraft); } }} />
          <button className="btn btn-outline" onClick={() => addInterest(interestDraft)}><Plus size={15} /></button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {INTEREST_SUGGESTIONS.filter((s) => !form.interests.includes(s)).map((s) => (
            <button key={s} className="pill hover:!bg-surface-3" onClick={() => addInterest(s)}>+ {s}</button>
          ))}
        </div>
      </div>

      {/* ---------- exchange ---------- */}
      <SectionTitle><span id="exchange">Exchange & teaching</span></SectionTitle>
      <div className="card p-5 grid gap-5">
        <Toggle label="Open to language & culture exchange" hint="Other learners can find you and send exchange requests (when community launches)"
          checked={form.openToExchange} onChange={(v) => set("openToExchange", v)} />
        {form.openToExchange && (
          <div>
            <div className="text-sm font-medium mb-2">Preferred formats</div>
            <div className="flex flex-wrap gap-1.5">
              {MEETING_OPTIONS.map((m) => {
                const on = form.meetingFormats.includes(m.id);
                return (
                  <button key={m.id}
                    className={`pill !text-sm !py-1.5 ${on ? "!bg-accent-soft !text-accent !border-transparent" : ""}`}
                    onClick={() => set("meetingFormats", on ? form.meetingFormats.filter((x) => x !== m.id) : [...form.meetingFormats, m.id])}>
                    {on && <Check size={13} />} {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <Toggle
          label="Teach with “Learn with Native”"
          hint={hasVerifiedNative
            ? "Offer paid lessons in your verified native language once it launches"
            : "Verify a native language first to unlock teaching"}
          checked={form.interestedInTeaching && hasVerifiedNative}
          disabled={!hasVerifiedNative}
          onChange={(v) => set("interestedInTeaching", v)} />
      </div>

      {/* ---------- privacy ---------- */}
      <SectionTitle><span id="privacy">Privacy</span></SectionTitle>
      <div className="card p-5 grid gap-5">
        {PRIVACY_OPTIONS.map((o) => (
          <Toggle key={o.key} label={o.label} hint={o.hint} checked={form.privacy[o.key]}
            onChange={(v) => set("privacy", { ...form.privacy, [o.key]: v })} />
        ))}
        <p className="text-xs text-ink-faint">Your name, username, photo, flags, rank and languages are always visible on your public profile.</p>
      </div>

      {/* ---------- save bar ---------- */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 md:left-60 z-30 px-4 py-3 bg-bg/85 backdrop-blur-xl border-t border-line">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="flex-1 text-sm text-bad">{error}</span>
          <Link href="/account" className="btn btn-ghost">Cancel</Link>
          <button className="btn btn-primary" onClick={save}>{saved ? <><Check size={15} /> Saved</> : "Save profile"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="flex justify-between text-xs font-medium text-ink-muted">
        <span>{label}</span>{hint && <span className="text-ink-faint font-normal">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({ label, hint, checked, onChange, disabled = false }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? "opacity-50" : ""}`}>
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-ink-muted mt-0.5">{hint}</div>}
      </div>
      <button role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? "bg-accent" : "bg-surface-3"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function LanguagePicker({ exclude, onPick, label }: { exclude: string[]; onPick: (code: string) => void; label: string }) {
  return (
    <select className="input !w-auto !py-1.5 text-sm" value=""
      onChange={(e) => { onPick(e.target.value); e.target.value = ""; }}>
      <option value="">+ {label}</option>
      {WORLD_LANGUAGES.filter((l) => !exclude.includes(l.code)).map((l) => (
        <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
      ))}
    </select>
  );
}
