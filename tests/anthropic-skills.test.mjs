import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,rm,cp,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,compileBrief,selectReferences} from '../lib/brief.mjs';
import {anthropicSkillIds,anthropicCommit,verifyAnthropicSkills} from '../lib/anthropic-skills.mjs';
import {install} from '../scripts/install.mjs';

test('original Anthropic packages retain complete licenses, helpers, notices and verified source bytes',async()=>{
  const catalog=await verifyAnthropicSkills();assert.equal(catalog.commit,anthropicCommit);assert.deepEqual(catalog.packages.map(p=>p.id),anthropicSkillIds);assert.equal(catalog.filesVerified,32);
  for(const skill of catalog.packages){assert((await readFile(path.join(root,skill.entrypoint),'utf8')).includes('name: '+skill.id));assert((await readFile(path.join(root,skill.license),'utf8')).includes('Apache License'));}
  const target=await mkdtemp(path.join(tmpdir(),'anthropic-integrity-'));
  try{
    await cp(path.join(root,'vendor'),path.join(target,'vendor'),{recursive:true});
    await writeFile(path.join(target,'vendor/anthropic/skills/frontend-design/SKILL.md'),'Changed original');
    await assert.rejects(verifyAnthropicSkills(target),/Modified Anthropic original/);
  }finally{await rm(target,{recursive:true,force:true});}
});
test('original packages are available on demand; native activation is repeatable and protects local changes',async()=>{
  const target=await mkdtemp(path.join(tmpdir(),'anthropic-install-'));
  try{
    await writeFile(path.join(target,'AGENTS.md'),'# Actual project\nPreserve the booking flow.\n');
    await install(target);await assert.rejects(readFile(path.join(target,'.agents/skills/frontend-design/SKILL.md')),/ENOENT/);
    const verified=JSON.parse(execFileSync(process.execPath,[path.join(target,'.superbrain/scripts/anthropic.mjs'),'--verify'],{encoding:'utf8'}));assert.equal(verified.status,'verified');
    await install(target,{anthropic:true});await install(target,{anthropic:true});
    for(const id of anthropicSkillIds)assert.deepEqual(await readFile(path.join(target,'.agents/skills',id,'SKILL.md')),await readFile(path.join(root,'vendor/anthropic/skills',id,'SKILL.md')));
    const tar='web-artifacts-builder/scripts/shadcn-components.tar.gz';assert.deepEqual(await readFile(path.join(target,'.agents/skills',tar)),await readFile(path.join(root,'vendor/anthropic/skills',tar)));
    assert((await stat(path.join(target,'.agents/skills/web-artifacts-builder/scripts/init-artifact.sh'))).mode&0o111);
    const agents=await readFile(path.join(target,'AGENTS.md'),'utf8');assert(agents.includes('Preserve the booking flow.'));
    await writeFile(path.join(target,'.agents/skills/frontend-design/SKILL.md'),'Local customization');
    await assert.rejects(install(target,{anthropic:true}),/Locally edited/);assert.equal(await readFile(path.join(target,'AGENTS.md'),'utf8'),agents);
    assert.equal(await readFile(path.join(target,'.agents/skills/frontend-design/SKILL.md'),'utf8'),'Local customization');
  }finally{await rm(target,{recursive:true,force:true});}
});
test('native activation refuses unmanaged originals before mutation; briefs load only the optional guide',async()=>{
  const target=await mkdtemp(path.join(tmpdir(),'anthropic-conflict-'));
  try{
    await mkdir(path.join(target,'.agents/skills/frontend-design'),{recursive:true});await writeFile(path.join(target,'.agents/skills/frontend-design/SKILL.md'),'Unmanaged instructions');
    await assert.rejects(install(target,{anthropic:true}),/Unmanaged destination/);await assert.rejects(readFile(path.join(target,'.superbrain/install.json')),/ENOENT/);
    assert.equal(await readFile(path.join(target,'.agents/skills/frontend-design/SKILL.md'),'utf8'),'Unmanaged instructions');
  }finally{await rm(target,{recursive:true,force:true});}
  const brief={name:'Actual product',type:'technology',goal:'Explain the supplied product'};
  assert(!selectReferences(brief).includes('anthropic-skills'));
  const compiled=await compileBrief({...brief,direction:'Use the original Anthropic frontend-design guidance'});assert(compiled.includes('# Optional original Anthropic skills'));assert(!compiled.includes('Approach this as the design lead at a design studio'));
});
