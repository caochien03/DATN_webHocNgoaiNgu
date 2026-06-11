"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { topikSectionLabel, topikTierLabel } from "@/lib/topik-labels";
import type { TopikQuestionAdminRow, TopikSection, TopikTier } from "@/lib/types";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

function truncate(text: string, max = 72) {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function AdminTopikQuestionsContent() {
  const [tier, setTier] = useState<TopikTier>("TOPIK_I");
  const [section, setSection] = useState<TopikSection | "">("");
  const [questions, setQuestions] = useState<TopikQuestionAdminRow[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const params = new URLSearchParams({ tier });
      if (section) params.set("section", section);
      const res = await fetchWithAuth(`/admin/topik/questions?${params}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setQuestions((await res.json()) as TopikQuestionAdminRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, [tier, section]);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => {
    if (!questions) return [];
    const map = new Map<TopikSection, TopikQuestionAdminRow[]>();
    for (const q of questions) {
      const list = map.get(q.section) ?? [];
      list.push(q);
      map.set(q.section, list);
    }
    const order: TopikSection[] = ["LISTENING", "READING", "WRITING"];
    return order
      .filter((s) => map.has(s))
      .map((s) => ({
        section: s,
        items: (map.get(s) ?? []).sort((a, b) => a.questionNo - b.questionNo),
      }));
  }, [questions]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Quản trị câu hỏi TOPIK
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Sửa từng câu đã gắn trong đề. Tạo đề mới tại{" "}
            <Link href="/admin/topik/exams" className="underline">
              quản trị đề TOPIK
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/topik/questions/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          + Tạo câu mới
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Cấp độ</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as TopikTier)}
            className={inputClass}
          >
            <option value="TOPIK_I">{topikTierLabel("TOPIK_I")}</option>
            <option value="TOPIK_II">{topikTierLabel("TOPIK_II")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Phần thi</span>
          <select
            value={section}
            onChange={(e) =>
              setSection(e.target.value as TopikSection | "")
            }
            className={inputClass}
          >
            <option value="">Tất cả</option>
            <option value="LISTENING">{topikSectionLabel("LISTENING")}</option>
            <option value="READING">{topikSectionLabel("READING")}</option>
            <option value="WRITING">{topikSectionLabel("WRITING")}</option>
          </select>
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {questions === null ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
      ) : questions.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Chưa có câu hỏi.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.section}>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {topikSectionLabel(group.section)}
                <span className="ml-2 font-normal text-zinc-500">
                  ({group.items.length} câu)
                </span>
              </h2>
              <ul className="mt-2 flex flex-col gap-2">
                {group.items.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        Câu {q.questionNo}
                        {!q.isPublished ? (
                          <span className="ml-2 text-xs font-normal text-amber-700 dark:text-amber-400">
                            Ẩn
                          </span>
                        ) : null}
                        {q.section === "LISTENING" ? (
                          <span className="ml-2 text-xs font-normal text-zinc-500">
                            {q.audioUrl ? "có audio" : "chưa có audio"}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {truncate(q.prompt)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/topik/questions/${q.id}/edit`}
                      className="shrink-0 text-sm text-zinc-700 hover:underline dark:text-zinc-300"
                    >
                      Sửa
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTopikQuestionsPage() {
  return (
    <AdminGate>
      <AdminTopikQuestionsContent />
    </AdminGate>
  );
}
