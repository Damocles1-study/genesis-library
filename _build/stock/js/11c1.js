
/* ---------- 装置 2：切蛋糕 ---------- */
dev('#cakeFig', fig => {
  const kvb = $('#cakeKv'), say = $('#cakeSay'), PE = 15;
  let st;
  const reset = () => { st = {shares: 10000, mine: 100, profit: 1e6, cashCo: 0, cashMe: 0}; };
  // 公司价值 = 利润 × 市盈率 + 账上多出来的现金
  const val = () => st.profit * PE + st.cashCo;
  const price = () => val() / st.shares;
  function show(msg){
    const p = price(), wealth = st.mine * p + st.cashMe;
    kv(kvb, [['你的股数', st.mine.toLocaleString()], ['你占公司', (st.mine / st.shares * 100).toFixed(3) + '%'], ['每股利润', (st.profit / st.shares).toFixed(2) + ' 元'], ['股价', p.toFixed(2) + ' 元'], ['你收到的现金', st.cashMe.toFixed(0) + ' 元'], ['你的总财富', '<b style="font-size:inherit">' + wealth.toFixed(0) + ' 元</b>']]);
    say.textContent = msg;
  }
  reset();
  const w0 = () => st.mine * price() + st.cashMe;
  $('#cakeBtns').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const a = b.dataset.a, before = w0();
    let m = '';
    if (a === 'reset') { reset(); show('回到开头：一万股，每股利润一百元，股价一千五百元，你的一百股值十五万元。'); return; }
    if (a === 'div') { const d = st.profit / 2 / st.shares; st.cashMe += d * st.mine; st.cashCo -= st.profit / 2; m = '每股分了 ' + d.toFixed(2) + ' 元，股价当天扣掉同样的数（除息）。你的财富没变，只是一部分变成了现金；以后要不要拿这笔现金再买回股票，是你的事。'; }
    if (a === 'split') { st.shares *= 2; st.mine *= 2; m = '股数翻倍，股价减半（除权），你的财富一分没变：蛋糕还是那块，切成了两倍多块。'; }
    if (a === 'cheap' || a === 'fair') {
      const n = st.shares * 0.2, px = price() * (a === 'cheap' ? 0.7 : 1);
      st.cashCo += n * px; st.shares += n;
      m = a === 'cheap' ? '公司按市价七折卖了 20% 的新股给别人，新股东用七成的钱买到了和你一样的份额。你的股数没变，占比和财富都缩水了：这就是“摊薄”。' : '按市价增发，新股东付了公道价，钱进了公司账上。你的占比下降了，但每一股背后的东西没少，财富基本不变。增发好不好，要看这笔钱拿去干什么。';
    }
    if (a === 'buy') {
      const n = st.shares * 0.1, px = price();
      st.cashCo -= n * px; st.shares -= n;
      m = '公司按市价买回 10% 的股份注销。你一股没卖，占比却变大了；按市价回购，财富基本不变。如果公司在股价偏低时回购，老股东就占了便宜，偏高时回购则相反。';
    }
    if (a === 'grow') { st.profit *= 1.1; m = '这一次蛋糕真的变大了：利润涨了 10%，在市盈率不变的假设下，股价和你的财富一起涨。上面所有按钮里，只有这一个让全体股东一起变富。'; }
    const after = w0(), d = after - before;
    show(m + '（这一步你的财富 ' + (Math.abs(d) < 1 ? '不变' : (d > 0 ? '多了 ' : '少了 ') + Math.abs(d).toFixed(0) + ' 元') + '。）');
  });
  show('回到开头：一万股，每股利润一百元，股价一千五百元，你的一百股值十五万元。');
});
