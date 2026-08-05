"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Flame, Sparkles, Target } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, GRADIENT, pct } from "@/components/ui-kit/brand";
import { PageHeader, Stat } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import { learningLanguageLabel } from "@/lib/learning-language";
import type { GoalHistoryRow, GoalMeResponse } from "@/lib/types";

function GoalsContent() {
  const { languageCode } = useLearningLanguage();
  const [goal, setGoal] = useState<GoalMeResponse | null>(null);
  const [history, setHistory] = useState<GoalHistoryRow[]>([]);
  const [inputTarget, setInputTarget] = useState("20");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [goalRes, historyRes] = await Promise.all([
        fetchWithAuth(appendLanguageQuery("/goals/me", languageCode)),
        fetchWithAuth(
          appendLanguageQuery("/goals/me/history?days=30", languageCode),
        ),
      ]);
      if (!goalRes.ok || !historyRes.ok) {
        const failed = !goalRes.ok ? goalRes : historyRes;
        setError(await parseApiError(failed));
        return;
      }
      const goalData = (await goalRes.json()) as GoalMeResponse;
      setGoal(goalData);
      setInputTarget(String(goalData.dailyCardTarget));
      setHistory((await historyRes.json()) as GoalHistoryRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được mục tiêu");
    }
  }, [languageCode]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveTarget() {
    const dailyCardTarget = Number(inputTarget);
    if (!Number.isFinite(dailyCardTarget) || dailyCardTarget < 1) {
      setError("Mục tiêu phải là số lớn hơn 0.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/goals/me", languageCode),
        {
          method: "PATCH",
          body: JSON.stringify({ dailyCardTarget }),
        },
      );
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setGoal((await res.json()) as GoalMeResponse);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được mục tiêu");
    } finally {
      setSaving(false);
    }
  }

  const achievedDays = useMemo(
    () => history.filter((row) => row.goalAchieved).length,
    [history],
  );

  const todayPercent = goal?.today.percent ?? 0;

  return (
    <div className="pb-10">
      <PageHeader
        title="Mục tiêu ngày"
        sub={`Đặt số thẻ ôn mỗi ngày và theo dõi chuỗi học — ${learningLanguageLabel(languageCode)}`}
      />

      {error ? (
        <p className="mb-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="Chuỗi hiện tại"
          value={`${goal?.streak ?? 0} ngày`}
          icon={<Flame size={18} />}
          color={BRAND.yellow}
          delay={0.05}
        />
        <Stat
          label="Hôm nay"
          value={goal ? `${goal.today.reviewedCards}/${goal.today.target}` : "—"}
          icon={<Target size={18} />}
          color={BRAND.blue}
          delay={0.1}
        />
        <Stat
          label="Chuỗi tốt nhất"
          value={`${goal?.bestStreak ?? 0} ngày`}
          icon={<Calendar size={18} />}
          color={BRAND.cyan}
          delay={0.15}
        />
      </div>

      {/* Target config & Circular Progress */}
      <div
        className="mb-6 relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
        style={{
          background: `linear-gradient(135deg, ${BRAND.blue}12 0%, transparent 60%, ${BRAND.cyan}12 100%)`,
        }}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative h-32 w-32 flex-shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--border)"
                strokeWidth="9"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={BRAND.blue}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(todayPercent / 100) * 251.3} 251.3`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-black text-foreground">{todayPercent}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Hôm nay
              </p>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Cấu hình</span>
            <h3 className="mt-1 text-xl font-bold text-foreground">Đặt mục tiêu mỗi ngày</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Số thẻ từ vựng ({learningLanguageLabel(languageCode)}) cần ôn luyện mỗi ngày để duy trì chuỗi Streak.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <input
                type="number"
                min={1}
                max={500}
                value={inputTarget}
                onChange={(e) => setInputTarget(e.target.value)}
                className="w-28 rounded-2xl border border-border bg-card px-4 py-2.5 text-center font-mono text-base font-bold text-foreground outline-none shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-sm font-semibold text-muted-foreground">thẻ / ngày</span>
              <button
                type="button"
                onClick={() => void saveTarget()}
                disabled={saving}
                className="rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                  boxShadow: `0 4px 12px 0 ${BRAND.blue}35`,
                }}
              >
                {saving ? "Đang lưu…" : "Lưu mục tiêu"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Activity History */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.cyan})` }}
        />
        <div className="mb-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Lịch sử</span>
            <h3 className="mt-1 text-lg font-bold text-foreground">30 ngày gần đây</h3>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">
            Đạt chuẩn: {achievedDays} / 30 ngày
          </span>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu lịch sử.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
            {history.map((row) => {
              const p = pct(row.reviewedCards, row.goalTarget);
              return (
                <div
                  key={row.date}
                  className="group rounded-2xl border p-3 text-xs transition-all duration-150 hover:-translate-y-0.5"
                  style={
                    row.goalAchieved
                      ? {
                          borderColor: `${BRAND.green}40`,
                          backgroundColor: `${BRAND.green}14`,
                          color: BRAND.green,
                          boxShadow: `0 2px 8px 0 ${BRAND.green}15`,
                        }
                      : row.reviewedCards > 0
                      ? {
                          borderColor: `${BRAND.yellow}35`,
                          backgroundColor: `${BRAND.yellow}10`,
                          color: BRAND.yellow,
                        }
                      : {
                          borderColor: "var(--border)",
                          backgroundColor: "var(--card)",
                          color: "var(--muted-foreground)",
                        }
                  }
                >
                  <p className="font-semibold text-[11px]">
                    {new Date(row.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 font-mono font-bold text-sm">
                    {row.reviewedCards}/{row.goalTarget}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold opacity-80">{p}% hoàn thành</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <AuthGate>
      <GoalsContent />
    </AuthGate>
  );
}
