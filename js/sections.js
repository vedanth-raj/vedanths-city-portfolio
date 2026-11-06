/* ==========================================================================
   SECTIONS: content + interactive widgets
   ========================================================================== */
import { initExplorer } from './explorer.js';
import { initCreds } from './creds.js';
import { PROJECTS, FLOWS, ROLES, SIDEBAR, APPOINTMENTS, FEATS, HERO_WORDS, MARQUEE } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- shared: sound + toast ---------------- */
let audio = null;
let soundOn = false;
try { soundOn = localStorage.getItem('vr:sound') === 'on'; } catch { /* private mode */ }
export function tick(soft = false) {
  if (!soundOn) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = 'triangle';
    o.frequency.value = soft ? 1600 + Math.random() * 500 : 900;
    g.gain.setValueAtTime(soft ? 0.018 : 0.04, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + (soft ? 0.03 : 0.07));
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.08);
  } catch { /* audio unavailable */ }
}
let toastTimer;
export function toast(msg, ms = 1800) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}

function initSound() {
  const btn = $('.sound-btn');
  const sync = () => {
    btn.setAttribute('aria-pressed', String(soundOn));
    btn.setAttribute('aria-label', soundOn ? 'Turn interface sounds off' : 'Turn interface sounds on');
  };
  sync();
  btn.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem('vr:sound', soundOn ? 'on' : 'off'); } catch { /* ignore */ }
    sync();
    tick();
    toast(soundOn ? 'Interface sounds on' : 'Interface sounds off', 1200);
  });
  document.addEventListener('click', (e) => { if (e.target.closest('button, a')) tick(); });
}

/* ---------------- hero: rotating giant word + stats ---------------- */
function initHeroWord() {
  const el = $('#hero-word');
  const wrap = $('.hero-word-wrap');
  const hero = $('#home');
  const measureEl = document.createElement('span');
  measureEl.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-family:Anton,Impact,sans-serif;font-size:100px;letter-spacing:0.01em;left:-9999px;top:0';
  document.body.appendChild(measureEl);

  const sizeFor = (word) => {
    measureEl.textContent = word;
    const natural = measureEl.getBoundingClientRect().width / 100; // width per 1px of font-size
    const maxW = wrap.clientWidth * 0.96;
    const maxH = hero.clientHeight * (window.innerWidth < 860 ? 0.24 : 0.43);
    return Math.max(60, Math.min(maxW / natural, maxH / 0.86));
  };
  const render = (word, cls = '') => {
    el.innerHTML = [...word].map((ch) => `<span class="ch ${cls}"><i>${ch === ' ' ? '&nbsp;' : esc(ch)}</i></span>`).join('');
    el.style.setProperty('--word-size', `${sizeFor(word)}px`);
  };

  let i = 0;
  render(HERO_WORDS[0]);
  window.addEventListener('resize', () => el.style.setProperty('--word-size', `${sizeFor(HERO_WORDS[i])}px`));
  document.fonts?.ready.then(() => el.style.setProperty('--word-size', `${sizeFor(HERO_WORDS[i])}px`));

  let started = false;
  return function start() {
    if (started || reduced) return;
    started = true;
    setInterval(() => {
      if (document.hidden || window.scrollY > hero.clientHeight) return;
      const chars = $$('.ch', el);
      chars.forEach((c, k) => setTimeout(() => c.classList.add('out'), k * 35));
      setTimeout(() => {
        i = (i + 1) % HERO_WORDS.length;
        render(HERO_WORDS[i], 'in');
        $$('.ch', el).forEach((c, k) => setTimeout(() => c.classList.remove('in'), 30 + k * 45));
      }, chars.length * 35 + 380);
    }, 3200);
  };
}

function initStats() {
  const stats = $$('#stats .stat');
  let i = 1;
  stats[i].classList.add('on');
  if (reduced) return;
  setInterval(() => {
    stats[i].classList.remove('on');
    i = (i + 1) % stats.length;
    stats[i].classList.add('on');
  }, 2400);
}

