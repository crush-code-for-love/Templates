/* Five-second heart-shaped fireworks with a real public-domain recording. */
(() => {
 const app=window.LanternLetter,C=app.config;
 class Celebration {
  constructor(scene){
   this.scene=scene;this.elapsed=-1;this.enabled=true;this.next=0;
   this.recording=new Audio(C.audio.fireworks);this.recording.preload='auto';this.recording.volume=C.celebration.volume;
   this.recording.addEventListener('error',()=>{this.audioFailed=true;});
   // Burst times leave every trail and sound finished before the five-second cutoff.
   this.bursts=[{at:.25,x:.18,y:.32,color:'#ffcd86'},{at:1,x:.81,y:.37,color:'#e8b3ce'},{at:1.8,x:.37,y:.28,color:'#ffdba3'},{at:2.6,x:.67,y:.32,color:'#e7c7ff'},{at:3.35,x:.48,y:.40,color:'#ffd8b2'}];
   this.sparks=Array.from({length:C.celebration.particles},(_,i)=>{
    const t=i/C.celebration.particles*Math.PI*2;
    return {x:Math.pow(Math.sin(t),3),y:-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17,speed:1};
   });
  }
  unlock(){
   // Prime this media element during the same user gesture that selects the torch.
   if(this.unlocked||this.elapsed>=0)return;this.unlocked=true;this.recording.muted=true;
   this.recording.play().then(()=>{if(this.elapsed<0){this.recording.pause();this.recording.currentTime=0;}this.recording.muted=!this.enabled;}).catch(()=>{this.unlocked=false;});
  }
  mute(muted){
   this.enabled=!muted;this.recording.muted=muted;
   if(this.elapsed>=0&&!muted){this.recording.currentTime=this.elapsed;this.recording.play().catch(()=>{});}
  }
  quiet(){this.recording.pause();}
  start(){
   this.elapsed=0;this.next=0;this.recording.currentTime=0;this.recording.muted=!this.enabled;
   this.recording.play().catch(()=>{this.audioFailed=true;});
  }
  reset(){this.elapsed=-1;this.next=0;this.quiet();this.recording.currentTime=0;}
  update(dt){
   if(this.elapsed<0)return;this.elapsed+=dt;
   if(this.elapsed>=C.celebration.duration){this.elapsed=-1;this.quiet();return;}
   while(this.next<this.bursts.length&&this.elapsed>=this.bursts[this.next].at){this.next++;}
  }
  render(ctx,lite,reduced){
   if(this.elapsed<0)return;const w=this.scene.width,h=this.scene.height,scale=Math.min(w,h)*.16;
   ctx.save();ctx.globalCompositeOperation='lighter';
   for(const burst of this.bursts){const age=this.elapsed-burst.at;if(age<0||age>1.5)continue;
    const life=age/1.5,spread=reduced?.55:(1-Math.exp(-age*2.5));
    ctx.strokeStyle=burst.color;ctx.lineWidth=reduced?1:1.4;ctx.globalAlpha=(reduced?.28:.72)*Math.sin(Math.PI*Math.min(1,age/.12)/2)*(1-life);
    ctx.beginPath();const count=lite?C.celebration.liteParticles:this.sparks.length;
    for(let i=0;i<count;i++){const spark=this.sparks[Math.floor(i*this.sparks.length/count)],r=scale*spark.speed*spread,x=burst.x*w+spark.x*r,y=burst.y*h+spark.y*r+(reduced?0:age*age*scale*.15);
     ctx.moveTo(x,y);ctx.lineTo(x-spark.x*(reduced?2:6)*(1-life),y-spark.y*(reduced?2:6)*(1-life));}
    ctx.stroke();
   }
   ctx.restore();
  }
 }
 app.Celebration=Celebration;
})();
