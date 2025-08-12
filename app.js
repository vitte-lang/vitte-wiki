// app.js
const $ = (q, el=document)=>el.querySelector(q);
const $$ = (q, el=document)=>Array.from(el.querySelectorAll(q));

/* ---------- Config ---------- */
const DEFAULT_LOCALE = 'en';
const DEFAULT_ROUTE  = 'start';
const REPO_EDIT_URL  = 'https://github.com/you/vitte-docs/edit/main/content'; // tweak me

/* ---------- State ---------- */
let locale = localStorage.getItem('vitte.locale') || DEFAULT_LOCALE;
let version = localStorage.getItem('vitte.version') || 'latest';
let i18n = {};
let nav = []; // [{group,title,items:[{title,route}]}]
let routes = []; // linear order for prev/next

/* ---------- Boot ---------- */
initTheme();
initHeader();
await initI18n(locale);
await initVersions();
await initSearch();
await initNav(); // uses i18n
initRouter();    // sets initial page

/* ---------- Theme ---------- */
function initTheme(){
  const key = 'vitte.theme';
  const apply = v => (document.documentElement.setAttribute('data-theme', v), localStorage.setItem(key, v));
  const saved = localStorage.getItem(key) || 'auto'; apply(saved);
  $('#theme').addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    apply(cur==='dark' ? 'light' : cur==='light' ? 'auto' : 'dark');
  });
}

/* ---------- Header controls ---------- */
function initHeader(){
  const sidebar = $('#sidebar');
  $('#navToggle').addEventListener('click', ()=>{
    const open = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    $('#navToggle').setAttribute('aria-expanded', String(open));
  });

  // locale switch
  $('#locale').value = locale;
  $('#locale').addEventListener('change', async e=>{
    locale = e.target.value; localStorage.setItem('vitte.locale', locale);
    await initI18n(locale);
    await initNav(true);
    routeTo(parseHash(location.hash)); // re-render current
  });

  // version switch
  $('#version').addEventListener('change', e=>{
    version = e.target.value; localStorage.setItem('vitte.version', version);
    // In static site we could swap a base path like /v/0.2/content/...
    // For now we keep one set; hook here if you host per-version content.
  });

  // shortcuts
  document.addEventListener('keydown', (e)=>{
    if (e.key === '/' && document.activeElement !== $('#q')) { e.preventDefault(); $('#q').focus(); }
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('#q').focus(); }
  });

  // report
  $('#reportIssue').addEventListener('click', (e)=>{
    e.preventDefault();
    const h = encodeURIComponent(location.hash);
    window.open(`https://github.com/you/vitte-docs/issues/new?title=Doc%20issue&body=Page:%20${h}`, '_blank');
  });
}

/* ---------- i18n ---------- */
async function initI18n(loc){
  i18n = await fetchJSON(`i18n/${loc}.json`);
}

/* ---------- versions ---------- */
async function initVersions(){
  const list = await fetchJSON('versions.json').catch(()=>['latest']);
  const sel = $('#version'); sel.innerHTML = '';
  list.forEach(v=>{
    const o = document.createElement('option'); o.value = v; o.textContent = v; if (v===version) o.selected = true; sel.appendChild(o);
  });
}

/* ---------- navigation from i18n ---------- */
async function initNav(rebuild=false){
  nav = i18n.sidebar;
  const navRoot = $('.nav'); navRoot.innerHTML = '';
  routes = [];
  nav.forEach(group=>{
    const g = document.createElement('div'); g.className='group';
    const t = document.createElement('div'); t.className='title'; t.textContent = group.title; g.appendChild(t);
    group.items.forEach(it=>{
      const a = document.createElement('a');
      a.href = `#/${locale}/${it.route}`;
      a.textContent = it.title;
      a.dataset.route = it.route;
      g.appendChild(a);
      routes.push({route:it.route, title:it.title});
    });
    navRoot.appendChild(g);
  });
  if (rebuild) highlightNav(parseHash(location.hash));
}

