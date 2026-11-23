/* NOTE_DROP and READING use real HTML so Myanmar text stays crisp and selectable. */
(() => {
 const app=window.LanternLetter,C=app.config;
 class Letter {
  constructor(onAction){
   this.card=document.getElementById('letter');this.lines=[];this.onAction=onAction;
   this.content=document.createElement('div');this.content.className='letter-content';
   this.card.replaceChildren(this.content);this.card.tabIndex=-1;
   const text=C.letter;
   this.addLine(text.greeting,'h1');
   for(const line of text.body)this.addLine(line,'p');
   this.addLine(text.anonymous?text.anonymousHint:text.signature,'p','signature');
   this.closeButton=document.createElement('button');this.closeButton.type='button';this.closeButton.className='letter-close';this.closeButton.textContent='×';
   this.closeButton.setAttribute('aria-label',C.language==='my'?'စာပိတ်မယ်':'Close letter');
   this.closeButton.addEventListener('click',()=>this.onAction('close'));this.card.append(this.closeButton);
   this.reset();
  }
  addLine(text,tag,className=''){
   const line=document.createElement(tag);line.className='letter-line '+className;line.textContent=text;
   this.content.append(line);this.lines.push(line);
  }
  reset(){
   this.card.hidden=true;this.card.className='';this.card.style.transform='';this.card.style.opacity='0';
   this.content.scrollTop=0;this.visibleLines=0;this.finished=false;
   for(const line of this.lines){line.classList.add('revealed');line.style.visibility='visible';}
   this.closeButton.hidden=true;
  }
  fit(){
   // Measure only on reveal/resize, never in the animation loop. Preserve readable text
   // by giving short mobile paper more height before reducing font size if necessary.
   if(this.card.hidden)return;
   this.card.style.height='';this.card.style.setProperty('--letter-text-scale','1');
   const maxHeight=Math.floor(innerHeight*.80),needed=this.content.scrollHeight+2;
   if(needed>this.card.clientHeight)this.card.style.height=Math.min(maxHeight,needed)+'px';
   let scale=1;
   while(this.content.scrollHeight>this.content.clientHeight+1&&scale>.55){
    scale-=.025;this.card.style.setProperty('--letter-text-scale',String(scale));
   }
  }
  start(lantern,scene,reduced){
   // NOTE_DROP begins at the separate letter lantern's projected paper attachment.
   this.scene=scene;const p=lantern.noteScreen;
   this.originX=(p.x-scene.cx)/scene.focal*p.depth;
   // The hanging note is portrait; its center is half a sheet below the thread.
   this.originY=(scene.cy-p.y)/scene.focal*p.depth-C.letterLantern.noteSize[1]/2;
   this.originZ=p.depth;this.noteWidth=C.letterLantern.noteSize[1]; // Long edge becomes the landscape width after a quarter-turn.
   this.card.hidden=false;this.card.className='falling';this.fit();lantern.noteDetached=true;
   this.drop(0,reduced);
  }
  drop(progress,reduced){
   const p=Math.max(0,Math.min(1,progress)),ease=p*p*(3-2*p),scene=this.scene;
   // Camera-space Z decreases continuously: projected paper grows toward the viewer.
   // End on the ray through the viewport center, independent of screen orientation.
   const endZ=scene.focal*this.noteWidth/this.card.offsetWidth;
   const z=this.originZ+(endZ-this.originZ)*ease;
   const endY=(scene.cy-scene.height*.5)/scene.focal*endZ;
   const x=this.originX*(1-ease),y=this.originY+(endY-this.originY)*ease;
   const screenX=scene.cx+x/z*scene.focal,screenY=scene.cy-y/z*scene.focal;
   const scale=scene.focal*this.noteWidth/z/this.card.offsetWidth;
   // FALL: air rocks the sheet; the final fifth gently presses it flat against the screen.
   const envelope=Math.sin(p*Math.PI)*(1-p);
   const sway=Math.sin(p*Math.PI*4)*C.note.dropSway*envelope;
   // A quarter-turn happens while the sheet is still airborne, followed by damped flutter.
   const turn=Math.max(0,Math.min(1,(p-.12)/.72)),turnEase=turn*turn*(3-2*turn);
   const roll=90*(1-turnEase)+Math.sin(p*Math.PI*5)*C.note.dropRotation*envelope;
   this.rotation=roll;
   const pitch=Math.sin(p*Math.PI*4+.5)*38*envelope;
   const settle=p>.80?Math.sin((p-.80)/.20*Math.PI)*.045:0;
   this.depth=z;this.card.style.opacity=String(reduced?ease:1);
   this.card.style.transform=reduced?'translate(-50%, -50%)':`translate(-50%, -50%) translate(${screenX-scene.width*.5+sway}px, ${screenY-scene.height*.5}px) perspective(900px) rotateX(${pitch}deg) rotateY(${Math.sin(p*Math.PI*3)*28*envelope}deg) rotate(${roll}deg) scale(${scale*(1+settle)})`;
  }
  open(){this.card.className='reading';this.card.style.opacity='1';this.card.style.transform='translate(-50%, -50%)';this.closeButton.hidden=false;this.finished=true;this.visibleLines=this.lines.length;this.closeButton.focus({preventScroll:true});}
  read(){/* The love letter is already written before the paper arrives. */}
  close(){this.card.hidden=true;}
 }
 app.Letter=Letter;
})();
