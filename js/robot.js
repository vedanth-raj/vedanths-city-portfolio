/* ==========================================================================
   VEE · the little robot who answers questions about Vedanth
   · Assembled by the build cursors whenever they have nothing to build
     (js/build.js drives the cursors; this file owns the robot + chat).
     The five cursors become five parts: API → left arm, UI → head,
     DB → body, WS → right arm, Ops → antenna.
   · Floats around the page on a spring: tilts with speed, its antenna
     wobbles, eyes follow your pointer, it blinks, peeks at the section
     you're reading and perches on the chat window when you talk to it.
   · Chat runs locally (js/chat-brain.js). Set VITE_CHAT_ENDPOINT at build
     time to also use the AI backend in /server (falls back to local).
   ========================================================================== */

import { createBrain, WELCOME } from './chat-brain.js';

const ENDPOINT = (import.meta.env && import.meta.env.VITE_CHAT_ENDPOINT) || '';
const ANCHORS = [[20, 90], [50, 48], [50, 92], [80, 90], [50, 9]]; // viewBox 100×124, by cursor index
const TIPS = {
  home: ['Psst… try the glowing button on the left: you can drive through Vedanth’s City!', 'What is Vedanth’s City?'],
  work: ['Want the 30-second version of any project? Try Face Auth.', 'How does Face Auth work?'],
  request: ['Fun fact: Bedrock is ~98% of this request’s time. Ask me why!', 'How does the Recipe Generator work?'],
  roles: ['Curious how one screen locks itself per role? Ask me!', 'Tell me about Smart Hospital'],
  journey: ['He leads AWS’s Student Builder program on campus. Ask me what that involves.', 'What does he do at AWS?'],
  built: ['1st place at Drone Conquest! Want his other highlights?', 'What has he achieved?'],
  stack: ['Wondering if he knows a specific tool? Just ask me.', 'What are his skills?'],
  creds: ['Every certificate here opens in a preview, and most link to the issuer to verify.', 'What certifications does he have?'],
  contact: ['Want his email or number? I can hand them over.', 'How do I contact him?'],
};

