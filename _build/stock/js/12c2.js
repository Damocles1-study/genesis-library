
/* ---------- 装置 3：集合竞价 ---------- */
dev('#aucFig', fig => {
  const BOOK = [['买', 10.05, 30], ['买', 10.02, 50], ['买', 10.00, 80], ['买', 9.98, 60], ['买', 9.95, 100],
                ['卖', 9.94, 40], ['卖', 9.97, 50], ['卖', 10.00, 70], ['卖', 10.03, 60], ['卖', 10.06, 90]];
  const tab = $('#aucTab'), kvb = $('#aucKv'), say = $('#aucSay');
  let side = 0, ready = false;
  btnRow($('#aucSide'), ['我要买', '我要卖'], 0, i => { side = i; go(); });
  const gP = slider('aucP', v => v.toFixed(2) + ' 元', () => ready && go());
  const gQ = slider('aucQ', v => v + ' 手', () => ready && go());
  function match(orders){
    const prices = [...new Set(orders.map(o => o[1]))].sort((a, b) => a - b);
    let best = null;
    prices.forEach(p => {
      const bv = orders.filter(o => o[0] === '买' && o[1] >= p - 1e-9).reduce((s, o) => s + o[2], 0);
      const sv = orders.filter(o => o[0] === '卖' && o[1] <= p + 1e-9).reduce((s, o) => s + o[2], 0);
      const m = Math.min(bv, sv), im = Math.abs(bv - sv), d = Math.abs(p - 10);
      if (!best || m > best.m || (m === best.m && (im < best.im || (im === best.im && d < best.d)))) best = {p, m, bv, sv, im, d};
    });
    return best;
  }
  function go(){
    const myP = Math.round(gP() * 100) / 100, myQ = gQ(), S = side === 0 ? '买' : '卖';
    const orders = BOOK.slice(); if (myQ > 0) orders.push([S, myP, myQ, 1]);
    const r = match(orders), base = match(BOOK);
    const rows = [...new Set(orders.map(o => o[1]))].sort((a, b) => b - a);
    let h = '<thead><tr><th>价格</th><th>买单（手）</th><th>卖单（手）</th><th>此价可买</th><th>此价可卖</th><th>可成交</th></tr></thead><tbody>';
    rows.forEach(p => {
      const b = orders.filter(o => o[0] === '买' && Math.abs(o[1] - p) < 1e-9), s = orders.filter(o => o[0] === '卖' && Math.abs(o[1] - p) < 1e-9);
      const cb = orders.filter(o => o[0] === '买' && o[1] >= p - 1e-9).reduce((t, o) => t + o[2], 0), cs = orders.filter(o => o[0] === '卖' && o[1] <= p + 1e-9).reduce((t, o) => t + o[2], 0);
      const cell = arr => arr.map(o => o[3] ? '<b class="' + (o[0] === '买' ? 'up' : 'dn') + '">你 ' + o[2] + '</b>' : o[2]).join(' + ') || '';
      const on = Math.abs(p - r.p) < 1e-9;
      h += '<tr' + (on ? ' style="background:var(--hl)"' : '') + '><td>' + p.toFixed(2) + (on ? ' ◀ 开盘' : '') + '</td><td>' + cell(b) + '</td><td>' + cell(s) + '</td><td>' + cb + '</td><td>' + cs + '</td><td>' + Math.min(cb, cs) + '</td></tr>';
    });
    tab.innerHTML = h + '</tbody>';
    let filled = 0;
    if (myQ > 0) {
      const ok = S === '买' ? myP >= r.p - 1e-9 : myP <= r.p + 1e-9;
      if (ok) {
        // 同价位按时间优先，你的单子最后到，排在别人后面
        const better = orders.filter(o => o[0] === S && !o[3] && (S === '买' ? o[1] > myP + 1e-9 : o[1] < myP - 1e-9)).reduce((t, o) => t + o[2], 0);
        const same = orders.filter(o => o[0] === S && !o[3] && Math.abs(o[1] - myP) < 1e-9).reduce((t, o) => t + o[2], 0);
        filled = Math.max(0, Math.min(myQ, r.m - better - same));
      }
    }
    kv(kvb, [['开盘价', r.p.toFixed(2) + ' 元'], ['成交', r.m + ' 手'], ['没有你时', base.p.toFixed(2) + ' 元 · ' + base.m + ' 手'], ['你成交了', filled + ' / ' + myQ + ' 手']]);
    let s = '';
    const dp = r.p - base.p;
    if (myQ === 0) s = '你没有挂单。开盘价 ' + r.p.toFixed(2) + ' 元，是让最多股票能成交的那个价：比它便宜的卖单、比它贵的买单，全部按这一个价成交。';
    else {
      s = '你挂了一张' + (S === '买' ? '买' : '卖') + '单，' + myP.toFixed(2) + ' 元、' + myQ + ' 手。';
      s += Math.abs(dp) < 1e-9 ? '开盘价没变，' : '开盘价被你' + (dp > 0 ? '推高' : '压低') + '了 ' + Math.abs(dp * 100).toFixed(0) + ' 分钱，';
      s += filled === myQ ? '你的单子全部成交，而且成交价是开盘价，不是你挂的价。' : filled > 0 ? '你只成交了一部分：同价位的单子按先来后到，你排在后面。' : '你的单子没有成交，' + (S === '买' ? '出价低于开盘价' : '要价高于开盘价') + '，或者排在了同价位的队尾，会留到 9:30 以后继续排队。';
      if (S === '买' && myP >= 10.06 && myQ >= 200) s += ' 挂这么大的高价买单，等于告诉所有人“我急着要”：这就是大资金能推动价格的原因，也是它们为什么要把大单拆成很多小单。';
    }
    say.textContent = s;
  }
  ready = true; go();
});
