/* Stationary first-person camera: IDLE -> LIGHTING -> LIFTOFF -> ASCENT
   -> MINGLE -> NOTE_DROP -> READING. Replay reconstructs the fixed world. */
(() => {
 const app=window.LanternLetter,C=app.config,canvas=document.getElementById('world');
 const scene=new app.Scene(canvas),renderer=new app.LanternRenderer(C.performance.manualLite);
 let world=new app.Crowd(scene),torch=new app.Torch(scene);
 const hint=document.getElementById('hint'),controls=document.getElementById('controls'),greeting=document.getElementById('greeting'),sound=document.getElementById('sound');
 const strings=C.strings[C.language]||C.strings.en,motion=matchMedia('(prefers-reduced-motion: reduce)');
 const state={phase:'IDLE',phaseTime:0,time:0,focus:C.focus.idleSharpness,dim:0,fontsReady:false,reduced:motion.matches};
 const input={id:null,active:false,hold:false,key:false,x:0,y:0};
 let frameId=0,lastTime=0,inactive=0,slowTime=0;
 const letter=new app.Letter(()=>closeLetter()),celebration=new app.Celebration(scene);
 greeting.textContent=C.celebration.text;
 let lookTarget=scene.pitch,dragY=null;
 const tracks={match:null,crackle:null,wind:null};let soundEnabled=true;
 let music=null,musicStarted=false,musicContext=null,musicGain=null,musicSource=null;
 function musicLevel(){
  if(!music)return;
  // Keep the media element audible to the browser; silence before contact at the audio graph.
  const audible=musicStarted&&soundEnabled;
  if(musicGain)musicGain.gain.value=audible?1:0;
  else music.volume=audible?C.audio.musicVolume:0;
 }
 function unlockMusic(){
  // Called directly by a pointer/key/click gesture, never only by the animation loop.
  if(musicContext&&musicContext.state!=='running')musicContext.resume().catch(()=>{sound.title=strings.audioFailed;});
 }
 function prepareMusic(){
  if(music){unlockMusic();return;}
  const track=music=new Audio(C.audio.music);track.preload='auto';track.volume=C.audio.musicVolume;track.muted=false;
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(AudioContext){
   musicContext=musicContext||new AudioContext();musicSource=musicContext.createMediaElementSource(track);
   musicGain=musicContext.createGain();musicGain.gain.value=0;
   musicSource.connect(musicGain);musicGain.connect(musicContext.destination);
  }
  musicLevel();unlockMusic();
  const seek=()=>{if(Number.isFinite(track.duration)&&track.duration<=C.audio.musicStart){sound.title='Music file is shorter than 1:57';return;}try{track.currentTime=C.audio.musicStart;}catch(error){/* Retry when contact occurs. */}};
  track.addEventListener('loadedmetadata',seek,{once:true});
  track.addEventListener('error',()=>{sound.title=strings.audioFailed;});
  // Leave playback running silently through the gain node until fuel contact.
  track.play().catch(()=>{sound.title=strings.audioFailed;});
 }
 function startMusic(){
  if(musicStarted)return;prepareMusic();musicStarted=true;
  try{music.currentTime=C.audio.musicStart;}catch(error){/* Metadata callback performs the seek. */}
  musicLevel();music.play().catch(()=>{sound.title=strings.audioFailed;});
 }
 function resumeMusic(){if(musicStarted&&music&&!music.ended)music.play().catch(()=>{});}

 document.documentElement.lang=C.language;
 const style=document.documentElement.style;style.setProperty('--paper',C.colors.paper);style.setProperty('--ink',C.note.ink);style.setProperty('--accent',C.note.accent);style.setProperty('--unfold-time',C.note.unfoldTime+'s');
 canvas.setAttribute('role','application');canvas.setAttribute('tabindex','0');canvas.setAttribute('aria-label',strings.scene+'. '+strings.lightHint+'. '+strings.keyboardHint);
 hint.textContent=strings.lightHint;sound.textContent=strings.sound;sound.hidden=false;
 sound.disabled=false;sound.setAttribute('aria-pressed','true');
 document.fonts.ready.then(()=>{state.fontsReady=true;});
 function interactive(){return state.phase==='IDLE'||state.phase==='LIGHTING';}
 function enter(phase){state.phase=phase;state.phaseTime=0;}
 function activity(){inactive=0;hint.hidden=true;hint.classList.remove('visible');}
 function releaseInput(){input.id=null;input.active=input.hold=input.key=false;canvas.style.cursor='default';}
 function stopAudio(){for(const key in tracks){if(tracks[key]){tracks[key].pause();tracks[key].currentTime=0;}}}
 function playAudio(key){
  if(!soundEnabled||!C.audio[key])return;
  if(!tracks[key]){tracks[key]=new Audio(C.audio[key]);tracks[key].loop=key!=='match';tracks[key].volume=.3;}
  tracks[key].play().catch(()=>{soundEnabled=false;stopAudio();sound.setAttribute('aria-pressed','false');sound.title=strings.audioFailed;});
 }
 sound.addEventListener('click',()=>{
  if(sound.disabled)return;
  // A blocked track needs a direct-gesture retry, not an accidental toggle to mute.
  const blocked=musicStarted&&music&&(music.paused||musicContext&&musicContext.state!=='running');
  soundEnabled=blocked?true:!soundEnabled;unlockMusic();musicLevel();
  if(soundEnabled&&musicStarted){resumeMusic();sound.title='';}
  celebration.unlock();celebration.mute(!soundEnabled);sound.setAttribute('aria-pressed',String(soundEnabled));
  if(soundEnabled)playAudio(interactive()?'crackle':'wind');else stopAudio();
 });
 function setLite(enabled){C.performance.manualLite=enabled;renderer.setLite(enabled);slowTime=0;}
 function closeLetter(){
  letter.close();world.startFormations();enter('EXPLORE');lookTarget=scene.pitch;state.focus=1;state.dim=0;
  hint.hidden=true;canvas.focus({preventScroll:true});
 }
 function reset(){
  releaseInput();stopAudio();if(music){music.pause();music.removeAttribute('src');music.load();music=null;}if(musicSource)musicSource.disconnect();if(musicGain)musicGain.disconnect();musicSource=musicGain=null;musicStarted=false;letter.reset();celebration.reset();greeting.hidden=true;canvas.style.filter='';canvas.style.opacity='1';
  scene.pitch=C.camera.startPitch*Math.PI/180;world=new app.Crowd(scene);torch=new app.Torch(scene);
  state.phase='IDLE';state.phaseTime=state.time=state.dim=0;state.focus=C.focus.idleSharpness;state.reduced=motion.matches;
  inactive=slowTime=lastTime=0;dragY=null;lookTarget=scene.pitch;hint.textContent=strings.lightHint;activity();controls.hidden=true;
  app.world=world;app.torch=torch;app.lantern=world.hero;world.project();torch.update(0,state.reduced);draw();canvas.focus({preventScroll:true});if(soundEnabled)playAudio('crackle');
 }
 function smooth(p){p=Math.max(0,Math.min(1,p));return p*p*(3-2*p);}
 function update(dt){
  state.time+=dt;state.phaseTime+=dt;inactive+=dt;
  world.project();const p=world.hero.screen;
  const wickX=p.x,wickY=p.y+p.width*(.65-p.below*.15);
  if(interactive()&&input.key){torch.targetX=wickX;torch.targetY=wickY;}
  torch.update(dt,state.reduced);
  if(music){const target=(!musicGain&&(!musicStarted||!soundEnabled))?0:state.phase==='READING'||state.phase==='NOTE_DROP'?C.audio.readingVolume:C.audio.musicVolume;music.volume+=(target-music.volume)*(1-Math.exp(-dt*3));}
  if(interactive()){
   // IDLE / LIGHTING: foreground is sharp, paper warms progressively at the wick.
   const near=input.active&&Math.hypot(torch.x-wickX,torch.y-wickY)<C.lighting.reach;
   if(near&&state.phase==='IDLE'){enter('LIGHTING');playAudio('match');}
   world.hero.heat=Math.max(0,Math.min(1,world.hero.heat+dt*(near?1/C.timings.heat:-1/C.timings.heatDecay)));
   if(near)startMusic();
   state.focus=C.focus.idleSharpness+world.hero.heat*.22;
   if(world.hero.heat===0&&state.phase==='LIGHTING')enter('IDLE');
   if(world.hero.heat>=1){
    world.release();torch.drop();releaseInput();activity();enter('LIFTOFF');celebration.start();stopAudio();playAudio('wind');
    if(typeof navigator.vibrate==='function'){try{navigator.vibrate(C.lighting.vibration);}catch(error){/* Optional haptics. */}}
   }
  }
  world.update(dt,state.reduced);
  celebration.update(dt);greeting.hidden=celebration.elapsed<0;
  if(!greeting.hidden){greeting.style.opacity=String(Math.min(1,celebration.elapsed/.7,(C.celebration.duration-celebration.elapsed)/.8));greeting.style.transform=state.reduced?'none':`translateY(${10*(1-smooth(celebration.elapsed/1.2))}px)`;}
  if(state.phase==='LIFTOFF'||state.phase==='ASCENT'){
   // LOOK UP: change pitch at a fixed eye height; never follow the hero lantern.
   const duration=state.reduced?C.flight.reducedFade*2:C.camera.lookUpDuration;
   const p=Math.min(1,world.flightTime/duration),ease=smooth(p);
   if(state.reduced){canvas.style.opacity=String(Math.abs(2*p-1));scene.pitch=(p<.5?C.camera.startPitch:C.camera.endPitch)*Math.PI/180;}
   else scene.pitch=(C.camera.startPitch+(C.camera.endPitch-C.camera.startPitch)*ease)*Math.PI/180;
   state.focus=C.focus.idleSharpness+(1-C.focus.idleSharpness)*smooth(world.flightTime/C.focus.sharpenDuration);
   if(state.phase==='LIFTOFF'&&world.flightTime>=C.flight.torchFade)enter('ASCENT');
   if(p>=1){canvas.style.opacity='1';enter('MINGLE');}
  }
  world.project();
  if(state.phase==='MINGLE'){
   // The following lantern crosses above our eyes, then releases its written note.
   state.focus=1;
   if(world.letterPassed&&state.fontsReady){
    // Render once to capture the small note's exact attachment point before detachment.
    renderer.drawNote(scene.ctx,world.letter,world.time,state.reduced);
    letter.start(world.letter,scene,state.reduced);enter('NOTE_DROP');
   }
  }else if(state.phase==='NOTE_DROP'){
   // Focus moves to a paper object approaching along decreasing camera-space Z.
   const p=Math.min(1,state.phaseTime/(state.reduced?C.flight.reducedFade:C.letterLantern.noteFallDuration));
   letter.drop(p,state.reduced);state.focus=1-smooth(p)*C.focus.refocusOnNote;state.dim=smooth(p)*C.note.backgroundDim;
   if(p>=1){enter('READING');letter.open();}
  }else if(state.phase==='READING')letter.read(state.phaseTime);
  else if(state.phase==='EXPLORE'){
   scene.pitch=state.reduced?lookTarget:scene.pitch+(lookTarget-scene.pitch)*(1-Math.exp(-C.explore.smoothing*dt));
   world.project();
  }
  if(state.fontsReady&&state.time>=C.timings.hintDelay)controls.hidden=false;
  if(interactive()&&state.fontsReady&&inactive>=C.timings.hintDelay){hint.hidden=false;hint.classList.add('visible');}
 }
 function draw(){
  scene.renderSky();scene.renderAtmosphere(state.time,state.reduced);celebration.render(scene.ctx,C.performance.manualLite,state.reduced);world.render(scene.ctx,renderer,state.focus,C.performance.manualLite,state.reduced);scene.renderEnvironment(state.focus,state.time,state.reduced);
  if(interactive()){
   // Held lantern and torch are always foreground: both visible from frame one.
   torch.renderGlow(scene.ctx);renderer.draw(scene.ctx,world.hero,1);
  }
  if(torch.opacity>0){torch.render(scene.ctx,state.time,state.reduced);}
  if(state.dim>0){scene.ctx.save();scene.ctx.globalAlpha=state.dim;scene.ctx.fillStyle='#050711';scene.ctx.fillRect(0,0,scene.width,scene.height);scene.ctx.restore();}
 }
 function frame(timestamp){
  const raw=lastTime?(timestamp-lastTime)/1000:0;lastTime=timestamp;
  if(!C.performance.manualLite&&raw>1/C.performance.lowFps){slowTime+=raw;if(slowTime>=C.performance.lowFpsSeconds)setLite(true);}else slowTime=0;
  update(Math.min(raw,C.scene.maxDelta));draw();frameId=requestAnimationFrame(frame);
 }
 // Exploration is unlocked only after dismissing the letter. Wheel-up looks upward.
 function look(delta){lookTarget=Math.max(C.camera.startPitch*Math.PI/180,Math.min(C.explore.maxPitch*Math.PI/180,lookTarget+delta*Math.PI/180));}
 canvas.addEventListener('wheel',e=>{if(state.phase!=='EXPLORE')return;e.preventDefault();const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?scene.height:1);look(-pixels*C.explore.scrollSpeed);},{passive:false});
 canvas.addEventListener('pointerdown',e=>{if(state.phase==='EXPLORE'){dragY=e.clientY;canvas.setPointerCapture(e.pointerId);}});
 canvas.addEventListener('pointermove',e=>{if(state.phase==='EXPLORE'&&dragY!==null){look((e.clientY-dragY)*C.explore.dragSpeed);dragY=e.clientY;}});
 for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])canvas.addEventListener(event,()=>{dragY=null;});
 canvas.addEventListener('keydown',e=>{if(state.phase==='EXPLORE'&&(e.code==='ArrowUp'||e.code==='ArrowDown')){e.preventDefault();look(e.code==='ArrowUp'?3:-3);}});
 letter.card.addEventListener('keydown',e=>{if(e.code==='Escape'&&state.phase==='READING'){e.preventDefault();closeLetter();}});
 // Drag begins only on the torch. Pointer hover never moves or lights it.
 canvas.addEventListener('pointerdown',e=>{
  if(!interactive()||input.id!==null||!torch.contains(e.clientX,e.clientY))return;
  celebration.unlock();prepareMusic();input.id=e.pointerId;input.active=true;
  input.x=e.clientX-torch.x;input.y=e.clientY-torch.y;
  canvas.style.cursor='grabbing';canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});activity();
 });
 canvas.addEventListener('pointermove',e=>{
  if(!interactive())return;
  if(input.id===null){canvas.style.cursor=torch.contains(e.clientX,e.clientY)?'grab':'default';return;}
  if(input.id!==e.pointerId)return;
  torch.targetX=Math.max(0,Math.min(scene.width,e.clientX-input.x));torch.targetY=Math.max(0,Math.min(scene.height,e.clientY-input.y));activity();
 });
 canvas.addEventListener('pointerup',e=>{if(input.id===e.pointerId)releaseInput();});canvas.addEventListener('pointercancel',releaseInput);canvas.addEventListener('lostpointercapture',releaseInput);canvas.addEventListener('pointerleave',()=>{if(input.id===null)releaseInput();});
 canvas.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){celebration.unlock();e.preventDefault();if(interactive()){prepareMusic();input.active=input.key=true;activity();}}});
 canvas.addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter')releaseInput();});canvas.addEventListener('blur',releaseInput);window.addEventListener('blur',releaseInput);
 window.addEventListener('resize',()=>{releaseInput();scene.resize();world.project();torch.resize();letter.fit();if(state.phase==='NOTE_DROP')letter.drop(Math.min(1,state.phaseTime/C.letterLantern.noteFallDuration),state.reduced);draw();});
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frameId);lastTime=slowTime=0;releaseInput();if(document.hidden){stopAudio();if(music)music.pause();celebration.quiet();} else{resumeMusic();if(celebration.elapsed>=0)celebration.mute(!soundEnabled);if(soundEnabled)playAudio(interactive()?'crackle':'wind');frameId=requestAnimationFrame(frame);}});
 motion.addEventListener('change',()=>{state.reduced=motion.matches;});
 app.celebration=celebration;app.scene=scene;app.world=world;app.renderer=renderer;app.state=state;app.torch=torch;app.lantern=world.hero;app.letter=letter;app.reset=reset;
 world.project();torch.update(0,state.reduced);draw();frameId=requestAnimationFrame(frame);
})();
