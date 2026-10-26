// ===== 周回の 特色（周回ごとに 戦い方が かわる）と レア敵 =====
const TRAITS = {
  wing:  {n:'つばさの周', d:'飛ぶ敵が 多い。空中の敵への ダメージ +20%'},
  rock:  {n:'いわの周',   d:'敵が かたい（ダメージ 半分）。浮いている 敵には ふだんどおり 通る'},
  elite: {n:'強敵の周',   d:'各ウェーブに 大きな 強敵が まざる。倒すと 宝箱'},
  twin:  {n:'双頭の周',   d:'ボスが 2体。仲間が 起き上がりやすい'},
  swift: {n:'はやての周', d:'敵の 攻撃が 速いが、HPは 低め'},
  horde: {n:'大群の周',   d:'敵の 数が 1.5倍、1体の HPは 低め'},
  curse: {n:'呪いの周',   d:'受ける ダメージ +10%。ひらめき率 2倍'},
  gold:  {n:'黄金の周',   d:'金色の レア敵が よく出る。ゴールド 2倍'},
  maou:  {n:'魔王の周',   d:'魔界の ボスが 魔王に なる。倒すと 伝説の 装備'},
};
const ROUND_TRAIT = {2:['wing'], 3:['rock'], 4:['elite'], 5:['twin'], 6:['swift'], 7:['horde'], 8:['curse'], 9:['gold'], 10:['maou']};
const TRAIT_POOL = ['wing','rock','elite','twin','swift','horde','curse','gold'];
// 11周目からは 2つ 重なる（周回ごとに 固定）
function traitsOf(rd){
  if(rd <= 1) return [];
  if(ROUND_TRAIT[rd]) return ROUND_TRAIT[rd];
  const N = TRAIT_POOL.length, ia = rd % N; let ib = (rd*3+5) % N; if(ib === ia) ib = (ia+3) % N;
  const a = TRAIT_POOL[ia], b = TRAIT_POOL[ib];
  return [a, b];
}
const hasT = k => !!(S.traits && S.traits.includes(k));
const traitLine = rd => traitsOf(rd).map(k=>`<b>${TRAITS[k].n}</b>：${TRAITS[k].d}`).join('<br>');
const FLY_OF = ['bat','f_bat','c_bat','c_bat','c_bat','c_bat'];
// ウェーブが 出たら 特色を かける
function applyTraits(){
  const boss = S.waveIdx > WAVES, mobs = S.es.filter(e=>!e.boss);
  if((S.traits||[]).length) S.waveName += '［'+S.traits.map(k=>TRAITS[k].n.replace('の周','')).join('・')+'］';
  if(!S.tut){
    if(hasT('wing')) mobs.forEach((e,i)=>{ if(i%3!==2 && !e.fl){ const k = FLY_OF[S.st]; e.key = k; e.name = EDEF[k].n; e.fl = EDEF[k].fly||14; } });
    if(hasT('elite') && !boss && mobs.length){ const e = pick(mobs); e.elite = true; e.s = 3; e.hp = e.max = e.max*6; e.atk *= 1.5; e.name = '強敵 '+e.name; }
    if(hasT('twin') && boss){ const b0 = S.es.find(e=>e.boss); if(b0){ const b2 = makeEnemy(b0.key, 140, 92, true); S.es.push(b2); b0.x = b0.hx = 176; } }
    for(const e of S.es){
      if(hasT('swift')){ e.hp = e.max = Math.round(e.max*.75); e.t *= .6; }
      if(hasT('horde')){ e.hp = e.max = Math.round(e.max*.7); }
      if(hasT('maou') && e.boss && S.st===5 && !e.maou){ makeMaou(e); }
    }
    // レア敵（どの 周回でも まれに。黄金の周は よく出る）
    for(const e of mobs) if(!e.elite && Math.random() < (hasT('gold') ? 1/20 : 1/150)){ e.rare = true; e.hp = e.max = e.max*3; }
    if(mobs.some(e=>e.rare)) later(.6, ()=>banner('きらきらの 敵が いる！'));
  }
}
// 倒したときの ごほうび
function traitOnKill(e){
  const b = eBox(e);
  if(e.rare){ flash(); sparks(b.cx, b.cy, 24, ['#ffe14a','#ffffff','#ffd24a'], 140); float('レア！','tag',b.cx,b.top-12); }
  if(e.elite){ const it = genItem(S.L, true, true); R.items.push({it, r:addInv(it), chest:true}); float('宝箱！','loot',b.cx,b.top-14,RCOL[it.rar]); }
  if(e.maou){
    const L = S.L, it = genItem(L, true, true, {rar:3, ilv:3*L+8});
    const have = new Set(it.aff.map(a=>a.k)), ks = Object.keys(AFF).filter(k=>!have.has(k));
    for(let i=0;i<2 && ks.length;i++){ const k = ks.splice(Math.floor(Math.random()*ks.length),1)[0]; it.aff.push({k, v: affVal(k, it.ilv)}); }
    it.name = '伝説の '+it.name; it.legend = true; it.cards = [null, null];
    R.items.push({it, r:addInv(it), chest:true});
    later(.4, ()=>banner('伝説の 装備を 手に入れた！'));
  }
}
