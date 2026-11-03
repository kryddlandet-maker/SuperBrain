import {readFile,writeFile,mkdir,mkdtemp,lstat,realpath,rename,rm,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

export const depthModel={id:'onnx-community/depth-anything-v2-small',revision:'4472b7362082ad9968fee890ca0f1e5aca36b93d',license:'Apache-2.0',dtype:'q8'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function fresh(output){
  const target=path.resolve(output);let cursor=path.parse(target).root;
  for(const part of target.slice(cursor.length).split(path.sep)){
    cursor=path.join(cursor,part);try{const info=await lstat(cursor);if(info.isSymbolicLink())throw new Error('Depth output must not traverse symlinks');if(cursor===target)throw new Error('Depth output already exists; choose a new folder');if(!info.isDirectory())throw new Error('Depth output parent must be a folder');}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  return target;
}

/** Local relative-depth inference. Only model weights/config are downloaded; the image stays local. */
export async function inferDepth(input,output,{modulePath=process.env.SUPERBRAIN_TRANSFORMERS,cacheDir=process.env.SUPERBRAIN_MODEL_CACHE||path.resolve('artifacts/depth-models'),offline=false,loadPipeline=null}={}){
  if(typeof input!=='string'||/^[a-z][a-z\d+.-]*:/i.test(input)&&!path.isAbsolute(input))throw new Error('Depth requires a local image');
  const source=await realpath(path.resolve(input));if(!/\.(png|jpe?g|webp)$/i.test(source))throw new Error('Choose a local PNG, JPEG or WebP image');
  const bytes=await readFile(source),target=await fresh(output);
  let transformer;
  if(!loadPipeline){
    let entry;try{entry=createRequire(import.meta.url).resolve(modulePath||'@huggingface/transformers');}catch{throw new Error('Depth inference requires @huggingface/transformers@3.8.1. Install it in a task-owned runtime and set SUPERBRAIN_TRANSFORMERS to its package folder. See depth-media.md.');}
    transformer=await import(pathToFileURL(entry).href);if(!transformer.pipeline&&transformer.default)transformer=transformer.default;
    transformer.env.cacheDir=path.resolve(cacheDir);transformer.env.allowLocalModels=offline;transformer.env.allowRemoteModels=!offline;
    loadPipeline=()=>transformer.pipeline('depth-estimation',depthModel.id,{revision:depthModel.revision,dtype:depthModel.dtype,device:'cpu',local_files_only:offline});
  }
  await mkdir(path.dirname(target),{recursive:true});const staging=await mkdtemp(path.join(path.dirname(target),'.superbrain-depth-'));let pipe;
  try{
    pipe=await loadPipeline();const result=await pipe(source),depth=result.depth;
    if(!depth||!Number.isInteger(depth.width)||!Number.isInteger(depth.height)||depth.width<2||depth.height<2||depth.width*depth.height>50_000_000||typeof depth.save!=='function')throw new Error('Depth model returned an invalid image');
    const depthPath=path.join(staging,'depth.png');await depth.save(depthPath);
    const photo='photo'+path.extname(source).toLowerCase();await copyFile(source,path.join(staging,photo));
    const record={schema:1,kind:'relative-image-depth',model:depthModel,source:{name:path.basename(source),sha256:hash(bytes),file:photo},depth:{file:'depth.png',width:depth.width,height:depth.height,sha256:hash(await readFile(depthPath)),convention:'lighter-nearer'},scope:'Inferred relative depth for aligned image displacement; not metric measurement or a reconstructed 3D scene.',createdAt:new Date().toISOString()};
    await writeFile(path.join(staging,'depth-manifest.json'),JSON.stringify(record,null,2)+'\n');await rename(staging,target);return {...record,directory:target};
  }finally{await pipe?.dispose?.();await rm(staging,{recursive:true,force:true});}
}
