const properties=new Set(['color','background-color','font-family','font-size','font-weight','line-height','letter-spacing','padding','margin','border-radius','display','opacity','transform','width','height']);
export function validateChangeSpec(spec){
 if(!spec||typeof spec.target!=='string'||!spec.target.trim()||spec.target.length>300||!Array.isArray(spec.properties)||!spec.properties.length||spec.properties.some(p=>!properties.has(p))||!spec.expected||typeof spec.expected!=='object'||Array.isArray(spec.expected)||Object.keys(spec.expected).some(p=>!spec.properties.includes(p)||typeof spec.expected[p]!=='string')||!Object.keys(spec.expected).length||!Array.isArray(spec.preserve)||spec.preserve.length>20||spec.preserve.some(s=>typeof s!=='string'||!s.trim()||s.length>300)||spec.preserve.includes(spec.target))throw new Error('Change proof needs one target, supported properties, expected computed values and bounded preservation selectors');return spec;
}
// Serialized into a real browser. Captures only explicit selectors; no actions are activated.
export function captureChange(spec){
 const take=selector=>{const elements=document.querySelectorAll(selector);if(elements.length!==1)return {count:elements.length};const el=elements[0],style=getComputedStyle(el),r=el.getBoundingClientRect();return {count:1,text:el.textContent,visible:r.width>0&&r.height>0&&style.visibility!=='hidden'&&style.display!=='none',values:Object.fromEntries(spec.properties.map(p=>[p,style.getPropertyValue(p)]))};};
 return {schema:1,url:location.href,viewport:{width:innerWidth,height:innerHeight},motion:matchMedia('(prefers-reduced-motion: reduce)').matches?'reduce':'no-preference',spec,target:take(spec.target),preserved:Object.fromEntries(spec.preserve.map(s=>[s,take(s)]))};
}
export function compareChange(before,after){
 if(before?.schema!==1||after?.schema!==1)throw new Error('Expected captured change snapshots');validateChangeSpec(before.spec);
 if(before.url!==after.url||JSON.stringify(before.viewport)!==JSON.stringify(after.viewport)||before.motion!==after.motion||JSON.stringify(before.spec)!==JSON.stringify(after.spec))throw new Error('Compare the same URL, viewport, motion preference and change specification');
 const issues=[];if(before.target.count!==1||after.target.count!==1||!before.target.visible||!after.target.visible)issues.push('Target must be unique and visible in both captures');
 for(const [key,value]of Object.entries(before.spec.expected))if(after.target.values?.[key]!==value)issues.push('Expected '+key+' = '+value);
 const changed=before.spec.properties.some(p=>before.target.values?.[p]!==after.target.values?.[p]);if(!changed)issues.push('Requested computed properties did not change');
 for(const selector of before.spec.preserve)if(before.preserved[selector]?.count!==1||JSON.stringify(before.preserved[selector])!==JSON.stringify(after.preserved[selector]))issues.push('Preserved region changed or is ambiguous: '+selector);
 return {schema:1,status:issues.length?'needs-review':'verified-computed-change',changed,issues,limits:['Computed properties and sampled text do not prove aesthetic quality, all pixels, interactions, backend outcomes or unsampled regions.','Inspect paired screenshots; preserved regions are checked only for the requested properties and text.']};
}
