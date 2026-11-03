import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createProduction,addProductionQuote,approveProductionQuote,recordProductionSpend,importProductionAsset,reviewProductionAsset,productionStatus,releaseProduction} from '../lib/production-workflow.mjs';

export const productionUsage=`Usage:
  node scripts/production.mjs init <new-production-folder> <spec.json>
  node scripts/production.mjs quote <production-folder> <quote.json>
  node scripts/production.mjs approve <production-folder> <quote-id> <approval.json>
  node scripts/production.mjs spend <production-folder> <expense.json>
  node scripts/production.mjs asset <production-folder> <asset.json>
  node scripts/production.mjs review <production-folder> <review.json>
  node scripts/production.mjs status <production-folder>
  node scripts/production.mjs release <production-folder> <static-site-folder> <new-output-folder> [site-options.json]

Creates a local versioned production ledger and a verified release bundle.
No generation purchase, provider login, external upload or publication is performed.
Paths inside input JSON files are relative to the current working directory.
Film import uses the existing FFmpeg/FFprobe media inspection tools.`;
const json=async file=>JSON.parse(await readFile(path.resolve(file),'utf8'));
export async function productionMain(args=process.argv.slice(2)){
  if(args.length===1&&args[0]==='--help'){console.log(productionUsage);return;}
  const [command,directory,...rest]=args;if(!directory||args.some(arg=>arg.startsWith('--')))throw new Error(productionUsage);
  let result;
  if(command==='init'&&rest.length===1)result=await createProduction(directory,await json(rest[0]));
  else if(command==='quote'&&rest.length===1)result=await addProductionQuote(directory,await json(rest[0]));
  else if(command==='approve'&&rest.length===2)result=await approveProductionQuote(directory,rest[0],await json(rest[1]));
  else if(command==='spend'&&rest.length===1)result=await recordProductionSpend(directory,await json(rest[0]));
  else if(command==='asset'&&rest.length===1)result=await importProductionAsset(directory,await json(rest[0]));
  else if(command==='review'&&rest.length===1)result=await reviewProductionAsset(directory,await json(rest[0]));
  else if(command==='status'&&rest.length===0)result=await productionStatus(directory);
  else if(command==='release'&&(rest.length===2||rest.length===3))result=await releaseProduction(directory,rest[0],rest[1],rest[2]?await json(rest[2]):{});
  else throw new Error(productionUsage);
  console.log(JSON.stringify(result,null,2));return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)productionMain().catch(error=>{console.error(error.message);process.exitCode=1;});
