import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'docs');
const args = process.argv.slice(2);
const getArg = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : null; };
const port = Number(getArg('--port') || process.env.PORT || 4173);
const host = getArg('--host') || '0.0.0.0';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const requested = decodeURIComponent(url.pathname);
    if (requested === '/__mobile-preview') {
      const content = await readFile(path.join(root, '../tests/mobile-preview.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(content); return;
    }
    const file = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(content);
  } catch { res.writeHead(404); res.end('Não encontrado'); }
}).listen(port, host, () => console.log(`GAR Café preview: http://${host}:${port}`));
