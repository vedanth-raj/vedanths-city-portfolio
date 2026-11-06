/* ==========================================================================
   BACKGROUND VIDEO (scroll-scrubbed frames) + HERO CUTOUT
   · The 300-frame sequence plays as you scroll, behind everything, blurred
     and faint (drawn at low resolution, so the blur is cheap).
   · In the hero, a static, background-removed portrait (/public/hero-portrait.webp)
     stands in front of the giant word.
   ========================================================================== */

const TOTAL_FRAMES = 300;
const PORTRAIT_URL = '/hero-portrait.webp';
const BG_SCALE = 0.32; // internal resolution of the blurred background canvas

const frameUrl = (i) => `/frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;

export function initBackground() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('home');
  const cutCanvas = document.getElementById('hero-cutout');
  const cutCtx = cutCanvas.getContext('2d');
  const stage = document.querySelector('.bg-stage');
  const supportsCtxFilter = 'filter' in ctx;

  const frames = new Array(TOTAL_FRAMES);

  // The hero portrait first (it's on screen), then the background sequence.
  const portrait = new Image();
  portrait.decoding = 'async';
  portrait.fetchPriority = 'high';
  portrait.src = PORTRAIT_URL;
  portrait.onload = () => { dirty = true; };
  for (let i = 0; i < TOTAL_FRAMES; i += 1) {
    const img = new Image();
    img.decoding = 'async';
    img.src = frameUrl(i);
    img.onload = () => { if (i === 0) dirty = true; };
    frames[i] = img;
  }

  const ready = (img) => img && img.complete && img.naturalWidth > 0;
  const nearest = (list, index) => {
    if (ready(list[index])) return list[index];
    for (let o = 1; o < list.length; o += 1) {
      if (ready(list[index - o])) return list[index - o];
      if (ready(list[index + o])) return list[index + o];
    }
    return null;
  };

  let W = 0;
  let H = 0;
  let heroW = 0;
  let heroH = 0;
  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.max(1, Math.round((W + 80) * BG_SCALE));
    canvas.height = Math.max(1, Math.round((H + 80) * BG_SCALE));
    if (!supportsCtxFilter) canvas.style.setProperty('--bg-filter', 'blur(14px) saturate(0.9) brightness(0.9)');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    heroW = hero.clientWidth;
    heroH = hero.clientHeight;
    cutCanvas.width = Math.round(heroW * dpr);
    cutCanvas.height = Math.round(heroH * dpr);
    cutCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
  };

  let current = 0;
  let target = 0;
  let drawnBg = -1;
  let cutDrawn = false;
  let dirty = true;

  const updateTarget = () => {
    const max = document.documentElement.scrollHeight - H;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    target = p * (TOTAL_FRAMES - 1);

    // Clearer near the top (the hero), fainter and blurrier further down.
    const heroP = Math.min(1, window.scrollY / Math.max(1, heroH * 0.9));
    stage.style.setProperty('--bg-opacity', (0.3 - heroP * 0.13).toFixed(3));
    stage.style.setProperty('--glow', (1 - heroP * 0.5).toFixed(3));
  };

  const cover = (img, cw, ch) => {
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    return [(cw - w) / 2, (ch - h) / 2, w, h];
  };

  const drawBg = (index) => {
    const img = nearest(frames, index);
    if (!img) return;
    const [x, y, w, h] = cover(img, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (supportsCtxFilter) ctx.filter = 'blur(4px)';
    ctx.drawImage(img, x, y, w, h);
    if (supportsCtxFilter) ctx.filter = 'none';
  };

  const textBlock = document.querySelector('.hero-left');
  const drawCut = () => {
    const img = portrait;
    cutCtx.clearRect(0, 0, heroW, heroH);
    if (!ready(img)) return false;
    const ratio = img.naturalWidth / img.naturalHeight;
    let h;
    let y;
    let cx;
    if (heroW < 860) {
      // Phones/tablets: a portrait band between the giant word and the text.
      const bottom = textBlock ? textBlock.getBoundingClientRect().top - hero.getBoundingClientRect().top + 70 : heroH * 0.5;
      h = Math.max(220, bottom - 30);
      y = bottom - h;
      cx = heroW * 0.58;
    } else {
      // Desktop: a portrait that stands from the bottom edge, head under the nav, slightly right of centre.
      h = Math.min(heroH * 0.9, (heroW * 0.44) / (img.naturalWidth / img.naturalHeight));
      y = heroH - h;
      cx = heroW * 0.6;
    }
    const w = h * ratio;
    cutCtx.drawImage(img, cx - w / 2, y, w, h);
    // soft fade at the bottom so the suit melts into the dark
    const fadeFrom = y + h * 0.74;
    const g = cutCtx.createLinearGradient(0, fadeFrom, 0, y + h);
    g.addColorStop(0, 'rgba(5,6,10,0)');
    g.addColorStop(1, 'rgba(5,6,10,1)');
    cutCtx.globalCompositeOperation = 'destination-out';
    cutCtx.fillStyle = g;
    cutCtx.fillRect(0, fadeFrom, heroW, y + h - fadeFrom);
    cutCtx.fillStyle = '#000';
    cutCtx.fillRect(0, y + h, heroW, heroH);
    cutCtx.globalCompositeOperation = 'source-over';
    return true;
  };

  const loop = () => {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.01) current = target;
    const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(current)));
    if (idx !== drawnBg || dirty) { drawBg(idx); drawnBg = idx; }
    if (dirty || !cutDrawn) cutDrawn = drawCut();
    dirty = false;
    requestAnimationFrame(loop);
  };

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', updateTarget, { passive: true });
  resize();
  updateTarget();
  requestAnimationFrame(loop);
}
