'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCircle2 } from 'lucide-react';
import {
  getPushSubscriptionState,
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/lib/push-notifications';

interface PushNotificationCardProps {
  className?: string;
  variant?: 'full' | 'compact' | 'auto';
}

export const PushNotificationCard: React.FC<PushNotificationCardProps> = ({
  className = '',
  variant = 'auto',
}) => {
  const [supported, setSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const refreshStatus = async () => {
    await registerServiceWorker();
    const state = await getPushSubscriptionState();
    setSupported(state.supported);
    setPermission(state.permission);
    setIsSubscribed(state.isSubscribed);
  };

  useEffect(() => {
    void refreshStatus();
  }, []);

  const handleToggleSubscribe = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      if (isSubscribed) {
        const res = await unsubscribeFromPushNotifications();
        if (res.success) {
          setIsSubscribed(false);
          setStatusMessage('Đã tắt nhận thông báo.');
        } else {
          setStatusMessage(res.message || 'Không thể tắt thông báo.');
        }
      } else {
        const res = await subscribeToPushNotifications();
        if (res.success) {
          setIsSubscribed(true);
          setPermission('granted');
          setStatusMessage('🎉 Đã bật nhận thông báo học tập thành công!');
        } else {
          setStatusMessage(res.message || 'Không thể bật thông báo.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi.';
      setStatusMessage(msg);
    } finally {
      await refreshStatus();
      setLoading(false);
    }
  };

  if (!supported) {
    return null;
  }

  const isDenied = permission === 'denied';

  // Tự động thu gọn khi đã bật (nếu variant là 'auto' hoặc 'compact')
  const shouldCollapse = variant === 'compact' || (variant === 'auto' && isSubscribed);

  if (shouldCollapse && !isDenied) {
    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/80 px-4 py-2.5 shadow-2xs backdrop-blur-sm transition-all hover:border-border ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={15} />
          </div>
          <p className="truncate text-xs font-semibold text-foreground">
            Đang bật nhận thông báo học tập & hoạt động nhóm
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleSubscribe}
            disabled={loading}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground cursor-pointer"
            title="Tắt nhận thông báo"
          >
            <BellOff size={13} />
            <span>{loading ? '...' : 'Tắt'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:border-primary/30 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">
                Nhắc nhở học tập & Hoạt động nhóm
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isDenied
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : isSubscribed
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {isDenied
                  ? '● Trình duyệt đang chặn'
                  : isSubscribed
                  ? '● Đang bật'
                  : '○ Chưa bật'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xl">
              Nhận thông báo khi đồng đội gửi lời nhắc <b>(Nudge 🔔)</b>, cổ vũ <b>(Cheer 🚀)</b> hoặc khi nhóm mở khóa <b>Rương thưởng 🎁</b>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isDenied && (
            <button
              type="button"
              onClick={handleToggleSubscribe}
              disabled={loading}
              className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer ${
                isSubscribed
                  ? 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/90'
                  : 'bg-primary text-primary-foreground hover:opacity-95 shadow-primary/20'
              }`}
            >
              {isSubscribed ? (
                <>
                  <BellOff size={14} />
                  <span>Tắt nhận tin</span>
                </>
              ) : (
                <>
                  <Bell size={14} />
                  <span>Bật thông báo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {isDenied && (
        <div className="mt-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-foreground">
          <div className="font-bold text-rose-600 dark:text-rose-400 mb-1">
            ⚠️ Hướng dẫn mở lại quyền thông báo trên trình duyệt:
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Bấm vào biểu tượng <b>Ổ khóa 🔒 hoặc Cài đặt</b> ở góc trái thanh địa chỉ trình duyệt ➔ Chuyển <b>Thông báo (Notifications)</b> sang <b>Cho phép (Allow)</b>.
          </p>
        </div>
      )}

      {statusMessage && !isDenied && (
        <div className="mt-3 rounded-2xl bg-secondary/60 border border-border/70 px-3.5 py-2 text-xs font-medium text-foreground flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-muted-foreground hover:text-foreground ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
