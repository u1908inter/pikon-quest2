// ===== 技と ひらめき（本作の 技ツリー・熟練度・ひらめきと 同じ 考え方） =====
// parent の技を 使ったときに、parent の熟練度が req 以上なら ひらめく ことがある
const SK = {
  slash:   {n:'斬り',           tree:'剣',   parent:null,       req:0,  cd:2.0, pose:'melee', d:'手前の 4体を 大きく 斬る（1.6倍）'},
  double:  {n:'二段斬り',       tree:'剣',   parent:'slash',    req:10, cd:2.4, pose:'melee', d:'手前の敵を 2回 斬り、2回目で 打ち上げる'},
  sweep:   {n:'なぎはらい',     tree:'剣',   parent:'slash',    req:25, cd:3.0, pose:'melee', d:'地上の敵 すべてを なぎはらい、ひるませる'},
  tsubame: {n:'燕返し',         tree:'剣',   parent:'double',   req:30, cd:3.0, pose:'air',   d:'空中の敵 すべてを 斬り、さらに 高く 打ち上げる（2.5倍）'},
  rengoku: {n:'煉獄斬',         tree:'剣',   parent:'sweep',    req:45, cd:5.0, pose:'melee', d:'炎の 斬撃で 全員を 焼く（2倍＋燃焼）'},
  kick:    {n:'回し蹴り',       tree:'体術', parent:null,       req:0,  cd:1.8, pose:'melee', d:'手前の 3体を 蹴って 小さく 浮かせる（1.5倍）'},
  hiza:    {n:'飛び膝蹴り',     tree:'体術', parent:'kick',     req:10, cd:2.2, pose:'air',   d:'空中の敵 すべてに 膝蹴り（2.2倍）、浮き直させる'},
  senpu:   {n:'旋風脚',         tree:'体術', parent:'kick',     req:25, cd:3.0, pose:'spin',  d:'まわりの敵を 巻きこんで 打ち上げる'},
  hyaku:   {n:'百裂脚',         tree:'体術', parent:'hiza',     req:30, cd:3.5, pose:'melee', d:'手前の 2体に 12連続 蹴り'},
  hakkei:  {n:'発勁',           tree:'体術', parent:'senpu',    req:45, cd:5.0, pose:'melee', d:'いちばん 強い敵に 6倍の 一撃＋気絶（ボス優先）'},
  fireball:{n:'ファイアボール', tree:'魔法', parent:'slash',    req:15, cd:2.5, pose:'cast',  d:'群れの 真ん中で 大爆発（1.8倍＋燃焼）'},
  ice:     {n:'アイスニードル', tree:'魔法', parent:'fireball', req:15, cd:3.0, pose:'cast',  d:'5体を 氷づけに する（1.5倍＋気絶）'},
  thunder: {n:'サンダーボルト', tree:'魔法', parent:'fireball', req:30, cd:3.0, pose:'cast',  d:'6体に 落雷（空中の敵に 2倍）'},
  blizzard:{n:'ブリザード',     tree:'魔法', parent:'ice',      req:40, cd:5.0, pose:'cast',  d:'全員を 凍らせる（1.4倍＋気絶 1.5秒）'},
  explode: {n:'エクスプロージョン', tree:'魔法', parent:'thunder', req:50, cd:6.0, pose:'cast', d:'全員を 爆破して 打ち上げる（2.5倍）'},
  aim:     {n:'ねらい撃ち',     tree:'弓',   parent:'kick',     req:15, cd:2.5, pose:'bow',   d:'いちばん HPの多い敵を 撃ちぬく（4倍・会心しやすい）'},
  rapid:   {n:'連射',           tree:'弓',   parent:'aim',      req:15, cd:2.8, pose:'bow',   d:'矢を 8本（空中の敵を ねらう）'},
  kagenui: {n:'影縫い',         tree:'弓',   parent:'aim',      req:30, cd:3.5, pose:'bow',   d:'空中の敵を 2秒 縫いとめて 落とさない'},
  ryusei:  {n:'流星矢',         tree:'弓',   parent:'rapid',    req:45, cd:6.0, pose:'bow',   d:'空から 矢の流星。全員に 6連続'},
};
const TREES = ['剣','体術','魔法','弓'];
const JOB_TREE = {senshi:'剣', touzoku:'剣', budou:'体術', mahou:'魔法', souryo:'魔法', kariudo:'弓'};
const ST_T = [0, 20, 60, 120, 200];          // 熟練度（使った回数）の ★の しきい
const ST_DMG = [1, 1.15, 1.35, 1.6, 2.0];    // ★ごとの 威力（本作と 同じ）
const stageOf = m => { let s=0; for(let i=0;i<5;i++) if(m>=ST_T[i]) s=i; return s; };
const stars = st => '★'.repeat(st+1)+'☆'.repeat(4-st);
// 格上の 敵ほど ひらめきやすい（めやすより レベルが 低いほど 上がる）
function sparkChance(L){
  const f = clamp(1 + (3*L - 1 - P.hero.lv)*0.08, 0.3, 3);
  return clamp(CFG.sparkBase * f * (1+(HS.spark||0)/100) * (HS.pw.charmSpark||1) * (S && hasT('curse') ? 2 : 1), 0.01, 0.6);
}
const sparkKids = id => Object.keys(SK).filter(c => SK[c].parent===id && !P.skills[c] && (P.skills[id]||{m:0}).m >= SK[c].req);

