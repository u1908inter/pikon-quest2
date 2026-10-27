// ===== 戦闘ボタン =====
// 列ごとに キャラ。ゆうしゃ：攻撃 ／ ひらめき技（Q） ／ 職業技（A）。仲間：攻撃 ／ 必殺技1（W E R） ／ 必殺技2（S D F）
for(let i=0;i<4;i++){
  const b = document.createElement('button'); b.className='cb'; b.id='cb'+i;
  b.addEventListener('pointerdown', ev=>{ ev.preventDefault(); pressFx(b, 'atk', attack(i,true)!==false, i); });
  $('#btns').appendChild(b);
  const sb = document.createElement('button'); sb.className='sb'; sb.id='sb'+i;
  sb.addEventListener('pointerdown', ev=>{ ev.preventDefault(); pressFx(sb, 'sp', trySpecial(i)!==false, i); });
  if(i===0){
    const kb = document.createElement('button'); kb.className='kb'; kb.id='kb0';
    kb.addEventListener('pointerdown', ev=>{ ev.preventDefault(); pressFx(kb, 'skill', useSkill(0,true)!==false); });
    $('#spbtns').appendChild(kb); $('#sp2btns').appendChild(sb);
  }else{
    $('#spbtns').appendChild(sb);
    const s2 = document.createElement('button'); s2.className='sb sb2'; s2.id='sc'+i;
    s2.addEventListener('pointerdown', ev=>{ ev.preventDefault(); pressFx(s2, 'sp', trySpecial2(i)!==false, i); });
    $('#sp2btns').appendChild(s2);
  }
}
function renderSkillButtons(){
  buildSolo();
  for(let k=0;k<4;k++){
    const el = $('#kb'+k); if(!el) continue;
    const id = P.slots[k], open = slotOpen(k), key = S.solo ? 'QWER'[k] : 'Q';
    el.innerHTML = !open ? `<span class="hint">🔒 ${slotLockText(k)}</span>`
      : id ? `<div class="cd"></div>${S.solo?`<span class="kk">${key}</span>`:''}<span>${S.solo?'':'ひらめき技<br>'}${SK[id].n}${tagsHtml(SK_TAGS[id])}</span><small>${stars(stageOf(P.skills[id].m))}</small>` : `<span class="hint">― 空き ―<br>スキルタブで セット</span>`;
    if(open && id && !skillUsable(id)) el.innerHTML = `<span class="nu">✕ ${SK[id].n}</span><small class="nu2">${WT_N[skillWT(id)]}が 必要</small>`;
    el.classList.toggle('nouse', !!(open && id && !skillUsable(id)));
    el.disabled = !open || !id || !skillUsable(id); delete _dom['scd'+k];
  }
}
function renderButtons(){
  S.solo = soloMode(); applyLayout();
  for(let i=1;i<4;i++){
    const empty = i>=CH.length;
    $('#cb'+i).classList.toggle('empty', empty); $('#sb'+i).classList.toggle('empty', empty); $('#sc'+i).classList.toggle('empty', empty);
    if(empty){ $('#cb'+i).innerHTML = `<span class="ro" style="margin-top:38px">― あき ―</span>`; $('#sb'+i).innerHTML=''; $('#sc'+i).innerHTML=''; $('#sb'+i).classList.remove('ready'); $('#sc'+i).classList.remove('ready'); delete _dom['sp'+i]; delete _dom['sp2'+i]; }
  }
  CH.forEach((c,i)=>{
    $('#cb'+i).innerHTML = `<span class="kh">${i+1}</span>${i===0 ? `<span class="jl" id="jobLvTag">${jobLvTxt()}</span><i class="jpbar"><b id="jpFill"></b></i>` : ''}${imgTag(c.spr)}<span class="nm">${i===0 ? JOBS[P.job].n : esc(c.name)}</span><span class="ro">${c.role}</span>${tagsHtml(chTags(i,0))}<div class="cd"></div>`;
    $('#sb'+i).innerHTML = `<div class="fill"></div><span>${i===0?'職業技':'必殺技1'}<br>${c.sp}${tagsHtml(chTags(i,1))}</span>`;
    if(i>0){ $('#sc'+i).innerHTML = `<div class="fill"></div><span>必殺技2<br>${c.sp2}${tagsHtml(chTags(i,2))}</span>`; delete _dom['#sc'+i+' .fillw']; delete _dom['sp2'+i]; }
    delete _dom['cd'+i]; delete _dom['#sb'+i+' .fillw']; delete _dom.jpw;
  });
  renderSkillButtons(); renderAllyStrip();
}
function syncAutoBtns(){ const a=$('#autoBtn'); a.textContent='全オート'; a.classList.toggle('on',S.auto); $('#allyAutoBtn').classList.toggle('on', !!S.allyAuto); }
$('#allyAutoBtn').addEventListener('click', ()=>{ S.allyAuto = !S.allyAuto; P.opt.allyAuto = S.allyAuto; save(); syncAutoBtns(); if(S.allyAuto && !S.auto) float('仲間が 自分で 戦う！','tag',150,40); });
$('#autoBtn').addEventListener('click', ()=>{ S.auto=!S.auto; syncAutoBtns(); });
$('#retreatBtn').addEventListener('click', ()=>{
  if(mode!=='battle') return;
  showModal(`<h2>撤退する？</h2><p>ここまでに 手に入れた 経験値・ゴールド・装備は もちかえれる。</p>
    <div class="opts"><button class="btn" data-m="close">つづける</button><button class="btn danger" data-m="retreat">撤退する</button></div>`);
});
function pauseGame(){
  if(mode!=='battle' || !$('#modal').hidden || S.demo) return;
  showModal(`<h2>ポーズ</h2><p class="hint">${S.tower ? '無限の塔 '+S.floor+'階' : STAGES[S.st].n+' '+S.rd+'周目'} ／ ${S.tower ? '' : S.waveIdx<=WAVES ? 'ウェーブ '+S.waveIdx+'/'+WAVES : 'ボス戦'}</p>
    <label class="toggle"><span>敵が 高く 上がったら カメラを 引く</span><input type="checkbox" data-pz="cam" ${P.opt.cam!==false?'checked':''}></label>
    <label class="toggle"><span>画面のゆれ</span><input type="checkbox" data-pz="shake" ${P.opt.shake?'checked':''}></label>
    <div class="seg"><span style="font-size:13px;font-weight:700;align-self:center">ヒットストップ</span>${[['full','強'],['weak','弱'],['off','なし']].map(([k,n])=>`<button class="btn sm ${(P.opt.hs||'weak')===k?'primary':''}" data-hs="${k}">${n}</button>`).join('')}</div>
    ${feelOpts('pz')}
    <div class="opts"><button class="btn danger" data-m="retreat">撤退する</button><button class="btn primary" data-m="close">さいかい</button></div>`);
}
$('#pauseBtn').addEventListener('click', pauseGame);
function feelOpts(attr){
  return `<label class="toggle"><span>BGM</span><input type="checkbox" data-${attr}="bgm" ${P.opt.bgm!==false?'checked':''}></label>
    <label class="toggle"><span>効果音</span><input type="checkbox" data-${attr}="se" ${P.opt.se!==false?'checked':''}></label>
    <div class="seg">${[[.3,'小'],[.6,'中'],[1,'大']].map(([v,n])=>`<button class="btn sm ${(P.opt.vol??.6)===v?'primary':''}" data-vol="${v}">音量 ${n}</button>`).join('')}</div>
    <label class="toggle"><span>振動（タップの 手ごたえ）</span><input type="checkbox" data-${attr}="vib" ${P.opt.vib!==false?'checked':''}></label>`;
}
document.addEventListener('click', ev=>{ const h = ev.target.closest('[data-hs]'); if(!h) return;
  P.opt.hs = h.dataset.hs; save(); h.parentNode.querySelectorAll('[data-hs]').forEach(x=>x.classList.toggle('primary', x===h)); });
document.addEventListener('click', ev=>{ const b = ev.target.closest('[data-vol]'); if(!b) return;
  P.opt.vol = +b.dataset.vol; save(); audioInit(); SFX.atk(0);
  b.parentNode.querySelectorAll('[data-vol]').forEach(x=>x.classList.toggle('primary', x===b)); });
$('#modal').addEventListener('change', ev=>{ const k = ev.target.dataset.pz; if(k){ P.opt[k] = ev.target.checked; save(); if(k==='vib' && P.opt.vib) buzz(15); } });
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) pauseGame(); });
addEventListener('keydown', ev=>{
  if(!ev.repeat && mode==='battle' && (ev.key==='Escape' || ev.key==='p' || ev.key==='P')){
    if($('#modal').hidden) pauseGame(); else if($('#mbox').querySelector('[data-pz]')) hideModal();
    return;
  }
  if(ev.repeat || mode!=='battle' || !$('#modal').hidden) return;
  const k = ev.key;
  if(S.solo){   // ゆうしゃだけ: 1 攻撃 ／ Q W E R ひらめき技 ／ A 職業技 ／ スペース ピコーン
    const lk = k.length===1 ? k.toLowerCase() : k;
    if(k==='1') pressFx($('#cb0'), 'atk', attack(0,true)!==false, 0);
    else if('qwer'.includes(lk) && lk.length===1){ const j='qwer'.indexOf(lk); pressFx($('#kb'+j), 'skill', useSkill(j,true)!==false); }
    else if(lk==='a') pressFx($('#sb0'), 'sp', trySpecial(0)!==false);
    return;
  }
  if(k>='1'&&k<='4'){ const i=+k-1; if(i<CH.length) pressFx($('#cb'+i), 'atk', attack(i,true)!==false, i); }
  else if(k.length===1 && 'qwer'.includes(k.toLowerCase())){ const j='qwer'.indexOf(k.toLowerCase()); if(j===0) pressFx($('#kb0'), 'skill', useSkill(0,true)!==false); else if(j<CH.length) pressFx($('#sb'+j), 'sp', trySpecial(j)!==false, j); }
  else if(k.length===1 && 'asdf'.includes(k.toLowerCase())){ const j='asdf'.indexOf(k.toLowerCase()); if(j===0) pressFx($('#sb0'), 'sp', trySpecial(0)!==false); else if(j<CH.length) pressFx($('#sc'+j), 'sp', trySpecial2(j)!==false, j); }
});

