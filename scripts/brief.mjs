import { readFile, writeFile } from 'node:fs/promises';
import { compileBrief } from '../lib/brief.mjs';
const [input, output, ...extra] = process.argv.slice(2);
if (!input || extra.length) throw new Error('Usage: node scripts/brief.mjs input.json [output.md]');
const result = await compileBrief(JSON.parse(await readFile(input, 'utf8')));
if (output) await writeFile(output, result, {encoding:'utf8', flag:'wx'});
else process.stdout.write(result);
