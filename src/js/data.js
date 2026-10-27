// ===== 共通の小物 =====
const $ = s => document.querySelector(s);
const rand = (a,b) => a + Math.random()*(b-a);
const ri = (a,b) => Math.floor(rand(a, b+1));
const pick = a => a[Math.floor(Math.random()*a.length)];
const lerp=(a,b,p)=>a+(b-a)*p, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const easeOut=p=>1-(1-p)*(1-p), easeIn=p=>p*p;
const add = (o,k,v) => o[k] = (o[k]||0) + v;
const fmt = v => { v = Math.round(v); return v >= 1e8 ? (v/1e8).toFixed(1)+'億' : v >= 1e4 ? (v/1e4).toFixed(v>=1e5?0:1)+'万' : String(v); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ===== 色ちがいの敵（本作と同じ考え方でパレットだけ変える） =====
const VAR = (key, base, pal) => { SPR[key] = {pal: Object.assign({}, SPR[base].pal, pal), rows: SPR[base].rows}; };
const EDEF = {};
const E = (k, base, n, pal, o={}) => { if(pal) VAR(k, base, pal); else if(k!==base) VAR(k, base, {}); EDEF[k] = Object.assign({k, n, fam:base}, o); };
// 草原
E('slime','slime','スライム'); E('bat','bat','コウモリ',null,{fly:14}); E('goblin','goblin','ゴブリン');
// 森
E('f_mush','mush','まどわしキノコ',{R:'#d0a030'}); E('f_wolf','wolf','しんりんウルフ',{G:'#8a6a4a', W:'#c8b090'}); E('f_bat','bat','みどりコウモリ',{B:'#3f8a4a'},{fly:14});
// 洞窟
E('c_bat','bat','ほらあなコウモリ',{B:'#6a5640'},{fly:14}); E('skel','skel','がいこつ剣士'); E('golem','golem','いわゴーレム');
// 砂漠
E('d_slime','slime','すなスライム',{B:'#d8b060'}); E('d_goblin','goblin','さばくゴブリン',{G:'#c8a060', C:'#8a5a30'});
E('d_wolf','wolf','ジャッカル',{G:'#c89a5a', W:'#f0d8a8'}); E('d_skel','skel','ミイラ剣士',{W:'#e8dcb0', S:'#c8a060'});
// 雪山
E('s_slime','slime','こおりスライム',{B:'#a8e0ff'}); E('s_wolf','wolf','ゆきウルフ',{G:'#e8f0ff', W:'#ffffff'}); E('s_golem','golem','ひょうがゴーレム',{G:'#9ad8f0', L:'#e8f8ff'});
// 魔界
E('h_slime','slime','まかいスライム',{B:'#b83a6a'}); E('h_goblin','goblin','デビルゴブリン',{G:'#8a4ab0', C:'#3a1a3a'});
E('h_wolf','wolf','ヘルハウンド',{G:'#8a2a2a', W:'#e0803a'}); E('h_skel','skel','じごくの剣士',{W:'#e8a090', S:'#ff6a3a'});
// ボス
E('b_kslime','slime','おうごんスライム',{B:'#e8c040'}); E('b_kmush','mush','だいおうキノコ',{R:'#8a3ad8', S:'#f0d8f0'});
E('b_kgolem','golem','クリスタルゴーレム',{G:'#7ad0e8', L:'#ffffff'}); E('b_sdragon','dragon','サンドドラゴン',{R:'#c8a050', Y:'#f0e0a0'});
E('b_fdragon','dragon','フロストドラゴン',{R:'#5aa8e8', Y:'#e8f8ff'}); E('b_adragon','dragon','アビスドラゴン',{R:'#2a1440', Y:'#7ce8ff'});

const STAGES = [
  {n:'草原', en:['slime','bat','goblin'],                boss:'b_kslime',  bg:'grass'},
  {n:'森',   en:['f_mush','f_wolf','f_bat'],             boss:'b_kmush',   bg:'forest'},
  {n:'洞窟', en:['c_bat','skel','golem'],                boss:'b_kgolem',  bg:'cave'},
  {n:'砂漠', en:['d_slime','d_goblin','d_wolf','d_skel'], boss:'b_sdragon', bg:'desert'},
  {n:'雪山', en:['s_slime','s_wolf','s_golem'],          boss:'b_fdragon', bg:'snow'},
  {n:'魔界', en:['h_slime','h_goblin','h_wolf','h_skel'], boss:'b_adragon', bg:'hell'},
];
const WAVES = 5;   // 5ウェーブ＋ボス
const MAX_ROUND = 99;
// ステージの強さ: 何周目かで 6段ずつ上がる
const lvOf = (st, rd) => st + 1 + 6*(rd-1);

// ===== 調整用の定数 =====
const CFG = {
  comboTimeout: 2.0,
  chainMax: 6,         // 連携ボーナスの 上限（6連携で ×1.6）
  autoSlow: 2.2,
  autoDelay: [0.35, 0.85],
  evadeCap: 75, cutCap: 80,
  manualGauge: 0.3,    // 手動1ヒット（1体あたり）のピコーンゲージ（群れに 当たると たくさん たまるので 小さめ）
  autoGauge: 0.08,
  autoPower: 0.6,      // オート攻撃の威力（オートは打ち上げ・気絶も起こさない）
  launchH: 32,         // 打ち上げの高さ
  gAir: 600,           // 打ち上げ中の重力
  bump: 110,           // 空中で追撃を当てたときに浮き直す強さ
  bounceH: [8, 3],     // 着地後のバウンドの高さ（2回）
  downTime: 0.5,       // 着地後の ダウン（見た目だけ。攻撃は ふせげない）
  spPerPress: 10,      // 手動で1回押すとたまる必殺ゲージ
  spCut: 0.42,
  sp2Rate: 0.6,        // 仲間の 必殺技2の ゲージの たまり（必殺技1に くらべて）
  howlTime: 6,         // 群れの遠吠えの 長さ
  poisonTime: 6,       // どくどく胞子の 毒の 長さ         // 必殺技のカットインの長さ（この間は敵が止まる）
  meleeH: 40,          // 近接攻撃が とどく 高さ（地面から）。これより 高い 敵は ☁や 飛び道具・魔法で
  ceilH: 75,           // これより 上では 浮き直しが きかず すぐ 落ちてくる
  sleepTime: 3.2,
  matRate: 0.05,       // ザコ1体あたりの 素材ドロップ率
  sleepDmg: 1.3,
  maxParts: 900,
  maxFloats: 24,
  waveBase: 7, waveGrow: 2, waveMax: 40,   // 群れの数 = 7 + 2×強さ + ウェーブ番号（上限40）
  enemyInterval: [3.5, 6.5],
  firstAtk: [1.0, 4.0],  // 出てきてから 最初の 攻撃までの 時間
  lockSlow: 1.0,       // 気絶・空中の あいだ 攻撃までの 時間が すすむ 速さ（1で ふつうと 同じ）
  hpBase: 200, hpExp: 1.5,     // 敵1体の HP = hpBase × 強さ^hpExp
  atkBase: 6, atkExp: 1.45,    // 敵1体の 攻撃力
  expBase: 1.0,                // 1体の 経験値 = expBase × 強さ^1.8
  heroReach: 58,
  sporeRadius: 40,
  quakeSpeed: 260,
  sparkBase: 0.05,     // ひらめき率の もと（めやすの レベルで 戦ったとき 5%）
  recruitMul: 8,       // おきあがり: 1体ごとに 1/(系統の rate × これ)（群れで たくさん 倒すので 本作より ひかえめ）
  bossRecruit: 12,     // ボスが おきあがる 確率 1/12（外れるたび 少し 上がる）
  dropRate: 1/22,      // 1体あたりの装備ドロップ率
  invMax: 80,
};
// 強さLごとの敵の数値
// こちらの 強さ（レベル・装備）は 強さLに ほぼ 比例して 伸びるので、敵も 「Lの べき乗」で 伸ばす
const eHp   = L => CFG.hpBase  * Math.pow(L, CFG.hpExp);
const eAtk  = L => CFG.atkBase * Math.pow(L, CFG.atkExp);
const defK  = L => 25 + 12*L;   // 防御の 効き（敵が 強いほど 防御が 効きにくい）
const eExp  = L => CFG.expBase * Math.pow(L, 1.8);
const eGold = L => 2.0 * Math.pow(L, 1.5);
const waveCount = (L, w) => Math.min(CFG.waveMax, CFG.waveBase + CFG.waveGrow*L + w);
// 序盤は 敵を 少なく：上限 = 周回×5 ＋ ステージ番号（1周目 草原5 → 魔界10、2周目 10 → 15 …）。false で 元に もどる
CFG.waveCapOn = true; CFG.capPerRound = 5; CFG.capPerStage = 1;
const waveCap = (st, rd) => CFG.waveCapOn ? CFG.capPerRound*rd + CFG.capPerStage*st : 999;
// 減らした ぶん 1体あたりの 報酬・おきあがり率を 上げる（ウェーブ全体の 稼ぎは 元と 同じ）
const capCount = (st, rd, L, w, k=1) => { const full = Math.round(waveCount(L, w)*k), n = Math.max(1, Math.min(full, Math.round(waveCap(st, rd)*k))); return {n, rm: Math.min(4, full/n)}; };

// ===== ジョブ（本作の基本6ジョブ。アビリティはコンボ戦闘向けに作り直し） =====
const JOB_T = [0, 45, 135, 300, 540, 900, 1380, 1980, 2760, 3750];   // 本作と同じ必要JP
const JOB_MAX = 10;
const A = (n, cat, d, fx) => ({n, cat, d, fx});
const JOBS = {
  senshi: {n:'戦士', col:'#2f64cc', d:'剣で 群れを まとめて 打ち上げる', cd:0.7,
    role:'斬り上げ', roleD:'手前の敵を まとめて 打ち上げる', sp:'てんくう斬り', spD:'全員を 高く打ち上げ、空から 斜めに 斬り下ろす（空中の敵に 2.6倍）',
    base:'攻撃力 +10%、最大HP +10%', bfx:s => { s.atkPct += 10; s.hpPct += 10; }, ab:[
    A('たたかう心得', 'atk', '攻撃力 +5%',                          s => s.atkPct += 5),
    A('ちからため',   'atk', '空中の敵への ダメージ +20%',           s => s.air += 20),
    A('てっぺき',     'def', '防御力 +15%',                         s => s.defPct += 15),
    A('ふみこみ',     'spc', '斬り上げの 届く幅 +30%',               s => s.pw.reach = 1.3),
    A('かばう',       'def', '受けるダメージ -10%',                  s => add(s.pw, 'cut', 10)),
    A('闘志',         'atk', 'パーティHPが 半分以下で 攻撃力 +30%',   s => s.pw.toushi = true),
    A('たかく打ち上げ','spc', '打ち上げの 高さ +30%（滞空が のびる）', s => s.pw.launchUp = 1.3),
    A('不屈',         'def', 'ステージで 1回だけ HP1で 耐える',       s => s.pw.endure = true),
    A('剣の舞',       'atk', '斬り上げが 2回攻撃',                   s => s.pw.swordDance = true),
    A('剣聖',         'atk', '会心の一撃が 2.5倍（ふだん 1.8倍）',    s => s.critMul = Math.max(s.critMul, 2.5))]},
  budou: {n:'武闘家', col:'#e07a2a', d:'近くの敵を 連打で 浮かせ続ける', cd:0.45,
    role:'3連打', roleD:'近くの3体に 3連打。しめで 3体を 打ち上げる', sp:'百裂拳', spD:'目の前の敵に 拳の嵐、しめの 昇竜拳で まとめて 高く 打ち上げる',
    base:'攻撃速度 +15%、最大HP +5%', bfx:s => { s.aspd += 15; s.hpPct += 5; }, ab:[
    A('鍛錬',     'def', '最大HP +8%',                             s => s.hpPct += 8),
    A('連撃',     'atk', '3連打の 相手が 1体ふえる',                s => s.pw.fistTargets = 1),
    A('気功',     'def', 'ウェーブの あいだの 回復 2倍',            s => s.pw.regen2 = true),
    A('お手玉',   'spc', '空中の敵に 当てたときの 浮き直し 1.5倍',  s => s.pw.otedama = 1.5),
    A('鉄の拳',   'atk', '会心率 +10%',                            s => s.crit += 10),
    A('しらはどり','def', '敵の攻撃を 15%で かわす',                s => add(s.pw, 'evade', 15)),
    A('百人力',   'atk', '攻撃力 +20%',                            s => s.atkPct += 20),
    A('無我',     'spc', '職業技ゲージの たまり +30%',                s => s.spg += 30),
    A('昇竜',     'atk', '3連打の しめの 打ち上げが さらに 高くなる',           s => s.pw.shoryu = true),
    A('極意',     'atk', '100コンボ以上で ダメージ +30%',           s => s.pw.combo100 = true)]},
  mahou: {n:'魔法使い', col:'#7a3ac8', d:'群れの 真ん中を 魔法で 吹きとばす', cd:1.1,
    role:'ファイア', roleD:'火の玉が 群れの真ん中で 爆発（範囲）。爆風で 地上の敵を 打ち上げる', sp:'メテオ', spD:'隕石が 次々に 落ちて 爆発、地上の敵を 打ち上げる',
    base:'魔法ダメージ +15%、職業技ゲージ +10%', bfx:s => { s.mag += 15; s.spg += 10; }, ab:[
    A('魔力の目覚め','atk', '魔法ダメージ +10%',                    s => s.mag += 10),
    A('もえる炎',   'atk', '魔法が 敵を 燃やす（3秒 じわじわ）',      s => s.pw.magBurn = true),
    A('早口',       'spc', '魔法の 再使用 -15%',                     s => s.aspd += 15),
    A('魔力',       'atk', '魔法ダメージ +20%',                      s => s.mag += 20),
    A('ブリザド',   'def', '魔法が 当たった敵の 攻撃を 1秒 おくらせる', s => s.pw.chill = true),
    A('爆風',       'spc', '魔法で 空中の敵を 浮き直させる',          s => s.pw.blast = true),
    A('集中',       'spc', '職業技ゲージの たまり +30%',                s => s.spg += 30),
    A('フレア',     'atk', '魔法の 範囲 +40%',                       s => s.pw.flare = 1.4),
    A('連続魔',     'atk', '魔法を 使うと 25%で もう一度',            s => s.pw.dualcast = 25),
    A('大魔導',     'atk', '職業技・必殺技の ダメージ +50%',                  s => add(s.pw, 'spDmg', 50))]},
  touzoku: {n:'盗賊', col:'#3a8a4a', d:'すばやく 斬って 会心と お宝を ねらう', cd:0.35,
    role:'早斬り', roleD:'3体に 瞬間移動で 斬る。空中の敵は かならず 会心。斬った敵の 攻撃を おくらせる', sp:'ぶんどり乱舞', spD:'全員を 瞬間移動で 斬りぬける。すべて 会心＋ゴールドを ぬすむ',
    base:'攻撃速度 +10%、会心率 +5%、回避 20%', bfx:s => { s.aspd += 10; s.crit += 5; add(s.pw, 'evade', 20); }, ab:[
    A('ぬすむ',       'spc', '攻撃のたび 10%で ゴールドを ぬすむ',     s => add(s.pw, 'steal', 10)),
    A('すばやさ',     'atk', '攻撃速度 +15%',                         s => s.aspd += 15),
    A('みきり',       'def', '敵の攻撃を 15%で かわす',                s => add(s.pw, 'evade', 15)),
    A('ゴールドハンター','spc', 'ゴールド +40%',                       s => s.gold += 40),
    A('急所ねらい',   'atk', '会心率 +10%',                           s => s.crit += 10),
    A('わなはずし',   'spc', 'ステージクリアの 宝箱が 1つ ふえる',      s => s.pw.chest = 1),
    A('ぶんどる',     'spc', 'ぬすむで 装備も 手に入る（3%）',          s => s.pw.mug = 3),
    A('いのちしらず', 'def', 'かわすたびに 反撃する',                   s => s.pw.evadeCounter = true),
    A('早業',         'atk', '早斬りが 1体に 2回ずつ 当たる',           s => s.pw.double = true),
    A('暗殺',         'atk', '会心で HP20%以下の敵を 一撃で 倒す（ボス以外）', s => s.pw.execute = true)]},
  souryo: {n:'僧侶', col:'#e8e4d8', d:'光で 空中の敵を うち、パーティを 支える', cd:0.9,
    role:'光の柱', roleD:'光の柱が 敵を 真上に 吹き上げる（空中の敵に 2倍）。攻撃のたび パーティHP 3% 回復', sp:'ホーリー', spD:'聖なる光が 全員を 焼き（空中 2倍）、パーティHPを 40% 回復',
    base:'最大HP +15%、防御力 +10%', bfx:s => { s.hpPct += 15; s.defPct += 10; }, ab:[
    A('ケアル',     'def', '光の柱の 回復 +2%',                      s => add(s.pw, 'healPlus', 2)),
    A('いのり',     'def', 'ウェーブの あいだに さらに HP 20% 回復',   s => s.pw.prayer = true),
    A('聖なる守り', 'def', '防御力 +20%',                            s => s.defPct += 20),
    A('ホーリー光', 'atk', '空中の敵への ダメージ +30%',              s => s.air += 30),
    A('プロテス',   'def', '受けるダメージ -15%',                     s => add(s.pw, 'cut', 15)),
    A('リジェネ',   'def', '戦闘中 毎秒 パーティHP 1% 回復',          s => s.pw.regen = true),
    A('祝福',       'spc', '経験値 +20%',                            s => s.exp += 20),
    A('レイズ',     'def', 'ステージで 1回だけ 全滅から HP50%で 立ち直る', s => s.pw.raise = true),
    A('天罰',       'atk', '光の柱が 2本に なる',                     s => s.pw.twin = true),
    A('聖騎士',     'spc', '仲間の 攻撃力 +25%',                      s => s.ally += 25)]},
  kariudo: {n:'狩人', col:'#8a6a3a', d:'空中の敵を 矢で ねらい、落とさない', cd:0.7,
    role:'5本の矢', roleD:'空中の敵を 優先して 矢を 5本。空中の敵に 1.6倍。当たった敵の 攻撃を おくらせる', sp:'矢の雨', spD:'矢が 雨のように ふりそそぐ。空中の敵は 縫いとめられて 落ちない',
    base:'会心率 +10%', bfx:s => { s.crit += 10; }, ab:[
    A('ねらう',       'atk', '会心率 +10%',                          s => s.crit += 10),
    A('鷹の目',       'atk', '空中の敵への ダメージ +20%',             s => s.air += 20),
    A('みだれうち',   'atk', '矢が 1本 ふえる',                        s => s.pw.arrows = 1),
    A('わなかけ',     'def', '敵の 攻撃間隔 +20%',                     s => s.pw.trap = 1.2),
    A('けものの心得', 'spc', '仲間の 攻撃力 +15%',                     s => s.ally += 15),
    A('縫いとめ',     'spc', '矢が 当たった 空中の敵が ゆっくり 落ちる', s => s.pw.pin = true),
    A('はやうち',     'atk', '攻撃速度 +15%',                          s => s.aspd += 15),
    A('獣使い',       'spc', '仲間の 必殺技ゲージの たまり +30%',         s => add(s.pw, 'allySpg', 30)),
    A('弱点をつく',   'atk', '会心の倍率 +0.5',                        s => add(s.pw, 'critPlus', 0.5)),
    A('えものの目',   'spc', 'レア度の 高い 装備が 出やすい',           s => s.pw.loot = 1.5)]},
};
for (const j in JOBS){ JOBS[j].ab.forEach((a,i)=>a.lv=i+1); VAR('hero_'+j, 'hero', {B: JOBS[j].col}); }
const JOB_KEYS = Object.keys(JOBS);
const CAT_N = {atk:'攻撃', def:'防御', spc:'特殊', any:'自由'};

// ===== 装備（本作と同じ 7か所・レア度。効果は コンボ戦闘向け） =====
const SLOTS = ['weapon','head','body','hands','feet','acc'];
const EQ = ['weapon','head','body','hands','feet','acc','acc2'];
const SLOTN = {weapon:'武器', head:'頭', body:'体', hands:'手', feet:'足', acc:'アクセ', acc2:'アクセ'};
const BASE_N = {
  weapon:['ブロンズソード','アイアンソード','スチールソード','ミスリルソード','ルーンブレード','ドラゴンソード'],
  head:['レザーキャップ','アイアンヘルム','スチールヘルム','ミスリルヘルム','ルーンヘルム','ドラゴンヘルム'],
  body:['たびびとのふく','レザーアーマー','チェインメイル','スチールアーマー','ミスリルメイル','ルーンアーマー'],
  hands:['レザーグローブ','アイアンガントレット','スチールガントレット','ミスリルガントレット','ルーングローブ','ドラゴンクロー'],
  feet:['たびのくつ','レザーブーツ','アイアンブーツ','スチールブーツ','ミスリルブーツ','ルーンブーツ'],
  acc:['ちからのゆびわ','まもりのおまもり','はやてのリング','ひらめきのピアス','けんじゃのいし','ほしのかけら'],
};
const RARE_PRE = ['剛力の','疾風の','守護の','閃きの','覇王の','月光の','烈火の'];
const AFF = {
  atk:  {n:'攻撃力',       f:v=>`+${fmt(v)}`},
  def:  {n:'防御力',       f:v=>`+${fmt(v)}`},
  hp:   {n:'最大HP',       f:v=>`+${fmt(v)}`},
  crit: {n:'会心率',       f:v=>`+${v}%`},
  aspd: {n:'攻撃速度',     f:v=>`+${v}%`},
  spg:  {n:'職業技ゲージ',   f:v=>`+${v}%`},
  air:  {n:'空中の敵へ',   f:v=>`+${v}%`},
  ally: {n:'仲間の攻撃力', f:v=>`+${v}%`},
  spark:{n:'ひらめき率',   f:v=>`+${v}%`},
  exp:  {n:'経験値',       f:v=>`+${v}%`},
  gold: {n:'ゴールド',     f:v=>`+${v}%`},
};
const RAR_N = ['ノーマル','マジック','レア','ユニーク','セット','神器'];
const UNIQ = {
  gouka:     {slot:'weapon', n:'業火の大剣',   p:'ゆうしゃの 攻撃が 敵を 燃やす（3秒 じわじわ）',  fx:s=>s.pw.burnAll=true},
  ryugoroshi:{slot:'weapon', n:'竜殺しの剣',   p:'ボスへの ダメージ +50%',                       fx:s=>add(s.pw,'bossDmg',50)},
  raikou:    {slot:'weapon', n:'雷光の細剣',   p:'ゆうしゃの 攻撃の 15%で 落雷が 近くの3体に 追撃', fx:s=>add(s.pw,'bolt',15)},
  ouja:      {slot:'head',   n:'王者の冠',     p:'仲間の 攻撃力と 最大HP +30%',                  fx:s=>{ s.ally+=30; add(s.pw,'allyHp',30); }},
  oni:       {slot:'head',   n:'鬼の面',       p:'パーティHPが 30%以下で 攻撃力 2倍',              fx:s=>s.pw.oni=true},
  fukutsu:   {slot:'body',   n:'不屈の鎧',     p:'パーティHPが 半分以下で 防御力 2倍',             fx:s=>s.pw.fukutsu=true},
  touki:     {slot:'body',   n:'闘気の胴着',   p:'コンボ 1ごとに 攻撃力 +0.5%（最大 +50%）',       fx:s=>s.pw.touki=true},
  mangetsu:  {slot:'hands',  n:'満月の手甲',   p:'会心の一撃が 3倍',                              fx:s=>s.critMul=Math.max(s.critMul,3)},
  fuujin:    {slot:'feet',   n:'風神の足袋',   p:'攻撃速度 +25%',                                fx:s=>s.aspd+=25},
  kyukon:    {slot:'acc',    n:'吸魂の指輪',   p:'敵を 倒すたび パーティHP 0.5% 回復',             fx:s=>s.pw.kyukon=true},
  kinka:     {slot:'acc',    n:'金貨のお守り', p:'ゴールド +80%',                                fx:s=>s.gold+=80},
  tenma:     {slot:'acc',    n:'天馬の羽',     p:'打ち上げた敵が ゆっくり 落ちる（滞空 1.5倍）',    fx:s=>s.pw.floaty=true},
};
const SETS = {
  raimei:  {n:'雷鳴の勇者',   pre:'雷鳴の',   b:{2:'職業技ゲージ +20%', 4:'職業技を 使うと 落雷が 全員に 追撃', 6:'職業技・必殺技の ダメージ 2倍'}},
  juuou:   {n:'獣王の契り',   pre:'獣王の',   b:{2:'仲間の 最大HP +30%', 4:'仲間の 攻撃力 +50%', 6:'仲間の ダメージ 2.5倍'}},
  shounin: {n:'黄金の商人',   pre:'黄金の',   b:{2:'ゴールド +50%', 4:'経験値 +50%', 6:'装備の ドロップ率 2倍'}},
  mikazuki:{n:'三日月の狩人', pre:'三日月の', b:{2:'会心率 +15%', 4:'会心の一撃が 2.5倍', 6:'会心で 10%の確率で 敵を 一撃で 倒す（ボス以外）'}},
};
const SET_PART = {weapon:'つるぎ', head:'かぶと', body:'よろい', hands:'こて', feet:'すねあて', acc:'おまもり'};

// ===== セーブ =====
const SAVE_KEY = 'pikon-combo-v1';
const GAME_VER = '1.4';   // 更新したら 上げる（CHANGELOG.md と 紹介ページも）
// 保存先（プレビュー画面など 使えない 場所では 例外に なるので かならず ここを 通す）
const LS = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k, v){ try{ localStorage.setItem(k, v); return true; }catch(e){ return false; } },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} },
  ok(){ try{ const t = '__pq_t'; localStorage.setItem(t, '1'); localStorage.removeItem(t); return true; }catch(e){ return false; } },
};
function freshSave(){
  return {tabsOpen:{}, v:1, uid:0, gold:0, hero:{lv:1, exp:0}, job:'senshi',
    jobs:Object.fromEntries(JOB_KEYS.map(k=>[k,{jp:0}])), mslots:{atk:null, def:null, spc:null},
    equip:{weapon:null, head:null, body:null, hands:null, feet:null, acc:null, acc2:null}, inv:[],
    clear:[0,0,0,0,0,0],          // ステージごとに クリアした 最高の 周回
    sel:{st:0, rd:1}, found:{}, autoSell:false,
    skills:{slash:{m:0}, kick:{m:0}}, slots:['slash', null, null, null],
    allies:[], party:[null,null,null], bossMiss:{},
    opt:{q:'high', shake:true, fps30:false, cam:true, se:true, vol:.6, vib:true, hs:'weak'},
    stats:{kills:0, clears:0, runs:0}, seen:{},
    mats:{}, cards:{}, album:{}, shards:0, boxes:0, fac:{}, craft:{m:0}, market:{day:'', bought:{}},
    charmNext:{}, stall:[], stallLog:[], stallT:0, stats2:{refines:0, broken:0, stallSold:0}, extracted:{}, pslots:[], wtree:{}, tower:{best:0}, artFound:{}, artEx:{}, aslots:[], goals:{}, goalSeen:{}};
}
let P = freshSave();
function loadSave(){
  try{
    const raw = LS.get(SAVE_KEY); if(!raw) return false;
    const d = JSON.parse(raw); if(!d || d.v!==1) return false;
    P = Object.assign(freshSave(), d);
    if(!d.tabsOpen) P.tabsOpen = 'legacy';   // 前の 版の セーブ: タブは 条件を みたす ものを だまって ひらく
    for(const k of JOB_KEYS) if(!P.jobs[k]) P.jobs[k]={jp:0};
    { const seen = new Set(); P.slots = [...(P.slots||[]), null, null, null, null].slice(0,4).map(v => v && !seen.has(v) && (seen.add(v), true) ? v : null); if(!P.slots.some(Boolean)) P.slots[0] = 'slash'; }   // ひらめき技の 枠は 最大4
    if(!Array.isArray(P.party) || P.party.length!==3) P.party=[null,null,null];
    for(const it of [...P.inv, ...Object.values(P.equip).filter(Boolean)]){ it.ref = it.ref||0; if(!Array.isArray(it.cards)) it.cards = []; }
    P.extracted = P.extracted||{}; P.pslots = P.pslots||[]; P.stats2 = Object.assign({refines:0, broken:0, stallSold:0}, P.stats2||{});
    if(!JOBS[P.job]) P.job='senshi';
    for(const it of [...P.inv, P.equip.weapon].filter(Boolean)) if(it.slot==='weapon' && !it.wt) it.wt = guessWT(it);
    if(P.equip.weapon && !canWield(P.equip.weapon)){ P.inv.push(P.equip.weapon); P.equip.weapon = null; }
    // 露店は 廃止：ならべていた 品は もちものへ もどし、露店の棚に つかった ゴールドは 返す
    if(Array.isArray(P.stall) && P.stall.length){ for(const st of P.stall){ if(st.kind==='item' && st.item) P.inv.push(st.item); else if(st.key) P.cards[st.key]=(P.cards[st.key]||0)+1; } }
    P.stall = [];
    if(P.fac && P.fac.stall){ P.gold += [1500, 4000, 10000, 25000, 60000].slice(0, P.fac.stall).reduce((a,b)=>a+b,0); delete P.fac.stall; }
    P.allies = P.allies||[]; P.party = P.party.map(id=>P.allies.some(a=>a.id===id)?id:null);
    return true;
  }catch(e){ return false; }
}
let lastSave = 0;
function saveNow(){ if(_svT){ clearTimeout(_svT); _svT=0; } if(window._noSave) return; if(LS.set(SAVE_KEY, JSON.stringify(P))) lastSave=Date.now(); else { try{ saveFailed(); }catch(_){} } }
// 戦闘中は まとめて 書く（倒すたびに 保存すると その瞬間が 重くなる）
let _svT = 0;
function save(){ if(typeof mode!=='undefined' && mode==='battle'){ if(!_svT) _svT = setTimeout(saveNow, 2000); return; } saveNow(); }

