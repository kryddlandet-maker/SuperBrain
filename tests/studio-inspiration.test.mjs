import test from 'node:test';
import assert from 'node:assert/strict';
import {filterStudies,parseSavedIdeas,inspirationText} from '../studio/inspiration-model.js';
import {loadStudioCatalog} from '../lib/studio-catalog.mjs';
import {createServer} from '../scripts/serve.mjs';

test('inspiration discovery combines Swedish text, category, saved ideas and stable sorting',async()=>{
  const catalog=await loadStudioCatalog(),saved=['workflow-scene','scroll-film'];
  assert.equal(filterStudies(catalog).length,catalog.items.length);
  assert(filterStudies(catalog,{category:'buttons'}).every(item=>item.category==='buttons'));
  assert.deepEqual(new Set(filterStudies(catalog,{view:'saved',saved}).map(item=>item.id)),new Set(saved));
  assert.equal(filterStudies(catalog,{query:'film',category:'scroll',view:'saved',saved})[0].id,'scroll-film');
  const accent=filterStudies(catalog,{query:'fyllning fran vanster'});assert.equal(accent[0].id,'fill-left');
  assert.equal(filterStudies(catalog,{query:'xyz-ingen-träff'}).length,0);
  const names=filterStudies(catalog,{sort:'name'}).map(item=>item.title);assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,'sv')));
});
test('saved inspirations discard invalid state and create a usable reference handoff',async()=>{
  const catalog=await loadStudioCatalog();
  assert.deepEqual(parseSavedIdeas('{',catalog.items),[]);assert.deepEqual(parseSavedIdeas('{}',catalog.items),[]);
  assert.deepEqual(parseSavedIdeas('["scroll-film","unknown","scroll-film",5,null]',catalog.items),['scroll-film']);
  const text=inspirationText(catalog.items.filter(item=>item.id==='scroll-film'));
  assert(text.includes('/examples/cinematic-media/#film'));assert(text.includes('SuperBrain'));assert(text.includes(catalog.items.find(item=>item.id==='scroll-film').description));
});
test('studio catalog endpoint and direct brief route work without exposing repository sources',async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  try{
    const response=await fetch(base+'/api/studio');assert.equal(response.status,200);const data=await response.json();assert.equal(data.items.length,(await loadStudioCatalog()).items.length);assert.equal(data.categories.length,8);
    const page=await fetch(base+'/studio/brief/');assert.equal(page.status,200);assert((await page.text()).includes('brief-form'));
    assert.equal((await fetch(base+'/api/studio',{method:'POST'})).status,405);assert.equal((await fetch(base+'/data/studio-catalog.json')).status,404);
    const head=await fetch(base+'/api/studio',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  }finally{await new Promise(resolve=>server.close(resolve));}
});
