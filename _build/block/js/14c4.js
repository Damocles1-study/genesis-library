
/* ---------- 第四章：卖了多少份 ---------- */
dev('#salesFig', () => {
  /* [年份（带小数）, 百万份, 说明] */
  const PTS = [[2011.04, 1, '2011 年 1 月：一百万份（公测版，只有电脑版）'], [2016.42, 100, '2016 年 6 月：一亿份'], [2019.38, 176, '2019 年 5 月：一亿七千六百万份'], [2020.38, 200, '2020 年 5 月：两亿份'], [2023.79, 300, '2023 年 10 月：三亿份，第一个卖到三亿份的电子游戏'], [2025.29, 350, '2025 年 4 月：三亿五千万份'], [2026.73, 425, '2026 年 9 月：四亿两千五百万份']];
  const sv = $('#salesSvg');
  function curve(){
    const o = lineChart(sv, [{color: 'var(--main)', pts: [[2009.4, 0]].concat(PTS.map(p => [p[0], p[1]])), dots: true, w: 2.6}], {xmin: 2009, xmax: 2027, ymin: 0, ymax: 450, xt: [2009, 2011, 2013, 2015, 2017, 2019, 2021, 2023, 2025, 2027], yt: [0, 100, 200, 300, 400], yf: v => v ? v / 100 + ' 亿' : '0', H: 280, L: 52});
    let g = '';
    PTS.forEach((p, i) => { if (i === 0 || i >= 3) g += txt(o.X(p[0]) + (i === PTS.length - 1 ? -4 : 6), o.Y(p[1]) - 8, i === 0 ? '一百万' : (p[1] / 100) + ' 亿', {s: 11, a: i === PTS.length - 1 ? 'end' : 'start', c: 'var(--ink-2)'}); });
    sv.insertAdjacentHTML('beforeend', g);
    $('#salesSay').innerHTML = '从一百万份到一亿份，用了五年多；从三亿到四亿两千五百万，只用了三年。2025 年上映的电影，又让很多新玩家来了。';
  }
  function stack(){
    /* 每份一张 1.2 毫米的光盘，摞起来多高（公里） */
    const km = 425e6 * 1.2 / 1e6;
    const rows = [['一张光盘', 0.0000012, '1.2 毫米'], ['小格的家（六楼）', 0.018, '约 18 米'], ['珠穆朗玛峰', 8.849, '8849 米'], ['飞机飞的高度', 10, '约 1 万米'], ['国际空间站', 400, '离地约 400 公里'], ['四亿两千五百万张光盘', km, '约 ' + Math.round(km) + ' 公里']];
    const W = 600, H = 300, B = 26, T = 14, max = 560;
    const Y = v => H - B - v / max * (H - B - T);
    let g = '<line x1="40" x2="' + W + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)"/>';
    [0, 100, 200, 300, 400, 500].forEach(v => g += '<line x1="40" x2="' + W + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--rule)"/>' + txt(36, Y(v) + 4, v + ' km', {s: 10, a: 'end', c: 'var(--ink-3)', halo: false}));
    rows.forEach((r, i) => {
      const x = 70 + i * 88, top = Y(r[1]), last = i === rows.length - 1;
      g += '<rect x="' + (x - 18) + '" y="' + Math.min(top, H - B - 2) + '" width="36" height="' + Math.max(2, H - B - top) + '" fill="' + (last ? 'var(--main)' : i === 4 ? 'var(--blu)' : 'var(--stone)') + '"/>';
      g += txt(x, Math.min(top, H - B - 2) - 18, r[0], {s: 11, c: 'var(--ink)'}) + txt(x, Math.min(top, H - B - 2) - 5, r[2], {s: 10, c: 'var(--ink-3)'});
    });
    sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.innerHTML = g;
    $('#salesSay').innerHTML = '四亿两千五百万张光盘摞起来，大约 <b>' + Math.round(km) + ' 公里</b>高，比国际空间站飞得还高。珠穆朗玛峰在这张图上几乎看不见。';
  }
  btnRow($('#salesMode'), ['一年一年怎么涨的', '摞起来有多高'], 0, i => i ? stack() : curve());
  curve();
});
