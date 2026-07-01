import Link from "next/link";
import { Play } from "lucide-react";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import type { FormatStats } from "@/lib/toeic-format-stats";
import { toeicPartLabel } from "@/lib/toeic-labels";
import type { ToeicQuestionFormat } from "@/lib/types";

type ToeicFormatCardProps = {
  format: ToeicQuestionFormat;
  stats: FormatStats;
  practiceHref: string;
};

export function ToeicFormatCard({
  format,
  stats,
  practiceHref,
}: ToeicFormatCardProps) {
  const rangeLabel =
    format.fromNo === format.toNo
      ? `${format.fromNo}`
      : `${format.fromNo}~${format.toNo}`;
  const accColor = scoreColor(stats.percent);

  return (
    <Link
      href={practiceHref}
      className="group block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {toeicPartLabel(format.part)} · {format.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Câu {rangeLabel}
            {format.titleEn ? ` · ${format.titleEn}` : ""}
          </p>
        </div>
        {stats.correctAnswers > 0 ? (
          <span
            className="rounded px-2 py-0.5 font-mono text-xs font-semibold"
            style={{ color: accColor, backgroundColor: `${accColor}18` }}
          >
            {stats.percent}%
          </span>
        ) : null}
      </div>

      {format.description ? (
        <p className="mb-3 text-xs text-muted-foreground">{format.description}</p>
      ) : null}

      <p className="mb-3 text-xs text-muted-foreground">
        Trả lời đúng:{" "}
        <span className="font-medium text-foreground">{stats.correctAnswers}</span>
      </p>

      <div
        className="h-1.5 overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${stats.percent}%`, backgroundColor: accColor }}
        />
      </div>

      <span
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-white"
        style={{ background: `linear-gradient(90deg,${BRAND.blue},${BRAND.cyan})` }}
      >
        <Play size={12} /> Luyện Part này
      </span>
    </Link>
  );
}
