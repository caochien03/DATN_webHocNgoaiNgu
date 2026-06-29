"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SpeakingChat } from "@/components/speaking/SpeakingChat";
import { SpeakingGoalChecklist } from "@/components/speaking/SpeakingGoalChecklist";
import { SpeakingRecorder } from "@/components/speaking/SpeakingRecorder";
import { SpeakingSessionReport } from "@/components/speaking/SpeakingSessionReport";
import { PageHeader } from "@/components/ui-kit/primitives";
import {
  fetchSpeakingSession,
  submitSpeakingTurn,
} from "@/lib/speaking-api";
import type { SpeakingSessionDetail } from "@/lib/types";

function SpeakingSessionContent() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<SpeakingSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setSession(await fetchSpeakingSession(sessionId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được phiên");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(blob: Blob, durationSecs: number) {
    if (!session || session.status !== "IN_PROGRESS") return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitSpeakingTurn(sessionId, blob, durationSecs);
      setSession(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không gửi được câu trả lời");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Đang tải phiên…</p>;
  }

  if (!session) {
    return (
      <div>
        <p className="text-sm text-red-400">{error ?? "Không tìm thấy phiên."}</p>
        <Link href="/speaking" className="mt-4 inline-block text-sm text-primary">
          ← Về trang luyện nói
        </Link>
      </div>
    );
  }

  const completed = session.status === "COMPLETED";
  const atMaxTurns = session.userTurnCount >= session.situation.maxUserTurns;

  return (
    <div>
      <Link
        href="/speaking"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Luyện nói
      </Link>

      <PageHeader
        title={session.situation.title}
        sub={
          completed
            ? "Báo cáo phiên luyện nói"
            : `Lượt ${session.userTurnCount}/${session.situation.maxUserTurns} · ${session.situation.npcRoleVi}`
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {completed ? (
        <SpeakingSessionReport session={session} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 lg:order-1">
            <SpeakingGoalChecklist
              goals={session.situation.goals}
              goalsCompleted={session.goalsCompleted ?? 0}
              goalsTotal={session.goalsTotal ?? 0}
            />
          </aside>

          <div className="order-1 flex min-h-[420px] flex-col gap-4 lg:order-2">
            <div className="flex-1 rounded-2xl border border-border bg-card p-4">
              <SpeakingChat turns={session.turns} autoSpeakLatestNpc />
            </div>

            {!atMaxTurns ? (
              <SpeakingRecorder
                processing={submitting}
                processingLabel={
                  session.userTurnCount + 1 >= session.situation.maxUserTurns ||
                  session.goalsCompleted === session.goalsTotal
                    ? "Đang chấm phiên…"
                    : "Đang xử lý…"
                }
                disabled={submitting}
                onSubmit={handleSubmit}
              />
            ) : (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Đã hết số lượt nói. Phiên sẽ kết thúc sau lượt cuối hoặc khi đủ
                mục tiêu.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpeakingSessionPage() {
  return (
    <AuthGate>
      <SpeakingSessionContent />
    </AuthGate>
  );
}
