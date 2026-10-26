// Site-wide motion: smooth scroll, title reveals, image fades, marquees,
// the hiding nav, Part II stacking cards, and the reflection paragraph fades.
// Runs only when <html> has the `motion` class (JS on, no reduced-motion).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

export const motionEnabled = document.documentElement.classList.contains('motion');
window.__motionReady = true;

const EASE = 'power3.out';

// Things already on screen animate right away; the rest wait to be scrolled to.
const onEnter = (el: Element) =>
  el.getBoundingClientRect().top < window.innerHeight
    ? { delay: 0.15 }
    : { scrollTrigger: { trigger: el, start: 'top 88%', once: true } };

export const lenis = motionEnabled ? new Lenis({ anchors: { offset: -96 } }) : undefined;

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// The landing page holds reveals until its loader has finished.
export const afterLoader = new Promise<void>((resolve) => {
  if (!document.querySelector('[data-loader]')) resolve();
  else window.addEventListener('loader:done', () => resolve(), { once: true });
});

function navHiding() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav || !lenis) return;
  lenis.on('scroll', ({ scroll, direction }: Lenis) => {
    if (document.body.dataset.menuOpen) return;
    nav.classList.toggle('nav-hidden', scroll > 160 && direction === 1);
  });
}

function titleReveals() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      mask: 'words',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.words, {
          yPercent: 110,
          duration: 0.9,
          ease: EASE,
          stagger: 0.07,
          ...onEnter(el),
        });
      },
    });
  });
}

function fadeReveals() {
  // Markdown can't carry attributes, so `data-reveal-children` fades each child instead.
  document.querySelectorAll<HTMLElement>('[data-reveal-children] > *').forEach((el) => {
    el.dataset.reveal = 'fade';
  });

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const fadeOnly = el.dataset.reveal === 'fade';
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: fadeOnly ? 0 : 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: fadeOnly ? 1.4 : 1,
        ease: fadeOnly ? 'power1.out' : EASE,
        ...onEnter(el),
      },
    );
  });

  // Slight slow zoom on hero images while they scroll past.
  document.querySelectorAll<HTMLElement>('[data-zoom]').forEach((el) => {
    gsap.fromTo(
      el,
      { scale: 1.08 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

function marquees() {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((el) => {
    const track = el.querySelector<HTMLElement>('[data-marquee-track]');
    const copy = track?.firstElementChild as HTMLElement | null;
    if (!track || !copy) return;

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = copy.offsetWidth + gap;
    const drift = gsap.to(track, { x: -distance, duration: distance / 35, ease: 'none', repeat: -1 });

    // Speeds up a little while scrolling, then eases back to the slow drift.
    let boost = 1;
    lenis?.on('scroll', ({ velocity }: Lenis) => {
      boost = Math.max(boost, 1 + Math.min(Math.abs(velocity) / 12, 2.5));
    });
    gsap.ticker.add(() => {
      boost += (1 - boost) * 0.06;
      drift.timeScale(boost);
    });
  });
}

function stackingCards() {
  const cards = gsap.utils.toArray<HTMLElement>('[data-stack-card]');
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card.firstElementChild, {
      scale: 0.93,
      opacity: 0.55,
      ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
    });
  });
}

if (motionEnabled) {
  navHiding();
  afterLoader.then(() => {
    titleReveals();
    fadeReveals();
    marquees();
    stackingCards();
    ScrollTrigger.refresh();
  });
}
