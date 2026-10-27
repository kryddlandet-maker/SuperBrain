import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {root,selectReferences} from '../lib/brief.mjs';
import {validateSkill} from '../lib/skill-format.mjs';
import {loadLibrary,validateDiscovery,searchLibrary,summarizeLibrary} from '../lib/library.mjs';
import {install} from '../scripts/install.mjs';
import {createServer} from '../scripts/serve.mjs';

test('skill validates Windows CRLF and UTF-8 BOM without accepting missing metadata',async()=>{
 const text=await readFile(path.join(root,'skills/superbrain/SKILL.md'),'utf8');
 for(const input of [text.replace(/\r\n/g,'\n'),text.replace(/\r?\n/g,'\r\n'),'\uFEFF'+text])assert.match(validateSkill(input),/^---\nname: superbrain/);
 assert.throws(()=>validateSkill(text.replace('name: superbrain','name: unknown')),/frontmatter/);
 assert.throws(()=>validateSkill(text+'x'.repeat(6500)),/too large/);
});
test('registry preserves atlas identities and searches conjunctively with scoped maturity',async()=>{
 const library=await loadLibrary(),summary=summarizeLibrary(library);
 assert.equal(library.candidates.filter(c=>c.origin==='atlas-1.2').length,54);
 assert.equal(summary.candidates,95);assert.equal(summary.capabilities,110);
 assert.equal(new Set(library.candidates.map(c=>c.id)).size,95);
 assert.equal(searchLibrary(library,{query:'horizontal light',domain:'D'})[0].id,'C004');
 assert.equal(searchLibrary(library,{query:'horizontal nonexistent'}).length,0);
 assert(searchLibrary(library,{maturity:'RESEARCHED'}).every(c=>c.maturity==='RESEARCHED'));
 assert.throws(()=>searchLibrary(library,{domain:'invalid'}),/domain/);
 assert.throws(()=>searchLibrary(library,{limit:0}),/Limit/);
});
test('registry rejects inflated maturity, missing provenance and unsafe local references',async()=>{
 const original=JSON.parse(await readFile(path.join(root,'data/discovery.json'),'utf8'));
 for(const mutate of [
  d=>d.candidates.push(d.candidates[0]),
  d=>d.candidates[0].sourceIds=['missing'],
  d=>d.candidates[0].reference='skills/superbrain/references/../../../secret',
  d=>{d.candidates[0].maturity='TESTED';d.candidates[0].validation.evidence=[];},
  d=>{d.candidates[0].maturity='PRODUCTION-READY';d.candidates[0].validation.evidence=['docs/evidence/example.json'];},
  d=>d.candidates[0].capability='Z1'
 ]){const copy=structuredClone(original);mutate(copy);assert.throws(()=>validateDiscovery(copy));}
});
test('button guidance is selected explicitly without bloating quiet briefs',()=>{
 const quiet={name:'Studio',type:'salon',goal:'Book',motion:'quiet'};
 assert(!selectReferences(quiet).includes('button-interactions'));
 const refs=selectReferences({...quiet,techniques:['buttons']});
 assert(refs.includes('button-interactions'));assert(!refs.includes('advanced-graphics'));assert(!refs.includes('library-discovery'));
});
test('standalone installation can discover expanded registry and shared button code',async()=>{
 const target=await mkdtemp(path.join(os.tmpdir(),'superbrain-discovery-'));
 try{
  await install(target);
  const result=JSON.parse(execFileSync(process.execPath,[path.join(target,'.superbrain/scripts/discover.mjs'),'--query','horizontal light','--limit','1'],{encoding:'utf8'}));
  assert.equal(result.matches[0].id,'C004');assert.equal(result.summary.candidates,95);
  assert.match(await readFile(path.join(target,'.superbrain/examples/shared/buttons.css'),'utf8'),/data-horizontal-glow/);
  assert.deepEqual(await readFile(path.join(target,'.superbrain/examples/shared/pointer-buttons.js')),await readFile(path.join(root,'examples/shared/pointer-buttons.js')));
  assert.deepEqual(await readFile(path.join(target,'.superbrain/examples/shared/pointer-buttons.css')),await readFile(path.join(root,'examples/shared/pointer-buttons.css')));
  assert.deepEqual(await readFile(path.join(target,'.superbrain/docs/evidence/buttons-desktop.png')),await readFile(path.join(root,'docs/evidence/buttons-desktop.png')));
  await install(target);
 }finally{await rm(target,{recursive:true,force:true});}
});
test('read-only library endpoint filters results and retains source isolation',async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  const response=await fetch(base+'/api/library?q=horizontal%20light&domain=D');
  assert.equal(response.status,200);const body=await response.json();assert.equal(body.candidates[0].id,'C004');assert.equal(body.sources.length,3);
  assert.equal((await fetch(base+'/api/library?domain=unknown')).status,400);
  assert.equal((await fetch(base+'/api/library',{method:'POST'})).status,405);
  const head=await fetch(base+'/api/library',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.equal((await fetch(base+'/data/discovery.json')).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
