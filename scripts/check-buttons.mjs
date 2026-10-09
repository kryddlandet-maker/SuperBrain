// Optional host-provided Playwright; no runtime dependency added to SuperBrain.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root} from '../lib/brief.mjs';
import {createServer} from './serve.mjs';

const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT || 'playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const checks=[],errors=[];
const evidence=path.join(root,'docs/evidence');await mkdir(evidence,{recursive:true});
let browser;
const check=(name,details)=>checks.push({name,result:'pass',details});
const observe=page=>{
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
};
const pseudo=async locator=>locator.evaluate(el=>{
 const s=getComputedStyle(el,'::before'),m=new DOMMatrix(s.transform);
 return {x:m.a,y:m.d,left:parseFloat(s.left),top:parseFloat(s.top),opacity:Number(s.opacity),origin:s.transformOrigin,transition:s.transitionDuration};
});
try{
 browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_CHANNEL?{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 await context.addInitScript(()=>{
  const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),pending=new Set();
  window.__pendingFrames=pending;
  window.requestAnimationFrame=fn=>{let id=raf(t=>{pending.delete(id);fn(t);});pending.add(id);return id;};
  window.cancelAnimationFrame=id=>{pending.delete(id);cancel(id);};
 });
 const page=await context.newPage();observe(page);
 await page.goto(base+'/examples/buttons/');await page.locator('.controls').waitFor({state:'visible'});
 await page.selectOption('[name=easing]','linear');
 await page.locator('[name=duration]').fill('600');await page.locator('[name=duration]').dispatchEvent('input');
 for(const [direction,axis] of [['left','x'],['bottom','y'],['top','y']]){
  const el=page.locator('[data-fill='+direction+']');
  await page.mouse.move(2,2);await el.evaluate(e=>e.blur());
  await page.waitForTimeout(650);
  const idle=await pseudo(el);assert(idle[axis]<.001);
  await el.hover();await page.waitForTimeout(100);
  const mid=await pseudo(el);assert(mid[axis]>.02 && mid[axis]<.95);
  const box=await el.boundingBox();
  const origin=mid.origin.split(' ').map(Number.parseFloat);
  if(direction==='left')assert(origin[0]<1);
  if(direction==='top')assert(origin[1]<1);
  if(direction==='bottom')assert(Math.abs(origin[1]-box.height)<3);
  await page.mouse.move(2,2);await page.waitForTimeout(30);
  const reverse=await pseudo(el);assert(reverse[axis]<=mid[axis]+.08);
  await el.hover();await page.waitForTimeout(700);
  const resolved=await pseudo(el);assert(resolved[axis]>.999);
  check('fill-'+direction,{scope:'Idle, intermediate, transform origin, interrupted reversal and resolved fill',idle,mid,reverse,resolved});
 }
 const glow=page.locator('[data-horizontal-glow]');
 await page.mouse.move(2,2);await page.waitForTimeout(650);assert.equal((await pseudo(glow)).opacity,0);
 await glow.scrollIntoViewIfNeeded();let box=await glow.boundingBox();
 await page.mouse.move(box.x+20,box.y+10);await page.waitForTimeout(750);
 const first=await pseudo(glow);assert(first.opacity>.23);assert(Math.abs(first.top-box.height/2)<2);
 await page.mouse.move(box.x+box.width-20,box.y+box.height-8);await page.waitForTimeout(750);
 const second=await pseudo(glow);assert(second.left>first.left+box.width/3);assert.equal(second.top,first.top);
 assert.equal(await page.evaluate(()=>window.__pendingFrames.size),0);
 await page.screenshot({path:path.join(evidence,'buttons-desktop.png'),fullPage:true});
 await glow.dispatchEvent('pointercancel');assert.equal(await glow.getAttribute('data-tracking'),null);
 await page.mouse.move(2,2);await page.waitForTimeout(650);assert.equal((await pseudo(glow)).opacity,0);
 check('horizontal-glow',{scope:'Hidden at rest; appears on hover, x changes with invariant y, settles without pending RAF, cancel/leave reset',first,second,pendingRAF:0});
 await glow.focus();await page.waitForTimeout(650);
 box=await glow.boundingBox();const focused=await pseudo(glow);
 assert(Math.abs(focused.left-box.width/2)<2);assert.equal(await glow.evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await page.keyboard.press('Enter');await page.keyboard.press('Space');
 assert.match(await page.locator('#button-status').textContent(),/2/);
 await page.keyboard.press('Tab');assert.notEqual(await page.evaluate(()=>document.activeElement.hasAttribute('data-horizontal-glow')),true);
 check('keyboard','Visible outline and centered light; native Enter/Space activate exactly once each; Tab exits');
 const hex=value=>value.trim().replace('#','').match(/../g).map(v=>parseInt(v,16));
 const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
 const palettes=[];
 for(const color of ['pine','wine','indigo']){
  await page.selectOption('[name=color]',color);
  const values=await glow.evaluate(e=>{const s=getComputedStyle(e);return ['--sb-ink','--sb-base','--sb-fill','--sb-glow'].map(k=>s.getPropertyValue(k));});
  const [ink,baseColor,fillColor,lightColor]=values.map(hex);
  const fillRatio=contrast(ink,fillColor),glowRatio=contrast(ink,lightColor.map((v,i)=>v*.35+baseColor[i]*.65));
  assert(fillRatio>=4.5 && glowRatio>=4.5);palettes.push({color,fillRatio,maxGlowRatio:glowRatio});
 }
 check('palette-text-contrast',{scope:'WCAG contrast formula for supplied text/fill colors and brightest glow center at max .35 opacity; not whole-site certification',palettes});
 await page.selectOption('[name=color]','wine');
 await page.locator('[name=size]').fill('220');await page.locator('[name=size]').dispatchEvent('input');
 await page.locator('[name=intensity]').fill('30');await page.locator('[name=intensity]').dispatchEvent('input');
 assert.equal(await glow.evaluate(e=>getComputedStyle(e).getPropertyValue('--sb-glow-size')),'220px');
 assert.equal(await glow.evaluate(e=>getComputedStyle(e).getPropertyValue('--sb-intensity')),'0.3');
 assert.equal(await glow.evaluate(e=>getComputedStyle(e).getPropertyValue('--sb-fill')),'#653544');
 await page.locator('[name=still]').check();assert.equal((await pseudo(glow)).transition,'0s');
 await glow.hover();assert.equal(await glow.getAttribute('data-tracking'),null);
 await page.locator('[name=still]').uncheck();
 check('configuration','Color, size, intensity, timing/easing and stationary preview apply to each button');
 await glow.hover();await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>!document.querySelector('[data-horizontal-glow]').hasAttribute('data-tracking'));
 assert.equal(await glow.getAttribute('data-tracking'),null);assert.equal((await pseudo(glow)).transition,'0s');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.mouse.move(2,2);await glow.hover();
 assert.notEqual(await glow.getAttribute('data-tracking'),null);
 await page.evaluate(()=>window.dispatchEvent(new Event('resize')));assert.equal(await glow.getAttribute('data-tracking'),null);
 check('live-preferences','Reduced motion cancels tracking without reload; restoring allows it; resize resets geometry');
 await page.emulateMedia({forcedColors:'active'});assert.equal(await glow.evaluate(e=>getComputedStyle(e,'::before').display),'none');
 await page.locator('[data-fill=top]').focus();await page.keyboard.press('Tab');
 assert(await glow.evaluate(e=>e===document.activeElement && e.matches(':focus-visible')));
 assert.equal(await glow.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 check('forced-colors','Decoration removed, focus outline retained');await page.emulateMedia({forcedColors:'none'});
 await glow.evaluate(e=>{e.blur();e.disabled=true;});await page.mouse.move(2,2);await glow.hover({force:true});
 assert.equal(await glow.getAttribute('data-tracking'),null);await glow.evaluate(e=>e.disabled=false);
 check('disabled','Disabled native button does not begin pointer tracking');
 for(const width of [768,390,320]){
  await page.setViewportSize({width,height:900});await page.mouse.move(2,2);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert(await page.locator('.sb-button').first().evaluate(e=>e.getBoundingClientRect().height>=44));
  if(width===390)await page.screenshot({path:path.join(evidence,'buttons-mobile.png'),fullPage:true});
  check('reflow-'+width,'No horizontal page overflow; target height >=44 CSS px');
 }
 await page.goto(base+'/examples/library/');await page.waitForFunction(()=>document.querySelector('#status').textContent==='86 träffar.');
 await page.locator('[name=q]').fill('horizontal light');await page.selectOption('[name=domain]','D');
 await page.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='1 träffar.');
 assert.match(await page.locator('#results').textContent(),/C004/);check('library','Combined query/domain finds exact new glow candidate with source details');
 for(const route of ['/','/examples/effects/','/examples/collection/','/examples/technology/product/','/examples/salon/booking/','/examples/construction/projects/']){
  const response=await page.goto(base+route);assert.equal(response.status(),200);assert(await page.locator('main').count());
 }
 check('legacy-routes','Studio and five representative older routes load; this is a smoke test, not visual recertification');
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const plain=await noJS.newPage();observe(plain);await plain.goto(base+'/examples/buttons/');
 assert.equal(await plain.locator('.controls').isVisible(),false);
 for(const [direction,axis] of [['left','x'],['bottom','y'],['top','y']]){
  const el=plain.locator('[data-fill='+direction+']');await el.focus();await plain.waitForTimeout(650);assert((await pseudo(el))[axis]>.99);
 }
 check('no-javascript','Controls hidden; content/native buttons and all three CSS focus fills remain usable');await noJS.close();
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const mobile=await touch.newPage();observe(mobile);await mobile.goto(base+'/examples/buttons/');
 const touchSession=await touch.newCDPSession(mobile);
 const mobileButtons=mobile.locator('.sb-button');
 for(let i=0;i<4;i++){
  const el=mobileButtons.nth(i);await el.scrollIntoViewIfNeeded();const mb=await el.boundingBox();
  await touchSession.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:mb.x+mb.width/2,y:mb.y+mb.height/2}]});
  await mobile.waitForFunction(index=>document.querySelectorAll('.sb-button')[index].hasAttribute('data-pressed'),i,{timeout:2000});
  assert.equal(await el.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(49, 83, 73)');
  if(i<3){await mobile.waitForTimeout(450);const fill=await pseudo(el);assert((i===0?fill.x:fill.y)>.99);}
  await touchSession.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await el.getAttribute('data-pressed'),null);assert.equal(await el.getAttribute('data-tracking'),null);
  assert.equal(await mobile.locator('#button-status').textContent(),'Lokal respons '+(i+1)+'. Ingen uppgift skickas.');
 }
 check('touch','All four emulated coarse-touch buttons show press feedback, activate exactly once and clear press/tracking');await touch.close();
 assert.deepEqual(errors,[]);check('browser-errors','No page errors or console errors during checked routes');
 const report={date:new Date().toISOString(),browser:await browser.version(),engine:'Chromium',channel:process.env.SUPERBRAIN_BROWSER_CHANNEL||'bundled',platform:process.platform,
  scope:'Local button study, library search and legacy route smoke tests. Emulated viewports/input/media; no physical-device, Firefox/WebKit, screen-reader, production or controlled model benchmark certification.',
  checks,errors,screenshots:['docs/evidence/buttons-desktop.png','docs/evidence/buttons-mobile.png']};
 await writeFile(path.join(evidence,'buttons-browser.json'),JSON.stringify(report,null,2)+'\n');
 console.log('Passed '+checks.length+' scoped browser checks. Evidence: docs/evidence/buttons-browser.json');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
