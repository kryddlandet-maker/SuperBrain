import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,rm,cp,symlink,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {packageCodexPlugins,pluginSourceRoot,validateCodexPluginManifest} from '../lib/codex-plugins.mjs';
import {registerCodexPlugins} from '../lib/register-codex-plugins.mjs';
import {CodexAppClient} from '../lib/codex-app-client.mjs';

test('both plugin manifests satisfy required Codex package and listing metadata',async()=>{
  for(const file of ['.codex-plugin/plugin.json','plugins/frontend-design/.codex-plugin/plugin.json']){
    const manifest=JSON.parse(await readFile(new URL('../'+file,import.meta.url),'utf8'));
    assert.doesNotThrow(()=>validateCodexPluginManifest(manifest));
    const empty=structuredClone(manifest);empty.interface.capabilities=[];
    assert.doesNotThrow(()=>validateCodexPluginManifest(empty));
    for(const capabilities of [undefined,null,'Webbdesign',{},[1],[''],['  '],['x'.repeat(121)],Array(21).fill('Design')]){
      const invalid=structuredClone(manifest);invalid.interface.capabilities=capabilities;
      assert.throws(()=>validateCodexPluginManifest(invalid),/interface\.capabilities/);
    }
    const noAuthor=structuredClone(manifest);delete noAuthor.author;
    assert.throws(()=>validateCodexPluginManifest(noAuthor),/author\.name/);
    const badCategory=structuredClone(manifest);badCategory.interface.category='Design';
    assert.throws(()=>validateCodexPluginManifest(badCategory),/interface\.category/);
    const longSubtitle=structuredClone(manifest);longSubtitle.interface.shortDescription='x'.repeat(241);
    assert.throws(()=>validateCodexPluginManifest(longSubtitle),/interface\.shortDescription/);
  }
});

test('plugin exports retain originals and runnable project installation without exporting local state',async()=>{
  const first=await packageCodexPlugins(),scratch=await mkdtemp(path.join(tmpdir(),'plugin-export-test-'));let second;
  try{
    const base=path.join(scratch,'source');await cp(first.plugins[0].root,base,{recursive:true});
    await cp(path.join(pluginSourceRoot,'.agents/plugins'),path.join(base,'.agents/plugins'),{recursive:true});
    await cp(first.plugins[1].root,path.join(base,'plugins/frontend-design'),{recursive:true});
    for(const rel of ['.git/private','artifacts/private','lib/.env','lib/auth.json','lib/private.key','lib/node_modules/private']){
      await mkdir(path.dirname(path.join(base,rel)),{recursive:true});await writeFile(path.join(base,rel),'DO NOT EXPORT');
    }
    second=await packageCodexPlugins({base});
    assert(!second.files.some(f=>/\.git\/|artifacts\/|\.env|auth.json|private.key|node_modules/.test(f.path)));
    for(const plugin of second.plugins){
      const manifests=[];
      async function findManifests(directory,relative=''){
        for(const entry of await readdir(directory,{withFileTypes:true})){
          const rel=relative?relative+'/'+entry.name:entry.name;
          if(entry.isDirectory())await findManifests(path.join(directory,entry.name),rel);
          else if(/(?:^|\/)(?:\.codex-plugin|\.claude-plugin|\.agent-plugin)\/plugin\.json$/.test(rel)||rel==='plugin.json')manifests.push(rel);
        }
      }
      await findManifests(plugin.root);assert.deepEqual(manifests,['.codex-plugin/plugin.json']);
      validateCodexPluginManifest(JSON.parse(await readFile(path.join(plugin.root,manifests[0]),'utf8')));
    }
    await assert.rejects(readFile(path.join(second.plugins[0].root,'.agents/plugins/marketplace.json')),/ENOENT/);
    assert.equal((await readdir(path.join(second.plugins[1].root,'skills'))).join(','),'frontend-design');
    assert.deepEqual(await readFile(path.join(second.plugins[1].root,'skills/frontend-design/SKILL.md')),await readFile(path.join(base,'vendor/anthropic/skills/frontend-design/SKILL.md')));
    const project=path.join(scratch,'website');await mkdir(project);await writeFile(path.join(project,'AGENTS.md'),'Keep the booking flow.\n');
    execFileSync(process.execPath,[path.join(second.plugins[0].root,'scripts/install.mjs'),project],{stdio:'pipe'});
    assert((await readFile(path.join(project,'AGENTS.md'),'utf8')).includes('Keep the booking flow.'));
    const result=JSON.parse(execFileSync(process.execPath,[path.join(project,'.superbrain/scripts/anthropic.mjs'),'--verify'],{encoding:'utf8'}));assert.equal(result.status,'verified');
    const manifestPath=path.join(base,'plugins/frontend-design/.codex-plugin/plugin.json');
    const manifest=JSON.parse(await readFile(manifestPath,'utf8'));delete manifest.interface.capabilities;
    await writeFile(manifestPath,JSON.stringify(manifest));
    await assert.rejects(packageCodexPlugins({base}),/frontend-design: interface\.capabilities/);
    manifest.interface.capabilities=[];await writeFile(manifestPath,JSON.stringify(manifest));
    await symlink(scratch,path.join(base,'lib/escape'),process.platform==='win32'?'junction':'dir');await assert.rejects(packageCodexPlugins({base}),/do not follow symlinks/);
  }finally{
    await Promise.all([first.directory,second?.directory,scratch].filter(Boolean).map(p=>rm(p,{recursive:true,force:true})));
  }
});

