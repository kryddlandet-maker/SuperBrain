import {contrast} from './design-system.mjs';
export const criteria=['typography','composition','originality','consistency','brand-fit','motion','ux','responsive','accessibility','functionality'];
export function auditSnapshot(snapshot){
 if(snapshot?.schema!==1||!snapshot.viewport||!Array.isArray(snapshot.controls)||!Array.isArray(snapshot.texts))throw new Error('Invalid browser snapshot');
 const findings=[],unverified=[];const add=(rule,severity,selector,observation,fix)=>findings.push({rule,severity,selector,observation,fix,url:snapshot.url,viewport:snapshot.viewport});
 if(snapshot.overflow)add('overflow','P1','html','Page overflows the viewport.','Find the actual overflowing element; adapt its layout rather than hide overflow globally.');
 if(!snapshot.main)add('landmark','P2','body','No main landmark.','Use one main landmark around primary content.');
 if(!snapshot.headings.some(h=>h.level===1))add('h1','P2','main','No visible primary heading.','Provide a meaningful primary page heading.');
 for(const c of snapshot.controls){if(!c.name.trim())add('control-name','P1',c.selector,'Control has no accessible name.','Give the native control a visible label or appropriate accessible name.');if(c.fragmentMissing)add('fragment','P1',c.selector,'Anchor destination is missing.','Restore the target or correct the native link.');if(!c.disabled&&(c.width<24||c.height<24))add('target-size','P2',c.selector,'Target is smaller than 24px in one dimension; spacing exceptions need review.','Provide sufficient target dimensions/spacing and verify actual touch input.');}
 for(const image of snapshot.images||[]){if(!image.altPresent&&!image.decorative)add('image-alt','P1',image.selector,'Image has no alt attribute.','Add useful alternative text or empty alt for decorative imagery.');if(!image.loaded)add('image-load','P1',image.selector,'Image did not load.','Fix the actual source; preserve useful alternative content.');}
 for(const text of snapshot.texts){if(!text.foreground||!text.background){unverified.push({criterion:'contrast',selector:text.selector,reason:'Transparent text, image, gradient, blend or non-sRGB color needs rendered review.'});continue;}const ratio=contrast(text.foreground,text.background),large=text.size>=24||text.size>=18.66&&text.weight>=700,required=large?3:4.5;if(ratio<required)add('text-contrast','P1',text.selector,'Computed solid-color contrast '+ratio.toFixed(2)+':1; required '+required+':1.','Adjust semantic foreground/background tokens, then verify this state.');}
 return {schema:1,kind:'deterministic',url:snapshot.url,viewport:snapshot.viewport,findings,unverified,limits:['Sampled visible text and controls only; no full WCAG or screen-reader certification.','Focus, touch gestures, state changes and backend outcomes require recorded interaction tests.','Solid ancestor backgrounds only; effects and image-backed text remain unverified.']};
}
export function creativeReview(plan,snapshots,observations=[]){
 if(!snapshots?.length||snapshots.some(s=>!s.artifact))throw new Error('Creative review requires rendered screenshot artifacts');
 const artifacts=new Set(snapshots.map(s=>s.artifact));
 for(const o of observations)if(!criteria.includes(o.criterion)||!['strength','issue'].includes(o.kind)||!artifacts.has(o.artifact)||!o.observation||!o.reason||!o.reviewer||o.kind==='issue'&&(!['P1','P2','P3'].includes(o.priority)||!o.correction))throw new Error('Creative observations need criterion, reviewer, actual artifact, reason and targeted correction');
 const covered=new Set(observations.map(o=>o.criterion));
 return {schema:1,kind:'creative',status:criteria.every(c=>covered.has(c))?'reviewed':'needs-review',identity:plan.direction.identity,goal:plan.facts.goal,objectiveScore:null,observations,remaining:criteria.filter(c=>!covered.has(c)).map(criterion=>({criterion,prompt:'Inspect actual screenshots and interaction against '+plan.direction.identity+' and the goal: '+plan.facts.goal+'. Record a concrete observation and its reason.'})),artifacts:[...artifacts],limits:['Creative judgments are attributed observations, never an objective design score.','Screenshot inspection alone cannot establish motion or backend behavior.']};
}
export function refinementPlan(audits,review,{round=1,reason}={}){
 if(!Number.isInteger(round)||round<1||round>2&&!reason)throw new Error('Additional refinement rounds require a concrete reason');
 const fixes=audits.flatMap(a=>a.findings).map(f=>({source:'deterministic',priority:f.severity,route:f.url,target:f.selector,change:f.fix,evidence:f.observation}));
 fixes.push(...review.observations.filter(o=>o.kind==='issue').map(o=>({source:'creative',priority:o.priority,route:o.route,target:o.target||'Inspect cited screenshot',change:o.correction,evidence:o.artifact+': '+o.observation})));
 return {round,reason:reason||'One focused refinement followed by verification',fixes:fixes.sort((a,b)=>a.priority.localeCompare(b.priority)).slice(0,8),verify:['Re-render the same routes, viewport, input and motion preference.','Compare before/after findings without presenting fewer defects as aesthetic superiority.','Preserve working navigation, content, tokens and unrelated components.']};
}
