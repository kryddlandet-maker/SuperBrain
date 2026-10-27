import {verifyAnthropicSkills} from '../lib/anthropic-skills.mjs';
const args=process.argv.slice(2);
if(args.length===1&&args[0]==='--help'){
  console.log('Usage: node scripts/anthropic.mjs [--verify]\nLists the four pinned original packages, or verifies their complete contents.\nActivate them in a consuming project with: node scripts/install.mjs /existing/project --anthropic');
}else{
  if(args.length>1||args.length===1&&args[0]!=='--verify')throw new Error('Usage: node scripts/anthropic.mjs [--verify]');
  const result=await verifyAnthropicSkills();
  console.log(JSON.stringify(args[0]==='--verify'?{status:'verified',commit:result.commit,packages:result.packages.map(p=>p.id),filesVerified:result.filesVerified}:result,null,2));
}
