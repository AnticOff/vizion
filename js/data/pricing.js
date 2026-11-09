// ============================================================================
//  VIZION PRICES — EXAMPLE VALUES, REPLACE THEM WITH THE REAL PRICES
//  Every amount below is a placeholder (euros, excluding tax). Change the numbers here;
//  the pricing page, the price table, the quote cart and the tests all read this file.
//  Texts are { en, fr }.
// ============================================================================

// Address that receives quote requests (mailto). Empty: the visitor's mail app opens with no recipient.
export const CONTACT_EMAIL = '';

export const PLANS = [
  {
    id: 'inde',
    name: { en: 'Indie', fr: 'Indé' },
    audience: { en: 'Solo developers and small teams', fr: 'Développeurs solo et petites équipes' },
    from: 490,
    unit: { en: 'per project', fr: 'par projet' },
    features: [
      { en: 'Designs and 3D assets per unit', fr: 'Designs et assets 3D à l’unité' },
      { en: 'Directed creation on request', fr: 'Création dirigée sur demande' },
      { en: 'Follow-up during and after delivery', fr: 'Suivi pendant et après le rendu' },
    ],
    cta: { label: { en: 'Build a quote', fr: 'Composer un devis' }, href: { en: '#quote', fr: '#devis' } },
  },
  {
    id: 'studio',
    name: { en: 'Studio', fr: 'Studio' },
    audience: { en: 'Studios in production', fr: 'Studios en production' },
    from: 2900,
    unit: { en: 'per month', fr: 'par mois' },
    featured: true,
    features: [
      { en: 'Everything in Indie', fr: 'Tout ce qui est dans Indé' },
      { en: 'Game design and level design', fr: 'Game design et level design' },
      { en: 'Personal support', fr: 'Accompagnement personnalisé' },
      { en: 'Priority deliveries', fr: 'Rendus prioritaires' },
    ],
    cta: { label: { en: 'Build a quote', fr: 'Composer un devis' }, href: { en: '#quote', fr: '#devis' } },
  },
  {
    id: 'entreprise',
    name: { en: 'Enterprise', fr: 'Grande entreprise' },
    audience: { en: 'Publishers and large accounts', fr: 'Éditeurs et grands comptes' },
    from: null, // custom price: built with the quote cart
    unit: { en: 'custom price', fr: 'tarif personnalisé' },
    features: [
      { en: 'Volume discounts', fr: 'Volumes et remises dégressives' },
      { en: 'Licence sized to your company', fr: 'Licence adaptée à la taille de l’entreprise' },
      { en: 'Optional dedicated team', fr: 'Équipe dédiée en option' },
      { en: 'Faster deadlines', fr: 'Délais accélérés' },
    ],
    cta: { label: { en: 'Build a quote', fr: 'Composer un devis' }, href: { en: '#quote', fr: '#devis' } },
  },
];

// Catalogue of the quote cart.
//   type 'qty'  — sold by quantity (stepper). `price` per unit.
//   type 'once' — sold once at most (checkbox). Either a flat `price`, or a `rate` applied to the adjusted total.
export const SERVICES = [
  {
    id: 'assets', type: 'qty', price: 180, complexity: true,
    label: { en: '3D assets', fr: 'Assets 3D' },
    detail: { en: 'Engine-ready models', fr: 'Modèles prêts pour le moteur' },
    unit: { en: 'per asset', fr: 'par asset' },
  },
  {
    id: 'designs', type: 'qty', price: 120,
    label: { en: 'Designs', fr: 'Designs' },
    detail: { en: 'Character, prop and environment concepts', fr: 'Concepts de personnages, objets, décors' },
    unit: { en: 'per design', fr: 'par design' },
  },
  {
    id: 'gameDesign', type: 'qty', price: 420,
    label: { en: 'Game design', fr: 'Game design' },
    detail: { en: 'Mechanics, systems, balancing', fr: 'Mécaniques, systèmes, équilibrage' },
    unit: { en: 'per day', fr: 'par jour' },
  },
  {
    id: 'levelDesign', type: 'qty', price: 950,
    label: { en: 'Level design', fr: 'Level design' },
    detail: { en: 'Playable level design', fr: 'Conception de niveaux jouables' },
    unit: { en: 'per level', fr: 'par niveau' },
  },
  {
    id: 'coaching', type: 'qty', price: 650,
    label: { en: 'Personal support', fr: 'Accompagnement personnalisé' },
    detail: { en: 'Regular follow-up of your team', fr: 'Suivi régulier de votre équipe' },
    unit: { en: 'per month', fr: 'par mois' },
  },
  {
    id: 'directed', type: 'qty', price: 280,
    label: { en: 'Directed creation', fr: 'Création dirigée' },
    detail: { en: 'Creation sessions with you', fr: 'Sessions de création avec vous' },
    unit: { en: 'per session', fr: 'par session' },
  },
  {
    id: 'followUp', type: 'once', price: 1440,
    label: { en: 'Extended follow-up after delivery', fr: 'Suivi prolongé après le rendu' },
    detail: { en: '6 months of support and fixes after delivery', fr: '6 mois de support et de corrections après le rendu' },
    unit: { en: 'one-time', fr: 'forfait unique' },
  },
  {
    id: 'team', type: 'once', rate: 0.15,
    label: { en: 'Dedicated team', fr: 'Équipe dédiée' },
    detail: { en: 'A team reserved for your project from start to finish', fr: 'Une équipe réservée à votre projet du début à la fin' },
    unit: { en: 'of the total', fr: 'du total' },
  },
];

// Multiplier applied to the 3D assets line only.
export const ASSET_COMPLEXITY = [
  { id: 'simple', label: { en: 'Simple', fr: 'Simple' }, coef: 0.6 },
  { id: 'standard', label: { en: 'Standard', fr: 'Standard' }, coef: 1 },
  { id: 'hero', label: { en: 'Hero', fr: 'Héros' }, coef: 2.4 },
];

// Usage licence by company size (number of employees).
export const COMPANY_SIZES = [
  { id: 's', label: { en: 'Under 50', fr: 'Moins de 50' }, short: { en: '< 50', fr: '< 50' }, coef: 1 },
  { id: 'm', label: { en: '50 to 250', fr: '50 à 250' }, short: { en: '50–250', fr: '50–250' }, coef: 1.15 },
  { id: 'l', label: { en: '250 to 1,000', fr: '250 à 1 000' }, short: { en: '250–1,000', fr: '250–1 000' }, coef: 1.3 },
  { id: 'xl', label: { en: 'Over 1,000', fr: 'Plus de 1 000' }, short: { en: '1,000 +', fr: '1 000 +' }, coef: 1.5 },
];

// Volume discount on the services subtotal (highest matching threshold wins).
export const VOLUME_DISCOUNTS = [
  { min: 10000, rate: 0.05 },
  { min: 25000, rate: 0.1 },
  { min: 50000, rate: 0.15 },
];

export const DEADLINES = [
  { id: 'standard', label: { en: 'Standard', fr: 'Standard' }, coef: 1 },
  { id: 'fast', label: { en: 'Faster', fr: 'Accéléré' }, coef: 1.25 },
  { id: 'priority', label: { en: 'Priority', fr: 'Prioritaire' }, coef: 1.5 },
];

// The estimate is shown as a range around the computed total.
export const ESTIMATE_RANGE = { low: 0.9, high: 1.15, roundTo: 10 };
