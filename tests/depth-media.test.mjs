import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {inferDepth,depthModel} from '../lib/depth-media.mjs';

test('local depth outputs bind an unchanged image to a pinned inferred map and dispose inference',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'superbrain-depth-'));let disposed=false;
  try{
    const input=path.join(dir,'photo.png');await writeFile(input,'local original');
    const result=await inferDepth(input,path.join(dir,'output'),{loadPipeline:async()=>Object.assign(async file=>{assert.equal(file,input);return {depth:{width:40,height:24,save:target=>writeFile(target,'inferred map')}};},{dispose:()=>{disposed=true;}})});
    assert.equal(await readFile(path.join(result.directory,result.source.file),'utf8'),'local original');assert.equal(result.model.revision,depthModel.revision);assert.notEqual(result.source.sha256,result.depth.sha256);assert.equal(disposed,true);
    await assert.rejects(inferDepth(input,result.directory,{loadPipeline:async()=>{throw new Error('Must not run');}}),/already exists/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('depth rejects URLs and protects destinations when inference fails',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'superbrain-depth-fail-'));let disposed=false;
  try{
    await assert.rejects(inferDepth('https://example.test/private.png',path.join(dir,'out')),/local image/);
    const input=path.join(dir,'photo.png');await writeFile(input,'original');
    await assert.rejects(inferDepth(input,path.join(dir,'out'),{loadPipeline:async()=>Object.assign(async()=>{throw new Error('Inference failed');},{dispose:()=>{disposed=true;}})}),/Inference failed/);assert(disposed);
    await mkdir(path.join(dir,'out'));await writeFile(path.join(dir,'out','mine.txt'),'preserve');
    await assert.rejects(inferDepth(input,path.join(dir,'out')),/already exists/);assert.equal(await readFile(path.join(dir,'out','mine.txt'),'utf8'),'preserve');
  }finally{await rm(dir,{recursive:true,force:true});}
});
