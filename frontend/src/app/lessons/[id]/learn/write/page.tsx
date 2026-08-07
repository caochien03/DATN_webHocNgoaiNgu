"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { backLinkClass, errorClass } from "@/components/ui-kit/form-styles";
import { fetchWithAuth } from "@/lib/api-fetch";
import { WriteGame } from "@/components/learn/WriteGame";
import { useLesson } from "@/lib/use-lesson";

function LessonWrite() {
  const params = useParams();
  const id = params.id as string;
  const { lesson, loading, error } = useLesson(id);

  const handleComplete = (score: number, total: number) => {
    const finalPct = total > 0 ? Math.round((score / total) * 100) : 0;
    void fetchWithAuth("/quiz-attempts", {
      method: "POST",
      body: JSON.stringify({
        sourceType: "LESSON",
        sourceId: id,
        sourceTitle: `${lesson?.title ?? "Bài học"} - Luyện viết từ vựng`,
        languageCode: lesson?.languageCode ?? "ko",
        totalQuestions: total,
        correctAnswers: score,
        scorePercent: finalPct,
      }),
    }).then(() => {
      if (finalPct >= 80) {
        void fetchWithAuth("/paths/complete-by-source", {
          method: "POST",
          body: JSON.stringify({ sourceType: "LESSON", sourceId: id }),
        });
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href={`/lessons/${id}/learn`}
        className={backLinkClass}
      >
        ← Chọn chế độ khác
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className={errorClass}>{error}</p>
      ) : null}

      {lesson ? <WriteGame cards={lesson.vocabulary} onComplete={handleComplete} /> : null}
    </div>
  );
}

export default function LessonWritePage() {
  return (
    <AuthGate>
      <LessonWrite />
    </AuthGate>
  );
}
