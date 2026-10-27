// ===== 1000階より 先の おたのしみ: ひかりのかけら・神器の 強化・技の 極・ゆうしゃの 見た目・拠点の 飾り =====
// --- ひかりのかけら（1000階より 上で だけ 手に入る） ---
function gainLshard(n){ if(!n) return; P.lshard = (P.lshard||0) + n; if(R){ R.mats = R.mats || {}; R.mats.lshard = (R.mats.lshard||0) + n; } }
// --- 神器の 強化（種類ごとに ✦0〜✦10。抽出した 力にも 効く） ---
const ART_MAX = 10;
const artLv = k => (P.artLv && P.artLv[k]) || 0;
const artMul = k => 1 + .2*artLv(k);                 // 神器の 力の 威力 +20%/段
const artUpOpen = () => towerPeak() >= 1000;
const artUpCost = k => { const n = artLv(k) + 1; return {sh: 3*n, g: 2e6*n}; };
function artUp(k){
  if(!artUpOpen() || artLv(k) >= ART_MAX) return false;
  const c = artUpCost(k); if((P.lshard||0) < c.sh || P.gold < c.g) return false;
  P.lshard -= c.sh; P.gold -= c.g; P.artLv = P.artLv || {}; P.artLv[k] = artLv(k) + 1; save(); return true;
}
function artUpModal(k, back){
  const lv = artLv(k), c = artUpCost(k), mx = lv >= ART_MAX, ok = !mx && (P.lshard||0) >= c.sh && P.gold >= c.g;
  showModal(`<h2 class="r5">神器の 強化</h2><p><b class="r5">${ARTI[k].n}</b>　✦${lv}${mx ? '（最大）' : ` → <b class="r3">✦${lv+1}</b>`}</p>
    <p class="hint">${ARTI[k].p}<br>強化すると この 神器の 力の 威力が 1段 ごとに +20%（いま +${20*lv}%）。抽出した 力にも 効く。</p>
    ${mx ? '' : `<p style="font-size:13px;line-height:1.8">ひつような もの<br>・ひかりのかけら ×${c.sh}（いま ${fmt(P.lshard||0)}）<br>・${fmt(c.g)}G（いま ${fmt(P.gold)}G）</p>`}
    <p class="hint">ひかりのかけらは 無限の塔 1000階より 上の 魔物と ボス階で 手に入る。</p>
    <div class="opts"><button class="btn" data-m="${back ? 'au-back' : 'close'}" data-id="${back||''}">もどる</button>${mx ? '' : `<button class="btn primary" data-m="au-do" data-k="${k}" data-id="${back||''}" ${ok?'':'disabled'}>${ok ? '強化する' : 'たりない'}</button>`}</div>`);
}
$('#modal').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-m]'); if(!b) return; const m = b.dataset.m;
  if(m === 'au-open') artUpModal(b.dataset.k, b.dataset.id);
  else if(m === 'au-do'){ const k = b.dataset.k; if(artUp(k)){ flash(); SFX.lvup(); refreshHS(); artUpModal(k, b.dataset.id); if(mode==='camp') renderCamp(); } }
  else if(m === 'au-back'){ const id = +b.dataset.id; if(id) itemModal(id); else hideModal(); }
});
// --- 技の 極（★5の 先。1000階に とどくと ひらく） ---
const kiwamiOpen = () => towerPeak() >= 1000;
// --- ゆうしゃの 見た目（光: 1000階、闇: 2000階） ---
const SKINS = [{k:'', n:'ふつう', f:0}, {k:'L', n:'光のゆうしゃ', f:1000}, {k:'D', n:'闇のゆうしゃ', f:2000}];
const skinOpen = k => { const s = SKINS.find(x=>x.k===k); return !!s && towerPeak() >= s.f; };
{ const mix = (a, b, t) => { const p = h => [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)), A = p(a), B = p(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join(''); };
  for(const j of JOB_KEYS){ const base = SPR['hero_'+j]; if(!base) continue; const B = base.pal.B || '#2f64cc';
    VAR('hero_'+j+'_L', 'hero_'+j, {B: mix(B, '#fff6c0', .55), H:'#f2c23e', P:'#fff0c8', k:'#8a6a20', Y:'#ffffff', s:'#fff0d8', g:'#ffffff'});
    VAR('hero_'+j+'_D', 'hero_'+j, {B: mix(B, '#1a0a20', .6), H:'#2a1440', P:'#1a0a20', k:'#000000', e:'#ff3a3a', Y:'#c8324a', s:'#d8c0d8', g:'#9a4ae0'}); } }
