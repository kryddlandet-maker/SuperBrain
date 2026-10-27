import {initProductScene} from '../shared/product-motion.js';
const controllers=new Map();
const frame=(offset,transform,opacity=1)=>({offset,transform,opacity,easing:'cubic-bezier(.22,1,.36,1)'});
function tracksFor(root){
 const track=(selector,keyframes)=>({element:root.querySelector(selector),keyframes});
 if(root.id==='workflow')return [
  track('.moving-task',[frame(0,'translate(0,0)'),frame(.18,'translate(0,0)'),frame(.4,'translate(108%,-8%) rotate(3deg)'),frame(.56,'translate(108%,0)'),frame(.82,'translate(108%,0)'),frame(.9,'translate(108%,0)',0),frame(.94,'translate(0,0)',0),frame(1,'translate(0,0)')]),
  track('.workflow-cursor',[frame(0,'translate(0,0)',0),frame(.14,'translate(0,0)',1),frame(.4,'translate(150%,-8%)'),frame(.56,'translate(150%,0)'),frame(.66,'translate(175%,25%)',0),frame(1,'translate(0,0)',0)]),
  track('.workflow-result',[frame(0,'translate(-50%,8px)',0),frame(.5,'translate(-50%,8px)',0),frame(.62,'translate(-50%,0)'),frame(.82,'translate(-50%,0)'),frame(.9,'translate(-50%,8px)',0),frame(1,'translate(-50%,8px)',0)])
 ];
 if(root.id==='orbit')return [...root.querySelectorAll('.capability')].map((element,i)=>({element,keyframes:[frame(0,'translate(0,0)'),frame(.12+i*.025,'translate(0,0)'),frame(.4+i*.015,`translate(${i%2?5:-5}px,${i%2?-11:8}px) rotate(${i%2?6:-6}deg)`),frame(.7,`translate(${i%2?-4:4}px,${i%2?5:-7}px) rotate(${i%2?-4:4}deg)`),frame(.94,'translate(0,0)'),frame(1,'translate(0,0)')]}));
 return [
  track('.playhead',[frame(0,'translateX(0)'),frame(.16,'translateX(0)'),frame(.7,'translateX(62cqw)'),frame(.84,'translateX(62cqw)'),frame(.9,'translateX(62cqw)',0),frame(.94,'translateX(0)',0),frame(1,'translateX(0)')]),
  track('.clip-track',[frame(0,'translateX(0)'),frame(.18,'translateX(0)'),frame(.58,'translateX(-9%)'),frame(.84,'translateX(-9%)'),frame(.9,'translateX(-9%)',0),frame(.94,'translateX(0)',0),frame(1,'translateX(0)')]),
  track('.preview-caption',[frame(0,'translateY(5px)',0),frame(.26,'translateY(5px)',0),frame(.38,'translateY(0)'),frame(.58,'translateY(0)'),frame(.7,'translateY(-3px)',0),frame(1,'translateY(5px)',0)]),
  track('.editor-result',[frame(0,'translate(-50%,8px)',0),frame(.64,'translate(-50%,8px)',0),frame(.75,'translate(-50%,0)'),frame(.85,'translate(-50%,0)'),frame(.92,'translate(-50%,8px)',0),frame(1,'translate(-50%,8px)',0)])
 ];
}
function init(){
 for(const root of document.querySelectorAll('[data-product-scene]')){
  const controller=initProductScene(root,tracksFor(root),{button:root.querySelector('[data-play]'),stillAt:root.id==='timeline'?.8:.68});
  const restart=root.querySelector('[data-restart]');restart.disabled=controller.state==='unavailable';
  const replay=()=>controller.restart();restart.addEventListener('click',replay);
  controllers.set(root,{controller,dispose(){controller.dispose();restart.removeEventListener('click',replay);restart.disabled=true;}});
 }
}
init();
addEventListener('pagehide',()=>{controllers.forEach(c=>c.dispose());controllers.clear();});
addEventListener('pageshow',event=>{if(event.persisted)init();});
