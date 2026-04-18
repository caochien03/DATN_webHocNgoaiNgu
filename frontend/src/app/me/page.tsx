"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { getStoredAuth, type AuthUser } from "@/lib/auth-storage";

function ProfileContent() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredAuth()?.user ?? null);
  }, []);

  if (!user) {
    return (
      <p className="px-4 py-10 text-center text-sm text-zinc-500">
        Không đọc được hồ sơ.
      </p>
    );
  }

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : null;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Hồ sơ
      </h1>

      <div className="mt-4 flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {(user.name || user.email).slice(0, 1)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
            {user.name || "(chưa đặt tên)"}
          </p>
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <dt className="text-xs uppercase tracking-wide text-zinc-500">
            Email
          </dt>
          <dd className="mt-1 break-all text-zinc-900 dark:text-zinc-100">
            {user.email}
          </dd>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <dt className="text-xs uppercase tracking-wide text-zinc-500">
            Tham gia
          </dt>
          <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
            {createdAt ?? "—"}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-sm text-zinc-500">
        Tiến độ học được hiển thị ở trang <span className="font-medium">Bộ từ của tôi</span>.
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileContent />
    </AuthGate>
  );
}
