import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {root,referenceNames,compileBrief} from '../lib/brief.mjs';
import {validateSkill} from '../lib/skill-format.mjs';
import {loadLibrary,validateLibraryFiles,summarizeLibrary} from '../lib/library.mjs';
let checks=0;
function check(value,message){if(!value)throw new Error(message);checks++;}
const skill=await readFile(path.join(root,'skills/superbrain/SKILL.md'),'utf8');
validateSkill(skill);checks+=2;
const library=await loadLibrary();await validateLibraryFiles(library);checks++;
const atlas=JSON.parse(await readFile(path.join(root,'data/techniques.json'),'utf8'));
check(atlas.schema===1,'Unknown technique atlas schema');
check(new Set(atlas.techniques.map(t=>t.id)).size===atlas.techniques.length,'Duplicate technique IDs');
const sourceIds=new Set(atlas.sources.map(s=>s.id));check(sourceIds.size===atlas.sources.length,'Duplicate source IDs');
for(const technique of atlas.techniques){check(['local-1.1','local-1.2','external-seen','recipe','research'].includes(technique.status),'Unknown evidence status');check(technique.sourceIds.length>0&&technique.sourceIds.every(id=>sourceIds.has(id)),`Missing source for ${technique.id}`);}
for(const source of atlas.sources)check(new URL(source.url).protocol==='https:',`Invalid source URL ${source.id}`);
for(const name of referenceNames)check((await readFile(path.join(root,'skills/superbrain/references',name+'.md'),'utf8')).trim().length>100,`Missing chapter ${name}`);
for(const name of await readdir(path.join(root,'examples/briefs'))){const text=await compileBrief(JSON.parse(await readFile(path.join(root,'examples/briefs',name),'utf8')));check(text.length>1000,`Invalid example brief ${name}`);}
async function walk(directory){const result=[];for(const item of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,item.name);if(item.isDirectory())result.push(...await walk(file));else result.push(file);}return result;}
for(const file of [...await walk(path.join(root,'examples')),...await walk(path.join(root,'studio'))]){
 if(!file.endsWith('.html'))continue;
 const html=await readFile(file,'utf8');check(html.includes('name="viewport"'),`Viewport missing ${file}`);check(html.includes('<main'),`Main missing ${file}`);
 check(!/<(?:p|span)[^>]*class="[^\"]*\b(?:eyebrow|kicker|row-number|index)\b/.test(html),`Decorative heading/counter reintroduced ${file}`);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
  if(!url.startsWith('/'))continue;
  let target=url==='/'?path.join(root,'studio/index.html'):path.join(root,url);
  const info=await stat(target);if(info.isDirectory())target=path.join(target,'index.html');await stat(target);checks++;
 }
}
console.log(`Validated ${checks} skill, brief, page and local-link invariants. Runtime and visual quality require browser review.`);
console.log(JSON.stringify(summarizeLibrary(library)));
