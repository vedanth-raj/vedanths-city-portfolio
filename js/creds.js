/* ==========================================================================
   CREDENTIALS · tabbed gallery + preview viewer
   Click a card: the preview grows out of it (FLIP), with zoom (click or +/−),
   ← / → to browse, Esc to close, and links to the original PDF and the
   issuer's verification page. Any [data-cred="<id>"] opens the viewer.
   ========================================================================== */

import { CREDS, CRED_TABS, WINS_TEXT } from './creds-data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const src = (c, thumb = false) => `/creds/${c.id}${thumb ? '-thumb' : ''}.webp`;
const ISSUER_MARK = { 'Amazon Web Services': 'aws', 'Google Cloud': 'gcp', 'Cisco Networking Academy': 'cisco', 'Infosys Springboard': 'infosys' };

export function initCreds() {
  const root = $('#creds-root');
  if (!root) return;
  const counts = Object.fromEntries(CRED_TABS.map(([k]) => [k, CREDS.filter((c) => c.tab === k).length + (k === 'wins' ? WINS_TEXT.length : 0)]));

  root.innerHTML = `
    <div class="cr-tabs" role="tablist" aria-label="Credential type" data-b="fade">
      ${CRED_TABS.map(([k, label], i) => `<button type="button" role="tab" class="cr-tab" id="cr-tab-${k}" data-tab="${k}" aria-selected="${i === 0}" aria-controls="cr-panel" tabindex="${i === 0 ? 0 : -1}">${esc(label)}<em>${counts[k]}</em></button>`).join('')}
    </div>
    <div class="cr-grid" id="cr-panel" role="tabpanel" aria-labelledby="cr-tab-certs">
      ${CREDS.map((c) => `
        <button type="button" class="cred${c.wide ? ' wide' : ''}${c.contain ? ' contain' : ''}" data-cred="${c.id}" data-tab="${c.tab}" data-b="fade" ${c.tab !== 'certs' ? 'hidden' : ''}>
          <span class="cred-img"><img src="${src(c, true)}" alt="" loading="lazy" decoding="async" /><span class="cred-zoom" aria-hidden="true">Preview</span></span>
          <span class="cred-body">
            <small class="cred-iss" data-mark="${ISSUER_MARK[c.issuer] || ''}">${esc(c.issuer)}</small>
            <b>${esc(c.title)}</b>
            <em>${esc([c.date, c.meta].filter(Boolean).join(' · '))}${c.verify ? ' · <span class="cred-v">Verifiable</span>' : ''}</em>
          </span>
        </button>`).join('')}
      ${WINS_TEXT.map(([big, text]) => `<div class="cred-text" data-tab="wins" data-b="fade" hidden><b>${esc(big)}</b><span>${esc(text)}</span></div>`).join('')}
    </div>`;

  const tabs = $$('.cr-tab', root);
  const items = $$('[data-tab]', $('.cr-grid', root));
  const show = (k, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === k;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    $('#cr-panel').setAttribute('aria-labelledby', `cr-tab-${k}`);
    let n = 0;
    items.forEach((el) => {
      const on = el.dataset.tab === k;
      el.hidden = !on;
      if (on) { el.style.setProperty('--i', n); n += 1; }
    });
    if (!reduced) { root.classList.remove('cr-anim'); void root.offsetWidth; root.classList.add('cr-anim'); }
  };
  tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.tab)));
  $('.cr-tabs', root).addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    show(tabs[n].dataset.tab, true);
  });

  /* ---------------- viewer ---------------- */
  const v = document.createElement('div');
  v.className = 'cv';
  v.hidden = true;
  v.innerHTML = `
    <div class="cv-scrim" data-cv-close></div>
    <div class="cv-box" role="dialog" aria-modal="true" aria-labelledby="cv-title">
      <div class="cv-stage"><img class="cv-img" alt="" /><div class="cv-spin" aria-hidden="true"></div></div>
      <div class="cv-info">
        <div class="cv-text">
          <small class="cv-iss"></small>
          <h2 id="cv-title" class="cv-title"></h2>
          <p class="cv-meta"></p>
        </div>
        <div class="cv-acts"></div>
        <div class="cv-nav">
          <button type="button" class="cv-btn" data-cv-step="-1" aria-label="Previous">←</button>
          <span class="cv-pos"></span>
          <button type="button" class="cv-btn" data-cv-step="1" aria-label="Next">→</button>
          <button type="button" class="cv-btn" data-cv-zoom aria-label="Zoom in" title="Zoom (+ / −)">⤢</button>
          <button type="button" class="cv-btn" data-cv-close aria-label="Close preview">✕</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(v);
  const img = $('.cv-img', v);
  const stage = $('.cv-stage', v);
  let list = CREDS;
  let idx = 0;
  let zoomed = false;
  let lastFocus = null;

  const setZoom = (on, ox = 50, oy = 50) => {
    zoomed = on;
    stage.classList.toggle('zoomed', on);
    img.style.transformOrigin = `${ox}% ${oy}%`;
    $('[data-cv-zoom]', v).setAttribute('aria-label', on ? 'Zoom out' : 'Zoom in');
  };
  stage.addEventListener('click', (e) => {
    if (e.target !== img) return;
    const r = img.getBoundingClientRect();
    setZoom(!zoomed, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  });
  stage.addEventListener('mousemove', (e) => {
    if (!zoomed) return;
    const r = stage.getBoundingClientRect();
    img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });

  function render(c, fromEl) {
    setZoom(false);
    v.classList.toggle('contain', Boolean(c.contain));
    $('.cv-iss', v).textContent = c.issuer;
    $('.cv-title', v).textContent = c.title;
    $('.cv-meta', v).textContent = [c.date, c.meta].filter(Boolean).join(' · ');
    $('.cv-acts', v).innerHTML = [
      c.pdf ? `<a class="px-link solid" href="/creds/${c.id}.pdf" target="_blank" rel="noopener">Open original PDF ↗</a>` : '',
      c.verify ? `<a class="px-link" href="${c.verify}" target="_blank" rel="noopener noreferrer">Verify at source ↗</a>` : '',
      c.project ? `<button type="button" class="px-link" data-project="${c.project}">See the project</button>` : '',
    ].join('');
    $('.cv-pos', v).textContent = `${idx + 1} / ${list.length}`;
    img.alt = `${c.title}, ${c.issuer}`;
    v.classList.add('loading');
    const full = new Image();
    full.decoding = 'async';
    full.src = src(c);
    img.src = src(c, true); // instant low-res, swapped when the full one lands
    const reveal = () => {
      img.src = full.src;
      v.classList.remove('loading');
    };
    (full.decode ? full.decode().then(reveal, reveal) : (full.onload = reveal));
    if (fromEl && !reduced && img.animate) {
      requestAnimationFrame(() => {
        const a = fromEl.getBoundingClientRect();
        const b = img.getBoundingClientRect();
        if (!b.width || !a.width) return;
        const sx = a.width / b.width;
        const sy = a.height / b.height;
        img.animate([
          { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${sx}, ${sy})`, transformOrigin: '0 0', borderRadius: '10px' },
          { transform: 'none', transformOrigin: '0 0', borderRadius: '6px' },
        ], { duration: 460, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      });
    } else if (!reduced) {
      img.animate?.([{ opacity: 0, transform: 'scale(0.97)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
    }
  }

  function open(id, fromEl) {
    const c = CREDS.find((x) => x.id === id);
    if (!c) return;
    const inTab = fromEl?.closest('.cr-grid');
    list = inTab ? CREDS.filter((x) => x.tab === c.tab) : CREDS;
    idx = Math.max(0, list.indexOf(c));
    if (v.hidden) {
      lastFocus = document.activeElement;
      v.hidden = false;
      document.documentElement.classList.add('px-lock');
      requestAnimationFrame(() => v.classList.add('on'));
    }
    render(c, fromEl?.querySelector?.('img') || null);
    setTimeout(() => $('[data-cv-close].cv-btn', v).focus({ preventScroll: true }), 50);
  }
  function close() {
    if (v.hidden) return;
    v.classList.remove('on');
    document.documentElement.classList.remove('px-lock');
    setTimeout(() => { v.hidden = true; img.removeAttribute('src'); }, reduced ? 0 : 260);
    lastFocus?.focus?.({ preventScroll: true });
  }
  const step = (d) => { idx = (idx + d + list.length) % list.length; render(list[idx]); };
  const fromHash = () => { const m = location.hash.match(/^#cred-([\w-]+)$/); if (m && CREDS.some((c) => c.id === m[1])) open(m[1]); };
  window.addEventListener('hashchange', fromHash);
  setTimeout(fromHash, 0);

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cred]');
    if (t) { e.preventDefault(); open(t.dataset.cred, t.closest('.cred') ? t : null); return; }
    if (v.hidden) return;
    if (e.target.closest('[data-cv-close]')) close();
    const s = e.target.closest('[data-cv-step]');
    if (s) step(Number(s.dataset.cvStep));
    if (e.target.closest('[data-cv-zoom]')) setZoom(!zoomed);
    if (e.target.closest('.cv-acts [data-project]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (v.hidden) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === '+' || e.key === '=') setZoom(true);
    if (e.key === '-') setZoom(false);
    if (e.key === 'Tab') {
      const f = $$('a, button', $('.cv-box', v)).filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }, true);
  // swipe on touch screens
  let sx = null;
  stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (sx == null || zoomed) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    sx = null;
  });
}
