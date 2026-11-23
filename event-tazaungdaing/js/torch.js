/* Pointer torch with layered flame and a fixed, reusable ember pool. */
(() => {
 const app=window.LanternLetter,C=app.config;
 class Torch {
  constructor(scene){this.scene=scene;this.x=this.targetX=scene.width*C.torch.startX;this.y=this.targetY=scene.height*C.torch.startY;this.emission=0;this.cursor=0;this.particles=Array.from({length:C.counts.normal.particles},()=>({x:0,y:0,vx:0,vy:0,life:0,maxLife:1,size:1}));this.glow=app.makeGlow(C.colors.flame[1]);}
  resize(){this.x=this.targetX=Math.min(this.scene.width,Math.max(0,this.targetX));this.y=this.targetY=Math.min(this.scene.height,Math.max(0,this.targetY));for(let i=0;i<this.particles.length;i++)this.particles[i].life=0;}
  // LIFTOFF: remember the release point in viewport fractions so resize is safe.
  drop(){this.dropping=true;this.dropTime=0;this.dropX=this.x/this.scene.width;this.dropY=this.y/this.scene.height;}
  update(dt,reduced){
   this.opacity=1;
   if(this.dropping){
    this.dropTime+=dt;
    const p=Math.min(1,this.dropTime/Math.max(.001,C.flight.torchFade));
    this.opacity=1-p;
    this.x=this.targetX=this.dropX*this.scene.width;
    this.y=this.targetY=(this.dropY+(reduced?0:C.flight.torchDrop*p*p))*this.scene.height;
   }
   const follow=1-Math.exp(-C.torch.followSpeed*dt);this.x+=(this.targetX-this.x)*follow;this.y+=(this.targetY-this.y)*follow;
   const limit=C.counts[C.performance.manualLite?'lite':'normal'].particles;this.emission+=reduced||this.dropping?0:dt*C.torch.emberRate;
   while(this.emission>=1){this.emission--;const p=this.particles[this.cursor];this.cursor=(this.cursor+1)%limit;p.x=this.x;p.y=this.y;p.vx=(Math.random()-.5)*C.torch.emberDrift;p.vy=-C.torch.emberSpeed*(.7+Math.random()*.6);p.life=p.maxLife=C.torch.emberLife*(.5+Math.random()*.5);p.size=.6+Math.random()*1.2;}
   for(let i=0;i<this.particles.length;i++){const p=this.particles[i];if(p.life<=0)continue;p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
  }
  renderGlow(ctx){const r=C.torch.glowSize;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.6*(this.opacity??1);ctx.drawImage(this.glow,this.x-r,this.y-r,r*2,r*2);ctx.restore();}
  render(ctx,time,reduced){
   const size=C.torch.flameSize*Math.min(1,this.scene.height/550),flicker=reduced?0:Math.sin(time*17)*.09+Math.sin(time*29)*.035,bend=reduced?0:Math.sin(time*9)*size*.14;
   const opacity=this.opacity??1;
   ctx.save();ctx.globalAlpha=opacity;ctx.translate(this.x,this.y);ctx.save();ctx.rotate(-.22);ctx.fillStyle=C.torch.wood;ctx.fillRect(-5,size*.35,10,C.torch.stickLength);ctx.fillStyle=C.torch.woodHighlight;ctx.fillRect(-4,size*.4,2,C.torch.stickLength*.95);ctx.fillStyle='#30231d';ctx.fillRect(-8,size*.3,16,20);ctx.strokeStyle='#927458';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<4;i++){ctx.moveTo(-8,size*.3+i*5);ctx.lineTo(8,size*.3+i*5+3);}ctx.stroke();ctx.restore();ctx.globalCompositeOperation='lighter';
   // Orange outer lobe, golden mantle, cream center; time-based flutter is refresh-rate independent.
   for(let i=2;i>=0;i--){const s=size*(.45+i*.27),tip=-s*(1+flicker);ctx.globalAlpha=(i===2?.75:.9)*opacity;ctx.fillStyle=C.colors.flame[i];ctx.beginPath();ctx.moveTo(0,size*.48);ctx.bezierCurveTo(-s*.65,size*.23,-s*.32,-s*.28,bend,tip);ctx.bezierCurveTo(s*.05,-s*.2,s*.65,size*.22,0,size*.48);ctx.fill();}
   ctx.restore();ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=C.colors.flame[1];for(let i=0;i<this.particles.length;i++){const p=this.particles[i];if(p.life<=0)continue;ctx.globalAlpha=Math.max(0,p.life/p.maxLife)*opacity;ctx.fillRect(p.x,p.y,p.size,p.size*1.8);}ctx.restore();
  }
 }
 app.Torch=Torch;
})();

