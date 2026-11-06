/* ==========================================================================
   BUILD MODE
   The page is "constructed" in front of the visitor by a small team of
   multiplayer cursors, design-tool style:
     · data-b="type"   → text is typed in, char by char, inside a selection box
     · data-b="frame"  → a blue frame is dragged out (handles + W × H), then fills
     · data-b="img"    → same as frame, image tool
     · data-b="fade"   → quick select-and-drop
   Pages build in order and follow the visitor's scroll: anything below the
   screen waits, anything already scrolled past completes instantly.
   "Skip" finishes everything at once.
   Whenever the team has nothing left to build on screen, the five cursors
   swirl together and click into place as Vee, the chatbot robot
   (js/robot.js). New work on screen sends them flying back out.
   ========================================================================== */

const CURSORS = [
  { tag: 'API', color: '#5fd4f4' },
  { tag: 'UI', color: '#9b7bff' },
  { tag: 'DB', color: '#f5c518' },
  { tag: 'WS', color: '#ff4fa3' },
  { tag: 'Ops', color: '#f1f2f4' },
];
const TOOL_ICON = {
  text: '<b>T</b>',
  frame: '<svg viewBox="0 0 24 24"><path d="M8 3v18M16 3v18M3 8h18M3 16h18"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/></svg>',
};
const ARROW = '<svg viewBox="0 0 24 24"><path d="m4 3 7.5 18 2.6-7.6L21.7 11Z"/></svg>';
const BASE_LANES = 2;
const TOTAL_PAGES = 8;
const GATHER_AFTER = 1100; // ms of nothing-to-build before the team assembles
const MIN_OUT = 1500; // ms a released team stays out before it may reassemble

const rand = (a, b) => a + Math.random() * (b - a);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t) => Math.max(0, Math.min(1, t));

