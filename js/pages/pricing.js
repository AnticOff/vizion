// Pricing page: plans, unit price table and the quote cart, all read from js/data/pricing.js.
// The cart state lives in localStorage (js/quote-store.js) so the library can add models to it.

import { REDUCED, $, $$, clamp } from '../motion/env.js';
import { initSlidingPill } from '../motion/nav-pill.js';
import { LANG, t } from '../i18n.js';
import * as cfg from '../data/pricing.js';
import { MODELS } from '../data/models.js';
import { estimate, recapText, formatters, sanitizeQty } from '../pricing/estimate.js';
import { loadQuote, saveQuote, clearQuote, emptyQuote } from '../quote-store.js';

const f = formatters(LANG);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svc = (id) => cfg.SERVICES.find((s) => s.id === id);

const S = {
  en: {
    add: 'Add', remove: 'Remove', inQuote: 'In your quote',
    removeAria: (n) => `Remove ${n} from the quote`, dec: (n) => `One less: ${n}`, inc: (n) => `One more: ${n}`, qty: (n) => `Quantity: ${n}`,
    perUnit: 'Billed per unit', once: 'One-time options', complexity: 'Asset complexity',
    from: 'from', exclVat: 'excl. VAT', custom: 'Custom', ofTotal: 'of the total',
    count: (n) => (n === 1 ? '1 service' : `${n} services`),
    subtotal: 'Subtotal', discount: 'Volume discount', licence: (s) => `Licence, ${s} employees`, deadline: (d) => `${d} deadline`,
    models: 'Models from the library', unref: (n) => `Remove the reference ${n}`,
    hint: (a, r) => `Add ${a} more to unlock ${r} off.`, hintTop: (r) => `${r} volume discount applied.`,
    teamNote: 'Applies to the services in your quote.',
    sent: 'Your mail app is opening with the quote filled in.', empty: 'Add at least one service to your quote first.',
    copied: 'Summary copied.', copyFail: 'Copy is blocked in this browser: use “Request this quote”.', cleared: 'Your quote is empty again.',
    subject: (c) => `Quote request — ${c}`, bar: (n, total) => `${n} · ${total}`,
  },
  fr: {
    add: 'Ajouter', remove: 'Retirer', inQuote: 'Dans votre devis',
    removeAria: (n) => `Retirer ${n} du devis`, dec: (n) => `Un de moins : ${n}`, inc: (n) => `Un de plus : ${n}`, qty: (n) => `Quantité : ${n}`,
    perUnit: 'À l’unité', once: 'Options uniques', complexity: 'Complexité des assets',
    from: 'à partir de', exclVat: 'HT', custom: 'Sur mesure', ofTotal: 'du total',
    count: (n) => (n === 1 ? '1 prestation' : `${n} prestations`),
    subtotal: 'Sous-total', discount: 'Remise volume', licence: (s) => `Licence ${s} salariés`, deadline: (d) => `Délai ${d.toLowerCase()}`,
    models: 'Modèles de la bibliothèque', unref: (n) => `Retirer la référence ${n}`,
    hint: (a, r) => `Encore ${a} pour obtenir ${r} de remise.`, hintTop: (r) => `Remise volume de ${r} appliquée.`,
    teamNote: 'S’applique aux prestations de votre devis.',
    sent: 'Votre messagerie s’ouvre avec la demande pré-remplie.', empty: 'Ajoutez d’abord au moins une prestation à votre devis.',
    copied: 'Récapitulatif copié.', copyFail: 'Copie bloquée par ce navigateur : utilisez « Envoyer la demande ».', cleared: 'Votre devis est de nouveau vide.',
    subject: (c) => `Demande de devis — ${c}`, bar: (n, total) => `${n} · ${total}`,
  },
}[LANG];

// ---------- plans ----------
$('[data-plans]').innerHTML = cfg.PLANS.map((p) => `
  <article class="plan${p.featured ? ' plan--red' : ''}">
    <h3 class="plan-name">${esc(t(p.name))}</h3>
    <p class="plan-for">${esc(t(p.audience))}</p>
    <p class="plan-price">
      ${p.from == null
        ? `<span class="amount amount--text">${S.custom}</span>`
        : `<span class="from">${S.from}</span><span class="amount">${f.euros(p.from)}</span><span class="unit">${S.exclVat} ${esc(t(p.unit))}</span>`}
    </p>
    <ul class="plan-features">${p.features.map((x) => `<li>${esc(t(x))}</li>`).join('')}</ul>
    <a class="btn" href="${esc(t(p.cta.href))}">${esc(t(p.cta.label))} <span class="arrow" aria-hidden="true">↗</span></a>
  </article>`).join('');

