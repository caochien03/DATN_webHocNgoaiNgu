"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Flame, Sparkles, Target, Save, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, pct } from "@/components/ui-kit/brand";
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
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    setSavedSuccess(false);
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
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
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
    <div className="space-y-6">
      <PageHeader
        title="Mục tiêu ngày"
        sub={`Thiết lập mục tiêu ôn luyện hàng ngày để duy trì động lực — ${learningLanguageLabel(languageCode)}`}
      />

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 shadow-2xs">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Stat
          label="Chuỗi hiện tại"
          value={`${goal?.streak ?? 0} ngày`}
          icon={<Flame size={18} />}
          color={BRAND.yellow}
          delay={0.05}
        />
        <Stat
          label="Tiến độ hôm nay"
          value={goal ? `${goal.today.reviewedCards}/${goal.today.target}` : "—"}
          icon={<Target size={18} />}
          color={BRAND.blue}
          delay={0.1}
        />
        <Stat
          label="Chuỗi kỷ lục"
          value={`${goal?.bestStreak ?? 0} ngày`}
          icon={<Calendar size={18} />}
          color={BRAND.cyan}
          delay={0.15}
        />
      </div>

      {/* Target config & Circular Progress */}
      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
        style={{
          background: `linear-gradient(135deg, ${BRAND.blue}12 0%, transparent 60%, ${BRAND.cyan}12 100%)`,
        }}
      >
        <div className="flex flex-col items-center gap-8 sm:flex-row">
          {/* Progress Ring */}
          <div className="relative h-32 w-32 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--border)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={BRAND.blue}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(todayPercent / 100) * 251.3} 251.3`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-black text-foreground">{todayPercent}%</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Hôm nay
              </p>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              Cài đặt hạn mức
            </span>
            <h3 className="mt-1 text-lg font-black text-foreground">Số thẻ ôn mỗi ngày</h3>
            <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
              Số lượng thẻ ({learningLanguageLabel(languageCode)}) bạn cam kết ôn tập mỗi ngày để giữ vững chuỗi Streak.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <input
                type="number"
                min={1}
                max={500}
                value={inputTarget}
                onChange={(e) => setInputTarget(e.target.value)}
                className="w-28 rounded-2xl border border-border bg-card px-4 py-2.5 text-center font-mono text-base font-black text-foreground outline-none shadow-2xs focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <span className="text-xs font-bold text-muted-foreground">thẻ / ngày</span>
              <motion.button
                type="button"
                onClick={() => void saveTarget()}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-md disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                  boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {savedSuccess ? <CheckCircle2 size={15} /> : <Save size={15} />}
                <span>{saving ? "Đang lưu…" : savedSuccess ? "Đã lưu!" : "Lưu mục tiêu"}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Activity History */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div
          className="absolute inset-x-0 top-0 h-[2.5px]"
          style={{ background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.cyan})` }}
        />
        <div className="mb-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              Ma trận hoạt động
            </span>
            <h3 className="mt-1 text-base font-black text-foreground">30 ngày gần đây</h3>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
            Đạt chuẩn: {achievedDays} / 30 ngày
          </span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs font-bold text-muted-foreground">Chưa có dữ liệu lịch sử.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
            {history.map((row) => {
              const p = pct(row.reviewedCards, row.goalTarget);
              return (
                <div
                  key={row.date}
                  className="rounded-2xl border p-3 text-xs transition-all duration-150 hover:-translate-y-0.5"
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
                  <p className="font-bold text-[11px]">
                    {new Date(row.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 font-mono font-black text-sm">
                    {row.reviewedCards}/{row.goalTarget}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold opacity-80">{p}% hoàn thành</p>
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
