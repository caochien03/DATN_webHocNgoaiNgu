"use client";

import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";

function AdminTopicsPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Quản trị chủ đề
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        API admin đã sẵn sàng (<code className="text-xs">/admin/topics</code>).
        Giao diện danh sách và chỉnh sửa sẽ có ở bước tiếp theo.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/admin/lessons"
          className="text-zinc-700 hover:underline dark:text-zinc-300"
        >
          ← Quản trị bài học
        </Link>
        <Link
          href="/topics"
          className="text-zinc-700 hover:underline dark:text-zinc-300"
        >
          Xem chủ đề (học viên)
        </Link>
      </div>
    </div>
  );
}

export default function AdminTopicsPage() {
  return (
    <AdminGate>
      <AdminTopicsPlaceholder />
    </AdminGate>
  );
}
