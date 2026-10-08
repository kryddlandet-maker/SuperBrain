const form=document.querySelector('.atlas-controls');form.hidden=false;
const search=document.querySelector('#technique-search'),family=document.querySelector('#family'),evidence=document.querySelector('#evidence');
const cards=[...document.querySelectorAll('.technique')];const text=new Map(cards.map(card=>[card,card.textContent.toLocaleLowerCase('sv')]));
function filter(){const query=search.value.trim().toLocaleLowerCase('sv');for(const card of cards)card.hidden=!((!query||text.get(card).includes(query))&&(family.value==='all'||card.dataset.family===family.value)&&(evidence.value==='all'||(evidence.value==='local'?card.dataset.status.startsWith('local-'):card.dataset.status===evidence.value)));document.querySelector('#atlas-status').textContent=cards.filter(c=>!c.hidden).length+' tekniker visas.';}
form.addEventListener('submit',e=>e.preventDefault());search.addEventListener('input',filter);family.addEventListener('change',filter);evidence.addEventListener('change',filter);
