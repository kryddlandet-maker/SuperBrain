import {readFile,writeFile,mkdir,readdir,lstat,mkdtemp,stat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {verifyAnthropicSkills} from './anthropic-skills.mjs';

export const pluginSourceRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Account uploads require one plugin root per archive. Marketplace metadata and
// the separately exported Frontend Design plugin belong only in the checkout.
const roots=['.codex-plugin','assets','skills','lib','scripts','data','docs','examples','studio','tests','vendor','benchmarks'];
const rootFiles=['package.json','README.md','AGENTS.md','.gitignore'];
const forbidden=name=>name==='.git'||name==='node_modules'||name==='artifacts'||name==='dist'||name==='__pycache__'||name==='.env'||name.startsWith('.env.')||['.npmrc','.pypirc','auth.json','credentials','credentials.json'].includes(name)||/\.(?:pem|key|p12|pfx)$/i.test(name);
const digest=b=>createHash('sha256').update(b).digest('hex');
const categories=['Productivity','Creativity','Developer Tools','Business & Operations','Data & Analytics','Communication','Education & Research','Security','Finance','Healthcare','Travel','Entertainment','Other'];

/** Validate required Codex upload metadata before copying or registering packages.
 * Source: https://developers.openai.com/plugins/deploy/submission-errors
 */
export function validateCodexPluginManifest(manifest){
  const fail=message=>{throw new Error((manifest?.name||'plugin')+': '+message);};
  const text=(value,field,max,{singleLine=false}={})=>{
    if(typeof value!=='string'||!value.trim()||Array.from(value).length>max||singleLine&&/[\r\n]/.test(value))fail(field+' must be a non-empty string of at most '+max+' characters'+(singleLine?' on one line':''));
  };
  text(manifest?.name,'name',64);
  text(manifest.version,'version',64);
  text(manifest.description,'description',1024);
  text(manifest.author?.name,'author.name',120);
  const listing=manifest.interface;
  if(!listing||typeof listing!=='object'||Array.isArray(listing))fail('interface must be an object');
  text(listing.displayName,'interface.displayName',80);
  text(listing.shortDescription,'interface.shortDescription',240,{singleLine:true});
  text(listing.longDescription,'interface.longDescription',4000);
  text(listing.developerName,'interface.developerName',120);
  if(listing.category!==undefined&&!categories.includes(listing.category))fail('interface.category must be a supported Codex category');
  if(!Array.isArray(listing.capabilities)||!listing.capabilities.every(c=>typeof c==='string'))fail('interface.capabilities must be a list of strings');
  if(listing.capabilities.length>20)fail('interface.capabilities must contain at most 20 entries');
  for(const capability of listing.capabilities)text(capability,'interface.capabilities entry',120);
}

export async function verifyCodexPlugins(base=pluginSourceRoot){
  await verifyAnthropicSkills(base);
  const marketplace=JSON.parse(await readFile(path.join(base,'.agents/plugins/marketplace.json'),'utf8'));
  if(marketplace.name!=='superbrain-tools'||marketplace.plugins.map(p=>p.name).sort().join(',')!=='frontend-design,superbrain')throw new Error('Unexpected SuperBrain plugin marketplace');
  const plugins=[];
  for(const entry of marketplace.plugins){
    const expected=entry.name==='superbrain'?'.':'./plugins/frontend-design';
    if(entry.source?.source!=='local'||entry.source.path!==expected)throw new Error('Unexpected plugin root');
    const root=path.resolve(base,expected),manifest=JSON.parse(await readFile(path.join(root,'.codex-plugin/plugin.json'),'utf8'));
    validateCodexPluginManifest(manifest);
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
