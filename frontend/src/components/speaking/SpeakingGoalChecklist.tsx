import type { SpeakingGoalStatus } from "@/lib/types";
import { BRAND } from "@/components/ui-kit/brand";
import { CheckCircle2, Circle } from "lucide-react";

export function SpeakingGoalChecklist({
  goals,
  goalsCompleted,
  goalsTotal,
}: {
  goals: SpeakingGoalStatus[];
  goalsCompleted: number;
  goalsTotal: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Mục tiêu</h2>
        <span className="text-xs text-muted-foreground">
          {goalsCompleted}/{goalsTotal} bắt buộc
        </span>
      </div>
      <ul className="space-y-2">
        {goals.map((g) => (
          <li key={g.key} className="flex items-start gap-2 text-sm">
            {g.completed ? (
              <CheckCircle2
                size={16}
                className="mt-0.5 flex-shrink-0"
                style={{ color: BRAND.green }}
              />
            ) : (
              <Circle size={16} className="mt-0.5 flex-shrink-0 text-muted-foreground/50" />
            )}
            <div className="min-w-0">
              <p className={g.completed ? "text-foreground" : "text-muted-foreground"}>
                {g.labelVi}
                {!g.required ? (
                  <span className="ml-1 text-xs text-muted-foreground/70">(tuỳ chọn)</span>
                ) : null}
              </p>
              {g.filled ? (
                <p className="mt-0.5 text-xs text-emerald-400/90">{g.filled}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
