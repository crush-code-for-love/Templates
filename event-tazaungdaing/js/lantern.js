/* One renderer for every world lantern. All gradients, wrinkles and blur are
   baked into reusable canvases; draw() only transforms and composites sprites. */
(() => {
  const app = window.LanternLetter, C = app.config;
  app.makeGlow = function(color) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), r = g.createRadialGradient(64,64,0,64,64,64);
    r.addColorStop(0,color+'aa'); r.addColorStop(.25,color+'35'); r.addColorStop(1,color+'00');
    g.fillStyle=r; g.fillRect(0,0,128,128); return c;
  };
  class LanternRenderer {
    constructor(lite) {
      this.lite=lite; this.cache=[];
      this.glows=C.world.palette.map(color=>app.makeGlow(color));
      this.build();
    }
    build() {
      this.cache.length=0;
      for(let color=0;color<C.world.palette.length;color++) {
        const variants=[];this.cache.push(variants);
        for(let variant=0;variant<C.paper.variants;variant++) {
          const views=[];variants.push(views);
          for(let view=0;view<C.paper.views;view++) {
            const sizes=[];views.push(sizes);
            for(const resolution of C.paper.resolutions) {
              const sharp=this.sprite(C.world.palette[color],variant,view/(C.paper.views-1)*C.paper.maxBelow,resolution);
              const blurred=[];
              // Lite keeps one soft version, normal keeps two focus distances.
              const levels=this.lite?[C.focus.blurLevels[C.focus.blurLevels.length-1]]:C.focus.blurLevels;
              for(const radius of levels) {
                const soft=document.createElement('canvas');soft.width=sharp.width;soft.height=sharp.height;
                const g=soft.getContext('2d');
                g.filter=`blur(${radius*resolution/112}px)`; // Setup only, never in draw().
                g.drawImage(sharp,0,0);g.filter='none';blurred.push(soft);
              }
              // Paint genuinely unlit paper: no dimmed flame left inside the mouth.
              const dim=this.sprite(C.world.palette[color],variant,view/(C.paper.views-1)*C.paper.maxBelow,resolution,false);
              sizes.push({sharp,blurred,dim});
            }
          }
        }
      }
    }
    setLite(lite) {if(this.lite!==lite){this.lite=lite;this.build();}}
    sprite(color,variant,below,resolution,lit=true) {
      const c=document.createElement('canvas');c.width=resolution*3;c.height=resolution*4;
      const g=c.getContext('2d');g.scale(resolution,resolution);g.translate(1.5,2);
      // Inflated heart lobes taper into a round burner opening, not a flat heart icon.
      // Looking underneath foreshortens the shoulders and widens the circular mouth.
      const top=-.78+below*.15,bottom=.65-below*.15,ry=.055+below*.245;
      const notch=top+.25,shoulder=top-.07;
      const path=()=>{
        g.beginPath();g.moveTo(0,notch);
        g.bezierCurveTo(-.26,shoulder-.14,-.64,shoulder,-.67,top+.28);
        g.bezierCurveTo(-.80,-.02,-.48,.29,-.30,bottom);
        g.quadraticCurveTo(0,bottom+ry,.30,bottom);
        g.bezierCurveTo(.48,.29,.80,-.02,.67,top+.28);
        g.bezierCurveTo(.64,shoulder,.26,shoulder-.14,0,notch);g.closePath();
      };
      path();
      const paper=g.createLinearGradient(0,top,0,bottom);
      paper.addColorStop(0,lit?C.paper.coolTop:C.paper.unlitTop);paper.addColorStop(.23,lit?C.paper.warmTop:C.paper.unlitTop);
      paper.addColorStop(.60,lit?color:C.paper.unlitBottom);paper.addColorStop(.88,lit?C.paper.hotPaper:C.paper.unlitBottom);paper.addColorStop(1,lit?C.paper.rim:C.paper.unlitRim);
      g.fillStyle=paper;g.fill();g.save();g.clip();
      const edge=g.createLinearGradient(-.72,0,.72,0);
      edge.addColorStop(0,'#08092099');edge.addColorStop(.18,'#09082012');edge.addColorStop(.55,'#fff1bd22');edge.addColorStop(1,'#08092099');
      g.fillStyle=edge;g.fillRect(-.8,-1,1.6,2);
      // Fine irregular crease fragments, not the old evenly ribbed construction.
      let seed=variant*371+83;
      const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      for(let i=0;i<C.paper.wrinkles;i++) {
        const x=(random()-.5)*1.5,y=top+random()*(bottom-top),length=.03+random()*.18;
        g.strokeStyle=i%2?'#fff2ce30':'#3c20332b';g.lineWidth=.003+random()*.005;
        g.beginPath();g.moveTo(x,y);g.lineTo(x+(random()-.5)*.08,y+length*.5);g.lineTo(x+(random()-.5)*.10,y+length);g.stroke();
      }
      g.restore();path();g.strokeStyle=lit?C.paper.coolRim:C.paper.unlitRim;g.lineWidth=.008;g.stroke();
      // A central seam and curved tension folds show paper stretched over the lobes.
      g.strokeStyle=lit?'#7d2d2855':'#473e3544';g.lineWidth=.009;
      g.beginPath();g.moveTo(0,notch);g.quadraticCurveTo(.015,0,0,bottom);g.stroke();
      for(let side=-1;side<=1;side+=2){g.beginPath();g.moveTo(side*.53,top+.22);g.quadraticCurveTo(side*.48,.15,side*.23,bottom);g.stroke();}
      // Open mouth: dark cavity, glowing inner paper and a separate visible flame.
      const mouth=g.createRadialGradient(0,bottom,0,0,bottom,.32);
      mouth.addColorStop(0,lit?'#ffeab0':'#302820');mouth.addColorStop(.24,lit?'#e79130':'#352d26');mouth.addColorStop(.72,lit?'#a64c1d':'#42382e');mouth.addColorStop(1,lit?C.paper.rim:C.paper.unlitRim);
      g.fillStyle=mouth;g.beginPath();g.ellipse(0,bottom,.30,ry,0,0,Math.PI*2);g.fill();
      g.strokeStyle=lit?C.paper.rim:C.paper.unlitRim;g.lineWidth=.012;g.stroke();
      g.strokeStyle='#ad734e';g.lineWidth=.009;g.beginPath();g.moveTo(-.29,bottom);g.lineTo(.29,bottom);g.moveTo(0,bottom-ry);g.lineTo(0,bottom+ry);g.stroke();
      const flameY=bottom+ry*.14;
      g.fillStyle='#77502b';g.beginPath();g.ellipse(0,flameY+.045,.045,.025,0,0,Math.PI*2);g.fill();
      if(!lit)return c;
      g.fillStyle=C.colors.flame[1];g.beginPath();g.moveTo(-.07,flameY+.035);g.quadraticCurveTo(-.13,flameY-.07,.025,flameY-.24);g.quadraticCurveTo(.02,flameY-.1,.09,flameY-.04);g.quadraticCurveTo(.10,flameY+.07,-.07,flameY+.035);g.fill();
      g.fillStyle=C.colors.flame[0];g.beginPath();g.ellipse(0,flameY,.035,.065,0,0,Math.PI*2);g.fill();
      return c;
    }
    draw(ctx,item,focus) {
      const p=item.screen;if(!p.visible)return;
      const sizes=this.cache[item.color][item.variant];
      const view=Math.min(C.paper.views-1,Math.round(p.below/Math.max(.001,C.paper.maxBelow)*(C.paper.views-1)));
      const entry=sizes[view][p.width>C.paper.sizeThreshold?1:0];
      const blurIndex=this.lite?0:(p.width>C.paper.sizeThreshold?1:0);
      const heat=item.heat??1;
      const alpha=p.alpha,glow=p.width*(C.focus.glowScale+(1-focus)*C.focus.bokehSpread);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha*C.paper.glowStrength*heat*(p.brightness??1);
      ctx.drawImage(this.glows[item.color],p.x-glow/2,p.y-glow/2,glow,glow);
      ctx.globalCompositeOperation='source-over';ctx.translate(p.x,p.y);ctx.rotate(p.rotation);
      if(heat<1){
        ctx.globalAlpha=alpha;ctx.drawImage(entry.dim,-p.width*1.5,-p.width*2,p.width*3,p.width*4);
        // LIGHTING: softened bands carry warmth up from the wick without new gradients.
        for(let band=0;band<24;band++){
          const t=band/24;ctx.globalAlpha=alpha*heat*Math.max(0,Math.min(1,(heat-(1-t)*.72)*4));
          ctx.drawImage(entry.sharp,0,t*entry.sharp.height,entry.sharp.width,entry.sharp.height/24,-p.width*1.5,(t*4-2)*p.width,p.width*3,p.width/6+.5);
        }
        ctx.restore();return;
      }
      // Opaque paper first, then soft defocus on top: never crossfade the body
      // against the world behind it (which previously made other hearts show through).
      ctx.globalAlpha=1;ctx.drawImage(entry.sharp,-p.width*1.5,-p.width*2,p.width*3,p.width*4);
      if(focus<1){ctx.globalAlpha=1-focus;ctx.drawImage(entry.blurred[blurIndex],-p.width*1.5,-p.width*2,p.width*3,p.width*4);}
      ctx.restore();
    }
    drawNote(ctx,item,time,reduced){
      if(item.noteDetached||!item.screen.visible)return;
      const p=item.screen,s=p.width/item.size,thread=C.letterLantern.threadLength*s;
      const angle=reduced?0:Math.sin(time*C.letterLantern.noteSpeed)*C.letterLantern.noteSway;
      const y=p.y+p.width*(.65-p.below*.15);
      item.noteScreen.x=p.x-Math.sin(angle)*thread;item.noteScreen.y=y+Math.cos(angle)*thread;
      item.noteScreen.width=C.letterLantern.noteSize[0]*s;item.noteScreen.depth=p.depth;
      ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,y);ctx.rotate(angle);
      ctx.strokeStyle=C.letterLantern.threadColor;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,thread);ctx.stroke();
      ctx.fillStyle=C.colors.paper;ctx.fillRect(-C.letterLantern.noteSize[0]*s/2,thread,C.letterLantern.noteSize[0]*s,C.letterLantern.noteSize[1]*s);ctx.restore();
    }
  }
  app.LanternRenderer=LanternRenderer;
})();
