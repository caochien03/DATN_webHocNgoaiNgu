// Service Worker for Chingo Web Push Notifications

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Chingo - Học ngoại ngữ thông minh';
    const options = {
      body: data.body || 'Bạn có thông báo mới từ hệ thống học tập!',
      icon: data.icon || '/logo.png',
      badge: data.badge || '/logo.png',
      tag: data.tag || 'chingo-notification',
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/groups',
        dateOfArrival: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: 'Xem ngay 🚀',
        },
        {
          action: 'close',
          title: 'Đóng',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error handling push event:', err);
    event.waitUntil(
      self.registration.showNotification('Chingo', {
        body: event.data ? event.data.text() : 'Bạn có thông báo mới!',
        icon: '/logo.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/groups';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
