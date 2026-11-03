/** Original SuperBrain planar-film projection. Coordinates always refer to the tracked source film. */
const clamp=value=>Math.max(0,Math.min(1,value));
const finitePoint=point=>Array.isArray(point)&&point.length===2&&point.every(Number.isFinite);
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
export function validFilmQuad(quad){
  if(!Array.isArray(quad)||quad.length!==4||!quad.every(finitePoint))return false;
  const turns=quad.map((point,i)=>cross(point,quad[(i+1)%4],quad[(i+2)%4]));
  return turns.every(n=>n>1e-8)||turns.every(n=>n< -1e-8);
}
export function validateFilmTrack(track){
  if(!track||track.schema!==1||track.kind!=='planar-film-track'||!track.source||![track.source.width,track.source.height,track.source.duration].every(n=>Number.isFinite(n)&&n>0)||!Array.isArray(track.frames)||track.frames.length<2)throw new Error('Invalid planar film track');
  for(const [i,frame]of track.frames.entries()){
    if(!frame||!Number.isFinite(frame.time)||frame.time<0||frame.time>track.source.duration+.1||!Number.isFinite(frame.at)||frame.at<0||frame.at>1||i>0&&(frame.time<=track.frames[i-1].time||frame.at<=track.frames[i-1].at)||!Number.isFinite(frame.confidence)||frame.confidence<0||frame.confidence>1||!['tracked','lost'].includes(frame.state)||frame.state==='tracked'&&(!validFilmQuad(frame.quad)||frame.quad.flat().some(n=>Math.abs(n)>10))||frame.state==='lost'&&frame.quad!==null)throw new Error('Invalid planar track frame');
  }
  return track;
}
/** Lost intervals are never bridged with invented geometry. */
export function sampleFilmTrack(track,progress,{minConfidence=.35}={}){
  validateFilmTrack(track);if(!Number.isFinite(progress)||!Number.isFinite(minConfidence)||minConfidence<0||minConfidence>1)throw new Error('Invalid tracking sample');
  return sampleValidatedTrack(track,progress,minConfidence);
}
function sampleValidatedTrack(track,progress,minConfidence){
  const at=clamp(progress),frames=track.frames;
  let low=0,high=frames.length-1;
  while(low+1<high){const mid=(low+high)>>1;if(frames[mid].at<=at)low=mid;else high=mid;}
  const before=at<=frames[0].at?frames[0]:at>=frames.at(-1).at?frames.at(-1):frames[low];
  const after=at<=before.at?before:at>=frames.at(-1).at?before:frames[high];
  if(before.state!=='tracked'||before.confidence<minConfidence||after.state!=='tracked'||after.confidence<minConfidence)return {at,state:'lost',confidence:0,quad:null};
  const fraction=before===after?0:clamp((at-before.at)/(after.at-before.at));
  const quad=before.quad.map((p,i)=>p.map((n,j)=>n+(after.quad[i][j]-n)*fraction));
  if(!validFilmQuad(quad))return {at,state:'lost',confidence:0,quad:null};
  return {at,state:'tracked',confidence:Math.min(before.confidence,after.confidence),quad};
}
/** Solve a projective mapping from a local rectangle to TL/TR/BR/BL target corners. */
export function homographyForQuad(quad,width=1,height=1){
  if(!validFilmQuad(quad)||![width,height].every(n=>Number.isFinite(n)&&n>0))throw new Error('Homography requires a convex quad and positive dimensions');
  const source=[[0,0],[width,0],[width,height],[0,height]],rows=[];
  for(let i=0;i<4;i++){const [x,y]=source[i],[u,v]=quad[i];rows.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);}
  for(let column=0;column<8;column++){
    let pivot=column;for(let row=column+1;row<8;row++)if(Math.abs(rows[row][column])>Math.abs(rows[pivot][column]))pivot=row;
    if(Math.abs(rows[pivot][column])<1e-12)throw new Error('Degenerate film surface');
    [rows[column],rows[pivot]]=[rows[pivot],rows[column]];const divisor=rows[column][column];
    for(let n=column;n<=8;n++)rows[column][n]/=divisor;
    for(let row=0;row<8;row++)if(row!==column){const scale=rows[row][column];for(let n=column;n<=8;n++)rows[row][n]-=scale*rows[column][n];}
  }
  return [...rows.map(row=>row[8]),1];
}
export function filmMatrix3d(matrix){
  if(!Array.isArray(matrix)||matrix.length!==9||!matrix.every(Number.isFinite))throw new Error('Invalid film homography');
  const [a,b,c,d,e,f,g,h,i]=matrix;
  return 'matrix3d('+[a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,i].join(',')+')';
}
/** Match CSS object-fit/object-position without measuring an already transformed text box. */
export function projectFilmQuad(quad,{sourceWidth,sourceHeight,width,height,fit='cover',position=[.5,.5]}={}){
  if(!validFilmQuad(quad)||![sourceWidth,sourceHeight,width,height].every(n=>Number.isFinite(n)&&n>0)||!['cover','contain','fill'].includes(fit)||!finitePoint(position)||position.some(n=>n<0||n>1))throw new Error('Invalid film projection geometry');
  const sx=width/sourceWidth,sy=height/sourceHeight,scale=fit==='cover'?Math.max(sx,sy):Math.min(sx,sy);
  const renderedWidth=fit==='fill'?width:sourceWidth*scale,renderedHeight=fit==='fill'?height:sourceHeight*scale;
  return quad.map(([x,y])=>[x*renderedWidth+(width-renderedWidth)*position[0],y*renderedHeight+(height-renderedHeight)*position[1]]);
}
/** Feed presented-media snapshots from initCinematicScene.onFrame. This owns no media clock. */
export function initFilmSurface(element,{track,container=element?.parentElement,window:win=window,minConfidence=.35,stillAt=0,fit='cover',position=[.5,.5],layerWidth=null,layerHeight=null}={}){
  validateFilmTrack(track);
  if(!element?.style||!container?.getBoundingClientRect||![minConfidence,stillAt].every(n=>Number.isFinite(n)&&n>=0&&n<=1))throw new Error('A film surface needs a dedicated layer and container');
  const properties=['transform','transform-origin','position','left','top','visibility'];
  const before=properties.map(name=>[name,element.style.getPropertyValue(name),element.style.getPropertyPriority(name)]),attribute=element.getAttribute('data-film-surface');
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');let disposed=false,last={mediaProgress:stillAt,state:'static',motionEnabled:false},result={state:'static',at:stillAt,confidence:0};
  function paint(){
    if(disposed)return;
    const at=last.state==='static'||last.state==='error'||reduced.matches&&last.motionEnabled!==true?stillAt:last.mediaProgress;
    const sample=sampleValidatedTrack(track,at,minConfidence);result={...sample};
    const rect=container.getBoundingClientRect(),width=layerWidth??element.offsetWidth,height=layerHeight??element.offsetHeight;
    if(sample.state==='lost'||rect.width<=0||rect.height<=0||!width||!height){element.style.setProperty('visibility','hidden');element.setAttribute('data-film-surface','lost');return;}
    try{
      const quad=projectFilmQuad(sample.quad,{sourceWidth:track.source.width,sourceHeight:track.source.height,width:rect.width,height:rect.height,fit,position});
      const matrix=homographyForQuad(quad,width,height);
      element.style.setProperty('position','absolute');element.style.setProperty('left','0px');element.style.setProperty('top','0px');element.style.setProperty('transform-origin','0 0');element.style.setProperty('transform',filmMatrix3d(matrix));element.style.setProperty('visibility','visible');element.setAttribute('data-film-surface',last.state==='static'?'static':'tracked');
      result={...sample,projectedQuad:quad,matrix};
    }catch{element.style.setProperty('visibility','hidden');element.setAttribute('data-film-surface','lost');result={state:'lost',at,confidence:0};}
  }
  const preference=()=>{if(reduced.matches)last={...last,motionEnabled:false};paint();};
  const observer=win.ResizeObserver?new win.ResizeObserver(paint):null;observer?.observe(container);win.addEventListener('resize',paint);reduced.addEventListener('change',preference);paint();
  return {update(snapshot){if(disposed)return;if(!snapshot||!Number.isFinite(snapshot.mediaProgress))throw new Error('Film surface requires presented media progress');last={...snapshot};paint();},refresh:paint,getState:()=>disposed?{state:'disposed'}:{...result},dispose(){if(disposed)return;disposed=true;observer?.disconnect();win.removeEventListener('resize',paint);reduced.removeEventListener('change',preference);for(const [name,value,priority]of before){if(value)element.style.setProperty(name,value,priority);else element.style.removeProperty(name);}if(attribute===null)element.removeAttribute('data-film-surface');else element.setAttribute('data-film-surface',attribute);}};
}
