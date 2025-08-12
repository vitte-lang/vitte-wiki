/* sw.js — Vitte Docs, offline-first, cache-safe */

///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
/// 1) Configuration
///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
const APP_NAME       = 'vitte-docs';
const CACHE_VERSION  = 'v3';               // ↑ incrémente à chaque release
const PRECACHE_NAME  = `${APP_NAME}-precache-${CACHE_VERSION}`;
const RUNTIME_NAME   = `${APP_NAME}-runtime-${CACHE_VERSION}`;
const OFFLINE_HTML   = './offline.html';   // optionnel (prévu ci-dessous)
const OFFLINE_MD     = './content/offline.md'; // fallback pour markdown

// Shell critique à pré-cacher (URLs **immutables** par version)
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './search-index.json',
  './versions.json',
  './i18n/en.json',
  './content/en/start.md',
  // Offlines (facultatif — crée ces fichiers)
  OFFLINE_HTML,
  OFFLINE_MD,
];

/** Ressources Markdown à cacher à la volée (pattern) */
const MD_MATCH = /\/content\/.+\.(md|markdown)(\?.*)?$/i;
/** I18N runtime */
const I18N_MATCH = /\/i18n\/.+\.json(\?.*)?$/i;
/** Ressources de même origine uniquement */
const sameOrigin = (url) => self.location.origin === new URL(url, self.location).origin;


///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
/// 2) Helpers de stratégies
///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
async function fromNetwork(req) {
  // utilisation de navigation preload si possible
  const preload = await self.registration.navigationPreload?.getResponse();
  if (preload) return preload;
  return fetch(req);
}

async function fromCache(cacheName, req) {
  const cache = await caches.open(cacheName);
  const match = await cache.match(req, { ignoreVary: true });
  return match || undefined;
}

async function cachePut(cacheName, req, res) {
  // Ne met pas en cache les réponses opaques ou invalides
  if (!res || res.status !== 200 || res.type === 'opaque') return;
  const cache = await caches.open(cacheName);
  // Clone nécessaire: une réponse n'est lisible qu'une fois
  await cache.put(req, res.clone());
}

async function staleWhileRevalidate(cacheName, req) {
  const cached = await fromCache(cacheName, req);
  const networkPromise = (async () => {
    try {
      const fresh = await fetch(req);
      await cachePut(cacheName, req, fresh);
      return fresh.clone();
    } catch {
      return undefined;
    }
  })();

  // Renvoie d'abord le cache si dispo, sinon le réseau
  return cached || (await networkPromise) || undefined;
}


///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
/// 3) Install: pré-cache le shell
///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE_NAME);
    // hint pour éviter de polluer le cache HTTP du navigateur
    const requests = PRECACHE_URLS.map((u) => new Request(u, { cache: 'reload' }));
    await cache.addAll(requests);
    await self.skipWaiting();
  })());
});


///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
/// 4) Activate: nettoyage des anciens caches + navigation preload
///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Clean old versions
    const names = await caches.keys();
    const valid = new Set([PRECACHE_NAME, RUNTIME_NAME]);
    await Promise.all(names.map((n) => (valid.has(n) ? undefined : caches.delete(n))));

    // Navigation Preload si supporté
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }

    await self.clients.claim();
  })());
});


///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
/// 5) Fetch: stratégies par type de requête
///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !sameOrigin(request.url)) {
    // Laisse passer tout ce qui n'est pas GET ou hors origine
    return;
  }

  const url = new URL(request.url);

  // a) Navigations (SPA/MPA) : Network-first avec fallback offline
  if (request.mode === 'navigate' || (request.destination === '' && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith((async () => {
      try {
        const res = await fromNetwork(request);
        // Met en cache la page d'entrée (index.html)
        await cachePut(PRECACHE_NAME, './index.html', res.clone());
        return res;
      } catch {
        // Fallback: index en cache ou page offline
        return (await fromCache(PRECACHE_NAME, './index.html')) ||
               (await fromCache(PRECACHE_NAME, OFFLINE_HTML)) ||
               new Response('<h1>Offline</h1><p>No cached shell available.</p>', {
                 headers: { 'Content-Type': 'text/html; charset=utf-8' },
                 status: 503,
               });
      }
    })());
    return;
  }

  // b) Fichiers pré-cachés (app shell & assets immutables)
  if (PRECACHE_URLS.some((u) => url.pathname.endsWith(u.replace('./', '/')))) {
    event.respondWith((async () => {
      return (await fromCache(PRECACHE_NAME, request)) || fetch(request);
    })());
    return;
  }

  // c) Markdown & i18n : stale-while-revalidate dans le cache runtime
  if (MD_MATCH.test(url.pathname) || I18N_MATCH.test(url.pathname)) {
    event.respondWith((async () => {
      const res = await staleWhileRevalidate(RUNTIME_NAME, request);
      if (res) return res;

      // Fallbacks dédiés
      if (MD_MATCH.test(url.pathname)) {
        return (await fromCache(PRECACHE_NAME, OFFLINE_MD)) ||
               new Response('# Offline\nNo cached markdown.', { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
      }
      if (I18N_MATCH.test(url.pathname)) {
        return (await fromCache(PRECACHE_NAME, './i18n/en.json')) ||
               new Response('{"offline":true}', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      }
      return fetch(request);
    })());
    return;
  }

  // d) Autres assets de même origine : cache-first puis réseau
  event.respondWith((async () => {
    return (await fromCache(RUNTIME_NAME, request)) ||
           (await (async () => {
             try {
               const fresh = await fetch(request);
               await cachePut(RUNTIME_NAME, request, fresh);
               return fresh.clone();
             } catch {
               // Dernier filet: si HTML -> offline
               if (request.headers.get('accept')?.includes('text/html')) {
                 return (await fromCache(PRECACHE_NAME, OFFLINE_HTML)) ||
                        (await fromCache(PRECACHE_NAME, './index.html')) ||
                        new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
               }
               return new Response('', { status: 504 });
             }
           })());
  })());
});


///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
/// 6) Communication client ↔ SW
///–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
self.addEventListener('message', async (event) => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') {
    await self.skipWaiting();
    return;
  }
  if (type === 'GET_VERSION') {
    event.ports?.[0]?.postMessage({ cache: CACHE_VERSION });
    return;
  }
  if (type === 'CLEAR_RUNTIME') {
    await caches.delete(RUNTIME_NAME);
    event.ports?.[0]?.postMessage({ cleared: true });
  }
});
