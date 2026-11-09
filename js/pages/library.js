// Library page: renders the cards and the filters from the catalogue, then loads the 3D
// (three.js is imported lazily so the page intro never waits for it).

import { REDUCED, $, $$ } from '../motion/env.js';
import { initSlidingPill } from '../motion/nav-pill.js';
import { replay } from '../motion/stagger.js';
import { MODELS, CATEGORIES } from '../data/models.js';

const grid = $('[data-model-grid]');
const filters = $('[data-filters]');

// ---------- cards ----------
grid.innerHTML = MODELS.map((m) => `
  <button class="model-card" type="button" data-model="${m.id}" data-category="${m.category}" aria-haspopup="dialog">
    <span class="model-stage" data-view="${m.id}" data-finish="${m.material}"></span>
    <span class="model-meta">
      <span class="model-name">${m.name}</span>
      <span class="model-sub">${CATEGORIES[m.category]}</span>
      <span class="model-sub" data-tris="${m.id}">&nbsp;</span>
      <span class="model-open" aria-hidden="true">↗</span>
    </span>
  </button>`).join('');

// model count in the hero
$$('[data-model-count]').forEach((el) => {
  el.dataset.count = String(MODELS.length);
  el.textContent = String(MODELS.length);
});

// ---------- filters ----------
const counts = MODELS.reduce((acc, m) => ({ ...acc, [m.category]: (acc[m.category] || 0) + 1 }), {});
filters.innerHTML = `<span class="nav-pill" aria-hidden="true"></span>
  <button type="button" data-filter="all" aria-pressed="true">Tous<span class="count" aria-hidden="true">${MODELS.length}</span></button>
  ${Object.entries(CATEGORIES).map(([id, label]) =>
    `<button type="button" data-filter="${id}" aria-pressed="false">${label}<span class="count" aria-hidden="true">${counts[id] || 0}</span></button>`).join('')}`;

const pill = initSlidingPill(filters, { items: 'button' });
$$('button[data-filter]', filters).forEach((btn) => btn.addEventListener('click', () => {
  const key = btn.dataset.filter;
  $$('button[data-filter]', filters).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  pill?.setActive(btn);
  $$('.model-card', grid).forEach((card) => { card.hidden = key !== 'all' && card.dataset.category !== key; });
  replay(grid, { reduced: REDUCED });
}));

// ---------- 3D ----------
const scene = import('../three/library-scene.js')
  .then(({ initLibraryScene }) => initLibraryScene({ reduced: REDUCED }))
  .catch((err) => {
    console.error(err);
    document.documentElement.classList.add('no-webgl');
    return null;
  });

const open = (id, finish) => scene.then((s) => s?.openViewer(id, finish));

grid.addEventListener('click', (e) => {
  const card = e.target.closest('[data-model]');
  if (!card) return;
  open(card.dataset.model, $('[data-view]', card).dataset.finish);
});
$$('[data-open-model]').forEach((btn) => btn.addEventListener('click', () => open(btn.dataset.openModel)));
