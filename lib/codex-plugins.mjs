import {readFile,writeFile,mkdir,readdir,lstat,mkdtemp,stat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {verifyAnthropicSkills} from './anthropic-skills.mjs';

export const pluginSourceRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const roots=['.codex-plugin','.agents/plugins','assets','skills','lib','scripts','data','docs','examples','studio','tests','vendor','plugins/frontend-design','benchmarks'];
const rootFiles=['package.json','README.md','AGENTS.md','.gitignore'];
const forbidden=name=>name==='.git'||name==='node_modules'||name==='artifacts'||name==='dist'||name==='__pycache__'||name==='.env'||name.startsWith('.env.')||['.npmrc','.pypirc','auth.json','credentials','credentials.json'].includes(name)||/\.(?:pem|key|p12|pfx)$/i.test(name);
const digest=b=>createHash('sha256').update(b).digest('hex');

export async function verifyCodexPlugins(base=pluginSourceRoot){
  await verifyAnthropicSkills(base);
  const marketplace=JSON.parse(await readFile(path.join(base,'.agents/plugins/marketplace.json'),'utf8'));
  if(marketplace.name!=='superbrain-tools'||marketplace.plugins.map(p=>p.name).sort().join(',')!=='frontend-design,superbrain')throw new Error('Unexpected SuperBrain plugin marketplace');
  const plugins=[];
  for(const entry of marketplace.plugins){
    const expected=entry.name==='superbrain'?'.':'./plugins/frontend-design';
    if(entry.source?.source!=='local'||entry.source.path!==expected)throw new Error('Unexpected plugin root');
    const root=path.resolve(base,expected),manifest=JSON.parse(await readFile(path.join(root,'.codex-plugin/plugin.json'),'utf8'));
    if(manifest.name!==entry.name||manifest.skills!=='./skills'||!manifest.interface?.displayName)throw new Error('Invalid Codex plugin manifest');
    const icon=manifest.interface.composerIcon;
    if(typeof icon!=='string'||!icon.startsWith('./assets/')||icon.split('/').includes('..'))throw new Error('Unsafe plugin icon');
    await stat(path.join(root,icon));
    const skill=path.join(root,'skills',entry.name,'SKILL.md');await stat(skill);
    plugins.push({name:entry.name,root,version:manifest.version,displayName:manifest.interface.displayName,skill});
  }
  for(const file of ['SKILL.md','LICENSE.txt']){
    const original=await readFile(path.join(base,'vendor/anthropic/skills/frontend-design',file));
    const packaged=await readFile(path.join(base,'plugins/frontend-design/skills/frontend-design',file));
    if(!original.equals(packaged))throw new Error('Modified original in Frontend Design plugin: '+file);
  }
  return {marketplace:marketplace.name,plugins};
}

/** Export an allowlisted source snapshot, never the whole working directory. */
export async function packageCodexPlugins({base=pluginSourceRoot}={}){
  await verifyCodexPlugins(base);
  const directory=await mkdtemp(path.join(tmpdir(),'superbrain-codex-plugins-'));
  const core=path.join(directory,'superbrain'),frontend=path.join(directory,'frontend-design');
  const files=[];
  async function copy(from,to,rel){
    if(rel.split('/').some(forbidden))return;
    const info=await lstat(from);
    if(info.isSymbolicLink())throw new Error('Plugin exports do not follow symlinks: '+rel);
    if(info.isDirectory()){
      for(const name of (await readdir(from)).sort())await copy(path.join(from,name),path.join(to,name),rel+'/'+name);
    }else if(info.isFile()){
      const content=await readFile(from);await mkdir(path.dirname(to),{recursive:true});await writeFile(to,content,{mode:info.mode&0o111?0o755:0o644});
      files.push({path:rel,bytes:content.length,sha256:digest(content)});
    }else throw new Error('Unsupported plugin export entry: '+rel);
  }
  try{
    for(const rel of [...rootFiles,...roots])await copy(path.join(base,rel),path.join(core,rel),rel);
    await copy(path.join(base,'plugins/frontend-design'),frontend,'frontend-design');
    const result={schema:1,directory,plugins:[{name:'superbrain',root:core},{name:'frontend-design',root:frontend}],files};
    await writeFile(path.join(directory,'package-manifest.json'),JSON.stringify(result,null,2)+'\n');
    return result;
  }catch(error){await rm(directory,{recursive:true,force:true});throw error;}
}
