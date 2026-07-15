"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

type Mode = "new" | "edit";

function TopicFormContent({ mode }: { mode: Mode }) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [form, setForm] = useState({
    title: "",
    titleNative: "",
    description: "",
    languageCode: "ko",
    sortOrder: 0,
    isPublished: false,
  });
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    void fetchWithAuth(`/admin/speaking/topics/${id}`)
      .then((r) => r.json())
      .then((data: typeof form & { id: string }) => {
        setForm({
          title: data.title,
          titleNative: data.titleNative ?? "",
          description: (data as unknown as { description?: string }).description ?? "",
          languageCode: data.languageCode,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        });
      })
      .finally(() => setLoading(false));
  }, [id, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        mode === "new" ? "/admin/speaking/topics" : `/admin/speaking/topics/${id}`,
        {
          method: mode === "new" ? "POST" : "PATCH",
          body: JSON.stringify({ ...form, titleNative: form.titleNative || undefined, description: form.description || undefined }),
        }
      );
      if (!res.ok) throw new Error(await parseApiError(res));
      router.push("/admin/speaking/topics");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải...</p>;

  return (
    <div>
      <Link href="/admin/speaking/topics" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Danh sách chủ đề
      </Link>
      <PageHeader title={mode === "new" ? "Thêm chủ đề luyện nói" : "Chỉnh sửa chủ đề"} />

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      <form onSubmit={(e) => void handleSubmit(e)} className="max-w-xl space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Tên chủ đề (tiếng Việt) *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            placeholder="VD: Tại sân bay"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Tên tiếng học (ngôn ngữ đích)</label>
          <input
            value={form.titleNative}
            onChange={(e) => setForm((p) => ({ ...p, titleNative: e.target.value }))}
            className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            placeholder="VD: 공항에서"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Ngôn ngữ *</label>
            <select
              value={form.languageCode}
              onChange={(e) => setForm((p) => ({ ...p, languageCode: e.target.value }))}
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            >
              <option value="ko">Tiếng Hàn (ko)</option>
              <option value="en">Tiếng Anh (en)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Thứ tự sắp xếp</label>
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
            className="rounded"
          />
          Xuất bản ngay
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/80 disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : mode === "new" ? "Tạo chủ đề" : "Lưu thay đổi"}
          </button>
          <Link href="/admin/speaking/topics" className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}

export function TopicFormPage({ mode }: { mode: Mode }) {
  return <AuthGate adminOnly><TopicFormContent mode={mode} /></AuthGate>;
}
