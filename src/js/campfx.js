// ===== 拠点: たき火と テントを タップすると ちょっと うごく =====
const CF = {fire:0, tent:0, tentDir:1};
function drawTent(){
  const k = CF.tent, sw = k > 0 ? Math.sin(k*28)*k*3.2 : 0, sq = k > 0 ? Math.sin(k*20)*k*.12 : 0;   // ゆれと つぶれ
  const top = 60 + Math.round(sq*24), hgt = 84 - top;
  const row = (y, f) => { const p = y/hgt, off = Math.round(sw*(1-p)); f(off, p); };
  for(let y=0;y<hgt;y++) row(y, (off, p)=>{ const w=Math.round(p*24*1.2); ctx.fillStyle='#8a3a2a'; ctx.fillRect(162-w+off, top+y, w*2, 1);
    const w2=w-2; if(w2>0){ ctx.fillStyle='#c8553d'; ctx.fillRect(162-w+off, top+y, w2, 1); } });
  const door = 8 - Math.round(k*3);   // タップすると 入口が ひらく
  for(let y=Math.max(0,door);y<hgt;y++) row(y, (off, p)=>{ const w=Math.round((y-door)*(.5+k*.35)); ctx.fillStyle='#3a1a14'; ctx.fillRect(162-w+off, top+y, w*2+1, 1); });
  ctx.fillStyle='#5a3a22'; ctx.fillRect(161+Math.round(sw), top-3, 2, 4);
}
function campTap(ev){
  if(mode!=='camp') return;
  const r = cv.getBoundingClientRect(), x = (ev.clientX-r.left)/r.width*W, y = (ev.clientY-r.top)/r.height*H;
  if(x>98 && x<126 && y>74 && y<102){
    CF.fire = 1;
    for(let i=0;i<22;i++) PARTS.push({x:112+rand(-5,5), y:90+rand(-3,3), vx:rand(-22,22), vy:rand(-70,-30), life:rand(.5,1.1), max:1.1, col:pick(['#ffb04a','#ffe14a','#ff6a2a','#ffffff']), sz:Math.random()<.3?2:1, g:40});
    try{ audioInit(); for(let i=0;i<5;i++) tone(rand(180,420), 60, .05, 'sawtooth', .06, i*.06); tone(220, 660, .25, 'triangle', .07, .05); }catch(_){}
    try{ buzz(12); }catch(_){}
  }else if(x>128 && x<198 && y>52 && y<88){
    CF.tent = 1;
    for(let i=0;i<10;i++) PARTS.push({x:162+rand(-26,26), y:84, vx:rand(-14,14), vy:rand(-14,-4), life:.5, max:.5, col:'#d6c290', sz:1, g:20});
    try{ audioInit(); tone(330, 140, .18, 'square', .07); tone(520, 780, .08, 'triangle', .06, .14); }catch(_){}
    try{ buzz(10); }catch(_){}
  }
}
cv.addEventListener('pointerdown', campTap);
