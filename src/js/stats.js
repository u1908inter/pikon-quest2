// ===== ゆうしゃの ステータス（本作の heroStats と 同じ組み立て） =====
const equipped = () => EQ.map(k => P.equip[k]).filter(Boolean);
function setCounts(){
  const c = {};
  for (const it of equipped()) if (it.set) (c[it.set] = c[it.set] || new Set()).add(it.slot);
  const o = {}; for (const k in c) o[k] = c[k].size; return o;
}
const baseAtkAt = L => 8 + 2.6*(L-1);
const baseHpAt  = L => 60 + 14*(L-1);
function heroStats(){
  const L = P.hero.lv;
  const s = {hp:baseHpAt(L), atk:baseAtkAt(L), def:3 + 1.2*(L-1), crit:5, critMul:1.8,
             aspd:0, spg:0, air:0, ally:0, mag:0, spark:0, exp:0, gold:0, hpPct:0, atkPct:0, defPct:0, pw:{}};
  for (const it of equipped()){
    const rm = refMul(it);
    for (const k in it.base) s[k] += it.base[k]*rm;
    for (const a of it.aff) s[a.k] += a.v;
    if (it.u) UNIQ[it.u].fx(s);
    if (it.a && ARTI[it.a]) ARTI[it.a].fx(s);
    for (const c of (it.cards||[])) if (c && CARDS[c]) CARDS[c].fx(s);
  }
  const ac = albumCount(); s.hpPct += ac; s.atkPct += ac;
  { const rb = (P.tower && P.tower.reborn) || 0; if(rb){ s.hpPct += 10*rb; s.atkPct += 10*rb; s.ally += 10*rb; s.exp += 20*rb; s.gold += 20*rb; } }   // 転生
  if (ac >= Object.keys(CARDS).length) s.spark += 20;
  const ch = (typeof R !== 'undefined' && R && R.charm) || {};
  if (ch.exp) s.exp += 50;
  if (ch.gold) s.gold += 100;
  if (ch.spark) s.pw.charmSpark = 2;
  if (ch.drop) s.pw.dropX = (s.pw.dropX||1)*2;
  if (ch.tame) s.pw.tame = (s.pw.tame||1)*2;
  if (ch.guard) add(s.pw, 'cut', 25);
  const J = JOBS[P.job], jl = jobLv(P.job);
  J.bfx(s);
  for (const a of J.ab) if (jl >= a.lv) a.fx(s);
  for (const c of slotKeys()){ const v = P.mslots[c]; if(!v) continue; const r = abRef(v); if (abLearned(r) && r.j !== P.job) r.a.fx(s); }
  applyPowers(s); applyArtPowers(s);
  applyWTree(s);
  const sc = s.pw.sets = setCounts(), on = (k,n) => (sc[k]||0) >= n;
  if (on('raimei',2)) s.spg += 20;
  if (on('raimei',4)) s.pw.spBolt = true;
  if (on('raimei',6)) add(s.pw, 'spDmg', 100);
  if (on('juuou',2)) add(s.pw, 'allyHp', 30);
  if (on('juuou',4)) s.ally += 50;
  if (on('juuou',6)) s.pw.allyX = 2.5;
  if (on('shounin',2)) s.gold += 50;
  if (on('shounin',4)) s.exp += 50;
  if (on('shounin',6)) s.pw.dropX = 2;
  if (on('mikazuki',2)) s.crit += 15;
  if (on('mikazuki',4)) s.critMul = Math.max(s.critMul, 2.5);
  if (on('mikazuki',6)) s.pw.mikazuki = true;
  if (s.pw.critPlus) s.critMul += s.pw.critPlus;
  s.hp *= 1 + s.hpPct/100; s.atk *= 1 + s.atkPct/100; s.def *= 1 + s.defPct/100;
  s.crit = Math.min(s.crit, 75); s.aspd = Math.min(s.aspd, 150);
  s.hp = Math.round(s.hp); s.atk = Math.round(s.atk); s.def = Math.round(s.def);
  return s;
}
let HS = null;
const refreshHS = () => { HS = heroStats(); };
function activeAbNames(){
  const set = new Set(), jl = jobLv(P.job);
  for (const a of JOBS[P.job].ab) if (jl >= a.lv) set.add(a.n);
  for (const c of slotKeys()){ const v = P.mslots[c]; if (v){ const r = abRef(v); if (abLearned(r)) set.add(r.a.n); } }
  return set;
}

