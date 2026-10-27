import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';

/** Official Codex JSON-RPC app-server transport. Authentication stays inside Codex. */
export class CodexAppClient {
  constructor({launch=()=>spawn('codex',['app-server','--stdio','-c','analytics.enabled=false'],{stdio:['pipe','pipe','pipe'],shell:process.platform==='win32'}),timeout=120000}={}){
    this.process=launch();this.pending=new Map();this.sequence=0;this.timeout=timeout;this.closed=false;this.diagnostics='';
    this.process.stderr.on('data',b=>{this.diagnostics=(this.diagnostics+b.toString()).slice(-1500);});
    this.lines=createInterface({input:this.process.stdout});
    this.lines.on('line',line=>{
      let message;try{message=JSON.parse(line);}catch{return;}
      const call=this.pending.get(message.id);if(!call)return;
      this.pending.delete(message.id);clearTimeout(call.timer);
      if(message.error)call.reject(new Error('Codex '+call.method+': '+message.error.message));else call.resolve(message.result);
    });
    this.process.once('error',error=>this.fail(error.code==='ENOENT'?new Error('Codex CLI was not found. Install/update @openai/codex and run codex login, then retry.'):error));
    this.process.stdin.on('error',error=>this.fail(error));
    this.process.once('exit',code=>{if(!this.closed)this.fail(new Error('Codex app-server exited '+code+'. '+this.diagnostics));});
  }
  fail(error){this.closed=true;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}this.pending.clear();}
  call(method,params={}){
    if(this.closed)return Promise.reject(new Error('Codex app-server is closed'));
    return new Promise((resolve,reject)=>{
      const id=++this.sequence;
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Codex '+method+' timed out; no automatic retry was made.'));},this.timeout);
      this.pending.set(id,{resolve,reject,timer,method});
      this.process.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n',error=>{if(error)this.fail(error);});
    });
  }
  async initialize(){
    await this.call('initialize',{clientInfo:{name:'superbrain-plugin-setup',version:'1.0.0'},capabilities:{experimentalApi:true}});
    this.process.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'initialized'})+'\n');
  }
  close(){this.fail(new Error('Codex app-server closed'));this.lines.close();this.process.stdin.end();this.process.kill();}
}
