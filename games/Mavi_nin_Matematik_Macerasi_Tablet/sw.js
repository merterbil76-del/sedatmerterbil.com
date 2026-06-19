const CACHE = 'mavi-matematik-v1';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './game.js?v=boss-cinematic-2',
  './player.png',
  './player_spritesheet_clean.png',
  './enemy.png',
  './enemy_boss_clean.png?v=boss-cinematic-2',
  './enemy_boss_2_clean.png?v=boss-cinematic-2',
  './enemy_boss_3_clean.png?v=boss-cinematic-2',
  './enemy_boss_4_clean.png?v=boss-cinematic-2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
