// ===== キャンバス =====
const W = 200, H = 112, GROUND = 97;
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;
const sprURL = {};
const urlOf = k => sprURL[k] || (sprURL[k] = getSpr(k).toDataURL());
const imgTag = (k, cls='', st='') => `<img class="px ${cls}" src="${urlOf(k)}" alt="" style="${st}">`;

// ===== ステージの 背景 =====
const BG = {};
function seeded(n){ let s=n; return ()=> (s=(s*9301+49297)%233280)/233280; }
function makeBg(type){
  const c = document.createElement('canvas'); c.width=W; c.height=H;
  const b = c.getContext('2d'), rnd = seeded(7);
  const bands = (cols, h=13) => cols.forEach((col,i)=>{ b.fillStyle=col; b.fillRect(0, i*h, W, h+1); });
  const hills = (col, base, amp, f1, f2, ph) => { b.fillStyle=col; for(let x=0;x<W;x++){ const h=Math.round(amp+amp*.6*Math.sin(x/f1+ph)+amp*.4*Math.sin(x/f2)); b.fillRect(x, base-h, 1, h+12); } };
  const ground = (top, main, line, specks) => { b.fillStyle=top; b.fillRect(0,78,W,3); b.fillStyle=main; b.fillRect(0,81,W,H-81); b.fillStyle=line; b.fillRect(0,81,W,1);
    for(let i=0;i<90;i++){ b.fillStyle = specks[i%specks.length]; b.fillRect(Math.floor(rnd()*W), 83+Math.floor(rnd()*(H-84)), 2, 1); } };
  if(type==='grass' || type==='camp'){
    bands(['#a9d6ec','#b6dcee','#c4e2ee','#d2e8ec','#dfeee8']);
    hills('#b9d6a6', 70, 10, 17, 7, 1); hills('#93bf7c', 78, 6, 11, 5, 2);
    ground('#7aa85a', '#c9b27a', '#b79c62', ['#b79c62','#d6c290']);
    b.fillStyle='#6f9a50'; for(let i=0;i<26;i++){ const x=Math.floor(rnd()*W); b.fillRect(x,77,1,2); b.fillRect(x+1,76,1,3); }
    if(type==='camp'){
      // テントは 毎フレーム 描く（タップで うごく）
      // たき火の まき
      b.fillStyle='#6a4428'; b.fillRect(104,95,16,3); b.fillRect(106,93,12,2);
      b.fillStyle='#8a8a90'; for(let i=0;i<7;i++) b.fillRect(100+i*3, 98, 2, 2);
    }
  }else if(type==='forest'){
    bands(['#9cc9a8','#a9d3b0','#b5dbb8','#c2e2c0','#cfe8c8']);
    for(let i=0;i<14;i++){ const x=Math.floor(rnd()*W), r=10+Math.floor(rnd()*10), y=40+Math.floor(rnd()*20);
      b.fillStyle='#4a3424'; b.fillRect(x-2, y, 4, 80-y);
      b.fillStyle= i%2 ? '#3f7a3a' : '#2f6430'; b.beginPath(); b.arc(x, y, r, 0, Math.PI*2); b.fill(); }
    hills('#3f7a3a', 78, 5, 9, 4, 1);
    ground('#4f8a3a', '#8a7a4a', '#6a5a34', ['#6a5a34','#a0905a','#5a8a3a']);
  }else if(type==='cave'){
    const g=b.createLinearGradient(0,0,0,81); g.addColorStop(0,'#251c2c'); g.addColorStop(1,'#4a3c4a'); b.fillStyle=g; b.fillRect(0,0,W,81);
    b.fillStyle='#3a2e3c'; for(let x=0;x<W;x+=7){ const h=6+Math.floor(rnd()*18); for(let y=0;y<h;y++){ const w=Math.max(1,Math.round(3*(1-y/h))); b.fillRect(x+3-w, y, w*2, 1); } }
    b.fillStyle='#5a4a58'; for(let x=0;x<W;x++){ const h=Math.round(10+6*Math.sin(x/9)+5*Math.sin(x/4+1)); b.fillRect(x, 80-h, 1, h); }
    b.fillStyle='#ffd27a'; [[30,40],[150,34]].forEach(([x,y])=>{ b.globalAlpha=.25; b.beginPath(); b.arc(x,y,9,0,Math.PI*2); b.fill(); b.globalAlpha=1; b.fillRect(x-1,y-1,3,4); b.fillStyle='#6a4428'; b.fillRect(x,y+3,1,6); b.fillStyle='#ffd27a'; });
    ground('#6a5a60', '#5a4a48', '#4a3c3a', ['#6a5a56','#4a3c3a','#7a6a60']);
  }else if(type==='desert'){
    bands(['#f0b878','#f4c690','#f8d4a8','#fae0bc','#fcead0']);
    b.fillStyle='#fff4cc'; b.beginPath(); b.arc(40,22,10,0,Math.PI*2); b.fill();
    hills('#e8c48a', 72, 9, 23, 9, .5); hills('#dcb070', 79, 5, 14, 6, 2);
    ground('#d8b070', '#e8c890', '#d0a868', ['#d0a868','#f0d8a8']);
    b.fillStyle='#5a8a3a'; [[60,62],[172,58]].forEach(([x,y])=>{ b.fillRect(x,y,3,18); b.fillRect(x-3,y+5,2,6); b.fillRect(x-3,y+9,4,2); b.fillRect(x+4,y+3,2,7); b.fillRect(x+2,y+8,4,2); });
  }else if(type==='snow'){
    bands(['#c0d4ea','#cadcef','#d6e4f2','#e2ecf6','#eef4fa']);
    b.fillStyle='#a8bcd4'; for(let x=0;x<W;x++){ const h=Math.round(22+14*Math.abs(Math.sin(x/26))+6*Math.sin(x/7)); b.fillRect(x,72-h,1,h+8); }
    b.fillStyle='#ffffff'; for(let x=0;x<W;x++){ const h=Math.round(22+14*Math.abs(Math.sin(x/26))+6*Math.sin(x/7)); b.fillRect(x,72-h,1,Math.max(2,Math.round(h*.3))); }
    hills('#e8f0f8', 79, 5, 12, 5, 1);
    ground('#ffffff', '#f2f6fb', '#d8e4f0', ['#d8e4f0','#e4ecf6','#c8d8ea']);
  }else if(type==='hell'){
    bands(['#2a0814','#3a0c1c','#4a1222','#5a1a28','#6a2230']);
    b.fillStyle='#1e0610'; for(let x=0;x<W;x++){ const h=Math.round(14+10*Math.abs(Math.sin(x/13))+8*Math.abs(Math.sin(x/5+1))); b.fillRect(x,80-h,1,h); }
    ground('#5a1a1a', '#3a1414', '#2a0c0c', ['#5a2020','#2a0c0c']);
    b.fillStyle='#ff6a2a'; for(let i=0;i<14;i++){ let x=Math.floor(rnd()*W), y=84+Math.floor(rnd()*24); for(let k=0;k<6;k++){ b.fillRect(x,y,2,1); x+=2; y+=Math.floor(rnd()*3)-1; } }
  }
  return c;
}
const bgOf = t => BG[t] || (BG[t] = makeBg(t));
const SKY = {grass:true, camp:true, forest:false, desert:true, snow:true};
const DUST = {grass:['#e8dcb4','#b79c62'], camp:['#e8dcb4','#b79c62'], forest:['#a0905a','#6a5a34'], cave:['#7a6a60','#4a3c3a'], desert:['#f0d8a8','#d0a868'], snow:['#ffffff','#d8e4f0'], hell:['#5a2020','#ff6a2a']};
const CLOUDS = [{x:20,y:12,w:22},{x:90,y:22,w:16},{x:150,y:9,w:26}];

