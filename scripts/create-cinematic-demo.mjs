import {mkdir,mkdtemp,writeFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {root} from '../lib/brief.mjs';

// Original procedural media for the laboratory; no downloaded or generated stock.
// Optional development dependencies: Playwright + a browser, and FFmpeg on PATH
// (or SUPERBRAIN_PLAYWRIGHT, SUPERBRAIN_BROWSER_CHANNEL/EXECUTABLE, FFMPEG).
const out=path.resolve(process.argv[2]||path.join(root,'examples/cinematic-media/assets'));
const ffmpeg=process.env.FFMPEG||'ffmpeg';
const {chromium}=createRequire(import.meta.url)(process.env.SUPERBRAIN_PLAYWRIGHT||'playwright');
const files=['demo-wide.mp4','demo-portrait.mp4','poster-wide.png','poster-portrait.png','provenance.json'];
for(const file of files){try{await access(path.join(out,file));throw new Error('Refusing to overwrite '+file);}catch(e){if(e.code!=='ENOENT')throw e;}}
execFileSync(ffmpeg,['-version'],{stdio:'pipe'});
const scratch=await mkdtemp(path.join(tmpdir(),'superbrain-original-film-'));
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.SUPERBRAIN_BROWSER_EXECUTABLE?{executablePath:process.env.SUPERBRAIN_BROWSER_EXECUTABLE}:process.env.SUPERBRAIN_BROWSER_CHANNEL?{channel:process.env.SUPERBRAIN_BROWSER_CHANNEL}:{})});
  const page=await browser.newPage();
  await page.setContent('<canvas></canvas>');
  await page.evaluate(()=>{
    window.drawOriginal=(width,height,t)=>{
      const canvas=document.querySelector('canvas');canvas.width=width;canvas.height=height;
      const c=canvas.getContext('2d'),portrait=width<height;
      const x=width*(portrait?.5:.71)+Math.sin(t*Math.PI)*width*.025,y=height*(portrait?.35:.48);
      const r=Math.min(width,height)*(.25+.1*t),phase=t*Math.PI*1.3;
      const background=c.createLinearGradient(0,0,width,height);background.addColorStop(0,'#171923');background.addColorStop(.6,'#25232c');background.addColorStop(1,'#4b3530');c.fillStyle=background;c.fillRect(0,0,width,height);
      const glow=c.createRadialGradient(x,y,0,x,y,r*2.5);glow.addColorStop(0,'#ac705a60');glow.addColorStop(1,'#ac705a00');c.fillStyle=glow;c.fillRect(0,0,width,height);
      c.strokeStyle='#e9d4bb0c';c.lineWidth=1;
      for(let i=0;i<12;i++){const gy=height*.72+i*i*height*.003;c.beginPath();c.moveTo(0,gy);c.lineTo(width,gy);c.stroke();}
      const shadow=c.createRadialGradient(x,height*.79,0,x,height*.79,r*1.5);shadow.addColorStop(0,'#090a11aa');shadow.addColorStop(1,'#090a1100');c.save();c.translate(0,height*.79);c.scale(1,.14);c.fillStyle=shadow;c.fillRect(0,-height*2,width,height*4);c.restore();
      c.save();c.translate(x,y);c.rotate(-.22+Math.sin(phase)*.09);
      const sphere=c.createRadialGradient(-r*.4,-r*.45,r*.05,0,0,r);sphere.addColorStop(0,'#e2bba4');sphere.addColorStop(.3,'#bd8367');sphere.addColorStop(.72,'#614941');sphere.addColorStop(1,'#26262c');
      c.fillStyle=sphere;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();
      c.save();c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.clip();
      for(let i=-7;i<=7;i++){
        const rx=Math.cos(i*.16+phase)*r*.65,ry=i*r*.15;
        c.strokeStyle=i%2?'#1b1c2499':'#efc6a477';c.lineWidth=r*.012;c.beginPath();c.ellipse(rx,ry,r*1.2,r*.18,.12,0,Math.PI*2);c.stroke();
      }
      c.restore();
      c.strokeStyle='#f4dfc8bb';c.lineWidth=r*.008;c.beginPath();c.ellipse(0,0,r*1.18,r*.32,-.65+phase*.14,Math.PI,Math.PI*2);c.stroke();
      c.strokeStyle='#aee3d2aa';c.beginPath();c.ellipse(0,0,r*1.35,r*.38,.55-phase*.2,0,Math.PI);c.stroke();
      const lightX=Math.cos(phase)*r*.78,lightY=Math.sin(phase)*r*.24;
      c.shadowColor='#d5ffeb';c.shadowBlur=r*.1;c.fillStyle='#d5ffeb';c.beginPath();c.arc(lightX,lightY,r*.027,0,Math.PI*2);c.fill();c.restore();
      return canvas.toDataURL('image/png').split(',')[1];
    };
  });
  const fps=24,frames=96;
  for(const [variant,width,height] of [['wide',960,600],['portrait',480,800]]){
    const directory=path.join(scratch,variant);await mkdir(directory);
    for(let frame=0;frame<frames;frame++){
      const png=await page.evaluate(({width,height,t})=>window.drawOriginal(width,height,t),{width,height,t:frame/(frames-1)});
      await writeFile(path.join(directory,String(frame).padStart(4,'0')+'.png'),Buffer.from(png,'base64'));
    }
    execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-n','-framerate',String(fps),'-i',path.join(directory,'%04d.png'),'-an','-c:v','libx264','-preset','fast','-crf','24','-g','1','-pix_fmt','yuv420p','-movflags','+faststart',path.join(scratch,'demo-'+variant+'.mp4')],{stdio:'pipe'});
    const poster=await page.evaluate(({width,height})=>window.drawOriginal(width,height,0),{width,height});
    await writeFile(path.join(scratch,'poster-'+variant+'.png'),Buffer.from(poster,'base64'));
  }
  await writeFile(path.join(scratch,'provenance.json'),JSON.stringify({schema:1,origin:'Original SuperBrain procedural canvas study',generator:'scripts/create-cinematic-demo.mjs',subject:'Abstract orbital light sculpture; fictional demonstration',sources:[],fps,frames,duration:frames/fps,variants:['wide','portrait'],license:'Repository-authored demonstration assets; no 10k-websites media or code included'},null,2)+'\n');
  await mkdir(out,{recursive:true});
  const {readFile}=await import('node:fs/promises');
  for(const file of files)await writeFile(path.join(out,file),await readFile(path.join(scratch,file)),{flag:'wx'});
  console.log('Created original four-second wide and portrait films in '+out);
}finally{
  await browser?.close();
  if(path.dirname(scratch)!==path.resolve(tmpdir())||!path.basename(scratch).startsWith('superbrain-original-film-'))throw new Error('Unexpected scratch directory');
  await rm(scratch,{recursive:true,force:true});
}
