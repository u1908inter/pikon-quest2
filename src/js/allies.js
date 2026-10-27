// ===== 仲間（本作と 同じく 倒した敵が 確率で おきあがる。8系統） =====
// rate: おきあがりにくさ（本作と 同じ 値）。atk/hp: 系統ごとの 強さ。cd: 攻撃の 間隔
const FAM = {
  slime: {n:'スライム', rate:8,   hp:0.9, atk:0.9, cd:0.7, role:'たいあたり',   roleD:'手前の 2体に たいあたりして 浮かせる。パーティHPを 2% 回復',
          sp:'ぷるぷるヒール', spD:'パーティHPを 35% 回復', sp2:'メガスライム', sp2D:'巨大化して 落下。手前の 群れに 3倍＋打ち上げ',
          names:['プルル','ポヨン','スラッチ','ぷにお','ムニ']},
  bat:   {n:'コウモリ', rate:12,  hp:0.7, atk:0.5, cd:0.9, role:'ちょうおんぱ', roleD:'音波で 全員に 小ダメージ。敵の 攻撃を 少し おくらせる',
          sp:'こうもりの群れ', spD:'コウモリの 群れが 全員を つつく（空中の敵に 強い）', sp2:'きゅうけつ', sp2D:'全員に かみつき、パーティHPを 15% 回復',
          names:['バッタン','キィ','ヨルノ','パタ']},
  goblin:{n:'ゴブリン', rate:16,  hp:1.2, atk:1.2, cd:0.8, role:'こんぼう乱打', roleD:'手前の 1体に 3連打。しめで 手前の 2体を かち上げる',
          sp:'ゴブリンラッシュ', spD:'手前の 4体に こんぼうで 6連打', sp2:'ぶんどり', sp2D:'全員に 一撃 ＋ ゴールドを ぬすむ',
          names:['ゴブ太','ガジ','ボン','ゴンザ']},
  wolf:  {n:'ウルフ',   rate:16,  hp:1.0, atk:0.65, cd:0.8, role:'かけぬけ2連', roleD:'群れを かけぬけて 全員に 2回 かみつく',
          sp:'かげぶんしん牙', spD:'遠吠えで ひるませ、分身と 群れを かけぬける', sp2:'群れの遠吠え', sp2D:'6秒間 パーティ全員の 攻撃力 1.5倍。敵を ひるませる',
          names:['ハヤテ','ロウ','シルバ','クオン']},
  mush:  {n:'キノコ',   rate:20,  hp:1.1, atk:0.9, cd:1.0, role:'胞子（空中3連）', roleD:'群れの 真ん中で 胞子が はじける。空中の敵には 3連',
          sp:'まどろみの胞子', spD:'全員を 眠らせる（受けるダメージ 1.3倍）', sp2:'どくどく胞子', sp2D:'全員を 6秒 毒に する ＋ パーティHP 20% 回復',
          names:['キノ','ポコ','モリー','シメジ']},
  skel:  {n:'がいこつ', rate:24,  hp:1.3, atk:2.4, cd:1.2, role:'ほねくだき',   roleD:'手前で いちばん 強い 1体に 重い 一撃（ひるませる）',
          sp:'ほねの雨', spD:'骨が 全員に ふりそそぐ（1.5倍）', sp2:'しにがみの鎌', sp2D:'HP30%以下の 敵を 一撃で 倒す（ボス以外）。ほかは 1.5倍',
          names:['ホネ吉','カラン','ガイ','コツ']},
  golem: {n:'ゴーレム', rate:64,  hp:2.0, atk:2.0, cd:1.4, role:'しょうげき波', roleD:'着地の 衝撃波。空中の敵を まとめて 叩き落とす',
          sp:'だいちくだき', spD:'地上の敵は 地面ごと 打ち上げ、空中の敵は 叩き落とす', sp2:'いわなだれ', sp2D:'岩が 全員に 降りそそぐ（2.5倍＋気絶）。空中の敵は 叩き落とす',
          names:['ゴロン','イワオ','ドッシ']},
  dragon:{n:'ドラゴン', rate:128, hp:1.8, atk:1.6, cd:1.3, role:'ほのおのいき', roleD:'手前の 群れに 炎を はく（燃焼）。風圧で 低く 浮かせる',
          sp:'メガフレア', spD:'全員を 大爆発で 焼く（3倍＋燃焼）', sp2:'りゅうのはばたき', sp2D:'はばたきで 全員を 高く 打ち上げる',
          names:['ドラコ','グレン','ヒノメ']},
  maou:  {n:'魔王',     rate:999, hp:2.2, atk:2.0, cd:1.2, role:'闇の爪',       roleD:'手前の 3体を 闇の 爪で 切りさく（高く 浮いた 敵にも とどく）',
          sp:'闇の波動', spD:'全員を 闇で つつむ（3.5倍）。敵の 攻撃を 1.5秒 止める', sp2:'魔王の威光', sp2D:'8秒間 パーティの 攻撃力 1.5倍 ＋ 受ける ダメージ 半分',
          names:['ヴァルゴス']},
  guard: {n:'守護者',   rate:999, hp:2.8, atk:1.6, cd:1.4, role:'黄金の拳',     roleD:'手前の 2体に 重い 拳（2倍）。ひるませる',
          sp:'守護の盾', spD:'8秒間 パーティが 受ける ダメージ 60% カット', sp2:'神器解放', sp2D:'光の柱と レーザーで 全員に 3倍 ＋ 打ち上げ',
          names:['ゴルドガード']},
  shadow:{n:'影',       rate:999, hp:1.8, atk:2.2, cd:0.9, role:'影の刃',       roleD:'ランダムな 4体を 影の 刃で 切る（空中にも とどく）',
          sp:'影分身斬り', spD:'分身と いっしょに 全員を 10回 切りきざむ', sp2:'闇の帳', sp2D:'敵 全員を 3秒 止める（ボスは 攻撃を おくらせる）＋ 2倍',
          names:['シャドウ']},
  chaos: {n:'混沌',     rate:999, hp:2.6, atk:2.8, cd:1.0, role:'光と闇の刃',   roleD:'闇の 刃で 手前の 3体を 斬り、光の 線で 全員を つらぬく',
          sp:'混沌の 渦', spD:'全員に 4倍 ＋ 2秒 止める。パーティHP 20% 回復', sp2:'ヴァルピコ・ノヴァ', sp2D:'光と 闇の 大爆発で 全員に 7倍',
          names:['ヴァルピコ']},
  source:{n:'ひらめき', rate:999, hp:2.2, atk:2.4, cd:1.1, role:'ひらめきの光', roleD:'光の 線が 全員を つらぬく',
          sp:'ピコーン！', spD:'パーティHP 30% 回復 ＋ 仲間と ゆうしゃの ゲージを 50% ためる', sp2:'大ひらめき', sp2D:'まぶしい 光で 全員に 5倍',
          names:['ピコ']},
};
const SLOT_POS = [{hx:66,hy:93},{hx:50,hy:102},{hx:33,hy:89},{hx:20,hy:105}];
// 種族の 格: ステージが 先のものほど 上。ボスは さらに 上（合体事故は 同じ系統の 上の 格へ）
const RANK = {};
STAGES.forEach((s,i)=>{ s.en.forEach(k=>{ if(RANK[k]==null) RANK[k]=i; }); RANK[s.boss] = i+3; });
RANK.b_maou = RANK.b_maou2 = 10;   // 魔王は いちばん 上の 種
RANK.b_guard = 9; RANK.b_shadow = 11; RANK.b_source = RANK.b_source2 = 12; RANK.b_chaos = RANK.b_chaos2 = 13;   // 塔の 節目ボス
const famOf = k => EDEF[k].fam;
const spMul = k => 1 + 0.12*(RANK[k]||0);
const PLUS_STEP = 0.03;   // 合体の ＋1ごとに HP・攻撃 +3%（本作と 同じ）
const ACCIDENT_RATE = 1/64;
const rollMaxLv = () => 30 + Math.floor((999-30) * Math.pow(Math.random(), 2.5));
const allyName = al => al.name + (al.plus ? '+'+al.plus : '');
const allyById = id => P.allies.find(a=>a.id===id);
function allyPow(al){
  const F = FAM[famOf(al.sp)], pm = 1 + PLUS_STEP*(al.plus||0);
  return 8 * F.atk * spMul(al.sp) * baseAtkAt(al.lv)/8 * pm * al.g.atk * (1+HS.ally/100) * (HS.pw.allyX||1);
}
function allyHp(al){
  const F = FAM[famOf(al.sp)], pm = 1 + PLUS_STEP*(al.plus||0);
  return Math.round(baseHpAt(al.lv)/3 * F.hp * spMul(al.sp) * pm * al.g.hp * (1+(HS.pw.allyHp||0)/100));
}
const members = () => P.party.map(allyById).filter(Boolean);
const partyMaxHp = () => HS.hp + members().reduce((s,al)=>s+allyHp(al),0);
const partyPow = () => CH.slice(1).reduce((s,c)=>s+c.pow,0);
function newAlly(sp, L){
  const fam = famOf(sp), F = FAM[fam], maxLv = rollMaxLv();
  const used = new Set(P.allies.map(a=>a.name));
  let name = F.names.find(n=>!used.has(n));
  if(!name){ let k=2; const b=F.names[P.allies.length % F.names.length]; while(used.has(b+k)) k++; name=b+k; }
  const lv = Math.max(1, Math.min(maxLv, Math.min(P.hero.lv, 3*L-2)));
  return {id: ++P.uid, sp, name, lv, exp:0, plus:0, maxLv, g:{hp:rand(.85,1.25), atk:rand(.85,1.25)}};
}
// パーティを 組み直す（戦闘の 列も つくりなおす）
function buildParty(){
  const keep = CH[0];
  CH.length = 0; CH.push(keep);
  members().forEach((al,k)=>{
    const fam = famOf(al.sp), F = FAM[fam], pos = SLOT_POS[k+1];
    CH.push({id:fam, fam, al, name:allyName(al), spr:al.sp, role:F.role, sp:F.sp, sp2:F.sp2, cd:F.cd, hx:pos.hx, hy:pos.hy, pow:allyPow(al)});
  });
  const old = ACT.slice();
  ACT.length = 0;
  CH.forEach((c,i)=>{ const o = old.find(a=>a.c===c || (a.c.al && a.c.al===c.al)); ACT.push(o ? Object.assign(o,{c}) : {c, x:c.hx, y:c.hy, anim:null, kx:0, flash:0, sqx:1, sqy:1, rot:0, flip:false}); });
}
function refreshPartyPow(){ CH.forEach(c=>{ if(c.al){ c.pow = allyPow(c.al); c.name = allyName(c.al); } }); }

