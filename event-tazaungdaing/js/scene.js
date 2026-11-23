/* A stationary viewer: the camera rotates about eye height, never translates.
   Environment artwork is cached twice (sharp/soft) and composited by focus. */
(() => {
 const app=window.LanternLetter,C=app.config;
 class Scene {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.pitch=C.camera.startPitch*Math.PI/180;this.resize();}
  resize(){
   this.width=innerWidth;this.height=innerHeight;
   const dpr=Math.min(devicePixelRatio||1,C.scene.maxDpr);
   this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);
   this.focal=Math.min(this.width,this.height)*C.camera.focalLength;
   this.cx=this.width*.5;this.cy=this.height*C.camera.horizon;
   this.sky=this.cache(g=>{
    const gradient=g.createLinearGradient(0,0,0,this.height);
    gradient.addColorStop(0,C.festival.skyTop);gradient.addColorStop(.65,C.festival.skyMiddle);gradient.addColorStop(1,C.festival.skyBottom);
    g.fillStyle=gradient;g.fillRect(0,0,this.width,this.height);
    let seed=C.scene.seed;for(let i=0;i<C.counts.normal.stars;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed/4294967296*this.width;seed=(seed*1664525+1013904223)>>>0;const y=seed/4294967296*this.height*.75;g.fillStyle=C.colors.stars;g.globalAlpha=.08+(i%5)*.025;g.fillRect(x,y,.7,.7);}
   });
   this.highSky=this.cache(g=>{
    const fill=g.createLinearGradient(0,0,0,this.height);for(const stop of C.colors.highSky)fill.addColorStop(stop[0],stop[1]);g.fillStyle=fill;g.fillRect(0,0,this.width,this.height);
    // Stars remain visible between lanterns after the warm horizon fades away.
    let seed=C.scene.seed;const count=C.counts[C.performance.manualLite?'lite':'normal'].stars;
    for(let i=0;i<count;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed/4294967296*this.width;seed=(seed*1664525+1013904223)>>>0;const y=seed/4294967296*this.height;g.fillStyle=C.colors.stars;g.globalAlpha=.15+(i%5)*.04;g.fillRect(x,y,1,1);}
   });
   // Fewer, larger people on narrow screens: heads and torsos keep human proportions.
   this.frontPeople=Math.min(C.festival.people,Math.max(8,Math.round(this.width/42)));
   this.backPeople=this.frontPeople+5;
   this.environment=this.cache(g=>this.paintEnvironment(g,-1));
   this.crowdTop=Math.floor(this.height*.70);
   this.crowdLayers=[];
   for(let group=0;group<2;group++){
    const sharp=this.cache(g=>this.paintEnvironment(g,group),this.crowdTop);
    const soft=this.cache(g=>{g.filter=`blur(${C.focus.environmentBlur}px)`;g.drawImage(sharp,0,this.crowdTop);g.filter='none';},this.crowdTop);
    this.crowdLayers.push({sharp,soft});
   }
   // Eight cached poses per gesture: waving wrists and hands holding a recording phone.
   this.gestures=[];
   for(let kind=0;kind<2;kind++){
    const frames=[];this.gestures.push(frames);
    for(let frame=0;frame<8;frame++){
     const c=document.createElement('canvas');c.width=96;c.height=128;const g=c.getContext('2d');
     const angle=Math.sin(frame/8*Math.PI*2)*(kind?.07:.3),handX=48+Math.sin(angle)*48,handY=28+Math.cos(angle)*3;
     g.strokeStyle=C.festival.crowdNear;g.fillStyle=C.festival.crowdNear;g.lineCap='round';g.lineWidth=11;
     g.beginPath();g.moveTo(30,125);g.lineTo(28,75);g.lineTo(handX,handY);g.stroke();
     if(kind){
      g.beginPath();g.moveTo(72,125);g.lineTo(78,72);g.lineTo(handX+22,handY+8);g.stroke();
      g.fillRect(handX-5,handY-20,30,20);g.fillStyle='#9ba9b9';g.globalAlpha=.55;g.fillRect(handX-2,handY-17,24,14);
      g.fillStyle='#f18b88';g.globalAlpha=.8;g.fillRect(handX+17,handY-15,3,3);g.globalAlpha=1;
     }else{
      g.beginPath();g.ellipse(handX,handY,8,12,angle,0,Math.PI*2);g.fill();g.lineWidth=3;
      for(let finger=0;finger<4;finger++){g.beginPath();g.moveTo(handX-6+finger*4,handY-5);g.lineTo(handX-9+finger*6,handY-21+Math.abs(finger-1)*2);g.stroke();}
     }
     const soft=document.createElement('canvas');soft.width=96;soft.height=128;const sg=soft.getContext('2d');sg.filter='blur(3px)';sg.drawImage(c,0,0);frames.push({sharp:c,soft});
    }
   }
   this.haze=document.createElement('canvas');this.haze.width=256;this.haze.height=64;
   const hg=this.haze.getContext('2d'),mist=hg.createRadialGradient(128,32,0,128,32,128);
   mist.addColorStop(0,C.festival.hazeColor+'55');mist.addColorStop(1,C.festival.hazeColor+'00');hg.fillStyle=mist;hg.fillRect(0,0,256,64);
   this.festivalLights=this.cache(g=>{
    const halo=g.createRadialGradient(this.width*C.festival.templeX,this.height*.77,0,this.width*C.festival.templeX,this.height*.77,this.height*.28);
    halo.addColorStop(0,'#dfa73c24');halo.addColorStop(1,'#dfa73c00');g.fillStyle=halo;g.fillRect(0,0,this.width,this.height);
    for(let i=0;i<36;i++){
     const x=i/35*this.width,y=this.height*(.89+.018*Math.sin(i*.18));
     const light=g.createRadialGradient(x,y,0,x,y,9);light.addColorStop(0,'#ffd894bb');light.addColorStop(.2,'#e9a74055');light.addColorStop(1,'#e9a74000');g.fillStyle=light;g.fillRect(x-9,y-9,18,18);
    }
   });
   this.softEnvironment=this.cache(g=>{g.filter=`blur(${C.focus.environmentBlur}px)`;g.drawImage(this.environment,0,0);g.filter='none';});
   // Full moon texture and halo are baked once per viewport, never per frame.
   this.moon=document.createElement('canvas');this.moon.width=this.moon.height=256;
   const mg=this.moon.getContext('2d'),halo=mg.createRadialGradient(128,128,28,128,128,128);
   halo.addColorStop(0,C.moon.halo+'55');halo.addColorStop(.45,C.moon.halo+'18');halo.addColorStop(1,C.moon.halo+'00');mg.fillStyle=halo;mg.fillRect(0,0,256,256);
   const disk=mg.createRadialGradient(115,115,0,128,128,40);disk.addColorStop(0,C.moon.color);disk.addColorStop(.85,C.moon.color);disk.addColorStop(1,C.moon.edge);
   mg.fillStyle=disk;mg.beginPath();mg.arc(128,128,40,0,Math.PI*2);mg.fill();mg.save();mg.clip();
   let moonSeed=C.scene.seed;
   for(let i=0;i<45;i++){
    moonSeed=(moonSeed*1664525+1013904223)>>>0;const x=92+moonSeed/4294967296*72;
    moonSeed=(moonSeed*1664525+1013904223)>>>0;const y=92+moonSeed/4294967296*72;
    mg.globalAlpha=.035+(i%4)*.012;mg.fillStyle='#8d796c';mg.beginPath();mg.ellipse(x,y,2+i%7,2+i%5,i,0,Math.PI*2);mg.fill();
   }
   mg.restore();
  }
  cache(paint,top=0){const c=document.createElement('canvas');c.width=this.width;c.height=this.height-top;const g=c.getContext('2d');g.translate(0,-top);paint(g);return c;}
  project(item){
   const p=item.screen,dy=item.y-C.camera.eyeHeight,s=Math.sin(this.pitch),c=Math.cos(this.pitch);
   // Inverse camera rotation: elevated objects move toward center when we look up.
   const vertical=dy*c-item.z*s,depth=dy*s+item.z*c;
   p.depth=depth;p.visible=false;if(depth<=C.camera.nearClip)return;
   p.x=this.cx+item.x/depth*this.focal;p.y=this.cy-vertical/depth*this.focal;p.width=item.size/depth*this.focal;
   p.below=Math.max(0,Math.min(C.paper.maxBelow,dy/Math.hypot(dy,item.z)));
   p.alpha=1; // Paper occludes lanterns behind it; distance changes glow, never body opacity.
   p.brightness=Math.max(C.world.farBrightness,1-(depth/C.world.zRange[1])*.65);
   p.rotation=Math.sin(item.phase)*C.world.tilt;
   const pad=p.width*2;
   p.visible=p.x+pad>0&&p.x-pad<this.width&&p.y+pad>0&&p.y-pad<this.height;
  }
  paintEnvironment(g,group=-1){
   const w=this.width,h=this.height,x=w*C.festival.templeX,y=h*.88,scale=Math.min(w*.30,h*.34);
   if(group<0){
    // Distant roofline, low hills and warm windows behind the festival crowd.
    g.fillStyle='#171a29';g.beginPath();g.moveTo(0,h*.89);
    for(let i=0;i<=20;i++)g.lineTo(i*w/20,h*(.80+.025*Math.sin(i*.77)));g.lineTo(w,h);g.lineTo(0,h);g.fill();
    for(let i=0;i<35;i++){
     const bx=i*w/34,bw=w/34+2,bh=h*(.035+.065*(.5+.5*Math.sin(i*8.3)));
     g.fillStyle=i%2?'#101320':'#131625';g.fillRect(bx,h*.89-bh,bw,h*.14+bh);
     if(i%4===0){g.beginPath();g.moveTo(bx-2,h*.89-bh);g.lineTo(bx+bw/2,h*.89-bh-h*.015);g.lineTo(bx+bw+2,h*.89-bh);g.fill();}
     g.fillStyle='#d9a562';g.globalAlpha=.22;
     for(let row=0;row<3;row++)for(let col=0;col<2;col++)if((i+row+col)%3!==0)g.fillRect(bx+bw*(.2+col*.4),h*.89-bh+8+row*9,2,3);
     g.globalAlpha=1;
    }
    // Gold bell-shaped pagoda and hti, adapted from Tazaungdaing 1's left silhouette.
    g.save();g.translate(x,y);g.scale(scale/220,scale/220);
    const gold=g.createLinearGradient(-85,0,85,0);gold.addColorStop(0,C.festival.temple);gold.addColorStop(.32,C.festival.templeGold);gold.addColorStop(.48,C.festival.templeEdge);gold.addColorStop(.69,C.festival.templeGold);gold.addColorStop(1,C.festival.temple);
    g.fillStyle=gold;g.beginPath();g.moveTo(-94,0);g.lineTo(-83,-13);g.lineTo(-67,-18);g.lineTo(-63,-31);
    g.bezierCurveTo(-40,-44,-28,-70,-24,-94);g.bezierCurveTo(-20,-115,-14,-130,-10,-145);g.lineTo(-5,-177);g.lineTo(0,-205);g.lineTo(5,-177);g.lineTo(10,-145);g.bezierCurveTo(14,-130,20,-115,24,-94);g.bezierCurveTo(28,-70,40,-44,63,-31);g.lineTo(67,-18);g.lineTo(83,-13);g.lineTo(94,0);g.closePath();g.fill();
    g.strokeStyle=C.festival.templeEdge;g.lineWidth=1.2;
    for(let i=0;i<7;i++){g.beginPath();g.ellipse(0,-106-i*10,20-i*2,2,0,0,Math.PI*2);g.stroke();}
    for(let i=0;i<4;i++){const width=100-i*10;g.fillStyle=gold;g.fillRect(-width,3+i*8,width*2,6);g.fillStyle=C.festival.templeEdge;g.fillRect(-width,3+i*8,width*2,1);}
    g.beginPath();g.moveTo(0,-205);g.lineTo(0,-224);g.stroke();
    for(let i=0;i<3;i++){g.beginPath();g.ellipse(0,-207-i*5,7-i*2,1.7,0,0,Math.PI*2);g.stroke();}
    g.restore();return;
   }
   // Two rows of shoulders, heads, hair and raised hands make a human eye-level view.
   for(let row=0;row<2;row++){
    const count=row?this.frontPeople:this.backPeople;
    g.fillStyle=row?C.festival.crowdNear:C.festival.crowdFar;
    for(let i=0;i<count;i++){
     if(i%2!==group)continue;
     const px=(i+.3)*w/(count-1),head=Math.min(22,w/count*.28)*(row?1.2:.8);
     // Base the visible torso length on head size, not viewport height.
     const py=h-head*(row?1.5:3.2)+Math.sin(i*2.3)*head*.45;
     g.beginPath();g.ellipse(px,py-head*1.7,head,head*1.25,Math.sin(i)*.15,0,Math.PI*2);g.fill();
     g.beginPath();g.moveTo(px-head*2.2,h+10);g.quadraticCurveTo(px-head*2.4,py,px,py-head*.7);g.quadraticCurveTo(px+head*2.4,py,px+head*2.5,h+10);g.fill();
    }
   }
  }
  renderSky(){
   const g=this.ctx,progress=Math.max(0,Math.min(1,(this.pitch*180/Math.PI-C.camera.startPitch)/(C.camera.endPitch-C.camera.startPitch)));
   g.globalAlpha=1;g.drawImage(this.sky,0,0);g.globalAlpha=progress;g.drawImage(this.highSky,0,0);
   // A fixed sky direction slides into view as the camera tilts; soft reveal on tall screens.
   const end=C.camera.endPitch*Math.PI/180,elevation=end+Math.atan((this.cy-this.height*C.moon.y)/this.focal);
   const depth=Math.cos(elevation-this.pitch),endDepth=Math.cos(elevation-end);
   const x=this.cx+(this.width*C.moon.x-this.cx)*endDepth/depth,y=this.cy-Math.tan(elevation-this.pitch)*this.focal;
   const radius=Math.min(this.width,this.height)*C.moon.radius*endDepth/depth,diameter=radius*6.4;
   g.globalAlpha=progress*progress*(3-2*progress);g.drawImage(this.moon,x-diameter/2,y-diameter/2,diameter,diameter);g.globalAlpha=1;
  }
  renderAtmosphere(time,reduced){
   const g=this.ctx,clock=reduced?0:time;
   g.save();g.globalAlpha=C.festival.hazeOpacity;
   for(let i=0;i<3;i++){
    const x=((clock*C.festival.hazeSpeed+i*this.width*.47)%(this.width*1.8))-this.width*.4;
    g.drawImage(this.haze,x,this.height*(.19+i*.17),this.width*.9,this.height*.12);
   }
   g.restore();
  }
  renderEnvironment(focus,time=0,reduced=false){
   const g=this.ctx,shift=this.focal*Math.tan(this.pitch); // Rotation pushes the horizon down; no camera height motion.
   if(shift>=this.height)return;
   g.save();g.globalAlpha=1-focus;g.drawImage(this.softEnvironment,0,shift);g.globalAlpha=focus;g.drawImage(this.environment,0,shift);
   // Cached light halos breathe gently; crowd groups sway independently, with no live blur.
   g.globalCompositeOperation='lighter';g.globalAlpha=reduced?.6:.6+Math.sin(time*.7)*C.festival.lightPulse;g.drawImage(this.festivalLights,0,shift);g.globalCompositeOperation='source-over';
   for(let i=0;i<this.crowdLayers.length;i++){
    const layer=this.crowdLayers[i],sway=reduced?0:Math.sin(time*C.festival.crowdSpeed+i*2.4)*C.festival.crowdSway;
    g.globalAlpha=1-focus;g.drawImage(layer.soft,sway,this.crowdTop+shift+Math.abs(sway)*.3);
    g.globalAlpha=focus;g.drawImage(layer.sharp,sway,this.crowdTop+shift+Math.abs(sway)*.3);
   }
   // Gestures align to foreground shoulders; only cached sprites animate.
   for(let i=1;i<this.frontPeople;i+=5){
    const head=Math.min(22,this.width/this.frontPeople*.28)*1.2,px=(i+.3)*this.width/(this.frontPeople-1);
    const py=this.height-head*1.5+Math.sin(i*2.3)*head*.45;
    const kind=Math.floor(i/5)%2,frame=reduced?0:Math.floor(time*(kind?2:5)+i)%8;
    const pose=this.gestures[kind][frame],size=head*3.7,sway=reduced?0:Math.sin(time*C.festival.crowdSpeed+(i%2)*2.4)*C.festival.crowdSway;
    g.globalAlpha=1-focus;g.drawImage(pose.soft,px-size*.3+sway,py-head*4.6+shift,size,size*128/96);
    g.globalAlpha=focus;g.drawImage(pose.sharp,px-size*.3+sway,py-head*4.6+shift,size,size*128/96);
   }
   g.restore();
  }
 }
 app.Scene=Scene;
})();
