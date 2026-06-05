// Service Worker — Matematik Macerası
// Strategy: Cache-first for game assets, network-first for HTML.

const CACHE_NAME = 'matmac-v1';
const PRECACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/main.js',
  './js/config.js',
  './js/levels/levels.js',
  './js/utils/QuestionGenerator.js',
  './js/utils/ScoreManager.js',
  './js/objects/Player.js',
  './js/objects/Enemy.js',
  './js/objects/MysteryBox.js',
  './js/scenes/BootScene.js',
  './js/scenes/MenuScene.js',
  './js/scenes/GameScene.js',
  './js/scenes/GameOverScene.js',
  // CDN assets cached at runtime (see fetch handler)
];

// CDN libraries to cache
const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
];

// ── Install: precache local assets ───────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE).catch((err) => {
        console.warn('[SW] Precache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy ────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // CDN requests: cache-first
  if (CDN_URLS.some((u) => url.startsWith(u.split('/').slice(0, 4).join('/')))) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // HTML: network-first (so updates propagate)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Everything else: cache-first
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Çevrimdışı — içerik önbellekte bulunamadı.', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response('Çevrimdışı', { status: 503 });
  }
}
