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
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-2xs"
      style={{
        color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}35`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
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
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide"
      style={{
        color,
        backgroundColor: `${color}14`,
        border: `1px solid ${color}28`,
      }}
    >
      {children}
    </span>
  );
}

export function Bar({
  done,
  total,
  color = BRAND.blue,
  className = "",
}: {
  done: number;
  total: number;
  color?: string;
  className?: string;
}) {
  const w = pct(done, total);
  return (
    <div className={`relative h-2 overflow-hidden rounded-full bg-secondary ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${BRAND.cyan})` }}
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
  sub,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  delay?: number;
  sub?: string;
}) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-border/90"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      {/* Accent top gradient bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2.5px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}40, transparent)` }}
      />
      <div className="flex items-center gap-4 pt-1">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-2xs"
          style={{
            backgroundColor: `${color}15`,
            color,
            border: `1px solid ${color}25`,
          }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground truncate">{label}</p>
          <p className="mt-0.5 text-2xl font-black tracking-tight text-foreground">
            {value}
          </p>
          {sub ? (
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{sub}</p>
          ) : null}
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
      className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {title}
        </h1>
        {sub ? (
          <p className="mt-1 text-sm font-medium text-muted-foreground">{sub}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-3">{action}</div> : null}
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 ${className}`}
      style={{
        background: GRADIENT,
        boxShadow: `0 4px 16px 0 ${BRAND.blue}35`,
      }}
      whileHover={
        disabled
          ? undefined
          : { scale: 1.03, boxShadow: `0 6px 20px 0 ${BRAND.blue}50` }
      }
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs ${className}`}
    >
      {accent ? (
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent}50, transparent)` }}
        />
      ) : null}
      {children}
    </div>
  );
}
