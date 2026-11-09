#!/usr/bin/env node
// Tests for the quote maths. Run: node tools/test-estimate.mjs
// The expected values follow the example prices in js/data/pricing.js: update them when the prices change.

import * as cfg from '../js/data/pricing.js';
import { estimate, recapText } from '../js/pricing/estimate.js';

let failed = 0;
const check = (cond, label) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`);
  if (!cond) failed += 1;
};
const near = (a, b) => Math.abs(a - b) < 1e-6;

const base = {
  items: { assets: 20, designs: 10, levelDesign: 2, coaching: 3 },
  complexity: 'standard', size: 'l', deadline: 'standard', references: [],
};

let r = estimate(base, cfg);
check(r.subtotal === 8650, 'subtotal = 20×180 + 10×120 + 2×950 + 3×650 = 8 650');
check(r.discountRate === 0, 'no volume discount under 10 000');
check(r.nextTier && r.nextTier.missing === 1350 && r.nextTier.rate === 0.05, 'next tier: 1 350 more for 5 %');
check(near(r.total, 11245), 'licence 250–1 000 (×1.3) → 11 245');
check(r.low === 10120 && r.high === 12930, 'range ×0.9 / ×1.15 rounded to 10 → 10 120 – 12 930');
check(r.count === 4, 'four lines in the cart');

r = estimate({ ...base, items: { assets: 100, team: true, followUp: true }, complexity: 'hero', size: 'xl', deadline: 'fast' }, cfg);
check(r.subtotal === 43200 && r.discountRate === 0.1, 'hero assets 100×180×2.4 = 43 200, 10 % tier');
check(near(r.adjusted, 72900), '(43 200 − 4 320) × 1.5 × 1.25 = 72 900');
const team = r.extras.find((e) => e.id === 'team');
const follow = r.extras.find((e) => e.id === 'followUp');
check(team && near(team.amount, 10935), 'dedicated team: 15 % of 72 900 = 10 935');
check(follow && follow.amount === 1440, 'extended follow-up: one-time 1 440');
check(near(r.total, 85275), 'total 85 275');

r = estimate({ items: { followUp: 3, team: 'yes' } }, cfg);
check(r.extras.length === 0, 'one-time services count only when exactly true (not quantities)');

r = estimate({ items: { assets: -5, designs: 'abc', gameDesign: 2.7, levelDesign: 5000 } }, cfg);
check(r.lines.length === 2 && r.lines[0].qty === 2 && r.lines[1].qty === 999, 'negative / text ignored, decimals floored, max 999');
check(estimate({ items: {} }, cfg).total === 0 && estimate({ items: {} }, cfg).nextTier === null, 'empty cart → 0, no hint');

const text = recapText(base, estimate(base, cfg), { company: 'Test', name: 'A', email: 'a@b.c' }, cfg, 'fr', ['Couronne']);
check(text.includes('Société : Test') && text.includes('Couronne'), 'French recap uses narrow no-break spaces and lists models');
check(recapText(base, estimate(base, cfg), {}, cfg, 'en').startsWith('Quote request — Vizion'), 'English recap');

process.exitCode = failed ? 1 : 0;
