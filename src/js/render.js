// ===== 描画 =====
const _tintC = {};
function getSprTint(key, col){ const k = key+'|'+col; if(_tintC[k]) return _tintC[k]; const src = getSpr(key), c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = .45; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return _tintC[k] = c; }
function drawSpr(key, x, y, s, o={}){
  const c=o.tint && !o.white ? getSprTint(key, o.tint) : getSpr(key, !!o.white), w=c.width, h=c.height;
  const sqx=o.sqx||1, sqy=o.sqy||1;
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(Math.round(x), Math.round(y - h*s*sqy/2));
  if(o.rot) ctx.rotate(o.rot);
  ctx.scale((o.flip?-1:1)*s*sqx, s*sqy);
  ctx.drawImage(c, -w/2, -h/2);
  ctx.restore();
}
function shadow(x, y, w, alpha=.22, force){
  if(!OPT.shadow && !force) return;
  ctx.fillStyle=`rgba(40,30,20,${alpha})`;
  ctx.beginPath(); ctx.ellipse(Math.round(x), Math.round(y), Math.max(2,w/2), Math.max(1,w/7), 0, 0, Math.PI*2); ctx.fill();
}
// ===== カメラ（打ち上げた 敵が 画面の 上に 出そうなら 引いて 全体を 見せる） =====
const CAM = {z:1}, CAM_MARGIN = 22, CAM_MIN = .5, SKYCOL = {};
function skyCol(bg){ if(!SKYCOL[bg]){ const d = bgOf(bg).getContext('2d').getImageData(0,0,1,1).data; SKYCOL[bg] = `rgb(${d[0]},${d[1]},${d[2]})`; } return SKYCOL[bg]; }
function camUpdate(dt){
  let t = 1;
  if(mode==='battle' && P.opt.cam!==false){
    let top = 1e9;
    for(const e of S.es){ if(e.dead || !(e.air>0)) continue; const b = eBox(e); if(b.top < top) top = b.top; }
    if(top < CAM_MARGIN) t = clamp((H-CAM_MARGIN)/(H-top), CAM_MIN, 1);
  }
  CAM.z += (t-CAM.z) * Math.min(1, dt*(t < CAM.z ? 14 : 2.2));
  if(t===1 && CAM.z > .997) CAM.z = 1;
}
const camX = x => W/2 + (x-W/2)*CAM.z, camY = y => H + (y-H)*CAM.z;
let _hudT = 0;
// ===== 背景の 奥行き（ステージごとの 舞う もの。奥は ゆっくり 小さく、手前は 速く 大きく） =====
const hsh = i => { const s = Math.sin(i*127.1+311.7)*43758.5453; return s - Math.floor(s); };
const AMB = {
  grass:  [{n:5, col:['#3a4a3a'], kind:'bird', vx:6, vy:0, y0:8, y1:40, z:0}, {n:10, col:['#f8f8c0','#d8f0a0'], kind:'dot', vx:-14, vy:-4, z:1, sz:1}],
  forest: [{n:4, kind:'shaft', z:0}, {n:12, col:['#e89a3a','#c8b040','#8ac050'], kind:'leaf', vx:-10, vy:14, z:1, sz:2}],
  cave:   [{n:7, col:['#7fe0ff','#c890ff'], kind:'gem', z:0}, {n:14, col:['#c8c0b0'], kind:'dot', vx:3, vy:-3, z:1, sz:1}],
  desert: [{n:4, kind:'haze', z:0}, {n:16, col:['#e8c878','#f8e0a0'], kind:'dot', vx:-90, vy:6, z:1, sz:1}],
  snow:   [{n:18, col:['#ffffff'], kind:'dot', vx:-6, vy:10, z:0, sz:1}, {n:12, col:['#ffffff'], kind:'flake', vx:-14, vy:24, z:1, sz:2}],
  hell:   [{n:4, kind:'glow', z:0}, {n:14, col:['#ff6a2a','#ffb04a','#ff3a2a'], kind:'ember', vx:4, vy:-16, z:0, sz:1}, {n:8, col:['#ffb04a','#ffe14a'], kind:'ember', vx:8, vy:-28, z:1, sz:2}],
};
function ambient(z){
  if(mode!=='battle' || S.tower || CFG.maxParts < 300) return;
  const L = AMB[S.bg]; if(!L) return;
  const t = S.time, q = CFG.maxParts >= 900 ? 1 : .6;
  for(const a of L){ if(a.z!==z) continue;
    const n = Math.round(a.n*q);
    for(let i=0;i<n;i++){
      const r1 = hsh(i+a.n*7), r2 = hsh(i*3+11), r3 = hsh(i*7+5), sp = .6 + .8*r3;
      if(a.kind==='shaft'){   // 木もれ日
        const x = 20 + r1*170, al = .09 + .06*Math.sin(t*.8 + i*2);
        ctx.fillStyle = 'rgba(255,248,200,'+al+')'; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+10,0); ctx.lineTo(x-14,GROUND); ctx.lineTo(x-28,GROUND); ctx.fill(); continue; }
      if(a.kind==='haze'){   // かげろう
        const y = GROUND - 30 + i*7 + Math.sin(t*2+i)*1.5; ctx.fillStyle = 'rgba(255,255,255,.12)';
        for(let x=0;x<W;x+=20) ctx.fillRect(Math.round(x + Math.sin(t*3+x*.1+i)*3), Math.round(y), 12, 1); continue; }
      if(a.kind==='glow'){   // 地面の 赤い ゆらめき
        const x = r1*W, al = .08 + .06*Math.sin(t*1.5+i*1.7); ctx.fillStyle = 'rgba(255,80,30,'+al+')';
        ctx.beginPath(); ctx.arc(x, GROUND+6, 22 + 6*Math.sin(t+i), 0, Math.PI*2); ctx.fill(); continue; }
      if(a.kind==='gem'){   // 洞窟の 結晶の またたき
        const x = Math.round(8 + r1*184), y = Math.round(8 + r2*50), al = Math.max(0, Math.sin(t*1.7 + i*2.3));
        ctx.globalAlpha = .25 + .6*al; ctx.fillStyle = a.col[i%a.col.length]; ctx.fillRect(x, y, 2, 2); ctx.fillRect(x-1, y+2, 1, 1);
        if(al > .8){ ctx.fillRect(x-2, y+1, 1, 1); ctx.fillRect(x+3, y, 1, 1); } ctx.globalAlpha = 1; continue; }
      const span = W + 20, spanY = (a.y1||H) - (a.y0||0) + 20;
      let x = ((r1*span + t*a.vx*sp) % span + span) % span - 10;
      let y = (((r2*spanY + t*a.vy*sp) % spanY) + spanY) % spanY - 10 + (a.y0||0);
      ctx.fillStyle = a.col[i % a.col.length];
      if(a.kind==='bird'){ const f = Math.sin(t*8+i*3) > 0 ? 1 : 0; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); ctx.fillRect(Math.round(x)+1, Math.round(y)+1-f, 1, 1); ctx.fillRect(Math.round(x)-1, Math.round(y)+1-f, 1, 1); continue; }
      if(a.kind==='leaf'){ x += Math.sin(t*1.5 + i)*6; const w = Math.abs(Math.sin(t*3+i)) > .5 ? 2 : 1; ctx.fillRect(Math.round(x), Math.round(y), w, 1); continue; }
      if(a.kind==='ember'){ x += Math.sin(t*2 + i)*3; ctx.globalAlpha = .5 + .5*Math.sin(t*6+i); ctx.fillRect(Math.round(x), Math.round(y), a.sz, a.sz); ctx.globalAlpha = 1; continue; }
      if(a.kind==='flake'){ x += Math.sin(t*1.2 + i)*4; ctx.fillRect(Math.round(x), Math.round(y), 2, 2); continue; }
      ctx.fillRect(Math.round(x), Math.round(y), a.sz||1, a.sz||1);
    }
  }
}
function render(){
  ctx.setTransform(1,0,0,1,0,0);
  const z = CAM.z, bg = bgOf(S.bg);
  if(z < 1){
    ctx.fillStyle = skyCol(S.bg); ctx.fillRect(0,0,W,H);
    ctx.setTransform(z,0,0,z, W/2*(1-z), H*(1-z));
    ctx.save(); ctx.scale(-1,1); ctx.drawImage(bg,0,0); ctx.restore();
    ctx.save(); ctx.translate(2*W,0); ctx.scale(-1,1); ctx.drawImage(bg,0,0); ctx.restore();
  }
  ctx.drawImage(bg,0,0);
  if(SKY[S.bg]){
    ctx.fillStyle = S.bg==='desert' ? '#fff6e4' : '#ffffff';
    for(const c of CLOUDS){ const x = ((c.x + S.time*3*(c.w/20)) % (W+40)) - 30;
      ctx.fillRect(Math.round(x), c.y, c.w, 4); ctx.fillRect(Math.round(x)+4, c.y-3, c.w-10, 3); ctx.fillRect(Math.round(x)+8, c.y-5, c.w-18, 2); }
  }
  if(S.moon){ const t=S.moon.t, al=Math.min(1,t*3)*Math.min(1,(CFG.howlTime-t)); ctx.globalAlpha=al*.9; ctx.fillStyle='#fff6c0'; ctx.beginPath(); ctx.arc(30,18,9,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(255,246,192,.25)'; ctx.beginPath(); ctx.arc(30,18,14,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
  towerTint();
  ambient(0);
  if(mode==='camp'){
    // たき火
    drawTent(); campTrophies();
    const fl = Math.sin(S.time*(14+CF.fire*16))*1.5*(1+CF.fire), fb = 1 + 1.3*CF.fire, wob = Math.sin(S.time*23)*CF.fire*2;   // タップで 火が 大きく ゆれる
    ctx.fillStyle='rgba(255,180,80,'+(.18+.2*CF.fire)+')'; ctx.beginPath(); ctx.arc(112, 92, (16+fl)*(1+.5*CF.fire), 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#ff6a2a'; ctx.beginPath(); ctx.moveTo(105-2*CF.fire,95); ctx.lineTo(112+wob,95-(13+fl*2)*fb); ctx.lineTo(119+2*CF.fire,95); ctx.fill();
    ctx.fillStyle='#ffd24a'; ctx.beginPath(); ctx.moveTo(108,95); ctx.lineTo(112+wob*.6,95-(8+fl)*fb); ctx.lineTo(116,95); ctx.fill();
    if(CF.fire>.3){ ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.moveTo(110,95); ctx.lineTo(112+wob*.3,95-5*fb); ctx.lineTo(114,95); ctx.fill(); }
  }

  for(const e of S.es){ if(e.dead&&e.burst) continue; const b=eBox(e); shadow(e.x+e.kx, e.y+1, b.w*.8*clamp(1-(e.ly+e.fl)/70,.35,1), .25); }
  ACT.forEach(a=>shadow(a.x+a.kx, Math.max(a.y, a.c.hy), getSpr(a.c.spr).width*2*.8*clamp(1-(Math.max(a.y,a.c.hy)-a.y)/50,.4,1)));
  for(const ga of ACT) if(ga.anim && ga.anim.type==='golem_sp'){ const u=ga.anim.t-CFG.spCut; if(u>.15 && u<.56) shadow(ga.anim.gx, GROUND+3, 6+40*clamp((u-.15)/.41,0,1), .35, true); }

  const list = [];
  ACT.forEach((a,i)=>list.push({y:a.anim?Math.max(a.y,a.c.hy)+.5:a.c.hy, draw:()=>{
    const bob = a.anim ? 0 : Math.round(Math.sin(S.time*4+i*1.7));
    const br = a.anim ? 0 : .04*Math.sin(S.time*4+i*1.7);
    const white = a.flash>0 && Math.floor(a.flash*30)%2===0;
    const camp = mode==='camp' && i>0;   // 拠点では たき火の ほうを むく
    drawSpr(a.c.spr, a.x+a.kx, a.y+bob, (a.c.spr==='b_maou' || a.c.spr==='b_shadow' || a.c.spr==='b_source2' || a.c.spr==='b_chaos2') ? 1.5 : 2, {sqx:a.sqx*(1-br), sqy:a.sqy*(1+br), rot:a.rot, white, flip:a.flip});
    if(S.buffT>0){ ctx.fillStyle = Math.floor(S.time*8+i)%2 ? '#ffe14a' : '#fff6c0'; ctx.fillRect(Math.round(a.x-6+((S.time*20+i*5)%12)), Math.round(a.y-22-((S.time*14+i*7)%8)), 1, 2); }
    if(a.anim && /_sp2?$/.test(a.anim.type) && a.anim.t < CFG.spCut){
      ctx.fillStyle = Math.floor(S.time*20)%2 ? '#ffe14a' : '#ffffff';
      for(let k=0;k<4;k++){ const ang=S.time*10+k*1.57; ctx.fillRect(Math.round(a.x+Math.cos(ang)*12), Math.round(a.y-12+Math.sin(ang)*12), 2, 2); }
    }
    // 武闘家・盗賊の 残像
    if(i===0 && a.anim && (a.anim.type==='touzoku_sp' || a.anim.type==='touzoku')){
      ctx.globalAlpha=.35; drawSpr(a.c.spr, a.x-6, a.y, 2, {white:true, flip:a.flip}); ctx.globalAlpha=1;
    }
  }}));
  for(const wa of ACT) if(wa.anim && wa.anim.type==='wolf_sp'){
    for(let k=1;k<=3;k++){ const p=wolfRun(wa.anim.t-CFG.spCut-k*.07, wa.c);
      if(p) list.push({y:p.y-.1, draw:()=>drawSpr('wolf', p.x, p.y+(k-2)*3, 2, {alpha:.45, sqx:p.sqx, sqy:p.sqy, rot:p.rot||0, flip:p.flip, white:k===2})}); }
  }
  for(const e of S.es){
    if(e.dead && e.burst) continue;
    list.push({y:e.y, draw:()=>{
      const b=eBox(e);
      let x = e.x + e.kx;
      if(e.lunge>=0){ const t=e.lunge; x -= t<.1 ? 18*(t/.1) : 18*(1-(t-.1)/.22); }
      const warn = !e.dead && e.t<.5 && e.landed && !S.wait && !(e.sleep>0);
      if(warn) x += Math.sin(S.time*70)*1;
      const wd = e.wind ? Math.min(1, e.wind.t/e.wind.dur) : 0;
      if(wd){ x += Math.sin(S.time*90)*1.6*wd;
        ctx.globalAlpha = .18 + .22*wd*(.6+.4*Math.sin(S.time*30)); ctx.fillStyle = e.wind.sk.col[0];
        ctx.beginPath(); ctx.arc(b.cx, b.cy, b.w*.55 + 6*wd, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
      const lift = e.ly + e.fl;
      const flap = e.fl ? 1 + .12*Math.sin(S.time*14+e.x) : 1;
      const bob = (e.air>0||e.dead) ? 0 : Math.sin(S.time*3+e.x*.3)*.8;
      const white = (e.flash>0) || (e.dead && Math.floor(e.dying*40)%2===0);
      const sq = e.sq>0 ? .25*Math.sin(Math.PI*e.sq/.18) : 0;
      drawSpr(e.key, x, e.y - lift + bob, e.s, {flip:true, rot:e.rot, white: white || (wd > .7 && Math.floor(S.time*20)%2===0), tint:e.tint, sqy:flap*(1-sq)*(1-.14*wd), sqx:(2-flap)*(1+sq)*(1+.1*wd)});
      if(e.poison>0 && !e.dead){ ctx.fillStyle = Math.floor(S.time*6+e.x)%2 ? '#b45adc' : '#e8a0e0'; ctx.fillRect(Math.round(b.cx+3), Math.round(b.top+1), 2, 2); }
      if(e.burn>0 && !e.dead){ ctx.fillStyle = Math.floor(S.time*12+e.x)%2 ? '#ff8e3c' : '#ffd24a'; ctx.fillRect(Math.round(b.cx-3), Math.round(b.top+2), 2, 2); ctx.fillRect(Math.round(b.cx+2), Math.round(b.top+4), 1, 2); }
      if(e.pin>0 && e.air>0){ ctx.fillStyle='#e8dcb4'; ctx.fillRect(Math.round(b.cx-1), Math.round(b.cy-1), 6, 1); }
      if(wd){ ctx.fillStyle = Math.floor(S.time*12)%2 ? '#ff3a2a' : '#ffe14a'; const ty = Math.round(b.top) - 14; ctx.fillRect(Math.round(b.cx)-2, ty, 4, 7); ctx.fillRect(Math.round(b.cx)-2, ty+9, 4, 3); }
      else if(warn){ ctx.fillStyle='#ff5a3a'; ctx.fillRect(Math.round(b.cx)-1, Math.round(b.top)-8, 2, 4); ctx.fillRect(Math.round(b.cx)-1, Math.round(b.top)-3, 2, 2); }
      if(e.sleep>0 && !e.dead){
        ctx.fillStyle='#ffffff';
        for(let k=0;k<2;k++){ const ph=((S.time*.8+k*.5+e.x*.01)%1); const zx=Math.round(b.cx+4+ph*6+k*2), zy=Math.round(b.top-2-ph*10);
          ctx.globalAlpha=1-ph; ctx.fillRect(zx,zy,3,1); ctx.fillRect(zx+1,zy+1,1,1); ctx.fillRect(zx,zy+2,3,1); }
        ctx.globalAlpha=1;
      }else if(e.stun>0 && !e.dead && e.air<=0){
        for(let k=0;k<2;k++){ const ang=S.time*6+k*3.14+e.x; ctx.fillStyle=k?'#ffe14a':'#ffffff';
          ctx.fillRect(Math.round(b.cx+Math.cos(ang)*6), Math.round(b.top-2+Math.sin(ang)*2), 2, 2); }
      }
      if(e.rare && !e.dead){ for(let k=0;k<3;k++){ const ang=S.time*5+k*2.1+e.x; ctx.fillStyle=k%2?'#ffe14a':'#ffffff'; ctx.fillRect(Math.round(b.cx+Math.cos(ang)*(b.w*.55)), Math.round(b.cy+Math.sin(ang)*(b.h*.5)), 2, 2); } }
      if((e.boss || e.elite) && !e.dead){ const w=b.w*.8; ctx.fillStyle='#1b1626'; ctx.fillRect(Math.round(b.cx-w/2)-1, Math.round(b.top)-6, Math.round(w)+2, 4); ctx.fillStyle='#c8553d'; ctx.fillRect(Math.round(b.cx-w/2), Math.round(b.top)-5, Math.round(w*Math.max(0,e.hp/e.max)), 2); }
    }});
  }
  list.sort((p,q)=>p.y-q.y).forEach(o=>o.draw());
  ambient(1);
  // ひらめきの 電球
  if(S.bulb){ const a=ACT[0], t=S.bulb.t, up=Math.min(1,t/.15);
    ctx.globalAlpha = t>1.9 ? Math.max(0, 1-(t-1.9)/.3) : 1;
    if(Math.floor(t*12)%2===0){ ctx.fillStyle='rgba(255,240,140,.5)'; ctx.beginPath(); ctx.arc(a.x, a.y-38, 9, 0, Math.PI*2); ctx.fill(); }
    drawSpr('bulb', a.x, a.y-30-4*up, 2);
    ctx.fillStyle='#ffe14a'; for(let k=0;k<6;k++){ const ang=k*Math.PI/3+t*2; ctx.fillRect(Math.round(a.x+Math.cos(ang)*12), Math.round(a.y-38+Math.sin(ang)*10), 2, 1); }
    ctx.globalAlpha=1; }

  for(const p of PROJ){
    if(p.t<0) continue;
    const k=Math.min(1,p.t/p.dur);
    const x = lerp(p.x, p.tx, k), y = lerp(p.y, p.ty, k) - (p.arc||0)*Math.sin(Math.PI*k);
    p.cx=x; p.cy=y;
    if(p.kind==='arrow'){
      const ang=Math.atan2(p.ty-p.y, p.tx-p.x); ctx.strokeStyle='#5a3a22'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x-Math.cos(ang)*7, y-Math.sin(ang)*7); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(x), Math.round(y)-1, 2, 2);
    }else if(p.kind==='fire'){
      ctx.fillStyle='#ff6a2a'; ctx.fillRect(Math.round(x)-3, Math.round(y)-3, 6, 6);
      ctx.fillStyle='#ffe14a'; ctx.fillRect(Math.round(x)-1, Math.round(y)-1, 3, 3);
    }else if(p.kind==='bone'){
      ctx.fillStyle='#f0ecd8'; ctx.fillRect(Math.round(x)-4, Math.round(y)-1, 8, 2); ctx.fillRect(Math.round(x)-5, Math.round(y)-2, 2, 4); ctx.fillRect(Math.round(x)+3, Math.round(y)-2, 2, 4);
    }else if(p.kind==='coin'){
      ctx.fillStyle='#b8860b'; ctx.fillRect(Math.round(x)-2, Math.round(y)-2, 4, 4); ctx.fillStyle='#ffe14a'; ctx.fillRect(Math.round(x)-1, Math.round(y)-2, 2, 3);
    }else if(p.kind==='note'){
      ctx.fillStyle='#2e5a2e'; ctx.fillRect(Math.round(x)-2, Math.round(y), 3, 2); ctx.fillRect(Math.round(x), Math.round(y)-5, 1, 5); ctx.fillRect(Math.round(x)+1, Math.round(y)-5, 2, 1);
    }else if(p.kind==='star'){
      ctx.fillStyle='#5a5a7a'; ctx.fillRect(Math.round(x)-3, Math.round(y), 7, 1); ctx.fillRect(Math.round(x), Math.round(y)-3, 1, 7); ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }else if(p.kind==='orb' || p.kind==='clock'){
      const c1 = p.kind==='orb' ? '#ff7ac8' : '#e8c84a';
      ctx.fillStyle=c1; ctx.fillRect(Math.round(x)-2, Math.round(y)-2, 5, 5); ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(x)-1, Math.round(y)-1, 2, 2);
    }else if(p.kind==='rock'){
      ctx.fillStyle='#6a5a48'; ctx.fillRect(Math.round(x)-4, Math.round(y)-3, 8, 7);
      ctx.fillStyle='#9a8a70'; ctx.fillRect(Math.round(x)-3, Math.round(y)-3, 5, 3);
    }else if(p.kind==='rock'){
      ctx.fillStyle='#3a2e24'; ctx.fillRect(Math.round(x)-4, Math.round(y)-3, 8, 7);
      ctx.fillStyle='#8a7a68'; ctx.fillRect(Math.round(x)-3, Math.round(y)-2, 6, 5);
      ctx.fillStyle='#b0a08a'; ctx.fillRect(Math.round(x)-2, Math.round(y)-2, 3, 2);
    }else if(p.kind==='meteor'){
      ctx.fillStyle='#5a2a1a'; ctx.fillRect(Math.round(x)-4, Math.round(y)-4, 8, 8);
      ctx.fillStyle='#ff6a2a'; ctx.fillRect(Math.round(x)-3, Math.round(y)-3, 6, 6);
      ctx.fillStyle='#ffe14a'; ctx.fillRect(Math.round(x)-1, Math.round(y)-1, 3, 3);
    }else{
      ctx.fillStyle='#c8f070'; ctx.fillRect(Math.round(x)-2, Math.round(y)-2, 5, 5);
      ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(x)-1, Math.round(y)-1, 2, 2);
    }
  }
  for(const q of PARTS){ ctx.globalAlpha = clamp(q.life/q.max*1.6,0,1); ctx.fillStyle=q.col; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.sz, q.sz); }
  ctx.globalAlpha=1;
  artDraw(); maouDraw();
  for(const f of FX){
    if(f.t<0) continue;
    const p=f.t/f.dur;
    ctx.globalAlpha = 1-p;
    if(f.type==='wave'){
      const x = f.x + f.w*easeOut(p);
      ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(x), 52, 2, 52);
      ctx.fillStyle='#ffe14a'; ctx.fillRect(Math.round(x)-3, 58, 1, 40);
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(x-10, 100, 26, -Math.PI*.45, -Math.PI*.05); ctx.stroke();
    }else if(f.type==='pillar'){
      const x = f.x + f.w*easeOut(Math.min(1,p*1.6));
      ctx.fillStyle='#ffffff';
      for(let k=0;k<5;k++){ const px=x-k*9; if(px<f.x) continue; const h=60*(1-k*.15); ctx.globalAlpha=(1-p)*(1-k*.18); ctx.fillRect(Math.round(px)-1, Math.round(104-h), 3, Math.round(h)); }
      ctx.fillStyle='#ffe14a'; ctx.globalAlpha=1-p; ctx.fillRect(Math.round(x)+2, 30, 1, 70);
    }else if(f.type==='slash'){
      const q = easeOut(Math.min(1,p*2.5));
      const x2 = lerp(f.x1,f.x2,q), y2 = lerp(f.y1,f.y2,q);
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=5*(1-p)+1;
      ctx.beginPath(); ctx.moveTo(f.x1,f.y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.strokeStyle='#ffe14a'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(f.x1,f.y1); ctx.lineTo(x2,y2); ctx.stroke();
    }else if(f.type==='bite'){
      ctx.fillStyle='#ffffff';
      const o = Math.round(4*(1-p));
      for(let k=-1;k<=1;k++){ ctx.fillRect(Math.round(f.x)+k*3, Math.round(f.y)-5-o, 1, 3); ctx.fillRect(Math.round(f.x)+k*3, Math.round(f.y)+2+o, 1, 3); }
    }else if(f.type==='punch'){
      const r = 2+p*6; ctx.fillStyle='#ffffff';
      for(let k=0;k<6;k++){ const ang=k*Math.PI/3; ctx.fillRect(Math.round(f.x+Math.cos(ang)*r), Math.round(f.y+Math.sin(ang)*r), 2, 2); }
      ctx.fillStyle='#ffe14a'; ctx.fillRect(Math.round(f.x)-1, Math.round(f.y)-1, 3, 3);
    }else if(f.type==='xslash'){
      const r = 4+p*4; ctx.strokeStyle='#ffffff'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(f.x-r,f.y-r); ctx.lineTo(f.x+r,f.y+r); ctx.moveTo(f.x+r,f.y-r); ctx.lineTo(f.x-r,f.y+r); ctx.stroke();
    }else if(f.type==='boom'){
      ctx.fillStyle='rgba(255,140,60,.45)';
      ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r*(.4+.6*easeOut(p)), f.r*.75*(.4+.6*easeOut(p)), 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ffe14a'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r*easeOut(p), f.r*.75*easeOut(p), 0, 0, Math.PI*2); ctx.stroke();
    }else if(f.type==='holy'){
      const w = f.w*(1-p*.5);
      ctx.fillStyle='rgba(255,246,200,.7)'; ctx.fillRect(Math.round(f.x-w/2), 0, Math.round(w), GROUND+8);
      ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(f.x-w/6), 0, Math.max(1,Math.round(w/3)), GROUND+8);
    }else if(f.type==='rise'){
      // おきあがり: 白く 光りながら こちらを むいて 立ちあがる
      ctx.globalAlpha = p<.7 ? 1 : 1-(p-.7)/.3;
      drawSpr(f.key, f.x, f.y - 6*easeOut(Math.min(1,p*2)), f.s, {white: Math.floor(f.t*16)%2===0, sqy: .6+.4*Math.min(1,p*3)});
      ctx.fillStyle='#ffe14a'; for(let k=0;k<5;k++){ const ang=f.t*5+k*1.26; ctx.fillRect(Math.round(f.x+Math.cos(ang)*12), Math.round(f.y-14+Math.sin(ang)*6-p*10), 2, 2); }
    }else if(f.type==='frost'){
      ctx.fillStyle='rgba(170,225,255,.45)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#ffffff'; for(let k=0;k<30;k++){ const x=(k*37+f.t*40)%W, y=(k*23+f.t*60)%H; ctx.fillRect(Math.round(x),Math.round(y),2,2); }
    }else if(f.type==='holyBig'){
      ctx.fillStyle='rgba(255,246,200,.55)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#ffffff';
      for(let k=0;k<8;k++){ const x = 100+k*13+Math.sin(f.t*10+k)*3; ctx.fillRect(Math.round(x), 0, 3, GROUND+8); }
    }else if(f.type==='rain'){
      ctx.globalAlpha=1; ctx.strokeStyle='#5a3a22'; ctx.lineWidth=1;
      for(let k=0;k<26;k++){ const sx = 100 + ((k*37 + f.t*300*((k%3)+1)) % 100); const sy = ((k*53 + f.t*420) % 120) - 10;
        ctx.beginPath(); ctx.moveTo(sx+3, sy-7); ctx.lineTo(sx, sy); ctx.stroke(); }
    }else if(f.type==='bolt'){
      ctx.strokeStyle='#fff6a0'; ctx.lineWidth=2; ctx.beginPath(); let x=f.x, y=0; ctx.moveTo(x,y);
      while(y<f.y){ y+=8; x+= (Math.random()-.5)*8; ctx.lineTo(x,Math.min(y,f.y)); } ctx.stroke();
    }else if(f.type==='ring'){
      ctx.strokeStyle=f.col; ctx.lineWidth=f.big?3:2;
      ctx.beginPath(); ctx.arc(f.x, f.y, (f.big?10:6)+p*(f.big?70:26), 0, Math.PI*2); ctx.stroke();
    }else if(f.type==='rays'){
      ctx.strokeStyle='#ffe14a'; ctx.lineWidth=2;
      for(let k=0;k<12;k++){ const a=k/12*Math.PI*2+.3; const r0=8+p*24, r1=r0+22+p*40;
        ctx.beginPath(); ctx.moveTo(f.x+Math.cos(a)*r0, f.y+Math.sin(a)*r0); ctx.lineTo(f.x+Math.cos(a)*r1, f.y+Math.sin(a)*r1); ctx.stroke(); }
    }else if(f.type==='cloud'){
      ctx.fillStyle=f.col||'rgba(200,240,112,.35)';
      ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r*(.5+.5*easeOut(p)), f.r*.7*(.5+.5*easeOut(p)), 0, 0, Math.PI*2); ctx.fill();
    }else if(f.type==='quake'){
      const r = 6 + p*CFG.quakeSpeed*f.dur;
      ctx.strokeStyle='#fff6d0'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.ellipse(f.x, f.y, r, r*.18, 0, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle='#b79c62'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.ellipse(f.x, f.y, r*.8, r*.14, 0, 0, Math.PI*2); ctx.stroke();
    }
  }
  ctx.globalAlpha=1;
  ctx.setTransform(1,0,0,1,0,0);
  if(S.cut){
    const t=S.cut.t, d=S.cut.dur, open = clamp(t/.08,0,1)*clamp((d-t)/.1,0,1);
    const hh = Math.round(24*open), cy=46;
    ctx.fillStyle='rgba(27,22,38,.88)'; ctx.fillRect(0, cy-hh, W, hh*2);
    ctx.fillStyle='#ffe14a';
    for(let k=0;k<9;k++){ const lx = W - ((t*420 + k*53) % (W+60)); const ly = cy-hh+4+((k*13)% Math.max(1,hh*2-8)); ctx.fillRect(Math.round(lx), ly, 18, 1); }
    if(open>.5 && S.cut.solo){
      const hx = lerp(-30, 80, easeOut(clamp(t/.18,0,1))) + Math.max(0,t-.18)*16;
      drawSpr(S.cut.solo, hx, cy+22, 4);
    }else if(open>.5){
      const hx = lerp(-30, 70, easeOut(clamp(t/.22,0,1))) + Math.max(0,t-.22)*20;
      drawSpr(CH[0].spr, hx, cy+20, 3);
      ACT.slice(1).forEach((a,k)=>{ const kx = lerp(-60-k*20, 120+k*22, easeOut(clamp((t-.06-k*.04)/.22,0,1))); drawSpr(a.c.spr, kx, cy+18, 2); });
    }
  }
  const hn=performance.now(); if(hn-_hudT >= 40 || mode!=='battle'){ _hudT=hn; renderHud(); }
}
function renderHud(){
  setT('#lvPill', 'Lv'+P.hero.lv); setT('#goldPill', fmt(P.gold)+'G');
  if(mode!=='battle') return;
  const l = living();
  const hp = S.es.reduce((s,e)=>s+Math.max(0,e.hp),0), mx = S.es.reduce((s,e)=>s+e.max,0)||1;
  setW('#ehpf', hp/mx*100);
  setT('#ename', S.waveName+'　のこり '+l.length+' / '+S.wave);
  const airN = l.filter(e=>e.air>0).length;
  setT('#airtag', airN ? airN+'体 うちあげ中！' : '');
  updateChance(airN);
  if(_dom.airshow!==!!airN){ _dom.airshow=!!airN; $('#airtag').style.display = airN?'block':'none'; }
  setT('#combonum', S.combo+'<small>HIT</small>', true);
  { const w = Math.round(jobProg()*100); if(_dom.jpw !== w){ _dom.jpw = w; const f = $('#jpFill'); if(f) f.style.transform = 'scaleX('+(w/100)+')'; } }
  setT('#chain', S.chain>=2 ? '連携 ×'+chainMul().toFixed(2)+(S.chain>=CFG.chainMax?' MAX':'') : '　');
  renderHist();
  setW('#phpf', Math.max(0,S.php/S.pmax*100)); setT('#phptxt', fmt(Math.max(0,S.php))+'/'+fmt(S.pmax));
  for(let i=0;i<CH.length;i++){
    const full=S.sp[i]>=100;
    const ch = Math.round(S.cd[i]>0 ? S.cd[i]/S.cdMax[i]*50 : 0)*2;
    if(_dom['cd'+i]!==ch){ _dom['cd'+i]=ch; const el=$('#cb'+i+' .cd'); if(el) el.style.transform = 'scaleY('+(ch/100)+')'; }
    setW('#sb'+i+' .fill', S.sp[i]);
    if(_dom['sp'+i]!==full){ _dom['sp'+i]=full; $('#sb'+i).classList.toggle('ready',full); }
  }
  for(let k=0;k<4;k++){ const ch = Math.round(S.scd[k]>0 ? S.scd[k]/S.scdMax[k]*50 : 0)*2; if(_dom['scd'+k]!==ch){ _dom['scd'+k]=ch; const el=$('#kb'+k+' .cd'); if(el) el.style.transform='scaleY('+(ch/100)+')'; } }
  if(S.solo) renderAllyStripHud();
  for(let i=1;i<CH.length;i++){ const full=S.sp2[i]>=100; setW('#sc'+i+' .fill', S.sp2[i]); if(_dom['sp2'+i]!==full){ _dom['sp2'+i]=full; $('#sc'+i).classList.toggle('ready',full); } }
}
let lastHist = '';
function renderHist(){
  const key = S.hist.slice(-6).join(',');
  if(key===lastHist) return; lastHist = key;
  $('#hist').innerHTML = S.hist.slice(-6).map(id=>imgTag(SPR_OF(id))).join('');
}
let prev=performance.now(), frameN=0;
const MODAL = $('#modal');
// 120Hzの スマホでも 60（または 30）回/秒 だけ 描く
let _nextT = 0;
const PERF = {n:0, work:0, t0:0, el:null};
function loop(now){
  requestAnimationFrame(loop);
  const iv = 1000/(P.opt.fps30 ? 30 : 60);
  if(now < _nextT - 2) return;
  _nextT = now - _nextT > iv ? now + iv : _nextT + iv;   // 90Hz などでも 平均 60回/秒に そろえる
  let dt=Math.min(.05,(now-prev)/1000); prev=now;
  const w0 = performance.now();
  if(mode==='battle' && !MODAL.hidden){ render(); return; }   // ポーズ中（モーダルを ひらいている あいだは 止める）
  if(S.hs>0){ S.hs-=dt; dt=0; }
  if(mode==='battle'){ let tot = dt*battleSpd(); while(tot > 1e-6){ const d = Math.min(tot, 1/60); update(d); tot -= d; } } else update(dt);
  camUpdate(dt); render();
  if(P.opt.meter){
    PERF.n++; PERF.work += performance.now()-w0;
    if(now - PERF.t0 >= 1000){
      if(!PERF.el){ PERF.el = document.createElement('div'); PERF.el.className='perf'; $('#stage').appendChild(PERF.el); }
      const fps = PERF.n*1000/(now-PERF.t0), ms = PERF.work/Math.max(1,PERF.n);
      PERF.el.textContent = `${Math.round(fps)}fps ${ms.toFixed(1)}ms 敵${S.es ? S.es.filter(e=>!e.dead).length : 0}`;
      PERF.el.style.color = fps < (P.opt.fps30?27:52) ? '#ff5a3a' : '#fff';
      PERF.n = 0; PERF.work = 0; PERF.t0 = now;
    }
  }else if(PERF.el){ PERF.el.remove(); PERF.el = null; }
}
