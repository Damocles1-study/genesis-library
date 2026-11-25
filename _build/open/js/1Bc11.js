/* ---------- 装置 12：第一个付钱的人在漏斗的哪一层 ---------- */
dev('#funFig', fig => {
  const box = $('#fuBars'), kvb = $('#fuKv'), say = $('#fuSay');
  const PRE = [['上门和熟人', 10, 60, 30, 35], ['在群里和二手平台发帖', 300, 5, 20, 15], ['花钱投放', 2000, 1.5, 15, 10]];
  const ids = ['fuR', 'fuA', 'fuB', 'fuC'];
  const g = {}; let ready = false, mode = 0;
  function draw(){
    if (!ready) return;
    const a = g.r * g.a / 100, b = a * g.b / 100, c = b * g.c / 100;
    bars(box, [['每周接触', g.r, '', 'var(--ink-3)'], ['愿意聊', a, '', 'var(--och)'], ['愿意试', b, '', 'var(--ter)'], ['付钱', c, '', 'var(--main)']].map(r => [r[0], Math.log10(1 + r[1]), r[1] < 10 ? r[1].toFixed(2) + ' 人' : Math.round(r[1]) + ' 人', r[3]]), Math.log10(1 + Math.max(g.r, 10)), v => '');
    const w1 = c > 0 ? Math.ceil(1 / c) : Infinity, w10 = c > 0 ? Math.ceil(10 / c) : Infinity;
    kv(kvb, [['每周大约付钱', c.toFixed(2) + ' 人'], ['第一个付钱的', w1 === Infinity ? '—' : '约第 ' + w1 + ' 周'], ['第十个', w10 === Infinity ? '—' : '约第 ' + w10 + ' 周'], ['一百个接触里付钱的', (g.a * g.b * g.c / 1e4).toFixed(2) + ' 人']]);
    let s;
    if (mode === 0) s = '上门和熟人接触的人少，可每一层留下的多：一周十个人，大约 ' + w1 + ' 周能有第一个付钱的。慢，但每一个都是真的，还能顺便听到他真正的麻烦。';
    else if (mode === 2) s = '花钱投放接触的人最多，漏得也最多。还没算投放本身的花费：如果每接触一个人要几毛钱，第一个付钱的客人可能已经花掉了好几百。早期没验证过需求就投钱，是最快的亏法。';
    else s = '发帖接触的人多，可每一层都漏得厉害。要紧的是“愿意试”到“付钱”那一层：它说明东西本身有没有用。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('fuR', v => { g.r = v; return v + ' 人'; }, go);
  slider('fuA', v => { g.a = v; return v + '%'; }, go);
  slider('fuB', v => { g.b = v; return v + '%'; }, go);
  slider('fuC', v => { g.c = v; return v + '%'; }, go);
  btnRow($('#fnPre'), PRE.map(p => p[0]), 0, i => {
    mode = i; ready = false;
    ids.forEach((id, k) => { const r = $('#' + id); r.value = PRE[i][k + 1]; r.dispatchEvent(new Event('input')); });
    ready = true; draw();
  });
  ready = true; draw();
});
