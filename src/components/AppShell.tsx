"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home, Layers, BarChart3, Settings, Search, NotebookPen,
  Sparkles, Sun, Moon, GraduationCap, Import, ChevronDown,
} from "lucide-react";
import { LANGUAGES, languageById } from "@/lib/types";
import { useApp } from "./Providers";
import { AnimatePresence, motion } from "framer-motion";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/study", label: "Study", icon: GraduationCap },
  { href: "/decks", label: "Decks", icon: Layers },
  { href: "/search", label: "Search", icon: Search },
  { href: "/notebook", label: "Notebook", icon: NotebookPen },
  { href: "/generate", label: "AI Decks", icon: Sparkles },
  { href: "/import", label: "Import", icon: Import },
  { href: "/stats", label: "Statistics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = NAV.filter((n) => ["/", "/study", "/decks", "/search", "/stats"].includes(n.href));

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="btn btn-ghost !p-2.5 rounded-xl"
    >
      {resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { settings, setLanguage } = useApp();
  const [open, setOpen] = useState(false);
  const active = languageById(settings.activeLanguage);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-outline !py-2 w-full justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-base leading-none">{active.flag}</span>
          {!compact && <span className="text-sm">{active.name}</span>}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-56 card !rounded-xl p-1.5 shadow-lg left-0"
          >
            {LANGUAGES.map((l) => (
              <li key={l.id}>
                <button
                  role="option"
                  aria-selected={l.id === active.id}
                  onClick={() => { setLanguage(l.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors
                    ${l.id === active.id ? "bg-accent-soft text-accent font-semibold" : "hover:bg-surface-2 text-ink"}`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1">{l.name}</span>
                  {l.id === active.id && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { ready } = useApp();

  return (
    <div className="min-h-dvh flex">
      {/* ---------- desktop sidebar ---------- */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-line bg-surface/60 backdrop-blur-xl sticky top-0 h-dvh px-4 py-6 gap-6">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <span className="w-9 h-9 rounded-xl bg-accent text-white grid place-items-center font-bold text-lg shadow-md">P</span>
          <span className="font-semibold text-[17px] tracking-tight">PolyVault</span>
        </Link>

        <LanguageSwitcher />

        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${active ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-surface-2 hover:text-ink"}`}
              >
                <Icon size={17} strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-ink-faint">Private · Offline-first</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* ---------- main ---------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-bg/80 backdrop-blur-xl border-b border-line">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent text-white grid place-items-center font-bold shadow-sm">P</span>
            <span className="font-semibold tracking-tight">PolyVault</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          {ready ? children : (
            <div className="grid gap-4 mt-4" aria-busy>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card h-28 animate-pulse bg-surface-2 border-none" />
              ))}
            </div>
          )}
        </main>

        {/* mobile bottom tabs */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/85 backdrop-blur-xl border-t border-line pb-[env(safe-area-inset-bottom)]">
          <div className="flex justify-around">
            {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} aria-label={label}
                  className={`flex flex-col items-center gap-0.5 py-2.5 px-3 text-[10px] font-medium transition-colors
                    ${active ? "text-accent" : "text-ink-faint"}`}>
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
