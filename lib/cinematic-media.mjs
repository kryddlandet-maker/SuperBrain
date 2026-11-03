import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFile,stat,lstat,mkdir,mkdtemp,readdir,rename,copyFile,rm,realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

const execute=promisify(execFile);
const extensions=new Set(['.mp4','.webm','.mov','.m4v','.mkv','.avi']);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function hashFile(file){const digest=createHash('sha256');for await(const chunk of createReadStream(file))digest.update(chunk);return digest.digest('hex');}
const finite=(value,min,max,label)=>{if(!Number.isFinite(value)||value<min||value>max)throw new Error(label+' is outside the supported range');return value;};
const defaultRun=(command,args)=>execute(command,args,{windowsHide:true,maxBuffer:4*1024*1024});
const settings=options=>({ffmpeg:options.ffmpeg||process.env.FFMPEG||'ffmpeg',ffprobe:options.ffprobe||process.env.FFPROBE||'ffprobe',run:options.run||defaultRun});

async function sourceFile(input){
  if(typeof input!=='string'||!input||input.includes('\0')||/^[a-z][a-z\d+.-]*:/i.test(input)&&!path.isAbsolute(input))throw new Error('Choose a local film file; URLs and media protocols are not accepted');
  const file=await realpath(path.resolve(input));
  if(!extensions.has(path.extname(file).toLowerCase())||!(await stat(file)).isFile())throw new Error('Choose a local MP4, WebM, MOV, M4V, MKV or AVI film');
  return file;
}

function validMetadata({duration,width,height,fps}){
  finite(duration,0.001,24*60*60,'Film duration');
  finite(width,2,32768,'Film width');finite(height,2,32768,'Film height');finite(fps,0.1,240,'Film frame rate');
  return {duration,width,height,fps};
}

function rational(value){
  const parts=String(value).split('/').map(Number);
  return parts.length===2?parts[0]/parts[1]:parts[0];
}

/** Inspect a local film. FFprobe is preferred; an installed FFmpeg can inspect it alone. */
export async function probeMedia(input,options={}){
  const file=await sourceFile(input),{ffmpeg,ffprobe,run}=settings(options);
  try{
    const result=await run(ffprobe,['-v','error','-select_streams','v:0','-show_entries','stream=width,height,avg_frame_rate,r_frame_rate,duration:format=duration','-of','json',file]);
    const data=JSON.parse(result.stdout),video=data.streams?.[0];
    if(!video)throw new Error('No video stream was found in the selected film');
    const average=rational(video.avg_frame_rate),streamDuration=Number(video.duration);
    return validMetadata({duration:Number.isFinite(streamDuration)&&streamDuration>0?streamDuration:Number(data.format?.duration),width:Number(video.width),height:Number(video.height),fps:Number.isFinite(average)&&average>0?average:rational(video.r_frame_rate)});
  }catch(error){
    if(error.code!=='ENOENT')throw error;
  }
  let stderr='';
  try{stderr=(await run(ffmpeg,['-hide_banner','-i',file])).stderr||'';}
  catch(error){
    if(error.code==='ENOENT')throw new Error('FFmpeg was not found. Use an existing installation through FFMPEG; FFPROBE is optional. No software was installed.');
    if(error.code!==1)throw error;
    stderr=error.stderr||'';
  }
  const duration=stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/),line=stderr.split(/\r?\n/).find(l=>/Video:/.test(l)),size=line?.match(/\b(\d{2,5})x(\d{2,5})\b/),rate=line?.match(/\b(\d+(?:\.\d+)?) fps\b/);
  if(!duration||!size||!rate)throw new Error('FFmpeg could not read finite video dimensions, duration and frame rate; provide FFPROBE for this format');
  return validMetadata({duration:Number(duration[1])*3600+Number(duration[2])*60+Number(duration[3]),width:Number(size[1]),height:Number(size[2]),fps:Number(rate[1])});
}

async function freshOutput(output){
  if(typeof output!=='string'||!output||output.includes('\0')||/^[a-z][a-z\d+.-]*:/i.test(output)&&!path.isAbsolute(output))throw new Error('Choose a new local output folder');
  const target=path.resolve(output),parsed=path.parse(target);let cursor=parsed.root;
  for(const part of target.slice(parsed.root.length).split(path.sep)){
    cursor=path.join(cursor,part);
    try{
      const info=await lstat(cursor);
      if(info.isSymbolicLink())throw new Error('Output paths must not pass through a symlink: '+cursor);
      if(cursor===target)throw new Error('Output folder already exists; choose a new folder to preserve existing files');
      if(!info.isDirectory())throw new Error('Output parent is not a directory: '+cursor);
    }catch(error){if(error.code!=='ENOENT')throw error;}
  }
  return target;
}

