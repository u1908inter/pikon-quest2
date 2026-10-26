// ===== BGM（魔界の 曲。ファイルの 中に うめこみ） =====
const BGM_SRC = {};   // ビルドで うめこむ（bgm/◯◯.mp3 → 場面の 名前）
/*BGM_FILES*/
const BGM = {el:null, key:null, vol:0, target:0};
const bgmOn = () => P.opt.bgm !== false;
const bgmVol = () => (P.opt.vol ?? .6) * .55;
let _sndTest = null;   // サウンドテストで 流している 曲
function bgmWant(){
  if(_sndTest && BGM_SRC[_sndTest]) return _sndTest;
  if(!bgmOn() || document.hidden) return null;
  const ed = document.getElementById('ending'); if(ed && !ed.hidden && ed.className) return BGM_SRC.ending ? 'ending' : null;   // エンディング・完全制覇
  const bossNow = mode==='battle' && !S.demo && !S.tut && (S.tower ? S.floor % 10 === 0 : S.waveIdx > WAVES);
  const special = bossNow && S.es && S.es.some(e=>e.maou || e.ms);   // 魔王・塔の 節目ボス
  if(special && BGM_SRC.boss2) return 'boss2';
  if(bossNow){   // ふつうの ボス戦（塔の ボス階も）: 曲が いくつか あれば ランダム（その 戦闘の あいだは おなじ 曲）
    const pool = ['boss','boss3'].filter(k=>BGM_SRC[k]);
    if(pool.length){ const id = S.tower ? 'f'+S.floor : 'w'+S.waveIdx; if(S.bossBgmId !== id || !BGM_SRC[S.bossBgm]){ S.bossBgmId = id; S.bossBgm = pick(pool); } return S.bossBgm; }
  }
  if(mode==='battle' && !S.tower && !S.demo && BGM_SRC[S.bg]) return S.bg;
  if(mode==='battle' && S.tower) return towerBgm();   // ステージの 曲（grass forest cave desert snow hell）
  if(mode==='camp' || (mode==='battle' && S.demo)) return 'camp';   // 拠点（技の お試し中も）
  return null;
}
// 無限の塔: 10階ごとに ステージの 曲から ランダムに えらぶ（前と おなじ 曲は さける）
const TOWER_POOL = ['grass','forest','cave','desert','snow','hell'];
function towerBgm(){
  const blk = Math.floor((Math.max(1, S.floor)-1)/10);
  if(S.tbgmBlk !== blk || !S.tbgm){
    const pool = TOWER_POOL.filter(k=>BGM_SRC[k] && k !== S.tbgm);
    S.tbgm = pool.length ? pick(pool) : S.tbgm; S.tbgmBlk = blk;
  }
  return S.tbgm && BGM_SRC[S.tbgm] ? S.tbgm : null;
}
function bgmTick(){
  let want = bgmWant();
  if(want && BGM.key && BGM.key !== want && BGM.el && !BGM.el.paused && BGM.vol > .02){   // ちがう 曲へは いったん 消してから
    BGM.vol *= .7; BGM.el.volume = BGM.vol; return; }
  if(want && BGM.key !== want){
    if(!BGM.el){ BGM.el = new Audio(); BGM.el.loop = true; BGM.el.preload = 'auto'; }
    if(BGM.key !== want){ BGM.el.src = BGM_SRC[want]; BGM.key = want; BGM.el.currentTime = 0; BGM.vol = 0; BGM.el.loop = want !== 'ending'; }   // エンディングは 1回だけ
  }
  BGM.target = want ? bgmVol() : 0;
  if(!BGM.el) return;
  BGM.vol += (BGM.target - BGM.vol) * .25; if(Math.abs(BGM.target-BGM.vol) < .01) BGM.vol = BGM.target;   // ふわっと 入って ふわっと 消える
  BGM.el.volume = Math.max(0, Math.min(1, BGM.vol));
  if(BGM.key && BGM.target > 0 && !BGM.el.paused && !(P.heard||{})[BGM.key]){ P.heard = P.heard || {}; P.heard[BGM.key] = 1; save(); }   // 聞いた 曲を おぼえる
  if(BGM.target > 0 && BGM.el.paused && !BGM.el.ended){ const p = BGM.el.play(); if(p && p.catch) p.catch(()=>{}); }
  if(BGM.target === 0 && BGM.vol <= .01 && !BGM.el.paused){ BGM.el.pause(); if(!want) { BGM.key = null; } }
}
setInterval(bgmTick, 100);
// 最初の タップで 鳴らせるように する（ブラウザの 自動再生の きまり）
addEventListener('pointerdown', ()=>{ if(BGM.el && BGM.target > 0 && BGM.el.paused){ const p = BGM.el.play(); if(p && p.catch) p.catch(()=>{}); } }, true);

// ===== サウンドテスト（いちど 聞いた 曲を いつでも 聞ける） =====
const SND_LIST = [['camp','拠点'],['grass','草原'],['forest','森'],['cave','洞窟'],['desert','砂漠'],['snow','雪山'],['hell','魔界'],['boss','ボス戦 1'],['boss3','ボス戦 2'],['boss2','決戦'],['ending','エンディング']];
function soundTest(){
  const ks = SND_LIST.filter(([k])=>BGM_SRC[k]), n = ks.filter(([k])=>(P.heard||{})[k]).length;
  showModal(`<h2>🎵 サウンドテスト（${n}/${ks.length}）</h2><p class="hint">いちど 聞いた 曲を いつでも 聞ける。BGMが オフでも 鳴る。</p>
    <div class="list">${ks.map(([k,nm],i)=>{ const h = (P.heard||{})[k], on = _sndTest===k;
      return `<button class="li ${on?'sel':''}" data-m="snd" data-k="${k}" ${h?'':'disabled'}><div class="body"><div class="t"><span>${on?'▶ ':''}${String(i+1).padStart(2,'0')}　${h ? nm : '？？？'}</span><span class="hint">${on?'再生中':h?'タップで 再生':'まだ 聞いていない'}</span></div></div></button>`; }).join('')}</div>
    <div class="opts"><button class="btn" data-m="sndStop" ${_sndTest?'':'disabled'}>とめる</button><button class="btn primary" data-m="sndClose">とじる</button></div>`);
}
$('#modal').addEventListener('click', ev=>{ const b = ev.target.closest('[data-m^="snd"]'); if(!b) return;
  const m = b.dataset.m;
  if(m==='snd'){ audioInit && audioInit(); _sndTest = b.dataset.k; if(BGM.el){ BGM.key = null; } bgmTick(); soundTest(); }
  else if(m==='sndStop'){ _sndTest = null; soundTest(); }
  else if(m==='sndClose'){ _sndTest = null; hideModal(); } });
