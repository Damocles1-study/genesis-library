/* ---------- 装置 2：一副担子的账 ---------- */
dev('#turnFig', fig => {
  const box = $('#tnBars'), kvb = $('#tnKv'), say = $('#tnSay');
  const g = {}; let ready = false;
  const DAYS = 330;
  const calc = (cap, m, d, f) => { const turns = DAYS / d; const gross = cap * m * turns; const net = gross - f * DAYS; return {turns, gross, net, roc: net / cap}; };
  const REF = [['货郎', 3000, 0.15, 4, 5, '本钱小，薄利，三四天一圈'], ['杂货铺', 30000, 0.25, 30, 60, '一个月一圈，要交铺租'], ['古玩铺', 30000, 1.0, 300, 60, '一件赚一倍，一年不到一圈']];
  function draw(){
    if (!ready) return;
    const me = calc(g.cap, g.m / 100, g.d, g.f);
    const rows = REF.map(r => { const c = calc(r[1], r[2], r[3], r[4]); return [r[0], c.net, r[5] + '；本钱 ' + yuan(r[1]) + '，一年赚回本钱的 ' + Math.round(c.roc * 100) + '%', 'var(--ink-3)']; });
    rows.push(['你的摊子', me.net, '本钱 ' + yuan(g.cap) + '，一年 ' + me.turns.toFixed(1) + ' 圈，赚回本钱的 ' + Math.round(me.roc * 100) + '%', 'var(--main)']);
    const max = Math.max(10000, ...rows.map(r => r[1]));
    bars(box, rows.map(r => [r[0], Math.max(0, r[1]), r[2] + (r[1] < 0 ? '（亏）' : ''), r[3]]), max, v => wan(v));
    kv(kvb, [['一年转', me.turns.toFixed(1) + ' 圈'], ['毛利合计', yuan(me.gross)], ['减去固定花费', yuan(g.f * DAYS)], ['一年净赚', '<span class="' + (me.net >= 0 ? 'pos' : 'neg') + '">' + yuan(me.net) + '</span>'], ['本钱的', Math.round(me.roc * 100) + '%']]);
    let s;
    if (me.net < 0) s = '固定花费把毛利吃光了。本钱小的时候，每天固定要掏的钱是最危险的：摊位费、房租、油钱，不管卖没卖出去都得付。';
    else if (me.turns >= 30 && g.m <= 30) s = '利润率不高，可本钱一年转了 ' + me.turns.toFixed(0) + ' 圈，这就是货郎的打法：薄利，但快。';
    else if (me.turns < 3) s = '每一圈赚得多，可一年转不了几圈。这样的生意要的是本钱厚、等得起，不适合本钱少的人。';
    else s = '一年净赚 ' + yuan(me.net) + '，是本钱的 ' + Math.round(me.roc * 100) + '%。试试把“几天卖完一圈”拖长一倍：利润率不变，一年的收入就少了一半。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('tnCap', v => { g.cap = v; return yuan(v); }, go);
  slider('tnM', v => { g.m = v; return v + '%'; }, go);
  slider('tnD', v => { g.d = v; return v + ' 天'; }, go);
  slider('tnF', v => { g.f = v; return v + ' 元 / 天'; }, go);
  ready = true; draw();
});
