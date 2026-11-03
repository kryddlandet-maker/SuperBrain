export const normalizeSearch=value=>String(value??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase('sv').trim();
const featuredIds=['workflow-scene','scroll-film','horizontal-glow','procedural-light','pointer-reveal','technology-site','image-comparison','salon-site','connected-scroll','editing-scene','warm-side-light','filter-gallery'];
export function parseSavedIdeas(raw,items){
  let value;try{value=JSON.parse(raw||'[]');}catch{return [];}
  if(!Array.isArray(value))return [];
  const known=new Set(items.map(item=>item.id));
  return [...new Set(value.filter(id=>typeof id==='string'&&known.has(id)))].slice(0,100);
}
export function filterStudies(catalog,{query='',category='all',view='all',saved=[],sort='recommended'}={}){
  const terms=normalizeSearch(query).split(/\s+/).filter(Boolean),chosen=new Set(saved);
  const categoryNames=new Map(catalog.categories.map(c=>[c.id,c.label]));
  const items=catalog.items.filter(item=>{
    const text=normalizeSearch([item.title,item.description,categoryNames.get(item.category),...item.keywords].join(' '));
    return (category==='all'||category===item.category)&&(view!=='saved'||chosen.has(item.id))&&terms.every(term=>text.includes(term));
  });
  if(sort==='name')return items.sort((a,b)=>a.title.localeCompare(b.title,'sv'));
  const rank=id=>{const index=featuredIds.indexOf(id);return index<0?featuredIds.length:index;};
  return items.sort((a,b)=>rank(a.id)-rank(b.id));
}
export function inspirationText(items){
  return 'Använd SuperBrain. Bygg en egen webbplats utifrån min verksamhet och mitt mål.\n\nJag vill utforska dessa SuperBrain-studier:\n'+items.map(item=>'- '+item.title+' ('+item.href+'): '+item.description).join('\n')+'\n\nAnpassa idéerna till projektets innehåll, varumärke, mobil och tillgänglighet. Använd de relevanta delarna; studierna är inspiration till en egen helhet.\n';
}
