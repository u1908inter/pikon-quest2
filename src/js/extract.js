// ===== 力の抽出（ユニーク装備を こわして 力だけを のこす） =====
const powCount = () => 3 + (facLv('forge') >= 3 ? 1 : 0) + (facLv('forge') >= 5 ? 1 : 0);
const pslotList = () => { P.pslots = P.pslots || []; while(P.pslots.length < powCount()) P.pslots.push(null); return P.pslots.slice(0, powCount()); };
// はめた 力（同じ ユニークを そうびしていれば 二重には 効かない）
function applyPowers(s){
  const eq = new Set(equipped().map(it=>it.u).filter(Boolean));
  for(const u of pslotList()) if(u && UNIQ[u] && P.extracted[u] && !eq.has(u)) UNIQ[u].fx(s);
}
function extractAsk(id){
  const it = P.inv.find(x=>x.id===id); if(!it || !it.u || P.extracted[it.u]) return;
  const lost = [it.ref?`精錬 +${it.ref}`:'', (it.cards||[]).some(Boolean)?'挿した カード':''].filter(Boolean);
  showModal(`<h2>力を 抽出する？</h2><p><span class="r3">${esc(it.name)}</span> を こわして、力だけを のこす。</p>
    <p class="r3" style="font-weight:700">◆ ${UNIQ[it.u].p}</p>
    <p class="hint">抽出した 力は ジョブタブの「抽出した力の枠」に はめると、どの 装備でも 効果が 出る。装備は なくなる${lost.length?`（${lost.join('・')}も きえる）`:''}。</p>
    <div class="opts"><button class="btn" data-m="close">やめる</button><button class="btn danger" data-m="x-do" data-id="${it.id}">抽出する</button></div>`);
}
function panelPowers(){
  const ks = Object.keys(UNIQ), ex = ks.filter(u=>P.extracted[u]);
  let h = `<h3>抽出した力の枠（${powCount()}枠）</h3>
    <p class="hint">ユニーク装備から 抽出した 力を はめる 専用の 枠。施設の 工房を Lv3・Lv5に すると 1枠ずつ ふえる。</p><div class="mslots">`;
  pslotList().forEach((u,i)=>{
    h += `<button class="mslot ${u?'on':''}" data-act="x-slot" data-i="${i}"><span class="cat spc">力</span><br>${u ? `<b>${UNIQ[u].n}</b><br><span class="hint">${UNIQ[u].p}</span>` : `<span class="hint">${ex.length?'タップで えらぶ':'まだ 力が ない'}</span>`}</button>`;
  });
  h += `</div><h3>抽出した力（${ex.length}/${ks.length}）</h3>`;
  h += ex.length ? `<div class="loot">${ex.map(u=>`<div><span class="r3">◆ ${UNIQ[u].n}</span> <span class="hint">${UNIQ[u].p}</span></div>`).join('')}</div>`
    : `<p class="hint">装備タブで ユニーク装備を タップ →「力を抽出」で、装備と ひきかえに 力だけを のこせる。</p>`;
  return h;
}
function pslotModal(i){
  const cur = pslotList()[i], used = new Set(pslotList().filter(Boolean));
  const ex = Object.keys(UNIQ).filter(u=>P.extracted[u]);
  showModal(`<h2>力を はめる（枠${i+1}）</h2>
    ${ex.length ? `<div class="list">${ex.map(u=>`<button class="li ${cur===u?'sel':''}" data-m="x-set" data-i="${i}" data-u="${u}" ${used.has(u)&&cur!==u?'disabled':''}><div class="body"><div class="t"><span class="r3">${UNIQ[u].n}</span><span class="hint">${SLOTN[UNIQ[u].slot]}</span></div><div class="d">${UNIQ[u].p}</div></div></button>`).join('')}</div>`
      : `<p class="hint">まだ 抽出した 力が ない。</p>`}
    <div class="opts">${cur?`<button class="btn" data-m="x-set" data-i="${i}" data-u="">はずす</button>`:''}<button class="btn" data-m="close">とじる</button></div>`);
}
$('#panel').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-act="x-slot"]'); if(!b) return;
  pslotModal(+b.dataset.i);
});
$('#modal').addEventListener('click', ev=>{
  const b = ev.target.closest('[data-m^="x-"]'); if(!b) return;
  const m = b.dataset.m;
  if(m==='x-ask') extractAsk(+b.dataset.id);
  else if(m==='x-do'){
    const it = P.inv.find(x=>x.id===+b.dataset.id); if(!it || !it.u || P.extracted[it.u]) return;
    const fresh = !P.extracted[it.u];
    P.extracted[it.u] = true; P.inv = P.inv.filter(x=>x!==it);
    const i = pslotList().indexOf(null); if(fresh && i>=0) P.pslots[i] = it.u;
    refreshHS(); save();
    showModal(`<h2>力を 抽出した！</h2><p class="r3" style="font-weight:800">◆ ${UNIQ[it.u].n}</p><p>${UNIQ[it.u].p}</p>
      <p class="hint">${fresh ? (i>=0 ? '空いている 力の枠に はめた。' : '力の枠が いっぱい。ジョブタブで 入れかえられる。') : 'この 力は すでに 抽出ずみ だった。'}</p>
      <div class="opts"><button class="btn primary" data-m="close">OK</button></div>`);
    renderCamp();
  }
  else if(m==='x-set'){ pslotList(); P.pslots[+b.dataset.i] = b.dataset.u || null; refreshHS(); save(); hideModal(); renderCamp(); }
});
