#!/usr/bin/env node
// Copies the shared blocks into every page, between markers:
//   <!-- partial:alternates --> … <!-- /partial:alternates -->   hreflang links (generated)
//   <!-- partial:nav -->        … <!-- /partial:nav -->          partials/<lang>/nav.html
//   <!-- partial:footer -->     … <!-- /partial:footer -->       partials/<lang>/footer.html
// English pages live at the root, French pages in fr/. PAGES pairs them.
// Tokens in partials: {{root}} = path to the site root, {{switch}} = same page in the other language.
// The nav link that points to the page itself gets aria-current="page".
// Usage: node tools/sync-partials.mjs          rewrite the pages
//        node tools/sync-partials.mjs --check  exit 1 if a page is out of date or unpaired (CI)

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SITE = 'https://anticoff.github.io/vizion/';
const CHECK = process.argv.includes('--check');

// [English page at the root, French page in fr/]
export const PAGES = [
  ['index.html', 'index.html'],
  ['library.html', 'bibliotheque.html'],
  ['pricing.html', 'tarifs.html'],
  ['legal-notice.html', 'mentions-legales.html'],
  ['terms.html', 'conditions-generales.html'],
  ['privacy.html', 'confidentialite.html'],
];

const read = async (path) => (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
const partials = {};
for (const lang of ['en', 'fr']) {
  partials[lang] = {
    nav: (await read(join(ROOT, 'partials', lang, 'nav.html'))).trim(),
    footer: (await read(join(ROOT, 'partials', lang, 'footer.html'))).trim(),
  };
}

function fill(html, name, block) {
  const start = `<!-- partial:${name} -->`;
  const end = `<!-- /partial:${name} -->`;
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i < 0 || j < i) return html;
  const indent = html.slice(html.lastIndexOf('\n', i) + 1, i);
  const body = block.split('\n').map((line) => (line ? indent + line : line)).join('\n');
  return `${html.slice(0, i + start.length)}\n${body}\n${indent}${html.slice(j)}`;
}

let problems = 0;
for (const [en, fr] of PAGES) {
  const urls = { en: `${SITE}${en === 'index.html' ? '' : en}`, fr: `${SITE}fr/${fr === 'index.html' ? '' : fr}` };
  const alternates = [
    `<link rel="alternate" hreflang="en" href="${urls.en}">`,
    `<link rel="alternate" hreflang="fr" href="${urls.fr}">`,
    `<link rel="alternate" hreflang="x-default" href="${urls.en}">`,
  ].join('\n');

  for (const { lang, file, path, root, other } of [
    { lang: 'en', file: en, path: join(ROOT, en), root: '', other: `fr/${fr}` },
    { lang: 'fr', file: fr, path: join(ROOT, 'fr', fr), root: '../', other: `../${en}` },
  ]) {
    let before;
    try { before = await read(path); } catch { console.log(`missing: ${lang} ${file}`); problems += 1; continue; }
    const tokens = (s) => s.replaceAll('{{root}}', root).replaceAll('{{switch}}', other);
    let html = before;
    html = fill(html, 'alternates', alternates);
    html = fill(html, 'nav', tokens(partials[lang].nav).replace(`href="${file}"`, `href="${file}" aria-current="page"`));
    html = fill(html, 'footer', tokens(partials[lang].footer));
    if (!html.includes(`<html lang="${lang}">`)) { console.log(`wrong <html lang>: ${lang} ${file}`); problems += 1; }
    if (html !== before) {
      if (CHECK) { console.log(`out of date: ${lang} ${file}`); problems += 1; }
      else { await writeFile(path, html); console.log(`updated: ${lang} ${file}`); }
    }
  }
}

// every page must be paired
const known = new Set([...PAGES.map(([en]) => en), ...PAGES.map(([, fr]) => `fr/${fr}`)]);
const found = [
  ...(await readdir(ROOT)).filter((f) => f.endsWith('.html')),
  ...(await readdir(join(ROOT, 'fr'))).filter((f) => f.endsWith('.html')).map((f) => `fr/${f}`),
];
found.filter((f) => !known.has(f)).forEach((f) => { console.log(`not paired in PAGES: ${f}`); problems += 1; });

if (problems) {
  if (CHECK) console.log('Run: node tools/sync-partials.mjs');
  process.exitCode = 1;
} else {
  console.log(`${PAGES.length * 2} pages up to date`);
}
