"use client";

import { topikSectionLabel } from "@/lib/topik-labels";
import {
  groupMapItemsBySection,
  type TopikQuestionMapItem,
} from "@/lib/topik-question-map";

type TopikQuestionMapProps = {
  items: TopikQuestionMapItem[];
  onSelect: (navigateTo: number) => void;
};

export function TopikQuestionMap({ items, onSelect }: TopikQuestionMapProps) {
  if (items.length <= 1) return null;

  const answeredCount = items.filter((i) => i.answered).length;
  const groups = groupMapItemsBySection(items);
  const multiSection = groups.length > 1;

  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Bản đồ câu
        </p>
        <p className="text-xs text-zinc-500">
          {answeredCount}/{items.length} đã làm
        </p>
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">
        Bấm số câu để nhảy · viền cam = đang xem
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.section}>
            {multiSection ? (
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                {topikSectionLabel(group.section)}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <MapCell
                  key={item.questionId}
                  item={item}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapCell({
  item,
  onSelect,
}: {
  item: TopikQuestionMapItem;
  onSelect: (navigateTo: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect(item.navigateTo);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      title={
        item.answered
          ? `Câu ${item.questionNo} — đã làm`
          : `Câu ${item.questionNo} — chưa làm`
      }
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-xs font-medium tabular-nums transition ${
        item.isCurrent
          ? "ring-2 ring-orange-500 ring-offset-1 ring-offset-zinc-50 dark:ring-offset-zinc-900"
          : ""
      } ${
        item.answered
          ? "bg-orange-500 text-white hover:bg-orange-600"
          : "border border-zinc-300 bg-white text-zinc-700 hover:border-orange-300 hover:bg-orange-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
      }`}
    >
      {item.questionNo}
    </button>
  );
}