// ===== 戦闘中の おきあがり =====
function rollRecruit(e){
  if(e.noRecruit) return;   // 影の 分身は 仲間に ならない
  const SPB = e.maou ? 'b_maou' : e.ms===100 ? 'b_guard' : e.ms===300 ? 'b_shadow' : e.ms===1000 ? 'b_source2' : e.ms===2000 ? 'b_chaos2' : null;   // ひらめきの源は 光った 姿で 仲間に
  if(SPB){   // 特別な ボス（魔王・塔の 節目）: 1/30（はずれるたび 少し 上がる）。それぞれ 1体だけ
    P.bossMiss = P.bossMiss || {};
    if(P.allies.some(a=>a.sp===SPB)) return;
    const miss = P.bossMiss[SPB]||0, den = 30/(1+0.15*miss)/(HS.pw.tame||1);
    if(Math.random() < 1/den){ delete P.bossMiss[SPB]; e.key = SPB; standUp(e); const al = P.allies[P.allies.length-1]; al.name = FAM[famOf(SPB)].names[0]; al.maxLv = 999; al.lv = Math.max(al.lv, Math.min(P.hero.lv, 3*S.L-2)); refreshPartyPow(); if(e.maou) S.maouJoined = true; }
    else P.bossMiss[SPB] = miss+1;
    return;
  }
  const sp = e.key, F = FAM[famOf(sp)];
  P.bossMiss = P.bossMiss || {};
  let den;
  if(S.tutRecruit && !e.boss){ S.tutRecruit = false; standUp(e); return; }
  if(e.boss) den = CFG.bossRecruit / (1 + 0.15*(P.bossMiss[sp]||0));
  else den = F.rate * CFG.recruitMul * (1 + 0.25*(RANK[sp]||0));
  if(!P.stats.recruits && !e.boss && !S.tut) den = Math.min(den, 4);
  den /= (HS.pw.tame||1) * (e.boss ? 1 : (e.rm||1)) * (hasT('twin') ? 1.5 : 1);
  if(Math.random() < 1/den){ if(e.boss) delete P.bossMiss[sp]; standUp(e); }
  else if(e.boss) P.bossMiss[sp] = (P.bossMiss[sp]||0) + 1;
}
function standUp(e){
  SFX.recruit();
  const al = newAlly(e.key, S.L);
  P.allies.push(al); P.stats.recruits = (P.stats.recruits||0) + 1;
  R.recruits.push(al); setNew('ally');
  e.recruit = true;
  const b = eBox(e);
  FX.push({type:'rise', key:e.key, x:b.cx, y:e.y, s:e.s, t:0, dur:1.1});
  sparks(b.cx, b.cy, 16, ['#ffe14a','#ffffff','#9fe3ff'], 90);
  later(.4, ()=>banner(EDEF[e.key].n+'が おきあがった！'));
  const slot = P.party.indexOf(null);
  if(slot >= 0 && mode==='battle'){
    P.party[slot] = al.id;
    const before = S.pmax;
    buildParty();
    const a = ACT.find(x=>x.c.al===al); if(a){ a.x = b.cx; a.y = e.y; a.flash = .4; }
    S.pmax = partyMaxHp(); S.php += S.pmax - before;
    renderButtons();
    float(allyName(al)+'が なかまに なった！', 'tag', 70, 40);
    if(S.tut) later(1.2, ()=>tutTipPop(S.solo ? '仲間が くわわった！ 仲間は <b>自動で いっしょに 戦い</b>、ゲージが たまると 必殺技も つかう。' : '仲間が くわわった！ 仲間の ボタンも おせる。<b>ちがう 仲間を 続けて おす</b>と 連携で 威力アップ。'));
  }else{
    later(1.2, ()=>float(allyName(al)+'は 控えに 入った', 'tag', 70, 40));
  }
  save();
}
function allyGainExp(x){
  let up = false;
  for(const al of members()){
    if(al.lv >= al.maxLv) continue;
    al.exp += x;
    while(al.lv < al.maxLv && al.exp >= needExp(al.lv)){ al.exp -= needExp(al.lv); al.lv++; up = true; }
  }
  const tr = .1*facLv('train');
  if(tr) for(const al of P.allies){ if(P.party.includes(al.id) || al.lv >= al.maxLv) continue;
    al.exp += x*tr; while(al.lv < al.maxLv && al.exp >= needExp(al.lv)){ al.exp -= needExp(al.lv); al.lv++; } }
  if(up){ const before = S.pmax; refreshPartyPow(); S.pmax = partyMaxHp(); S.php = Math.min(S.pmax, S.php + (S.pmax-before)); }
}