/* ---------- Router ---------- */
function initRouter(){
  window.addEventListener('hashchange', ()=>routeTo(parseHash(location.hash)));
  routeTo(parseHash(location.hash) || {locale, route:DEFAULT_ROUTE});
}
function parseHash(h){
  // #/en/start#heading
  const m = h.match(/^#\/([a-z]{2})\/([^#?\s]+)(?:#(.+))?$/i);
  if (m) return { locale:m[1], route:m[2], anchor:m[3]||null };
  return { locale, route: DEFAULT_ROUTE, anchor:null };
}
async function routeTo({locale:loc, route, anchor}){
  locale = loc; $('#locale').value = locale;
  highlightNav({route, locale});
  await renderPage(route);
  if (anchor) { const el = document.getElementById(anchor); if (el) el.scrollIntoView({behavior:'smooth', block:'start'}); }
  history.replaceState({}, '', `#/`+locale+`/`+route+(anchor?`#${anchor}`:''));
}

/* ---------- Render Markdown ---------- */
async function renderPage(route){
  const md = await fetchText(`content/${locale}/${route}.md`).catch(()=>`# 404\n\nPage not found.`);
  const html = mdToHtml(md);
  const doc = $('#doc'); doc.innerHTML = html;
  enhanceCode(doc);
  buildTOC(doc, route);
  buildBreadcrumb(route);
  buildPager(route);
  updateEditLink(route);
  // analytics hook
  window.dispatchEvent(new CustomEvent('pageview', {detail:{locale, route}}));
}

/* ---------- Enhance ---------- */
function enhanceCode(scope){
  $$('pre code', scope).forEach(code=>{
    const pre = code.parentElement;
    if (!pre.querySelector('.copy')) {
      const btn = document.createElement('button');
      btn.className = 'copy'; btn.textContent = 'Copy';
      btn.addEventListener('click', ()=>{
        navigator.clipboard.writeText(code.innerText);
        btn.textContent='Copied ✓'; setTimeout(()=>btn.textContent='Copy', 1000);
      });
      pre.prepend(btn);
    }
  });
}
function buildTOC(scope, route){
  $('.toc')?.remove();
  const h2h3 = $$('h2, h3', scope);
  if (!h2h3.length) return;
  const toc = document.createElement('div'); toc.className='toc callout info';
  toc.innerHTML = `<div class="title">On this page</div><div class="body"></div>`;
  const body = $('.body', toc);
  h2h3.forEach(h=>{
    if (!h.id) h.id = slug(h.textContent);
    const a = document.createElement('a');
    a.href = `#/${locale}/${route}#${h.id}`;
    a.textContent = (h.tagName==='H3'?'  ':'') + h.textContent;
    body.appendChild(a);
  });
  scope.prepend(toc);
}
function buildBreadcrumb(route){
  const bc = $('#breadcrumb');
  const group = nav.find(g=>g.items.some(i=>i.route===route));
  const item  = group?.items.find(i=>i.route===route);
  bc.innerHTML = `<a href="#/${locale}/${nav[0].items[0].route}">${i18n.ui.home}</a> › <a href="javascript:;">${group?.title||''}</a> › <span aria-current="page">${item?.title||route}</span>`;
}
function buildPager(route){
  const i = routes.findIndex(r=>r.route===route);
  const prev = routes[i-1], next = routes[i+1];
  $('#pager').innerHTML = `
    ${prev?`<a class="prev" href="#/${locale}/${prev.route}">← ${prev.title}</a>`:'<span></span>'}
    ${next?`<a class="next" href="#/${locale}/${next.route}">${next.title} →</a>`:'<span></span>'}
  `;
}
function updateEditLink(route){
  $('#editLink').href = `${REPO_EDIT_URL}/${locale}/${route}.md`;
}

/* ---------- Search ---------- */
let searchData = [];
async function initSearch(){
  searchData = await fetchJSON('search-index.json').catch(()=>[]);
  const box = $('#q'), res = $('#qResults');
  document.addEventListener('keydown', e=>{ if(e.key==='/' && document.activeElement!==box){e.preventDefault(); box.focus();} });
  box.addEventListener('input', ()=>{
    const q = box.value.trim().toLowerCase();
    if(!q){ res.classList.remove('show'); res.innerHTML=''; return; }
    const hits = searchData
      .filter(d=>d.locale===locale)
      .map(d=>({...d,score:scoreDoc(d,q)}))
      .filter(d=>d.score>0)
      .sort((a,b)=>b.score-a.score).slice(0,12);
    res.innerHTML = hits.map(h=>`<div class="item" data-route="${h.route}">
      <div><strong>${escapeHTML(h.title)}</strong></div>
      <div class="muted">${snippet(h.text,q)}</div>
    </div>`).join('');
    res.classList.add('show');
  });
  res.addEventListener('click', e=>{
    const it = e.target.closest('.item'); if(!it) return;
    location.hash = `#/${locale}/${it.dataset.route}`; res.classList.remove('show'); box.value='';
  });
  document.addEventListener('click', e=>{ if(!res.contains(e.target) && e.target!==box) res.classList.remove('show'); });
}
function scoreDoc(d,q){
  let s = 0;
  if (d.title.toLowerCase().includes(q)) s+=5;
  if (d.headings?.some(h=>h.toLowerCase().includes(q))) s+=2;
  if (d.text.toLowerCase().includes(q)) s+=1;
  return s;
}
function snippet(text,q){
  const i = text.toLowerCase().indexOf(q); if(i<0) return escapeHTML(text.slice(0,130))+'…';
  const s = Math.max(0,i-30), e = Math.min(text.length, i+q.length+60);
  return escapeHTML(text.slice(s,e)).replace(new RegExp(q,'ig'), m=>`<span class="hl">${escapeHTML(m)}</span>`);
}

/* ---------- Markdown (very small) ---------- */
function mdToHtml(md){
  // headings
  md = md.replace(/^###### (.*)$/gm,'<h6 id="$1">$1</h6>')
         .replace(/^##### (.*)$/gm,'<h5 id="$1">$1</h5>')
         .replace(/^#### (.*)$/gm,'<h4 id="$1">$1</h4>')
         .replace(/^### (.*)$/gm,'<h3 id="$1">$1</h3>')
         .replace(/^## (.*)$/gm,'<h2 id="$1">$1</h2>')
         .replace(/^# (.*)$/gm,'<h1 id="$1">$1</h1>');
  // code fences
  md = md.replace(/```(\w+)?\n([\s\S]*?)```/g,(m,lang,code)=>`<pre><code class="lang-${lang||'text'}">${escapeHTML(code)}</code></pre>`);
  // inline code
  md = md.replace(/`([^`]+)`/g,'<code>$1</code>');
  // bold/italic
  md = md.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
  // links
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
  // lists
  md = md.replace(/^\s*-\s+(.*)$/gm,'<li>$1</li>').replace(/(<li>[\s\S]*?<\/li>)/g,'<ul>$1</ul>');
  // paragraphs
  md = md.replace(/^(?!<h\d|<ul|<pre|<p|<blockquote|<table|<\/)(.+)$/gm,'<p>$1</p>');
  // add id slugs
  md = md.replace(/<h([1-6]) id="([^"]+)">/g,(m,l,t)=>`<h${l} id="${slug(t)}">`);
  return md;
}

/* ---------- Utils ---------- */
function slug(s){return s.toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').slice(0,80)}
function escapeHTML(s){return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function fetchJSON(p){ const r = await fetch(p); if(!r.ok) throw new Error(p); return r.json(); }
async function fetchText(p){ const r = await fetch(p); if(!r.ok) throw new Error(p); return r.text(); }
function highlightNav({route, locale}){
  $$('.nav a').forEach(a=>a.classList.toggle('active', a.dataset.route===route && a.getAttribute('href').startsWith(`#/${locale}/`)));
}

/* ---------- Offline / PWA ---------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
