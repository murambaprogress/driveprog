// This service worker is used for MSW (Mock Service Worker)
// This file will be copied to the public directory by the MSW library
self.addEventListener('install', () => {
  // Skip over the "waiting" lifecycle state, to ensure the
  // service worker is activated right after installation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim any clients immediately, so the page will be under SW control
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'MOCK_ACTIVATE') {
    self.postMessage({ type: 'MOCKING_ENABLED' });
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const accept = request.headers.get('accept') || '';

  // Handle API request
  if (request.url.includes('/api/')) {
    // For simplicity, let the MSW handle the request
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate' && accept.includes('text/html')) {
    event.respondWith(
        fetch(request).catch(() => {
          // Intentional: if network fetch fails in dev, return a 408 for MSW.
          return new Response('Network error', { status: 408 });
        })
      );
  }
});
