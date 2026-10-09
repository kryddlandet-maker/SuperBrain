export function referencePlan(references=[]){
 if(!Array.isArray(references)||references.length>8)throw new Error('References must be a bounded array');
 return references.map(ref=>{
 if(!ref||typeof ref!=='object'||!['component','page','site'].includes(ref.scope)||typeof ref.source!=='string'||!ref.source||ref.source.length>2000||typeof ref.reviewer!=='string'||!ref.reviewer||!Array.isArray(ref.observations)||!ref.observations.length||ref.observations.some(v=>typeof v!=='string'||v.length>2000))throw new Error('Reference needs source, reviewer, scope and recorded observations');
 if(ref.scope==='component'&&(typeof ref.target!=='string'||!ref.target.trim()||!Array.isArray(ref.preserve)||!ref.preserve.length))throw new Error('Component reference needs an exact target and preservation constraints');
 if(ref.preserve&&(!Array.isArray(ref.preserve)||ref.preserve.some(v=>typeof v!=='string')))throw new Error('Invalid preservation constraints');
 return {source:ref.source,reviewer:ref.reviewer,scope:ref.scope,target:ref.target||null,observations:ref.observations,preserve:ref.preserve||[],rights:ref.rights||'Unverified; confirm before reusing assets',renderMethod:'Actual image tool output when requested and available; otherwise a rendered HTML/CSS study',comparison:ref.scope==='component'?'Match the affected region and preserve layout, type, icons, routes and hit targets.':'Compare representative desktop/mobile composition against the approved direction.',status:'Recorded reference analysis; implementation still requires rendered verification'};
 });
}
