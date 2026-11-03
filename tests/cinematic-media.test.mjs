import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,mkdir,readdir,stat,rm,symlink} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {probeMedia,prepareCinematicMedia,reviewCinematicMedia} from '../lib/cinematic-media.mjs';
import {parseCinematicMediaArgs} from '../scripts/cinematic-media.mjs';

async function fixture(run){
  const base=await mkdtemp(path.join(tmpdir(),'superbrain-media-test-'));
  try{const input=path.join(base,"film & 'review'.mp4");await writeFile(input,'Original local film');await run({base,input});}
  finally{await rm(base,{recursive:true,force:true});}
}

function processor({fail=false}={}){
  const calls=[];
  return {calls,async run(command,args){
    calls.push({command,args:[...args]});
    if(command==='probe')return {stdout:JSON.stringify({streams:[{width:1920,height:1080,avg_frame_rate:'24/1'}],format:{duration:'4'}}),stderr:''};
    if(fail)throw new Error('Encoder failed');
    await writeFile(args.at(-1),path.extname(args.at(-1))==='.png'?'PNG frame':'Encoded MP4');
    return {stdout:'',stderr:''};
  }};
}

test('local media probing reads dimensions and fractional rates without accepting URLs',async()=>fixture(async({input})=>{
  const calls=[];
  const metadata=await probeMedia(input,{ffprobe:'probe',run:async(command,args)=>{calls.push({command,args});return {stdout:JSON.stringify({streams:[{width:1280,height:720,duration:'N/A',avg_frame_rate:'30000/1001'}],format:{duration:'6.5'}})};}});
  assert.deepEqual(metadata,{width:1280,height:720,duration:6.5,fps:30000/1001});
  assert.equal(calls[0].args.at(-1),await import('node:fs/promises').then(fs=>fs.realpath(input)));
  await assert.rejects(probeMedia('https://example.test/movie.mp4'),/local film/);
  await assert.rejects(probeMedia(input,{ffprobe:'probe',run:async()=>({stdout:'{"streams":[]}'})}),/No video stream/);
}));

test('FFmpeg-only probing works and unavailable tools report a precise non-installing error',async()=>fixture(async({input})=>{
  const missing=()=>Object.assign(new Error('not found'),{code:'ENOENT'});
  const metadata=await probeMedia(input,{ffprobe:'absent',ffmpeg:'ffmpeg-local',run:async command=>{
    if(command==='absent')throw missing();
    throw Object.assign(new Error('No output specified'),{code:1,stderr:'Duration: 00:00:04.00, start: 0\n  Stream #0:0: Video: h264, yuv420p, 1920x1080, 24 fps, 24 tbr'});
  }});
  assert.deepEqual(metadata,{duration:4,width:1920,height:1080,fps:24});
  await assert.rejects(probeMedia(input,{run:async()=>{throw missing();}}),/FFmpeg was not found.*No software was installed/);
}));

test('preparation produces independently selected variants, posters and an integrity manifest',async()=>fixture(async({base,input})=>{
  const fake=processor(),target=path.join(base,'prepared');
  const result=await prepareCinematicMedia(input,target,{ffprobe:'probe',ffmpeg:'encoder',run:fake.run,portrait:true,focus:.25,name:'demo'});
  assert.equal(result.kind,'prepared-media');assert.equal(result.fps,24);
  assert.equal(result.variants.wide.width,1600);assert.equal(result.variants.wide.height,900);
  assert.equal(result.variants.portrait.src,'demo-portrait.mp4');assert.equal(result.variants.portrait.poster,'demo-portrait-poster.png');
  assert.equal(result.files.length,4);assert(result.files.every(f=>f.bytes>0&&/^[a-f\d]{64}$/.test(f.sha256)));
  const encodes=fake.calls.filter(c=>c.args.includes('libx264'));assert.equal(encodes.length,2);
  assert(encodes.every(c=>c.args.includes('+faststart')&&c.args.includes('-n')&&c.args.includes('-an')));
  assert(encodes[1].args.some(a=>a.includes('crop=720:1280:(iw-ow)*0.25')));
  assert.equal(result.source.name,path.basename(input));assert(!JSON.stringify(result).includes(input));
  const saved=JSON.parse(await readFile(path.join(target,'manifest.json'),'utf8'));assert.deepEqual(saved.files,result.files);
}));

