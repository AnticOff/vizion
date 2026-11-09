// Quote maths, free of DOM code so it can be tested with plain Node.
//   estimate(quote, cfg)              -> numbers only (lines, discount, coefficients, extras, range)
//   recapText(quote, result, contact, cfg, lang, modelNames) -> plain-text summary for e-mail or clipboard
// `quote` = { items: { [serviceId]: number | boolean }, complexity, size, deadline, references }

const find = (list, id) => list.find((item) => item.id === id) || list[0];
const tr = (value, lang) => (value && typeof value === 'object' ? (value[lang] ?? value.en) : value);

export function sanitizeQty(value) {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? Math.min(999, Math.max(0, n)) : 0;
}

export function estimate(quote, cfg) {
  const items = quote.items || {};
  const complexity = find(cfg.ASSET_COMPLEXITY, quote.complexity);
  const size = find(cfg.COMPANY_SIZES, quote.size);
  const deadline = find(cfg.DEADLINES, quote.deadline);

  const lines = [];
  for (const s of cfg.SERVICES.filter((x) => x.type === 'qty')) {
    const qty = sanitizeQty(items[s.id]);
    if (!qty) continue;
    const unitPrice = s.price * (s.complexity ? complexity.coef : 1);
    lines.push({ id: s.id, qty, unitPrice, amount: qty * unitPrice });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const tiers = [...cfg.VOLUME_DISCOUNTS].sort((a, b) => a.min - b.min);
  const tier = [...tiers].reverse().find((t) => subtotal >= t.min);
  const next = subtotal > 0 ? tiers.find((t) => t.min > subtotal) : null;
  const discountRate = tier ? tier.rate : 0;
  const discount = subtotal * discountRate;
  const adjusted = (subtotal - discount) * size.coef * deadline.coef;

  // one-time services (checked = true): a flat price, or a rate of the adjusted total
  const extras = cfg.SERVICES
    .filter((s) => s.type === 'once' && items[s.id] === true)
    .map((s) => ({ id: s.id, rate: s.rate || 0, amount: s.rate ? adjusted * s.rate : s.price }));
  const total = adjusted + extras.reduce((sum, e) => sum + e.amount, 0);

  const { low, high, roundTo } = cfg.ESTIMATE_RANGE;
  const round = (v) => Math.round(v / roundTo) * roundTo;

  return {
    lines, extras, subtotal, discountRate, discount,
    nextTier: next ? { rate: next.rate, missing: next.min - subtotal } : null,
    size, deadline, complexity, adjusted, total,
    count: lines.length + extras.length,
    low: round(total * low), high: round(total * high),
  };
}

export function formatters(lang) {
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  const euros = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const nb = lang === 'fr' ? ' ' : '';
  return {
    euros: (v) => euros.format(Math.round(v)),
    coef: (v) => `× ${decimal.format(v)}`,
    rate: (v) => `${decimal.format(v * 100)}${lang === 'fr' ? ' ' : ''}%`,
    colon: `${nb}:`, // French puts a narrow no-break space before a colon
  };
}

const RECAP = {
  en: {
    title: 'Quote request — Vizion', company: 'Company', employees: 'employees', contact: 'Contact',
    services: 'Services', none: '- no service selected', subtotal: 'Subtotal', discount: 'Volume discount',
    licence: 'Company-size licence', deadline: 'Deadline', models: 'Library models',
    estimate: 'Estimate', exclVat: 'excl. VAT (indicative, confirmed by quote)', message: 'Message', oneTime: 'one-time',
  },
  fr: {
    title: 'Demande de devis — Vizion', company: 'Société', employees: 'salariés', contact: 'Contact',
    services: 'Prestations', none: '- aucune prestation choisie', subtotal: 'Sous-total', discount: 'Remise volume',
    licence: 'Licence taille d’entreprise', deadline: 'Délai', models: 'Modèles de la bibliothèque',
    estimate: 'Estimation', exclVat: 'HT (indicative, confirmée sur devis)', message: 'Message', oneTime: 'forfait',
  },
};

export function recapText(quote, result, contact, cfg, lang = 'en', modelNames = []) {
  const L = RECAP[lang] || RECAP.en;
  const f = formatters(lang);
  const c = f.colon;
  const label = (id) => tr(cfg.SERVICES.find((s) => s.id === id).label, lang);
  const out = [L.title, ''];
  out.push(`${L.company}${c} ${contact.company || '—'} (${tr(result.size.label, lang)} ${L.employees})`);
  out.push(`${L.contact}${c} ${contact.name || '—'} <${contact.email || '—'}>`, '');
  out.push(L.services);
  if (!result.count) out.push(L.none);
  result.lines.forEach((l) => {
    const extra = l.id === 'assets' ? ` (${tr(result.complexity.label, lang).toLowerCase()})` : '';
    out.push(`- ${label(l.id)}${extra}${c} ${l.qty} × ${f.euros(l.unitPrice)} = ${f.euros(l.amount)}`);
  });
  result.extras.forEach((e) => out.push(`- ${label(e.id)}${c} ${e.rate ? `+${f.rate(e.rate)} = ` : `${L.oneTime} `}${f.euros(e.amount)}`));
  out.push(`${L.subtotal}${c} ${f.euros(result.subtotal)}`);
  if (result.discountRate) out.push(`${L.discount} (${f.rate(result.discountRate)})${c} −${f.euros(result.discount)}`);
  out.push(`${L.licence}${c} ${f.coef(result.size.coef)}`);
  out.push(`${L.deadline} ${tr(result.deadline.label, lang).toLowerCase()}${c} ${f.coef(result.deadline.coef)}`);
  if (modelNames.length) out.push(`${L.models}${c} ${modelNames.join(', ')}`);
  out.push('', `${L.estimate}${c} ${f.euros(result.low)} – ${f.euros(result.high)} ${L.exclVat}`);
  if (contact.message) out.push('', `${L.message}${c}`, contact.message);
  return out.join('\n');
}
