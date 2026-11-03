import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {inferDepth} from '../lib/depth-media.mjs';
const usage='Usage: node scripts/depth-media.mjs infer <local-image> <new-output-folder> [--offline] [--cache <model-cache>]';
export async function main(args=process.argv.slice(2)){
  if(args.length===1&&args[0]==='--help'){console.log(usage);return;}
  const [command,input,output,...rest]=args;if(command!=='infer'||!input||!output||input.startsWith('--')||output.startsWith('--'))throw new Error(usage);
  const options={},seen=new Set();for(let i=0;i<rest.length;i++){const flag=rest[i];if(seen.has(flag)||!['--offline','--cache'].includes(flag))throw new Error(usage);seen.add(flag);if(flag==='--offline')options.offline=true;else{const value=rest[++i];if(!value||value.startsWith('--'))throw new Error(usage);options.cacheDir=value;}}
  const result=await inferDepth(input,output,options);console.log(JSON.stringify(result,null,2));return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
