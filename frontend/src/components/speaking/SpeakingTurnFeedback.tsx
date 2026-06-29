import type { SpeakingTurnGrading } from "@/lib/types";
import { scoreColor } from "@/components/ui-kit/brand";

export function SpeakingTurnFeedback({ grading }: { grading: SpeakingTurnGrading }) {
  const color = scoreColor(grading.score);

  return (
    <div
      className="mt-2 rounded-xl border p-3 text-sm"
      style={{
        borderColor: `${color}40`,
        backgroundColor: `${color}10`,
      }}
    >
      <p className="font-semibold" style={{ color }}>
        {grading.score}/100
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Nhiệm vụ: {grading.task}/5</span>
        <span>Ngữ pháp: {grading.grammar}/5</span>
        <span>Từ vựng: {grading.vocabulary}/5</span>
        <span>Mạch lạc: {grading.coherence}/5</span>
      </div>
      {grading.feedback ? (
        <p className="mt-2 text-xs leading-relaxed text-foreground/90">{grading.feedback}</p>
      ) : null}
      {grading.sampleImprovement ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Gợi ý:{" "}
          <span className="font-medium text-foreground">{grading.sampleImprovement}</span>
        </p>
      ) : null}
    </div>
  );
}
