// ===== 押したときの 手ごたえ（効果音・振動・ボタンの 光） =====
let AC = null, MASTER = null;
function audioInit(){
  if(AC){ if(AC.state==='suspended') AC.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if(!C) return;
  AC = new C(); MASTER = AC.createGain();
  // 音が 重なっても 割れないよう コンプレッサーを はさむ
  try{ const comp = AC.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 6; comp.attack.value = .003; comp.release.value = .18; MASTER.connect(comp); comp.connect(AC.destination); }
  catch(_){ MASTER.connect(AC.destination); }
}
// ホワイトノイズ（1回だけ つくって 使いまわす）
let _nz = null;
function noiseBuf(){ if(!_nz){ const n = AC.sampleRate; _nz = AC.createBuffer(1, n, n); const d = _nz.getChannelData(0); for(let i=0;i<n;i++) d[i] = Math.random()*2-1; } return _nz; }
// ノイズ音: フィルター type、周波数 f0→f1、Q、長さ dur、音量 g、開始 t
function noise(f0, f1, dur, g=.3, t=0, type='bandpass', Q=1.2){
  if(!AC || !VOL()) return;
  const now = AC.currentTime + t, s = AC.createBufferSource(), f = AC.createBiquadFilter(), v = AC.createGain();
  s.buffer = noiseBuf(); s.loop = true;
  f.type = type; f.Q.value = Q; f.frequency.setValueAtTime(f0, now); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), now+dur);
  v.gain.setValueAtTime(0.0001, now); v.gain.exponentialRampToValueAtTime(g*VOL(), now+.004); v.gain.exponentialRampToValueAtTime(0.0001, now+dur);
  s.connect(f); f.connect(v); v.connect(MASTER); s.start(now, Math.random()*.5); s.stop(now+dur+.02);
}
// 同じ 音が 短い間に 何度も 鳴らないように
const _sfxT = {};
const gate = (k, ms) => { const n = performance.now(); if(n - (_sfxT[k]||0) < ms) return false; _sfxT[k] = n; return true; };
const VOL = () => (P.opt.se===false ? 0 : (P.opt.vol ?? .6));
// 1音: 周波数 f0→f1、長さ dur、波形 type、音量 g、開始 t（秒後）
function tone(f0, f1, dur, type='square', g=.18, t=0){
  if(!AC || !VOL()) return;
  const now = AC.currentTime + t, o = AC.createOscillator(), v = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, now); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), now+dur);
  v.gain.setValueAtTime(0.0001, now); v.gain.exponentialRampToValueAtTime(g*VOL(), now+.006); v.gain.exponentialRampToValueAtTime(0.0001, now+dur);
  o.connect(v); v.connect(MASTER); o.start(now); o.stop(now+dur+.02);
}
// iPhone は vibrate が ないので、Safari の スイッチ部品の 触覚を 借りる
let _hapLbl = null;
function iosTap(){
  if(!_hapLbl){
    const inp = document.createElement('input'); inp.type='checkbox'; inp.setAttribute('switch',''); inp.id='hapsw';
    _hapLbl = document.createElement('label'); _hapLbl.htmlFor='hapsw';
    const box = document.createElement('div'); box.style.cssText='position:fixed;left:-99px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
    box.append(inp, _hapLbl); document.body.appendChild(box);
  }
  _hapLbl.click();
}
function buzz(pat){
  if(P.opt.vib===false || !pat) return;
  if(navigator.vibrate) navigator.vibrate(pat);
  else iosTap();
}
const NOTE = [523, 659, 784, 988];   // 列ごとに 音の 高さを かえる（ド ミ ソ シ）
const SFX = {
  // ボタン: 風を 切る音 ＋ 列ごとの 音程
  atk:  i => { noise(2600, 900, .09, .22, 0, 'bandpass', 1.4); tone(NOTE[i]*1.5, NOTE[i], .05, 'square', .08); },
  skill:() => { noise(1800, 4200, .12, .18, 0, 'bandpass', 2); tone(880, 1320, .07, 'square', .1); tone(1320, 1760, .08, 'square', .09, .06); },
  sp:   i => { noise(400, 3000, .35, .2, 0, 'bandpass', 1.5); tone(NOTE[i]/2, NOTE[i]*2, .3, 'sawtooth', .1); tone(NOTE[i]*1.5, NOTE[i]*3, .14, 'square', .08, .22);
               later2(.32, ()=>{ noise(900, 80, .45, .5, 0, 'lowpass', .8); tone(90, 40, .45, 'sine', .45); }); },
  fin:  () => { [523,659,784,1047].forEach((f,k)=>tone(f, f*1.02, .22, 'square', .12, k*.05)); tone(120, 60, .35, 'triangle', .3); },
  ng:   () => { tone(180, 140, .07, 'triangle', .22); },
  // 当たり: 打撃の かたまり（ノイズ）＋ 低い ドン。会心は 金属っぽく、空中は 高めに
  hit:  (crit, air) => { if(!gate('hit', crit ? 30 : 45)) return; const p = (air ? 1.35 : 1) * (0.9 + Math.random()*.2);
          noise(3200*p, 700*p, .07, .28); tone(160*p, 60, .08, 'sine', .32);
          if(crit){ tone(1800, 1400, .12, 'triangle', .12); noise(6000, 3000, .1, .15, .01, 'highpass', .7); } },
  // 倒した: くだける音
  kill: boss => { if(!gate('kill', 55)) return; noise(1400, 120, boss ? .6 : .22, boss ? .5 : .3, 0, 'lowpass', 1); tone(boss ? 110 : 240, 40, boss ? .5 : .16, 'triangle', .28);
          if(boss){ noise(5000, 800, .5, .2, .05, 'bandpass', .8); tone(55, 30, .9, 'sine', .5, .02); } },
  // 打ち上げ: ふわっと 上がる 風
  launch: () => { if(!gate('launch', 110)) return; noise(500, 3800, .2, .22, 0, 'bandpass', 2.5); tone(300, 900, .16, 'sine', .1); },
  // 叩きつけ: 地面に ドスン
  slam: () => { if(!gate('slam', 90)) return; tone(120, 35, .25, 'sine', .5); noise(800, 60, .22, .38, 0, 'lowpass', .7); },
  // 受けた ダメージ
  hurt: () => { if(!gate('hurt', 90)) return; tone(220, 90, .14, 'sawtooth', .12); noise(1200, 300, .12, .2, 0, 'bandpass', 1); },
  // 仲間が おきあがる: キラキラ
  recruit: () => { [659,880,1175,1568].forEach((f,k)=>tone(f, f, .18, 'triangle', .14, k*.07)); for(let k=0;k<5;k++) tone(2400+k*300, 3200+k*300, .05, 'sine', .06, .25+k*.04); },
  // レベルアップ
  lvup: (small) => { const sc = small ? [784,988,1175] : [523,659,784,1047,1319];
          sc.forEach((f,k)=>tone(f, f, .14, 'square', .1, k*.07)); tone(sc[sc.length-1], sc[sc.length-1], .45, 'triangle', .12, sc.length*.07); },
  // ボス 登場: 低い 太鼓と うなり
  boss: () => { for(let k=0;k<3;k++){ tone(70, 40, .35, 'sine', .55, k*.28); noise(300, 60, .3, .3, k*.28, 'lowpass', .8); } tone(110, 104, 1.2, 'sawtooth', .06, .2); },
  // ボスの 大技の ため
  charge: () => { noise(200, 2400, .8, .22, 0, 'bandpass', 3); tone(80, 320, .8, 'sawtooth', .07); },
  // ウェーブ クリア・ステージ クリア
  clear: () => { [784,1047].forEach((f,k)=>tone(f, f, .12, 'square', .1, k*.08)); },
  win:  () => { [523,659,784,1047,784,1047].forEach((f,k)=>tone(f, f, k===5?.5:.13, 'square', .11, k*.1)); tone(131, 131, .8, 'triangle', .2, .5); },
  // レアな 落とし物
  rare: () => { if(!gate('rare', 200)) return; [1319,1568,2093].forEach((f,k)=>tone(f, f, .12, 'triangle', .13, k*.06)); },
  // かくし連携
  combo: () => { noise(300, 5000, .5, .3, 0, 'bandpass', 1.5); [523,784,1047,1568].forEach((f,k)=>tone(f, f*1.01, .2, 'square', .1, .1+k*.06)); tone(65, 32, .9, 'sine', .6, .35); noise(2000, 80, .7, .45, .35, 'lowpass', .7); },
  // 拠点の ボタン
  ui: () => { if(!gate('ui', 40)) return; tone(1200, 900, .04, 'triangle', .1); },
  // ひらめき: ピ・コ・ー・ン！と 上がる アルペジオ ＋ キラキラ
  spark:() => { [784,1047,1319,1568,2093].forEach((f,k)=>tone(f, f, .13, 'square', .16, k*.065)); tone(2093, 2093, .5, 'triangle', .14, .33);
                for(let k=0;k<6;k++) tone(2637+k*220, 3520+k*220, .06, 'triangle', .07, .42+k*.05); tone(262, 523, .45, 'sawtooth', .05, 0); },
};
// 画面の 止まり（ヒットストップ）に 関係なく 実時間で 鳴らす 予約
function later2(sec, fn){ setTimeout(fn, sec*1000); }
const VIB = {atk:10, skill:18, sp:[25,30,25], fin:[30,40,60], ng:0};
function pressFx(btn, kind, ok, i=0){
  audioInit();
  if(ok){ SFX[kind](i); buzz(VIB[kind]); }
  else { SFX.ng(); }
  if(btn) btn.animate(ok ? [{transform:'scale(.93)', filter:'brightness(1.35)'}, {transform:'none', filter:'none'}]
                         : [{transform:'none'}, {transform:'translateX(-3px)'}, {transform:'translateX(3px)'}, {transform:'none'}], {duration: ok?170:200, easing:'ease-out'});
}
// 戦闘ボタン以外でも 最初の タップで 音を 使えるようにしておく（iPhone 対策）
addEventListener('pointerdown', audioInit, {once:true, capture:true});
