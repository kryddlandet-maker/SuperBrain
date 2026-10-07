import { readFile, writeFile, mkdir, readdir, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root } from '../lib/brief.mjs';
const hash=text=>createHash('sha256').update(text).digest('hex');
const safe=rel=>typeof rel==='string' && !!rel && !rel.includes('\\') && !path.isAbsolute(rel) && !rel.split('/').some(p=>!p || p==='..' || p==='.') && (rel.startsWith('.agents/skills/superbrain/') || rel.startsWith('.superbrain/'));
export async function install(targetArg) {
  const target=await realpath(path.resolve(targetArg));
  const source=await realpath(root);
  if(target===source) throw new Error('Choose a consuming project, not the SuperBrain source');
  async function assertSafe(rel) {
    let cursor=target;
    for(const part of rel.split('/')) {
      cursor=path.join(cursor,part);
      try { if((await lstat(cursor)).isSymbolicLink()) throw new Error(`Destination is a symlink: ${rel}`); }
      catch(e) {if(e.code!=='ENOENT') throw e;}
    }
  }
  async function walk(directory, relative='') {
    const files=[];
    for(const item of await readdir(path.join(directory,relative),{withFileTypes:true})) {
      if(item.isSymbolicLink()) throw new Error('Source symlinks are not supported');
      const rel=relative?`${relative}/${item.name}`:item.name;
      if(item.isDirectory()) files.push(...await walk(directory,rel));
      else if(item.isFile()) files.push(rel);
    }
    return files.sort();
  }
  const mapping=[['skills/superbrain','.agents/skills/superbrain'],['examples/shared','.superbrain/examples/shared'],['lib','.superbrain/lib']];
  const files=[];
  for(const [from,to] of mapping) for(const rel of await walk(path.join(root,from))) {
    const content=await readFile(path.join(root,from,rel),'utf8');
    files.push({path:`${to}/${rel}`,content,sha256:hash(content)});
  }
  // The compiler needs the skill beside its lib in a standalone installation.
  for(const rel of await walk(path.join(root,'skills/superbrain'))) {
    const content=await readFile(path.join(root,'skills/superbrain',rel),'utf8');
    files.push({path:`.superbrain/skills/superbrain/${rel}`,content,sha256:hash(content)});
  }
  for(const rel of ['scripts/brief.mjs']) {
    const content=await readFile(path.join(root,rel),'utf8');files.push({path:`.superbrain/${rel}`,content,sha256:hash(content)});
  }
  const meta='.superbrain/install.json';
  await assertSafe(meta); await assertSafe('AGENTS.md');
  let previous;
  try {previous=JSON.parse(await readFile(path.join(target,meta),'utf8'));} catch(e){if(e.code!=='ENOENT')throw e;}
  if(previous && (previous.id!=='superbrain' || previous.schema!==1 || !Array.isArray(previous.files))) throw new Error('Unknown install metadata');
  for(const f of previous?.files||[]) {
    if(!safe(f.path)) throw new Error('Unsafe previous path');
    await assertSafe(f.path);
    if(hash(await readFile(path.join(target,f.path),'utf8'))!==f.sha256) throw new Error(`Locally edited installation: ${f.path}`);
  }
  const owned=new Set((previous?.files||[]).map(f=>f.path));
  for(const file of files) {
    if(!safe(file.path)) throw new Error('Unsafe destination');
    await assertSafe(file.path);
    try {await lstat(path.join(target,file.path)); if(!owned.has(file.path)) throw new Error(`Unmanaged destination: ${file.path}`);} catch(e){if(e.code!=='ENOENT')throw e;}
  }
  let agents='# Project instructions\n';
  try{agents=await readFile(path.join(target,'AGENTS.md'),'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
  const begin='<!-- SUPERBRAIN:BEGIN -->',end='<!-- SUPERBRAIN:END -->';
  const start=agents.indexOf(begin),finish=agents.indexOf(end);
  if((start<0)!==(finish<0) || (start>=0 && (finish<start || agents.indexOf(begin,start+1)>=0 || agents.indexOf(end,finish+1)>=0))) throw new Error('Malformed SuperBrain block');
  const block=`${begin}\nFor website creation or substantial redesign, read .agents/skills/superbrain/SKILL.md and relevant references. User requirements and this project's decisions take priority. Keep project facts and preferences separate from reusable guidance.\n${end}`;
  agents=start<0?agents.trimEnd()+`\n\n${block}\n`:agents.slice(0,start)+block+agents.slice(finish+end.length);
  // All conflict checks precede mutations. Existing obsolete managed files are retained,
  // not deleted, and remain tracked for future local-edit checks.
  for(const f of files){await mkdir(path.dirname(path.join(target,f.path)),{recursive:true});await writeFile(path.join(target,f.path),f.content,'utf8');}
  const tracked=new Map((previous?.files||[]).map(f=>[f.path,f]));
  for(const {content,...f} of files)tracked.set(f.path,f);
  await mkdir(path.join(target,'.superbrain'),{recursive:true});
  await writeFile(path.join(target,meta),JSON.stringify({id:'superbrain',schema:1,version:'1.0.0',files:[...tracked.values()]},null,2)+'\n');
  await writeFile(path.join(target,'AGENTS.md'),agents,'utf8');
  return {target,files:files.length};
}
if(process.argv[1] && path.resolve(process.argv[1])===path.join(root,'scripts/install.mjs')){
  const args=process.argv.slice(2);if(args.length!==1)throw new Error('Usage: node scripts/install.mjs existing-project');
  console.log(await install(args[0]));
}
