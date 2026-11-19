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
      btn.textContent = 'Copied ✓';
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
if (fluidSections.length && !navigator.connection?.saveData) initFluidBackground(fluidSections);
