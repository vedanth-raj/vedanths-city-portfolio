/* ==========================================================================
   VEDANTH'S CITY · cinematic game mode
   Twelve AI-generated clips (Google Flow, Veo 3.1) played as one drive:
     01–04 intro cutscenes (play by themselves, letterboxed)
     05–11 hold to drive (mouse / touch / Space); release and the car brakes.
           Each district clip ends with a card holding the real content.
     12    the arrival: contact.
   Vedanth's details are part of the film itself: each district's opening frame
   was made with his text on the billboards (Nano Banana), then animated (Veo).
   Titles, captions and the district cards sit on top as overlays, keyed to
   film time, so they freeze when the car stops.
   ========================================================================== */

import { ME, ROLES, AWARDS, LEADERSHIP, COURSEWORK } from '../knowledge.js';
import { CATALOG, byId } from '../catalog.js';
import { CREDS } from '../creds-data.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;

/* Sources. The whole film is downloaded before the drive starts (no streaming
   mid-drive). Desktop gets the 1080p cut: AV1 when the device decodes it in
   hardware, H.264 otherwise. Phones get 720p H.264. */
const phone = coarse && Math.min(screen.width, screen.height) < 600;
let folder = phone ? 'm' : 'hd';
const blobs = {};
const clipUrl = (n) => blobs[n] || `/city/${folder}/${n}.mp4`;
async function pickFolder() {
  if (phone) return;
  try {
    const type = 'video/mp4; codecs="av01.0.08M.08"';
    if (!document.createElement('video').canPlayType(type)) return;
    const info = await navigator.mediaCapabilities?.decodingInfo({ type: 'file', video: { contentType: type, width: 1920, height: 1080, bitrate: 6e6, framerate: 24 } });
    if (info?.supported && info.smooth && info.powerEfficient) folder = 'av1';
  } catch { /* keep H.264 */ }
}

/* ================= the film ================= */
const CHAPTERS = [
  { id: 'intro', label: 'Arrival', color: '#ff3fa4' },
  { id: 'edu', n: '01', label: 'Education', kicker: 'Where it started', color: '#3ee6ff' },
  { id: 'skills', n: '02', label: 'Skills', kicker: 'The toolkit', color: '#ff3fa4' },
  { id: 'projects', n: '03', label: 'Projects', kicker: 'Things that run', color: '#b6ff4a' },
  { id: 'wins', n: '04', label: 'Achievements', kicker: 'Wins & leadership', color: '#ffb547' },
  { id: 'exp', n: '05', label: 'Experience', kicker: 'Where he worked', color: '#a77bff' },
  { id: 'certs', n: '06', label: 'Certifications', kicker: 'Proof on file', color: '#ff9f1a' },
  { id: 'contact', label: 'Contact', color: '#ff3fa4' },
];
// fx = horizontal focus when the frame is cropped (portrait phones)
const SHOTS = [
  { n: '01', ch: 0, cut: true },
  { n: '02', ch: 0, cut: true },
  { n: '03', ch: 0, cut: true, fx: 0.45 },
  { n: '04', ch: 0, cut: true, fx: 0.42 },
  { n: '05', ch: 0, drive: true },
  { n: '06', ch: 1, drive: true, stop: 'edu' },
  { n: '07', ch: 2, drive: true, stop: 'skills' },
  { n: '08', ch: 3, drive: true, stop: 'projects' },
  { n: '09', ch: 4, drive: true, stop: 'wins' },
  { n: '10', ch: 5, drive: true, stop: 'exp' },
  { n: '11', ch: 6, drive: true, stop: 'certs' },
  { n: '12', ch: 7, cut: true, stop: 'contact', stopAt: 2.4, fx: 0.45 },
];
const DUR = 7.93;
const firstShotOf = (ch) => SHOTS.findIndex((s) => s.ch === ch);

/* Vee's line per shot */
const VEE = {
  '01': "Hi, I'm Vee, your co-pilot. Sit back, the intro plays itself.",
  '03': 'That’s Vedanth. Builder, AWS campus leader, drone champion.',
  '05': 'Auto-drive is on, so sit back. Want the wheel? Press A, then hold to drive and let go to brake.',
  '06': 'First stop: NMIMS Hyderabad, where he studies CSE (Data Science).',
  '07': 'Every sign on this street is a tool he has shipped with.',
  '08': 'Every billboard here is one of his projects. The card ahead opens them.',
  '09': 'That trophy? First place at Drone Conquest 2026.',
  '10': 'Five roles so far, from research labs to AWS.',
  '11': 'Each gantry is a certification. The card ahead opens the originals.',
  '12': 'End of the road. He would love to hear from you.',
};

