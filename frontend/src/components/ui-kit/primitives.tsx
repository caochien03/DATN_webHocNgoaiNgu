"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BRAND, GRADIENT, levelColor, pct } from "./brand";

export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

export function LevelBadge({ level }: { level: string }) {
  const color = levelColor(level);
  const label = level.replace("TOPIK_", "TOPIK ");
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}

export function Tag({
  children,
  color = BRAND.muted,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
    >
      {children}
    </span>
  );
}

export function Bar({
  done,
  total,
  color = BRAND.blue,
}: {
  done: number;
  total: number;
  color?: string;
}) {
  const w = pct(done, total);
  return (
    <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${BRAND.cyan})` }}
        initial={{ width: 0 }}
        animate={{ width: `${w}%` }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  icon,
  color,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Accent top bar */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
      />
      <div className="flex items-center gap-4 pt-1">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold leading-none text-foreground">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      className="mb-7 flex items-start justify-between gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
        {sub ? (
          <p className="mt-1 text-sm font-medium text-muted-foreground">{sub}</p>
        ) : null}
      </div>
      {action}
    </motion.div>
  );
}

export function GradientButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold tracking-wide text-white shadow-sm disabled:opacity-60 ${className}`}
      style={{ background: GRADIENT, boxShadow: `0 2px 12px 0 ${BRAND.blue}40` }}
      whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

export function Card({
  children,
  className = "",
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {accent ? (
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent}60)` }}
        />
      ) : null}
      {children}
    </div>
  );
}
