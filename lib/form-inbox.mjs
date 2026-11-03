import {createServer} from 'node:http';
import {randomBytes,createHash,createHmac,timingSafeEqual,scrypt as rawScrypt} from 'node:crypto';
import {promisify} from 'node:util';
import {readFile,writeFile,mkdir,readdir,lstat,realpath,rename,unlink,open} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';

const scrypt=promisify(rawScrypt),schema=1;
const hex=bytes=>randomBytes(bytes).toString('hex');
const digest=value=>createHash('sha256').update(value).digest('hex');
const equal=(a,b)=>{const left=Buffer.from(String(a)),right=Buffer.from(String(b));return left.length===right.length&&timingSafeEqual(left,right);};
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const email=value=>typeof value==='string'&&value.length<=254&&!/[\r\n]/.test(value)&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const identifier=value=>typeof value==='string'&&/^[a-zA-Z][a-zA-Z0-9_-]{0,59}$/.test(value);
class InboxError extends Error{constructor(status,message){super(message);this.status=status;}}
const invalid=(status,message)=>{throw new InboxError(status,message);};

async function safeDirectory(directory,{create=false}={}){
  const absolute=path.resolve(directory),parsed=path.parse(absolute);let cursor=parsed.root;
  for(const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)){
    cursor=path.join(cursor,part);
    try{const info=await lstat(cursor);if(info.isSymbolicLink()||!info.isDirectory())throw new Error('Inbox data path must contain only real directories');}
    catch(error){if(error.code!=='ENOENT')throw error;if(!create)throw error;await mkdir(cursor,{mode:0o700});}
  }
  return realpath(absolute);
}
async function safeFile(file){try{const info=await lstat(file);if(info.isSymbolicLink()||!info.isFile())throw new Error('Inbox file is not a regular private file');}catch(error){if(error.code!=='ENOENT')throw error;}}
async function atomicJSON(file,value){
  await safeFile(file);const temporary=file+'.'+hex(8)+'.tmp';
  try{await writeFile(temporary,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});await rename(temporary,file);}
  finally{try{await unlink(temporary);}catch(error){if(error.code!=='ENOENT')throw error;}}
}
async function readConfig(directory){
  const file=path.join(directory,'config.json');await safeFile(file);const config=JSON.parse(await readFile(file,'utf8'));
  if(config.schema!==schema||!/^\w{64}$/.test(config.secret)||typeof config.name!=='string'||config.name.length>120||config.admin&&(!/^[a-f0-9]{32}$/.test(config.admin.salt)||!/^[a-f0-9]{128}$/.test(config.admin.hash)))throw new Error('Unsupported inbox configuration');
  return config;
}
export async function initInbox(directory,{name='Meddelanden'}={}){
  if(typeof name!=='string'||!name.trim()||name.length>120)throw new Error('Inbox name must be 1–120 characters');
  const root=await safeDirectory(directory,{create:true}),file=path.join(root,'config.json');await safeFile(file);
  try{await readConfig(root);return {directory:root,created:false,setupCode:null};}catch(error){if(error.code!=='ENOENT')throw error;}
  const code=hex(18),config={schema,name:name.trim(),secret:hex(32),setupHash:digest(code),admin:null,createdAt:new Date().toISOString()};
  await mkdir(path.join(root,'messages'),{mode:0o700});await writeFile(file,JSON.stringify(config,null,2)+'\n',{flag:'wx',mode:0o600});
  return {directory:root,created:true,setupCode:code};
}
export function validateSubmission(value){
  if(!value||typeof value!=='object'||Array.isArray(value))invalid(400,'Ogiltigt formulär.');
  const allowedKeys=Object.keys(value);if(allowedKeys.length>25||allowedKeys.some(key=>!identifier(key)||['__proto__','prototype','constructor'].includes(key)))invalid(400,'Ogiltiga formulärfält.');
  for(const key of allowedKeys)if(typeof value[key]!=='string'||value[key].includes('\0')||value[key].length>(key==='message'?8000:2000))invalid(400,'Ett formulärfält är för långt eller ogiltigt.');
  const name=(value.name||'').trim(),address=(value.email||'').trim(),message=(value.message||'').trim(),form=value.form||'contact';
  if(!name||name.length>120||!email(address)||!message||message.length>8000||!identifier(form))invalid(400,'Ange namn, giltig e-postadress och ett meddelande.');
  const fields=Object.fromEntries(allowedKeys.filter(key=>!['name','email','message','form','token','company'].includes(key)).map(key=>[key,value[key].trim()]));
  return {name,email:address,message,form,fields};
}
export function csvInbox(messages){
  const cell=value=>'"'+(/^[\s]*[=+@-]/u.test(String(value))?"'":'')+String(value??'').replaceAll('"','""')+'"';
  return '\uFEFF'+[['ID','Mottaget','Status','Formulär','Namn','E-post','Meddelande','Övriga fält'],...messages.map(m=>[m.id,m.receivedAt,m.status,m.form,m.name,m.email,m.message,JSON.stringify(m.fields)])].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
export async function createSmtpNotifier(config,{modulePath=process.env.SUPERBRAIN_NODEMAILER||'nodemailer'}={}){
  if(!config||!identifier(config.passwordEnv)||!process.env[config.passwordEnv]||typeof config.host!=='string'||!/^[a-zA-Z0-9.-]+$/.test(config.host)||![465,587].includes(config.port)||typeof config.user!=='string'||!config.user||/[\r\n]/.test(config.user)||!email(config.from)||!email(config.to))throw new Error('SMTP requires host, port 465/587, user, passwordEnv, from and owner to address');
  let nodemailer;try{nodemailer=createRequire(import.meta.url)(modulePath);}catch{throw new Error('Optional SMTP requires Nodemailer; install it in the consuming project or set SUPERBRAIN_NODEMAILER to its package path');}
  const transport=nodemailer.createTransport({host:config.host,port:config.port,secure:config.port===465,requireTLS:true,auth:{user:config.user,pass:process.env[config.passwordEnv]},tls:{rejectUnauthorized:true,minVersion:'TLSv1.2'},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:20000,disableFileAccess:true,disableUrlAccess:true});
  return async message=>{
    const result=await transport.sendMail({from:config.from,to:config.to,replyTo:message.email,subject:'Nytt webbmeddelande: '+message.form,text:'Ett meddelande har sparats i webbplatsens privata inkorg.\n\nFrån: '+message.name+' <'+message.email+'>\nFormulär: '+message.form+'\nMottaget: '+message.receivedAt+'\n\n'+message.message+'\n\n'+Object.entries(message.fields).map(([key,value])=>key+': '+value).join('\n'),messageId:'<'+message.id+'@'+config.from.split('@')[1]+'>',disableFileAccess:true,disableUrlAccess:true});
    return {accepted:result.accepted?.includes(config.to)===true,messageId:result.messageId||null};
  };
}

const style=':root{font:16px/1.55 system-ui,sans-serif;color:#202638;background:#f5f6fa}*{box-sizing:border-box}body{margin:0}main{max-width:960px;margin:0 auto;padding:32px 20px}h1{font-size:clamp(28px,5vw,42px);letter-spacing:-1px}h2{font-size:20px}a{color:#584bbd}button,input,textarea{font:inherit}label{display:block;margin:16px 0 7px}input,textarea{display:block;width:100%;border:1px solid #cad0df;border-radius:7px;padding:11px;background:white}button{border:0;border-radius:7px;background:#5c4bc4;color:white;padding:11px 20px;cursor:pointer;min-height:44px;margin-top:16px}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #a99ae9;outline-offset:3px}.panel,article{background:white;border:1px solid #e0e3ec;border-radius:12px;padding:20px;margin:20px 0}.meta{color:#646d80;font-size:14px}.message{white-space:pre-wrap;overflow-wrap:anywhere}.actions{display:flex;align-items:center;gap:20px;flex-wrap:wrap}.trap{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}.tag{background:#eeebfd;color:#584bbd;border-radius:4px;padding:3px 7px}dt{font-weight:600}dd{margin:0 0 10px;overflow-wrap:anywhere}article form{display:inline}article button{font-size:14px;padding:8px 12px}hr{border:0;border-top:1px solid #e0e3ec}small{line-height:1.6}nav{display:flex;gap:20px;flex-wrap:wrap}';
const page=(title,content)=>'<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+escape(title)+'</title><link rel="stylesheet" href="/inbox/style.css"></head><body><main><h1>'+escape(title)+'</h1>'+content+'</main></body></html>';
function loginPage(setup){return page(setup?'Aktivera din inkorg':'Logga in i inkorgen','<p>Välj ditt eget lösenord. Lösenordet visas aldrig för webbplatsens besökare.</p><form class="panel" method="post" action="/inbox/'+(setup?'setup':'login')+'">'+(setup?'<label>Installationskod<input name="code" type="password" required autocomplete="one-time-code"></label>':'')+'<label>Lösenord<input name="password" type="password" required minlength="12" maxlength="128" autocomplete="'+(setup?'new-password':'current-password')+'"></label><button type="submit">'+(setup?'Aktivera inkorgen':'Logga in')+'</button></form>');}

/** Node-hosted inbox. Private storage is never a static website root. One process per data folder. */
export async function createInboxServer({directory,origin='http://127.0.0.1:0',now=()=>Date.now(),minFillMs=1000,submitLimit=5,notify=null}={}){
  const root=await safeDirectory(directory),messagesRoot=await safeDirectory(path.join(root,'messages'));
  let config=await readConfig(root),queue=Promise.resolve();const sessions=new Map(),rates=new Map();
  const base=new URL(origin);if(base.username||base.password||base.pathname!=='/'||base.search||base.hash||base.protocol!=='https:'&&!(base.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(base.hostname)))throw new Error('Inbox origin must be HTTPS, or localhost for development');
  if(!Number.isFinite(minFillMs)||minFillMs<0||!Number.isInteger(submitLimit)||submitLimit<1)throw new Error('Invalid inbox limits');
  const lockFile=path.join(root,'server.lock'),lockValue=JSON.stringify({pid:process.pid,nonce:hex(16)});await safeFile(lockFile);
  let lock;try{lock=await open(lockFile,'wx',0o600);await lock.writeFile(lockValue);await lock.close();}catch(error){if(error.code==='EEXIST')throw new Error('Inbox data folder is already locked; stop its existing process before restart. After a crash verify the old process has stopped before removing server.lock.');throw error;}
  const serial=operation=>{const next=queue.then(operation);queue=next.catch(()=>{});return next;};
  const sign=payload=>createHmac('sha256',config.secret).update(payload).digest('base64url');
  const token=form=>{const payload=Buffer.from(JSON.stringify({nonce:hex(16),issued:now(),form})).toString('base64url');return payload+'.'+sign(payload);};
  function challenge(value,form){
    if(typeof value!=='string'||value.length>700)invalid(400,'Ladda om formuläret och försök igen.');
    const parts=value.split('.');if(parts.length!==2||!equal(parts[1],sign(parts[0])))invalid(400,'Ladda om formuläret och försök igen.');
    let data;try{data=JSON.parse(Buffer.from(parts[0],'base64url'));}catch{invalid(400,'Ogiltigt formulär.');}
    if(!/^[a-f0-9]{32}$/.test(data.nonce)||data.form!==form||!Number.isFinite(data.issued)||now()-data.issued<minFillMs||now()-data.issued>3600000)invalid(400,'Formuläret skickades för snabbt eller har gått ut. Försök igen.');return data;
  }
  function rate(key,limit,period){
    const time=now();if(rates.size>=5000){for(const [id,value]of rates)if(time-value.start>900000)rates.delete(id);if(rates.size>=5000&&!rates.has(key))invalid(429,'Servern är upptagen. Försök igen senare.');}
    let entry=rates.get(key);if(!entry||time-entry.start>=period){entry={start:time,count:0};rates.set(key,entry);}entry.count++;if(entry.count>limit)invalid(429,'För många försök. Vänta en stund och försök igen.');
  }
  async function record(id){if(!/^[a-f0-9]{32}$/.test(id))invalid(400,'Ogiltigt meddelande.');const file=path.join(messagesRoot,id+'.json');await safeFile(file);return {file,value:JSON.parse(await readFile(file,'utf8'))};}
  async function messages(){const items=[];for(const file of await readdir(messagesRoot))if(/^[a-f0-9]{32}\.json$/.test(file))items.push((await record(file.slice(0,-5))).value);return items.sort((a,b)=>b.receivedAt.localeCompare(a.receivedAt));}
  const secure=base.protocol==='https:';
  const responseHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",'X-Robots-Tag':'noindex, nofollow'};
  let server;
  function currentOrigin(){return base.port==='0'?'http://'+base.hostname+':'+server.address().port:base.origin;}
  function send(res,status,content,type='text/html; charset=utf-8',extra={}){res.writeHead(status,{...responseHeaders,'Content-Type':type,...extra});res.end(content);}
  function session(req){const cookie=(req.headers.cookie||'').split(';').map(value=>value.trim()).find(value=>value.startsWith('sb_inbox='))?.slice(9);const value=sessions.get(cookie);if(!value||now()>value.expires){if(cookie)sessions.delete(cookie);return null;}return {id:cookie,...value};}
  function originCheck(req){const requested=req.headers.origin;if(requested&&requested!==currentOrigin())invalid(403,'Begäran kommer från en annan webbplats.');if(req.headers['sec-fetch-site']==='cross-site')invalid(403,'Begäran kommer från en annan webbplats.');}
  function csrf(req,body){originCheck(req);const auth=session(req);if(!auth||!equal(body.csrf||'',auth.csrf))invalid(403,'Logga in igen och försök på nytt.');return auth;}
  async function body(req){
    let length=0;const chunks=[];for await(const chunk of req){length+=chunk.length;if(length>32768)invalid(413,'Formuläret är för stort.');chunks.push(chunk);}
    const text=Buffer.concat(chunks).toString('utf8'),type=(req.headers['content-type']||'').split(';')[0];
    if(type==='application/json'){let result;try{result=JSON.parse(text);}catch{invalid(400,'Ogiltigt formulär.');}if(!result||typeof result!=='object'||Array.isArray(result))invalid(400,'Ogiltigt formulär.');return result;}
    if(type!=='application/x-www-form-urlencoded')invalid(415,'Använd JSON eller ett vanligt webbformulär.');
    const entries=[...new URLSearchParams(text)];if(new Set(entries.map(([key])=>key)).size!==entries.length)invalid(400,'Upprepade formulärfält.');return Object.fromEntries(entries);
  }
  // Render user content only through escaped text; no submitted HTML is executed.
  function dashboard(items,auth){
    const cards=items.map(item=>'<article><div class="actions"><h2>'+escape(item.name)+'</h2><span class="tag">'+(item.status==='done'?'Klart':'Nytt')+'</span></div><p class="meta">'+escape(item.receivedAt)+' · '+escape(item.form)+' · '+escape(item.email)+'</p><div class="message">'+escape(item.message)+'</div><dl>'+Object.entries(item.fields).map(([key,value])=>'<dt>'+escape(key)+'</dt><dd>'+escape(value)+'</dd>').join('')+'</dl><p class="meta">E-postavisering: '+escape(item.notification.status)+'</p><div class="actions"><a href="mailto:'+encodeURIComponent(item.email)+'">Svara med din e-postapp</a><form method="post" action="/inbox/status"><input type="hidden" name="csrf" value="'+auth.csrf+'"><input type="hidden" name="id" value="'+item.id+'"><input type="hidden" name="status" value="'+(item.status==='done'?'new':'done')+'"><button type="submit">'+(item.status==='done'?'Markera som nytt':'Markera som klart')+'</button></form></div></article>').join('');
    return page(config.name,'<nav><a href="/inbox/export.csv">Ladda ner CSV</a><a href="/inbox/form">Öppna kontaktformuläret</a></nav><p class="meta">'+items.length+' sparade meddelanden. E-poststatus visar SMTP-acceptans, inte bekräftad inkorgsleverans.</p>'+cards+'<form method="post" action="/inbox/logout"><input type="hidden" name="csrf" value="'+auth.csrf+'"><button type="submit">Logga ut</button></form>');
  }
  server=createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,currentOrigin()),route=url.pathname,ip=req.socket.remoteAddress||'unknown';
      if(!['GET','POST','HEAD'].includes(req.method)){send(res,405,'Metoden stöds inte.','text/plain; charset=utf-8',{'Allow':'GET, HEAD, POST'});return;}
      if(req.headers.host!==new URL(currentOrigin()).host)invalid(403,'Fel serveradress.');
      const head=req.method==='HEAD';
      if((req.method==='GET'||head)&&route==='/inbox/style.css'){send(res,200,head?undefined:style,'text/css; charset=utf-8');return;}
      if((req.method==='GET'||head)&&route==='/inbox/health'){send(res,200,head?undefined:JSON.stringify({ok:true,storage:'private-node-directory',admin:config.admin?'activated':'setup-required',notifications:notify?'configured-unverified':'disabled'}),'application/json; charset=utf-8');return;}
      if((req.method==='GET'||head)&&route==='/inbox/token'){const form=url.searchParams.get('form')||'contact';if(!identifier(form))invalid(400,'Ogiltigt formulär.');rate(ip+':token',120,60000);send(res,200,head?undefined:JSON.stringify({token:token(form),minimumFillMs:minFillMs}),'application/json; charset=utf-8');return;}
      if((req.method==='GET'||head)&&route==='/inbox/form'){
        const challenge=token('contact');send(res,200,head?undefined:page('Skicka ett meddelande','<form class="panel" method="post" action="/inbox/submit"><input type="hidden" name="token" value="'+challenge+'"><input type="hidden" name="form" value="contact"><div class="trap" aria-hidden="true"><label>Lämna tomt<input name="company" tabindex="-1" autocomplete="off"></label></div><label>Namn<input name="name" required maxlength="120" autocomplete="name"></label><label>E-post<input name="email" type="email" required maxlength="254" autocomplete="email"></label><label>Meddelande<textarea name="message" rows="6" required maxlength="8000"></textarea></label><button type="submit">Skicka meddelandet</button><p class="meta">Meddelandet sparas i verksamhetens privata inkorg.</p></form>'));return;
      }
      if((req.method==='GET'||head)&&route==='/inbox/admin'){const auth=session(req);send(res,200,head?undefined:auth?dashboard(await messages(),auth):loginPage(!config.admin));return;}
      if((req.method==='GET'||head)&&route==='/inbox/export.csv'){if(!session(req))invalid(401,'Logga in först.');send(res,200,head?undefined:csvInbox(await messages()),'text/csv; charset=utf-8',{'Content-Disposition':'attachment; filename="superbrain-inbox.csv"'});return;}
      if(req.method!=='POST'){send(res,404,head?undefined:'Sidan finns inte.','text/plain; charset=utf-8');return;}
      originCheck(req);const data=await body(req);
      if(route==='/inbox/submit'){
        rate(ip+':submit',submitLimit,600000);const value=validateSubmission(data);if(data.company?.trim())invalid(400,'Formuläret kunde inte skickas.');const proof=challenge(data.token,value.form);
        const saved=await serial(async()=>{
          const file=path.join(messagesRoot,proof.nonce+'.json');await safeFile(file);
          try{return {message:JSON.parse(await readFile(file,'utf8')),duplicate:true};}catch(error){if(error.code!=='ENOENT')throw error;}
          const message={schema,id:proof.nonce,receivedAt:new Date(now()).toISOString(),status:'new',...value,notification:{status:notify?'pending':'disabled'}};
          await atomicJSON(file,message);
          if(notify){try{const receipt=await notify(message);message.notification={status:receipt?.accepted?'smtp-accepted':'smtp-rejected',messageId:receipt?.messageId||null};}catch{message.notification={status:'failed'};}await atomicJSON(file,message);}
          return {message,duplicate:false};
        });
        if((req.headers.accept||'').includes('application/json')||req.headers['content-type']?.startsWith('application/json'))send(res,saved.duplicate?200:201,JSON.stringify({ok:true,id:saved.message.id,stored:true,notification:saved.message.notification.status}),'application/json; charset=utf-8');
        else send(res,200,page('Meddelandet är sparat','<p>Tack. Ditt meddelande finns nu i verksamhetens inkorg.</p><p><a href="/inbox/form">Till formuläret</a></p>'));return;
      }
      if(route==='/inbox/setup'||route==='/inbox/login'){
        rate(ip+':login',8,900000);if(typeof data.password!=='string'||data.password.length<12||data.password.length>128)invalid(400,'Lösenordet måste ha 12–128 tecken.');
        await serial(async()=>{if(route==='/inbox/setup'){
          if(config.admin||typeof data.code!=='string'||!equal(digest(data.code),config.setupHash))invalid(403,'Installationskoden är ogiltig eller redan använd.');
          const salt=hex(16);config={...config,setupHash:null,admin:{salt,hash:(await scrypt(data.password,salt,64)).toString('hex')}};await atomicJSON(path.join(root,'config.json'),config);
        }else if(!config.admin||!equal((await scrypt(data.password,config.admin.salt,64)).toString('hex'),config.admin.hash))invalid(401,'Fel lösenord.');});
        for(const [id,value]of sessions)if(now()>value.expires)sessions.delete(id);if(sessions.size>=1000)invalid(429,'För många aktiva sessioner. Försök senare.');
        const id=hex(32);sessions.set(id,{csrf:hex(32),expires:now()+28800000});send(res,303,'','text/html; charset=utf-8',{'Location':'/inbox/admin','Set-Cookie':'sb_inbox='+id+'; Path=/inbox; HttpOnly; SameSite=Strict; Max-Age=28800'+(secure?'; Secure':'')});return;
      }
      if(route==='/inbox/status'){csrf(req,data);if(!['new','done'].includes(data.status))invalid(400,'Ogiltig status.');await serial(async()=>{const item=await record(data.id);item.value.status=data.status;await atomicJSON(item.file,item.value);});send(res,303,'','text/html; charset=utf-8',{'Location':'/inbox/admin'});return;}
      if(route==='/inbox/logout'){const auth=csrf(req,data);sessions.delete(auth.id);send(res,303,'','text/html; charset=utf-8',{'Location':'/inbox/admin','Set-Cookie':'sb_inbox=; Path=/inbox; HttpOnly; SameSite=Strict; Max-Age=0'+(secure?'; Secure':'')});return;}
      send(res,404,'Sidan finns inte.','text/plain; charset=utf-8');
    }catch(error){send(res,error.status||500,page('Det gick inte att slutföra',error.status?'<p>'+escape(error.message)+'</p><p><a href="/inbox/form">Försök igen</a></p>':'<p>Servern kunde inte behandla begäran. Försök igen senare.</p>'));}
  });
  let releasePromise;
  function release(){return releasePromise??=(async()=>{await queue;try{await safeFile(lockFile);if(await readFile(lockFile,'utf8')===lockValue)await unlink(lockFile);}catch(error){if(error.code!=='ENOENT')throw error;}})();}
  server.once('close',()=>{release().catch(()=>{});});
  server.shutdown=async()=>{if(server.listening)await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));await release();};
  return server;
}