// ===== レベル・JP =====
const needExp = L => Math.round(8 * Math.pow(L, 1.8));   // 本作と同じ
const jobLv = j => JOB_T.filter(t => (P.jobs[j]||{jp:0}).jp >= t).length;
const jobUsed = j => (P.jobs[j]||{jp:0}).jp > 0 || j === P.job;
const abLearned = r => !!r && jobUsed(r.j) && jobLv(r.j) >= r.a.lv;   // おぼえた アビリティ（マスター 不要）
const mastersCount = () => MAIN_JOBS.filter(j => jobLv(j) >= JOB_MAX).length;
const slotKeys = () => { const d = P.job==='suppin';   // すっぴんは 枠 2倍
  return ['atk','def','spc', ...(d?['atk2','def2','spc2']:[]), ...Array.from({length: Math.min(4, Math.floor(mastersCount()/3))*(d?2:1)}, (_,i)=>'x'+(i+1))]; };
const slotCat = k => k.startsWith('x') ? 'any' : k.replace(/\d+$/, '');
function abRef(v){ const [, j, nm] = v.split(':'); const a = JOBS[j] && JOBS[j].ab.find(x=>x.n===nm); return a ? {j, a} : null; }
const heroSpr = () => { const sk = P.opt && P.opt.skin; return 'hero_' + P.job + (sk && typeof skinOpen === 'function' && skinOpen(sk) ? '_'+sk : ''); };
