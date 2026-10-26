// ===== 技の お試し（拠点から 技の 動きを 見る。倒れない 的に うつだけで、経験値・熟練度は ふえない） =====
// 覚えた 技の 並び（スキルタブと 同じ 順）
const demoIds = () => TREES.flatMap(t => Object.keys(SK).filter(k => SK[k].tree===t && P.skills[k]));
let _demoScroll = 0;
function startArtDemo(k){ if(ARTI[k]) demoBegin({art:k}); }
function startDemo(id){ if(SK[id] && P.skills[id]) demoBegin({id}); }
const demoName = () => S.demo.art ? ARTI[S.demo.art].n : SK[S.demo.id].n;
function demoBegin(d){
  if(mode==='battle' && S.demo){ S.demo = d; demoBar(); demoPlay(); return; }   // お試し中は そのまま 切りかえ
  _demoScroll = window.scrollY;
  R = {exp:0, gold:0, jp:0, items:[], lv0:P.hero.lv, job:P.job, jl0:jobLv(P.job), learned:[], sparks:[], recruits:[], charm:{}, mats:{}, cards:[], boxes:0};
  refreshHS(); syncHero(); buildParty(); renderButtons();
  const auto = S.auto;
  S = newBattle(); S.auto = auto; S.solo = soloMode(); S.demo = d;
  S.st = 0; S.rd = 1; S.L = 1; S.bg = 'grass'; S.traits = [];
  S.pmax = partyMaxHp(); S.php = S.pmax;
  PARTS.length=0; FX.length=0; PROJ.length=0;
  ACT.forEach(a=>{ a.anim=null; a.x=a.c.hx; a.y=a.c.hy; });
  mode = 'battle';
  $('#battleUI').hidden=false; $('#camp').hidden=true; $('#bhud').hidden=false; $('#camptag').hidden=true;
  $('#battleUI').classList.add('demo');
  for(const k in _dom) delete _dom[k];
  hideModal(); measureK(); tip('');
  demoBar();
  demoSpawn();
  setTimeout(()=>{ if(S.demo) demoPlay(); }, 500);
}
function demoSpawn(){
  S.es = []; S.waveIdx = 1;
  const kinds = ['slime','bat','goblin'];
  slots(7).forEach((p,i)=>{ const e = makeEnemy(kinds[i%3], p.x, p.y, false); e.hp = e.max = 1e12; e.t = 1e9; e.dummy = true; e.ly = 0; e.vly = 0; e.landed = true; S.es.push(e); });   // 落ちてくる 演出なしで 立たせる
  S.wave = S.es.length; S.wait = false; S.waveName = 'お試し：'+demoName();
}
function demoPlay(){
  if(!S.demo || mode!=='battle') return;
  ACT[0].anim = null; ACT[0].x = ACT[0].c.hx; ACT[0].y = ACT[0].c.hy;
  demoSpawn(); endCombo(); ARTFX.length = 0;
  if(S.demo.art){   // 神器: 通常攻撃を 4回（効果が 出やすいように 確率を 上げる）
    const k = S.demo.art, tok = S.demo;
    for(let j=0;j<4;j++) later(j*.6, ()=>{ if(S.demo!==tok) return; S.cd[0]=0; S.lock=0; S.artCd={}; const r=Math.random; Math.random=()=>0; try{ attack(0,true); } finally{ Math.random=r; } });
    return;
  }
  execSkill(S.demo.id, true, false);
}
function demoBar(){
  let el = $('#demoBar');
  if(!el){ el = document.createElement('div'); el.id = 'demoBar'; $('#battleUI').prepend(el);
    el.addEventListener('click', ev=>{ const b = ev.target.closest('[data-demo]'); if(!b) return;
      const d = b.dataset.demo;
      if(d==='again') demoPlay();
      else if((d==='prev' || d==='next') && !S.demo.art){ const l = demoIds(), i = l.indexOf(S.demo.id); startDemo(l[(i + (d==='next'?1:-1) + l.length) % l.length]); }
      else if(d==='pick') startDemo(b.dataset.id);
      else if(d==='pickA') startArtDemo(b.dataset.id);
      else demoEnd(); }); }
  if(S.demo.art){
    const k = S.demo.art, A = ARTI[k], ks = Object.keys(ARTI).filter(x=>(P.artFound||{})[x]);
    el.innerHTML = `<div class="li sel" style="cursor:default"><div class="body"><div class="t"><span class="r5">▶ ${A.n}</span><span class="hint">神器・${WT_N[A.wt]}</span></div>
      <div class="d">${tagsHtml(ARTI_TAGS[k],true)} ${A.p}</div><p class="hint" style="margin:4px 0 0">お試しなので 効果が かならず 出る。敵は 倒れない。</p></div></div>
      <div class="opts"><button class="btn primary" data-demo="again">もう一度</button></div>
      ${ks.length>1 ? `<div class="chips" style="margin-top:8px">${ks.map(x=>`<button class="chip ${x===k?'on':''}" data-demo="pickA" data-id="${x}">${ARTI[x].n}</button>`).join('')}</div>` : ''}
      <div class="opts" style="margin-top:8px"><button class="btn" data-demo="end">もどる</button></div>`;
    S.waveName = 'お試し：'+A.n; return;
  }
  const id = S.demo.id, sk = SK[id];
  el.innerHTML = `<div class="li sel" style="cursor:default"><div class="body"><div class="t"><span>▶ ${sk.n}</span><span class="r2" style="font-size:11px">${stars(stageOf(P.skills[id].m))}</span></div>
    <div class="d">${tagsHtml(SK_TAGS[id],true)} ${sk.d} ／ ${WT_N[skillWT(id)]}の技 ／ 再使用 ${sk.cd}秒</div>
    <p class="hint" style="margin:4px 0 0">お試しなので 敵は 倒れず、熟練度も ふえない。</p></div></div>
    <div class="opts"><button class="btn" data-demo="prev">◀ 前の技</button><button class="btn primary" data-demo="again">もう一度</button><button class="btn" data-demo="next">次の技 ▶</button></div>
    <div class="chips" style="margin-top:8px">${demoIds().map(k=>`<button class="chip ${k===id?'on':''}" data-demo="pick" data-id="${k}">${SK[k].n}</button>`).join('')}</div>
    <div class="opts" style="margin-top:8px"><button class="btn" data-demo="end">スキルタブに もどる</button></div>`;
  S.waveName = 'お試し：'+sk.n;
}
function demoEnd(){
  $('#battleUI').classList.remove('demo');
  const tab = TAB; toCamp(); TAB = tab; renderCamp();
  requestAnimationFrame(()=>window.scrollTo(0, _demoScroll));   // 見る前の 位置に もどす
}
