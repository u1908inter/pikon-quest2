// ===== 通常攻撃（0 は ゆうしゃ：ジョブで 攻撃方法が 変わる） =====
const effCd = i => i===0 ? CH[0].cd/(1+HS.aspd/100)/(S.dsoulT>0?1.5:1) : CH[i].cd/(1+(HS.pw.allyAspd||0)/100);
// assist: 仲間オート。手動と 同じ 効果（打ち上げ・ゲージ）だが 威力 85%・ゲージ 70%・連携には 数えない
function attack(i, manual, assist){
  const asst = !!assist; if(asst) manual = true;
  if(i>=CH.length) return false;
  if(mode!=='battle'||S.wait||S.time<S.lock||!living().length) return false;
  if(S.cd[i]>0) return false;
  const c=CH[i], a=ACT[i];
  const gk = asst && !S.solo ? .7 : 1;
  if(manual) S.sp[i] = Math.min(100, S.sp[i]+gk*CFG.spPerPress*(1+(i===0?HS.spg:(HS.pw.allySpg||0))/100));
  if(manual && i>0) S.sp2[i] = Math.min(100, S.sp2[i]+gk*CFG.spPerPress*CFG.sp2Rate*(1+(HS.pw.allySpg||0)/100));
  S.cdMax[i] = effCd(i)*(manual||(i===0&&HS.pw.danceCd)?1:CFG.autoSlow); S.cd[i]=S.cdMax[i];
  if(i===0 && S.ssNext){ S.ssNext = false; S.ssMulT = S.time + .6; }
  S.aw[i] = CFG.autoDelay[0]+Math.random()*(CFG.autoDelay[1]-CFG.autoDelay[0]);
  if(manual && !asst){
    if(S.last===c.id) S.chain=1; else S.chain++;
    S.last=c.id; S.hist.push(c.id); if(S.hist.length>8) S.hist.shift();
    S.used.add(c.id);
  }
  const ok = e => !e.dead && S.es.includes(e);
  const hit = (e, m, q, o) => ok(e) ? addHit(e, i, m*(asst && !S.solo?.85:1)*(i===0 ? 1+(HS.pw.wAtk||0)/100 : 1), manual, q, o) : 0;
  const an = {type:c.id, t:0, ev:[], done:{}, tx:frontX(), cx:center().x};
  if(i===0){ heroAttack(an, manual, hit, ok); artProc(manual, false); }
  else if(FAMACT[c.id]){ an.famPose=true; FAMACT[c.id].atk({i, c, a, an, manual, hit, ok}); }
  else if(c.id==='wolf'){
    const far = 196;
    an.type='wolf';
    living().forEach(e=>{
      const p1 = clamp((e.x-c.hx)/(far-c.hx),0,1), p2 = clamp((far-e.x)/(far-c.hx),0,1);
      an.ev.push([.05+.26*p1, ()=>{ if(!ok(e) || !low(e)) return; const b=eBox(e); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.12}); hit(e,.6); }]);
      an.ev.push([.34+.26*p2, ()=>{ if(!ok(e) || !low(e)) return; const b=eBox(e); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.12}); hit(e,.6); }]);
    });
  }else if(c.id==='mush'){
    an.ev.push([.09, ()=>{
      const ct = center();
      PROJ.push({kind:'spore', x:a.x+8, y:a.y-14, tx:ct.x, ty:ct.y, t:0, dur:.24, arc:22, onHit:()=>{
        if(S.wait) return;
        FX.push({type:'cloud', x:ct.x, y:ct.y, r:CFG.sporeRadius, t:0, dur:.45});
        for(let k=0;k<26;k++){ const ang=Math.random()*Math.PI*2, r=Math.random()*CFG.sporeRadius;
          PARTS.push({x:ct.x+Math.cos(ang)*r*.4,y:ct.y+Math.sin(ang)*r*.3,vx:Math.cos(ang)*r*2.2,vy:Math.sin(ang)*r*1.4,life:.4+Math.random()*.25,max:.65,col:k%3?'#c8f070':'#f6f4ee',sz:2,g:0}); }
        living().forEach(e=>{ const b=eBox(e); const dx=b.cx-ct.x, dy=(b.cy-ct.y)*1.4;
          if(dx*dx+dy*dy > CFG.sporeRadius*CFG.sporeRadius) return;
          if(e.air>0){ hit(e,.8); later(.07,()=>hit(e,.8,true)); later(.14,()=>hit(e,.8,true)); }
          else hit(e,1.0);
        });
      }});
    }]);
  }else if(c.id==='golem'){
    an.gx = clamp(center().x-10, 100, 170);
    an.ev.push([.34, ()=>{
      const gx = an.gx;
      const airN = living().filter(e=>e.air>0).length;
      FX.push({type:'quake', x:gx, y:GROUND+3, t:0, dur:.55});
      dust(gx, GROUND+3, 14, 1.4);
      shake(airN>=2); hitstop(airN>=2?.08:.04);
      living().forEach(e=>{ const d=Math.abs(e.x-gx)/CFG.quakeSpeed;
        later(d, ()=>{
          if(!ok(e)) return;
          if(e.air>0){ hit(e, 3.2); if(ok(e)){ e.vly=-460-rand(0,80); e.stun=1.6; e.slamFx=true; e.bn=0; e.rot=0; } }
          else { hit(e, 1.0); if(ok(e) && e.ly<=0){ e.vly=110+rand(0,40); e.bn=1; } }
        });
      });
      if(airN>=2 && manual) float(airN+'体 たたきつけ！','tag',gx,26);
    }]);
  }
  a.anim = an;
  if(manual && !asst) checkRecipes();
  return true;
}

