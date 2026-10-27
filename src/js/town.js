// ===== 町（工房・精錬所・市場・交換所・施設）とカード（本作と 同じ しくみ） =====
// --- 素材: ステージごとに 1つ ＋ ほしのかけら ---
const MATS = {
  iron:   {n:'てつくず',         st:0, base:30},
  leaf:   {n:'せいれいの葉',     st:1, base:50},
  mithril:{n:'ミスリルこうせき', st:2, base:80},
  sand:   {n:'たいようの砂',     st:3, base:120},
  ice:    {n:'ひょうけつ石',     st:4, base:180},
  crystal:{n:'まかいの結晶',     st:5, base:260},
  star:   {n:'ほしのかけら',     st:-1, base:1500},
};
const ST_MAT = ['iron','leaf','mithril','sand','ice','crystal'];
// --- 精錬: +1〜+10。+5から先は 失敗すると こわれる（本作と 同じ 表） ---
const REF_RATE = [1, 1, 1, 1, 0.8, 0.6, 0.45, 0.3, 0.2, 0.1, 0.05];
const REF_MUL  = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.5, 4, 6.3, 10, 15];
const refMul = it => REF_MUL[Math.min(refCap(), (it && it.ref) || 0)];
const refRate = r => Math.min(1, REF_RATE[r] + (HS && HS.pw.smith && REF_RATE[r]<1 ? .05 : 0));
const refCost = it => Math.round(40 * it.ilv * Math.pow(1.7, it.ref||0) * (it.rar >= 3 ? 1.5 : 1));
const refName = it => { it.name = (it.ref ? `+${it.ref} ` : '') + it.name.replace(/^\+\d+ /, ''); };
// --- 施設（時計塔・酒場の かわりに 訓練所） ---
const FAC = {
  bag:  {n:'倉庫',     max:5, cost:[2000, 5000, 12000, 30000, 80000],  d:l => `持ち物の上限 ${invBase(l)}`},
  forge:{n:'工房',     max:5, cost:[3000, 8000, 20000, 50000, 120000], d:l => `クラフト成功率・レア率 +${3*l}%${l>=5?'、抽出した力の枠 +2':l>=3?'、抽出した力の枠 +1':''}`},
  inn:  {n:'宿屋',     max:5, cost:[1000, 3000, 8000, 20000, 50000],   d:l => `ウェーブ間の 回復量 +${10*l}%`},
  train:{n:'訓練所',   max:5, cost:[2000, 6000, 15000, 40000, 100000], d:l => `控えの 仲間も 経験値を ${10*l}% もらう`},
};
const facLv = k => (P.fac && P.fac[k]) || 0;
const invBase = l => 120 + 30*l;   // 倉庫 Lv0〜5: 120〜270
Object.defineProperty(CFG, 'invMax', {get: () => invBase(facLv('bag')) + (HS && HS.pw.storage ? 40 : 0), configurable:true});
// --- お守り（市場で 買う。次の 出撃 1回だけ 効く） ---
const CHARMS = {
  exp:  {n:'けいけんのお守り', base:200, d:'経験値 +50%'},
  spark:{n:'ひらめきのお守り', base:300, d:'ひらめき率 2倍'},
  drop: {n:'しあわせのお守り', base:300, d:'装備・カードの ドロップ率 2倍'},
  tame: {n:'なかまのお守り',   base:250, d:'おきあがり率 2倍'},
  gold: {n:'こがねのお守り',   base:250, d:'ゴールド +100%'},
  guard:{n:'まもりのお守り',   base:200, d:'受けるダメージ -25%'},
};
const maxLReached = () => Math.max(1, ...STAGES.map((s,i)=> P.clear[i] ? lvOf(i, P.clear[i]) : 0));
const charmPrice = k => Math.round(CHARMS[k].base * (1 + maxLReached()*1.2) * (HS && HS.pw.haggle ? .85 : 1));

