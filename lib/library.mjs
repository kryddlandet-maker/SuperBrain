import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {root} from './brief.mjs';

export const maturities = ['IDENTIFIED','RESEARCHED','PROTOTYPED','TESTED','PRODUCTION-READY','EXPERIMENTAL'];
const fail = message => {throw new Error(message);};
const unique = (items,label) => {
  if(new Set(items).size !== items.length) fail('Duplicate '+label);
};
const localPath = value => typeof value === 'string' && !path.isAbsolute(value) && !value.includes('\\') && !value.split('/').some(p=>!p || p==='..' || p==='.');

export function validateDiscovery(data, legacyIds = []) {
  if(data?.schema !== 1 || !Array.isArray(data.domains) || !Array.isArray(data.sources) || !Array.isArray(data.candidates)) fail('Invalid discovery schema');
  unique(data.domains.map(d=>d.id),'domains');
  const capabilities = data.domains.flatMap(d=>d.capabilities.map(c=>{
    if(!c.id.startsWith(d.id) || !c.name) fail('Invalid capability');
    return c.id;
  }));
  unique(capabilities,'capabilities');
  unique(data.sources.map(s=>s.id),'sources');
  unique([...legacyIds,...data.candidates.map(c=>c.id)],'candidate IDs');
  const sourceIds=new Set(data.sources.map(s=>s.id));
  for(const source of data.sources) {
    if(!source.id || new URL(source.url).protocol!=='https:' || !source.finding || !source.reviewed) fail('Invalid source');
  }
  for(const c of data.candidates) {
    if(!/^C\d{3,}$/.test(c.id) || !c.name || !['skill','technique','component','pattern','reference'].includes(c.kind)) fail('Invalid candidate');
    if(!capabilities.includes(c.capability) || c.domain !== c.capability[0]) fail('Unknown capability '+c.id);
    if(!maturities.includes(c.maturity)) fail('Unknown maturity '+c.id);
    if(!Array.isArray(c.sourceIds) || !c.sourceIds.length || !c.sourceIds.every(id=>sourceIds.has(id))) fail('Missing source '+c.id);
    if(!localPath(c.reference) || !c.reference.startsWith('skills/superbrain/references/')) fail('Unsafe reference '+c.id);
    if(c.demo && !/^\/examples\/[a-z0-9/-]+\/#?[a-z0-9-]*$/.test(c.demo)) fail('Unsafe demo '+c.id);
    if(!Number.isInteger(c.priority) || c.priority<1 || c.priority>3) fail('Invalid priority '+c.id);
    if(!c.validation?.scope || !Array.isArray(c.validation.evidence)) fail('Missing validation scope '+c.id);
    if(['PROTOTYPED','TESTED','PRODUCTION-READY'].includes(c.maturity) && !c.demo) fail('Prototype needs demo '+c.id);
    if(['TESTED','PRODUCTION-READY'].includes(c.maturity) && (!c.validation.evidence.length || !c.validation.evidence.every(localPath))) fail('Tested candidate needs evidence '+c.id);
    if(c.maturity==='PRODUCTION-READY' && !c.validation.productionScope) fail('Production scope required '+c.id);
  }
  return data;
}

export async function loadLibrary(base = root) {
  const [atlas,discovery]=await Promise.all(['techniques','discovery'].map(async name=>JSON.parse(await readFile(path.join(base,'data',name+'.json'),'utf8'))));
  validateDiscovery(discovery,atlas.techniques.map(t=>t.id));
  const families={materials:'B',type:'L',product:'I',images:'M',graphics:'N',layout:'C'};
  // Historical evidence stays explicit. A source review or unit test never promotes old demos.
  const legacy=atlas.techniques.map(t=>({...t,kind:'technique',domain:families[t.family],description:t.role,
    maturity:t.status.startsWith('local-')?'PROTOTYPED':t.status==='research'?'EXPERIMENTAL':'RESEARCHED',
    sourceIds:t.sourceIds.map(id=>'legacy:'+id),priority:3,origin:'atlas-1.2',
    validation:{scope:'Inherited 1.2 record; not revalidated or promoted in this batch',evidence:[]}}));
  const candidates=[...discovery.candidates,...legacy];
  const sources=[...discovery.sources,...atlas.sources.map(s=>({...s,id:'legacy:'+s.id,origin:'atlas-1.2'}))];
  return {schema:1,reviewed:discovery.reviewed,domains:discovery.domains,sources,candidates};
}

export function searchLibrary(library, {query='',domain='',maturity='',limit=20} = {}) {
  if(typeof query!=='string' || typeof domain!=='string' || typeof maturity!=='string') fail('Invalid search');
  if(domain && !library.domains.some(d=>d.id===domain)) fail('Unknown domain');
  if(maturity && !maturities.includes(maturity)) fail('Unknown maturity');
  if(!Number.isInteger(limit) || limit<1 || limit>500) fail('Limit must be 1–500');
  const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return library.candidates.filter(c=>{
    const text=[c.id,c.name,c.description,c.implementation,c.fit,...(c.keywords||[]),...(c.triggers||[])].join(' ').toLocaleLowerCase();
    return (!domain || c.domain===domain) && (!maturity || c.maturity===maturity) && terms.every(t=>text.includes(t));
  }).sort((a,b)=>a.priority-b.priority || a.id.localeCompare(b.id)).slice(0,limit);
}
export function summarizeLibrary(library) {
  return {candidates:library.candidates.length,domains:library.domains.length,
    capabilities:library.domains.reduce((n,d)=>n+d.capabilities.length,0),
    uniqueSourceUrls:new Set(library.sources.map(s=>s.url)).size,
    maturity:Object.fromEntries(maturities.map(state=>[state,library.candidates.filter(c=>c.maturity===state).length]))};
}
export async function validateLibraryFiles(library, base=root) {
  for(const c of library.candidates.filter(c=>c.origin!=='atlas-1.2')) {
    await stat(path.join(base,c.reference));
    if(c.demo) await stat(path.join(base,c.demo.split('#')[0],'index.html'));
    for(const evidence of c.validation.evidence) await stat(path.join(base,evidence));
  }
}
