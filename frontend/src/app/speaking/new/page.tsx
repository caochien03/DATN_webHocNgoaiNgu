"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SpeakingGoalChecklist } from "@/components/speaking/SpeakingGoalChecklist";
import { SpeakKoreanButton } from "@/components/speaking/SpeakKoreanButton";
import { BRAND } from "@/components/ui-kit/brand";
import { Card, GradientButton, PageHeader } from "@/components/ui-kit/primitives";
import {
  createSpeakingSession,
  fetchSpeakingSituations,
  fetchSpeakingTopics,
  SPEAKING_LEVEL_OPTIONS,
  speakingLevelLabel,
} from "@/lib/speaking-api";
import type { SpeakingSelfLevel, SpeakingSituationRow, SpeakingTopicRow } from "@/lib/types";
import { cn } from "@/lib/cn";

type Step = "survey" | "situations" | "intro";

function SpeakingNewContent() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("survey");
  const [topics, setTopics] = useState<SpeakingTopicRow[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selfLevel, setSelfLevel] = useState<SpeakingSelfLevel>("INTERMEDIATE");
  const [situations, setSituations] = useState<SpeakingSituationRow[]>([]);
  const [selectedSituation, setSelectedSituation] = useState<SpeakingSituationRow | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSpeakingTopics()
      .then(setTopics)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Không tải được chủ đề"),
      );
  }, []);

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const loadSituations = useCallback(async () => {
    if (selectedTopicIds.length === 0) {
      setError("Chọn ít nhất một chủ đề.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSpeakingSituations({
        topicIds: selectedTopicIds,
        level: selfLevel,
      });
      setSituations(rows);
      setStep("situations");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được tình huống");
    } finally {
      setLoading(false);
    }
  }, [selectedTopicIds, selfLevel]);

  async function startSession() {
    if (!selectedSituation) return;
    setLoading(true);
    setError(null);
    try {
      const session = await createSpeakingSession({
        situationId: selectedSituation.id,
        selectedTopicIds,
        selfLevel,
      });
      router.push(`/speaking/sessions/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tạo được phiên");
      setLoading(false);
    }
  }

  const stepTitle = useMemo(() => {
    if (step === "survey") return "Khảo sát";
    if (step === "situations") return "Chọn tình huống";
    return "Sẵn sàng bắt đầu";
  }, [step]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/speaking"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Quay lại
      </Link>

      <PageHeader
        title="Phiên luyện nói mới"
        sub={stepTitle}
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {step === "survey" ? (
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Chủ đề quen thuộc (chọn 1–3)
            </h2>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => {
                const active = selectedTopicIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopic(t.id)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm transition",
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {t.title}
                    {t.titleKo ? (
                      <span className="ml-1 text-xs opacity-70">{t.titleKo}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Trình độ tự đánh giá
            </h2>
            <div className="space-y-2">
              {SPEAKING_LEVEL_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                    selfLevel === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30",
                  )}
                >
                  <input
                    type="radio"
                    name="level"
                    className="mt-1"
                    checked={selfLevel === opt.value}
                    onChange={() => setSelfLevel(opt.value)}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.hint}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <GradientButton
            disabled={loading || selectedTopicIds.length === 0}
            onClick={() => void loadSituations()}
            className="inline-flex items-center gap-2"
          >
            Tiếp tục
            <ArrowRight size={16} />
          </GradientButton>
        </div>
      ) : null}

      {step === "situations" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Trình độ: <strong className="text-foreground">{speakingLevelLabel(selfLevel)}</strong>
          </p>
          {situations.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Không có tình huống phù hợp. Thử đổi trình độ hoặc chủ đề.
            </Card>
          ) : (
            situations.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSituation(s);
                  setStep("intro");
                }}
                className="w-full rounded-2xl border border-border bg-card p-5 text-left transition hover:border-primary/40 hover:bg-muted/20"
              >
                <p className="font-semibold text-foreground">{s.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.contextVi}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Bạn: {s.userRoleVi} · NPC: {s.npcRoleVi} · Tối đa {s.maxUserTurns}{" "}
                  lượt nói
                </p>
              </button>
            ))
          )}
          <button
            type="button"
            onClick={() => setStep("survey")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Đổi khảo sát
          </button>
        </div>
      ) : null}

      {step === "intro" && selectedSituation ? (
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-foreground">{selectedSituation.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {selectedSituation.contextVi}
            </p>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Vai bạn:</span>{" "}
                {selectedSituation.userRoleVi}
              </p>
              <p>
                <span className="text-muted-foreground">Vai NPC:</span>{" "}
                {selectedSituation.npcRoleVi}
              </p>
            </div>
            {selectedSituation.openingLineKo ? (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Câu mở đầu NPC</p>
                  <SpeakKoreanButton text={selectedSituation.openingLineKo} />
                </div>
                <p className="mt-2 text-sm" style={{ color: BRAND.cyan }}>
                  {selectedSituation.openingLineKo}
                </p>
              </div>
            ) : null}
          </Card>

          <SpeakingGoalChecklist
            goals={selectedSituation.goals}
            goalsCompleted={0}
            goalsTotal={selectedSituation.goalsTotal}
          />

          <div className="flex flex-wrap gap-3">
            <GradientButton disabled={loading} onClick={() => void startSession()}>
              {loading ? "Đang tạo phiên…" : "Bắt đầu hội thoại"}
            </GradientButton>
            <button
              type="button"
              onClick={() => setStep("situations")}
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground"
            >
              Chọn tình huống khác
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SpeakingNewPage() {
  return (
    <AuthGate>
      <SpeakingNewContent />
    </AuthGate>
  );
}