// ===== 仲間の 並び（0 は ゆうしゃ） =====
// 列 0 は ゆうしゃ、1〜3 は パーティの 仲間（buildParty で 組み直す）
const CH = [{id:'hero', fam:'hero', name:'ゆうしゃ', spr:'hero_senshi', role:'', sp:'', cd:0.7, hx:66, hy:93}];
const ACT = CH.map(c => ({c, x:c.hx, y:c.hy, anim:null, kx:0, flash:0, sqx:1, sqy:1, rot:0, flip:false, alpha:1}));
const SPR_OF = id => id==='hero' ? heroSpr() : id==='waza' ? 'bulb' : id==='maou' ? 'b_maou' : id==='guard' ? 'b_guard' : id==='shadow' ? 'b_shadow' : id==='source' ? 'b_source2' : SPR[id] ? id : 'bulb';
function syncHero(){ const J=JOBS[P.job], A=atkInfo(); Object.assign(CH[0], {spr:heroSpr(), role:A.role, sp:J.sp, cd:A.cd}); renderButtons(); }

// ===== 戦闘の 状態 =====
let mode = 'camp';
const newBattle = () => ({time:0, es:[], wait:true, lock:0, hs:0, waveName:'', st:0, rd:1, L:1, waveIdx:0, pmax:1, php:1,
  cd:[0,0,0,0], cdMax:[1,1,1,1], aw:[.5,.5,.5,.5], combo:0, comboT:0, chain:0, last:null, hist:[], used:new Set(),
  gauge:0, auto:false, sp:[0,0,0,0], sp2:[0,0,0,0], buffT:0, moon:null, scd:[0,0,0,0], scdMax:[1,1,1,1], bulb:null, freeze:0, queue:[], cut:null, kc:0, kcT:0, wave:0, bg:'camp', endured:false, raised:false, regenT:0});
