// ===== モーション =====
function meleePose(a, t, tx, ty, tw){
  const {wind, dash, hold, back} = tw, c=a.c;
  if(t < wind){ const p=t/wind; return {x:c.hx-3*p, y:c.hy, sqx:1+.15*p, sqy:1-.15*p}; }
  t -= wind;
  if(t < dash){ const p=easeOut(t/dash); return {x:lerp(c.hx-3,tx,p), y:lerp(c.hy,ty,p)-4*Math.sin(Math.PI*p), sqx:1.2, sqy:.85}; }
  t -= dash;
  if(t < hold){ const p=t/hold; return {x:tx+2*Math.sin(Math.PI*p), y:ty, sqx:1-.1*Math.sin(Math.PI*p), sqy:1+.12*Math.sin(Math.PI*p)}; }
  t -= hold;
  if(t < back){ const p=t/back; return {x:lerp(tx,c.hx,easeOut(p)), y:lerp(ty,c.hy,p)-10*Math.sin(Math.PI*p), sqx:1, sqy:1}; }
  return null;
}
function wolfRun(tl, c){
  const far=196;
  if(tl < 0) return null;
  if(tl < .26){ const p=tl/.26; return {x:lerp(c.hx,far,p), y:lerp(c.hy,99,Math.min(1,p*3)) - 3*Math.abs(Math.sin(p*Math.PI*7)), sqx:1.2, sqy:.9}; }
  if(tl < .29){ return {x:far, y:99, sqx:.85, sqy:1.15, flip:true}; }
  if(tl < .55){ const p=(tl-.29)/.26; return {x:lerp(far,c.hx,p), y:lerp(99,c.hy,p)-36*Math.sin(Math.PI*p), sqx:1, sqy:1, flip:true, rot:-.3+.6*p}; }
  if(tl < .61){ const p=(tl-.55)/.06; return {x:c.hx, y:c.hy, sqx:1+.2*Math.sin(Math.PI*p), sqy:1-.2*Math.sin(Math.PI*p)}; }
  return null;
}
const castPose = (c, t, up, dur) => t < dur ? {x:c.hx, y:c.hy - up*Math.sin(Math.PI*Math.min(1,t/dur)), sqx:1-.1*Math.sin(Math.PI*t/dur), sqy:1+.15*Math.sin(Math.PI*t/dur)} : null;
// 敵の 位置に 立つ（空中の敵なら ゆうしゃも 空中へ）
const atEnemy = (e, dx=-7) => { const b=eBox(e); return {x:b.cx+dx, y:b.fy+1, sqx:1, sqy:1}; };
function poseOf(a){
  const an=a.anim, c=a.c, t=an.t;
  if(an.famPose) return famPose(a);
  if(an.type.endsWith('_sp2')) return sp2Pose(a);
  if(an.type.endsWith('_sp')) return spPose(a);
  switch(an.type){
    case 'senshi': { const p = meleePose(a, t, an.tx-8, 97, {wind:.06, dash:.10, hold:.16, back:.18}); if(p && t>.16 && t<.32) p.y -= 12*Math.sin(Math.PI*(t-.16)/.16); return p; }
    case 'budou': { const p = meleePose(a, t, an.tx-6, 97, {wind:.03, dash:.07, hold:.20, back:.14}); if(p && t>.1 && t<.3){ p.x += Math.sin(t*90)*1.5; if(t>.21) p.y -= 8*Math.sin(Math.PI*(t-.21)/.09); } return p; }
    case 'mahou': return castPose(c, t, 6, .3);
    case 'souryo': return castPose(c, t, 4, .34);
    case 'kariudo': return t < .08 ? {x:c.hx-2*t/.08, y:c.hy, sqx:.9, sqy:1.08} : t < .26 ? {x:c.hx-2+((t-.08)/.18)*2, y:c.hy, sqx:1.05, sqy:.97} : null;
    case 'touzoku': {
      const tg = an.tg || [];
      if(t < .04) return {x:c.hx, y:c.hy, sqx:1.15, sqy:.85};
      for(let k=0;k<tg.length;k++){ if(t < .06+k*.09+.07) return atEnemy(tg[k]); }
      const t0 = .06+tg.length*.09; if(t < t0+.12){ const p=(t-t0)/.12; return {x:c.hx, y:c.hy-6*Math.sin(Math.PI*p), sqx:1, sqy:1, flip:p<.5}; }
      return null;
    }
    case 'wolf': {
      if(t < .05){ const p=t/.05; return {x:c.hx-3*p, y:c.hy, sqx:1.15, sqy:.85}; }
      return wolfRun(t-.05, c);
    }
    case 'mush': return castPose(c, t, 7, .26);
    case 'golem': {
      const gx = an.gx;
      if(t < .1){ const p=t/.1; return {x:c.hx, y:c.hy, sqx:1+.2*p, sqy:1-.2*p}; }
      if(t < .34){ const p=(t-.1)/.24; return {x:lerp(c.hx,gx,easeOut(p)), y:lerp(c.hy,GROUND+3,p)-40*Math.sin(Math.PI*p), sqx:.9, sqy:1.15, rot:p*Math.PI*2}; }
      if(t < .46){ const p=(t-.34)/.12; return {x:gx, y:GROUND+3, sqx:1+.3*Math.sin(Math.PI*p), sqy:1-.3*Math.sin(Math.PI*p)}; }
      if(t < .70){ const p=(t-.46)/.24; return {x:lerp(gx,c.hx,easeOut(p)), y:lerp(GROUND+3,c.hy,p)-16*Math.sin(Math.PI*p), sqx:1, sqy:1}; }
      return null;
    }
    case 'skill': return skillPose(a);
    case 'rush': { const i=CH.indexOf(c); return meleePose(a, t, an.tx-8-i*3, 95+(i%2)*6, {wind:.02, dash:.08, hold:.12, back:.16}); }
  }
  return heroPose2(a);
}
function spPose(a){
  const an=a.anim, c=a.c, t=an.t, T=CFG.spCut;
  const charge = p => ({x:c.hx+Math.sin(S.time*60)*.6, y:c.hy, sqx:1+.12*p, sqy:1-.12*p});
  if(t < T && an.type!=='wolf_sp' && an.type!=='mush_sp') return charge(t/T);
  const u=t-T;
  switch(an.type){
    case 'senshi_sp':
      if(u < .12){ const p=easeOut(u/.12); return {x:lerp(c.hx,an.tx-12,p), y:lerp(c.hy,40,p), sqx:.85, sqy:1.2}; }
      if(u < .38){ const p=(u-.12)/.26; return {x:an.tx-12+2*p, y:40-14*Math.sin(Math.PI*p*.5), sqx:1, sqy:1, rot:-.2*p}; }
      if(u < .50){ const p=easeIn((u-.38)/.12); return {x:lerp(an.tx-10,Math.min(190,an.cx+30),p), y:lerp(26,GROUND+4,p), sqx:1.2, sqy:.85, rot:.5}; }
      if(u < .60){ const p=(u-.50)/.10; return {x:Math.min(190,an.cx+30), y:GROUND+4, sqx:1+.25*Math.sin(Math.PI*p), sqy:1-.25*Math.sin(Math.PI*p)}; }
      if(u < .86){ const p=(u-.60)/.26; return {x:lerp(Math.min(190,an.cx+30),c.hx,easeOut(p)), y:lerp(GROUND+4,c.hy,p)-22*Math.sin(Math.PI*p), sqx:1, sqy:1, flip:p<.9}; }
      return null;
    case 'budou_sp': {
      const fx = an.tx-6;
      if(u < .1){ const p=easeOut(u/.1); return {x:lerp(c.hx,fx,p), y:97, sqx:1.2, sqy:.85}; }
      if(u < .95) return {x:fx+Math.sin(u*80)*2, y:97, sqx:1+.1*Math.sin(u*60), sqy:1-.1*Math.sin(u*60)};
      if(u < 1.15){ const p=easeOut((u-.95)/.2); return {x:fx+6*p, y:lerp(97,44,p), sqx:.85, sqy:1.2, rot:-.3}; }
      if(u < 1.5){ const p=(u-1.15)/.35; return {x:lerp(fx+6,c.hx,p), y:lerp(44,c.hy,easeIn(p)), sqx:1, sqy:1, flip:true}; }
      return null;
    }
    case 'mahou_sp': return u < 1.1 ? {x:c.hx, y:c.hy-8-2*Math.sin(u*8), sqx:1, sqy:1.05} : (u < 1.3 ? {x:c.hx, y:lerp(c.hy-8,c.hy,(u-1.1)/.2), sqx:1, sqy:1} : null);
    case 'touzoku_sp': {
      const vt = an.vt || [];
      const k = Math.floor(u/.045);
      if(k < vt.length) return Object.assign(atEnemy(vt[k], k%2?7:-7), {flip:k%2===1});
      if(u < an.end-T+.15) return {x:c.hx, y:c.hy, sqx:1.1, sqy:.9};
      return null;
    }
    case 'souryo_sp': return u < .7 ? {x:c.hx, y:c.hy-6, sqx:1, sqy:1.1} : null;
    case 'kariudo_sp':
      if(u < .2){ const p=easeOut(u/.2); return {x:c.hx, y:lerp(c.hy,c.hy-16,p), sqx:.9, sqy:1.1}; }
      if(u < 1.5) return {x:c.hx, y:c.hy-16+Math.sin(u*10), sqx:1, sqy:1, rot:-.4};
      if(u < 1.7){ const p=(u-1.5)/.2; return {x:c.hx, y:lerp(c.hy-16,c.hy,easeIn(p)), sqx:1, sqy:1}; }
      return null;
    case 'wolf_sp': {
      if(t < T){ const p=t/T; return {x:c.hx, y:c.hy-2*Math.sin(p*Math.PI), sqx:.9, sqy:1.15, rot:-.25*Math.sin(p*Math.PI)}; }
      const p = wolfRun(u, c);
      if(!p && u < .61+3*.07) return {x:c.hx, y:c.hy, sqx:1, sqy:1};
      return p;
    }
    case 'mush_sp':
      if(t < T){ const p=t/T; return {x:c.hx, y:c.hy, sqx:1+.35*p, sqy:1+.35*p}; }
      if(u < .25){ const p=u/.25; return {x:c.hx, y:c.hy-5*Math.sin(Math.PI*p), sqx:1.35-.35*p+.15*Math.sin(Math.PI*p*2), sqy:1.35-.35*p}; }
      return null;
    case 'golem_sp': {
      const gx=an.gx;
      if(u < .22){ const p=easeOut(u/.22); return {x:lerp(c.hx,gx,p), y:lerp(c.hy,-30,p), sqx:.85, sqy:1.25, rot:p*Math.PI*3}; }
      if(u < .44) return {x:gx, y:-40, sqx:1, sqy:1};
      if(u < .56){ const p=easeIn((u-.44)/.12); return {x:gx, y:lerp(-40,GROUND+3,p), sqx:.85, sqy:1.3}; }
      if(u < .74){ const p=(u-.56)/.18; return {x:gx, y:GROUND+3, sqx:1+.35*Math.sin(Math.PI*p), sqy:1-.35*Math.sin(Math.PI*p)}; }
      if(u < 1.0){ const p=(u-.74)/.26; return {x:lerp(gx,c.hx,easeOut(p)), y:lerp(GROUND+3,c.hy,p)-18*Math.sin(Math.PI*p), sqx:1, sqy:1}; }
      return null;
    }
  }
  return heroSpPose2(a);
}

