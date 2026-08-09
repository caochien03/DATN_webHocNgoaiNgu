"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Crown,
  ExternalLink,
  Flame,
  Gift,
  Globe,
  Layers,
  LogOut,
  Plus,
  RotateCw,
  Route,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { AvatarWithFrame, PRESET_LIST } from "@/components/ui-kit/AvatarWithFrame";
import { BRAND } from "@/components/ui-kit/brand";
import { PushNotificationCard } from "@/components/ui-kit/PushNotificationCard";
import { Bar, PageHeader } from "@/components/ui-kit/primitives";
import { errorClass, inputClass } from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import { learningLanguageLabel } from "@/lib/learning-language";
import { getStoredAuth } from "@/lib/auth-storage";
import { cn } from "@/lib/cn";

type GroupMember = {
  id: string;
  userId: string;
  role: "LEADER" | "ADMIN" | "MEMBER";
  weeklyXp: number;
  totalXp: number;
  rank: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
    avatarFrame: string | null;
    bio: string | null;
    currentLevel: string | null;
  };
  todayProgress: {
    reviewedCards: number;
    goalTarget: number;
    goalAchieved: boolean;
  };
  pathProgress: {
    completedSteps: number;
    completedStepIds: string[];
    totalSteps: number;
    percent: number;
  } | null;
};

type GroupActivity = {
  id: string;
  userId: string;
  type: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
    avatarFrame: string | null;
  };
};

type GroupCard = {
  id: string;
  groupId: string;
  createdById: string;
  term: string;
  meaning: string;
  example: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    avatarFrame: string | null;
  };
};

type GroupDashboardData = {
  group: {
    id: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    languageCode: string;
    inviteCode: string;
    maxMembers: number;
    memberCount: number;
    createdById: string;
    createdAt: string;
    targetPath: {
      id: string;
      title: string;
      totalSteps: number;
      steps: { id: string; title: string; sortOrder: number; type: string }[];
    } | null;
    cardsCount: number;
  };
  currentMemberRole: "LEADER" | "ADMIN" | "MEMBER";
  energy: {
    completedCount: number;
    totalMembers: number;
    percent: number;
    isFullSquadDay: boolean;
    streakDays: number;
  };
  milestones: {
    totalSquadXp: number;
    list: {
      id: string;
      targetXp: number;
      name: string;
      perk: string;
      unlocked: boolean;
    }[];
  };
  cheerNotice: {
    memberName: string;
    step: number;
    total: number;
    message: string;
  } | null;
  leaderboard: GroupMember[];
  activities: GroupActivity[];
};

type LeagueGroup = {
  rank: number;
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  languageCode: string;
  memberCount: number;
  maxMembers: number;
  totalWeeklyXp: number;
  totalXp: number;
  isMyGroup: boolean;
  topMembers: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    avatarFrame: string | null;
    weeklyXp: number;
  }[];
};

type AvailablePath = {
  id: string;
  title: string;
  level: string;
};

