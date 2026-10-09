import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {generateDesignSystem} from '../lib/design-system.mjs';
import {saveProject} from '../lib/project-store.mjs';
export async function design(args){
 if(![1,3].includes(args.length)||(args.length===3&&args[1]!=='--out'))throw new Error('Usage: node scripts/design.mjs brief.json [--out existing-project]');
 const brief=JSON.parse(await readFile(args[0],'utf8')),result=generateDesignSystem(brief);
 if(args.length===3)return {...await saveProject(args[2],result.files),mode:result.plan.mode,contrast:result.contrast};
 return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)console.log(JSON.stringify(await design(process.argv.slice(2)),null,2));
