"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { useTopic } from "@/lib/use-topic";

const MODES: {
  slug: string;
  title: string;
  description: string;
  minCards: number;
}[] = [
  {
    slug: "flashcard",
    title: "Flashcard",
    description: "Lật thẻ: mặt trước ↔ mặt sau.",
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
    description: "Gõ mặt trước khi thấy mặt sau.",
    minCards: 1,
  },
];

function LearnMenu() {
  const params = useParams();
  const id = params.id as string;
  const { topic, error, loading } = useTopic(id);

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/topics/${id}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Quay lại chủ đề
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {topic ? (
        <>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Học chủ đề “{topic.title}”
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {topic.words.length} từ · Đây là chế độ luyện nhanh; kết quả trò chơi
            không được lưu vào tiến độ học tập.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {MODES.map((m) => {
              const enough = topic.words.length >= m.minCards;
              return (
                <li key={m.slug}>
                  {enough ? (
                    <Link
                      href={`/topics/${id}/learn/${m.slug}`}
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
                    <div className="flex items-start justify-between gap-3 rounded-2xl border border-dashed border-border px-4 py-3 opacity-70">
                      <div>
                        <p className="font-semibold text-foreground/80">{m.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Cần tối thiểu {m.minCards} thẻ để chơi.
                        </p>
                      </div>
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

export default function TopicLearnMenuPage() {
  return (
    <AuthGate>
      <LearnMenu />
    </AuthGate>
  );
}
