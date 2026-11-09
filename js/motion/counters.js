// Count-up numbers. Markup: <span data-count="120" data-suffix="K+">120K+</span>
// The HTML keeps the final text so the value is right without JS.

import { clamp } from './env.js';

const format = (el, value) => value + (el.dataset.suffix || '');

export function resetCounter(el) {
  el.textContent = format(el, 0);
}

export function showFinal(el) {
  el.textContent = format(el, parseFloat(el.dataset.count) || 0);
}

export function countUp(el, duration) {
  const end = parseFloat(el.dataset.count) || 0;
  if (duration <= 0) { showFinal(el); return; }
  const start = performance.now();
  const tick = (now) => {
    const p = clamp((now - start) / duration);
    el.textContent = format(el, Math.round(end * (1 - Math.pow(1 - p, 3)))); // ease-out cubic
    if (p < 1) requestAnimationFrame(tick);
  };
  resetCounter(el);
  requestAnimationFrame(tick);
}