function GroupsContent() {
  const { languageCode } = useLearningLanguage();
  const currentUserId = getStoredAuth()?.user.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GroupDashboardData | null>(null);
  const [cards, setCards] = useState<GroupCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [availablePaths, setAvailablePaths] = useState<AvailablePath[]>([]);

  // League (Đua top nhóm)
  const [leagueList, setLeagueList] = useState<LeagueGroup[]>([]);
  const [leagueLoading, setLeagueLoading] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<"members" | "league">("members");

  // Search in cards
  const [cardSearch, setCardSearch] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Forms
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("preset:fox");
  const [selectedPathId, setSelectedPathId] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  // Settings form
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAvatar, setEditAvatar] = useState("preset:fox");
  const [editTargetPathId, setEditTargetPathId] = useState("");

  const [cardTerm, setCardTerm] = useState("");
  const [cardMeaning, setCardMeaning] = useState("");
  const [cardExample, setCardExample] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState<string | null>(null);

  // Flashcard practice inside modal
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  const loadGroup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/groups/my-group", languageCode),
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [languageCode]);

  const loadLeague = useCallback(async () => {
    setLeagueLoading(true);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/groups/league", languageCode),
      );
      if (res.ok) {
        const list = await res.json();
        setLeagueList(list);
      }
    } catch {
      /* ignore */
    } finally {
      setLeagueLoading(false);
    }
  }, [languageCode]);

  const loadCards = useCallback(async () => {
    setCardsLoading(true);
    try {
      const res = await fetchWithAuth("/groups/cards");
      if (res.ok) {
        setCards(await res.json());
      }
    } catch {
      /* ignore */
    } finally {
      setCardsLoading(false);
    }
  }, []);

  const loadPaths = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/paths", languageCode),
      );
      if (res.ok) {
        const paths = await res.json();
        setAvailablePaths(paths);
      }
    } catch {
      /* ignore */
    }
  }, [languageCode]);

  useEffect(() => {
    void loadGroup();
    void loadPaths();
    void loadLeague();
  }, [loadGroup, loadPaths, loadLeague]);

  useEffect(() => {
    if (data?.group) {
      void loadCards();
      setEditName(data.group.name);
      setEditDesc(data.group.description || "");
      setEditAvatar(data.group.avatarUrl || "preset:fox");
      setEditTargetPathId(data.group.targetPath?.id || "");
    }
  }, [data?.group, loadCards]);

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/groups", {
        method: "POST",
        body: JSON.stringify({
          name: groupName.trim(),
          description: groupDesc.trim() || undefined,
          avatarUrl: groupAvatar,
          languageCode,
          targetPathId: selectedPathId || undefined,
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setShowCreateModal(false);
      setGroupName("");
      setGroupDesc("");
      await loadGroup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tạo nhóm");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoinGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/groups/join", {
        method: "POST",
        body: JSON.stringify({
          inviteCode: inviteCodeInput.trim().toUpperCase(),
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setShowJoinModal(false);
      setInviteCodeInput("");
      await loadGroup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi gia nhập nhóm");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/groups/settings", languageCode),
        {
          method: "PATCH",
          body: JSON.stringify({
            name: editName.trim(),
            description: editDesc.trim() || undefined,
            avatarUrl: editAvatar,
            targetPathId: editTargetPathId || undefined,
          }),
        },
      );
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setShowSettingsModal(false);
      await loadGroup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi cập nhật cài đặt");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!cardTerm.trim() || !cardMeaning.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/groups/cards", {
        method: "POST",
        body: JSON.stringify({
          term: cardTerm.trim(),
          meaning: cardMeaning.trim(),
          example: cardExample.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setShowAddCardModal(false);
      setCardTerm("");
      setCardMeaning("");
      setCardExample("");
      await loadCards();
      await loadGroup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi thêm từ vựng");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa thẻ từ vựng này khỏi nhóm?")) return;
    try {
      const res = await fetchWithAuth(`/groups/cards/${cardId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        if (data) {
          setData({
            ...data,
            group: {
              ...data.group,
              cardsCount: Math.max(0, data.group.cardsCount - 1),
            },
          });
        }
      } else {
        alert(await parseApiError(res));
      }
    } catch {
      alert("Không thể xóa thẻ từ vựng");
    }
  }

  async function handleNudge(targetUserId: string, targetName: string) {
    try {
      const res = await fetchWithAuth(`/groups/nudge/${targetUserId}`, {
        method: "POST",
      });
      if (res.ok) {
        setNudgeSuccess(`Đã gửi lời nhắc học tập tới ${targetName}! 🔔`);
        setTimeout(() => setNudgeSuccess(null), 4000);
        await loadGroup();
      }
    } catch {
      /* ignore */
    }
  }

  async function handleLeaveGroup() {
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/groups/leave", languageCode),
        {
          method: "POST",
        },
      );
      if (res.ok) {
        setShowLeaveModal(false);
        setData(null);
        await loadGroup();
      } else {
        alert(await parseApiError(res));
      }
    } catch {
      alert("Không thể rời nhóm");
    } finally {
      setSubmitting(false);
    }
  }

  function copyInviteCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filteredCards = useMemo(() => {
    if (!cardSearch.trim()) return cards;
    const q = cardSearch.toLowerCase().trim();
    return cards.filter(
      (c) =>
        c.term.toLowerCase().includes(q) ||
        c.meaning.toLowerCase().includes(q) ||
        (c.example && c.example.toLowerCase().includes(q)),
    );
  }, [cards, cardSearch]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          Đang tải nhóm học tập…
        </p>
      </div>
    );
  }

  const langLabel = learningLanguageLabel(languageCode);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <PageHeader
        title="Nhóm học tập (Lingora Squad)"
        sub={`Học cùng bạn bè, đồng bộ lộ trình ${langLabel} và thi đua bảng xếp hạng`}
      />

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-500">
          {error}
        </div>
      ) : null}

      {!data ? (
        /* ═══════════════════════════════════════════════════════════════
           CHƯA CÓ NHÓM (EMPTY STATE & ONBOARDING)
        ═══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-xs sm:p-12">
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})` }}
            />
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-black text-foreground">
              Tham Gia Nhóm Học Tập {langLabel}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
              Tự học một mình dễ nản? Hãy lập nhóm cùng 3 - 8 bạn bè để cùng nhìn thấy tiến độ của nhau, nhắc nhở nhau học mỗi ngày và cùng đóng góp bộ từ vựng chung!
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-black text-white shadow-md transition-all hover:opacity-95 sm:w-auto"
              >
                <Plus size={16} />
                <span>Tạo nhóm học mới</span>
              </button>

              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/80 px-6 py-3.5 text-xs font-black text-foreground transition-all hover:bg-secondary sm:w-auto"
              >
                <Share2 size={16} />
                <span>Nhập mã mời vào nhóm</span>
              </button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Flame size={20} />
              </span>
              <h3 className="mt-4 text-sm font-black text-foreground">Năng Lượng Nhóm (Squad Energy)</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Mỗi thành viên hoàn thành mục tiêu ngày sẽ làm đầy thanh năng lượng chung. Cả nhóm cùng hoàn thành để nhận danh hiệu Ngày Toàn Thắng!
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Route size={20} />
              </span>
              <h3 className="mt-4 text-sm font-black text-foreground">Bản Đồ Tiến Độ Đồng Bộ</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Cùng chọn 1 Lộ trình học chung và xem vị trí hiện tại của từng người trên bản đồ bài học để thúc đẩy nhau về đích.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                <Layers size={20} />
              </span>
              <h3 className="mt-4 text-sm font-black text-foreground">Bộ Thẻ Dùng Chung</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Mỗi người đóng góp các từ vựng hay gặp vào kho từ của nhóm. Mọi thành viên đều có thể mở ra ôn luyện Flashcard nhanh chóng.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════
           ĐÃ CÓ NHÓM: SQUAD DASHBOARD (ĐẦY ĐỦ TÍNH NĂNG)
        ═══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})` }}
            />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-3xl shadow-inner">
                  {data.group.avatarUrl?.startsWith("preset:")
                    ? PRESET_LIST.find((p) => p.id === data.group.avatarUrl)?.emoji ?? "🦊"
                    : "🦊"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-foreground">{data.group.name}</h2>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      {data.group.languageCode === "ko" ? "🇰🇷 Tiếng Hàn" : "🇬🇧 Tiếng Anh"}
                    </span>
                  </div>
                  {data.group.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{data.group.description}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <span>
                      👥 {data.group.memberCount}/{data.group.maxMembers} thành viên
                    </span>
                    <span>·</span>
                    <span>📚 {data.group.cardsCount} từ vựng nhóm</span>
                    {data.group.targetPath ? (
                      <>
                        <span>·</span>
                        <span className="text-primary font-bold">
                          🎯 Lộ trình: {data.group.targetPath.title}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Action buttons & Invite code */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyInviteCode(data.group.inviteCode)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-black text-primary transition-all hover:bg-primary/20"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>Mã mời: <strong>{data.group.inviteCode}</strong></span>
                </button>

                {data.currentMemberRole === "LEADER" ? (
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(true)}
                    className="inline-flex items-center gap-1 rounded-2xl border border-border bg-secondary px-3 py-2 text-xs font-bold text-foreground transition hover:border-primary/40"
                    title="Cài đặt nhóm"
                  >
                    <Settings size={13} />
                    <span>Cài đặt</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setShowLeaveModal(true)}
                  className="inline-flex items-center gap-1 rounded-2xl border border-border bg-secondary/80 px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-red-400 hover:text-red-500"
                  title="Rời nhóm"
                >
                  <LogOut size={13} />
                  <span>Rời nhóm</span>
                </button>
              </div>
            </div>

            {/* Nudge Toast notification */}
            {nudgeSuccess ? (
              <div className="mt-4 rounded-2xl bg-emerald-500/15 p-3 text-xs font-bold text-emerald-600 animate-fadeIn">
                {nudgeSuccess}
              </div>
            ) : null}
          </div>

          {/* Cheer encouragement banner */}
          {data.cheerNotice ? (
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-xl shadow-inner animate-bounce">
                    🚀
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Cổ vũ đồng đội
                    </h4>
                    <p className="text-xs font-bold text-foreground">
                      {data.cheerNotice.message}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const lowest = data.leaderboard.find(
                      (m) =>
                        (m.user.name || m.user.email) ===
                        data.cheerNotice?.memberName,
                    );
                    if (lowest) {
                      void handleNudge(
                        lowest.userId,
                        lowest.user.name || lowest.user.email,
                      );
                    }
                  }}
                  className="rounded-2xl bg-amber-500 px-3.5 py-1.5 text-xs font-black text-white shadow-xs transition hover:bg-amber-600 shrink-0"
                >
                  Gửi lời cổ vũ 👏
                </button>
              </div>
            </div>
          ) : null}

          {/* Web Push Notification Bar */}
          <PushNotificationCard />

          {/* Top Row: Squad Energy & Squad Milestones */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Squad Energy Card */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Flame size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                      Năng lượng hôm nay
                    </span>
                    <h3 className="text-sm font-black text-foreground">
                      {data.energy.isFullSquadDay
                        ? "🔥 Ngày Toàn Thắng!"
                        : "Tiến độ cả nhóm"}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
                  <ShieldCheck size={14} />
                  <span>🔥 {data.energy.streakDays} ngày chuỗi</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>Hoàn thành mục tiêu ngày</span>
                  <span className="text-foreground font-black">
                    {data.energy.completedCount}/{data.energy.totalMembers} thành viên ({data.energy.percent}%)
                  </span>
                </div>
                <Bar done={data.energy.completedCount} total={data.energy.totalMembers} color={BRAND.yellow} />
              </div>
            </div>

            {/* Squad Milestone Chests */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <Gift size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                      Cột Mốc Thưởng Nhóm
                    </span>
                    <h3 className="text-sm font-black text-foreground">
                      Tổng XP: {data.milestones.totalSquadXp} XP
                    </h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {data.milestones.list.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-2xl border p-2 text-center transition-all",
                      m.unlocked
                        ? "border-emerald-500/40 bg-emerald-500/10 shadow-xs"
                        : "border-border bg-secondary/30 opacity-70",
                    )}
                    title={m.perk}
                  >
                    <p className="text-base">{m.name.split(" ")[0]}</p>
                    <p className="mt-0.5 text-[10px] font-black text-foreground truncate">
                      {m.targetXp} XP
                    </p>
                    <p className="text-[9px] font-semibold text-muted-foreground">
                      {m.unlocked ? (
                        <span className="text-emerald-600 font-bold">✓ Mở khóa</span>
                      ) : (
                        "Khóa"
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SQUAD SYNC MAP (BẢN ĐỒ TIẾN ĐỘ ĐỒNG BỘ LỘ TRÌNH CẢ NHÓM)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div
              className="absolute inset-x-0 top-0 h-[2.5px]"
              style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.purple})` }}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-2xs">
                  <Route size={16} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                    Lộ trình đồng bộ
                  </span>
                  <h3 className="text-base font-black text-foreground">
                    {data.group.targetPath
                      ? `🗺️ Bản Đồ Tiến Độ: ${data.group.targetPath.title}`
                      : "Chưa chọn Lộ trình học chung"}
                  </h3>
                </div>
              </div>

              {data.group.targetPath ? (
                <Link
                  href={`/paths/${data.group.targetPath.id}`}
                  className="inline-flex items-center gap-1 rounded-2xl bg-secondary px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-primary hover:text-white"
                >
                  <span>Mở lộ trình học</span>
                  <ExternalLink size={12} />
                </Link>
              ) : data.currentMemberRole === "LEADER" ? (
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="text-xs font-black text-primary hover:underline"
                >
                  + Chọn lộ trình trong Cài đặt
                </button>
              ) : null}
            </div>

            {data.group.targetPath && data.group.targetPath.steps.length > 0 ? (
              <div className="space-y-4">
                {/* Horizontal / Wrapped Roadmap Nodes */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {data.group.targetPath.steps.map((step, idx) => {
                    // Thành viên đã hoàn thành bước này
                    const completedMembers = data.leaderboard.filter((m) =>
                      m.pathProgress?.completedStepIds.includes(step.id),
                    );
                    const allCompleted =
                      completedMembers.length === data.leaderboard.length &&
                      data.leaderboard.length > 0;

                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "relative flex flex-col justify-between rounded-2xl border p-4 transition-all",
                          allCompleted
                            ? "border-emerald-500/50 bg-emerald-500/5 shadow-xs"
                            : completedMembers.length > 0
                            ? "border-primary/40 bg-primary/5 shadow-2xs"
                            : "border-border bg-secondary/20",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                              Bước {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-primary">
                              {step.type === "LESSON" ? "Ngữ pháp" : "Từ vựng"}
                            </span>
                          </div>
                          <h4 className="mt-2 text-xs font-black text-foreground line-clamp-2">
                            {step.title}
                          </h4>
                        </div>

                        {/* Avatars of members on this step */}
                        <div className="mt-4 border-t border-border/50 pt-2.5">
                          <p className="text-[10px] font-bold text-muted-foreground mb-1.5">
                            {completedMembers.length > 0
                              ? `Đã hoàn thành (${completedMembers.length}):`
                              : "Chưa ai hoàn thành"}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {completedMembers.map((m) => (
                              <div
                                key={m.id}
                                title={`${m.user.name || m.user.email} (Đã hoàn thành)`}
                              >
                                <AvatarWithFrame
                                  avatarUrl={m.user.avatarUrl}
                                  frame={m.user.avatarFrame}
                                  fallbackInitial={(m.user.name || m.user.email).charAt(0).toUpperCase()}
                                  size={24}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Nhóm chưa thiết lập Lộ trình mục tiêu chung.
                </p>
                {data.currentMemberRole === "LEADER" ? (
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(true)}
                    className="mt-2 text-xs font-black text-primary hover:underline"
                  >
                    + Trưởng nhóm hãy chọn 1 lộ trình cho cả nhóm
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {/* Main 2-Column Section: Leaderboard & Group Deck */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column (2 Cols): Leaderboard & Shared Deck */}
            <div className="space-y-6 lg:col-span-2">
              {/* Leaderboard & League */}
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div
                  className="absolute inset-x-0 top-0 h-[2.5px]"
                  style={{ background: `linear-gradient(90deg, ${BRAND.yellow}, ${BRAND.cyan})` }}
                />
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 shadow-2xs">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Thi đua</span>
                      <h3 className="text-base font-black text-foreground">
                        {leaderboardTab === "members" ? "Bảng Xếp Hạng Tuần" : "Đua Top Liên Nhóm"}
                      </h3>
                    </div>
                  </div>

                  {/* Tabs toggle */}
                  <div className="flex items-center rounded-2xl bg-secondary/80 p-1 border border-border">
                    <button
                      type="button"
                      onClick={() => setLeaderboardTab("members")}
                      className={cn(
                        "rounded-xl px-3 py-1 text-xs font-black transition",
                        leaderboardTab === "members"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      👥 Trong nhóm
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardTab("league")}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-black transition",
                        leaderboardTab === "league"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span>🏆 Đua top nhóm</span>
                      <span className="rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                        {leagueList.length}
                      </span>
                    </button>
                  </div>
                </div>

                {leaderboardTab === "members" ? (
                  <div className="space-y-2.5">
                    {data.leaderboard.map((mem) => {
                      const isMe = mem.userId === currentUserId;
                      const initial = (mem.user.name || mem.user.email).charAt(0).toUpperCase();
                      const rankMedal =
                        mem.rank === 1 ? "🥇" : mem.rank === 2 ? "🥈" : mem.rank === 3 ? "🥉" : `#${mem.rank}`;

                      return (
                        <div
                          key={mem.id}
                          className={cn(
                            "flex items-center justify-between rounded-2xl border p-3.5 transition-all",
                            isMe
                              ? "border-primary/40 bg-primary/5 shadow-2xs ring-1 ring-primary/20"
                              : "border-border bg-card hover:bg-secondary/40",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-sm font-black text-muted-foreground">{rankMedal}</span>
                            <AvatarWithFrame
                              avatarUrl={mem.user.avatarUrl}
                              frame={mem.user.avatarFrame}
                              fallbackInitial={initial}
                              size={40}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-black text-foreground">
                                  {mem.user.name || mem.user.email}
                                </p>
                                {mem.role === "LEADER" ? (
                                  <span title="Trưởng nhóm">
                                    <Crown size={13} className="text-yellow-500" />
                                  </span>
                                ) : null}
                                {isMe ? (
                                  <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[10px] font-bold text-primary">
                                    Bạn
                                  </span>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                                <span>
                                  {mem.todayProgress.goalAchieved ? (
                                    <strong className="text-emerald-600">✓ Đã học hôm nay</strong>
                                  ) : (
                                    <span className="text-amber-500">Chưa hoàn thành</span>
                                  )}
                                </span>
                                {mem.pathProgress ? (
                                  <span>· Lộ trình: {mem.pathProgress.completedSteps}/{mem.pathProgress.totalSteps}</span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-black text-foreground">{mem.weeklyXp} XP</p>
                              <p className="text-[10px] font-medium text-muted-foreground">tuần này</p>
                            </div>

                            {/* Nudge button if not completed goal and not me */}
                            {!isMe && !mem.todayProgress.goalAchieved ? (
                              <button
                                type="button"
                                onClick={() => void handleNudge(mem.userId, mem.user.name || mem.user.email)}
                                className="rounded-xl border border-primary/30 bg-primary/10 p-2 text-primary transition hover:bg-primary/20"
                                title="Nhắc nhở bạn học hôm nay"
                              >
                                <Bell size={14} />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Đua Top Liên Nhóm / Squad League */
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🏆</span>
                        <div>
                          <p className="text-xs font-black text-foreground">Giải Đấu Liên Nhóm Tuần</p>
                          <p className="text-[11px] text-muted-foreground">Các nhóm cùng ngôn ngữ thi đua tổng điểm XP tuần</p>
                        </div>
                      </div>
                      <span className="rounded-xl bg-amber-500/20 px-2.5 py-1 text-[11px] font-black text-amber-600 dark:text-amber-400">
                        {langLabel}
                      </span>
                    </div>

                    {leagueLoading ? (
                      <div className="py-8 text-center text-xs font-bold text-muted-foreground">Đang tải bảng đua nhóm...</div>
                    ) : leagueList.length === 0 ? (
                      <div className="py-8 text-center text-xs font-bold text-muted-foreground">Chưa có nhóm nào tham gia giải tuần này.</div>
                    ) : (
                      <div className="space-y-2.5">
                        {leagueList.map((squad) => {
                          const rankMedal =
                            squad.rank === 1 ? "🥇" : squad.rank === 2 ? "🥈" : squad.rank === 3 ? "🥉" : `#${squad.rank}`;
                          const isTop3 = squad.rank <= 3;

                          return (
                            <div
                              key={squad.id}
                              className={cn(
                                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all",
                                squad.isMyGroup
                                  ? "border-primary/50 bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                                  : "border-border bg-card hover:bg-secondary/40",
                              )}
                            >
                              <div className="flex items-center gap-3.5">
                                <span className={cn("w-7 text-center font-black", isTop3 ? "text-lg" : "text-sm text-muted-foreground")}>
                                  {rankMedal}
                                </span>

                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-2xl shadow-inner shrink-0">
                                  {PRESET_LIST.find((p) => p.id === squad.avatarUrl)?.emoji ?? "🦊"}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-xs font-black text-foreground">{squad.name}</h4>
                                    {squad.isMyGroup ? (
                                      <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[10px] font-black text-primary">
                                        Nhóm của bạn
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                                    <span>👥 {squad.memberCount}/{squad.maxMembers} thành viên</span>
                                    {squad.description ? <span>· &ldquo;{squad.description}&rdquo;</span> : null}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                                {/* Top MVPs in this group */}
                                {squad.topMembers.length > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground mr-1 hidden md:inline">Top:</span>
                                    <div className="flex -space-x-1.5">
                                      {squad.topMembers.map((m) => (
                                        <div
                                          key={m.id}
                                          title={`${m.name || "Thành viên"} (${m.weeklyXp} XP)`}
                                        >
                                          <AvatarWithFrame
                                            avatarUrl={m.avatarUrl}
                                            frame={m.avatarFrame}
                                            fallbackInitial={(m.name || "U").charAt(0).toUpperCase()}
                                            size={22}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}

                                <div className="text-right shrink-0">
                                  <p className="text-sm font-black text-primary">{squad.totalWeeklyXp} XP</p>
                                  <p className="text-[10px] font-medium text-muted-foreground">tổng điểm tuần</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Collaborative Group Deck */}
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div
                  className="absolute inset-x-0 top-0 h-[2.5px]"
                  style={{ background: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.cyan})` }}
                />
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 shadow-2xs">
                      <Layers size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Từ vựng chung</span>
                      <h3 className="text-base font-black text-foreground">Bộ Thẻ Của Nhóm</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cards.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setFlashcardIndex(0);
                          setShowMeaning(false);
                          setShowFlashcardModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2 text-xs font-black text-white shadow-xs transition hover:opacity-90"
                      >
                        <Zap size={13} />
                        <span>Ôn tập ({cards.length})</span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setShowAddCardModal(true)}
                      className="inline-flex items-center gap-1 rounded-2xl border border-border bg-secondary px-3 py-2 text-xs font-black text-foreground transition hover:border-primary/40"
                    >
                      <Plus size={13} />
                      <span>Thêm từ</span>
                    </button>
                  </div>
                </div>

                {/* Search input */}
                {cards.length > 0 ? (
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Tìm từ vựng hoặc nghĩa…"
                      value={cardSearch}
                      onChange={(e) => setCardSearch(e.target.value)}
                      className={cn(inputClass, "pl-9 py-2 text-xs")}
                    />
                  </div>
                ) : null}

                {cardsLoading ? (
                  <p className="text-xs font-bold text-muted-foreground">Đang tải thẻ…</p>
                ) : filteredCards.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      {cardSearch ? "Không tìm thấy từ vựng khớp." : "Chưa có từ vựng nào trong bộ thẻ nhóm."}
                    </p>
                    {!cardSearch ? (
                      <button
                        type="button"
                        onClick={() => setShowAddCardModal(true)}
                        className="mt-2 text-xs font-black text-primary hover:underline"
                      >
                        + Đóng góp từ vựng đầu tiên (+10 XP)
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {filteredCards.map((c) => {
                      const canDelete =
                        c.createdById === currentUserId ||
                        data.currentMemberRole === "LEADER";

                      return (
                        <div
                          key={c.id}
                          className="group relative rounded-2xl border border-border bg-secondary/30 p-3 shadow-2xs"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-black text-foreground">{c.term}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">
                                bởi {c.user.name || "thành viên"}
                              </span>
                              {canDelete ? (
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteCard(c.id)}
                                  className="text-muted-foreground/60 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                  title="Xóa từ"
                                >
                                  <Trash2 size={12} />
                                </button>
                              ) : null}
                            </div>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-primary">{c.meaning}</p>
                          {c.example ? (
                            <p className="mt-1 text-[11px] italic text-muted-foreground/80">{c.example}</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (1 Col): Activity Feed */}
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div
                  className="absolute inset-x-0 top-0 h-[2.5px]"
                  style={{ background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.cyan})` }}
                />
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-2xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Thời gian thực</span>
                      <h3 className="text-base font-black text-foreground">Bảng Tin Hoạt Động</h3>
                    </div>
                  </div>
                </div>

                {data.activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Chưa có hoạt động mới nào.</p>
                ) : (
                  <div className="space-y-3">
                    {data.activities.map((act) => {
                      const name = act.user.name || act.user.email;
                      let actText = "đã có hoạt động mới";
                      let actIcon = "⚡";

                      if (act.type === "COMPLETED_DAILY_GOAL") {
                        actText = "vừa hoàn thành mục tiêu ngày! 🔥";
                        actIcon = "🎯";
                      } else if (act.type === "COMPLETED_QUIZ") {
                        const score = act.metadata?.score as number | undefined;
                        actText = `vừa làm bài quiz${score !== undefined ? ` đạt ${score}%` : ""}!`;
                        actIcon = "💯";
                      } else if (act.type === "COMPLETED_LESSON") {
                        const title = (act.metadata?.title as string) || "bài học";
                        actText = `đã vượt qua ${title}!`;
                        actIcon = "🚀";
                      } else if (act.type === "ADDED_CARD") {
                        const term = (act.metadata?.term as string) || "từ vựng";
                        actText = `đã đóng góp từ mới: "${term}"`;
                        actIcon = "📚";
                      } else if (act.type === "JOINED_GROUP") {
                        actText = "vừa gia nhập nhóm!";
                        actIcon = "🎉";
                      } else if (act.type === "NUDGE") {
                        const toName = (act.metadata?.toName as string) || "đồng đội";
                        actText = `đã nhắc nhở ${toName} cùng vào học!`;
                        actIcon = "🔔";
                      }

                      return (
                        <div key={act.id} className="flex items-start gap-2.5 text-xs">
                          <span className="text-sm">{actIcon}</span>
                          <div>
                            <p className="text-foreground">
                              <strong>{name}</strong> {actText}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(act.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TẠO NHÓM MỚI ─────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="text-base font-black text-foreground">Tạo Nhóm Học Tập Mới</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={(e) => void handleCreateGroup(e)} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Tên nhóm *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Biệt Đội TOPIK II Cấp Tốc"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Mô tả / Slogan</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cùng đỗ TOPIK 4 trong 3 tháng tới!"
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Lộ trình học chung của nhóm</label>
                  <select
                    value={selectedPathId}
                    onChange={(e) => setSelectedPathId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">-- Không chọn / Tự do --</option>
                    {availablePaths.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-foreground">Biểu tượng nhóm</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_LIST.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setGroupAvatar(preset.id)}
                        className={cn(
                          "flex flex-col items-center rounded-2xl border p-2 text-2xl transition",
                          groupAvatar === preset.id
                            ? "border-primary bg-primary/10 shadow-xs"
                            : "border-border hover:bg-secondary",
                        )}
                      >
                        <span>{preset.emoji}</span>
                        <span className="mt-1 text-[10px] font-bold text-muted-foreground">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-primary px-5 py-2 text-xs font-black text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
                  >
                    {submitting ? "Đang tạo…" : "Tạo nhóm ngay"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── MODAL: GIA NHẬP BẰNG MÃ MỜI ────────────────────────────── */}
      <AnimatePresence>
        {showJoinModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              className="relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="text-base font-black text-foreground">Gia Nhập Nhóm Học Tập</h3>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={(e) => void handleJoinGroup(e)} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Mã mời (6 ký tự) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="Ví dụ: KOR999"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    className={cn(inputClass, "uppercase text-center font-black tracking-widest text-base")}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Hỏi trưởng nhóm để lấy mã mời vào nhóm học {langLabel}.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-primary px-5 py-2 text-xs font-black text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
                  >
                    {submitting ? "Đang vào…" : "Tham gia nhóm"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── MODAL: CÀI ĐẶT NHÓM (LEADER) ───────────────────────────── */}
      <AnimatePresence>
        {showSettingsModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-primary" />
                  <h3 className="text-base font-black text-foreground">Cài Đặt Nhóm Học Tập</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={(e) => void handleSaveSettings(e)} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Tên nhóm *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Mô tả / Slogan</label>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Lộ trình học chung của nhóm</label>
                  <select
                    value={editTargetPathId}
                    onChange={(e) => setEditTargetPathId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">-- Không chọn / Tự do --</option>
                    {availablePaths.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-foreground">Biểu tượng nhóm</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_LIST.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setEditAvatar(preset.id)}
                        className={cn(
                          "flex flex-col items-center rounded-2xl border p-2 text-2xl transition",
                          editAvatar === preset.id
                            ? "border-primary bg-primary/10 shadow-xs"
                            : "border-border hover:bg-secondary",
                        )}
                      >
                        <span>{preset.emoji}</span>
                        <span className="mt-1 text-[10px] font-bold text-muted-foreground">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-primary px-5 py-2 text-xs font-black text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu…" : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── MODAL: THÊM TỪ VỰNG NHÓM ─────────────────────────────────── */}
      <AnimatePresence>
        {showAddCardModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddCardModal(false)}
          >
            <motion.div
              className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="text-base font-black text-foreground">Đóng Góp Từ Vựng Mới</h3>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={(e) => void handleAddCard(e)} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Từ / Cụm từ *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 안녕하세요 hoặc Diligent"
                    value={cardTerm}
                    onChange={(e) => setCardTerm(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Nghĩa tiếng Việt *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Xin chào / Chăm chỉ"
                    value={cardMeaning}
                    onChange={(e) => setCardMeaning(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Ví dụ câu (tùy chọn)</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: He is a diligent student."
                    value={cardExample}
                    onChange={(e) => setCardExample(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-500">🎁 Nhận ngay +10 XP cho nhóm!</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCardModal(false)}
                      className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-2xl bg-primary px-5 py-2 text-xs font-black text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
                    >
                      {submitting ? "Đang lưu…" : "Thêm vào nhóm"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── MODAL: FLASHCARD PRACTICE (ÔN TẬP NHÓM) ─────────────────── */}
      <AnimatePresence>
        {showFlashcardModal && cards.length > 0 ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFlashcardModal(false)}
          >
            <motion.div
              className="relative mx-4 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-black text-primary">
                  Ôn tập Thẻ {flashcardIndex + 1} / {cards.length}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFlashcardModal(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Card Canvas */}
              <div
                onClick={() => setShowMeaning((prev) => !prev)}
                className="mt-6 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/40 bg-secondary/40 p-8 text-center transition-all hover:bg-secondary/60"
              >
                {!showMeaning ? (
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                      Từ vựng (Bấm để xem nghĩa)
                    </span>
                    <h2 className="mt-3 text-3xl font-black text-foreground">
                      {cards[flashcardIndex].term}
                    </h2>
                  </div>
                ) : (
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">
                      Nghĩa tiếng Việt
                    </span>
                    <h2 className="mt-2 text-2xl font-black text-primary">
                      {cards[flashcardIndex].meaning}
                    </h2>
                    {cards[flashcardIndex].example ? (
                      <p className="mt-3 text-xs italic text-muted-foreground">
                        {cards[flashcardIndex].example}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setFlashcardIndex((prev) => Math.max(0, prev - 1));
                    setShowMeaning(false);
                  }}
                  className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary disabled:opacity-30"
                >
                  ← Thẻ trước
                </button>

                <button
                  type="button"
                  onClick={() => setShowMeaning((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary/80"
                >
                  <RotateCw size={12} />
                  <span>{showMeaning ? "Xem từ gốc" : "Lật thẻ"}</span>
                </button>

                <button
                  type="button"
                  disabled={flashcardIndex >= cards.length - 1}
                  onClick={() => {
                    setFlashcardIndex((prev) => Math.min(cards.length - 1, prev + 1));
                    setShowMeaning(false);
                  }}
                  className="rounded-2xl bg-primary px-4 py-2 text-xs font-black text-white hover:opacity-95 disabled:opacity-30"
                >
                  Thẻ sau →
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── MODAL: CONFIRM LEAVE GROUP ─────────────────────────────── */}
      <AnimatePresence>
        {showLeaveModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLeaveModal(false)}
          >
            <motion.div
              className="relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <LogOut size={28} />
              </div>
              <h3 className="mt-3 text-lg font-black text-foreground">Rời Nhóm Học Tập?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Bạn có chắc chắn muốn rời nhóm <strong>{data?.group.name}</strong> không?{" "}
                {data?.currentMemberRole === "LEADER"
                  ? "Quyền Trưởng nhóm sẽ được chuyển tự động cho thành viên kế tiếp."
                  : "Bạn sẽ không còn nhìn thấy tiến độ và bộ thẻ của nhóm nữa."}
              </p>

              <div className="mt-6 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="rounded-2xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary"
                >
                  Giữ lại
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleLeaveGroup()}
                  className="rounded-2xl bg-red-500 px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-red-600 disabled:opacity-50"
                >
                  {submitting ? "Đang xử lý…" : "Xác nhận rời nhóm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function GroupsPage() {
  return (
    <AuthGate>
      <GroupsContent />
    </AuthGate>
  );
}