// ---------- unit prices ----------
const priceOf = (s) => (s.rate ? `+${f.rate(s.rate)}` : f.euros(s.price));
$('[data-price-rows]').innerHTML = cfg.SERVICES.map((s) => `
  <tr>
    <th scope="row">${esc(t(s.label))}<span class="row-detail">${esc(t(s.detail))}</span></th>
    <td>${esc(t(s.unit))}</td>
    <td>${priceOf(s)}</td>
  </tr>`).join('');

// ---------- state ----------
function sanitize(q) {
  const clean = emptyQuote();
  for (const s of cfg.SERVICES) {
    const v = q.items?.[s.id];
    if (s.type === 'qty' && sanitizeQty(v) > 0) clean.items[s.id] = sanitizeQty(v);
    if (s.type === 'once' && v === true) clean.items[s.id] = true;
  }
  const pick = (list, id) => (list.some((x) => x.id === id) ? id : list[0].id);
  clean.complexity = pick(cfg.ASSET_COMPLEXITY, q.complexity);
  clean.size = pick(cfg.COMPANY_SIZES, q.size);
  clean.deadline = pick(cfg.DEADLINES, q.deadline);
  clean.references = (q.references || []).filter((id) => MODELS.some((m) => m.id === id));
  return clean;
}

let quote = sanitize(loadQuote());
const modelName = (id) => t(MODELS.find((m) => m.id === id).name);

// ---------- catalogue ----------
const radioGroup = (name, items, labelKey = 'label') => `
  <span class="nav-pill" aria-hidden="true"></span>
  ${items.map((it) => `
    <input type="radio" name="${name}" id="${name}-${it.id}" value="${it.id}">
    <label for="${name}-${it.id}">${esc(t(it[labelKey]))}</label>`).join('')}`;

const qtyCard = (s) => {
  const name = esc(t(s.label));
  return `
  <div class="svc" data-svc="${s.id}">
    <div class="svc-info">
      <p class="svc-name">${name} <span class="svc-badge">${S.inQuote}</span></p>
      <p class="svc-detail">${esc(t(s.detail))}</p>
      <p class="svc-price"><strong>${f.euros(s.price)}</strong> ${esc(t(s.unit))}</p>
    </div>
    <div class="svc-action">
      <button type="button" class="svc-add" data-act="add" data-id="${s.id}">+ ${S.add}</button>
      <div class="stepper" data-stepper hidden>
        <button type="button" data-act="dec" data-id="${s.id}" aria-label="${esc(S.dec(t(s.label)))}">−</button>
        <input type="number" data-act="qty" data-id="${s.id}" inputmode="numeric" min="0" max="999" step="1" aria-label="${esc(S.qty(t(s.label)))}">
        <button type="button" data-act="inc" data-id="${s.id}" aria-label="${esc(S.inc(t(s.label)))}">+</button>
      </div>
    </div>
    ${s.complexity ? `
    <div class="svc-extra" data-complexity hidden>
      <span class="qf-label" id="complexity-label">${S.complexity}</span>
      <div class="segmented" role="radiogroup" aria-labelledby="complexity-label" data-radios="complexity">${radioGroup('complexity', cfg.ASSET_COMPLEXITY)}</div>
    </div>` : ''}
  </div>`;
};

const onceCard = (s) => `
  <label class="svc svc--once" data-svc="${s.id}">
    <input type="checkbox" data-act="toggle" data-id="${s.id}">
    <span class="svc-check" aria-hidden="true"></span>
    <span class="svc-info">
      <span class="svc-name">${esc(t(s.label))} <span class="svc-badge">${S.inQuote}</span></span>
      <span class="svc-detail">${esc(t(s.detail))}</span>
      <span class="svc-price"><strong>${priceOf(s)}</strong> ${esc(t(s.unit))}</span>
    </span>
  </label>`;

$('[data-catalog]').innerHTML = `
  <p class="catalog-group">${S.perUnit}</p>
  ${cfg.SERVICES.filter((s) => s.type === 'qty').map(qtyCard).join('')}
  <p class="catalog-group">${S.once}</p>
  ${cfg.SERVICES.filter((s) => s.type === 'once').map(onceCard).join('')}`;

$('[data-radios="size"]').innerHTML = radioGroup('size', cfg.COMPANY_SIZES, 'short');
$('[data-radios="deadline"]').innerHTML = radioGroup('deadline', cfg.DEADLINES);

const form = $('[data-quote]');
const pills = {};
$$('[data-radios]', form).forEach((group) => {
  pills[group.dataset.radios] = initSlidingPill(group, { items: 'label' });
});

