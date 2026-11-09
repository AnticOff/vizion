// Quote maths, kept free of DOM code so it can be tested with plain Node.
// estimate(input, cfg) -> breakdown; recapText(...) -> plain-text summary for e-mail or clipboard.

const find = (list, id) => list.find((item) => item.id === id) || list[0];

export function estimate(input, cfg) {
  const complexity = find(cfg.ASSET_COMPLEXITY, input.complexity);
  const size = find(cfg.COMPANY_SIZES, input.size);
  const deadline = find(cfg.DEADLINES, input.deadline);

  const lines = [];
  for (const service of cfg.SERVICES) {
    const qty = Math.max(0, Math.floor(Number(input.quantities?.[service.id]) || 0));
    if (!qty) continue;
    const coef = service.id === 'assets' ? complexity.coef : 1;
    const unitPrice = service.price * coef;
    lines.push({
      id: service.id,
      label: service.id === 'assets' ? `${service.label} (${complexity.label.toLowerCase()})` : service.label,
      qty,
      qtyLabel: service.qtyLabel,
      unitPrice,
      amount: qty * unitPrice,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const tier = [...cfg.VOLUME_DISCOUNTS].sort((a, b) => b.min - a.min).find((t) => subtotal >= t.min);
  const discountRate = tier ? tier.rate : 0;
  const discount = subtotal * discountRate;
  const adjusted = (subtotal - discount) * size.coef * deadline.coef;
  const team = input.dedicatedTeam ? adjusted * cfg.OPTIONS.dedicatedTeam.rate : 0;
  const supportMonths = Math.max(0, Number(input.supportMonths) || 0);
  const support = supportMonths * cfg.OPTIONS.extendedSupport.perMonth;
  const total = adjusted + team + support;

  const { low, high, roundTo } = cfg.ESTIMATE_RANGE;
  const round = (v) => Math.round(v / roundTo) * roundTo;

  return {
    lines, subtotal, discountRate, discount,
    size, deadline, complexity,
    adjusted, team, supportMonths, support, total,
    low: round(total * low), high: round(total * high),
  };
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
export const formatEuros = (v) => euros.format(Math.round(v));
export const formatCoef = (v) => `× ${decimal.format(v)}`;
export const formatRate = (v) => `${decimal.format(v * 100)} %`;

export function recapText(input, result, contact = {}) {
  const out = [];
  out.push('Demande de devis — Vizion', '');
  out.push(`Société : ${contact.company || '—'} (${result.size.label} salariés)`);
  out.push(`Contact : ${contact.name || '—'} <${contact.email || '—'}>`, '');
  out.push('Prestations');
  if (!result.lines.length) out.push('- aucune prestation choisie');
  result.lines.forEach((l) => out.push(`- ${l.label} : ${l.qty} ${l.qtyLabel} × ${formatEuros(l.unitPrice)} = ${formatEuros(l.amount)}`));
  out.push(`Sous-total : ${formatEuros(result.subtotal)}`);
  if (result.discountRate) out.push(`Remise volume (${formatRate(result.discountRate)}) : −${formatEuros(result.discount)}`);
  out.push(`Licence taille d’entreprise : ${formatCoef(result.size.coef)}`);
  out.push(`Délai ${result.deadline.label.toLowerCase()} : ${formatCoef(result.deadline.coef)}`);
  if (result.team) out.push(`Équipe dédiée : ${formatEuros(result.team)}`);
  if (result.support) out.push(`Suivi prolongé (${result.supportMonths} mois) : ${formatEuros(result.support)}`);
  out.push('', `Estimation : ${formatEuros(result.low)} – ${formatEuros(result.high)} HT (indicative, confirmée sur devis)`);
  if (contact.message) out.push('', 'Message :', contact.message);
  return out.join('\n');
}
