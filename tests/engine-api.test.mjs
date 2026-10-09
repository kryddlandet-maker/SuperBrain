import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {createServer} from '../scripts/serve.mjs';import {install} from '../scripts/install.mjs';import {pathToFileURL} from 'node:url';
test('engine endpoints reject hostile/invalid input, expose real chapters and separate review evidence',async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{const response=await fetch(base+'/api/design',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Actual task',type:'crm',goal:'Use real saved states',motion:'quiet'})});assert.equal(response.status,200);const result=await response.json();assert(result.tokens);assert(result.plan.routing.references.includes('accessible-actions'));assert(result.files['design-system/tokens.css']);
 assert.equal((await fetch(base+'/api/design',{method:'POST',headers:{Origin:'https://external.example'},body:'{}'})).status,403);
 assert.equal((await fetch(base+'/api/design',{method:'POST',body:'{'})).status,400);
 assert.equal((await fetch(base+'/api/design',{method:'POST',body:'x'.repeat(40000)})).status,413);
 assert.equal((await fetch(base+'/api/critique',{method:'POST',body:'{}'})).status,400);
 const list=await (await fetch(base+'/api/skills?q=button')).json();assert.equal(list[0].id,'button-interactions');assert.equal(list[0].status,'guidance');
 const report=await (await fetch(base+'/api/benchmarks')).json();assert.equal(report.comparativeTrials.status,'Ej genomförda');
 for(const url of ['/lib/design-engine.mjs','/data/business-profiles.json','/.ai/project/private.json'])assert.equal((await fetch(base+url)).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
test('standalone installation contains executable engine, generator and audit tooling without touching application code',async()=>{
 const target=await mkdtemp(path.join(os.tmpdir(),'superbrain-engine-install-'));
 try{await writeFile(path.join(target,'app.js'),'Preserve application');await install(target);const {generateDesignSystem}=await import(pathToFileURL(path.join(target,'.superbrain/lib/design-system.mjs')).href);const result=generateDesignSystem({name:'Installed project',type:'portfolio',goal:'Inspect real work'});assert(result.tokens);assert(result.plan.routing.references.includes('design-systems'));for(const file of ['design.mjs','audit.mjs'])assert((await readFile(path.join(target,'.superbrain/scripts',file),'utf8')).length>500);assert.equal(await readFile(path.join(target,'app.js'),'utf8'),'Preserve application');
 }finally{await rm(target,{recursive:true,force:true});}
});
