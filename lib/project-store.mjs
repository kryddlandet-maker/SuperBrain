import {readFile,writeFile,mkdir,lstat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=data=>createHash('sha256').update(data).digest('hex');
const safe=rel=>typeof rel==='string'&&!path.isAbsolute(rel)&&!rel.includes('\\')&&!rel.split('/').some(p=>!p||p==='.'||p==='..')&&(rel.startsWith('design-system/')||rel.startsWith('.ai/project/superbrain/'));
export async function saveProject(targetArg,files){
 const target=await realpath(path.resolve(targetArg)),manifestPath='.ai/project/superbrain/generated.json';
 async function checkPath(rel){if(!safe(rel))throw new Error('Unsafe project path');let cursor=target;for(const part of rel.split('/')){cursor=path.join(cursor,part);try{if((await lstat(cursor)).isSymbolicLink())throw new Error('Project destination is a symlink');}catch(error){if(error.code!=='ENOENT')throw error;}}}
 await checkPath(manifestPath);let previous={schema:1,files:[]};try{previous=JSON.parse(await readFile(path.join(target,manifestPath),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 if(previous.schema!==1||!Array.isArray(previous.files))throw new Error('Unknown project manifest');
 for(const file of previous.files){await checkPath(file.path);if(hash(await readFile(path.join(target,file.path)))!==file.sha256)throw new Error('Locally edited project file: '+file.path);}
 const owned=new Set(previous.files.map(f=>f.path));
 for(const [rel,content]of Object.entries(files)){await checkPath(rel);if(rel===manifestPath||typeof content!=='string')throw new Error('Invalid generated file');try{await lstat(path.join(target,rel));if(!owned.has(rel))throw new Error('Unmanaged project file: '+rel);}catch(error){if(error.code!=='ENOENT')throw error;}}
 const tracked=new Map(previous.files.map(f=>[f.path,f]));
 for(const [rel,content]of Object.entries(files)){await mkdir(path.dirname(path.join(target,rel)),{recursive:true});await writeFile(path.join(target,rel),content);tracked.set(rel,{path:rel,sha256:hash(content)});}
 await mkdir(path.dirname(path.join(target,manifestPath)),{recursive:true});await writeFile(path.join(target,manifestPath),JSON.stringify({schema:1,files:[...tracked.values()]},null,2)+'\n');
 return {target,files:Object.keys(files).length};
}
export async function loadProject(target){return JSON.parse(await readFile(path.join(target,'.ai/project/superbrain/project.json'),'utf8'));}
