import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,mkdir} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {compileBrief,selectReferences,validateBrief} from '../lib/brief.mjs';
import {install} from '../scripts/install.mjs';
import {createServer} from '../scripts/serve.mjs';

test('brief routes relevant knowledge without forcing tech effects on a quiet salon',async()=>{
 const salon={name:'Studio',type:'salon',goal:'Book',motion:'quiet',pages:['/','/services','/booking']};
 const refs=selectReferences(salon);assert(refs.includes('local-business'));assert(!refs.includes('technology'));assert(!refs.includes('interactive-effects'));
 const tech={...salon,type:'technology',motion:'immersive'};assert(selectReferences(tech).includes('interactive-effects'));
 const compiled=await compileBrief(salon);assert(compiled.includes('/booking'));assert(compiled.includes('# SuperBrain'));assert(!compiled.includes('# Expressive technology sites'));
});
test('invalid briefing data is rejected instead of producing unsafe or invented routes',()=>{
 for(const pages of [['//external.com'],['/services','/services'],['/../secret']])assert.throws(()=>validateBrief({name:'A',type:'salon',goal:'B',pages}));
 assert.throws(()=>validateBrief({name:'A',type:'unknown',goal:'B'}));
});
test('installer preserves project instructions, is repeatable and refuses local edits before mutation',async()=>{
 const target=await mkdtemp(path.join(os.tmpdir(),'superbrain-install-'));
 try{
  await writeFile(path.join(target,'AGENTS.md'),'# Customer project\nKeep the booking flow.\n');
  await install(target);const agents=await readFile(path.join(target,'AGENTS.md'),'utf8');assert(agents.includes('Keep the booking flow.'));
  await install(target);assert.equal(await readFile(path.join(target,'AGENTS.md'),'utf8'),agents);
  const local=path.join(target,'.agents/skills/superbrain/SKILL.md');await writeFile(local,'Local changes');
  await assert.rejects(install(target),/Locally edited/);assert.equal(await readFile(local,'utf8'),'Local changes');assert.equal(await readFile(path.join(target,'AGENTS.md'),'utf8'),agents);
 }finally{await rm(target,{recursive:true,force:true});}
});
test('unmanaged destinations and malformed agent markers fail before writing',async()=>{
 const target=await mkdtemp(path.join(os.tmpdir(),'superbrain-conflict-'));
 try{
  await mkdir(path.join(target,'.agents/skills/superbrain'),{recursive:true});await writeFile(path.join(target,'.agents/skills/superbrain/SKILL.md'),'Do not overwrite');
  await assert.rejects(install(target),/Unmanaged/);assert.equal(await readFile(path.join(target,'.agents/skills/superbrain/SKILL.md'),'utf8'),'Do not overwrite');
 }finally{await rm(target,{recursive:true,force:true});}
 const malformed=await mkdtemp(path.join(os.tmpdir(),'superbrain-markers-'));
 try{await writeFile(path.join(malformed,'AGENTS.md'),'<!-- SUPERBRAIN:BEGIN -->');await assert.rejects(install(malformed),/Malformed/);await assert.rejects(readFile(path.join(malformed,'.superbrain/install.json')),/ENOENT/);}
 finally{await rm(malformed,{recursive:true,force:true});}
});
test('server exposes direct pages and compiles local briefs, rejects invalid requests and source access',async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const route of ['/','/examples/technology/product/','/examples/salon/booking/','/examples/construction/projects/','/examples/effects/','/examples/effects/project/']){const r=await fetch(base+route);assert.equal(r.status,200);assert.match(await r.text(),/<main/);}
  assert.equal((await fetch(base+'/package.json')).status,404);
  assert.equal((await fetch(base+'/api/brief',{method:'POST',body:'{'})).status,400);
  assert.equal((await fetch(base+'/api/brief',{method:'POST',headers:{Origin:'https://external.example'},body:'{}'})).status,403);
  assert.equal((await fetch(base+'/api/brief',{method:'POST',body:'x'.repeat(40000)})).status,413);
  const r=await fetch(base+'/api/brief',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Real brief',type:'construction',goal:'Quote',motion:'quiet'})});assert.equal(r.status,200);assert((await r.text()).includes('# Local businesses'));
 }finally{await new Promise(resolve=>server.close(resolve));}
});
