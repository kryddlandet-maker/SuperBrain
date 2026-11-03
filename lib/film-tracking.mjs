import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,realpath,stat,lstat,mkdir,mkdtemp,rename,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {probeMedia} from './cinematic-media.mjs';
import {validateFilmTrack,validFilmQuad} from '../examples/shared/film-surface.js';
const worker=fileURLToPath(new URL('../scripts/film-tracking.py',import.meta.url));
async function freshOutput(output){
  if(typeof output!=='string'||!output||output.includes('\0')||/^[a-z][a-z\d+.-]*:/i.test(output)&&!path.isAbsolute(output))throw new Error('Choose a new local tracking output folder');
  const target=path.resolve(output),root=path.parse(target).root;let cursor=root;
  for(const part of target.slice(root.length).split(path.sep)){
    cursor=path.join(cursor,part);try{const info=await lstat(cursor);if(info.isSymbolicLink())throw new Error('Tracking output cannot pass through a symlink');if(cursor===target)throw new Error('Tracking output folder already exists');if(!info.isDirectory())throw new Error('Tracking output parent is not a directory');}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  return target;
}
export async function trackPlanarFilm(input,output,{quad=[[0,0],[1,0],[1,1],[0,1]],sampleFps=12,maxWidth=1280,minConfidence=.35,python=process.env.SUPERBRAIN_TRACKING_PYTHON||'python',run=null,...mediaOptions}={}){
  if(!validFilmQuad(quad)||quad.flat().some(n=>n<0||n>1))throw new Error('Tracking quad must be a convex TL/TR/BR/BL quadrilateral normalized within the source film');
  if(!Number.isFinite(sampleFps)||sampleFps<1||sampleFps>30||!Number.isInteger(maxWidth)||maxWidth<160||maxWidth>2560||!Number.isFinite(minConfidence)||minConfidence<.2||minConfidence>1)throw new Error('Invalid tracking sample rate, width or confidence');
  if(typeof input!=='string'||!input||input.includes('\0')||/^[a-z][a-z\d+.-]*:/i.test(input)&&!path.isAbsolute(input))throw new Error('Film tracking accepts only local files');
  const source=await realpath(path.resolve(input));if(!(await stat(source)).isFile())throw new Error('Choose a local film file');
  const target=await freshOutput(output),metadata=await probeMedia(source,{...mediaOptions,...(run?{run}:{})});
  if(metadata.duration*sampleFps>12000)throw new Error('Tracking is limited to 12,000 samples; shorten the film or lower sampleFps');
  const config={input:source,quad,sampleFps,maxWidth,minConfidence,duration:metadata.duration};
  let processed;
  if(run)processed=await run(python,[worker],JSON.stringify(config));
  else processed=await new Promise((resolve,reject)=>{
    const child=execFile(python,[worker],{windowsHide:true,maxBuffer:32*1024*1024,timeout:10*60*1000},(error,stdout,stderr)=>{if(error){reject(new Error(error.code==='ENOENT'?'Python for film tracking was not found; set SUPERBRAIN_TRACKING_PYTHON to an existing Python with OpenCV.':String(stderr||error.message).trim()));}else resolve({stdout});});child.stdin.end(JSON.stringify(config));
  });
  const data=JSON.parse(processed.stdout),hash=createHash('sha256');for await(const chunk of createReadStream(source))hash.update(chunk);const digest=hash.digest('hex');
  const result=validateFilmTrack({schema:1,kind:'planar-film-track',source:{name:path.basename(source),sha256:digest,...metadata},selection:{quad,referenceFrame:0},...data});
  const tracked=result.frames.filter(frame=>frame.state==='tracked').length;
  result.summary={samples:result.frames.length,tracked,lost:result.frames.length-tracked,coverage:tracked/result.frames.length,reviewRequired:true};
  await mkdir(path.dirname(target),{recursive:true});const staging=await mkdtemp(path.join(path.dirname(target),'.superbrain-track-'));
  try{await writeFile(path.join(staging,'track.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});await freshOutput(target);await rename(staging,target);}catch(error){await rm(staging,{recursive:true,force:true});throw error;}
  return {directory:target,...result};
}
