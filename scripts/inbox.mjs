import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {initInbox,createInboxServer,createSmtpNotifier} from '../lib/form-inbox.mjs';

const usage=`Usage:
  node scripts/inbox.mjs init <new-private-data-folder> [--name "Business inbox"]
  node scripts/inbox.mjs serve <private-data-folder> [--port 4331] [--host 127.0.0.1] [--origin https://site.example] [--smtp private-smtp.json]

Node hosting is required. This is not a PHP or static-hosting backend.
Data stays outside the served site; this server exposes only /inbox routes.
init prints a one-time owner setup code. Choose your own password at /inbox/admin.
SMTP is optional, disabled by default and requires Nodemailer plus real account settings.
No configuration passwords are accepted on the command line or sent to a third party.`;

export async function inboxMain(args=process.argv.slice(2)){
  if(args.length===1&&args[0]==='--help'){console.log(usage);return;}
  const [command,directory,...rest]=args;if(!['init','serve'].includes(command)||!directory||directory.startsWith('--')||rest.length%2)throw new Error(usage);
  const options={},allowed=command==='init'?['--name']:['--port','--host','--origin','--smtp'];
  for(let i=0;i<rest.length;i+=2){const flag=rest[i],value=rest[i+1];if(!allowed.includes(flag)||options[flag]!==undefined||!value||value.startsWith('--'))throw new Error('Invalid or repeated option: '+flag+'\n'+usage);options[flag]=value;}
  if(command==='init'){
    const result=await initInbox(directory,{name:options['--name']||'Meddelanden'});
    console.log(JSON.stringify({status:result.created?'created':'preserved',directory:result.directory,setupCode:result.setupCode},null,2));return result;
  }
  const port=Number(options['--port']||4331),host=options['--host']||'127.0.0.1';
  if(!Number.isInteger(port)||port<1||port>65535||!['127.0.0.1','0.0.0.0','::1','::'].includes(host))throw new Error('Use a valid port and an explicit local/all-interface bind address');
  if(!options['--origin']&&['0.0.0.0','::'].includes(host))throw new Error('Public binding requires an explicit HTTPS --origin behind a TLS reverse proxy');
  const notify=options['--smtp']?await createSmtpNotifier(JSON.parse(await readFile(path.resolve(options['--smtp']),'utf8'))):null;
  const server=await createInboxServer({directory,origin:options['--origin']||'http://127.0.0.1:'+port,notify});
  try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve);});}catch(error){await server.shutdown();throw error;}
  let stopping=false;const stop=()=>{if(stopping)return;stopping=true;server.shutdown().catch(error=>{console.error(error.message);process.exitCode=1;});};process.once('SIGINT',stop);process.once('SIGTERM',stop);
  console.log('SuperBrain inbox: '+(options['--origin']||'http://127.0.0.1:'+port)+'/inbox/admin');console.log('Notifications: '+(notify?'SMTP configured; delivery not yet verified':'disabled'));return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)inboxMain().catch(error=>{console.error(error.message);process.exitCode=1;});
