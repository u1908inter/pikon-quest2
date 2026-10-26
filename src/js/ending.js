// ===== エンディング（10周目の 魔界で 魔王を たおしたとき。特典ページから 見なおせる） =====
function endingMusic(){
  if(typeof BGM_SRC!=='undefined' && BGM_SRC.ending && bgmOn()) return;   // 曲が あるときは そちらを 流す
  try{
    audioInit();
    const N = [523,659,784,1047, 988,784,880,1047, 1175,1047,988,880, 784,880,988,1047];
    N.forEach((f,k)=>tone(f, f, .26, 'square', .11, k*.28));
    [262,330,392,523].forEach((f,k)=>tone(f, f, 1.1, 'triangle', .08, k*1.12));
    [1047,1319,1568,2093].forEach((f,k)=>tone(f, f, .5, 'square', .1, 4.6+k*.12));
  }catch(_){}
}
function endingHtml(){
  const sp = (k, w=40, st='') => imgTag(k, '', `width:${w}px;height:auto;image-rendering:pixelated;${st}`);
  const party = members();
  const mons = Object.keys(P.album||{}).filter(k=>EDEF[k]);
  const skills = Object.keys(P.skills||{}).filter(k=>SK[k]);
  const masters = JOB_KEYS.filter(k=>jobLv(k) >= JOB_MAX);
  const line = (a, b) => `<div class="er"><span>${a}</span><b>${b}</b></div>`;
  return `
  <div class="ed-roll">
    <div class="ed-gap"></div>
    <h1>ピコーン・クエスト2</h1>
    <p class="ed-sub">〜 たびの きろく 〜</p>
    <div class="ed-gap s"></div>
    <h2>ゆうしゃ</h2>
    <div class="ed-hero">${sp(heroSpr(), 56)}</div>
    ${line('ジョブ', JOBS[P.job].n)}${line('レベル', 'Lv'+P.hero.lv)}
    ${masters.length ? `<p class="ed-cap">マスターした ジョブ（${masters.length}）</p><p class="ed-list">${masters.map(k=>JOBS[k].n).join('　')}</p>` : ''}
    <h2>ともに 戦った 仲間</h2>
    <div class="ed-party">${party.length ? party.map(al=>`<div>${sp(al.sp, 48)}<br>${esc(allyName(al))}<br><span>Lv${al.lv}</span></div>`).join('') : '<p>ひとりで 魔王を たおした！</p>'}</div>
    ${line('あつまった 仲間', (P.allies||[]).length+'体')}
    <h2>ひらめいた 技</h2>
    <p class="ed-list">${skills.map(k=>SK[k].n).join('　')}</p>
    <h2>出会った 魔物たち</h2>
    <div class="ed-mons">${mons.map(k=>`<span>${sp(k, 32)}</span>`).join('')}</div>
    <h2>きろく</h2>
    ${line('たおした 魔物', fmt(P.stats.kills||0)+'体')}${line('出撃', fmt(P.stats.runs||0)+'回')}${line('クリア', fmt(P.stats.clears||0)+'回')}
    <div class="ed-gap s"></div>
    <h2>つくった人</h2>
    <p class="ed-big">u1908inter</p>
    <p class="ed-list" style="color:#aaa">ゲームデザイン・ドット絵・プログラム・音楽（AI作曲）</p>
    <div class="ed-gap s"></div>
    <h2>Special Thanks</h2>
    <p class="ed-big">ここまで あそんでくれた あなた</p>
    <div class="ed-gap"></div>
    <p class="ed-end">THE END</p>
    <div class="ed-gap s"></div>
  </div>`;
}
function playEnding(done){
  let el = document.getElementById('ending');
  if(!el){ el = document.createElement('div'); el.id = 'ending'; document.body.appendChild(el); }
  const party = [heroSpr(), ...members().map(a=>a.sp)];
  el.innerHTML = `<div class="ed-story"></div><div class="ed-scroll" hidden></div>
    <div class="ed-walk" hidden>${party.map((k,i)=>`<span style="animation-delay:${-i*.18}s">${imgTag(k,'','width:36px;height:auto;image-rendering:pixelated')}</span>`).join('')}</div>
    <div class="ed-after" hidden></div>
    <button class="ed-skip">スキップ ▶▶</button>`;
  el.hidden = false; el.className = 'on';
  const story = el.querySelector('.ed-story'), scroll = el.querySelector('.ed-scroll'), walk = el.querySelector('.ed-walk'), after = el.querySelector('.ed-after');
  const T = []; const at = (ms, fn) => T.push(setTimeout(fn, ms));
  let fin = false;
  const finish = () => {
    if(fin) return; fin = true; T.forEach(clearTimeout);
    story.hidden = true; scroll.hidden = true; walk.hidden = true; after.hidden = false; el.querySelector('.ed-skip').hidden = true;
    after.innerHTML = `<p class="ed-end">THE END</p>
      <p class="ed-teaser">…しかし、魔界の 奥に<br>天まで とどく 塔が そびえていた。</p>
      <p class="r5 ed-big">無限の塔が ひらいた！</p>
      <div class="row" style="justify-content:center;gap:8px"><button class="btn" data-share="ending">𝕏 シェア</button><button class="btn primary" id="edClose">拠点へ もどる</button></div>`;
    after.querySelector('#edClose').onclick = () => { el.hidden = true; el.className = ''; el.innerHTML = ''; done && done(); };
  };
  el.querySelector('.ed-skip').onclick = finish;
  const lines = ['魔王は たおれた…', '魔界に 光が もどり、', 'ゆうしゃと 仲間たちは 長い 旅を おえた。', `ひらめいた 技は ${Object.keys(P.skills).length}つ、たおした 魔物は ${fmt(P.stats.kills||0)}体。`, 'これは、その たびの きろく。'];
  lines.forEach((t,i)=>at(800 + i*2300, ()=>{ const p = document.createElement('p'); p.textContent = t; story.appendChild(p); }));
  const t0 = 800 + lines.length*2300 + 1200;
  at(t0, ()=>{ story.classList.add('out'); });
  at(t0+900, ()=>{ story.hidden = true; scroll.hidden = false; walk.hidden = false; scroll.innerHTML = endingHtml(); endingMusic();
    const roll = scroll.querySelector('.ed-roll'); const h = roll.scrollHeight, dur = Math.max(24, Math.min(50, h/40));
    roll.animate([{transform:`translateY(${scroll.clientHeight}px)`},{transform:`translateY(${-h + scroll.clientHeight*0.45}px)`}], {duration:dur*1000, easing:'linear', fill:'forwards'});
    at(dur*1000 + 1500, finish); });
}