function initTakedown() {
  const sw = $('#takedown');
  sw.addEventListener('change', () => {
    if (!sw.checked) return;
    document.body.classList.add('chaos');
    toast('Sending 10,000 requests…', 1200);
    setTimeout(() => toast('429 Too Many Requests · rate limiter held', 1600), 1300);
    setTimeout(() => {
      document.body.classList.remove('chaos');
      sw.checked = false;
      toast('Still up. Nice try.', 1800);
    }, 3100);
  });
}

/* ---------------- work: project cards ---------------- */
const mock = {
  chat: (p) => `<div class="mock mock-chat">
      <div class="bubble me">${esc(p.mock.ask)}</div>
      <div class="bubble ai">${esc(p.mock.answer)}</div>
      <div class="row" style="margin-top:8px"><div class="bar c" style="width:40%"></div><div class="bar" style="width:25%"></div></div></div>`,
  vision: (p) => `<div class="mock mock-vision"><div class="face"></div>
      <div class="detect" data-l="${esc(p.mock.label)}" style="left:calc(50% - 46px);top:22px;width:92px;height:104px"></div><div class="scan"></div></div>`,
  plate: (p) => `<div class="mock mock-vision" style="background:radial-gradient(circle at 50% 60%,#1a1e29,#07080c 70%)">
      <div style="position:relative"><span class="plate">${esc(p.mock.plate)}</span><div class="detect" data-l="${esc(p.mock.label)}" style="inset:-8px"></div></div><div class="scan"></div></div>`,
  dash: (p) => `<div class="mock mock-dash"><div class="kpis">${p.mock.kpis.map(([k, v]) => `<div class="blk kpi">${esc(k)}<b>${esc(v)}</b></div>`).join('')}</div>
      <div class="blk chart">${p.mock.bars.map((h) => `<i style="height:${h}%"></i>`).join('')}</div></div>`,
  table: (p) => `<div class="mock mock-table">${p.mock.rows.map(([a, b, s, cls]) => `<div class="tr"><span style="color:#d6d8dd">${esc(a)}</span><span>${esc(b)}</span><span class="pill ${cls}">${esc(s)}</span></div>`).join('')}</div>`,
  term: (p) => `<div class="mock mock-term">${p.mock.lines.map((l) => `<div><span class="p">$</span> ${esc(l)}</div>`).join('')}</div>`,
};

