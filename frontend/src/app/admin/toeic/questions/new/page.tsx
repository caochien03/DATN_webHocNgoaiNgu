"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  ToeicQuestionForm,
  type ToeicQuestionFormValues,
} from "@/components/admin/ToeicQuestionForm";
import { backLinkClass, errorBannerClass } from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

const initial: ToeicQuestionFormValues = {
  tier: "TOEIC_LR",
  section: "LISTENING",
  questionNo: 1,
  prompt: "",
  passage: null,
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: null,
  audioUrl: null,
  imageUrl: null,
  optionImageUrls: [],
  bundleId: null,
  points: 1,
  isPublished: true,
};

function NewToeicQuestionContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createQuestion(values: ToeicQuestionFormValues) {
    setError(null);
    setLoading(true);
    try {
      const response = await fetchWithAuth("/admin/toeic/questions", {
        method: "POST",
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      const created = (await response.json()) as { id: string };
      router.push(`/admin/toeic/questions/${created.id}/edit`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không tạo được câu hỏi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/admin/toeic/questions" className={backLinkClass}>
        ← Danh sách câu hỏi
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Tạo câu hỏi TOEIC
      </h1>
      {error ? <p className={errorBannerClass}>{error}</p> : null}
      <div className="mt-4">
        <ToeicQuestionForm
          initial={initial}
          submitLabel="Tạo câu hỏi"
          loading={loading}
          tierLocked
          onSubmit={createQuestion}
        />
      </div>
    </div>
  );
}

export default function AdminNewToeicQuestionPage() {
  return (
    <AdminGate>
      <NewToeicQuestionContent />
    </AdminGate>
  );
}
