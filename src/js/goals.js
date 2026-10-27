// ===== 目標（つぎに なにを めざすか。たっせいすると ほうび） =====
const gRef = n => [...Object.values(P.equip), ...P.inv].some(it => it && (it.ref||0) >= n);
const gMasters = () => JOB_KEYS.filter(k => jobLv(k) >= JOB_MAX).length;
const gJobAny = n => JOB_KEYS.some(k => jobLv(k) >= n);
const gClear = (st, rd) => (P.clear[st]||0) >= rd;
const gNum = (cur, need) => `${fmt(Math.min(cur, need))}/${fmt(need)}`;
// ネタバレを ふせる: まだ 見ていない ものは ？？？
const vStage = st => (st===0 || (P.clear[st-1]||0) >= 1 || (P.clear[st]||0) >= 1) ? STAGES[st].n : '？？？';
const vTower = () => towerOpen() ? '無限の塔' : '？？？';
const vArt = () => Object.keys(P.artFound||{}).length ? '神器' : '？？？';
const mkClear = (st, rd, extra='') => [`c${st}_${rd}`, () => `${rd>1?rd+'周目の ':''}${vStage(st)}を クリアする${typeof extra==='function'?extra():extra}`, () => gClear(st, rd)];
const mkTower = n => [`t${n}`, () => `${vTower()}で ${n}階に とどく`, () => towerPeak() >= n, () => gNum(towerPeak(), n)];
const v1000 = (s, alt='？？？') => towerPeak() >= 1000 ? s : alt;
const GOALS = [
  mkClear(0, 1, '（チュートリアル）'),
  ['spark1', 'ひらめき技を 1つ ひらめく', () => Object.keys(P.skills).some(k => SK[k] && SK[k].parent)],
  ['party', '仲間を パーティに 入れる', () => P.party.some(Boolean)],
  mkClear(1, 1),
  ['slots2', 'ひらめき技を 2つ セットする（スキルタブ）', () => P.slots.filter(Boolean).length >= 2],
  ['job5', 'ジョブを Lv5 に する', () => gJobAny(5)],
  ['ref3', '装備を +3 まで 精錬する（町の 精錬所）', () => gRef(3)],
  mkClear(3, 1),
  ['job2', 'べつの ジョブに ついてみる（ジョブタブ）', () => JOB_KEYS.filter(k => (P.jobs[k]||{}).jp > 0).length >= 2],
  mkClear(5, 1, () => (P.clear[4]||0) >= 1 ? '（1周目 クリア）' : ''),
  ['ally10', '仲間を 10体 あつめる', () => (P.stats.recruits||0) >= 10, () => gNum(P.stats.recruits||0, 10)],
  ['fuse', '仲間を 合体させる（仲間タブ）', () => P.allies.some(a => (a.plus||0) > 0)],
  ['card5', 'カードを 5まい 登録する', () => albumCount() >= 5, () => gNum(albumCount(), 5)],
  ['extract', 'ユニーク装備の 力を 抽出する', () => Object.keys(P.extracted||{}).length >= 1],
  mkClear(5, 3),
  ['master1', 'ジョブを 1つ マスターする', () => gMasters() >= 1],
  mkClear(5, CTRL_ROUND),
  ['combo3', () => allyCtrlOpen() ? 'かくし連携を 3つ 見つける（仲間も 操作）' : '？？？を 3つ 見つける', () => comboFound() >= 3, () => gNum(comboFound(), 3)],
  ['ref7', '装備を +7 まで 精錬する', () => gRef(7)],
  ['card20', 'カードを 20まい 登録する', () => albumCount() >= 20, () => gNum(albumCount(), 20)],
  mkClear(5, REF11_RD),
  ['master6', 'ジョブを 6つ マスターする', () => gMasters() >= 6, () => gNum(gMasters(), 6)],
  mkClear(5, TOWER_RD, () => (P.clear[5]||0) >= TOWER_RD-1 ? '（魔王を たおす）' : ''),
  mkTower(30),
  ['art1', () => `${vArt()}を 手に入れる`, () => Object.keys(P.artFound||{}).length >= 1],
  mkTower(50),
  mkClear(5, 15),
  ['ref11', () => refCap() >= 11 ? '装備を +11 まで 精錬する' : '装備を ？？？まで 精錬する', () => gRef(11)],
  mkTower(100),
  ['suppin', () => jobOpen('suppin') ? 'すっぴんに なる' : '？？？に なる（12の ジョブを マスター）', () => jobOpen('suppin')],
  ['cardAll', 'カード帖を コンプリートする', () => albumCount() >= Object.keys(CARDS).length, () => gNum(albumCount(), Object.keys(CARDS).length)],
  ['art7', () => `${vArt()}を 7本 そろえる`, () => artAll(), () => gNum(Object.keys(P.artFound||{}).length, 7)],
  mkClear(5, 20),
  mkTower(200),
  ['comboAll', () => allyCtrlOpen() ? 'かくし連携を すべて 見つける' : '？？？を すべて 見つける', () => comboFound() >= COMBOS.length, () => gNum(comboFound(), COMBOS.length)],
  mkTower(500),
  mkTower(1000),
  ['kiwami1', () => v1000('ひらめき技を 1つ 極める', '？？？'), () => Object.values(P.skills).some(s => stageOf(s.m) >= 5)],
  ['artUp3', () => v1000('神器を ✦3まで 強化する', '？？？'), () => Object.keys(ARTI).some(k => artLv(k) >= 3)],
  mkTower(1500),
  mkTower(2000),
  ['kiwami10', () => v1000('ひらめき技を 10個 極める', '？？？'), () => Object.values(P.skills).filter(s => stageOf(s.m) >= 5).length >= 10, () => gNum(Object.values(P.skills).filter(s => stageOf(s.m) >= 5).length, 10)],
  ['artUpMax', () => v1000('神器を ✦10まで 強化する', '？？？'), () => Object.keys(ARTI).some(k => artLv(k) >= ART_MAX)],
  mkTower(3000),
  mkTower(5000),
];
const goalText = g => typeof g[1] === 'function' ? g[1]() : g[1];
function goalReward(i){ const L = maxLReached(); return {gold: Math.round(eGold(L) * 40 * (1 + i/4)), boxes: 1 + Math.floor(i/8)}; }
const goalsDone = () => GOALS.filter(g => (P.goals||{})[g[0]]).length;
function goalsShown(){ P.goals = P.goals || {}; return GOALS.map((g,i)=>({g,i})).filter(o => !P.goals[o.g[0]]).slice(0, 3); }
const goalsReady = () => goalsShown().filter(o => o.g[2]()).length;
function panelGoals(){
  const list = goalsShown(), done = goalsDone();
  const head = `<h3>目標（${done}／${GOALS.length}）</h3><div class="row" style="margin:-4px 0 6px"><button class="btn sm" data-act="goalList">目標の 一覧を 見る</button></div>`;
  if(!list.length) return head + `<p class="hint">すべての 目標を たっせいした！</p>`;
  return head + `<div class="list">` + list.map(({g,i}) => {
    const ok = g[2](), rw = goalReward(i), prog = !ok && g[3] ? `<span class="hint">${g[3]()}</span>` : '';
    return `<div class="li ${ok?'':'locked'}" style="cursor:default;align-items:center"><div class="body"><div class="t"><span>${ok?'<span class="r2">★</span> ':''}${goalText(g)}</span>${prog}</div>
      <div class="d">ほうび：${fmt(rw.gold)}G ＋ 青箱 ${rw.boxes}こ</div></div>${ok?`<button class="btn sm primary" data-act="goalGet" data-k="${g[0]}" style="flex:none">うけとる</button>`:''}</div>`;
  }).join('') + `</div>`;
}
function showGoalList(){
  P.goals = P.goals || {};
  const rows = GOALS.map((g,i) => {
    const got = P.goals[g[0]], ok = !got && g[2](), rw = goalReward(i), prog = !got && !ok && g[3] ? `　${g[3]()}` : '';
    const mark = got ? '<span class="r4">✓</span>' : ok ? '<span class="r2">★</span>' : '<span class="hint">・</span>';
    return `<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--line)">
      <span style="flex:none;width:1.2em;text-align:center">${mark}</span>
      <span style="flex:1;${got?'color:var(--dim)':''}">${goalText(g)}<span class="hint">${prog}</span><br><span class="hint">ほうび：${fmt(rw.gold)}G ＋ 青箱 ${rw.boxes}こ</span></span>
      ${ok?`<button class="btn sm primary" data-m="goalGetM" data-k="${g[0]}" style="flex:none">うけとる</button>`:''}</div>`;
  }).join('');
  showModal(`<h2>目標の 一覧（${goalsDone()}／${GOALS.length}）</h2><p class="hint">✓ うけとりずみ ／ ★ たっせい ／ ・ まだ</p>
    <div style="max-height:55vh;overflow-y:auto;font-size:13px">${rows}</div>
    <div class="opts"><button class="btn primary" data-m="close">とじる</button></div>`);
}
function claimGoal(k){
  const i = GOALS.findIndex(g => g[0]===k); if(i < 0 || (P.goals||{})[k] || !GOALS[i][2]()) return null;
  const rw = goalReward(i); P.goals[k] = true; P.gold += rw.gold; P.boxes = (P.boxes||0) + rw.boxes;
  try{ SFX.spark(); }catch(_){}
  save(); return rw;
}
// 出撃から もどったとき、新しく たっせいした 目標を 結果に 出す
function goalNews(){
  P.goalSeen = P.goalSeen || {}; const out = [];
  for(const {g} of goalsShown()) if(!P.goalSeen[g[0]] && g[2]()){ P.goalSeen[g[0]] = true; out.push(goalText(g)); }
  return out;
}
$('#panel').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-act]'); if(!b) return;
  if(b.dataset.act==='goalList') showGoalList();
  else if(b.dataset.act==='goalGet'){ const rw = claimGoal(b.dataset.k); if(rw){ renderCamp(); showModal(`<h2>目標 たっせい！</h2><p>${fmt(rw.gold)}G と 青箱 ${rw.boxes}こ を 手に入れた。</p><p class="hint">青箱は カードタブで あけられる。</p><div class="opts"><button class="btn primary" data-m="close">OK</button></div>`); } }
});
$('#modal').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-m="goalGetM"]'); if(!b) return;
  if(claimGoal(b.dataset.k)){ renderCamp(); showGoalList(); }
});
