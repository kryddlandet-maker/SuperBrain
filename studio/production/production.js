document.querySelector('#production-spec').addEventListener('submit',event=>{
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),spec={name:values.name.trim(),goal:values.goal.trim(),tier:values.tier,budget:{limit:Number(values.limit),currency:values.currency}};
  if(values.origin){const url=new URL(values.origin);if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password){document.querySelector('#spec-status').textContent='Ange en HTTPS-adress utan undersida eller inloggningsuppgifter.';return;}spec.site={origin:url.origin};}
  const url=URL.createObjectURL(new Blob([JSON.stringify(spec,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='superbrain-production.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#spec-status').textContent='Underlaget är nedladdat. Ge filen till SuperBrain i projektets Codex-chatt.';
});
