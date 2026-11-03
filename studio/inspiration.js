import {filterStudies,parseSavedIdeas,inspirationText} from './inspiration-model.js';
const $=selector=>document.querySelector(selector);
const icons={
  grid:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="13" y="3" width="6" height="6" rx="1"/><rect x="3" y="13" width="6" height="6" rx="1"/><rect x="13" y="13" width="6" height="6" rx="1"/>',
  bookmark:'<path d="M6 3h10v17l-5-4-5 4z"/>',
  buttons:'<rect x="2" y="6" width="18" height="10" rx="4"/><path d="m10 9 3 2-3 2"/>',
  pointer:'<path d="m6 2 13 10-7 1-3 7z"/><path d="m14 15 3 4"/>',
  scroll:'<path d="M6 3h10M6 19h10M11 6v10m-3-3 3 3 3-3"/>',
  product:'<rect x="3" y="4" width="16" height="14" rx="2"/><path d="M3 8h16m-11 3 3 3 4-4"/>',
  graphics:'<path d="m11 2 9 5v10l-9 5-9-5V7zm-9 5 9 5 9-5m-9 5v10"/>',
  images:'<rect x="3" y="3" width="16" height="16" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 16 5-5 4 4 3-3 4 4"/>',
  websites:'<rect x="2" y="3" width="18" height="16" rx="2"/><path d="M2 8h18M6 5.5h.1m3 0h.1"/>',
  tools:'<path d="m5 3 14 14-3 3L2 6zm9 4 4-4 2 2-4 4M5 14l-3 6 6-3"/>',
  sliders:'<path d="M3 5h7m4 0h5M3 11h3m4 0h9M3 17h10m4 0h2"/><circle cx="12" cy="5" r="2"/><circle cx="8" cy="11" r="2"/><circle cx="15" cy="17" r="2"/>',
  document:'<path d="M5 2h8l4 4v14H5zm8 0v5h4M8 11h6m-6 4h6"/>',
  book:'<path d="M11 5C7 2 4 3 2 4v15c3-2 6-2 9 0 3-2 6-2 9 0V4c-3-2-6-2-9 1zm0 0v14"/>',
  search:'<circle cx="9.5" cy="9.5" r="6.5"/><path d="m14 14 6 6"/>',
  spark:'<path d="m11 2 2.4 6.6L20 11l-6.6 2.4L11 20l-2.4-6.6L2 11l6.6-2.4z"/>',
  auto:'<path d="m9 5 8 6-8 6z"/><path d="M4 6v10"/>',
  click:'<path d="M8 11V5a2 2 0 0 1 4 0v6m0-2h4l2 3-1 7H9l-5-6 2-2 3 3"/>',
  read:'<path d="M4 3h14v16H4zm3 4h8m-8 4h8m-8 4h5"/>'
};
const svg=name=>'<svg viewBox="0 0 22 22" aria-hidden="true">'+(icons[name]||icons.grid)+'</svg>';
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=svg(el.dataset.icon));
const storageKey='superbrain.studio.saved.v1',dialog=$('#study-dialog');
const state={query:'',category:'all',view:'all',sort:'recommended',study:null};
let catalog=null,saved=[],memoryOnly=false,toastTimer,returnFocus=null,previewObserver=null;
const make=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
const selectedItems=()=>catalog.items.filter(item=>saved.includes(item.id));
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
function readState(){
  const params=new URLSearchParams(location.search);
  state.query=(params.get('q')||'').slice(0,300);
  state.category=catalog.categories.some(c=>c.id===params.get('category'))?params.get('category'):'all';
  state.view=params.get('view')==='saved'?'saved':'all';state.sort=params.get('sort')==='name'?'name':'recommended';
  state.study=catalog.items.some(item=>item.id===params.get('study'))?params.get('study'):null;
}
function writeState(push=false){
  const params=new URLSearchParams();if(state.query)params.set('q',state.query);if(state.category!=='all')params.set('category',state.category);if(state.view!=='all')params.set('view',state.view);if(state.sort!=='recommended')params.set('sort',state.sort);if(state.study)params.set('study',state.study);
  const url=location.pathname+(params.size?'?'+params:'');history[push?'pushState':'replaceState']({},'',url);
}
function setFilter(change,push=true){Object.assign(state,change);state.study=null;writeState(push);render();if(change.category!==undefined||change.view!==undefined)window.scrollTo({top:0,behavior:'instant'});else if(window.scrollY>$('.catalog').offsetTop)$('.catalog').scrollIntoView({block:'start',behavior:'instant'});}
function updateSaved(id){
  const adding=!saved.includes(id);saved=adding?[...saved,id]:saved.filter(value=>value!==id);
  try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{memoryOnly=true;}
  render();
  if(state.study)renderDialogSave();
  notify(adding?(memoryOnly?'Idén är sparad under den här visningen.':'Idén är sparad till nästa bygge.'):'Idén har tagits bort från dina sparade.');
}
function nav(){
  const container=$('#category-nav');container.replaceChildren();
  const select=$('#mobile-category');select.replaceChildren(new Option('Alla kategorier','all'));
  for(const category of catalog.categories){
    const button=make('button',undefined,'nav-item');button.type='button';button.dataset.category=category.id;
    const icon=make('span',undefined,'nav-icon');icon.innerHTML=svg(category.id);
    const count=make('span',String(catalog.items.filter(item=>item.category===category.id).length),'nav-count');button.append(icon,make('span',category.label),count);
    button.addEventListener('click',()=>setFilter({category:category.id,view:'all'}));container.append(button);select.append(new Option(category.label,category.id));
  }
}
const interactionText={hover:'Rör muspekaren',scroll:'Scrolla i studien',auto:'Spelar i studien',click:'Prova interaktionen',read:'Utforska sidan'};
function card(item){
  const article=make('article',undefined,'study-card');article.dataset.studyId=item.id;
  const media=make('div',undefined,'study-media'),trigger=make('button',undefined,'study-trigger');trigger.type='button';trigger.setAttribute('aria-label','Förhandsvisa '+item.title);
  const img=make('img');img.src=item.preview.thumbnail;img.alt='';img.loading='lazy';img.decoding='async';img.width=960;img.height=600;
  trigger.append(img,make('span','Prova förhandsvisningen','preview-invitation'));trigger.addEventListener('click',()=>openStudy(item,trigger));
  const save=make('button',undefined,'save-button');save.type='button';save.dataset.studyId=item.id;save.innerHTML=svg('bookmark');save.setAttribute('aria-label',(saved.includes(item.id)?'Ta bort sparad idé: ':'Spara idé: ')+item.title);save.setAttribute('aria-pressed',String(saved.includes(item.id)));
  save.addEventListener('click',()=>{updateSaved(item.id);const next=document.querySelector('.save-button[data-study-id="'+item.id+'"]');(next||$('#studio-search')).focus({preventScroll:true});});media.append(trigger,save);
  const info=make('div',undefined,'card-information'),heading=make('div',undefined,'card-heading'),title=make('h3'),titleButton=make('button',item.title,'title-button');titleButton.type='button';titleButton.addEventListener('click',()=>openStudy(item,titleButton));title.append(titleButton);
  const link=make('a','↗','card-open');link.href=item.href;link.setAttribute('aria-label','Öppna hela studien: '+item.title);heading.append(title,link);
  const meta=make('div',undefined,'card-meta'),interaction=make('span',undefined,'interaction');interaction.innerHTML=svg(item.interaction==='hover'?'pointer':item.interaction);interaction.append(document.createTextNode(interactionText[item.interaction]));
  meta.append(make('span',catalog.categories.find(c=>c.id===item.category).label),interaction);info.append(heading,make('p',item.description),meta);article.append(media,info);return article;
}
function render(){
  if(!catalog)return;
  const items=filterStudies(catalog,{...state,saved});
  const category=catalog.categories.find(c=>c.id===state.category);
  $('#studio-search').value=state.query;$('#mobile-category').value=state.category;$('#sort-order').value=state.sort;
  document.querySelectorAll('[data-total]').forEach(el=>el.textContent=String(catalog.items.length));document.querySelectorAll('[data-saved-count]').forEach(el=>el.textContent=String(saved.length));
  document.querySelectorAll('[data-view]').forEach(button=>{const active=button.dataset.view===state.view&&(state.view==='saved'||state.category==='all');button.classList.toggle('is-active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  document.querySelectorAll('[data-category]').forEach(button=>{const active=state.view==='all'&&button.dataset.category===state.category;button.classList.toggle('is-active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  const title=state.view==='saved'?'Dina sparade idéer':category?.label||'Alla studier';
  $('#page-title').textContent=state.view==='saved'?'Idéer till nästa bygge.':category?.label||'Hitta nästa idé.';
  $('#page-description').textContent=state.view==='saved'?'Dina val samlade på ett ställe. Kombinera dem till en egen riktning.':category?.description||'Utforska effekter och interaktioner. Prova det du gillar och spara till nästa bygge.';
  $('#catalog-title').textContent=title;$('#result-count').textContent=items.length+' av '+catalog.items.length+' studier'+(state.query?' matchar din sökning.':' att utforska.');
  $('#featured-strip').hidden=state.view!=='all'||state.category!=='all'||!!state.query;
  $('#surprise').hidden=state.view!=='all'||state.category!=='all'||!!state.query;
  $('#clear-filters').hidden=state.category==='all'&&!state.query;
  const grid=$('#study-grid');grid.replaceChildren(...items.map(card));grid.setAttribute('aria-busy','false');
  const empty=$('#empty-state');empty.hidden=items.length>0;
  $('#empty-title').textContent=state.view==='saved'&&!saved.length?'Här samlas dina nästa idéer.':'Inga studier matchar just nu.';
  $('#empty-description').textContent=state.view==='saved'&&!saved.length?'Spara en studie med bokmärket, så finns den här när du vill bygga vidare.':'Prova ett annat sökord eller välj en annan kategori.';
  $('#saved-actions').hidden=state.view!=='saved'||saved.length===0;
  $('#saved-description').textContent=saved.length+' sparade idéer'+(memoryOnly?' under den här visningen.':' i den här webbläsaren.');
  const href='/studio/brief/'+(saved.length?'?ideas='+encodeURIComponent(saved.join(',')):'');$('#saved-brief').href=href;$('#header-brief').href=href;
}
function renderDialogSave(){const item=catalog.items.find(item=>item.id===state.study);if(!item)return;const isSaved=saved.includes(item.id);$('#dialog-save').textContent=isSaved?'Sparad till nästa bygge':'Spara idén';$('#dialog-save').setAttribute('aria-pressed',String(isSaved));}
function closePreview(){
  previewObserver?.disconnect();previewObserver=null;
  const frame=$('#live-preview iframe');if(frame){frame.src='about:blank';frame.remove();}
  $('#live-preview').replaceChildren();
}
function openStudy(item,trigger,push=true){
  returnFocus=trigger||returnFocus;state.study=item.id;
  $('#dialog-category').textContent=catalog.categories.find(c=>c.id===item.category).label;
  $('#dialog-title').textContent=item.title;$('#dialog-description').textContent=item.description;$('#dialog-open').href=item.href;
  $('#preview-help').textContent=interactionText[item.interaction]+'. Detta är den riktiga demonstrationen.';
  $('#live-preview').classList.remove('is-mobile');document.querySelectorAll('[data-viewport]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.viewport==='desktop')));
  closePreview();const frame=make('iframe');frame.title='Liveförhandsvisning: '+item.title;frame.src=item.preview.route;
  frame.addEventListener('load',()=>{if(!frame.isConnected)return;const position=()=>{try{if(frame.isConnected)frame.contentDocument?.querySelector(item.preview.selector)?.scrollIntoView({block:item.interaction==='scroll'?'start':'center',behavior:'instant'});}catch{}};position();previewObserver?.disconnect();if(window.ResizeObserver){previewObserver=new ResizeObserver(position);previewObserver.observe(frame);}});
  $('#live-preview').append(frame);renderDialogSave();if(!dialog.open)dialog.showModal();$('#close-dialog').focus();if(push)writeState(true);
}
dialog.addEventListener('close',()=>{closePreview();state.study=null;writeState();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else $('#studio-search').focus({preventScroll:true});});
dialog.addEventListener('cancel',closePreview);
$('#close-dialog').addEventListener('click',()=>{closePreview();dialog.close();});dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom){closePreview();dialog.close();}}});
$('#dialog-save').addEventListener('click',()=>{if(state.study)updateSaved(state.study);});
document.querySelectorAll('[data-viewport]').forEach(button=>button.addEventListener('click',()=>{$('#live-preview').classList.toggle('is-mobile',button.dataset.viewport==='mobile');document.querySelectorAll('[data-viewport]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setFilter({view:button.dataset.view,category:'all',query:''})));
document.querySelectorAll('[data-category-link]').forEach(link=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();setFilter({view:'all',category:link.dataset.categoryLink,query:''});$('#catalog-title').scrollIntoView({block:'nearest'});}));
$('#studio-search').addEventListener('input',event=>setFilter({query:event.target.value.slice(0,300)},false));
$('#mobile-category').addEventListener('change',event=>setFilter({category:event.target.value,view:'all'}));
$('#sort-order').addEventListener('change',event=>setFilter({sort:event.target.value}));
const reset=()=>setFilter({query:'',category:'all',view:'all'});$('#clear-filters').addEventListener('click',reset);$('#empty-reset').addEventListener('click',reset);
$('#surprise').addEventListener('click',()=>{if(!catalog)return;const choices=filterStudies(catalog,{...state,saved});const pool=choices.length?choices:catalog.items;openStudy(pool[Math.floor(Math.random()*pool.length)],$('#surprise'));});
$('#copy-ideas').addEventListener('click',async()=>{const text=inspirationText(selectedItems());try{await navigator.clipboard.writeText(text);notify('Idéerna är kopierade. Klistra in dem i nästa Codex-chatt.');}catch{const input=make('textarea');input.value=text;input.className='copy-fallback';input.style.cssText='position:fixed;left:20px;bottom:20px;width:calc(100% - 40px);height:180px;z-index:40';document.body.append(input);input.focus();input.select();notify('Kopiera den markerade texten med Ctrl/Cmd+C.');input.addEventListener('blur',()=>input.remove(),{once:true});}});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!dialog.open&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)){event.preventDefault();$('#studio-search').focus();}});
window.addEventListener('popstate',()=>{if(!catalog)return;const before=state.study;readState();render();if(state.study){openStudy(catalog.items.find(item=>item.id===state.study),null,false);}else if(dialog.open){dialog.close();}else if(before)closePreview();});
window.addEventListener('storage',event=>{if(event.key===storageKey&&catalog){saved=parseSavedIdeas(event.newValue,catalog.items);render();if(dialog.open)renderDialogSave();}});
async function load(){
  $('#load-error').hidden=true;$('#study-grid').setAttribute('aria-busy','true');
  try{
    const response=await fetch('/api/studio');if(!response.ok)throw new Error('Catalog unavailable');catalog=await response.json();
    if(!Array.isArray(catalog.items)||!Array.isArray(catalog.categories))throw new Error('Unsupported catalog');
    try{saved=parseSavedIdeas(localStorage.getItem(storageKey),catalog.items);}catch{saved=[];memoryOnly=true;}
    readState();nav();render();if(state.study)openStudy(catalog.items.find(item=>item.id===state.study),null,false);
    if(location.hash==='#brief')location.replace('/studio/brief/');
  }catch{$('#load-error').hidden=false;$('#result-count').textContent='Studierna är tillfälligt otillgängliga.';$('#study-grid').setAttribute('aria-busy','false');}
}
$('#retry-load').addEventListener('click',load);load();