// ===== 合体（同じ種族どうし。まれに 合体事故で 上の 格の 種族へ） =====
const fuseCost = (a, m) => Math.round(8 * (a.lv + m.lv) * (1 + 0.05*(a.plus||0)));
// ===== 限界突破（無限の塔の 節目で ひらく。仲間の 上限Lvを +50ずつ のばす） =====
const BRK_TIERS = [[100, 999], [300, 1499], [500, 1999], [1000, 9999]];   // [とどいた 階, のばせる 上限]
const brkCap = () => { let c = 0; for(const [f, cap] of BRK_TIERS) if(towerPeak() >= f) c = cap; return c; };
const brkNext = () => BRK_TIERS.find(([f]) => towerPeak() < f);
const brkCost = al => ({g: Math.round(15*Math.pow(al.maxLv, 1.6)), crystal: Math.ceil(al.maxLv/100), star: al.maxLv >= 999 ? 1 : 0});
function brkState(al){
  const cap = brkCap(); if(!cap) return 'lock'; if(al.maxLv >= cap) return 'cap';
  const c = brkCost(al); return (P.gold < c.g || (P.mats.crystal||0) < c.crystal || (P.mats.star||0) < c.star) ? 'cost' : 'ok';
}
function limitBreak(id){
  const al = allyById(id); if(!al || brkState(al) !== 'ok') return false;
  const c = brkCost(al); P.gold -= c.g; P.mats.crystal -= c.crystal; P.mats.star = (P.mats.star||0) - c.star;
  al.maxLv = Math.min(brkCap(), al.maxLv + 50); al.brk = (al.brk||0) + 1;
  save(); return true;
}
function fuseAllies(baseId, matId){
  const a = allyById(baseId), m = allyById(matId);
  if(!a || !m || a===m || a.sp!==m.sp) return null;
  const cost = fuseCost(a, m); if(P.gold < cost) return null;
  P.gold -= cost;
  P.allies = P.allies.filter(x=>x!==m);
  P.party = P.party.map(id=>id===m.id ? null : id);
  a.plus = (a.plus||0) + 1 + (m.plus||0);
  a.maxLv = Math.max(a.maxLv, m.maxLv, Math.min(999, Math.max(a.maxLv, m.maxLv) + 2));   // 限界突破した 上限は 下げない
  a.lv = Math.max(a.lv, m.lv);
  let acc = null;
  if(Math.random() < (HS.pw.fuseSafe ? 0 : ACCIDENT_RATE*(HS.pw.fuseWild?4:1))){
    const fam = famOf(a.sp), r0 = RANK[a.sp]||0;
    const cands = Object.keys(EDEF).filter(k=>!EDEF[k].special && famOf(k)===fam && k!==a.sp && (RANK[k]||0) > r0);
    if(cands.length){
      acc = {from:a.sp};
      a.sp = pick(cands); a.plus += 5; a.g = {hp:a.g.hp*1.25, atk:a.g.atk*1.25}; a.maxLv = Math.max(a.maxLv, Math.min(999, a.maxLv+50)); a.accident = true;
    }
  }
  save();
  return {a, acc};
}
function bulkPlan(sp){
  const all = P.allies.filter(a=>a.sp===sp); if(all.length < 2) return null;
  const inParty = new Set(P.party.filter(Boolean));
  const rank = (a,b) => (b.plus||0)-(a.plus||0) || b.lv-a.lv;
  const base = all.filter(a=>inParty.has(a.id)).sort(rank)[0] || all.slice().sort(rank)[0];
  const mats = all.filter(a=>a!==base && !inParty.has(a.id)).sort((a,b)=>a.lv-b.lv);
  if(!mats.length) return null;
  let cost = 0, lv = base.lv, plus = base.plus||0;
  for(const m of mats){ cost += fuseCost({lv, plus}, m); plus += 1 + (m.plus||0); }
  return {base, mats, cost};
}

