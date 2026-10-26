// ===== 初代と 同じ くらしの 機能: 留守のあいだの成果・お知らせ・セーブの まもり・Xで シェア =====
// --- 小さな お知らせ（トースト） ---
let _toastT = 0;
function toast(html){
  let c = document.getElementById('toast');
  if(!c){ c = document.createElement('div'); c.id = 'toast'; document.body.appendChild(c); }
  c.innerHTML = html; c.hidden = false; clearTimeout(_toastT); _toastT = setTimeout(()=>{ c.hidden = true; }, 2200);
}
// モーダルが あいていない ときに 出す
function whenFree(fn){ const t = setInterval(()=>{ if($('#modal').hidden && mode==='camp' && !document.getElementById('ending')?.className){ clearInterval(t); fn(); } }, 600); }

// --- タブの NEW 印 ---
function setNew(tab){ P.newMark = P.newMark || {}; if(P.newMark[tab]) return; P.newMark[tab] = true; if(mode==='camp') renderCamp(); }
function tabBadges(){
  P.newMark = P.newMark || {};
  if(mode==='camp' && P.newMark[TAB]) delete P.newMark[TAB];   // ひらいたら 消える
  for(const k of ['ally','gear','job','card','town']){
    const b = $(`#tabs [data-tab="${k}"]`); if(!b) continue;
    let bd = b.querySelector('.nb.nw'); const on = !!P.newMark[k];
    if(on && !bd){ bd = document.createElement('span'); bd.className = 'nb nw'; bd.textContent = 'NEW'; b.appendChild(bd); }
    else if(!on && bd) bd.remove();
  }
}
// ジョブの 解放を 知らせる
function jobUnlockCheck(silent){
  P.jobSeen = P.jobSeen || null;
  const open = JOB_KEYS.filter(k=>JOBS[k].unlock && jobOpen(k));
  if(!P.jobSeen){ P.jobSeen = {}; open.forEach(k=>P.jobSeen[k]=1); save(); return; }   // はじめは いまの 状態を 覚えるだけ
  const fresh = open.filter(k=>!P.jobSeen[k]); if(!fresh.length) return;
  fresh.forEach(k=>P.jobSeen[k]=1); save(); setNew('job');
  if(silent) return;
  whenFree(()=>{ try{ SFX.spark(); }catch(_){}
    showModal(`<h2 class="r2">新しい ジョブが 解放された！</h2><ul style="line-height:1.8">${fresh.map(k=>`<li><b>${JOBS[k].n}</b> ― ${JOBS[k].d}</li>`).join('')}</ul><p class="hint">ジョブタブで つける。</p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`); });
}

// --- 留守のあいだの成果（とじている あいだも 仲間が 戦う。最大 8時間） ---
const OFFLINE_MAX_H = 8, OFFLINE_KPH = 600;
function offlineStage(){
  const ls = P.lastStage; if(ls && (P.clear[ls.st]||0) >= ls.rd) return ls;   // さいごに クリアした ところ
  let best = null; for(let st=0; st<6; st++) if(P.clear[st]) { const rd = P.clear[st]; if(!best || lvOf(st,rd) > lvOf(best.st,best.rd)) best = {st, rd}; }
  return best;
}
function grantOffline(ms){
  if(ms < 60000 || !(P.clear[0] >= 1)) return null;
  const sg = offlineStage(); if(!sg) return null;
  refreshHS();
  const h = Math.min(OFFLINE_MAX_H, ms/3600000), L = lvOf(sg.st, sg.rd), kills = Math.floor(h*OFFLINE_KPH); if(kills < 1) return null;
  const exp = Math.round(kills * eExp(L) * (1+HS.exp/100)), gold = Math.round(kills * eGold(L) * (1+HS.gold/100));
  const mk = ST_MAT[sg.st], mats = Math.floor(kills * CFG.matRate * .5), boxes = Math.floor(kills * .003);
  P.gold += gold; P.mats[mk] = (P.mats[mk]||0) + mats; P.boxes = (P.boxes||0) + boxes;
  const lv0 = P.hero.lv; P.hero.exp += exp; while(P.hero.exp >= needExp(P.hero.lv)){ P.hero.exp -= needExp(P.hero.lv); P.hero.lv++; }
  allyGainExp(exp);
  P.stats.kills = (P.stats.kills||0) + kills;
  refreshHS();
  return {h, sg, kills, exp, gold, mk, mats, boxes, lvUp: P.hero.lv - lv0};
}
function showOffline(r){
  const hh = Math.floor(r.h), mm = Math.round((r.h-hh)*60);
  try{ SFX.spark(); }catch(_){}
  showModal(`<h2 class="r2" style="text-align:center">おかえりなさい！</h2>
    <p style="text-align:center">${hh ? hh+'時間' : ''}${mm}分の あいだ、仲間たちが ${STAGES[r.sg.st].n}（${r.sg.rd}周目）で がんばっていた。</p>
    <div class="kv"><span><i>たおした 魔物</i>${fmt(r.kills)}体</span><span><i>経験値</i>+${fmt(r.exp)}</span>
      <span><i>ゴールド</i>+${fmt(r.gold)}</span><span><i>${MATS[r.mk].n}</i>+${fmt(r.mats)}</span>
      ${r.boxes ? `<span><i>青箱</i>+${r.boxes}</span>` : ''}${r.lvUp ? `<span><i>ゆうしゃ</i>Lv +${r.lvUp}</span>` : ''}</div>
    <p class="hint" style="text-align:center">ゲームを とじている あいだも、最大 ${OFFLINE_MAX_H}時間ぶん 成果が たまる。</p>
    <div class="opts"><button class="btn primary" data-m="close">うけとる</button></div>`);
  if(mode==='camp'){ syncHero(); buildParty(); renderButtons(); renderCamp(); }
}
function checkOffline(){
  const now = Date.now(), last = P.lastActive || 0; P.lastActive = now;
  if(!last){ save(); return; }
  const r = grantOffline(now - last);
  save();
  if(r) whenFree(()=>showOffline(r));
}