/* ================= world-space titles, keyed to film time ================= */
const FEATURED_PROJECTS = ['recipe', 'face', 'hospital', 'aquaflow', 'litwise', 'anpr', 'sentrix', 'mirage', 'reloop', 'memorytrack', 'dermaegis', 'labpulse', 'smepulse', 'meeting', 'vinyasa'].filter((id) => byId[id]);
const chap = (ch) => CHAPTERS[ch];
const CUES = {
  '01': [{ a: 0.5, b: 7.7, cls: 'mid', z: [-520, 120], h: '<small>Vedanth Raj · portfolio · game mode</small><h1>Vedanth’s <span>City</span></h1><p>A city built from one engineer’s journey</p>' }],
  '02': [{ a: 3.4, b: 7.9, cls: 'lower', h: '<small>Now entering</small><b>Downtown Vedanth’s City</b><i>4+ internships · 15+ systems built · 1 builder</i>' }],
  '03': [{ a: 1.6, b: 7.9, cls: 'name', slide: true, h: `<small>Player one</small><h2>${esc(ME.name)}</h2><p>${esc(ME.title)}</p><p class="dim">AWS Student Builder Campus Leader · NMIMS Hyderabad</p>` }],
  '04': [{ a: 1.4, b: 6.6, cls: 'mid', z: [-380, 140], h: '<h2>Taking the <span>wheel</span></h2><p>From learning to building</p>' }],
  '05': [{ a: 0.05, b: 4.4, cls: 'mid', z: [-380, 160], h: '<h2>The journey <span>begins</span></h2><p>Six districts. One road.</p>' }],
  '06': [{ a: 4.4, b: 7.9, cls: 'lower', h: `<small>District 01</small><b>CGPA ${esc(ME.cgpa.split(' ')[0])} · Class of 2027</b><i>${esc(ME.college)} · ${esc(ME.degree)}</i>` }],
  '07': [{ a: 4.6, b: 7.9, cls: 'lower', h: '<small>District 02</small><b>40+ tools, shipped in real projects</b><i>AWS · Python · React · OpenCV · Bedrock · Next.js</i>' }],
  '08': [{ a: 4.6, b: 7.9, cls: 'lower', h: '<small>District 03</small><b>25 projects, 6 headliners</b><i>Open any of them in the card ahead</i>' }],
  '09': [{ a: 4.6, b: 7.9, cls: 'lower', h: '<small>District 04</small><b>Head of Robotics · Sports Committee</b><i>2 research papers · MIRAGE archived on Zenodo</i>' }],
  '10': [{ a: 4.6, b: 7.9, cls: 'lower', h: '<small>District 05</small><b>Five roles since 2025</b><i>Research → data → web → full-stack → AWS leadership</i>' }],
  '11': [{ a: 4.4, b: 7.9, cls: 'lower', h: '<small>District 06</small><b>12 certificates &amp; badges</b><i>AWS Academy ×3 · Google Cloud · Cisco · Infosys Springboard</i>' }],
};
// chapter title as the car enters each district
SHOTS.forEach((s) => {
  if (!s.stop || s.stop === 'contact') return;
  const c = chap(s.ch);
  (CUES[s.n] ||= []).unshift({ a: 0.15, b: 4.3, cls: 'chapter', z: [-240, 70], tilt: true, accent: c.color, h: `<em>${c.n}</em><small>${esc(c.kicker)}</small><h2>${esc(c.label)}</h2>` });
});

/* ================= DOM ================= */
const body = document.body;
const stage = $('#stage');
const vids = [$('#va'), $('#vb')];
const worldEl = $('#world');
const card = $('#card');
const modal = $('#modal');
const holdEl = $('#hold');
const holdFill = $('#hold-fill');
const speedEl = $('#speed');
const veeEl = $('#vee');
const veeLine = $('#vee-line');
const announce = (t) => { $('#announce').textContent = t; };

vids.forEach((v) => {
  v.volume = 0.55;
  v.muted = true;
  v.disableRemotePlayback = true;
});

/* ================= state ================= */
const st = {
  cur: 0,          // shot index on screen
  act: 0,          // which <video> is on screen
  speed: 0,        // 0..1 film speed (the car's throttle)
  holding: false,
  auto: true, // auto-drive is on by default; hold still works, A or the button turns it off
  sound: false,
  carded: false,
  modal: false,
  started: false,
  switching: false,
  drivenFor: 0,    // seconds the visitor has driven (hides the hint)
  idleFor: 0,
  shownStop: new Set(),
  autoTimer: 0,
};
const V = () => vids[st.act];
const buf = () => vids[1 - st.act];
window.__city = st;

/* ================= sources ================= */
function load(v, i) {
  const src = clipUrl(SHOTS[i].n);
  if (v.dataset.shot !== String(i)) {
    v.dataset.shot = String(i);
    v.src = src;
    v.load();
  }
  setFocus(v, i);
}
function setFocus(v, i) {
  v.style.objectPosition = `${(SHOTS[i].fx ?? 0.5) * 100}% 50%`;
}
const ready = (v) => new Promise((res) => {
  if (v.readyState >= 3) return res();
  const done = () => { v.removeEventListener('canplay', done); res(); };
  v.addEventListener('canplay', done);
  setTimeout(done, 8000);
});

