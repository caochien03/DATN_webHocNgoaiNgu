"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
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
import type {
  AdminPathDetail,
  LessonRow,
  TopicRow,
} from "@/lib/types";

function stepResourceLabel(step: AdminPathDetail["steps"][number]) {
  if (step.type === "TOPIC" && step.topic) {
    return `Chủ đề: ${step.topic.title}`;
  }
  if (step.type === "LESSON" && step.lesson) {
    return `Bài học: ${step.lesson.title}`;
  }
  return step.type === "TOPIC" ? "Chủ đề (chưa liên kết)" : "Bài học (chưa liên kết)";
}

function EditPathContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [path, setPath] = useState<AdminPathDetail | null>(null);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [languageCode, setLanguageCode] = useState("ko");
  const [level, setLevel] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [stepType, setStepType] = useState<"TOPIC" | "LESSON">("TOPIC");
  const [stepTitle, setStepTitle] = useState("");
  const [stepSummary, setStepSummary] = useState("");
  const [stepTopicId, setStepTopicId] = useState("");
  const [stepLessonId, setStepLessonId] = useState("");
  const [stepSortOrder, setStepSortOrder] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const [pathRes, topicsRes, lessonsRes] = await Promise.all([
        fetchWithAuth(`/admin/paths/${id}`),
        fetchWithAuth("/admin/topics"),
        fetchWithAuth("/admin/lessons"),
      ]);
      if (!pathRes.ok) {
        setError(await parseApiError(pathRes));
        return;
      }
      const data = (await pathRes.json()) as AdminPathDetail;
      setPath(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setLanguageCode(data.languageCode);
      setLevel(data.level ?? "");
      setSortOrder(String(data.sortOrder));

      if (topicsRes.ok) {
        setTopics((await topicsRes.json()) as TopicRow[]);
      }
      if (lessonsRes.ok) {
        setLessons((await lessonsRes.json()) as LessonRow[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được lộ trình");
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
      const res = await fetchWithAuth(`/admin/paths/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          languageCode: languageCode.trim() || "ko",
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

  async function removePath() {
    if (!confirm("Xóa lộ trình và toàn bộ bước?")) return;
    const res = await fetchWithAuth(`/admin/paths/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await parseApiError(res));
      return;
    }
    router.push("/admin/paths");
    router.refresh();
  }

  async function addStep(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const resourceId =
      stepType === "TOPIC" ? stepTopicId.trim() : stepLessonId.trim();
    if (!resourceId) {
      setError(
        stepType === "TOPIC"
          ? "Chọn chủ đề cho bước."
          : "Chọn bài học cho bước.",
      );
      return;
    }
    try {
      const body: Record<string, unknown> = {
        type: stepType,
        title: stepTitle.trim(),
        ...(stepSummary.trim() && { summary: stepSummary.trim() }),
        ...(stepType === "TOPIC"
          ? { topicId: resourceId }
          : { lessonId: resourceId }),
      };
      const order = parseInt(stepSortOrder, 10);
      if (!Number.isNaN(order)) body.sortOrder = order;

      const res = await fetchWithAuth(`/admin/paths/${id}/steps`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setStepTitle("");
      setStepSummary("");
      setStepTopicId("");
      setStepLessonId("");
      setStepSortOrder("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi thêm bước");
    }
  }

  async function removeStep(stepId: string) {
    if (!confirm("Xóa bước này?")) return;
    const res = await fetchWithAuth(`/admin/paths/${id}/steps/${stepId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await parseApiError(res));
      return;
    }
    await load();
  }

  function onTopicSelect(topicId: string) {
    setStepTopicId(topicId);
    const t = topics.find((x) => x.id === topicId);
    if (t && !stepTitle.trim()) setStepTitle(t.title);
  }

  function onLessonSelect(lessonId: string) {
    setStepLessonId(lessonId);
    const l = lessons.find((x) => x.id === lessonId);
    if (l && !stepTitle.trim()) setStepTitle(l.title);
  }

  if (!path && !error) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/paths"
        className={backLinkClass}
      >
        ← Danh sách lộ trình
      </Link>

      {error ? (
        <p className={`mt-4 `}>{error}</p>
      ) : null}

      {path ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            Sửa lộ trình
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {languageLabel(path.languageCode)}
            {path.level ? ` · ${path.level}` : null}
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
            <label className="flex flex-col gap-1 text-sm">
              <span>Mã ngôn ngữ</span>
              <input
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                className={inputClass}
              />
            </label>
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
                {saving ? "Đang lưu…" : "Lưu thông tin lộ trình"}
              </GradientButton>
              <button
                type="button"
                onClick={() => void removePath()}
                className={dangerButtonClass}
              >
                Xóa lộ trình
              </button>
            </div>
          </form>

          <section className="mt-8">
            <h2 className="text-sm font-medium">
              Các bước ({path.steps.length})
            </h2>
            <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5 text-sm">
              {[...path.steps]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((step) => (
                  <li
                    key={step.id}
                    className={listItemClass}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">
                          {step.title}
                          <span className="ml-2 font-normal text-muted-foreground">
                            ({step.type === "TOPIC" ? "Chủ đề" : "Bài học"})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stepResourceLabel(step)}
                          {step.summary ? ` · ${step.summary}` : null}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeStep(step.id)}
                        className="shrink-0 text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
            </ol>

            <form
              onSubmit={addStep}
              className={`mt-4 flex flex-col gap-3 ${dashedCardClass}`}
            >
              <p className="text-sm font-medium text-foreground">
                Thêm bước
              </p>
              <label className="flex flex-col gap-1 text-sm">
                <span>Loại bước</span>
                <select
                  value={stepType}
                  onChange={(e) =>
                    setStepType(e.target.value as "TOPIC" | "LESSON")
                  }
                  className={inputClass}
                >
                  <option value="TOPIC">Chủ đề từ vựng</option>
                  <option value="LESSON">Bài học ngữ pháp</option>
                </select>
              </label>
              {stepType === "TOPIC" ? (
                <label className="flex flex-col gap-1 text-sm">
                  <span>Chủ đề *</span>
                  <select
                    required
                    value={stepTopicId}
                    onChange={(e) => onTopicSelect(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Chọn chủ đề —</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                        {t.level ? ` (${t.level})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="flex flex-col gap-1 text-sm">
                  <span>Bài học *</span>
                  <select
                    required
                    value={stepLessonId}
                    onChange={(e) => onLessonSelect(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Chọn bài học —</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.level})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1 text-sm">
                <span>Tiêu đề hiển thị *</span>
                <input
                  required
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Tóm tắt (tùy chọn)</span>
                <input
                  value={stepSummary}
                  onChange={(e) => setStepSummary(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Thứ tự (để trống = cuối danh sách)</span>
                <input
                  type="number"
                  min={0}
                  value={stepSortOrder}
                  onChange={(e) => setStepSortOrder(e.target.value)}
                  className={inputClass}
                />
              </label>
              <button
                type="submit"
                className="text-sm text-primary hover:underline"
              >
                + Thêm bước
              </button>
            </form>
          </section>

          <p className="mt-8 text-sm">
            <Link
              href={`/paths/${id}`}
              className={backLinkClass}
            >
              Xem lộ trình (học viên) →
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}

export default function AdminEditPathPage() {
  return (
    <AdminGate>
      <EditPathContent />
    </AdminGate>
  );
}
