// ===== 神器（ユニークより 上の レア度。武器の 系統ごとに 1本。特殊な 飛び道具・設置物の 効果） =====
const ARTI = {
  shippuu:  {wt:'sword',  n:'疾風の剣',     p:'攻撃の たびに 三日月の 衝撃波が 地面を 走り、地上の 敵を まとめて 斬る'},
  kazakiri: {wt:'dagger', n:'風切りの短剣', p:'攻撃の 25%で 刃の ブーメランが 飛んで 戻る（行きと 帰りで 当たる）'},
  eisei:    {wt:'fist',   n:'衛星の手甲',   p:'光の玉が 2つ まわりを 回り、ふれた 敵に ダメージ'},
  kouki:    {wt:'staff',  n:'光輝の杖',     p:'攻撃の 20%で レーザーを 撃ち、線上の 敵を すべて つらぬく'},
  hoshikuzu:{wt:'bow',    n:'星屑の弓',     p:'攻撃の 35%で 敵の まわりに キラキラが 3秒 ただよい、ふれた 敵に ダメージ（空中にも 当たる）'},
  tenchu:   {wt:'spear',  n:'天柱の槍',     p:'攻撃の 40%で 先頭の 敵に 光の柱。まわりの 敵ごと 打ち上げる'},
  zangetsu: {wt:'katana', n:'残月の刀',     p:'攻撃の あと 残像が 手前の 3体を もう一度 斬る'},
};
for(const k in ARTI) ARTI[k].fx = s => { s.pw['a_'+k] = true; };
const ARTI_TAGS = {shippuu:'area', kazakiri:'air', eisei:'single', kouki:'area air', hoshikuzu:'air', tenchu:'up area', zangetsu:'single'};
const artOn = k => !!(HS.pw['a_'+k] || (S.demo && S.demo.art===k));
const artAll = () => P.artFound && Object.keys(ARTI).every(k=>P.artFound[k]);
// --- 神器の 力の枠（抽出。ふだん 1枠、7本 そろえると 2枠） ---
const aslotCount = () => artAll() ? 2 : 1;
const aslotList = () => { P.aslots = P.aslots || []; while(P.aslots.length < aslotCount()) P.aslots.push(null); return P.aslots.slice(0, aslotCount()); };
function applyArtPowers(s){
  const eq = new Set(equipped().map(it=>it.a).filter(Boolean));
  for(const k of aslotList()) if(k && ARTI[k] && (P.artEx||{})[k] && !eq.has(k)) ARTI[k].fx(s);
}
// --- 入手 ---
function genArt(L, k){
  if(!k){ const all = Object.keys(ARTI), miss = all.filter(x=>!(P.artFound||{})[x]); k = pick(miss.length && Math.random()<.7 ? miss : all); }
  return genItem(L, true, true, {rar:5, a:k});
}
function gotArt(e){
  track('art1', '神器 はじめて 入手');
  const it = genArt(S.L); P.artFound = P.artFound || {}; const fresh = !P.artFound[it.a]; P.artFound[it.a] = 1;
  it.lock = true;   // うっかり 売らないように 鍵を かけておく
  P.inv.push(it); R.items.push({it, r:'ok', chest:true});
  flash(); shake(true);
  const x = e ? eBox(e).cx : 150, y = e ? eBox(e).top : 40;
  sparks(x, y, 40, ['#ff6ad5','#6ad5ff','#ffe14a','#ffffff','#7dff8a'], 160);
  try{ SFX.spark(); buzz([30,40,60]); }catch(_){}
  float(it.name, 'loot', x, y-14, RCOL[5]);
  later(.5, ()=>banner('神器を 手に入れた！'));
  if(fresh && artAll()) later(1.8, ()=>banner('神器が 7本 そろった！'));
  save();
}
// --- 効果の 発動（ゆうしゃが 攻撃・ひらめき技を つかったとき） ---
const ARTFX = [];
const artHit = (e, m, manual, k) => (!e.dead && S.es.includes(e)) ? addHit(e, 0, m*(k && typeof artMul === 'function' ? artMul(k) : 1), manual, true, {noBolt:true}) : 0;
function artProc(manual, skill){
  if(!living().length) return;
  const a = ACT[0], hx = a.x + 8, hy = a.y - 12;
  S.artCd = S.artCd || {};
  const ready = (k, cd) => { if((S.artCd[k]||0) > S.time) return false; S.artCd[k] = S.time + cd; return true; };
  if(artOn('shippuu') && !skill && ready('shippuu', .3)) ARTFX.push({k:'wave', x:hx, t:0, dur:.75, hit:new Set(), manual});
  if(artOn('kazakiri') && Math.random()<.25 && ready('kazakiri', .5)){
    const tg = [...living()].sort((p,q)=>eBox(p).front-eBox(q).front)[0], b = tg && eBox(tg);
    if(b) ARTFX.push({k:'boom', x0:hx, y0:hy, x1:Math.min(W+10, b.cx+50), y1:b.cy, t:0, dur:.9, hit1:new Set(), hit2:new Set(), manual});
  }
  if(artOn('kouki') && Math.random()<.2 && ready('kouki', .6)){
    const y = hy; ARTFX.push({k:'laser', x:hx, y, t:0, dur:.45});
    for(const e of living()){ const b = eBox(e); if(b.cx < hx-4) continue; if(e.air>0 && (b.top > y+8 || b.fy < y-8)) continue; FX.push({type:'ring', x:b.cx, y:Math.min(b.fy-2, Math.max(b.top+2, y)), t:0, dur:.2, col:'#fff6a0'}); artHit(e, 1.2, manual, 'kouki'); }
    shake();
  }
  if(artOn('hoshikuzu') && Math.random()<.35 && ready('hoshikuzu', .4)){
    const l = living(), tg = l.length ? pick(l) : null, b = tg && eBox(tg);   // 光輝で 全員 たおれた あとでも 落ちないように
    if(b) for(let i=0;i<6;i++) ARTFX.push({k:'star', x:b.cx+rand(-10,10), y:b.cy+rand(-10,8), vx:rand(-8,8), vy:rand(-10,4), t:0, dur:3, cd:new Map(), ph:Math.random()*6, manual});
  }
  if(artOn('tenchu') && Math.random()<.4 && ready('tenchu', .5)){
    const tg = [...living()].sort((p,q)=>eBox(p).front-eBox(q).front)[0], x = tg ? eBox(tg).cx : 0;
    if(tg) ARTFX.push({k:'pillar', x, t:0, dur:.5});
    if(tg) later(.08, ()=>{ for(const e of living()){ const b = eBox(e); if(Math.abs(b.cx-x) > 26) continue; artHit(e, 2.0, manual, 'tenchu'); if(manual && !e.dead && S.es.includes(e)) launch(e, 30*(e.boss?.6:1)); } shake(); });
  }
  if(artOn('zangetsu') && ready('zangetsu', .25)){
    later(.35, ()=>{ const ts = [...living()].sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,3);
      ts.forEach((e,j)=>{ const b = eBox(e); ARTFX.push({k:'ghost', x:b.cx, y:b.cy, t:-j*.04, dur:.3}); later(j*.04, ()=>artHit(e, .8, manual, 'zangetsu')); }); });
  }
}
// --- 毎フレームの 動き（当たり判定） ---
function artUpdate(dt){
  if(mode!=='battle') { ARTFX.length = 0; return; }
  // 衛星（つねに 回る）
  if(artOn('eisei') && !S.wait){
    S.orbCd = S.orbCd || new Map();
    for(const o of orbPos()) for(const e of living()){ const b = eBox(e);
      if(o.x < b.cx-b.w/2-3 || o.x > b.cx+b.w/2+3 || o.y < b.top-3 || o.y > b.fy+3) continue;
      const key = e; if((S.orbCd.get(key)||0) > S.time) continue; S.orbCd.set(key, S.time+.45);
      PARTS.push({x:o.x, y:o.y, vx:0, vy:-10, life:.25, max:.25, col:'#9fe3ff', sz:2, g:0}); artHit(e, 1.0, true, 'eisei'); }
  }
  for(let i=ARTFX.length-1;i>=0;i--){
    const f = ARTFX[i]; f.t += dt; if(f.t >= f.dur){ ARTFX.splice(i,1); continue; } if(f.t < 0) continue;
    if(f.k==='wave'){
      f.x += 230*dt;
      for(const e of living()) if(!f.hit.has(e) && !(e.air>0 && e.ly>CFG.meleeH)){ const b = eBox(e); if(Math.abs(b.cx - f.x) < 8){ f.hit.add(e); artHit(e, .6, f.manual, 'shippuu'); } }
    }else if(f.k==='boom'){
      const p = f.t/f.dur, out = p < .5, q = out ? p*2 : (1-p)*2, ex = easeOut(q);
      f.cx = lerp(f.x0, f.x1, ex); f.cy = lerp(f.y0, f.y1, ex) - 14*Math.sin(Math.PI*q);
      const hs = out ? f.hit1 : f.hit2;
      for(const e of living()) if(!hs.has(e)){ const b = eBox(e); if(Math.abs(b.cx-f.cx) < b.w/2+4 && f.cy > b.top-4 && f.cy < b.fy+4){ hs.add(e); artHit(e, .8, f.manual, 'kazakiri'); } }
    }else if(f.k==='star'){
      f.x += f.vx*dt; f.y += f.vy*dt; f.vx *= Math.pow(.6, dt); f.vy *= Math.pow(.6, dt);
      for(const e of living()){ const b = eBox(e); if(f.x < b.cx-b.w/2-2 || f.x > b.cx+b.w/2+2 || f.y < b.top-2 || f.y > b.fy+2) continue;
        if((f.cd.get(e)||0) > S.time) continue; f.cd.set(e, S.time+.5); artHit(e, .1, f.manual, 'hoshikuzu'); }
    }
  }
}
const orbPos = (dt=0) => { const a = ACT[0]; return [0,1].map(i=>{ const an = (S.time+dt)*4.2 + i*Math.PI; return {x:a.x+4+Math.cos(an)*21, y:a.y-12+Math.sin(an)*11}; }); };
// --- 描く ---
function artDraw(){
  if(artOn('eisei') && mode==='battle'){
    for(let tr=4; tr>=1; tr--) for(const o of orbPos(-tr*.035)){ ctx.globalAlpha = .12*(5-tr); ctx.fillStyle = '#9fe3ff'; ctx.beginPath(); ctx.arc(o.x, o.y, 3.5-tr*.5, 0, Math.PI*2); ctx.fill(); }   // 光の尾
    for(const o of orbPos()){ ctx.globalAlpha = .35; ctx.fillStyle = '#9fe3ff'; ctx.beginPath(); ctx.arc(o.x, o.y, 6.5, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = .9; ctx.fillStyle = '#bfefff'; ctx.beginPath(); ctx.arc(o.x, o.y, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(o.x)-1, Math.round(o.y)-1, 2, 2); }
  }
  for(const f of ARTFX){
    if(f.t < 0) continue; const p = f.t/f.dur;
    if(f.k==='laser'){
      const th = 7*(1-p) + 1, x = f.x;
      ctx.globalAlpha = .45*(1-p); ctx.fillStyle = '#ffe14a'; ctx.fillRect(x, f.y-th, W*2, th*2);
      ctx.globalAlpha = .9*(1-p); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, f.y-th/2.5, W*2, Math.max(1, th/1.25));
      ctx.globalAlpha = 1-p; ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(x, f.y, th+2, 0, Math.PI*2); ctx.fill();
    }else if(f.k==='wave'){
      ctx.globalAlpha = 1-p*.7; ctx.strokeStyle = '#bfefff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(f.x-6, GROUND-8, 10, -Math.PI/2.4, Math.PI/2.4); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(f.x-8, GROUND-8, 8, -Math.PI/3, Math.PI/3); ctx.stroke();
    }else if(f.k==='boom' && f.cx != null){
      const an = f.t*30; ctx.globalAlpha = 1; ctx.fillStyle = '#d8f6ff';
      for(let j=0;j<4;j++){ const aa = an + j*Math.PI/2; ctx.fillRect(Math.round(f.cx + Math.cos(aa)*4)-1, Math.round(f.cy + Math.sin(aa)*4)-1, 3, 3); }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(f.cx)-1, Math.round(f.cy)-1, 2, 2);
    }else if(f.k==='star'){
      const tw = .5 + .5*Math.sin(S.time*12 + f.ph), al = Math.min(1, (f.dur-f.t)*2);
      ctx.globalAlpha = al*(.5+.5*tw); ctx.fillStyle = ['#ffe14a','#ff9ae0','#9fe3ff'][Math.floor(f.ph)%3];
      const x = Math.round(f.x), y = Math.round(f.y), s = 2 + Math.round(tw*2);
      const col = ctx.fillStyle; ctx.globalAlpha = al*.3; ctx.beginPath(); ctx.arc(x, y, s+2, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = al*(.6+.4*tw); ctx.fillStyle = col;
      ctx.fillRect(x-s, y, s*2+1, 1); ctx.fillRect(x, y-s, 1, s*2+1); ctx.fillRect(x-1, y-1, 3, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 1, 1);
    }else if(f.k==='pillar'){
      const w = 20*(1-p*.6); ctx.globalAlpha = .5*(1-p); ctx.fillStyle = '#ffe9a0'; ctx.fillRect(f.x-w/2, -40, w, GROUND+44);
      ctx.globalAlpha = .9*(1-p); ctx.fillStyle = '#ffffff'; ctx.fillRect(f.x-w/5, -40, w/2.5, GROUND+44);
    }else if(f.k==='ghost'){
      ctx.globalAlpha = .7*(1-p); ctx.strokeStyle = '#c8b0ff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(f.x-14, f.y+10); ctx.lineTo(f.x+14, f.y-10); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(f.x-12, f.y+9); ctx.lineTo(f.x+12, f.y-9); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
}
// --- 抽出（神器の 力の枠） ---
function artExtractAsk(id){
  const it = P.inv.find(x=>x.id===id); if(!it || !it.a || (P.artEx||{})[it.a]) return;
  showModal(`<h2>神器の 力を 抽出する？</h2><p><span class="r5">${esc(it.name)}</span> を こわして、力だけを のこす。</p>
    <p class="r5" style="font-weight:700">◆ ${ARTI[it.a].p}</p>
    <p class="hint">抽出した 力は ジョブタブの「神器の力の枠」に はめると、どの 武器でも 効果が 出る（枠は 1つ。神器を 7本 そろえると 2つ）。装備は なくなる。</p>
    <div class="opts"><button class="btn" data-m="close">やめる</button><button class="btn danger" data-m="a-do" data-id="${it.id}">抽出する</button></div>`);
}
function panelArtPowers(){
  const ex = Object.keys(ARTI).filter(k=>(P.artEx||{})[k]);
  if(!ex.length && !Object.keys(P.artFound||{}).length) return '';
  let h = `<h3>神器の力の枠（${aslotCount()}枠）</h3><p class="hint">神器から 抽出した 力を はめる 専用の 枠。神器を 7本 そろえると 2枠に なる。</p><div class="mslots">`;
  aslotList().forEach((k,i)=>{ h += `<button class="mslot ${k?'on':''}" data-act="a-slot" data-i="${i}"><span class="cat spc">神器</span><br>${k ? `<b class="r5">${ARTI[k].n}</b><br><span class="hint">${ARTI[k].p}</span>` : `<span class="hint">${ex.length?'タップで えらぶ':'まだ 力が ない'}</span>`}</button>`; });
  return h + `</div>`;
}
function aslotModal(i){
  const cur = aslotList()[i], used = new Set(aslotList().filter(Boolean));
  const ex = Object.keys(ARTI).filter(k=>(P.artEx||{})[k]);
  showModal(`<h2>神器の 力を はめる（枠${i+1}）</h2>
    ${ex.length ? `<div class="list">${ex.map(k=>`<button class="li ${cur===k?'sel':''}" data-m="a-set" data-i="${i}" data-k="${k}" ${used.has(k)&&cur!==k?'disabled':''}><div class="body"><div class="t"><span class="r5">${ARTI[k].n}</span><span class="hint">${WT_N[ARTI[k].wt]}</span></div><div class="d">${ARTI[k].p}</div></div></button>`).join('')}</div>` : `<p class="hint">まだ 抽出した 神器の 力が ない。</p>`}
    <div class="opts">${cur?`<button class="btn" data-m="a-set" data-i="${i}" data-k="">はずす</button>`:''}<button class="btn" data-m="close">とじる</button></div>`);
}
$('#panel').addEventListener('click', ev=>{ const b = ev.target.closest('[data-act="a-slot"]'); if(b) aslotModal(+b.dataset.i); });
$('#modal').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-m^="a-"]'); if(!b) return;
  const m = b.dataset.m;
  if(m==='a-ask') artExtractAsk(+b.dataset.id);
  else if(m==='a-demo'){ hideModal(); startArtDemo(b.dataset.k); }
  else if(m==='a-do'){
    const it = P.inv.find(x=>x.id===+b.dataset.id); if(!it || !it.a) return;
    P.artEx = P.artEx || {}; P.artEx[it.a] = true; P.inv = P.inv.filter(x=>x!==it);
    const i = aslotList().indexOf(null); if(i>=0) P.aslots[i] = it.a;
    refreshHS(); save();
    showModal(`<h2>神器の 力を 抽出した！</h2><p class="r5" style="font-weight:800">◆ ${ARTI[it.a].n}</p><p>${ARTI[it.a].p}</p><p class="hint">${i>=0?'空いている 神器の力の枠に はめた。':'枠が いっぱい。ジョブタブで 入れかえられる。'}</p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`);
    renderCamp();
  }
  else if(m==='a-set'){ aslotList(); P.aslots[+b.dataset.i] = b.dataset.k || null; refreshHS(); save(); hideModal(); renderCamp(); }
});
