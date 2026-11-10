// Projects page: filters the project cards by role (3D, game design, level design, concept art, VFX).

import { REDUCED, $, $$ } from '../motion/env.js';
import { initSlidingPill } from '../motion/nav-pill.js';
import { replay } from '../motion/stagger.js';

const filters = $('[data-project-filters]');
const grid = $('[data-project-grid]');

if (filters && grid) {
  const cards = $$('.project-card', grid);
  const roles = (card) => card.dataset.roles.split(' ');

  // counts next to each filter
  $$('button[data-filter]', filters).forEach((btn) => {
    const key = btn.dataset.filter;
    const count = key === 'all' ? cards.length : cards.filter((c) => roles(c).includes(key)).length;
    btn.insertAdjacentHTML('beforeend', `<span class="count" aria-hidden="true">${count}</span>`);
  });

  const pill = initSlidingPill(filters, { items: 'button' });
  $$('button[data-filter]', filters).forEach((btn) => btn.addEventListener('click', () => {
    const key = btn.dataset.filter;
    $$('button[data-filter]', filters).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    pill?.setActive(btn);
    cards.forEach((card) => { card.hidden = key !== 'all' && !roles(card).includes(key); });
    replay(grid, { reduced: REDUCED });
  }));
}
