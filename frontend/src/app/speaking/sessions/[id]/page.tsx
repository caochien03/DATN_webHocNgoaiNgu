"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, StopCircle } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SpeakingChat } from "@/components/speaking/SpeakingChat";
import { SpeakingGoalChecklist } from "@/components/speaking/SpeakingGoalChecklist";
import { SpeakingRecorder } from "@/components/speaking/SpeakingRecorder";
import { SpeakingSessionReport } from "@/components/speaking/SpeakingSessionReport";
import { PageHeader } from "@/components/ui-kit/primitives";
import {
  completeSpeakingSession,
  fetchSpeakingSession,
  submitSpeakingTurn,
} from "@/lib/speaking-api";
import type { SpeakingSessionDetail } from "@/lib/types";

type ProcessingPhase = "idle" | "recognizing" | "responding" | "grading";

function phaseLabel(phase: ProcessingPhase): string {
  switch (phase) {
    case "recognizing": return "Đang nhận diện giọng nói…";
    case "responding": return "NPC đang phản hồi…";
    case "grading": return "Đang chấm phiên…";
    default: return "Đang xử lý…";
  }
}

function SpeakingSessionContent() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<SpeakingSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<ProcessingPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  // Khi backend trả shouldEnd=true, đợi NPC nói xong rồi mới auto-complete
  const [pendingComplete, setPendingComplete] = useState(false);

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
    setError(null);
    setPhase("recognizing");
    try {
      // Sau ~1.2s nhận diện → chuyển sang phase NPC đang phản hồi
      // Luôn dùng "responding" kể cả lượt cuối để NPC vẫn nói câu cuối
      const timer = setTimeout(() => setPhase("responding"), 1200);
      const result = await submitSpeakingTurn(sessionId, blob, durationSecs);
      clearTimeout(timer);
      setSession(result);
      // Nếu backend báo nên kết thúc, đánh dấu pendingComplete
      // (sẽ auto-complete sau khi NPC phát audio xong qua onNpcSpeakEnd)
      if (result.lastTurn?.shouldEnd) {
        setPendingComplete(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không gửi được câu trả lời");
    } finally {
      setPhase("idle");
    }
  }

  async function handleComplete() {
    if (!session || completing) return;
    setCompleting(true);
    setError(null);
    try {
      setPhase("grading");
      const result = await completeSpeakingSession(sessionId);
      setSession(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể kết thúc phiên");
    } finally {
      setPhase("idle");
      setCompleting(false);
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
  const isProcessing = phase !== "idle";

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

            {/* Nút kết thúc phiên chủ động */}
            {!completed && (
              <button
                type="button"
                disabled={isProcessing || completing}
                onClick={() => void handleComplete()}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
              >
                <StopCircle size={15} />
                {completing ? "Đang kết thúc…" : "Kết thúc phiên"}
              </button>
            )}
          </aside>

          <div className="order-1 flex min-h-[420px] flex-col gap-4 lg:order-2">
            {/* Trạng thái xử lý AI */}
            {isProcessing && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
                <p className="text-sm text-primary">{phaseLabel(phase)}</p>
              </div>
            )}

            <div className="flex-1 rounded-2xl border border-border bg-card p-4">
              <SpeakingChat
                turns={session.turns}
                languageCode={session.languageCode}
                autoSpeakLatestNpc
                onNpcSpeakEnd={() => {
                  if (pendingComplete) {
                    setPendingComplete(false);
                    void handleComplete();
                  }
                }}
              />
            </div>

            {!atMaxTurns ? (
              <SpeakingRecorder
                processing={isProcessing}
                processingLabel={phaseLabel(phase)}
                disabled={isProcessing || completing}
                onSubmit={handleSubmit}
              />
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
                <CheckCircle2 size={16} className="text-green-400" />
                <p className="text-sm text-green-300">
                  Đã hết số lượt nói. Nhấn &ldquo;Kết thúc phiên&rdquo; để xem kết quả.
                </p>
              </div>
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