function heroAttack(an, manual, hit, ok){
  const job = atkId(); an.type = job;   // 通常攻撃は 武器で きまる（ジョブの 専用攻撃も ある）
  if(job==='spear') return spearAttack(an, manual, hit, ok);
  if(JOBS2[job]) return heroAttack2(job, an, manual, hit, ok);
  return heroAttack1(job, an, manual, hit, ok);
}
function heroAttack1(job, an, manual, hit, ok){
  const a = ACT[0];
  if(job==='senshi'){
    an.ev.push([.16, ()=>{
      const fx = frontX(), reach = CFG.heroReach*(HS.pw.reach||1);
      const tg = living().filter(e=>eBox(e).front <= fx + reach && low(e));
      FX.push({type:'wave', x:fx-4, w:reach+6, t:0, dur:.2});
      tg.forEach(e=>{ const d=(eBox(e).cx-fx)/380;
        later(d, ()=>{ if(!ok(e)) return; hit(e, 1.0);
          if(ok(e) && manual) launch(e, CFG.launchH*(HS.pw.launchUp||1)*rand(.8,1.15)*(e.boss?.6:1));
          if(HS.pw.swordDance) later(.08, ()=>hit(e, .6, true)); }); });
      if(tg.length>=2 && manual) later(.05, ()=>float(tg.length+'体 うちあげ！','tag',fx+20,26));
    }]);
  }else if(job==='budou'){
    const nT = 3 + (HS.pw.fistTargets||0);
    const tg = living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0, nT);
    an.tg = tg; an.tx = tg.length ? eBox(tg[0]).front : frontX();
    [.10,.16,.22].forEach((tm,k)=>an.ev.push([tm, ()=>{
      tg.forEach(e=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'punch', x:b.cx-3, y:b.cy+rand(-3,3), t:0, dur:.1}); hit(e, .55, k>0);
        if(k===2 && ok(e) && manual) launch(e, (HS.pw.shoryu?40:30)*(e.boss?.6:1)); });
    }]));
  }else if(job==='mahou'){
    const cast = (delay) => an.ev.push([delay, ()=>{
      const ct = center(), r = 40*(HS.pw.flare||1);
      PROJ.push({kind:'fire', x:a.x+8, y:a.y-16, tx:ct.x, ty:ct.y, t:0, dur:.22, arc:8, onHit:()=>{
        if(S.wait) return;
        FX.push({type:'boom', x:ct.x, y:ct.y, r, t:0, dur:.35});
        sparks(ct.x, ct.y, 14, ['#ff8e3c','#ffe14a','#ffffff'], 90);
        let n=0;
        living().forEach(e=>{ const b=eBox(e), dx=b.cx-ct.x, dy=(b.cy-ct.y)*1.3; if(dx*dx+dy*dy > r*r) return;
          n++; hit(e, 1.5, false, {mag:true}); if(!ok(e)) return;
          if(e.air>0){ if(HS.pw.blast) e.vly = Math.max(e.vly, 150); }
          else if(manual) launch(e, 26*(e.boss?.6:1)); });
        if(n>=4) shake();
      }});
    }]);
    cast(.1);
    if(HS.pw.dualcast && Math.random()*100 < HS.pw.dualcast) cast(.38);
  }else if(job==='touzoku'){
    const l = living();
    const tg = [...l].sort(()=>Math.random()-.5).slice(0, 3);
    an.tg = tg;
    tg.forEach((e,k)=>{
      const t0 = .06 + k*.09;
      const strike = () => { if(!ok(e)) return; const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); hit(e, 1.0, false, {crit: e.air>0}); if(manual && ok(e)) e.t += .6; };
      an.ev.push([t0, strike]);
      if(HS.pw.double) an.ev.push([t0+.04, strike]);
    });
  }else if(job==='souryo'){
    an.ev.push([.12, ()=>{
      const xs = [frontX()+14]; if(HS.pw.twin) xs.push(center().x+12);
      xs.forEach(x=>{
        FX.push({type:'holy', x, w:14, t:0, dur:.35});
        living().forEach(e=>{ if(Math.abs(eBox(e).cx-x) < 16){ hit(e, 1.1, false, {airX: 2/1.5}); if(ok(e) && manual){ if(e.air>0) e.vly = Math.max(e.vly, 140); else launch(e, 34*(e.boss?.6:1)); } } });
      });
      heal(S.pmax*(3+(HS.pw.healPlus||0))/100, a);
    }]);
  }else if(job==='kariudo'){
    an.ev.push([.1, ()=>{
      const n = 5 + (HS.pw.arrows||0), l = living();
      const air = l.filter(e=>e.air>0).sort((p,q)=>q.ly-p.ly), ground = l.filter(e=>!(e.air>0)).sort(()=>Math.random()-.5);
      const tg = [...air, ...ground].slice(0, n);
      tg.forEach((e,k)=>{ const b=eBox(e);
        PROJ.push({kind:'arrow', x:a.x+8, y:a.y-14, tgt:e, t:-k*.03, dur:.12+Math.abs(b.cx-a.x)/900, arc:0, onHit:()=>{
          if(!ok(e)) return; hit(e, .8, false, {airX: e.air>0 ? 1.6 : 1}); if(!ok(e)) return; if(e.air>0 && HS.pw.pin) e.pin = 1.0; if(manual) e.t += .5; }});
      });
    }]);
  }
}
function heal(v, a){
  if(v<1) return;
  S.php = Math.min(S.pmax, S.php+v);
  if(a) float('+'+fmt(v), 'heal', a.x, a.y-30);
}