function useSkill(k, manual){
  if(mode!=='battle'||S.wait||S.time<S.lock||!living().length) return false;
  const id = P.slots[k]; if(!slotOpen(k) || !id || !P.skills[id] || S.scd[k]>0 || !skillUsable(id)) return false;
  let sparked = null;
  const kids = sparkKids(id);
  if(kids.length && Math.random() < sparkChance(S.L)*(manual?1:.5)){
    sparked = pick(kids); P.skills[sparked] = {m:0};
    const empty = P.slots.findIndex((v,j)=>!v && slotOpen(j)); if(empty>=0) P.slots[empty] = sparked; else later(1.3, ()=>swapAsk(sparked));   // 枠が いっぱいなら その場で 入れかえを きく
    R.sparks.push(SK[sparked].n);
    sparkFx(sparked);
    save();
  }
  const use = sparked || id;
  S.scdMax[k] = SK[id].cd*(1-Math.min(60, (HS.pw.skillCdr||0)+(HS.pw.wCdr||0))/100); S.scd[k] = S.scdMax[k];
  if(HS.pw.cdReset && Math.random()*100 < HS.pw.cdReset){ S.scd[k] = 0; later(.3, ()=>float('時間持ち！','tag',ACT[0].x,ACT[0].y-34)); }
  if(HS.pw.spellStrike) S.ssNext = true;
  if(manual){
    S.sp[0] = Math.min(100, S.sp[0]+CFG.spPerPress*(1+HS.spg/100));
    if(S.last==='waza'+k) S.chain=1; else S.chain++;   // ちがう ひらめき技どうしも 連携に なる
    S.last='waza'+k; S.hist.push('waza'); if(S.hist.length>8) S.hist.shift(); S.used.add('hero');
  }
  gainMastery(use, manual ? 1 : .5);
  execSkill(use, manual, !!sparked);
  artProc(manual, true);
  if(manual) checkRecipes();
  if(sparked) renderSkillButtons();
  return true;
}
function gainMastery(id, n){
  const s = P.skills[id], b = stageOf(s.m); s.m += n*(HS.pw.mastery2?2:1)*(HS.pw.timeSand?1.3:1)*(HS.pw.mast13?1.3:1); const a = stageOf(s.m);
  if(a > b) later(.6, ()=>banner(SK[id].n+' '+stars(a)));
}
function execSkill(id, manual, big){
  const sk = SK[id], st = stageOf(P.skills[id].m);
  const mul = ST_DMG[st] * (1 + (HS.pw.wSkill||0)/100) * (big ? 1.5 : 1);   // スキルレベルの「技の威力」
  const ok = e => !e.dead && S.es.includes(e);
  const hit = (e,m,q,o={}) => ok(e) ? addHit(e, 0, m*mul, manual, q, o) : 0;
  const an = {type:'skill', pose:sk.pose, t:0, ev:[], done:{}, tx:frontX(), cx:center().x};
  const T = {melee:.13, cast:.12, air:.18, spin:.14, bow:.1, leap:.34}[sk.pose];
  const at = (t, fn) => an.ev.push([t, fn]);
  const byFront = () => living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front);   // 近接は 高すぎる 敵に とどかない
  const airs = () => living().filter(e=>e.air>0);
  const lift = (e,h) => { if(ok(e) && manual) launch(e, h*(e.boss?.6:1)); };
  const slashFx = (x, up) => FX.push({type:'slash', x1:x-8, y1:up?104:56, x2:x+34, y2:up?50:104, t:0, dur:.22});
  switch(id){
    case 'slash': at(T, ()=>{ const tg=byFront().slice(0,4); slashFx(frontX(), false); tg.forEach(e=>hit(e,1.6)); }); break;
    case 'double':
      at(T, ()=>{ slashFx(frontX(), false); byFront().slice(0,4).forEach(e=>hit(e,1.0)); });
      at(T+.12, ()=>{ slashFx(frontX(), true); byFront().slice(0,4).forEach(e=>{ hit(e,1.0,true); lift(e,30); }); }); an.long=.12; break;
    case 'sweep': at(T, ()=>{ FX.push({type:'wave', x:frontX()-4, w:90, t:0, dur:.25}); living().filter(e=>!(e.air>0)).forEach(e=>{ hit(e,1.0); if(ok(e)&&manual) e.stun=Math.max(e.stun,.6); }); shake(); }); break;
    case 'tsubame': at(T, ()=>{ const a=airs(); if(a.length){ a.forEach(e=>{ hit(e,2.5/1.5); if(ok(e)) e.vly=Math.max(e.vly,260); }); float(a.length+'体 燕返し！','tag',center().x,26); } else byFront().slice(0,3).forEach(e=>hit(e,1.0)); slashFx(frontX()+10, true); }); break;
    case 'rengoku': at(T, ()=>{ const c=center(); FX.push({type:'boom', x:c.x, y:c.y, r:70, t:0, dur:.5}); living().forEach(e=>{ hit(e,2.0); if(ok(e)) e.burn=3; }); shake(true); hitstop(.06); }); break;
    case 'kick': at(T, ()=>{ byFront().slice(0,3).forEach(e=>{ const b=eBox(e); FX.push({type:'punch', x:b.cx-3, y:b.cy, t:0, dur:.12}); hit(e,1.5); lift(e,18); }); }); break;
    case 'hiza': at(T, ()=>{ const a=airs(); if(a.length) a.forEach(e=>{ const b=eBox(e); FX.push({type:'punch', x:b.cx, y:b.cy, t:0, dur:.12}); hit(e,2.2/1.5); if(ok(e)) e.vly=Math.max(e.vly,200); });
      else byFront().slice(0,2).forEach(e=>{ hit(e,1.2); lift(e,24); }); }); break;
    case 'senpu': at(T, ()=>{ const fx=frontX(); FX.push({type:'ring', x:fx, y:90, t:0, dur:.3, col:'#ffffff'}); living().filter(e=>eBox(e).front<=fx+60 && low(e)).forEach(e=>{ hit(e,1.3); lift(e,30); }); }); break;
    case 'hyaku': for(let k=0;k<12;k++) at(T+k*.035, ()=>{ byFront().slice(0,2).forEach((e,j)=>{ const b=eBox(e); FX.push({type:'punch', x:b.cx-3+rand(-3,3), y:b.cy+rand(-4,4), t:0, dur:.08}); hit(e,.45,k>0||j>0); }); }); an.long=.4; break;
    case 'hakkei': at(T, ()=>{ const l=living(); const e=l.find(x=>x.boss) || l.sort((p,q)=>q.hp-p.hp)[0]; if(!e) return; const b=eBox(e);
      FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.4, col:'#ffe14a', big:true}); hit(e,6.0); if(ok(e)) e.stun=Math.max(e.stun,1.5); hitstop(.1); shake(true); }); break;
    case 'fireball': at(T, ()=>{ const c=center(); PROJ.push({kind:'fire', x:ACT[0].x+8, y:ACT[0].y-16, tx:c.x, ty:c.y, t:0, dur:.22, arc:10, onHit:()=>{
      if(S.wait) return; FX.push({type:'boom', x:c.x, y:c.y, r:36, t:0, dur:.4}); sparks(c.x,c.y,14,['#ff8e3c','#ffe14a','#ffffff'],100); shake();
      living().forEach(e=>{ const b=eBox(e), dx=b.cx-c.x, dy=(b.cy-c.y)*1.3; if(dx*dx+dy*dy>36*36) return; hit(e,1.8,false,{mag:true}); if(ok(e)) e.burn=3; }); }}); }); break;
    case 'ice': at(T, ()=>{ [...living()].sort(()=>Math.random()-.5).slice(0,5).forEach(e=>{ const b=eBox(e); FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.3, col:'#9fe3ff'}); hit(e,1.5,false,{mag:true}); if(ok(e)) e.stun=Math.max(e.stun,1.2); }); }); break;
    case 'thunder': at(T, ()=>{ const l=living(); const tg=[...l.filter(e=>e.air>0), ...l.filter(e=>!(e.air>0)).sort(()=>Math.random()-.5)].slice(0,6);
      tg.forEach((e,j)=>later(j*.05, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'bolt', x:b.cx, y:b.cy, t:0, dur:.2}); hit(e,1.6,false,{mag:true, airX:2/1.5}); })); }); break;
    case 'blizzard': at(T, ()=>{ FX.push({type:'frost', t:0, dur:.8}); living().forEach(e=>{ hit(e,1.4,false,{mag:true}); if(ok(e)) e.stun=Math.max(e.stun,1.5); }); hitstop(.06); }); break;
    case 'explode': at(T, ()=>{ const c=center(); FX.push({type:'boom', x:c.x, y:c.y, r:85, t:0, dur:.5}); FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.45}); flash(); shake(true); hitstop(.1);
      living().forEach(e=>{ hit(e,2.5,false,{mag:true}); if(!ok(e)) return; if(e.air>0) e.vly=Math.max(e.vly,180); else lift(e,34); }); }); break;
    case 'aim': at(T, ()=>{ const e=living().sort((p,q)=>q.hp-p.hp)[0]; if(!e) return;
      PROJ.push({kind:'arrow', x:ACT[0].x+8, y:ACT[0].y-14, tgt:e, t:0, dur:.12, arc:0, onHit:()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.2}); hit(e,4.0,false,{crit:Math.random()<.5}); }}); }); break;
    case 'rapid': at(T, ()=>{ const l=living(); const tg=[...l.filter(e=>e.air>0), ...l.filter(e=>!(e.air>0)).sort(()=>Math.random()-.5)];
      for(let j=0;j<8 && tg.length;j++){ const e=tg[j%tg.length]; PROJ.push({kind:'arrow', x:ACT[0].x+8, y:ACT[0].y-14, tgt:e, t:-j*.04, dur:.14, arc:0, onHit:()=>{ if(!ok(e)) return; hit(e,.7,j>3,{airX:e.air>0?1.4:1}); if(ok(e)&&e.air>0&&HS.pw.pin) e.pin=1; }}); } }); break;
    case 'kagenui': at(T, ()=>{ const a=airs(); if(a.length){ a.forEach(e=>{ const b=eBox(e); FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.3, col:'#c8b0ff'}); hit(e,1.0); if(ok(e)){ e.pin=2; e.vly=Math.max(e.vly,30); } }); float(a.length+'体 縫いとめ！','tag',center().x,26); }
      else byFront().slice(0,3).forEach(e=>hit(e,.8)); }); break;
    case 'ryusei': FX.push({type:'rain', t:-T, dur:.9}); for(let k=0;k<6;k++) at(T+.1+k*.12, ()=>living().forEach(e=>hit(e,.4,k>0))); an.long=.7; break;
    default: execSkill2(id, {at, T, hit, ok, byFront, airs, lift, slashFx, manual, an});
  }
  ACT[0].anim = an;
}
// 技を つかう ポーズ
function skillPose(a){
  const an=a.anim, c=a.c, t=an.t, L=an.long||0;
  switch(an.pose){
    case 'melee': return meleePose(a, t, an.tx-8, 97, {wind:.05, dash:.08, hold:.2+L, back:.16});
    case 'spin': { const p = meleePose(a, t, an.tx-10, 97, {wind:.05, dash:.08, hold:.24, back:.16}); if(p && t>.1 && t<.4){ p.flip = Math.floor(t*30)%2===1; } return p; }
    case 'leap': {   // 高く とびあがって 弧を えがき、真上から たたき割る
      const tx = an.tx, ty = an.ty || 97, H = 52;
      if(t < .08){ const p=t/.08; return {x:c.hx-2*p, y:c.hy, sqx:1+.2*p, sqy:1-.2*p}; }
      if(t < .34){ const p=(t-.08)/.26; return {x:lerp(c.hx-2,tx,p), y:lerp(c.hy,ty,p)-H*Math.sin(Math.PI*p), sqx:p<.5?.85:1, sqy:p<.5?1.2:1, rot:-.5+1.2*p}; }
      if(t < .5){ const p=(t-.34)/.16; return {x:tx, y:ty, sqx:1.25-.25*p, sqy:.78+.22*p}; }
      if(t < .7){ const p=(t-.5)/.2; return {x:lerp(tx,c.hx,easeOut(p)), y:lerp(ty,c.hy,p)-14*Math.sin(Math.PI*p), sqx:1, sqy:1}; }
      return null;
    }
    case 'cast': return castPose(c, t, 6, .36+L);
    case 'bow': return t < .08 ? {x:c.hx-2*t/.08, y:c.hy, sqx:.9, sqy:1.08} : t < .3+L ? {x:c.hx-2, y:c.hy-(L?14:0), sqx:1.05, sqy:.97, rot:L?-.4:0} : null;
    case 'air': {
      const tx=an.tx-10;
      if(t < .18){ const p=easeOut(t/.18); return {x:lerp(c.hx,tx,p), y:lerp(c.hy,52,p), sqx:.85, sqy:1.2}; }
      if(t < .34) return {x:tx, y:52-4*Math.sin(Math.PI*(t-.18)/.16), sqx:1, sqy:1, rot:-.3};
      if(t < .58){ const p=(t-.34)/.24; return {x:lerp(tx,c.hx,p), y:lerp(52,c.hy,easeIn(p)), sqx:1, sqy:1, flip:true}; }
      return null;
    }
  }
  return null;
}

