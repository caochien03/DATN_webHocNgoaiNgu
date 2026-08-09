import { fetchWithAuth, parseApiError } from './api-fetch';
import { getApiUrl } from './api-url';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function playNotificationSound(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Ignore audio autoplay restrictions if any
  }
}

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return reg;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function getPushSubscriptionState(): Promise<{
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
}> {
  if (!isPushNotificationSupported()) {
    return { supported: false, permission: 'unsupported', isSubscribed: false };
  }

  const permission = Notification.permission;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return {
      supported: true,
      permission,
      isSubscribed: !!sub && permission === 'granted',
    };
  } catch {
    return {
      supported: true,
      permission,
      isSubscribed: false,
    };
  }
}

export async function showDirectNotification(title: string, body: string, url = '/groups'): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Phát tiếng chuông audio
  playNotificationSound();

  // 2. Kích hoạt Banner nổi in-app tức thì trên giao diện
  window.dispatchEvent(
    new CustomEvent('chingo-push-notice', {
      detail: { title, body, url },
    })
  );

  // 3. Kích hoạt Notification của Hệ Điều Hành / Trình duyệt
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, {
            body,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: 'chingo-direct-notice',
            data: { url },
          });
          return;
        }
      }

      const n = new Notification(title, {
        body,
        icon: '/logo.png',
      });
      n.onclick = () => {
        window.focus();
        window.location.href = url;
      };
    } catch (e) {
      console.warn('showDirectNotification fallback error:', e);
    }
  }
}

export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!isPushNotificationSupported()) {
    return { success: false, message: 'Trình duyệt của bạn không hỗ trợ Web Push Notification.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        message:
          'Trình duyệt đang chặn thông báo. Vui lòng bấm vào biểu tượng ổ khóa 🔒 ở thanh địa chỉ để chuyển "Thông báo" sang "Cho phép".',
      };
    }

    await registerServiceWorker();
    const reg = await navigator.serviceWorker.ready;

    // Lấy VAPID Public Key từ backend
    const base = getApiUrl();
    const keyRes = await fetch(`${base}/notifications/vapid-public-key`);
    if (!keyRes.ok) {
      return { success: false, message: 'Không thể kết nối dịch vụ thông báo máy chủ.' };
    }
    const keyData = (await keyRes.json()) as { publicKey: string; enabled: boolean };
    if (!keyData.enabled || !keyData.publicKey) {
      return { success: false, message: 'Tính năng thông báo đẩy chưa được kích hoạt trên máy chủ.' };
    }

    const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);

    // Kiểm tra xem đã có subscription cũ chưa
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as ArrayBuffer,
      });
    }

    const rawKey = subscription.getKey ? subscription.getKey('p256dh') : null;
    const rawAuth = subscription.getKey ? subscription.getKey('auth') : null;

    if (!rawKey || !rawAuth) {
      return { success: false, message: 'Không thể trích xuất khóa mã hóa từ trình duyệt.' };
    }

    const p256dh = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawKey))));
    const auth = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawAuth))));

    // Gửi subscription lên backend lưu vào CSDL
    const res = await fetchWithAuth('/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        userAgent: navigator.userAgent,
      }),
    });

    if (!res.ok) {
      const err = await parseApiError(res);
      return { success: false, message: err };
    }

    return { success: true, message: 'Đã kích hoạt nhận thông báo đẩy thành công!' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi đăng ký thông báo.';
    console.error('Error subscribing to push:', error);
    return { success: false, message: msg };
  }
}

export async function unsubscribeFromPushNotifications(): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!isPushNotificationSupported()) return { success: false };

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetchWithAuth('/notifications/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => null);
      await sub.unsubscribe();
    }
    return { success: true, message: 'Đã tắt nhận thông báo đẩy.' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi tắt thông báo.';
    return { success: false, message: msg };
  }
}

export async function sendTestPushNotification(title?: string, body?: string): Promise<{
  success: boolean;
  message?: string;
  sentCount?: number;
}> {
  const defaultTitle = title || '🔔 Chingo · Lời Nhắc Học Tập!';
  const defaultBody =
    body ||
    'Đồng đội vừa nhắc bạn: "Vào hoàn thành mục tiêu 10 từ vựng hôm nay để giữ chuỗi 🔥 1 ngày nhé!"';

  try {
    // 1. Trigger in-browser visual & audible feedback immediately
    await showDirectNotification(defaultTitle, defaultBody);

    // 2. Dispatch via Backend Web-Push to all active subscriptions
    const res = await fetchWithAuth('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ title: defaultTitle, body: defaultBody }),
    });

    if (!res.ok) {
      const err = await parseApiError(res);
      return {
        success: true,
        message: `Đã phát thông báo trực tiếp trên màn hình! (Máy chủ: ${err})`,
      };
    }

    const data = (await res.json()) as { success: boolean; message: string; sentCount: number };
    return {
      success: true,
      message:
        data.sentCount > 0
          ? `Đã gửi thông báo đẩy đến ${data.sentCount} thiết bị thành công!`
          : 'Đã hiển thị thông báo trực tiếp trên màn hình!',
      sentCount: data.sentCount,
    };
  } catch {
    return {
      success: true,
      message: 'Đã hiển thị thông báo trực tiếp trên trình duyệt của bạn!',
    };
  }
}
