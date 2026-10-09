import {loadLibrary, searchLibrary, summarizeLibrary} from '../lib/library.mjs';

try {
  const args=process.argv.slice(2),options={};let full=false;
  for(let i=0;i<args.length;i++) {
    const flag=args[i];
    if(flag==='--full'){full=true;continue;}
    const names={'--query':'query','--domain':'domain','--state':'maturity','--limit':'limit'};
    if(!names[flag] || !args[i+1] || args[i+1].startsWith('--')) throw new Error('Usage: discover.mjs [--query words] [--domain A–V] [--state RESEARCHED|PROTOTYPED|TESTED|EXPERIMENTAL] [--limit 1–500] [--full]');
    options[names[flag]]=flag==='--limit'?Number(args[++i]):args[++i];
  }
  const library=await loadLibrary();
  const matches=searchLibrary(library,options);
  console.log(JSON.stringify({summary:summarizeLibrary(library),matches:full?matches:matches.map(c=>({
    id:c.id,name:c.name,kind:c.kind,domain:c.domain,maturity:c.maturity,
    description:c.description,reference:c.reference,demo:c.demo,validation:c.validation.scope
  }))},null,2));
} catch(error) {console.error(error.message);process.exitCode=1;}
