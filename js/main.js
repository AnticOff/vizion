// Entry point: wires the motion layers.
//   normal    -> intro on load, scroll-driven drift + word fill, panel reveal on enter
//   ?rec=1    -> whole page captured in one frame: scroll-driven parts run on time
//   reduced   -> no motion, everything filled and counted

import { REC, REDUCED, $, $$, clamp } from './motion/env.js';
import { countUp, resetCounter, showFinal } from './motion/counters.js';
import { createWordFill } from './motion/word-fill.js';
import { initNavPill } from './motion/nav-pill.js';
import { playIntro } from './motion/intro.js';
import { createReveal } from './motion/reveal.js';
import { initStagger } from './motion/stagger.js';

const DRIFT_RATE = 0.12;     // logo drift, x scroll
const REC_DRIFT_PX_S = 6;    // logo drift in ?rec=1, px per second

const fillRoot = $('[data-fill]');
const fill = fillRoot ? createWordFill(fillRoot) : null;
const drift = $('[data-drift]');
const panel = $('[data-trust]');
const lifted = $('[data-awards]');
const reveal = createReveal(panel, { reduced: REDUCED });

initNavPill($('[data-nav]'));
playIntro({ reduced: REDUCED });
initStagger({ reduced: REDUCED, immediate: REC });

if (REDUCED) {
  fill?.paint(1);
  $$('[data-count]').forEach(showFinal);
  reveal(0);
} else {
  $$('[data-count-on="load"]').forEach((el) => countUp(el, 1400));
  $$('[data-count-on="reveal"]').forEach(resetCounter);
  if (REC) runRecorder();
  else runScroll();
}

function setDrift(px) {
  if (drift) drift.style.transform = `translate3d(0, ${px.toFixed(2)}px, 0)`;
}

function runScroll() {
  let ticking = false;
  const frame = () => {
    ticking = false;
    setDrift(scrollY * DRIFT_RATE);
    fill?.paint(fill.scrollProgress());
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();

  if (panel) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { reveal(1400); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(panel);
  }
}

// Timeline (seconds from script start): fill 1.3–4.2, reveal 3.5–5.2, card lift 5.3, slow drift throughout.
function runRecorder() {
  const t0 = performance.now();
  const loop = (now) => {
    const s = (now - t0) / 1000;
    fill?.paint(clamp((s - 1.3) / (4.2 - 1.3)));
    if (s >= 3.5) reveal(1700);
    if (s >= 5.3) lifted?.classList.add('is-lifted');
    setDrift(s * REC_DRIFT_PX_S);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
