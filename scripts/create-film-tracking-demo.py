"""Reproducible original planar-film fixture with known corner geometry. Requires local OpenCV and FFmpeg."""
import os, sys, json, math, tempfile, subprocess
from pathlib import Path
import cv2
import numpy as np


def create(output):
    target=Path(output).resolve()
    if target.exists():
        raise ValueError('Demo output already exists; choose a new folder')
    target.parent.mkdir(parents=True,exist_ok=True)
    width,height,fps,count=960,600,24,72
    rng=np.random.default_rng(717)
    panel=np.full((280,520,3),(208,220,224),dtype=np.uint8)
    for i in range(420):
        x,y=int(rng.integers(8,510)),int(rng.integers(8,270))
        if 95<x<425 and 70<y<215:
            continue
        color=tuple(int(v) for v in rng.integers(75,165,size=3))
        if i%3:
            cv2.rectangle(panel,(x,y),(x+int(rng.integers(2,7)),y+int(rng.integers(2,7))),color,-1)
        else:
            cv2.line(panel,(x,y),(x+int(rng.integers(-9,9)),y+int(rng.integers(-9,9))),color,2)
    cv2.rectangle(panel,(3,3),(516,276),(160,175,179),1)
    cv2.putText(panel,'MATERIAL / 07',(22,36),cv2.FONT_HERSHEY_SIMPLEX,.5,(67,81,83),1,cv2.LINE_AA)
    cv2.putText(panel,'SUPERBRAIN',(350,255),cv2.FONT_HERSHEY_SIMPLEX,.42,(67,81,83),1,cv2.LINE_AA)
    source=np.float32([[0,0],[520,0],[520,280],[0,280]])
    reference=np.float32([[.19,.24],[.81,.19],[.86,.78],[.14,.82]])
    expected=[]
    with tempfile.TemporaryDirectory(prefix='superbrain-track-original-') as temporary:
        staging=Path(temporary)
        for variant in ['surface','surface-cut']:
            folder=staging/variant;folder.mkdir()
            for index in range(count):
                t=index/(count-1)
                shift=np.float32([.045*math.sin(t*math.pi*1.5),-.03*math.sin(t*math.pi)])
                motion=np.float32([[.02*t,-.015*t],[-.025*t,.025*t],[.015*t,.025*t],[-.015*t,-.02*t]])
                quad=reference+shift+motion
                if variant=='surface':
                    expected.append({'time':index/fps,'at':index/count,'quad':quad.tolist()})
                image=np.full((height,width,3),(37,32,29),dtype=np.uint8)
                yy,xx=np.indices((height,width))
                vignette=np.clip(1.-((xx-width*.5)**2/(width**2)+(yy-height*.5)**2/(height**2))*.6,.3,1.)
                image=np.uint8(image*vignette[:,:,None])
                if not (variant=='surface-cut' and 42<=index<54):
                    matrix=cv2.getPerspectiveTransform(source,quad*np.float32([width,height]))
                    warped=cv2.warpPerspective(panel,matrix,(width,height))
                    mask=cv2.warpPerspective(np.full(panel.shape[:2],255,dtype=np.uint8),matrix,(width,height))
                    image[mask>0]=warped[mask>0]
                cv2.imwrite(str(folder/(str(index).zfill(4)+'.png')),image)
            subprocess.run([os.environ.get('FFMPEG','ffmpeg'),'-hide_banner','-loglevel','error','-nostdin','-n','-framerate',str(fps),'-i',str(folder/'%04d.png'),'-an','-c:v','libx264','-preset','fast','-crf','18','-g','1','-pix_fmt','yuv420p','-movflags','+faststart',str(staging/(variant+'.mp4'))],check=True,creationflags=0x08000000 if os.name=='nt' else 0)
        target.mkdir()
        for variant in ['surface','surface-cut']:
            (target/(variant+'.mp4')).write_bytes((staging/(variant+'.mp4')).read_bytes())
        (target/'poster.png').write_bytes((staging/'surface'/'0000.png').read_bytes())
        (target/'expected.json').write_text(json.dumps({'schema':1,'source':{'width':width,'height':height,'fps':fps,'duration':count/fps},'quad':reference.tolist(),'frames':expected,'provenance':'Original deterministic procedural plane, seed717. No external assets.'},indent=2)+'\n',encoding='utf-8')
    print(str(target))


if __name__=='__main__':
    if len(sys.argv)!=2:
        sys.exit('Usage: python scripts/create-film-tracking-demo.py <new-output-folder>')
    create(sys.argv[1])