// ===== 出撃・帰還 =====
const roundOpen = rd => rd===1 || (P.clear[5]||0) >= rd-1;
const stageOpen = (st, rd) => roundOpen(rd) && (st===0 || (P.clear[st-1]||0) >= rd);
const maxRound = () => Math.min(MAX_ROUND, (P.clear[5]||0)+1);
function startStage(st, rd, tower){
  R = {charm: P.charmNext || {}}; P.charmNext = {}; banClear();
  refreshHS(); syncHero(); buildParty(); renderButtons();
  P.sel = {st, rd}; P.stats.runs++;
  if(!tower) P.lastStage = {st, rd};
  track('start', 'はじめて 出撃');
  const auto = S.auto;
  S = newBattle(); S.auto = auto; S.solo = soloMode();
  S.st = st; S.rd = rd; S.L = lvOf(st, rd); S.bg = STAGES[st].bg;
  S.tut = st===0 && rd===1 && !P.clear[0];
  S.traits = tower ? [] : traitsOf(rd);
  { const nr = ensureRoot(); const bad = unusableSet(); if(nr) later(1.2, ()=>banner('「'+SK[nr].n+'」を おぼえた！')); if(bad.length) later(.2, ()=>tip('⚠ セット中の ひらめき技 <b>'+bad.map(id=>SK[id].n).join('・')+'</b> は いまの 武器（'+WT_N[curWT()]+'）では 使えない。スキルタブで 入れかえよう。')); }
  if(S.traits.length) later(.1, ()=>banner(S.traits.map(k=>TRAITS[k].n).join('・')+'！'));
  S.pmax = partyMaxHp(); S.php = S.pmax;
  R = {exp:0, gold:0, jp:0, items:[], lv0:P.hero.lv, job:P.job, jl0:jobLv(P.job), learned:[], sparks:[], recruits:[], charm:R.charm, mats:{}, cards:[], boxes:0};
  tip('');
  PARTS.length=0; FX.length=0; PROJ.length=0;
  ACT.forEach(a=>{ a.anim=null; a.x=a.c.hx; a.y=a.c.hy; });
  mode = 'battle';
  $('#battleUI').hidden=false; $('#camp').hidden=true; $('#bhud').hidden=false; $('#camptag').hidden=true;
  S.allyAuto = !!P.opt.allyAuto; syncAutoBtns(); syncSpdBtn();
  for(const k in _dom) delete _dom[k];
  hideModal(); measureK();
  setTimeout(()=>{ if(mode==='battle') spawnWave(); }, 400);
}
function toCamp(){
  banClear();
  const auto = S.auto;
  S = newBattle(); S.auto = auto; S.solo = soloMode(); S.bg='camp';
  PARTS.length=0; FX.length=0; PROJ.length=0;
  ACT.forEach(a=>{ a.anim=null; a.x=a.c.hx; a.y=a.c.hy; });
  mode = 'camp'; R = null;
  $('#battleUI').hidden=true; $('#camp').hidden=false; $('#bhud').hidden=true; $('#camptag').hidden=false;
  hideModal(); refreshHS(); syncHero(); buildParty(); renderButtons(); renderCamp(); save(); measureK();
  tabIntro(TAB);
  jobUnlockCheck();
  ctrlIntro();
}
function showResult(reason){
  if(!R) return;
  S.wait = true; S.queue = [];
  const title = S.tower ? `無限の塔　${S.tower.top||S.tower.f0-1}階まで のぼった${(S.tower.top||0)>=towerBest()&&S.tower.top?'（最高記録！）':''}` : reason==='clear' ? `${STAGES[S.st].n} ${S.rd}周目 クリア！` : reason==='dead' ? 'ぜんめつ… 拠点に もどった' : '拠点に ひきかえした';
  const jl = jobLv(R.job);
  const next = reason==='clear' && !S.tower && !S.dbgBoss ? (S.st<5 ? [S.st+1, S.rd] : [0, S.rd+1]) : null;
  const nextOk = next && next[1] <= MAX_ROUND && stageOpen(next[0], next[1]);
  const items = R.items.map(o=>`<div><span class="r${o.it.rar}">${esc(o.it.name)}</span>${o.chest?' <span class="hint">（宝箱）</span>':''}${o.r==='sold'?' <span class="hint">→ 弱いので 売った</span>':o.r==='full'?' <span class="hint">→ もちものが いっぱいで 売った</span>':''}</div>`).join('');
  showModal(`<h2>${title}</h2>
    <div class="kv">
      <span><i>経験値</i>+${fmt(R.exp)}</span><span><i>ゴールド</i>+${fmt(R.gold)}</span>
      <span><i>ゆうしゃ</i>Lv${R.lv0}${P.hero.lv>R.lv0?` → <b>Lv${P.hero.lv}</b>`:''}</span>
      <span><i>${JOBS[R.job].n}</i>Lv${R.jl0}${jl>R.jl0?` → <b>Lv${jl}</b>`:''}</span>
      <span><i>JP</i>+${fmt(R.jp)}</span><span><i>倒した数</i>${fmt(R.kills||0)}</span>
    </div>
    ${R.recruits.length ? `<p style="margin-top:6px">🐾 おきあがった 仲間：<b>${R.recruits.map(al=>esc(al.name)+'（'+EDEF[al.sp].n+'）').join('・')}</b></p>` : ''}
    ${reason==='clear' && S.st===5 && S.rd===CTRL_ROUND && !P.seen.allyCtrl && (P.seen.allyCtrl=1) ? `<p class="r4" style="font-weight:800;margin-top:6px">★ 特典：仲間も 自分で 操作できるように なった！ 決まった 順番で 押すと「かくし連携」も 出る（仲間タブの ノート）</p>` : ''}
    ${S.tut && reason==='clear' ? `<p class="r4" style="font-weight:800;margin-top:6px">チュートリアル クリア！ 拠点で 装備・ジョブ・仲間を ととのえて、次は 森へ。</p>` : ''}
    ${(()=>{ const gn = goalNews(); return gn.length ? `<p class="r2" style="margin-top:6px;font-weight:800">★ 目標 たっせい：${gn.join('・')}（出撃タブで うけとれる）</p>` : ''; })()}
    ${R.sparks.length ? `<p style="margin-top:6px">💡 ひらめいた 技：<b>${R.sparks.join('・')}</b></p>` : ''}
    ${R.learned.filter(Boolean).length ? `<p style="margin-top:6px">アビリティを おぼえた：<b>${R.learned.filter(Boolean).join('・')}</b></p>` : ''}
    ${Object.keys(R.mats).length ? `<p style="margin-top:6px">素材：${Object.keys(R.mats).map(k=>MATS[k].n+'×'+R.mats[k]).join('・')}</p>` : ''}
    ${R.cards.length ? `<p style="margin-top:6px" class="r1">◆ カード：<b>${R.cards.map(k=>CARDS[k].n).join('・')}</b></p>` : ''}
    ${R.boxes ? `<p style="margin-top:6px">■ 青箱 ×${R.boxes}（カードタブで あける）</p>` : ''}
    ${Object.keys(R.charm).length ? `<p class="hint" style="margin-top:6px">使った お守り：${Object.keys(R.charm).map(k=>CHARMS[k].n).join('・')}</p>` : ''}
    <h3 style="font-size:13px;margin:10px 0 4px">手に入れた 装備（${R.items.length}）</h3>
    <div class="loot">${items || '<span class="hint">なし</span>'}</div>
    ${reason==='clear' && S.st===5 && S.rd===maxRound()-1 ? `<p class="r3" style="font-weight:800">${S.rd+1}周目が ひらいた！ 敵が さらに 強くなる。</p>` : ''}
    <div class="opts">
      <button class="btn" data-m="camp">拠点へ</button>
      <button class="btn" data-m="again">もう一度</button>
      ${nextOk ? `<button class="btn primary" data-m="next" data-st="${next[0]}" data-rd="${next[1]}">次へ（${STAGES[next[0]].n}${next[1]!==S.rd?' '+next[1]+'周目':''}）</button>` : ''}
    </div>`);
}

