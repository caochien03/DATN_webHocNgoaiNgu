"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Camera,
  Edit3,
  Flame,
  Globe,
  GraduationCap,
  Mic,
  Plus,
  Route,
  Shield,
  Target,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { AvatarWithFrame, PRESET_LIST } from "@/components/ui-kit/AvatarWithFrame";
import { BRAND } from "@/components/ui-kit/brand";
import { PushNotificationCard } from "@/components/ui-kit/PushNotificationCard";
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

const TARGET_GOAL_OPTIONS = [
  { value: "topik", label: "🏆 Luyện thi TOPIK" },
  { value: "toeic", label: "📝 Luyện thi TOEIC" },
  { value: "study_abroad", label: "🎓 Du học" },
  { value: "work", label: "💼 Làm việc" },
  { value: "hobby", label: "💡 Sở thích" },
  { value: "other", label: "🔹 Khác" },
];

const LEVEL_OPTIONS = [
  { value: "beginner", label: "🌱 Sơ cấp (Beginner)" },
  { value: "elementary", label: "📗 Cơ bản (Elementary)" },
  { value: "intermediate", label: "📘 Trung cấp (Intermediate)" },
  { value: "advanced", label: "📕 Nâng cao (Advanced)" },
];

type FrameInfo = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  condition: string;
};

