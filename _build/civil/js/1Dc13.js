
/* ---------- 装置 14：部长的一项新政 ---------- */
dev('#minFig', fig => {
  const say = $('#minSay'), log = $('#minLog'), box = $('#minBtns');
  // 事件：t 文本，real 是否真问题（硬推会出事），cost 照办耗的季度
  const EV = [
    {t: '部里建议先做一次为期十二周的公众咨询。', real: false},
    {t: '法律顾问提醒：方案的一条可能在法庭上被挑战（司法审查）。', real: true},
    {t: '财政部要求补交一份详细的成本测算，否则不批钱。', real: false},
    {t: '司长建议先在两个地区试点一年，看看效果。', real: true},
    {t: '这件事牵涉另外三个部，建议成立一个跨部门工作组。', real: false},
    {t: '执行机构说现有的信息系统改不过来，至少要一年。', real: true},
    {t: '常任秘书说，议会这个会期的立法时间表已经排满了。', real: false},
    {t: '一份内部评估发现，方案会让一部分低收入家庭受损。', real: true},
    {t: '部里起草了一份“备选方案”文件，列了五种做法供您选择。', real: false}
  ];
  let st, r;
  function reset(){
    r = rng(Date.now() % 100000);
    st = {q: 0, cap: 10, prog: 0, spad: false, pm: false, risk: 0, over: false, cur: null};
    log.textContent = '';
    next();
  }
  function next(){
    if (st.over) return;
    if (st.prog >= 100) return end('done');
    if (st.q >= 12) return end('time');
    if (st.q > 1 && r() < 0.07) return end('reshuffle');
    st.q++;
    st.cur = EV[Math.floor(r() * EV.length)];
    render();
    say.className = 'say'; say.innerHTML = '第 ' + st.q + ' 季度。' + st.cur.t;
  }
  function act(k){
    if (st.over) return;
    const e = st.cur; let line = '第 ' + st.q + ' 季度：' + e.t + ' → ';
    if (k === 0) { st.prog += e.real ? 12 : 6; if (e.real) st.risk = Math.max(0, st.risk - 1); line += '照部里的意见办。' + (e.real ? '这一步其实替你排掉了一个雷。' : ''); }
    if (k === 1) { if (st.cap < 3) { say.innerHTML = '政治资本不够硬推了。'; return; } st.cap -= 3; st.prog += 20; if (e.real) st.risk++; line += '硬推过去。'; }
    if (k === 2) { if (st.pm || st.cap < 2) { say.innerHTML = st.pm ? '首相这张牌你已经打过了。' : '政治资本不够了。'; return; } st.pm = true; st.cap -= 2; st.prog += 25; line += '找首相撑腰，首相府发话，各部配合。'; }
    if (k === 3) { if (st.spad || st.cap < 1) { say.innerHTML = st.spad ? '你已经有一位特别顾问在盯着了。' : '政治资本不够了。'; return; } st.spad = true; st.cap -= 1; line += '带进一位特别顾问，盯着每个司的进度。'; }
    if (st.spad && k !== 3) st.prog += 4;
    log.textContent = line + '\n' + log.textContent;
    // 硬推过的真问题可能爆雷
    if (st.risk > 0 && r() < 0.18 * st.risk) { st.prog = Math.max(0, st.prog - 30); st.cap = Math.max(0, st.cap - 2); st.risk = Math.max(0, st.risk - 1); log.textContent = '⚠ 先前硬推过去的问题爆了：报纸头版、法院裁定或者执行事故。进度倒退，政治资本受损。\n' + log.textContent; }
    next();
  }
  function end(why){
    st.over = true; render();
    box.innerHTML = '<button class="btn pri" id="minAgain">再来一任</button>';
    $('#minAgain').addEventListener('click', reset);
    say.className = 'say ' + (why === 'done' ? 'ok' : 'bad');
    say.innerHTML = why === 'done' ? '第 ' + st.q + ' 季度，改革立法通过，开始实施。' + (st.risk > 0 ? '不过有几个被你硬推过去的问题还埋着，接任的人会替你还账。' : '而且你没有硬闯真正的雷区。部里的那些“拖延”，有一半是在保护你。') :
      why === 'time' ? '三年到了，改革只完成了 ' + st.prog + '%。下一位大臣上任，部里会把这份文件放回柜子里，等他问起。' :
      '第 ' + st.q + ' 季度，首相改组内阁，你被调去了另一个部。改革进度停在 ' + st.prog + '%。<b>在英国，这是改革失败最常见的原因</b>：部长平均只干两年左右，文官们知道，等一等，就会换一个人来。';
  }
  function render(){
    kv($('#minKv'), [['季度', st.q + ' / 12'], ['政治资本', st.cap], ['改革进度', Math.min(100, st.prog) + '%'], ['埋着的雷', st.risk ? st.risk + ' 个' : '没有']]);
    if (!st.over) box.innerHTML = ['照部里的意见办', '硬推（−3）', '找首相撑腰（−2，限一次）', '带一位特别顾问（−1）'].map((t, i) => '<button class="btn' + (i === 0 ? ' pri' : '') + '" data-k="' + i + '">' + t + '</button>').join('');
  }
  box.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) act(+b.dataset.k); });
  reset();
});
