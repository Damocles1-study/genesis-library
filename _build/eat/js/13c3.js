/* ---------- 装置 4：割麦子 ---------- */
dev('#rcFig', () => {
  const Q0 = 0.001, YRS = 2000;
  function path(L, m){
    const out = [[0, Q0]]; let q = Q0, t50 = null, t95 = null;
    for (let y = 1; y <= YRS; y++) {
      const qs = q / (q + (1 - q) * (1 - L));   // 掉粒的先掉了一部分
      q = (1 - m) * qs + m * Q0;                  // 混进野地新采的种子
      if (t50 == null && q >= 0.5) t50 = y;
      if (t95 == null && q >= 0.95) t95 = y;
      if (y % 10 === 0 || y < 60) out.push([y, q]);
    }
    return {pts: out, t50, t95, end: q};
  }
  const L = slider('rcL', v => v + '% 已掉', () => draw());
  const M = slider('rcM', v => v + '%', () => draw());
  const ideal = path(0.6, 0);
  function draw(){
    const l = L() / 100, m = M() / 100, r = path(l, m);
    lineChart($('#rcChart'), [
      {pts: ideal.pts.map(p => [p[0], p[1] * 100]), color: 'var(--ink-3)', dash: '4 4', w: 1.6},
      {pts: r.pts.map(p => [p[0], p[1] * 100]), color: 'var(--main)', w: 2.6}
    ], {xmin: 0, xmax: YRS, ymin: 0, ymax: 100, xt: [0, 500, 1000, 1500, 2000], yt: [0, 50, 95], xf: v => v + ' 年', yf: v => v + '%', H: 230,
      marks: [[1500, '考古看到的大致速度']]});
    kv($('#rcKv'), [['占一半', r.t50 ? r.t50 + ' 年' : '两千年内没到'], ['占九成五', r.t95 ? r.t95 + ' 年' : '两千年内没到'], ['两千年后', (r.end * 100).toFixed(r.end < 0.01 ? 2 : 0) + '%']]);
    const grow = (1 - m) / (1 - l);
    const ceil = m > 0 ? Math.max(0, 1 - m / l) : 1;
    $('#rcSay').innerHTML = grow > 1 && !r.t95 && ceil < 0.95 && Math.abs(r.end - ceil) < 0.08 ? '不掉粒的麦子涨到约 ' + Math.round(r.end * 100) + '% 就卡住了：每年从野地里新采的种子不断把它冲淡，<b>只要人们还一边种、一边去野地里采，驯化就走不完</b>。把“野地新采的种子”拖到零试试。' :
      grow <= 1 ? '每年带回家的优势（' + (1 / (1 - l)).toFixed(2) + ' 倍）抵不过野地种子的冲淡，不掉粒的麦子永远是少数：<b>只要人们还在不停地去野地里采，驯化就不会发生</b>。' :
      r.t95 && r.t95 < 100 ? '这是“理想的早期农民”：熟透了才割，只种自己留的种。不到一百年，麦子就离不开人了。可惜考古证据说，真实的历史没有这么快。' :
      r.t95 ? '要 ' + r.t95 + ' 年，几十代人，才走完驯化。这更接近考古看到的样子：没有谁看得到这件事在发生。' : '优势很小，两千年还没走完。慢，但方向是定的。';
  }
  draw();
});
