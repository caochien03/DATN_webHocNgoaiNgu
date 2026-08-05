"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Edit3,
  HelpCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND } from "@/components/ui-kit/brand";
import { useTopic } from "@/lib/use-topic";

const MODES = [
  {
    slug: "flashcard",
    title: "Flashcard Lật Thẻ",
    description: "Lật thẻ tự đánh giá mức độ ghi nhớ mặt trước ↔ mặt sau.",
    icon: <Layers size={22} />,
    color: BRAND.blue,
    minCards: 1,
  },
  {
    slug: "quiz",
    title: "Trắc Nghiệm 4 Lựa Chọn",
    description: "Phản xạ nhanh: Chọn nghĩa chính xác trong 4 phương án.",
    icon: <HelpCircle size={22} />,
    color: BRAND.purple,
    minCards: 4,
  },
  {
    slug: "match",
    title: "Ghép Cặp Từ Vựng",
    description: "Nối nhanh các thẻ từ vựng với ý nghĩa tương ứng.",
    icon: <BrainCircuit size={22} />,
    color: BRAND.green,
    minCards: 2,
  },
  {
    slug: "write",
    title: "Gõ Từ Theo Nghĩa",
    description: "Luyện trí nhớ chủ động: Nhìn nghĩa và tự gõ chính xác từ vựng.",
    icon: <Edit3 size={22} />,
    color: BRAND.yellow,
    minCards: 1,
  },
];

function LearnMenu() {
  const params = useParams();
  const id = params.id as string;
  const { topic, error, loading } = useTopic(id);

  return (
    <div className="mx-auto max-w-xl pb-10">
      <Link
        href={`/topics/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Quay lại chủ đề
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {topic ? (
        <>
          <div className="mt-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Chế độ học</span>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
              Học chủ đề “{topic.title}”
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Tổng cộng <strong className="text-foreground">{topic.words.length} từ vựng</strong> · Chọn một hình thức để bắt đầu luyện tập:
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {MODES.map((m) => {
              const enough = topic.words.length >= m.minCards;
              return (
                <div key={m.slug}>
                  {enough ? (
                    <Link
                      href={`/topics/${id}/learn/${m.slug}`}
                      className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl border bg-card p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                      style={{
                        borderColor: `${m.color}30`,
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      {/* Left accent indicator */}
                      <div
                        className="absolute inset-y-0 left-0 w-1.5"
                        style={{ background: m.color }}
                      />

                      <div className="flex items-center gap-4 pl-1">
                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${m.color}, ${m.color}85)`,
                          }}
                        >
                          {m.icon}
                        </span>
                        <div>
                          <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {m.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        size={20}
                        className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                      />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 rounded-3xl border border-dashed border-border bg-card/40 p-4 opacity-60">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                        {m.icon}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground/80">{m.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Cần tối thiểu {m.minCards} thẻ từ vựng để mở chế độ này.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