let S = newBattle();
let R = null;   // この出撃で 手に入れたもの
const PARTS = [], FX = [], PROJ = [];
const living = () => S.es.filter(e=>!e.dead);

// ===== 軽くする設定 =====
const QUALITY = {
  high: {parts:900, floats:24, burst:1, shadow:true},
  mid:  {parts:400, floats:10, burst:2, shadow:true},
  low:  {parts:150, floats:0,  burst:0, shadow:false},
};
const OPT = {burst:1, shadow:true};
function applyOpt(){
  const Q = QUALITY[P.opt.q] || QUALITY.high;
  CFG.maxParts = Q.parts; CFG.maxFloats = Q.floats; OPT.burst = Q.burst; OPT.shadow = Q.shadow;
}

// ===== 演出の部品 =====
const _dom = {};
function setT(sel, v, html){ if(_dom[sel]===v) return; _dom[sel]=v; const el=$(sel); if(html) el.innerHTML=v; else el.textContent=v; }
function setW(sel, v){ v=Math.round(clamp(v,0,100)*2)/2; if(_dom[sel+'w']===v) return; _dom[sel+'w']=v; const el=$(sel); if(el) el.style.transform='scaleX('+(v/100)+')'; }
let KS = 1;
const measureK = () => { KS = (cv.clientWidth || W*2) / W; };
addEventListener('resize', measureK);
let floatCount = 0;
function float(text, cls, x, y, col){
  if(floatCount >= CFG.maxFloats && (!cls || cls==='air' || cls==='crit')) return;
  const d = document.createElement('div');
  d.className = 'dmg '+(cls||''); d.textContent = text;
  if(col) d.style.color = col;
  if(typeof CAM!=='undefined' && CAM.z<1){ x = camX(x); y = camY(y); }
  d.style.left = (x*KS)+'px'; d.style.top = (y*KS)+'px';
  $('#stage').appendChild(d); floatCount++;
  setTimeout(()=>{ d.remove(); floatCount--; }, 850);
}
// 演出は Web Animations で 再生（クラスの 付けはずしで 起きる 強制レイアウトを さける）
const replay = (el, kf, ms) => { el.getAnimations().forEach(a=>a.cancel()); el.animate(kf, {duration:ms, easing:'linear'}); };
const KF_BAN = [{opacity:0, transform:'scale(.6)', offset:0}, {opacity:1, transform:'scale(1.15)', offset:.15}, {transform:'scale(1)', offset:.3}, {opacity:1, offset:.8}, {opacity:0, offset:1}];
const KF_SHK = [[0,0],[-4,2],[4,-2],[-2,1],[0,0]].map(([x,y])=>({transform:`translate(${x}px,${y}px)`}));
const KF_SHK2 = [[0,0,0],[-8,5,.15],[8,-5,.3],[-6,3,.45],[5,-2,.6],[-2,1,.8],[0,0,1]].map(([x,y,o])=>({transform:`translate(${x}px,${y}px)`, offset:o}));
let _shkT = 0;
function banner(t){ const b=$('#banner'); b.textContent=t; replay(b, KF_BAN, 1100); }
function shake(big){ if(!P.opt.shake) return; const n=performance.now(); if(!big && n-_shkT<120) return; _shkT=n; replay($('#stage'), big?KF_SHK2:KF_SHK, big?450:300); }
function flash(){ replay($('#flash'), [{opacity:.95},{opacity:0}], 450); }
// ヒットストップ（当たった 瞬間に 一瞬 止める 演出）。強さは 設定で えらべる。連続で 止まり続けないよう 間隔を あける
const HS_MUL = {full:1.8, weak:.4, off:0};   // 強は はっきり 重く、弱は かるく
let _hsNext = 0;
function hitstop(t){
  const m = HS_MUL[P.opt.hs || 'weak'] ?? .4; if(!m) return;
  const now = performance.now(), d = t*m;
  if(now < _hsNext && t < .12) return;
  S.hs = Math.max(S.hs, d); _hsNext = now + d*1000 + (P.opt.hs==='full' ? 120 : 250);
}
function sparks(x, y, n, cols, spd=70){
  for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=spd*(.4+Math.random()*.8);
    PARTS.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,life:.25+Math.random()*.2,max:.45,col:cols[i%cols.length],sz:1,g:120}); }
}
function dust(x, y, n, spread=1){
  const dc = DUST[S.bg] || DUST.grass;
  for(let i=0;i<n;i++){ const dir = i%2?1:-1;
    PARTS.push({x:x+dir*Math.random()*6*spread,y:y-1,vx:dir*(20+Math.random()*50)*spread,vy:-10-Math.random()*25,life:.35+Math.random()*.25,max:.6,col:dc[i%3?0:1],sz:2,g:60,floor:y}); }
}
const pixCache = {};
function pixelsOf(key){
  if(pixCache[key]) return pixCache[key];
  const c = getSpr(key), w=c.width, h=c.height;
  const data = c.getContext('2d').getImageData(0,0,w,h).data, out=[];
  for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const o=(j*w+i)*4; if(data[o+3]<10) continue;
    out.push({dx:(w-1-i)-w/2, dy:j-h/2, col:`rgb(${data[o]},${data[o+1]},${data[o+2]})`}); }
  return pixCache[key]=out;
}
function burstSprite(key, cx, cy, s){
  if(!OPT.burst) return;
  const step = OPT.burst * (PARTS.length > CFG.maxParts*.6 ? 3 : PARTS.length > CFG.maxParts*.3 ? 2 : 1);
  const px = pixelsOf(key);
  for(let k=0;k<px.length;k+=step){ const q=px[k];
    const x = cx + q.dx*s, y = cy + q.dy*s;
    const a = Math.atan2(y-cy, x-cx) + (Math.random()-.5)*.6, v = 40+Math.random()*90;
    PARTS.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:.45+Math.random()*.35,max:.8,col:q.col,sz:Math.max(1,s-1)*(step>1?1.5:1),g:160,floor:GROUND+12});
  }
}
function eBox(e){
  const c = getSpr(e.key); const w=c.width*e.s, h=c.height*e.s;
  const fy = e.y - e.fl - e.ly;
  return {front: e.x + e.kx - w/2, cx: e.x + e.kx, cy: fy - h/2, top: fy - h, w, h, fy};
}
function frontX(){ const l=living(); return l.length ? Math.min(...l.map(e=>eBox(e).front)) : 130; }
function center(){
  const l=living(); if(!l.length) return {x:150,y:80};
  return {x:l.reduce((s,e)=>s+e.x,0)/l.length, y:l.reduce((s,e)=>s+eBox(e).cy,0)/l.length};
}
function later(sec, fn){ S.queue.push({at:S.time+sec, fn}); }
const low = e => (e.ly||0) <= CFG.meleeH;   // 近接攻撃が とどく 高さに いるか
function launch(e, h){ if(mode==='battle' && !P.seen.airTip){ P.seen.airTip = 1; airTip(); } e.air=1; e.bn=0; e.vly=Math.sqrt(2*CFG.gAir*h*(HS.pw.floaty?1.5:1)); e.rot=0; }
const RCOL = ['#ffffff','#7fb2ff','#ffd84a','#ff9a3a','#62e07a','#ff6ad5'];

