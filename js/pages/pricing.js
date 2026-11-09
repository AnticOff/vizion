// Pricing page: plans, unit prices and the custom quote configurator, all read from js/data/pricing.js.

import { REDUCED, $, $$, clamp } from '../motion/env.js';
import { initSlidingPill } from '../motion/nav-pill.js';
import * as cfg from '../data/pricing.js';
import { estimate, recapText, formatEuros, formatCoef, formatRate } from '../pricing/estimate.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- plans ----------
$('[data-plans]').innerHTML = cfg.PLANS.map((p) => `
  <article class="plan${p.featured ? ' plan--red' : ''}">
    <h3 class="plan-name">${esc(p.name)}</h3>
    <p class="plan-for">${esc(p.audience)}</p>
    <p class="plan-price">
      ${p.from == null
        ? `<span class="amount amount--text">Sur mesure</span>`
        : `<span class="from">à partir de</span><span class="amount">${formatEuros(p.from)}</span><span class="unit">HT ${esc(p.unit)}</span>`}
    </p>
    <ul class="plan-features">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    <a class="btn" href="${esc(p.cta.href)}">${esc(p.cta.label)} <span class="arrow" aria-hidden="true">↗</span></a>
  </article>`).join('');

// ---------- unit prices ----------
$('[data-price-rows]').innerHTML = cfg.SERVICES.map((s) => `
  <tr>
    <th scope="row">${esc(s.label)}<span class="row-detail">${esc(s.detail)}</span></th>
    <td>${esc(s.unit)}</td>
    <td>${formatEuros(s.price)}</td>
  </tr>`).join('');

// ---------- configurator ----------
const form = $('[data-quote]');
const DEFAULT_QTY = { assets: 20, designs: 10, levelDesign: 2, coaching: 3 }; // example configuration

const radioGroup = (name, items, checkedId, labelKey = 'label') => `
  <span class="nav-pill" aria-hidden="true"></span>
  ${items.map((it) => `
    <input type="radio" name="${name}" id="${name}-${it.id}" value="${it.id}"${it.id === checkedId ? ' checked' : ''}>
    <label for="${name}-${it.id}">${esc(it[labelKey])}</label>`).join('')}`;

$('[data-radios="size"]').innerHTML = radioGroup('size', cfg.COMPANY_SIZES, 'l', 'short');
$('[data-radios="complexity"]').innerHTML = radioGroup('complexity', cfg.ASSET_COMPLEXITY, 'standard');
$('[data-radios="deadline"]').innerHTML = radioGroup('deadline', cfg.DEADLINES, 'standard');

$('[data-services]').innerHTML = cfg.SERVICES.map((s) => `
  <div class="qrow">
    <label class="qrow-label" for="qty-${s.id}">
      <strong>${esc(s.label)}</strong>
      <small>${formatEuros(s.price)} ${esc(s.unit)}</small>
    </label>
    <div class="stepper">
      <button type="button" data-step="-1" data-target="qty-${s.id}" aria-label="Diminuer : ${esc(s.label)}">−</button>
      <input type="number" id="qty-${s.id}" name="qty-${s.id}" data-service="${s.id}" inputmode="numeric" min="0" max="999" step="1" value="${DEFAULT_QTY[s.id] || 0}">
      <button type="button" data-step="1" data-target="qty-${s.id}" aria-label="Augmenter : ${esc(s.label)}">+</button>
    </div>
    <span class="qrow-unit">${esc(s.qtyLabel)}</span>
  </div>`).join('');

$('[data-support]').innerHTML = cfg.OPTIONS.extendedSupport.months.map((m) =>
  `<option value="${m}">${m ? `${m} mois (${formatEuros(m * cfg.OPTIONS.extendedSupport.perMonth)})` : 'Aucun'}</option>`).join('');
$('[data-team-rate]').textContent = `+${formatRate(cfg.OPTIONS.dedicatedTeam.rate)}`;

// sliding pills on the radio groups
$$('[data-radios]').forEach((group) => {
  const pill = initSlidingPill(group, { items: 'label' });
  const sync = () => {
    const checked = $('input:checked', group);
    if (checked && pill) pill.setActive($(`label[for="${checked.id}"]`, group));
  };
  group.addEventListener('change', sync);
  sync();
  document.fonts?.ready.then(sync);
});

// steppers
form.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-step]');
  if (!btn) return;
  const input = $(`#${btn.dataset.target}`);
  input.value = String(clamp((parseInt(input.value, 10) || 0) + Number(btn.dataset.step), 0, 999));
  input.dispatchEvent(new Event('input', { bubbles: true }));
});

function readInput() {
  const data = new FormData(form);
  const quantities = {};
  $$('[data-service]', form).forEach((el) => { quantities[el.dataset.service] = parseInt(el.value, 10) || 0; });
  return {
    quantities,
    size: data.get('size'),
    complexity: data.get('complexity'),
    deadline: data.get('deadline'),
    dedicatedTeam: data.get('team') === 'on',
    supportMonths: Number(data.get('support')) || 0,
  };
}

function readContact() {
  const data = new FormData(form);
  return {
    company: String(data.get('company') || '').trim(),
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    message: String(data.get('message') || '').trim(),
  };
}

// ---------- summary ----------
const out = {
  low: $('[data-sum="low"]'),
  high: $('[data-sum="high"]'),
  lines: $('[data-sum="lines"]'),
};
const shown = { low: 0, high: 0 };

function tween(key, to) {
  const from = shown[key];
  shown[key] = to;
  if (REDUCED || from === to) { out[key].textContent = formatEuros(to); return; }
  const start = performance.now();
  const step = (now) => {
    const p = clamp((now - start) / 450);
    out[key].textContent = formatEuros(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1 && shown[key] === to) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function render() {
  const r = estimate(readInput(), cfg);
  tween('low', r.low);
  tween('high', r.high);
  const rows = r.lines.map((l) => [`${l.label} <small>${l.qty} ${esc(l.qtyLabel)}</small>`, formatEuros(l.amount)]);
  if (!rows.length) rows.push(['Aucune prestation choisie', '—']);
  rows.push(['Sous-total', formatEuros(r.subtotal)]);
  if (r.discountRate) rows.push([`Remise volume ${formatRate(r.discountRate)}`, `−${formatEuros(r.discount)}`]);
  rows.push([`Licence ${esc(r.size.short)} salariés`, formatCoef(r.size.coef)]);
  rows.push([`Délai ${esc(r.deadline.label.toLowerCase())}`, formatCoef(r.deadline.coef)]);
  if (r.team) rows.push(['Équipe dédiée', formatEuros(r.team)]);
  if (r.support) rows.push([`Suivi prolongé ${r.supportMonths} mois`, formatEuros(r.support)]);
  out.lines.innerHTML = rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
  return r;
}

form.addEventListener('input', render);
form.addEventListener('change', render);
render();

// ---------- send / copy ----------
const status = $('[data-quote-status]');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const contact = readContact();
  const body = recapText(readInput(), estimate(readInput(), cfg), contact);
  const subject = `Demande de devis — ${contact.company}`;
  location.href = `mailto:${cfg.CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = 'Votre messagerie s’ouvre avec la demande pré-remplie.';
});

$('[data-copy]').addEventListener('click', async () => {
  const text = recapText(readInput(), estimate(readInput(), cfg), readContact());
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Récapitulatif copié.';
  } catch {
    status.textContent = 'Copie impossible dans ce navigateur : utilisez « Envoyer la demande ».';
  }
});