// ===== モーダル =====
function showModal(html){ $('#mbox').innerHTML = html; $('#modal').hidden = false; }
function hideModal(){ $('#modal').hidden = true; }
$('#modal').addEventListener('click', ev=>{
  if(ev.target.id==='modal' && mode==='camp'){ hideModal(); return; }
  const b = ev.target.closest('[data-m]'); if(!b) return;
  const m = b.dataset.m;
  if(m==='close') hideModal();
  else if(m==='al-in'){ const id=+b.dataset.id; const k=P.party.indexOf(null);
    if(k>=0){ P.party[k]=id; save(); hideModal(); buildParty(); renderButtons(); renderCamp(); }
    else showModal(`<h2>だれと 入れかえる？</h2><div class="list">${P.party.map((pid,j)=>{ const al=allyById(pid); return `<button class="li" data-m="al-swap" data-id="${id}" data-k="${j}">${imgTag(al.sp)}<div class="body"><div class="t"><span>枠${j+1}　${esc(allyName(al))}</span><span>Lv${al.lv}</span></div></div></button>`; }).join('')}</div><div class="opts"><button class="btn" data-m="close">やめる</button></div>`); }
  else if(m==='al-swap'){ P.party[+b.dataset.k]=+b.dataset.id; save(); hideModal(); buildParty(); renderButtons(); renderCamp(); }
  else if(m==='al-out'){ const id=+b.dataset.id; P.party=P.party.map(x=>x===id?null:x); save(); hideModal(); buildParty(); renderButtons(); renderCamp(); }
  else if(m==='al-bye'){ const id=+b.dataset.id, al=allyById(id); showModal(`<h2>${esc(allyName(al))}と わかれる？</h2><p>もう もどってこない。</p><div class="opts"><button class="btn" data-m="close">やめる</button><button class="btn danger" data-m="al-bye2" data-id="${id}">わかれる</button></div>`); }
  else if(m==='al-bye2'){ const id=+b.dataset.id; P.allies=P.allies.filter(x=>x.id!==id); P.party=P.party.map(x=>x===id?null:x); save(); hideModal(); buildParty(); renderButtons(); renderCamp(); }
  else if(m==='al-fuse'){ const al=allyById(+b.dataset.id); const mats=P.allies.filter(x=>x!==al && x.sp===al.sp && !P.party.includes(x.id)).sort((x,y)=>x.lv-y.lv);
    showModal(`<h2>${esc(allyName(al))}に 合体させる 仲間</h2><p class="hint">えらんだ 仲間は いなくなり、そのぶん ＋が ふえる。パーティの 仲間は えらべない。</p><div class="list">${mats.map(x=>`<button class="li" data-m="fu-do" data-a="${al.id}" data-b="${x.id}"><div class="body"><div class="t"><span>${esc(allyName(x))}</span><span>Lv${x.lv}</span></div><div class="d">費用 ${fmt(fuseCost(al,x))}G（いま ${fmt(P.gold)}G）</div></div></button>`).join('')}</div><div class="opts"><button class="btn" data-m="close">やめる</button></div>`); }
  else if(m==='fu-do'){ const mn=allyName(allyById(+b.dataset.b)); const r=fuseAllies(+b.dataset.a, +b.dataset.b);
    if(!r){ showModal(`<p>ゴールドが たりない。</p><div class="opts"><button class="btn" data-m="close">とじる</button></div>`); return; }
    buildParty(); renderButtons(); renderCamp(); fuseResultModal(r, mn); }

  else if(m==='retreat'){ hideModal(); save(); showResult('retreat'); }
  else if(m==='camp') toCamp();
  else if(m==='again'){ if(S.tower) startTower(S.tower.f0); else startStage(S.st, S.rd); }
  else if(m==='next') startStage(+b.dataset.st, +b.dataset.rd);
  else if(m==='equip'){ equipItem(+b.dataset.id); hideModal(); renderCamp(); }
  else if(m==='unequip'){ unequip(b.dataset.k); hideModal(); renderCamp(); }
  else if(m==='sell'){ sellItem(+b.dataset.id); hideModal(); renderCamp(); }
  else if(m==='lock'){ const it = P.inv.find(x=>x.id===+b.dataset.id) || Object.values(P.equip).find(x=>x&&x.id===+b.dataset.id); if(it){ it.lock=!it.lock; save(); } hideModal(); renderCamp(); }
  else if(m==='ms'){ P.mslots[b.dataset.c] = b.dataset.v || null; refreshHS(); save(); hideModal(); renderCamp(); }
  else if(m==='wipe'){ LS.del(SAVE_KEY); P = freshSave(); refreshHS(); hideModal(); toCamp(); }
  else if(m==='import'){
    try{ const d = JSON.parse(decodeURIComponent(escape(atob($('#impTxt').value.trim())))); if(!d || d.v!==1) throw 0;
      P = Object.assign(freshSave(), d); save(); hideModal(); toCamp(); }
    catch(e){ $('#impErr').textContent = 'よみこめなかった。文字が かけていないか たしかめてね。'; }
  }
});

