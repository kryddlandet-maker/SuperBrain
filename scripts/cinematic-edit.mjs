import {readFile} from 'node:fs/promises';
import {assembleCinematicFilm} from '../lib/cinematic-edit.mjs';
const args=process.argv.slice(2);
if(args.length===1&&args[0]==='--help')console.log('Usage: node scripts/cinematic-edit.mjs <edit.json> <new-output-folder>\nJSON: {width,height,fps,crossfade,segments:[{source,start,end},...]}. Sources are local; output is a muted H264 film with join manifest and real review frames.');
else if(args.length!==2||args.some(arg=>arg.startsWith('--')))throw new Error('Use --help for cinematic edit arguments');
else assembleCinematicFilm(JSON.parse(await readFile(args[0],'utf8')),args[1]).then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error(error.message);process.exitCode=1;});
