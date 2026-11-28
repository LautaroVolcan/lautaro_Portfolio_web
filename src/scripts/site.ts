// Small, dependency-free behaviours shared by every page.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Header background once the page scrolls
const header = document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const nav = document.getElementById('site-nav');
toggle?.addEventListener('click', () => {
  const open = nav?.classList.toggle('is-open') ?? false;
  toggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }),
);

// Reveal on scroll
const revealables = document.querySelectorAll<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add('is-in'));
}

// Running timecode in the hero (25 fps)
const tcEl = document.querySelector<HTMLElement>('[data-timecode]');
if (tcEl && !reduceMotion) {
  const start = performance.now();
  const pad = (n: number) => String(n).padStart(2, '0');
  let last = '';
  const tick = (now: number) => {
    const frames = Math.floor(((now - start) / 1000) * 25);
    const f = frames % 25;
    const s = Math.floor(frames / 25) % 60;
    const m = Math.floor(frames / 1500) % 60;
    const h = Math.floor(frames / 90000);
    const text = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
    if (text !== last) tcEl.textContent = last = text;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Copy email
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      const original = btn.textContent;
      btn.textContent = btn.dataset.copied || 'Copied ✓';
      setTimeout(() => (btn.textContent = original), 1800);
    } catch {
      window.location.href = `mailto:${btn.dataset.copy}`;
    }
  });
});

// Project loops: load and play only while hovered (desktop)
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
    const video = card.querySelector<HTMLVideoElement>('[data-card-loop]');
    if (!video) return;
    card.addEventListener('mouseenter', () => {
      video.play().then(() => video.classList.add('is-playing')).catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      video.pause();
      video.classList.remove('is-playing');
    });
  });
}

// --- Liquid gradient behind the hero and Work (home only) ------------------------------------

import { initFluidBackground } from './fluid-bg';

const fluidSections = Array.from(document.querySelectorAll<HTMLElement>('[data-fluid]'));
// @ts-expect-error: not in every TS lib yet
if (fluidSections.length && !navigator.connection?.saveData) {
  // start the WebGL gradient after first paint, so it never delays the hero (the CSS gradient covers until then)
  const start = () => initFluidBackground(fluidSections);
  const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => void) | undefined;
  const later = () => (idle ? idle(start, { timeout: 1200 }) : setTimeout(start, 200));
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
}

// --- Hero card: tilted at rest, faces you on hover, follows the pointer a little --------------

const heroCard = document.querySelector<HTMLElement>('[data-hero-card]');
const heroSection = document.querySelector<HTMLElement>('.hero');
if (heroCard && heroSection && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
  const REST = { x: 5, y: -14 };
  const cur = { x: REST.x, y: REST.y };
  const target = { x: REST.x, y: REST.y };
  let over = false;
  let px = 0, py = 0;
  let raf = 0;
  const update = () => {
    const base = over ? { x: 0, y: 0 } : REST;
    target.x = base.x - py * 6;
    target.y = base.y + px * 8;
    cur.x += (target.x - cur.x) * 0.08;
    cur.y += (target.y - cur.y) * 0.08;
    heroCard.style.setProperty('--rx', `${cur.x.toFixed(2)}deg`);
    heroCard.style.setProperty('--ry', `${cur.y.toFixed(2)}deg`);
    raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.02 ? requestAnimationFrame(update) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(update); };
  heroSection.addEventListener('pointermove', (e) => {
    const r = heroSection.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width - 0.5;
    py = (e.clientY - r.top) / r.height - 0.5;
    kick();
  });
  heroSection.addEventListener('pointerleave', () => { px = 0; py = 0; over = false; kick(); });
  heroCard.addEventListener('pointerenter', () => { over = true; kick(); });
  heroCard.addEventListener('pointerleave', () => { over = false; kick(); });
}

// --- Work tabs: Art / Films / Commercial -------------------------------------------------------

const tablist = document.querySelector<HTMLElement>('[data-work-tabs]');
if (tablist) {
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[data-tab]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-panel]'));
  const select = (id: string, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => {
      p.hidden = p.dataset.panel !== id;
      if (!p.hidden) p.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    });
  };
  tablist.hidden = false;
  document.documentElement.classList.add('has-work-tabs');
  // a link like /#work-films opens that tab
  const fromHash = location.hash.match(/^#work-(\w+)/)?.[1];
  select(tabs.some((t) => t.dataset.tab === fromHash) ? fromHash! : tabs[0].dataset.tab!);
  if (fromHash) document.getElementById('work')?.scrollIntoView();

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      select(t.dataset.tab!);
      history.replaceState(null, '', `#work-${t.dataset.tab}`);
    });
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = tabs[(i + d + tabs.length) % tabs.length];
      select(next.dataset.tab!, true);
    });
  });
}

