import {readFile} from 'node:fs/promises';
const registry=JSON.parse(await readFile(new URL('../data/color-families.json',import.meta.url),'utf8'));
export const colorFamilies=registry.families;
export const paletteFamilies=colorFamilies.map(f=>f.id);
export function choosePalette(brief,profile){
 const family=brief.paletteFamily||profile.colorFamily;
 const entry=colorFamilies.find(f=>f.id===family);
 const mode=brief.theme||profile.colorMode||'light';
 let colors,source,reason;
 if(brief.artDirection?.palette){colors=[...brief.artDirection.palette];source='custom-palette';reason='Explicit background, text and accent colors take precedence over starting profiles, family and theme. Verify the rendered identity; text tokens may adjust for contrast.';}
 else if(brief.paletteFamily||brief.theme){colors=[...entry[mode]];source=brief.paletteFamily?'chosen-family':'chosen-theme';reason='The selected family and theme provide an editable starting palette; no business type requires this hue.';}
 else{colors=[...profile.palette];source='starting-hypothesis';reason='An editable starting hypothesis. Select colors from verified brand assets, reference observations and the intended character; do not copy demo greens or repeat a previous project.';}
 if(brief.accent){colors[2]=brief.accent;reason+=' The explicit accent overrides the accent role.';}
 return {colors,family:source==='custom-palette'?null:family,source,reason,alternatives:(profile.paletteOptions||[]).filter(id=>id!==family).map(id=>({family:id,label:colorFamilies.find(f=>f.id===id).label}))};
}
