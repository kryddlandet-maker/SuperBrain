const form=document.querySelector('#search'),results=document.querySelector('#results'),status=document.querySelector('#status');
let controller,initialized=false;
const make=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
async function search(){
 controller?.abort();controller=new AbortController();
 const params=new URLSearchParams(new FormData(form));params.set('limit','500');status.textContent='Söker…';
 try {
  const response=await fetch('/api/library?'+params,{signal:controller.signal});
  if(!response.ok)throw new Error('Registret kunde inte läsas.');
  const data=await response.json();
  if(!initialized){
   for(const d of data.domains){const option=make('option',d.id+' · '+d.name);option.value=d.id;form.elements.domain.append(option);}
   form.hidden=false;initialized=true;
  }
  document.querySelector('#summary').textContent=data.summary.candidates+' kandidater · '+data.summary.domains+' områden · '+data.summary.capabilities+' kartlagda kapaciteter (omfattning)';
  results.replaceChildren();
  for(const c of data.candidates){
   const article=make('article');article.append(make('p',c.id+' · '+c.kind+' · '+c.maturity));article.firstChild.className='meta';
   article.append(make('h2',c.name),make('p',c.description),make('p',c.validation.scope));
   if(c.demo){const link=make('a','Prova demonstrationen ↗');link.href=c.demo;article.append(link);}
   const details=make('details');details.append(make('summary','Implementation och källor'),make('p',c.implementation));
   if(c.performance)details.append(make('p','Prestanda: '+c.performance));
   if(c.accessibility)details.append(make('p','Tillgänglighet: '+c.accessibility));
   if(c.reference)details.append(make('p','Ladda vid behov: '+c.reference));
   const list=make('ul');
   for(const id of c.sourceIds){const s=data.sources.find(s=>s.id===id);const item=make('li'),link=make('a',s.author||s.title||s.id);link.href=s.url;item.append(link);list.append(item);}
   details.append(list);article.append(details);results.append(article);
  }
  status.textContent=data.candidates.length+' träffar.';
 }catch(error){if(error.name!=='AbortError')status.textContent=error.message;}
}
form.addEventListener('submit',event=>{event.preventDefault();search();});
search();
