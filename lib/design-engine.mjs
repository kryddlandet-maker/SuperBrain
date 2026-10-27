import {chooseDesignTheme} from './design-themes.mjs';
import {choosePalette} from './color-direction.mjs';
import {referencePlan} from './reference-plan.mjs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {validateBrief} from './project-schema.mjs';
import {routeSkills} from './skill-router.mjs';
import {planProductMotion} from './product-motion.mjs';
const {profiles}=JSON.parse(await readFile(fileURLToPath(new URL('../data/business-profiles.json',import.meta.url)),'utf8'));
export function inferMode(brief){
 if(brief.mode)return brief.mode;
 if(brief.references?.length&&brief.references.every(ref=>ref.scope==='component'))return 'quick-edit';
 const task=brief.task||'';
 if(/^(fix|adjust|change|edit|repair|ändra|justera|fixa|korrigera)\b/i.test(task)&&!/(redesign|new page|ny sida|bygg om)/i.test(task))return 'quick-edit';
 return brief.motion==='immersive'||brief.techniques?.includes('graphics')?'creative-engineering':'design-build';
}
export function planDesign(input){
 const brief=structuredClone(validateBrief(input));const profile=profiles[brief.type],mode=inferMode(brief);
 const preferences={creativeFreedom:5,motionIntensity:profile.motion,visualComplexity:4,contentDensity:profile.density,expressiveness:5,...brief.preferences};
 if(brief.motion==='quiet')preferences.motionIntensity=Math.min(preferences.motionIntensity,2);
 if(brief.motion==='immersive'&&brief.preferences?.motionIntensity===undefined)preferences.motionIntensity=7;
 const themeChoice=chooseDesignTheme(brief,profile);
 const colorChoice=choosePalette(brief,profile,themeChoice);
 let direction={identity:brief.direction||profile.identity,origin:brief.direction?'user-specified':'proposed starting hypothesis',composition:profile.composition,imagery:profile.imagery,displayFont:profile.display,bodyFont:profile.body,palette:[...colorChoice.colors],colorSelection:colorChoice,motionCharacter:preferences.motionIntensity<=2?'Quiet state feedback':preferences.motionIntensity>=7?'Reversible product choreography':'Bounded response to visitor input'};
 if(themeChoice)direction={...direction,identity:brief.direction||profile.identity+' / '+themeChoice.label,composition:themeChoice.composition,displayFont:themeChoice.displayFont,bodyFont:themeChoice.bodyFont,designSelection:themeChoice};
 if(brief.artDirection)direction={...direction,...brief.artDirection,palette:[...(brief.artDirection.palette||direction.palette)],origin:'Explicit structured choices with profile fallbacks'};
 if(preferences.creativeFreedom>=7)direction.composition+=' Explore deliberate asymmetry and varied crop while preserving the visitor task.';
 if(preferences.creativeFreedom<=2)direction.composition+=' Favor a restrained aligned composition with minimal ornamental variation.';
 if(brief.accent)direction.palette[2]=brief.accent;
 const routes=[...(brief.pages||profile.pages)];
 const decisions=mode==='quick-edit'?[{area:'scope',choice:brief.task||brief.goal,reason:'Apply the requested edit inside the existing system; do not propose a new identity.'}]:[
 {area:'business',choice:brief.goal,reason:'The supplied visitor goal governs hierarchy and actions.'},
 {area:'art-direction',choice:direction.identity,reason:brief.direction?'Explicit identity is recorded; reconcile proposed token/layout defaults with this direction before implementation.':'A business-specific hypothesis to validate against assets and rendering, not a mandatory theme.'},
 ...(themeChoice?[{area:'visual-language',choice:themeChoice.label+' / '+themeChoice.layout,reason:themeChoice.reason}]:[]),
 {area:'color',choice:direction.palette.join(', '),reason:colorChoice.reason},
 {area:'layout',choice:direction.composition,reason:brief.type==='crm'?'Operational tasks need stable navigation and legible dense data.':'Place supplied evidence and the visitor task ahead of decoration.'},
 {area:'interaction',choice:direction.motionCharacter,reason:'Motion intensity follows the brief; keyboard, touch and reduced motion retain all tasks.'}
 ];
 if(mode==='quick-edit')direction={identity:'Existing project direction',origin:'Preserved; read project memory',composition:'Preserve the existing layout and content.',imagery:'Preserve existing imagery',displayFont:null,bodyFont:null,palette:[],motionCharacter:'Preserve existing motion except the requested interaction'};
 const unknowns=mode==='quick-edit'?['Inspect the actual affected component and its current states before editing.']:[...(!brief.audience?['Confirm the actual audience.']:[]),...(!brief.facts?['Supply verified content, proof and action destinations.']:[]), 'Confirm asset rights and loaded font files; fallback stacks are not proof of custom font availability.'];
 return {schema:1,version:'2.0.0-rc.4',mode,productMotion:planProductMotion(brief,mode),facts:{name:brief.name,type:brief.type,goal:brief.goal,audience:brief.audience||null,verifiedContent:brief.facts||null,competitors:brief.competitors||null,constraints:brief.constraints||null},direction,preferences,routes,pageExceptions:brief.pageExceptions||{},references:referencePlan(brief.references),decisions,unknowns,routing:routeSkills(brief,mode),preservation:mode==='quick-edit'?'Preserve the existing system, layout, route map and working behavior; apply only the requested edit.':'Preserve existing verified business facts, data and working flows.',brief};
}
export function planMarkdown(plan){return '# Design decisions: '+plan.facts.name+'\n\nMode: '+plan.mode+'\n\n'+plan.preservation+'\n\n'+plan.decisions.map(d=>'## '+d.area+'\n'+d.choice+'\n\nReason: '+d.reason).join('\n\n')+(plan.productMotion?'\n\n## Product motion contract\n'+JSON.stringify(plan.productMotion,null,2):'')+(plan.references.length?'\n\n## Recorded reference scope\n'+JSON.stringify(plan.references,null,2):'')+'\n\n## Unknowns\n'+plan.unknowns.map(x=>'- '+x).join('\n')+'\n\n## Selective references\n'+plan.routing.references.map(id=>'- '+id+': '+plan.routing.reasons[id]).join('\n')+'\n';}
