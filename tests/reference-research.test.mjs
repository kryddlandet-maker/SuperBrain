import test from 'node:test';import assert from 'node:assert/strict';
import {generateDesignSystem} from '../lib/design-system.mjs';
import {referencePlan} from '../lib/reference-plan.mjs';
import {compareChange,validateChangeSpec} from '../lib/change-proof.mjs';
import {routeSkills} from '../lib/skill-router.mjs';
const base={name:'Actual project',type:'salon',goal:'Visa tjänster',motion:'quiet'};
const ref={source:'https://example.test/specimen',scope:'component',target:'#booking',reviewer:'Observed by owner',observations:['Short heading above a compact booking action'],preserve:['navigation and booking destination'],decisions:[{aspect:'typography',observation:0,adopt:'A readable compact heading',avoid:'The reference logo and brand lettering',reason:'Keep the real booking action prominent'}]};
test('reference decisions retain their observed basis without widening a component edit or quiet briefs',()=>{
 const result=generateDesignSystem({...base,references:[ref]});assert.equal(result.plan.mode,'quick-edit');const contract=JSON.parse(result.files['.ai/project/superbrain/reference-contract.json']);assert.equal(contract.references[0].decisions[0].observation,0);assert.equal(contract.references[0].target,'#booking');assert.deepEqual(contract.references[0].preserve,ref.preserve);assert.equal(contract.typography.display,null);assert(result.plan.routing.references.includes('reference-research'));assert(!Object.keys(result.files).some(p=>p.startsWith('design-system/')));
 const site=generateDesignSystem({...base,references:[{...ref,scope:'site'}]});assert(JSON.parse(site.files['design-system/reference-contract.json']).references[0].decisions.length);
 const quiet=generateDesignSystem(base);assert(!quiet.files['design-system/reference-contract.json']);assert(!quiet.plan.routing.references.includes('reference-research'));assert(!quiet.plan.routing.references.includes('web-copy'));
 assert(routeSkills({...base,task:'Förbättra webbtext och microcopy'},'quick-edit').references.includes('web-copy'));
 assert.throws(()=>referencePlan([{...ref,decisions:[{...ref.decisions[0],observation:99}]}]),/existing observation/);
});
test('change proof refuses no-op, unintended collateral changes, ambiguous targets and mismatched viewports',()=>{
 const spec={target:'#cta',properties:['color'],expected:{color:'rgb(255, 255, 255)'},preserve:['#nav']};validateChangeSpec(spec);
 const before={schema:1,url:'http://localhost/',viewport:{width:1280,height:900},motion:'reduce',spec,target:{count:1,visible:true,values:{color:'rgb(0, 0, 0)'}},preserved:{'#nav':{count:1,text:'Home',values:{color:'rgb(0, 0, 0)'}}}};
 assert.equal(compareChange(before,before).status,'needs-review');const after=structuredClone(before);after.target.values.color=spec.expected.color;assert.equal(compareChange(before,after).status,'verified-computed-change');after.preserved['#nav'].text='Wrong';assert.equal(compareChange(before,after).status,'needs-review');after.target.count=2;assert(compareChange(before,after).issues.some(s=>s.includes('unique')));after.viewport.width=390;assert.throws(()=>compareChange(before,after),/same URL/);
});
