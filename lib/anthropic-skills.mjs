import {readFile,readdir,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const anthropicSkillIds=['frontend-design','web-artifacts-builder','webapp-testing','skill-creator'];
export const anthropicCommit='dbd4588f9e1033efb41dad4bef2f7947c8993d44';
const sourceRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const validPath=rel=>typeof rel==='string'&&!rel.includes('\\')&&!path.isAbsolute(rel)&&!rel.split('/').some(p=>!p||p==='.'||p==='..')&&(rel==='THIRD_PARTY_NOTICES.md'||anthropicSkillIds.some(id=>rel.startsWith('skills/'+id+'/')));

export async function verifyAnthropicSkills(base=sourceRoot) {
  const bundle=path.join(base,'vendor/anthropic');
  const resolved=await realpath(bundle),relative=path.relative(await realpath(base),resolved);
  if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Anthropic bundle escapes the project');
  const manifest=JSON.parse(await readFile(path.join(bundle,'manifest.json'),'utf8'));
  if(manifest.schema!==1||manifest.repository!=='https://github.com/anthropics/skills'||manifest.commit!==anthropicCommit||!Array.isArray(manifest.files)||!Array.isArray(manifest.packages)||manifest.packages.map(p=>p.id).sort().join(',')!==[...anthropicSkillIds].sort().join(','))throw new Error('Invalid or unexpected Anthropic bundle manifest');
  const listed=new Set();
  for(const file of manifest.files){
    if(!validPath(file.path)||listed.has(file.path)||!Number.isInteger(file.bytes)||file.bytes<0||!/^[a-f0-9]{64}$/.test(file.sha256))throw new Error('Unsafe or duplicate Anthropic manifest entry');
    listed.add(file.path);
    let cursor=bundle;
    for(const part of file.path.split('/')){cursor=path.join(cursor,part);if((await lstat(cursor)).isSymbolicLink())throw new Error('Anthropic source symlinks are not supported');}
    const content=await readFile(cursor);
    if(content.length!==file.bytes||createHash('sha256').update(content).digest('hex')!==file.sha256)throw new Error('Modified Anthropic original: '+file.path);
  }
  async function walk(dir,rel='skills'){
    for(const entry of await readdir(dir,{withFileTypes:true})){
      const child=rel+'/'+entry.name;
      if(entry.isSymbolicLink())throw new Error('Anthropic source symlinks are not supported');
      if(entry.isDirectory())await walk(path.join(dir,entry.name),child);
      else if(!listed.has(child))throw new Error('Unrecorded Anthropic original: '+child);
    }
  }
  await walk(path.join(bundle,'skills'));
  if(!listed.has('THIRD_PARTY_NOTICES.md'))throw new Error('Missing upstream third-party notices');
  const packages=[];
  for(const id of anthropicSkillIds){
    const entry='skills/'+id+'/SKILL.md',license='skills/'+id+'/LICENSE.txt';
    if(!listed.has(entry)||!listed.has(license))throw new Error('Incomplete Anthropic package: '+id);
    const skill=await readFile(path.join(bundle,entry),'utf8');
    packages.push({id,path:'vendor/anthropic/skills/'+id,entrypoint:'vendor/anthropic/'+entry,license:'vendor/anthropic/'+license,description:skill.match(/^description: (.+)$/m)?.[1]||'',source:`https://github.com/anthropics/skills/tree/${manifest.commit}/skills/${id}`,files:manifest.files.filter(f=>f.path.startsWith('skills/'+id+'/')).length});
  }
  return {schema:1,provider:'Anthropic',commit:manifest.commit,filesVerified:listed.size,packages};
}
