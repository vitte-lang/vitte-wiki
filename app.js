// app.js (ESM)
const qs = s => document.querySelector(s);
const $ = {
  doc: qs('#doc'), breadcrumb: qs('#breadcrumb'), pager: qs('#pager'),
  nav: qs('#nav'), sidebar: qs('#sidebar'), navToggle: qs('#navToggle'),
  q: qs('#q'), qResults: qs('#qResults'), localeSel: qs('#locale'),
  versionSel: qs('#version'), editLink: qs('#editLink'), offlineBanner: qs('#offlineBanner'),
  offlineState: qs('#offlineState'), themeBtn: qs('#theme'), toasts: qs('#toasts')
};

// === CONFIG ===
const BASE = (window.__BASE_URL__ || '').replace(/\/$/, ''); // "" or "/repo"
const REPO_EDIT_BASE = 'https://github.com/you/vitte-docs/edit/main/';
const I18N_BASE = BASE + '/i18n';
const CONTENT_BASE = BASE + '/content';
const DEFAULT_ROUTE = { locale: 'en', slug: 'start' };

let state = { locale: 'en', slug: 'start', i18n: null, versions: [], routes: [], index: [] };
const cache = new Map();
const mdCache = new Map();

function toast(msg, ms=2000){ if(!$.toasts) return; $.toasts.textContent=msg; $.toasts.classList.remove('hidden'); setTimeout(()=>{ $.toasts.classList.add('hidden'); $.toasts.textContent=''; }, ms); }

// THEME
initTheme(); $.themeBtn?.addEventListener('click', toggleTheme);
function initTheme(){ const saved = localStorage.getItem('theme'); if (saved) document.documentElement.setAttribute('data-theme', saved); }
function toggleTheme(){ const cur = document.documentElement.getAttribute('data-theme')||'auto'; const next = cur==='dark'?'light':'dark'; document.documentElement.setAttribute('data-theme', next); localStorage.setItem('theme', next); toast(`Theme: ${next}`); }

// OFFLINE
function updateOnlineUI(){ const online = navigator.onLine; $.offlineState.textContent = online?'ready':'offline'; $.offlineBanner.classList.toggle('hidden', online); }
window.addEventListener('online', updateOnlineUI); window.addEventListener('offline', updateOnlineUI); updateOnlineUI();

// NAV drawer
$.navToggle?.addEventListener('click', ()=>{ const open=!$.sidebar.classList.contains('open'); $.sidebar.classList.toggle('open', open); $.navToggle.setAttribute('aria-expanded', String(open)); });
window.addEventListener('hashchange', onRouteChange);

// SEARCH
$.q?.addEventListener('input', onSearch);
$.q?.addEventListener('keydown', e=>{ if(e.key==='Escape'){ $.q.value=''; $.qResults.innerHTML=''; } });
window.addEventListener('keydown', e=>{ if(e.key==='/' && document.activeElement!==$.q){ e.preventDefault(); $.q.focus(); }});

// LOCALE/VERSION
$.localeSel?.addEventListener('change', ()=>{ navigate({ locale: $.localeSel.value, slug: DEFAULT_ROUTE.slug }); });
$.versionSel?.addEventListener('change', ()=>{ toast(`Version: ${$.versionSel.value}`); });

// INIT
init().catch(console.error);
async function init(){ const { locale, slug } = parseHash(); state.locale = locale; state.slug = slug; await ensureLocale(locale); await renderAll(); if(!location.hash) navigate(DEFAULT_ROUTE, true); }

