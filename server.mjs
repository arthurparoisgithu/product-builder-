import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./site/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.md':'text/plain; charset=utf-8', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };
const server = http.createServer(async (request,response) => {
  try {
    if (!['GET','HEAD'].includes(request.method)) {
      response.writeHead(405,{Allow:'GET, HEAD'}).end('Méthode non autorisée');
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    let target = resolve(root, `.${pathname}`);
    if (target !== root.slice(0,-1) && !target.startsWith(root.endsWith(sep) ? root : root+sep)) {
      response.writeHead(403).end('Accès interdit');
      return;
    }
    const info = await stat(target);
    if (info.isDirectory()) target = resolve(target,'index.html');
    const content = await readFile(target);
    response.writeHead(200,{
      'Content-Type':mime[extname(target)] ?? 'application/octet-stream',
      'X-Content-Type-Options':'nosniff',
      'Cache-Control':'no-store',
      'Referrer-Policy':'strict-origin-when-cross-origin',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Page introuvable');
  }
});
server.listen(Number(process.env.PORT || 3000),'0.0.0.0', () => console.log(`Portfolio prêt sur le port ${process.env.PORT || 3000}`));
