import Link from "next/link";
import { ArrowRight, BarChart3, CirclePlay } from "lucide-react";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import type { FormatStats } from "@/lib/topik-format-stats";
import type { TopikQuestionFormat } from "@/lib/types";

type TopikFormatCardProps = {
  partIndex: number;
  format: TopikQuestionFormat;
  stats: FormatStats;
  practiceHref: string;
};

export function TopikFormatCard({
  partIndex,
  format,
  stats,
  practiceHref,
}: TopikFormatCardProps) {
  const rangeLabel =
    format.fromNo === format.toNo
      ? `${format.fromNo}`
      : `${format.fromNo}~${format.toNo}`;
  const accColor = scoreColor(stats.percent);

  return (
    <Link
      href={practiceHref}
      className="group relative block overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <span
        aria-hidden
        className="absolute -right-9 -top-9 h-28 w-28 rounded-full opacity-70 blur-2xl"
        style={{ backgroundColor: `${BRAND.purple}24` }}
      />
      <div className="relative mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Dạng luyện {partIndex}
          </p>
          <p className="mt-1 text-base font-bold text-foreground">
            Phần {partIndex} · {format.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Câu {rangeLabel}</p>
        </div>
        {stats.correctAnswers > 0 ? (
          <span
            className="rounded-full px-2.5 py-1 font-mono text-xs font-bold"
            style={{ color: accColor, backgroundColor: `${accColor}18` }}
          >
            {stats.percent}%
          </span>
        ) : null}
      </div>

      <div className="relative rounded-2xl bg-secondary/70 px-3.5 py-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
            <BarChart3 size={14} /> Kết quả gần đây
          </span>
          <span className="font-semibold text-foreground">
            {stats.correctAnswers} câu đúng
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${stats.percent}%`, backgroundColor: accColor }}
          />
        </div>
      </div>

      <span
        className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold text-white transition-transform group-hover:scale-[1.01]"
        style={{ background: `linear-gradient(90deg,${BRAND.blue},${BRAND.cyan})` }}
      >
        <CirclePlay size={15} /> Luyện dạng này <ArrowRight size={15} />
      </span>
    </Link>
  );
}
