#!/usr/bin/env node
// Zero-dependency static server for local development.
// Usage: node tools/serve.mjs [port]   (default 5192), serves the project folder.
// Python's http.server keeps a backlog of 5 connections, which resets requests when the
// browser loads many ES modules at once; Node's default backlog (511) does not.

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.argv[2]) || 5192;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
  if (path !== ROOT && !path.startsWith(ROOT + sep)) { res.writeHead(403).end(); return; } // no escaping the root
  try {
    if (statSync(path).isDirectory()) path = join(path, 'index.html');
    const { size } = statSync(path);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(path).toLowerCase()] || 'application/octet-stream',
      'Content-Length': size,
      'Cache-Control': 'no-cache',
    });
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(path).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Serving ${ROOT} on http://localhost:${PORT}`));