/* ================= world-space cues ================= */
let cueNodes = [];
function buildCues(i) {
  worldEl.textContent = '';
  cueNodes = (CUES[SHOTS[i].n] || []).map((c) => {
    const el = document.createElement('div');
    el.className = `cue ${c.cls}`;
    if (c.accent) el.style.setProperty('--accent', c.accent);
    el.innerHTML = c.h;
    worldEl.appendChild(el);
    return { el, c };
  });
}
function drawCues(t) {
  for (const { el, c } of cueNodes) {
    const p = (t - c.a) / (c.b - c.a);
    if (p < 0 || p > 1) { el.style.opacity = 0; continue; }
    const fin = ease(clamp(p / 0.14, 0, 1));
    const fout = ease(clamp((1 - p) / 0.16, 0, 1));
    el.style.opacity = Math.min(fin, fout);
    const center = c.cls === 'mid';
    const base = center ? 'translate(-50%, -50%) ' : '';
    if (reduced) { el.style.transform = base; continue; }
    if (c.z) {
      const z = lerp(c.z[0], c.z[1], p);
      const tilt = c.tilt ? 'rotateY(11deg) ' : '';
      el.style.transform = `${base}translateZ(${z.toFixed(1)}px) ${tilt}`;
    } else if (c.slide) {
      el.style.transform = `translateX(${((1 - fin) * 60).toFixed(1)}px)`;
    } else {
      el.style.transform = `translateX(${((1 - fin) * -30).toFixed(1)}px)`;
    }
  }
}

/* ================= HUD: rail, minimap, speed ================= */
const rail = $('#rail');
CHAPTERS.forEach((c, ci) => {
  const shots = SHOTS.filter((s) => s.ch === ci).length;
  const b = document.createElement('button');
  b.type = 'button';
  b.style.setProperty('--w', shots);
  b.style.setProperty('--c', c.color);
  b.innerHTML = `<i></i><span>${c.n ? `${c.n} ` : ''}${esc(c.label)}</span>`;
  b.setAttribute('aria-label', `Jump to ${c.label}`);
  b.addEventListener('click', (e) => { e.stopPropagation(); jumpTo(firstShotOf(ci)); });
  rail.appendChild(b);
});
const railBtns = [...rail.children];

const map = $('#map');
map.innerHTML = `<path class="water" d="M110 0 H160 V160 H128 C118 120 132 70 110 0Z"/>
<path class="road" id="map-road" d="M24 132 C40 112 30 96 52 88 S86 92 92 72 S70 46 92 34 S128 32 136 20"/>
<path class="done" id="map-done" d="M24 132 C40 112 30 96 52 88 S86 92 92 72 S70 46 92 34 S128 32 136 20"/>
<g id="map-pins"></g><path class="car" id="map-car" d="M0 -7 L5 6 L0 3 L-5 6Z"/>`;
const road = $('#map-road');
const roadLen = road.getTotalLength();
const done = $('#map-done');
done.style.strokeDasharray = `${roadLen}`;
const DRIVE0 = 4, DRIVEN = 8; // shots 05..12 laid along the road
const pins = $('#map-pins');
for (let k = 1; k <= 7; k++) {
  const ch = k;
  const p = road.getPointAtLength((roadLen * k) / 7);
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 5);
  c.setAttribute('class', 'pin off');
  c.setAttribute('fill', CHAPTERS[ch].color);
  pins.appendChild(c);
}
const car = $('#map-car');

