import {generateDesignSystem} from '../lib/design-system.mjs';
import {searchSkills} from '../lib/skill-router.mjs';
import {creativeReview,refinementPlan,auditSnapshot} from '../lib/critique.mjs';
import {planDesign} from '../lib/design-engine.mjs';
import http from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, compileBrief } from '../lib/brief.mjs';
import {loadLibrary,searchLibrary,summarizeLibrary} from '../lib/library.mjs';

const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8'};
function within(base, target) { const rel=path.relative(base,target); return !rel.startsWith('..') && !path.isAbsolute(rel); }
export function createServer() {
  return http.createServer(async (req,res) => {
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Cache-Control','no-store');
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (['/api/brief','/api/design','/api/critique'].includes(url.pathname) && req.method === 'POST') {
        if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) { res.writeHead(403); res.end('Forbidden origin'); return; }
        let body='';
        for await (const chunk of req) { body+=chunk; if(Buffer.byteLength(body)>(url.pathname==='/api/critique'?1048576:32768)) { res.writeHead(413); res.end('Brief too large'); return; } }
        let output;
        try { const data=JSON.parse(body);if(url.pathname==='/api/design'){output=JSON.stringify(generateDesignSystem(data));}else if(url.pathname==='/api/critique'){const creative=creativeReview(planDesign(data.brief),data.snapshots,data.observations);const audits=data.snapshots.map(auditSnapshot);output=JSON.stringify({creative,deterministic:audits,refinement:refinementPlan(audits,creative)});}else output=await compileBrief(data); }
        catch(error) { res.writeHead(400); res.end(error.message); return; }
        res.writeHead(200,{'Content-Type':url.pathname==='/api/brief'?'text/plain; charset=utf-8':'application/json; charset=utf-8'}); res.end(output); return;
      }
      if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{'Allow':'GET, HEAD'}); res.end('Method not allowed'); return; }
      // The local laboratory has no icon asset. Avoid an automatic broken request.
      if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
      if(url.pathname==='/api/skills'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(req.method==='HEAD'?undefined:JSON.stringify(searchSkills(url.searchParams.get('q')||'')));return;}
      if(url.pathname==='/api/benchmarks'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(req.method==='HEAD'?undefined:await readFile(path.join(root,'docs/evidence/engine-benchmark.json'),'utf8'));return;}
      if(url.pathname==='/api/library') {
        const library=await loadLibrary();
        let candidates;
        try {
          candidates=searchLibrary(library,{query:url.searchParams.get('q')||'',domain:url.searchParams.get('domain')||'',maturity:url.searchParams.get('state')||'',limit:Number(url.searchParams.get('limit')||20)});
        } catch(error){res.writeHead(400);res.end(error.message);return;}
        const used=new Set(candidates.flatMap(c=>c.sourceIds));
        const body=JSON.stringify({summary:summarizeLibrary(library),domains:library.domains,candidates,sources:library.sources.filter(s=>used.has(s.id))});
        res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});
        res.end(req.method==='HEAD'?undefined:body);return;
      }
      const pathname=decodeURIComponent(url.pathname);
      if (pathname.includes('\\') || pathname.includes('\0')) { res.writeHead(400); res.end('Bad path'); return; }
      const base=pathname==='/'?path.join(root,'studio'):pathname.startsWith('/studio/')?path.join(root,'studio'):pathname.startsWith('/examples/')?path.join(root,'examples'):null;
      if(!base) { res.writeHead(404); res.end('Page not found'); return; }
      let file=pathname==='/'?path.join(base,'index.html'):path.resolve(root,'.'+pathname);
      if(!within(base,file)) { res.writeHead(403); res.end('Forbidden'); return; }
      if((await stat(file)).isDirectory()) file=path.join(file,'index.html');
      const resolved=await realpath(file);
      if(!within(await realpath(base),resolved)) {res.writeHead(403);res.end('Forbidden');return;}
      res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
      res.end(req.method==='HEAD'?undefined:await readFile(resolved));
    } catch(error) { res.writeHead(error.code==='ENOENT'?404:400); res.end('Page not found or invalid request'); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port=Number(process.env.PORT || 4317);
  createServer().listen(port,'127.0.0.1',()=>console.log(`SuperBrain studio: http://127.0.0.1:${port}`));
}
