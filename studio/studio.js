const form=document.querySelector('#brief-form');
const output=document.querySelector('#brief-output');
const status=document.querySelector('#status');
let brief='';
let inspirationIdeas=[];
const autoSelectedFamilies=new Set(),editedFamilies=new Set();
form.addEventListener('change',event=>{if(event.target.name==='techniques')editedFamilies.add(event.target.value);});
form.addEventListener('submit',async event=>{
  event.preventDefault();
  const values=Object.fromEntries(new FormData(form));
  const data={...values};data.techniques=new FormData(form).getAll('techniques');if(!data.techniques.length)delete data.techniques;
  if(inspirationIdeas.length)data.direction=[data.direction,'Inspirationsstudier från SuperBrain (anpassa till projektets egen identitet):',...inspirationIdeas.map(item=>'- '+item.title+' ('+item.href+'): '+item.description)].filter(Boolean).join('\n');
  if(values.pages.trim())data.pages=values.pages.split(',').map(p=>p.trim());else delete data.pages;
  const button=form.querySelector('button[type=submit]');button.disabled=true;status.textContent='Sammanställer relevant kunskap…';
  try{
    const response=await fetch('/api/brief',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const text=await response.text();if(!response.ok)throw new Error(text);
    brief=text;output.value=brief;document.querySelector('#result').hidden=false;status.textContent='Briefen är klar. Kopiera texten eller ladda ner den nedan.';
  }catch(error){status.textContent=`Kunde inte skapa brief: ${error.message}`;}
  finally{button.disabled=false;}
});
document.querySelector('#download').addEventListener('click',()=>{
  if(!brief)return;
  const url=URL.createObjectURL(new Blob([brief],{type:'text/markdown;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='superbrain-project-brief.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

async function receiveIdeas(){
  const ids=[...new Set((new URLSearchParams(location.search).get('ideas')||'').split(','))].slice(0,100);if(!ids.some(Boolean))return;
  try{
    const response=await fetch('/api/studio');if(!response.ok)throw new Error('Biblioteket kunde inte läsas');
    const catalog=await response.json();inspirationIdeas=catalog.items.filter(item=>ids.includes(item.id));if(!inspirationIdeas.length)return;
    for(const family of new Set(inspirationIdeas.flatMap(item=>item.techniques))){
      if(editedFamilies.has(family))continue;
      const checkbox=form.querySelector('input[name="techniques"][value="'+family+'"]');if(checkbox)checkbox.checked=true;
      const option=form.querySelector('select[name="techniques"] option[value="'+family+'"]');if(option)option.selected=true;
      autoSelectedFamilies.add(family);
    }
    const note=document.querySelector('#inspiration-selection');if(!note)return;note.hidden=false;
    const description=document.createElement('p');description.textContent='Med från biblioteket: '+inspirationIdeas.map(item=>item.title).join(', ')+'. Teknikfamiljerna är förslag som du kan ändra nedan.';
    const remove=document.createElement('button');remove.type='button';remove.textContent='Ta bort inspirationsvalen';remove.addEventListener('click',()=>{inspirationIdeas=[];note.hidden=true;for(const family of autoSelectedFamilies){if(editedFamilies.has(family))continue;const checkbox=form.querySelector('input[name="techniques"][value="'+family+'"]');if(checkbox)checkbox.checked=false;const option=form.querySelector('select[name="techniques"] option[value="'+family+'"]');if(option)option.selected=false;}const url=new URL(location.href);url.searchParams.delete('ideas');history.replaceState({},'',url.pathname+url.search);});note.replaceChildren(description,remove);
  }catch{status.textContent='Inspirationsvalen kunde inte läsas. Du kan fortfarande skapa en brief med egna val.';}
}
receiveIdeas();
