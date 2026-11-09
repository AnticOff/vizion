// Pill that slides under the hovered, focused or active item of a segmented control.
// Works for the nav (links, aria-current="page") and for filter bars (buttons, aria-pressed="true").

import { $, $$ } from './env.js';

export function initSlidingPill(root, { items = 'a, button' } = {}) {
  if (!root) return null;
  const pill = $('.nav-pill', root);
  const links = $$(items, root);
  if (!pill || !links.length) return null;
  // no active item (e.g. a page that is not in the nav): the pill stays hidden until hover
  let active = $('[aria-current="page"], [aria-pressed="true"]', root);

  const moveTo = (link) => {
    pill.style.opacity = link ? '1' : '0';
    links.forEach((l) => l.classList.toggle('is-on', l === link));
    if (!link) return;
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => moveTo(link));
    link.addEventListener('focus', () => moveTo(link));
  });
  root.addEventListener('mouseleave', () => moveTo(active));
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) moveTo(active); });
  addEventListener('resize', () => moveTo(active));

  moveTo(active);
  document.fonts?.ready.then(() => moveTo(active)); // widths change once fonts load

  return {
    setActive(link) { active = link; moveTo(link); },
  };
}

// the language switch sits in the nav but is not a page: the pill never goes under it
export const initNavPill = (nav) => initSlidingPill(nav, { items: 'a:not(.lang-switch)' });
