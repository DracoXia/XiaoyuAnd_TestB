self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(payload.title || '这支音乐已经结束', {
    body: payload.body || '如果愿意，可以记下此刻的心情。',
    icon: '/icon-192.png',
    badge: '/icon-180.png',
    tag: payload.tag || 'xiaoyu-timer-ended',
    data: { url: payload.url || '/?preview=timer-ended&scent=tinghe' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
    const existing = clients.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) {
      await existing.navigate(targetUrl);
      return existing.focus();
    }
    return self.clients.openWindow(targetUrl);
  }));
});
