// ===== ひらめき技（第3弾）: 各系統に 中堅2つ ＋ 奥義1つ =====
Object.assign(SK, {
  shippu:     {n:'疾風突き',   tree:'剣',   parent:'double',     req:40, cd:2.8, pose:'melee', d:'手前の 3体に 突進して 2連撃。2撃目で 打ち上げる'},
  jumonji:    {n:'十字斬り',   tree:'剣',   parent:'tsubame',    req:35, cd:3.0, pose:'air',   d:'空中の 敵 すべてを 十字に 斬る（2.6倍）。いなければ 手前を 斬り上げ'},
  tenchi:     {n:'天地両断',   tree:'剣',   parent:'rengoku',    req:70, cd:7.0, pose:'leap',  d:'【奥義】画面ごと 上下に 斬る。全員に 4倍、空中の 敵は 叩きつける'},
  shoryu:     {n:'昇龍拳',     tree:'体術', parent:'hiza',       req:40, cd:3.0, pose:'air',   d:'手前で いちばん 強い 敵を 高く 打ち上げる（2.8倍）'},
  shoutei:    {n:'掌底波',     tree:'体術', parent:'senpu',      req:40, cd:3.0, pose:'melee', d:'衝撃波で 一列の 敵を 吹き飛ばす（2.4倍）'},
  hyakka:     {n:'百花繚乱',   tree:'体術', parent:'hyaku',      req:70, cd:7.0, pose:'melee', d:'【奥義】全員に 16連撃の 嵐。しめに 全員を 打ち上げる'},
  gravity:    {n:'グラビティ', tree:'魔法', parent:'ice',        req:35, cd:3.2, pose:'cast',  d:'空中の 敵を 叩き落とす（2倍＋気絶）。地上の 敵は 足止め'},
  meteor:     {n:'メテオ',     tree:'魔法', parent:'thunder',    req:45, cd:4.5, pose:'cast',  d:'いん石が 6つ 降りそそぐ（まわりにも 当たる）'},
  ultima:     {n:'アルティメット', tree:'魔法', parent:'explode', req:75, cd:8.0, pose:'cast',  d:'【奥義】全員を 光の 大爆発で つつむ（5倍）'},
  sanren:     {n:'三連矢',     tree:'弓',   parent:'aim',        req:25, cd:2.4, pose:'bow',   d:'手前の 3体を 同時に 射ぬく（1.4倍・会心しやすい）'},
  raimei:     {n:'雷鳴の矢',   tree:'弓',   parent:'kagenui',    req:40, cd:3.4, pose:'bow',   d:'雷の 矢が 当たると 6体まで 連鎖する（空中の 敵を ねらう）'},
  senbon:     {n:'千本桜',     tree:'弓',   parent:'ryusei',     req:70, cd:7.0, pose:'bow',   d:'【奥義】矢の 雨が 全員に ふりそそぎ、しめに 足止め'},
  bunshin:    {n:'分身の術',   tree:'短剣', parent:'midare',     req:40, cd:3.2, pose:'melee', d:'分身と 同時に 手前の 4体を 斬る（2回）'},
  kubikari:   {n:'首狩り',     tree:'短剣', parent:'ansatsu',    req:55, cd:5.0, pose:'melee', d:'HP30%以下の 敵を まとめて 倒す（ボス以外）。ほかは 2.5倍の 会心'},
  yasha:      {n:'夜叉',       tree:'短剣', parent:'bunshin',    req:70, cd:7.0, pose:'melee', d:'【奥義】瞬間移動で 全員を 斬りぬける（1.8倍×2・会心しやすい）'},
  yaribusuma: {n:'槍衾',       tree:'槍',   parent:'kushizashi', req:40, cd:3.0, pose:'melee', d:'一直線の 敵を 3回 突きぬく（2.4倍）'},
  ryuseitsuki:{n:'流星突き',   tree:'槍',   parent:'tentotsu',   req:45, cd:3.6, pose:'air',   d:'空中から 突き下ろして 叩きつける（2.2倍＋気絶）'},
  tensou:     {n:'天槍',       tree:'槍',   parent:'ryuuga',     req:70, cd:7.0, pose:'cast',  d:'【奥義】光の 槍が 8本 降りそそぎ、しめに 全員に 一撃'},
  kagerou:    {n:'陽炎',       tree:'刀',   parent:'kasumi',     req:35, cd:2.8, pose:'melee', d:'残像と いっしょに いちばん 強い 敵を 2回 斬る（1.8倍・会心しやすい）'},
  samidare:   {n:'五月雨斬り', tree:'刀',   parent:'tsukikage',  req:45, cd:3.8, pose:'melee', d:'ランダムな 敵を 12回 斬る'},
  mumyou:     {n:'無明',       tree:'刀',   parent:'hiken',      req:75, cd:8.0, pose:'cast',  d:'【奥義】闇に つつみ、一瞬で 全員を 斬る（5.5倍・会心しやすい）'},
});
Object.assign(SK_TAGS, {shippu:'area up', jumonji:'air', tenchi:'area down', shoryu:'single up', shoutei:'area', hyakka:'area up',
  gravity:'down air', meteor:'area', ultima:'area', sanren:'area', raimei:'air area', senbon:'area stop',
  bunshin:'area', kubikari:'single', yasha:'area', yaribusuma:'area', ryuseitsuki:'down air', tensou:'area', kagerou:'single', samidare:'area', mumyou:'area'});
