import {designThemeIds} from './design-themes.mjs';
import {paletteFamilies} from './color-direction.mjs';
import {referencePlan} from './reference-plan.mjs';
export const businessTypes = ['technology','ai','automotive','salon','construction','portfolio','ecommerce','real-estate','restaurant','crm','other'];
export const modes = ['quick-edit','design-build','creative-engineering'];
export function validateBrief(data) {
 if(!data || typeof data!=='object' || Array.isArray(data)) throw new Error('Brief must be an object');
 for(const field of ['name','type','goal']) if(typeof data[field]!=='string'||!data[field].trim()||data[field].length>8000)throw new Error('Missing or invalid '+field);
 if(!businessTypes.includes(data.type))throw new Error('Unknown business type');
 if(data.pages!==undefined&&(!Array.isArray(data.pages)||data.pages.length>40||data.pages.some(p=>typeof p!=='string'||!/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(p))||new Set(data.pages).size!==data.pages.length))throw new Error('Pages must be unique local route paths');
 if(data.motion!==undefined&&!['quiet','expressive','immersive'].includes(data.motion))throw new Error('Unknown motion level');
 for(const field of ['audience','direction','facts','questions','task','competitors','constraints'])if(data[field]!==undefined&&(typeof data[field]!=='string'||data[field].length>16000))throw new Error('Invalid '+field);
 if(data.techniques!==undefined&&(!Array.isArray(data.techniques)||data.techniques.some(t=>!['materials','type','product','images','graphics','buttons'].includes(t))||new Set(data.techniques).size!==data.techniques.length))throw new Error('Unknown or duplicate technique family');
 if(data.mode!==undefined&&!modes.includes(data.mode))throw new Error('Unknown workflow mode');
 if(data.preferences!==undefined){if(!data.preferences||typeof data.preferences!=='object'||Array.isArray(data.preferences))throw new Error('Invalid preferences');for(const [key,value]of Object.entries(data.preferences))if(!['creativeFreedom','motionIntensity','visualComplexity','contentDensity','expressiveness'].includes(key)||!Number.isFinite(value)||value<0||value>10)throw new Error('Preferences must be known 0–10 values');}
 if(data.designTheme!==undefined&&!designThemeIds.includes(data.designTheme))throw new Error('Unknown design theme');
 if(data.designVariation!==undefined&&(!Number.isInteger(data.designVariation)||data.designVariation<0||data.designVariation>9999))throw new Error('Design variation must be an integer from 0 to 9999');
 if(data.paletteFamily!==undefined&&!paletteFamilies.includes(data.paletteFamily))throw new Error('Unknown palette family');
 if(data.theme!==undefined&&!['light','dark'].includes(data.theme))throw new Error('Unknown theme');
 if(data.accent!==undefined&&!/^#[0-9a-f]{6}$/i.test(data.accent))throw new Error('Accent must be #RRGGBB');
 if(data.pageExceptions!==undefined){if(!data.pageExceptions||typeof data.pageExceptions!=='object'||Array.isArray(data.pageExceptions))throw new Error('Invalid page exceptions');for(const [route,rule]of Object.entries(data.pageExceptions)){if(!data.pages?.includes(route)||!rule||typeof rule!=='object'||Array.isArray(rule))throw new Error('Exception needs an existing route');for(const [key,value]of Object.entries(rule))if(!['purpose','layout','density'].includes(key)||(key==='density'?(!Number.isFinite(value)||value<0||value>10):(typeof value!=='string'||value.length>2000)))throw new Error('Invalid page exception');}}
 if(data.artDirection!==undefined){const a=data.artDirection;if(!a||typeof a!=='object'||Array.isArray(a))throw new Error('Invalid art direction');for(const [key,value]of Object.entries(a)){if(!['identity','composition','imagery','displayFont','bodyFont','palette','motionCharacter'].includes(key))throw new Error('Unknown art-direction choice');if(key==='palette'){if(!Array.isArray(value)||value.length!==3||value.some(c=>!/^#[0-9a-f]{6}$/i.test(c)))throw new Error('Palette needs three #RRGGBB colors');}else if(typeof value!=='string'||!value.trim()||value.length>2000)throw new Error('Invalid art-direction text');if(['displayFont','bodyFont'].includes(key)&&(!/^[-\p{L}\p{N}\s'",]+$/u.test(value)||value.length>160))throw new Error('Font choices must be family stacks, not CSS code');}}
 if(data.references!==undefined)referencePlan(data.references);
 return data;
}