const bundle={plugins:[{name:'superbrain',root:'/export/superbrain'},{name:'frontend-design',root:'/export/frontend-design'}]};
const owned=(name,id)=>({name,remotePluginId:id,interface:{developerName:'SuperBrain'},shareContext:{discoverability:'PRIVATE',shareUrl:'https://example.test/'+id,sharePrincipals:[{role:'owner'}]},installed:false,enabled:false});
const personalOwned=(name,id)=>({...owned(name,id),id:name+'@created-by-me-remote',source:{type:'remote'},shareContext:null,interface:{developerName:'Account owner',displayName:name==='superbrain'?'SuperBrain':'Frontend Design',websiteUrl:'https://github.com/kryddlandet-maker/SuperBrain'+(name==='frontend-design'?'/tree/main/plugins/frontend-design':'')}});
function account({initial=[],personal=false,installFailure=false,readFailure=false,catalogFailure=false,unconfirmed=false,missingSkill=false}={}){
  const state=structuredClone(initial),calls=[];
  const marketplaceName=personal?'created-by-me-remote':'workspace-shared-with-me';
  return {calls,state,async call(method,params){
    calls.push({method,params:structuredClone(params)});
    if(method==='plugin/share/list'){
      if(readFailure)throw new Error('Network unavailable');
      return {data:personal?[]:structuredClone(state).map(plugin=>({plugin,localPluginPath:null}))};
    }
    if(method==='plugin/list'){
      assert.deepEqual(params,{marketplaceKinds:['created-by-me-remote'],forceRefetch:true});
      return {marketplaces:personal?[{name:marketplaceName,plugins:structuredClone(state)}]:[],marketplaceLoadErrors:catalogFailure?[{message:'Unavailable'}]:[]};
    }
    if(method==='plugin/read'){
      const summary=structuredClone(state.find(p=>p.remotePluginId===params.pluginName));
      return {plugin:{marketplaceName,summary,shareUrl:'https://example.test/'+summary.remotePluginId,skills:missingSkill?[]:[{name:summary.name,enabled:true}]}};
    }
    if(method==='plugin/installed'){
      return {marketplaces:[{name:marketplaceName,plugins:structuredClone(state)}],marketplaceLoadErrors:[]};
    }
    if(method==='plugin/share/save'){
      if(params.remotePluginId)return {remotePluginId:params.remotePluginId,shareUrl:'https://example.test/'+params.remotePluginId};
      const id='plugins_'+state.length;state.push((personal?personalOwned:owned)(path.basename(params.pluginPath),id));return {remotePluginId:id,shareUrl:'https://example.test/'+id};
    }
    if(method==='plugin/install'){
      if(installFailure)throw new Error('Download failed');
      if(!unconfirmed){const p=state.find(p=>p.remotePluginId===params.pluginName);p.installed=true;p.enabled=true;}
      return {authPolicy:'ON_USE',appsNeedingAuth:[]};
    }
    throw new Error('Unexpected method '+method);
  }};
}
test('account registration creates only owner-private plugins and verifies the returned installed state',async()=>{
  const client=account(),receipts=await registerCodexPlugins(client,bundle);
  for(const call of client.calls.filter(c=>c.method==='plugin/share/save')){
    assert.equal(call.params.discoverability,'PRIVATE');assert.deepEqual(call.params.shareTargets,[]);assert(!('remotePluginId' in call.params));
  }
  assert(client.calls.filter(c=>c.method==='plugin/install').every(c=>c.params.remoteMarketplaceName==='workspace-shared-with-me'));
  assert(receipts.every(p=>p.verified&&p.installed&&p.visibility==='PRIVATE'));
  const unconfirmed=account({unconfirmed:true});await assert.rejects(registerCodexPlugins(unconfirmed,bundle),/not confirmed/);
  const missingSkill=account({missingSkill:true});await assert.rejects(registerCodexPlugins(missingSkill,bundle),/Enabled plugin skill is not confirmed/);
});
test('personal USER-scope plugins with account-supplied developer names are verified and reused without duplicates',async()=>{
  const client=account({personal:true});
  const first=await registerCodexPlugins(client,bundle);assert(first.every(p=>p.verified&&p.privacyEvidence==='USER scope'));
  assert(client.calls.filter(c=>c.method==='plugin/install').every(c=>c.params.remoteMarketplaceName==='created-by-me-remote'));
  assert.equal(client.calls.filter(c=>c.method==='plugin/share/save').length,2);
  const second=await registerCodexPlugins(client,bundle);
  assert.deepEqual(second.map(p=>p.remotePluginId),first.map(p=>p.remotePluginId));
  assert.equal(client.calls.filter(c=>c.method==='plugin/share/save').length,2);
  await registerCodexPlugins(client,bundle,{update:true});
  const updates=client.calls.filter(c=>c.method==='plugin/share/save').slice(2);
  assert.deepEqual(updates.map(c=>c.params.remotePluginId),first.map(p=>p.remotePluginId));
  assert(updates.every(c=>!('discoverability' in c.params)&&!('shareTargets' in c.params)));
});
test('incomplete personal catalogs and conflicting personal package identities stop before mutation',async()=>{
  const unavailable=account({catalogFailure:true});await assert.rejects(registerCodexPlugins(unavailable,bundle),/complete personal plugin catalog/);
  assert(unavailable.calls.every(c=>['plugin/share/list','plugin/list'].includes(c.method)));
  for(const change of [p=>p.interface.websiteUrl='https://example.test',p=>p.id='frontend-design@workspace-directory',p=>p.shareContext={discoverability:'UNLISTED'}]){
    const initial=personalOwned('frontend-design','plugins_0');change(initial);
    const client=account({personal:true,initial:[initial]});await assert.rejects(registerCodexPlugins(client,bundle),/not a confirmed owner-only/);
    assert(client.calls.every(c=>['plugin/share/list','plugin/list'].includes(c.method)));
  }
});
test('registration reuses owned IDs and updates content only on explicit request without changing access',async()=>{
  const initial=bundle.plugins.map((p,i)=>owned(p.name,'plugins_'+i));
  const reuse=account({initial});await registerCodexPlugins(reuse,bundle);assert(!reuse.calls.some(c=>c.method==='plugin/share/save'));
  const update=account({initial});await registerCodexPlugins(update,bundle,{update:true});
  assert.deepEqual(update.calls.filter(c=>c.method==='plugin/share/save').map(c=>c.params),bundle.plugins.map((p,i)=>({pluginPath:p.root,remotePluginId:'plugins_'+i})));
});
test('unavailable accounts and conflicting/shared existing plugins stop before any mutation',async()=>{
  const blocked=account({readFailure:true});await assert.rejects(registerCodexPlugins(blocked,bundle),/Network unavailable/);assert.equal(blocked.calls.length,1);
  const duplicate=owned('frontend-design','plugins_2');
  for(const initial of [
    [duplicate,{...duplicate,remotePluginId:'plugins_3'}],
    [{...duplicate,interface:{developerName:'Someone else'}}],
    [{...duplicate,shareContext:{discoverability:'UNLISTED',sharePrincipals:[]}}],
    [{...duplicate,shareContext:{discoverability:'PRIVATE',sharePrincipals:[]}}],
    [{...duplicate,shareContext:{discoverability:'PRIVATE',sharePrincipals:[{role:'owner'},{role:'reader'}]}}]
  ]){
    const client=account({initial});await assert.rejects(registerCodexPlugins(client,bundle));assert.equal(client.calls.length,2);
  }
});
test('failed installation retains a saved ID receipt without reporting verified installation',async()=>{
  const client=account({installFailure:true}),snapshots=[];
  await assert.rejects(registerCodexPlugins(client,bundle,{onReceipt:async p=>snapshots.push(structuredClone(p))}),/Download failed/);
  assert.equal(snapshots.length,1);assert.equal(snapshots[0][0].remotePluginId,'plugins_0');assert.equal(snapshots[0][0].verified,false);
  assert.equal(client.calls.filter(c=>c.method==='plugin/share/save').length,1);
});

