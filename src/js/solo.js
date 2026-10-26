// ===== ゆうしゃだけ 操作する モード（はじめは これ。5周目の 魔界を クリアすると 仲間も 操作できる） =====
const CTRL_ROUND = 5;                                   // 仲間操作が ひらく 周回
const allyCtrlOpen = () => (P.clear[5]||0) >= CTRL_ROUND;
const soloMode = () => !(allyCtrlOpen() && P.opt.allyCtrl !== false);
// ひらめき技の 枠（ゆうしゃだけの とき）: 1つ ＋ 1周目の 森・砂漠・魔界 クリアで 1つずつ
const SKILL_UNLOCK = [null, {st:1}, {st:3}, {st:5}];
const skillSlots = () => soloMode() ? 1 + SKILL_UNLOCK.slice(1).filter(u=>(P.clear[u.st]||0)>=1).length : 1;
const slotOpen = k => k < skillSlots();
const slotLockText = k => !soloMode() ? '仲間操作中は つかえない' : SKILL_UNLOCK[k] ? `${STAGES[SKILL_UNLOCK[k].st].n}を クリアで 解放` : '';
// エラーが おきたら 画面に 出す（不具合の 報告用）
addEventListener('error', ev=>{ try{ let el=document.getElementById('errBox'); if(!el){ el=document.createElement('div'); el.id='errBox'; el.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:99;background:rgba(160,50,30,.95);color:#fff;font:12px/1.4 monospace;padding:6px 8px;border-radius:8px;white-space:pre-wrap'; el.onclick=()=>el.remove(); document.body.appendChild(el); } el.innerHTML = '<b style="font:14px/1.6 sans-serif">不具合が 起きました（タップで とじる）</b><br><span style="font:12px/1.5 sans-serif">遊びは そのまま 続けられます。よければ この 画面を スクショして 作者（u1908inter）に 送ってください。</span><br><span style="opacity:.75;font-size:10px"></span>'; el.lastChild.textContent = ev.message+' @'+(ev.lineno||'')+' '+((ev.error&&ev.error.stack)||'').split('\n').slice(1,3).join(' '); }catch(e){} });
let _soloBuilt = false;
function buildSolo(){
  if(_soloBuilt) return; _soloBuilt = true;
  const ui = document.createElement('div'); ui.id = 'soloUI';
  ui.innerHTML = `<div class="srow"></div><div class="skrow"></div><div id="allyStrip"></div>`;
  $('#battleUI').appendChild(ui);
  for(let k=1;k<4;k++){
    const kb = document.createElement('button'); kb.className = 'kb'; kb.id = 'kb'+k;
    kb.addEventListener('pointerdown', ev=>{ ev.preventDefault(); pressFx(kb, 'skill', useSkill(k,true)!==false); });
    ui.querySelector('.skrow').appendChild(kb);
  }
}
// 画面の 組みかえ（ゆうしゃだけ ⇔ 全員）
function applyLayout(){
  buildSolo();
  const solo = soloMode(), ui = $('#soloUI'), srow = ui.querySelector('.srow'), skrow = ui.querySelector('.skrow');
  if(solo){ srow.append($('#cb0'), $('#sb0')); skrow.prepend($('#kb0')); }
  else { $('#btns').prepend($('#cb0')); $('#spbtns').prepend($('#kb0')); $('#sp2btns').prepend($('#sb0')); }
  ui.hidden = !solo; ['#btns','#spbtns','#sp2btns'].forEach(s=>{ $(s).hidden = solo; });
  $('#allyAutoBtn').hidden = solo;
  $('#battleUI').classList.toggle('solo', solo);
}
function renderAllyStrip(){
  const el = $('#allyStrip'); if(!el) return;
  if(CH.length < 2){ el.innerHTML = `<p class="hint" style="grid-column:1/-1;margin:0">仲間は まだ いない。たおした 敵が おきあがると 仲間に なって、自動で いっしょに 戦う。</p>`; return; }
  el.innerHTML = CH.slice(1).map((c,j)=>{ const i=j+1;
    return `<div class="as" id="as${i}">${imgTag(c.spr)}<div class="asb"><b>${esc(c.name)}</b><div class="mb"><i class="f1"></i></div><div class="mb m2"><i class="f2"></i></div></div></div>`; }).join('');
  for(let i=1;i<4;i++){ delete _dom['#as'+i+' .f1w']; delete _dom['#as'+i+' .f2w']; }
}
function renderAllyStripHud(){
  for(let i=1;i<CH.length;i++){ setW('#as'+i+' .f1', S.sp[i]); setW('#as'+i+' .f2', S.sp2[i]); }
}
