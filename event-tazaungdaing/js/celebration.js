/* Five-second cached-spark celebration. Web Audio synthesizes distant booms;
   no downloads, audio assets, libraries, or per-frame particle allocations. */
(() => {
 const app=window.LanternLetter,C=app.config;
 class Celebration {
  constructor(scene){
   this.scene=scene;this.elapsed=-1;this.enabled=true;this.next=0;
   // Burst times leave every trail and sound finished before the five-second cutoff.
   this.bursts=[{at:.25,x:.18,y:.32,color:'#ffcd86'},{at:1,x:.81,y:.37,color:'#e8b3ce'},{at:1.8,x:.37,y:.28,color:'#ffdba3'},{at:2.6,x:.67,y:.32,color:'#e7c7ff'},{at:3.35,x:.48,y:.40,color:'#ffd8b2'}];
   this.sparks=Array.from({length:C.celebration.particles},(_,i)=>({x:Math.cos(i*2.39996),y:Math.sin(i*2.39996),speed:.5+(i%11)/20}));
  }
  unlock(){
   try{
    if(!this.audio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
     this.audio=new AC();this.master=this.audio.createGain();this.master.gain.value=this.enabled?C.celebration.volume:0;this.master.connect(this.audio.destination);
     this.noise=this.audio.createBuffer(1,this.audio.sampleRate*1.2,this.audio.sampleRate);const data=this.noise.getChannelData(0);
     for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    }
    if(this.audio.state==='suspended')this.audio.resume().catch(()=>{});
   }catch(error){/* Unsupported or blocked audio leaves the visual sequence intact. */}
  }
  mute(muted){this.enabled=!muted;if(this.master)this.master.gain.value=muted?0:C.celebration.volume;}
  quiet(){if(this.master)this.master.gain.value=0;}
  start(){this.elapsed=0;this.next=0;if(this.master)this.master.gain.value=this.enabled?C.celebration.volume:0;}
  reset(){this.elapsed=-1;this.next=0;this.quiet();}
  boom(){
   if(!this.enabled||!this.audio||this.audio.state!=='running')return;
   const a=this.audio,t=a.currentTime,source=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();
   source.buffer=this.noise;filter.type='lowpass';filter.frequency.setValueAtTime(1400,t);filter.frequency.exponentialRampToValueAtTime(100,t+1);
   gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(.7,t+.025);gain.gain.exponentialRampToValueAtTime(.001,t+1.15);
   source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start(t);source.stop(t+1.2);
   source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
  update(dt){
   if(this.elapsed<0)return;this.elapsed+=dt;
   if(this.elapsed>=C.celebration.duration){this.elapsed=-1;this.quiet();return;}
   while(this.next<this.bursts.length&&this.elapsed>=this.bursts[this.next].at){this.boom();this.next++;}
  }
  render(ctx,lite,reduced){
   if(this.elapsed<0)return;const w=this.scene.width,h=this.scene.height,scale=Math.min(w,h)*.16;
   ctx.save();ctx.globalCompositeOperation='lighter';
   for(const burst of this.bursts){const age=this.elapsed-burst.at;if(age<0||age>1.5)continue;
    const life=age/1.5,spread=reduced?.55:(1-Math.exp(-age*2.5));
    ctx.strokeStyle=burst.color;ctx.lineWidth=reduced?1:1.4;ctx.globalAlpha=(reduced?.28:.72)*Math.sin(Math.PI*Math.min(1,age/.12)/2)*(1-life);
    ctx.beginPath();const count=lite?C.celebration.liteParticles:this.sparks.length;
    for(let i=0;i<count;i++){const spark=this.sparks[i],r=scale*spark.speed*spread,x=burst.x*w+spark.x*r,y=burst.y*h+spark.y*r+(reduced?0:age*age*scale*.15);
     ctx.moveTo(x,y);ctx.lineTo(x-spark.x*(reduced?2:6)*(1-life),y-spark.y*(reduced?2:6)*(1-life));}
    ctx.stroke();
   }
   ctx.restore();
  }
 }
 app.Celebration=Celebration;
})();
