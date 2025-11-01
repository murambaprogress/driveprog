/* Simple service worker to show push notifications. Requires server to send push via VAPID and subscription. */
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Notification', body: '' };
  const title = data.title || 'Notification';
  const options = { body: data.body || '', icon: '/favicon.png', badge: '/favicon.png', data: data.url || '/' };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
