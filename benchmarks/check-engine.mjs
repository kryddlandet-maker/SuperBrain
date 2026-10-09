import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';import path from 'node:path';import {performance} from 'node:perf_hooks';
import assert from 'node:assert/strict';import {root,compileBrief} from '../lib/brief.mjs';import {generateDesignSystem} from '../lib/design-system.mjs';
const cases=JSON.parse(await readFile(new URL('./engine-cases.json',import.meta.url),'utf8'));let baseline;
if(process.env.SUPERBRAIN_BASELINE)baseline=await import(pathToFileURL(path.join(process.env.SUPERBRAIN_BASELINE,'lib/brief.mjs')).href);
const results=[];
for(const entry of cases){
 const started=performance.now(),result=generateDesignSystem(entry.brief),compiled=await compileBrief(entry.brief),milliseconds=performance.now()-started;
 assert.equal(result.plan.facts.goal,entry.brief.goal);
 if(result.plan.mode==='quick-edit'){assert.equal(result.tokens,null);assert(result.plan.routing.references.length<=4);}else{assert(result.contrast.body>=4.5);assert(result.contrast.action>=4.5);assert(result.files['design-system/MASTER.md']);}
 let previous={status:'not-run'};
 if(baseline){try{const text=await baseline.compileBrief(entry.brief);previous={status:'measured',bytes:Buffer.byteLength(text.replace(/\r\n/g,'\n')),references:baseline.selectReferences(entry.brief)};}catch(error){previous={status:'unsupported',reason:error.message};}}
 results.push({id:entry.id,status:'pass',mode:result.plan.mode,milliseconds,contextBytes:Buffer.byteLength(compiled.replace(/\r\n/g,'\n')),references:result.plan.routing.references,generatedFiles:Object.keys(result.files).length,solidColorContrast:result.contrast||null,baseline:previous});
}
const report={schema:1,baselineCommit:baseline?'2597b3ff37546494960e3f3207e7c0153483340c':null,scope:'Ten functional briefing cases: packaging, scope, actual token generation and contrast. This does not measure website aesthetics, model quality or field performance.',results,comparativeTrials:{status:'not-run',reason:'Independent controlled same-model site builds and blind human preference assessment are not available from these deterministic tool runs.'}};
await writeFile(path.join(root,'docs/evidence/engine-routing.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({cases:results.length,passed:results.filter(r=>r.status==='pass').length,quickEdit:results.find(r=>r.mode==='quick-edit'),scope:report.scope},null,2));
