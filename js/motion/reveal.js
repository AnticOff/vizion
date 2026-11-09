// Stats panel reveal: counters count up, avatars pop in (scale 0.4 -> 1, staggered).

import { $$, play } from './env.js';
import { countUp } from './counters.js';

export function createReveal(panel, { reduced }) {
  let done = false;

  return function reveal(countDuration = 1400) {
    if (done || !panel) return;
    done = true;
    panel.classList.remove('is-pre');
    $$('[data-count-on="reveal"]', panel).forEach((el) => countUp(el, reduced ? 0 : countDuration));
    if (reduced) return;
    $$('[data-avatar]', panel).forEach((el, i) =>
      play(el, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
        { duration: 600, delay: i * 70, easing: 'cubic-bezier(.3,1.4,.5,1)' }));
  };
}
