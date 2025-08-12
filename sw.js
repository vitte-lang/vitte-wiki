// sw.js
const ROOT = new URL(self.registration.scope).pathname.replace(/\/$/, ''); // "/repo" or ""
const CACHE_NAME = 'vitte-docs-v2';
const APP_SHELL = [
  `${ROOT}/`,
  `${ROOT}/index.html`,
  `${ROOT}/styles.css`,
  `${ROOT}/app.js`,
  `${ROOT}/print.html`,
  `${ROOT}/print.js`,
  `${ROOT}/versions.json`,
  `${ROOT}/i18n/en.json`,
  `${ROOT}/i18n/fr.json`
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // Only handle our scope
  if (!url.pathname.startsWith(ROOT)) return;
  // Cache-first for same-origin; network-first for others
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }).catch(()=> caches.match(`${ROOT}/index.html`)))
    );
  } else {
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
  }
});