export function initBuild({ onPageBuilt = () => {}, tick = () => {}, robot = null } = {}) {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('nobuild'); // ?nobuild skips the intro
  const ui = document.getElementById('build-ui');
  const all = [...document.querySelectorAll('[data-b]')];

  const finishAll = () => {
    all.forEach((el) => el.classList.add('b-done'));
    root.classList.remove('building');
    for (let p = 1; p <= TOTAL_PAGES; p += 1) onPageBuilt(p);
  };

  if (reduced || !ui) {
    ui?.classList.add('gone');
    finishAll();
    robot?.appearNow();
    return { skip() {} };
  }

  root.classList.add('building');

  const boxesEl = document.getElementById('build-boxes');
  const cursorsEl = document.getElementById('build-cursors');
  const guides = document.getElementById('build-guides');
  const gh = guides.querySelector('.gh');
  const gv = guides.querySelector('.gv');
  const toolbar = document.getElementById('toolbar');
  const statusEl = document.getElementById('build-status');
  const statusText = document.getElementById('build-status-text');
  const skipBtn = document.getElementById('build-skip');

  /* ---------- ops, grouped by page ---------- */
  const pageOf = (el) => {
    if (el.closest('.nav')) return 1;
    const sec = el.closest('[data-page]');
    return sec ? Number(sec.dataset.page) : 8;
  };
  const ops = all.map((el) => ({ el, kind: el.dataset.b, page: pageOf(el), label: el.dataset.bLabel }));
  ops.sort((a, b) => a.page - b.page || (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const pageTotals = {};
  ops.forEach((o) => { pageTotals[o.page] = (pageTotals[o.page] || 0) + 1; });
  const pageDone = {};

  /* ---------- cursors ---------- */
  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;
  const cursors = CURSORS.map((c, i) => {
    const el = document.createElement('div');
    el.className = 'b-cursor';
    el.style.setProperty('--cc', c.color);
    el.innerHTML = `${ARROW}<span class="tag">${c.tag}</span><span class="tool"></span>`;
    cursorsEl.appendChild(el);
    const x = i % 2 ? vw() + 40 : -40;
    const y = rand(vh() * 0.2, vh() * 0.8);
    return { el, idx: i, color: c.color, mode: 'free', toolEl: el.querySelector('.tool'), x, y, tx: rand(vw() * 0.2, vw() * 0.8), ty: rand(vh() * 0.2, vh() * 0.7), busy: false, next: performance.now() + i * 120 };
  });
  const setTool = (c, tool) => {
    if (!c) return;
    c.el.classList.toggle('working', Boolean(tool));
    if (tool) c.toolEl.innerHTML = TOOL_ICON[tool] || '';
  };
  const freeCursor = (x, y) => {
    let best = null;
    let bd = Infinity;
    cursors.forEach((c) => {
      if (c.busy || c.mode !== 'free') return;
      const d = (c.x - x) ** 2 + (c.y - y) ** 2;
      if (d < bd) { bd = d; best = c; }
    });
    if (best) best.busy = true;
    return best;
  };

  /* ---------- boxes ---------- */
  const makeBox = () => {
    const b = document.createElement('div');
    b.className = 'b-box';
    b.innerHTML = '<i></i><i></i><i></i><i></i><span class="b-name"></span><span class="b-size"></span>';
    boxesEl.appendChild(b);
    return { el: b, name: b.querySelector('.b-name'), size: b.querySelector('.b-size') };
  };
  const placeBox = (box, x, y, w, h) => {
    box.el.style.transform = `translate(${x}px, ${y}px)`;
    box.el.style.width = `${Math.max(0, w)}px`;
    box.el.style.height = `${Math.max(0, h)}px`;
  };
  const dropBox = (box) => {
    box.el.classList.add('fading');
    setTimeout(() => box.el.remove(), 380);
  };
  const measure = (fromEl, toEl) => {
    if (!fromEl || !toEl) return;
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const gap = Math.round(b.top - a.bottom);
    if (gap < 6 || gap > 160 || b.top > vh()) return;
    const m = document.createElement('div');
    m.className = 'b-measure';
    m.innerHTML = `<b>${gap} px</b>`;
    m.style.left = `${b.left + Math.min(60, b.width / 2)}px`;
    m.style.top = `${a.bottom + gap / 2}px`;
    boxesEl.appendChild(m);
    setTimeout(() => m.remove(), 700);
  };

  /* ---------- typing helpers: reserve layout, reveal char by char ---------- */
  const prepType = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('.sr-only') || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const parts = [];
    let n;
    while ((n = walker.nextNode())) parts.push(n);
    return parts.map((node) => {
      const text = node.nodeValue;
      const shown = document.createElement('span');
      const rest = document.createElement('span');
      rest.style.cssText = 'color:transparent;-webkit-text-fill-color:transparent';
      rest.textContent = text;
      const frag = document.createDocumentFragment();
      frag.append(shown, rest);
      node.parentNode.replaceChild(frag, node);
      return { text, shown, rest, node };
    });
  };
  const restoreType = (parts) => {
    parts.forEach((p) => {
      if (!p.shown.parentNode) return;
      p.node.nodeValue = p.text;
      p.shown.parentNode.insertBefore(p.node, p.shown);
      p.shown.remove();
      p.rest.remove();
    });
  };

  /* ---------- op runners (each returns a promise) ---------- */
  let lastOpEl = null;
  let speed = 1; // rises when many pieces are waiting on screen

  const complete = (op) => {
    op.el.classList.remove('b-live');
    op.el.classList.add('b-done');
    op.done = true;
    pageDone[op.page] = (pageDone[op.page] || 0) + 1;
    if (pageDone[op.page] === pageTotals[op.page]) onPageBuilt(op.page);
  };

  const runFrame = (op, tool) => new Promise((resolve) => {
    const r0 = op.el.getBoundingClientRect();
    const c = freeCursor(r0.left, r0.top);
    setTool(c, tool);
    toolbarTool(tool);
    const box = makeBox();
    box.name.textContent = op.label || (tool === 'image' ? 'Image' : 'Frame');
    guides.classList.add('on');
    measure(lastOpEl, op.el);
    const t0 = performance.now();
    const GROW = 520 / op.speed;
    const HOLD = 380 / op.speed;
    let shown = false;
    const step = (now) => {
      const r = op.el.getBoundingClientRect();
      const t = now - t0;
      const g = easeOut(clamp01(t / GROW));
      const w = r.width * g;
      const h = r.height * g;
      placeBox(box, r.left, r.top, w, h);
      box.size.textContent = `${Math.round(w)} × ${Math.round(h)}`;
      gh.style.transform = `translateY(${r.top}px)`;
      gv.style.transform = `translateX(${r.left}px)`;
      if (c) { c.tx = r.left + w; c.ty = r.top + h; }
      if (!shown && t > GROW * 0.75) {
        shown = true;
        op.el.classList.add('b-live');
        tick();
      }
      if (t < GROW + HOLD) requestAnimationFrame(step);
      else {
        guides.classList.remove('on');
        dropBox(box);
        setTool(c, null);
        if (c) { c.busy = false; c.next = now + rand(200, 700); }
        complete(op);
        resolve();
      }
    };
    requestAnimationFrame(step);
  });

  const runFade = (op) => new Promise((resolve) => {
    const r0 = op.el.getBoundingClientRect();
    const c = freeCursor(r0.left, r0.top);
    const box = makeBox();
    box.el.classList.add('text-mode');
    box.name.textContent = op.label || '';
    const t0 = performance.now();
    let shown = false;
    const step = (now) => {
      const r = op.el.getBoundingClientRect();
      const t = now - t0;
      placeBox(box, r.left, r.top, r.width, r.height);
      box.size.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
      if (c) { c.tx = r.left + r.width * 0.5; c.ty = r.top + r.height * 0.6; }
      if (!shown && t > 120 / op.speed) {
        shown = true;
        op.el.classList.add('b-live');
        tick();
      }
      if (t < 360 / op.speed) requestAnimationFrame(step);
      else {
        dropBox(box);
        if (c) { c.busy = false; c.next = now + rand(150, 500); }
        complete(op);
        resolve();
      }
    };
    requestAnimationFrame(step);
  });

  const runType = (op) => new Promise((resolve) => {
    const caret = document.createElement('span'); // one caret per lane
    caret.className = 'b-caret';
    op.caret = caret;
    const parts = prepType(op.el);
    op.parts = parts;
    const total = parts.reduce((s, p) => s + p.text.length, 0);
    const display = op.el.matches('.display, .ship, .hero-name, h1, h2');
    const perChar = display ? 62 : total > 90 ? 11 : 26;
    const dur = Math.min(display ? 1400 : 1500, Math.max(260, total * perChar)) / op.speed;
    const r0 = op.el.getBoundingClientRect();
    const c = freeCursor(r0.left, r0.top);
    setTool(c, 'text');
    toolbarTool('text');
    const box = makeBox();
    box.el.classList.add('text-mode');
    box.name.textContent = op.label || '';
    op.el.classList.add('b-live');
    const t0 = performance.now();
    let lastCount = -1;
    const step = (now) => {
      const t = now - t0;
      const count = Math.round(total * clamp01(t / dur));
      if (count !== lastCount) {
        let left = count;
        let caretHost = null;
        parts.forEach((p) => {
          const k = Math.max(0, Math.min(p.text.length, left));
          p.shown.textContent = p.text.slice(0, k);
          p.rest.textContent = p.text.slice(k);
          if (left > 0 || !caretHost) caretHost = p;
          left -= p.text.length;
        });
        if (caretHost) caretHost.shown.after(caret);
        if (count % 3 === 0) tick(true);
        lastCount = count;
      }
      const r = op.el.getBoundingClientRect();
      placeBox(box, r.left - 3, r.top - 3, r.width + 6, r.height + 6);
      box.size.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
      const cr = caret.getBoundingClientRect();
      if (c && cr.width + cr.height > 0) { c.tx = cr.right + 2; c.ty = cr.bottom - 2; }
      if (t < dur + 160 / op.speed) requestAnimationFrame(step);
      else {
        caret.remove();
        restoreType(parts);
        dropBox(box);
        setTool(c, null);
        if (c) { c.busy = false; c.next = now + rand(150, 600); }
        complete(op);
        resolve();
      }
    };
    requestAnimationFrame(step);
  });

  // While a visitor is chatting with Vee, the team stays assembled: pieces
  // appear on their own instead of being built by a cursor.
  const runQuiet = (op) => new Promise((resolve) => {
    op.el.classList.add('b-live');
    tick(true);
    setTimeout(() => { complete(op); resolve(); }, 380);
  });

  /* ---------- the team ⇄ the robot ---------- */
  let releasedAt = -1e9;
  let idleSince = 0;
  const teamHome = () => cursors.some((c) => c.mode !== 'free');
  const allDocked = () => cursors.every((c) => c.mode === 'docked');
  const releaseTeam = (now) => {
    const pos = robot.release();
    cursors.forEach((c) => {
      if (c.mode === 'docked') {
        const p = pos[c.idx];
        c.x = p.x; c.y = p.y;
        c.tx = p.x + rand(-160, 160);
        c.ty = p.y - rand(60, 220);
        c.el.classList.remove('docked');
        c.next = now + rand(220, 420);
      }
      c.mode = 'free';
    });
    releasedAt = now;
  };
  const dock = (c) => {
    c.mode = 'docked';
    c.el.classList.add('docked');
    setTool(c, null);
    robot.attach(c.idx, c.color);
    if (allDocked()) robot.complete();
  };

  const run = (op) => {
    lastOpEl = op.prevEl;
    if (op.quiet) return runQuiet(op);
    if (op.kind === 'type') return runType(op);
    if (op.kind === 'frame') return runFrame(op, 'frame');
    if (op.kind === 'img') return runFrame(op, 'image');
    return runFade(op);
  };

  /* ---------- toolbar + status ---------- */
  const toolSpans = [...toolbar.querySelectorAll('[data-tool]')];
  function toolbarTool(tool) {
    toolSpans.forEach((s) => s.classList.toggle('on', s.dataset.tool === tool));
  }
  const setStatus = (page) => {
    statusText.textContent = `Building page ${page} of ${TOTAL_PAGES}`;
  };

  /* ---------- scheduler ---------- */
  let i = 0;
  let running = 0;
  let finished = false;
  let prevStarted = null;

  const instant = (op) => {
    if (op.done) return;
    op.el.classList.add('b-done');
    op.done = true;
    pageDone[op.page] = (pageDone[op.page] || 0) + 1;
    if (pageDone[op.page] === pageTotals[op.page]) onPageBuilt(op.page);
  };

  // How many upcoming pieces are already on screen? More waiting → more cursors, faster hands.
  const visibleBacklog = () => {
    let n = 0;
    for (let k = i; k < Math.min(ops.length, i + 40); k += 1) {
      const r = ops[k].el.getBoundingClientRect();
      if (r.top < vh() && r.bottom > 0 && r.width + r.height > 0) n += 1;
    }
    return n;
  };

  const pump = () => {
    if (finished) return;
    const backlog = visibleBacklog();
    speed = backlog > 12 ? 3.2 : backlog > 6 ? 2 : backlog > 3 ? 1.35 : 1;
    const lanes = backlog > 12 ? 5 : backlog > 6 ? 4 : backlog > 3 ? 3 : BASE_LANES;
    while (i < ops.length && running < lanes) {
      const op = ops[i];
      const r = op.el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) { instant(op); i += 1; continue; } // hidden at this breakpoint
      if (r.bottom < -40) { instant(op); i += 1; continue; } // already scrolled past
      if (r.top > vh() - 30) break; // wait until the visitor gets there
      op.quiet = Boolean(robot && robot.engaged);
      if (robot && !op.quiet && teamHome()) releaseTeam(performance.now()); // back to work!
      setStatus(op.page);
      toolbar.classList.toggle('on', op.page === 1);
      statusEl.classList.remove('idle');
      op.prevEl = prevStarted;
      op.speed = speed;
      prevStarted = op.el;
      running += 1;
      i += 1;
      run(op).then(() => { running -= 1; });
    }
    if (running > 0) idleSince = 0;
    else if (!idleSince) idleSince = performance.now();
    if (i < ops.length && running === 0) {
      statusEl.classList.add('idle');
      toolbar.classList.remove('on');
      setStatus(ops[i].page);
    }
    if (i >= ops.length && running === 0) done();
  };

  let finishedAt = 0;
  const done = () => {
    if (finished) return;
    finished = true;
    finishedAt = performance.now();
    toolbar.classList.remove('on');
    statusText.textContent = `Built · ${TOTAL_PAGES} of ${TOTAL_PAGES}`;
    root.classList.remove('building');
    if (robot) return; // the team flies home and becomes Vee (see loop)
    cursors.forEach((c) => { c.el.style.opacity = '0'; });
    setTimeout(() => ui.classList.add('gone'), 1400);
  };

  const skip = () => {
    if (finished) return;
    ops.forEach((op) => {
      op.caret?.remove();
      if (op.parts) restoreType(op.parts);
      instant(op);
      op.el.classList.remove('b-live');
    });
    boxesEl.innerHTML = '';
    i = ops.length;
    running = 0;
    done();
  };
  skipBtn.addEventListener('click', skip);

  /* ---------- animation loop (cursors) ---------- */
  let prev = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    pump();
    const gather = robot && (finished || robot.engaged
      || (running === 0 && idleSince && now - idleSince > GATHER_AFTER && now - releasedAt > MIN_OUT));
    const targets = gather ? robot.partTargets() : null;
    cursors.forEach((c) => {
      if (c.mode === 'docked') return;
      if (gather && !c.busy) {
        // fly home in a little spiral and click into place as one of Vee's parts
        c.mode = 'gather';
        const t = targets[c.idx];
        const dx = t.x - c.x;
        const dy = t.y - c.y;
        const d = Math.hypot(dx, dy);
        if (d < 6) { dock(c); return; }
        const swirl = Math.min(d * 0.38, 80) * (c.idx % 2 ? 1 : -1);
        c.tx = t.x + (-dy / d) * swirl;
        c.ty = t.y + (dx / d) * swirl;
        const k = 1 - Math.exp(-dt * 7.5);
        c.x += (c.tx - c.x) * k;
        c.y += (c.ty - c.y) * k;
        c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
        return;
      }
      if (c.mode === 'gather') c.mode = 'free';
      if (!c.busy && now > c.next) {
        // idle: drift near the work, like teammates waiting their turn
        const anchor = prevStarted ? prevStarted.getBoundingClientRect() : { left: vw() / 2, top: vh() / 2, width: 0, height: 0 };
        c.tx = Math.max(20, Math.min(vw() - 40, anchor.left + rand(-260, anchor.width + 260)));
        c.ty = Math.max(70, Math.min(vh() - 90, anchor.top + rand(-140, anchor.height + 180)));
        c.next = now + rand(900, 2200);
      }
      const k = 1 - Math.exp(-dt * (c.busy ? 14 : 3.2));
      c.x += (c.tx - c.x) * k;
      c.y += (c.ty - c.y) * k;
      c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
    });
    if (robot && finished && allDocked()) {
      setTimeout(() => ui.classList.add('gone'), 900);
      return;
    }
    if (!finished || robot || now - finishedAt < 1600) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  return { skip };
}
