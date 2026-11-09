// Library catalogue. `id` matches a builder in js/three/build-models.js.
// `material` is the default finish: chrome | rouge | bordeaux.
// `sway: true` swings the model instead of spinning it (front-facing objects).

export const CATEGORIES = {
  pieces: { en: 'Pieces', fr: 'Pièces' },
  reliques: { en: 'Relics', fr: 'Reliques' },
  armes: { en: 'Weapons', fr: 'Armes' },
  formes: { en: 'Shapes', fr: 'Formes' },
};

export const MODELS = [
  { id: 'oeil', name: { en: 'Vizion Eye', fr: 'Œil Vizion' }, category: 'reliques', material: 'chrome', sway: true },
  { id: 'tour', name: { en: 'Rook', fr: 'Tour' }, category: 'pieces', material: 'chrome' },
  { id: 'reine', name: { en: 'Queen', fr: 'Reine' }, category: 'pieces', material: 'chrome' },
  { id: 'pion', name: { en: 'Pawn', fr: 'Pion' }, category: 'pieces', material: 'bordeaux' },
  { id: 'couronne', name: { en: 'Crown', fr: 'Couronne' }, category: 'reliques', material: 'chrome' },
  { id: 'calice', name: { en: 'Chalice', fr: 'Calice' }, category: 'reliques', material: 'bordeaux' },
  { id: 'anneau', name: { en: 'Ring', fr: 'Anneau' }, category: 'reliques', material: 'chrome' },
  { id: 'epee', name: { en: 'Sword', fr: 'Épée' }, category: 'armes', material: 'chrome' },
  { id: 'hache', name: { en: 'Axe', fr: 'Hache' }, category: 'armes', material: 'chrome' },
  { id: 'bouclier', name: { en: 'Shield', fr: 'Bouclier' }, category: 'armes', material: 'bordeaux', sway: true },
  { id: 'cristal', name: { en: 'Crystal', fr: 'Cristal' }, category: 'formes', material: 'rouge' },
  { id: 'noeud', name: { en: 'Knot', fr: 'Nœud' }, category: 'formes', material: 'chrome' },
  { id: 'monolithe', name: { en: 'Monolith', fr: 'Monolithe' }, category: 'formes', material: 'rouge' },
];

export const FINISHES = {
  chrome: { en: 'Chrome', fr: 'Chrome' },
  rouge: { en: 'Red lacquer', fr: 'Rouge laqué' },
  bordeaux: { en: 'Burgundy', fr: 'Bordeaux' },
};
