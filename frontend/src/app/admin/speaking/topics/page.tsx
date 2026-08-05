"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Globe2, PencilLine, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import {
  AdminLanguageBadge,
  AdminLanguageFilter,
  type AdminLanguageFilterValue,
} from "@/components/admin/AdminLanguageControls";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

type Topic = {
  id: string;
  title: string;
  titleNative: string | null;
  languageCode: string;
  sortOrder: number;
  isPublished: boolean;
  _count: { situations: number };
};

function TopicsContent() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [language, setLanguage] = useState<AdminLanguageFilterValue>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetchWithAuth("/admin/speaking/topics");
      if (!res.ok) throw new Error(await parseApiError(res));
      setTopics((await res.json()) as Topic[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleToggle(topic: Topic) {
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/speaking/topics/${topic.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished: !topic.isPublished }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      setTopics((prev) =>
        prev.map((item) =>
          item.id === topic.id
            ? { ...item, isPublished: !item.isPublished }
            : item,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không cập nhật được trạng thái");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa chủ đề này? Các tình huống liên quan sẽ được giữ lại nhưng không còn thuộc chủ đề này.")) return;
    setDeleting(id);
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/speaking/topics/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      setTopics((prev) => prev.filter((topic) => topic.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không xóa được chủ đề");
    } finally {
      setDeleting(null);
    }
  }

  const filteredTopics = topics.filter(
    (topic) => !language || topic.languageCode === language,
  );

  return (
    <div>
      <PageHeader
        title="Quản lý Chủ đề Luyện nói"
        sub={`${filteredTopics.length} chủ đề`}
        action={
          <Link
            href="/admin/speaking/topics/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/80"
          >
            <Plus size={15} /> Thêm chủ đề
          </Link>
        }
      />

      <div className="mb-5">
        <AdminLanguageFilter value={language} onChange={setLanguage} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : filteredTopics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Globe2 size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Chưa có chủ đề nào.</p>
          <Link href="/admin/speaking/topics/new" className="mt-3 inline-block text-sm text-primary">
            + Tạo chủ đề đầu tiên
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên chủ đề</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ngôn ngữ</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Tình huống</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTopics.map((topic) => (
                <tr key={topic.id} className="transition hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{topic.title}</p>
                    {topic.titleNative && <p className="text-xs text-muted-foreground">{topic.titleNative}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <AdminLanguageBadge code={topic.languageCode} />
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{topic._count.situations}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => void handleToggle(topic)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium transition ${
                        topic.isPublished
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {topic.isPublished ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {topic.isPublished ? "Đã xuất bản" : "Nháp"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/speaking/topics/${topic.id}/edit`}
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <PencilLine size={14} />
                      </Link>
                      <button
                        type="button"
                        disabled={deleting === topic.id}
                        onClick={() => void handleDelete(topic.id)}
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Link href="/admin/speaking/situations" className="text-sm text-primary hover:underline">
          → Quản lý Tình huống luyện nói
        </Link>
      </div>
    </div>
  );
}

export default function AdminSpeakingTopicsPage() {
  return <AuthGate adminOnly><TopicsContent /></AuthGate>;
}