async function outputBundle(input,output,options,build){
  const source=await sourceFile(input),target=await freshOutput(output),metadata=await probeMedia(source,options);
  await mkdir(path.dirname(target),{recursive:true});
  const staging=await mkdtemp(path.join(path.dirname(target),'.superbrain-film-'));
  try{
    const details=await build({source,metadata,staging,...settings(options)});
    const files=[];
    for(const name of (await readdir(staging)).sort()){
      const file=path.join(staging,name),info=await stat(file);
      if(!info.isFile()||!info.size)throw new Error('Media processing produced an empty or unsupported file: '+name);
      files.push({path:name,bytes:info.size,sha256:await hashFile(file)});
    }
    const manifest={schema:1,kind:details.kind,source:{name:path.basename(source),sha256:await hashFile(source),...metadata},...details,files};
    await writeFile(path.join(staging,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
    await freshOutput(target);
    await rename(staging,target);
    return {directory:target,...manifest};
  }catch(error){await rm(staging,{recursive:true,force:true});throw error;}
}

async function processFilm(run,ffmpeg,args){
  try{return await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n',...args]);}
  catch(error){if(error.code==='ENOENT')throw new Error('FFmpeg was not found. Set FFMPEG to an existing executable; no software was installed.');throw error;}
}

/** Export seek-friendly H.264 media and useful stills into a new folder. */
export async function prepareCinematicMedia(input,output,options={}){
  const {name='hero',portrait=false,focus=.5,maxWidth=1600,maxHeight=1000,crf=23}=options;
  if(!/^[a-zA-Z][a-zA-Z\d_-]{0,63}$/.test(name))throw new Error('Media name must contain letters, digits, underscores or hyphens and start with a letter');
  if(typeof portrait!=='boolean')throw new Error('Portrait must be a boolean');
  finite(focus,0,1,'Portrait focus');finite(crf,16,32,'CRF');finite(maxWidth,2,3840,'Maximum width');finite(maxHeight,2,3840,'Maximum height');
  return outputBundle(input,output,options,async({source,metadata,staging,ffmpeg,run})=>{
    const ratio=Math.min(1,maxWidth/metadata.width,maxHeight/metadata.height),even=n=>Math.max(2,Math.floor(n/2)*2);
    const width=even(metadata.width*ratio),height=even(metadata.height*ratio),fps=Math.min(30,metadata.fps),last=Math.max(0,metadata.duration-1/fps);
    const encode=async(file,filter)=>{
      await processFilm(run,ffmpeg,['-i',source,'-an','-vf',filter,'-r',String(fps),'-vsync','cfr','-c:v','libx264','-preset','medium','-crf',String(crf),'-pix_fmt','yuv420p','-g','6','-keyint_min','6','-sc_threshold','0','-movflags','+faststart',path.join(staging,file+'.mp4')]);
      await processFilm(run,ffmpeg,['-i',path.join(staging,file+'.mp4'),'-ss',String(last),'-frames:v','1',path.join(staging,file+'-poster.png')]);
    };
    await encode(name,`scale=${width}:${height}`);
    if(portrait)await encode(name+'-portrait',`scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280:(iw-ow)*${focus}:(ih-oh)/2`);
    return {kind:'prepared-media',name,fps,portrait,focus,posterTime:last,variants:{wide:{src:name+'.mp4',poster:name+'-poster.png',width,height},...(portrait?{portrait:{src:name+'-portrait.mp4',poster:name+'-portrait-poster.png',width:720,height:1280}}:{})},limits:['Encoding does not improve source detail or verify crop composition.','Inspect forward/reverse seeking and the complete portrait film in the target browser.']};
  });
}

function reviewPages({name,filename,metadata,samples}){
  const head=title=>`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>html{color-scheme:dark}body{font:17px/1.5 system-ui;margin:0 auto;padding:clamp(20px,5vw,64px);max-width:1400px;background:#12151c;color:#eff2f7}h1{font-size:clamp(30px,5vw,62px);line-height:1.06;margin:.2em 0}p{max-width:75ch;color:#c4cbd7}a{color:#a9c5ff}nav{display:flex;gap:24px;margin-bottom:32px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:20px}figure{margin:0}img{display:block;width:100%;background:#242a37}figcaption{padding:8px 0;font-variant-numeric:tabular-nums}video{display:block;max-height:65vh;width:100%;background:#090b10}.controls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:20px 0}button,select,input{font:inherit}button,select{min-height:44px;padding:8px 14px}input[type=range]{flex:1;min-width:200px}output{font-variant-numeric:tabular-nums}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #f6c77d;outline-offset:4px}</style><body>`;
  const nav='<nav><a href="contact-sheet.html">Film overview</a><a href="review.html">Watch and inspect</a></nav>';
  const overview=head('Film overview')+nav+`<main><h1>${escapeHTML(name)}</h1><p>Time-stamped samples support composition review. They do not prove smooth motion, soundness of joins, or text synchronization. Watch the complete film in both directions.</p><div class="grid">`+samples.map(s=>`<figure><a href="review.html#t=${s.time}"><img src="${s.file}" alt="Film at ${s.time.toFixed(3)} seconds"></a><figcaption>${s.time.toFixed(3)} s</figcaption></figure>`).join('')+'</div></main></body></html>';
  const player=head('Film review')+nav+`<main><h1>${escapeHTML(name)}</h1><p>Inspect the full film, joins and final hold. Frame stepping uses the measured nominal rate (${metadata.fps.toFixed(3)} fps); variable-frame-rate material needs its own timing review.</p><video id="film" src="${filename}" controls playsinline preload="metadata"></video><div class="controls"><button id="back" type="button">Previous frame</button><button id="next" type="button">Next frame</button><label>Playback speed <select id="speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label><label for="seek">Film position</label><input id="seek" type="range" min="0" max="${metadata.duration}" step="${1/metadata.fps}" value="0"><output id="time">0.000 s</output></div><p id="error" role="alert"></p></main><script>const film=document.getElementById('film'),seek=document.getElementById('seek'),time=document.getElementById('time'),fps=${metadata.fps};function move(t){film.pause();film.currentTime=Math.max(0,Math.min(film.duration-1/fps,t));}function show(){seek.value=film.currentTime;time.value=film.currentTime.toFixed(3)+' s';}document.getElementById('back').onclick=()=>move(film.currentTime-1/fps);document.getElementById('next').onclick=()=>move(film.currentTime+1/fps);document.getElementById('speed').onchange=e=>film.playbackRate=Number(e.target.value);seek.oninput=()=>move(Number(seek.value));film.addEventListener('timeupdate',show);film.addEventListener('seeked',show);film.addEventListener('loadedmetadata',()=>{const t=Number(new URLSearchParams(location.hash.slice(1)).get('t'));if(Number.isFinite(t)&&t>0)move(t);});film.addEventListener('error',()=>document.getElementById('error').textContent='The browser could not play this file. Prepare a browser-compatible MP4 first; successful extraction does not guarantee playback.');</script></body></html>`;
  return {overview,player};
}

/** Build a time-stamped HTML contact sheet and local review player, without third-party libraries. */
export async function reviewCinematicMedia(input,output,options={}){
  const {frames=9}=options;
  if(!Number.isInteger(frames)||frames<3||frames>25)throw new Error('Review frames must be an integer from 3 to 25');
  return outputBundle(input,output,options,async({source,metadata,staging,ffmpeg,run})=>{
    const samples=[],last=Math.max(0,metadata.duration-1/metadata.fps);
    for(let i=0;i<frames;i++){
      const time=last*i/(frames-1),file='sample-'+String(i+1).padStart(2,'0')+'.png';
      await processFilm(run,ffmpeg,['-i',source,'-ss',String(time),'-frames:v','1','-vf','scale=640:-2',path.join(staging,file)]);
      samples.push({time,file});
    }
    const filename='film'+path.extname(source).toLowerCase();await copyFile(source,path.join(staging,filename));
    const pages=reviewPages({name:path.basename(source),filename,metadata,samples});
    await writeFile(path.join(staging,'contact-sheet.html'),pages.overview,{flag:'wx'});await writeFile(path.join(staging,'review.html'),pages.player,{flag:'wx'});
    return {kind:'film-review',samples,overview:'contact-sheet.html',player:'review.html',limits:['Thumbnails do not establish motion quality or text synchronization.','The viewer does not certify browser playback; inspect the complete film and its transitions.']};
  });
}