function ProfileContent() {
  const { languages, addLanguage, setActive, languageCode, refresh } =
    useLearningLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [progress, setProgress] = useState<LanguageProgressResponse | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  // Profile form states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFrame, setAvatarFrame] = useState("DEFAULT");

  const [saving, setSaving] = useState(false);
  const [langBusy, setLangBusy] = useState<LearningLanguageCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [langError, setLangError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Avatar & Frame picker modal
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [frames, setFrames] = useState<FrameInfo[]>([]);

  const enrolled = new Set(languages.map((l) => l.languageCode));
  const availableToAdd = LEARNING_LANGUAGE_OPTIONS.filter(
    (o) => !enrolled.has(o.code),
  );

  useEffect(() => {
    const u = getStoredAuth()?.user ?? null;
    setUser(u);
    setName(u?.name ?? "");
    setBio(u?.bio ?? "");
    setTargetGoal(u?.targetGoal ?? "");
    setCurrentLevel(u?.currentLevel ?? "");
    setAvatarUrl(u?.avatarUrl ?? "");
    setAvatarFrame(u?.avatarFrame ?? "DEFAULT");
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

  const loadFrames = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/users/me/unlocked-frames");
      if (res.ok) {
        const data = (await res.json()) as { frames: FrameInfo[] };
        setFrames(data.frames);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadFrames();
  }, [loadFrames]);

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
      <p className="px-4 py-10 text-center text-xs font-bold text-muted-foreground">
        Không đọc được hồ sơ học viên.
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
      const body: Record<string, string> = {};
      if (name.trim()) body.name = name.trim();
      body.bio = bio.trim();
      body.avatarUrl = avatarUrl;
      body.avatarFrame = avatarFrame;
      body.targetGoal = targetGoal;
      body.currentLevel = currentLevel;

      const res = await fetchWithAuth("/users/me", {
        method: "PATCH",
        body: JSON.stringify(body),
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

  function selectPreset(presetId: string) {
    setAvatarUrl(presetId);
    setSaved(false);
  }

  function selectFrame(frameId: string) {
    setAvatarFrame(frameId);
    setSaved(false);
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Hồ sơ học viên" sub="Thông tin tài khoản cá nhân, cài đặt ngôn ngữ và tiến trình tích lũy" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Card — bên trái */}
        <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <div
            className="absolute inset-x-0 top-0 h-[2.5px]"
            style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})` }}
          />

          {/* Avatar + Frame */}
          <div className="relative mb-4 mt-2">
            <AvatarWithFrame
              avatarUrl={avatarUrl || user.avatarUrl}
              frame={avatarFrame || user.avatarFrame}
              fallbackInitial={initial}
              size={96}
            />
            <button
              type="button"
              onClick={() => setShowAvatarPicker(true)}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-110"
            >
              <Camera size={14} />
            </button>
          </div>

          <p className="text-xl font-black text-foreground">
            {user.name || "(Chưa đặt tên)"}
          </p>
          <p className="mt-1 break-all text-xs font-semibold text-muted-foreground">{user.email}</p>

          {/* Bio */}
          {user.bio ? (
            <p className="mt-2 text-xs italic text-muted-foreground leading-relaxed">
              &ldquo;{user.bio}&rdquo;
            </p>
          ) : null}

          {/* Role badge */}
          <div className="mt-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black"
              style={{
                background: isAdmin ? `${BRAND.purple}20` : `${BRAND.blue}18`,
                color: isAdmin ? BRAND.purple : BRAND.blue,
              }}
            >
              <Shield size={13} />
              <span>{isAdmin ? "🛡️ Quản trị viên" : "🏃 Học viên"}</span>
            </span>
          </div>

          {/* Target goal & Level badges */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {user.targetGoal ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-foreground">
                🎯 {TARGET_GOAL_OPTIONS.find((o) => o.value === user.targetGoal)?.label ?? user.targetGoal}
              </span>
            ) : null}
            {user.currentLevel ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-foreground">
                {LEVEL_OPTIONS.find((o) => o.value === user.currentLevel)?.label ?? user.currentLevel}
              </span>
            ) : null}
          </div>

          <div className="mt-6 w-full border-t border-border/80 pt-4 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Calendar size={14} className="text-primary" />
              <span>Tham gia từ: <strong className="text-foreground">{createdAt}</strong></span>
            </div>
          </div>
        </div>

        {/* Details & Settings — bên phải */}
        <div className="space-y-6 lg:col-span-2">
          {/* Push Notifications Card */}
          <PushNotificationCard />

          {/* Edit Profile form */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div
              className="absolute inset-x-0 top-0 h-[2.5px]"
              style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})` }}
            />
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
                <Edit3 size={16} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Cài đặt</span>
                <h3 className="text-base font-black text-foreground">Chỉnh sửa hồ sơ</h3>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Tên */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Tên hiển thị</label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  placeholder="Nhập tên…"
                  className={`w-full ${inputClass}`}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Châm ngôn / Bio (tối đa 150 ký tự)</label>
                <input
                  value={bio}
                  onChange={(e) => { setBio(e.target.value); setSaved(false); }}
                  placeholder="Ví dụ: Mỗi ngày tiến thêm 1 bước!"
                  maxLength={150}
                  className={`w-full ${inputClass}`}
                />
              </div>

              {/* Target Goal */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground">🎯 Mục tiêu học tập</label>
                <select
                  value={targetGoal}
                  onChange={(e) => { setTargetGoal(e.target.value); setSaved(false); }}
                  className={`w-full ${inputClass}`}
                >
                  <option value="">Chưa chọn</option>
                  {TARGET_GOAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Current Level */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
                  <GraduationCap size={13} className="mr-1 inline" />
                  Trình độ hiện tại
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => { setCurrentLevel(e.target.value); setSaved(false); }}
                  className={`w-full ${inputClass}`}
                >
                  <option value="">Chưa chọn</option>
                  {LEVEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <motion.button
                type="button"
                onClick={() => void saveProfile()}
                disabled={saving}
                className="rounded-2xl px-6 py-3 text-xs font-black text-white shadow-md transition-all disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                  boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {saving ? "Đang lưu…" : "💾 Lưu thay đổi"}
              </motion.button>
              {saved ? (
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">✓ Đã lưu thay đổi hồ sơ.</p>
              ) : null}
            </div>
            {error ? <p className={`mt-2 ${errorClass}`}>{error}</p> : null}
          </div>

          {/* Languages Selector */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div
              className="absolute inset-x-0 top-0 h-[2.5px]"
              style={{ background: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.cyan})` }}
            />
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
                <Globe size={16} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Đa ngôn ngữ</span>
                <h3 className="text-base font-black text-foreground">Ngôn ngữ đang học</h3>
              </div>
            </div>
            <p className="mb-4 text-xs font-medium leading-relaxed text-muted-foreground">
              Học song song nhiều ngôn ngữ. Chuyển đổi ngôn ngữ để cập nhật toàn bộ bài học, bộ thẻ và đề thi.
            </p>
            <div className="space-y-2.5">
              {languages.map((lang) => {
                const isActive = lang.languageCode === languageCode;
                const flag = lang.languageCode === "ko" ? "🇰🇷" : "🇬🇧";
                return (
                  <button
                    key={lang.languageCode}
                    type="button"
                    disabled={langBusy !== null}
                    onClick={() =>
                      void handleSetActive(lang.languageCode as LearningLanguageCode)
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border p-4 text-left text-xs font-black transition-all",
                      isActive
                        ? "border-primary/50 bg-primary/10 shadow-xs ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-secondary/60",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{flag}</span>
                      <span className="text-foreground text-sm font-black">
                        {learningLanguageLabel(lang.languageCode)}
                      </span>
                    </div>
                    {isActive ? (
                      <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-black text-primary">
                        Đang chọn
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-semibold">Nhấn để chọn →</span>
                    )}
                  </button>
                );
              })}
            </div>
            {availableToAdd.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {availableToAdd.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    disabled={langBusy !== null}
                    onClick={() => void handleAddLanguage(opt.code)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-dashed border-border px-3.5 py-2 text-xs font-black text-muted-foreground transition hover:border-primary hover:text-foreground"
                  >
                    <Plus size={14} />
                    {langBusy === opt.code ? "Đang thêm…" : `Học thêm ${opt.nameVi}`}
                  </button>
                ))}
              </div>
            ) : null}
            {langError ? <p className={`mt-3 ${errorClass}`}>{langError}</p> : null}
          </div>

          {/* Progress Summary */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div
              className="absolute inset-x-0 top-0 h-[2.5px]"
              style={{ background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.cyan})` }}
            />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Thống kê</span>
                <h3 className="text-base font-black text-foreground">
                  Tiến độ {learningLanguageLabel(languageCode)}
                </h3>
              </div>
              <Link
                href="/goals"
                className="text-xs font-black text-primary hover:underline"
              >
                Mục tiêu ngày →
              </Link>
            </div>

            {progressLoading ? (
              <p className="text-xs font-bold text-muted-foreground">Đang tải tiến độ…</p>
            ) : !progress ? (
              <p className="text-xs font-bold text-muted-foreground">
                Chưa có dữ liệu tiến độ cho ngôn ngữ này.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <Flame size={14} style={{ color: BRAND.yellow }} />
                      Chuỗi học
                    </div>
                    <p className="text-xl font-black text-foreground">
                      {goal?.streak ?? 0} <span className="text-xs font-bold text-muted-foreground">ngày</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <Target size={14} style={{ color: BRAND.blue }} />
                      Hôm nay
                    </div>
                    <p className="text-xl font-black text-foreground">
                      {goal?.today.reviewedCards ?? 0}/{goal?.today.target ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <BookOpen size={14} style={{ color: BRAND.cyan }} />
                      Cần ôn
                    </div>
                    <p className="text-xl font-black text-foreground">
                      {progress.reviewDue.dueCount} <span className="text-xs font-bold text-muted-foreground">thẻ</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <Route size={14} style={{ color: BRAND.green }} />
                      Lộ trình
                    </div>
                    <p className="text-xl font-black text-foreground">
                      {progress.paths.avgPercent}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
                    <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Bộ thẻ từ vựng</p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {progress.decks.learnedCards}/{progress.decks.totalCards} từ đã thuộc
                      {" · "}
                      {progress.decks.deckCount} bộ
                    </p>
                    <Link
                      href="/decks"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-black text-primary hover:underline"
                    >
                      Xem các bộ thẻ <ArrowRight size={12} />
                    </Link>
                  </div>

                  {progress.paths.primaryPath ? (
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
                      <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Lộ trình chính</p>
                      <p className="mt-1 text-sm font-black text-foreground">
                        {progress.paths.primaryPath.title}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {progress.paths.primaryPath.completedSteps}/
                        {progress.paths.primaryPath.totalSteps} bước hoàn thành
                      </p>
                      <div className="mt-2">
                        <Bar
                          done={progress.paths.primaryPath.completedSteps}
                          total={progress.paths.primaryPath.totalSteps}
                          color={BRAND.green}
                        />
                      </div>
                      <Link
                        href={`/paths/${progress.paths.primaryPath.id}`}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-black text-primary hover:underline"
                      >
                        Tiếp tục học <ArrowRight size={12} />
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2 border-t border-border/80 pt-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Hoạt động gần nhất
                  </p>
                  {progress.recentQuiz ? (
                    <div className="rounded-2xl bg-secondary/50 p-3 text-xs font-semibold text-foreground">
                      📝 Quiz: <strong>{progress.recentQuiz.sourceTitle}</strong> —{" "}
                      <span className="font-black text-primary">{progress.recentQuiz.scorePercent}%</span>
                    </div>
                  ) : null}
                  {progress.recentExam ? (
                    <div className="rounded-2xl bg-secondary/50 p-3 text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>
                        🏆 {examLabel}: <strong>{progress.recentExam.scorePercent}%</strong> (
                        {progress.recentExam.correctCount}/{progress.recentExam.totalQuestions} câu)
                      </span>
                      <Link
                        href={examHref}
                        className="font-black text-primary hover:underline"
                      >
                        Luyện tiếp →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-muted-foreground">
                      Chưa có kết quả thi {examLabel} nào gần đây.
                    </p>
                  )}
                  {progress.recentSpeaking ? (
                    <div className="rounded-2xl bg-secondary/50 p-3 text-xs font-semibold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mic size={14} className="text-primary" />
                        Nói: <strong>{progress.recentSpeaking.situationTitle}</strong>
                        {progress.recentSpeaking.overallScore != null
                          ? ` — ${Math.round(progress.recentSpeaking.overallScore)} điểm`
                          : ""}
                      </span>
                      <Link
                        href="/speaking"
                        className="font-black text-primary hover:underline"
                      >
                        Luyện nói →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-muted-foreground">
                      Chưa có phiên luyện nói nào.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar Frames Showcase */}
          {frames.length > 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div
                className="absolute inset-x-0 top-0 h-[2.5px]"
                style={{ background: `linear-gradient(90deg, ${BRAND.yellow}, ${BRAND.purple})` }}
              />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Bộ sưu tập</span>
              <h3 className="mt-1 text-base font-black text-foreground">Khung Avatar & Thành Tích</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {frames.map((f) => (
                  <div
                    key={f.id}
                    className={cn(
                      "rounded-2xl border p-3.5 text-center transition-all",
                      f.unlocked
                        ? "border-primary/30 bg-primary/5 shadow-sm"
                        : "border-border bg-secondary/30 opacity-60",
                    )}
                  >
                    <AvatarWithFrame
                      avatarUrl={avatarUrl || user.avatarUrl}
                      frame={f.id}
                      fallbackInitial={initial}
                      size={52}
                      className="mx-auto"
                    />
                    <p className="mt-2 text-xs font-black text-foreground">{f.name}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-muted-foreground leading-tight">
                      {f.condition}
                    </p>
                    {f.unlocked ? (
                      <span className="mt-1.5 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        ✓ Đã mở khóa
                      </span>
                    ) : (
                      <span className="mt-1.5 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        🔒 Chưa mở
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-black text-foreground">Chọn Avatar</h3>
              <p className="mt-1 text-xs text-muted-foreground">Bấm chọn linh vật yêu thích làm ảnh đại diện</p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {PRESET_LIST.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { selectPreset(p.id); setShowAvatarPicker(false); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition-all hover:-translate-y-0.5",
                      avatarUrl === p.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <span className="text-[11px] font-bold text-foreground">{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Tùy chọn Custom Image URL hoặc Reset */}
              <div className="mt-4 border-t border-border/80 pt-3">
                <label className="mb-1 block text-xs font-bold text-muted-foreground">Hoặc dùng liên kết ảnh tùy chỉnh (URL)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={avatarUrl.startsWith("preset:") ? "" : avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setSaved(false);
                    }}
                    placeholder="https://example.com/avatar.png"
                    className={`flex-1 ${inputClass}`}
                  />
                  {avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl("");
                        setSaved(false);
                      }}
                      className="rounded-xl border border-border bg-secondary px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Xóa ảnh
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Chọn khung viền */}
              <h4 className="mt-5 text-sm font-black text-foreground">Chọn khung viền</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">Chỉ hiển thị các khung đã mở khóa</p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {frames.filter((f) => f.unlocked).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => { selectFrame(f.id); setShowAvatarPicker(false); }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5",
                      avatarFrame === f.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <AvatarWithFrame
                      avatarUrl={avatarUrl || user.avatarUrl}
                      frame={f.id}
                      fallbackInitial={initial}
                      size={36}
                    />
                    <div>
                      <p className="text-xs font-bold text-foreground">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">{f.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
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
