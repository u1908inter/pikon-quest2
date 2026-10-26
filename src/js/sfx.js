// ===== 押したときの 手ごたえ（効果音・振動・ボタンの 光） =====
let AC = null, MASTER = null;
function audioInit(){
  if(AC){ if(AC.state==='suspended') AC.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if(!C) return;
  AC = new C(); MASTER = AC.createGain(); MASTER.connect(AC.destination);
}
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
  atk:  i => { tone(NOTE[i]*1.5, NOTE[i], .06, 'square', .16); },
  skill:() => { tone(880, 1320, .07, 'square', .14); tone(1320, 1760, .08, 'square', .12, .06); },
  sp:   i => { tone(NOTE[i], NOTE[i]*2, .12, 'sawtooth', .13); tone(NOTE[i]*1.5, NOTE[i]*3, .14, 'square', .1, .07); },
  fin:  () => { [523,659,784,1047].forEach((f,k)=>tone(f, f*1.02, .22, 'square', .12, k*.05)); tone(120, 60, .35, 'triangle', .3); },
  ng:   () => { tone(180, 140, .07, 'triangle', .22); },
  // ひらめき: ピ・コ・ー・ン！と 上がる アルペジオ ＋ キラキラ
  spark:() => { [784,1047,1319,1568,2093].forEach((f,k)=>tone(f, f, .13, 'square', .16, k*.065)); tone(2093, 2093, .5, 'triangle', .14, .33);
                for(let k=0;k<6;k++) tone(2637+k*220, 3520+k*220, .06, 'triangle', .07, .42+k*.05); tone(262, 523, .45, 'sawtooth', .05, 0); },
};
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