// --- 3D carousel: loops, arrows, swipe, keys, slow autoplay ------------------------------------

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-item]'));
  const count = root.querySelector<HTMLElement>('[data-count]');
  const n = items.length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  const layout = () => {
    const small = innerWidth < 700;
    const step = small ? 0.62 : 0.78; // horizontal spacing, in item widths
    items.forEach((el, i) => {
      let d = i - current;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const a = Math.abs(d);
      const w = el.offsetWidth || 300;
      el.style.transform =
        `translateX(${-w / 2 + d * w * step}px) translateZ(${-a * (small ? 140 : 220)}px) rotateY(${-Math.sign(d) * Math.min(a, 2) * 24}deg)`;
      el.style.opacity = a > (small ? 1 : 2) ? '0' : a === 0 ? '1' : String(1 - a * 0.25);
      el.style.filter = a === 0 ? 'none' : `brightness(${1 - a * 0.25})`;
      el.style.zIndex = String(20 - a);
      el.classList.toggle('is-current', a === 0);
      el.setAttribute('aria-hidden', String(a !== 0));
    });
    if (count) count.textContent = String(current + 1).padStart(2, '0');
  };
  const go = (to: number) => {
    current = (to + n) % n;
    layout();
  };

  root.querySelector('[data-next]')?.addEventListener('click', () => { go(current + 1); restart(); });
  root.querySelector('[data-prev]')?.addEventListener('click', () => { go(current - 1); restart(); });
  items.forEach((el, i) => el.addEventListener('click', () => { if (i !== current) { go(i); restart(); } }));
  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { go(current + 1); restart(); }
    if (e.key === 'ArrowLeft') { go(current - 1); restart(); }
  });
  let x0: number | null = null;
  root.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  root.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
  });

  // autoplay: one step every 4.5 s, paused while hovered or off-screen
  let timer = 0;
  let visible = true;
  let hovered = false;
  const tick = () => { if (visible && !hovered && !document.hidden) go(current + 1); };
  const restart = () => {
    clearInterval(timer);
    if (!reduce) timer = window.setInterval(tick, 4500);
  };
  root.addEventListener('pointerenter', () => { hovered = true; });
  root.addEventListener('pointerleave', () => { hovered = false; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);

  // images give the items their width: lay out again as they load and on resize
  items.forEach((el) => el.querySelector('img')?.addEventListener('load', layout));
  addEventListener('resize', layout);
  layout();
  restart();
});

// --- language switch: slide the knob, keep the #section, then go ------------------------------

document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]').forEach((a) => {
  a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    a.classList.add('is-switching');
    const url = a.getAttribute('href')! + (location.hash || '');
    setTimeout(() => location.assign(url), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
  });
});


// --- Header: highlight the section in view (home) ---------------------------------------------

const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav]'));
const navSections = navLinks
  .map((a) => document.getElementById(a.dataset.nav!))
  .filter((el): el is HTMLElement => !!el);
if (navSections.length && 'IntersectionObserver' in window) {
  const setActive = (id: string | null) =>
    navLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === id));
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  navSections.forEach((s) => io.observe(s));
  const hero = document.querySelector('.hero');
  if (hero) new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
}

// --- Project pages: reading progress under the header ------------------------------------------

const progress = document.querySelector<HTMLElement>('[data-progress]');
if (progress) {
  let ticking = false;
  const draw = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
  draw();
}

// --- Lightbox: click a project image to see it large; arrows / swipe / Esc ---------------------

const box = document.querySelector<HTMLDialogElement>('[data-lightbox]');
const zoomables = Array.from(document.querySelectorAll<HTMLImageElement>('img[data-zoom]'));
if (box && zoomables.length && typeof box.showModal === 'function') {
  const frame = box.querySelector<HTMLElement>('[data-lightbox-frame]')!;
  const cap = box.querySelector<HTMLElement>('[data-lightbox-cap]')!;
  let at = 0;
  // the largest file in the image's srcset
  const biggest = (img: HTMLImageElement) => {
    const set = (img.getAttribute('srcset') || '')
      .split(',')
      .map((c) => c.trim().split(/\s+/))
      .filter((c) => c[0])
      .map(([url, w]) => ({ url, w: parseInt(w) || 0 }))
      .sort((a, b) => b.w - a.w);
    return set[0]?.url || img.currentSrc || img.src;
  };
  const show = (i: number) => {
    at = (i + zoomables.length) % zoomables.length;
    const src = zoomables[at];
    const img = new Image();
    img.className = 'lightbox__img';
    img.alt = src.alt;
    img.src = biggest(src);
    frame.replaceChildren(img);
    cap.textContent = `${String(at + 1).padStart(2, '0')} / ${String(zoomables.length).padStart(2, '0')}${src.alt ? ' — ' + src.alt : ''}`;
  };
  zoomables.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => { show(i); box.showModal(); });
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); box.showModal(); }
    });
  });
  box.querySelector('[data-lightbox-close]')?.addEventListener('click', () => box.close());
  box.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => show(at - 1));
  box.querySelector('[data-lightbox-next]')?.addEventListener('click', () => show(at + 1));
  box.addEventListener('click', (e) => { if (e.target === box || e.target === frame) box.close(); });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
  });
  let x0: number | null = null;
  box.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  box.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
  });
}
