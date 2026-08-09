'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, ExternalLink, X } from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  body: string;
  url?: string;
  timestamp: Date;
}

export const InAppPushNotificationBanner: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handlePushNotice = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title?: string;
        body?: string;
        url?: string;
      }>;

      if (!customEvent.detail) return;

      const newNotice: NoticeItem = {
        id: `${Date.now()}-${Math.random()}`,
        title: customEvent.detail.title || 'Thông báo mới',
        body: customEvent.detail.body || '',
        url: customEvent.detail.url || '/groups',
        timestamp: new Date(),
      };

      setNotices((prev) => [newNotice, ...prev.slice(0, 2)]);

      // Auto dismiss after 7 seconds
      setTimeout(() => {
        setNotices((prev) => prev.filter((n) => n.id !== newNotice.id));
      }, 7000);
    };

    window.addEventListener('chingo-push-notice', handlePushNotice);
    return () => {
      window.removeEventListener('chingo-push-notice', handlePushNotice);
    };
  }, []);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClick = (notice: NoticeItem) => {
    setNotices((prev) => prev.filter((n) => n.id !== notice.id));
    if (notice.url) {
      router.push(notice.url);
    }
  };

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: -25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={() => handleClick(notice)}
            className="pointer-events-auto group cursor-pointer relative overflow-hidden rounded-2xl border border-primary/25 bg-card/95 backdrop-blur-xl p-4 shadow-2xl transition hover:border-primary/45 hover:shadow-primary/10"
          >
            {/* Top Header Bar */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-5 overflow-hidden rounded-md shadow-xs bg-primary/10 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Chingo"
                    width={20}
                    height={20}
                    className="object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Bell className="h-3 w-3 text-primary absolute" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  CHINGO
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">Vừa xong</span>
                <button
                  type="button"
                  onClick={(e) => handleDismiss(notice.id, e)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
                  title="Đóng"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div>
              <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                <span>{notice.title}</span>
              </h4>
              <p className="mt-1 text-xs font-medium text-muted-foreground leading-relaxed">
                {notice.body}
              </p>
            </div>

            {/* Bottom action indicator */}
            <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-primary font-bold">
              <span>Xem chi tiết</span>
              <ExternalLink size={12} />
            </div>

            {/* Progress line */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 7, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/40 origin-left"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