// ===== 装備の 生成（本作の genItem / rollRar / affVal と 同じ流れ） =====
function rollRar(f, boss, noNormal, luck=1){
  const g = 1 + 0.05*(f-1);
  const w = [70/(1+0.08*(f-1)), 25, 5*g*luck, 3*g*luck, 5*g*luck];
  if (boss){ w[0] *= 0.3; w[2] *= 3; w[3] *= 4; w[4] *= 4; }
  if (noNormal) w[0] = 0;
  let r = Math.random() * w.reduce((a,b)=>a+b);
  for (let i=0;i<5;i++){ if (r < w[i]) return i; r -= w[i]; }
  return 0;
}
function affVal(k, ilv){
  switch (k){
    case 'atk': return Math.round(1 + ilv*0.8*rand(0.7,1.2));
    case 'def': return Math.round(1 + ilv*0.5*rand(0.7,1.2));
    case 'hp':  return Math.round(5 + ilv*4*rand(0.7,1.2));
    case 'crit': return ri(2,6);
    case 'aspd': return ri(4,12);
    case 'spg': return ri(5,15);
    case 'air': return ri(5,15);
    case 'ally': return ri(5,15);
    case 'spark': return ri(10,40);
    case 'exp': return ri(5,20);
    case 'gold': return ri(10,30);
  }
}
function genItem(L, boss, noNormal, opt={}){
  const f = 3*L;   // 本作の 階層に あたる値
  const rar = opt.rar != null ? opt.rar : rollRar(f, boss, noNormal, HS && HS.pw.loot || 1);
  const ilv = opt.ilv || Math.max(1, f + ri(-1,1));
  const tier = Math.min(5, Math.floor((ilv-1)/3));
  let slot = opt.slot || pick(SLOTS), name = null, u = null, set = null;
  if (rar === 3){ u = opt.u || pick(Object.keys(UNIQ)); slot = UNIQ[u].slot; name = UNIQ[u].n; }
  const a = rar === 5 ? (opt.a || pick(Object.keys(ARTI))) : null;
  if (a){ slot = 'weapon'; name = ARTI[a].n; }
  // 武器の 系統: いまの ジョブで 持てる 系統が 7割
  const wt = slot !== 'weapon' ? null : a ? ARTI[a].wt : u ? (UNIQ_WT[u]||'sword') : (opt.wt || (Math.random() < .7 ? pick(jobWeapons()) : pick(WT)));
  const setPart = sl => sl === 'weapon' ? WT_PART[wt || 'sword'] : SET_PART[sl];
  if (rar === 4 && opt.set){ set = opt.set; name = SETS[set].pre + setPart(slot); }
  else if (rar === 4){
    const owned = {};
    for (const it of [...equipped(), ...P.inv]) if (it.set) (owned[it.set] = owned[it.set] || new Set()).add(it.slot);
    const keys = Object.keys(owned);
    set = keys.length && Math.random() < 0.5 ? pick(keys) : pick(Object.keys(SETS));
    const missing = SLOTS.filter(sl => !(owned[set] && owned[set].has(sl)));
    slot = missing.length && Math.random() < 0.6 ? pick(missing) : pick(SLOTS);
    name = SETS[set].pre + (slot === 'weapon' ? WT_PART[wt || pick(jobWeapons())] : SET_PART[slot]);
  }
  const r = () => rand(0.9,1.15) * (rar >= 5 ? 1.5 : rar >= 3 ? 1.15 : 1);   // 神器は 基本性能 1.5倍
  const base = {};
  if (slot === 'weapon') base.atk = Math.round((5 + ilv*2.6)*r());
  if (slot === 'head'){ base.def = Math.round((2 + ilv*1.0)*r()); base.hp = Math.round(ilv*4*r()); }
  if (slot === 'body'){ base.def = Math.round((3 + ilv*1.5)*r()); base.hp = Math.round((10 + ilv*8)*r()); }
  if (slot === 'hands'){ base.def = Math.round((1 + ilv*0.7)*r()); base.atk = Math.round((1 + ilv*0.6)*r()); }
  if (slot === 'feet'){ base.def = Math.round((1 + ilv*0.8)*r()); base.hp = Math.round(ilv*3*r()); }
  const n = [0, ri(1,2), ri(3,4), 2, 2, 4][rar] + (slot === 'acc' ? 1 : 0);
  const keys = Object.keys(AFF).sort(() => Math.random()-0.5).slice(0, n);
  const aff = keys.map(k => ({k, v: affVal(k, ilv)}));
  if (!name){
    const pool = slot === 'weapon' ? WNAMES[wt] : BASE_N[slot];
    name = pick(slot === 'acc' ? BASE_N.acc : pool.slice(Math.max(0, tier-1), tier+1));
    if (rar === 1) name += '+';
    if (rar === 2) name = pick(RARE_PRE) + name;
  }
  const cards = Array((rar === 5 ? 2 : cardSlotsFor(rar)) + (opt.extraSlot ? 1 : 0)).fill(null);
  const it = {id: ++P.uid, slot, name, rar, ilv, base, aff, u, set, ref:0, cards, crafted: !!opt.crafted};
  if (a) it.a = a;
  if (slot === 'weapon') it.wt = set && rar === 4 ? (WT.find(w => name.endsWith(WT_PART[w])) || wt) : wt;
  return it;
}
const W8 = {atk:2, def:1.5, hp:0.3, crit:1.5, aspd:1.2, spg:1, air:1, ally:1, spark:0.3, exp:0.2, gold:0.1};
const JOB_W8 = {senshi:{atk:1.5, air:1.5}, budou:{atk:1.5, aspd:1.5}, mahou:{atk:1.5, spg:1.5}, touzoku:{crit:1.5, aspd:1.5}, souryo:{hp:1.5, def:1.5}, kariudo:{crit:1.5, air:1.5}};
const w8 = k => W8[k] * ((JOB_W8[P.job]||{})[k] || 1);
function itemScore(it){
  if (!it) return 0;
  let s = 0;
  for (const k in it.base) s += it.base[k] * refMul(it) * w8(k);
  s += 15 * (it.cards||[]).filter(Boolean).length;
  for (const a of it.aff) s += a.v * w8(a.k);
  if (it.u) s += 40;
  if (it.a) s += 80;
  if (it.set) s += 30;
  return Math.round(s);
}
const sellPrice = it => Math.round(Math.min(it.rar+1, 4)**2 * it.ilv * 3 * (1 + 0.5*(it.ref||0)) * (HS && HS.pw.appraise ? 1.25 : 1));
function itemLines(it){
  const b = [], m = refMul(it);
  if (it.base.atk) b.push(`攻撃力 ${fmt(Math.round(it.base.atk*m))}`);
  if (it.base.def) b.push(`防御力 ${fmt(Math.round(it.base.def*m))}`);
  if (it.base.hp) b.push(`HP ${fmt(Math.round(it.base.hp*m))}`);
  const cs = (it.cards||[]).length ? it.cards.map(c => c ? '◆'+CARDS[c].n.replace('カード','') : '◇').join('') : '';
  if (it.slot === 'weapon') b.unshift(`【${WT_N[it.wt||'sword']}】`);
  return [b.join(' / ') + (it.ref ? `（精錬×${m}）` : ''), ...it.aff.map(a => `${AFF[a.k].n} ${AFF[a.k].f(a.v)}`), cs].filter(Boolean);
}
const eqTarget = it => it.slot !== 'acc' ? it.slot : (!P.equip.acc ? 'acc' : !P.equip.acc2 ? 'acc2' : (itemScore(P.equip.acc) <= itemScore(P.equip.acc2) ? 'acc' : 'acc2'));
const isWeak = it => !it.lock && it.rar < 3 && itemScore(it) <= itemScore(P.equip[eqTarget(it)]);   // 拾ったときの 自動売却（ユニーク・セットは 売らない）
const isWeakBulk = it => !it.lock && !(it.u && !P.extracted[it.u]) && !(it.a && !(P.artEx||{})[it.a]) && itemScore(it) <= itemScore(P.equip[eqTarget(it)]);   // まとめ売り（ユニーク・セットも 対象。まだ 力を 抽出していない ユニークは のこす）
function equipItem(id){
  const i = P.inv.findIndex(x => x.id === id); if (i < 0) return;
  const it = P.inv[i], k = eqTarget(it), old = P.equip[k];
  if (!canWield(it)) return;   // いまの ジョブでは 持てない 武器
  P.equip[k] = it; P.inv.splice(i, 1); if (old) P.inv.push(old);
  refreshHS(); save();
}
function unequip(k){ const it = P.equip[k]; if (!it) return; if (P.inv.length >= CFG.invMax) return; P.inv.push(it); P.equip[k] = null; refreshHS(); save(); }
function sellItem(id){ const i = P.inv.findIndex(x => x.id === id); if (i < 0) return 0; const g = sellPrice(P.inv[i]); P.gold += g; P.inv.splice(i,1); save(); return g; }
function bestEquip(){
  let changed = 0;
  for (let pass=0; pass<2; pass++){
    for (const it of [...P.inv].filter(x=>canWield(x)).sort((a,b)=>itemScore(b)-itemScore(a))){
      const k = eqTarget(it);
      if (itemScore(it) > itemScore(P.equip[k])){ equipItem(it.id); changed++; }
    }
  }
  refreshHS(); save(); return changed;
}
function addInv(it){
  if (P.autoSell && isWeak(it)){ P.gold += sellPrice(it); return 'sold'; }
  if (P.inv.length >= CFG.invMax){ P.gold += sellPrice(it); return 'full'; }
  P.inv.push(it);
  try{ if(it.slot && canWield(it) && itemScore(it) > itemScore(P.equip[eqTarget(it)])) setNew('gear'); }catch(_){}
  return 'ok';
}
