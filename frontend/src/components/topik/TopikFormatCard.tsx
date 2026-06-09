import Link from "next/link";
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

  return (
    <Link
      href={practiceHref}
      className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-orange-900"
    >
      <h3 className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
        Phần {partIndex} - {format.title} ({rangeLabel})
      </h3>
      <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
        Trả lời đúng:{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-200">
          {stats.correctAnswers}
        </span>
      </p>
      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
        Tỷ lệ đúng
      </p>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-teal-500 transition-all"
          style={{ width: `${stats.percent}%` }}
        />
      </div>
    </Link>
  );
}
