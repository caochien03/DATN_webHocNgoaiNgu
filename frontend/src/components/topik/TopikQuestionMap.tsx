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
    <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">Bản đồ câu</p>
        <p className="text-xs text-muted-foreground">
          {answeredCount}/{items.length} đã làm
        </p>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Bấm số câu để nhảy · viền xanh = đang xem
      </p>

      <div className="mt-3 flex flex-col gap-3">
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
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-xs font-medium tabular-nums transition ${
        item.isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-secondary" : ""
      } ${
        item.answered
          ? "text-white"
          : "border border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
      style={item.answered ? { background: GRADIENT } : undefined}
    >
      {item.questionNo}
    </button>
  );
}
