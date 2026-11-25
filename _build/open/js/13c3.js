/* ---------- 装置 4：一百块钱的去向 ---------- */
dev('#platFig', fig => {
  const box = $('#plBars'), kvb = $('#plKv'), say = $('#plSay');
  const g = {}; let ready = false;
  function draw(){
    if (!ready) return;
    const P = g.p, r = g.r / 100;
    // 每“成交”一单（付款）的平均账：退货单收回货、退回货款、平台抽成退回，运费和推广费白花
    const keep = 1 - r;
    const cost = P * g.c / 100 * keep;
    const fee = P * g.k / 100 * keep;
    const ad = P * g.a / 100;
    const ship = g.s * (1 + r);          // 退货多出一段运费
    const rev = P * keep;
    const net = rev - cost - fee - ad - ship;
    const rows = [
      ['卖出的货款', rev, '扣掉退货以后', 'var(--ter)'],
      ['进价', cost, '', 'var(--ink-3)'],
      ['平台抽成', fee, '', 'var(--och)'],
      ['推广费', ad, '退货的单也白花了', 'var(--och)'],
      ['运费和包装', ship, '退货要多付一段', 'var(--ink-3)'],
      ['落到手里', Math.max(0, net), net < 0 ? '每单倒贴 ' + Math.abs(net).toFixed(1) + ' 元' : '', 'var(--main)']
    ];
    bars(box, rows, P, v => v.toFixed(1) + ' 元');
    const need = net > 0 ? Math.ceil(g.t / net) : Infinity;
    kv(kvb, [['每单到手', '<span class="' + (net >= 0 ? 'pos' : 'neg') + '">' + net.toFixed(1) + ' 元</span>'], ['占卖价', (net / P * 100).toFixed(1) + '%'], ['每月要卖', need === Infinity ? '卖越多亏越多' : need.toLocaleString() + ' 单'], ['平均每天', need === Infinity ? '—' : Math.ceil(need / 30) + ' 单']]);
    let s;
    if (net <= 0) s = '每卖一单都在亏钱。这种时候“走量”只会越走越亏，先回头看推广费和退货率。';
    else if (net / P < 0.1) s = '卖一百块，落到手里不到十块。每月想到手 ' + yuan(g.t) + '，得卖 ' + need.toLocaleString() + ' 单，平均每天 ' + Math.ceil(need / 30) + ' 单，回消息、发货、售后都是一个人的活。';
    else s = '每单到手 ' + net.toFixed(1) + ' 元，占卖价的 ' + (net / P * 100).toFixed(0) + '%。试着把推广费往右拖：新店没有自然流量的时候，常常就是这一刀把利润吃光的。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('plP', v => { g.p = v; return v + ' 元'; }, go);
  slider('plC', v => { g.c = v; return '卖价的 ' + v + '%'; }, go);
  slider('plK', v => { g.k = v; return v + '%'; }, go);
  slider('plA', v => { g.a = v; return '卖价的 ' + v + '%'; }, go);
  slider('plS', v => { g.s = v; return v + ' 元 / 单'; }, go);
  slider('plR', v => { g.r = v; return v + '%'; }, go);
  slider('plT', v => { g.t = v; return yuan(v); }, go);
  ready = true; draw();
});
