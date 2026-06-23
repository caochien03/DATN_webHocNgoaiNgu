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
      className="rounded px-2 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: `${color}20` }}
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
      className="rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ color, backgroundColor: `${color}18` }}
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
    <div
      className="h-1.5 overflow-hidden rounded-full"
      style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${w}%` }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
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
      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none text-foreground">
          {value}
        </p>
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
      className="mb-8 flex items-start justify-between gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}
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
      className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${className}`}
      style={{ background: GRADIENT }}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card ${className}`}>
      {children}
    </div>
  );
}
