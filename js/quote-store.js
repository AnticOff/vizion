// The visitor's quote (cart) is kept in localStorage so it survives page changes and the library
// can add models to it. It holds service choices only, never personal data.
// Every access is wrapped: storage can be blocked (private mode, disabled site data).

const KEY = 'vizion-quote-v1';

export const emptyQuote = () => ({ items: {}, complexity: 'standard', size: 's', deadline: 'standard', references: [] });

export function loadQuote() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyQuote(), ...JSON.parse(raw) } : emptyQuote();
  } catch {
    return emptyQuote();
  }
}

export function saveQuote(quote) {
  try { localStorage.setItem(KEY, JSON.stringify(quote)); } catch { /* storage unavailable */ }
}

export function clearQuote() {
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}

// Adds a library model as a reference and one 3D asset to the quote.
export function addModelToQuote(modelId) {
  const quote = loadQuote();
  if (!quote.references.includes(modelId)) quote.references.push(modelId);
  quote.items.assets = Math.min(999, (Number(quote.items.assets) || 0) + 1);
  saveQuote(quote);
  return quote;
}
