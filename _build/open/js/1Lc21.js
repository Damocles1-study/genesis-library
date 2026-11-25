/* ---------- 装置 22：一份投资条款的账 ---------- */
dev('#termFig', fig => {
  const box = $('#tmBars'), kvb = $('#tmKv'), say = $('#tmSay'), gu = $('#tmG');
  const g = {}; let ready = false;
  function draw(){
    if (!ready) return;
    const post = g.i / (g.s / 100), pre = post - g.i;
    let mine = g.f / 100 * (1 - g.s / 100);
    const steps = [['投资前', g.f]];
    steps.push(['这一轮之后', mine * 100]);
    for (let k = 0; k < g.n; k++) { mine *= 1 - g.d / 100; steps.push(['再融第 ' + (k + 1) + ' 轮', mine * 100]); }
    const line = v => v > 200 / 3 ? '能独自决定大事' : v > 50 ? '过半数' : v > 100 / 3 ? '还能一票否决大事' : '大事已经说了不算';
    bars(box, steps.map(s => [s[0], s[1], line(s[1]), s[1] > 50 ? 'var(--ter)' : s[1] > 100 / 3 ? 'var(--och)' : 'var(--main)']), 100, v => v.toFixed(1) + '%');
    const buy = g.i * (1 + g.r / 100 * g.y);
    const exp = (1 - g.p / 100) * buy;
    kv(kvb, [['投后估值', yuan(post)], ['投前估值', yuan(pre)], ['没达成时回购款', yuan(buy)], ['你个人承担', gu.checked ? '<span class="neg">' + yuan(buy) + '（和其他创始人连带）</span>' : '由公司按程序处理'], ['按你估的可能，期望要掏', gu.checked ? yuan(exp) : '—']]);
    let s;
    if (gu.checked && g.p < 50) s = '按你自己估的，没达成的可能是 ' + (100 - g.p) + '%。那时回购款 ' + yuan(buy) + '，由创始人个人连带承担：这笔“投资”在最坏的那一天，就是你个人欠下的一笔债，而且其他创始人付不出的部分，债主可以找你要。';
    else if (gu.checked) s = '就算你觉得达成的可能更大，也把“没达成”那一天念一遍：回购款 ' + yuan(buy) + ' 从你个人和家里出。估计目标的人，通常偏乐观。';
    else s = '去掉了创始人个人回购，最坏的那一天，亏的是公司和这门生意，不是你的家。投资方往往会要求别的保护，比如调整股份、优先清算，这些可以谈。';
    if (mine * 100 < 100 / 3) s += ' 另外，几轮下来你只剩 ' + (mine * 100).toFixed(1) + '%，连一票否决大事的那条线都守不住了。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('tmI', v => { g.i = v; return yuan(v); }, go);
  slider('tmS', v => { g.s = v; return v + '%'; }, go);
  slider('tmF', v => { g.f = v; return v + '%'; }, go);
  slider('tmN', v => { g.n = v; return v ? v + ' 轮' : '不再融'; }, go);
  slider('tmD', v => { g.d = v; return v + '%'; }, go);
  slider('tmY', v => { g.y = v; return v + ' 年'; }, go);
  slider('tmR', v => { g.r = v; return v + '%'; }, go);
  slider('tmP', v => { g.p = v; return v + '%'; }, go);
  gu.addEventListener('change', go);
  ready = true; draw();
});
