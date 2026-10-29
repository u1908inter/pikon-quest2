// ===== かくし連携（仲間も 操作できるように なってからの おまけ） =====
// seq: 押す 順番（hero=ゆうしゃの 攻撃・職業技、waza=ひらめき技、any=だれか 仲間、ほかは 仲間の 系統）
const COMBOS = [
  {id:'c_press',  n:'ぷるぷるプレス',     seq:['slime','golem'],                    d:'地上の 敵を まとめて 叩きつぶす'},
  {id:'c_yoru',   n:'夜の狩り',           seq:['bat','wolf'],                       d:'空中の 敵に 牙の 連撃'},
  {id:'c_houshi', n:'胞子爆発',           seq:['mush','dragon'],                    d:'胞子に 火が ついて 大爆発（燃焼＋毒）'},
  {id:'c_yougan', n:'溶岩流',             seq:['golem','dragon'],                   d:'地面が 溶けて 地上の 敵を 焼く（燃焼＋足止め）'},
  {id:'c_mure',   n:'群れ狩り',           seq:['wolf','goblin'],                    d:'全員に 一撃 ＋ ゴールドを たくさん ぬすむ'},
  {id:'c_shiryo', n:'死霊の眠り',         seq:['mush','skel'],                      d:'眠らせて、弱った 敵を 一撃で 倒す（ボス以外）'},
  {id:'c_ryuki',  n:'竜騎の一撃',         seq:['hero','dragon'],                    d:'ドラゴンに 乗って 突撃。群れを 打ち上げる'},
  {id:'c_puni',   n:'ぷにぷに回復',       seq:['slime','mush','slime'],             d:'パーティHPを 大きく 回復 ＋ 敵を 毒に'},
  {id:'c_gekka',  n:'月下の舞',           seq:['bat','skel','bat'],                 d:'全員を 3秒 止めて、骨の 雨'},
  {id:'c_utage',  n:'狩りの宴',           seq:['goblin','wolf','dragon'],           d:'3体の 波状攻撃。しめに 全員を 焼く'},
  {id:'c_sanju',  n:'三重の大地',         seq:['golem','slime','golem'],            d:'地震を 3回。空中の 敵は 叩き落とす'},
  {id:'c_hira3',  n:'ひらめき三連',       seq:['hero','waza','any'],                d:'ゆうしゃの 職業技ゲージが 一気に たまる'},
  {id:'c_full',   n:'ピコーン・フルコース', seq:['hero','slime','golem','dragon'],  d:'画面 全体に 大ダメージ'},
  {id:'c_hyakki', n:'百鬼夜行',           seq:['bat','skel','mush','wolf'],         d:'闇の 群れが かけぬけ、全員を 眠り・毒・足止めに'},
  {id:'c_yumao',  n:'ゆうしゃと魔王',     seq:['hero','maou'],                      d:'光と 闇の 十字斬り'},
  {id:'c_shinyami',n:'真・闇の波動',      seq:['maou','shadow'],                    d:'二重の 闇で 特大ダメージ ＋ 長く 止める'},
  {id:'c_jingi',  n:'神器の光',           seq:['guard','source'],                   d:'持っている 神器の 数だけ 強く なる 光の 柱'},
  {id:'c_hikari', n:'光と闇',             seq:['maou','source'],                    d:'正反対の 力の 衝突。最大級の ダメージ'},
  {id:'c_sanou',  n:'塔の三王',           seq:['guard','shadow','source'],          d:'塔の 節目ボス 3体の 合わせ技。最強の 連携'},
];
const COMBO_GAP = 2.5;   // 押す あいだが この 秒数より 空くと とぎれる
const combosOn = () => allyCtrlOpen() && !S.solo && mode==='battle' && !S.demo;
const comboFound = () => COMBOS.filter(c => (P.found||{})[c.id]).length;
const FAM_JP = {hero:'ゆうしゃ', waza:'ひらめき技', any:'仲間', slime:'スライム', bat:'コウモリ', goblin:'ゴブリン', wolf:'ウルフ', mush:'キノコ', skel:'がいこつ', golem:'ゴーレム', dragon:'ドラゴン', maou:'魔王', guard:'守護者', shadow:'影', source:'ひらめきの源'};
function comboCheck(){
  if(!combosOn() || S.wait) return;
  const id = S.hist[S.hist.length-1]; if(!id) return;
  S.chist = (S.chist||[]).filter(h => S.time - h.t < COMBO_GAP*4);
  const last = S.chist[S.chist.length-1];
  if(last && S.time - last.t > COMBO_GAP) S.chist = [];   // 間が あいたら とぎれる
  S.chist.push({id, t:S.time});
  if(S.chist.length > 6) S.chist.shift();
  comboGlow();
  if((S.comboCd||0) > S.time) return;
  const hist = S.chist.map(h=>h.id);
  const match = (seq) => { if(hist.length < seq.length) return false; const tail = hist.slice(-seq.length);
    return seq.every((v,k) => v==='any' ? (tail[k]!=='hero' && tail[k]!=='waza') : tail[k]===v); };
  const r = [...COMBOS].sort((a,b)=>b.seq.length-a.seq.length).find(c=>match(c.seq)); if(!r) return;
  // もっと 長い 連携の 途中なら すこし 待つ（つづけて 押せば 長い ほうが 出る）
  const eq = (v,h) => v==='any' ? (h!=='hero' && h!=='waza') : v===h;
  const canExtend = COMBOS.some(c => c.seq.length > r.seq.length && [...Array(c.seq.length-1).keys()].some(k0 => { const k = k0+1; if(k < r.seq.length) return false; const tail = hist.slice(-k); return tail.length===k && tail.every((h,i)=>eq(c.seq[i],h)); }));
  if(canExtend){ const tok = S.cpend = {r}; later(.9, ()=>{ if(S.cpend===tok){ S.cpend = null; comboFire(r); } }); return; }
  S.cpend = null; comboFire(r);
}
// 連携の きざし: 途中まで 合っていたら、次に 押す 仲間の ボタンを 光らせる（設定で オフに できる）
let _cgT = 0;
function comboGlowClear(){ document.querySelectorAll('.cnext').forEach(el=>el.classList.remove('cnext')); }
function comboBtnOf(k){
  if(k === 'waza') return $('#kb0');
  const i = CH.findIndex(c => c.id === k); return i >= 0 ? $('#cb'+i) : null;
}
function comboGlow(){
  comboGlowClear(); clearTimeout(_cgT);
  if(P.opt.comboHint === false || (S.comboCd||0) > S.time) return;
  const hist = S.chist.map(h=>h.id), inParty = k => k === 'hero' || k === 'waza' || k === 'any' || CH.some(c => c.id === k);
  const eq = (v,h) => v==='any' ? (h!=='hero' && h!=='waza') : v===h;
  const next = new Set();
  for(const c of COMBOS){
    if(!c.seq.every(inParty)) continue;
    for(let k = Math.min(hist.length, c.seq.length-1); k >= 1; k--){   // 長く 合っている ほうを 優先
      const tail = hist.slice(-k);
      if(c.seq.slice(0, k).every((v,j) => eq(v, tail[j]))){ const nk = c.seq[k]; if(nk !== 'any') next.add(nk); break; }
    }
  }
  for(const k of next){ const el = comboBtnOf(k); if(el && !el.disabled) el.classList.add('cnext'); }
  if(next.size) _cgT = setTimeout(comboGlowClear, COMBO_GAP*1000/battleSpd());
}
function comboFire(r){
  comboGlowClear();
  if(S.wait || !combosOn()) return;
  S.chist = []; S.comboCd = S.time + 3;
  P.found = P.found || {}; const first = !P.found[r.id]; P.found[r.id] = 1; if(first){ save(); if(comboFound()===1) track('combo1', 'かくし連携 はじめて 発見'); }
  banner(r.n+'！'+(first?'（はつ発見）':''));
  try{ SFX.spark(); }catch(_){}
  later(.45, ()=>{ if(!S.wait) comboFx(r.id); });
}
function comboFx(id){
  SFX.combo();
  const base = (HS.atk + partyPow()) * (1 + .01*Math.min(S.combo,100));
  const D = (e, m) => { if(!e.dead && S.es.includes(e)) direct(e, Math.max(1, Math.round(base*m))); };
  const all = () => [...living()], ground = () => living().filter(e=>!(e.air>0) || e.ly<=CFG.meleeH), air = () => living().filter(e=>e.air>0);
  const c = center(); flash(); hitstop(.08); shake(true);
  const stop = (e, s) => { if(e.dead) return; if(e.boss) e.t += s*.6; else { e.stun = Math.max(e.stun, s); e.t = Math.max(e.t, s); } };
  const slamE = e => { if(e.air>0){ e.vly = -480; e.stun = Math.max(e.stun,1.2); e.slamFx = true; e.bn = 0; } };
  const lift = (e,h) => { if(!e.dead && S.es.includes(e)) launch(e, h*(e.boss?.6:1)); };
  switch(id){
    case 'c_press': FX.push({type:'quake', x:c.x, y:GROUND+3, t:0, dur:.5}); ground().forEach(e=>{ D(e,2.5); stop(e,.8); }); air().forEach(e=>{ D(e,1.5); slamE(e); }); break;
    case 'c_yoru': { const a = air(); if(a.length) a.forEach(e=>{ for(let k=0;k<3;k++) later(k*.08, ()=>{ const b=eBox(e); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.12}); D(e,1.1); }); });
      else living().slice(0,3).forEach(e=>D(e,1.5)); } break;
    case 'c_houshi': FX.push({type:'boom', x:c.x, y:c.y, r:90, t:0, dur:.55}); all().forEach(e=>{ D(e,2.2); if(!e.dead){ e.burn=3; e.poison=6; e.poisonT=.5; e.poisonPow=base*.2; } }); break;
    case 'c_yougan': FX.push({type:'quake', x:c.x, y:GROUND+3, t:0, dur:.6}); for(let k=0;k<20;k++) PARTS.push({x:rand(90,200), y:GROUND+4, vx:rand(-10,10), vy:rand(-50,-20), life:.6, max:.6, col:k%2?'#ff6a2a':'#ffd24a', sz:2, g:60});
      ground().forEach(e=>{ D(e,2.4); if(!e.dead){ e.burn=3; stop(e,1); } }); break;
    case 'c_mure': all().forEach(e=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); D(e,1.6); steal(e,true); }); break;
    case 'c_shiryo': FX.push({type:'cloud', x:c.x, y:88, r:50, t:0, dur:.6}); all().forEach(e=>{ if(!e.boss && (e.sleep>0 || e.hp < e.max*.4)){ direct(e, e.hp+1); } else { D(e,1.5); if(!e.dead){ e.sleep = CFG.sleepTime; e.stun = Math.max(e.stun, CFG.sleepTime); } } }); break;
    case 'c_ryuki': { const fx = frontX(); FX.push({type:'wave', x:fx-10, w:120, t:0, dur:.3}); living().filter(e=>eBox(e).front <= fx+70).forEach(e=>{ D(e,2.5); lift(e,40); }); } break;
    case 'c_puni': heal(S.pmax*.5, ACT[0]); FX.push({type:'ring', x:ACT[0].x, y:ACT[0].y-10, t:0, dur:.6, col:'#8ff08a', big:true}); all().forEach(e=>{ if(!e.dead){ e.poison=6; e.poisonT=.5; e.poisonPow=base*.25; } }); break;
    case 'c_gekka': S.moon = {t:0}; all().forEach(e=>{ stop(e,3); for(let k=0;k<3;k++) later(.1+k*.12, ()=>{ const b=eBox(e); sparks(b.cx,b.cy,3,['#ffffff','#e8e4d0'],60); D(e,.5); }); }); break;
    case 'c_utage': [0,.2,.4].forEach((d,k)=>later(d, ()=>all().forEach(e=>{ const b=eBox(e); FX.push({type:k===2?'boom':'xslash', x:b.cx, y:b.cy, r:14, t:0, dur:.14}); D(e,1.2); if(k===2 && !e.dead) e.burn=3; }))); break;
    case 'c_sanju': [0,.25,.5].forEach(d=>later(d, ()=>{ FX.push({type:'quake', x:c.x, y:GROUND+3, t:0, dur:.4}); shake(true); all().forEach(e=>{ D(e,1.3); slamE(e); }); })); break;
    case 'c_hira3': S.sp[0] = 100; FX.push({type:'rays', x:ACT[0].x, y:ACT[0].y-14, t:0, dur:.6}); all().forEach(e=>D(e,1.0)); float('職業技 じゅんび OK！','tag',60,30); break;
    case 'c_full': FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.7}); FX.push({type:'boom', x:c.x, y:c.y, r:110, t:0, dur:.6}); all().forEach(e=>D(e,6)); break;
    case 'c_hyakki': S.dark = .6; all().forEach((e,j)=>later(j*.03, ()=>{ const b=eBox(e); FX.push({type:'bite', x:b.cx, y:b.cy, t:0, dur:.12}); D(e,4); if(!e.dead){ e.sleep = CFG.sleepTime; e.poison=6; e.poisonT=.5; e.poisonPow=base*.2; stop(e, CFG.sleepTime); } })); break;
    case 'c_yumao': FX.push({type:'slash', x1:60, y1:56, x2:200, y2:106, t:0, dur:.35}); FX.push({type:'slash', x1:60, y1:106, x2:200, y2:56, t:0, dur:.35}); all().forEach(e=>D(e,5)); break;
    case 'c_shinyami': S.dark = .9; FX.push({type:'ring', x:c.x, y:c.y, t:0, dur:.7, col:'#9a4ae0', big:true}); all().forEach(e=>{ D(e,7); stop(e,4); }); break;
    case 'c_jingi': { const n = Object.keys(P.artFound||{}).length; living().forEach(e=>{ const b=eBox(e); FX.push({type:'holy', x:b.cx, w:16, t:0, dur:.4}); D(e, 3 + .8*n); }); float('神器 '+n+'本の 光！','tag',c.x,26); } break;
    case 'c_hikari': S.dark = .5; FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.7}); FX.push({type:'ring', x:c.x, y:c.y, t:0, dur:.6, col:'#9a4ae0', big:true}); all().forEach(e=>D(e,9)); break;
    case 'c_sanou': FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.9}); FX.push({type:'boom', x:c.x, y:c.y, r:120, t:0, dur:.7}); for(let k=0;k<3;k++) FX.push({type:'ring', x:c.x, y:c.y, t:-k*.12, dur:.7, col:['#ffe14a','#6a4ab0','#fff6c0'][k], big:true}); all().forEach(e=>D(e,14)); break;
  }
}
// 連携ノート（仲間タブ）
function panelComboNote(){
  if(!allyCtrlOpen()) return '';
  const own = new Set(P.allies.map(a=>famOf(a.sp)));
  const hint = c => { const f = (P.found||{})[c.id]; if(f) return c.seq.map(k=>FAM_JP[k]).join(' → ');
    return c.seq.map((k,i)=> i===0 && (own.has(k) || k==='hero') ? FAM_JP[k] : '？？？').join(' → '); };
  const n = comboFound();
  return `<h3>かくし連携ノート（${n}/${COMBOS.length}）</h3><p class="hint">仲間も 操作する ときだけ 発動する。決まった 順番で すばやく 押すと かくし連携が 出る（設定で「仲間も 操作する」を オン）。途中まで 合っていると、次に 押す 仲間の ボタンが 金色に 光る。</p>
    <div class="list">${COMBOS.map(c=>{ const f = (P.found||{})[c.id];
      return `<div class="li ${f?'':'locked'}" style="cursor:default"><div class="body"><div class="t"><span>${f ? c.n : '？？？'}</span><span class="hint">${c.seq.length}人</span></div><div class="d">${veil(hint(c))}${f ? '<br>'+c.d : ''}</div></div></div>`; }).join('')}</div>`;
}
