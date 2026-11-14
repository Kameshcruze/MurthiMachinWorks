const CACHE_VERSION = 'mmw-pwa-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shellCache = await caches.open(APP_SHELL_CACHE);
      await shellCache.addAll(APP_SHELL_ASSETS);

      // Discover and pre-cache built JS/CSS bundles referenced by index.html
      try {
        const res = await fetch('/index.html', { cache: 'no-cache' });
        if (res.ok) {
          const html = await res.text();
          const assetMatches = html.match(/\/assets\/[^"'\s)]+\.(?:js|css)/g) || [];
          const uniqueAssets = [...new Set(assetMatches)];
          if (uniqueAssets.length > 0) {
            const staticCache = await caches.open(STATIC_CACHE);
            await Promise.allSettled(
              uniqueAssets.map((assetUrl) => staticCache.add(assetUrl))
            );
          }
        }
      } catch {
        // Ignore if network fetch of /index.html fails during install
      }

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => !name.startsWith(CACHE_VERSION))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

function isStaticAssetRequest(request, url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname === '/sw.js') return false;
  return (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff2?|json|webmanifest)$/i.test(url.pathname) ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never intercept third-party APIs or dynamic backend requests
  if (url.origin !== self.location.origin) return;

  const isHtmlRequest =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  // Network-first strategy for HTML / page navigations
  if (isHtmlRequest) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(APP_SHELL_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cache = await caches.open(APP_SHELL_CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match('/')) ||
            (await cache.match('/index.html'))
          );
        }
      })()
    );
    return;
  }

  // Cache-first strategy for static assets
  if (isStaticAssetRequest(request, url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return new Response('', { status: 408, statusText: 'Offline' });
        }
      })()
    );
  }
});
