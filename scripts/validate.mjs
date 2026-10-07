import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {root,referenceNames,compileBrief} from '../lib/brief.mjs';
let checks=0;
function check(value,message){if(!value)throw new Error(message);checks++;}
const skill=await readFile(path.join(root,'skills/superbrain/SKILL.md'),'utf8');
check(/^---\nname: superbrain\ndescription: .+\n---\n/.test(skill),'Invalid skill frontmatter');
check(skill.length<6500,'Entrypoint too large; move conditional detail to references');
for(const name of referenceNames)check((await readFile(path.join(root,'skills/superbrain/references',name+'.md'),'utf8')).trim().length>100,`Missing chapter ${name}`);
for(const name of await readdir(path.join(root,'examples/briefs'))){const text=await compileBrief(JSON.parse(await readFile(path.join(root,'examples/briefs',name),'utf8')));check(text.length>1000,`Invalid example brief ${name}`);}
async function walk(directory){const result=[];for(const item of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,item.name);if(item.isDirectory())result.push(...await walk(file));else result.push(file);}return result;}
for(const file of [...await walk(path.join(root,'examples')),...await walk(path.join(root,'studio'))]){
 if(!file.endsWith('.html'))continue;
 const html=await readFile(file,'utf8');check(html.includes('name="viewport"'),`Viewport missing ${file}`);check(html.includes('<main'),`Main missing ${file}`);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
  if(!url.startsWith('/'))continue;
  let target=url==='/'?path.join(root,'studio/index.html'):path.join(root,url);
  const info=await stat(target);if(info.isDirectory())target=path.join(target,'index.html');await stat(target);checks++;
 }
}
console.log(`Validated ${checks} skill, brief, page and local-link invariants. Runtime and visual quality require browser review.`);
