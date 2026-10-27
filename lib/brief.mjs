import {validateBrief} from './project-schema.mjs';
import {planDesign,planMarkdown} from './design-engine.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const referenceNames = ['architecture', 'art-direction', 'typography-layout', 'continuity', 'local-business', 'technology', 'motion', 'interactive-effects', 'accessibility', 'assets-performance', 'review', 'effect-selection', 'visual-materials', 'type-motion', 'product-stories', 'galleries-commerce', 'advanced-graphics', 'site-archetypes', 'button-interactions', 'accessible-actions', 'motion-lifecycle', 'library-discovery','design-intelligence','design-systems','visual-critique','reference-workflow','product-motion','anthropic-skills'];

export {validateBrief} from './project-schema.mjs';
export function selectReferences(data){return planDesign(data).routing.references;}

export function briefText(data) {
  validateBrief(data);
  return `# Projektbrief: ${data.name}\n\nAnvänd SuperBrain. Föreslå en konkret designriktning och börja bygga direkt. Fråga vid viktiga val och fortsätt med oberoende arbete medan svar inväntas.\n\n- Verksamhet: ${data.type}\n- Mål: ${data.goal}\n- Målgrupp: ${data.audience || 'Fråga eller ange antagande'}\n- Teknikfamiljer: ${data.techniques?.join(', ') || 'Välj efter varumärkets behov; inga obligatoriska effekter'}\n- Motion: ${data.motion || 'expressive'}\n- Sidor: ${data.pages?.join(', ') || 'Föreslå verkliga routes utifrån besökarens uppgifter'}\n- Riktning: ${data.direction || 'Välj en tydlig egen riktning'}\n\n## Verifierade fakta / innehåll att kontrollera\n${data.facts || 'Affärsfakta saknas. Inventera och fråga; hitta inte på kundbevis eller bokningar.'}\n\n## Öppna frågor\n${data.questions || 'Vilka assets, kontaktuppgifter och riktiga boknings-/formulärsystem finns?'}\n\nSkapa ett sammanhängande visuellt flöde med stark typografi och olika kompositioner. Semantiska sektioner behöver inte skarpa visuella gränser. Flersidigt är standard; undersidor ska ha egna syften och fungera vid direkt laddning. Anpassa interaktion för touch, tangentbord och minskad rörelse.\n`;
}

export async function compileBrief(data) {
  const plan=planDesign(data);
  const refs=plan.routing.references;
  const skill = await readFile(path.join(root, 'skills/superbrain/SKILL.md'), 'utf8');
  const chapters = await Promise.all(refs.map(async name => `\n---\n\n<!-- ${name} -->\n${await readFile(path.join(root, 'skills/superbrain/references', `${name}.md`), 'utf8')}`));
  return `${briefText(data)}
${planMarkdown(plan)}\n---\n\n# Relevant SuperBrain guidance\n\n${skill}${chapters.join('')}\n`;
}
