import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const referenceNames = ['architecture', 'art-direction', 'typography-layout', 'continuity', 'local-business', 'technology', 'motion', 'interactive-effects', 'accessibility', 'assets-performance', 'review'];

export function validateBrief(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Brief must be an object');
  for (const field of ['name', 'type', 'goal']) if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error(`Missing ${field}`);
  if (!['technology', 'salon', 'construction', 'other'].includes(data.type)) throw new Error('Unknown business type');
  if (data.pages !== undefined && (!Array.isArray(data.pages) || data.pages.some(p => typeof p !== 'string' || !/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(p)))) throw new Error('Pages must be local route paths');
  if (data.pages && new Set(data.pages).size !== data.pages.length) throw new Error('Duplicate routes');
  if (data.motion !== undefined && !['quiet', 'expressive', 'immersive'].includes(data.motion)) throw new Error('Unknown motion level');
  for (const field of ['audience', 'direction', 'facts', 'questions']) if (data[field] !== undefined && typeof data[field] !== 'string') throw new Error(`Invalid ${field}`);
  return data;
}

export function selectReferences(data) {
  validateBrief(data);
  const refs = ['architecture', 'art-direction', 'typography-layout', 'continuity'];
  if (data.type === 'technology') refs.push('technology');
  if (['salon', 'construction'].includes(data.type)) refs.push('local-business');
  refs.push('motion');
  if (data.motion !== 'quiet') refs.push('interactive-effects');
  refs.push('accessibility', 'assets-performance', 'review');
  return refs;
}

export function briefText(data) {
  validateBrief(data);
  return `# Projektbrief: ${data.name}\n\nAnvänd SuperBrain. Föreslå en konkret designriktning och börja bygga direkt. Fråga vid viktiga val och fortsätt med oberoende arbete medan svar inväntas.\n\n- Verksamhet: ${data.type}\n- Mål: ${data.goal}\n- Målgrupp: ${data.audience || 'Fråga eller ange antagande'}\n- Motion: ${data.motion || 'expressive'}\n- Sidor: ${data.pages?.join(', ') || 'Föreslå verkliga routes utifrån besökarens uppgifter'}\n- Riktning: ${data.direction || 'Välj en tydlig egen riktning'}\n\n## Verifierade fakta / innehåll att kontrollera\n${data.facts || 'Affärsfakta saknas. Inventera och fråga; hitta inte på kundbevis eller bokningar.'}\n\n## Öppna frågor\n${data.questions || 'Vilka assets, kontaktuppgifter och riktiga boknings-/formulärsystem finns?'}\n\nSkapa ett sammanhängande visuellt flöde med stark typografi och olika kompositioner. Semantiska sektioner behöver inte skarpa visuella gränser. Flersidigt är standard; undersidor ska ha egna syften och fungera vid direkt laddning. Anpassa interaktion för touch, tangentbord och minskad rörelse.\n`;
}

export async function compileBrief(data) {
  const refs = selectReferences(data);
  const skill = await readFile(path.join(root, 'skills/superbrain/SKILL.md'), 'utf8');
  const chapters = await Promise.all(refs.map(async name => `\n---\n\n<!-- ${name} -->\n${await readFile(path.join(root, 'skills/superbrain/references', `${name}.md`), 'utf8')}`));
  return `${briefText(data)}\n---\n\n# Relevant SuperBrain guidance\n\n${skill}${chapters.join('')}\n`;
}