// --- 拠点の 飾り（塔の 記録で ふえる） ---
function campTrophies(){
  const b = towerPeak(); if(!b) return; const t = S.time;
  if(b >= 100){   // テントの 上に 金の 旗
    const fx = 163, fy = 50, wv = Math.round(Math.sin(t*4)*1);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(fx-1, fy, 1, 9);
    ctx.fillStyle = '#f2c23e'; ctx.fillRect(fx, fy, 6, 2); ctx.fillRect(fx, fy+2, 5+wv, 2); ctx.fillStyle = '#c89a20'; ctx.fillRect(fx, fy+4, 3, 1);
  }
  if(b >= 300){   // 紫の ランタン
    const al = .55 + .25*Math.sin(t*3); ctx.fillStyle = 'rgba(154,74,224,'+(al*.35)+')'; ctx.beginPath(); ctx.arc(131, 78, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a2a4a'; ctx.fillRect(130, 72, 3, 1); ctx.fillStyle = '#c8a0ff'; ctx.fillRect(129, 74, 5, 6); ctx.fillStyle = '#ffffff'; ctx.fillRect(130, 76, 1, 2);
  }
  if(b >= 500){   // 塔の 模型
    const x = 121, y = 62;
    ctx.fillStyle = '#5a5a6a'; ctx.fillRect(x, y+6, 8, 26); ctx.fillStyle = '#7a7a8a'; ctx.fillRect(x+1, y+6, 3, 26);
    ctx.fillStyle = '#4a4a5a'; for(let k=0;k<4;k++) ctx.fillRect(x+2, y+10+k*6, 4, 2);
    ctx.fillStyle = '#6a6a7a'; ctx.fillRect(x-1, y+4, 10, 2); ctx.fillRect(x+1, y+1, 6, 3);
  }
  if(b >= 1000){   // 塔の てっぺんに 光る 電球
    const al = .5 + .5*Math.sin(t*2.5);
    ctx.fillStyle = 'rgba(255,240,140,'+(.25+.25*al)+')'; ctx.beginPath(); ctx.arc(125, 60, 6+2*al, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffe14a'; ctx.fillRect(123, 57, 4, 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(124, 58, 1, 1); ctx.fillStyle = '#a8a8b0'; ctx.fillRect(124, 61, 2, 1);
  }
  if(b >= 2000){   // 光と 闇の 粒が 塔の まわりを まわる
    for(let k=0;k<6;k++){ const a = t*1.6 + k*Math.PI/3; ctx.fillStyle = k%2 ? '#9a4ae0' : '#ffe14a'; ctx.fillRect(Math.round(125 + Math.cos(a)*9), Math.round(76 + Math.sin(a)*4 - k*3), 1, 1); }
  }
  if(b >= 3000){   // 空に 星
    for(let k=0;k<8;k++){ const al = Math.max(0, Math.sin(t*1.3 + k*1.9)); if(al < .3) continue; ctx.globalAlpha = al; ctx.fillStyle = '#fff6c0';
      const x = 10 + ((k*37) % 180), y = 6 + ((k*13) % 24); ctx.fillRect(x, y, 1, 1); if(al > .85){ ctx.fillRect(x-1, y, 3, 1); ctx.fillRect(x, y-1, 1, 3); } } ctx.globalAlpha = 1;
  }
  if(b >= 5000){   // 花火
    const ph = (t % 4)/4, cx = 40 + 120*((Math.floor(t/4)*0.37) % 1), cy = 22;
    if(ph < .6){ const r = ph*30; ctx.globalAlpha = 1 - ph/.6; for(let k=0;k<12;k++){ const a = k*Math.PI/6; ctx.fillStyle = ['#ffe14a','#ff6ad5','#6ad5ff'][k%3]; ctx.fillRect(Math.round(cx+Math.cos(a)*r), Math.round(cy+Math.sin(a)*r*.7), 1, 1); } ctx.globalAlpha = 1; }
  }
}
