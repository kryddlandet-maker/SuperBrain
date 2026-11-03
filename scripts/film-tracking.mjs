import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {trackPlanarFilm} from '../lib/film-tracking.mjs';
export const usage='Usage: node scripts/film-tracking.mjs track <local-CFR-film> <new-folder> [--quad x0,y0,x1,y1,x2,y2,x3,y3] [--fps 12] [--width 1280] [--confidence 0.35]\nQuad order: top-left, top-right, bottom-right, bottom-left, normalized 0–1. Default tracks the dominant plane over the full frame. Requires existing local Python + OpenCV; SUPERBRAIN_TRACKING_PYTHON selects it.';
export function parseFilmTrackingArgs(args){
  const [command,input,output,...flags]=args;if(command!=='track'||!input||!output||input.startsWith('--')||output.startsWith('--'))throw new Error(usage);
  const options={},seen=new Set();
  for(let i=0;i<flags.length;i++){
    const flag=flags[i],value=flags[++i];if(!['--quad','--fps','--width','--confidence'].includes(flag)||seen.has(flag)||!value||value.startsWith('--'))throw new Error('Invalid tracking option\n'+usage);seen.add(flag);
    if(flag==='--quad'){const n=value.split(',').map(Number);if(n.length!==8||!n.every(Number.isFinite))throw new Error('Quad requires eight finite numbers');options.quad=Array.from({length:4},(_,index)=>n.slice(index*2,index*2+2));}
    else options[{'--fps':'sampleFps','--width':'maxWidth','--confidence':'minConfidence'}[flag]]=Number(value);
  }
  return {input,output,options};
}
export async function main(args=process.argv.slice(2)){if(args.length===1&&args[0]==='--help'){console.log(usage);return;}const {input,output,options}=parseFilmTrackingArgs(args),result=await trackPlanarFilm(input,output,options);console.log(JSON.stringify({directory:result.directory,source:result.source,summary:result.summary},null,2));return result;}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
