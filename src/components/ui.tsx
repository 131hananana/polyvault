"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export function StatTile({ label, value, sub, accent = false, icon }: {
  label: string; value: ReactNode; sub?: string; accent?: boolean; icon?: ReactNode;
}) {
  return (
    <div className={`card p-4 md:p-5 flex flex-col gap-1 ${accent ? "!bg-accent-soft !border-transparent" : ""}`}>
      <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>{label}</span>{icon}
      </div>
      <div className={`text-2xl md:text-[28px] font-bold tracking-tight ${accent ? "text-accent" : ""}`}>{value}</div>
      {sub && <div className="text-xs text-ink-faint">{sub}</div>}
    </div>
  );
}

export function ProgressRing({ value, size = 56, stroke = 6, label }: {
  value: number; size?: number; stroke?: number; label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-xs font-bold">{label ?? `${Math.round(pct)}%`}</span>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mt-8 mb-3">
      <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ emoji, title, sub, action }: {
  emoji: string; title: string; sub?: string; action?: ReactNode;
}) {
  return (
    <div className="card p-10 flex flex-col items-center text-center gap-2">
      <div className="text-4xl">{emoji}</div>
      <div className="font-semibold">{title}</div>
      {sub && <div className="text-sm text-ink-muted max-w-sm">{sub}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Heatmap({ data, weeks = 20 }: { data: Record<string, number>; weeks?: number }) {
  const days: { key: string; count: number }[] = [];
  const today = new Date();
  const total = weeks * 7;
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ key, count: data[key] ?? 0 });
  }
  const level = (n: number) => (n === 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4);
  const colors = ["var(--surface-3)", "color-mix(in srgb, var(--accent) 25%, var(--surface-3))",
    "color-mix(in srgb, var(--accent) 50%, transparent)", "color-mix(in srgb, var(--accent) 75%, transparent)", "var(--accent)"];
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col grid-rows-7 gap-[3px] w-max">
        {days.map((d) => (
          <div
            key={d.key}
            title={`${d.key}: ${d.count} reviews`}
            className="w-[11px] h-[11px] rounded-[3px]"
            style={{ background: colors[level(d.count)] }}
          />
        ))}
      </div>
    </div>
  );
}

export function Bar({ pct, color = "var(--accent)" }: { pct: number; color?: string }) {
  return (
    <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}
