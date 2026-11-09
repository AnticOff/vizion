#!/usr/bin/env node
// Copies the shared blocks of partials/ into every page, between markers:
//   <!-- partial:nav -->  …  <!-- /partial:nav -->
//   <!-- partial:footer --> … <!-- /partial:footer -->
// The nav link that points to the page itself gets aria-current="page".
// Usage: node tools/sync-partials.mjs          rewrite the pages
//        node tools/sync-partials.mjs --check  exit 1 if a page is out of date (used in CI)

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const CHECK = process.argv.includes('--check');
const NAMES = ['nav', 'footer'];

const partials = Object.fromEntries(await Promise.all(NAMES.map(async (name) =>
  [name, (await readFile(join(ROOT, 'partials', `${name}.html`), 'utf8')).replace(/\r\n/g, '\n').trim()])));

const pages = (await readdir(ROOT)).filter((f) => f.endsWith('.html')).sort();
let stale = 0;

for (const page of pages) {
  const path = join(ROOT, page);
  const before = (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
  let html = before;

  for (const name of NAMES) {
    const start = `<!-- partial:${name} -->`;
    const end = `<!-- /partial:${name} -->`;
    const i = html.indexOf(start);
    const j = html.indexOf(end);
    if (i < 0 || j < 0 || j < i) continue;

    const indent = html.slice(html.lastIndexOf('\n', i) + 1, i); // indentation of the start marker
    let block = partials[name];
    if (name === 'nav') block = block.replace(`href="${page}"`, `href="${page}" aria-current="page"`);
    const body = block.split('\n').map((line) => (line ? indent + line : line)).join('\n');
    html = `${html.slice(0, i + start.length)}\n${body}\n${indent}${html.slice(j)}`;
  }

  if (html !== before) {
    stale += 1;
    if (CHECK) console.log(`out of date: ${page}`);
    else { await writeFile(path, html); console.log(`updated: ${page}`); }
  }
}

if (CHECK && stale) {
  console.log('Run: node tools/sync-partials.mjs');
  process.exitCode = 1;
} else if (!stale) {
  console.log(`${pages.length} pages up to date`);
}
