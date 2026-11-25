
/* ---------- 装置 11：一个百分点的三十年 ---------- */
dev('#feeFig', fig => {
  const svg = $('#feSvg'), kvb = $('#feKv'), say = $('#feSay');
  let ready = false;
  function go(){
    if (!ready) return;
    const r = gR() / 100, a = gA() / 100, b = gB() / 100, gap = gG() / 100, P = 1e5;
    const s0 = [], s1 = [], s2 = [], s3 = [];
    for (let t = 0; t <= 30; t++) { s0.push([t, P * Math.pow(1 + r, t)]); s1.push([t, P * Math.pow(1 + r - a, t)]); s2.push([t, P * Math.pow(1 + r - b, t)]); s3.push([t, P * Math.pow(1 + r - b - gap, t)]); }
    const ymax = s0[30][1] * 1.05;
    lineChart(svg, [
      {name: '不收费', color: 'var(--ink-3)', pts: s0, dash: '4 4', w: 1.4},
      {name: '便宜', color: 'var(--up)', pts: s1},
      {name: '贵', color: 'var(--och)', pts: s2},
      {name: '贵+情绪', color: 'var(--dn)', pts: s3}
    ], {xmin: 0, xmax: 30, ymin: 0, ymax, xt: [0, 10, 20, 30], xf: x => x + '年', yt: [0, ymax / 2, ymax].map(v => Math.round(v / 1e4) * 1e4), yf: v => fmt(v), H: 240, L: 52});
    const A = s1[30][1], B = s2[30][1], G = s3[30][1], Z = s0[30][1];
    kv(kvb, [['不收费', yuan(Z)], ['便宜的基金', '<span class="up">' + yuan(A) + '</span>'], ['贵的基金', yuan(B)], ['贵的 + 情绪缺口', '<span class="dn">' + yuan(G) + '</span>']]);
    say.textContent = '三十年后，便宜的那只比贵的多出 ' + yuan(A - B) + '，贵的那只最后只有便宜那只的 ' + Math.round(B / A * 100) + '%。' + (gap > 0 ? ' 再加上每年 ' + (gap * 100).toFixed(2) + ' 个点的情绪缺口，只剩 ' + Math.round(G / A * 100) + '%。' : '') + ' 费用和情绪拿走的，都是复利里最后、最大的那几年。';
  }
  const gR = slider('feR', v => v + '%', go), gA = slider('feA', v => v.toFixed(2) + '%/年', go), gB = slider('feB', v => v.toFixed(1) + '%/年', go), gG = slider('feG', v => v.toFixed(2) + '%/年', go);
  ready = true; go();
});
