// ===== 武器の 系統（通常攻撃と つかえる ひらめき技が 武器で きまる） =====
const WT = ['sword','dagger','fist','staff','bow','spear','katana'];
const WT_N = {sword:'剣', dagger:'短剣', fist:'拳', staff:'杖', bow:'弓', spear:'槍', katana:'刀'};
const WNAMES = {
  sword: ['ブロンズソード','アイアンソード','スチールソード','ミスリルソード','ルーンブレード','ドラゴンソード'],
  dagger:['ナイフ','アイアンダガー','スチールダガー','ミスリルダガー','ルーンダガー','ドラゴンキラー'],
  fist:  ['レザーナックル','アイアンナックル','てっこう','ミスリルクロー','ルーンナックル','ドラゴンクロー'],
  staff: ['かしのつえ','まどうしのつえ','ルーンスタッフ','ミスリルロッド','けんじゃのつえ','ドラゴンロッド'],
  bow:   ['ショートボウ','ロングボウ','スチールボウ','ミスリルボウ','ルーンボウ','ドラゴンボウ'],
  spear: ['やり','アイアンランス','スチールランス','ミスリルスピア','ルーンランス','ドラゴンランス'],
  katana:['なまくら刀','どうたぬき','むらさめ','ミスリルの刀','ルーンの刀','りゅうおうの刀'],
};
const WT_PART = {sword:'つるぎ', dagger:'ダガー', fist:'こぶし', staff:'つえ', bow:'ゆみ', spear:'やり', katana:'かたな'};
const UNIQ_WT = {gouka:'sword', ryugoroshi:'sword', raikou:'dagger'};
// ジョブごとの 持てる 武器（先頭が 素手の ときの 扱い）。◎専用の 攻撃に なる 武器
const JOB_WEAPONS = {
  senshi:['sword','spear'], budou:['fist'], mahou:['staff'], touzoku:['dagger','bow'], souryo:['staff','fist'], kariudo:['bow','dagger'],
  mahouken:['sword','staff'], ryuukishi:['spear','sword'], shoukan:['staff'], jikuu:['staff'], ginyuu:['dagger','bow'], akindo:['dagger','bow'],
  asobi:WT, kenja:['staff','sword'], mamono:['dagger','fist'], ninja:['dagger','katana'], odori:['dagger','fist'], samurai:['katana'],
  abyssk:['sword','katana'], suppin:WT,
};
const JOB_ATK_SPECIAL = {souryo:'staff', mahouken:'sword', ryuukishi:'spear', shoukan:'staff', jikuu:'staff', ginyuu:'dagger',
  akindo:'dagger', kenja:'staff', mamono:'dagger', ninja:'dagger', odori:'dagger', abyssk:'sword'};
// 武器ごとの 基本の 通常攻撃（その ジョブの 攻撃を つかう）
const WT_ATK = {sword:'senshi', dagger:'touzoku', fist:'budou', staff:'mahou', bow:'kariudo', spear:'spear', katana:'samurai'};
const ATK_SPEAR = {role:'突き', roleD:'一直線に 並んだ 敵を まとめて 貫く。先頭の 敵を 浮かせる', cd:0.75};
const jobWeapons = (j=P.job) => JOB_WEAPONS[j] || ['sword'];
const canWield = (it, j=P.job) => !it || it.slot !== 'weapon' || jobWeapons(j).includes(it.wt || 'sword');
const curWT = () => { const w = P.equip.weapon; return w && canWield(w) ? (w.wt||'sword') : jobWeapons()[0]; };
// いまの 通常攻撃（ジョブの 専用攻撃 か 武器の 攻撃）
function atkId(){
  if(P.job === 'asobi') return 'asobi';
  const wt = curWT();
  if(JOB_ATK_SPECIAL[P.job] === wt) return P.job;
  return WT_ATK[wt];
}
const atkInfo = (id = atkId()) => id === 'spear' ? ATK_SPEAR : JOBS[id];
// ひらめき技の 系統
const SK_TREE_WT = {'剣':'sword', '体術':'fist', '魔法':'staff', '弓':'bow', '短剣':'dagger', '槍':'spear', '刀':'katana'};
const skillWT = id => SK[id] ? (SK[id].wt || SK_TREE_WT[SK[id].tree]) : null;
const skillUsable = id => !!id && skillWT(id) === curWT();
const weaponNote = j => jobWeapons(j).map(w => WT_N[w] + (JOB_ATK_SPECIAL[j]===w ? '◎' : '')).join('・');
// 名前から 系統を 決める（前の セーブの 武器）
function guessWT(it){
  if(it.a && ARTI[it.a]) return ARTI[it.a].wt;
  if(it.u && UNIQ_WT[it.u]) return UNIQ_WT[it.u];
  for(const w of WT) if(WNAMES[w].some(n => it.name.includes(n))) return w;
  return 'sword';
}
// ジョブを かえたとき: 持てない 武器は はずして、持てる中で いちばん 強い 武器を 持つ。ひらめき技の セットは ジョブごとに おぼえる
function onJobChange(oldJob, newJob){
  P.jobSlots = P.jobSlots || {};
  P.jobSlots[oldJob] = [...P.slots];
  if(P.jobSlots[newJob]) P.slots = [...P.jobSlots[newJob]];
  const w = P.equip.weapon;
  if(w && !canWield(w, newJob)){ P.equip.weapon = null; P.inv.push(w); }
  const best = P.inv.filter(it => it.slot==='weapon' && canWield(it, newJob)).sort((a,b)=>itemScore(b)-itemScore(a))[0];
  if(best && itemScore(best) > itemScore(P.equip.weapon)){ if(P.equip.weapon) P.inv.push(P.equip.weapon); P.equip.weapon = best; P.inv = P.inv.filter(x=>x!==best); }
}
