"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Globe,
  Mail,
  Mic,
  Plus,
  Route,
  Shield,
  Target,
  UserRound,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { AvatarCircle } from "@/components/ui-kit/AppMark";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
import { Bar } from "@/components/ui-kit/primitives";
import { errorClass, inputClass } from "@/components/ui-kit/form-styles";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import {
  LEARNING_LANGUAGE_OPTIONS,
  learningLanguageLabel,
  type LearningLanguageCode,
} from "@/lib/learning-language";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import {
  getStoredAuth,
  setStoredAuth,
  type AuthUser,
} from "@/lib/auth-storage";
import type { LanguageProgressResponse } from "@/lib/types";
import { cn } from "@/lib/cn";

function ProfileContent() {
  const { languages, addLanguage, setActive, languageCode, refresh } =
    useLearningLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [progress, setProgress] = useState<LanguageProgressResponse | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [langBusy, setLangBusy] = useState<LearningLanguageCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [langError, setLangError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const enrolled = new Set(languages.map((l) => l.languageCode));
  const availableToAdd = LEARNING_LANGUAGE_OPTIONS.filter(
    (o) => !enrolled.has(o.code),
  );

  useEffect(() => {
    const u = getStoredAuth()?.user ?? null;
    setUser(u);
    setName(u?.name ?? "");
  }, []);

  const loadProgress = useCallback(async () => {
    setProgressLoading(true);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/users/me/progress", languageCode),
      );
      if (!res.ok) {
        setProgress(null);
        return;
      }
      setProgress((await res.json()) as LanguageProgressResponse);
    } catch {
      setProgress(null);
    } finally {
      setProgressLoading(false);
    }
  }, [languageCode]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const handleAddLanguage = useCallback(
    async (code: LearningLanguageCode) => {
      setLangBusy(code);
      setLangError(null);
      try {
        await addLanguage(code);
        await setActive(code);
      } catch (e) {
        setLangError(e instanceof Error ? e.message : "Không thêm được ngôn ngữ");
      } finally {
        setLangBusy(null);
      }
    },
    [addLanguage, setActive],
  );

  const handleSetActive = useCallback(
    async (code: LearningLanguageCode) => {
      if (code === languageCode) return;
      setLangBusy(code);
      setLangError(null);
      try {
        await setActive(code);
      } catch (e) {
        setLangError(e instanceof Error ? e.message : "Không đổi được ngôn ngữ");
        await refresh();
      } finally {
        setLangBusy(null);
      }
    },
    [languageCode, setActive, refresh],
  );

  if (!user) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        Không đọc được hồ sơ.
      </p>
    );
  }

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
    : "—";
  const initial = (user.name || user.email).charAt(0).toUpperCase();
  const isAdmin = user.role === "ADMIN";
  const goal = progress?.goal;
  const examHref =
    languageCode === "en" ? "/toeic/TOEIC_LR" : "/topik/TOPIK_I";
  const examLabel = languageCode === "en" ? "TOEIC" : "TOPIK";

  async function saveProfile() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetchWithAuth("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const updated = (await res.json()) as AuthUser;
      const auth = getStoredAuth();
      if (auth) setStoredAuth({ accessToken: auth.accessToken, user: updated });
      setUser(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được hồ sơ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Hồ sơ" sub="Thông tin tài khoản và cài đặt" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
          <AvatarCircle label={initial} className="mb-4 h-20 w-20 text-3xl" />
          <p className="text-lg font-bold text-foreground">
            {user.name || "(chưa đặt tên)"}
          </p>
          <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Shield size={12} />
            <span>{isAdmin ? "Quản trị viên" : "Học viên"}</span>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">Thông tin tài khoản</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 border-b border-border py-2 sm:border-0">
                <Mail size={15} className="mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="break-all text-sm text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 py-2">
                <UserRound size={15} className="mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tham gia</p>
                  <p className="text-sm text-foreground">{createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">Sửa hồ sơ</h3>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Tên hiển thị
            </label>
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                placeholder="Nhập tên hiển thị"
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => void saveProfile()}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: GRADIENT }}
              >
                {saving ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
            {error ? <p className={`mt-2 ${errorClass}`}>{error}</p> : null}
            {saved ? (
              <p className="mt-2 text-sm text-emerald-300">Đã lưu thay đổi.</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Globe size={18} className="text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Ngôn ngữ đang học</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Bạn có thể học nhiều ngôn ngữ song song. Chọn ngôn ngữ đang xem
              trong header hoặc tại đây.
            </p>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.languageCode}
                  type="button"
                  disabled={langBusy !== null}
                  onClick={() =>
                    void handleSetActive(lang.languageCode as LearningLanguageCode)
                  }
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    lang.languageCode === languageCode
                      ? "border-primary/50 bg-primary/10 font-semibold text-foreground"
                      : "border-border hover:border-primary/30 hover:bg-secondary",
                  )}
                >
                  <span>{learningLanguageLabel(lang.languageCode)}</span>
                  {lang.languageCode === languageCode ? (
                    <span className="text-xs text-primary">Đang học</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Chọn</span>
                  )}
                </button>
              ))}
            </div>
            {availableToAdd.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {availableToAdd.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    disabled={langBusy !== null}
                    onClick={() => void handleAddLanguage(opt.code)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Plus size={14} />
                    {langBusy === opt.code ? "Đang thêm…" : `Thêm ${opt.nameVi}`}
                  </button>
                ))}
              </div>
            ) : null}
            {langError ? <p className={`mt-3 ${errorClass}`}>{langError}</p> : null}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  Tiến độ {learningLanguageLabel(languageCode)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mục tiêu, ôn tập và hoạt động gần đây theo ngôn ngữ đang chọn.
                </p>
              </div>
              <Link
                href="/goals"
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                Mục tiêu ngày
              </Link>
            </div>

            {progressLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải tiến độ…</p>
            ) : !progress ? (
              <p className="text-sm text-muted-foreground">
                Chưa có dữ liệu tiến độ cho ngôn ngữ này.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border bg-secondary/40 px-3 py-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Flame size={13} style={{ color: BRAND.yellow }} />
                      Chuỗi
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {goal?.streak ?? 0} ngày
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/40 px-3 py-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Target size={13} style={{ color: BRAND.blue }} />
                      Hôm nay
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {goal?.today.reviewedCards ?? 0}/{goal?.today.target ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/40 px-3 py-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen size={13} style={{ color: BRAND.cyan }} />
                      Ôn hôm nay
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {progress.reviewDue.dueCount} thẻ
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/40 px-3 py-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Route size={13} style={{ color: BRAND.green }} />
                      Lộ trình
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {progress.paths.avgPercent}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border px-4 py-3">
                    <p className="text-xs text-muted-foreground">Bộ thẻ</p>
                    <p className="mt-1 text-sm text-foreground">
                      {progress.decks.learnedCards}/{progress.decks.totalCards} từ đã thuộc
                      {" · "}
                      {progress.decks.deckCount} bộ
                    </p>
                    <Link
                      href="/decks"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Xem bộ thẻ <ArrowRight size={12} />
                    </Link>
                  </div>

                  {progress.paths.primaryPath ? (
                    <div className="rounded-xl border border-border px-4 py-3">
                      <p className="text-xs text-muted-foreground">Lộ trình chính</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {progress.paths.primaryPath.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {progress.paths.primaryPath.completedSteps}/
                        {progress.paths.primaryPath.totalSteps} bước
                      </p>
                      <Bar
                        done={progress.paths.primaryPath.completedSteps}
                        total={progress.paths.primaryPath.totalSteps}
                        color={BRAND.green}
                      />
                      <Link
                        href={`/paths/${progress.paths.primaryPath.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Tiếp tục <ArrowRight size={12} />
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Hoạt động gần đây
                  </p>
                  {progress.recentQuiz ? (
                    <p className="text-sm text-foreground">
                      Quiz: {progress.recentQuiz.sourceTitle} —{" "}
                      {progress.recentQuiz.scorePercent}%
                    </p>
                  ) : null}
                  {progress.recentExam ? (
                    <p className="text-sm text-foreground">
                      {examLabel}: {progress.recentExam.scorePercent}% (
                      {progress.recentExam.correctCount}/
                      {progress.recentExam.totalQuestions})
                      <Link
                        href={examHref}
                        className="ml-2 text-xs text-primary hover:underline"
                      >
                        Luyện thi
                      </Link>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có lần thi {examLabel} nào.
                    </p>
                  )}
                  {progress.recentSpeaking ? (
                    <p className="flex items-center gap-1.5 text-sm text-foreground">
                      <Mic size={14} className="text-muted-foreground" />
                      Nói: {progress.recentSpeaking.situationTitle}
                      {progress.recentSpeaking.overallScore != null
                        ? ` — ${Math.round(progress.recentSpeaking.overallScore)} điểm`
                        : ""}
                      <Link
                        href="/speaking"
                        className="ml-1 text-xs text-primary hover:underline"
                      >
                        Luyện nói
                      </Link>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có phiên luyện nói nào.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileContent />
    </AuthGate>
  );
}
