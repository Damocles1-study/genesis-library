
/* ---------- 装置 4：一只股票值多少 ---------- */
dev('#dcfFig', fig => {
  const svg = $('#dcSvg'), kvb = $('#dcKv'), say = $('#dcSay');
  let ready = false;
  function value(g1, g2, r){
    let e = 1, v = 0; const pts = [];
    for (let t = 1; t <= 100; t++) { e *= 1 + (t <= 10 ? g1 : g2); const pv = e / Math.pow(1 + r, t); v += pv; if (t <= 40) pts.push([t, pv]); }
    return {v, pts};
  }
  function go(){
    if (!ready) return;
    const g1 = gG1() / 100, g2 = gG2() / 100, r = gR() / 100, P = gP();
    const {v, pts} = value(g1, g2, r);
    const lo = value(g1 - 0.05, g2, r).v, hi = value(g1 + 0.05, g2, r).v;
    // 现价隐含的头十年增速
    let a = -0.1, b = 0.8; for (let k = 0; k < 50; k++) { const m = (a + b) / 2; value(m, g2, r).v > P ? b = m : a = m; }
    const ymax = Math.max(1.2, ...pts.map(p => p[1])) * 1.1;
    lineChart(svg, [{name: '每年利润折回今天', color: 'var(--main)', pts, dots: false}], {xmin: 1, xmax: 40, ymin: 0, ymax, xt: [1, 10, 20, 30, 40], yt: [0, +(ymax / 2).toFixed(1), +ymax.toFixed(1)], xf: x => '第' + x + '年', yf: y => y.toFixed(1), marks: [[10, '增速换挡']], H: 200});
    kv(kvb, [['算出来的价值', v.toFixed(1) + ' 元'], ['合理市盈率', v.toFixed(1) + ' 倍'], ['头十年增速 ±5 个点', lo.toFixed(1) + ' — ' + hi.toFixed(1) + ' 元'], ['现价 ' + P + ' 元隐含增速', (a * 100).toFixed(1) + '%/年']]);
    let s = '按你的猜测，这只股票值 ' + v.toFixed(1) + ' 元，现在卖 ' + P + ' 元，' + (P > v * 1.15 ? '偏贵。' : P < v * 0.85 ? '偏便宜。' : '差不多。');
    s += ' 头十年增速只要猜错正负五个点，价值就在 ' + lo.toFixed(1) + ' 到 ' + hi.toFixed(1) + ' 元之间摆动。反过来看，' + P + ' 元的价钱等于默认它头十年每年利润涨 ' + (a * 100).toFixed(1) + '%' + (a > 0.25 ? '，这是很少有公司能连续做到十年的速度。' : '。');
    if (r - g2 < 0.04) s += ' 折现率和长期增速靠得太近，远期的利润几乎不打折，算出来的价值会被拉得很高：这正是泡沫时期常见的算法。';
    say.textContent = s;
  }
  const gG1 = slider('dcG1', v => v + '%/年', go), gG2 = slider('dcG2', v => v + '%/年', go), gR = slider('dcR', v => v + '%', go), gP = slider('dcP', v => v + ' 元', go);
  ready = true; go();
});