function drawHud(t) {
  const sh = SHOTS[st.cur];
  // rail
  railBtns.forEach((b, ci) => {
    const idx = SHOTS.map((s, i) => (s.ch === ci ? i : -1)).filter((i) => i >= 0);
    const first = idx[0], last = idx[idx.length - 1];
    let p = 0;
    if (st.cur > last) p = 1;
    else if (st.cur >= first) p = (st.cur - first + clamp(t / DUR, 0, 1)) / idx.length;
    b.style.setProperty('--p', `${(p * 100).toFixed(1)}%`);
    if (ci === sh.ch) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
  // minimap
  const prog = clamp((st.cur - DRIVE0 + clamp(t / DUR, 0, 1)) / (DRIVEN - 1), 0, 1);
  const L = prog * roadLen;
  const p = road.getPointAtLength(L);
  const p2 = road.getPointAtLength(Math.min(roadLen, L + 1));
  const ang = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI + 90;
  car.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(0)})`);
  done.style.strokeDashoffset = `${roadLen - L}`;
  [...pins.children].forEach((c, k) => c.classList.toggle('off', prog < (k + 1) / 7 - 0.001));
  // speed
  const driving = sh.drive && !st.carded;
  speedEl.classList.toggle('off', !driving);
  if (driving) {
    const kmh = Math.round(st.speed * 138 + (st.speed > 0.05 ? Math.sin(performance.now() / 260) * 2 : 0));
    speedEl.firstElementChild.textContent = String(Math.max(0, kmh));
  }
}

/* ================= Vee ================= */
let veeTimer = 0;
function vee(line) {
  if (!line) return;
  veeLine.textContent = line;
  veeEl.classList.remove('quiet');
  clearTimeout(veeTimer);
  veeTimer = setTimeout(() => veeEl.classList.add('quiet'), 7000);
}

/* ================= shots ================= */
function enterShot(i, preload = true) {
  st.cur = i;
  const sh = SHOTS[i];
  st.rollTo = sh.drive && !reduced ? 1.1 : 0;
  buildCues(i);
  body.classList.toggle('cutscene', !!sh.cut && i !== 11);
  body.classList.toggle('intro', i < 4);
  stage.style.setProperty('--accent', chap(sh.ch).color);
  vee(VEE[sh.n]);
  if (sh.ch !== (SHOTS[i - 1]?.ch ?? -1)) announce(`${chap(sh.ch).label}`);
  // queue the next clip in the hidden player (after a swap, once the old clip has faded out)
  if (preload && i + 1 < SHOTS.length) load(buf(), i + 1);
  try { history.replaceState(null, '', `#${chap(sh.ch).id}`); } catch { /* file:// or sandbox */ }
}

async function advance() {
  if (st.switching || st.cur + 1 >= SHOTS.length) return;
  await swapTo(st.cur + 1, 'cut');
}

async function swapTo(i, kind = 'cut') {
  st.switching = true;
  const out = V();
  const inn = buf();
  load(inn, i);
  await ready(inn);
  try { inn.currentTime = 0; } catch { /* not seekable yet */ }
  inn.muted = !st.sound;
  inn.playbackRate = 1;
  lastRate = 1;
  const moving = st.speed > 0.05 || SHOTS[i].cut || SHOTS[i].drive;
  if (moving) inn.play().catch(() => {});
  // the transition: a soft cross-dissolve, or a whip with a light flash between districts
  if (!reduced && kind === 'whip') {
    out.classList.add('whip-out');
    const fl = $('#flash');
    fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
  }
  inn.classList.add('on');
  out.classList.remove('on');
  st.act = 1 - st.act;
  enterShot(i, false);
  setTimeout(() => {
    out.pause();
    out.classList.remove('whip-out');
    st.switching = false;
    // keep the pipeline full
    if (i + 1 < SHOTS.length) load(out, i + 1);
  }, 480);
}

async function jumpTo(i) {
  if (i < 0 || i >= SHOTS.length || st.switching) return;
  closeCard(true);
  closeModal();
  st.shownStop.forEach((k) => { if (SHOTS.findIndex((s) => s.stop === k) >= i) st.shownStop.delete(k); });
  st.speed = SHOTS[i].cut || SHOTS[i].drive ? 1 : 0;
  await swapTo(i, 'whip');
}