// --- カード: 種族ごとに 1まい（武器用 / 防具用）。挿したら 外せない ---
const C = (type, d, fx) => ({type, d, fx});
const CARD_DEF = {
  slime:    C('armor',  '最大HP +10%',                      s => s.hpPct += 10),
  d_slime:  C('armor',  '最大HP +5%、防御力 +5%',            s => { s.hpPct += 5; s.defPct += 5; }),
  s_slime:  C('armor',  '防御力 +15%',                       s => s.defPct += 15),
  h_slime:  C('armor',  '最大HP +20%、攻撃速度 -5%',         s => { s.hpPct += 20; s.aspd -= 5; }),
  bat:      C('weapon', '空中の敵へ +10%',                   s => s.air += 10),
  f_bat:    C('armor',  '攻撃速度 +8%',                      s => s.aspd += 8),
  c_bat:    C('weapon', '空中の敵へ +15%、会心率 +3%',        s => { s.air += 15; s.crit += 3; }),
  goblin:   C('weapon', '攻撃力 +10%',                       s => s.atkPct += 10),
  d_goblin: C('weapon', '会心率 +8%、攻撃力 +5%',            s => { s.crit += 8; s.atkPct += 5; }),
  h_goblin: C('weapon', '攻撃力 +18%、防御力 -5%',           s => { s.atkPct += 18; s.defPct -= 5; }),
  f_wolf:   C('armor',  '攻撃速度 +10%',                     s => s.aspd += 10),
  d_wolf:   C('weapon', '会心率 +10%',                       s => s.crit += 10),
  s_wolf:   C('armor',  '攻撃速度 +6%、会心率 +5%',          s => { s.aspd += 6; s.crit += 5; }),
  h_wolf:   C('weapon', '攻撃速度 +12%',                     s => s.aspd += 12),
  f_mush:   C('armor',  '経験値 +15%',                       s => s.exp += 15),
  skel:     C('weapon', '会心率 +15%',                       s => s.crit += 15),
  d_skel:   C('armor',  '防御力 +10%、会心率 +5%',           s => { s.defPct += 10; s.crit += 5; }),
  h_skel:   C('weapon', '会心率 +20%、攻撃力 +5%',           s => { s.crit += 20; s.atkPct += 5; }),
  golem:    C('armor',  '防御力 +20%、攻撃速度 -5%',         s => { s.defPct += 20; s.aspd -= 5; }),
  s_golem:  C('armor',  '最大HP +15%、防御力 +10%',          s => { s.hpPct += 15; s.defPct += 10; }),
  b_kslime: C('armor',  'ゴールド +30%、最大HP +10%',        s => { s.gold += 30; s.hpPct += 10; }),
  b_kmush:  C('weapon', 'ゆうしゃの 攻撃が 8%で 敵を 眠らせる', s => add(s.pw, 'sleepHit', 8)),
  b_kgolem: C('armor',  '防御力 +30%、最大HP +15%',          s => { s.defPct += 30; s.hpPct += 15; }),
  b_sdragon:C('weapon', '職業技ゲージ +25%',                 s => s.spg += 25),
  b_fdragon:C('weapon', '空中の敵へ +30%',                   s => s.air += 30),
  b_adragon:C('weapon', '攻撃力 +25%、会心の倍率 +0.3',      s => { s.atkPct += 25; add(s.pw, 'critPlus', 0.3); }),
  b_guard:  C('armor',  '防御力 +40%、最大HP +25%',          s => { s.defPct += 40; s.hpPct += 25; }),
  b_shadow: C('weapon', '会心率 +20%、会心の倍率 +0.5',      s => { s.crit += 20; add(s.pw, 'critPlus', 0.5); }),
  b_source: C('armor',  'ひらめき率 +30%、職業技ゲージ +30%', s => { s.spark += 30; s.spg += 30; }),
  b_maou:   C('weapon', '攻撃力 +30%、ボスへの ダメージ +30%、会心の倍率 +0.3', s => { s.atkPct += 30; add(s.pw, 'bossDmg', 30); add(s.pw, 'critPlus', 0.3); }),
};
const CARDS = {};
for(const k in CARD_DEF) CARDS[k] = Object.assign({n: EDEF[k].n+'カード', boss: k.startsWith('b_'), special: !!EDEF[k].special}, CARD_DEF[k]);   // special: 魔王（市場・青箱には 出ない）
const CARD_RATE = {normal:400, boss:25};   // ボスの カードは 1/25（しあわせのお守りで 2倍）
const cardFits = (k, it) => (CARDS[k].type === 'weapon') === (it.slot === 'weapon');
const cardPrice = k => CARDS[k].boss ? 2000 : 300;
const cardCls = k => CARDS[k].boss ? 'r2' : 'r1';
const albumCount = () => Object.keys(CARDS).filter(k => (P.album||{})[k]).length;
const shardGive = k => CARDS[k].boss ? 5 : 1;
const shardCost = k => CARDS[k].boss ? 60 : 8;
function cardSlotsFor(rar){ const r = Math.random(); return rar===0 ? (r<.3?1:0) : rar===1 ? (r<.5?1:0) : rar===2 ? (r<.3?2:1) : (r<.35?1:0); }
const canCard = it => it.cards && it.cards.includes(null) && Object.keys(P.cards).some(k => P.cards[k] > 0 && cardFits(k, it));
const findItem = id => P.inv.find(x=>x.id===id) || equipped().find(x=>x.id===id);
function addCard(k){ P.cards[k] = (P.cards[k]||0) + 1; const fresh = !P.album[k]; P.album[k] = true; return fresh; }

// --- 戦闘で 倒したとき: 素材・カード・青箱 ---
function townOnKill(e){
  const mk = ST_MAT[S.st], n = e.boss ? 3 : (Math.random() < CFG.matRate*(e.rm||1) ? 1 : 0);
  if(n){ P.mats[mk] = (P.mats[mk]||0) + n; R.mats[mk] = (R.mats[mk]||0) + n; }
  if(e.boss && Math.random() < .3){ P.mats.star++; R.mats.star = (R.mats.star||0) + 1; }
  if(e.boss){ P.boxes++; R.boxes++; }
  const cr = (e.boss ? CARD_RATE.boss : CARD_RATE.normal) / (HS.pw.dropX || 1) / (e.boss ? 1 : (e.rm||1)) / (e.rare ? 10 : 1);
  const ck = e.noCard ? null : e.maou ? 'b_maou' : e.key==='b_source2' ? 'b_source' : e.key;
  if(ck && CARDS[ck] && Math.random() < 1/cr){
    const fresh = addCard(ck); R.cards.push(ck);
    const b = eBox(e); flash(); FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.5, col:'#7fb2ff', big:true});
    later(.3, ()=>banner('カード！ '+CARDS[ck].n+(fresh?'（帖に登録）':'')));
    refreshHS();
  }
}

