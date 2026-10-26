// ===== 無限の塔の 物語: 節目ボス・景色の 変化・称号 =====
// 2階ごとに 1 強く。100階から 先は 4階ごとに 1
const towerL2 = f => lvOf(5, TOWER_RD) - 6 + (f <= 100 ? Math.ceil(f/2) : 50 + Math.ceil((f-100)/4));
// --- 景色（100階ごとに 塔の 中の 色が かわり、敵も 深層の 色に なる） ---
const TIERS = [
  {n:'塔の 入口', col:null},
  {n:'たそがれの 回廊', col:'#3a2a6a'}, {n:'紅の 層', col:'#7a1a1a'}, {n:'影の 層', col:'#1a1030'},
  {n:'深海の 層', col:'#0a3a4a'}, {n:'雲の 上', col:'#a8c8ff'}, {n:'星の 層', col:'#1a1a4a'},
  {n:'灰の 層', col:'#3a3a3a'}, {n:'黄金の 層', col:'#c8a000'}, {n:'光の 層', col:'#fff6c0'},
];
const tierOf = f => Math.min(TIERS.length-1, Math.floor((Math.max(1,f)-1)/100));
function towerTint(){
  if(!S.tower || mode!=='battle') return;
  const t = TIERS[tierOf(S.floor)]; if(!t.col) return;
  ctx.globalAlpha = .28; ctx.fillStyle = t.col; ctx.fillRect(-W, -H, W*3, H*3); ctx.globalAlpha = 1;
}
// --- 称号 ---
const TITLES = [[10,'塔の 見習い'],[50,'塔の 冒険者'],[100,'守護者を こえし者'],[200,'雲を ぬける者'],[300,'影を はらう者'],[500,'頂を 知る者'],[700,'天を 衝く者'],[1000,'ひらめきの 勇者']];
const titleOf = (b = towerBest()) => { let t = ''; for(const [f,n] of TITLES) if(b >= f) t = n; return t; };
// --- 節目の ボス ---
const TMS = {
  100: {key:'b_guard', hp:1.5, intro:['……ここより 上は、神器を もつに ふさわしい ものだけが 進める。', 'わが 試練を うけよ。'], name:'神器の守護者'},
  300: {key:'b_shadow', hp:2.5, intro:['……ヴァルゴスの 闇は、まだ 消えては いない。', 'われは 魔王の 影。この 塔の 闇そのもの。'], name:'魔王の影'},
  1000:{key:'b_source', hp:4, intro:['……よくぞ ここまで のぼってきた。', 'この 塔の 光は、もう 消えかけている。', 'さあ、見せてくれ。おまえの ひらめきの 光を！'], name:'ひらめきの源'},
};
function towerSpecial(f){
  P.tower.ms = P.tower.ms || {};
  // 500階: 塔の 頂の 扉（はじめて とどいた ときだけ）
  if(f === 500 && !P.tower.ms.e500){ P.tower.ms.e500 = 1; save();
    later(.2, ()=>sayLines('？？？', 'bulb', ['……ここまで きた ものは、ひさしぶりだ。', 'この 塔は、わたしが つくった。ひらめきの 光を もつ ものを さがすために。', 'わたしは「ひらめきの源」。すべての ピコーンは、わたしから 生まれた。', '……だが、わたしの 光は 消えかけている。', '1000階で まっている。'])); }
  const ms = TMS[f]; if(!ms) return;
  // ボスを 入れかえ
  const old = S.es.find(e=>e.boss); if(old) S.es = S.es.filter(e=>e!==old);
  const e = makeEnemy(ms.key, 168, 100, true);
  e.hp = e.max = Math.round(e.max*ms.hp); e.name = ms.name; e.ms = f;
  if(f === 100){ e.s = 3.4; e.aura = '#ffe14a'; }
  if(f === 300){ e.s = 2.6; e.dark = true; e.fast = true; e.mAtk = 0; e.aura = '#6a4ab0';
    e.cfg = {name:ms.name, p2lines:['……かげは、ひとつでは ない。'], p2banner:'影分身！', spawn:['b_shadow','b_shadow'], spawnHp:.15, spawnName:'影の 分身'}; }
  if(f === 1000){ e.s = 4; e.dark = true; e.mAtk = 0; e.aura = '#fff6c0';
    e.cfg = {name:ms.name, p2key:'b_source2', p2lines:['……ああ、あたたかい。', 'だが まだだ！ もっと 強い 光を！'], p2banner:'ひらめきの源が かがやいた！', spawn:['h_slime','s_slime','b_kslime']}; }
  S.es.push(e);
  S.waveName = f+'階 '+ms.name;
  later(.3, ()=>sayLines(ms.name, ms.key, ms.intro));
}
// 深層の 色
function towerTintEnemies(f){ const t = TIERS[tierOf(f)]; if(!t.col) return; for(const e of S.es) if(!e.ms) e.tint = t.col; }
// 節目を はじめて こえたとき
function towerMsClear(f){
  if([10,50,100,200,300,500,1000].includes(f)) track('tw'+f, '無限の塔 '+f+'階');
  P.tower.ms = P.tower.ms || {};
  const nt = TITLES.find(([n])=>n===f); if(nt && towerBest() >= f) later(1.2, ()=>toast(`称号「${nt[1]}」を 手に入れた！`));
  if(f % 100 === 1 && f > 1) later(.2, ()=>banner(TIERS[tierOf(f)].n));
  if(!TMS[f] || P.tower.ms[f]) return;
  P.tower.ms[f] = 1; save();
  if(f === 100){ later(.8, ()=>artChoice()); }
  if(f === 300){ later(.8, ()=>{ const L = S.L, it = genItem(L, true, true, {rar:3, ilv:3*L+8}); it.name = '伝説の '+it.name; it.legend = true; R.items.push({it, r:addInv(it), chest:true}); banner('伝説の 装備を 手に入れた！'); }); }
  if(f === 1000){ P.tower.trueClear = Date.now(); track('trueclear', '完全制覇'); save(); S.trueClearNow = true; }
}
// 神器を ひとつ えらぶ（100階の 守護者）
function artChoice(){
  const miss = Object.keys(ARTI).filter(k=>!(P.artFound||{})[k]), ks = miss.length ? miss : Object.keys(ARTI);
  showModal(`<h2 class="r5">神器を ひとつ えらぶ</h2><p class="hint">守護者の 試練を こえた あかしに、神器を ひとつ さずけられる。</p>
    <div class="list">${ks.map(k=>`<button class="li" data-m="artPick" data-k="${k}"><div class="body"><div class="t"><span class="r5">${ARTI[k].n}</span><span class="hint">${WT_N[ARTI[k].wt]}</span></div><div class="d">${ARTI[k].p}</div></div></button>`).join('')}</div>`);
}
$('#modal').addEventListener('click', ev=>{ const b = ev.target.closest('[data-m="artPick"]'); if(!b) return;
  hideModal(); const k = b.dataset.k, it = genItem(S.L, true, true, {rar:5, a:k}); P.artFound = P.artFound || {}; P.artFound[k] = 1; it.lock = true; P.inv.push(it); R.items.push({it, r:'ok', chest:true});
  flash(); try{ SFX.spark(); }catch(_){} banner('神器を 手に入れた！'); save(); });