// ===== 群れの 出現 =====
function slots(n){
  const rows = n<=12 ? 3 : n<=24 ? 4 : 5;
  const cols = Math.ceil(n/rows);
  const x0 = 110, x1 = 190, y0 = 86, y1 = 107;
  const dx = cols>1 ? (x1-x0)/(cols-1) : 0, dy = (y1-y0)/(rows-1);
  const out=[];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) out.push({x:x0+c*dx+(r%2)*dx*.5+rand(-2,2), y:y0+r*dy+rand(-1,1)});
  out.sort(()=>Math.random()-.5);
  return out.slice(0,n);
}
function makeEnemy(k, x, y, boss){
  const L=S.L, d=EDEF[k];
  const hp = Math.round(eHp(L)*(boss?12:1)*(S.tut?.6:1));
  return { hp, max:hp, boss, name:d.n, key:k, s: boss?3:2, x, y, fl:d.fly||0,
    air:0, bn:0, stun:0, t:rand(...CFG.firstAtk)*(boss?.7:1), atk:eAtk(L)*(boss?3:1),
    ly:60+rand(0,50), vly:rand(-40,0), kx:0, flash:0, rot:0, lunge:-1, slamFx:false, dead:false, dying:0, burst:false, landed:false,
    burn:0, burnT:0, pin:0, sleep:0, hx:x, vx:0, spin:0 };
}
function spawnWave(){
  if(S.tower) return towerWave();
  S.waveIdx++;
  const st = STAGES[S.st], L = S.L;
  S.es = [];
  if(S.tut) tutWave(S.waveIdx);
  if(S.waveIdx <= WAVES){
    const cc = S.tut ? {n:3 + S.waveIdx, rm:1} : capCount(S.st, S.rd, L, S.waveIdx), n = Math.round(cc.n*(hasT('horde')?1.5:1));
    const kinds = [...st.en].sort(()=>Math.random()-.5).slice(0, Math.min(st.en.length, 2 + (S.waveIdx>=3?1:0)));
    slots(n).forEach((p,i)=>{ const e = makeEnemy(kinds[i%kinds.length], p.x, p.y, false); e.rm = cc.rm; S.es.push(e); });
    S.waveName = st.n+'の 群れ';
    banner('WAVE '+S.waveIdx);
  }else{
    const cc = S.tut ? {n:3, rm:1} : capCount(S.st, S.rd, L, WAVES, .6), n = cc.n;
    S.es.push(makeEnemy(st.boss, 168, 100, true));
    slots(Math.round(n*1.5)).filter(p=>Math.abs(p.x-168)>16 || Math.abs(p.y-100)>7).slice(0,n).forEach((p,i)=>{ const e = makeEnemy(st.en[i%st.en.length], p.x, p.y, false); e.rm = cc.rm; S.es.push(e); });
    S.waveName = 'BOSS '+EDEF[st.boss].n;
    banner('BOSS!');
  }
  applyTraits();
  S.wave = S.es.length;
  S.wait = false;
  if(HS.pw.lullaby) S.es.forEach(e=>{ e.sleep = 2; e.stun = Math.max(e.stun, 2); });
  updWaveTxt();
}
const updWaveTxt = () => setT('#waveTxt', S.tower ? `塔 ${S.floor}F${S.floor%10===0?' BOSS':''}` : `${STAGES[S.st].n} ${S.rd}周目　${S.waveIdx<=WAVES ? 'W'+S.waveIdx+'/'+WAVES : 'BOSS'}`);
const chainMul = () => 1+.12*clamp(S.chain-1, 0, CFG.chainMax-1);   // 連携の 倍率（上限あり）
function endCombo(){ S.combo=0; S.chain=0; S.last=null; S.hist=[]; S.used=new Set(); }