// --- 工房 ---
const TIER_ILV = [3, 6, 9, 12, 15, 18];
const CRAFT_CAP = [12, 18, 24, 30, 36, 9999];
const craftRate = () => Math.min(0.97, 0.6 + P.craft.m*0.00035 + 0.03*facLv('forge') + (HS && HS.pw.smith ? .1 : 0));
const bigM = () => HS && HS.pw.bigMerchant ? .5 : 1;
const craftBonusLv = () => Math.floor(P.craft.m / 150);
const craftRareRate = () => Math.min(0.9, 0.1 + P.craft.m/1500 + 0.03*facLv('forge'));
const craftUniqRate = () => Math.min(0.15, P.craft.m/999*0.12 + 0.006*facLv('forge'));
const craftIlv = t => Math.min(CRAFT_CAP[t], Math.max(TIER_ILV[t], 3*maxLReached())) + 2 + craftBonusLv();
const craftCost = (slot, t) => ({mat: slot==='acc' ? 2 : 3, gold: Math.round(15*craftIlv(t)*bigM())});
const topTier = () => Math.max(0, ...STAGES.map((s,i)=>P.clear[i]?i:0));
const setCraftCost = () => { const t = topTier(); return {t, mat:3, star:1, gold: Math.round(40*craftIlv(t)*bigM())}; };
const reforgeCost = it => ({gold: Math.round(30*it.ilv*(1+0.5*(it.rfn||0))*bigM()), mat:2, mk: ST_MAT[Math.min(5, Math.floor((it.ilv-1)/3))]});
function doCraft(slot, t, useStar){
  const c = craftCost(slot, t), mk = ST_MAT[t];
  if((P.mats[mk]||0) < c.mat || P.gold < c.gold || (useStar && P.mats.star < 1)) return null;
  P.mats[mk] -= c.mat; P.gold -= c.gold; if(useStar) P.mats.star--;
  if(Math.random() >= craftRate()){ P.craft.m = Math.min(999, P.craft.m+3); save(); return {fail:true}; }
  const ilv = craftIlv(t), uniqs = Object.keys(UNIQ).filter(u=>UNIQ[u].slot===slot);
  const it = uniqs.length && Math.random() < craftUniqRate()
    ? genItem(1, false, false, {rar:3, u:pick(uniqs), ilv, crafted:true, extraSlot:useStar})
    : genItem(1, false, false, {slot, wt: craftWT, rar: useStar || Math.random() < craftRareRate() ? 2 : 1, ilv, crafted:true, extraSlot:useStar});
  addInv(it); P.craft.m = Math.min(999, P.craft.m+5); save();
  return {it};
}
function doCraftSet(setK, slot){
  const c = setCraftCost(), mk = ST_MAT[c.t];
  if((P.mats[mk]||0) < c.mat || P.mats.star < c.star || P.gold < c.gold) return null;
  P.mats[mk] -= c.mat; P.mats.star -= c.star; P.gold -= c.gold;
  if(Math.random() >= craftRate()){ P.craft.m = Math.min(999, P.craft.m+3); save(); return {fail:true}; }
  const it = genItem(1, false, false, {rar:4, set:setK, slot, wt: craftWT, ilv:craftIlv(c.t), crafted:true});
  addInv(it); P.craft.m = Math.min(999, P.craft.m+8); save();
  return {it};
}
function doReforge(it, i){
  const c = reforgeCost(it);
  if(!it.aff[i] || P.gold < c.gold || (P.mats[c.mk]||0) < c.mat || (it.rfi != null && it.rfi !== i)) return null;
  P.gold -= c.gold; P.mats[c.mk] -= c.mat;
  const old = it.aff[i], have = new Set(it.aff.map(a=>a.k));
  const k = pick(Object.keys(AFF).filter(x => x===old.k || !have.has(x)));
  it.aff[i] = {k, v: affVal(k, it.ilv)}; it.rfi = i; it.rfn = (it.rfn||0) + 1;
  P.craft.m = Math.min(999, P.craft.m+2); refreshHS(); save();
  return {old, nw: it.aff[i]};
}
// --- 精錬 ---
function refineOnce(it){
  const r = it.ref||0, cost = refCost(it);
  if(r >= refCap() || P.gold < cost) return null;
  P.gold -= cost; P.stats2.refines++;
  if(Math.random() < refRate(r)){ it.ref = r+1; refName(it); refreshHS(); save(); return {ok:true, r0:r}; }
  for(const k of EQ) if(P.equip[k]===it) P.equip[k] = null;
  P.inv = P.inv.filter(x=>x!==it); P.stats2.broken++; refreshHS(); save();
  return {ok:false, r0:r};
}
function refPlan(it, to){ let p = 1, cost = 0; const r0 = it.ref||0; for(let r=r0; r<to; r++){ it.ref = r; p *= refRate(r); cost += refCost(it); } it.ref = r0; return {p, cost}; }
const pctStr = p => { const v = p*100; return v >= 10 ? String(Math.round(v)) : v <= 0 ? '0' : v.toFixed(Math.min(6, Math.max(1, 1-Math.floor(Math.log10(v))))); };
// --- 市場（相場は 毎日 かわる） ---
function dayKey(){ const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function hashStr(t){ let h = 2166136261; for(let i=0;i<t.length;i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const seededR = t => { let a = hashStr(t); a = Math.imul(a ^ (a>>>15), a|1); a ^= a + Math.imul(a ^ (a>>>7), a|61); return ((a ^ (a>>>14)) >>> 0) / 4294967296; };
const mktMul = key => 0.5 + seededR(dayKey()+'|'+key);
const mktBase = key => { const [t,k] = key.split(':'); return t==='mat' ? MATS[k].base : cardPrice(k)*3; };
const mktBuy = key => Math.max(1, Math.round(mktBase(key)*mktMul(key)*(HS && HS.pw.haggle ? .85 : 1)));
const mktSell = key => Math.max(1, Math.round(mktBase(key)*mktMul(key)*0.85*(HS && HS.pw.appraise ? 1.25 : 1)*(HS && HS.pw.cardSell2 && key.startsWith('card:') ? 2 : 1)));
const matStock = () => 20 * (HS && HS.pw.stocker ? 2 : 1);
function mktSync(){ const d = dayKey(); if(P.market.day !== d){ P.market.day = d; P.market.bought = {}; P.market.held = {}; } }
// その日に 市場で 買ったものは 買値の 9割までしか 売れない（買って すぐ 売る もうけを ふせぐ）。日が かわれば ふつうの 値段
const mktHeld = key => ((P.market.held||{})[key]) || 0;
const mktSellNow = key => mktHeld(key) > 0 ? Math.min(mktSell(key), Math.floor(mktBuy(key)*0.9)) : mktSell(key);
function mktSellDo(key){ mktSync(); const pr = mktSellNow(key); if(mktHeld(key) > 0) P.market.held[key]--; else P.stats2.mktSold = (P.stats2.mktSold||0)+1; return pr; }
function mktCardsToday(){
  const keys = Object.keys(CARDS).filter(k=>!CARDS[k].boss), bosses = Object.keys(CARDS).filter(k=>CARDS[k].boss && !CARDS[k].special);
  const out = [...new Set([keys[Math.floor(seededR(dayKey()+'|c1')*keys.length)], keys[Math.floor(seededR(dayKey()+'|c2')*keys.length)]])];
  if(seededR(dayKey()+'|bc') < 0.15) out.push(bosses[Math.floor(seededR(dayKey()+'|bk')*bosses.length)]);
  return out;
}
// --- 青箱（ボスが かならず 落とす） ---
function openBox(){
  const L = maxLReached(), r = Math.random();
  if(r < 0.1){ const k = pick(Object.keys(CARDS).filter(k => !CARDS[k].special && (Math.random()<.1 ? CARDS[k].boss : !CARDS[k].boss))); const fresh = addCard(k); return `<span class="r1">◆ ${CARDS[k].n}</span>${fresh?'（カード帖に 登録！）':''}`; }
  if(r < 0.35){ const g = Math.round(L*120*rand(.8,1.5)); P.gold += g; return `${fmt(g)} ゴールド`; }
  const it = genItem(L, false, true); addInv(it); return `<span class="r${it.rar}">${esc(it.name)}</span>（${RAR_N[it.rar]}）`;
}

// ===== 画面 =====
let craftWT = 'sword';
let TOWN = 'craft', craftMode = 'make', craftSlot = 'weapon', craftStar = false, craftSet = 'raimei', rfSel = null;
const matsBar = () => `<div class="kv">${Object.keys(MATS).map(k=>`<span><i>${MATS[k].n}</i>${P.mats[k]||0}</span>`).join('')}<span><i>ゴールド</i>${fmt(P.gold)}</span></div>`;
function panelTown(){
  mktSync();
  let h = `<div class="chips">${[['craft','工房'],['refine','精錬所'],['market','市場'],['swap','交換所'],['fac','施設']].map(([k,n])=>`<button class="chip ${TOWN===k?'on':''}" data-act="t-tab" data-k="${k}">${n}</button>`).join('')}</div>`+matsBar();
  const li = (body, btn) => `<div class="li" style="cursor:default;align-items:center"><div class="body">${body}</div>${btn?`<div style="flex:none;display:flex;flex-direction:column;gap:4px">${btn}</div>`:''}</div>`;
  if(TOWN==='craft'){
    h += `<h3>工房</h3><div class="kv"><span><i>鍛冶熟練度</i>${P.craft.m}/999</span><span><i>成功率</i>${Math.round(craftRate()*100)}%</span><span><i>レア率</i>${Math.round(craftRareRate()*100)}%</span><span><i>ユニーク率</i>${(craftUniqRate()*100).toFixed(1)}%</span></div>
      <div class="chips">${[['make','つくる'],['set','セット装備'],['reforge','作り直し']].map(([k,n])=>`<button class="chip ${craftMode===k?'on':''}" data-act="t-cmode" data-k="${k}">${n}</button>`).join('')}</div>`;
    if(craftMode==='make'){
      h += `<p class="hint">できる 装備の 強さは、クリアした ステージの 強さに ついてくる（素材ごとに 上限あり）。熟練度が 上がると まれに ユニークが できる。</p>
        <div class="chips">${SLOTS.map(sl=>`<button class="chip ${craftSlot===sl?'on':''}" data-act="t-cslot" data-k="${sl}">${SLOTN[sl]}</button>`).join('')}</div>
        ${craftSlot==='weapon' ? `<div class="chips">${WT.map(w=>`<button class="chip ${craftWT===w?'on':''}" data-act="t-cwt" data-k="${w}">${WT_N[w]}${jobWeapons().includes(w)?'':'<small>×</small>'}</button>`).join('')}</div>` : ''}
        <label class="toggle"><span>ほしのかけらを 使う（かならず レア以上＋カードスロット +1）</span><input type="checkbox" data-act="t-star" ${craftStar?'checked':''}></label><div class="list">`;
      STAGES.forEach((s,t)=>{ const c=craftCost(craftSlot,t), mk=ST_MAT[t], ok=(P.mats[mk]||0)>=c.mat && P.gold>=c.gold && (!craftStar || P.mats.star>0);
        h += li(`<div class="t"><span>${s.n}の 素材で ${SLOTN[craftSlot]}</span><span>iLv${craftIlv(t)}</span></div><div class="d">${MATS[mk].n} ${P.mats[mk]||0}/${c.mat} ／ ${fmt(c.gold)}G${craftStar?` ／ ほしのかけら ${P.mats.star}/1`:''}</div>`,
          `<button class="btn sm" data-act="t-craft" data-t="${t}" ${ok?'':'disabled'}>つくる</button>`); });
      h += `</div>`;
    }
    if(craftMode==='set'){
      const c=setCraftCost(), mk=ST_MAT[c.t], ok=(P.mats[mk]||0)>=c.mat && P.mats.star>=c.star && P.gold>=c.gold;
      const own = new Set([...equipped(), ...P.inv].filter(it=>it.set===craftSet).map(it=>it.slot));
      h += `<p class="hint">セットと 部位を えらんで、ねらった セット装備を つくる。</p>
        <div class="chips">${Object.keys(SETS).map(k=>`<button class="chip ${craftSet===k?'on':''}" data-act="t-cset" data-k="${k}">${SETS[k].n}</button>`).join('')}</div>
        <div class="chips">${SLOTS.map(sl=>`<button class="chip ${craftSlot===sl?'on':''}" data-act="t-cslot" data-k="${sl}">${SLOTN[sl]}${own.has(sl)?'✓':''}</button>`).join('')}</div>
        ${craftSlot==='weapon' ? `<div class="chips">${WT.map(w=>`<button class="chip ${craftWT===w?'on':''}" data-act="t-cwt" data-k="${w}">${WT_N[w]}</button>`).join('')}</div>` : ''}
        <p class="hint">✓ は もっている 部位。（2）${SETS[craftSet].b[2]} ／（4）${SETS[craftSet].b[4]} ／（6）${SETS[craftSet].b[6]}</p>`
        + li(`<div class="t"><span class="r4">${SETS[craftSet].pre}${SET_PART[craftSlot]}</span><span>iLv${craftIlv(c.t)}</span></div><div class="d">ほしのかけら ${P.mats.star}/1 ／ ${MATS[mk].n} ${P.mats[mk]||0}/3 ／ ${fmt(c.gold)}G ／ 成功率 ${Math.round(craftRate()*100)}%</div>`,
          `<button class="btn sm" data-act="t-craftSet" ${ok?'':'disabled'}>つくる</button>`);
    }
    if(craftMode==='reforge'){
      h += `<p class="hint">装備の 能力を 1行 振り直す。<span class="r3">一度 振り直した 装備は、同じ行しか 振り直せない。</span></p>`;
      const sel = rfSel && findItem(rfSel);
      if(sel){
        const c = reforgeCost(sel);
        h += li(`<div class="t"><span class="r${sel.rar}">${esc(sel.name)}</span><span>iLv${sel.ilv}</span></div><div class="d">費用 ${fmt(c.gold)}G ／ ${MATS[c.mk].n} ${P.mats[c.mk]||0}/${c.mat}</div>`) + `<div class="list">`;
        sel.aff.forEach((a,i)=>{ const lockd = sel.rfi!=null && sel.rfi!==i, ok = !lockd && P.gold>=c.gold && (P.mats[c.mk]||0)>=c.mat;
          h += li(`<div class="t"><span>${AFF[a.k].n} ${AFF[a.k].f(a.v)}</span>${sel.rfi===i?'<span class="tag r2">作り直し中</span>':''}</div>`, `<button class="btn sm" data-act="t-rfDo" data-i="${i}" ${ok?'':'disabled'}>${lockd?'不可':'振り直す'}</button>`); });
        h += `</div><div class="row"><button class="btn sm" data-act="t-rfSel" data-id="">べつの 装備を えらぶ</button></div>`;
      }else{
        const list = [...equipped(), ...P.inv.slice().sort((a,b)=>b.rar-a.rar||itemScore(b)-itemScore(a))].filter(it=>it.aff.length).slice(0,40);
        h += `<div class="list">${list.map(it=>`<button class="li" data-act="t-rfSel" data-id="${it.id}"><div class="body"><div class="t"><span class="r${it.rar}">${equipped().includes(it)?'<span class="hint">そうび中</span> ':''}${esc(it.name)}</span></div><div class="d">${itemLines(it).join(' ／ ')}</div></div></button>`).join('') || '<p class="hint">能力の ついた 装備が ない。</p>'}</div>`;
      }
    }
  }
  if(TOWN==='refine'){
    h += `<h3>精錬所</h3><p class="hint">ゴールドで 装備の 基本性能を きたえる。+6までは 1段ごとに +10%、+7から 大きく伸びて +10で 10倍${refCap()>=11?'、+11で 15倍':''}。<br><span class="r3">+5から先は 失敗すると 装備が こわれる。</span></p>`;
    const row = (it, where) => {
      const r = it.ref||0;
      if(r >= refCap()) return li(`<div class="t"><span class="r${it.rar}">${esc(it.name)}</span><span class="r2">最大</span></div><div class="d">${where}</div>`);
      const rate = refRate(r), cost = refCost(it);
      return li(`<div class="t"><span class="r${it.rar}">${esc(it.name)}</span><span>+${r}→+${r+1}</span></div><div class="d">${where} ／ ×${REF_MUL[r]}→×${REF_MUL[r+1]} ／ 成功率 <span class="${rate<1?'r3':''}">${Math.round(rate*100)}%</span> ／ ${fmt(cost)}G</div>`,
        `<button class="btn sm ${rate<1?'danger':''}" data-act="t-refine" data-id="${it.id}" ${P.gold>=cost?'':'disabled'}>精錬</button>${r+1<refCap()?`<button class="btn sm" data-act="t-refBulk" data-id="${it.id}" ${P.gold>=cost?'':'disabled'}>まとめて</button>`:''}`);
    };
    h += `<h3>そうび中</h3><div class="list">${equipped().map(it=>row(it, SLOTN[it.slot])).join('') || '<p class="hint">なにも そうびしていない。</p>'}</div>`;
    const cand = P.inv.filter(it=>it.rar>=2 || it.ref).sort((a,b)=>b.rar-a.rar||itemScore(b)-itemScore(a));
    h += `<h3>もちもの（レア以上）</h3><div class="list">${cand.map(it=>row(it,'もちもの')).join('') || '<p class="hint">レア以上の 装備が ない。</p>'}</div>
      <p class="hint">これまでの 精錬 ${P.stats2.refines}回 ／ こわれた ${P.stats2.broken}こ</p>`;
  }
  if(TOWN==='market'){
    const now = new Date(), mid = new Date(now); mid.setHours(24,0,0,0); const left = mid-now;
    const arrow = key => { const p = Math.round((mktMul(key)-1)*100); return p>=0 ? `<span class="down">▲${p}%</span>` : `<span class="up">▼${-p}%</span>`; };
    h += `<h3>市場（${P.market.day}）</h3><p class="hint">相場は 毎日 かわる。安い日に 買って、高い日に 売ろう。あと ${Math.floor(left/36e5)}時間${Math.floor(left/6e4)%60}分で 相場が かわる。</p><div class="list">`;
    for(const k of Object.keys(MATS)){ const key='mat:'+k, left2 = matStock()-(P.market.bought[key]||0);
      h += li(`<div class="t"><span>${MATS[k].n}</span><span>${arrow(key)}</span></div><div class="d">買う ${fmt(mktBuy(key))}G（のこり${left2}）／ 売る ${fmt(mktSellNow(key))}G${mktHeld(key)?'（きょう 買った ぶん）':''} ／ もっている ${P.mats[k]||0}</div>`,
        `<button class="btn sm" data-act="t-mbuy" data-k="${key}" ${P.gold>=mktBuy(key)&&left2>0?'':'disabled'}>買う</button><button class="btn sm" data-act="t-msell" data-k="${key}" ${P.mats[k]?'':'disabled'}>売る</button>`); }
    h += `</div><h3>きょうの カード</h3><div class="list">`;
    for(const k of mktCardsToday()){ const key='card:'+k, sold=P.market.bought[key];
      h += li(`<div class="t"><span class="${cardCls(k)}">${CARDS[k].n}</span><span>${arrow(key)}</span></div><div class="d">${CARDS[k].type==='weapon'?'武器用':'防具用'} ／ ${CARDS[k].d} ／ ${fmt(mktBuy(key))}G</div>`,
        `<button class="btn sm" data-act="t-mbuy" data-k="${key}" ${!sold&&P.gold>=mktBuy(key)?'':'disabled'}>${sold?'売りきれ':'買う'}</button>`); }
    h += `</div><h3>お守り</h3><p class="hint">買った お守りは 次の 出撃 1回だけ 効く。</p><div class="list">`;
    for(const k in CHARMS){ const have = P.charmNext[k], pr = charmPrice(k);
      h += li(`<div class="t"><span>${CHARMS[k].n}</span>${have?'<span class="tag r4">次の出撃で 使う</span>':''}</div><div class="d">${CHARMS[k].d} ／ ${fmt(pr)}G</div>`,
        `<button class="btn sm" data-act="t-charm" data-k="${k}" ${!have&&P.gold>=pr?'':'disabled'}>${have?'購入ずみ':'買う'}</button>`); }
    h += `</div>`;
  }
  if(TOWN==='swap'){
    const keys = Object.keys(CARDS), own = keys.filter(k=>P.cards[k]>0), known = keys.filter(k=>P.album[k]);
    h += `<h3>カード交換所</h3><p class="hint">いらない カードを「カードのかけら」に かえて、かけらで すきな カードと 交換できる。交換できるのは カード帖に 登録ずみの カードだけ。</p>
      <p>カードのかけら：<b class="r2">${P.shards}</b></p><h3>かけらに かえる</h3><p class="hint">ふつう 1 ／ ボス 5 かけら</p><div class="list">`;
    h += own.map(k=>li(`<div class="t"><span class="${cardCls(k)}">${CARDS[k].n}</span><span>×${P.cards[k]}</span></div><div class="d">${CARDS[k].d}</div>`, `<button class="btn sm" data-act="t-toShard" data-k="${k}">かけら +${shardGive(k)}</button>`)).join('') || '<p class="hint">カードを 1まいも もっていない。</p>';
    h += `</div><h3>かけらで 交換</h3><p class="hint">ふつう 8 ／ ボス 60 かけら</p><div class="list">`;
    h += known.map(k=>li(`<div class="t"><span class="${cardCls(k)}">${CARDS[k].n}</span><span class="hint">×${P.cards[k]||0}</span></div><div class="d">${CARDS[k].d}</div>`, `<button class="btn sm" data-act="t-fromShard" data-k="${k}" ${P.shards>=shardCost(k)?'':'disabled'}>${shardCost(k)} かけら</button>`)).join('') || '<p class="hint">カード帖に 登録された カードが まだ ない。</p>';
    h += `</div>`;
  }
  if(TOWN==='fac'){
    h += `<h3>施設</h3><p class="hint">ゴールドで 拠点の 施設を 広げる。一度 広げると ずっと 効果が つづく。</p><div class="list">`;
    for(const k in FAC){ const F2=FAC[k], l=facLv(k), maxed=l>=F2.max, cost=maxed?0:F2.cost[l];
      h += li(`<div class="t"><span>${F2.n}</span><span>${maxed?'<span class="r2">最大</span>':`Lv${l}/${F2.max}`}</span></div><div class="d">いま：${F2.d(l)}${maxed?'':` → ${F2.d(l+1)}`}</div>`, maxed?'':`<button class="btn sm" data-act="t-facUp" data-k="${k}" ${P.gold>=cost?'':'disabled'}>広げる<br>${fmt(cost)}G</button>`); }
    h += `</div>`;
  }
  return h;
}
function panelCards(){
  const keys = Object.keys(CARDS), reg = albumCount();
  let h = `<h3>カード帖（${reg}/${keys.length}）</h3>`;
  STAGES.forEach((s,i)=>{
    const ks = keys.filter(k => CARDS[k].boss ? STAGES[i].boss===k : RANK[k]===i);
    h += `<p class="hint" style="margin-top:6px">${veil(s.n)} ${ks.filter(k=>P.album[k]).length}/${ks.length}</p><div class="album">`;
    for(const k of ks){ const on = P.album[k];
      h += `<div class="acard ${on?'on':''} ${CARDS[k].boss?'boss':''}">${imgTag(k,'', on?'':'filter:brightness(0) opacity(.35)')}<span>${on?EDEF[k].n:(CARDS[k].boss?'ボス':'？？？')}</span></div>`; }
    h += `</div>`;
  });
  { const on = P.album.b_maou, seen = on || (P.clear[5]||0) >= TOWER_RD-1;   // 魔王の カード（とどくまで ふせる）
    h += `<p class="hint" style="margin-top:6px">${seen ? '魔王' : '？？？'} ${on?1:0}/1</p><div class="album"><div class="acard boss ${on?'on':''}">${imgTag('b_maou','', on?'width:40px;height:auto':'width:40px;height:auto;filter:brightness(0) opacity(.35)')}<span>${on ? EDEF.b_maou.n : seen ? 'ボス' : '？？？'}</span></div></div>`; }
  { const T = [[100,'b_guard'],[300,'b_shadow'],[1000,'b_source']], seen = towerOpen();
    h += `<p class="hint" style="margin-top:6px">${seen ? '無限の塔' : '？？？'} ${T.filter(([,k])=>P.album[k]).length}/3</p><div class="album">${T.map(([f,k])=>{ const on = P.album[k], met = on || ((P.tower||{}).ms||{})[f];
      return `<div class="acard boss ${on?'on':''}">${imgTag(k==='b_source'?'b_source2':k,'', on?'width:40px;height:auto':'width:40px;height:auto;filter:brightness(0) opacity(.35)')}<span>${on ? EDEF[k].n : met ? 'ボス' : '？？？'}</span></div>`; }).join('')}</div>`; }
  h += `<p class="hint">登録ボーナス：最大HP +${reg}% ／ 攻撃力 +${reg}%（1まいごとに +1%）<br>${reg>=keys.length?'<span class="r2">コンプリート：ひらめき率 +20%</span>':'ぜんぶ そろえると ひらめき率 +20%'}</p>
    <h3>もっている カード</h3><p class="hint">武器用は 武器に、防具用は 武器以外に 挿せる（装備タブで 装備を タップ →「カードを挿す」）。挿した カードは 外せない。まものが ごく まれに 落とす。</p><div class="list">`;
  const own = keys.filter(k=>P.cards[k]>0);
  h += own.map(k=>`<div class="li" style="cursor:default;align-items:center">${imgTag(k)}<div class="body"><div class="t"><span class="${cardCls(k)}">${CARDS[k].n}<span class="tag">${CARDS[k].type==='weapon'?'武器用':'防具用'}</span></span><span>×${P.cards[k]}</span></div><div class="d">${CARDS[k].d}</div></div>
    <button class="btn sm" data-act="t-csell" data-k="${k}" style="flex:none">売る<br>${fmt(mktSellNow('card:'+k))}G</button></div>`).join('') || '<p class="hint">まだ 1まいも ない。</p>';
  h += `</div><h3>青箱</h3><div class="row"><b style="font-size:15px;color:#2f64cc">■ ×${P.boxes}</b><button class="btn sm" data-act="t-box" data-n="1" ${P.boxes?'':'disabled'}>1こ あける</button><button class="btn sm" data-act="t-box" data-n="10" ${P.boxes>1?'':'disabled'}>まとめて（最大10）</button></div>
    <p class="hint">ボスが かならず 落とす。中身は マジック以上の 装備・ゴールド・まれに カード。</p>`;
  return h;
}
// 装備の カード欄（装備の くわしい画面で 使う）
const cardLine = it => it.cards && it.cards.length ? `<p class="hint" style="margin-top:4px">カード：${it.cards.map(c=>c?`<span class="${cardCls(c)}">◆${CARDS[c].n}（${CARDS[c].d}）</span>`:'◇ あき').join(' ／ ')}</p>` : '';
function cardPicker(id){
  const it = findItem(id); if(!it) return;
  const ks = Object.keys(CARDS).filter(k=>P.cards[k]>0 && cardFits(k,it));
  showModal(`<h2><span class="r${it.rar}">${esc(it.name)}</span> に 挿す カード</h2><p class="r3" style="font-size:13px">挿した カードは 二度と 外せない。</p>
    <div class="list">${ks.map(k=>`<button class="li" data-m="t-cardDo" data-id="${it.id}" data-k="${k}">${imgTag(k)}<div class="body"><div class="t"><span class="${cardCls(k)}">${CARDS[k].n}</span><span>×${P.cards[k]}</span></div><div class="d">${CARDS[k].d}</div></div></button>`).join('')}</div>
    <div class="opts"><button class="btn" data-m="close">やめる</button></div>`);
}
function refineResult(it, res){
  if(!res) return;
  if(!res.ok){ showModal(`<p class="r3" style="font-weight:800">カキーン… +${res.r0} → +${res.r0+1} で しっぱい。<br>${esc(it.name)} は こなごなに くだけた。</p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`); renderCamp(); return; }
  const r = it.ref, next = r < refCap() ? `<p class="hint">つぎ：+${r} → +${r+1}（×${REF_MUL[r]} → ×${REF_MUL[r+1]}）／ 成功率 ${Math.round(refRate(r)*100)}% ／ ${fmt(refCost(it))}G</p>` : '';
  showModal(`<p class="r2" style="font-weight:800">精錬 せいこう！ +${res.r0} → +${r}（×${REF_MUL[res.r0]} → ×${REF_MUL[r]}）</p><p><span class="r${it.rar}">${esc(it.name)}</span></p>${next}
    <div class="opts"><button class="btn" data-m="close">とじる</button>${r<refCap()?`<button class="btn ${refRate(r)<1?'danger':'primary'}" data-m="t-refAgain" data-id="${it.id}" ${P.gold>=refCost(it)?'':'disabled'}>続けて 精錬</button>`:''}</div>`);
  renderCamp();
}
// --- 町・カードの 操作 ---
$('#panel').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-act^="t-"]'); if(!b) return;
  const a = b.dataset.act, k = b.dataset.k;
  if(a==='t-tab'){ TOWN = k; }
  else if(a==='t-cmode'){ craftMode = k; }
  else if(a==='t-cslot'){ craftSlot = k; }
  else if(a==='t-cwt'){ craftWT = k; }
  else if(a==='t-cset'){ craftSet = k; }
  else if(a==='t-craft' || a==='t-craftSet'){
    const r = a==='t-craft' ? doCraft(craftSlot, +b.dataset.t, craftStar) : doCraftSet(craftSet, craftSlot); if(!r) return;
    showModal(r.fail ? `<p>しっぱい… 素材と ゴールドは なくなった。</p><p class="hint">鍛冶熟練度 +3</p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`
      : `<h2>できた！</h2><p><span class="r${r.it.rar}">${esc(r.it.name)}</span>（${RAR_N[r.it.rar]}・iLv${r.it.ilv}）</p><div class="hint">${itemLines(r.it).join('<br>')}${r.it.u?`<br><span class="r3">◆ ${UNIQ[r.it.u].p}</span>`:''}${r.it.cards.length?`<br>カードスロット ${r.it.cards.length}`:''}</div><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`);
  }
  else if(a==='t-rfSel'){ rfSel = b.dataset.id ? +b.dataset.id : null; }
  else if(a==='t-rfDo'){ const it=findItem(rfSel); const r = it && doReforge(it, +b.dataset.i); if(r) showModal(`<p>${AFF[r.old.k].n} ${AFF[r.old.k].f(r.old.v)} → <b>${AFF[r.nw.k].n} ${AFF[r.nw.k].f(r.nw.v)}</b></p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`); }
  else if(a==='t-refine'){ const it=findItem(+b.dataset.id); if(it) refineResult(it, refineOnce(it)); return; }
  else if(a==='t-refBulk'){ const it=findItem(+b.dataset.id); if(!it) return; const r=it.ref||0;
    const chips = []; for(let t=r+1;t<=refCap();t++){ const pl=refPlan(it,t); chips.push(`<button class="li" data-m="t-refBulkDo" data-id="${it.id}" data-to="${t}"><div class="body"><div class="t"><span>+${t} まで</span><span class="${pl.p<1?'r3':''}">${pctStr(pl.p)}%</span></div><div class="d">費用 ${fmt(pl.cost)}G</div></div></button>`); }
    showModal(`<h2>どこまで まとめて 精錬する？</h2><p class="hint"><span class="r${it.rar}">${esc(it.name)}</span>（いま +${r}）。とちゅうで 1回でも 失敗すると こわれる。ゴールドが たりなくなったら そこで とまる。</p><div class="list">${chips.join('')}</div><div class="opts"><button class="btn" data-m="close">やめる</button></div>`); return; }
  else if(a==='t-mbuy'){ const key=k, [t,x]=key.split(':'), pr=mktBuy(key); if(P.gold<pr) return; P.gold-=pr;
    if(t==='mat'){ P.mats[x]=(P.mats[x]||0)+1; P.market.bought[key]=(P.market.bought[key]||0)+1; } else { addCard(x); P.market.bought[key]=1; refreshHS(); }
    P.market.held = P.market.held||{}; P.market.held[key] = (P.market.held[key]||0)+1; save(); }
  else if(a==='t-msell'){ const [t,x]=k.split(':'); if(!P.mats[x]) return; P.mats[x]--; P.gold+=mktSellDo(k); save(); }
  else if(a==='t-charm'){ const pr=charmPrice(k); if(P.gold<pr) return; P.gold-=pr; P.charmNext[k]=true; save(); }
  else if(a==='t-toShard'){ if(!P.cards[k]) return; P.cards[k]--; P.shards+=shardGive(k); save(); }
  else if(a==='t-fromShard'){ if(P.shards<shardCost(k)) return; P.shards-=shardCost(k); addCard(k); refreshHS(); save(); }
  else if(a==='t-csell'){ if(!P.cards[k]) return; P.cards[k]--; P.gold+=mktSellDo('card:'+k); save(); }
  else if(a==='t-facUp'){ const l=facLv(k), cost=FAC[k].cost[l]; if(l>=FAC[k].max || P.gold<cost) return; P.gold-=cost; P.fac[k]=l+1; refreshHS(); save(); }
  else if(a==='t-box'){ const n=+b.dataset.n, res=[]; for(let i=0;i<n && P.boxes>0;i++){ P.boxes--; res.push(openBox()); } save();
    if(res.length) showModal(`<h2>青箱を ${res.length}こ あけた！</h2><div class="loot">${res.map(x=>`<div>${x}</div>`).join('')}</div><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`); }
  renderCamp();
});
$('#panel').addEventListener('change', ev=>{ if(ev.target.dataset.act==='t-star'){ craftStar = ev.target.checked; renderCamp(); } });
$('#modal').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-m^="t-"]'); if(!b) return;
  const m = b.dataset.m;
  if(m==='t-card'){ cardPicker(+b.dataset.id); }
  else if(m==='t-cardDo'){ const it=findItem(+b.dataset.id), k=b.dataset.k; const i = it && it.cards.indexOf(null);
    if(it && i>=0 && P.cards[k]>0 && cardFits(k,it)){ it.cards[i]=k; P.cards[k]--; refreshHS(); save(); showModal(`<p><span class="${cardCls(k)}">${CARDS[k].n}</span> を <span class="r${it.rar}">${esc(it.name)}</span> に 挿した！</p><p class="hint">${CARDS[k].d}</p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`); renderCamp(); } }
  else if(m==='t-refAgain'){ const it=findItem(+b.dataset.id); if(it) refineResult(it, refineOnce(it)); }
  else if(m==='t-refBulkDo'){ const it=findItem(+b.dataset.id), to=+b.dataset.to; if(!it) return; const r0=it.ref||0; let res=null, n=0;
    while((it.ref||0) < to){ if(P.gold < refCost(it)) break; res = refineOnce(it); n++; if(!res.ok) break; }
    if(res && !res.ok) refineResult(it, res);
    else { showModal(`<p class="r2" style="font-weight:800">${(it.ref||0)>=to?`+${it.ref} に しあがった！`:`ゴールドが たりず +${it.ref||0} で とまった`}</p><p><span class="r${it.rar}">${esc(it.name)}</span>（+${r0} → +${it.ref||0}、${n}回）</p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`); renderCamp(); } }
});