const SVG = `
<svg class="vee-svg" viewBox="0 0 100 124" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="vee-shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e4e8f0"/><stop offset="1" stop-color="#b5bcca"/></linearGradient>
    <linearGradient id="vee-visor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18202f"/><stop offset="1" stop-color="#05070c"/></linearGradient>
    <linearGradient id="vee-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ffd6"/><stop offset=".3" stop-color="#d4ff2a"/><stop offset=".75" stop-color="#5fd4f4" stop-opacity=".55"/><stop offset="1" stop-color="#5fd4f4" stop-opacity="0"/></linearGradient>
    <radialGradient id="vee-glow" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#d4ff2a" stop-opacity=".45"/><stop offset="1" stop-color="#d4ff2a" stop-opacity="0"/></radialGradient>
  </defs>
  <g class="vee-jet"><ellipse class="vee-jet-glow" cx="50" cy="114" rx="15" ry="9" fill="url(#vee-glow)"/><path class="vee-flame" d="M42.5 108.5C42.5 115 46.5 120.5 50 127C53.5 120.5 57.5 115 57.5 108.5C53 110.5 47 110.5 42.5 108.5Z" fill="url(#vee-flame)"/></g>
  <g class="vee-part vee-arm-l" data-part="0"><g class="vee-armi"><rect x="14" y="80" width="11" height="21" rx="5.5" fill="url(#vee-shell)"/><circle cx="19.5" cy="98.5" r="3.4" fill="#5fd4f4"/></g></g>
  <g class="vee-part vee-arm-r" data-part="3"><g class="vee-armi"><rect x="75" y="80" width="11" height="21" rx="5.5" fill="url(#vee-shell)"/><circle cx="80.5" cy="98.5" r="3.4" fill="#ff4fa3"/></g></g>
  <g class="vee-part vee-body" data-part="2">
    <ellipse cx="50" cy="92" rx="22" ry="18" fill="url(#vee-shell)"/>
    <rect x="40.5" y="86" width="19" height="11" rx="5.5" fill="#0b0e15"/>
    <circle class="vee-core" cx="50" cy="91.5" r="3" fill="#f5c518"/>
  </g>
  <g class="vee-part vee-head" data-part="1"><g class="vee-headi">
    <rect x="8.5" y="41" width="8" height="18" rx="4" fill="#9b7bff"/>
    <rect x="83.5" y="41" width="8" height="18" rx="4" fill="#9b7bff"/>
    <rect x="13" y="22" width="74" height="56" rx="25" fill="url(#vee-shell)"/>
    <rect x="21" y="31" width="58" height="38" rx="17" fill="url(#vee-visor)"/>
    <path d="M28.5 37.5q9-5 20-3.5" stroke="#fff" stroke-opacity=".2" stroke-width="3" stroke-linecap="round" fill="none"/>
    <g class="vee-face">
      <g class="vee-eyes">
        <ellipse class="vee-eye" cx="39" cy="49" rx="5.5" ry="7" fill="#d4ff2a"/>
        <ellipse class="vee-eye" cx="61" cy="49" rx="5.5" ry="7" fill="#d4ff2a"/>
        <path class="vee-eye-happy" d="M33.5 51.5q5.5-7.5 11 0M55.5 51.5q5.5-7.5 11 0" stroke="#d4ff2a" stroke-width="3.4" stroke-linecap="round" fill="none"/>
      </g>
      <path class="vee-smile" d="M45 60.5q5 3.6 10 0" stroke="#d4ff2a" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <ellipse class="vee-mouth" cx="50" cy="61" rx="3.6" ry="2.4" fill="#d4ff2a"/>
      <circle class="vee-cheek" cx="28" cy="60" r="3.3" fill="#ff4fa3"/>
      <circle class="vee-cheek" cx="72" cy="60" r="3.3" fill="#ff4fa3"/>
    </g>
  </g></g>
  <g class="vee-part vee-antenna" data-part="4"><g class="vee-ant">
    <path d="M50 23V12.5" stroke="#c9cfda" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle class="vee-bulb" cx="50" cy="9" r="5" fill="#d4ff2a"/>
  </g></g>
</svg>`;

const ICON = {
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></svg>',
  speak: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
};

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/* ---------- tiny, safe markdown: **bold**, [text](url), "- " lists, paragraphs ---------- */
function md(src) {
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inline = (s) => esc(s)
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:|#)[^)\s]+)\)/g, (m, label, url) => `<a href="${url}"${url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return String(src).trim().split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');
    let html = '';
    let list = [];
    const flush = () => { if (list.length) { html += `<ul>${list.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`; list = []; } };
    let para = [];
    const flushP = () => { if (para.length) { html += `<p>${para.map(inline).join('<br>')}</p>`; para = []; } };
    lines.forEach((l) => {
      const m = l.match(/^\s*[-•]\s+(.*)/);
      if (m) { flushP(); list.push(m[1]); } else { flush(); para.push(l); }
    });
    flushP(); flush();
    return html;
  }).join('');
}
const plain = (s) => String(s).replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/^\s*-\s+/gm, '').replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '');

