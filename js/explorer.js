/* ==========================================================================
   PROJECT EXPLORER · filter + search over every project, and a detail
   drawer (overview, how it works, highlights, stack, role, links).
   Any element with data-project="<id>" opens the drawer.
   Tiles are rendered once and filtered with [hidden], so the build mode
   (js/build.js) can construct them like everything else.
   ========================================================================== */

import { CATALOG, FILTERS, byId } from './catalog.js';
import { CREDS } from './creds-data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON = {
  gh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5 5 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.3 6.6 6.4 7A3.4 3.4 0 0 0 9 18.1V22"/></svg>',
  live: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  team: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>',
};

const badges = (p) => [
  p.repo ? `<span class="px-badge">${ICON.gh}Code</span>` : '',
  p.live ? `<span class="px-badge live">${ICON.live}Live</span>` : '',
  p.team ? `<span class="px-badge">${ICON.team}Team</span>` : '',
].join('');

export function initExplorer() {
  const host = $('#more-list');
  if (!host) return { open() {} };
  const count = (k) => (k === 'all' ? CATALOG.length : CATALOG.filter((p) => p.f.includes(k)).length);

  host.innerHTML = `
    <div class="px-top">
      <div>
        <p class="kicker" data-b="type">Every project</p>
        <h3 class="px-h" data-b="type">${CATALOG.length} builds. Filter, search, open any of them.</h3>
      </div>
      <label class="px-search" data-b="fade">${ICON.search}<span class="sr-only">Search projects</span>
        <input type="search" placeholder="Search: AWS, YOLO, Flutter…" autocomplete="off" />
      </label>
    </div>
    <div class="px-filters" role="group" aria-label="Filter projects" data-b="fade">
      ${FILTERS.map(([k, label], i) => `<button type="button" class="px-f" data-f="${k}" aria-pressed="${i === 0}">${esc(label)}<em>${count(k)}</em></button>`).join('')}
    </div>
    <div class="px-grid" role="list">
      ${CATALOG.map((p, i) => `
        <button type="button" class="px-tile" role="listitem" data-project="${p.id}" data-tags="${p.f.join(' ')}" data-text="${esc([p.title, p.cat, p.one, ...(p.stack || [])].join(' ').toLowerCase())}" style="--i:${i}" data-b="fade">
          <span class="px-meta"><span>${esc(p.cat)}</span><span>${esc(p.year || '')}</span></span>
          <span class="px-title">${esc(p.title)}</span>
          <span class="px-one">${esc(p.one)}</span>
          <span class="px-foot"><span class="px-badges">${badges(p)}</span><span class="px-open">Details ${ICON.arrow}</span></span>
        </button>`).join('')}
    </div>
    <p class="px-empty" hidden>No project matches that. Try "cloud", "python" or "flutter", or ask Vee.</p>`;

  const tiles = $$('.px-tile', host);
  const input = $('.px-search input', host);
  const empty = $('.px-empty', host);
  let filter = 'all';
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    tiles.forEach((t) => {
      const ok = (filter === 'all' || t.dataset.tags.split(' ').includes(filter)) && (!q || q.split(/\s+/).every((w) => t.dataset.text.includes(w)));
      t.hidden = !ok;
      if (ok) { t.style.setProperty('--i', shown); shown += 1; }
    });
    empty.hidden = shown > 0;
    if (!reduced) { host.classList.remove('px-anim'); void host.offsetWidth; host.classList.add('px-anim'); }
  };
  $$('.px-f', host).forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.f;
    $$('.px-f', host).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  }));
  input.addEventListener('input', apply);
  host.addEventListener('pointermove', (e) => {
    const t = e.target.closest('.px-tile');
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', `${e.clientX - r.left}px`);
    t.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  /* ---------------- detail drawer ---------------- */
  const dr = document.createElement('div');
  dr.className = 'px-drawer';
  dr.hidden = true;
  dr.innerHTML = `
    <div class="px-scrim" data-px-close></div>
    <aside class="px-panel" role="dialog" aria-modal="true" aria-labelledby="px-title" tabindex="-1">
      <button type="button" class="px-x" data-px-close aria-label="Close project details">${ICON.close}</button>
      <div class="px-body"></div>
      <nav class="px-nav" aria-label="Other projects">
        <button type="button" class="px-prev" data-px-step="-1"></button>
        <span class="px-pos"></span>
        <button type="button" class="px-next" data-px-step="1"></button>
      </nav>
    </aside>`;
  document.body.appendChild(dr);
  const body = $('.px-body', dr);
  const panel = $('.px-panel', dr);
  let list = CATALOG;
  let idx = 0;
  let lastFocus = null;

  const render = (p) => {
    const cred = CREDS.find((c) => c.project === p.id);
    const links = [
      p.repo ? `<a class="px-link solid" href="${p.repo}" target="_blank" rel="noopener noreferrer">${ICON.gh}View code ↗</a>` : '',
      p.live ? `<a class="px-link" href="${p.live}" target="_blank" rel="noopener noreferrer">${ICON.live}Live site ↗</a>` : '',
      p.doi ? `<a class="px-link" href="${p.doi}" target="_blank" rel="noopener noreferrer">${ICON.doc}DOI ↗</a>` : '',
      cred ? `<button type="button" class="px-link" data-cred="${cred.id}">${ICON.doc}See the certificate</button>` : '',
      `<button type="button" class="px-link" data-ask="Tell me about ${esc(p.title)}">Ask Vee about it</button>`,
    ].join('');
    body.innerHTML = `
      <p class="px-d-meta"><span>${esc(p.cat)}</span>${p.year ? `<span>${esc(p.year)}</span>` : ''}${badges(p)}</p>
      <h2 id="px-title" class="px-d-title">${esc(p.title)}</h2>
      <p class="px-d-one">${esc(p.one)}</p>
      <p class="px-d-over">${esc(p.overview)}</p>
      ${p.how?.length ? `<h3 class="px-d-h">How it works</h3><ol class="px-steps">${p.how.map((s, i) => `<li style="--i:${i}"><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(s)}</span></li>`).join('')}</ol>` : ''}
      ${p.highlights?.length ? `<h3 class="px-d-h">Highlights</h3><ul class="px-hi">${p.highlights.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      ${p.stack?.length ? `<h3 class="px-d-h">Stack</h3><div class="chips">${p.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      ${p.role ? `<h3 class="px-d-h">His role</h3><p class="px-d-role">${esc(p.role)}</p>` : ''}
      <div class="px-links">${links}</div>
      ${!p.repo ? '<p class="tiny px-d-note">Code for this one is private or client work. Ask Vedanth for a walkthrough.</p>' : ''}`;
    const prev = list[(idx - 1 + list.length) % list.length];
    const next = list[(idx + 1) % list.length];
    $('.px-prev', dr).innerHTML = `← <span>${esc(prev.title)}</span>`;
    $('.px-next', dr).innerHTML = `<span>${esc(next.title)}</span> →`;
    $('.px-pos', dr).textContent = `${idx + 1} / ${list.length}`;
    panel.scrollTop = 0;
    body.classList.remove('in'); void body.offsetWidth; body.classList.add('in');
  };

  const visibleList = () => {
    const ids = tiles.filter((t) => !t.hidden).map((t) => t.dataset.project);
    return ids.length ? ids.map((id) => byId[id]) : CATALOG;
  };
  function open(id, fromGrid = false) {
    const p = byId[id];
    if (!p) return;
    list = fromGrid ? visibleList() : CATALOG;
    idx = Math.max(0, list.indexOf(p));
    if (dr.hidden) {
      lastFocus = document.activeElement;
      dr.hidden = false;
      document.documentElement.classList.add('px-lock');
      requestAnimationFrame(() => dr.classList.add('on'));
      setTimeout(() => panel.focus({ preventScroll: true }), 40);
    }
    render(p);
    history.replaceState(null, '', `#project-${p.id}`); // shareable link to this project
  }
  function close() {
    if (dr.hidden) return;
    if (location.hash.startsWith('#project-')) history.replaceState(null, '', location.pathname + location.search);
    dr.classList.remove('on');
    document.documentElement.classList.remove('px-lock');
    setTimeout(() => { dr.hidden = true; }, reduced ? 0 : 320);
    lastFocus?.focus?.({ preventScroll: true });
  }
  const step = (d) => { idx = (idx + d + list.length) % list.length; render(list[idx]); history.replaceState(null, '', `#project-${list[idx].id}`); };
  const fromHash = () => { const m = location.hash.match(/^#project-([\w-]+)$/); if (m && byId[m[1]]) open(m[1]); };
  window.addEventListener('hashchange', fromHash);
  setTimeout(fromHash, 0);

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-project]');
    if (t) { e.preventDefault(); open(t.dataset.project, Boolean(t.closest('.px-grid'))); return; }
    if (e.target.closest('[data-px-close]')) close();
    const s = e.target.closest('[data-px-step]');
    if (s) step(Number(s.dataset.pxStep));
    if (!dr.hidden && e.target.closest('.px-body [data-ask], .px-body [data-cred]')) close();
  });
  // a big card's body also opens its details (but not its own buttons/links)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card[data-id]');
    if (!card || e.target.closest('a, button')) return;
    if (!e.target.closest('.card-body')) return;
    open(card.dataset.id);
  });
  document.addEventListener('keydown', (e) => {
    if (dr.hidden) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') {
      const f = $$('a, button, [tabindex="0"]', panel).filter((x) => !x.disabled && x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }, true);

  return { open, close };
}
