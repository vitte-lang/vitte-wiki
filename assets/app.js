(function(){
  'use strict';

  function boot(){
    // -------- DOM
    const $ = (id) => document.getElementById(id);
    const contentEl = $('content'), input = $('q'), sidebar = $('sidebar');
    const sidebarToggle = $('sidebarToggle'), themeToggle = $('themeToggle');

    // -------- State (use existing window.WIKI if present)
    const W = (window.WIKI = window.WIKI || {
      routes: {},
      cache: new Map(),
      index: []
    });

    // -------- Templates (offline file:// mode)
    const TPL = new Map();
    document.querySelectorAll('template[data-route]').forEach(t => TPL.set(t.dataset.route, t.innerHTML));
    const NO_SERVER = (location.protocol === 'file:') || TPL.size > 0;

    // -------- Theme
    const THEME_KEY = 'wiki.theme';
    const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    function applyTheme(mode){
      const eff = (mode === 'auto') ? (prefersDark() ? 'dark' : 'light') : mode;
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.setAttribute('data-theme-effective', eff);
    }
    applyTheme(localStorage.getItem(THEME_KEY) || 'auto');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'auto';
        const next = (cur === 'light') ? 'dark' : (cur === 'dark' ? 'auto' : 'light');
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
      const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      mq && mq.addEventListener && mq.addEventListener('change', () => {
        if ((localStorage.getItem(THEME_KEY) || 'auto') === 'auto') applyTheme('auto');
      });
    }

    // -------- Sidebar toggle
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // -------- Shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); input && input.focus(); }
      if (e.key === 'g') { window._g = (window._g || 0) + 1; setTimeout(() => window._g = 0, 500); }
      else if (e.key === 'h' && window._g === 1) { location.hash = '#/start'; }
    });

    // -------- Utils
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const safe = (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    function parseHash(){
      const raw = location.hash || '#/start';
      const r = raw.startsWith('#/') ? raw.slice(2) : 'start';
      return r.replace(/[^A-Za-z0-9/_-]/g, '') || 'start';
    }
    function setTitleFromHTML(html, fb){
      try {
        const d = new DOMParser().parseFromString(html, 'text/html');
        const h1 = d.querySelector('h1');
        document.title = ((h1 && h1.textContent.trim()) || fb || 'Vitte Wiki') + ' — Vitte Wiki';
      } catch { document.title = (fb || 'Vitte Wiki') + ' — Vitte Wiki'; }
    }

    // -------- Fetch (HTTP mode)
    let currentFetch = null, lastRoute = null, searchTimer = 0;
    async function fetchPage(path, { noStore = false } = {}){
      if (W.cache.has(path) && !noStore) return W.cache.get(path);
      const ctl = new AbortController();
      const p = (async () => {
        const res = await fetch(path, { cache: noStore ? 'no-store' : 'force-cache', signal: ctl.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + path);
        return res.text();
      })();
      if (!noStore) W.cache.set(path, p);
      currentFetch = ctl;
      try { return await p; } finally { if (currentFetch === ctl) currentFetch = null; }
    }

    // -------- Unified loader (templates first in no-server mode)
    async function getPage(route, path){
      if (TPL.has(route)) return TPL.get(route);
      if (NO_SERVER) throw new Error('No template for route "' + route + '".');
      return fetchPage(path);
    }

    // -------- Search index (templates prioritized)
    async function buildIndex(){
      const entries = [];
      const items = Object.entries(W.routes);
      for (let i = 0; i < items.length; i++) {
        const [name, path] = items[i];
        try {
          const html = TPL.has(name) ? TPL.get(name) : (NO_SERVER ? null : await fetchPage(path));
          if (!html) continue;
          const text = html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
          entries.push({ name, path, text });
          W.index = entries.slice(0);
        } catch {}
        if (i % 3 === 2) await sleep(0);
      }
    }

    // -------- Render
    async function renderRoute(){
      const route = parseHash(); lastRoute = route;
      const path = W.routes[route] || W.routes.start;
      if (!path && !TPL.has(route)) {
        if (contentEl) contentEl.innerHTML = `<h1>Not configured</h1><p>No route for <code>${safe(route)}</code> and no <code>start</code> fallback.</p>`;
        document.title = 'Not configured — Vitte Wiki'; return;
      }
      if (currentFetch) try { currentFetch.abort(); } catch {}
      try {
        const html = await getPage(route, path);
        if (route !== lastRoute) return;
        if (contentEl) {
          contentEl.innerHTML = html;
          setTitleFromHTML(html, route);
          window.scrollTo({ top: 0, behavior: 'instant' });
          contentEl.setAttribute('tabindex', '1');
          contentEl.focus({ preventScroll: true });
        }
        if (sidebar) sidebar.classList.remove('open');
      } catch (e) {
        if (contentEl) contentEl.innerHTML = `<h1>Not found</h1><p>Could not load <code>${safe(path || route)}</code>.</p><p>${safe(e.message || e)}</p>`;
        document.title = 'Not found — Vitte Wiki';
      }
    }

    // -------- Search (debounced)
    function doSearch(q){
      const term = (q || '').toLowerCase().trim();
      if (!term) { renderRoute(); return; }
      const results = (W.index || [])
        .map(it => {
          const i = it.text.indexOf(term);
          if (i === -1) return null;
          const s = Math.max(0, i - 60);
          const e = Math.min(it.text.length, i + term.length + 120);
          return { name: it.name, snippet: it.text.slice(s, e) };
        })
        .filter(Boolean)
        .slice(0, 30);

      const list = results.map(r => {
        const esc = safe(r.snippet);
        const re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        const hl = esc.replace(re, '<mark>$1</mark>');
        return `<li><a href="#/${safe(r.name)}" onclick="document.getElementById('q').value=''">${safe(r.name)}</a><br><small>${hl}</small></li>`;
      }).join('');

      if (contentEl) {
        contentEl.innerHTML = `<h1>Search results</h1><ul class="search">${list || '<li><em>No results.</em></li>'}</ul>`;
      }
      document.title = 'Search — Vitte Wiki';
    }

    if (input) {
      input.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => doSearch(input.value), 120);
      });
    }

    // -------- Routing
    window.addEventListener('hashchange', renderRoute);

    // -------- Boot
    renderRoute();
    buildIndex();
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
