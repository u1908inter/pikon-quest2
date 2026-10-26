// ===== デバッグ: エンドコンテンツから 試す（いまの セーブは 退避して あとで もどせる） =====
const DBG_BAK = SAVE_KEY + '-bak';
function debugSave(R){
  const L = lvOf(5, R), hl = Math.min(999, 25*R);
  const D = freshSave();
  D.debug = R; D.hero.lv = hl; D.gold = 10000000; D.shards = 999; D.uid = 0;
  D.clear = [R,R,R,R,R,R]; D.sel = {st:0, rd:Math.min(MAX_ROUND, R+1)};
  D.stats = {kills:50000, clears:R*6, runs:R*8};
  for(const k of JOB_KEYS) D.jobs[k] = {jp: JOB_T[JOB_MAX-1]};
  for(const k of Object.keys(MATS)) D.mats[k] = 999;
  for(const k of Object.keys(CARDS)){ D.cards[k] = 3; D.album[k] = true; }
  for(const k of Object.keys(FAC)) D.fac[k] = FAC[k].max;
  D.craft = {m:999};
  for(const id of Object.keys(SK)) D.skills[id] = {m:ST_T[ST_T.length-1]};
  for(const u of Object.keys(UNIQ)) D.extracted[u] = true;
  D.seen = Object.assign({}, P.seen||{}, {airTip:1, allyCtrl:1});
  D.opt = Object.assign({}, P.opt||{}, {allyAuto:true});
  // 一時的に P を さしかえて 装備・仲間を つくる
  const keep = P; P = D;
  try{
    const mk = (opt, ref) => { const it = genItem(L, true, true, opt); it.id = ++P.uid; it.ref = ref; refName(it); if(!Array.isArray(it.cards)) it.cards = []; return it; };
    for(const wt of WT) P.inv.push(mk({rar:4, slot:'weapon', wt}, 7));
    for(const sl of SLOTS.filter(s=>s!=='weapon')) P.inv.push(mk({rar:4, slot:sl}, 7));
    for(const u of Object.keys(UNIQ)) P.inv.push(mk({rar:3, u}, 0));
    for(const a of Object.keys(ARTI)){ P.inv.push(mk({rar:5, a}, 7)); P.artFound[a] = 1; }   // 神器も 7本
    for(const k of EQ){ const sl = k==='acc2' ? 'acc' : k; let best = null; for(let n=0;n<12;n++){ const it = mk(k==='weapon' ? {rar:4, slot:'weapon', wt:'sword'} : {rar:4, slot:sl}, 7); if(!best || itemScore(it) > itemScore(best)) best = it; } P.equip[k] = best; }   // 12本 つくって いちばん 強いもの
    // 仲間: 種族ごとに いちばん 上の 種
    for(const fam of Object.keys(FAM)){
      const sp = Object.keys(EDEF).filter(k=>EDEF[k].fam===fam && !EDEF[k].special).sort((a,b)=>(RANK[b]||0)-(RANK[a]||0))[0]; if(!sp) continue;
      const al = newAlly(sp, L); al.maxLv = 999; al.lv = Math.min(999, hl); al.plus = 30; P.allies.push(al);
    }
    P.party = [...P.allies].sort((a,b)=>allyPow(b)-allyPow(a)).slice(0,3).map(a=>a.id);
    // アビリティを 枠に つける・抽出した 力を つける・スキルレベルを ふる
    const used = new Set();
    for(const k of slotKeys()){ const o = msOptions(slotCat(k)).find(o=>!used.has(o.v)); if(o){ P.mslots[k] = o.v; used.add(o.v); } }
    P.pslots = Object.keys(UNIQ).slice(0, powCount());
    let pts = Math.floor(hl/3);
    for(const wt of ['sword', ...WT.filter(w=>w!=='sword')]){ P.wtree[wt] = {};
      for(const nd of wpNodes(wt)){ const r = Math.min(WP_MAX, pts); if(r<=0) break; P.wtree[wt][nd.k] = r; pts -= r; } }
  } finally { P = keep; }
  return D;
}
function debugStart(R){
  try{
    if(!LS.ok()){ P = Object.assign(freshSave(), debugSave(R)); refreshHS(); syncHero(); hideModal(); toCamp(); return; }   // 保存できない 画面: その場で 切りかえ（元には もどせない）
    if(!P.debug) LS.set(DBG_BAK, JSON.stringify(P));   // ふつうの セーブだけ 退避
    LS.set(SAVE_KEY, JSON.stringify(debugSave(R)));
  }catch(e){ alert('失敗: '+e.message); return; }
  _svT && clearTimeout(_svT); _svT = 0; window._noSave = true;   // 再読みこみまでに 上書きしない
  location.reload();
}
function debugRestore(){
  const raw = LS.get(DBG_BAK); if(!raw) return;
  LS.set(SAVE_KEY, raw); LS.del(DBG_BAK);
  _svT && clearTimeout(_svT); _svT = 0; window._noSave = true;
  location.reload();
}
const DEBUG_MENU = __DEBUG_MENU__;   // 公開するときは false に する（そのときは URLに ?debug を つけたときだけ 出る）
const debugOn = () => DEBUG_MENU || /debug/.test(location.search + location.hash) || !!P.debug || !!LS.get(DBG_BAK);   // URLに ?debug を つけたときだけ 出す
function panelDebug(){
  if(!debugOn()) return '';
  const bak = !!LS.get(DBG_BAK);
  return `<h3>🛠 デバッグ</h3>
    ${P.debug ? `<p class="hint r3">いまは デバッグ用の セーブ（${P.debug}周目クリア済み）で 遊んでいる。</p>` : ''}
    <p class="hint">エンドコンテンツから 試す：全ステージ クリア済み・全ジョブ マスター・全ひらめき技・最大の 施設・強い 装備と 仲間 つき。いまの セーブは 退避され、あとで もどせる。</p>
    <div class="row" style="flex-wrap:wrap">${[5,10,15,20,30].map(r=>`<button class="btn sm" data-dbg="go" data-r="${r}">${r}周目クリア から</button>`).join('')}</div>
    ${P.debug ? `<label class="toggle"><span>デバッグ：パーティが ダメージを 受けない</span><input type="checkbox" data-dbgopt="dbgGod" ${P.opt.dbgGod?'checked':''}></label>` : ''}
    <div class="row" style="margin-top:6px"><button class="btn sm" data-dbg="ending">🎬 エンディングを 見る</button><button class="btn sm danger" data-dbg="maou">👿 魔王と 戦う</button></div>
    <div class="row" style="margin-top:6px;flex-wrap:wrap">${[99,299,499,999].map(f=>`<button class="btn sm" data-dbg="tower" data-f="${f}">🗼 塔 ${f}階から</button>`).join('')}</div>
    ${bak ? `<div class="row" style="margin-top:6px"><button class="btn sm primary" data-dbg="restore">元の セーブに もどす</button></div>` : ''}`;
}
document.addEventListener('click', ev=>{
  const b = ev.target.closest('[data-dbg]'); if(!b) return;
  if(b.dataset.dbg==='go') showModal(`<h2>デバッグ</h2><p>${b.dataset.r}周目クリア済みの データで はじめる？</p><p class="hint">いまの セーブは 退避される（設定 → デバッグ →「元の セーブに もどす」で もどる）。${P.debug?'<br>いまは デバッグ用の セーブなので、これは 退避せずに 上書きする。':''}</p><div class="opts"><button class="btn" data-m="close">やめる</button><button class="btn danger" data-dbg="go2" data-r="${b.dataset.r}">はじめる</button></div>`);
  else if(b.dataset.dbg==='go2') debugStart(+b.dataset.r);
  else if(b.dataset.dbg==='ending') playEnding(()=>{});
  else if(b.dataset.dbg==='tower') startTower(+b.dataset.f);
  else if(b.dataset.dbg==='maou'){ startStage(5, TOWER_RD); S.dbgBoss = true; S.waveIdx = WAVES; }   // すぐ ボス戦（10周目の 魔界＝魔王）。クリアの 記録は のこさない
  else if(b.dataset.dbg==='restore') showModal(`<h2>元の セーブに もどす？</h2><p class="hint">デバッグ用の データは 消える。</p><div class="opts"><button class="btn" data-m="close">やめる</button><button class="btn primary" data-dbg="restore2">もどす</button></div>`);
  else if(b.dataset.dbg==='restore2') debugRestore();
});
document.addEventListener('change', ev=>{ const k = ev.target.dataset && ev.target.dataset.dbgopt; if(!k) return; P.opt[k] = ev.target.checked; save(); });
