import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile,lstat,realpath,mkdir,mkdtemp,rename,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {probeMedia,reviewCinematicMedia} from './cinematic-media.mjs';
const execute=promisify(execFile),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function assembleCinematicFilm(edit,output,{ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe'}={}){
  if(!edit||!Array.isArray(edit.segments)||edit.segments.length<2||edit.segments.length>12)throw new Error('An edit requires 2–12 local segments');
  const {width=960,height=600,fps=24,crossfade=.25}=edit;
  if(![width,height].every(n=>Number.isInteger(n)&&n>=160&&n<=3840&&n%2===0)||!Number.isInteger(fps)||fps<12||fps>60||!Number.isFinite(crossfade)||crossfade<0||crossfade>2)throw new Error('Invalid edit dimensions, frame rate or crossfade');
  const target=path.resolve(output);let cursor=path.parse(target).root;for(const part of target.slice(cursor.length).split(path.sep)){cursor=path.join(cursor,part);try{const info=await lstat(cursor);if(info.isSymbolicLink())throw new Error('Edit output cannot traverse a symlink');if(cursor===target)throw new Error('Edit output already exists');if(!info.isDirectory())throw new Error('Edit parent is not a directory');}catch(error){if(error.code!=='ENOENT')throw error;}}
  const segments=[];for(const segment of edit.segments){
    if(typeof segment.source!=='string'||/^[a-z][a-z\d+.-]*:/i.test(segment.source)&&!path.isAbsolute(segment.source))throw new Error('Use local film sources');
    const source=await realpath(path.resolve(segment.source)),metadata=await probeMedia(source,{ffmpeg,ffprobe}),start=segment.start??0,end=segment.end??metadata.duration;
    if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>metadata.duration+.001||end-start<=Math.max(crossfade*2,.1))throw new Error('Segment range must contain a usable duration around its joins');
    segments.push({source,start,end,duration:end-start,sourceHash:hash(await readFile(source)),metadata});
  }
  const filters=segments.map((s,i)=>'['+i+':v]trim=start='+s.start+':end='+s.end+',setpts=PTS-STARTPTS,scale='+width+':'+height+':force_original_aspect_ratio=increase,crop='+width+':'+height+',setsar=1,fps='+fps+',format=yuv420p,settb=AVTB[v'+i+']'),joins=[];let duration=segments[0].duration,last='v0';
  for(let i=1;i<segments.length;i++){const label='join'+i,at=duration-crossfade;filters.push('['+last+'][v'+i+']'+(crossfade?'xfade=transition=fade:duration='+crossfade+':offset='+at:'concat=n=2:v=1:a=0')+'['+label+']');joins.push({at,duration:crossfade,kind:crossfade?'dissolve':'cut',from:i-1,to:i});duration+=segments[i].duration-crossfade;last=label;}
  await mkdir(path.dirname(target),{recursive:true});const staging=await mkdtemp(path.join(path.dirname(target),'.superbrain-edit-'));
  try{
    const film=path.join(staging,'film.mp4'),args=['-v','error',...segments.flatMap(s=>['-i',s.source]),'-filter_complex',filters.join(';'),'-map','['+last+']','-an','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-g',String(Math.max(6,Math.round(fps/2))),'-sc_threshold','0','-movflags','+faststart',film];
    await execute(ffmpeg,args,{windowsHide:true,maxBuffer:4*1024*1024,timeout:10*60*1000});const actual=await probeMedia(film,{ffmpeg,ffprobe});if(Math.abs(actual.duration-duration)>2/fps+.05)throw new Error('Encoded edit duration differs from its scene plan');
    await reviewCinematicMedia(film,path.join(staging,'review'),{ffmpeg,ffprobe,frames:Math.min(25,Math.max(9,segments.length*4))});
    const manifest={schema:1,kind:'assembled-scroll-film',delivery:{file:'film.mp4',sha256:hash(await readFile(film)),...actual},segments:segments.map(({source,sourceHash,start,end,metadata})=>({name:path.basename(source),sha256:sourceHash,start,end,sourceDuration:metadata.duration})),joins,review:'review/index.html',audio:'Muted decorative film; audio is intentionally not exported.',acceptance:'Inspect every join in full playback, slow motion and reverse scroll; the export is not a creative-quality approval.'};
    await writeFile(path.join(staging,'edit-manifest.json'),JSON.stringify(manifest,null,2)+'\n');await rename(staging,target);return {...manifest,directory:target};
  }finally{await rm(staging,{recursive:true,force:true});}
}
