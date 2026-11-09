// ============================================================================
//  TARIFS VIZION — VALEURS D'EXEMPLE, À REMPLACER PAR LES VRAIS PRIX
//  Every amount below is a placeholder (euros, excluding tax). Change the numbers here;
//  the pricing page, the table and the quote configurator all read this file.
// ============================================================================

// Address that receives quote requests (mailto). Empty: the visitor's mail app opens with no recipient.
export const CONTACT_EMAIL = '';

export const PLANS = [
  {
    id: 'inde',
    name: 'Indé',
    audience: 'Développeurs solo et petites équipes',
    from: 490,
    unit: 'par projet',
    features: ['Designs et assets 3D à l’unité', 'Création dirigée sur demande', 'Suivi pendant et après le rendu'],
    cta: { label: 'Nous contacter', href: '#contact' },
  },
  {
    id: 'studio',
    name: 'Studio',
    audience: 'Studios en production',
    from: 2900,
    unit: 'par mois',
    featured: true,
    features: ['Tout ce qui est dans Indé', 'Game design et level design', 'Accompagnement personnalisé', 'Rendus prioritaires'],
    cta: { label: 'Nous contacter', href: '#contact' },
  },
  {
    id: 'entreprise',
    name: 'Grande entreprise',
    audience: 'Éditeurs et grands comptes',
    from: null, // custom price: built with the configurator
    unit: 'tarif personnalisé',
    features: ['Volumes et remises dégressives', 'Licence adaptée à la taille de l’entreprise', 'Équipe dédiée en option', 'Délais accélérés'],
    cta: { label: 'Configurer un devis', href: '#devis' },
  },
];

// Unit prices. `qtyLabel` is the unit shown next to the quantity field.
export const SERVICES = [
  { id: 'assets', label: 'Assets 3D', detail: 'Modèles prêts pour le moteur', unit: 'par asset', qtyLabel: 'assets', price: 180 },
  { id: 'designs', label: 'Designs', detail: 'Concepts de personnages, objets, décors', unit: 'par design', qtyLabel: 'designs', price: 120 },
  { id: 'gameDesign', label: 'Game design', detail: 'Mécaniques, systèmes, équilibrage', unit: 'par jour', qtyLabel: 'jours', price: 420 },
  { id: 'levelDesign', label: 'Level design', detail: 'Conception de niveaux jouables', unit: 'par niveau', qtyLabel: 'niveaux', price: 950 },
  { id: 'coaching', label: 'Accompagnement personnalisé', detail: 'Suivi régulier de votre équipe', unit: 'par mois', qtyLabel: 'mois', price: 650 },
  { id: 'directed', label: 'Création dirigée', detail: 'Sessions de création avec vous', unit: 'par session', qtyLabel: 'sessions', price: 280 },
];

// Multiplier applied to the 3D assets line only.
export const ASSET_COMPLEXITY = [
  { id: 'simple', label: 'Simple', coef: 0.6 },
  { id: 'standard', label: 'Standard', coef: 1 },
  { id: 'hero', label: 'Héros', coef: 2.4 },
];

// Usage licence by company size (number of employees).
export const COMPANY_SIZES = [
  { id: 's', label: 'Moins de 50', short: '< 50', coef: 1 },
  { id: 'm', label: '50 à 250', short: '50–250', coef: 1.15 },
  { id: 'l', label: '250 à 1 000', short: '250–1 000', coef: 1.3 },
  { id: 'xl', label: 'Plus de 1 000', short: '1 000 +', coef: 1.5 },
];

// Volume discount on the services subtotal (highest matching threshold wins).
export const VOLUME_DISCOUNTS = [
  { min: 10000, rate: 0.05 },
  { min: 25000, rate: 0.1 },
  { min: 50000, rate: 0.15 },
];

export const DEADLINES = [
  { id: 'standard', label: 'Standard', coef: 1 },
  { id: 'fast', label: 'Accéléré', coef: 1.25 },
  { id: 'priority', label: 'Prioritaire', coef: 1.5 },
];

export const OPTIONS = {
  dedicatedTeam: { label: 'Équipe dédiée', rate: 0.15 },          // + share of the adjusted total
  extendedSupport: { label: 'Suivi prolongé après le rendu', perMonth: 240, months: [0, 3, 6, 12] },
};

// The estimate is shown as a range around the computed total.
export const ESTIMATE_RANGE = { low: 0.9, high: 1.15, roundTo: 10 };
