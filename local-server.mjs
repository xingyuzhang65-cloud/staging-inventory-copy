import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 8085);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const requested = pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = path.resolve(root, requested);

  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(file, (statErr, stat) => {
    const target = !statErr && stat.isDirectory() ? path.join(file, 'index.html') : file;
    fs.readFile(target, (readErr, data) => {
      if (readErr) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      res.writeHead(200, {
        'Content-Type': types[path.extname(target)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(data);
    });
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