// ===== メインループ =====
function updateEnemy(e, dt){
  e.kx *= Math.pow(.002, dt); e.flash=Math.max(0,e.flash-dt);
  if(e.dead){
    e.dying -= dt;
    if(e.dying<=0 && !e.burst){ e.burst=true; if(!e.recruit){ const b=eBox(e); burstSprite(e.key, b.cx, b.cy, e.s); sparks(b.cx,b.cy,6,['#ffffff','#ffe14a'],110); } }
    return;
  }
  if(S.time < S.freeze) return;
  if(e.sleep>0) e.sleep-=dt;
  if(e.pin>0) e.pin-=dt;
  if(e.burn>0){ e.burn-=dt; e.burnT-=dt; if(e.burnT<=0){ e.burnT=.5; const d=Math.max(1,Math.round(HS.atk*.25)); e.hp-=d; const b=eBox(e); float(d,'',b.cx,b.top,'#ff8e3c'); PARTS.push({x:b.cx+rand(-3,3),y:b.cy,vx:0,vy:-20,life:.4,max:.4,col:'#ff8e3c',sz:1,g:0}); if(e.hp<=0){ kill(e); return; } } }
  if(e.poison>0){ e.poison-=dt; e.poisonT-=dt; if(e.poisonT<=0){ e.poisonT=.5; const d=Math.max(1,Math.round(e.poisonPow || basePower(2)*.4)); e.hp-=d; const b=eBox(e); float(d,'',b.cx,b.top,'#c878f0'); PARTS.push({x:b.cx+rand(-3,3),y:b.cy,vx:0,vy:-15,life:.5,max:.5,col:'#b45adc',sz:1,g:0}); if(e.hp<=0){ kill(e); return; } } }
  if(e.dark) maouTick(e, dt);
  if(e.lunge>=0){ e.lunge+=dt; if(e.lunge>.32) e.lunge=-1; }
  // ふっとび: 横に すべる・飛ぶ。奥の 壁で はね返る。地上で 止まったら もとの 場所へ もどる
  if(e.vx){
    e.x += e.vx*dt;
    const inAir = e.air>0 || e.ly>2;
    e.vx *= Math.exp(-(inAir ? .8 : 7)*dt);
    const hw = getSpr(e.key).width*e.s/2, wall = W-2-hw, left = 92;
    if(e.x > wall){
      e.x = wall;
      if(e.vx > 70){
        const b = eBox(e), hard = e.vx > 150;
        sparks(W-3, b.cy, hard?10:5, ['#ffffff','#ffe14a','#c8b090'], 90); dust(W-4, b.cy, hard?6:3, .8);
        FX.push({type:'ring', x:W-3, y:b.cy, t:0, dur:.22, col:'#ffffff'});
        e.vx = -e.vx*.55; e.spin = -(e.spin||6)*1.1; e.kx = -3;
        if(inAir) e.vly = Math.max(e.vly, 60);
        if(hard){ shake(); if(!e.boss && Math.random()<.35){ const bb=eBox(e); float('壁ドン！','tag',bb.cx-10,bb.top-6); } }
      }else e.vx = 0;
    }
    if(e.x < left){ e.x = left; e.vx = 0; }
    if(Math.abs(e.vx) < 5 && !inAir) e.vx = 0;
  }else if(!(e.air>0) && e.ly<=0 && e.lunge<0 && Math.abs(e.x-e.hx) > .5) e.x += (e.hx-e.x)*Math.min(1, dt*1.6);
  if(e.spin && (e.air>0 || e.ly>2)){ e.rot += e.spin*dt; e.spin *= Math.exp(-1.2*dt); }
  else if(e.spin && Math.abs(e.vx) > 20){ e.rot += e.spin*.5*dt; e.spin *= Math.exp(-5*dt); }
  else {
    if(e.spin){ e.spin = 0; e.rot = Math.atan2(Math.sin(e.rot), Math.cos(e.rot)); }
    if(e.air>0) e.rot = Math.sin(S.time*9+e.x)*.25;
    else e.rot *= Math.pow(.001, dt);
  }
  if(e.ly>0 || e.vly!==0){
    let g = e.air>0 ? CFG.gAir*(e.pin>0?.25:1)*(HS.pw.floaty?.66:1) : 760;
    if(e.ly > CFG.ceilH && e.vly > 0) g *= 4;   // 天井ちかくでは すぐ 失速する
    e.vly -= g*dt; e.ly += e.vly*dt;
    if(e.ly<=0){
      e.ly=0;
      const b=eBox(e);
      if(e.entry){ e.entry=false; shake(true); dust(b.cx, e.y, 16, 1.8); SFX.slam(); FX.push({type:'ring', x:b.cx, y:e.y, t:0, dur:.4, col:'#ffffff', big:true}); }
      if(e.slamFx){ e.slamFx=false; SFX.slam(); dust(b.cx, e.y-e.fl, 8, 1.2); sparks(b.cx, e.y-e.fl-4, 5, ['#ffe14a','#ffffff'], 80); }
      if(e.air>0){ e.air=0; e.down=CFG.downTime; }
      if(e.bn < CFG.bounceH.length){ e.vly = Math.sqrt(2*760*CFG.bounceH[e.bn]*(e.boss?.6:1)); e.bn++; e.sq = .18; dust(b.cx, e.y-e.fl, e.bn===1?5:3); }
      else e.vly=0;
      e.landed=true;
    }
  }
  e.sq = Math.max(0, (e.sq||0)-dt);
  if(S.wait){ e.wind = null; return; }
  if(e.wind){ bossWindTick(e, dt); return; }
  // 気絶・空中でも 攻撃までの 時間は すすみ、着地したら すぐ 攻撃してくる（眠りだけは 止まる）
  // 浮いている間は 攻撃してこない（待ち時間は 進むので、着地したら すぐ 攻撃してくる）。着地の ダウンでは 止まらない
  // ほかに 攻撃を 止められるのは 気絶・眠り・ストップなどの 足止め効果
  const air = e.air>0 || e.ly>6;
  if(e.stun>0) e.stun-=dt;
  if(e.down>0) e.down-=dt;
  if(e.landed && !(e.sleep>0)) e.t -= dt;
  if(!S.demo && e.t<=0 && !(e.stun>0) && e.lunge<0 && (e.boss || !air)) enemyAttack(e);
}
function update(dt){
  S.time+=dt;
  artUpdate(dt);
  if(S.queue.length){
    const due=S.queue.filter(q=>q.at<=S.time);
    S.queue=S.queue.filter(q=>q.at>S.time);
    due.forEach(q=>q.fn());
  }
  for(const a of ACT){
    a.kx *= Math.pow(.0005, dt); a.flash = Math.max(0, a.flash-dt);
    if(a.anim){
      a.anim.t += dt;
      for(let k=0;k<a.anim.ev.length;k++){ const [tm,fn]=a.anim.ev[k]; if(!a.anim.done[k] && a.anim.t>=tm){ a.anim.done[k]=1; fn(); } }
      const p = a.anim ? poseOf(a) : null;
      if(p){ a.x=p.x; a.y=p.y; a.sqx=p.sqx; a.sqy=p.sqy; a.rot=p.rot||0; a.flip=!!p.flip; }
      else a.anim=null;
    }
    if(!a.anim){ a.x += (a.c.hx-a.x)*Math.min(1,dt*12); a.y += (a.c.hy-a.y)*Math.min(1,dt*12); a.sqx=1; a.sqy=1; a.rot=0; a.flip=false; }
  }
  for(let i=PROJ.length-1;i>=0;i--){
    const p=PROJ[i]; p.t+=dt;
    if(p.t<0) continue;
    if(p.tgt){ const b=eBox(p.tgt); p.tx=b.cx; p.ty=b.cy; }
    if(p.kind!=='arrow' && Math.random()<.6) PARTS.push({x:p.cx||p.x,y:p.cy||p.y,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,life:.2,max:.2,col:p.kind==='spore'?'#d8f090':p.kind==='fire'?'#ffb04a':p.kind==='rock'?'#8a7a68':'#ff6a2a',sz:p.kind==='meteor'?2:1,g:0});
    if(p.t>=p.dur){ PROJ.splice(i,1); p.onHit(); }
  }
  if(PARTS.length > CFG.maxParts) PARTS.splice(0, PARTS.length-CFG.maxParts);
  for(let i=PARTS.length-1;i>=0;i--){ const q=PARTS[i]; q.life-=dt; if(q.life<=0){PARTS.splice(i,1);continue;} q.vy+=q.g*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; const fl=q.floor||GROUND+10; if(q.g>0 && q.y>fl && q.vy>0){ q.vy*=-.3; q.vx*=.6; } }
  for(let i=FX.length-1;i>=0;i--){ FX[i].t+=dt; if(FX[i].t>=FX[i].dur) FX.splice(i,1); }
  if(S.cut){ S.cut.t+=dt; if(S.cut.t>=S.cut.dur) S.cut=null; }
  if(S.bulb){ S.bulb.t+=dt; if(S.bulb.t>2.2) S.bulb=null; }
  if(S.dark>0) S.dark = Math.max(0, S.dark - dt*1.5);
  if(S.kcT>0){ S.kcT-=dt; if(S.kcT<=0){ if(S.kc>=3 && !S.wait) banner(S.kc+'体 まとめて撃破！'); S.kc=0; } }
  // 拠点: たき火の 火の粉
  if(mode==='camp'){ CF.fire = Math.max(0, CF.fire-dt*.9); CF.tent = Math.max(0, CF.tent-dt*1.2); }
  if(mode==='camp' && Math.random()<.5) PARTS.push({x:112+rand(-4,4), y:92, vx:rand(-6,6), vy:rand(-30,-15), life:.8, max:.8, col:Math.random()<.5?'#ffb04a':'#ffe14a', sz:1, g:0});
  if(S.bg==='hell' && Math.random()<.3) PARTS.push({x:rand(0,W), y:H, vx:rand(-5,5), vy:rand(-25,-10), life:2, max:2, col:'#ff6a2a', sz:1, g:0});
  if(S.bg==='snow' && Math.random()<.5) PARTS.push({x:rand(0,W+20), y:-2, vx:rand(-12,-4), vy:rand(10,22), life:5, max:5, col:'#ffffff', sz:1, g:0, floor:200});
  for(const e of S.es) updateEnemy(e, dt);
  if(mode!=='battle' || S.wait) return;
  if(HS.pw.regen){ S.regenT-=dt; if(S.regenT<=0){ S.regenT=1; S.php=Math.min(S.pmax, S.php+S.pmax*.01); } }
  for(let i=0;i<4;i++){
    if(S.cd[i]>0) S.cd[i]=Math.max(0,S.cd[i]-dt);
    else if(!S.demo && S.auto && S.time>=S.lock && i<CH.length){ S.aw[i]-=dt; if(S.aw[i]<=0) attack(i,false); }
    else if(!S.demo && (S.allyAuto || S.solo) && i>0 && S.time>=S.lock && i<CH.length){ S.aw[i]-=dt; if(S.aw[i]<=0) attack(i,false,true); }
  }
  // 仲間オート: ゲージが たまったら 必殺技も つかう（すこし 間を おく）
  if(!S.demo && (S.allyAuto || S.solo) && !S.auto && S.time>=S.lock){
    for(let i=1;i<CH.length;i++){
      if(S.sp2[i]>=100 && Math.random()<dt*1.2){ trySpecial2(i); break; }
      if(S.sp[i]>=100 && Math.random()<dt*1.2){ trySpecial(i); break; }
    }
  }
  if(S.buffT>0) S.buffT-=dt;
  if(S.dsoulT>0) S.dsoulT-=dt;
  summonTick(dt);
  if(S.moon){ S.moon.t+=dt; if(S.moon.t>CFG.howlTime) S.moon=null; }
  for(let k=0;k<P.slots.length;k++){
    if(S.scd[k]>0) S.scd[k]=Math.max(0,S.scd[k]-dt);
    else if(S.auto && S.time>=S.lock && P.slots[k] && Math.random()<dt*.6) useSkill(k,false);
  }
  if(S.combo>0){ S.comboT-=dt; if(S.comboT<=0) endCombo(); }
}
