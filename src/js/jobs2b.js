// ===== 上級・深淵ジョブの 攻撃と 職業技 =====
const near = (x, y, r) => living().filter(e=>{ const b=eBox(e), dx=b.cx-x, dy=(b.cy-y)*1.3; return dx*dx+dy*dy <= r*r; });
const shuffled = l => [...l].sort(()=>Math.random()-.5);
const payHp = f => { S.php = Math.max(1, S.php - S.pmax*f); };
function heroAttack2(job, an, manual, hit, ok){
  const a = ACT[0];
  if(job==='mahouken'){
    const el = S.mkEl = ((S.mkEl ?? -1) + 1) % 3, col = ['#ff8e3c','#ffe14a','#9fe3ff'][el];
    an.el = el;
    an.ev.push([.14, ()=>{
      const fx = frontX(), reach = 46*(HS.pw.reach||1);
      FX.push({type:'wave', x:fx-4, w:reach+6, t:0, dur:.2});
      living().filter(e=>eBox(e).front <= fx+reach && low(e)).forEach(e=>{
        const strike = (m, q) => { if(!ok(e)) return; const b=eBox(e); sparks(b.cx, b.cy, 2, [col,'#ffffff']); hit(e, m, q, {mag:true}); if(!ok(e)) return;
          if(el===0) e.burn = 3; else if(el===1){ if(Math.random()<.35) bolt(e, manual); } else { e.stun = Math.max(e.stun, .6); if(manual) e.t += .4; } };
        strike(1.0, false); if(ok(e) && manual) launch(e, 28*rand(.9,1.1)*(e.boss?.6:1)); if(HS.pw.dualBlade) later(.1, ()=>strike(.7, true));
      });
    }]);
  }else if(job==='ryuukishi'){
    const l = living(), air = l.filter(e=>e.air>0).sort((p,q)=>eBox(p).top-eBox(q).top);
    const tgt = air[0] || [...l].sort((p,q)=>eBox(p).front-eBox(q).front)[0];
    const b0 = eBox(tgt); an.jx = b0.cx; an.jy = tgt && tgt.air>0 ? b0.cy+6 : 97;
    an.ev.push([.30, ()=>{
      const r = 26*(HS.pw.jumpWide||1), x = an.jx, y = an.jy;
      FX.push({type:'ring', x, y:y-6, t:0, dur:.3, col:'#c8d8ff', big:true}); if(y>=96) dust(x, GROUND+3, 10, 1.2);
      let sum = 0;
      near(x, y-6, r).forEach(e=>{ sum += hit(e, 1.5*(1+(HS.pw.jumpDmg||0)/100)) || 0; if(!ok(e)) return;
        if(HS.pw.roar) e.stun = Math.max(e.stun, 1);
        if(manual){ if(e.air>0) e.vly = Math.max(e.vly, 130); else launch(e, 24*(e.boss?.6:1)); } });
      if(HS.pw.jumpHeal && sum) heal(sum*.05, null);
      if(HS.pw.dsoul) S.dsoulT = 3;
      if(r>30) shake();
    }]);
  }else if(job==='shoukan'){
    an.ev.push([.12, ()=>{
      shuffled(living()).slice(0,3).forEach((e,k)=>PROJ.push({kind:'orb', x:a.x+6, y:a.y-20, tgt:e, t:-k*.05, dur:.22, arc:14, onHit:()=>{
        if(!ok(e)) return; const b=eBox(e); FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.22, col:'#ffb0e0'}); hit(e, .9, k>0, {mag:true}); }}));
      if(manual) for(let i=1;i<CH.length;i++) S.sp[i] = Math.min(100, S.sp[i]+4);
    }]);
  }else if(job==='jikuu'){
    an.ev.push([.12, ()=>{
      shuffled(living()).slice(0,3).forEach((e,k)=>PROJ.push({kind:'clock', x:a.x+6, y:a.y-18, tgt:e, t:-k*.05, dur:.2, arc:6, onHit:()=>{
        if(!ok(e)) return; const b=eBox(e); FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.3, col:'#ffe9a0'}); hit(e, 1.3, k>0, {mag:true}); if(!ok(e)) return;
        if(manual) e.t += .8; if(Math.random()<.12){ e.stun = Math.max(e.stun, 1.5); e.t = Math.max(e.t, 1.5); } }}));
    }]);
  }else if(job==='ginyuu'){
    an.ev.push([.1, ()=>{
      shuffled(living()).slice(0,4).forEach((e,k)=>PROJ.push({kind:'note', x:a.x+6, y:a.y-16, tgt:e, t:-k*.06, dur:.28, arc:18, onHit:()=>{ if(ok(e)) hit(e, .6, k>0); }}));
      if(manual) for(let i=1;i<CH.length;i++) S.cd[i] = Math.max(0, S.cd[i]-.15);
    }]);
  }else if(job==='akindo'){
    an.ev.push([.1, ()=>{
      shuffled(living()).slice(0,5).forEach((e,k)=>PROJ.push({kind:'coin', x:a.x+6, y:a.y-16, tgt:e, t:-k*.04, dur:.18, arc:16, onHit:()=>{
        if(!ok(e)) return; hit(e, 1.0, k>0); if(ok(e) && Math.random()<.2) steal(e, false); }}));
    }]);
  }else if(job==='asobi'){
    const r = Math.random();
    an.mood = r<.15 ? 'fall' : r<.55 ? 'poke' : r<.85 ? 'jump' : 'lucky';
    an.ev.push([.14, ()=>{
      if(an.mood==='fall'){ if(manual) float('すってんころりん','tag',a.x,a.y-30); return; }
      if(an.mood==='poke') shuffled(living()).slice(0,3).forEach(e=>{ const b=eBox(e); FX.push({type:'punch', x:b.cx, y:b.cy, t:0, dur:.1}); hit(e, rand(.5,2.5)); });
      if(an.mood==='jump'){ const fx=frontX(); FX.push({type:'wave', x:fx-4, w:46, t:0, dur:.2}); living().filter(e=>eBox(e).front<=fx+46 && low(e)).slice(0,4).forEach(e=>{ hit(e,1.2); if(ok(e)&&manual) launch(e, 30*(e.boss?.6:1)); }); }
      if(an.mood==='lucky'){ if(manual) float('大当たり！','tag',a.x+20,a.y-34); living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,2).forEach(e=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.16}); hit(e, 3, false, {crit:true}); }); }
    }]);
  }else if(job==='kenja'){
    const cast = d => an.ev.push([d, ()=>{
      const ct = center(), r = 36;
      FX.push({type:'boom', x:ct.x, y:ct.y, r, t:0, dur:.35}); FX.push({type:'ring', x:ct.x, y:ct.y, t:0, dur:.3, col:'#ffffff'});
      sparks(ct.x, ct.y, 12, ['#ffffff','#9fe3ff','#ffe14a'], 90);
      near(ct.x, ct.y, r).forEach(e=>{ hit(e, 1.4, false, {mag:true}); if(ok(e) && manual && !(e.air>0)) launch(e, 26*(e.boss?.6:1)); });
      heal(S.pmax*.02, a);
    }]);
    cast(.12); if(HS.pw.dualcast && Math.random()*100 < HS.pw.dualcast) cast(.4);
  }else if(job==='mamono'){
    const tg = living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,5);
    an.tx = tg.length ? eBox(tg[0]).front : frontX();
    tg.forEach((e,k)=>an.ev.push([.14+k*.035, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.1}); hit(e, .75, k>0); if(ok(e) && manual) launch(e, 18*(e.boss?.6:1)); }]));
    if(manual) an.ev.push([.14, ()=>{ for(let i=1;i<CH.length;i++) S.cd[i] = Math.max(0, S.cd[i]-.2); }]);
  }else if(job==='ninja'){
    an.ev.push([.08, ()=>{
      const n = 4 + (HS.pw.shuriken||0), l = living();
      const tg = [...l.filter(e=>e.air>0).sort((p,q)=>q.ly-p.ly), ...shuffled(l.filter(e=>!(e.air>0)))].slice(0, n);
      tg.forEach((e,k)=>{ const go = (d, q) => PROJ.push({kind:'star', x:a.x+6, y:a.y-14, tgt:e, t:-k*.03-d, dur:.12, arc:0, onHit:()=>{
        if(!ok(e)) return; hit(e, .6, q, {crit: e.air>0 && Math.random()<.6}); }});
        go(0, k>0); if(HS.pw.double) go(.06, true); });
    }]);
  }else if(job==='odori'){
    const tg = living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,3);
    an.tx = tg.length ? eBox(tg[0]).front : frontX();
    [.12,.24].forEach((tm,k)=>an.ev.push([tm, ()=>{ tg.forEach((e,j)=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.12}); hit(e, .55, j>0||k>0); if(k===1 && ok(e) && manual) launch(e, 26*(e.boss?.6:1)); }); }]));
  }else if(job==='samurai'){
    const l = living().filter(low), front = [...l].sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,4);
    const tgt = l.find(e=>e.boss) || front.sort((p,q)=>q.hp-p.hp)[0];
    an.tgt = tgt || null; an.tx = tgt ? eBox(tgt).front : frontX();
    an.ev.push([.16, ()=>{
      if(!tgt || !ok(tgt)) return; const b=eBox(tgt);
      FX.push({type:'slash', x1:b.cx-26, y1:b.cy-12, x2:b.cx+26, y2:b.cy+8, t:0, dur:.22});
      hit(tgt, 2.6, false, {crit: Math.random()<.3}); if(manual){ shake(); if(ok(tgt)) launch(tgt, 46*(tgt.boss?.6:1)); }
      if(HS.pw.issen){ const nx = living().filter(e=>e!==tgt).sort((p,q)=>Math.abs(p.x-b.cx)-Math.abs(q.x-b.cx))[0]; if(nx) hit(nx, 1.6, true); }
    }]);
  }else if(job==='abyssk'){
    an.ev.push([.16, ()=>{
      const fx = frontX(), reach = 60;
      FX.push({type:'wave', x:fx-4, w:reach+6, t:0, dur:.24, dark:true});
      sparks(fx+20, 80, 8, ['#5a2a7a','#b48ae0','#1b1626'], 80);
      living().filter(e=>eBox(e).front <= fx+reach && low(e)).forEach(e=>{ hit(e, 1.5); if(ok(e) && manual) launch(e, 30*rand(.9,1.1)*(e.boss?.6:1)); });
      if(manual) payHp(.015);
    }]);
  }
}
function heroSpecial2(job, an, hit, ok, T){
  const a = ACT[0];
  if(job==='mahouken'){
    an.ev.push([T+.15, ()=>{
      FX.push({type:'slash', x1:an.tx-20, y1:20, x2:196, y2:GROUND+4, t:0, dur:.35}); FX.push({type:'boom', x:center().x, y:center().y, r:70, t:0, dur:.45});
      flash(); shake(true); hitstop(.1);
      living().forEach(e=>{ hit(e, 2.2, false, {mag:true}); if(ok(e)){ e.burn = 3; e.stun = Math.max(e.stun, .8); } });
      shuffled(living()).slice(0,6).forEach(e=>{ const b=eBox(e); FX.push({type:'bolt', x:b.cx, y:b.cy, t:0, dur:.2}); });
    }]);
  }else if(job==='ryuukishi'){
    an.gx = clamp(center().x, 110, 176);
    an.ev.push([T+.75, ()=>{
      const x = an.gx;
      FX.push({type:'quake', x, y:GROUND+3, t:0, dur:.6}); FX.push({type:'ring', x, y:80, t:0, dur:.4, col:'#c8d8ff', big:true});
      dust(x, GROUND+3, 30, 2); shake(true); hitstop(.12); flash();
      living().forEach(e=>{ const d = Math.abs(eBox(e).cx-x); if(d > 80) return; hit(e, d<30 ? 4.0 : 2.6); if(ok(e)) launch(e, 42*rand(.9,1.1)*(e.boss?.6:1)); });
    }]);
  }else if(job==='shoukan'){
    an.ev.push([T+.2, ()=>{
      const ct = center();
      FX.push({type:'rays', x:ct.x, y:ct.y, t:0, dur:.6}); FX.push({type:'boom', x:ct.x, y:ct.y, r:90, t:0, dur:.55});
      flash(); shake(true); hitstop(.1); banner('竜王 あらわる！');
      living().forEach(e=>hit(e, 3.0, false, {mag:true}));
    }]);
    an.ev.push([T+.5, ()=>living().forEach(e=>hit(e, 1.0, true, {mag:true}))]);
  }else if(job==='jikuu'){
    an.ev.push([T+.1, ()=>{
      const ct = center();
      FX.push({type:'ring', x:ct.x, y:ct.y, t:0, dur:.6, col:'#ffe9a0', big:true}); FX.push({type:'frost', t:0, dur:.8});
      living().forEach(e=>{ hit(e, .8, false, {mag:true}); if(ok(e)){ e.stun = Math.max(e.stun, 3.5); e.t = Math.max(e.t, 3.5); } });
      for(let i=1;i<CH.length;i++){ S.cd[i] = 0; S.sp[i] = Math.min(100, S.sp[i]+30); }
      float('時よ 止まれ！','tag',ct.x,24);
    }]);
  }else if(job==='ginyuu'){
    an.ev.push([T+.1, ()=>{
      S.buffT = 8; heal(S.pmax*.2, a);
      for(let k=0;k<12;k++) PROJ.push({kind:'note', x:a.x+6, y:a.y-16, tx:rand(100,196), ty:rand(70,100), t:-k*.04, dur:.3, arc:24, onHit:()=>{}});
      later(.35, ()=>living().forEach(e=>hit(e, .8, true)));
    }]);
  }else if(job==='akindo'){
    const pow = 1 + .12*Math.floor(Math.log10(Math.max(1, P.gold)));
    for(let k=0;k<16;k++) an.ev.push([T+.1+k*.07, ()=>{
      const l = living(); if(!l.length) return; const e = pick(l), b = eBox(e);
      PROJ.push({kind:'coin', x:b.cx+rand(-10,10), y:-6, tx:b.cx, ty:b.cy, t:0, dur:.2, arc:0, onHit:()=>{ if(!ok(e)) return; hit(e, .6*pow, k>0); if(ok(e) && Math.random()<.3) steal(e, false); }});
    }]);
  }else if(job==='asobi'){
    const r = Math.floor(Math.random()*4);
    an.ev.push([T+.1, ()=>{
      const ct = center();
      if(r===0){ banner('メテオが ふってきた！'); FX.push({type:'boom', x:ct.x, y:ct.y, r:95, t:0, dur:.6}); flash(); shake(true); living().forEach(e=>hit(e, 4.0)); }
      if(r===1){ banner('みんな ねむってしまった'); living().forEach(e=>{ if(ok(e)){ e.sleep = CFG.sleepTime; e.stun = Math.max(e.stun, CFG.sleepTime); } }); }
      if(r===2){ banner('ちきゅうが ひっくりかえった！'); shake(true); living().forEach(e=>{ hit(e, 1.0); if(ok(e)) launch(e, 50*(e.boss?.6:1)); }); }
      if(r===3){ banner('ふしぎな ちからが みちてきた！'); heal(S.pmax, a); S.gauge = 100; for(let i=0;i<CH.length;i++) S.sp2[i] = 100; }
    }]);
  }else if(job==='kenja'){
    an.ev.push([T+.15, ()=>{
      const ct = center();
      FX.push({type:'rays', x:ct.x, y:ct.y, t:0, dur:.6}); FX.push({type:'boom', x:ct.x, y:ct.y, r:100, t:0, dur:.6}); FX.push({type:'holyBig', t:0, dur:.6});
      flash(); shake(true); hitstop(.12);
      living().forEach(e=>hit(e, 4.0, false, {mag:true})); heal(S.pmax*.5, a);
    }]);
  }else if(job==='mamono'){
    for(const d of [.1, .55]) an.ev.push([T+d, ()=>{ for(let i=1;i<CH.length;i++){ S.cd[i] = 0; attack(i, true); } }]);
    an.ev.push([T+.1, ()=>{ for(let i=1;i<CH.length;i++) S.sp[i] = Math.min(100, S.sp[i]+40); if(CH.length<2) living().forEach(e=>hit(e, 1.5)); }]);
  }else if(job==='ninja' || job==='touzoku2'){
    const vt = living().sort((p,q)=>p.x-q.x).slice(0, 20), seq = [...vt, ...[...vt].reverse()];
    an.vt = seq;
    seq.forEach((e,k)=>an.ev.push([T+k*.04, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); hit(e, 1.0, k%3!==0, {crit: Math.random()<.5}); }]));
    an.end = T + seq.length*.04 + .1;
  }else if(job==='odori'){
    for(let k=0;k<8;k++) an.ev.push([T+.1+k*.1, ()=>{ living().forEach(e=>{ const b=eBox(e); if(k%2===0) FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.12}); hit(e, .45, k>0); }); if(k===0) S.buffT = 6; }]);
  }else if(job==='samurai'){
    an.ev.push([T+.35, ()=>{
      FX.push({type:'slash', x1:60, y1:70, x2:200, y2:80, t:0, dur:.4}); flash(); shake(true); hitstop(.12);
      let n = 0;
      living().forEach(e=>{ if(!e.boss && Math.random()<.15){ n++; direct(e, e.hp); } else hit(e, 3.0); });
      if(n) float(n+'体 一刀両断！','tag',140,24);
    }]);
  }else if(job==='abyssk'){
    an.ev.push([T+.15, ()=>{
      const ct = center();
      FX.push({type:'cloud', x:ct.x, y:ct.y, r:90, t:0, dur:.8, dark:true}); FX.push({type:'rays', x:ct.x, y:ct.y, t:0, dur:.5});
      flash(); shake(true); hitstop(.12);
      living().forEach(e=>hit(e, 5.0)); payHp(.15);
    }]);
  }
}
// --- ポーズ（動き） ---
function heroPose2(a){
  const an=a.anim, c=a.c, t=an.t;
  switch(an.type){
    case 'mahouken': case 'abyssk': { const p = meleePose(a, t, an.tx-8, 97, {wind:.05, dash:.09, hold:.14, back:.18}); if(p && t>.14 && t<.28) p.rot = -.3*Math.sin(Math.PI*(t-.14)/.14); return p; }
    case 'ryuukishi': {
      const tx = an.jx-4, ty = an.jy;
      if(t < .07){ const p=t/.07; return {x:c.hx, y:c.hy, sqx:1+.2*p, sqy:1-.2*p}; }
      if(t < .30){ const p=(t-.07)/.23, top = Math.min(ty, c.hy)-34; return {x:lerp(c.hx,tx,p), y:p<.6 ? lerp(c.hy,top,easeOut(p/.6)) : lerp(top,ty,easeIn((p-.6)/.4)), sqx:.85, sqy:1.2, rot:p>.6?.6:0}; }
      if(t < .40) return {x:tx, y:ty, sqx:1.15, sqy:.85};
      if(t < .62){ const p=(t-.40)/.22; return {x:lerp(tx,c.hx,easeOut(p)), y:lerp(ty,c.hy,p)-18*Math.sin(Math.PI*p), sqx:1, sqy:1, flip:p<.8}; }
      return null;
    }
    case 'shoukan': case 'jikuu': case 'kenja': return castPose(c, t, 6, .3);
    case 'ginyuu': return t < .34 ? {x:c.hx, y:c.hy-2*Math.abs(Math.sin(t*20)), sqx:1, sqy:1+.06*Math.sin(t*30), rot:.15*Math.sin(t*20)} : null;
    case 'akindo': return t < .08 ? {x:c.hx-2, y:c.hy, sqx:.9, sqy:1.1} : t < .24 ? {x:c.hx+3, y:c.hy, sqx:1.1, sqy:.92, rot:.2} : null;
    case 'asobi':
      if(an.mood==='fall') return t < .45 ? {x:c.hx+6*Math.min(1,t/.15), y:c.hy, sqx:1, sqy:1, rot:Math.min(1.5, t*10)} : null;
      if(an.mood==='jump'){ const p = meleePose(a, t, frontX()-8, 97, {wind:.05, dash:.09, hold:.12, back:.18}); if(p && t<.3) p.y -= 14*Math.sin(Math.PI*Math.min(1,t/.3)); return p; }
      return meleePose(a, t, frontX()-8, 97, {wind:.04, dash:.08, hold:.14, back:.16});
    case 'mamono': { const p = meleePose(a, t, Math.max(c.hx+10, an.tx-30), 97, {wind:.06, dash:.08, hold:.2, back:.16}); if(p && t>.14 && t<.34) p.rot = .4*Math.sin((t-.14)*30); return p; }
    case 'ninja': return t < .06 ? {x:c.hx, y:c.hy, sqx:1.1, sqy:.9} : t < .22 ? {x:c.hx+2, y:c.hy-6*Math.sin(Math.PI*(t-.06)/.16), sqx:1, sqy:1, rot:(t-.06)*30} : null;
    case 'odori': { const p = meleePose(a, t, an.tx-8, 97, {wind:.03, dash:.08, hold:.18, back:.16}); if(p && t>.11 && t<.29){ p.flip = Math.floor(t*30)%2===0; p.y -= 3*Math.sin(t*40); } return p; }
    case 'spear': { const p = meleePose(a, t, an.tx-12, 97, {wind:.06, dash:.08, hold:.14, back:.18}); if(p && t>.14 && t<.28) p.sqx = 1.3; return p; }
    case 'samurai': {
      if(an.tgt && t>=.1 && t<.24){ return atEnemy(an.tgt, 12); }
      if(t < .1){ const p=t/.1; return {x:c.hx-2*p, y:c.hy, sqx:1+.15*p, sqy:1-.15*p}; }
      if(t < .44){ const p=(t-.24)/.2, b = an.tgt ? eBox(an.tgt) : {cx:c.hx}; return {x:lerp(b.cx+12, c.hx, easeOut(p)), y:c.hy-10*Math.sin(Math.PI*p), sqx:1, sqy:1, flip:p<.7}; }
      return null;
    }
  }
  return null;
}
function heroSpPose2(a){
  const an=a.anim, c=a.c, t=an.t, T=CFG.spCut, u=t-T;
  switch(an.type){
    case 'ryuukishi_sp':
      if(u < .25){ const p=easeOut(u/.25); return {x:lerp(c.hx,an.gx,p*.5), y:lerp(c.hy,-30,p), sqx:.8, sqy:1.25}; }
      if(u < .6) return {x:an.gx, y:-40, sqx:1, sqy:1};
      if(u < .75){ const p=easeIn((u-.6)/.15); return {x:an.gx, y:lerp(-40,GROUND+3,p), sqx:.8, sqy:1.3, rot:.6}; }
      if(u < .9){ const p=(u-.75)/.15; return {x:an.gx, y:GROUND+3, sqx:1+.3*Math.sin(Math.PI*p), sqy:1-.3*Math.sin(Math.PI*p)}; }
      if(u < 1.15){ const p=(u-.9)/.25; return {x:lerp(an.gx,c.hx,easeOut(p)), y:lerp(GROUND+3,c.hy,p)-20*Math.sin(Math.PI*p), sqx:1, sqy:1, flip:true}; }
      return null;
    case 'ninja_sp': {
      const vt = an.vt || [], k = Math.floor(u/.04);
      if(k < vt.length) return Object.assign(atEnemy(vt[k], k%2?7:-7), {flip:k%2===1});
      return u < an.end-T+.15 ? {x:c.hx, y:c.hy, sqx:1.1, sqy:.9} : null;
    }
    case 'odori_sp': return u < .95 ? {x:c.hx+6*Math.sin(u*8), y:c.hy-4*Math.abs(Math.sin(u*10)), sqx:1, sqy:1, flip:Math.floor(u*16)%2===0} : null;
    case 'samurai_sp':
      if(u < .3){ const p=u/.3; return {x:c.hx, y:c.hy, sqx:1+.15*p, sqy:1-.15*p}; }
      if(u < .38){ const p=easeOut((u-.3)/.08); return {x:lerp(c.hx,190,p), y:c.hy-2, sqx:1.3, sqy:.8}; }
      if(u < .8) return {x:190, y:c.hy, sqx:1, sqy:1, flip:true};
      if(u < 1.0){ const p=(u-.8)/.2; return {x:lerp(190,c.hx,p), y:c.hy-14*Math.sin(Math.PI*p), sqx:1, sqy:1, flip:true}; }
      return null;
    case 'mahouken_sp': case 'abyssk_sp':
      if(u < .15){ const p=easeOut(u/.15); return {x:lerp(c.hx,an.tx-10,p), y:lerp(c.hy,50,p), sqx:.85, sqy:1.2}; }
      if(u < .3){ const p=(u-.15)/.15; return {x:an.tx-10+20*p, y:lerp(50,GROUND+4,easeIn(p)), sqx:1.2, sqy:.85, rot:.5}; }
      if(u < .6){ const p=(u-.3)/.3; return {x:lerp(an.tx+10,c.hx,easeOut(p)), y:lerp(GROUND+4,c.hy,p)-16*Math.sin(Math.PI*p), sqx:1, sqy:1, flip:true}; }
      return null;
    case 'mamono_sp': return u < .8 ? {x:c.hx+3*Math.sin(u*30), y:c.hy, sqx:1, sqy:1, rot:.3*Math.sin(u*25)} : null;
    case 'akindo_sp': return u < 1.25 ? {x:c.hx, y:c.hy-4-2*Math.sin(u*10), sqx:1, sqy:1.05} : null;
    default: return u < .7 ? {x:c.hx, y:c.hy-6, sqx:1, sqy:1.1} : null;
  }
}
// --- 召喚・メテオ（アビリティで 一定時間ごとに 発動） ---
const SUMMONS = {
  sumFire:   {n:'炎の精',   iv:20, go:()=>{ FX.push({type:'boom', x:center().x, y:center().y, r:80, t:0, dur:.5}); living().forEach(e=>{ addHit(e, 0, 1.5, true, true, {mag:true}); if(!e.dead) e.burn = 3; }); }},
  sumIce:    {n:'氷の女王', iv:25, go:()=>{ FX.push({type:'frost', t:0, dur:.8}); living().forEach(e=>{ addHit(e, 0, 1.5, true, true, {mag:true}); if(!e.dead){ e.stun = Math.max(e.stun, 1.5); e.t += 1.5; } }); }},
  sumThunder:{n:'雷神',     iv:25, go:()=>{ for(let k=0;k<8;k++) later(k*.1, ()=>{ const l=living(); if(!l.length) return; const e=pick(l), b=eBox(e); FX.push({type:'bolt', x:b.cx, y:b.cy, t:0, dur:.2}); near(b.cx, b.cy, 24).forEach(x=>addHit(x, 0, 1.2, true, true, {mag:true})); }); }},
  sumHeal:   {n:'宝石獣',   iv:30, go:()=>{ heal(S.pmax*.3, ACT[0]); }},
  sumBaha:   {n:'竜王',     iv:40, go:()=>{ const ct=center(); FX.push({type:'rays', x:ct.x, y:ct.y, t:0, dur:.6}); FX.push({type:'boom', x:ct.x, y:ct.y, r:100, t:0, dur:.6}); flash(); shake(true); living().forEach(e=>addHit(e, 0, 6, true, true, {mag:true})); }},
  meteor:    {n:'メテオ',   iv:30, go:()=>{ for(let k=0;k<5;k++) later(k*.15, ()=>{ const l=living(); if(!l.length) return; const e=pick(l), b=eBox(e), tx=b.cx, ty=e.y-6;
               PROJ.push({kind:'meteor', x:tx+60, y:-16, tx, ty, t:0, dur:.22, arc:0, onHit:()=>{ FX.push({type:'boom', x:tx, y:ty, r:32, t:0, dur:.4}); near(tx, ty, 32).forEach(x=>addHit(x, 0, 2.5, true, true, {mag:true})); }}); }); }},
};
function summonTick(dt){
  if(!HS) return;
  S.sumT = S.sumT || {};
  const f = HS.pw.sumFast ? .7 : 1;
  for(const k in SUMMONS){
    if(!HS.pw[k]) continue;
    if(S.sumT[k] == null) S.sumT[k] = SUMMONS[k].iv*f*.5;
    S.sumT[k] -= dt;
    if(S.sumT[k] <= 0 && living().length){ S.sumT[k] = SUMMONS[k].iv*f; banner(SUMMONS[k].n+'！'); SUMMONS[k].go(); }
  }
}

// 槍の 通常攻撃: 一直線に 並んだ 敵を まとめて 貫く
function spearAttack(an, manual, hit, ok){
  const l = living().filter(low), f = [...l].sort((p,q)=>eBox(p).front-eBox(q).front)[0];
  an.tx = f ? eBox(f).front : frontX(); const lane = f ? f.y : 100;
  an.ev.push([.14, ()=>{
    FX.push({type:'wave', x:an.tx-6, w:Math.max(40, 196-an.tx), t:0, dur:.18});
    living().filter(e=>low(e) && Math.abs(e.y-lane) < 8).sort((p,q)=>p.x-q.x).forEach((e,k)=>later(k*.025, ()=>{
      if(!ok(e)) return; const b=eBox(e); sparks(b.cx, b.cy, 2, ['#ffffff','#c8d8ff']); hit(e, 1.15, k>0);
      if(ok(e) && manual && k===0) launch(e, 26*(e.boss?.6:1)); }));
  }]);
}
