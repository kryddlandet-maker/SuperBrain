import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {validateStudioCatalog,loadStudioCatalog} from '../lib/studio-catalog.mjs';

const raw=async()=>JSON.parse(await readFile(new URL('../data/studio-catalog.json',import.meta.url),'utf8'));

test('studio catalog groups actual local studies and useful tools without upgrading research',async()=>{
  const catalog=await loadStudioCatalog();
  assert.equal(catalog.categories.length,8);assert.equal(catalog.items.length,52);
  assert.deepEqual(catalog.items.filter(i=>i.category==='tools').map(i=>i.href),['/studio/brief/','/studio/engine/','/examples/library/','/examples/atlas/','/studio/production/']);
  for(const name of ['workflow-scene','orbit-scene','editing-scene','scroll-film'])assert(catalog.items.some(i=>i.id===name));
  assert(catalog.items.every(i=>i.preview.thumbnail.endsWith('/'+i.id+'.png')));
  assert(catalog.items.every(i=>!('maturity' in i)));
});

test('catalog rejects unsafe paths, duplicate identities and unsupported navigation values',async()=>{
  const source=await raw();
  for(const change of [
    c=>c.items.push(c.items[0]),
    c=>c.categories.push(c.categories[0]),
    c=>c.items[0].href='https://example.test/',
    c=>c.items[0].href='/examples/../secret/',
    c=>c.items[0].href='/examples/%2e%2e/secret/',
    c=>c.items[0].preview.route='//example.test/',
    c=>c.items[0].preview.thumbnail='/studio/previews/../../auth.json',
    c=>c.items[0].preview.selector='<script>',
    c=>c.items[0].category='missing',
    c=>c.items[0].interaction='purchase',
    c=>c.items[0].techniques=['unknown']
  ]){const invalid=structuredClone(source);change(invalid);assert.throws(()=>validateStudioCatalog(invalid),/Invalid studio catalog/);}
});

test('catalog loading verifies destination files and deep links before exposing them',async()=>{
  const scratch=await mkdtemp(path.join(tmpdir(),'superbrain-studio-catalog-'));
  const catalog=await raw();catalog.items=[catalog.items[0]];catalog.categories=[catalog.categories[0]];
  try{
    await mkdir(path.join(scratch,'data'));await writeFile(path.join(scratch,'data/studio-catalog.json'),JSON.stringify(catalog));
    await assert.rejects(loadStudioCatalog(scratch),/ENOENT/);
    await mkdir(path.join(scratch,'examples/buttons'),{recursive:true});await writeFile(path.join(scratch,'examples/buttons/index.html'),'<main></main>');
    await assert.rejects(loadStudioCatalog(scratch),/missing local anchor/);
    await writeFile(path.join(scratch,'examples/buttons/index.html'),'<main id="fill-left"></main>');
    assert.equal((await loadStudioCatalog(scratch)).items[0].id,'fill-left');
  }finally{await rm(scratch,{recursive:true,force:true});}
});