function initProjects() {
  const host = $('#project-cards');
  host.innerHTML = PROJECTS.map((p, n) => `
    <article class="card" style="--c:${p.color}" data-id="${p.id}" data-b="frame" data-b-label="${esc(p.title)}">
      <div class="shot">
        <div class="shot-bar"><i></i><i></i><i></i><span>${esc(p.url)}</span><button type="button" aria-pressed="false" aria-label="Show the system behind ${esc(p.title)}">System</button></div>
        <div class="shot-view">
          <div class="ui">${mock[p.mock.type](p)}</div>
          <div class="sys">${p.system.map(([k, v]) => `<div class="sys-node"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta"><span class="cat">${esc(p.cat)}</span><span class="num">${String(n + 1).padStart(2, '0')}</span></div>
        <h3 data-b="type">${esc(p.title)}</h3>
        <p data-b="type">${esc(p.desc)}</p>
        <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="card-acts">
          <button type="button" class="mini-btn solid" data-project="${p.id}">Details →</button>
          ${p.repo ? `<a class="mini-btn" href="${p.repo}" target="_blank" rel="noopener noreferrer">Code ↗</a>` : ''}
          <button type="button" class="mini-btn" data-ask="Tell me about ${esc(p.title)}">Ask Vee</button>
        </div>
      </div>
    </article>`).join('');

  host.addEventListener('click', (e) => {
    const b = e.target.closest('.shot-bar button');
    if (!b) return;
    const card = b.closest('.card');
    const on = !card.classList.contains('show-sys');
    card.classList.toggle('show-sys', on);
    b.setAttribute('aria-pressed', String(on));
  });

}

/* ---------------- follow one request ---------------- */
function initRequest() {
  const actionsEl = $('#req-actions');
  const hopsEl = $('#req-hops');
  const wfEl = $('#req-waterfall');
  const traceEl = $('#req-trace');
  const breakEl = $('#req-break');
  const breakLabel = $('#req-break-label');
  const hint = $('#req-hint');
  let flow = FLOWS[0];
  let speed = 1;
  let timers = [];
  let started = false;

  actionsEl.innerHTML = FLOWS.map((f, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-flow="${f.id}">${esc(f.label)} <small>${esc(f.project)}</small></button>`).join('');

  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const at = (ms, fn) => timers.push(setTimeout(fn, ms / speed));

  const draw = () => {
    breakLabel.textContent = flow.breakLabel;
    $('#req-trace-id').textContent = `trace · ${flow.trace}`;
    hopsEl.innerHTML = flow.hops.map((h, i) => `<button type="button" class="hop" data-i="${i}"><small>${esc(h.kind)}</small><b>${esc(h.name)}</b><em>${esc(h.note)}</em><i>+${h.t.toFixed(1)} ms</i></button>`).join('');
    // Illustrative waterfall: hops in sequence, widths on a compressed (log) scale
    // so a 0.4 ms hop and an 840 ms model call both stay readable.
    const weights = flow.hops.map((h) => Math.log10(h.d * 10 + 1) + 0.35);
    const sum = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    flow.geom = weights.map((wgt) => { const g = { left: (acc / sum) * 100, width: (wgt / sum) * 100 }; acc += wgt; return g; });
    wfEl.innerHTML = flow.hops.map((h, k) => `<div class="wf-row"><span>${esc(h.name.toLowerCase())}</span><div class="wf-track"><i class="wf-bar" style="left:${flow.geom[k].left.toFixed(1)}%"></i></div><span>${h.d < 10 ? h.d.toFixed(1) : Math.round(h.d)}</span></div>`).join('');
    traceEl.innerHTML = '';
  };

  const line = (t, text, cls = '') => {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = `<span>+${t < 10 ? t.toFixed(1) : Math.round(t)}</span><span>${esc(text)}</span>`;
    traceEl.appendChild(d);
    while (traceEl.children.length > 9) traceEl.firstChild.remove();
  };

  const play = () => {
    clear();
    draw();
    const broken = breakEl.checked;
    const hops = $$('.hop', hopsEl);
    const bars = $$('.wf-bar', wfEl);
    let clock = 0;
    flow.hops.forEach((h, i) => {
      const STEP = 520;
      at(clock, () => {
        hops.forEach((x) => x.classList.remove('active'));
        hops[i].classList.add('lit', 'active');
        bars[i].style.width = `${flow.geom[i].width.toFixed(1)}%`;
        line(h.t, h.log);
      });
      clock += STEP;
      if (broken && i === flow.breakAt) {
        at(clock - STEP / 2, () => { hops[i].classList.add('broken'); bars[i].classList.add('bad'); flow.breakLog.forEach(([t, l]) => line(t, l, 'bad')); });
        at(clock + STEP, () => { hops[i].classList.remove('broken'); bars[i].classList.remove('bad'); line(flow.recover[0], flow.recover[1], 'ok'); });
        clock += STEP * 2;
      }
    });
    at(clock, () => {
      hops.forEach((x) => x.classList.remove('active'));
      line(flow.hops[flow.hops.length - 1].t + flow.hops[flow.hops.length - 1].d, flow.done, 'ok');
    });
  };

  actionsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-flow]');
    if (!b) return;
    flow = FLOWS.find((f) => f.id === b.dataset.flow);
    $$('[data-flow]', actionsEl).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    hint.textContent = 'Click any hop to see what it does';
    play();
  });
  $('#req-replay').addEventListener('click', play);
  breakEl.addEventListener('change', play);
  $$('.speed button').forEach((b) => b.addEventListener('click', () => {
    speed = Number(b.dataset.speed);
    $$('.speed button').forEach((x) => x.classList.toggle('on', x === b));
    play();
  }));
  hopsEl.addEventListener('click', (e) => {
    const h = e.target.closest('.hop');
    if (!h) return;
    $$('.hop', hopsEl).forEach((x) => x.classList.toggle('sel', x === h));
    const hop = flow.hops[Number(h.dataset.i)];
    hint.textContent = `${hop.name}: ${hop.what}`;
  });

  draw();
  return function start() {
    if (started) return;
    started = true;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.35 });
    io.observe($('.req-board'));
  };
}

