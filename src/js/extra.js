// ===== おまけ: バトル速度・精錬+11・無限の塔 =====
// --- バトル速度 ---
const SPD_UNLOCK = [{v:1, rd:0}, {v:1.5, rd:1}, {v:2, rd:3}];   // 魔界を その周回まで クリアで ひらく
const speeds = () => SPD_UNLOCK.filter(s => (P.clear[5]||0) >= s.rd).map(s=>s.v);
const battleSpd = () => { const v = P.opt.spd || 1; return speeds().includes(v) ? v : 1; };
function syncSpdBtn(){ const b = $('#spdBtn'); if(!b) return; const ok = speeds().length > 1; b.hidden = !ok; b.textContent = '×'+battleSpd(); b.classList.toggle('on', battleSpd() > 1); }
{ const br = $('#bhud .brow') || document.querySelector('.brow');
  if(br){ const b = document.createElement('span'); b.className = 'pill'; b.id = 'spdBtn'; b.hidden = true; br.insertBefore(b, $('#pauseBtn'));
    b.addEventListener('click', ()=>{ const l = speeds(), i = l.indexOf(battleSpd()); P.opt.spd = l[(i+1)%l.length]; save(); syncSpdBtn(); buzz && buzz(8); }); } }
// --- 精錬 +11 ---
const REF11_RD = 7;
const refCap = () => (P.clear[5]||0) >= REF11_RD ? 11 : 10;
// --- 無限の塔（1階 ＝ 1ウェーブ。10階ごとに ボス。どこまで 登れるか） ---
const TOWER_RD = 10;
const towerOpen = () => (P.clear[5]||0) >= TOWER_RD;
const towerBest = () => (P.tower && P.tower.best) || 0;
const towerStarts = () => { const s = [1]; for(let f=11; f<=towerBest()+1; f+=10) s.push(f); return s; };   // 到達した 10階ごとから はじめられる
const towerL = f => towerL2(f);
function startTower(f0){
  const sel = {...P.sel};
  startStage(5, TOWER_RD, true);
  P.sel = sel;
  S.tower = {f0}; S.floor = f0 - 1;
}
function towerWave(){
  S.floor++;
  const f = S.floor, st = (f-1) % STAGES.length, boss = f % 10 === 0;
  S.st = st; S.L = towerL(f); S.bg = STAGES[st].bg;
  S.waveIdx = boss ? WAVES+1 : 1;
  const rdEq = TOWER_RD - 1 + Math.floor(f/12), stg = STAGES[st];
  S.es = [];
  if(!boss){
    const cc = capCount(st, rdEq, S.L, 3);
    const kinds = [...stg.en].sort(()=>Math.random()-.5).slice(0, 3);
    slots(cc.n).forEach((p,i)=>{ const e = makeEnemy(kinds[i%kinds.length], p.x, p.y, false); e.rm = cc.rm; S.es.push(e); });
    S.waveName = '無限の塔 '+f+'階';
    banner(f+'F');
  }else{
    const cc = capCount(st, rdEq, S.L, WAVES, .6);
    S.es.push(makeEnemy(stg.boss, 168, 100, true));
    slots(Math.round(cc.n*1.5)).filter(p=>Math.abs(p.x-168)>16 || Math.abs(p.y-100)>7).slice(0,cc.n).forEach((p,i)=>{ const e = makeEnemy(stg.en[i%stg.en.length], p.x, p.y, false); e.rm = cc.rm; S.es.push(e); });
    S.waveName = f+'階 BOSS '+EDEF[stg.boss].n;
    banner(f+'F BOSS!');
  }
  towerSpecial(f); towerTintEnemies(f);
  applyTraits();
  S.wave = S.es.length; S.wait = false;
  if(HS.pw.lullaby) S.es.forEach(e=>{ e.sleep = 2; e.stun = Math.max(e.stun, 2); });
  updWaveTxt();
}
function towerClear(){
  const f = S.floor;
  P.tower = P.tower || {best:0}; const nb = f > P.tower.best; if(nb) P.tower.best = f;
  S.tower.top = f;
  towerMsClear(f);
  if(S.trueClearNow){ S.trueClearNow = false; S.wait = true; setTimeout(()=>showTrueClear(()=>{ if(mode==='battle'){ S.wait=false; endCombo(); spawnWave(); } }), 1200); return; }
  if(f % 10 === 0){ const it = genItem(S.L, true, true); R.items.push({it, r:addInv(it), chest:true}); later(.6, ()=>banner(f+'階 とうは！ 宝箱'));
    // 神器: 50階ごとを はじめて こえたら かならず、ほかの ボス階は 3%
    if(f % 50 === 0 && f > (P.tower.artMs||0)){ P.tower.artMs = f; later(1.4, ()=>gotArt(null)); }
    else if(Math.random() < .03) later(1.4, ()=>gotArt(null)); }
  else if(nb && f > 1) later(.6, ()=>float('最高記録 '+f+'階','tag',150,40));
  const r = .1*(HS.pw.regen2?2:1)*(1+.1*facLv('inn')) + (HS.pw.prayer?.2:0) + (HS.pw.healWave||0)/100;
  S.php = Math.min(S.pmax, S.php + S.pmax*r);
  save();
  setTimeout(()=>{ if(mode!=='battle') return; endCombo(); spawnWave(); }, 1300/battleSpd());
}
function panelTowerCard(){
  if(!towerOpen()) return `<div class="li" style="cursor:default;opacity:.6"><div class="body"><div class="t"><span>🗼 無限の塔</span><span class="hint">🔒</span></div><div class="d">${TOWER_RD}周目の 魔界を クリアで ひらく</div></div></div>`;
  const b = towerBest();
  return `<h3>🗼 無限の塔</h3><p class="hint">1階 ＝ 1ウェーブ。上の 階ほど 敵が 強くなり、10階ごとに ボスと 宝箱。全滅か 撤退まで 登りつづける。到達した 10階ごとから はじめられる。</p>
    <div class="kv"><span><i>最高記録</i>${b}階</span><span><i>${b+1}階の 敵の強さ</i>${towerL(b+1)}</span>${titleOf()?`<span><i>称号</i>${titleOf()}</span>`:''}<span><i>いまの 層</i>${TIERS[tierOf(b+1)].n}</span></div>
    ${(()=>{ const nx = [100,300,500,1000].find(n=>n>b); return nx ? `<p class="hint">つぎの 節目：${nx}階 ？？？</p>` : (P.tower.trueClear ? '<p class="r5">完全制覇！</p>' : ''); })()}
    <div class="row" style="flex-wrap:wrap;margin-top:6px">${towerStarts().slice(-4).map(f=>`<button class="btn ${f===towerStarts().slice(-1)[0]?'primary':''}" data-act="tower" data-f="${f}">${f}階から</button>`).join('')}</div>`;
}
