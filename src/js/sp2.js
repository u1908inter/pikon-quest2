// ===== 仲間の 必殺技2（必殺技1とは 別の ゲージ。たまるのは ゆっくり） =====
function trySpecial2(i){
  if(i<1 || i>=CH.length || mode!=='battle'||S.wait||S.time<S.lock||!living().length||S.sp2[i]<100) return false;
  const c=CH[i], a=ACT[i], T=CFG.spCut;
  S.sp2[i]=0;
  if(S.last===c.id) S.chain=1; else S.chain++;
  S.last=c.id; S.hist.push(c.id); if(S.hist.length>8) S.hist.shift(); S.used.add(c.id);
  S.lock=S.time+T; S.freeze=S.time+T;
  S.cut={t:0, dur:T, solo:c.spr};
  banner(c.sp2+'！');
  S.gauge=Math.min(100, S.gauge+10);
  const ok=e=>!e.dead&&S.es.includes(e);
  const hit=(e,m,q,o={})=>{ if(ok(e)) addHit(e,i,m,true,q,Object.assign({sp:true},o)); };
  const an={type:c.id+'_sp2', t:0, ev:[], done:{}};
  if(FAMACT[c.id]){ an.famPose=true; an.t0=T; FAMACT[c.id].sp2({i, c, a, an, manual:true, hit, ok}, T); }
  else if(c.id==='wolf'){
    // 群れの遠吠え: 6秒間 パーティの 攻撃力 1.5倍、敵を ひるませる
    an.ev.push([T, ()=>{
      S.buffT = CFG.howlTime; S.moon = {t:0};
      for(let k=0;k<3;k++) FX.push({type:'ring', x:a.x+6, y:a.y-10, t:-k*.12, dur:.6, col:k%2?'#ffe14a':'#ffffff', big:true});
      living().forEach(e=>{ e.stun=Math.max(e.stun,1.0); e.t+=1.0; });
      float('攻撃力 1.5倍！','tag',60,30);
    }]);
  }else if(c.id==='mush'){
    // どくどく胞子: 全員を 毒に ＋ パーティを 回復
    an.ev.push([T, ()=>{
      const ct=center();
      FX.push({type:'cloud', x:ct.x, y:ct.y, r:80, t:0, dur:1.4, col:'rgba(180,90,220,.35)'});
      for(let k=0;k<60;k++){ const ang=Math.random()*Math.PI*2, r=Math.random()*80;
        PARTS.push({x:a.x+8,y:a.y-14,vx:(ct.x+Math.cos(ang)*r-(a.x+8))*2.2,vy:(ct.y+Math.sin(ang)*r*.5-(a.y-14))*2.2,life:.6+Math.random()*.6,max:1.2,col:k%2?'#b45adc':'#e8a0e0',sz:2,g:0}); }
      living().forEach(e=>{ hit(e,.6,true); if(ok(e)){ e.poison=CFG.poisonTime; e.poisonT=.5; } });
      heal(S.pmax*.2, a);
      const n=living().length; if(n>=2) float(n+'体 毒！','tag',ct.x,22);
    }]);
  }else if(c.id==='golem'){
    // いわなだれ: 岩が 全員に 降る。空中の敵は 叩き落とす
    const tg = living().sort(()=>Math.random()-.5);
    an.ev.push([T, ()=>{ shake(); }]);
    tg.forEach((e,k)=>an.ev.push([T+.08+k*.035, ()=>{
      if(!ok(e)) return; const b=eBox(e);
      PROJ.push({kind:'rock', x:b.cx+rand(-10,10)+20, y:-12, tgt:e, t:0, dur:.2, arc:0, onHit:()=>{
        if(!ok(e)) return; const bb=eBox(e);
        dust(bb.cx, e.y, 5); sparks(bb.cx, bb.cy, 4, ['#b79c62','#ffffff'], 70);
        const wasAir = e.air>0;
        hit(e, 2.5, k>0);
        if(!ok(e)) return;
        if(wasAir){ e.vly=-480; e.slamFx=true; e.bn=0; }
        e.stun=Math.max(e.stun,1.0);
        if(k%4===0) shake();
      }});
    }]));
    an.ev.push([T+.3+tg.length*.035, ()=>{ if(tg.length>=2) float(tg.length+'体 いわなだれ！','tag',140,22); }]);
  }
  a.anim = an;
  checkRecipes();
  return true;
}
function sp2Pose(a){
  const an=a.anim, c=a.c, t=an.t, T=CFG.spCut;
  if(an.type==='wolf_sp2'){
    if(t < T){ const p=t/T; return {x:c.hx, y:c.hy, sqx:1.1-.1*p, sqy:.9+.1*p}; }
    const u=t-T; if(u < .6) return {x:c.hx, y:c.hy-3, sqx:.9, sqy:1.15, rot:-.35}; return null;
  }
  if(an.type==='mush_sp2'){
    if(t < T){ const p=t/T; return {x:c.hx, y:c.hy, sqx:1+.3*p, sqy:1+.3*p}; }
    const u=t-T; if(u < .3){ const p=u/.3; return {x:c.hx, y:c.hy-5*Math.sin(Math.PI*p), sqx:1.3-.3*p, sqy:1.3-.3*p}; } return null;
  }
  if(an.type==='golem_sp2'){
    if(t < T){ const p=t/T; return {x:c.hx, y:c.hy, sqx:1+.15*p, sqy:1-.15*p}; }
    const u=t-T; if(u < .9) return {x:c.hx+Math.sin(u*50)*.8, y:c.hy-2, sqx:.9, sqy:1.15}; return null;
  }
  return null;
}
