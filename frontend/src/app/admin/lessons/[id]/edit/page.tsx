"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { GRAMMAR_LEVELS } from "@/lib/grammar-levels";
import type { AdminLessonDetail, GrammarLevel } from "@/lib/types";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

function EditLessonContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lesson, setLesson] = useState<AdminLessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [level, setLevel] = useState<GrammarLevel>("BEGINNER_1");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [vocabFront, setVocabFront] = useState("");
  const [vocabBack, setVocabBack] = useState("");
  const [pointTitle, setPointTitle] = useState("");
  const [pointMeaning, setPointMeaning] = useState("");
  const [exPrompt, setExPrompt] = useState("");
  const [exOptions, setExOptions] = useState("");
  const [exCorrect, setExCorrect] = useState("0");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/lessons/${id}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const data = (await res.json()) as AdminLessonDetail;
      setLesson(data);
      setLevel(data.level);
      setTitle(data.title);
      setSummary(data.summary ?? "");
      setSortOrder(String(data.sortOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được bài học");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/lessons/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          level,
          title: title.trim(),
          summary: summary.trim() || null,
          sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  }

  async function removeLesson() {
    if (!confirm("Xóa bài học và toàn bộ nội dung?")) return;
    const res = await fetchWithAuth(`/admin/lessons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await parseApiError(res));
      return;
    }
    router.push("/admin/lessons");
    router.refresh();
  }

  async function apiPost(path: string, body: unknown) {
    const res = await fetchWithAuth(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    await load();
  }

  async function removeRow(path: string) {
    if (!confirm("Xóa mục này?")) return;
    const res = await fetchWithAuth(path, { method: "DELETE" });
    if (!res.ok) {
      setError(await parseApiError(res));
      return;
    }
    await load();
  }

  if (!lesson && !error) {
    return <p className="px-4 py-8 text-sm text-zinc-500">Đang tải…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/lessons"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Danh sách admin
      </Link>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {lesson ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Sửa bài học
          </h1>
          <form onSubmit={saveMeta} className="mt-4 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <label className="flex flex-col gap-1 text-sm">
              <span>Cấp độ</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as GrammarLevel)}
                className={inputClass}
              >
                {GRAMMAR_LEVELS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Tiêu đề</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Tóm tắt</span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Thứ tự</span>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={inputClass}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {saving ? "Đang lưu…" : "Lưu thông tin bài"}
              </button>
              <button
                type="button"
                onClick={() => void removeLesson()}
                className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:text-red-400"
              >
                Xóa bài
              </button>
            </div>
          </form>

          <section className="mt-8">
            <h2 className="text-sm font-medium">Từ vựng ({lesson.vocabulary.length})</h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {lesson.vocabulary.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-2 rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                >
                  <span>
                    {w.frontText} — {w.backText}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void removeRow(`/admin/lessons/${id}/vocabulary/${w.id}`)
                    }
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex flex-col gap-2 rounded border border-dashed border-zinc-300 p-3 dark:border-zinc-700"
              onSubmit={(e) => {
                e.preventDefault();
                void apiPost(`/admin/lessons/${id}/vocabulary`, {
                  frontText: vocabFront.trim(),
                  backText: vocabBack.trim(),
                })
                  .then(() => {
                    setVocabFront("");
                    setVocabBack("");
                  })
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : "Lỗi"),
                  );
              }}
            >
              <input
                required
                placeholder="Mặt trước (tiếng Hàn)"
                value={vocabFront}
                onChange={(e) => setVocabFront(e.target.value)}
                className={inputClass}
              />
              <input
                required
                placeholder="Mặt sau (nghĩa)"
                value={vocabBack}
                onChange={(e) => setVocabBack(e.target.value)}
                className={inputClass}
              />
              <button type="submit" className="text-sm text-zinc-700 hover:underline dark:text-zinc-300">
                + Thêm từ
              </button>
            </form>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-medium">
              Mục ngữ pháp ({lesson.points.length})
            </h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {lesson.points.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                >
                  <span>{p.title}</span>
                  <button
                    type="button"
                    onClick={() =>
                      void removeRow(`/admin/lessons/${id}/points/${p.id}`)
                    }
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex flex-col gap-2 rounded border border-dashed border-zinc-300 p-3 dark:border-zinc-700"
              onSubmit={(e) => {
                e.preventDefault();
                void apiPost(`/admin/lessons/${id}/points`, {
                  title: pointTitle.trim(),
                  ...(pointMeaning.trim() && { meaning: pointMeaning.trim() }),
                })
                  .then(() => {
                    setPointTitle("");
                    setPointMeaning("");
                  })
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : "Lỗi"),
                  );
              }}
            >
              <input
                required
                placeholder="Tiêu đề (vd: 은/는)"
                value={pointTitle}
                onChange={(e) => setPointTitle(e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Nghĩa / cách dùng"
                value={pointMeaning}
                onChange={(e) => setPointMeaning(e.target.value)}
                className={inputClass}
              />
              <button type="submit" className="text-sm text-zinc-700 hover:underline dark:text-zinc-300">
                + Thêm mục ngữ pháp
              </button>
            </form>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-medium">
              Bài tập ({lesson.exercises.length})
            </h2>
            <ul className="mt-2 flex flex-col gap-2 text-sm">
              {lesson.exercises.map((ex) => (
                <li
                  key={ex.id}
                  className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                >
                  <p className="font-medium">{ex.prompt}</p>
                  <p className="text-xs text-zinc-500">
                    Đáp án đúng: {ex.options[ex.correctIndex] ?? "?"}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      void removeRow(`/admin/lessons/${id}/exercises/${ex.id}`)
                    }
                    className="mt-1 text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex flex-col gap-2 rounded border border-dashed border-zinc-300 p-3 dark:border-zinc-700"
              onSubmit={(e) => {
                e.preventDefault();
                const options = exOptions
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const correctIndex = parseInt(exCorrect, 10) || 0;
                void apiPost(`/admin/lessons/${id}/exercises`, {
                  prompt: exPrompt.trim(),
                  options,
                  correctIndex,
                })
                  .then(() => {
                    setExPrompt("");
                    setExOptions("");
                    setExCorrect("0");
                  })
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : "Lỗi"),
                  );
              }}
            >
              <input
                required
                placeholder="Câu hỏi"
                value={exPrompt}
                onChange={(e) => setExPrompt(e.target.value)}
                className={inputClass}
              />
              <textarea
                required
                placeholder="Các đáp án (mỗi dòng một đáp án)"
                value={exOptions}
                onChange={(e) => setExOptions(e.target.value)}
                rows={4}
                className={inputClass}
              />
              <label className="flex flex-col gap-1 text-sm">
                <span>Chỉ số đáp án đúng (0 = dòng đầu)</span>
                <input
                  type="number"
                  min={0}
                  value={exCorrect}
                  onChange={(e) => setExCorrect(e.target.value)}
                  className={inputClass}
                />
              </label>
              <button type="submit" className="text-sm text-zinc-700 hover:underline dark:text-zinc-300">
                + Thêm bài tập
              </button>
            </form>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default function AdminEditLessonPage() {
  return (
    <AdminGate>
      <EditLessonContent />
    </AdminGate>
  );
}