// ===== ダメージ =====
function powerOf(src){
  return basePower(src) * (S.buffT>0 ? 1.5 : 1);
}
function basePower(src){
  if(src===0){
    let a = HS.atk;
    if(HS.pw.toushi && S.php < S.pmax*.5) a *= 1.3;
    if(HS.pw.oni && S.php < S.pmax*.3) a *= 2;
    if(HS.pw.touki) a *= 1 + Math.min(.5, S.combo*.005);
    return a;
  }
  return CH[src] ? CH[src].pow : 0;
}
function addHit(e, src, mult, manual, quiet, o={}){
  if(!e||e.dead) return 0;
  const chainM = chainMul();
  const comboM = 1+.01*Math.min(S.combo,100);
  let airM = 1;
  if(e.air>0) airM = 1.5*(1+HS.air/100)*(o.airX||1)*(hasT('wing')?1.2:1);
  if(e.sleep>0) airM *= CFG.sleepDmg;
  let m = powerOf(src)*mult*chainM*comboM*airM*(manual||HS.pw.danceDmg?1:CFG.autoPower);
  if(o.mag) m *= 1+HS.mag/100;
  if(o.sp) m *= 1+(HS.pw.spDmg||0)/100;
  if(e.boss) m *= 1+(HS.pw.bossDmg||0)/100;
  if(hasT('rock') && !(e.air>0)) m *= .5;   // いわの周: 浮かせないと 通りにくい
  if(src===0){
    if(HS.pw.magicBlade && !o.mag && !o.sp) m *= 1+HS.mag/100;
    if(!o.sp && S.ssMulT > S.time) m *= 3;
    if(o.sp && HS.pw.dice) m *= Math.random()<.5 ? .6 : 1.8;
  }
  if(src===0 && HS.pw.combo100 && S.combo>=100) m *= 1.3;
  let crit = false;
  if(src===0 && (o.crit || Math.random()*100 < HS.crit)){ crit=true; m *= HS.critMul; }
  const dmg = Math.max(1, Math.round(m));
  e.hp -= dmg; S.combo++; S.comboT=CFG.comboTimeout;
  S.gauge = Math.min(100, S.gauge+(manual?CFG.manualGauge:CFG.autoGauge));
  if(crit && !e.boss && ((HS.pw.execute && e.hp < e.max*.2) || (HS.pw.mikazuki && Math.random()<.1))) e.hp = 0;
  if(src===0){
    if(HS.pw.ls) S.php = Math.min(S.pmax, S.php + Math.min(dmg*HS.pw.ls/100, S.pmax*.02));
    if(!e.boss && e.hp>0 && HS.pw.iceBlade && Math.random()*100 < HS.pw.iceBlade) e.stun = Math.max(e.stun, 1);
    if(!e.boss && e.hp>0 && HS.pw.stopChance && Math.random()*100 < HS.pw.stopChance){ e.stun = Math.max(e.stun, 3); e.t = Math.max(e.t, 3); }
    if(crit && o.sp && HS.pw.zantetsu && !e.boss && Math.random() < .1) e.hp = 0;
  }
  if(src===0 && HS.pw.sleepHit && !e.boss && e.hp>0 && Math.random()*100 < HS.pw.sleepHit){ e.sleep=CFG.sleepTime; e.stun=Math.max(e.stun,CFG.sleepTime); }
  if(src===0 && (HS.pw.burnAll || (o.mag && HS.pw.magBurn))) e.burn = 3;
  if(o.mag && HS.pw.chill) e.t += 1;
  if(src===0 && HS.pw.steal && Math.random()*100 < HS.pw.steal) steal(e, false);
  if(src===0 && HS.pw.bolt && Math.random()*100 < HS.pw.bolt && !o.noBolt) bolt(e, manual);
  const b = eBox(e);
  if(!quiet) float(crit ? dmg+'!' : dmg, crit?'crit':(airM>1?'air':''), b.cx + rand(-6,6), b.top - 2 + rand(0,6));
  e.flash = .07; e.kx = Math.min(e.kx+2, 5);
  knock(e, mult*(crit?1.6:1)*(o.sp?1.3:1));
  if(e.air>0 && manual){ const hf = clamp(1 - (e.ly-35)/40, 0, 1); if(hf>0) e.vly = Math.max(e.vly, CFG.bump*(src===0 && HS.pw.otedama || 1)*hf); }
  sparks(b.cx-2, b.cy, S.es.length>20 ? 1 : 3, crit ? ['#ffffff','#ff8e3c'] : ['#ffffff','#ffe14a','#ffb04a']);
  if(e.hp<=0) kill(e);
  return dmg;
}
// ===== ふっとび（当たると 後ろへ 飛ぶ・回る・奥の 壁で はね返る） =====
function knock(e, pow){
  if(!e || e.dead || P.opt.knock===false) return;
  const k = Math.min(1.6, pow/2), bossK = e.boss ? .2 : 1, air = e.air>0;
  const v = (35 + 150*k) * (air ? 1.5 : 1) * bossK;
  if(v > (e.vx||0)) e.vx = v;
  if(!e.boss && (air || k >= 1)) e.spin = Math.min(30, (e.spin||0) + (air ? 6 : 3) + 10*k);
  if(!e.boss && !air && e.ly<=0 && k >= 1.2){ e.vly = Math.max(e.vly, 90); e.bn = Math.max(e.bn, 1); }
}
function direct(e, dmg){
  if(!e||e.dead) return;
  e.hp -= dmg; e.flash=.12; e.kx=6;
  if(e.hp<=0) kill(e);
}
function steal(e, big){
  const g = eGold(S.L)*(big?3:2)*(1+HS.gold/100);
  P.gold += g; R.gold += g;
  const b = eBox(e); float('+'+fmt(g)+'G', 'gold', b.cx, b.top-10);
  if(HS.pw.mug && Math.random()*100 < HS.pw.mug) drop(e, false);
}
function bolt(e0, manual){
  const ts = living().sort((a,b)=>Math.abs(a.x-e0.x)-Math.abs(b.x-e0.x)).slice(0,3);
  ts.forEach(e=>{ const b=eBox(e); FX.push({type:'bolt', x:b.cx, y:b.cy, t:0, dur:.18}); addHit(e, 0, .6, manual, true, {noBolt:true}); });
}
function kill(e){
  if(S.demo){ e.hp = e.max; return; }   // お試しの 的は 倒れない
  if(e.maou) S.maouDown = true;
  e.dead=true; e.dying=.2;
  S.kc++; S.kcT=.45;
  hitstop(Math.min(.09, .025+.008*S.kc));
  const L=S.L, rm = e.boss ? 1 : (e.rm||1), mul = e.boss ? 20 : rm;
  const ex = eExp(L)*mul*(1+HS.exp/100)*(e.rare?5:1)*(e.elite?3:1), g = eGold(L)*(e.boss?15:rm)*(1+HS.gold/100)*(e.rare?10:1)*(e.elite?3:1)*(hasT('gold')?2:1);
  R.exp += ex; R.gold += g; P.gold += g; P.stats.kills++; R.kills = (R.kills||0)+1;
  gainJP(e.boss ? 10 : rm);
  gainExp(ex);
  if(e.boss) drop(e, true);
  if(e.boss && !S.tower && S.st===5 && S.rd>=11 && Math.random() < .02) later(.3, ()=>gotArt(e));   // 11周目からの 魔界ボスが ごく まれに 神器
  else if(Math.random() < Math.min(.9, CFG.dropRate*(HS.pw.dropX||1)*rm)) drop(e, false);
  if(HS.pw.kyukon) S.php = Math.min(S.pmax, S.php + S.pmax*.005);
  townOnKill(e);
  traitOnKill(e);
  rollRecruit(e);
  if(!living().length) waveClear();
}
function drop(e, boss){
  const it = genItem(S.L, boss, boss);
  const r = addInv(it);
  R.items.push({it, r});
  const b = eBox(e);
  float((r==='ok'?'':'売却 ')+it.name, 'loot', b.cx, b.top-14, RCOL[it.rar]);
}
function gainExp(x){
  allyGainExp(x);
  P.hero.exp += x; let up = 0;
  while(P.hero.exp >= needExp(P.hero.lv)){ P.hero.exp -= needExp(P.hero.lv); P.hero.lv++; up++; }
  if(up){
    const old = S.pmax; refreshHS(); refreshPartyPow(); S.pmax = partyMaxHp(); S.php = Math.min(S.pmax, S.php + (S.pmax-old));
    later(.3, ()=>banner('レベルアップ！ Lv'+P.hero.lv));
  }
}
function gainJP(n){
  const j = P.job, before = jobLv(j);
  n *= HS.pw.timeSand ? 1.3 : 1; P.jobs[j].jp += n; R.jp += n;
  const after = jobLv(j);
  if(after > before){
    refreshHS();
    const ab = JOBS[j].ab.filter(a=>a.lv>before && a.lv<=after).map(a=>a.n).join('・');
    later(.6, ()=>banner(JOBS[j].n+' Lv'+after+(after>=JOB_MAX?' マスター！':'')));
    R.learned.push(ab);
  }
}
