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
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href={`/lessons/${id}`}
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Quay lại bài học
      </Link>

      {loading ? <p className="mt-6 text-sm text-zinc-500">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {lesson ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Học từ vựng “{lesson.title}”
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
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
                      className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {m.title}
                        </p>
                        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                          {m.description}
                        </p>
                      </div>
                      <span className="self-center text-zinc-400">›</span>
                    </Link>
                  ) : (
                    <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-3 opacity-70 dark:border-zinc-800">
                      <p className="font-medium text-zinc-700 dark:text-zinc-300">
                        {m.title}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500">
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
