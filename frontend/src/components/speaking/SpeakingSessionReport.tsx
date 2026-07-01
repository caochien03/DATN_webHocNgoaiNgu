import Link from "next/link";
import type { SpeakingSessionDetail } from "@/lib/types";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { Bar, GradientButton } from "@/components/ui-kit/primitives";
import { SpeakingGoalChecklist } from "./SpeakingGoalChecklist";
import { SpeakingChat } from "./SpeakingChat";

function avgRubric(session: SpeakingSessionDetail) {
  const userTurns = session.turns.filter((t) => t.speaker === "USER" && t.grading);
  if (userTurns.length === 0) return null;
  const n = userTurns.length;
  return {
    task: userTurns.reduce((s, t) => s + (t.grading?.task ?? 0), 0) / n,
    grammar: userTurns.reduce((s, t) => s + (t.grading?.grammar ?? 0), 0) / n,
    vocabulary: userTurns.reduce((s, t) => s + (t.grading?.vocabulary ?? 0), 0) / n,
    coherence: userTurns.reduce((s, t) => s + (t.grading?.coherence ?? 0), 0) / n,
  };
}

export function SpeakingSessionReport({
  session,
}: {
  session: SpeakingSessionDetail;
}) {
  const score = session.overallScore ?? 0;
  const color = scoreColor(score);
  const rubric = avgRubric(session);

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border p-6 text-center"
        style={{
          borderColor: `${color}40`,
          backgroundColor: `${color}08`,
        }}
      >
        <p className="text-sm text-muted-foreground">Hoàn thành phiên luyện nói</p>
        <p className="mt-2 text-3xl font-bold" style={{ color }}>
          {Math.round(score)}/100
        </p>
        {session.estimatedLevel ? (
          <p className="mt-1 text-lg font-semibold text-foreground">
            {session.estimatedLevel}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">
          Mục tiêu bắt buộc: {session.goalsCompleted ?? 0}/{session.goalsTotal ?? 0}
        </p>
      </div>

      {session.summaryFeedback ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Nhận xét tổng</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {session.summaryFeedback}
          </p>
        </div>
      ) : null}

      {rubric ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Trung bình theo tiêu chí
          </h2>
          <div className="space-y-3">
            {(
              [
                ["Nhiệm vụ", rubric.task, BRAND.blue],
                ["Ngữ pháp", rubric.grammar, BRAND.purple],
                ["Từ vựng", rubric.vocabulary, BRAND.cyan],
                ["Mạch lạc", rubric.coherence, BRAND.green],
              ] as const
            ).map(([label, val, c]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{val.toFixed(1)}/5</span>
                </div>
                <Bar done={val} total={5} color={c} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <SpeakingGoalChecklist
        goals={session.situation.goals}
        goalsCompleted={session.goalsCompleted ?? 0}
        goalsTotal={session.goalsTotal ?? 0}
      />

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Hội thoại</h2>
        <SpeakingChat
          turns={session.turns}
          languageCode={session.languageCode}
          showGrading
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/speaking/new">
          <GradientButton>Tình huống khác</GradientButton>
        </Link>
        <Link
          href="/speaking"
          className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30"
        >
          Về trang luyện nói
        </Link>
      </div>
    </div>
  );
}
