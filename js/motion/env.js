// Shared motion environment and helpers.

export const REC = new URLSearchParams(location.search).get('rec') === '1';
export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const EASE = 'cubic-bezier(.2,.7,.1,1)';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// fill: 'backwards' holds the first keyframe during the delay, then releases the
// element so CSS :hover transforms keep working after the intro.
export function play(el, keyframes, options) {
  if (!el) return null;
  return el.animate(keyframes, { easing: EASE, fill: 'backwards', ...options });
}
