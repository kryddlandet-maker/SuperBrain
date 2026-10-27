import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {CodexAppClient} from '../lib/codex-app-client.mjs';
import {packageCodexPlugins,pluginSourceRoot} from '../lib/codex-plugins.mjs';
import {registerCodexPlugins} from '../lib/register-codex-plugins.mjs';

const args=process.argv.slice(2);
if(args.includes('--help')){
  console.log('Usage: node scripts/register-plugins.mjs [--update]\nRegisters SuperBrain and Frontend Design as PRIVATE plugins in the signed-in Codex account, then verifies installation.\nRequires the Codex CLI and an existing ChatGPT login (codex login). Existing owned plugins are reused; --update explicitly replaces an existing SuperBrain-owned package.\nPrivate registration receipts are written under ignored artifacts/codex-plugins/.');
}else{
  if(args.some(a=>a!=='--update')||args.length>1)throw new Error('Usage: node scripts/register-plugins.mjs [--update]');
  const bundle=await packageCodexPlugins();
  const client=new CodexAppClient(),out=path.join(pluginSourceRoot,'artifacts/codex-plugins');await mkdir(out,{recursive:true});
  try{
    await client.initialize();
    const receipts=await registerCodexPlugins(client,bundle,{update:args.includes('--update'),onReceipt:async plugins=>{
      await writeFile(path.join(out,'registration.json'),JSON.stringify({date:new Date().toISOString(),plugins},null,2)+'\n',{mode:0o600});
    }});
    console.log(JSON.stringify({status:'installed-and-verified',plugins:receipts},null,2));
  }catch(error){console.error(error.message);console.error('Registration is not confirmed. Review any partial receipts in artifacts/codex-plugins/registration.json; a retry reuses owned plugin IDs rather than creating duplicates.');process.exitCode=1;}
  finally{client.close();}
}
