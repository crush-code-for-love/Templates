/* Bounded shared world: outgoing slots are reused below the horizon. */
(() => {
 const app=window.LanternLetter,C=app.config;
 class Crowd {
  constructor(scene){this.scene=scene;this.items=[];this.sorted=[];this.time=0;this.flightTime=0;this.released=false;this.heroMingled=false;this.letterPassed=false;this.recycled=0;this.create();}
  create(){
   let seed=C.scene.seed;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   const make=(id,x,y,z,size,role)=>({id,x,y,z,baseX:x,baseY:y,baseZ:z,size,role,color:id%C.world.palette.length,variant:id%C.paper.variants,heat:1,phase:random()*Math.PI*2,riseSpeed:C.world.riseSpeed[0]+random()*(C.world.riseSpeed[1]-C.world.riseSpeed[0]),driftZ:C.world.driftZ[0]+random()*(C.world.driftZ[1]-C.world.driftZ[0]),age:0,cycles:0,noteDetached:false,noteScreen:{x:0,y:0,width:0,depth:1},screen:{x:0,y:0,width:0,depth:0,below:0,alpha:0,rotation:0,visible:false}});
   this.hero=make(0,0,C.camera.eyeHeight-.12,C.world.heroZ,C.world.heroSize,'hero');this.hero.heat=0;this.hero.riseSpeed=C.world.releaseRise;this.hero.driftZ=C.world.releaseDrift;
   const o=C.letterLantern.offset;this.letter=make(1,o[0],this.hero.y+o[1],o[2],C.world.heroSize,'letter');this.letter.riseSpeed=C.letterLantern.riseSpeed;this.letter.driftZ=0;
   this.items.push(this.hero,this.letter);
   const aspect=this.scene.width/this.scene.focal;
   for(let i=2;i<C.world.count.normal;i++){
    let z,x,y,size;
    // No near-camera releases: only the held lantern occupies the foreground.
    z=C.world.zRange[0]+random()*(C.world.zRange[1]-C.world.zRange[0]);size=C.world.sizeRange[0]+random()*(C.world.sizeRange[1]-C.world.sizeRange[0]);const overhead=i%3===0,slope=overhead?.3+random()*C.world.overheadSpread:random()*this.scene.height/this.scene.focal*.67;y=C.camera.eyeHeight+slope*z;x=(random()-.5)*aspect*z*(overhead?Math.sqrt(1+slope*slope):1)*1.05;
    const item=make(i,x,y,z,size,'festival');item.driftZ=C.world.distantDrift;this.items.push(item);
   }
   for(const item of this.items)this.sorted.push(item);
  }
  startFormations(){
   // One additional, bounded group leaves every existing festival lantern untouched.
   if(this.formationGroups)return;
   // Every mark is a lantern rendered and depth-sorted by the shared renderer.
   const points=[],portrait=this.scene.width<this.scene.height;
   // Keep all 48 outline points in lite mode: missing strokes make small letters illegible.
   const layout=C.formation,width=this.scene.width*(portrait?layout.mobileWidth:layout.width);
   const height=Math.min(this.scene.height*layout.height,this.scene.width*(portrait?layout.mobileHeight:.28));
   const add=(x,y)=>points.push({x,y});
   const bar=3,stem=6;
   for(let j=0;j<bar;j++){const x=-.72-.18+j*.36/(bar-1);add(x,.5);add(x,-.5);}
   for(let j=0;j<stem;j++)add(-.72,.5-(j+1)/(stem+1));
   const hearts=20;
   // Sample the outline by distance, not angle: no stacked lanterns at either cusp.
   // Normalize the final outline to the same top/bottom as I and U.
   const outline=[],samples=400;let low=Infinity,high=-Infinity;
   for(let j=0;j<=samples;j++){
    const t=j/samples*Math.PI*2,x=.32*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
    outline.push({x,y,d:0});low=Math.min(low,y);high=Math.max(high,y);
   }
   const sx=width*.5,sy=height;
   let length=0;
   for(let j=0;j<outline.length;j++){
    const point=outline[j];point.y=(point.y-low)/(high-low)-.5;
    if(j){const prev=outline[j-1];length+=Math.hypot((point.x-prev.x)*sx,(point.y-prev.y)*sy);}point.d=length;
   }
   const heartPoints=[];let segment=1;
   for(let j=0;j<hearts;j++){
    const target=j/hearts*length;while(segment<samples&&outline[segment].d<target)segment++;
    const a=outline[segment-1],b=outline[segment],mix=(target-a.d)/Math.max(.00001,b.d-a.d);
    heartPoints.push({x:a.x+(b.x-a.x)*mix,y:a.y+(b.y-a.y)*mix});
   }
   const bottom=Math.min(...heartPoints.map(p=>p.y)),top=Math.max(...heartPoints.map(p=>p.y));
   for(const point of heartPoints)add(point.x,(point.y-bottom)/(top-bottom)-.5);
   const sides=5,curve=6;
   for(let j=0;j<sides;j++){const y=.5-j*.65/sides;add(.52,y);add(.92,y);}
   for(let j=0;j<curve;j++){const t=j/(curve-1)*Math.PI;add(.72-.20*Math.cos(t),-.15-.35*Math.sin(t));}
   const group={items:[],points,speed:(C.world.riseSpeed[0]+C.world.riseSpeed[1])/2,finished:false};
   this.formationGroups=[group];
   const scene=this.scene,depth=C.formation.depth,pitch=scene.pitch;
   const center=scene.height+height*.5+20;
   for(let j=0;j<points.length;j++){
    const point=points[j],vertical=(scene.cy-center+point.y*height)/scene.focal*depth;
    const item={...this.items[2],id:this.items.length,role:'formation',heat:1,noteDetached:true,age:0,cycles:0,
     screen:{...this.items[2].screen},noteScreen:{...this.items[2].noteScreen}};
    item.x=point.x*width*.5/scene.focal*depth;item.baseX=item.x;
    item.y=C.camera.eyeHeight+vertical*Math.cos(pitch)+depth*Math.sin(pitch);
    item.z=depth*Math.cos(pitch)-vertical*Math.sin(pitch);
    // Mobile hearts stay readable, with space between adjacent points in each stroke.
    item.size=Math.min(scene.width*(portrait?layout.mobileLanternWidth:.012),scene.height*.025)*depth/scene.focal;
    item.riseSpeed=group.speed;item.phase=0;
    group.items.push(item);this.items.push(item);this.sorted.push(item);scene.project(item);
   }
  }
  updateFormations(dt,reduced){
   if(!this.formationGroups)return;
   const group=this.formationGroups[0];if(group.finished)return;
   let gone=true;
   for(const item of group.items){
    // Same world-space rise and depth drift as the ordinary lanterns, with shared sway.
    if(!reduced){item.age+=dt;item.y+=item.riseSpeed*dt;item.z+=C.world.distantDrift*dt;item.x=item.baseX+Math.sin(item.age*C.world.swaySpeed)*C.world.swayAmount;}
    this.scene.project(item);
    if(item.screen.depth>C.camera.nearClip&&item.screen.y+item.screen.width*2>=0&&item.z<C.world.zRange[1]*1.5)gone=false;
   }
   // A one-time farewell: retire the extra group without replacing or restarting it.
   if(gone){group.finished=true;for(const item of group.items){item.role='retired';item.screen.visible=false;}}
  }
  release(){
   this.released=true;this.flightTime=0;this.hero.heat=1;
   // Start above and behind the viewer, moving forward without an approach/stop tween.
   const scene=this.scene,end=C.camera.endPitch*Math.PI/180,k=(scene.cy-scene.height*C.letterLantern.passScreenY)/scene.focal;
   const z=C.letterLantern.offset[2]+C.letterLantern.forwardSpeed*C.letterLantern.passDuration;
   this.letter.baseY=C.camera.eyeHeight+z*(k*Math.cos(end)+Math.sin(end))/(Math.cos(end)-k*Math.sin(end))-C.letterLantern.riseSpeed*C.letterLantern.passDuration;
  }
  recycle(item){
   // Reuse objects and sprites; replacements rise from below the horizon.
   item.cycles++;this.recycled++;const unit=Math.abs((Math.sin(item.id*17.13+item.cycles*93.7)*43758.5453)%1);
   item.role='festival';item.z=C.world.zRange[0]+unit*(C.world.zRange[1]-C.world.zRange[0]);
   item.baseX=(unit-.5)*this.scene.width/this.scene.focal*item.z*.95;item.x=item.baseX;
   const k=(this.scene.cy-this.scene.height-40)/this.scene.focal,sin=Math.sin(this.scene.pitch),cos=Math.cos(this.scene.pitch);
   item.y=C.camera.eyeHeight+item.z*(k*cos+sin)/(cos-k*sin);item.seen=false;item.age=0;item.heat=1;item.driftZ=C.world.distantDrift;
  }
  update(dt,reduced){
   this.time+=dt;if(this.released)this.flightTime+=dt;
   this.updateFormations(dt,reduced);
   for(const item of this.items){
    if(item.role==='formation'||item.role==='retired')continue;
    if(item.role==='hero'&&!this.released)continue;
    if(item.role==='letter'){
     const t=this.released?Math.max(0,this.flightTime-C.letterLantern.followDelay):0;
     item.z=C.letterLantern.offset[2]+t*C.letterLantern.forwardSpeed;
     item.y=item.baseY+t*C.letterLantern.riseSpeed;item.x=item.baseX+(reduced?0:Math.sin(t*.65)*C.world.swayAmount);
     if(t>=C.letterLantern.passDuration)this.letterPassed=true;
    }else if(!(reduced&&item.role==='festival')){
     item.age+=dt;item.y+=item.riseSpeed*dt;
     item.z+=dt*(item.role==='hero'?C.world.releaseDrift:C.world.distantDrift);
     item.x=item.baseX+(reduced?0:Math.sin(item.age*C.world.swaySpeed+item.phase)*C.world.swayAmount);
    }
    this.scene.project(item);if(item.screen.visible)item.seen=true;
    // Replace an outgoing visible lantern below the current view; camera turns never pop a new lantern into view.
    const angle=Math.atan2(item.y-C.camera.eyeHeight,item.z);
    const top=C.explore.maxPitch*Math.PI/180+Math.atan((this.scene.cy+30)/this.scene.focal);
    if((item.role!=='letter'||item.noteDetached)&&(item.seen&&item.screen.y+item.screen.width*2<0||angle>Math.min(1.53,top)||item.z>C.world.zRange[1]*1.5))this.recycle(item);
   }
  }
  project(){
   for(const item of this.items)if(item.role!=='retired')this.scene.project(item);
   const p=this.hero.screen;
   // The released heart joins the distant population by perspective, without fading.
   if(this.released&&this.flightTime>=C.camera.lookUpDuration&&p.width<=this.scene.focal*this.hero.size/C.world.heroZ*C.world.mingleScale){this.heroMingled=true;this.approachTime=this.approachTime||0;}
   for(let i=1;i<this.sorted.length;i++){const item=this.sorted[i];let j=i-1;while(j>=0&&this.sorted[j].screen.depth<item.screen.depth){this.sorted[j+1]=this.sorted[j];j--;}this.sorted[j+1]=item;}
  }
  render(ctx,renderer,focus,lite,reduced){
   const count=lite?C.world.count.lite:C.world.count.normal;
   for(const item of this.sorted){if(item.role==='retired'||item.role!=='formation'&&item.id>=count||item.role==='hero'&&!this.released)continue;renderer.draw(ctx,item,focus);if(item.role==='letter')renderer.drawNote(ctx,item,this.time,reduced);}
  }
 }
 app.Crowd=Crowd;
})();