// --- セーブの まもり ---
let _saveWarned = false, _lastSaveAt = 0;
function saveFailed(){ if(_saveWarned) return; _saveWarned = true; toast('<span style="color:#ffb0a6">セーブに 失敗した。設定の「書き出す」で バックアップしてね</span>'); }
function manualSave(){
  let ok = true;
  try{ saveNow(); ok = LS.get(SAVE_KEY) === JSON.stringify(P); }catch(e){ ok = false; }
  if(ok){ _lastSaveAt = Date.now(); toast('セーブした（'+new Date().toLocaleTimeString('ja-JP')+'）'); }
  else toast('<span style="color:#ffb0a6">セーブできなかった。「書き出す」で バックアップしてね</span>');
  if(mode==='camp') renderCamp();
}
const lastSaveText = () => (typeof lastSave!=='undefined' && lastSave) ? new Date(lastSave).toLocaleTimeString('ja-JP') : '―';
const BACKUP_AT = [{k:'r1', ok:()=>(P.clear[5]||0)>=1, t:'1周目の 魔界を クリアした'}, {k:'r3', ok:()=>(P.clear[5]||0)>=3, t:'3周目の 魔界を クリアした'},
  {k:'r5', ok:()=>(P.clear[5]||0)>=5, t:'5周目の 魔界を クリアした'}, {k:'r10', ok:()=>(P.clear[5]||0)>=10, t:'魔王を たおした'},
  {k:'t50', ok:()=>towerBest()>=50, t:'塔の 50階に とどいた'}, {k:'r20', ok:()=>(P.clear[5]||0)>=20, t:'20周目の 魔界を クリアした'}];
function backupTick(){
  if(mode!=='camp' || !$('#modal').hidden || P.debug) return;
  P.backupAsked = P.backupAsked || {};
  const hit = BACKUP_AT.filter(b=>b.ok() && !P.backupAsked[b.k]); if(!hit.length) return;
  hit.forEach(b=>P.backupAsked[b.k] = true); save();
  const b = hit[hit.length-1];
  showModal(`<h2 class="r2">セーブを まもろう</h2><p>${b.t}！ この ぼうけんの 記録は、この ブラウザの 中だけに ある。ブラウザの データを 消したり、べつの 端末で 遊んだりすると 続きから 遊べない。</p>
    <p>設定の「書き出す」で 文字に して とっておくと 安心。</p>
    <div class="opts"><button class="btn" data-m="close">あとで</button><button class="btn primary" data-m="backupNow">書き出す</button></div>`);
}
$('#modal').addEventListener('click', ev=>{ const b = ev.target.closest('[data-m="backupNow"]'); if(!b) return;
  hideModal(); TAB = 'cfg'; if(typeof CFGVIEW!=='undefined') CFGVIEW = 'cfg'; renderCamp(); const x = document.querySelector('[data-act="export"]'); if(x){ x.click(); x.scrollIntoView({block:'center'}); } });

