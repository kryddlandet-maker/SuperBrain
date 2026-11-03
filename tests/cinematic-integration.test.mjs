import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from '../scripts/serve.mjs';
import {install} from '../scripts/install.mjs';
import {loadLibrary,searchLibrary} from '../lib/library.mjs';

test('cinematic runtime and review tools are discoverable with scoped evidence',async()=>{
  const library=await loadLibrary();
  const film=searchLibrary(library,{query:'scrollfilm'}),review=searchLibrary(library,{query:'film review'});
  assert(film.some(c=>c.id==='C042'&&c.maturity==='TESTED'&&c.validation.evidence.includes('tests/cinematic.test.mjs')));
  assert(review.some(c=>c.id==='C043'&&c.demo==='/examples/cinematic-media/'));
});

test('local media delivery supports browser seeks with correct bytes, ranges and MIME',async()=>{
  const source=await readFile(new URL('../examples/cinematic-media/assets/demo-wide.mp4',import.meta.url));
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/examples/cinematic-media/assets/demo-wide.mp4';
  try{
    const head=await fetch(url,{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('Content-Type'),'video/mp4');assert.equal(Number(head.headers.get('Content-Length')),source.length);
    for(const [range,start,end]of [['bytes=0-31',0,31],['bytes=-19',source.length-19,source.length-1],['bytes=40-',40,source.length-1]]){
      const response=await fetch(url,{headers:{Range:range}});assert.equal(response.status,206);
      assert.equal(response.headers.get('Content-Range'),`bytes ${start}-${end}/${source.length}`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()),source.subarray(start,end+1));
    }
    for(const range of ['bytes=-0','bytes=32-1','bytes=0-1,4-5','bytes='+source.length+'-','nonsense'])assert.equal((await fetch(url,{headers:{Range:range}})).status,416);
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('standalone installation carries the complete cinematic flow and preserves consumer files',async()=>{
  const target=await mkdtemp(path.join(tmpdir(),'superbrain-cinematic-install-'));
  try{
    await writeFile(path.join(target,'AGENTS.md'),'Keep the existing booking flow.\n');
    await writeFile(path.join(target,'index.html'),'Customer website');
    await install(target);
    const runtime=await import(pathToFileURL(path.join(target,'.superbrain/examples/shared/cinematic.js')).href);assert.equal(typeof runtime.initCinematicScene,'function');
    for(const rel of ['examples/cinematic-media/index.html','examples/cinematic-media/assets/demo-wide.mp4','examples/cinematic-media/assets/demo-portrait.mp4','scripts/cinematic-media.mjs','lib/cinematic-media.mjs','skills/superbrain/references/cinematic-media.md'])assert((await readFile(path.join(target,'.superbrain',rel))).length>100);
    const help=execFileSync(process.execPath,[path.join(target,'.superbrain/scripts/cinematic-media.mjs'),'--help'],{encoding:'utf8'});assert.match(help,/prepare/);assert.match(help,/review/);
    assert.equal(await readFile(path.join(target,'index.html'),'utf8'),'Customer website');assert((await readFile(path.join(target,'AGENTS.md'),'utf8')).includes('Keep the existing booking flow.'));
    await install(target);
  }finally{await rm(target,{recursive:true,force:true});}
});
