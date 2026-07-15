"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

type Mode = "new" | "edit";

type Topic = { id: string; title: string };

type GoalItem = { key: string; labelVi: string; required: boolean };

function SituationFormContent({ mode }: { mode: Mode }) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [form, setForm] = useState({
    title: "",
    topicId: "",
    languageCode: "ko",
    level: "",
    contextVi: "",
    userRoleVi: "",
    npcRoleVi: "",
    openingLine: "",
    systemPrompt: "",
    maxUserTurns: 6,
    sortOrder: 0,
    isPublished: false,
    goals: [] as GoalItem[],
  });
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchWithAuth("/admin/speaking/topics")
      .then((r) => r.json())
      .then((data: Topic[]) => setTopics(data));
    if (mode !== "edit" || !id) return;
    void fetchWithAuth(`/admin/speaking/situations/${id}`)
      .then((r) => r.json())
      .then((data: typeof form & { id: string }) => {
        setForm({
          title: data.title,
          topicId: (data as unknown as { topicId?: string }).topicId ?? "",
          languageCode: data.languageCode,
          level: data.level ?? "",
          contextVi: data.contextVi,
          userRoleVi: data.userRoleVi,
          npcRoleVi: data.npcRoleVi,
          openingLine: data.openingLine,
          systemPrompt: data.systemPrompt,
          maxUserTurns: data.maxUserTurns,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
          goals: (data.goals as GoalItem[]) ?? [],
        });
      })
      .finally(() => setLoading(false));
  }, [id, mode]);

  function addGoal() {
    setForm((p) => ({ ...p, goals: [...p.goals, { key: "", labelVi: "", required: true }] }));
  }

  function updateGoal(i: number, field: keyof GoalItem, value: string | boolean) {
    setForm((p) => {
      const goals = [...p.goals];
      goals[i] = { ...goals[i], [field]: value };
      return { ...p, goals };
    });
  }

  function removeGoal(i: number) {
    setForm((p) => ({ ...p, goals: p.goals.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      ...form,
      topicId: form.topicId || undefined,
      level: form.level || undefined,
    };
    try {
      const res = await fetchWithAuth(
        mode === "new" ? "/admin/speaking/situations" : `/admin/speaking/situations/${id}`,
        { method: mode === "new" ? "POST" : "PATCH", body: JSON.stringify(body) }
      );
      if (!res.ok) throw new Error(await parseApiError(res));
      router.push("/admin/speaking/situations");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải...</p>;

  const inputCls = "w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none";

  return (
    <div>
      <Link href="/admin/speaking/situations" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Danh sách tình huống
      </Link>
      <PageHeader title={mode === "new" ? "Thêm tình huống luyện nói" : "Chỉnh sửa tình huống"} />
      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      <form onSubmit={(e) => void handleSubmit(e)} className="max-w-2xl space-y-5">
        {/* Thông tin cơ bản */}
        <div className="rounded-2xl border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Thông tin cơ bản</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Tiêu đề tình huống *</label>
              <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="VD: Đặt phòng khách sạn" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Chủ đề</label>
                <select value={form.topicId} onChange={(e) => setForm((p) => ({ ...p, topicId: e.target.value }))} className={inputCls}>
                  <option value="">— Không có —</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Ngôn ngữ *</label>
                <select value={form.languageCode} onChange={(e) => setForm((p) => ({ ...p, languageCode: e.target.value }))} className={inputCls}>
                  <option value="ko">Tiếng Hàn</option>
                  <option value="en">Tiếng Anh</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Cấp độ</label>
                <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} className={inputCls}>
                  <option value="">— Tất cả —</option>
                  <option value="BEGINNER">Sơ cấp</option>
                  <option value="INTERMEDIATE">Trung cấp</option>
                  <option value="ADVANCED">Khá</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Vai người học *</label>
                <input required value={form.userRoleVi} onChange={(e) => setForm((p) => ({ ...p, userRoleVi: e.target.value }))} className={inputCls} placeholder="VD: Khách du lịch" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Vai NPC *</label>
                <input required value={form.npcRoleVi} onChange={(e) => setForm((p) => ({ ...p, npcRoleVi: e.target.value }))} className={inputCls} placeholder="VD: Lễ tân khách sạn" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Bối cảnh (tiếng Việt) *</label>
              <textarea required rows={2} value={form.contextVi} onChange={(e) => setForm((p) => ({ ...p, contextVi: e.target.value }))} className={inputCls} placeholder="Mô tả tình huống giao tiếp" />
            </div>
          </div>
        </div>

        {/* NPC AI */}
        <div className="rounded-2xl border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Cấu hình NPC (AI)</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Câu mở đầu của NPC *</label>
              <textarea required rows={2} value={form.openingLine} onChange={(e) => setForm((p) => ({ ...p, openingLine: e.target.value }))} className={inputCls} placeholder="Câu NPC nói đầu tiên (ngôn ngữ đích)" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">System Prompt cho NPC *</label>
              <textarea required rows={4} value={form.systemPrompt} onChange={(e) => setForm((p) => ({ ...p, systemPrompt: e.target.value }))} className={inputCls} placeholder="Hướng dẫn cách NPC phản hồi, phong cách, giới hạn..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Số lượt tối đa</label>
                <input type="number" min={1} max={20} value={form.maxUserTurns} onChange={(e) => setForm((p) => ({ ...p, maxUserTurns: Number(e.target.value) }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Thứ tự sắp xếp</label>
                <input type="number" min={0} value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Mục tiêu giao tiếp */}
        <div className="rounded-2xl border border-border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Mục tiêu giao tiếp</h3>
            <button type="button" onClick={addGoal} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20">
              <Plus size={12} /> Thêm mục tiêu
            </button>
          </div>
          {form.goals.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">Chưa có mục tiêu nào. Thêm để AI theo dõi tiến trình.</p>
          ) : (
            <div className="space-y-2">
              {form.goals.map((g, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-2">
                  <input value={g.key} onChange={(e) => updateGoal(i, "key", e.target.value)} className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none" placeholder="key (VD: name)" />
                  <input value={g.labelVi} onChange={(e) => updateGoal(i, "labelVi", e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none" placeholder="Nhãn tiếng Việt" />
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <input type="checkbox" checked={g.required} onChange={(e) => updateGoal(i, "required", e.target.checked)} />
                    Bắt buộc
                  </label>
                  <button type="button" onClick={() => removeGoal(i)} className="rounded p-1 text-muted-foreground hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))} className="rounded" />
          Xuất bản ngay
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/80 disabled:opacity-50">
            {saving ? "Đang lưu..." : mode === "new" ? "Tạo tình huống" : "Lưu thay đổi"}
          </button>
          <Link href="/admin/speaking/situations" className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}

export function SituationFormPage({ mode }: { mode: Mode }) {
  return <AuthGate adminOnly><SituationFormContent mode={mode} /></AuthGate>;
}
