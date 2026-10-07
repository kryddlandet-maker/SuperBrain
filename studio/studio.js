const form=document.querySelector('#brief-form');
const output=document.querySelector('#brief-output');
const status=document.querySelector('#status');
let brief='';
form.addEventListener('submit',async event=>{
  event.preventDefault();
  const values=Object.fromEntries(new FormData(form));
  const data={...values};
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
