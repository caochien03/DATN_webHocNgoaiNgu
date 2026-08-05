"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Layers, Play, Plus, Trash2 } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, GRADIENT, GRADIENT_DIAGONAL } from "@/components/ui-kit/brand";
import {
  backLinkClass,
  errorBannerClass,
  inputClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { DeckDetail } from "@/lib/types";

const PALETTE = [BRAND.blue, BRAND.cyan, BRAND.green, BRAND.purple, BRAND.red] as const;

function DeckDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/decks/${id}`);
      if (res.status === 404) {
        setError("Không tìm thấy bộ.");
        setDeck(null);
        return;
      }
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setDeck((await res.json()) as DeckDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`/decks/${id}/cards`, {
        method: "POST",
        body: JSON.stringify({
          frontText: front.trim(),
          backText: back.trim(),
          ...(note.trim() && { note: note.trim() }),
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setFront("");
      setBack("");
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thêm được thẻ");
    } finally {
      setAdding(false);
    }
  }

  async function removeCard(cardId: string) {
    if (!window.confirm("Xóa thẻ này?")) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được");
    }
  }

  async function removeDeck() {
    if (!window.confirm("Xóa cả bộ và mọi thẻ trong bộ?")) return;
    try {
      const res = await fetchWithAuth(`/decks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      router.push("/decks");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được bộ");
    }
  }

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href="/decks" className={backLinkClass}>
        ← Danh sách bộ thẻ
      </Link>

      {error ? <p className={errorBannerClass}>{error}</p> : null}

      {deck === null && !error ? (
        <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p>
      ) : null}

      {deck ? (
        <>
          {/* Header Hero Banner */}
          <section className="relative mt-4 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}14 0%, transparent 60%, ${BRAND.cyan}14 100%)`,
            }}
          >
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-3xl"
              style={{ background: `${BRAND.blue}20` }}
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ background: GRADIENT_DIAGONAL }}
                >
                  <Layers size={26} />
                </div>
                <div>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: `${BRAND.blue}20`, color: BRAND.blue }}
                  >
                    {deck.languageCode.toUpperCase()} · BỘ TỰ TẠO
                  </span>
                  <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {deck.title}
                  </h1>
                  {deck.description ? (
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {deck.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    Tổng số: <span className="font-bold text-foreground">{deck.cards.length} thẻ</span>
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 self-start">
                {deck.cards.length > 0 ? (
                  <Link
                    href={`/decks/${id}/learn`}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                      boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
                    }}
                  >
                    <Play size={15} fill="currentColor" /> Luyện tập
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => void removeDeck()}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold transition hover:bg-red-500/20"
                  style={{ color: BRAND.red }}
                >
                  Xóa bộ
                </button>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            {/* Form Thêm Thẻ */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})` }}
              />
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Tạo mới</span>
                <h2 className="mt-1 text-lg font-bold text-foreground">Thêm thẻ từ vựng</h2>
              </div>

              <form onSubmit={addCard} className="flex flex-col gap-3.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Mặt trước (từ vựng)</label>
                  <input
                    required
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder={
                      deck.languageCode === "ko"
                        ? "Ví dụ: 안녕하세요"
                        : "Ví dụ: airport"
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Mặt sau (nghĩa tiếng Việt)</label>
                  <input
                    required
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="Ví dụ: Xin chào / sân bay"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ghi chú / ví dụ (tuỳ chọn)</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú ngữ cảnh, cách dùng…"
                    className={inputClass}
                  />
                </div>
                <GradientButton
                  type="submit"
                  disabled={adding}
                  className="mt-1 flex w-full items-center justify-center gap-2 py-2.5 font-bold"
                >
                  <Plus size={16} /> {adding ? "Đang thêm…" : "Thêm thẻ vào bộ"}
                </GradientButton>
              </form>
            </section>

            {/* Danh sách thẻ */}
            <section>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Danh sách</span>
                  <h2 className="mt-1 text-lg font-bold text-foreground">Thẻ trong bộ ({deck.cards.length})</h2>
                </div>
              </div>

              {deck.cards.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card/50 px-5 py-12 text-center text-sm text-muted-foreground">
                  Chưa có thẻ nào trong bộ này. Hãy thêm từ vựng đầu tiên ở biểu mẫu bên cạnh!
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {deck.cards.map((c, index) => {
                    const color = PALETTE[index % PALETTE.length];
                    return (
                      <div
                        key={c.id}
                        className="group relative flex items-start justify-between gap-3 overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          borderColor: `${color}25`,
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold text-white"
                            style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 text-sm">
                            <p className="font-bold text-foreground">{c.frontText}</p>
                            <p className="mt-0.5 font-medium" style={{ color }}>{c.backText}</p>
                            {c.note ? (
                              <p
                                className="mt-1.5 rounded-lg px-2.5 py-1 text-xs leading-relaxed text-muted-foreground"
                                style={{ background: `${color}10` }}
                              >
                                {c.note}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removeCard(c.id)}
                          className="shrink-0 rounded-xl p-2 text-muted-foreground opacity-60 transition-all hover:bg-red-500/10 hover:text-red-500 hover:opacity-100"
                          aria-label="Xóa thẻ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function DeckDetailPage() {
  return (
    <AuthGate>
      <DeckDetailContent />
    </AuthGate>
  );
}
