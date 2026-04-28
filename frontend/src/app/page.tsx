/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api-fetch";
import { getStoredAuth } from "@/lib/auth-storage";
import type { GoalMeResponse } from "@/lib/types";

function ReviewTodayWidget() {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (!getStoredAuth()) {
      setIsAuth(false);
      setDueCount(null);
      return;
    }
    setIsAuth(true);
    void fetchWithAuth("/review/today/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.dueCount === "number") setDueCount(data.dueCount);
      })
      .catch(() => {
        setDueCount(null);
      });
  }, []);

  if (!isAuth) return null;

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 text-left dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs uppercase tracking-wide text-zinc-500">Ôn hôm nay</p>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {dueCount === null ? "Đang tải..." : `${dueCount} thẻ đến hạn`}
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Mỗi phiên 10-20 thẻ để giữ nhịp học đều mỗi ngày.
      </p>
      <Link
        href="/review/today"
        className="mt-3 inline-block rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        Bắt đầu ôn
      </Link>
    </div>
  );
}

function DailyGoalWidget() {
  const [goal, setGoal] = useState<GoalMeResponse | null>(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (!getStoredAuth()) {
      setIsAuth(false);
      setGoal(null);
      return;
    }
    setIsAuth(true);
    void fetchWithAuth("/goals/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setGoal(data as GoalMeResponse);
      })
      .catch(() => {
        setGoal(null);
      });
  }, []);

  if (!isAuth) return null;
  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 text-left dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs uppercase tracking-wide text-zinc-500">Mục tiêu ngày</p>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {goal
          ? `${goal.today.reviewedCards}/${goal.today.target} thẻ (${goal.today.percent}%)`
          : "Đang tải..."}
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {goal
          ? `Chuỗi hiện tại: ${goal.streak} ngày liên tiếp`
          : "Theo dõi tiến độ học đều mỗi ngày."}
      </p>
      <Link
        href="/goals"
        className="mt-3 inline-block rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        Quản lý mục tiêu
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <main className="w-full max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Đồ án tốt nghiệp
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Học ngoại ngữ theo lộ trình
        </h1>
        <p className="mt-3 text-pretty text-zinc-600 dark:text-zinc-400">
          Đăng ký hoặc đăng nhập để bắt đầu lưu bộ từ và tiến độ học. Giao diện sẽ
          được hoàn thiện sau khi các chức năng lõi ổn định.
        </p>
        <ReviewTodayWidget />
        <DailyGoalWidget />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/topics"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Chủ đề từ vựng
          </Link>
          <Link
            href="/paths"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Lộ trình
          </Link>
          <Link
            href="/lessons"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Bài học
          </Link>
          <Link
            href="/decks"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Bộ từ của tôi
          </Link>
          <Link
            href="/tests"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Kiểm tra
          </Link>
          <Link
            href="/review/today"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Ôn hôm nay
          </Link>
          <Link
            href="/goals"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Mục tiêu ngày
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Tạo tài khoản
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Đăng nhập
          </Link>
        </div>
      </main>
    </div>
  );
}
