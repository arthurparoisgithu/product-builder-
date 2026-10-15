import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./site/', import.meta.url));
const mime = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.md':'text/plain; charset=utf-8', '.svg':'image/svg+xml',
  '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp',
  '.mp4':'video/mp4', '.webm':'video/webm',
};
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
    const headers = {
      'Content-Type':mime[extname(target)] ?? 'application/octet-stream',
      'Content-Length':content.length,
      'Accept-Ranges':'bytes',
      'X-Content-Type-Options':'nosniff',
      'Cache-Control':'no-store',
      'Referrer-Policy':'strict-origin-when-cross-origin',
    };
    if (request.method === 'GET' && request.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      if (!match || (!match[1] && !match[2])) {
        response.writeHead(416,{'Content-Range':`bytes */${content.length}`}).end();
        return;
      }
      const start = match[1] ? Number(match[1]) : Math.max(0,content.length-Number(match[2]));
      const end = match[1] && match[2] ? Math.min(Number(match[2]),content.length-1) : content.length-1;
      if (start > end || start >= content.length) {
        response.writeHead(416,{'Content-Range':`bytes */${content.length}`}).end();
        return;
      }
      response.writeHead(206,{
        ...headers,
        'Content-Length':end-start+1,
        'Content-Range':`bytes ${start}-${end}/${content.length}`,
      });
      response.end(content.subarray(start,end+1));
      return;
    }
    response.writeHead(200,headers);
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Page introuvable');
  }
});
server.listen(Number(process.env.PORT || 3000),'0.0.0.0', () => console.log(`Portfolio prêt sur le port ${process.env.PORT || 3000}`));
