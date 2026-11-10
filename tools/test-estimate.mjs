#!/usr/bin/env node
// Tests for the quote maths. Run: node tools/test-estimate.mjs
// The expected values follow the example prices in js/data/pricing.js: update them when the prices change.

import * as cfg from '../js/data/pricing.js';
import { estimate, recapText, sanitizeQuote } from '../js/pricing/estimate.js';

let failed = 0;
const check = (cond, label) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`);
  if (!cond) failed += 1;
};
const near = (a, b) => Math.abs(a - b) < 1e-6;
const price = (id) => cfg.SERVICES.find((s) => s.id === id).price;

check(price('assetsSmall') < price('assetsStandard') && price('assetsStandard') < price('assetsLarge')
  && price('assetsLarge') < price('assetsHero'), 'asset tiers: the bigger and more detailed, the higher the price');
check(price('assetsStandard') >= 40 && price('assetsStandard') <= 50, 'standard 3D asset between €40 and €50');

const base = {
  items: { assetsStandard: 20, designs: 10, levelDesign: 2, coaching: 3 },
  size: 'l', deadline: 'standard', references: [],
};

let r = estimate(base, cfg);
check(r.subtotal === 5950, 'subtotal = 20×45 + 10×120 + 2×950 + 3×650 = 5 950');
check(r.discountRate === 0 && r.nextTier.missing === 4050 && r.nextTier.rate === 0.05, 'no discount yet, 4 050 more for 5 %');
check(near(r.total, 7735), 'licence 250–1 000 (×1.3) → 7 735');
check(r.low === 6960 && r.high === 8900, 'range ×0.9 / ×1.15 rounded to 10 → 6 960 – 8 900');

r = estimate({ items: { assetsSmall: 10, assetsLarge: 2 } }, cfg);
check(r.subtotal === 430 && r.lines.length === 2, 'mixed sizes: 10 small × 25 + 2 large × 90 = 430');

r = estimate({ items: { assetsHero: 100, team: true, followUp: true }, size: 'xl', deadline: 'fast' }, cfg);
check(r.subtotal === 16000 && r.discountRate === 0.05, '100 hero assets × 160 = 16 000, 5 % tier');
check(near(r.adjusted, 28500), '(16 000 − 800) × 1.5 × 1.25 = 28 500');
const team = r.extras.find((e) => e.id === 'team');
const follow = r.extras.find((e) => e.id === 'followUp');
check(team && near(team.amount, 4275) && follow && follow.amount === 1440, 'dedicated team 15 % = 4 275, follow-up 1 440');
check(near(r.total, 34215), 'total 34 215');

r = estimate({ items: { followUp: 3, team: 'yes' } }, cfg);
check(r.extras.length === 0, 'one-time services count only when exactly true');

r = estimate({ items: { assetsSmall: -5, designs: 'abc', gameDesign: 2.7, levelDesign: 5000 } }, cfg);
check(r.lines.length === 2 && r.lines[0].qty === 2 && r.lines[1].qty === 999, 'negative / text ignored, decimals floored, max 999');
check(estimate({ items: {} }, cfg).total === 0 && estimate({ items: {} }, cfg).nextTier === null, 'empty cart → 0, no hint');

// quotes saved by the previous version (one `assets` line + a complexity choice)
let q = sanitizeQuote({ items: { assets: 12, designs: 2 }, complexity: 'hero', size: 'm', references: ['tour', 'nope'] }, cfg, ['tour']);
check(q.items.assetsHero === 12 && !('assets' in q.items) && q.items.designs === 2, 'old quote: 12 hero assets moved to the hero tier');
check(q.size === 'm' && q.deadline === 'standard' && q.references.join() === 'tour', 'old quote: size kept, unknown model dropped');
q = sanitizeQuote({ items: { assets: 3, assetsStandard: 2 } }, cfg);
check(q.items.assetsStandard === 5, 'old quote without complexity: added to the standard tier');
check(sanitizeQuote(null, cfg).size === 's', 'nothing saved → empty quote');

const text = recapText(base, estimate(base, cfg), { company: 'Test', name: 'A', email: 'a@b.c' }, cfg, 'fr', ['Couronne']);
check(text.includes('Société : Test') && text.includes('Assets 3D standard : 20 × 45') && text.includes('Couronne'), 'French recap');
check(recapText(base, estimate(base, cfg), {}, cfg, 'en').includes('Standard 3D assets: 20 × €45'), 'English recap');

process.exitCode = failed ? 1 : 0;
