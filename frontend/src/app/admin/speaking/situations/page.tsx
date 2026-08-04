"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare, PencilLine, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import {
  AdminLanguageBadge,
  AdminLanguageFilter,
  type AdminLanguageFilterValue,
} from "@/components/admin/AdminLanguageControls";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

type Situation = {
  id: string;
  title: string;
  languageCode: string;
  level: string | null;
  npcRoleVi: string;
  maxUserTurns: number;
  sortOrder: number;
  isPublished: boolean;
  topic: { id: string; title: string } | null;
  _count: { sessions: number };
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Sơ cấp",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Khá",
};

function SituationsContent() {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [language, setLanguage] = useState<AdminLanguageFilterValue>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetchWithAuth("/admin/speaking/situations");
      if (!res.ok) throw new Error(await parseApiError(res));
      setSituations((await res.json()) as Situation[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleToggle(s: Situation) {
    const res = await fetchWithAuth(`/admin/speaking/situations/${s.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished: !s.isPublished }),
    });
    if (res.ok) setSituations((prev) => prev.map((x) => x.id === s.id ? { ...x, isPublished: !x.isPublished } : x));
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa tình huống này? Toàn bộ phiên luyện tập liên quan cũng sẽ bị xóa.")) return;
    setDeleting(id);
    const res = await fetchWithAuth(`/admin/speaking/situations/${id}`, { method: "DELETE" });
    if (res.ok) setSituations((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  }

  const filteredSituations = situations.filter(
    (situation) => !language || situation.languageCode === language,
  );

  return (
    <div>
      <PageHeader
        title="Quản lý Tình huống Luyện nói"
        sub={`${filteredSituations.length} tình huống`}
        action={
          <Link
            href="/admin/speaking/situations/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/80"
          >
            <Plus size={15} /> Thêm tình huống
          </Link>
        }
      />

      <div className="mb-4">
        <Link href="/admin/speaking/topics" className="text-sm text-muted-foreground hover:text-foreground">
          ← Quản lý Chủ đề
        </Link>
      </div>

      <div className="mb-5">
        <AdminLanguageFilter value={language} onChange={setLanguage} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : filteredSituations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <MessageSquare size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Chưa có tình huống nào.</p>
          <Link href="/admin/speaking/situations/new" className="mt-3 inline-block text-sm text-primary">
            + Tạo tình huống đầu tiên
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tình huống</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Chủ đề</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Cấp độ</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Lượt</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Phiên</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSituations.map((s) => (
                <tr key={s.id} className="transition hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{s.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <AdminLanguageBadge code={s.languageCode} />
                      <span className="text-xs text-muted-foreground">{s.npcRoleVi}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.topic?.title ?? <span className="italic text-muted-foreground/50">Không có</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.level ? (
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {LEVEL_LABEL[s.level] ?? s.level}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{s.maxUserTurns}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{s._count.sessions}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => void handleToggle(s)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium transition ${
                        s.isPublished
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {s.isPublished ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {s.isPublished ? "Đã xuất bản" : "Nháp"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/speaking/situations/${s.id}/edit`}
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <PencilLine size={14} />
                      </Link>
                      <button
                        type="button"
                        disabled={deleting === s.id}
                        onClick={() => void handleDelete(s.id)}
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
    </div>
  );
}

export default function AdminSpeakingSituationsPage() {
  return <AuthGate adminOnly><SituationsContent /></AuthGate>;
}
