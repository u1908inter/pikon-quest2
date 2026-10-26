// ===== 魔王（10周目の 魔界ボス）: 専用の 姿・攻撃・セリフ =====
const MAOU_NAME = '魔王 ヴァルゴス';
{ // 左半分を 描いて 左右対称に する
  const L = [
    "..Y........",
    ".YY........",
    ".YY.....kkk",
    "..YY..kkYkY",
    "...YYkDDDDD",
    "....kDDDDDD",
    "....kDRRwDD",
    "....kDDRRDD",
    "....kkDDDDm",
    "..kkPPkYYYY",
    ".kPPPPDkYGY",
    "kPPPPDDDkYY",
    "kPPPDDDDDkD",
    "kPPPDDkDDDD",
    "kPPPDkCkDDD",
    "kPPPPkCCkDD",
    "kPPPPPkkDDD",
    "kPPPPPPDDDD",
    "kPPPPPPDDDD",
    ".kPPPPPPDDD",
    ".kPkPPkPPkD",
    "..k.kk.kk.k"];
  const rows = L.map(r => r + [...r].reverse().join(''));
  SPR.b_maou = {pal:{Y:'#f2c23e', D:'#2a1440', P:'#7a1a3a', R:'#ff3a3a', G:'#7ce8ff', C:'#d8d0f0', m:'#c8324a'}, rows};
  SPR.b_maou2 = {pal:Object.assign({}, SPR.b_maou.pal, {D:'#3a0a20', P:'#b0202a', R:'#ffe14a', G:'#ff6ad5'}), rows};   // 第2形態（赤く なる）
  EDEF.b_maou = {k:'b_maou', n:MAOU_NAME, fam:'maou', special:true};   // 合体事故などでは 出ない。系統も 魔王だけ
  EDEF.b_maou2 = {k:'b_maou2', n:MAOU_NAME, fam:'maou', special:true};
}
// ===== 無限の塔の 節目ボス =====
// --- 節目の ボスの 姿 ---
{
  SPR.b_guard = {pal:Object.assign({}, SPR.golem.pal, {G:'#e0b000', L:'#fff6c0'}), rows:SPR.golem.rows};
  SPR.b_shadow = {pal:{Y:'#4a3a6a', D:'#0a0a14', P:'#1a1030', R:'#c8a0ff', G:'#9a4ae0', C:'#6a6a8a', m:'#3a1a4a'}, rows:SPR.b_maou.rows};
  const L = [
    "....kkkk", "..kkYYYY", ".kYYYYYY", ".kYYwYYY", "kYYwYYYY", "kYYYeeYY", "kYYYeeYY", "kYYYYYYY",
    "kYYYYYmm", ".kYYYYYY", ".kYYYYYY", "..kYYYYY", "...kGGGG", "...kGkGG", "...kGGGG", "....kGGk", ".....kkk"];
  const rows = L.map(r => r + [...r].reverse().join(''));
  SPR.b_source = {pal:{Y:'#8a8a6a', w:'#c8c8b0', G:'#6a6a70', e:'#1b1626', m:'#3a3a3a'}, rows};          // 消えかけの 電球
  SPR.b_source2 = {pal:{Y:'#ffe14a', w:'#ffffff', G:'#a8a8b0', e:'#c8324a', m:'#c8324a'}, rows};         // 光った 姿
  EDEF.b_guard = {k:'b_guard', n:'神器の守護者', fam:'guard', special:true};
  EDEF.b_shadow = {k:'b_shadow', n:'魔王の影', fam:'shadow', special:true};
  EDEF.b_source = {k:'b_source', n:'ひらめきの源', fam:'source', special:true};
  EDEF.b_source2 = {k:'b_source2', n:'ひらめきの源', fam:'source', special:true};
}
// 魔界ボスを 魔王に すりかえる（traits.js から よぶ）
function makeMaou(e){
  e.maou = true; e.key = 'b_maou'; e.name = MAOU_NAME; e.s = 2.6; S.waveName = 'BOSS '+MAOU_NAME;
  e.hp = e.max = Math.round(e.max*1.6); e.atk *= 1.15;
  e.mAtk = 0; e.p2 = false; e.dark = true;
  e.cfg = {name:MAOU_NAME, p2key:'b_maou2', p2lines:['おのれ……！', 'ならば 真の 力を 見せてやろう！'], p2banner:'魔王の 真の姿！', spawn:['h_skel','h_wolf','h_goblin']};
  later(.3, ()=>maouSay(['……よくぞ ここまで たどりついた、ちいさき ゆうしゃよ。', `われは 魔界の あるじ、${MAOU_NAME.replace('魔王 ','')}。`, 'ひらめきの 力など、闇の まえでは むりょく。さあ、かかってくるが いい！']));
}
// セリフ（読んでいる あいだは 戦闘が 止まる）
function maouSay(lines, done, key='b_maou'){ sayLines(MAOU_NAME, key, lines, done); }
function sayLines(name, key, lines, done){
  let i = 0;
  const show = () => {
    showModal(`<div class="msay">${imgTag(key, '', 'width:66px;height:auto;image-rendering:pixelated')}<div><b class="r3">${name}</b><p>${lines[i]}</p></div></div>
      <div class="opts"><button class="btn primary" data-m="maouNext">${i < lines.length-1 ? '▶' : 'OK'}</button></div>`);
  };
  _maouNext = () => { i++; if(i < lines.length) show(); else { hideModal(); _maouNext = null; done && done(); } };
  show();
}
let _maouNext = null;
$('#modal').addEventListener('click', ev=>{ const b = ev.target.closest('[data-m="maouNext"]'); if(b && _maouNext) _maouNext(); });
// 毎フレーム: 第2形態への 変化・闇の 波動の ため
function maouTick(e, dt){
  if(!e.p2 && e.cfg && e.hp < e.max*.5){
    const cf = e.cfg;
    e.p2 = true; if(cf.p2key) e.key = cf.p2key; e.t = Math.min(e.t, 1.5);
    flash(); shake(true); hitstop(.25);
    const b = eBox(e); sparks(b.cx, b.cy, 40, ['#ff3a3a','#ff6ad5','#ffe14a','#ffffff'], 150);
    S.maouRage = 1.2;
    if(cf.p2lines) later(.2, ()=>sayLines(cf.name, e.key, cf.p2lines, ()=>banner(cf.p2banner)));
    // 手下・分身を よぶ
    later(.4, ()=>{ if(e.dead) return; (cf.spawn||[]).forEach((k,j)=>{ const m = makeEnemy(k, 120+j*14, 88+j*6, false); m.rm = 1; if(cf.spawnHp) m.hp = m.max = Math.round(e.max*cf.spawnHp); if(cf.spawnName){ m.name = cf.spawnName; m.noRecruit = true; m.noCard = true; } S.es.push(m); }); S.wave = S.es.filter(x=>!x.dead).length; });
  }
  if(e.charge > 0){
    e.charge -= dt;
    if(e.charge <= 0){
      e.charge = 0; S.dark = .9;
      const K = defK(S.L), def = HS.def, dmg = Math.max(1, Math.round(e.atk*(e.p2?2.0:1.6) * K/(K+def) * (1-Math.min(CFG.cutCap, HS.pw.cut||0)/100)));
      S.php -= (P.debug && P.opt.dbgGod && debugOn()) ? 0 : dmg;
      flash(); shake(true);
      ACT.forEach(a=>{ a.flash = .3; float('-'+fmt(Math.round(dmg/ACT.length)),'pdmg',a.x,a.y-28); });
      FX.push({type:'wave', x:0, w:W, t:0, dur:.5});
      if(S.php <= 0){ if(HS.pw.endure && !S.endured){ S.endured=true; S.php=1; banner('ふんばった！'); } else ko(); }
    }
  }
}
// 敵の 攻撃の かわりに: 3回に 1回 闇の 波動（全体攻撃）
function maouAttack(e){
  if(e.p2 || e.fast) e.t *= .6;   // 第2形態は 攻撃が 速い
  e.mAtk = (e.mAtk||0) + 1;
  if(e.mAtk % 3 !== 0) return false;
  e.charge = 1.4; S.darkIn = 1.4;
  banner('闇の 波動が くる！');
  const b = eBox(e); FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.6, col:'#9a4ae0', big:true});
  return true;
}
// 描く: 暗転・オーラ
function maouDraw(){
  const m = S.es && S.es.find(e=>e.dark && !e.dead);
  if(m){
    const b = eBox(m), t = S.time, p2 = m.p2;
    ctx.globalAlpha = .18 + .08*Math.sin(t*5); ctx.fillStyle = m.aura || (p2 ? '#ff3a3a' : '#9a4ae0');
    ctx.beginPath(); ctx.ellipse(b.cx, b.cy, b.w*.7 + 3*Math.sin(t*4), b.h*.65, 0, 0, Math.PI*2); ctx.fill();
    if(m.charge > 0){   // ためている あいだ 闇が あつまる
      const k = 1 - m.charge/1.4;
      ctx.globalAlpha = .5*k; ctx.fillStyle = '#1a0a2a'; ctx.beginPath(); ctx.arc(b.cx, b.cy, 30*(1-k)+6, 0, Math.PI*2); ctx.fill();
      for(let i=0;i<3;i++) PARTS.push({x:b.cx+rand(-40,40), y:b.cy+rand(-30,30), vx:0, vy:0, life:.25, max:.25, col:'#9a4ae0', sz:1, g:0});
    }
  }
  const dk = Math.max(m && m.charge > 0 ? .55*(1 - m.charge/1.4) : 0, S.dark||0);
  if(dk > 0){ ctx.globalAlpha = dk; ctx.fillStyle = '#0a0414'; ctx.fillRect(-W, -H, W*3, H*3); }
  ctx.globalAlpha = 1;
}
