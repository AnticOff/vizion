// Load choreography (Web Animations API).

import { $, $$, play } from './env.js';

export function playIntro({ reduced }) {
  document.documentElement.classList.remove('is-loading');
  if (reduced) return;

  // title lines rise out of their masks: 1 s, 110 ms stagger
  $$('[data-title-line] > span').forEach((el, i) =>
    play(el, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }],
      { duration: 1000, delay: i * 110 }));

  // photo rises 40px, un-blurs and fades in over 1.3 s
  play($('[data-hero-photo]'), [
    { transform: 'translateY(40px)', filter: 'blur(14px)', opacity: 0 },
    { transform: 'translateY(0)', filter: 'blur(0px)', opacity: 1 },
  ], { duration: 1300 });

  // nav drops in
  play($('[data-nav]'), [
    { transform: 'translateY(-24px)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 },
  ], { duration: 800 });

  // every other hero element rises 14px and fades in, 55 ms stagger
  $$('[data-rise]').forEach((el, i) =>
    play(el, [{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 800, delay: 150 + i * 55 }));

  // progress line draws in
  $$('[data-draw]').forEach((el) =>
    play(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1200, delay: 600 }));

  // signature line (SVG paths) draws itself, like the line of the logo
  $$('[data-line] path').forEach((path, i) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    play(path, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
      { duration: 1400, delay: 200 + i * 150, easing: 'cubic-bezier(.6,0,.2,1)' });
  });
}