/* ================= district cards ================= */
const tile = (inner, attrs = '') => `<button type="button" class="tile" ${attrs}>${inner}</button>`;
const CARD = {
  edu: () => ({
    sub: ME.college,
    html: `<div class="facts"><div><b>2027</b><small>Graduating</small></div><div><b>${esc(ME.cgpa.split(' ')[0])}</b><small>CGPA / 10</small></div><div><b>DS</b><small>Data Science major</small></div></div>
      <h3>Degree</h3><p>${esc(ME.degree)}, ${esc(ME.years)}</p>
      <h3>Coursework</h3><div class="chips">${COURSEWORK.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
      <h3>On campus</h3><ul class="list">${LEADERSHIP.slice(1, 5).map((l) => `<li>${md(l)}</li>`).join('')}</ul>`,
  }),
  skills: () => {
    const groups = [
      ['Languages', ['Python', 'JavaScript', 'TypeScript', 'C++', 'SQL', 'Java']],
      ['Cloud (AWS & GCP)', ['Lambda', 'Bedrock', 'API Gateway', 'Cognito', 'DynamoDB', 'S3 & CloudFront', 'CloudFormation', 'CloudWatch', 'EC2 & SNS', 'IAM', 'CDK', 'Google Cloud']],
      ['AI & vision', ['OpenCV', 'YOLO', 'ResNet-50 · MTCNN · Dlib', 'FAISS', 'Tesseract OCR', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'GenAI & LLMs']],
      ['Web & mobile', ['React', 'Next.js', 'Node.js · Express', 'Flask · FastAPI', 'REST APIs', 'Socket.io', 'Tailwind CSS', 'Flutter', 'Firebase', 'MongoDB']],
      ['Data & tools', ['Pandas & NumPy', 'Power BI', 'Matplotlib', 'Git & GitHub', 'Agile / Scrum', 'Vite']],
    ];
    return {
      sub: 'What he builds with, and where he has used it',
      html: groups.map(([g, list]) => `<h3>${esc(g)}</h3><div class="chips">${list.map((s) => `<span>${esc(s)}</span>`).join('')}</div>`).join('') +
        '<a class="more" href="/#stack">See the full stack on the portfolio ↗</a>',
    };
  },
  projects: () => ({
    sub: `${CATALOG.length} projects. The boulevard shows the headliners.`,
    html: `<div class="tiles">${FEATURED_PROJECTS.slice(0, 10).map((id) => { const p = byId[id]; return tile(`<b>${esc(p.title)}</b><small>${esc(p.cat)}</small>`, `data-project="${p.id}"`); }).join('')}</div>
      <a class="more" href="/#work">Open all ${CATALOG.length} projects ↗</a>`,
  }),
  wins: () => {
    const imgs = ['drone-conquest', 'aws-sbg-leader-badge', 'aws-sbg-spark-badge', 'codeit-welcome'].map((id) => CREDS.find((c) => c.id === id)).filter(Boolean);
    return {
      sub: 'Trophies, papers and the people he leads',
      html: `<div class="tiles">${imgs.map((c) => `<button type="button" class="tile img${c.contain ? ' contain' : ''}" data-cred="${c.id}"><img src="/creds/${c.id}-thumb.webp" alt="" loading="lazy" /><span><b>${esc(c.title)}</b><small>${esc(c.issuer)}</small></span></button>`).join('')}</div>
        <h3>Highlights</h3><ul class="list">${AWARDS.map((a) => `<li>${md(a)}</li>`).join('')}</ul>
        <h3>Leadership</h3><ul class="list">${LEADERSHIP.map((a) => `<li>${md(a)}</li>`).join('')}</ul>`,
    };
  },
  exp: () => ({
    sub: `${ROLES.length} roles, newest first`,
    html: `<ol class="timeline">${ROLES.map((r) => `<li><b>${esc(r.org)}</b><small>${esc(r.when)}</small><p><strong>${esc(r.role)}</strong>. ${esc(r.what)}</p></li>`).join('')}</ol>
      <a class="more" href="/#journey">The full journey on the portfolio ↗</a>`,
  }),
  certs: () => {
    const list = CREDS.filter((c) => c.tab === 'certs');
    return {
      sub: `${list.length} certificates and badges. Click one to open it.`,
      html: `<div class="tiles">${list.map((c) => `<button type="button" class="tile img${c.contain ? ' contain' : ''}" data-cred="${c.id}"><img src="/creds/${c.id}-thumb.webp" alt="" loading="lazy" /><span><b>${esc(c.title)}</b><small>${esc(c.issuer)}${c.date ? ` · ${esc(c.date)}` : ''}</small></span></button>`).join('')}</div>`,
    };
  },
  contact: () => ({
    final: true,
    title: 'Let’s build <span>what’s next.</span>',
    kicker: 'Final stop · Contact',
    sub: 'You made it through Vedanth’s City. He is open to internships, freelance work and collaborations.',
    html: `<div class="contact-links">
        <a href="mailto:${esc(ME.email)}">${esc(ME.email)} <small>Email ↗</small></a>
        <a href="${esc(ME.phoneHref)}">${esc(ME.phone)} <small>Call</small></a>
        <a href="${esc(ME.linkedin)}" target="_blank" rel="noopener noreferrer">linkedin.com/in/vedanth-raj <small>LinkedIn ↗</small></a>
        <a href="${esc(ME.github)}" target="_blank" rel="noopener noreferrer">github.com/vedanth-raj <small>GitHub ↗</small></a>
      </div>`,
  }),
};