// 1000階: 完全制覇
function showTrueClear(done){
  sayLines('ひらめきの源', 'b_source2', ['……ありがとう。おまえの 光で、わたしは また かがやける。', 'ひらめきは、あきらめない ものの もとに やってくる。', 'これからも、たくさん ピコーンと ひらめいて おくれ。'], ()=>{
    let el = document.getElementById('ending'); if(!el){ el = document.createElement('div'); el.id = 'ending'; document.body.appendChild(el); }
    el.hidden = false; el.className = 'on';
    el.innerHTML = `<div class="ed-after"><p class="ed-end">完全制覇</p>
      <div class="ed-hero">${imgTag(heroSpr(),'','width:56px;height:auto;image-rendering:pixelated')}　${imgTag('b_source2','','width:56px;height:auto;image-rendering:pixelated')}</div>
      <p class="ed-teaser">無限の塔 1000階を こえ、<br>ひらめきの源に 光を とりもどした。</p>
      <p class="r5 ed-big">称号「${titleOf()}」</p>
      <p class="hint" style="color:#aaa">ゆうしゃ Lv${fmt(P.hero.lv)} ／ 仲間 ${P.allies.length}体 ／ たおした 魔物 ${fmt(P.stats.kills||0)}体</p>
      <div class="row" style="justify-content:center;gap:8px"><button class="btn" data-share="trueClear">𝕏 シェア</button><button class="btn primary" id="tcClose">つづける</button></div></div>`;
    el.querySelector('#tcClose').onclick = () => { el.hidden = true; el.className = ''; el.innerHTML = ''; done && done(); };
  });
}
