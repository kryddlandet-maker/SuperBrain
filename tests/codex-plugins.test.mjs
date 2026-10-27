import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,rm,cp,symlink,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {packageCodexPlugins,verifyCodexPlugins} from '../lib/codex-plugins.mjs';
import {registerCodexPlugins} from '../lib/register-codex-plugins.mjs';
import {CodexAppClient} from '../lib/codex-app-client.mjs';

test('plugin exports retain originals and runnable project installation without exporting local state',async()=>{
  const first=await packageCodexPlugins(),scratch=await mkdtemp(path.join(tmpdir(),'plugin-export-test-'));let second;
  try{
    const base=path.join(scratch,'source');await cp(first.plugins[0].root,base,{recursive:true});
    for(const rel of ['.git/private','artifacts/private','lib/.env','lib/auth.json','lib/private.key','lib/node_modules/private']){
      await mkdir(path.dirname(path.join(base,rel)),{recursive:true});await writeFile(path.join(base,rel),'DO NOT EXPORT');
    }
    second=await packageCodexPlugins({base});
    assert(!second.files.some(f=>/\.git\/|artifacts\/|\.env|auth.json|private.key|node_modules/.test(f.path)));
    const verified=await verifyCodexPlugins(second.plugins[0].root);assert.deepEqual(verified.plugins.map(p=>p.name),['superbrain','frontend-design']);
    assert.equal((await readdir(path.join(second.plugins[1].root,'skills'))).join(','),'frontend-design');
    assert.deepEqual(await readFile(path.join(second.plugins[1].root,'skills/frontend-design/SKILL.md')),await readFile(path.join(base,'vendor/anthropic/skills/frontend-design/SKILL.md')));
    const project=path.join(scratch,'website');await mkdir(project);await writeFile(path.join(project,'AGENTS.md'),'Keep the booking flow.\n');
    execFileSync(process.execPath,[path.join(second.plugins[0].root,'scripts/install.mjs'),project],{stdio:'pipe'});
    assert((await readFile(path.join(project,'AGENTS.md'),'utf8')).includes('Keep the booking flow.'));
    const result=JSON.parse(execFileSync(process.execPath,[path.join(project,'.superbrain/scripts/anthropic.mjs'),'--verify'],{encoding:'utf8'}));assert.equal(result.status,'verified');
    await symlink(scratch,path.join(base,'lib/escape'));await assert.rejects(packageCodexPlugins({base}),/do not follow symlinks/);
  }finally{
    await Promise.all([first.directory,second?.directory,scratch].filter(Boolean).map(p=>rm(p,{recursive:true,force:true})));
  }
});

const bundle={plugins:[{name:'superbrain',root:'/export/superbrain'},{name:'frontend-design',root:'/export/frontend-design'}]};
const owned=(name,id)=>({name,remotePluginId:id,interface:{developerName:'SuperBrain'},shareContext:{discoverability:'PRIVATE',shareUrl:'https://example.test/'+id,sharePrincipals:[{role:'owner'}]},installed:false,enabled:false});
function account({initial=[],installFailure=false,readFailure=false,unconfirmed=false}={}){
  const state=structuredClone(initial),calls=[];
  return {calls,state,async call(method,params){
    calls.push({method,params:structuredClone(params)});
    if(method==='plugin/share/list'){
      if(readFailure)throw new Error('Network unavailable');
      return {data:structuredClone(state).map(plugin=>({plugin,localPluginPath:null}))};
    }
    if(method==='plugin/share/save'){
      if(params.remotePluginId)return {remotePluginId:params.remotePluginId,shareUrl:'https://example.test/'+params.remotePluginId};
      const id='plugins_'+state.length;state.push(owned(path.basename(params.pluginPath),id));return {remotePluginId:id,shareUrl:'https://example.test/'+id};
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
    const client=account({initial});await assert.rejects(registerCodexPlugins(client,bundle));assert.equal(client.calls.length,1);
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
