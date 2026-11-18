// Full-screen birthday code rain. Personalize with ?name=Alex.
const canvas=document.querySelector('#rain'),ctx=canvas.getContext('2d');
const stage=document.querySelector('#stage'),headline=document.querySelector('#headline'),caption=document.querySelector('#caption'),eyebrow=document.querySelector('#eyebrow');
const startButton=document.querySelector('#start'),replay=document.querySelector('#replay'),pause=document.querySelector('#pause'),sound=document.querySelector('#sound'),theme=document.querySelector('#theme');
const birthday=document.querySelector('#birthday-scene'),message=document.querySelector('#message'),letter=document.querySelector('#letter-dialog'),envelope=document.querySelector('#envelope');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const recipient=(new URLSearchParams(location.search).get('name')||'YOU').trim().slice(0,30)||'YOU';
const glyphs='HAPPYBIRTHDAY0123456789<>+*♡';
let width=0,height=0,font=12,spacing=14,streams=[],clock=0,last=0,elapsed=0,playing=false,paused=false,entered=false,muted=false,beat=-1;
function resize(){width=stage.clientWidth;height=stage.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);font=width<600?10:12;spacing=font+3;streams=Array.from({length:Math.ceil(width/spacing)},(_,i)=>({x:i*spacing+2,offset:Math.random()*(height+600),speed:35+Math.random()*65,length:20+Math.floor(Math.random()*45),phase:Math.random()*100,bright:.35+Math.random()*.65}));draw();}
function draw(){ctx.fillStyle='#08070d';ctx.fillRect(0,0,width,height);ctx.font=`600 ${font}px monospace`;ctx.textBaseline='top';for(const s of streams){const span=height+s.length*spacing+120;const head=(s.offset+clock*s.speed)%span;for(let j=0;j<s.length;j++){const y=head-j*spacing;if(y<-spacing||y>height)continue;const fade=Math.pow(1-j/s.length,.8);const index=Math.floor(s.phase+j*7+Math.floor(clock*3+(j%4)))%glyphs.length;ctx.fillStyle=j===0?`rgba(255,182,222,${s.bright})`:`rgba(245,65,159,${fade*s.bright*.77})`;ctx.fillText(glyphs[index],s.x,y);}}}
const steps=[['3',1.25],['2',1.25],['1',1.25],['HAPPY',1.65],['BIRTHDAY',1.85],['TO',1.2],[recipient.toUpperCase(),1.8],['♥',1.7]];
const duration=steps.reduce((sum,s)=>sum+s[1],0);
function setWord(word){headline.textContent=word;headline.classList.toggle('heart',word==='♥');headline.style.animation='none';void headline.offsetWidth;headline.style.animation='';document.querySelector('#announcement').textContent=word;}
function syncSound(){sound.textContent=muted?'SOUND OFF':'SOUND ON';sound.setAttribute('aria-pressed',String(!muted));theme.muted=muted;}
function playSong(){const result=theme.play();if(result)result.catch(()=>{muted=true;syncSound();sound.textContent='TAP FOR SOUND';});}
function finish(){playing=false;stage.className='stage finished';message.hidden=true;birthday.hidden=false;document.querySelector('#cake-name').textContent=recipient==='YOU'?'':recipient;replay.hidden=false;document.querySelector('#progress').style.width='100%';document.querySelector('#announcement').textContent=`Happy birthday ${recipient}. Your birthday cake and one unread love letter are ready.`;}
function start(){entered=true;elapsed=0;beat=-1;playing=true;paused=false;stage.className='stage playing';startButton.hidden=true;birthday.hidden=true;message.hidden=false;replay.hidden=true;document.querySelector('#controls').inert=false;eyebrow.textContent='';caption.textContent='';pause.textContent='PAUSE';pause.setAttribute('aria-pressed','false');document.querySelector('#progress').style.width='0%';theme.currentTime=0;theme.volume=.7;syncSound();playSong();if(reduced)finish();else update();}
function update(){let end=0,index=0;for(;index<steps.length;index++){end+=steps[index][1];if(elapsed<end)break;}if(index===steps.length){finish();return;}if(index!==beat){beat=index;setWord(steps[index][0]);}document.querySelector('#progress').style.width=`${elapsed/duration*100}%`;}
function frame(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(entered&&!paused&&!document.hidden){if(!reduced)clock+=dt;if(playing){elapsed+=dt;update();}draw();}requestAnimationFrame(frame);}
startButton.addEventListener('click',start);replay.addEventListener('click',start);
pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'RESUME':'PAUSE';pause.setAttribute('aria-pressed',String(paused));if(paused)theme.pause();else playSong();});
sound.addEventListener('click',()=>{muted=!muted;syncSound();if(!muted&&!paused)playSong();});
envelope.addEventListener('click',()=>{letter.showModal();document.querySelector('#badge').hidden=true;envelope.setAttribute('aria-label','Read your love letter');});
document.querySelector('#close-letter').addEventListener('click',()=>letter.close());
letter.addEventListener('click',event=>{if(event.target===letter){const r=letter.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)letter.close();}});
document.addEventListener('visibilitychange',()=>{if(!entered)return;if(document.hidden)theme.pause();else if(!paused)playSong();});
new ResizeObserver(resize).observe(stage);resize();requestAnimationFrame(frame);