// ===== ひらめいた 瞬間の 演出（光・音・振動・大きな 文字） =====
function sparkFx(id){
  const a = ACT[0], x = a.x, y = a.y-30;
  S.bulb = {t:0}; S.hs = Math.max(S.hs, .4); flash(); shake();
  FX.push({type:'rays', x, y, t:0, dur:1.0}); FX.push({type:'ring', x, y, t:0, dur:.6, col:'#ffe14a', big:true});
  FX.push({type:'ring', x, y, t:-.18, dur:.7, col:'#ffffff', big:true}); FX.push({type:'ring', x, y, t:-.36, dur:.8, col:'#ffe14a', big:true});
  sparks(x, y, 36, ['#ffe14a','#ffffff','#fff6c0','#ffb04a'], 150);
  audioInit(); SFX.spark(); buzz([30,50,30,50,140]);
  let el = $('#sparkPop');
  if(!el){ el = document.createElement('div'); el.id = 'sparkPop'; $('#stage').appendChild(el); }
  el.innerHTML = `<div class="sp1">ピコーン！</div><div class="sp2">💡 <b>${SK[id].n}</b> を ひらめいた！</div><div class="sp3">${tagsHtml(SK_TAGS[id], true)} ${SK[id].d}</div>`;
  el.getAnimations().forEach(an=>an.cancel());
  el.animate([{opacity:0, transform:'translate(-50%,-50%) scale(.4)'}, {opacity:1, transform:'translate(-50%,-50%) scale(1.15)', offset:.08},
              {opacity:1, transform:'translate(-50%,-50%) scale(1)', offset:.15}, {opacity:1, transform:'translate(-50%,-50%) scale(1)', offset:.85},
              {opacity:0, transform:'translate(-50%,-60%) scale(1)'}], {duration:2600, easing:'ease-out', fill:'forwards'});
  P.newSkill = true;
  later(.1, ()=>{ const k = P.slots.indexOf(id); const b = k>=0 && $('#kb'+k); if(b) b.animate([{boxShadow:'0 0 0 6px #ffe14a', filter:'brightness(1.5)'}, {boxShadow:'0 0 0 0 rgba(255,225,74,0)', filter:'none'}], {duration:1200, iterations:2}); });
}