function syncRadios() {
  for (const name of ['size', 'deadline', 'complexity']) {
    const input = $(`#${name}-${quote[name]}`, form);
    if (!input) continue;
    input.checked = true;
    const group = input.closest('[data-radios]');
    if (!group.closest('[hidden]')) pills[name]?.setActive($(`label[for="${input.id}"]`, group));
  }
}

function syncCatalog() {
  for (const s of cfg.SERVICES) {
    const card = $(`[data-svc="${s.id}"]`, form);
    const value = quote.items[s.id];
    card.classList.toggle('is-in', Boolean(value));
    if (s.type === 'qty') {
      $('[data-act="add"]', card).hidden = Boolean(value);
      $('[data-stepper]', card).hidden = !value;
      const input = $('[data-act="qty"]', card);
      if (document.activeElement !== input) input.value = value ? String(value) : '';
      const extra = $('[data-complexity]', card);
      if (extra) extra.hidden = !value;
    } else {
      $('input[type="checkbox"]', card).checked = value === true;
    }
  }
}

// ---------- cart ----------
const cart = {
  count: $('[data-cart-count]'), empty: $('[data-cart-empty]'), lines: $('[data-cart-lines]'),
  refs: $('[data-cart-refs]'), hint: $('[data-cart-hint]'), sum: $('[data-cart-sum]'),
  low: $('[data-sum="low"]'), high: $('[data-sum="high"]'), bar: $('[data-cart-bar]'), barText: $('[data-cart-bar-text]'),
  live: $('[data-cart-live]'),
};
const shown = { low: 0, high: 0 };

function tween(key, to) {
  const from = shown[key];
  shown[key] = to;
  if (REDUCED || from === to) { cart[key].textContent = f.euros(to); return; }
  const start = performance.now();
  const step = (now) => {
    const p = clamp((now - start) / 450);
    cart[key].textContent = f.euros(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1 && shown[key] === to) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderCart(r) {
  // remember which cart control had focus: the list is rebuilt below
  const active = document.activeElement;
  const focusKey = cart.lines.contains(active) ? `${active.dataset.act}|${active.dataset.id}` : null;

  cart.count.textContent = S.count(r.count);
  cart.empty.hidden = r.count > 0;

  const qtyLines = r.lines.map((l) => {
    const s = svc(l.id);
    const name = esc(t(s.label));
    const sub = s.complexity ? ` <small>${esc(t(r.complexity.label).toLowerCase())}</small>` : '';
    return `
    <li class="cart-line">
      <p class="cart-line-name">${name}${sub}</p>
      <p class="cart-line-total">${f.euros(l.amount)}</p>
      <div class="cart-line-sub">
        <div class="stepper stepper--sm">
          <button type="button" data-act="dec" data-id="${l.id}" aria-label="${esc(S.dec(t(s.label)))}">−</button>
          <span class="stepper-value">${l.qty}</span>
          <button type="button" data-act="inc" data-id="${l.id}" aria-label="${esc(S.inc(t(s.label)))}">+</button>
        </div>
        <span>× ${f.euros(l.unitPrice)}</span>
        <button type="button" class="cart-remove" data-act="remove" data-id="${l.id}" aria-label="${esc(S.removeAria(t(s.label)))}">${S.remove}</button>
      </div>
    </li>`;
  });
  const onceLines = r.extras.map((e) => {
    const s = svc(e.id);
    return `
    <li class="cart-line">
      <p class="cart-line-name">${esc(t(s.label))}</p>
      <p class="cart-line-total">${f.euros(e.amount)}</p>
      <div class="cart-line-sub">
        <span>${e.rate ? `+${f.rate(e.rate)} ${S.ofTotal}` : esc(t(s.unit))}</span>
        <button type="button" class="cart-remove" data-act="remove" data-id="${e.id}" aria-label="${esc(S.removeAria(t(s.label)))}">${S.remove}</button>
      </div>
      ${e.rate && !r.lines.length ? `<p class="cart-line-note">${S.teamNote}</p>` : ''}
    </li>`;
  });
  cart.lines.innerHTML = [...qtyLines, ...onceLines].join('');

  cart.refs.hidden = !quote.references.length;
  cart.refs.innerHTML = quote.references.length ? `
    <p class="cart-refs-title">${S.models}</p>
    <ul>${quote.references.map((id) => `
      <li><span>${esc(modelName(id))}</span><button type="button" data-act="unref" data-id="${id}" aria-label="${esc(S.unref(modelName(id)))}">×</button></li>`).join('')}
    </ul>` : '';

  cart.hint.textContent = r.nextTier ? S.hint(f.euros(r.nextTier.missing), f.rate(r.nextTier.rate))
    : r.discountRate ? S.hintTop(f.rate(r.discountRate)) : '';
  cart.hint.hidden = !cart.hint.textContent;

  const rows = [[S.subtotal, f.euros(r.subtotal)]];
  if (r.discountRate) rows.push([`${S.discount} ${f.rate(r.discountRate)}`, `−${f.euros(r.discount)}`]);
  rows.push([S.licence(t(r.size.short)), f.coef(r.size.coef)]);
  rows.push([S.deadline(t(r.deadline.label)), f.coef(r.deadline.coef)]);
  cart.sum.innerHTML = rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');

  tween('low', r.low);
  tween('high', r.high);
  cart.barText.textContent = S.bar(S.count(r.count), `${f.euros(r.low)} – ${f.euros(r.high)}`);
  cart.live.textContent = cart.barText.textContent; // one short announcement per change
  cart.bar.dataset.filled = String(r.count > 0);

  if (focusKey) {
    const [act, id] = focusKey.split('|');
    const again = $(`[data-act="${act}"][data-id="${id}"]`, cart.lines);
    (again || $('[data-cart-title]')).focus();
  }
}

function update({ save = true } = {}) {
  if (save) saveQuote(quote);
  syncCatalog();
  syncRadios();
  renderCart(estimate(quote, cfg));
}

// ---------- events (one delegated handler for the catalogue and the cart) ----------
const setQty = (id, qty) => {
  const n = sanitizeQty(qty);
  if (n > 0) quote.items[id] = n; else delete quote.items[id];
};

form.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT') return;
  const { act, id } = el.dataset;
  if (act === 'add') {
    setQty(id, 1);
    update();
    $(`[data-svc="${id}"] [data-act="qty"]`, form).focus();
  } else if (act === 'inc' || act === 'dec') {
    setQty(id, (quote.items[id] || 0) + (act === 'inc' ? 1 : -1));
    update();
    if (!quote.items[id] && !cart.lines.contains(el)) $(`[data-svc="${id}"] [data-act="add"]`, form).focus();
  } else if (act === 'remove') {
    delete quote.items[id];
    update();
  } else if (act === 'unref') {
    quote.references = quote.references.filter((r) => r !== id);
    update();
  }
});

