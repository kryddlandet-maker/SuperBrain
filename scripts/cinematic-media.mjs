import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {prepareCinematicMedia,reviewCinematicMedia} from '../lib/cinematic-media.mjs';

export const usage=`Usage:
  node scripts/cinematic-media.mjs prepare <local-film> <new-output-folder> [--portrait] [--focus 0.5] [--name hero]
  node scripts/cinematic-media.mjs review <local-film> <new-output-folder> [--frames 9]

FFmpeg must already be installed. FFMPEG and optional FFPROBE override executable paths.
Output folders must not already exist. No files are overwritten or software installed.
Prepare writes seek-friendly MP4 variants and PNG posters. Review writes a time-stamped
HTML overview and a separate local playback page with slow motion and frame controls.`;

export function parseCinematicMediaArgs(args){
  const [command,input,output,...rest]=args;
  if(!['prepare','review'].includes(command)||!input||!output||input.startsWith('--')||output.startsWith('--'))throw new Error(usage);
  const options={},allowed=command==='prepare'?['--portrait','--focus','--name']:['--frames'],seen=new Set();
  for(let i=0;i<rest.length;i++){
    const flag=rest[i];
    if(!allowed.includes(flag)||seen.has(flag))throw new Error('Unknown or repeated option: '+flag+'\n'+usage);
    seen.add(flag);
    if(flag==='--portrait')options.portrait=true;
    else{
      const value=rest[++i];if(!value||value.startsWith('--'))throw new Error('Missing value for '+flag);
      options[flag.slice(2)]=flag==='--name'?value:Number(value);
    }
  }
  return {command,input,output,options};
}

export async function main(args=process.argv.slice(2)){
  if(args.length===1&&args[0]==='--help'){console.log(usage);return;}
  const {command,input,output,options}=parseCinematicMediaArgs(args);
  const result=await (command==='prepare'?prepareCinematicMedia:reviewCinematicMedia)(input,output,options);
  console.log(JSON.stringify(result,null,2));return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
