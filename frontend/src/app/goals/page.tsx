"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Flame, Target } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, GRADIENT, pct } from "@/components/ui-kit/brand";
import { PageHeader, Stat } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { GoalHistoryRow, GoalMeResponse } from "@/lib/types";

function GoalsContent() {
  const [goal, setGoal] = useState<GoalMeResponse | null>(null);
  const [history, setHistory] = useState<GoalHistoryRow[]>([]);
  const [inputTarget, setInputTarget] = useState("20");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [goalRes, historyRes] = await Promise.all([
        fetchWithAuth("/goals/me"),
        fetchWithAuth("/goals/me/history?days=30"),
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
  }, []);

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
      const res = await fetchWithAuth("/goals/me", {
        method: "PATCH",
        body: JSON.stringify({ dailyCardTarget }),
      });
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
    <div>
      <PageHeader
        title="Mục tiêu ngày"
        sub="Đặt số thẻ ôn mỗi ngày và theo dõi chuỗi học liên tục"
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
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

      <div className="mb-6 flex items-center gap-8 rounded-2xl border border-border bg-card p-6">
        <div className="relative h-28 w-28 flex-shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={BRAND.blue}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(todayPercent / 100) * 251.3} 251.3`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-foreground">{todayPercent}%</p>
            <p className="text-[10px] text-muted-foreground">hôm nay</p>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Đặt mục tiêu mỗi ngày</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Số thẻ cần ôn để duy trì chuỗi học.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={500}
              value={inputTarget}
              onChange={(e) => setInputTarget(e.target.value)}
              className="w-28 rounded-xl border border-border bg-secondary px-3 py-2 text-center font-mono text-foreground outline-none focus:border-primary/50"
            />
            <span className="text-sm text-muted-foreground">thẻ/ngày</span>
            <button
              type="button"
              onClick={() => void saveTarget()}
              disabled={saving}
              className="ml-auto rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: GRADIENT }}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">30 ngày gần đây</h3>
          <p className="text-xs text-muted-foreground">
            Đạt mục tiêu: {achievedDays} ngày
          </p>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu lịch sử.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {history.map((row) => {
              const p = pct(row.reviewedCards, row.goalTarget);
              return (
                <div
                  key={row.date}
                  className="rounded-xl border px-3 py-2 text-xs"
                  style={
                    row.goalAchieved
                      ? {
                          borderColor: `${BRAND.green}40`,
                          backgroundColor: `${BRAND.green}12`,
                          color: BRAND.green,
                        }
                      : {
                          borderColor: "var(--border)",
                          backgroundColor: "rgba(255,255,255,0.02)",
                          color: BRAND.muted,
                        }
                  }
                >
                  <p>{new Date(row.date).toLocaleDateString("vi-VN")}</p>
                  <p className="mt-1 font-mono">
                    {row.reviewedCards}/{row.goalTarget} ({p}%)
                  </p>
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
