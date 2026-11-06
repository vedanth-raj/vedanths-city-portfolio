/* ==========================================================================
   "ENTER ANOTHER WORLD" · the glowing side button that opens game mode
   (city.html, Vedanth's City). Clicking warps the page into a neon tunnel,
   then loads the city. The city's code only downloads when it's opened.
   ========================================================================== */

const PAD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-4 3.6l-.6 5.9A3 3 0 0 0 5.1 18c1 0 1.9-.5 2.5-1.3L9 15h6l1.4 1.7c.6.8 1.5 1.3 2.5 1.3a3 3 0 0 0 3-3.5l-.6-5.9A4 4 0 0 0 17.3 5Z"/></svg>';

export function initPortal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const btn = document.createElement('a');
  btn.href = '/city.html';
  btn.className = 'world-btn';
  btn.setAttribute('aria-label', "Enter another world: drive through Vedanth's City, the game mode of this portfolio");
  btn.innerHTML = `<span class="wb-ring" aria-hidden="true"></span><span class="wb-icon">${PAD}</span><span class="wb-text"><small>New · game mode</small><b>Enter another world</b></span><span class="wb-spark" aria-hidden="true"></span>`;
  document.body.appendChild(btn);

  // a hint in the hero too, so nobody misses it
  const avail = document.querySelector('.hero-left .avail');
  if (avail) {
    const chip = document.createElement('a');
    chip.href = '/city.html';
    chip.className = 'world-chip';
    chip.innerHTML = `${PAD}<span>Drive through my portfolio in <b>Vedanth's City</b></span><em>→</em>`;
    avail.after(chip);
  }

  const warp = document.createElement('div');
  warp.className = 'world-warp';
  warp.innerHTML = '<div class="ww-tunnel"></div><p><small>Loading</small>Vedanth\'s City</p>';
  document.body.appendChild(warp);

  const go = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // new tab: let the browser handle it
    e.preventDefault();
    if (reduced) { location.href = '/city.html'; return; }
    warp.classList.add('on');
    setTimeout(() => { location.href = '/city.html'; }, 900);
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="/city.html"]');
    if (a) go(e);
  });
  // warm the city's files once the visitor shows interest
  const prefetch = () => {
    if (document.querySelector('link[data-city]')) return;
    const l = document.createElement('link');
    l.rel = 'prefetch'; l.href = '/city.html'; l.dataset.city = '1';
    document.head.appendChild(l);
  };
  btn.addEventListener('pointerenter', prefetch, { once: true });
  btn.addEventListener('focus', prefetch, { once: true });
  window.addEventListener('pageshow', () => warp.classList.remove('on')); // back-button from the city
}