export function initRobot({ tick = () => {} } = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brain = createBrain();

  /* ================= DOM ================= */
  const bot = document.createElement('button');
  bot.type = 'button';
  bot.className = 'vee is-off';
  bot.id = 'vee';
  bot.tabIndex = -1;
  bot.setAttribute('aria-label', "Chat with Vee, Vedanth's assistant robot");
  bot.setAttribute('aria-haspopup', 'dialog');
  bot.setAttribute('aria-expanded', 'false');
  bot.setAttribute('aria-controls', 'vee-panel');
  bot.innerHTML = `<span class="vee-float">${SVG}</span><span class="vee-fx" aria-hidden="true"></span>`;
  const floatEl = bot.querySelector('.vee-float');
  const fx = bot.querySelector('.vee-fx');
  const parts = [...bot.querySelectorAll('.vee-part')].sort((a, b) => a.dataset.part - b.dataset.part);
  const eyes = bot.querySelector('.vee-eyes');
  const headI = bot.querySelector('.vee-headi');
  const ant = bot.querySelector('.vee-ant');
  parts.forEach((p) => p.classList.add('off'));

  const bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'vee-bubble';
  bubble.hidden = true;
  bubble.innerHTML = '<span class="vee-bubble-text"></span><span class="vee-bubble-cta">Ask Vee →</span>';
  const bubbleText = bubble.querySelector('.vee-bubble-text');

  const panel = document.createElement('section');
  panel.className = 'vee-panel';
  panel.id = 'vee-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'vee-title');
  panel.innerHTML = `
    <header class="vee-head">
      <div class="vee-id">
        <h2 id="vee-title">Vee <small>Vedanth's assistant</small></h2>
        <p><span class="pulse"></span><span>${ENDPOINT ? 'Online · AI mode' : 'Online · knows his resume'}</span></p>
      </div>
      <div class="vee-tools">
        <button type="button" class="vee-ic" data-vee="voice" aria-pressed="false" aria-label="Read replies aloud" title="Read replies aloud">${ICON.speak}</button>
        <button type="button" class="vee-ic" data-vee="reset" aria-label="Start a new chat" title="New chat">${ICON.reset}</button>
        <button type="button" class="vee-ic" data-vee="close" aria-label="Close chat" title="Close (Esc)">${ICON.close}</button>
      </div>
    </header>
    <div class="vee-log" role="log" aria-label="Conversation with Vee"></div>
    <p class="sr-only" aria-live="polite" data-vee="sr"></p>
    <div class="vee-chips" role="group" aria-label="Suggested questions"></div>
    <form class="vee-form" novalidate>
      <label class="sr-only" for="vee-input">Ask Vee about Vedanth</label>
      <textarea id="vee-input" rows="1" maxlength="500" placeholder="Ask me anything about Vedanth…" enterkeyhint="send" autocomplete="off"></textarea>
      <button type="button" class="vee-ic vee-mic" data-vee="mic" aria-pressed="false" aria-label="Ask with your voice" title="Speak">${ICON.mic}</button>
      <button type="submit" class="vee-send" aria-label="Send">${ICON.send}</button>
    </form>
    <p class="vee-note">Vee only knows Vedanth's resume and this site, and says so when it doesn't know.</p>`;
  document.body.append(panel, bubble, bot);

  const log = panel.querySelector('.vee-log');
  const chipsEl = panel.querySelector('.vee-chips');
  const form = panel.querySelector('.vee-form');
  const input = panel.querySelector('#vee-input');
  const srEl = panel.querySelector('[data-vee="sr"]');
  const micBtn = panel.querySelector('[data-vee="mic"]');
  const voiceBtn = panel.querySelector('[data-vee="voice"]');

  /* ================= state ================= */
  let state = 'off'; // off → assembling → on
  let open = false;
  let hovered = false;
  let focused = false;
  let listening = false;
  let busy = false;
  let greeted = false;
  let W = 72;
  let H = 89;
  const R = { x: 0, y: 0, vx: 0, vy: 0, tilt: 0, bob: 0 };
  const gaze = { x: 0, y: 0, tx: 0, ty: 0, next: 0 };
  const antS = { a: 0, v: 0 };
  let pointer = { x: 0, y: 0, at: -1e9 };
  let push = 0;
  let lastScrollY = window.scrollY;
  let lastScrollAt = 0;
  let nextBlink = performance.now() + 2500;
  let nextSpin = performance.now() + rand(26000, 40000);
  let peek = null;
  let lastPeekEnd = 0;
  const peeked = new Set();
  let currentSection = 'home';
  let bubbleUntil = 0;
  let bubbleQ = '';
  let moodTimer = 0;
  let wasPerched = false;
  const history = [];

  const vw = () => document.documentElement.clientWidth || window.innerWidth;
  const vh = () => window.visualViewport?.height || window.innerHeight;
  const mobile = () => vw() < 640;
  const dockPoint = () => ({ x: vw() - (mobile() ? 44 : 64), y: vh() - (mobile() ? 108 : 92) });
  const measure = () => { W = bot.offsetWidth || 72; H = bot.offsetHeight || 89; };
  measure();
  Object.assign(R, dockPoint());

  const setMood = (m, ms = 0) => {
    ['happy', 'think', 'talk', 'listen', 'surprised'].forEach((c) => bot.classList.toggle(c, c === m));
    clearTimeout(moodTimer);
    if (ms) moodTimer = setTimeout(() => setMood(listening ? 'listen' : busy ? 'think' : null), ms);
  };
  const flash = (cls, ms) => { bot.classList.add(cls); setTimeout(() => bot.classList.remove(cls), ms); };

  /* ================= assembly API (used by js/build.js) ================= */
  function partTargets() {
    const s = W / 100;
    const left = R.x - W / 2;
    const top = R.y - H / 2 + R.bob;
    return ANCHORS.map(([ax, ay]) => ({ x: left + ax * s, y: top + ay * s }));
  }
  function spark(i, color) {
    const s = document.createElement('i');
    const [ax, ay] = ANCHORS[i] || [50, 60];
    s.style.left = `${ax}%`;
    s.style.top = `${(ay / 124) * 100}%`;
    s.style.setProperty('--sc', color || '#d4ff2a');
    fx.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
  function attach(i, color) {
    const p = parts[i];
    if (!p) return;
    if (state === 'off') { state = 'assembling'; bot.classList.add('is-building'); }
    p.style.setProperty('--pc', color);
    p.classList.remove('off');
    spark(i, color);
    tick(true);
  }
  function complete() {
    if (state === 'on') return;
    parts.forEach((p) => p.classList.remove('off'));
    state = 'on';
    bot.classList.remove('is-off', 'is-building');
    bot.tabIndex = 0;
    bot.classList.add('awake');
    flash('boot', 700);
    setTimeout(() => { setMood('happy', 1100); flash('wave', 1700); }, 380);
    if (!greeted) {
      greeted = true;
      setTimeout(() => { if (state === 'on' && !open) say("Hi! I'm Vee 👋 The cursors built me. Ask me anything about Vedanth!", 'Who is Vedanth?', 6500); }, 900);
    }
  }
  function release() {
    const pos = partTargets();
    if (state === 'off') return pos;
    parts.forEach((p) => p.classList.add('off'));
    state = 'off';
    bot.classList.add('is-off');
    bot.classList.remove('awake', 'is-building');
    if (document.activeElement === bot) bot.blur();
    bot.tabIndex = -1;
    hideBubble();
    endPeek();
    const ring = document.createElement('b');
    fx.appendChild(ring);
    setTimeout(() => ring.remove(), 600);
    return pos;
  }
  function appearNow() {
    parts.forEach((p) => p.classList.remove('off'));
    complete();
  }

  /* ================= speech bubble + peeking ================= */
  function say(text, question = '', ms = 5500) {
    if (open || state !== 'on') return;
    bubbleText.textContent = text;
    bubbleQ = question;
    bubble.setAttribute('aria-label', `${text}${question ? ` Ask Vee: ${question}` : ''}`);
    bubble.hidden = false;
    requestAnimationFrame(() => bubble.classList.add('on'));
    bubbleUntil = performance.now() + ms;
  }
  function hideBubble() {
    bubble.classList.remove('on');
    bubbleUntil = 0;
    setTimeout(() => { if (!bubbleUntil) bubble.hidden = true; }, 260);
  }
  bubble.addEventListener('click', () => { const q = bubbleQ; hideBubble(); openChat(q); });

  function endPeek() {
    if (!peek) return;
    peek = null;
    lastPeekEnd = performance.now();
  }
  function startPeek(id) {
    const sec = document.getElementById(id);
    const tip = TIPS[id];
    if (!sec || !tip) return;
    peeked.add(id);
    const h = sec.querySelector('.display, .ship, h2');
    const r = h ? h.getBoundingClientRect() : null;
    const y = r && r.top > 80 && r.bottom < vh() - 120 ? r.top + r.height / 2 : vh() * 0.4;
    peek = { x: vw() - 72, y: clamp(y, 130, vh() - 200), lookX: r ? r.left + r.width / 2 : vw() / 2, lookY: r ? r.top + r.height / 2 : vh() / 2, until: performance.now() + 6200 };
    setTimeout(() => { if (peek) say(tip[0], tip[1], 5200); }, 650);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) currentSection = e.target.id; });
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('section[id]').forEach((s) => io.observe(s));

  /* ================= input listeners ================= */
  window.addEventListener('pointermove', (e) => { pointer = { x: e.clientX, y: e.clientY, at: performance.now() }; }, { passive: true });
  window.addEventListener('scroll', () => {
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    lastScrollAt = performance.now();
    push = clamp(push + dy * 0.12, -44, 44);
    if (Math.abs(dy) > 140 && state === 'on' && !open) setMood('surprised', 520);
    if (peek) { endPeek(); hideBubble(); }
  }, { passive: true });
  window.addEventListener('resize', measure);

  bot.addEventListener('mouseenter', () => { hovered = true; if (state === 'on' && !busy) setMood('happy'); });
  bot.addEventListener('mouseleave', () => { hovered = false; if (!busy && !listening) setMood(null); });
  bot.addEventListener('click', () => { if (state !== 'on') return; open ? closeChat() : openChat(); });
  const trackFocus = () => { focused = panel.contains(document.activeElement) || document.activeElement === bot; };
  document.addEventListener('focusin', trackFocus);
  document.addEventListener('focusout', () => setTimeout(trackFocus, 0));

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-ask]');
    if (a) { e.preventDefault(); openChat(a.dataset.ask); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open && !document.querySelector('.modal:not([hidden])')) { e.preventDefault(); closeChat(); }
  });

  /* ================= chat ================= */
  function openChat(question = '') {
    hideBubble();
    endPeek();
    if (!open) {
      open = true;
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('on'));
      bot.setAttribute('aria-expanded', 'true');
      if (!log.children.length) addBot(WELCOME, { instant: true });
      if (!mobile() || !question) setTimeout(() => input.focus({ preventScroll: true }), 90);
    }
    if (question) send(question);
  }
  function closeChat() {
    if (!open) return;
    open = false;
    panel.classList.remove('on');
    bot.setAttribute('aria-expanded', 'false');
    const hadFocus = panel.contains(document.activeElement);
    setTimeout(() => { if (!open) panel.hidden = true; }, 280);
    if (listening) rec?.stop();
    window.speechSynthesis?.cancel();
    if (hadFocus) (state === 'on' ? bot : document.querySelector('.skip-link'))?.focus({ preventScroll: true });
  }

  const scrollLog = () => { log.scrollTo({ top: log.scrollHeight, behavior: reduced ? 'auto' : 'smooth' }); };

  function addUser(text) {
    const m = document.createElement('div');
    m.className = 'vee-msg me';
    m.innerHTML = `<span class="sr-only">You said: </span><div class="vee-b"></div>`;
    m.querySelector('.vee-b').textContent = text;
    log.appendChild(m);
    scrollLog();
  }
  function addTyping() {
    const m = document.createElement('div');
    m.className = 'vee-msg bot typing';
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = '<div class="vee-b"><i></i><i></i><i></i></div>';
    log.appendChild(m);
    scrollLog();
    return m;
  }
  function wrapWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let i = 0;
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.append(w); return; }
        const s = document.createElement('span');
        s.className = 'vw';
        s.style.setProperty('--i', i);
        i += 1;
        s.textContent = w;
        frag.append(s);
      });
      node.replaceWith(frag);
    });
    return i;
  }
  function actionEl(a) {
    if (a.href) {
      const el = document.createElement('a');
      el.className = 'vee-act';
      el.href = a.href;
      if (a.href.startsWith('http')) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
      el.textContent = a.href.startsWith('http') ? `${a.label} ↗` : a.label;
      return el;
    }
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'vee-act';
    el.textContent = a.label;
    if (a.open === 'talk') el.setAttribute('data-open-talk', '');
    if (a.copy) el.setAttribute('data-copy', a.copy);
    if (a.scroll) el.addEventListener('click', () => { if (mobile()) closeChat(); document.querySelector(a.scroll)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); });
    return el;
  }
  function setChips(list = []) {
    chipsEl.innerHTML = '';
    list.slice(0, 4).forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'vee-chip';
      b.style.setProperty('--i', i);
      b.textContent = c;
      b.addEventListener('click', () => send(c));
      chipsEl.appendChild(b);
    });
  }
  async function addBot(res, { instant = false } = {}) {
    const m = document.createElement('div');
    m.className = 'vee-msg bot';
    m.innerHTML = `<span class="sr-only">Vee: </span><div class="vee-b">${md(res.text)}</div>`;
    const b = m.querySelector('.vee-b');
    let dur = 0;
    if (!instant && !reduced) {
      const n = wrapWords(b);
      const step = Math.min(34, 1300 / Math.max(1, n));
      b.style.setProperty('--step', `${step}ms`);
      dur = n * step + 300;
    }
    if (res.actions?.length) {
      const row = document.createElement('div');
      row.className = 'vee-acts';
      row.style.setProperty('--d', `${dur}ms`);
      res.actions.forEach((a) => row.appendChild(actionEl(a)));
      m.appendChild(row);
    }
    log.appendChild(m);
    scrollLog();
    srEl.textContent = '';
    setTimeout(() => { srEl.textContent = `Vee: ${plain(res.text)}`; }, 60);
    speak(res.text);
    if (dur) {
      setMood('talk');
      const scroller = setInterval(scrollLog, 220);
      await sleep(dur);
      clearInterval(scroller);
      setMood('happy', 900);
    }
    setChips(res.chips);
    scrollLog();
  }

  async function askRemote() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-12) }),
        signal: ctrl.signal,
      });
      if (!r.ok) return null;
      const data = await r.json();
      return typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function send(raw) {
    const text = String(raw || '').trim().slice(0, 500);
    if (!text || busy) return;
    busy = true;
    input.value = '';
    autosize();
    setChips([]);
    addUser(text);
    history.push({ role: 'user', content: text });
    setMood('think');
    const typing = addTyping();
    const t0 = performance.now();
    const local = brain.reply(text);
    let remote = null;
    if (ENDPOINT) remote = await askRemote().catch(() => null);
    const wait = 420 + Math.min(700, text.length * 10) - (performance.now() - t0);
    if (wait > 0) await sleep(wait);
    typing.remove();
    const res = remote ? { text: remote, chips: local.chips } : local;
    history.push({ role: 'assistant', content: res.text });
    await addBot(res);
    busy = false;
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  function autosize() {
    input.style.height = 'auto';
    if (!input.value) return; // one line when empty (a wrapped placeholder shouldn't grow it)
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
    input.style.overflowY = input.scrollHeight > 112 ? 'auto' : 'hidden';
  }
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(input.value); }
  });
  panel.addEventListener('click', (e) => {
    const t = e.target.closest('[data-vee]');
    if (!t) return;
    const what = t.dataset.vee;
    if (what === 'close') closeChat();
    if (what === 'reset') {
      brain.reset();
      history.length = 0;
      log.innerHTML = '';
      addBot(WELCOME, { instant: true });
      input.focus();
    }
    if (what === 'voice') {
      voiceOn = !voiceOn;
      store.set('vee:voice', voiceOn ? 'on' : 'off');
      syncVoice();
      if (!voiceOn) window.speechSynthesis?.cancel();
    }
    if (what === 'mic') { if (listening) rec?.stop(); else listen(); }
  });

  /* ---------- read replies aloud ---------- */
  let voiceOn = store.get('vee:voice') === 'on';
  const canSpeak = 'speechSynthesis' in window;
  if (!canSpeak) voiceBtn.hidden = true;
  function syncVoice() {
    voiceBtn.setAttribute('aria-pressed', String(voiceOn));
    voiceBtn.setAttribute('aria-label', voiceOn ? 'Stop reading replies aloud' : 'Read replies aloud');
  }
  syncVoice();
  function speak(text) {
    if (!voiceOn || !canSpeak) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(plain(text));
    const voices = synth.getVoices();
    u.voice = voices.find((v) => /en[-_](IN|GB|US)/i.test(v.lang) && /female|zira|samantha|google/i.test(v.name)) || voices.find((v) => /^en/i.test(v.lang)) || null;
    u.pitch = 1.35;
    u.rate = 1.05;
    u.onstart = () => setMood('talk');
    u.onend = () => setMood(null);
    synth.speak(u);
  }

  /* ---------- voice input ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  if (!SR) micBtn.hidden = true;
  function listen() {
    if (!SR || busy) return;
    window.speechSynthesis?.cancel();
    rec = new SR();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalText = '';
    rec.onresult = (e) => {
      const t = [...e.results].map((r) => r[0].transcript).join('');
      input.value = t;
      autosize();
      if (e.results[e.results.length - 1].isFinal) finalText = t;
    };
    rec.onerror = (e) => {
      input.placeholder = e.error === 'not-allowed' ? 'Microphone is blocked. You can type instead.' : "Didn't catch that. Try again or type.";
    };
    rec.onend = () => {
      listening = false;
      micBtn.setAttribute('aria-pressed', 'false');
      micBtn.classList.remove('on');
      setMood(null);
      if (finalText.trim()) send(finalText);
    };
    try {
      rec.start();
      listening = true;
      micBtn.setAttribute('aria-pressed', 'true');
      micBtn.classList.add('on');
      input.placeholder = 'Listening…';
      setMood('listen');
    } catch { listening = false; }
  }

  /* ================= animation loop ================= */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const visible = state !== 'off';

    // where should Vee be?
    let tx;
    let ty;
    let k = 34;
    let zeta = 0.52;
    const perched = open;
    if (open) {
      const r = panel.getBoundingClientRect();
      tx = r.left + (mobile() ? 44 : 52);
      ty = r.top - (mobile() ? 2 : 4);
      k = 80;
      zeta = 0.62;
    } else if (peek) {
      tx = peek.x; ty = peek.y; k = 16; zeta = 0.6;
      if (now > peek.until) { endPeek(); hideBubble(); }
    } else {
      ({ x: tx, y: ty } = dockPoint());
    }
    push *= Math.exp(-dt * 5);
    if (!open) ty -= push;

    if (reduced) {
      R.x = tx; R.y = ty; R.vx = 0; R.vy = 0;
    } else {
      const c = 2 * Math.sqrt(k) * zeta;
      R.vx += (k * (tx - R.x) - c * R.vx) * dt;
      R.vy += (k * (ty - R.y) - c * R.vy) * dt;
      R.x += R.vx * dt;
      R.y += R.vy * dt;
    }
    R.bob = visible && !perched && !reduced ? Math.sin(now / 1000 * 2.3) * 4 : 0;
    R.tilt += (clamp(R.vx * 0.045, -16, 16) - R.tilt) * Math.min(1, dt * 9);

    if (perched !== wasPerched) {
      wasPerched = perched;
      bot.classList.toggle('perched', perched);
      if (perched && !reduced) flash('land', 420);
    }

    // eyes: pointer, thinking, peeking, or idle glances
    if (busy && !listening) { gaze.tx = 2.6; gaze.ty = -2.6; }
    else if (listening) { gaze.tx = 0; gaze.ty = 0; }
    else if (peek) { gaze.tx = clamp((peek.lookX - R.x) / 160, -1, 1) * 4; gaze.ty = clamp((peek.lookY - R.y) / 160, -1, 1) * 3; }
    else if (now - pointer.at < 3500) {
      gaze.tx = clamp((pointer.x - R.x) / 220, -1, 1) * 4;
      gaze.ty = clamp((pointer.y - R.y) / 220, -1, 1) * 3;
    } else if (open) { gaze.tx = -2.5; gaze.ty = 2.5; }
    else if (now > gaze.next) { gaze.tx = rand(-4, 4); gaze.ty = rand(-2.5, 2.5); gaze.next = now + rand(1200, 3200); }
    gaze.x += (gaze.tx - gaze.x) * Math.min(1, dt * 10);
    gaze.y += (gaze.ty - gaze.y) * Math.min(1, dt * 10);

    // antenna: springy wobble that trails the movement
    const antT = clamp(-R.vx * 0.07, -28, 28) + clamp(R.vy * 0.02, -8, 8);
    antS.v += ((antT - antS.a) * 120 - antS.v * 9) * dt;
    antS.a += antS.v * dt;

    if (visible) {
      if (now > nextBlink) {
        flash('blink', 130);
        if (Math.random() < 0.25) setTimeout(() => flash('blink', 120), 220);
        nextBlink = now + rand(2400, 5600);
      }
      if (!reduced && !open && !peek && !hovered && now > nextSpin && now - lastScrollAt > 4000) {
        flash('spin', 1000);
        nextSpin = now + rand(30000, 50000);
      }
      // peek at a section the visitor has settled on (desktop only)
      if (state === 'on' && !open && !peek && !reduced && vw() >= 980 && now - lastScrollAt > 1800 && now - lastPeekEnd > 7000
        && lastScrollAt > 0 && !peeked.has(currentSection) && currentSection !== 'home' && !hovered && !bubbleUntil) {
        startPeek(currentSection);
      }
    }
    if (bubbleUntil && now > bubbleUntil) hideBubble();

    bot.style.transform = `translate3d(${(R.x - W / 2).toFixed(1)}px, ${(R.y - H / 2).toFixed(1)}px, 0)`;
    floatEl.style.transform = `translateY(${R.bob.toFixed(2)}px) rotate(${R.tilt.toFixed(2)}deg)`;
    eyes.style.transform = `translate(${gaze.x.toFixed(2)}px, ${gaze.y.toFixed(2)}px)`;
    headI.style.transform = `rotate(${(gaze.x * 1.1).toFixed(2)}deg)`;
    ant.style.transform = `rotate(${antS.a.toFixed(2)}deg)`;
    bot.style.setProperty('--jet', clamp(0.75 + -R.vy / 500 + Math.abs(R.vx) / 900, 0.5, 1.6).toFixed(2));

    if (!bubble.hidden) {
      const bw = bubble.offsetWidth;
      const bh = bubble.offsetHeight;
      const left = R.x > vw() / 2;
      const bx = left ? R.x - W / 2 - bw + 6 : R.x + W / 2 - 6;
      const by = clamp(R.y - H / 2 - bh + 18 + R.bob, 70, vh() - bh - 10);
      bubble.classList.toggle('from-right', !left);
      bubble.style.transform = `translate3d(${clamp(bx, 10, vw() - bw - 10).toFixed(1)}px, ${by.toFixed(1)}px, 0)`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    get state() { return state; },
    get engaged() { return open || hovered || focused || listening; },
    partTargets,
    attach,
    complete,
    release,
    appearNow,
    open: openChat,
  };
}