function openCard(key) {
  const sh = SHOTS[st.cur];
  const c = chap(sh.ch);
  const d = CARD[key]();
  card.style.setProperty('--accent', c.color);
  card.classList.toggle('final', !!d.final);
  $('.card-head', card).innerHTML = `<small>${esc(d.kicker || `District ${c.n} · ${c.kicker}`)}</small><h2 id="card-title">${d.title || `<em>${c.n}</em>${esc(c.label)}`}</h2>${d.sub ? `<p>${esc(d.sub)}</p>` : ''}`;
  $('.card-body', card).innerHTML = d.html;
  $('.card-body', card).scrollTop = 0;
  const last = st.cur === SHOTS.length - 1;
  $('#card-next').innerHTML = last ? '↻ Drive again' : 'Continue driving ▸';
  $('#card-hint').innerHTML = last ? '<a href="/">Back to the portfolio</a>' : 'or hold anywhere';
  card.hidden = false;
  requestAnimationFrame(() => card.classList.add('show'));
  st.carded = true;
  body.classList.add('carded');
  st.holding = false;
  announce(`${c.label}. ${d.sub || ''}`);
  if (st.auto && !last) startAutoCountdown();
}
function closeCard(silent = false) {
  if (!st.carded) return;
  st.carded = false;
  body.classList.remove('carded');
  card.classList.remove('show');
  clearInterval(st.autoTimer);
  setTimeout(() => { if (!st.carded) card.hidden = true; }, 450);
  if (!silent && card.contains(document.activeElement)) document.activeElement.blur();
}
function continueFromCard() {
  if (st.cur === SHOTS.length - 1) { closeCard(); st.shownStop.clear(); jumpTo(0); return; }
  closeCard();
  advance();
}
function startAutoCountdown() {
  let left = 10;
  const hint = $('#card-hint');
  hint.textContent = `Auto-drive continues in ${left}s`;
  clearInterval(st.autoTimer);
  st.autoTimer = setInterval(() => {
    left -= 1;
    if (!st.carded) { clearInterval(st.autoTimer); return; }
    if (left <= 0) { clearInterval(st.autoTimer); continueFromCard(); return; }
    hint.textContent = `Auto-drive continues in ${left}s`;
  }, 1000);
  const stop = () => { clearInterval(st.autoTimer); hint.textContent = 'Auto-drive paused while you read'; };
  card.addEventListener('pointerenter', stop, { once: true });
  card.addEventListener('focusin', stop, { once: true });
  $('.card-body', card).addEventListener('scroll', stop, { once: true });
}
$('#card-next').addEventListener('click', (e) => { e.stopPropagation(); continueFromCard(); });
card.addEventListener('pointerdown', (e) => e.stopPropagation());
card.addEventListener('click', (e) => {
  const p = e.target.closest('[data-project]');
  if (p) { openProject(p.dataset.project); return; }
  const c = e.target.closest('[data-cred]');
  if (c) openCred(c.dataset.cred);
});

/* ================= modal ================= */
let lastFocus = null;
function openModal(html, label) {
  lastFocus = document.activeElement;
  $('.modal-body', modal).innerHTML = html;
  modal.setAttribute('aria-label', label);
  modal.hidden = false;
  st.modal = true;
  st.holding = false;
  $('.modal-x', modal).focus();
}
function closeModal() {
  if (!st.modal) return;
  modal.hidden = true;
  st.modal = false;
  lastFocus?.focus?.();
}
modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('.modal-x')) closeModal(); });
modal.addEventListener('pointerdown', (e) => e.stopPropagation());