function transport(source,timeout=2000){return new CodexAppClient({timeout,launch:()=>spawn(process.execPath,['--input-type=module','-e',source],{stdio:['pipe','pipe','pipe']})});}
test('RPC transport matches out-of-order replies, surfaces service errors and clears pending calls on close',async()=>{
  const client=transport(`import{createInterface}from'node:readline';const requests=[];createInterface({input:process.stdin}).on('line',l=>{const m=JSON.parse(l);if(m.id===undefined)return;requests.push(m);if(requests.length===2)for(const r of requests.reverse())process.stdout.write(JSON.stringify({id:r.id,...(r.method==='failure'?{error:{message:'not available'}}:{result:r.params})})+'\\n');});`);
  try{
    const good=client.call('echo',{value:'one'}),bad=client.call('failure');
    await assert.rejects(bad,/not available/);assert.deepEqual(await good,{value:'one'});assert.equal(client.pending.size,0);
    const pending=client.call('pending');client.close();await assert.rejects(pending,/closed/);assert.equal(client.pending.size,0);
  }finally{client.close();}
});
test('RPC process exits and timeouts fail without retrying a potentially completed mutation',async()=>{
  const exited=transport('process.exit(7)');
  try{await assert.rejects(exited.call('plugin/share/save'),/exited 7|EPIPE/);}finally{exited.close();}
  const quiet=transport('process.stdin.resume()',50);
  try{await assert.rejects(quiet.call('plugin/share/save'),/no automatic retry/);assert.equal(quiet.sequence,1);assert.equal(quiet.pending.size,0);}finally{quiet.close();}
});