// ===== 必殺技 =====
function trySpecial(i){
  if(i>=CH.length||mode!=='battle'||S.wait||S.time<S.lock||!living().length||S.sp[i]<100) return false;
  return special(i);
}
function special(i){
  const c=CH[i], a=ACT[i], T=CFG.spCut;
  S.sp[i]=0;
  S.cdMax[i]=effCd(i)*1.5; S.cd[i]=S.cdMax[i];
  const sid = i===0 ? 'hero_sp' : c.id;   // ゆうしゃの 職業技は 通常攻撃と べつ扱い（連携に なる）
  if(S.last===sid) S.chain=1; else S.chain++;
  S.last=sid; S.hist.push(c.id); if(S.hist.length>8) S.hist.shift(); S.used.add(c.id);
  S.lock=S.time+T; S.freeze=S.time+T;
  S.cut={t:0, dur:T, solo:c.spr};
  banner(c.sp+'！');
  S.gauge=Math.min(100, S.gauge+10);
  const ok=e=>!e.dead&&S.es.includes(e);
  const hit=(e,m,q,o={})=>{ if(ok(e)) addHit(e,i,m,true,q,Object.assign({sp:true},o)); };
  const an={type:c.id+'_sp', t:0, ev:[], done:{}, tx:frontX(), cx:center().x};
  if(i===0){
    heroSpecial(an, hit, ok, T);
    if(HS.pw.spellStrike) S.ssNext = true;
    if(HS.pw.gravity) an.ev.push([T+.8, ()=>living().filter(e=>e.boss).forEach(e=>{ direct(e, Math.max(1, Math.round(e.hp*.05))); const b=eBox(e); float('グラビデ','tag',b.cx,b.top-8); })]);
    if(HS.pw.cloneTwice && Math.random()*100 < HS.pw.cloneTwice) an.ev.push([T+1.1, ()=>{ banner('分身！'); living().forEach(e=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); hit(e, 1.2, true); }); }]);
  }
  else if(FAMACT[c.id]){ an.famPose=true; an.t0=T; FAMACT[c.id].sp({i, c, a, an, manual:true, hit, ok}, T); }
  else if(c.id==='wolf'){
    an.ev.push([.05, ()=>{ FX.push({type:'ring', x:a.x+6, y:a.y-10, t:0, dur:.4, col:'#c8b0ff'}); FX.push({type:'ring', x:a.x+6, y:a.y-10, t:-.12, dur:.5, col:'#ffffff'}); }]);
    an.ev.push([T, ()=>{ living().forEach(e=>{ e.stun=Math.max(e.stun,1.2); }); }]);
    const far=196;
    living().forEach(e=>{
      const p1 = clamp((e.x-c.hx)/(far-c.hx),0,1), p2 = clamp((far-e.x)/(far-c.hx),0,1);
      for(let k=0;k<4;k++){
        const q = k>0;
        an.ev.push([T+k*.07+.26*p1, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.12}); hit(e,.5,q); }]);
        an.ev.push([T+k*.07+.29+.26*p2, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.12}); hit(e,.5,q); }]);
      }
    });
  }else if(c.id==='mush'){
    an.ev.push([T, ()=>{
      const ct=center();
      FX.push({type:'cloud', x:ct.x, y:ct.y, r:78, t:0, dur:1.5});
      FX.push({type:'cloud', x:ct.x-20, y:ct.y+8, r:50, t:0, dur:1.2});
      for(let k=0;k<70;k++){ const ang=Math.random()*Math.PI*2, r=Math.random()*80;
        PARTS.push({x:a.x+8,y:a.y-14,vx:(ct.x+Math.cos(ang)*r-(a.x+8))*2.2,vy:(ct.y+Math.sin(ang)*r*.5-(a.y-14))*2.2,life:.6+Math.random()*.6,max:1.2,col:k%3?'#c8f070':(k%2?'#f6f4ee':'#e8a0e0'),sz:2,g:0}); }
      living().forEach(e=>{ hit(e,1.0); if(ok(e)){ e.sleep=CFG.sleepTime; e.stun=Math.max(e.stun,CFG.sleepTime); } });
      const n=living().length; if(n>=2) float(n+'体 ねむらせた！','tag',ct.x,22);
      for(let k=1;k<=4;k++) later(k*.4, ()=>living().forEach(e=>{ if(e.sleep>0){ hit(e,.5); } }));
    }]);
  }else if(c.id==='golem'){
    an.gx = clamp(center().x-6, 100, 172);
    an.ev.push([T+.56, ()=>{
      const gx=an.gx;
      FX.push({type:'quake', x:gx, y:GROUND+3, t:0, dur:.7});
      FX.push({type:'quake', x:gx, y:GROUND+3, t:-.12, dur:.8});
      dust(gx, GROUND+3, 34, 2.2); sparks(gx, GROUND, 16, ['#ffe14a','#ffffff','#b79c62'], 140);
      shake(true); hitstop(.13); flash();
      let up=0, down=0;
      living().forEach(e=>{ later(Math.abs(e.x-gx)/(CFG.quakeSpeed*1.4), ()=>{
        if(!ok(e)) return;
        if(e.air>0){ down++; hit(e,3.0); if(ok(e)){ e.vly=-520; e.stun=1.6; e.slamFx=true; e.bn=0; } }
        else { up++; hit(e,2.0); if(ok(e)) launch(e, 40*rand(.9,1.15)*(e.boss?.6:1)); }
      }); });
      later(.3, ()=>{ if(up>=2) float(up+'体 打ち上げ！','tag',gx-20,22); if(down>=2) float(down+'体 たたきつけ！','tag',gx+20,32); });
    }]);
  }
  if(i===0 && HS.pw.spBolt) an.ev.push([T+.7, ()=>living().forEach(e=>{ const b=eBox(e); FX.push({type:'bolt', x:b.cx, y:b.cy, t:0, dur:.2}); hit(e,.6,true); })]);
  a.anim = an;
  checkRecipes();
  return true;
}
function heroSpecial(an, hit, ok, T){
  const job = P.job==='suppin' ? 'senshi' : P.job; an.type = job+'_sp';
  if(JOBS2[job]) return heroSpecial2(job, an, hit, ok, T);
  return heroSpecial1(job, an, hit, ok, T);
}
function heroSpecial1(job, an, hit, ok, T){
  const a = ACT[0];
  if(job==='senshi'){
    an.ev.push([T+.12, ()=>{
      const fx=frontX();
      FX.push({type:'pillar', x:fx-6, w:Math.max(40, 196-fx), t:0, dur:.35});
      shake();
      living().forEach(e=>{ later((eBox(e).cx-fx)/520, ()=>{ if(!ok(e)) return; hit(e,1.2); if(ok(e)) launch(e, 48*rand(.9,1.1)*(e.boss?.6:1)); }); });
    }]);
    an.ev.push([T+.50, ()=>{
      FX.push({type:'slash', x1:an.tx-14, y1:14, x2:Math.min(196,an.cx+34), y2:GROUND+4, t:0, dur:.3});
      hitstop(.09); shake(true); flash();
      const n = living().filter(e=>e.air>0).length;
      living().forEach(e=>hit(e, e.air>0?2.6/1.5:1.2));
      if(n>=2) float(n+'体 くうちゅう斬り！','tag',an.cx,22);
    }]);
  }else if(job==='budou'){
    for(let k=0;k<16;k++) an.ev.push([T+.1+k*.05, ()=>{
      const fx=frontX();
      living().filter(e=>eBox(e).front <= fx+50).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,3).forEach((e,j)=>{
        const b=eBox(e); FX.push({type:'punch', x:b.cx-3+rand(-3,3), y:b.cy+rand(-5,5), t:0, dur:.1}); hit(e, .35, j>0 || k%2===1); });
      if(k%4===0) shake();
    }]);
    an.ev.push([T+.98, ()=>{
      const fx=frontX(), tg=living().filter(e=>eBox(e).front <= fx+60);
      FX.push({type:'wave', x:fx-4, w:60, t:0, dur:.25});
      hitstop(.09); shake(true);
      tg.forEach(e=>{ hit(e, 2.0); if(ok(e)) launch(e, 46*(e.boss?.6:1)); });
      if(tg.length>=2) float(tg.length+'体 昇竜拳！','tag',fx+20,22);
    }]);
  }else if(job==='mahou'){
    for(let k=0;k<7;k++) an.ev.push([T+.1+k*.12, ()=>{
      const l=living(); if(!l.length) return;
      const e0 = pick(l), b0=eBox(e0), tx=b0.cx+rand(-6,6), ty=e0.y-6;
      PROJ.push({kind:'meteor', x:tx+60, y:-16, tx, ty, t:0, dur:.22, arc:0, onHit:()=>{
        if(S.wait) return;
        FX.push({type:'boom', x:tx, y:ty, r:30, t:0, dur:.4}); dust(tx, ty+6, 10, 1.4);
        sparks(tx, ty, 16, ['#ff6a2a','#ffe14a','#ffffff'], 120); shake(k>=5); hitstop(.03);
        living().forEach(e=>{ const b=eBox(e), dx=b.cx-tx, dy=(b.cy-ty)*1.3; if(dx*dx+dy*dy > 30*30) return;
          hit(e, 2.0, false, {mag:true}); if(!ok(e)) return;
          if(e.air>0) e.vly=Math.max(e.vly,150); else launch(e, 30*(e.boss?.6:1)); if(HS.pw.magBurn) e.burn=3; });
      }});
    }]);
  }else if(job==='touzoku'){
    const vt = living().sort((p,q)=>p.x-q.x).slice(0, 24);
    an.vt = vt;
    vt.forEach((e,k)=>an.ev.push([T+k*.045, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.16}); hit(e, 1.5, k%3!==0, {crit:true}); if(ok(e)||true) steal(e, true); }]));
    an.end = T + vt.length*.045 + .1;
  }else if(job==='souryo'){
    an.ev.push([T+.05, ()=>{
      FX.push({type:'holyBig', t:0, dur:.7}); flash(); hitstop(.08);
      living().forEach(e=>{ hit(e, 2.0, false, {airX: 2/1.5}); if(ok(e)) e.stun=Math.max(e.stun,1.0); });
      heal(S.pmax*.4, a);
    }]);
  }else if(job==='kariudo'){
    FX.push({type:'rain', t:-T-.2, dur:1.4});
    for(let k=0;k<14;k++) an.ev.push([T+.25+k*.1, ()=>{
      living().forEach(e=>{ hit(e, .45, k>0, {airX: e.air>0?1.6:1}); if(ok(e) && e.air>0){ e.pin = .5; e.vly = Math.max(e.vly, 20); } });
    }]);
  }
}
function checkRecipes(){ comboCheck(); }   // かくし連携（combos.js）

