"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  TopikQuestionForm,
  type TopikQuestionFormValues,
} from "@/components/admin/TopikQuestionForm";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

const defaultValues: TopikQuestionFormValues = {
  tier: "TOPIK_I",
  section: "LISTENING",
  questionNo: 1,
  prompt: "",
  passage: null,
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: null,
  audioUrl: null,
  bundleId: null,
  points: 2,
  isPublished: true,
};

function NewTopikQuestionContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: TopikQuestionFormValues) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithAuth("/admin/topik/questions", {
        method: "POST",
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const created = (await res.json()) as { id: string };
      router.push(`/admin/topik/questions/${created.id}/edit`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tạo được câu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/topik/questions"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Danh sách câu hỏi
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Tạo câu hỏi TOPIK
      </h1>
      <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
        Câu tạo ở đây chưa gắn đề — không vào pool luyện dạng. Nên tạo qua{" "}
        <Link href="/admin/topik/exams" className="underline">
          quản trị đề
        </Link>{" "}
        hoặc thêm vào đề sau.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="mt-4">
        <TopikQuestionForm
          initial={defaultValues}
          submitLabel="Tạo câu"
          loading={loading}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

export default function AdminNewTopikQuestionPage() {
  return (
    <AdminGate>
      <NewTopikQuestionContent />
    </AdminGate>
  );
}
