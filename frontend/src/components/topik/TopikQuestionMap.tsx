"use client";

import { GRADIENT } from "@/components/ui-kit/brand";
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
    <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">Bản đồ câu hỏi</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Chọn một số để chuyển nhanh đến câu tương ứng.
          </p>
        </div>
        <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          {answeredCount}/{items.length} đã làm
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.section}>
            {multiSection ? (
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-1.5 text-xs font-bold tabular-nums transition hover:-translate-y-0.5 ${
        item.isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
      } ${
        item.answered
          ? "text-white shadow-sm"
          : "border border-border bg-secondary/45 text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
      style={item.answered ? { background: GRADIENT } : undefined}
    >
      {item.questionNo}
    </button>
  );
}