// ===== ひらめいた 技を その場で セット（枠が いっぱいの とき） =====
function swapAsk(id){
  if(mode!=='battle' || !$('#modal').hidden || P.slots.includes(id)) return;
  const n = skillSlots();
  showModal(`<h2>💡 ${SK[id].n} を セットする？</h2>
    <p style="font-size:13px">${tagsHtml(SK_TAGS[id], true)} ${SK[id].d} ／ 再使用 ${SK[id].cd}秒</p>
    <p class="hint">入れかえる 枠を えらぶ（戦闘は 止まっている）。あとで スキルタブでも 入れかえられる。</p>
    <div class="list">${[...Array(n).keys()].map(k=>{ const cur=P.slots[k];
      return `<button class="li" data-m="sk-swap" data-k="${k}" data-id="${id}"><div class="body"><div class="t"><span>枠${k+1}（${S.solo?'QWER'[k]:'Q'}）：${cur?SK[cur].n:'― 空き ―'}</span><span class="r2" style="font-size:12px">${cur?stars(stageOf(P.skills[cur].m)):''}</span></div><div class="d">${cur?`${tagsHtml(SK_TAGS[cur])} ${SK[cur].d}`:''}</div></div></button>`; }).join('')}</div>
    <div class="opts"><button class="btn" data-m="sk-skip">いまは セットしない</button></div>`);
}
$('#modal').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-m^="sk-"]'); if(!b) return;
  if(b.dataset.m==='sk-swap'){ const k=+b.dataset.k, id=b.dataset.id; P.slots[k]=id; S.scd[k]=0; save(); renderSkillButtons();
    hideModal(); const btn=$('#kb'+k); if(btn) btn.animate([{boxShadow:'0 0 0 6px #ffe14a', filter:'brightness(1.5)'}, {boxShadow:'0 0 0 0 rgba(255,225,74,0)', filter:'none'}], {duration:900}); float(SK[id].n+' を セット！','tag',ACT[0].x+10,ACT[0].y-40); }
  else if(b.dataset.m==='sk-skip') hideModal();
});
