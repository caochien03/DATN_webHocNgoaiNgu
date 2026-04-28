"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { WriteGame } from "@/components/learn/WriteGame";
import { useLesson } from "@/lib/use-lesson";

function LessonWrite() {
  const params = useParams();
  const id = params.id as string;
  const { lesson, loading, error } = useLesson(id);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href={`/lessons/${id}/learn`}
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Chọn chế độ khác
      </Link>

      {loading ? <p className="mt-6 text-sm text-zinc-500">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {lesson ? <WriteGame cards={lesson.vocabulary} /> : null}
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
