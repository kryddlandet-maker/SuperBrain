import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {homographyForQuad,filmMatrix3d,projectFilmQuad,sampleFilmTrack,validateFilmTrack,initFilmSurface} from '../examples/shared/film-surface.js';
import {trackPlanarFilm} from '../lib/film-tracking.mjs';
import {parseFilmTrackingArgs} from '../scripts/film-tracking.mjs';
const quad=[[.1,.2],[.8,.1],[.9,.8],[.2,.9]];
const track=()=>({schema:1,kind:'planar-film-track',source:{width:1000,height:500,duration:2},frames:[{time:0,at:0,quad,confidence:1,state:'tracked'},{time:2,at:1,quad:quad.map(([x,y])=>[x+.1,y-.1]),confidence:.8,state:'tracked'}]});
test('surface homography projects the four actual corners and preserves object-fit crop geometry',()=>{
  const target=[[20,10],[400,30],[360,210],[40,240]],matrix=homographyForQuad(target,500,250);
  for(const [i,[x,y]]of [[0,0],[500,0],[500,250],[0,250]].entries()){
    const z=matrix[6]*x+matrix[7]*y+matrix[8];assert(Math.abs((matrix[0]*x+matrix[1]*y+matrix[2])/z-target[i][0])<1e-7);assert(Math.abs((matrix[3]*x+matrix[4]*y+matrix[5])/z-target[i][1])<1e-7);
  }
  assert.match(filmMatrix3d(matrix),/^matrix3d\(/);
  const full=[[0,0],[1,0],[1,1],[0,1]],size={sourceWidth:1000,sourceHeight:500,width:400,height:400};
  assert.deepEqual(projectFilmQuad(full,size),[[-200,0],[600,0],[600,400],[-200,400]]);
  assert.deepEqual(projectFilmQuad(full,{...size,fit:'contain'}),[[0,100],[400,100],[400,300],[0,300]]);
  assert.deepEqual(projectFilmQuad(full,{...size,position:[0,1]}),[[0,0],[800,0],[800,400],[0,400]]);
  assert.throws(()=>homographyForQuad([[0,0],[1,1],[0,1],[1,0]]));
});
test('tracking samples are reversible and lost confidence intervals never become invented motion',()=>{
  const data=track(),forward=sampleFilmTrack(data,.4);assert.deepEqual(forward,sampleFilmTrack(data,.4));assert(Math.abs(forward.quad[0][0]-.14)<1e-12);
  assert.deepEqual(sampleFilmTrack(data,-2).quad,quad);assert.equal(sampleFilmTrack(data,4).at,1);
  data.frames.splice(1,0,{time:1,at:.5,quad:null,confidence:0,state:'lost'});
  assert.equal(sampleFilmTrack(data,.25).state,'lost');assert.equal(sampleFilmTrack(data,.75).state,'lost');assert.equal(sampleFilmTrack(data,1).state,'tracked');
  const invalid=track();invalid.frames[1].at=0;assert.throws(()=>validateFilmTrack(invalid));assert.throws(()=>sampleFilmTrack(track(),NaN));
});
function element(initial={}){
  const styles=new Map(Object.entries(initial)),attrs=new Map();return {offsetWidth:1000,offsetHeight:500,styles,style:{getPropertyValue:n=>styles.get(n)||'',getPropertyPriority:()=>'',setProperty:(n,v)=>styles.set(n,v),removeProperty:n=>styles.delete(n)},getAttribute:n=>attrs.get(n)??null,setAttribute:(n,v)=>attrs.set(n,v),removeAttribute:n=>attrs.delete(n)};
}
test('presented-time surface updates, resizing, still preference and disposal retain separate ownership',()=>{
  const target=element({color:'coral',transform:'translateX(3px)'}),win=new EventTarget(),preference=new EventTarget();let size={width:1000,height:500},observer;
  preference.matches=false;win.matchMedia=()=>preference;win.ResizeObserver=class{constructor(callback){observer=this;this.callback=callback;}observe(){}disconnect(){this.disconnected=true;}};
  const controller=initFilmSurface(target,{track:track(),container:{getBoundingClientRect:()=>size},window:win,stillAt:0});
  controller.update({mediaProgress:.6,state:'active',motionEnabled:true});assert.equal(controller.getState().at,.6);const first=target.styles.get('transform');
  size={width:390,height:600};observer.callback();assert.notEqual(target.styles.get('transform'),first);assert.equal(controller.getState().at,.6);
  preference.matches=true;preference.dispatchEvent(new Event('change'));assert.equal(controller.getState().at,0);
  controller.update({mediaProgress:.7,state:'active',motionEnabled:true});assert.equal(controller.getState().at,.7);controller.update({mediaProgress:.7,state:'error'});assert.equal(controller.getState().at,0);
  controller.dispose();assert.equal(target.styles.get('transform'),'translateX(3px)');assert.equal(target.styles.get('color'),'coral');assert.equal(target.getAttribute('data-film-surface'),null);assert(observer.disconnected);assert.equal(controller.getState().state,'disposed');
});
test('tracking tool preserves inputs and existing destinations and exposes actual measured loss',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'superbrain-track-test-')),source=path.join(directory,'source.mp4'),destination=path.join(directory,'result');await writeFile(source,'original source');
  const probe=async()=>({stdout:JSON.stringify({streams:[{width:1000,height:500,avg_frame_rate:'24/1',duration:'2'}]})});
  const worker=async()=>({stdout:JSON.stringify({frames:track().frames,algorithm:{name:'fixture'}})});
  try{
    const result=await trackPlanarFilm(source,destination,{run:async(command,...args)=>command==='probe'?probe():worker(...args),ffprobe:'probe',ffmpeg:'encode'});
    assert.equal(result.summary.tracked,2);assert.equal(result.source.sha256.length,64);assert.equal(JSON.parse(await readFile(path.join(destination,'track.json'),'utf8')).frames.length,2);
    await writeFile(path.join(destination,'keep.txt'),'keep');
    await assert.rejects(trackPlanarFilm(source,destination),/already exists/);assert.equal(await readFile(path.join(destination,'keep.txt'),'utf8'),'keep');assert.equal(await readFile(source,'utf8'),'original source');
    await assert.rejects(trackPlanarFilm('https://example.test/film.mp4',path.join(directory,'other')),/local/);
    assert.throws(()=>parseFilmTrackingArgs(['track',source,'new','--fps','12','--fps','10']));assert.throws(()=>parseFilmTrackingArgs(['track',source,'new','--quad','1,2']));
    assert.deepEqual(parseFilmTrackingArgs(['track',source,'new','--quad','0,0,1,0,1,1,0,1','--fps','10']).options,{quad:[[0,0],[1,0],[1,1],[0,1]],sampleFps:10});
  }finally{await rm(directory,{recursive:true,force:true});}
});
