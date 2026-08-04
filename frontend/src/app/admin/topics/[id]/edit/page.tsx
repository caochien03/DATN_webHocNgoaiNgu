"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { AdminLanguageSelect } from "@/components/admin/AdminLanguageControls";
import {
  backLinkClass,
  dangerButtonClass,
  dashedCardClass,
  inputClass,
  listItemClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { languageLabel } from "@/lib/topic-labels";
import type { TopicDetail } from "@/lib/types";

function EditTopicContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [languageCode, setLanguageCode] = useState("ko");
  const [level, setLevel] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [wordFront, setWordFront] = useState("");
  const [wordBack, setWordBack] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/topics/${id}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const data = (await res.json()) as TopicDetail;
      setTopic(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setLanguageCode(data.languageCode);
      setLevel(data.level ?? "");
      setSortOrder(String(data.sortOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được chủ đề");
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
      const res = await fetchWithAuth(`/admin/topics/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          languageCode,
          level: level.trim() || null,
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

  async function removeTopic() {
    if (!confirm("Xóa chủ đề và toàn bộ từ vựng?")) return;
    const res = await fetchWithAuth(`/admin/topics/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await parseApiError(res));
      return;
    }
    router.push("/admin/topics");
    router.refresh();
  }

  async function addWord(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/topics/${id}/words`, {
        method: "POST",
        body: JSON.stringify({
          frontText: wordFront.trim(),
          backText: wordBack.trim(),
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setWordFront("");
      setWordBack("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi thêm từ");
    }
  }

  async function removeWord(wordId: string) {
    if (!confirm("Xóa từ này?")) return;
    const res = await fetchWithAuth(`/admin/topics/${id}/words/${wordId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await parseApiError(res));
      return;
    }
    await load();
  }

  if (!topic && !error) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/topics"
        className={backLinkClass}
      >
        ← Danh sách chủ đề
      </Link>

      {error ? (
        <p className={`mt-4 `}>{error}</p>
      ) : null}

      {topic ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            Sửa chủ đề
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {languageLabel(topic.languageCode)}
            {topic.level ? ` · ${topic.level}` : null}
          </p>

          <form
            onSubmit={saveMeta}
            className={`mt-4 flex flex-col gap-3 `}
          >
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
              <span>Mô tả</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </label>
            <AdminLanguageSelect value={languageCode} onChange={setLanguageCode} />
            <label className="flex flex-col gap-1 text-sm">
              <span>Cấp độ</span>
              <input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="VD: TOPIK 1"
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
              <GradientButton type="submit" disabled={saving}>
                {saving ? "Đang lưu…" : "Lưu thông tin chủ đề"}
              </GradientButton>
              <button
                type="button"
                onClick={() => void removeTopic()}
                className={dangerButtonClass}
              >
                Xóa chủ đề
              </button>
            </div>
          </form>

          <section className="mt-8">
            <h2 className="text-sm font-medium">
              Từ vựng ({topic.words.length})
            </h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {topic.words.map((w) => (
                <li
                  key={w.id}
                  className={`flex items-center justify-between gap-2 ${listItemClass}`}
                >
                  <span>
                    {w.frontText} — {w.backText}
                  </span>
                  <button
                    type="button"
                    onClick={() => void removeWord(w.id)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
            <form
              onSubmit={addWord}
              className={`mt-3 flex flex-col gap-2 ${dashedCardClass}`}
            >
              <input
                required
                placeholder="Mặt trước (tiếng Hàn)"
                value={wordFront}
                onChange={(e) => setWordFront(e.target.value)}
                className={inputClass}
              />
              <input
                required
                placeholder="Mặt sau (nghĩa)"
                value={wordBack}
                onChange={(e) => setWordBack(e.target.value)}
                className={inputClass}
              />
              <button
                type="submit"
                className="text-sm text-primary hover:underline"
              >
                + Thêm từ
              </button>
            </form>
          </section>

          <p className="mt-8 text-sm">
            <Link
              href={`/topics/${id}`}
              className={backLinkClass}
            >
              Xem chủ đề (học viên) →
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}

export default function AdminEditTopicPage() {
  return (
    <AdminGate>
      <EditTopicContent />
    </AdminGate>
  );
}