form.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.act === 'toggle') {
    if (el.checked) quote.items[el.dataset.id] = true; else delete quote.items[el.dataset.id];
    update();
  } else if (el.dataset.act === 'qty') {
    setQty(el.dataset.id, el.value);
    update();
  } else if (el.type === 'radio' && ['size', 'deadline', 'complexity'].includes(el.name)) {
    quote[el.name] = el.value;
    update();
  }
});

// typing a quantity updates the estimate live, without removing the line while the field is empty
form.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.act !== 'qty' || el.value === '') return;
  setQty(el.dataset.id, el.value);
  saveQuote(quote);
  renderCart(estimate(quote, cfg));
  $(`[data-svc="${el.dataset.id}"]`, form).classList.toggle('is-in', Boolean(quote.items[el.dataset.id]));
});

// ---------- send / copy / clear ----------
const status = $('[data-quote-status]');
const readContact = () => {
  const data = new FormData(form);
  const get = (k) => String(data.get(k) || '').trim();
  return { company: get('company'), name: get('name'), email: get('email'), message: get('message') };
};
const recap = () => recapText(quote, estimate(quote, cfg), readContact(), cfg, LANG, quote.references.map(modelName));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!estimate(quote, cfg).count) {
    status.textContent = S.empty;
    $('[data-catalog]').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    $('[data-catalog] [data-act="add"], [data-catalog] input').focus({ preventScroll: true });
    return;
  }
  if (!form.reportValidity()) return;
  const contact = readContact();
  location.href = `mailto:${cfg.CONTACT_EMAIL}?subject=${encodeURIComponent(S.subject(contact.company))}&body=${encodeURIComponent(recap())}`;
  status.textContent = S.sent;
});

$('[data-copy]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(recap());
    status.textContent = S.copied;
  } catch {
    status.textContent = S.copyFail;
  }
});

$('[data-clear]').addEventListener('click', () => {
  quote = emptyQuote();
  clearQuote();
  update({ save: false });
  status.textContent = S.cleared;
});

// ---------- phone: summary bar while the cart is off screen ----------
const cartEl = $('[data-cart]');
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    cart.bar.dataset.away = String(!entry.isIntersecting);
  }).observe(cartEl);
}

update({ save: false });
document.fonts?.ready.then(syncRadios);