// ===== 新しい 系統の 攻撃・必殺技 =====
// ctx: {i, c, a, an, manual, hit, ok}。an.pose で ポーズを えらぶ
const FAMACT = {
  slime: {
    atk(x){ x.an.pose='melee'; x.an.ev.push([.15, ()=>{ const tg=living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,2); if(!tg.length) return; tg.forEach((e,k)=>{ const b=eBox(e); FX.push({type:'punch', x:b.cx-3, y:b.cy, t:0, dur:.12}); x.hit(e,k?0.8:1.2,k>0); if(x.ok(e) && x.manual) launch(e, 22*(e.boss?.6:1)); }); heal(S.pmax*.02); }]); },
    sp(x, T){ x.an.pose='cast'; x.an.ev.push([T, ()=>{ FX.push({type:'ring', x:x.a.x, y:x.a.y-10, t:0, dur:.5, col:'#8ff08a', big:true}); heal(S.pmax*.35, x.a); for(const a of ACT){ sparks(a.x, a.y-12, 6, ['#8ff08a','#ffffff'], 40); } }]); },
    sp2(x, T){ x.an.pose='big'; x.an.ev.push([T+.45, ()=>{ const fx=frontX(); FX.push({type:'quake', x:fx+20, y:GROUND+3, t:0, dur:.5}); dust(fx+20, GROUND+3, 20, 1.6); shake(true); hitstop(.08);
      const tg=living().filter(e=>eBox(e).front<=fx+60 && low(e)); tg.forEach(e=>{ x.hit(e,3.0); if(x.ok(e)) launch(e,30*(e.boss?.6:1)); }); if(tg.length>=2) float(tg.length+'体 ぺしゃんこ！','tag',fx+20,26); }]); },
  },
  bat: {
    atk(x){ x.an.pose='cast'; x.an.ev.push([.1, ()=>{ const c=center(); FX.push({type:'ring', x:x.a.x+6, y:x.a.y-10, t:0, dur:.35, col:'#d8c0ff', big:true}); living().forEach((e,k)=>{ x.hit(e,.4,k>2); if(x.ok(e) && x.manual) e.t += .3; }); }]); },
    sp(x, T){ x.an.pose='cast'; x.an.long=.6; for(let k=0;k<20;k++) x.an.ev.push([T+k*.04, ()=>{ const l=living(); if(!l.length) return; const e=pick(l), b=eBox(e);
      PARTS.push({x:x.a.x+6, y:x.a.y-12, vx:(b.cx-x.a.x)*5, vy:(b.cy-x.a.y)*5, life:.2, max:.2, col:'#7a4ab0', sz:2, g:0}); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.1}); x.hit(e,.5,k%3!==0,{airX:e.air>0?1.5:1}); }]); },
    sp2(x, T){ x.an.pose='cast'; x.an.ev.push([T, ()=>{ let n=0; living().forEach((e,k)=>{ const b=eBox(e); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.14}); x.hit(e,.8,k>2); n++;
      PARTS.push({x:b.cx, y:b.cy, vx:(x.a.x-b.cx)*2, vy:(x.a.y-12-b.cy)*2, life:.5, max:.5, col:'#ff5a5a', sz:2, g:0}); }); heal(S.pmax*.15, x.a); }]); },
  },
  goblin: {
    atk(x){ x.an.pose='melee'; const e0=()=>living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front)[0];
      [.12,.18,.24].forEach((t,k)=>x.an.ev.push([t, ()=>{ const e=e0(); if(!e) return; const b=eBox(e); FX.push({type:'punch', x:b.cx-3, y:b.cy+rand(-3,3), t:0, dur:.1}); x.hit(e,.6,k>0); if(k===2 && x.manual){ const tg=living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,2); tg.forEach(t=>{ if(x.ok(t)) launch(t, 30*(t.boss?.6:1)); }); } }])); },
    sp(x, T){ x.an.pose='melee'; x.an.long=.5; for(let k=0;k<6;k++) x.an.ev.push([T+.12+k*.08, ()=>{ living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,4).forEach((e,j)=>{ const b=eBox(e); FX.push({type:'punch', x:b.cx-3, y:b.cy+rand(-4,4), t:0, dur:.1}); x.hit(e,.7,j>0||k>0); }); if(k%2===0) shake(); }]); },
    sp2(x, T){ x.an.pose='melee'; x.an.ev.push([T+.13, ()=>{ living().forEach((e,k)=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); x.hit(e,.8,k>2); if(!e.dead || true) steal(e,false); }); }]); },
  },
  skel: {
    atk(x){ x.an.pose='melee'; x.an.ev.push([.16, ()=>{ const e=living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,3).sort((p,q)=>q.hp-p.hp)[0]; if(!e) return; const b=eBox(e);
      FX.push({type:'slash', x1:b.cx-10, y1:b.top-4, x2:b.cx+6, y2:b.fy, t:0, dur:.18}); x.hit(e,2.6); if(x.ok(e) && x.manual){ e.stun=Math.max(e.stun,.6); e.kx=8; } }]); },
    sp(x, T){ x.an.pose='cast'; const tg=living().sort(()=>Math.random()-.5); tg.forEach((e,k)=>x.an.ev.push([T+.05+k*.03, ()=>{ if(!x.ok(e)) return; const b=eBox(e);
      PROJ.push({kind:'bone', x:b.cx+rand(-8,8)+16, y:-10, tgt:e, t:0, dur:.18, arc:0, onHit:()=>{ if(!x.ok(e)) return; const bb=eBox(e); sparks(bb.cx,bb.cy,3,['#ffffff','#e8e4d0'],60); x.hit(e,1.5,k>0); }}); }])); },
    sp2(x, T){ x.an.pose='melee'; x.an.ev.push([T+.13, ()=>{ FX.push({type:'slash', x1:100, y1:44, x2:196, y2:110, t:0, dur:.35}); flash(); hitstop(.1); shake(true); let n=0;
      living().forEach(e=>{ if(!e.boss && e.hp < e.max*.3){ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.2}); direct(e, e.hp+1); n++; } else x.hit(e,1.5,true); });
      if(n>=1) float(n+'体 刈りとった！','tag',150,26); }]); },
  },
  dragon: {
    atk(x){ x.an.pose='cast'; x.an.ev.push([.12, ()=>{ const fx=frontX(); for(let k=0;k<26;k++) PARTS.push({x:x.a.x+10, y:x.a.y-14, vx:rand(120,220), vy:rand(-30,30), life:.35, max:.35, col:k%2?'#ff6a2a':'#ffd24a', sz:2, g:0});
      living().filter(e=>eBox(e).front<=fx+70 && low(e)).forEach((e,k)=>{ x.hit(e,1.0,k>3); if(x.ok(e)){ e.burn=3; if(x.manual && !(e.air>0)) launch(e, 18*(e.boss?.6:1)); } }); }]); },
    sp(x, T){ x.an.pose='cast'; x.an.ev.push([T+.1, ()=>{ const c=center(); FX.push({type:'boom', x:c.x, y:c.y, r:90, t:0, dur:.55}); FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.5}); flash(); shake(true); hitstop(.12);
      living().forEach((e,k)=>{ x.hit(e,3.0,k>0); if(x.ok(e)) e.burn=3; }); }]); },
    sp2(x, T){ x.an.pose='cast'; x.an.ev.push([T+.1, ()=>{ FX.push({type:'wave', x:100, w:96, t:0, dur:.3}); shake(); let n=0; living().forEach((e,k)=>{ x.hit(e,1.0,k>0); if(x.ok(e)){ launch(e,50*(e.boss?.6:1)); n++; } }); if(n>=2) float(n+'体 ふきとばし！','tag',150,26); }]); },
  },
};
// 魔王（仲間）
FAMACT.maou = {
  atk(x){ x.an.pose='melee'; x.an.ev.push([.14, ()=>{ const tg = living().sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,3);
    tg.forEach((e,k)=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.16}); PARTS.push({x:b.cx, y:b.cy, vx:rand(-20,20), vy:rand(-30,-10), life:.3, max:.3, col:'#9a4ae0', sz:2, g:0}); x.hit(e,1.0,k>0); if(x.ok(e) && x.manual) e.kx = 6; }); }]); },
  sp(x, T){ x.an.pose='cast'; x.an.long=.3; x.an.ev.push([T+.1, ()=>{ S.dark = .75; flash(); shake(true); hitstop(.12);
    const c=center(); FX.push({type:'ring', x:c.x, y:c.y, t:0, dur:.6, col:'#9a4ae0', big:true}); FX.push({type:'ring', x:c.x, y:c.y, t:-.15, dur:.7, col:'#2a1440', big:true});
    living().forEach((e,k)=>{ x.hit(e,3.5,k>0); if(x.ok(e)){ if(e.boss) e.t += 1.5; else { e.stun = Math.max(e.stun,1.5); e.t = Math.max(e.t,1.5); } } }); }]); },
  sp2(x, T){ x.an.pose='cast'; x.an.ev.push([T, ()=>{ S.buffT = 8; S.maouGuard = S.time + 8;
    for(let k=0;k<3;k++) FX.push({type:'ring', x:x.a.x+6, y:x.a.y-12, t:-k*.12, dur:.6, col:k%2?'#ff3a3a':'#9a4ae0', big:true});
    float('攻撃 1.5倍・ダメージ 半分！','tag',60,30); }]); },
};
// 塔の 節目ボス（仲間）
FAMACT.guard = {
  atk(x){ x.an.pose='melee'; x.an.ev.push([.16, ()=>{ living().filter(low).sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,2).forEach((e,k)=>{ const b=eBox(e); FX.push({type:'punch', x:b.cx-3, y:b.cy, t:0, dur:.14}); sparks(b.cx,b.cy,4,['#ffe14a','#ffffff'],60); x.hit(e,2.0,k>0); if(x.ok(e) && x.manual){ e.stun=Math.max(e.stun,.5); e.kx=8; } }); }]); },
  sp(x, T){ x.an.pose='cast'; x.an.ev.push([T, ()=>{ S.guardT = S.time + 8; for(let k=0;k<3;k++) FX.push({type:'ring', x:x.a.x+4, y:x.a.y-12, t:-k*.1, dur:.6, col:'#ffe14a', big:true}); float('ダメージ 60% カット！','tag',60,30); }]); },
  sp2(x, T){ x.an.pose='cast'; x.an.ev.push([T+.1, ()=>{ const fx=frontX(); ARTFX.push({k:'laser', x:x.a.x+8, y:x.a.y-12, t:0, dur:.45}); ARTFX.push({k:'pillar', x:fx+10, t:0, dur:.5}); flash(); shake(true); hitstop(.1);
    living().forEach((e,k)=>{ x.hit(e,3.0,k>0); if(x.ok(e)) launch(e, 34*(e.boss?.6:1)); }); }]); },
};
FAMACT.shadow = {
  atk(x){ x.an.pose='cast'; x.an.ev.push([.1, ()=>{ [...living()].sort(()=>Math.random()-.5).slice(0,4).forEach((e,k)=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); x.hit(e,.8,k>0); }); }]); },
  sp(x, T){ x.an.pose='cast'; x.an.long=.6; for(let k=0;k<10;k++) x.an.ev.push([T+k*.06, ()=>{ living().forEach((e,j)=>{ if((j+k)%2) return; const b=eBox(e); FX.push({type:'xslash', x:b.cx+rand(-4,4), y:b.cy+rand(-4,4), t:0, dur:.1}); x.hit(e,.45,true); }); }]); },
  sp2(x, T){ x.an.pose='cast'; x.an.ev.push([T, ()=>{ S.dark = .7; living().forEach((e,k)=>{ x.hit(e,2.0,k>0); if(x.ok(e)){ if(e.boss) e.t += 3; else { e.stun = Math.max(e.stun,3); e.t = Math.max(e.t,3); } } }); float('闇の帳！','tag',150,26); }]); },
};
FAMACT.source = {
  atk(x){ x.an.pose='cast'; x.an.ev.push([.1, ()=>{ ARTFX.push({k:'laser', x:x.a.x+8, y:x.a.y-12, t:0, dur:.3}); living().forEach((e,k)=>x.hit(e,.7,k>0)); }]); },
  sp(x, T){ x.an.pose='cast'; x.an.ev.push([T, ()=>{ heal(S.pmax*.3, x.a); for(let i=0;i<CH.length;i++){ S.sp[i] = Math.min(100, S.sp[i]+50); if(i>0) S.sp2[i] = Math.min(100, S.sp2[i]+50); } try{ SFX.spark(); }catch(_){} FX.push({type:'rays', x:x.a.x, y:x.a.y-14, t:0, dur:.8}); float('ピコーン！','tag',60,30); }]); },
  sp2(x, T){ x.an.pose='cast'; x.an.ev.push([T+.1, ()=>{ flash(); shake(true); hitstop(.14); const c=center(); FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.6}); FX.push({type:'boom', x:c.x, y:c.y, r:95, t:0, dur:.5}); living().forEach((e,k)=>x.hit(e,5.0,k>0)); }]); },
};
FAMACT.chaos = {
  atk(x){ x.an.pose='cast'; x.an.ev.push([.1, ()=>{ living().sort((p,q)=>eBox(p).front-eBox(q).front).slice(0,3).forEach((e,k)=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); x.hit(e,.9,k>0); });
    ARTFX.push({k:'laser', x:x.a.x+8, y:x.a.y-12, t:0, dur:.3}); living().forEach((e,k)=>x.hit(e,.5,true)); }]); },
  sp(x, T){ x.an.pose='cast'; x.an.long=.3; x.an.ev.push([T+.1, ()=>{ S.dark = .6; flash(); shake(true); hitstop(.12); const c=center();
    FX.push({type:'ring', x:c.x, y:c.y, t:0, dur:.6, col:'#9a4ae0', big:true}); FX.push({type:'ring', x:c.x, y:c.y, t:-.15, dur:.7, col:'#ffe14a', big:true});
    heal(S.pmax*.2, x.a); living().forEach((e,k)=>{ x.hit(e,4.0,k>0); if(x.ok(e)){ if(e.boss) e.t += 1; else { e.stun = Math.max(e.stun,2); e.t = Math.max(e.t,2); } } }); }]); },
  sp2(x, T){ x.an.pose='cast'; x.an.ev.push([T+.1, ()=>{ flash(); shake(true); hitstop(.16); const c=center(); S.dark = .5;
    FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.7}); FX.push({type:'boom', x:c.x, y:c.y, r:100, t:0, dur:.6}); sparks(c.x, c.y, 40, ['#ffe14a','#9a4ae0','#ffffff','#ff3a3a'], 160);
    living().forEach((e,k)=>x.hit(e,7.0,k>0)); }]); },
};
// 新しい 系統の ポーズ（an.pose）
function famPose(a){
  const an=a.anim, c=a.c, T=an.t0||0, t=an.t-T, L=an.long||0;
  if(an.t < T){ const p=an.t/T; return {x:c.hx+Math.sin(S.time*60)*.6, y:c.hy, sqx:1+.12*p, sqy:1-.12*p}; }
  switch(an.pose){
    case 'melee': return meleePose(a, t, frontX()-8, 97, {wind:.04, dash:.08, hold:.16+L, back:.16});
    case 'cast': return castPose(c, t, 6, .3+L);
    case 'big': {
      const fx = frontX()+10;
      if(t < .25){ const p=easeOut(t/.25); return {x:lerp(c.hx,fx,p), y:lerp(c.hy,30,p), sqx:1+1.5*p, sqy:1+1.5*p}; }
      if(t < .45){ const p=easeIn((t-.25)/.2); return {x:fx, y:lerp(30,GROUND+3,p), sqx:2.5, sqy:2.5+.3*p}; }
      if(t < .6){ const p=(t-.45)/.15; return {x:fx, y:GROUND+3, sqx:2.5+.8*Math.sin(Math.PI*p), sqy:2.5-.8*Math.sin(Math.PI*p)}; }
      if(t < .9){ const p=(t-.6)/.3; return {x:lerp(fx,c.hx,p), y:lerp(GROUND+3,c.hy,p)-14*Math.sin(Math.PI*p), sqx:lerp(2.5,1,p), sqy:lerp(2.5,1,p)}; }
      return null;
    }
  }
  return null;
}
