// ===== 武器ごとの ひらめき技（追加）と スキルツリー（パッシブ） =====
Object.assign(SK, {
  kabuto:   {n:'兜割り',   tree:'剣',   parent:'slash',     req:20, cd:3.0, pose:'leap', d:'いちばん 強い 敵を 兜ごと たたき割る（4.5倍＋気絶）'},
  bakuretsu:{n:'爆裂矢',   tree:'弓',   parent:'rapid',     req:30, cd:4.0, pose:'bow',   d:'群れの 真ん中で 矢が 爆発（2倍）、地上の 敵を 打ち上げる'},
  nage:     {n:'投げナイフ', tree:'短剣', parent:null,      req:0,  cd:1.6, pose:'bow',   d:'4体に ナイフを 投げる（空中の 敵を ねらう・会心しやすい）'},
  kagebashiri:{n:'影走り', tree:'短剣', parent:'nage',      req:10, cd:2.6, pose:'melee', d:'手前の 5体を 駆けぬけて 斬り、ひるませる'},
  dokujin:  {n:'毒刃',     tree:'短剣', parent:'nage',      req:20, cd:3.0, pose:'melee', d:'手前の 4体を 斬って 毒に する'},
  midare:   {n:'乱れ斬り', tree:'短剣', parent:'kagebashiri', req:30, cd:3.5, pose:'melee', d:'手前の 3体に 10連続の 斬撃'},
  ansatsu:  {n:'暗殺',     tree:'短剣', parent:'dokujin',   req:45, cd:6.0, pose:'melee', d:'弱った 敵（HP35%以下）を 一撃で 倒す（ボス以外）。ほかは 6倍の 会心'},
  tsukiage: {n:'突き上げ', tree:'槍',   parent:null,        req:0,  cd:1.8, pose:'melee', d:'一直線に 並んだ 敵を 突いて まとめて 打ち上げる'},
  kushizashi:{n:'串刺し',  tree:'槍',   parent:'tsukiage',  req:10, cd:2.6, pose:'melee', d:'一直線の 敵を 貫いて（2倍）、奥まで 吹き飛ばす'},
  daisharin:{n:'大車輪',   tree:'槍',   parent:'tsukiage',  req:25, cd:3.2, pose:'spin',  d:'槍を 振りまわして まわりの 敵を 打ち上げる'},
  tentotsu: {n:'天突',     tree:'槍',   parent:'kushizashi', req:30, cd:3.0, pose:'air',  d:'空中の 敵 すべてを 突き上げる（2.4倍）、浮き直させる'},
  ryuuga:   {n:'竜牙',     tree:'槍',   parent:'daisharin', req:45, cd:6.0, pose:'air',   d:'竜の 牙の 一撃。全員に 2.6倍＋打ち上げ'},
  issen:    {n:'一閃',     tree:'刀',   parent:null,        req:0,  cd:2.0, pose:'melee', d:'手前の いちばん 強い 敵を 一閃（2.4倍・会心しやすい）'},
  kasumi:   {n:'霞斬り',   tree:'刀',   parent:'issen',     req:10, cd:2.6, pose:'melee', d:'手前の 5体を 斬り、敵の 攻撃を 1秒 おくらせる'},
  battou:   {n:'抜刀術',   tree:'刀',   parent:'issen',     req:20, cd:3.0, pose:'melee', d:'画面の 端まで とどく 抜き打ち（1.6倍・会心しやすい）'},
  tsukikage:{n:'月影',     tree:'刀',   parent:'kasumi',    req:30, cd:3.2, pose:'air',   d:'空中の 敵 すべてを 斬る（2.2倍・会心しやすい）'},
  hiken:    {n:'秘剣',     tree:'刀',   parent:'battou',    req:45, cd:6.0, pose:'melee', d:'全員を 斬る 秘剣（3倍）。ボス以外は 10%で 一撃'},
});
SK.fireball.parent = null; SK.aim.parent = null;   // 武器ごとに 1つめの 技は 武器を 持つと おぼえる
TREES.push('短剣','槍','刀');
Object.assign(SK_TAGS, {kabuto:'single stop', bakuretsu:'area up', nage:'air', kagebashiri:'area stop', dokujin:'area poison', midare:'area', ansatsu:'single',
  tsukiage:'up area', kushizashi:'area', daisharin:'area up', tentotsu:'air up', ryuuga:'area up', issen:'single', kasumi:'area stop', battou:'area', tsukikage:'air', hiken:'area'});
