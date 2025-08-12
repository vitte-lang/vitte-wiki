const OUT = document.getElementById('out');
const sel = document.getElementById('locale');
document.getElementById('build').addEventListener('click', build);

async function build(){
  OUT.innerHTML = '<p>Building…</p>';
  const locale = sel.value;
  const i18n = await (await fetch(`i18n/${locale}.json`)).json();
  const nav = i18n.nav || [];
  const pages = nav.flatMap(g => (g.items||[]).map(it => it.slug));
  const htmlParts = [];
  for(const slug of pages){
    const mdUrl = `content/${locale}/${slug}.md`;
    try{
      const md = await (await fetch(mdUrl)).text();
      const html = mdx(md);
      htmlParts.push(`<section id="${slug}"><h1>${slug}</h1>${html}</section>`);
    }catch{ htmlParts.push(`<section><h1>${slug}</h1><p>Missing: ${mdUrl}</p></section>`); }
  }
  OUT.innerHTML = htmlParts.join('\n');
}

// Minimal renderer (same as app.js)
function mdx(md){
  md = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  md = md.replace(/```([\w+-]*)\n([\s\S]*?)```/g,(m,l,c)=>`<pre><code class="language-${l||'text'}">${c.replace(/&/g,'&amp;')}</code></pre>`);
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