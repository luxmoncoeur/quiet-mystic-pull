// Landing page: runs the loader, then starts the 3D hallway where it makes
// sense (wide screen, motion allowed, WebGL works). Everywhere else the flat
// swipe row of the same frames stays visible.
import gsap from 'gsap';
import { lenis, motionEnabled } from './motion';
import type { Frame } from './hallway';

const html = document.documentElement;
const loaderEl = document.querySelector<HTMLElement>('[data-loader]');
const section = document.querySelector<HTMLElement>('[data-entrance]')!;
const canvas = section.querySelector<HTMLCanvasElement>('[data-hallway-canvas]')!;
const labelsWrap = section.querySelector<HTMLElement>('[data-hallway-labels]')!;
const hero = section.querySelector<HTMLElement>('[data-hero]')!;
const finale = section.querySelector<HTMLElement>('[data-hallway-finale]')!;
const data = JSON.parse(section.querySelector('[data-hallway-data]')!.textContent!) as {
  frames: Frame[];
  title: string;
  subtitle: string;
  tagline: string;
};

function webglAvailable() {
  try {
    const test = document.createElement('canvas');
    return Boolean(test.getContext('webgl2') || test.getContext('webgl'));
  } catch {
    return false;
  }
}

// Phones get the 3D too (at a lighter quality, see hallway.ts); reduced motion or
// no WebGL get the flat row.
const use3D = motionEnabled && webglAvailable();

// "Skip the walkthrough →" jumps straight past the hallway.
document.querySelectorAll<HTMLAnchorElement>('[data-skip-walkthrough]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector<HTMLElement>(link.hash);
    if (!target || !lenis) return;
    e.preventDefault();
    lenis.scrollTo(target, { immediate: true, offset: -96 });
  });
});

// --- Loader ---
let target = 0; // real progress, 0..1
let shown = 0; // what the counter displays
const startedAt = performance.now();
const MIN_TIME = 1600;

function runLoader() {
  return new Promise<void>((resolve) => {
    if (!loaderEl || !motionEnabled) return resolve();

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    lenis?.stop();

    const percent = loaderEl.querySelector<HTMLElement>('[data-loader-percent]')!;
    const needle = loaderEl.querySelector<SVGElement>('[data-loader-needle]')!;
    const spin = gsap.to(needle, { rotation: '+=360', duration: 1.8, ease: 'none', repeat: -1, svgOrigin: '50 50' });

    const tick = () => {
      // Never faster than MIN_TIME, never ahead of the real progress.
      const goal = Math.min(target, (performance.now() - startedAt) / MIN_TIME);
      shown += (goal - shown) * 0.1;
      if (goal >= 1 && shown > 0.995) shown = 1;
      percent.textContent = `${Math.round(shown * 100)}%`;
      if (shown < 1) return;

      gsap.ticker.remove(tick);
      spin.kill();
      // The needle settles pointing north, then the screen fades away.
      const rotation = Number(gsap.getProperty(needle, 'rotation'));
      gsap
        .timeline({
          onComplete: () => {
            loaderEl.remove();
            lenis?.start();
            resolve();
          },
        })
        .to(needle, { rotation: Math.ceil(rotation / 360) * 360 + 360, duration: 1.4, ease: 'power3.out', svgOrigin: '50 50' })
        .to(loaderEl, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.2');
    };
    gsap.ticker.add(tick);
  });
}

async function start() {
  const loaderDone = runLoader();

  // Safety net: never leave the loader up for long.
  const giveUp = setTimeout(() => (target = 1), 12000);

  if (use3D) {
    try {
      const { createHallway } = await import('./hallway');
      html.classList.add('hallway-3d');
      await createHallway({
        section,
        canvas,
        labels: [...labelsWrap.querySelectorAll<HTMLElement>('[data-hallway-label]')],
        hero,
        finale,
        ...data,
        onProgress: (fraction) => (target = Math.max(target, fraction)),
      });
    } catch (error) {
      console.error('Hallway failed, showing the flat row instead.', error);
      html.classList.remove('hallway-3d');
    }
  } else if (document.readyState !== 'complete') {
    await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  }

  target = 1;
  clearTimeout(giveUp);
  await loaderDone;
  window.dispatchEvent(new Event('loader:done'));
}

start();
