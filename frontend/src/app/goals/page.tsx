"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Mục tiêu hằng ngày
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Đặt số thẻ ôn mỗi ngày và theo dõi chuỗi học liên tục.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Hôm nay</p>
        <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {goal
            ? `${goal.today.reviewedCards}/${goal.today.target} thẻ (${goal.today.percent}%)`
            : "Đang tải..."}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {goal
            ? `Chuỗi hiện tại: ${goal.streak} ngày · Tốt nhất: ${goal.bestStreak} ngày`
            : "Đang tính chuỗi học liên tục..."}
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">
          Mục tiêu số thẻ mỗi ngày
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={500}
            value={inputTarget}
            onChange={(e) => setInputTarget(e.target.value)}
            className="w-40 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={() => void saveTarget()}
            disabled={saving}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Lưu
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            30 ngày gần đây
          </p>
          <p className="text-xs text-zinc-500">Đạt mục tiêu: {achievedDays} ngày</p>
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Chưa có dữ liệu lịch sử.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {history.map((row) => (
              <li
                key={row.date}
                className={`rounded-md border px-2 py-2 text-xs ${
                  row.goalAchieved
                    ? "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                <p>{new Date(row.date).toLocaleDateString("vi-VN")}</p>
                <p className="mt-1">
                  {row.reviewedCards}/{row.goalTarget} thẻ
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
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