function openProject(id) {
  const p = byId[id];
  if (!p) return;
  openModal(`<small class="k">${esc(p.cat)} · ${esc(p.year)}${p.team ? ' · team project' : ''}</small>
    <h2>${esc(p.title)}</h2><p>${esc(p.overview || p.one)}</p>
    ${p.how?.length ? `<h3>How it works</h3><ol>${p.how.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
    ${p.highlights?.length ? `<h3>Highlights</h3><ul>${p.highlights.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${p.stack?.length ? `<h3>Stack</h3><div class="chips">${p.stack.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
    ${p.role ? `<h3>His role</h3><p>${esc(p.role)}</p>` : ''}
    <div class="acts">${p.repo ? `<a class="btn-neon" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">Code on GitHub ↗</a>` : ''}${p.live ? `<a class="btn-ghost" href="${esc(p.live)}" target="_blank" rel="noopener noreferrer">Live site ↗</a>` : ''}<a class="btn-ghost" href="/#project-${esc(p.id)}">Open on the portfolio</a></div>`, p.title);
}
function openCred(id) {
  const c = CREDS.find((x) => x.id === id);
  if (!c) return;
  openModal(`<small class="k">${esc(c.issuer)}${c.date ? ` · ${esc(c.date)}` : ''}</small><h2>${esc(c.title)}</h2>${c.meta ? `<p>${esc(c.meta)}</p>` : ''}
    <img class="doc" src="/creds/${esc(c.id)}.webp" alt="${esc(c.title)}" />
    <div class="acts">${c.verify ? `<a class="btn-neon" href="${esc(c.verify)}" target="_blank" rel="noopener noreferrer">Verify ↗</a>` : ''}${c.pdf ? `<a class="btn-ghost" href="/creds/${esc(c.id)}.pdf" target="_blank" rel="noopener">Original PDF ↗</a>` : ''}</div>`, c.title);
}

/* ================= input: hold to drive ================= */
function press() {
  if (!st.started || st.modal) return;
  if (st.carded) {
    if (st.cur === SHOTS.length - 1) return;
    continueFromCard();
  }
  st.holding = true;
}
function release() { st.holding = false; }

stage.addEventListener('pointerdown', (e) => {
  if (e.button > 0) return;
  if (e.target.closest('.sign.click')) return;
  stage.setPointerCapture?.(e.pointerId);
  press();
});
stage.addEventListener('pointerup', release);
stage.addEventListener('pointercancel', release);
stage.addEventListener('lostpointercapture', release);
stage.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('blur', release);
document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });

const isTyping = () => /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
window.addEventListener('keydown', (e) => {
  if (!st.started || isTyping()) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (st.modal) return;
  const k = e.key.toLowerCase();
  if ((e.code === 'Space' || k === 'w' || k === 'arrowup') && !e.target.closest?.('button, a')) {
    e.preventDefault();
    if (!e.repeat) press();
  } else if (k === 'a') toggleAuto();
  else if (k === 'm') toggleSound();
  else if (k === 'arrowright' || k === 'n') { const ch = SHOTS[st.cur].ch; if (ch < CHAPTERS.length - 1) jumpTo(firstShotOf(ch + 1)); }
  else if (k === 'arrowleft' || k === 'p') { const ch = SHOTS[st.cur].ch; jumpTo(firstShotOf(Math.max(0, st.cur > firstShotOf(ch) ? ch : ch - 1))); }
});
window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (e.code === 'Space' || k === 'w' || k === 'arrowup') release();
});

function toggleAuto(force) {
  st.auto = typeof force === 'boolean' ? force : !st.auto;
  $('#auto').setAttribute('aria-pressed', String(st.auto));
  vee(st.auto ? 'Auto-drive on. I’ll stop at each district for you.' : 'Auto-drive off. Hold to drive.');
  if (st.auto && st.carded && st.cur < SHOTS.length - 1) startAutoCountdown();
}
function toggleSound(force) {
  st.sound = typeof force === 'boolean' ? force : !st.sound;
  vids.forEach((v) => { v.muted = !st.sound; });
  const b = $('#sound');
  b.setAttribute('aria-pressed', String(st.sound));
  b.textContent = st.sound ? '♪ Sound on' : '♪ Sound off';
}
$('#auto').addEventListener('click', (e) => { e.stopPropagation(); toggleAuto(); });
$('#sound').addEventListener('click', (e) => { e.stopPropagation(); toggleSound(); });
$('#skip').addEventListener('click', (e) => { e.stopPropagation(); jumpTo(4); });
document.querySelectorAll('.hud-top, .hud-bottom, .vee').forEach((el) => el.addEventListener('pointerdown', (e) => { if (e.target.closest('button, a')) e.stopPropagation(); }));

/* ================= the loop ================= */
let last = performance.now();
let lastRate = 1;
const RATE_MIN = 0.5;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (st.started) tick(dt);
  requestAnimationFrame(frame);
}

function tick(dt) {
  const sh = SHOTS[st.cur];
  const v = V();
  const rolling = sh.stopAt && st.carded; // the final scene plays on behind the contact card
  const blocked = (st.carded && !rolling) || st.modal || st.switching;
  // each district: the car rolls in for a moment, then waits for the visitor
  if (st.rollTo && (v.currentTime || 0) >= st.rollTo) st.rollTo = 0;
  const want = blocked ? 0 : (sh.cut || st.rollTo || st.holding || st.auto) ? 1 : 0;
  // throttle and brake. The film never crawls below half speed (a 24 fps clip
  // at very low rates shows the same frame for ages and looks frozen): it eases
  // between 0.5× and 1×, then stops cleanly on a frame.
  const k = want > st.speed ? 4.2 : 7.5;
  st.speed += (want - st.speed) * (1 - Math.exp(-k * dt));
  if (want === 0 && st.speed < 0.1) st.speed = 0;
  if (want === 1 && st.speed > 0.97) st.speed = 1;

  if (!st.switching) {
    if (st.speed > 0) {
      const rate = st.speed === 1 ? 1 : RATE_MIN + (1 - RATE_MIN) * st.speed;
      if (Math.abs(rate - lastRate) > 0.04 || (rate === 1 && lastRate !== 1)) { v.playbackRate = rate; lastRate = rate; }
      if (v.paused && !v.ended) v.play().catch(() => {});
    } else if (!v.paused) {
      v.pause();
    }
  }

  const t = v.currentTime || 0;
  drawCues(t);
  drawHud(t);

  // the district stop, or the cut to the next clip
  const dur = v.duration || DUR;
  if (!st.switching && !st.carded) {
    const stopAt = sh.stopAt ?? dur - 0.09;
    if (sh.stop && !st.shownStop.has(sh.stop) && t >= stopAt) {
      st.shownStop.add(sh.stop);
      openCard(sh.stop);
      if (!sh.stopAt) { st.speed = 0; v.pause(); }
    } else if (t >= dur - 0.06 || v.ended) {
      if (st.cur < SHOTS.length - 1) advance();
    }
  }

  // hold hint
  const moving = st.speed > 0.08;
  if (moving && sh.drive) st.drivenFor += dt;
  st.idleFor = moving ? 0 : st.idleFor + dt;
  const showHint = sh.drive && !st.carded && !st.modal && !st.auto && !st.holding && (st.drivenFor < 2.5 || st.idleFor > 3.5);
  holdEl.classList.toggle('show', showHint);
  holdFill.style.strokeDashoffset = String(119.4 * (1 - st.speed));
  body.classList.toggle('driving', st.holding);
}

/* ================= boot ================= */
const loadBar = $('#load-bar');
const loadMsg = $('#load-msg');
function setLoad(p, msg) {
  loadBar.style.width = `${Math.round(p * 100)}%`;
  loadBar.parentElement.setAttribute('aria-valuenow', String(Math.round(p * 100)));
  if (msg) loadMsg.textContent = msg;
}

function startAt() {
  const id = location.hash.slice(1);
  const ci = CHAPTERS.findIndex((c) => c.id === id);
  return ci > 0 ? firstShotOf(ci) : 0;
}

/* download every clip into memory first, with real progress */
async function preloadAll() {
  const files = SHOTS.map((s) => ({ n: s.n, url: `/city/${folder}/${s.n}.mp4`, got: 0, total: 0 }));
  const msgs = ['Fuelling the car…', 'Switching on the neon…', 'Painting the sunset…', 'Polishing the billboards…', 'Almost there…'];
  // learn every file's size up front, so the percentage is exact from the start
  await Promise.all(files.map((f) => fetch(f.url, { method: 'HEAD' })
    .then((r) => { f.size = Number(r.headers.get('content-length')) || 0; })
    .catch(() => {})));
  const show = () => {
    const got = files.reduce((a, f) => a + f.got, 0);
    const sized = files.filter((f) => f.size || f.total);
    const avg = sized.length ? sized.reduce((a, f) => a + (f.size || f.total), 0) / sized.length : 0;
    const all = files.reduce((a, f) => a + (f.size || f.total || avg), 0);
    const p = all ? clamp(got / all, 0, 0.99) : 0;
    setLoad(p, `${msgs[Math.min(msgs.length - 1, Math.floor(p * msgs.length))]} ${Math.floor(p * 100)}%`);
  };
  const one = async (f) => {
    const res = await fetch(f.url);
    if (!res.ok || !res.body) throw new Error(`${f.url} ${res.status}`);
    f.total = Number(res.headers.get('content-length')) || 0;
    const reader = res.body.getReader();
    const parts = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      f.got += value.length;
      show();
    }
    blobs[f.n] = URL.createObjectURL(new Blob(parts, { type: 'video/mp4' }));
  };
  // three at a time
  const queue = [...files];
  await Promise.all([0, 1, 2].map(async () => { while (queue.length) await one(queue.shift()); }));
}

async function boot() {
  const i0 = startAt();
  st.cur = i0;
  await pickFolder();
  try {
    await preloadAll();
  } catch {
    // if a download fails, fall back to streaming rather than blocking the visitor
    Object.keys(blobs).forEach((k) => delete blobs[k]);
  }
  load(vids[0], i0);
  vids[0].classList.add('on');
  await Promise.all([ready(vids[0]), document.fonts.ready.catch(() => {})]);
  if (i0 + 1 < SHOTS.length) { load(vids[1], i0 + 1); await ready(vids[1]); }
  setLoad(1, 'The city is fully loaded. Ready when you are.');
  $('#start').hidden = false;
  $('#start-quiet').hidden = false;
  $('#start').focus();
  if (coarse && window.innerHeight > window.innerWidth) $('#rotate').hidden = false;
}

function go(sound) {
  if (st.started) return;
  toggleSound(sound);
  body.dataset.phase = 'play';
  st.started = true;
  enterShot(st.cur);
  st.speed = SHOTS[st.cur].cut ? 1 : 0;
  if (st.speed) V().play().catch(() => {});
  stage.tabIndex = -1;
}
$('#start').addEventListener('click', () => go(true));
$('#start-quiet').addEventListener('click', () => go(false));

vids.forEach((v) => v.addEventListener('error', () => {
  if (v !== V()) return;
  loadMsg.textContent = 'The city could not load. Check your connection, or open the classic portfolio.';
  vee('The film did not load. The classic portfolio has everything too.');
}));

window.addEventListener('hashchange', () => {
  const ci = CHAPTERS.findIndex((c) => c.id === location.hash.slice(1));
  if (st.started && ci >= 0 && ci !== SHOTS[st.cur].ch) jumpTo(firstShotOf(ci));
});
requestAnimationFrame(frame);
boot();

// debug hook for testing/screenshots
window.__jump = jumpTo;
