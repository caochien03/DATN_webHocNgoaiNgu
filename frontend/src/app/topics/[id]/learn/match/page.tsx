"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { backLinkClass, errorClass } from "@/components/ui-kit/form-styles";
import { MatchGame } from "@/components/learn/MatchGame";
import { useTopic } from "@/lib/use-topic";

function TopicMatch() {
  const params = useParams();
  const id = params.id as string;
  const { topic, loading, error } = useTopic(id);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <Link
        href={`/topics/${id}/learn`}
        className={backLinkClass}
      >
        ← Chọn chế độ khác
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className={errorClass}>{error}</p>
      ) : null}

      {topic ? <MatchGame cards={topic.words} /> : null}
    </div>
  );
}

export default function TopicMatchPage() {
  return (
    <AuthGate>
      <TopicMatch />
    </AuthGate>
  );
}
