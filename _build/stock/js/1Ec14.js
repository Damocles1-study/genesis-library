
/* ---------- 装置 15：溢价和汇率吃掉多少 ---------- */
dev('#qdFig', fig => {
  const kvb = $('#qdKv'), say = $('#qdSay');
  let ready = false;
  function go(){
    if (!ready) return;
    const pb = gB() / 100, ps = gS() / 100, Y = gY(), r = gR() / 100, fx = gF() / 100, fee = 0.008;
    const idx = Math.pow(1 + r, Y) - 1; // 指数本身（美元）
    const nav = Math.pow(1 + r - fee, Y) * (1 - fx); // 人民币计的净值倍数
    const mine = nav * (1 + ps) / (1 + pb) - 1;
    const premLoss = (1 + ps) / (1 + pb) - 1;
    // 溢价损失相当于几年的指数涨幅
    const yrs = r > 0 ? Math.log(1 / (1 + premLoss)) / Math.log(1 + r) : null;
    kv(kvb, [['指数本身（美元）', '<span class="' + (idx >= 0 ? 'up' : 'dn') + '">' + pc(idx) + '</span>'], ['溢价变化', '<span class="' + (premLoss >= 0 ? 'up' : 'dn') + '">' + pc(premLoss) + '</span>'], ['汇率', '<span class="' + (fx <= 0 ? 'up' : 'dn') + '">' + pc(-fx) + '</span>'], ['你的人民币收益', '<b style="font-size:inherit" class="' + (mine >= 0 ? 'up' : 'dn') + '">' + pc(mine) + '</b>']]);
    let s = '指数 ' + Y + ' 年涨了 ' + pc(idx) + '，你最后拿到 ' + pc(mine) + '。';
    if (premLoss < -0.005) s += ' 买进时 ' + Math.round(pb * 100) + '% 的溢价、卖出时只剩 ' + Math.round(ps * 100) + '%，这一项就让你亏 ' + pc(-premLoss).slice(1) + (yrs && yrs > 0 ? '，相当于指数大约 ' + yrs.toFixed(1) + ' 年的涨幅' : '') + '。';
    if (premLoss > 0.005) s += ' 你卖出时的溢价比买进时还高，额外赚了一笔：这是运气，溢价不会一直扩大。';
    if (fx > 0) s += ' 人民币升值了 ' + Math.round(fx * 100) + '%，美元资产换回来的人民币变少。';
    if (fx < 0) s += ' 人民币贬值了 ' + Math.round(-fx * 100) + '%，美元资产换回来的人民币变多。';
    say.textContent = s;
  }
  const gB = slider('qdB', v => v + '%', go), gS = slider('qdS', v => v + '%', go), gY = slider('qdY', v => v + ' 年', go), gR = slider('qdR', v => (v > 0 ? '+' : '') + v + '%', go), gF = slider('qdF', v => v === 0 ? '不变' : (v > 0 ? '升值 ' + v + '%' : '贬值 ' + (-v) + '%'), go);
  ready = true; go();
});