// ===== 拠点の タブ =====
let TAB = 'go', GV = 'eq', gSlot = 'all', gSort = 'score', confirmKey = null;
$('#tabs').addEventListener('click', ev=>{ const b = ev.target.closest('[data-tab]'); if(!b) return; audioInit(); SFX.ui(); TAB = b.dataset.tab; confirmKey=null; renderCamp(); tabIntro(TAB); });
// 拠点の 各ページを はじめて ひらいたときの 説明
const TAB_INTRO = {
  go:   ['出撃', 'ステージと 周回を えらんで 出撃する。<br>5ウェーブ ＋ ボスを 倒すと クリアで、次の ステージが ひらく。魔界を クリアすると 次の 周回へ。周回ごとに <b>特色</b>（飛ぶ敵が 多い・敵が かたい など）が ある。<br>上の「🎁 特典」で ひらける おまけと 進みぐあいが 見られる。'],
  skill:['スキル', '<b>💡 ひらめき技</b>：戦闘で ひらめいた 技を 枠に セットする。<b>いまの 武器の 系統の 技だけ</b> 使える（剣の 技は 剣を 持っているとき）。<br><b>📈 スキルレベル</b>：ゆうしゃの レベルが 上がると ポイントが もらえる。武器ごとに 能力を のばせる。'],
  ally: ['仲間', '戦闘で おきあがった 仲間が ここに ならぶ。<b>パーティは 3体まで</b>、ほかは 控え。<br>同じ 種族どうしを <b>合体</b>させると 強くなり、まれに 合体事故で 上の 種族に 化ける。'],
  gear: ['装備', '拾った 装備の つけかえ。いらない 装備は まとめて 売れる。<br>ジョブごとに <b>持てる 武器</b>が きまっていて、武器で 通常攻撃が かわる。ユニーク装備は <b>力を 抽出</b>して ほかの 装備に うつせる。'],
  job:  ['ジョブ', 'ジョブを かえると 持てる 武器と <b>職業技</b>が かわる。<br>敵を 倒すと JPが たまって ジョブLvが 上がり、アビリティを おぼえる。おぼえた アビリティは <b>マスター前でも つけられる</b>。'],
  card: ['カード', 'まものが ごく まれに カードを 落とす。<br>カード帖に 登録すると <b>HPと 攻撃力が 1まいごとに +1%</b>。カードは 装備に 挿して 強化にも つかえる（装備タブで 装備を タップ）。'],
  town: ['町', '<b>工房</b>：素材で 装備を つくる<br><b>精錬所</b>：ゴールドで 装備を きたえる（+5から先は 失敗で こわれる）<br><b>市場</b>：素材の 売り買い（相場は 毎日 かわる）<br><b>交換所</b>：カードの かけらで すきな カードと 交換<br><b>施設</b>：拠点を 広げて ずっと 効く 効果を える'],
  cfg:  ['設定', '演出の 重さ・音・振動などを かえられる。<br>上の「📖 あそびかた」で 操作や しくみを いつでも 読みなおせる。'],
};
function tabIntro(k){
  P.seen = P.seen || {};
  if(!TAB_INTRO[k] || P.seen['tab_'+k] || mode==='battle' || !$('#modal').hidden) return;
  P.seen['tab_'+k] = 1; save();
  const [n, d] = TAB_INTRO[k];
  showModal(`<h2>${n}</h2><p style="font-size:13px;line-height:1.8">${d.replace(/<br>/g,'<br>・').replace(/^/,'・')}</p><div class="opts"><button class="btn primary" data-m="close">わかった</button></div>`);
}
// タブは 使えるように なってから 出す（さいしょは 出撃と 設定だけ）
const TAB_N = {skill:'スキル', ally:'仲間', gear:'装備', job:'ジョブ', card:'カード', town:'町'};
const SK0 = Object.keys(freshSave().skills).length;
const TAB_COND = {
  skill: () => Object.keys(P.skills).length > SK0 || (P.clear[0]||0) >= 1,   // はじめて ひらめいたら
  ally:  () => P.allies.length > 0,
  gear:  () => P.inv.length > 0 || EQ.some(k => P.equip[k]),
  job:   () => (P.clear[0]||0) >= 1,
  card:  () => albumCount() > 0,
  town:  () => (P.clear[0]||0) >= 1,
};
function syncTabs(){
  const legacy = P.tabsOpen === 'legacy' || !P.tabsOpen;
  if(legacy) P.tabsOpen = {};
  const fresh = [];
  for(const k in TAB_COND) if(!P.tabsOpen[k] && TAB_COND[k]()){ P.tabsOpen[k] = 1; if(!legacy) fresh.push(k); }
  document.querySelectorAll('#tabs [data-tab]').forEach(b => { const k = b.dataset.tab; b.hidden = k in TAB_COND && !P.tabsOpen[k]; });
  if(TAB in TAB_COND && !P.tabsOpen[TAB]) TAB = 'go';
  if(fresh.length){
    for(const k of fresh) if(k !== 'skill'){ P.newMark = P.newMark || {}; P.newMark[k] = true; }
    if(mode === 'camp') whenFree(() => toast('新しい タブ「' + fresh.map(k => TAB_N[k]).join('」「') + '」が ひらいた！'));
    save();
  }
}
function renderCamp(){
  syncTabs();
  { const nr = ensureRoot(); if(nr) banner(WT_N[skillWT(nr)]+'を 持ったので「'+SK[nr].n+'」を おぼえた！'); }
  if(TAB==='skill' && P.newSkill){ P.newSkill = false; save(); }
  document.querySelectorAll('#tabs [data-tab]').forEach(b=>b.classList.toggle('on', b.dataset.tab===TAB));
  { const t = $('#tabs [data-tab="skill"]'); if(t) t.innerHTML = 'スキル' + (P.newSkill ? '<span class="nb">NEW</span>' : ''); }
  { const t = $('#tabs [data-tab="go"]'), n = goalsReady(); if(t) t.innerHTML = '出撃' + (n ? `<span class="nb">★${n}</span>` : ''); }
  tabBadges();
  $('#panel').innerHTML = TAB==='go' ? panelGo() : TAB==='skill' ? panelSkill() : TAB==='ally' ? panelAlly() : TAB==='gear' ? panelGear() : TAB==='job' ? panelJob() : TAB==='card' ? panelCards() : TAB==='town' ? panelTown() : panelCfg();
}
let GOVIEW = 'go';
function panelGo(){
  const L = perkList(), d = L.filter(x=>x.done).length;
  const sub = `<div class="subtabs"><button class="${GOVIEW==='go'?'on':''}" data-act="goview" data-k="go">⚔ 出撃</button><button class="${GOVIEW==='perk'?'on':''}" data-act="goview" data-k="perk">🎁 特典 ${d}/${L.length}</button></div>`;
  return sub + (GOVIEW==='perk' ? panelPerks() : panelGoMain());
}
function panelGoMain(){
  const rd = clamp(P.sel.rd, 1, maxRound()); let st = P.sel.st; if(!stageOpen(st, rd)) st = 0;
  P.sel = {st, rd};
  const hs = HS, L = lvOf(st, rd);
  let h = `<h3>しゅつげき</h3>
    <div class="rsel"><button class="btn sm" data-act="rd" data-v="-1" ${rd<=1?'disabled':''}>◀</button><b>${rd}周目</b><button class="btn sm" data-act="rd" data-v="1" ${rd>=maxRound()?'disabled':''}>▶</button></div>
    <div class="stg">`;
  STAGES.forEach((s,i)=>{
    const open = stageOpen(i, rd), clr = (P.clear[i]||0) >= rd;
    h += `<button data-act="st" data-i="${i}" class="${i===st?'on':''}" ${open?'':'disabled'}>
      <b>${open ? s.n : '？？？'}${clr?' <span class="r4" style="font-size:13px">★クリア</span>':''}</b>
      <small>${open ? `めやす Lv${Math.max(1,3*lvOf(i,rd)-2)} ／ ボス ${EDEF[s.boss].n}` : (i>0 ? `${STAGES[i-1].n}を クリアで ひらく` : `前の周の 魔界を クリアで ひらく`)}</small></button>`;
  });
  h += `</div>${traitsOf(rd).length ? `<div class="trait">🌀 ${rd}周目の 特色<br>${traitLine(rd)}</div>` : ''}<p class="hint" style="text-align:center;margin-top:6px">この ステージの ひらめき率 <b style="color:var(--r2)">${(sparkChance(L)*100).toFixed(1)}%</b>（格上の 敵ほど ひらめきやすい）<br>5ウェーブ ＋ ボス ／ 敵の強さ ${L}　${maxRound()>1?'／ 周回するほど 敵も 宝も 強くなる':'／ 魔界を クリアすると 2周目が ひらく'}</p>
    ${unusableSet().length ? `<p class="warn">⚠ セット中の ひらめき技 <b>${unusableSet().map(id=>SK[id].n).join('・')}</b> は いまの 武器（${WT_N[curWT()]}）では 使えない。スキルタブで 入れかえよう。</p>` : ''}
    ${unusableSet().length && canFit() ? `<div class="row" style="margin:-2px 0 8px"><button class="btn sm primary" data-act="skFit">⚡ ${WT_N[curWT()]}の 技に まとめて 入れかえ</button></div>` : ''}
    <button class="btn primary big" data-act="go">${STAGES[st].n} ${rd}周目へ しゅつげき</button>
    ${panelGoals()}
    ${(P.clear[0]||0) >= 1 ? `<div class="row" style="margin:8px 0"><button class="btn sm" data-share="rec">𝕏 記録を シェア</button></div>` : ''}
    ${towerOpen() ? panelTowerCard() : ''}
    <h3>パーティ</h3>
    <div class="list">
      <div class="li" style="cursor:default">${imgTag(heroSpr())}<div class="body"><div class="t"><span>ゆうしゃ（${JOBS[P.job].n} Lv${jobLv(P.job)}）</span><span>Lv${P.hero.lv}</span></div><div class="d">${JOBS[P.job].role}：${JOBS[P.job].roleD}</div></div></div>
      ${members().map(al=>allyRow(al, P.party.indexOf(al.id))).join('') || '<p class="hint">まだ 仲間が いない。敵を たおすと ときどき おきあがって 仲間に なる。</p>'}
    </div>
    <h3>ゆうしゃ のつよさ</h3>
    <div class="kv">
      <span><i>パーティHP</i>${fmt(partyMaxHp())}</span><span><i>攻撃力</i>${fmt(hs.atk)}</span>
      <span><i>防御力</i>${fmt(hs.def)}</span><span><i>会心率</i>${hs.crit}%</span>
      <span><i>会心の倍率</i>×${hs.critMul.toFixed(1)}</span><span><i>攻撃速度</i>+${hs.aspd}%</span>
      <span><i>職業技ゲージ</i>+${hs.spg}%</span><span><i>空中の敵へ</i>+${hs.air}%</span>
      <span><i>仲間の攻撃力</i>+${hs.ally}%</span><span><i>魔法ダメージ</i>+${hs.mag}%</span>
      <span><i>経験値</i>+${hs.exp}%</span><span><i>ゴールド</i>+${hs.gold}%</span>
      ${hs.pw.evade?`<span><i>回避率</i>${hs.pw.evade > CFG.evadeCap ? `${hs.pw.evade}%（上限 ${CFG.evadeCap}%）` : hs.pw.evade+'%'}</span>`:''}${hs.pw.cut?`<span><i>受けるダメージ</i>-${hs.pw.cut > CFG.cutCap ? `${hs.pw.cut}%（上限 ${CFG.cutCap}%）` : hs.pw.cut+'%'}</span>`:''}
    </div>
    <p class="hint">次のレベルまで ${fmt(needExp(P.hero.lv)-P.hero.exp)} EXP ／ ゴールド ${fmt(P.gold)}G</p>
    <div class="row" style="margin-top:6px"><button class="btn sm" data-act="save">いま セーブする</button><span class="hint">最後の セーブ：${lastSave ? new Date(lastSave).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}) : '―'}</span></div>`;
  return h;
}
// --- 技 ---
let selSlot = -1;
let SKSEL = 0;
let SKVIEW = 'skill';
// スキルタブ: 「ひらめき技」と「スキルツリー」を べつの 画面に わける
function panelSkill(){
  const left = wpLeft();
  const sub = `<div class="subtabs"><button class="${SKVIEW==='skill'?'on':''}" data-act="skview" data-k="skill">💡 ひらめき技</button><button class="${SKVIEW==='tree'?'on':''}" data-act="skview" data-k="tree">📈 スキルレベル${left>0?`<span class="nb">${left}</span>`:''}</button></div>`;
  return sub + (SKVIEW==='tree' ? panelWTree() : panelSkillList());
}
function panelSkillList(){
  const n = skillSlots(); if(SKSEL >= n) SKSEL = 0;
  const cur = P.slots[SKSEL];
  let h = `<h3>セット中の ひらめき技</h3><p class="hint">${S.solo || soloMode() ? `ゆうしゃは ひらめき技を ${n}つ セットできる（キーは Q W E R）。${n<4?'1周目の 森・砂漠・魔界を クリアすると 枠が ふえる。':''}` : '仲間も 操作する ときは ひらめき技は 1つ（キーは Q）。<b>設定タブで「仲間も 操作する」を オフに すると、ゆうしゃだけ 操作に なって 4枠 つかえる。</b>'}<br>枠を えらんで、下の 技を タップで セット。セットした 技を つかうと、ときどき 新しい 技を <b>ひらめく</b>。</p>
    <div class="skslots">${[0,1,2,3].map(k=>{ const id=P.slots[k], open=k<n;
      return `<button class="skslot ${k===SKSEL?'on':''} ${open?'':'lock'}" data-act="skslot" data-k="${k}" ${open?'':'disabled'}><span class="hint">${open?'枠'+(k+1)+'（'+'QWER'[k]+'）':'🔒'}</span><br><b>${open ? (id?SK[id].n:'― 空き ―') : slotLockText(k)}</b>${open && id && !skillUsable(id) ? `<br><span class="bad">✕ ${WT_N[skillWT(id)]}が 必要</span>` : ''}</button>`; }).join('')}</div>
    <div class="li sel" style="cursor:default"><div class="body"><div class="t"><span>${cur?SK[cur].n:'― 空き ―'}</span><span class="r2" style="font-size:12px">${cur?stars(stageOf(P.skills[cur].m)):''}</span></div><div class="d">${cur?`${tagsHtml(SK_TAGS[cur],true)} ${SK[cur].d} ／ 再使用 ${SK[cur].cd}秒<br>ここから ひらめける 技：${Object.keys(SK).filter(k=>SK[k].parent===cur && !P.skills[k]).length ? Object.keys(SK).filter(k=>SK[k].parent===cur && !P.skills[k]).map(k=>P.skills[cur].m>=SK[k].req?'？？？（条件達成）':`？？？（熟練度 ${SK[k].req} 以上）`).join('、') : 'もう ない'}`:''}</div></div></div>
    ${unusableSet().length ? `<p class="warn">⚠ ✕の 技は いまの 武器（${WT_N[curWT()]}）では 使えない。${WT_N[curWT()]}の 技に 入れかえるか、武器を かえよう。</p>` : ''}
    ${canFit() ? `<div class="row" style="margin:4px 0 8px"><button class="btn sm primary" data-act="skFit">⚡ ${WT_N[curWT()]}の 技を おまかせで セット</button></div>` : ''}
    ${cur && P.slots.filter(Boolean).length>1 ? `<div class="row"><button class="btn sm" data-act="skclear">この 枠を 空ける</button></div>` : ''}`;
  for(const tree of TREES){
    const ids = Object.keys(SK).filter(k=>SK[k].tree===tree);
    if(!ids.some(k=>P.skills[k] || (SK[k].parent && P.skills[SK[k].parent]))) continue;
    const fav = Object.keys(JOB_TREE).filter(j=>JOB_TREE[j]===tree).map(j=>JOBS[j].n).join('・');
    const twt = SK_TREE_WT[tree];
    h += `<h3>${WT_N[twt]}の技<span class="hint" style="font-size:12px;font-weight:400">　${curWT()===twt?'← いまの 武器で つかえる':WT_N[twt]+'を 持つと つかえる'}</span></h3><div class="list">`;
    for(const id of ids){
      if(P.skills[id]){
        const m=P.skills[id].m, st=stageOf(m), inS=P.slots.findIndex((v,j)=>v===id && slotOpen(j));
        h += `<button class="li" data-act="learn" data-id="${id}"><div class="body"><div class="t"><span>${SK[id].n}${inS>=0?`<span class="tag">枠${inS+1}</span>`:''}</span><span><span class="demo-btn" data-act="demo" data-id="${id}">▶ 見る</span> <span class="r2" style="font-size:12px">${stars(st)}</span></span></div>
          <div class="d">${tagsHtml(SK_TAGS[id],true)} ${SK[id].d} ／ 再使用 ${SK[id].cd}秒 ／ 熟練度 ${Math.floor(m)}${st<4?`（次の★まで ${ST_T[st+1]-Math.floor(m)}）`:''}</div></div></button>`;
      }else{
        const p=SK[id].parent, known=p&&P.skills[p], ready=known&&P.skills[p].m>=SK[id].req;
        h += `<div class="li locked"><div class="body"><div class="t"><span>？？？</span></div><div class="d">${known?`「${SK[p].n}」を つかうと ひらめくかも${ready?'（<b class="r4">条件達成</b>）':`（熟練度 ${SK[id].req} 以上）`}`:'まだ 手がかりが ない'}</div></div></div>`;
      }
    }
    h += `</div>`;
  }
  return h + `<h3>技の 性質</h3>${tagLegend()}`;
}
// --- 仲間 ---
function allyRow(al, slot){
  const F=FAM[famOf(al.sp)];
  return `<button class="li" data-act="ally" data-id="${al.id}">${imgTag(al.sp)}<div class="body"><div class="t"><span>${esc(allyName(al))}${slot>=0?`<span class="tag">枠${slot+1}</span>`:''}${al.accident?'<span class="tag r3">事故</span>':''}</span><span>Lv${al.lv}</span></div>
    <div class="d">${EDEF[al.sp].n}（${F.n}系）／ 攻撃 ${fmt(allyPow(al))} ／ HP ${fmt(allyHp(al))}<br>${F.role}${tagsHtml(famTag(al.sp,0))} ／ 必殺技1「${F.sp}」${tagsHtml(famTag(al.sp,1))} ／ 必殺技2「${F.sp2}」${tagsHtml(famTag(al.sp,2))}</div></div></button>`;
}
function panelAlly(){
  const inP = new Set(P.party.filter(Boolean));
  let h = `<h3>パーティ（3枠）</h3><p class="hint">仲間を タップすると くわしく。控えの 仲間を「パーティへ」で 入れかえ。</p><div class="list">`;
  for(let k=0;k<3;k++){ const al=allyById(P.party[k]); h += al ? allyRow(al, k) : `<div class="li" style="cursor:default"><div class="body"><div class="t"><span class="hint">枠${k+1}　― あき ―</span></div><div class="d">敵を たおすと ときどき おきあがって 仲間に なる</div></div></div>`; }
  h += `</div>`;
  const res = P.allies.filter(a=>!inP.has(a.id));
  const plans = [...new Set(P.allies.map(a=>a.sp))].map(bulkPlan).filter(Boolean);
  const cost = plans.reduce((s,p)=>s+p.cost,0), n = plans.reduce((s,p)=>s+p.mats.length,0);
  h += `<h3>控え（${res.length}体）</h3>`;
  if(plans.length) h += `<div class="row"><button class="btn sm" data-act="bulk" ${P.gold>=cost?'':'disabled'}>まとめて 合体（${n}体 吸収・${fmt(cost)}G）</button></div><p class="hint">同じ 種族の 控えを、いちばん 強い 1体に まとめて 合体する（パーティの 仲間が いれば その仲間に）。</p>`;
  h += res.length ? `<div class="list">${res.sort((a,b)=>famOf(a.sp).localeCompare(famOf(b.sp))||(RANK[b.sp]||0)-(RANK[a.sp]||0)||b.lv-a.lv).map(al=>allyRow(al,-1)).join('')}</div>` : `<p class="hint">控えは いない。</p>`;
  h += `<h3>合体</h3><p class="hint">同じ 種族の 仲間 どうしを 合体させると、片方が いなくなり ＋が ふえる（＋1ごとに HP・攻撃 +3%）。まれに <b class="r3">合体事故</b>が おきて、同じ 系統の 上の 種族に 化ける！</p>`;
  return h + panelComboNote();
}
function allyModal(id){
  const al=allyById(id); if(!al) return; const F=FAM[famOf(al.sp)], slot=P.party.indexOf(id);
  const mats = P.allies.filter(x=>x!==al && x.sp===al.sp && !P.party.includes(x.id));
  showModal(`<div style="display:flex;gap:10px;align-items:center">${imgTag(al.sp,'','height:48px')}<div><h2 style="margin:0">${esc(allyName(al))}</h2><p class="hint">${EDEF[al.sp].n}（${F.n}系） Lv${al.lv}${al.lv>=al.maxLv?'（成長限界）':''}</p></div></div>
    <div class="kv" style="margin-top:6px"><span><i>攻撃</i>${fmt(allyPow(al))}</span><span><i>HP</i>${fmt(allyHp(al))}</span><span><i>合体</i>+${al.plus||0}</span><span><i>攻撃の間隔</i>${F.cd}秒</span></div>
    <p style="font-size:13px;margin-top:6px"><b>攻撃「${F.role}」</b>${tagsHtml(famTag(al.sp,0),true)} ${F.roleD}<br><b>必殺技1「${F.sp}」</b>${tagsHtml(famTag(al.sp,1),true)} ${F.spD}<br><b>必殺技2「${F.sp2}」</b>${tagsHtml(famTag(al.sp,2),true)} ${F.sp2D}</p>
    <div class="opts">
      ${slot>=0 ? `<button class="btn" data-m="al-out" data-id="${id}">控えへ</button>` : `<button class="btn primary" data-m="al-in" data-id="${id}">パーティへ</button>`}
      <button class="btn" data-m="al-fuse" data-id="${id}" ${mats.length?'':'disabled'}>合体（素材 ${mats.length}体）</button>
      ${slot<0?`<button class="btn danger" data-m="al-bye" data-id="${id}">わかれる</button>`:''}
      <button class="btn" data-m="close">とじる</button></div>`);
}
function fuseResultModal(r, m){
  const a=r.a;
  if(r.acc){ flash(); showModal(`<p style="color:var(--red);font-size:19px;font-weight:900;text-align:center;letter-spacing:.1em">！？ 合体事故 ！？</p>
    <div style="text-align:center">${imgTag(r.acc.from,'','height:40px')} → ${imgTag(a.sp,'','height:56px')}</div>
    <p style="text-align:center">${esc(a.name)}は <b>${EDEF[r.acc.from].n}</b> から<br><b class="r3" style="font-size:16px">${EDEF[a.sp].n}</b> に 化けた！（＋${a.plus}）</p>
    <div class="opts"><button class="btn primary" data-m="close">やったー</button></div>`); return; }
  showModal(`<h2>合体 せいこう</h2><p>${esc(m)}を 吸収して <b>${esc(allyName(a))}</b> に なった。（攻撃 ${fmt(allyPow(a))} ／ HP ${fmt(allyHp(a))}）</p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`);
}
// --- 装備 ---
function gearRow(it, k){
  const tgt = k || eqTarget(it), cur = P.equip[tgt], d = k ? 0 : itemScore(it) - itemScore(cur);
  const mark = k ? '' : d>0 ? `<span class="up">▲${d}</span>` : d<0 ? `<span class="down">▼${-d}</span>` : '<span class="hint">＝</span>';
  return `<button class="li" data-act="item" data-id="${it.id}" data-k="${k||''}"><div class="body">
    <div class="t"><span class="r${it.rar}">${k?'<span class="tag eqtag">そうび中</span>':''}${it.lock?'🔒':''}${esc(it.name)}${canWield(it)?'':'<span class="tag" style="color:var(--dim)">持てない</span>'}</span><span>${mark}</span></div>
    <div class="d">${SLOTN[k||it.slot]} ／ ${RAR_N[it.rar]} ／ ${itemLines(it).join(' ／ ')}${it.u?`<br><span class="r3">◆ ${UNIQ[it.u].p}</span>${P.extracted[it.u]?' <span class="hint">（抽出ずみ）</span>':''}`:''}${it.set?`<br><span class="r4">◆ ${SETS[it.set].n}</span>`:''}${it.a?`<br><span class="r5">◆ ${ARTI[it.a].p}</span>`:''}</div></div></button>`;
}
function panelGear(){
  const weak = P.inv.filter(isWeakBulk), wG = weak.reduce((t,it)=>t+sellPrice(it),0);
  let h = `<div class="seg">${[['eq','そうび中'],['inv',`もちもの ${P.inv.length}/${CFG.invMax}`],['set','セット']].map(([k,n])=>`<button class="btn ${GV===k?'primary':''}" data-act="gv" data-k="${k}">${n}</button>`).join('')}</div>`;
  if(GV==='eq'){
    h += `<div class="list">`;
    for(const k of EQ){ const it=P.equip[k]; h += it ? gearRow(it, k) : `<div class="li" style="cursor:default"><div class="body"><div class="t"><span class="hint">${SLOTN[k]}　― なし ―</span></div></div></div>`; }
    h += `</div><p class="hint" style="margin-top:6px">いまの 能力：HP ${fmt(HS.hp)} ／ 攻撃力 ${fmt(HS.atk)} ／ 防御力 ${fmt(HS.def)} ／ 会心 ${HS.crit}%</p>
      <div class="row"><button class="btn" data-act="best">おすすめ装備</button></div>`;
    return h;
  }
  if(GV==='set'){
    const sc = setCounts(), own = {};
    for(const it of P.inv) if(it.set) (own[it.set]=own[it.set]||new Set()).add(it.slot);
    const keys = Object.keys(SETS).filter(k=>sc[k]||own[k]);
    if(!keys.length) return h + `<p class="hint">まだ セット装備を もっていない。セット装備は 2・4・6つ そろえると ボーナスが つく。</p>`;
    h += `<div class="list">`;
    for(const k of keys){
      const n = sc[k]||0, have = own[k] ? [...own[k]].map(sl=>SLOTN[sl]).join('・') : '';
      h += `<div class="li" style="cursor:default"><div class="body"><div class="t"><span class="r4">${SETS[k].n}</span><span>そうび ${n}/6</span></div><div class="setb">`;
      for(const m of [2,4,6]) h += `<div class="${n>=m?'r4':'off'}">（${m}）${SETS[k].b[m]}</div>`;
      h += `</div>${have?`<div class="d">もちものに：${have}</div>`:''}</div></div>`;
    }
    return h + `</div>`;
  }
  const conf = confirmKey==='sellWeak';
  h += `<div class="row"><button class="btn sm" data-act="best">おすすめ装備</button>
    <button class="btn sm ${conf?'danger':''}" data-act="sellWeak" ${weak.length?'':'disabled'}>${conf?`本当に ${weak.length}こ 売る（${fmt(wG)}G）`:`弱い装備を まとめて売る（${weak.length}）`}</button></div>
    <p class="hint">「弱い装備」＝ いまの装備以下の もの（ユニーク・セットも ふくむ）。鍵つきと、まだ 力を 抽出していない ユニークは 売らない。残したい 装備には 鍵を かけよう。自動売却は ユニーク・セットを 売らない。</p>
    <label class="toggle"><span>拾った 弱い装備を 自動で 売る</span><input type="checkbox" data-act="autoSell" ${P.autoSell?'checked':''}></label>`;
  const cnt = sl => P.inv.filter(it=>sl==='all'||it.slot===sl).length;
  h += `<div class="chips">${[['all','全部'],...SLOTS.map(sl=>[sl,SLOTN[sl]])].map(([k,n])=>`<button class="chip ${gSlot===k?'on':''}" data-act="gslot" data-k="${k}">${n}<small>${cnt(k)}</small></button>`).join('')}</div>
    <div class="chips">${[['score','強い順'],['rar','レア度順'],['new','新しい順']].map(([k,n])=>`<button class="chip ${gSort===k?'on':''}" data-act="gsort" data-k="${k}">${n}</button>`).join('')}</div>`;
  let list = P.inv.filter(it=>gSlot==='all'||it.slot===gSlot);
  const diffOf = it => itemScore(it) - itemScore(P.equip[eqTarget(it)]);
  list.sort(gSort==='new' ? (a,b)=>b.id-a.id : gSort==='rar' ? (a,b)=>b.rar-a.rar||diffOf(b)-diffOf(a) : (a,b)=>diffOf(b)-diffOf(a)||b.rar-a.rar);
  if(!P.inv.length) return h + `<p class="hint">まだ なにも もっていない。まものを たおすと ときどき おとす。</p>`;
  const eqRows = EQ.filter(k=>P.equip[k] && (gSlot==='all'||P.equip[k].slot===gSlot)).map(k=>gearRow(P.equip[k], k)).join('');
  return h + `<div class="list">${eqRows}${list.map(it=>gearRow(it)).join('')}</div>`;
}
function itemModal(id, k){
  const it = k ? P.equip[k] : P.inv.find(x=>x.id===id); if(!it) return;
  const cur = k ? null : P.equip[eqTarget(it)];
  showModal(`<h2 class="r${it.rar}">${it.lock?'🔒':''}${esc(it.name)}</h2>
    <p class="hint">${SLOTN[k||it.slot]} ／ ${RAR_N[it.rar]} ／ アイテムLv${it.ilv}</p>
    <div>${itemLines(it).map(l=>`<div>${l}</div>`).join('')}</div>
    ${it.u?`<p class="r3" style="font-weight:700">◆ ${UNIQ[it.u].p}${P.extracted[it.u]?' <span class="hint">（この力は 抽出ずみ）</span>':''}</p>`:''}${it.u && k ? '<p class="hint">はずすと「力を抽出」できる。</p>' : ''}
    ${it.a?`<p class="r5" style="font-weight:700">◆ ${ARTI[it.a].p}${(P.artEx||{})[it.a]?' <span class="hint">（この力は 抽出ずみ）</span>':''}</p>`:''}
    ${it.set?`<p class="r4" style="font-weight:700">◆ ${SETS[it.set].n}（${[2,4,6].map(m=>`${m}：${SETS[it.set].b[m]}`).join(' ／ ')}）</p>`:''}
    ${cardLine(it)}
    ${cur?`<p class="hint" style="margin-top:6px">いまの装備：<span class="r${cur.rar}">${esc(cur.name)}</span>（${itemLines(cur).join(' ／ ')}）</p>`:''}
    <div class="opts">
      ${k ? `<button class="btn" data-m="unequip" data-k="${k}" ${P.inv.length>=CFG.invMax?'disabled':''}>はずす</button>`
          : `<button class="btn primary" data-m="equip" data-id="${it.id}" ${canWield(it)?'':'disabled'}>${canWield(it)?'装備する':'この ジョブでは 持てない'}</button><button class="btn" data-m="sell" data-id="${it.id}" ${it.lock?'disabled':''}>売る（${fmt(sellPrice(it))}G）</button>`}
      ${canCard(it)?`<button class="btn" data-m="t-card" data-id="${it.id}">カードを挿す</button>`:''}
      ${it.u && !k ? `<button class="btn" data-m="x-ask" data-id="${it.id}" style="border-color:var(--r3);color:var(--r3)" ${it.lock||P.extracted[it.u]?'disabled':''}>${P.extracted[it.u]?'抽出ずみ':'力を抽出'}</button>` : ''}
      ${it.a ? `<button class="btn" data-m="a-demo" data-k="${it.a}">▶ 効果を 見る</button>` : ''}${it.a && !k ? `<button class="btn" data-m="a-ask" data-id="${it.id}" ${(P.artEx||{})[it.a]?'disabled':''}>${(P.artEx||{})[it.a]?'抽出ずみ':'力を抽出'}</button>` : ''}
      <button class="btn" data-m="lock" data-id="${it.id}">${it.lock?'鍵を はずす':'鍵を かける'}</button>
      <button class="btn" data-m="close">とじる</button>
    </div>`);
}
// --- ジョブ ---
// 高い 周回で まだ 育っていない ジョブか（ジョブLv4 以下 ＆ 魔界 3周目 以上 クリア）
const jobWeak = () => jobLv(P.job) <= 4 && (P.clear[5]||0) >= 3;
function panelJob(){
  const j = P.job, J = JOBS[j], lv = jobLv(j), jp = P.jobs[j].jp, M = lv >= JOB_MAX;
  const next = JOB_T[lv], prev = JOB_T[lv-1];
  let h = `<h3>いまのジョブ</h3>
    ${jobWeak() ? '<p class="warn">⚠ 新しい ジョブは まだ 弱い。低い 周回で 育てよう（ジョブLvが 上がると アビリティで 強くなる）</p>' : ''}
    <div class="jobhead">${imgTag(heroSpr())}<div style="flex:1;min-width:0">
      <div style="font-size:17px;font-weight:800">${J.n} <span style="font-size:13px;color:${M?'var(--r2)':'var(--dim)'}">Lv${lv}/${JOB_MAX}${M?' マスター':''}</span></div>
      <div class="hint">${J.base}</div>
      <div class="jbar"><i style="width:${M?100:(jp-prev)/(next-prev)*100}%"></i></div>
      <div class="hint">JP ${fmt(jp)}${M?'':` ／ 次のLvまで ${fmt(next-jp)}`}（敵1体で1、ボス10）</div></div></div>
    <p style="font-size:13px;margin-top:6px"><b>持てる武器：${weaponNote(j)}</b>（◎は この ジョブ 専用の 攻撃に なる）<br><b>いまの 攻撃「${atkInfo().role}」</b>（${WT_N[curWT()]}${P.equip.weapon?'':'・素手'}）${tagsHtml(jobTag(atkId(),0),true)} ${atkInfo().roleD}<br><b>職業技「${J.sp}」</b>${tagsHtml(jobTag(j,1),true)} ${J.spD}</p>
    <div>${J.ab.map(a=>`<div class="ab ${lv>=a.lv?'':'lock'}"><span>${lv>=a.lv?'◆':'◇'} ${a.n}<span class="hint">　${a.d}</span></span><span style="white-space:nowrap"><span class="cat ${a.cat}">${CAT_N[a.cat]}</span>Lv${a.lv}</span></div>`).join('')}</div>
    <h3>ジョブを かえる</h3><p class="hint">いつでも 無料で かえられる。JPは ジョブごとに たまる。ジョブで 持てる 武器と 職業技が 変わり、通常攻撃と つかえる ひらめき技は 武器で きまる。</p><div class="list">`;
  for(const k of JOB_KEYS){
    const l = jobLv(k);
    if(!jobOpen(k)){ h += `<div class="li" style="cursor:default;opacity:.6">${imgTag('hero_'+k,'','filter:brightness(0) opacity(.4)')}<div class="body"><div class="t"><span>${JOBS[k].abyss?'？？？':veil(JOBS[k].n)}</span><span class="hint">🔒</span></div><div class="d">条件：${veil(JOBS[k].hint)}</div></div></div>`; continue; }
    h += `<button class="li ${k===j?'sel':''}" data-act="job" data-k="${k}">${imgTag('hero_'+k)}<div class="body">
      <div class="t"><span>${JOBS[k].n}${k===j?'<span class="tag r2">いま</span>':''}</span><span class="${l>=JOB_MAX?'r2':''}">${l>=JOB_MAX?'★マスター':`Lv${l}/${JOB_MAX}`}</span></div>
      <div class="d">${JOBS[k].d}<br>武器：${weaponNote(k)} ／ 職業技「${JOBS[k].sp}」${tagsHtml(jobTag(k,1))} ／ ${JOBS[k].base}</div></div></button>`;
  }
  h += `</div><h3>アビリティ枠</h3>
    <p class="hint">ほかの ジョブで おぼえた アビリティを はめられる（マスター しなくても OK）。どのジョブでも 効果が出る。いまの ジョブの アビリティは はめなくても 発動している。<br>ジョブを 3つ マスターするごとに「自由」枠が 1つ ふえる（いま マスター ${mastersCount()}）。</p><div class="mslots">`;
  for(const k of slotKeys()){
    const c = slotCat(k), v = P.mslots[k], r = v && abRef(v), n = msOptions(c).length;
    h += `<button class="mslot ${v?'on':''}" data-act="mslot" data-c="${k}"><span class="cat ${c}">${CAT_N[c]}</span><br>${r ? `<b>${r.a.n}</b><br><span class="hint">${JOBS[r.j].n}${r.j===P.job?'（いまのジョブ）':''}</span>` : `<span class="hint">${n?'タップで えらぶ':'まだ 候補がない'}</span>`}</button>`;
  }
  return h + `</div>` + panelPowers() + panelArtPowers() + `<h3>技の 性質</h3>${tagLegend()}`;
}
function msOptions(cat){
  const out = [];
  for(const j of JOB_KEYS) if(j !== P.job && jobUsed(j)) for(const a of JOBS[j].ab) if(jobLv(j) >= a.lv && (cat==='any' || a.cat===cat)) out.push({v:`ab:${j}:${a.n}`, j, a});
  return out;
}
function msModal(c){
  const cat = slotCat(c), opts = msOptions(cat), used = new Set(Object.values(P.mslots).filter(Boolean));
  showModal(`<h2>${CAT_N[cat]}枠に はめる</h2>
    ${opts.length ? `<div class="list">${opts.map(o=>`<button class="li ${P.mslots[c]===o.v?'sel':''}" data-m="ms" data-c="${c}" data-v="${o.v}" ${used.has(o.v)&&P.mslots[c]!==o.v?'disabled':''}><div class="body"><div class="t"><span>${o.a.n}</span><span class="hint">${JOBS[o.j].n}</span></div><div class="d">${o.a.d}</div></div></button>`).join('')}</div>`
      : `<p class="hint">まだ 候補がない。ほかの ジョブで アビリティを おぼえると、ここに はめられる。</p>`}
    <div class="opts">${P.mslots[c]?`<button class="btn" data-m="ms" data-c="${c}" data-v="">はずす</button>`:''}<button class="btn" data-m="close">とじる</button></div>`);
}
// --- 設定 ---
let CFGVIEW = 'cfg';
function panelCfg(){
  const sub = `<div class="subtabs"><button class="${CFGVIEW==='cfg'?'on':''}" data-act="cfgview" data-k="cfg">⚙ 設定</button><button class="${CFGVIEW==='help'?'on':''}" data-act="cfgview" data-k="help">📖 あそびかた</button></div>`;
  return sub + (CFGVIEW==='help' ? veil(panelHelp()) : panelCfgMain());
}
function panelHelp(){
  return `<h3>きほん</h3>
    <p style="font-size:13px;line-height:1.8">・拠点で ステージを えらんで 出撃。5ウェーブ ＋ ボスを 倒すと クリア。魔界を クリアすると 次の 周回へ（周回ごとに 特色が ある）。<br>
    ・赤い「！」が 出た 敵は もうすぐ 攻撃してくる。打ち上げて 止めよう。<br>
    ・<b>ポーズ</b>は 戦闘画面の ❚❚ ボタン（キー：P / Esc）。<br>
    ・周回を すすめると <b>バトル速度</b>（×1.5・×2）、<b>精錬+11</b>、<b>無限の塔</b> などの おまけが ひらく。出撃ページの「🎁 特典」で 確認できる。</p>
    <h3>ゆうしゃの 操作</h3>
    <p style="font-size:13px;line-height:1.8">・<b>攻撃ボタン</b>（大きい ボタン）：通常攻撃。<b>武器で 変わる</b>（剣は 斬り上げ、拳は 連打、杖は 範囲 …）。ジョブと 武器が 合うと ◎専用の 攻撃に なる。<br>
    ・<b>ひらめき技</b>（下の 青い ボタン）：使うと ときどき 新しい 技を <b>ひらめく</b>（格上の 敵ほど ひらめきやすい）。いまの 武器の 系統の 技だけ 使える。<br>
    ・<b>職業技ボタン</b>：攻撃や ひらめき技を 使うと 力が たまる。満タンで 光ったら おす。<br>
    ・<b>ちがう 技を 続けて</b> 使うと（攻撃→ひらめき技→職業技 など）<b>連携</b>で 威力アップ。同じ 技の 連打では つながらない。<br>
    ・キー：1 攻撃 ／ Q W E R ひらめき技 ／ A 職業技</p>
    <h3>浮かせと 追い打ち</h3>
    <p style="font-size:13px;line-height:1.8">・打ち上げた 敵には <b>だれの 攻撃でも 1.5倍</b>。浮いている あいだ 敵は 攻撃して こない。<br>
    ・浮いた敵が いるとき、☁（空中に強い）や ↓（叩きつけ）の 技の ボタンが <b>青く 光る</b>。それが チャンス。</p>
    <h3>技の 性質アイコン</h3>${tagLegend()}
    <h3>仲間</h3>
    <p style="font-size:13px;line-height:1.8">・敵を たおすと ときどき <b>おきあがって 仲間に なる</b>（パーティは 3体まで）。仲間は 自動で 戦い、ゲージが たまると 必殺技を 出す。<br>
    ・同じ 種族どうしを <b>合体</b>させると 強くなり、まれに 合体事故で 上の 種族に 化ける。<br>
    ・${CTRL_ROUND}周目の 魔界を クリアすると、仲間も 自分で 操作できる（設定で 切りかえ）。<br>
    ・仲間も 操作する ときの キー：1〜4 攻撃 ／ Q ひらめき技 ／ W E R 必殺技1 ／ A 職業技 ／ S D F 必殺技2</p>
    ${allyCtrlOpen() ? `<h3>仲間の 操作と かくし連携</h3>
    <p style="font-size:13px;line-height:1.8">・設定の「仲間も 操作する」を オンに すると、仲間の 攻撃・必殺技の ボタンが 出る（ひらめき技の 枠は 1つに なる）。<br>
    ・「仲間オート」を オンに すると、仲間は 自分で 戦う。<br>
    ・決まった 順番で すばやく ボタンを 押すと <b>かくし連携</b>が 出る。見つけた 連携は 仲間タブの「かくし連携ノート」に のこる。</p>` : ''}
    <h3>拠点で できること</h3>
    <p style="font-size:13px;line-height:1.8">・<b>スキル</b>：ひらめき技の セットと、武器ごとの スキルレベル。<br>
    ・<b>装備</b>：武器・防具の つけかえ、ユニークの 力の 抽出。<br>
    ・<b>ジョブ</b>：ジョブを かえると 持てる 武器と 職業技が かわる。おぼえた アビリティは マスター前でも つけられる。<br>
    ・<b>カード</b>：装備の 穴に はめて 強化。<br>
    ・<b>町</b>：工房で 装備づくり、精錬所で 強化、市場で 売り買い、交換所、施設で 拠点を 広げる。</p>`;
}
function panelCfgMain(){
  return `<h3>演出の重さ</h3>
    <div class="seg">${[['high','標準'],['mid','軽量'],['low','最軽量']].map(([k,n])=>`<button class="btn ${P.opt.q===k?'primary':''}" data-act="q" data-k="${k}">${n}</button>`).join('')}</div>
    <label class="toggle"><span>画面のゆれ</span><input type="checkbox" data-act="shake" ${P.opt.shake?'checked':''}></label>
    <label class="toggle"><span>敵が 高く 上がったら カメラを 引く</span><input type="checkbox" data-act="cam" ${P.opt.cam!==false?'checked':''}></label>
    ${allyCtrlOpen() ? `<label class="toggle"><span>仲間も 操作する（${CTRL_ROUND}周目クリアの 特典）</span><input type="checkbox" data-act="allyCtrl" ${P.opt.allyCtrl!==false?'checked':''}></label>` : `<p class="hint">🔒 ${CTRL_ROUND}周目の 魔界を クリアすると、仲間も 自分で 操作できるように なる。</p>`}
    <label class="toggle"><span>敵の ふっとび（回転・壁で はね返る）</span><input type="checkbox" data-act="knock" ${P.opt.knock!==false?'checked':''}></label>
    <p style="font-size:13px;font-weight:700;margin-top:6px">ヒットストップ（当たった瞬間に 一瞬 止める 演出）</p>
    <div class="seg">${[['full','強'],['weak','弱'],['off','なし']].map(([k,n])=>`<button class="btn ${(P.opt.hs||'weak')===k?'primary':''}" data-act="hs" data-k="${k}">${n}</button>`).join('')}</div>
    <label class="toggle"><span>動作の 重さを 表示（fps）</span><input type="checkbox" data-act="meter" ${P.opt.meter?'checked':''}></label>
    <label class="toggle"><span>30fpsで動かす（電池にやさしい）</span><input type="checkbox" data-act="fps30" ${P.opt.fps30?'checked':''}></label>
    <p class="hint">軽量：飛び散る粒と ダメージ数字を 減らす。最軽量：砕け散る演出・影・小さい ダメージ数字を なくし、30fpsで 動かす。</p>
    <h3>音と 振動</h3>${feelOpts('act')}
    <div class="row" style="margin:6px 0"><button class="btn sm" data-act="soundTest">🎵 サウンドテスト</button></div>
    <p class="hint">戦闘ボタンを 押せたら 音・振動・光で 知らせる。押せなかったとき（待ち時間中など）は 低い音で ボタンが ゆれる。iPhoneの 振動は 対応している 機種・OSのみ。</p>
    <h3>セーブ</h3>
    <p class="hint">セーブは この ブラウザに 自動で 保存される。べつの 端末に うつすときは 書き出した 文字を 読みこむ。</p>
    <div class="row" style="margin-bottom:6px"><button class="btn sm primary" data-act="saveNow">いま セーブする</button><span class="hint">さいごの セーブ：${lastSaveText()}</span></div>
    <div class="row"><button class="btn sm" data-act="export">書き出す</button><button class="btn sm" data-act="importOpen">読みこむ</button><button class="btn sm danger" data-act="wipeAsk">データを 消す</button></div>
    <div id="cfgOut"></div>
    <p class="hint" style="text-align:center;margin-top:14px">ピコーン・クエスト2 ／ 作者：u1908inter</p>` + panelDebug();
}
$('#panel').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-act]'); if(!b) return;
  const a = b.dataset.act;
  if(a==='rd'){ P.sel.rd = clamp(P.sel.rd + +b.dataset.v, 1, maxRound()); if(!stageOpen(P.sel.st, P.sel.rd)) P.sel.st=0; renderCamp(); }
  else if(a==='st'){ P.sel.st = +b.dataset.i; renderCamp(); }
  else if(a==='go'){ startStage(P.sel.st, P.sel.rd); }
  else if(a==='save'){ save(); renderCamp(); }
  else if(a==='learn'){ const id=b.dataset.id, j=P.slots.indexOf(id); if(j>=0 && j!==SKSEL) P.slots[j]=P.slots[SKSEL]; P.slots[SKSEL]=id; save(); renderCamp(); }   // すでに 別の 枠に あれば 入れかえ
  else if(a==='tower'){ startTower(+b.dataset.f); }
  else if(a==='demo'){ ev.stopPropagation(); startDemo(b.dataset.id); return; }
  else if(a==='ending'){ playEnding(()=>{}); }
  else if(a==='skFit'){ const n = autoFitSkills(); renderCamp(); if(n) banner(n+'つの 技を セットした！'); }
  else if(a==='saveNow'){ manualSave(); }
  else if(a==='soundTest'){ soundTest(); }
  else if(a==='goview'){ GOVIEW=b.dataset.k; renderCamp(); }
  else if(a==='cfgview'){ CFGVIEW=b.dataset.k; renderCamp(); }
  else if(a==='skview'){ SKVIEW=b.dataset.k; renderCamp(); }
  else if(a==='skslot'){ SKSEL=+b.dataset.k; renderCamp(); }
  else if(a==='skclear'){ if(P.slots.filter(Boolean).length>1){ P.slots[SKSEL]=null; save(); } renderCamp(); }
  else if(a==='ally'){ allyModal(+b.dataset.id); }
  else if(a==='bulk'){
    let n=0; const accs=[];
    for(const sp of [...new Set(P.allies.map(x=>x.sp))]){
      for(let guard=0; guard<500; guard++){ const p=bulkPlan(sp); if(!p) break; const base=p.base, from=base.sp; let got=0;
        for(const m of p.mats){ if(base.sp!==from) break; const r=fuseAllies(base.id, m.id); if(!r) break; got++; n++; if(r.acc) accs.push(r); }
        if(!got || base.sp===from) break; }
    }
    buildParty(); renderButtons(); renderCamp();
    showModal(`<h2>まとめて 合体</h2><p>${n}体を 吸収した。</p>${accs.length?`<p class="r3" style="font-weight:800">合体事故 ${accs.length}回！<br>${accs.map(r=>`${esc(r.a.name)}：${EDEF[r.acc.from].n} → ${EDEF[r.a.sp].n}`).join('<br>')}</p>`:''}<div class="opts"><button class="btn primary" data-m="close">OK</button></div>`);
  }
  else if(a==='gv'){ GV = b.dataset.k; renderCamp(); }
  else if(a==='gslot'){ gSlot = b.dataset.k; renderCamp(); }
  else if(a==='gsort'){ gSort = b.dataset.k; renderCamp(); }
  else if(a==='best'){ bestEquip(); renderCamp(); }
  else if(a==='sellWeak'){ if(confirmKey!=='sellWeak'){ confirmKey='sellWeak'; renderCamp(); return; } P.inv.filter(isWeakBulk).forEach(it=>sellItem(it.id)); confirmKey=null; renderCamp(); }
  else if(a==='item'){ itemModal(+b.dataset.id, b.dataset.k||null); }
  else if(a==='job'){ if(!jobOpen(b.dataset.k)) return; const oj = P.job; P.job = b.dataset.k; if(oj!==P.job){ onJobChange(oj, P.job); if(jobWeak()) toast('新しい ジョブは まだ 弱い。低い 周回で 育てよう'); } refreshHS(); syncHero(); save(); renderCamp(); }
  else if(a==='mslot'){ msModal(b.dataset.c); }
  else if(a==='hs'){ P.opt.hs = b.dataset.k; save(); renderCamp(); }
  else if(a==='q'){ P.opt.q = b.dataset.k; P.opt.fps30 = b.dataset.k==='low'; applyOpt(); save(); renderCamp(); }
  else if(a==='export'){ const t = btoa(unescape(encodeURIComponent(JSON.stringify(P)))); $('#cfgOut').innerHTML = `<p class="hint" style="margin-top:6px">この 文字を コピーして とっておく：</p><textarea readonly>${t}</textarea>`; }
  else if(a==='importOpen'){ showModal(`<h2>セーブを 読みこむ</h2><p class="hint">書き出した 文字を はりつける。いまの データは 上書きされる。</p><textarea id="impTxt"></textarea><p class="hint r3" id="impErr"></p><div class="opts"><button class="btn" data-m="close">やめる</button><button class="btn primary" data-m="import">読みこむ</button></div>`); }
  else if(a==='wipeAsk'){ showModal(`<h2>データを 消す？</h2><p>レベル・装備・ジョブ・ステージの 記録が すべて 消える。もとに もどせない。</p><div class="opts"><button class="btn" data-m="close">やめる</button><button class="btn danger" data-m="wipe">消す</button></div>`); }
});
// チュートリアルの ヒント
function tip(html){ const t=$('#tip'); if(!t) return; t.innerHTML = html||''; t.hidden = !html; }
// チュートリアル中は 説明を 出すときに 戦闘を 止める（読み終えたら さいかい）
function tutTipPop(html){ tip(html); tutPop(html); }
function tutPop(html, head){
  if(!S.tut || !html) return;
  const show = ()=>{
    if(mode!=='battle' || !S.tut) return;
    if(!$('#modal').hidden){ later(.4, show); return; }
    showModal(`<h2>チュートリアル${head?'　<small style="font-size:13px;opacity:.7">'+head+'</small>':''}</h2><p style="line-height:1.8">${html}</p><div class="opts"><button class="btn primary" data-m="close">わかった</button></div>`);
  };
  later(.5, show);
}
function tutWave(w){
  const m = {1:'まずは <b>ゆうしゃの ボタン</b>（いちばん左）を おして 攻撃！ 戦士は 斬り上げで 敵を まとめて 打ち上げる。',
    2:'敵を たおすと ときどき <b>おきあがって 仲間に なる</b>。この ウェーブで だれかが おきあがるかも…',
    3:'打ち上げた 敵は すぐ 落ちる。<b>落ちる前に 追撃</b>すると 1.5倍！ ゆうしゃの <b>ひらめき技</b>を つかうと 新しい 技を ひらめく ことも。',
    4:'ゆうしゃが 攻撃や ひらめき技を つかうと、となりの <b>職業技ボタン</b>に 力が たまる。満タンで 光ったら おして <b>職業技</b>！ また 仲間が おきあがるかも…',
    5:'仲間の 必殺技は ゲージが たまると 自動で 出る。ゆうしゃは 攻撃と ひらめき技を 交互に つかうと <b>連携</b>で 威力が 上がる。',
    6:'ボスだ！ 赤い「！」が 出た 敵は もうすぐ 攻撃してくる。打ち上げや 気絶で 止めよう。'};
  tip('<b>チュートリアル</b>　'+(m[w]||''));
  tutPop(m[w]||'', w>WAVES ? 'ボス戦' : 'ウェーブ '+w);
  if(w===2 || w===4) S.tutRecruit = true;
}
$('#panel').addEventListener('change', ev=>{
  const a = ev.target.dataset.act;
  if(a==='autoSell'){ P.autoSell = ev.target.checked; save(); }
  else if(a==='shake'){ P.opt.shake = ev.target.checked; save(); }
  else if(a==='fps30'){ P.opt.fps30 = ev.target.checked; save(); }
  else if(a==='cam'){ P.opt.cam = ev.target.checked; save(); }
  else if(a==='allyCtrl'){ P.opt.allyCtrl = ev.target.checked; save(); S.solo = soloMode(); applyLayout(); renderSkillButtons(); }
  else if(a==='knock'){ P.opt.knock = ev.target.checked; save(); }
  else if(a==='meter'){ P.opt.meter = ev.target.checked; save(); }
  else if(a==='se' || a==='vib' || a==='bgm'){ P.opt[a] = ev.target.checked; save(); if(a==='vib' && P.opt.vib) buzz(15); }
});
setInterval(()=>{ if(mode==='battle') save(); }, 30000);
addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) saveNow(); });

// ===== はじまり =====
loadSave(); applyOpt(); refreshHS(); syncHero(); jobUnlockCheck(true); checkOffline(); toCamp(); storageNotice(); requestAnimationFrame(loop);
window.__pq = { get S(){return S;}, get P(){return P;}, get HS(){return HS;}, attack, trySpecial, startStage, toCamp, CFG, CH, ACT, living, genItem, refreshHS, syncHero, renderCamp };