// 叩きつけ（空中の 敵を 地面へ）
const slam = (e, ok) => { if(!ok(e) || !(e.air>0)) return; e.vly = -480-rand(0,60); e.stun = Math.max(e.stun, 1.2); e.slamFx = true; e.bn = 0; e.rot = 0; };
function execSkill3(id, x){
  const {at, T, hit, ok, byFront, airs, lift, slashFx, manual, an} = x;
  const lane = () => { const f = byFront()[0]; return f ? living().filter(e=>low(e) && Math.abs(e.y-f.y) < 8).sort((p,q)=>p.x-q.x) : []; };
  const strongest = n => { const l = byFront().slice(0,n); return l.find(e=>e.boss) || l.sort((p,q)=>q.hp-p.hp)[0]; };
  const crit = p => ({crit: Math.random() < p});
  switch(id){
    case 'shippu': at(T, ()=>byFront().slice(0,3).forEach((e,j)=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.12}); hit(e,1.1,j>0); }));
      at(T+.14, ()=>byFront().slice(0,3).forEach((e,j)=>{ const b=eBox(e); FX.push({type:'slash', x1:b.cx-10, y1:b.fy, x2:b.cx+8, y2:b.top-6, t:0, dur:.16}); hit(e,1.1,true); lift(e,30); })); an.long=.15; break;
    case 'jumonji': at(T, ()=>{ const a=airs(); if(a.length){ a.forEach(e=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.22}); FX.push({type:'ring', x:b.cx, y:b.cy, t:0, dur:.2, col:'#ffffff'}); hit(e,2.6/1.5); }); float(a.length+'体 十字斬り！','tag',center().x,26); }
      else byFront().slice(0,2).forEach(e=>{ hit(e,1.5); lift(e,30); }); }); break;
    case 'tenchi': at(T, ()=>{ FX.push({type:'slash', x1:150, y1:-10, x2:152, y2:110, t:0, dur:.35}); FX.push({type:'slash', x1:60, y1:60, x2:200, y2:62, t:-.06, dur:.35}); flash(); shake(true); hitstop(.12);
      living().forEach((e,j)=>{ hit(e,4.0,j>0); slam(e, ok); }); }); break;
    case 'shoryu': at(T, ()=>{ const e=strongest(3); if(!e) return; const b=eBox(e); FX.push({type:'rays', x:b.cx, y:b.cy, t:0, dur:.35}); FX.push({type:'punch', x:b.cx-3, y:b.cy, t:0, dur:.15}); hit(e,2.8); lift(e,55); }); break;
    case 'shoutei': at(T, ()=>{ FX.push({type:'wave', x:frontX()-6, w:120, t:0, dur:.25}); shake(); lane().forEach((e,j)=>later(j*.02, ()=>{ hit(e,2.4,j>0); if(ok(e)) knock(e,4); })); }); break;
    case 'hyakka': for(let k=0;k<16;k++) at(T+k*.04, ()=>{ const l=living(); if(!l.length) return; const e=pick(l), b=eBox(e); FX.push({type:'punch', x:b.cx+rand(-4,4), y:b.cy+rand(-4,4), t:0, dur:.08}); hit(e,.7,true); });
      at(T+.7, ()=>{ flash(); shake(true); living().forEach((e,j)=>{ hit(e,1.5,j>0); lift(e,36); }); }); an.long=.6; break;
    case 'gravity': at(T, ()=>{ const c=center(); FX.push({type:'ring', x:c.x, y:c.y, t:0, dur:.4, col:'#9a4ae0', big:true}); let n=0;
      living().forEach((e,j)=>{ if(e.air>0){ hit(e,2.0/1.5,j>0,{mag:true}); slam(e, ok); n++; } else { hit(e,.8,j>0,{mag:true}); if(ok(e)) e.stun=Math.max(e.stun,.8); } }); if(n) float(n+'体 叩き落とし！','tag',c.x,26); }); break;
    case 'meteor': at(T, ()=>{ for(let k=0;k<6;k++) later(k*.09, ()=>{ const l=living(); if(!l.length) return; const t=pick(l), b=eBox(t), tx=b.cx, ty=b.cy;
      PROJ.push({kind:'meteor', x:tx+60, y:-16, tx, ty, t:0, dur:.22, arc:0, onHit:()=>{ FX.push({type:'boom', x:tx, y:ty, r:26, t:0, dur:.35}); shake(); near(tx, ty, 26).forEach((e,j)=>hit(e,1.2,j>0,{mag:true})); }}); }); }); an.long=.4; break;
    case 'ultima': at(T+.1, ()=>{ const c=center(); FX.push({type:'boom', x:c.x, y:c.y, r:110, t:0, dur:.6}); FX.push({type:'rays', x:c.x, y:c.y, t:0, dur:.6}); flash(); shake(true); hitstop(.14);
      living().forEach((e,j)=>hit(e,5.0,j>0,{mag:true})); }); an.long=.3; break;
    case 'sanren': at(T, ()=>byFront().slice(0,3).forEach((e,j)=>PROJ.push({kind:'arrow', x:ACT[0].x+8, y:ACT[0].y-14+j*2, tgt:e, t:-j*.03, dur:.12, arc:0, onHit:()=>{ if(ok(e)) hit(e,1.4,j>0,crit(.25)); }}))); break;
    case 'raimei': at(T, ()=>{ const l=living(), first=l.find(e=>e.air>0) || byFront()[0]; if(!first) return;
      PROJ.push({kind:'arrow', x:ACT[0].x+8, y:ACT[0].y-14, tgt:first, t:0, dur:.12, arc:0, onHit:()=>{ const chain=[first, ...living().filter(e=>e!==first).sort((p,q)=>(q.air>0)-(p.air>0)).slice(0,5)];
        chain.forEach((e,j)=>later(j*.05, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'bolt', x:b.cx, y:b.cy, t:0, dur:.18}); hit(e,1.1,j>0,{airX:e.air>0?1.3:1}); })); }}); }); break;
    case 'senbon': FX.push({type:'rain', t:-T, dur:1.0}); for(let k=0;k<12;k++) at(T+.1+k*.07, ()=>living().forEach((e,j)=>hit(e,.2,true)));
      at(T+1.0, ()=>living().forEach(e=>{ if(!ok(e)) return; if(e.boss) e.t += 1; else { e.stun=Math.max(e.stun,1.5); e.t=Math.max(e.t,1.5); } })); an.long=.8; break;
    case 'bunshin': [0,.15].forEach((d,r)=>at(T+d, ()=>byFront().slice(0,4).forEach((e,j)=>{ const b=eBox(e); FX.push({type:'xslash', x:b.cx+(r?3:-3), y:b.cy, t:0, dur:.12}); hit(e,1.0,j>0||r>0); }))); an.long=.15; break;
    case 'kubikari': at(T, ()=>{ let n=0; living().forEach(e=>{ if(!e.boss && e.hp < e.max*.3){ const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.2}); direct(e, e.hp+1); n++; } });
      if(n) float(n+'体 首狩り！','tag',center().x,26); byFront().slice(0,2).forEach((e,j)=>hit(e,2.5,j>0,{crit:true})); }); break;
    case 'yasha': at(T, ()=>{ flash(); [...living()].forEach((e,j)=>later(j*.04, ()=>{ if(!ok(e)) return; const b=eBox(e); FX.push({type:'xslash', x:b.cx, y:b.cy, t:0, dur:.14}); hit(e,1.8,j>0,crit(.3)); later(.25, ()=>hit(e,1.8,true,crit(.3))); })); }); an.long=.4; break;
    case 'yaribusuma': for(let k=0;k<3;k++) at(T+k*.1, ()=>{ FX.push({type:'wave', x:frontX()-6, w:140, t:0, dur:.15}); lane().forEach((e,j)=>hit(e,.8,j>0||k>0)); }); an.long=.25; break;
    case 'ryuseitsuki': at(T, ()=>{ const a=airs(); if(a.length){ a.forEach(e=>{ const b=eBox(e); FX.push({type:'slash', x1:b.cx-4, y1:b.top-16, x2:b.cx+2, y2:b.fy+4, t:0, dur:.2}); hit(e,2.2/1.5); slam(e, ok); }); shake(true); float(a.length+'体 叩きつけ！','tag',center().x,26); }
      else byFront().slice(0,3).forEach(e=>hit(e,1.4)); }); break;
    case 'tensou': for(let k=0;k<8;k++) at(T+k*.07, ()=>{ const l=living(); if(!l.length) return; const b=eBox(pick(l)); FX.push({type:'holy', x:b.cx, w:12, t:0, dur:.3}); near(b.cx, b.cy, 20).forEach((e,j)=>hit(e,1.0,true)); });
      at(T+.7, ()=>{ flash(); shake(true); living().forEach((e,j)=>hit(e,1.5,j>0)); }); an.long=.6; break;
    case 'kagerou': { const e0 = strongest(3); [0,.25].forEach((d,r)=>at(T+d, ()=>{ const e = e0 && ok(e0) ? e0 : strongest(3); if(!e) return; const b=eBox(e); if(r) ARTFX.push({k:'ghost', x:b.cx, y:b.cy, t:0, dur:.3}); FX.push({type:'slash', x1:b.cx-20, y1:b.cy-8, x2:b.cx+20, y2:b.cy+6, t:0, dur:.18}); hit(e,1.8,r>0,crit(.35)); })); an.long=.25; } break;
    case 'samidare': for(let k=0;k<12;k++) at(T+k*.045, ()=>{ const l=living(); if(!l.length) return; const e=pick(l), b=eBox(e); FX.push({type:'xslash', x:b.cx+rand(-3,3), y:b.cy+rand(-3,3), t:0, dur:.08}); hit(e,.6,true); }); an.long=.5; break;
    case 'mumyou': at(T, ()=>{ S.dark = .9; }); at(T+.25, ()=>{ FX.push({type:'slash', x1:60, y1:56, x2:200, y2:106, t:0, dur:.3}); FX.push({type:'slash', x1:60, y1:106, x2:200, y2:56, t:0, dur:.3}); flash(); shake(true); hitstop(.12);
      living().forEach((e,j)=>hit(e,5.5,j>0,crit(.3))); }); an.long=.3; break;
    default: return false;
  }
  return true;
}
