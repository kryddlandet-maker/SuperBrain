// Packaging benchmark only. It does not run a model or score website design.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {root,compileBrief,selectReferences} from '../lib/brief.mjs';
const cases=[
 {id:'tech',type:'technology',motion:'immersive',goal:'Explain a product and link to verified product/pricing routes'},
 {id:'salon',type:'salon',motion:'quiet',goal:'Choose a service and use the real booking destination'},
 {id:'construction',type:'construction',motion:'quiet',goal:'Read projects and submit to a truthful quote destination'},
 {id:'portfolio',type:'portfolio',motion:'quiet',goal:'Inspect real work and contact the owner'},
 {id:'crm',type:'other',motion:'quiet',goal:'Manage contacts and pipeline with real permissions and honest pending/error states'}
];
const bytes=text=>Buffer.byteLength(text.replace(/\r\n/g,'\n'));
const measurements=[];
for(const c of cases) {
 const brief={name:'Routing benchmark: '+c.id,...c},plainRefs=selectReferences(brief),buttonRefs=selectReferences({...brief,techniques:['buttons']});
 assert(!plainRefs.includes('button-interactions'));
 assert.deepEqual(buttonRefs.filter(r=>!plainRefs.includes(r)),['button-interactions']);
 for(const deep of ['library-discovery','accessible-actions','motion-lifecycle'])assert(!buttonRefs.includes(deep));
 const plain=await compileBrief(brief),buttons=await compileBrief({...brief,techniques:['buttons']});
 measurements.push({case:c.id,type:c.type,motion:c.motion,defaultBytesLF:bytes(plain),withButtonsBytesLF:bytes(buttons),addedBytesLF:bytes(buttons)-bytes(plain),defaultChapters:plainRefs.length,additionalChapters:1});
}
const baselineSkill=execFileSync('git',['show','38fef3f:skills/superbrain/SKILL.md'],{cwd:root,encoding:'utf8'});
const skill=await readFile(path.join(root,'skills/superbrain/SKILL.md'),'utf8');
const report={date:new Date().toISOString(),scope:'Deterministic brief routing and context packaging. Five archetypes; CRM uses the existing other type and has no new dedicated app chapter. No model-generated sites or blind design comparisons were run.',
 baseline:'38fef3f',baselineEntrypointBytesLF:bytes(baselineSkill),currentEntrypointBytesLF:bytes(skill),measurements,
 claim:'The specialized button chapter is omitted unless requested and adds exactly one chapter. This does not demonstrate better visual quality, conversion, field performance or model output.'};
await mkdir(path.join(root,'docs/evidence'),{recursive:true});
await writeFile(path.join(root,'docs/evidence/routing-benchmark.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
