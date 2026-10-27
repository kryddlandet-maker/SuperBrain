import {packageCodexPlugins} from '../lib/codex-plugins.mjs';
if(process.argv.length>2)throw new Error('Usage: node scripts/package-plugins.mjs');
const bundle=await packageCodexPlugins();
console.log(JSON.stringify({directory:bundle.directory,plugins:bundle.plugins,files:bundle.files.length},null,2));
