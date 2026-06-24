"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { useLesson } from "@/lib/use-lesson";

const MODES = [
  {
    slug: "flashcard",
    title: "Flashcard",
    description: "Lật thẻ từ vựng của bài.",
    minCards: 1,
  },
  {
    slug: "quiz",
    title: "Trắc nghiệm",
    description: "Chọn nghĩa đúng trong 4 phương án.",
    minCards: 4,
  },
  {
    slug: "match",
    title: "Ghép cặp",
    description: "Nối từ với nghĩa.",
    minCards: 2,
  },
  {
    slug: "write",
    title: "Nhìn nghĩa, viết từ",
    description: "Gõ từ tiếng Hàn khi thấy nghĩa tiếng Việt.",
    minCards: 1,
  },
];

function LessonLearnMenu() {
  const params = useParams();
  const id = params.id as string;
  const { lesson, error, loading } = useLesson(id);

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/lessons/${id}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Quay lại bài học
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {lesson ? (
        <>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Học từ vựng “{lesson.title}”
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lesson.vocabulary.length} từ trong bài.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {MODES.map((m) => {
              const enough = lesson.vocabulary.length >= m.minCards;
              return (
                <li key={m.slug}>
                  {enough ? (
                    <Link
                      href={`/lessons/${id}/learn/${m.slug}`}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{m.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {m.description}
                        </p>
                      </div>
                      <span className="self-center text-muted-foreground">›</span>
                    </Link>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-3 opacity-70">
                      <p className="font-semibold text-foreground/80">{m.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Cần tối thiểu {m.minCards} từ để chơi.
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export default function LessonLearnPage() {
  return (
    <AuthGate>
      <LessonLearnMenu />
    </AuthGate>
  );
}
