// ===== 技の 性質アイコン（どの 画面でも 同じ 記号で 見せる） =====
const TAG = {
  up:    {c:'↑', n:'浮かせ',     d:'敵を 打ち上げる。浮いた敵には だれの 攻撃でも 1.5倍'},
  down:  {c:'↓', n:'叩きつけ',   d:'空中の敵を 叩き落として 大ダメージ'},
  air:   {c:'☁', n:'空中に強い', d:'浮いている 敵に とくに 強い'},
  area:  {c:'◎', n:'範囲',       d:'たくさんの 敵に 当たる'},
  single:{c:'●', n:'単体',       d:'1体に 重い 一撃'},
  stop:  {c:'❄', n:'足止め',     d:'敵の 攻撃を 止める・おくらせる'},
  heal:  {c:'♥', n:'回復',       d:'パーティHPを 回復する'},
  burn:  {c:'炎', n:'燃焼',       d:'敵を 燃やして じわじわ ダメージ'},
  sleep: {c:'眠', n:'眠り',       d:'敵を 眠らせる（眠った敵は 受けるダメージ 1.3倍）'},
  poison:{c:'毒', n:'毒',         d:'敵を 毒にして じわじわ ダメージ'},
  buff:  {c:'強', n:'強化',       d:'仲間を 強くする・はやくする'},
  gold:  {c:'金', n:'お金',       d:'ゴールドを ぬすむ・かせぐ'},
  luck:  {c:'？', n:'運まかせ',   d:'なにが おきるか わからない'},
};
// ゆうしゃ: [通常攻撃, 職業技]
const JOB_TAGS = {
  senshi:['up area','up area air'], budou:['up','up'], mahou:['up area','up area'], touzoku:['air stop','area gold'],
  souryo:['up heal','area heal air'], kariudo:['air stop','area air'], mahouken:['up area burn','area burn stop'],
  ryuukishi:['air up','up area'], shoukan:['buff','area'], jikuu:['stop','stop area'], ginyuu:['buff','buff heal'],
  akindo:['gold','area gold'], asobi:['luck','luck'], kenja:['up area heal','area heal'], mamono:['up buff','buff'],
  ninja:['air','area'], odori:['up','area buff'], samurai:['up single','area'], abyssk:['up area','area'], suppin:['up area','up area air'],
};
// 仲間: [通常攻撃, 必殺技1, 必殺技2]
const FAM_TAGS = {
  slime:['up heal','heal','up area'], bat:['area stop','area air','area heal'], goblin:['up single','area','area gold'],
  wolf:['area','area stop','buff stop'], mush:['area air','area sleep','poison heal'], skel:['single stop','area','area'],
  golem:['down air','up down','area stop'], dragon:['up burn','area burn','up area'], maou:['area air','area stop','buff'], guard:['single stop','buff','up area'], shadow:['area air','area','area stop'], source:['area air','heal buff','area'],
};
const SK_TAGS = {
  slash:'area', double:'up', sweep:'area stop', tsubame:'air up', rengoku:'area burn', kick:'up', hiza:'air up', senpu:'up area',
  hyaku:'single', hakkei:'single stop', fireball:'area burn', ice:'stop', thunder:'air', blizzard:'area stop', explode:'area up',
  aim:'single', rapid:'air', kagenui:'air stop', ryusei:'area',
};
JOB_TAGS.spear = ['area up',''];
const tagList = s => (s||'').split(' ').filter(k=>TAG[k]);
const tagsHtml = (s, big) => { const l = tagList(s); return l.length ? `<span class="tgs${big?' big':''}">${l.map(k=>`<i class="tg tg-${k}" title="${TAG[k].n}">${TAG[k].c}</i>`).join('')}</span>` : ''; };
const tagsNamed = s => tagList(s).map(k=>`<i class="tg tg-${k}">${TAG[k].c}</i>${TAG[k].n}`).join(' ');
const tagLegend = () => `<div class="legend">${Object.keys(TAG).map(k=>`<span><i class="tg tg-${k}">${TAG[k].c}</i>${TAG[k].n}</span>`).join('')}</div>`;
const jobTag = (j, k) => (JOB_TAGS[j]||[])[k] || '';
const famTag = (sp, k) => (FAM_TAGS[famOf(sp)]||[])[k] || '';
// 戦闘中の キャラ（CH[i]）の 技の 性質。kind: 0=通常 1=必殺技1/職業技 2=必殺技2
function chTags(i, kind){
  const c = CH[i]; if(!c) return '';
  if(i===0) return kind===2 ? '' : jobTag(kind===0 ? atkId() : P.job, kind);
  return (FAM_TAGS[c.id]||[])[kind] || '';
}
const isChance = s => tagList(s).some(k=>k==='air' || k==='down');
// 「今が チャンス」: 浮いた敵が いるとき、空中に強い 技の ボタンを 光らせる
function updateChance(airN){
  const on = airN > 0 && mode==='battle' && !S.wait;
  const set = (id, flag) => { if(_dom['ch'+id]===flag) return; _dom['ch'+id]=flag; const el=$('#'+id); if(el) el.classList.toggle('chance', flag); };
  for(let i=0;i<4;i++){
    const has = i < CH.length;
    set('cb'+i, on && has && S.cd[i]<=0 && isChance(chTags(i,0)));
    set('sb'+i, on && has && S.sp[i]>=100 && isChance(chTags(i,1)));
    if(i>0) set('sc'+i, on && has && S.sp2[i]>=100 && isChance(chTags(i,2)));
  }
  for(let k=0;k<4;k++){ const sk = P.slots[k]; set('kb'+k, on && slotOpen(k) && !!sk && S.scd[k]<=0 && isChance(SK_TAGS[sk])); }
}

// はじめて 敵が 浮いたとき 1回だけ 教える
function airTip(){
  later(.2, ()=>{
    (S.tut ? tutTipPop : tip)('<b>敵が 浮いた！</b>　浮いた敵には <b>だれの 攻撃でも 1.5倍</b>。<i class="tg tg-air">☁</i>（空中に強い）や <i class="tg tg-down">↓</i>（叩きつけ）の 技で 追い打ちしよう。<b>青く 光った ボタン</b>が チャンス！');
    later(8, ()=>{ const t=$('#tip'); if(t && t.innerHTML.includes('敵が 浮いた')) tip(''); });
  });
}
