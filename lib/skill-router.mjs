import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {wantsProductMotion} from './product-motion.mjs';
import {wantsCinematicMotion} from './cinematic-plan.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const metadata={
 architecture:['E',['route','navigation','sitemap','undersida'],[]],
 'art-direction':['A',['design','identity','riktning'],[]],
 'typography-layout':['A',['font','type','spacing','layout','färg','color'],[]],
 continuity:['A',['continuity','flow','övergång'],[]],
 'local-business':['F',['salon','construction','local'],[]],
 technology:['F',['technology','ai','saas','futuristic'],[]],
 motion:['C',['motion','animation','rörelse'],['accessibility']],
 'interactive-effects':['C',['scroll','cursor','pointer'],['motion','motion-lifecycle']],
 accessibility:['E',['keyboard','touch','focus','accessibility'],[]],
 'assets-performance':['G',['image','gpu','assets','performance'],[]],
 review:['G',['audit','critique','review','granska'],[]],
 'effect-selection':['C',['scroll','effects','animation'],['motion']],
 'visual-materials':['A',['glass','material','grain','ljus'],['accessibility']],
 'type-motion':['C',['text reveal','type motion'],['motion']],
 'product-stories':['C',['product','camera','cinematic','rotation'],['motion','assets-performance']],
 'galleries-commerce':['B',['gallery','commerce','carousel','images'],['accessibility']],
 'advanced-graphics':['D',['webgl','shader','three','3d'],['assets-performance','motion-lifecycle']],
 'site-archetypes':['F',['portfolio','restaurant','ecommerce','real-estate','automotive'],[]],
 'button-interactions':['B',['button','knapp','pointer','magnet','hover'],['accessibility']],
 'accessible-actions':['B',['form','save','submit','crm','state'],['accessibility']],
 'motion-lifecycle':['G',['cleanup','cancel','animation','motion'],['accessibility']],
 'library-discovery':['H',['research','discover','reference'],[]],
 'design-intelligence':['H',['design-build','direction','decision'],[]],
 'design-systems':['A',['tokens','design system','theme'],['accessibility']],
 'visual-critique':['G',['critique','audit','comparison'],['review']],
 'reference-workflow':['H',['reference image','vision','scope'],[]],
 'product-motion':['C',['product animation','feature demo','bento motion','produktanimation','rörliga kort','rörliga rutor'],['motion','motion-lifecycle','assets-performance']],
 'cinematic-media':['C',['cinematic hero','scrollfilm','scrollvideo','filmisk hero','media time','film review'],['motion','motion-lifecycle','assets-performance']],
 'film-tracking':['C',['camera tracking','kameraspårning','planar','perspective text','perspektivtext'],['cinematic-media']],
 'depth-media':['D',['depth map','djupkarta','bilddjup','image depth'],['advanced-graphics']],
 'inspiration-effects':['C',['marquee','countup','rotator','pinned rail','split text','sheen'],['motion','motion-lifecycle']],
 'production-workflow':['H',['production','produktion','budget','deliver','handover','publicera'],[]],
 'inbox-forms':['B',['inbox','inkorg','form backend','formulärbackend'],['accessible-actions']],
 'anthropic-skills':['H',['anthropic','claude','frontend-design','web-artifacts-builder','webapp-testing','skill-creator'],[]]
};
export const skillIndex=Object.entries(metadata).map(([id,[category,triggers,dependencies]])=>({id,category,triggers,dependencies,path:'skills/superbrain/references/'+id+'.md',status:'guidance',qualityScope:'Authored guidance; linked runnable tools have their own evidence.',source:id==='product-motion'?'docs/PRODUCT-MOTION-RESEARCH.md':id==='cinematic-media'?'docs/CINEMATIC-MEDIA.md':id==='anthropic-skills'?'vendor/anthropic/manifest.json':'docs/RESEARCH-2.0.md',conflicts:id==='advanced-graphics'?['quick-edit','quiet-motion']:[],useCase:triggers.join(', ')}));
export function searchSkills(query=''){const terms=query.toLowerCase().split(/\s+/).filter(Boolean);return skillIndex.filter(s=>terms.every(t=>(s.id+' '+s.useCase+' '+s.category).toLowerCase().includes(t)));}
export function routeSkills(brief,mode){
 const selected=new Set(),reasons={};const add=(id,why)=>{if(selected.has(id))return;selected.add(id);reasons[id]=why;for(const dep of skillIndex.find(s=>s.id===id)?.dependencies||[])add(dep,'Dependency of '+id);};
 add('accessibility','All affected controls and routes must remain usable');if(brief.references?.length)add('reference-workflow','Recorded source and target scope');
 const text=[brief.task,brief.goal,brief.direction].filter(Boolean).join(' ').toLowerCase();
 if(/anthropic|claude|frontend-design|web-artifacts-builder|webapp-testing|skill-creator/.test(text))add('anthropic-skills','Explicit request for optional original Anthropic packages');
 if(/kameraspår|camera.track|planar|perspektiv|perspective.text/.test(text))add('film-tracking','Tracked planar film was requested');
 if(/djupkarta|bilddjup|depth.map|image.depth/.test(text))add('depth-media','Image-based relative depth was requested');
 if(/marquee|countup|rotator|pinned.rail|split.text|sheen/.test(text))add('inspiration-effects','A reusable small effect was requested');
 if(/production|produktion|budget|handover|leverans|publicera/.test(text))add('production-workflow','Production or delivery was requested');
 if(/inbox|inkorg|form.back.?end|formulärback/.test(text))add('inbox-forms','A real form inbox was requested');
 if(wantsProductMotion(brief))add('product-motion','A coordinated feature demonstration was requested');
 if(mode==='quick-edit'){
  if(/button|knapp|hover|pointer|magnet/.test(text)||(brief.techniques||[]).includes('buttons'))add('button-interactions','Bounded control edit');
  else add('typography-layout','Bounded visual edit');
  if(/motion|animation|hover/.test(text))add('motion-lifecycle','Interruption and cleanup');
  return {references:[...selected],reasons,conflicts:[]};
 }
 if(wantsCinematicMotion(brief))add('cinematic-media','An optional scroll-driven film scene was requested');
 for(const id of ['architecture','art-direction','typography-layout','continuity','design-intelligence','design-systems','review','assets-performance','motion'])add(id,'Design/build foundation');
 if(['salon','construction'].includes(brief.type))add('local-business','Business context');
 if(['technology','ai'].includes(brief.type))add('technology','Product context');
 if(['portfolio','ecommerce','restaurant','real-estate','automotive'].includes(brief.type))add('site-archetypes','Business context');
 if(['portfolio','ecommerce'].includes(brief.type))add('galleries-commerce','Browsing actual work/products');
 if(brief.type==='crm'||/form|submit|save|state|formulär/.test(text))add('accessible-actions','Honest state and action feedback');
 if(brief.motion!=='quiet'&&(mode==='creative-engineering'||/scroll|cursor|pointer|animation/.test(text)))add('interactive-effects','Explicit interaction need');
 const map={materials:'visual-materials',type:'type-motion',product:'product-stories',images:'galleries-commerce',graphics:'advanced-graphics',buttons:'button-interactions',scenes:'product-motion',cinematic:'cinematic-media'};
 const conflicts=[];
 for(const family of brief.techniques||[]){if(family==='graphics'&&brief.motion==='quiet')conflicts.push('Use graphics as a static/optional enhancement under quiet motion; do not start a perpetual loop.');if(family==='cinematic'&&brief.motion==='quiet')conflicts.push('Keep the cinematic scene static first under quiet motion; film loading and scroll playback need an explicit local choice.');add(map[family],'Explicit '+family+' family');}
 if(/reference|vision|bildreferens/.test(text))add('reference-workflow','Reference-led request');
 return {references:[...selected],reasons,conflicts};
}
export async function loadRoutedGuidance(routing){return Promise.all(routing.references.map(async id=>({id,text:await readFile(path.join(root,skillIndex.find(s=>s.id===id).path),'utf8')})));}
