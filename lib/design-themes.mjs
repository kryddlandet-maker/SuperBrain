import {readFile} from 'node:fs/promises';
export const designThemes=JSON.parse(await readFile(new URL('../data/design-themes.json',import.meta.url),'utf8')).themes;
export const designThemeIds=designThemes.map(t=>t.id);
const suggestedFamilies=['blue','wine','copper','indigo','rose','neutral','cyan','coral','navy','amber','plum','slate','orange','sand','violet','chocolate','azure','pink','lavender','red','yellow','peach','teal','green'];
export function chooseDesignTheme(brief,profile){
 const variation=brief.designVariation;
 const theme=designThemes.find(t=>t.id===brief.designTheme)||(variation!==undefined?designThemes[variation%designThemes.length]:null);
 if(!theme)return null;
 const layout=variation===undefined?theme.layout:['split','stack','offset'][(['split','stack','offset'].indexOf(theme.layout)+Math.floor(variation/(designThemes.length*suggestedFamilies.length)))%3];
 return {...theme,layout,variation:variation??null,proposedFamily:variation===undefined?theme.colorFamily:suggestedFamilies[Math.floor(variation/designThemes.length)%suggestedFamilies.length],reason:brief.designTheme?'Selected visual language; user brand choices and actual business evidence retain precedence.':'Explicit variation selects a reproducible starting hypothesis. Compare it with previous project decisions; this is not a uniqueness guarantee.'};
}
