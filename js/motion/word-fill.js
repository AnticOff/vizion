// Statement words fill from --fill-from to --text in reading order, with a soft edge.
// The container must only hold text and <br>.

import { clamp } from './env.js';

const SOFT_EDGE = 3; // words

// Reads a #rgb / #rrggbb custom property from :root, falls back if missing.
function readRGB(prop, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (!m) return fallback;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function splitWords(root) {
  const words = [];
  [...root.childNodes].forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return; // keep <br>
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = part;
      frag.append(span);
      words.push(span);
    });
    node.replaceWith(frag);
  });
  return words;
}

export function createWordFill(root) {
  const words = splitWords(root);
  const from = readRGB('--fill-from', [0x6f, 0x6f, 0x6f]);
  const to = readRGB('--text', [0xf4, 0xf4, 0xf4]);

  function paint(progress) {
    const head = progress * (words.length + SOFT_EDGE);
    words.forEach((word, i) => {
      const t = clamp((head - i) / SOFT_EDGE);
      const rgb = from.map((f, k) => Math.round(f + (to[k] - f) * t)).join(', ');
      if (word._c !== rgb) { word._c = rgb; word.style.color = `rgb(${rgb})`; }
    });
  }

  // Starts when the block top reaches 80% of the viewport, ends when its bottom reaches 40%.
  function scrollProgress() {
    const r = root.getBoundingClientRect();
    const vh = innerHeight;
    return clamp((vh * 0.8 - r.top) / (vh * 0.4 + r.height));
  }

  return { words, paint, scrollProgress };
}
