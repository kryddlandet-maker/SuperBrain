import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {request} from 'node:http';
import {initInbox,createInboxServer,validateSubmission,csvInbox,createSmtpNotifier} from '../lib/form-inbox.mjs';

async function fixture(options={}){
  const directory=await mkdtemp(path.join(tmpdir(),'superbrain-inbox-')),initialized=await initInbox(directory,{name:'Testets inkorg'});let time=1793692800000;
  const server=await createInboxServer({directory,now:()=>time,...options});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  return {directory,server,base,initialized,tick:ms=>{time+=ms;},token:async()=>{const data=await(await fetch(base+'/inbox/token')).json();time+=1100;return data.token;},close:async()=>{await server.shutdown();await rm(directory,{recursive:true,force:true});}};
}
const post=(base,route,body,options={})=>fetch(base+route,{method:'POST',redirect:'manual',headers:{'Content-Type':'application/json',...options.headers},body:JSON.stringify(body)});
const sample=token=>({token,form:'contact',company:'',name:'Anna Test',email:'anna@example.test',message:'En fråga om webbprojektet.'});

test('inbox receives, persists, deduplicates and administers real messages without exposing private files',async()=>{
  let sends=0;const f=await fixture({notify:async()=>{sends++;return {accepted:true,messageId:'local-fixture'};}});
  try{
    const preserved=await initInbox(f.directory);assert.equal(preserved.created,false);assert.equal(preserved.setupCode,null);
    assert.equal((await fetch(f.base+'/inbox/config.json')).status,404);assert.equal((await fetch(f.base+'/inbox/messages/')).status,404);assert.equal((await fetch(f.base+'/inbox/export.csv')).status,401);
    const health=await(await fetch(f.base+'/inbox/health')).json();assert.equal(health.admin,'setup-required');assert(!('secret' in health));
    const token=await f.token(),input={...sample(token),name:'<img src=x onerror=alert(1)>',message:'=HYPERLINK("example")',service:'Design'};
    const replies=await Promise.all(Array.from({length:3},()=>post(f.base,'/inbox/submit',input)));assert.deepEqual(replies.map(r=>r.status).sort(),[200,200,201]);
    const receipt=await replies[0].json();assert.equal(receipt.stored,true);assert.equal(receipt.notification,'smtp-accepted');assert.equal(sends,1);assert.equal((await readdir(path.join(f.directory,'messages'))).length,1);
    const setup=await post(f.base,'/inbox/setup',{code:f.initialized.setupCode,password:'Owner chosen passphrase!'});assert.equal(setup.status,303);const cookie=setup.headers.get('set-cookie').split(';')[0];assert.match(setup.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
    const html=await(await fetch(f.base+'/inbox/admin',{headers:{Cookie:cookie}})).text();assert(html.includes('&lt;img src=x'));assert(!html.includes('<img src=x'));const csrf=html.match(/name="csrf" value="([a-f0-9]+)"/)[1];
    assert.equal((await post(f.base,'/inbox/status',{id:receipt.id,status:'done'},{headers:{Cookie:cookie}})).status,403);
    assert.equal((await post(f.base,'/inbox/status',{id:receipt.id,status:'done',csrf},{headers:{Cookie:cookie,Origin:'https://unrelated.example'}})).status,403);
    assert.equal((await post(f.base,'/inbox/status',{id:receipt.id,status:'done',csrf},{headers:{Cookie:cookie}})).status,303);
    const stored=JSON.parse(await readFile(path.join(f.directory,'messages',receipt.id+'.json'),'utf8'));assert.equal(stored.status,'done');assert.equal(stored.fields.service,'Design');
    const exported=await fetch(f.base+'/inbox/export.csv',{headers:{Cookie:cookie}});assert.equal(exported.status,200);assert.match(await exported.text(),/"'=HYPERLINK/);
    const config=await readFile(path.join(f.directory,'config.json'),'utf8');assert(!config.includes('Owner chosen passphrase!'));assert(!config.includes(f.initialized.setupCode));
    assert.equal((await post(f.base,'/inbox/setup',{code:f.initialized.setupCode,password:'Another passphrase!'})).status,403);
    await post(f.base,'/inbox/logout',{csrf},{headers:{Cookie:cookie}});assert.equal((await fetch(f.base+'/inbox/export.csv',{headers:{Cookie:cookie}})).status,401);
    await f.server.shutdown();const restarted=await createInboxServer({directory:f.directory,now:()=>1793692805000});await new Promise(resolve=>restarted.listen(0,'127.0.0.1',resolve));
    try{
      const nextBase='http://127.0.0.1:'+restarted.address().port,login=await post(nextBase,'/inbox/login',{password:'Owner chosen passphrase!'});assert.equal(login.status,303);const nextCookie=login.headers.get('set-cookie').split(';')[0];
      const nextPage=await(await fetch(nextBase+'/inbox/admin',{headers:{Cookie:nextCookie}})).text();assert(nextPage.includes('Klart'));assert(nextPage.includes('&lt;img src=x'));
    }finally{await restarted.shutdown();}
  }finally{await f.close();}
});

test('inbox rejects malformed, forged, fast, expired, spam and excessive submissions before storage',async()=>{
  const f=await fixture({submitLimit:8});try{
    const fresh=await(await fetch(f.base+'/inbox/token')).json();assert.equal((await post(f.base,'/inbox/submit',sample(fresh.token))).status,400);
    f.tick(1100);assert.equal((await post(f.base,'/inbox/submit',{...sample(fresh.token),token:fresh.token+'x'})).status,400);
    assert.equal((await post(f.base,'/inbox/submit',{...sample(fresh.token),company:'spam'})).status,400);
    assert.equal((await post(f.base,'/inbox/submit',{...sample(fresh.token),email:'header\r\ninjected@example.test'})).status,400);
    assert.equal((await post(f.base,'/inbox/submit',sample(fresh.token),{headers:{Origin:'https://other.example'}})).status,403);
    f.tick(3600001);assert.equal((await post(f.base,'/inbox/submit',sample(fresh.token))).status,400);
    assert.equal((await readdir(path.join(f.directory,'messages'))).length,0);
    const live=await f.token();for(let i=0;i<8;i++)await post(f.base,'/inbox/submit',{...sample(live),message:''});assert.equal((await post(f.base,'/inbox/submit',sample(live))).status,429);
    const wrongHost=await new Promise((resolve,reject)=>{const req=request(f.base+'/inbox/health',{headers:{Host:'evil.example'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});req.on('error',reject);req.end();});assert.equal(wrongHost,403);
    assert.equal((await fetch(f.base+'/inbox/health',{method:'DELETE'})).status,405);
    assert.equal((await post(f.base,'/inbox/submit',{...sample(live),message:'x'.repeat(40000)})).status,413);
  }finally{await f.close();}
});

test('notification failure never loses a stored message; private directory refuses concurrent serving',async()=>{
  const f=await fixture({notify:async()=>{throw new Error('SMTP fixture unavailable');}});try{
    await assert.rejects(createInboxServer({directory:f.directory}),/already locked/);
    const response=await post(f.base,'/inbox/submit',sample(await f.token()));assert.equal(response.status,201);const receipt=await response.json();assert.equal(receipt.notification,'failed');
    const stored=JSON.parse(await readFile(path.join(f.directory,'messages',receipt.id+'.json'),'utf8'));assert.equal(stored.message,'En fråga om webbprojektet.');assert.equal(stored.notification.status,'failed');
    for(let i=0;i<8;i++)await post(f.base,'/inbox/login',{password:'Wrong passphrase!'});assert.equal((await post(f.base,'/inbox/login',{password:'Wrong passphrase!'})).status,429);
  }finally{await f.close();}
});

test('inbox validates fields and neutralizes spreadsheet formulas; SMTP requires explicit real configuration',async()=>{
  assert.throws(()=>validateSubmission({name:'A',email:'bad',message:'x'}),/giltig/);
  assert.throws(()=>validateSubmission(JSON.parse('{"name":"A","email":"a@example.test","message":"x","__proto__":"bad"}')),/Ogiltiga/);
  assert.throws(()=>validateSubmission({name:'A',email:'a@example.test',message:'x',extra:5}),/ogiltigt/);
  const csv=csvInbox([{id:'id',receivedAt:'now',status:'new',form:'contact',name:' =SUM(A1)',email:'a@example.test',message:'+cmd',fields:{}}]);assert(csv.includes('"\' =SUM(A1)"'));assert(csv.includes('"\'+cmd"'));
  await assert.rejects(createSmtpNotifier({host:'smtp.example.test',port:25}),/SMTP requires/);
});