function parseHash(){ const raw=(location.hash||'').replace(/^#\/?/,'').trim(); const [locale,...parts]=raw.split('/').filter(Boolean); const slug=parts.join('/')||DEFAULT_ROUTE.slug; return { locale: locale||DEFAULT_ROUTE.locale, slug } }
function setHash({locale,slug}, replace=false){ const h=`#/${encodeURIComponent(locale)}/${slug}`; replace?history.replaceState(null,'',h):(location.hash=h); }
function navigate({locale,slug}, replace=false){ setHash({locale,slug}, replace); if(replace) onRouteChange(); }

async function onRouteChange(){ const { locale, slug } = parseHash(); const changedLocale = locale!==state.locale; state.locale = locale; state.slug = slug||DEFAULT_ROUTE.slug; if(changedLocale) await ensureLocale(locale); await renderAll(); }

async function ensureLocale(locale){ state.i18n = await fetchJSON(`${I18N_BASE}/${locale}.json`); state.versions = await fetchJSON(BASE + '/versions.json').catch(()=>[]);
  const nav = state.i18n?.nav || [{ group:'Getting started', items:[{title:'Start', slug:'start'}]}];
  state.routes = nav.flatMap(g => (g.items||[]).map(it=>({...it, group:g.group})));
  state.index = state.routes.map(r=>({ title:r.title, slug:r.slug, locale }));
  fillVersions(state.versions); fillLocale(locale); buildNav(nav, locale); buildSearchIndex(locale).catch(console.warn);
}

function fillVersions(list){ if(!$.versionSel) return; $.versionSel.innerHTML=''; (list||[]).forEach(v=>{ const opt=document.createElement('option'); opt.value=v.id||v; opt.textContent=v.label||v; $.versionSel.appendChild(opt); }); }
function fillLocale(locale){ if($.localeSel){ [...$.localeSel.options].forEach(o=>o.selected=(o.value===locale)); } }
function buildNav(nav, locale){ $.nav.innerHTML=''; for(const group of nav){ const g=document.createElement('div'); g.className='group'; const title=document.createElement('div'); title.className='title'; title.textContent=group.group; const items=document.createElement('div'); items.className='items'; for(const item of (group.items||[])){ const a=document.createElement('a'); a.className='nav-link'; a.href=`#/${locale}/${item.slug}`; a.textContent=item.title; if(item.slug===state.slug) a.setAttribute('aria-current','page'); items.appendChild(a); } g.append(title, items); $.nav.appendChild(g); } }

async function renderAll(){ await renderDoc(state.locale, state.slug); renderBreadcrumb(); renderPager(); setEditLink(); $.sidebar.classList.remove('open'); $.navToggle.setAttribute('aria-expanded','false'); $.doc.focus(); }

async function renderDoc(locale, slug){ const path = `${CONTENT_BASE}/${locale}/${slug}.md`; const md = await fetchText(path).catch(()=>`# Not found\n\n> Missing page: \`${path}\`.`); const html = mdx(md); $.doc.innerHTML = html; enhanceDoc($.doc); }

function renderBreadcrumb(){ const bc=$.breadcrumb; bc.innerHTML=''; const parts=state.slug.split('/').filter(Boolean); let accum=''; const arr=[{label:state.locale.toUpperCase(),href:`#/${state.locale}/${DEFAULT_ROUTE.slug}`}]; parts.forEach((p,i)=>{ accum+=(i?'/':'')+p; arr.push({label:humanize(p),href:`#/${state.locale}/${accum}`}); }); arr.forEach((it,idx)=>{ const a=document.createElement('a'); a.href=it.href; a.textContent=it.label; bc.appendChild(a); if(idx<arr.length-1){ const sep=document.createElement('span'); sep.textContent='›'; sep.setAttribute('aria-hidden','true'); bc.appendChild(sep);} }); }

function renderPager(){ $.pager.innerHTML=''; const list=state.routes; const i=list.findIndex(r=>r.slug===state.slug); if(i===-1) return; const tpl=document.querySelector('#tpl-pager').content.cloneNode(true); const prev=tpl.querySelector('.prev'); const next=tpl.querySelector('.next'); if(list[i-1]){ prev.href=`#/${state.locale}/${list[i-1].slug}`; prev.querySelector('.label').textContent=list[i-1].title; } else prev.remove(); if(list[i+1]){ next.href=`#/${state.locale}/${list[i+1].slug}`; next.querySelector('.label').textContent=list[i+1].title; } else next.remove(); $.pager.appendChild(tpl); }

function setEditLink(){ const path = `content/${state.locale}/${state.slug}.md`; // keep repo-relative
  $.editLink.href = REPO_EDIT_BASE + path; $.editLink.textContent = 'Edit this page'; }

// --- Search index (tiny) ---
const searchIndex = new Map(); // token -> Set(slug)
async function buildSearchIndex(locale){ searchIndex.clear(); const pages = state.routes.map(r=>r.slug); for(const slug of pages){ const path=`${CONTENT_BASE}/${locale}/${slug}.md`; try{ const md=await fetchText(path); mdCache.set(path, md); const text = stripMD(md).toLowerCase(); const tokens = tokenize(text); for(const t of tokens){ if(!searchIndex.has(t)) searchIndex.set(t, new Set()); searchIndex.get(t).add(slug); } }catch{} }
}

function onSearch(){ const q=($.q.value||'').trim().toLowerCase(); $.qResults.innerHTML=''; if(!q) return; const tokens=tokenize(q).filter(Boolean); const hits = new Map(); for(const t of tokens){ const pages = searchIndex.get(t); if(!pages) continue; for(const slug of pages){ hits.set(slug, (hits.get(slug)||0)+1); } }
  const ranked = [...hits.entries()].sort((a,b)=>b[1]-a[1]).slice(0,20).map(([slug])=>slug);
  for(const slug of ranked){ const route = state.routes.find(r=>r.slug===slug); if(!route) continue; const a=document.createElement('a'); a.href=`#/${state.locale}/${slug}`; a.className='nav-link'; a.textContent=route.title||slug; const li=document.createElement('div'); li.setAttribute('role','option'); li.appendChild(a); $.qResults.appendChild(li); }
}

function tokenize(text){ return text.split(/[^a-z0-9]+/g).filter(w=>w.length>2); }
function stripMD(md){ return md.replace(/```[\s\S]*?```/g,' ').replace(/`[^`]+`/g,' ').replace(/^>\s?/gm,' ').replace(/\|/g,' ').replace(/\*\*?|__|~~|\[|\]|\(|\)|<[^>]+>/g,' ').replace(/^\s*[-*+]\s/gm,' ').replace(/^\s*\d+\.\s/gm,' '); }

// --- Fetch helpers with cache ---
async function fetchJSON(url){ const t=await fetchText(url); try{ return JSON.parse(t);}catch{return null;} }
async function fetchText(url){ if(cache.has(url)) return cache.get(url); const res=await fetch(url,{cache:'force-cache'}); if(!res.ok) throw new Error(`HTTP ${res.status} for ${url}`); const text=await res.text(); cache.set(url,text); return text; }

// --- Extended Markdown renderer ---
function mdx(md){
  md = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  md = md.replace(/```([\w+-]*)\n([\s\S]*?)```/g,(m,lang,code)=>`<pre><code class="language-${lang||'text'}">${code.replace(/&/g,'&amp;')}</code></pre>`);
  md = md.replace(/^(?:\|?.+\|.+\|?\n)\|?\s*[:\- ]+\|[ :\-\|]*\n(?:.*\n?)+?(?=\n\S|\n$|$)/gm, tbl=>{
    const rows = tbl.trim().split(/\n/);
    const header = rows[0].replace(/^\|?|\|$/g,'').split(/\s*\|\s*/);
    const aligns = rows[1].replace(/^\|?|\|$/g,'').split(/\s*\|\s*/).map(c=>c.trim());
    const bodyRows = rows.slice(2).map(r=>r.replace(/^\|?|\|$/g,'').split(/\s*\|\s*/));
    const align = a=> a.startsWith(':') && a.endsWith(':') ? 'center' : a.endsWith(':') ? 'right' : a.startsWith(':') ? 'left' : 'left';
    let html = '<table><thead><tr>' + header.map((h,i)=>`<th style="text-align:${align(aligns[i]||'')}">${h}</th>`).join('') + '</tr></thead><tbody>';
    html += bodyRows.map(r=>'<tr>'+r.map((c,i)=>`<td style="text-align:${align(aligns[i]||'')}">${c}</td>`).join('')+'</tr>').join('');
    html += '</tbody></table>';
    return html;
  });
  md = md.replace(/^######\s+(.*)$/gm,'<h6>$1</h6>')
         .replace(/^#####\s+(.*)$/gm,'<h5>$1</h5>')
         .replace(/^####\s+(.*)$/gm,'<h4>$1</h4>')
         .replace(/^###\s+(.*)$/gm,'<h3>$1</h3>')
         .replace(/^##\s+(.*)$/gm,'<h2>$1</h2>')
         .replace(/^#\s+(.*)$/gm,'<h1>$1</h1>');
  md = md.replace(/^>\s+(.*)$/gm,'<blockquote>$1</blockquote>');
  md = md.replace(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/gm,(m,x,txt)=>`<li><input type="checkbox" disabled ${x.trim()? 'checked':''}> ${txt}</li>`);
  md = md.replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/g, m=>`<ul>${m}</ul>`);
  md = md.replace(/^\s*[-*+]\s+(.*)$/gm,'<li>$1</li>');
  md = md.replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/g, m=>`<ul>${m}</ul>`);
  md = md.replace(/^\s*\d+\.\s+(.*)$/gm,'<li>$1</li>');
  md = md.replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/g, m=>`<ol>${m}</ol>`);
  md = md.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
         .replace(/\*([^*]+)\*/g,'<em>$1</em>')
         .replace(/`([^`]+)`/g,'<code>$1</code>');
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
  md = md.replace(/^(?!<h\d|<ul>|<ol>|<li>|<pre>|<blockquote>|<p>|<hr>|<table>)([^\n][\s\S]*?)(?:\n{2,}|$)/gm,'<p>$1</p>');
  return md;
}

function enhanceDoc(root){
  root.querySelectorAll('a[href^="http"]').forEach(a=>{ a.target='_blank'; a.rel='noopener'; });
  root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>{ const id=h.textContent.trim().toLowerCase().replace(/[^\w]+/g,'-'); h.id=id; const a=document.createElement('a'); a.href=`#${id}`; a.textContent=' #'; a.setAttribute('aria-label','Anchor'); a.style.textDecoration='none'; a.style.opacity='.35'; h.appendChild(a); });
}

function humanize(s){ return s.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }