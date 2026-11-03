import {readFile,stat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const sourceRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const families=new Set(['materials','type','product','images','graphics','buttons','scenes','cinematic']);
const interactions=new Set(['hover','scroll','auto','click','read']);
const identity=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const localRoute=/^\/(?:examples|studio)\/(?:[a-z0-9-]+\/)*(?:#[a-z][a-z0-9-]*)?$/;
const fail=message=>{throw new Error('Invalid studio catalog: '+message);};
function text(value,label,max){if(typeof value!=='string'||!value.trim()||value.length>max)fail(label);}
function unique(values,label){if(new Set(values).size!==values.length)fail('duplicate '+label);}

/** Authored navigation for actual local studies. It does not promote research to live demos. */
export function validateStudioCatalog(catalog){
  if(!catalog||catalog.schema!==1||!Array.isArray(catalog.categories)||!catalog.categories.length||catalog.categories.length>8||!Array.isArray(catalog.items)||!catalog.items.length)fail('schema');
  unique(catalog.categories.map(c=>c?.id),'categories');
  unique(catalog.items.map(i=>i?.id),'items');
  const categories=new Set();
  for(const category of catalog.categories){
    if(typeof category?.id!=='string'||!identity.test(category.id))fail('category ID');
    text(category.label,'category label',80);text(category.description,'category description',400);
    categories.add(category.id);
  }
  for(const item of catalog.items){
    if(typeof item?.id!=='string'||!identity.test(item.id))fail('item ID');
    text(item.title,'item title',120);text(item.description,'item description',600);
    if(!categories.has(item.category))fail('unknown category for '+item.id);
    if(typeof item.href!=='string'||!localRoute.test(item.href))fail('unsafe local route for '+item.id);
    if(!interactions.has(item.interaction))fail('interaction for '+item.id);
    if(!Array.isArray(item.keywords)||!item.keywords.length||item.keywords.length>20||item.keywords.some(k=>typeof k!=='string'||!k.trim()||k.length>100))fail('keywords for '+item.id);
    if(!Array.isArray(item.techniques)||item.techniques.some(t=>!families.has(t))||new Set(item.techniques).size!==item.techniques.length)fail('technique families for '+item.id);
    const preview=item.preview;
    if(!preview||typeof preview.route!=='string'||!localRoute.test(preview.route))fail('unsafe preview route for '+item.id);
    if(preview.thumbnail!=='/studio/previews/'+item.id+'.png')fail('unsafe thumbnail for '+item.id);
    text(preview.selector,'preview selector for '+item.id,180);
    if(/[<>\u0000\r\n{};]/.test(preview.selector))fail('unsafe preview selector for '+item.id);
  }
  return catalog;
}

export async function loadStudioCatalog(base=sourceRoot){
  const catalog=validateStudioCatalog(JSON.parse(await readFile(path.join(base,'data/studio-catalog.json'),'utf8')));
  const root=await realpath(base),files=new Map();
  for(const item of catalog.items){
    for(const route of new Set([item.href,item.preview.route])){
      const [pathname,fragment]=route.split('#'),file=path.join(root,pathname.slice(1),'index.html');
      if(!files.has(file)){
        const actual=await realpath(file),relative=path.relative(root,actual);
        if(relative.startsWith('..')||path.isAbsolute(relative)||!(await stat(actual)).isFile())fail('route escapes checkout for '+item.id);
        files.set(file,await readFile(actual,'utf8'));
      }
      if(fragment&&!new RegExp('\\bid=["\']'+fragment+'["\']').test(files.get(file)))fail('missing local anchor for '+item.id);
    }
  }
  return catalog;
}
