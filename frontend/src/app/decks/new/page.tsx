"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import {
  backLinkClass,
  errorClass,
  inputClass,
  labelClass,
  labelTextClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

function NewDeckForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithAuth("/decks", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          ...(description.trim() && { description: description.trim() }),
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const deck = (await res.json()) as { id: string };
      router.push(`/decks/${deck.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được bộ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href="/decks" className={backLinkClass}>
        ← Danh sách bộ
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Tạo bộ từ mới
      </h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className={labelClass}>
          <span className={labelTextClass}>Tên bộ *</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="VD: TOPIK I — từ vựng"
          />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Mô tả (tuỳ chọn)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Ghi chú ngắn cho bộ này"
          />
        </label>
        {error ? <p className={errorClass}>{error}</p> : null}
        <GradientButton type="submit" disabled={loading} className="w-full py-2.5">
          {loading ? "Đang tạo…" : "Tạo bộ"}
        </GradientButton>
      </form>
    </div>
  );
}

export default function NewDeckPage() {
  return (
    <AuthGate>
      <NewDeckForm />
    </AuthGate>
  );
}