test('preparation refuses existing destinations and invalid options before processing or changing files',async()=>fixture(async({base,input})=>{
  const target=path.join(base,'existing');await mkdir(target);await writeFile(path.join(target,'mine.txt'),'Keep me');
  const fake=processor(),options={ffprobe:'probe',run:fake.run};
  await assert.rejects(prepareCinematicMedia(input,target,options),/already exists/);assert.equal(fake.calls.length,0);
  assert.equal(await readFile(path.join(target,'mine.txt'),'utf8'),'Keep me');
  for(const invalid of [{name:'../escape'},{focus:1.5},{portrait:'yes'},{maxWidth:Infinity},{crf:1}])await assert.rejects(prepareCinematicMedia(input,path.join(base,'new'),{...options,...invalid}));
  assert.equal(fake.calls.length,0);await assert.rejects(stat(path.join(base,'new')),/ENOENT/);
}));

test('output symlinks and failed processing preserve destinations and remove only owned staging files',async()=>fixture(async({base,input})=>{
  const link=path.join(base,'linked');await symlink(base,link,process.platform==='win32'?'junction':'dir');
  await assert.rejects(prepareCinematicMedia(input,path.join(link,'new'),{run:processor().run}),/symlink/);
  const fake=processor({fail:true}),target=path.join(base,'failed');
  await assert.rejects(prepareCinematicMedia(input,target,{ffprobe:'probe',run:fake.run}),/Encoder failed/);
  await assert.rejects(stat(target),/ENOENT/);assert(!(await readdir(base)).some(name=>name.startsWith('.superbrain-film-')));
  assert.equal(await readFile(input,'utf8'),'Original local film');
}));

test('review output contains time-stamped samples and a local accessible player without source-path leakage',async()=>fixture(async({base,input})=>{
  const fake=processor(),target=path.join(base,'review');
  const result=await reviewCinematicMedia(input,target,{ffprobe:'probe',run:fake.run,frames:5});
  assert.equal(result.samples.length,5);assert.equal(result.samples[0].time,0);assert.equal(result.samples.at(-1).time,4-1/24);
  const overview=await readFile(path.join(target,'contact-sheet.html'),'utf8'),player=await readFile(path.join(target,'review.html'),'utf8');
  assert(overview.includes('film &amp; &#39;review&#39;.mp4'));assert(overview.includes('sample-05.png'));assert(overview.includes('do not prove smooth motion'));
  assert(player.includes('Previous frame'));assert(player.includes('Playback speed'));assert(player.includes('role="alert"'));assert(!player.includes(base));
  assert.deepEqual(await readFile(path.join(target,'film.mp4')),await readFile(input));
  await assert.rejects(reviewCinematicMedia(input,path.join(base,'invalid'),{frames:1}),/3 to 25/);
}));

test('media CLI accepts distinct modes and rejects unknown, repeated and incomplete options',()=>{
  assert.deepEqual(parseCinematicMediaArgs(['prepare','film.mp4','new','--portrait','--focus','.3','--name','hero']),{command:'prepare',input:'film.mp4',output:'new',options:{portrait:true,focus:.3,name:'hero'}});
  assert.deepEqual(parseCinematicMediaArgs(['review','film.mp4','new','--frames','7']).options,{frames:7});
  for(const args of [[],['other','film','out'],['prepare','film','out','--frames','7'],['review','film','out','--frames'],['prepare','film','out','--portrait','--portrait'],['review','film','out','unexpected']])assert.throws(()=>parseCinematicMediaArgs(args));
});