// --- 記録を Xで シェア ---
const SITE_URL = 'https://u1908inter.github.io/pikon-quest2/';
function shareText(kind){
  const base = `ゆうしゃ Lv${fmt(P.hero.lv)}・仲間 ${(P.allies||[]).length}体`;
  if(kind==='ending') return `ピコーン・クエスト2で 魔王を たおした！（${base}）`;
  if(kind==='trueClear') return `ピコーン・クエスト2を 完全制覇した！（無限の塔 1000階 とっぱ／${base}／称号「${titleOf()}」）`;
  const rd = P.clear[5]||0, tw = towerBest();
  return rd ? `ピコーン・クエスト2で ${rd}周目の 魔界を クリア！（${base}${tw ? `／無限の塔 ${tw}階${titleOf()?`・称号「${titleOf()}」`:''}` : ''}）` : `ピコーン・クエスト2を 遊んでいる！（${base}）`;
}
function shareX(kind){
  const u = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText(kind)) + '&url=' + encodeURIComponent(SITE_URL) + '&hashtags=' + encodeURIComponent('ピコーンクエスト2');
  try{ window.open(u, '_blank', 'noopener'); }catch(e){}
}
document.addEventListener('click', ev=>{ const b = ev.target.closest('[data-share]'); if(b) shareX(b.dataset.share); });

// 保存できない 画面（アプリの プレビューなど）では 最初に 知らせる
function storageNotice(){
  if(LS.ok()) return;
  _saveWarned = true;   // 失敗の トーストは 出さない
  whenFree(()=>showModal(`<h2 class="r3">この 画面では セーブ できない</h2><p>いま ひらいている 画面（アプリの プレビューなど）では、ブラウザの 保存先が つかえない。遊べるが、とじると 進みが 消える。</p><p class="hint">続きから 遊ぶには、ファイルを ダウンロードして Chrome などの ブラウザで ひらいてね。</p><div class="opts"><button class="btn primary" data-m="close">わかった</button></div>`));
}
// 仲間も 操作できるように なったとき 1回だけ 説明する
function ctrlIntro(){
  if(!allyCtrlOpen() || (P.seen||{}).ctrlIntro) return;
  P.seen.ctrlIntro = 1; save();
  const pages = [
    ['仲間も 操作できるように なった！', '設定タブの「仲間も 操作する」が オンの とき、戦闘画面に 仲間の ボタンが ならぶ。<br>・仲間の 攻撃（上の 段）<br>・必殺技1・必殺技2（ゲージが たまると 光る）<br>・ゆうしゃの ひらめき技は 1つ（Q）に なる'],
    ['仲間オート', '「仲間オート」を オンに すると、仲間は 自分で 攻撃や 必殺技を つかう。ゆうしゃだけ 押して、仲間は まかせる ことも できる。<br>もとの「ゆうしゃだけ 操作」に もどすには、設定で「仲間も 操作する」を オフ。'],
    ['かくし連携', '決まった 順番で すばやく（2.5秒 以内に）ボタンを 押すと <b>かくし連携</b>が 出る。<br>見つけた 連携は 仲間タブの「かくし連携ノート」に のこる。まだ 見つけて いない ものは 最初の 1人だけ ヒントが 出る。'],
  ];
  let i = 0;
  const show = () => showModal(`<h2 class="r4">${pages[i][0]}</h2><p style="line-height:1.9">${pages[i][1]}</p><p class="hint">${i+1} / ${pages.length}</p><div class="opts"><button class="btn primary" data-m="ctrlNext">${i < pages.length-1 ? 'つぎへ' : 'わかった'}</button></div>`);
  _ctrlNext = () => { i++; if(i < pages.length) show(); else { hideModal(); _ctrlNext = null; } };
  whenFree(show);
}
let _ctrlNext = null;
$('#modal').addEventListener('click', ev=>{ if(ev.target.closest('[data-m="ctrlNext"]') && _ctrlNext) _ctrlNext(); });
// --- アクセス解析（公開版だけ。セーブごとに 1回ずつ 送る） ---
function track(k, title){
  try{
    const gc = window.goatcounter; if(!gc || typeof gc.count !== 'function' || P.debug) return;
    P.trk = P.trk || {}; if(P.trk[k]) return; P.trk[k] = 1;
    const h = location.hostname, site = h.includes('github.io') ? '' : h.includes('plicy') ? 'plicy-' : 'x-';
    gc.count({path:'pq2-' + site + k, title:'PQ2 ' + title, event:true});
  }catch(e){}
}
// --- うごかす ---
setInterval(()=>{ if(!document.hidden) P.lastActive = Date.now(); if(mode==='camp'){ backupTick(); } }, 5000);
document.addEventListener('visibilitychange', ()=>{ if(document.hidden){ P.lastActive = Date.now(); saveNow(); } else checkOffline(); });