/* ---------------- switch a role ---------------- */
function initRoles() {
  const list = $('#role-list');
  const side = $('#role-side');
  const rows = $('#role-rows');
  const perms = $('#role-perms');
  const LOCK = '<svg class="lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  list.innerHTML = ROLES.map((r, i) => `<button type="button" class="role" role="radio" aria-checked="${i === 0}" data-role="${r.id}">
      <span class="role-top"><span class="dot"></span>${esc(r.name)}<em>${esc(r.count)}</em></span><p>${esc(r.blurb)}</p></button>`).join('');

  const apply = (role) => {
    $('#role-signed').innerHTML = `<span class="pulse"></span>Signed in as ${esc(role.name)}`;
    side.innerHTML = SIDEBAR.map(([key, label, icon]) => {
      const locked = !role.can.includes(key);
      return `<div class="side-item ${key === 'appointments' ? 'cur' : ''} ${locked ? 'locked' : ''}"><svg viewBox="0 0 24 24">${icon}</svg>${esc(label)}${locked ? LOCK : ''}</div>`;
    }).join('');
    rows.innerHTML = APPOINTMENTS.map((a) => {
      const own = a.patient === role.self;
      const hidden = role.id === 'patient' && !own;
      const pt = hidden ? '<span class="masked">••••••••</span>' : esc(a.patient);
      const acts = [
        ['View', role.id !== 'patient' || own],
        ['Reschedule', role.can.includes('reschedule') || (role.id === 'patient' && own)],
        ['Cancel', role.can.includes('cancel')],
      ];
      return `<tr class="flash"><td>${esc(a.id)}</td><td>${pt}</td><td>${esc(a.doctor)}</td><td>${esc(a.slot)}</td><td><span class="pill ${a.cls}" style="padding:3px 8px;border-radius:5px;font-size:11.5px">${esc(a.status)}</span></td>
        <td><div class="row-acts">${acts.map(([l, ok]) => `<button type="button" class="${ok ? '' : 'no'}" ${ok ? '' : 'disabled aria-disabled="true"'}>${ok ? '' : '🔒 '}${l}</button>`).join('')}</div></td></tr>`;
    }).join('');
    $('#role-export').classList.toggle('is-locked', !role.can.includes('export'));
    $('#role-new').classList.toggle('is-locked', !role.can.includes('book'));
    perms.innerHTML = `${esc(role.name)} can ${role.perms.map(([p, ok]) => `<span class="perm ${ok ? 'yes' : 'no'}">${ok ? '✓' : '✕'} ${esc(p)}</span>`).join('')}`;
  };

  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-role]');
    if (!b) return;
    $$('[data-role]', list).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    apply(ROLES.find((r) => r.id === b.dataset.role));
  });
  list.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const items = $$('[data-role]', list);
    const cur = items.findIndex((x) => x.getAttribute('aria-checked') === 'true');
    const next = items[(cur + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
    next.focus();
    next.click();
  });
  apply(ROLES[0]);
}

/* ---------------- journey ---------------- */
function initJourney() {
  const items = $$('#timeline .t-item');
  const year = $('#journey-year');
  const cap = $('#journey-cap');
  let current = null;
  const setYear = (text) => {
    const old = year.querySelector('span');
    if (old && old.textContent === text) return;
    year.classList.toggle('small', text.length > 4);
    const next = document.createElement('span');
    next.textContent = text;
    if (reduced || !old) { year.innerHTML = ''; year.appendChild(next); return; }
    next.classList.add('enter');
    year.appendChild(next);
    old.classList.add('leave');
    old.style.position = 'absolute';
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove('enter')));
    setTimeout(() => old.remove(), 600);
  };
  year.style.position = 'relative';
  const activate = (item) => {
    if (item === current) return;
    current = item;
    items.forEach((x) => x.classList.toggle('on', x === item));
    setYear(item.dataset.year);
    cap.textContent = item.dataset.cap;
  };
  activate(items[0]);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) activate(e.target); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  items.forEach((i) => io.observe(i));
}

/* ---------------- beyond the classroom ---------------- */
function initFeats() {
  const tabs = $$('#feats li');
  const stage = $('#illus-stage');
  const cap = $('#illus-cap');
  let i = 0;
  let auto = true;
  const show = (k) => {
    i = k;
    tabs.forEach((t, n) => { t.setAttribute('aria-selected', String(n === k)); t.tabIndex = n === k ? 0 : -1; });
    const f = FEATS[tabs[k].dataset.feat];
    stage.innerHTML = `<div class="ill">${f.html()}</div>`;
    cap.textContent = f.cap;
  };
  tabs.forEach((t, n) => {
    t.addEventListener('click', () => { auto = false; show(n); });
    t.addEventListener('mouseenter', () => { auto = false; show(n); });
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const k = (n + (e.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
        auto = false;
        show(k);
        tabs[k].focus();
      }
    });
  });
  show(0);
  if (!reduced) setInterval(() => { if (auto && !document.hidden) show((i + 1) % tabs.length); }, 3600);
}

/* ---------------- stack layers ---------------- */
function initLayers() {
  const layers = $$('#layers .layer');
  let locked = false;
  const set = (l) => layers.forEach((x) => x.classList.toggle('on', x === l));
  set(layers[0]);
  layers.forEach((l) => {
    l.addEventListener('mouseenter', () => { locked = true; set(l); });
    l.addEventListener('focus', () => { locked = true; set(l); });
    l.addEventListener('click', () => { locked = true; set(l); });
  });
  $('#layers').addEventListener('mouseleave', () => { locked = false; });
  // follow scroll: the layer nearest the middle of the screen opens
  const onScroll = () => {
    if (locked) return;
    const mid = window.innerHeight * 0.5;
    let best = null;
    let bd = Infinity;
    layers.forEach((l) => {
      const r = l.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bd) { bd = d; best = l; }
    });
    const box = $('#layers').getBoundingClientRect();
    if (box.bottom > 0 && box.top < window.innerHeight && best) set(best);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------- contact: timezones + clock ---------------- */
function initTime() {
  const IST = 5.5;
  const local = -new Date().getTimezoneOffset() / 60;
  const pct = (h) => `${((((h % 24) + 24) % 24) / 24) * 100}%`;
  const startIST = 9 - local + IST; // visitor's 09:00 expressed in IST hours
  const s = ((startIST % 24) + 24) % 24;
  const you = $('#tz-you');
  const you2 = $('#tz-you-2');
  if (s + 9 <= 24) {
    you.style.left = pct(s); you.style.width = `${(9 / 24) * 100}%`;
    you2.style.display = 'none';
  } else {
    you.style.left = pct(s); you.style.width = `${((24 - s) / 24) * 100}%`;
    you2.style.left = '0%'; you2.style.width = `${((s + 9 - 24) / 24) * 100}%`;
  }
  const me = $('#tz-me');
  me.style.left = pct(9); me.style.width = `${(9 / 24) * 100}%`;
  // overlap between [s, s+9) and [9, 18) on a 24h ring
  let overlap = 0;
  for (let h = 0; h < 24; h += 0.25) {
    const inYou = ((h - s + 24) % 24) < 9;
    const inMe = h >= 9 && h < 18;
    if (inYou && inMe) overlap += 0.25;
  }
  $('#tz-overlap').textContent = overlap > 0 ? `${overlap % 1 ? overlap.toFixed(1) : overlap} h overlap a day` : 'No working-hour overlap, but email works any time';
  try {
    const name = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    $('#tz-you-label').textContent = `${name.split('/').pop().replace(/_/g, ' ')} · 9–18`;
  } catch { /* keep default */ }

  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const clock = $('#clock');
  const mClock = $('#modal-clock');
  const upd = () => {
    const t = fmt.format(new Date());
    clock.textContent = t;
    const h = Number(t.slice(0, 2));
    mClock.textContent = `${t.slice(0, 5)} IST · ${h >= 9 && h < 23 ? 'usually replies within a day' : 'away, replies in the morning'}`;
  };
  upd();
  setInterval(upd, 1000);
}

/* ---------------- marquee ---------------- */
function initMarquee() {
  const words = MARQUEE.map((w) => `<span>${esc(w)}</span>`).join('');
  $('#marquee').innerHTML = words + words;
}

/* ---------------- modal + copy ---------------- */
function initModal() {
  const modal = $('#talk-modal');
  const views = $$('.talk-view', modal);
  let lastFocus = null;
  const go = (name) => views.forEach((v) => { v.hidden = v.dataset.view !== name; });
  const open = (trigger) => {
    lastFocus = trigger || document.activeElement;
    go('menu');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('.modal-x', modal).focus(), 30);
  };
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-talk]');
    if (t) { e.preventDefault(); open(t); }
    if (e.target.closest('[data-close-talk]') || e.target === modal) close();
    const v = e.target.closest('[data-view-go]');
    if (v) go(v.dataset.viewGo);
  });
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = $$('button, a, input, textarea', modal).filter((x) => !x.closest('[hidden]') && !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $('#talk-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    const subject = `${d.get('kind')} · from ${d.get('name')}`;
    const body = `${d.get('message')}\n\n— ${d.get('name')} (${d.get('email')})`;
    window.location.href = `mailto:pvvraj1234433@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast('Opening your mail app…');
  });
  document.addEventListener('click', async (e) => {
    const c = e.target.closest('[data-copy]');
    if (!c) return;
    try {
      await navigator.clipboard.writeText(c.dataset.copy);
      toast(`Copied ${c.dataset.copy}`);
    } catch {
      toast('Copy failed: select and copy it manually');
    }
  });
}

/* ---------------- nav: active section ---------------- */
function initNav() {
  const links = $$('[data-nav]');
  const map = { work: 'work', request: 'work', roles: 'work', journey: 'journey', built: 'built', stack: 'stack', creds: 'creds' };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const key = map[e.target.id] || '';
      links.forEach((l) => l.classList.toggle('on', l.dataset.nav === key));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('section[id]').forEach((s) => io.observe(s));
}

/* ---------------- boot ---------------- */
export function initSections() {
  initSound();
  initProjects();
  initExplorer(); // every project: filters, search, detail drawer
  initCreds(); // certificates, letters, achievements + preview viewer
  const startWord = initHeroWord();
  initStats();
  initTakedown();
  const startRequest = initRequest();
  initRoles();
  initJourney();
  initFeats();
  initLayers();
  initTime();
  initMarquee();
  initModal();
  initNav();
  return {
    onPageBuilt(page) {
      if (page === 1) startWord();
      if (page === 3) startRequest();
    },
  };
}
