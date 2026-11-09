// Language of the current page, read from <html lang>. English is the default.
// Translatable values in the data files are objects: { en: '…', fr: '…' }.

export const LANG = (document.documentElement.lang || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';

export const t = (value, lang = LANG) =>
  (value && typeof value === 'object' && !Array.isArray(value) ? (value[lang] ?? value.en) : value);