// ===== 敵の 攻撃・ウェーブの 流れ =====
function enemyAttack(e){
  e.t = rand(...CFG.enemyInterval)*(e.boss?.7:1)*(HS.pw.trap||1)*(hasT('swift')?.65:1); e.lunge=0;
  if(e.dark && maouAttack(e)) return;
  later(.1, ()=>{
    if(e.dead||S.wait) return;
    const a = ACT[Math.floor(Math.random()*ACT.length)];
    if(HS.pw.evade && Math.random()*100 < Math.min(CFG.evadeCap, HS.pw.evade)){   // 回避は 上限あり（無敵に ならない）
      float('MISS','miss',a.x,a.y-28);
      if(HS.pw.evadeCounter) later(.1, ()=>{ if(!e.dead) addHit(e, 0, 1.0, true, false); });
      return;
    }
    const def = HS.def * (HS.pw.fukutsu && S.php < S.pmax*.5 ? 2 : 1);
    const K = defK(S.L), dmg = Math.max(1, Math.round(e.atk * K/(K+def) * (1-Math.min(CFG.cutCap, HS.pw.cut||0)/100) * (hasT('curse')?1.1:1) * ((S.maouGuard||0) > S.time ? .5 : 1) * ((S.guardT||0) > S.time ? .4 : 1)));
    S.php -= (P.debug && P.opt.dbgGod && debugOn()) ? 0 : dmg;   // デバッグ: ダメージを 受けない
    if(HS.pw.reflect && !e.dead) direct(e, Math.round(dmg*HS.pw.reflect/100*20));
    a.flash=.1; a.kx=-4;
    float('-'+fmt(dmg),'pdmg',a.x,a.y-28);
    if(e.boss) shake();
    sparks(a.x+4, a.y-12, 4, ['#ff8a7a','#ffffff']);
    if(S.php<=0){
      if(HS.pw.endure && !S.endured){ S.endured=true; S.php=1; banner('ふんばった！'); }
      else ko();
    }
  });
}
function waveClear(){
  S.wait=true; S.queue=[];
  const n = S.kc;
  later(.25, ()=>banner(n>=3 ? n+'体 まとめて撃破！' : (S.waveIdx>WAVES?'ボス撃破！':'撃破！')));
  S.kc=0; S.kcT=0;
  if(S.tower) return towerClear();
  if(S.waveIdx <= WAVES){
    const r = .1*(HS.pw.regen2?2:1)*(1+.1*facLv('inn')) + (HS.pw.prayer?.2:0) + (HS.pw.healWave||0)/100;
    S.php = Math.min(S.pmax, S.php + S.pmax*r);
    save();
    setTimeout(()=>{ if(mode!=='battle') return; endCombo(); spawnWave(); }, 1300/battleSpd());
  }else stageClear();
}
function stageClear(){
  const maouLast = cb => !S.maouDown ? cb() : S.maouJoined ? maouSay(['……ふ、ふふ。おもしろい。', 'その ひらめきの 光、わが目で 見とどけて やろう。', '（魔王が 仲間に くわわった！）'], cb, 'b_maou') : maouSay(['ばかな……', 'ちいさき ひらめきが……闇を……つらぬく とは……'], cb, 'b_maou2');
  if(S.dbgBoss){ save(); setTimeout(()=>maouLast(()=>{ flash(); playEnding(()=>showResult('clear')); }), 1800); return; }   // デバッグの 魔王戦: 記録は のこさず エンディングだけ
  const firstEnd = S.st===5 && S.rd===TOWER_RD && (P.clear[5]||0) < TOWER_RD && !S.tower;   // はじめて 魔王を たおした
  P.clear[S.st] = Math.max(P.clear[S.st]||0, S.rd);
  if(S.rd===1) track('s'+S.st, STAGES[S.st].n+' 1周目 クリア'); if(S.st===5 && S.rd<=20) track('r'+S.rd, S.rd+'周目 魔界 クリア');
  P.stats.clears++;
  const chest = 1 + (HS.pw.chest||0);
  for(let k=0;k<chest;k++){ const it=genItem(S.L, true, true); R.items.push({it, r:addInv(it), chest:true}); }
  save();
  if(firstEnd){ P.seen.ending = 1; track('ending', '魔王 撃破（エンディング）'); save(); setTimeout(()=>maouLast(()=>{ flash(); playEnding(()=>showResult('clear')); }), 1800); return; }
  setTimeout(()=>maouLast(()=>showResult('clear')), S.maouDown ? 1800 : 1500);
}
function ko(){
  if(HS.pw.raise && !S.raised){ S.raised=true; S.php=Math.round(S.pmax*.5); banner('レイズ！'); flash(); return; }
  S.wait=true; S.queue=[]; endCombo(); S.gauge=0;
  banner('ぜんめつ…');
  ACT.forEach(a=>{ a.anim=null; a.flash=.3; });
  save();
  setTimeout(()=>showResult('dead'), 1300);
}
