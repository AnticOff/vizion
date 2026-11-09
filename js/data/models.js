// Library catalogue. `id` matches a builder in js/three/build-models.js.
// `material` is the default finish: chrome | rouge | bordeaux.
// `sway: true` swings the model instead of spinning it (front-facing objects).

export const CATEGORIES = {
  pieces: 'Pièces',
  reliques: 'Reliques',
  armes: 'Armes',
  formes: 'Formes',
};

export const MODELS = [
  { id: 'oeil', name: 'Œil Vizion', category: 'reliques', material: 'chrome', sway: true },
  { id: 'tour', name: 'Tour', category: 'pieces', material: 'chrome' },
  { id: 'reine', name: 'Reine', category: 'pieces', material: 'chrome' },
  { id: 'pion', name: 'Pion', category: 'pieces', material: 'bordeaux' },
  { id: 'couronne', name: 'Couronne', category: 'reliques', material: 'chrome' },
  { id: 'calice', name: 'Calice', category: 'reliques', material: 'bordeaux' },
  { id: 'anneau', name: 'Anneau', category: 'reliques', material: 'chrome' },
  { id: 'epee', name: 'Épée', category: 'armes', material: 'chrome' },
  { id: 'hache', name: 'Hache', category: 'armes', material: 'chrome' },
  { id: 'bouclier', name: 'Bouclier', category: 'armes', material: 'bordeaux', sway: true },
  { id: 'cristal', name: 'Cristal', category: 'formes', material: 'rouge' },
  { id: 'noeud', name: 'Nœud', category: 'formes', material: 'chrome' },
  { id: 'monolithe', name: 'Monolithe', category: 'formes', material: 'rouge' },
];

export const FINISHES = {
  chrome: 'Chrome',
  rouge: 'Rouge laqué',
  bordeaux: 'Bordeaux',
};
