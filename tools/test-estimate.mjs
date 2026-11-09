#!/usr/bin/env node
// Tests for the quote maths. Run: node tools/test-estimate.mjs
// The expected values follow the example prices in js/data/pricing.js: update them when the prices change.

import * as cfg from '../js/data/pricing.js';
import { estimate } from '../js/pricing/estimate.js';

let failed = 0;
const check = (cond, label) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`);
  if (!cond) failed += 1;
};
const near = (a, b) => Math.abs(a - b) < 1e-6;

const base = {
  quantities: { assets: 20, designs: 10, levelDesign: 2, coaching: 3 },
  complexity: 'standard', size: 'l', deadline: 'standard', dedicatedTeam: false, supportMonths: 0,
};

let r = estimate(base, cfg);
check(r.subtotal === 8650, 'subtotal = 20×180 + 10×120 + 2×950 + 3×650 = 8 650');
check(r.discountRate === 0, 'no volume discount under 10 000');
check(near(r.total, 11245), 'licence 250–1 000 (×1.3) → 11 245');
check(r.low === 10120 && r.high === 12930, 'range ×0.9 / ×1.15 rounded to 10 → 10 120 – 12 930');

r = estimate({ ...base, quantities: { assets: 100 }, complexity: 'hero', size: 'xl', deadline: 'fast', dedicatedTeam: true, supportMonths: 6 }, cfg);
check(r.subtotal === 43200 && r.discountRate === 0.1, 'hero assets 100×180×2.4 = 43 200, 10 % tier');
check(near(r.adjusted, 72900), '(43 200 − 4 320) × 1.5 × 1.25 = 72 900');
check(near(r.team, 10935) && r.support === 1440, 'dedicated team 15 % = 10 935, support 6 × 240 = 1 440');
check(near(r.total, 85275), 'total 85 275');

r = estimate({ quantities: { assets: -5, designs: 'abc', gameDesign: 2.7 } }, cfg);
check(r.lines.length === 1 && r.lines[0].qty === 2, 'negative / non-numeric quantities ignored, decimals floored');
check(estimate({ quantities: {} }, cfg).total === 0, 'nothing selected → 0');

process.exitCode = failed ? 1 : 0;
