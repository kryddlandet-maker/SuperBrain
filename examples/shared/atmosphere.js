// Original procedural light field. No textures, dependencies or continual autoplay.
export const vertexSource=`attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
export const fragmentSource=`precision mediump float;
varying vec2 uv; uniform vec2 pointer; uniform float time; uniform float aspect;
void main(){
 vec2 p=uv; p.x*=aspect; vec2 m=pointer; m.x*=aspect;
 float warp=sin(p.y*7.+time*.55)*.065+sin(p.y*15.-time*.3)*.015;
 float curve=aspect*.65+warp+pow(abs(p.y-.5),3.)*.55;
 float ray=exp(-abs(p.x-curve)*55.);
 float haze=exp(-abs(p.x-curve)*5.)*.6;
 float halo=exp(-distance(p,m)*4.5);
 float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)*.018;
 vec3 color=vec3(.025,.045,.065)+haze*vec3(.035,.14,.19)+ray*vec3(.48,.88,.73)+halo*vec3(.12,.14,.07)+grain;
 gl_FragColor=vec4(color,1.);
}`;
export function canvasSize(width,height,dpr=1){const scale=Math.min(Math.max(dpr,1),1.5,Math.sqrt(900000/Math.max(1,width*height)));return [Math.max(1,Math.round(width*scale)),Math.max(1,Math.round(height*scale))];}
export function initAtmosphere(canvas,button,root=document,options={}){
 if(!canvas)return()=>{};let gl;try{gl=canvas.getContext('webgl',{alpha:false,antialias:false});}catch{if(button)button.hidden=true;return()=>{};}if(!gl){if(button)button.hidden=true;return()=>{};}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const motionReduced=()=>Boolean(options.reducedMotion)||(reduced.matches&&!options.motionPreview);
 const cleanups=[],shaders=[];let program,buffer,frame=0,disposed=false,lost=false,visible=true,until=0,clock=0,previous=0;const pointer=[.68,.52];
 const listen=(el,name,fn,options)=>{el.addEventListener(name,fn,options);cleanups.push(()=>el.removeEventListener(name,fn,options));};
 const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;until=0;previous=0;if(button){button.setAttribute('aria-pressed','false');button.textContent='Spela ljusstudien';}};
 const release=()=>{if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));};
 try{
  const compile=(type,source)=>{const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader compile');return s;};
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexSource));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 }catch{release();if(button)button.hidden=true;return()=>{};}
 const uPointer=gl.getUniformLocation(program,'pointer'),uTime=gl.getUniformLocation(program,'time'),uAspect=gl.getUniformLocation(program,'aspect');
 const draw=(stamp=0)=>{frame=0;if(disposed||lost||document.hidden||!visible)return;const rect=canvas.getBoundingClientRect();const [w,h]=canvasSize(rect.width,rect.height,window.devicePixelRatio||1);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.useProgram(program);gl.uniform2f(uPointer,...pointer);if(until&&previous)clock+=Math.min(stamp-previous,64)/1000;previous=stamp;gl.uniform1f(uTime,clock);gl.uniform1f(uAspect,w/h);gl.drawArrays(gl.TRIANGLES,0,6);canvas.setAttribute('data-renderer','webgl');if(until>stamp&&!motionReduced())frame=requestAnimationFrame(draw);else if(until)stop();};
 const schedule=()=>{if(!disposed&&!lost&&!frame&&!document.hidden&&visible)frame=requestAnimationFrame(draw);};
 const surface=canvas.parentElement;
 listen(surface,'pointermove',e=>{if(motionReduced()||!fine.matches||e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();pointer[0]=Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width)));pointer[1]=1-Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)));schedule();});
 if(button){button.hidden=!!motionReduced();listen(button,'click',()=>{if(until){stop();return;}if(motionReduced())return;until=performance.now()+4000;button.textContent='Pausa ljusstudien';button.setAttribute('aria-pressed','true');schedule();});}
 listen(window,'resize',schedule);listen(reduced,'change',()=>{stop();if(button)button.hidden=!!motionReduced();schedule();});listen(root,'visibilitychange',()=>{if(document.hidden)stop();else schedule();});
 listen(canvas,'webglcontextlost',e=>{e.preventDefault();lost=true;stop();canvas.removeAttribute('data-renderer');});
 // A restored context starts with empty GPU state: leave the CSS fallback until remount.
 listen(canvas,'webglcontextrestored',()=>{canvas.removeAttribute('data-renderer');if(button)button.hidden=true;});
 let observer;if(typeof IntersectionObserver==='function'){observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(!visible)stop();else schedule();});observer.observe(canvas);cleanups.push(()=>observer.disconnect());}
 schedule();return()=>{if(disposed)return;disposed=true;stop();cleanups.reverse().forEach(fn=>fn());release();canvas.removeAttribute('data-renderer');};
}
