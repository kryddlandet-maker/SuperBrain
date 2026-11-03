import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {checkLaunch} from '../scripts/launch-check.mjs';
import {routeSkills} from '../lib/skill-router.mjs';
import {assembleCinematicFilm} from '../lib/cinematic-edit.mjs';

test('specialized film, depth, production and real-inbox guidance routes only for relevant requests',()=>{
  const base={name:'Studio',type:'salon',goal:'Visa tjänster',motion:'quiet'};
  assert(!routeSkills(base,'design-build').references.includes('production-workflow'));
  const routed=routeSkills({...base,task:'Kameraspårning med perspektivtext, bilddjup, inkorg och produktion'},'design-build');
  for(const id of ['film-tracking','depth-media','inbox-forms','production-workflow'])assert(routed.references.includes(id),id);
});
test('live launch audit observes actual index restrictions and reports absent Lighthouse honestly',async()=>{
  const folder=await mkdtemp(path.join(tmpdir(),'superbrain-launch-')),server=createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html',...(req.url==='/hidden/'?{'X-Robots-Tag':'noindex'}:{})});res.end(req.url==='/robots.txt'?'User-agent: *\nAllow: /\nSitemap: https://example.test/sitemap.xml':req.url==='/sitemap.xml'?'<urlset><url><loc>https://example.test/</loc></url></urlset>':'<html><head><title>Real page</title></head></html>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));try{
    const report=await checkLaunch('http://127.0.0.1:'+server.address().port,path.join(folder,'report'),{routes:['/','/hidden/']});assert.equal(report.pages[0].title,'Real page');assert.equal(report.pages[1].headerNoindex,true);assert.equal(report.httpPassed,false);assert.equal(report.lighthouse[0].status,'not-run');
    await assert.rejects(checkLaunch('http://127.0.0.1:'+server.address().port,path.join(folder,'report')),/already exists/);
    await assert.rejects(assembleCinematicFilm({segments:[]},path.join(folder,'film')),/2–12/);
  }finally{await new Promise(resolve=>server.close(resolve));await rm(folder,{recursive:true,force:true});}
});
