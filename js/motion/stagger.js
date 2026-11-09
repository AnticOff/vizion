// Children of [data-stagger].is-pre rise 14px and fade in, 55 ms apart, when the group scrolls in.

import { $$, play } from './env.js';

export function initStagger({ reduced = false, immediate = false } = {}) {
  const groups = $$('[data-stagger]');
  if (!groups.length) return;

  const run = (group) => {
    group.classList.remove('is-pre');
    if (reduced) return;
    [...group.children].forEach((el, i) =>
      play(el, [{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 700, delay: i * 55 }));
  };

  if (reduced || immediate || !('IntersectionObserver' in window)) { groups.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  groups.forEach((g) => io.observe(g));
}

// Replays the entrance on the visible children of a group (used after filtering).
export function replay(group, { reduced = false } = {}) {
  if (reduced || !group) return;
  [...group.children].filter((el) => !el.hidden).forEach((el, i) =>
    play(el, [{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 500, delay: i * 40 }));
}
