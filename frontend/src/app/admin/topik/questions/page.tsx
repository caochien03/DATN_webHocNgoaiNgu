"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { GRADIENT } from "@/components/ui-kit/brand";
import { inputClass, listItemClass } from "@/components/ui-kit/form-styles";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { topikSectionLabel, topikTierLabel } from "@/lib/topik-labels";
import type {
  AdminTopikExamDetail,
  AdminTopikExamListRow,
  TopikSection,
  TopikTier,
} from "@/lib/types";

function truncate(text: string, max = 72) {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function AdminTopikQuestionsContent() {
  const [tier, setTier] = useState<TopikTier>("TOPIK_I");
  const [section, setSection] = useState<TopikSection | "">("");
  const [exams, setExams] = useState<AdminTopikExamListRow[] | null>(null);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [examDetails, setExamDetails] = useState<
    Record<string, AdminTopikExamDetail>
  >({});
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/admin/topik/exams");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExams((await res.json()) as AdminTopikExamListRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách đề");
    }
  }, []);

  useEffect(() => {
    void loadExams();
  }, [loadExams]);

  useEffect(() => {
    setExpandedExamId(null);
    setExamDetails({});
  }, [tier]);

  const filteredExams = useMemo(
    () => exams?.filter((e) => e.tier === tier) ?? null,
    [exams, tier],
  );

  const expandedExam = expandedExamId
    ? (examDetails[expandedExamId] ?? null)
    : null;

  const expandedSlots = useMemo(() => {
    if (!expandedExam) return [];
    const slots = [...expandedExam.questions].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    if (!section) return slots;
    return slots.filter((slot) => slot.question.section === section);
  }, [expandedExam, section]);

  async function toggleExam(examId: string) {
    if (expandedExamId === examId) {
      setExpandedExamId(null);
      return;
    }

    setExpandedExamId(examId);
    setSection("");

    if (examDetails[examId]) return;

    setLoadingExamId(examId);
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/topik/exams/${examId}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        setExpandedExamId(null);
        return;
      }
      const detail = (await res.json()) as AdminTopikExamDetail;
      setExamDetails((prev) => ({ ...prev, [examId]: detail }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được câu hỏi");
      setExpandedExamId(null);
    } finally {
      setLoadingExamId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Quản trị câu hỏi TOPIK"
        sub="Chọn đề để xem và sửa câu bên trong"
        action={
          <Link
            href="/admin/topik/questions/new"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} /> Tạo câu mới
          </Link>
        }
      />

      <div className="mb-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Cấp độ</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as TopikTier)}
            className={inputClass}
          >
            <option value="TOPIK_I">{topikTierLabel("TOPIK_I")}</option>
            <option value="TOPIK_II">{topikTierLabel("TOPIK_II")}</option>
          </select>
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {filteredExams === null ? (
        <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p>
      ) : filteredExams.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Chưa có đề {topikTierLabel(tier)}.{" "}
          <Link href="/admin/topik/exams" className="text-primary underline">
            Tạo hoặc import đề
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {filteredExams.map((exam) => {
            const isOpen = expandedExamId === exam.id;
            const isLoading = loadingExamId === exam.id;

            return (
              <li
                key={exam.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => void toggleExam(exam.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-secondary/50"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      <span className="mr-2 text-muted-foreground">
                        {isOpen ? "▾" : "▸"}
                      </span>
                      {exam.title}
                      {!exam.isPublished ? (
                        <span className="ml-2 text-xs font-normal text-amber-700 dark:text-amber-400">
                          Nháp
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {exam._count.questions} câu · {exam.durationMinutes} phút
                    </p>
                  </div>
                  <Link
                    href={`/admin/topik/exams/${exam.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-sm text-primary hover:underline"
                  >
                    Sửa đề
                  </Link>
                </button>

                {isOpen ? (
                  <div className="border-t border-border px-4 py-3">
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Đang tải câu hỏi…</p>
                    ) : expandedExam && expandedExam.id === exam.id ? (
                      <>
                        <div className="mb-3 flex flex-wrap items-end gap-3">
                          <label className="flex flex-col gap-1 text-sm">
                            <span>Lọc phần thi</span>
                            <select
                              value={section}
                              onChange={(e) =>
                                setSection(e.target.value as TopikSection | "")
                              }
                              className={inputClass}
                            >
                              <option value="">Tất cả</option>
                              <option value="LISTENING">
                                {topikSectionLabel("LISTENING")}
                              </option>
                              <option value="READING">
                                {topikSectionLabel("READING")}
                              </option>
                              <option value="WRITING">
                                {topikSectionLabel("WRITING")}
                              </option>
                            </select>
                          </label>
                          <Link
                            href={`/admin/topik/exams/${exam.id}/questions/new`}
                            className="text-sm text-primary hover:underline"
                          >
                            + Thêm câu vào đề
                          </Link>
                        </div>

                        {expandedSlots.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {exam._count.questions === 0
                              ? "Đề chưa có câu hỏi."
                              : "Không có câu ở phần thi đã chọn."}
                          </p>
                        ) : (
                          <ul className="flex flex-col gap-2">
                            {expandedSlots.map((slot) => (
                              <li
                                key={slot.id}
                                className={`flex flex-wrap items-center justify-between gap-2 ${listItemClass}`}
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground">
                                    {topikSectionLabel(slot.question.section)} ·
                                    câu {slot.question.questionNo}
                                    {!slot.question.isPublished ? (
                                      <span className="ml-2 text-xs font-normal text-amber-700 dark:text-amber-400">
                                        Ẩn
                                      </span>
                                    ) : null}
                                        {slot.question.section === "LISTENING" ? (
                                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                                            {slot.question.audioUrl
                                              ? "có audio"
                                              : "chưa có audio"}
                                          </span>
                                        ) : null}
                                        {slot.question.imageUrl ||
                                        slot.question.optionImageUrls.length > 0 ? (
                                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                                            có ảnh
                                          </span>
                                        ) : null}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {truncate(slot.question.prompt)}
                                  </p>
                                </div>
                                <Link
                                  href={`/admin/topik/questions/${slot.questionId}/edit`}
                                  className="shrink-0 text-sm text-primary hover:underline"
                                >
                                  Sửa
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
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
