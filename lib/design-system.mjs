import {createHash} from 'node:crypto';
import {planDesign,planMarkdown} from './design-engine.mjs';
const luminance=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
export const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
const onColor=color=>contrast(color,'#ffffff')>=contrast(color,'#151515')?'#ffffff':'#151515';
const mix=(a,b,t)=>'#'+a.slice(1).match(/../g).map((v,i)=>Math.round(parseInt(v,16)*(1-t)+parseInt(b.slice(1).match(/../g)[i],16)*t).toString(16).padStart(2,'0')).join('');
export function flattenTokens(value,prefix=[]){return Object.entries(value).flatMap(([key,item])=>item&&typeof item==='object'?flattenTokens(item,[...prefix,key]):[[[...prefix,key].join('-'),String(item)]]);}
export function tokensCSS(tokens,selector=':root'){return selector+' {\n'+flattenTokens(tokens).map(([name,value])=>'  --sb-'+name+': '+value+';').join('\n')+'\n}\n';}
export function generateDesignSystem(input){
 const plan=planDesign(input);if(plan.mode==='quick-edit')return {plan,tokens:null,files:{'.ai/project/superbrain/EDIT.md':planMarkdown(plan)}};
 const [background,preferredInk,accent]=plan.direction.palette,ink=contrast(background,preferredInk)>=4.5?preferredInk:onColor(background);
 const density=plan.preferences.contentDensity,spacing=density>=7?[4,8,12,16,24,32,48]:density<=3?[4,8,16,24,40,64,96]:[4,8,16,24,32,48,72];
 const intensity=plan.preferences.motionIntensity;
 const tokens={
 color:{background,surface:mix(background,ink,.035),ink,muted:mix(background,ink,.76),accent,'on-accent':onColor(accent),border:mix(background,ink,.38),focus:ink,success:contrast(background,'#28633e')>=4.5?'#28633e':'#a7d9ac',error:contrast(background,'#a52c32')>=4.5?'#a52c32':'#ffb6ba'},
 type:{display:plan.direction.displayFont,body:plan.direction.bodyFont,bodySize:'1rem',bodyLine:'1.6',small:'0.875rem',h1:plan.facts.type==='crm'?'clamp(2rem, 1.5rem + 2vw, 3.25rem)':(plan.preferences.expressiveness<=2?'clamp(2.5rem, 1.5rem + 3vw, 4rem)':'clamp(2.5rem, 1.5rem + 5vw, 6rem)'),h2:'clamp(1.75rem, 1.2rem + 2vw, 3rem)',h3:'clamp(1.25rem, 1.05rem + 1vw, 1.75rem)',measure:'68ch'},
 space:Object.fromEntries(spacing.map((n,i)=>[i+1,n+'px'])),
 grid:{max:plan.facts.type==='crm'?'1600px':'1440px',gutter:'clamp(20px, 4vw, 64px)',columns:12,gap:spacing[3]+'px'},
 breakpoint:{compact:'40rem',wide:'64rem'},
 radius:{control:plan.facts.type==='crm'?'6px':'4px',surface:plan.preferences.expressiveness>=7?'16px':'8px',round:'999px'},
 shadow:{raised:plan.preferences.visualComplexity<=2?'none':'0 12px 32px rgb(0 0 0 / 0.12)',focus:'0 0 0 3px var(--sb-color-background)'},
 lighting:{size:'160px',strength:intensity<=2?'0.12':'0.24'},
 motion:{feedback:'160ms',transition:intensity<=2?'220ms':'420ms',scene:intensity>=7?'800ms':'560ms',ease:'cubic-bezier(0.22, 1, 0.36, 1)',spring:{stiffness:180,damping:24,mass:1}}
 };
 const css=tokensCSS(tokens)+
 '\n.sb-surface { background:var(--sb-color-background);color:var(--sb-color-ink);font-family:var(--sb-type-body);line-height:var(--sb-type-bodyLine); }\n.sb-shell { max-width:var(--sb-grid-max);margin-inline:auto;padding-inline:var(--sb-grid-gutter); }\n.sb-heading { font-family:var(--sb-type-display);font-size:var(--sb-type-h1);line-height:1.08;overflow-wrap:anywhere; }\n.sb-button { display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:12px 22px;background:var(--sb-color-accent);color:var(--sb-color-on-accent);border:1px solid transparent;border-radius:var(--sb-radius-control);font:inherit;cursor:pointer;transition:filter var(--sb-motion-feedback) var(--sb-motion-ease); }\n.sb-button:hover:not(:disabled) { filter:brightness(1.06); }\n.sb-button:active:not(:disabled) { filter:brightness(0.94); }\n.sb-button:disabled { cursor:not-allowed;filter:grayscale(1); }\n.sb-button:focus-visible { outline:3px solid var(--sb-color-focus);outline-offset:4px; }\n.sb-button[aria-busy=true] { cursor:progress; }\n@media(prefers-reduced-motion:reduce) { .sb-button { transition:none; } }\n';
 const files={
 'design-system/tokens.json':JSON.stringify({schema:1,tokens,pageExceptions:plan.pageExceptions},null,2)+'\n',
 'design-system/tokens.css':css,
 'design-system/MASTER.md':planMarkdown(plan)+'\n## Token contract\nImport tokens.css in code. tokens.json is the source of the same generated values. Update through the generator; locally edited managed files block overwrite. Font stacks are fallback proposals; confirm available licensed font assets before selecting final brand type.\n\nPalette: '+[background,ink,accent].join(', ')+'\n\n## Accessibility and states\nSupplied ink/background and on-accent/accent pairs meet 4.5:1 numerically. Image, gradient, overlay, hover, focus and disabled states still require rendered review. Preserve native scrolling, keyboard focus, touch actions and honest loading/error/success feedback.\n',
 'design-system/components/buttons.md':'# Button contract\n\nUse native button or destination anchor with sb-button. Default/hover/active/focus/disabled/busy states share semantic tokens. Busy text and aria-busy describe the real pending operation; only verified success changes the label. Pointer decoration never moves the hit target.\n',
 'design-system/motion/presets.json':JSON.stringify(tokens.motion,null,2)+'\n',
 '.ai/project/superbrain/project.json':JSON.stringify({schema:1,facts:plan.facts,direction:plan.direction,preferences:plan.preferences,routes:plan.routes,pageExceptions:plan.pageExceptions,decisions:plan.decisions,references:plan.references,unknowns:plan.unknowns,routing:plan.routing},null,2)+'\n',
 '.ai/project/superbrain/NEXT.md':'# Resume this project\n\nRead project.json and design-system/MASTER.md before relevant reference chapters. Validate the proposed direction against supplied assets and an early render. Record actual implementation paths and QA artifacts in a project-owned journal; do not convert this project identity into a reusable skill rule.\n'
 };
 for(const route of plan.routes){
 const id=createHash('sha256').update(route).digest('hex').slice(0,12),exception=plan.pageExceptions[route]||{};
 files['design-system/pages/'+id+'.json']=JSON.stringify({route,inherits:'../tokens.json',exception},null,2)+'\n';
 files['design-system/pages/'+id+'.md']='# '+route+'\n\nInherits MASTER.md and tokens.css.\n\n'+(exception.purpose||'Use the real visitor task for this route.')+'\n\nLayout: '+(exception.layout||plan.direction.composition)+'\n'+(exception.density!==undefined?'Content density: '+exception.density+'/10 (page-specific).\n':'');
 if(exception.density!==undefined){const pageSpace=exception.density>=7?'16px':exception.density<=3?'40px':'24px';files['design-system/pages/'+id+'.css']='[data-sb-page="'+route+'"] { --sb-page-gap: '+pageSpace+'; }\n';}
 }
 return {plan,tokens,files,contrast:{body:contrast(background,ink),action:contrast(accent,tokens.color['on-accent']),muted:contrast(background,tokens.color.muted)}};
}