const TREE_ROOT = {sword:'slash', fist:'kick', staff:'fireball', bow:'aim', dagger:'nage', spear:'tsukiage', katana:'issen'};
// いまの 武器の 1つめの 技を まだ 知らなければ おぼえる
function ensureRoot(){
  const id = TREE_ROOT[curWT()]; if(!id || P.skills[id]) return null;
  P.skills[id] = {m:0};
  // 空いている 枠へ。なければ、いまの 武器で 使える 技が 1つも ない ときだけ 使えない 技と 入れかえる
  let k = P.slots.findIndex((v,j)=>!v && slotOpen(j));
  if(k < 0 && !P.slots.some((v,j)=>v && slotOpen(j) && skillUsable(v))) k = P.slots.findIndex((v,j)=>v && slotOpen(j) && !skillUsable(v));
  if(k >= 0) P.slots[k] = id;
  save(); return id;
}
function execSkill2(id, x){
  if(typeof execSkill3==='function' && execSkill3(id, x)) return;
  const {at, T, hit, ok, byFront, airs, lift, slashFx, manual, an} = x;
  const lane = () => { const f = byFront()[0]; return f ? living().filter(e=>low(e) && Math.abs(e.y-f.y) < 8).sort((p,q)=>p.x-q.x) : []; };
  const strongest = n => { const l = byFront().slice(0,n); return l.find(e=>e.boss) || l.sort((p,q)=>q.hp-p.hp)[0]; };
  switch(id){
    case 'kabuto': { const e0 = strongest(3); if(e0){ const b0=eBox(e0); an.tx = b0.cx-6; an.ty = Math.min(97, b0.fy+1); } at(T, ()=>{ const e = e0 && ok(e0) ? e0 : strongest(3); if(!e) return; const b=eBox(e); FX.push({type:'slash', x1:b.cx, y1:b.top-14, x2:b.cx+2, y2:b.cy+10, t:0, dur:.22}); hit(e,4.5); if(ok(e)) e.stun=Math.max(e.stun,1); shake(); FX.push({type:'ring', x:b.cx, y:b.fy, t:0, dur:.25, col:'#ffffff'}); }); } break;
    case 'bakuretsu': at(T, ()=>{ const c=center(); PROJ.push({kind:'arrow', x:ACT[0].x+8, y:ACT[0].y-14, tx:c.x, ty:c.y, t:0, dur:.16, arc:6, onHit:()=>{
      FX.push({type:'boom', x:c.x, y:c.y, r:40, t:0, dur:.4}); shake(); near(c.x, c.y, 40).forEach(e=>{ hit(e,2.0); if(ok(e) && !(e.air>0)) lift(e,28); }); }}); }); break;
    case 'nage': at(T, ()=>{ const l=living(); const tg=[...l.filter(e=>e.air>0), ...shuffled(l.filter(e=>!(e.air>0)))].slice(0,4);
      tg.forEach((e,j)=>PROJ.push({kind:'star', x:ACT[0].x+8, y:ACT[0].y-14, tgt:e, t:-j*.04, dur:.12, arc:0, onHit:()=>{ if(ok(e)) hit(e,.9,j>0,{crit:Math.random()<.3}); }})); }); break;
    case 'kagebashiri': at(T, ()=>{ byFront().slice(0,5).forEach((e,j)=>later(j*.04, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); hit(e,1.0,j>0); if(ok(e)&&manual){ e.stun=Math.max(e.stun,.6); e.t+=.5; } })); }); break;
    case 'dokujin': at(T, ()=>{ slashFx(frontX(), false); byFront().slice(0,4).forEach(e=>{ hit(e,1.0); if(ok(e)){ e.poison=6; e.poisonT=.5; e.poisonPow=HS.atk*.35; } }); }); break;
    case 'midare': for(let k=0;k<10;k++) at(T+k*.04, ()=>{ byFront().slice(0,3).forEach((e,j)=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx+rand(-3,3), y:b.cy+rand(-4,4), t:0, dur:.08}); hit(e,.4,k>0||j>0); }); }); an.long=.35; break;
    case 'ansatsu': at(T, ()=>{ const l=byFront().slice(0,5).filter(e=>!e.boss), e=l.sort((p,q)=>p.hp/p.max-q.hp/q.max)[0] || byFront()[0]; if(!e) return; const b=eBox(e);
      FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.25}); if(!e.boss && e.hp < e.max*.35){ float('暗殺！','tag',b.cx,b.top-8); direct(e, e.hp); } else hit(e,6,false,{crit:true}); }); break;
    case 'tsukiage': at(T, ()=>{ FX.push({type:'wave', x:frontX()-6, w:110, t:0, dur:.2}); lane().forEach((e,j)=>later(j*.02, ()=>{ hit(e,1.3,j>0); lift(e,32); })); }); break;
    case 'kushizashi': at(T, ()=>{ FX.push({type:'wave', x:frontX()-6, w:130, t:0, dur:.25}); lane().forEach((e,j)=>later(j*.02, ()=>{ hit(e,2.0,j>0); if(ok(e)) knock(e,3); })); shake(); }); break;
    case 'daisharin': at(T, ()=>{ const fx=frontX(); FX.push({type:'ring', x:fx, y:88, t:0, dur:.35, col:'#c8d8ff', big:true}); living().filter(e=>eBox(e).front<=fx+60 && low(e)).forEach(e=>{ hit(e,1.4); lift(e,28); }); }); break;
    case 'tentotsu': at(T, ()=>{ const a=airs(); if(a.length){ a.forEach(e=>{ const b=eBox(e); FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.25, col:'#c8d8ff'}); hit(e,2.4/1.5); if(ok(e)) e.vly=Math.max(e.vly,220); }); float(a.length+'体 天突！','tag',center().x,26); }
      else byFront().slice(0,2).forEach(e=>{ hit(e,1.2); lift(e,30); }); }); break;
    case 'ryuuga': at(T, ()=>{ const c=center(); FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.5}); FX.push({type:'quake', x:c.x, y:GROUND+3, t:0, dur:.5}); flash(); shake(true); hitstop(.08);
      living().forEach(e=>{ hit(e,2.6); if(ok(e)) { if(e.air>0) e.vly=Math.max(e.vly,180); else lift(e,40); } }); }); break;
    case 'issen': at(T, ()=>{ const e=strongest(3); if(!e) return; const b=eBox(e); FX.push({type:'slash', x1:b.cx-26, y1:b.cy-10, x2:b.cx+26, y2:b.cy+6, t:0, dur:.2}); hit(e,2.4,false,{crit:Math.random()<.4}); }); break;
    case 'kasumi': at(T, ()=>{ slashFx(frontX(), false); FX.push({type:'cloud', x:frontX()+20, y:88, r:30, t:0, dur:.5}); byFront().slice(0,5).forEach(e=>{ hit(e,1.1); if(ok(e)&&manual) e.t+=1; }); }); break;
    case 'battou': at(T, ()=>{ FX.push({type:'slash', x1:frontX()-10, y1:90, x2:200, y2:96, t:0, dur:.25}); living().filter(low).forEach((e,j)=>hit(e,1.6,j>0,{crit:Math.random()<.25})); }); break;
    case 'tsukikage': at(T, ()=>{ const a=airs(); if(a.length){ a.forEach(e=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.2}); hit(e,2.2/1.5,false,{crit:Math.random()<.4}); }); float(a.length+'体 月影！','tag',center().x,26); }
      else byFront().slice(0,3).forEach(e=>{ hit(e,1.2); lift(e,30); }); }); break;
    case 'hiken': at(T, ()=>{ FX.push({type:'slash', x1:60, y1:60, x2:200, y2:104, t:0, dur:.35}); FX.push({type:'slash', x1:60, y1:104, x2:200, y2:60, t:-.08, dur:.35}); flash(); shake(true); hitstop(.1);
      living().forEach(e=>{ if(!e.boss && Math.random()<.1) direct(e, e.hp); else hit(e,3.0); }); }); break;
  }
}

