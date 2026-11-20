/* ---------- 装置 4：屠能圈 ---------- */
dev('#thunFig', fig => {
  // 每平方公里产量 Y、城里售价 p、生产成本 c、每单位每公里运费 f
  const CROP = [
    {n: '菜 · 奶', Y: 10, p: 10, c: 4, f: 1.0, col: 'var(--grn)'},
    {n: '柴林', Y: 10, p: 5.5, c: 1.5, f: 0.45, col: 'var(--och)'},
    {n: '麦田', Y: 4, p: 6, c: 2.5, f: 0.25, col: '#c9a44a'},
    {n: '草场', Y: 1.2, p: 8, c: 3, f: 0.3, col: 'var(--main)'}
  ];
  const ERA = [['1826 年 · 马车', 100, 100], ['1870 年 · 铁路', 40, 115], ['今天 · 冷链卡车', 12, 150]];
  const T = $('#thunT'), P = $('#thunP'), DMAX = 30;
  btnRow($('#thunEra'), ERA.map(e => e[0]), 0, i => { T.value = ERA[i][1]; P.value = ERA[i][2]; go(); });
  T.addEventListener('input', go); P.addEventListener('input', go);
  $('#thunLeg').innerHTML = CROP.map(c => '<span><i style="background:' + c.col + '"></i>' + c.n + '</span>').join('') + '<span><i style="background:var(--paper);border:1px solid var(--rule)"></i>荒地</span>';
  const rent = (c, d, t, pm) => c.Y * (c.p * pm - c.c) - c.Y * c.f * t * d;
  function go(){
    const t = +T.value / 100, pm = +P.value / 100;
    $('#thunTO').textContent = '× ' + t.toFixed(2);
    $('#thunPO').textContent = '× ' + pm.toFixed(2);
    // 沿距离扫描，找每一段的赢家
    const step = 0.05, segs = [];
    let cur = -2, start = 0;
    for (let d = 0; d <= DMAX + 1e-9; d += step) {
      let best = -1, bv = 0;
      CROP.forEach((c, i) => { const v = rent(c, d, t, pm); if (v > bv) { bv = v; best = i; } });
      if (best !== cur) { if (cur !== -2) segs.push({i: cur, a: start, b: d}); cur = best; start = d; }
    }
    segs.push({i: cur, a: start, b: DMAX});
    // 左图：竞租线
    const X = d => 34 + d / DMAX * 276, R0 = Math.max(...CROP.map(c => rent(c, 0, t, pm))), Yv = v => 196 - v / R0 * 176;
    let s = '<line x1="34" x2="310" y1="196" y2="196" stroke="var(--ink)" stroke-width="1"/><line x1="34" x2="34" y1="16" y2="196" stroke="var(--ink)" stroke-width="1"/>';
    for (let d = 0; d <= DMAX; d += 5) s += '<text x="' + X(d) + '" y="210" font-size="10" text-anchor="middle" fill="var(--ink-3)">' + d + '</text>';
    s += '<text x="310" y="190" font-size="10" text-anchor="end" fill="var(--ink-3)">离城（公里）</text><text x="38" y="14" font-size="10" fill="var(--ink-3)">每亩租子</text>';
    segs.forEach(g => { if (g.i >= 0) s += '<rect x="' + X(g.a) + '" y="196" width="' + Math.max(0, X(g.b) - X(g.a)) + '" height="6" fill="' + CROP[g.i].col + '"/>'; });
    CROP.forEach(c => {
      const d0 = Math.min(DMAX, (c.p * pm - c.c) / (c.f * t));
      s += '<line x1="' + X(0) + '" y1="' + Yv(rent(c, 0, t, pm)) + '" x2="' + X(d0) + '" y2="' + Yv(Math.max(0, rent(c, d0, t, pm))) + '" stroke="' + c.col + '" stroke-width="2.4"/>';
    });
    $('#thunChart').innerHTML = s;
    // 右图：圈
    const C = 120, Rm = 112, r = d => d / DMAX * Rm;
    let m = '<circle cx="' + C + '" cy="' + C + '" r="' + Rm + '" fill="var(--paper)" stroke="var(--rule)"/>';
    segs.slice().reverse().forEach(g => { if (g.i >= 0) m += '<circle cx="' + C + '" cy="' + C + '" r="' + r(g.b) + '" fill="' + CROP[g.i].col + '" fill-opacity=".55" stroke="var(--card)" stroke-width="1"/>'; });
    // 内圈要盖住外圈：重新从外往里画已经做到；再画一个外沿（荒地）
    const last = segs.filter(g => g.i >= 0).pop();
    m += '<circle cx="' + C + '" cy="' + C + '" r="5" fill="var(--ink)"/><text x="' + C + '" y="' + (C - 9) + '" font-size="11" text-anchor="middle" fill="var(--ink)" paint-order="stroke" stroke="var(--card)" stroke-width="3">城</text>';
    m += '<text x="' + C + '" y="236" font-size="10" text-anchor="middle" fill="var(--ink-3)">半径 ' + DMAX + ' 公里</text>';
    $('#thunMap').innerHTML = m;
    const w = segs.filter(g => g.i >= 0).map(g => CROP[g.i].n + ' ' + f1(g.a) + '–' + (g.b >= DMAX ? DMAX + '+' : f1(g.b)) + ' 公里');
    const say = $('#thunSay');
    const reach = last ? last.b : 0;
    say.innerHTML = '从里到外：' + w.join('；') + '。' + (reach >= DMAX ? '<br><b>圈已经撑出了地图。</b>运费便宜到这个地步，城可以从几百上千公里外吃饭，屠能的圈不再是“城边”，而是整个国家甚至全世界。' : t > 0.8 ? '<br>马车时代，城的饭碗半径只有十几二十公里。注意柴林挤在菜园外面：柴太重，运不远。' : '<br>运费一降，每一圈都往外推，原来离城太远、不值得种的荒地也被卷进来。铁路让城能养活多得多的人。');
  }
  go();
});
