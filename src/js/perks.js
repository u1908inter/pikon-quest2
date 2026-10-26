// ===== 特典の 一覧（なにで ひらくか・どこまで 進んだか） =====
// ネタバレを ふせる ことば（まだ 見ていない ものは ？？？）
function veilWords(){
  const m = [];
  for(let st=5; st>=1; st--) if(!((P.clear[st-1]||0) >= 1 || (P.clear[st]||0) >= 1)) m.push(STAGES[st].n);
  if(!towerOpen()) m.push('無限の塔');
  if(!Object.keys(P.artFound||{}).length) m.push('神器');
  if((P.clear[5]||0) < TOWER_RD-1) m.push('魔王');
  if(!jobOpen('suppin')) m.push('すっぴん');
  if(refCap() < 11) m.push('+11');
  return m;
}
const veil = s => { if(!s) return s; for(const w of veilWords()) s = s.split(w).join('？？？'); return s; };
const pg = (cur, need, t) => ({r: Math.max(0, Math.min(1, cur/need)), t: t || `${fmt(Math.min(cur,need))} / ${fmt(need)}`});
const pgAll = (...ps) => ({r: ps.reduce((a,p)=>a+p.r,0)/ps.length, t: ps.map(p=>p.t).join('　')});
const stClear = (st, rd) => pg(clearedRd(st) >= rd ? 1 : 0, 1, clearedRd(st) >= rd ? 'クリア済み' : `${STAGES[st].n} ${rd}周目 未クリア`);
const JOB_PROG = {
  mahouken: () => pgAll(pg(jobLv('senshi'),5,`戦士Lv ${Math.min(5,jobLv('senshi'))}/5`), pg(jobLv('mahou'),5,`魔法使いLv ${Math.min(5,jobLv('mahou'))}/5`)),
  ryuukishi:() => stClear(3,1),
  shoukan:  () => pg(P.stats.recruits||0, 15, `仲間 ${Math.min(15,P.stats.recruits||0)}/15体`),
  jikuu:    () => pg(Object.keys(P.skills).length, 6, `ひらめき技 ${Math.min(6,Object.keys(P.skills).length)}/6`),
  ginyuu:   () => pgAll(pg(jobLv('souryo'),5,`僧侶Lv ${Math.min(5,jobLv('souryo'))}/5`), pg(P.stats.recruits||0,10,`仲間 ${Math.min(10,P.stats.recruits||0)}/10体`)),
  akindo:   () => { const n=(P.stats2.mktSold||0)+(P.stats2.stallSold||0); return pg(n,10,`市場で 売った ${Math.min(10,n)}/10回`); },
  asobi:    () => stClear(5,1),
  kenja:    () => pg(jobLv('asobi'), JOB_MAX, `遊び人Lv ${jobLv('asobi')}/${JOB_MAX}`),
  mamono:   () => stClear(1,2), ninja: () => stClear(2,2), odori: () => stClear(3,2), samurai: () => stClear(4,2), abyssk: () => stClear(5,2),
  suppin:   () => { const n=MAIN_JOBS.filter(k=>jobLv(k)>=JOB_MAX).length; return pg(n, MAIN_JOBS.length, `マスター ${n}/${MAIN_JOBS.length}`); },
};
function perkList(){
  const L = [];
  const add = (cat, n, d, done, p) => L.push({cat, n, d, done:!!done, p: done ? {r:1, t:'達成'} : p});
  // ひらめき技の 枠
  SKILL_UNLOCK.forEach((u,k)=>{ if(!u) return; add('ゆうしゃ', `ひらめき技の 枠 ${k+1}つめ`, `${STAGES[u.st].n}（1周目）を クリア`, (P.clear[u.st]||0)>=1, stClear(u.st,1)); });
  add('ゆうしゃ', '仲間も 自分で 操作 ＋ かくし連携', `${CTRL_ROUND}周目の 魔界を クリア`, allyCtrlOpen(), pg(P.clear[5]||0, CTRL_ROUND, `魔界 ${Math.min(CTRL_ROUND,P.clear[5]||0)}/${CTRL_ROUND}周目`));
  // アビリティの 自由枠
  for(let k=1;k<=4;k++){ const need=3*k, m=mastersCount(); add('ゆうしゃ', `アビリティの 自由枠 ${k}つめ`, `ジョブを ${need}つ マスター`, m>=need, pg(m, need, `マスター ${Math.min(need,m)}/${need}`)); }
  // ジョブ
  for(const k of JOB_KEYS){ const J=JOBS[k]; if(!J.unlock) continue;
    add('ジョブ', J.abyss && !jobOpen(k) ? '？？？' : `${J.n}`, J.hint||'', jobOpen(k), (JOB_PROG[k]||(()=>pg(0,1,'')))()); }
  // 周回
  for(let rd=2; rd<=10; rd++){ const t = traitsOf(rd)[0]; const cl = P.clear[5]||0;
    const seen = cl >= rd-1;
    add('周回', `${rd}周目：${seen ? TRAITS[t].n : '？？？'}`, seen ? TRAITS[t].d + (t==='maou' ? '（倒すと 伝説の 装備）' : '') : 'どんな 周回かは とどいてからの おたのしみ', seen, pg(cl, rd-1, `魔界 ${Math.min(rd-1,cl)}/${rd-1}周目 クリア`)); }
  { const cl = P.clear[5]||0; add('周回', cl>=10 ? '11周目〜：特色が 2つ 重なる' : '11周目〜：？？？', cl>=10 ? '周回ごとに ちがう 組み合わせ' : 'とどいてからの おたのしみ', cl>=10, pg(cl, 10, `魔界 ${Math.min(10,cl)}/10周目 クリア`)); }
  // おまけ
  { const cl = P.clear[5]||0;
    for(const s of SPD_UNLOCK.filter(s=>s.rd>0)) add('おまけ', `バトル速度 ×${s.v}`, `${s.rd}周目の 魔界を クリア（戦闘画面の 速度ボタン）`, cl>=s.rd, pg(cl, s.rd, `魔界 ${Math.min(s.rd,cl)}/${s.rd}周目 クリア`));
    add('おまけ', '精錬 +11', `${REF11_RD}周目の 魔界を クリア（+11で 基本性能 15倍。成功率 5%）`, cl>=REF11_RD, pg(cl, REF11_RD, `魔界 ${Math.min(REF11_RD,cl)}/${REF11_RD}周目 クリア`));
    add('おまけ', '無限の塔', `${TOWER_RD}周目の 魔界を クリア（出撃ページに あらわれる）`, towerOpen(), pg(cl, TOWER_RD, `魔界 ${Math.min(TOWER_RD,cl)}/${TOWER_RD}周目 クリア`));
  }
  // 神器
  { const n = Object.keys(P.artFound||{}).length, all = Object.keys(ARTI).length;
    add('あつめる', `神器 コレクション`, '7本 そろえると 神器の力の枠が 2つに なる（無限の塔の 50階ごと・ボス階、11周目からの 魔界ボスで 手に入る）', n>=all, pg(n, all, `${n}/${all}本`)); }
  // カード・施設
  { const n = albumCount(), all = Object.keys(CARDS).length; add('あつめる', 'カード帖 コンプリート', 'ひらめき率 +20%', n>=all, pg(n, all, `${n}/${all}まい`)); }
  for(const lv of [3,5]){ const f = facLv('forge'); add('あつめる', `抽出した 力の 枠 +${lv===3?1:2}`, `町の 施設「工房」を Lv${lv}に`, f>=lv, pg(f, lv, `工房 Lv${Math.min(lv,f)}/${lv}`)); }
  return L;
}
function panelPerks(){
  const L = perkList(), done = L.filter(x=>x.done).length;
  const cats = [...new Set(L.map(x=>x.cat))];
  let h = (P.seen && P.seen.ending ? `<div class="row" style="margin-bottom:6px"><button class="btn sm" data-act="ending">🎬 エンディングを 見なおす</button></div>` : '') + `<div class="kv"><span><i>特典</i>${done} / ${L.length}</span><span><i>最高の 周回</i>${P.clear[5]||0}周目 クリア</span><span><i>ジョブ</i>${JOB_KEYS.filter(jobOpen).length} / ${JOB_KEYS.length}</span><span><i>マスター</i>${mastersCount()} / ${MAIN_JOBS.length}</span></div>
    <div class="bar" style="margin:4px 0 8px"><i style="background:var(--gold);transform:scaleX(${done/L.length})"></i></div>`;
  for(const c of cats){
    const xs = L.filter(x=>x.cat===c);
    h += `<h3>${c}（${xs.filter(x=>x.done).length}/${xs.length}）</h3><div class="list">`;
    // 未達成は 進んでいる順、達成は 下に
    xs.sort((a,b)=>(a.done-b.done) || (b.p.r-a.p.r));
    for(const x of xs) h += `<div class="li perk ${x.done?'done':''}" style="cursor:default"><div class="body">
      <div class="t"><span>${x.done?'✅':'🔒'} ${esc(veil(x.n))}</span><span class="hint">${x.done?'達成':Math.floor(x.p.r*100)+'%'}</span></div>
      <div class="d">${veil(x.d)}</div>
      ${x.done?'':`<div class="pbar"><i style="transform:scaleX(${x.p.r})"></i></div><div class="d hint">${veil(x.p.t)}</div>`}</div></div>`;
    h += `</div>`;
  }
  return h;
}