// ===== スキルツリー（武器ごとの パッシブ。レベル3ごとに 1ポイント） =====
const WP_COMMON = [
  {k:'pow',  n:'技の威力',   d:r=>`この 武器の ひらめき技 +${6*r}%`},
  {k:'atk',  n:'通常攻撃',   d:r=>`この 武器の 通常攻撃 +${6*r}%`},
  {k:'cd',   n:'早業',       d:r=>`この 武器の ひらめき技の 再使用 -${4*r}%`},
  {k:'crit', n:'会心',       d:r=>`会心率 +${2*r}%`},
];
const WP_SPECIAL = {
  sword: {k:'launch', n:'打ち上げ',   d:r=>`打ち上げの 高さ +${6*r}%`},
  dagger:{k:'critd',  n:'急所',       d:r=>`会心の 倍率 +${(.08*r).toFixed(2)}`},
  fist:  {k:'bump',   n:'お手玉',     d:r=>`空中の 敵の 浮き直し +${10*r}%`},
  staff: {k:'area',   n:'大魔法',     d:r=>`魔法の 範囲 +${6*r}%`},
  bow:   {k:'air',    n:'鷹の目',     d:r=>`空中の 敵へ +${6*r}%`},
  spear: {k:'air',    n:'天を つく',   d:r=>`空中の 敵へ +${6*r}%`},
  katana:{k:'critd',  n:'見切り',     d:r=>`会心の 倍率 +${(.08*r).toFixed(2)}`},
};
const WP_MAX = 5;
const wpNodes = wt => [...WP_COMMON, WP_SPECIAL[wt]];
const wpRank = (wt, k) => ((P.wtree||{})[wt]||{})[k] || 0;
const wpTotal = () => Math.floor(P.hero.lv/3);
const wpSpent = () => Object.values(P.wtree||{}).reduce((a,t)=>a+Object.values(t).reduce((x,y)=>x+y,0), 0);
const wpLeft = () => wpTotal() - wpSpent();
const wpResetCost = () => 50 * P.hero.lv;
function applyWTree(s){
  const wt = curWT(), r = k => wpRank(wt, k);
  s.pw.wSkill = 6*r('pow'); s.pw.wAtk = 6*r('atk'); s.pw.wCdr = 4*r('cd'); s.crit += 2*r('crit');
  if(r('launch')) s.pw.launchUp = (s.pw.launchUp||1)*(1+.06*r('launch'));
  if(r('critd')) s.critMul += .08*r('critd');
  if(r('bump')) s.pw.otedama = (s.pw.otedama||1)*(1+.1*r('bump'));
  if(r('area')) s.pw.flare = (s.pw.flare||1)*(1+.06*r('area'));
  if(r('air')) s.air += 6*r('air');
}
let WPSEL = null;
function panelWTree(){
  const wt = WPSEL || curWT();
  let h = `<h3>スキルレベル（武器の 熟練）</h3><p class="hint">ゆうしゃの レベル 3ごとに 1ポイント。ポイントを 振った 武器を 持っている あいだ 効果が 出る。</p>
    <div class="kv"><span><i>のこり ポイント</i><b class="r2">${wpLeft()}</b></span><span><i>合計</i>${wpTotal()}</span></div>
    <div class="chips">${WT.map(w=>`<button class="chip ${w===wt?'on':''}" data-act="wp-sel" data-k="${w}">${WT_N[w]}${w===curWT()?'（いま）':''}<small>${wpNodes(w).reduce((a,n)=>a+wpRank(w,n.k),0)}</small></button>`).join('')}</div><div class="list">`;
  for(const nd of wpNodes(wt)){
    const r = wpRank(wt, nd.k), mx = r >= WP_MAX;
    h += `<div class="li" style="cursor:default;align-items:center"><div class="body"><div class="t"><span>${nd.n}</span><span class="wpr">${'■'.repeat(r)}${'□'.repeat(WP_MAX-r)}</span></div><div class="d">いま：${r?nd.d(r):'―'}${mx?'':` → 次：${nd.d(r+1)}`}</div></div>
      <button class="btn sm" data-act="wp-up" data-w="${wt}" data-k="${nd.k}" ${!mx && wpLeft()>0?'':'disabled'} style="flex:none">${mx?'最大':'＋1'}</button></div>`;
  }
  h += `</div><div class="row" style="margin-top:6px"><button class="btn sm" data-act="wp-reset" ${wpSpent() && P.gold>=wpResetCost()?'':'disabled'}>ぜんぶ 振り直す（${fmt(wpResetCost())}G）</button></div>`;
  return h;
}
$('#panel').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-act^="wp-"]'); if(!b) return;
  const a = b.dataset.act;
  if(a==='wp-sel') WPSEL = b.dataset.k;
  else if(a==='wp-up'){ const w=b.dataset.w, k=b.dataset.k; if(wpLeft()<=0 || wpRank(w,k)>=WP_MAX) return; P.wtree=P.wtree||{}; P.wtree[w]=P.wtree[w]||{}; P.wtree[w][k]=wpRank(w,k)+1; refreshHS(); save(); }
  else if(a==='wp-reset'){ if(P.gold < wpResetCost()) return; P.gold -= wpResetCost(); P.wtree = {}; refreshHS(); save(); }
  renderCamp();
});
// セット中なのに いまの 武器では 使えない 技
const unusableSet = () => P.slots.filter((v,j)=>v && slotOpen(j) && !skillUsable(v));
// いまの 武器で 使える 技を 空き枠・使えない 枠に まとめて セット（★が 多い 技 → あとで ひらめく 技 の 順）
const fitPool = () => { const set = new Set(P.slots.filter((v,j)=>v && slotOpen(j)));
  return Object.keys(P.skills).filter(id=>SK[id] && skillUsable(id) && !set.has(id))
    .sort((a,b)=> stageOf(P.skills[b].m)-stageOf(P.skills[a].m) || (SK[b].req||0)-(SK[a].req||0) || P.skills[b].m-P.skills[a].m); };
const canFit = () => fitPool().length > 0 && [0,1,2,3].some(j=>slotOpen(j) && (!P.slots[j] || !skillUsable(P.slots[j])));
function autoFitSkills(){
  ensureRoot();
  const pool = fitPool(); let n = 0;
  for(let j=0;j<4;j++){ if(!slotOpen(j)) continue; const v = P.slots[j]; if(v && skillUsable(v)) continue;
    const nx = pool.shift(); if(nx){ P.slots[j] = nx; n++; } }
  if(n){ save(); renderSkillButtons(); }
  return n;
}
