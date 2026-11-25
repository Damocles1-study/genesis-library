/* ---------- 第三部封面装置：一百多年，水泥和钢 ---------- */
dev('#gtFig', () => {
  /* 年产量，百万吨，取整约数 */
  const YR = [1900, 1913, 1929, 1950, 1960, 1970, 1980, 1990, 2000, 2005, 2010, 2014, 2018, 2020, 2023];
  const D = {
    cem: {
      w: [10, 40, 70, 133, 317, 572, 880, 1040, 1660, 2310, 3310, 4180, 4050, 4200, 4100],
      c: [null, null, null, 1.4, 15.7, 25.8, 80, 210, 597, 1069, 1882, 2492, 2207, 2395, 2023],
      u: [8, 15, 29, 39, 56, 67, 69, 71, 88, 99, 67, 83, 87, 89, 91]
    },
    st: {
      w: [28, 76, 120, 189, 347, 595, 717, 770, 850, 1148, 1435, 1670, 1820, 1880, 1890],
      c: [null, null, null, 0.6, 18.7, 17.8, 37, 66, 129, 355, 639, 823, 928, 1065, 1019],
      u: [10, 32, 57, 88, 90, 119, 101, 90, 102, 95, 81, 88, 87, 73, 81]
    }
  };
  const MODES = ['水泥', '钢', '中国占世界'];
  let m = 0;
  btnRow($('#gtBtns'), MODES, m, i => { m = i; draw(); });
  const MARKS = [[1889, '埃菲尔铁塔'], [1931, '帝国大厦'], [1978, '改革开放'], [1998, '住房改革']];
  function draw(){
    const svg = $('#gtSvg');
    let series, opt;
    if (m < 2) {
      const d = m === 0 ? D.cem : D.st;
      const mx = m === 0 ? 4500 : 2000;
      series = [
        {name: '全世界', color: 'var(--ink-2)', pts: YR.map((y, i) => [y, d.w[i]]), dots: true},
        {name: '中国', color: 'var(--ter)', pts: YR.map((y, i) => [y, d.c[i]]), dots: true, w: 3},
        {name: '美国', color: 'var(--main)', pts: YR.map((y, i) => [y, d.u[i]]), dots: true, dash: '5 3'}
      ];
      opt = {xmin: 1885, xmax: 2026, ymin: 0, ymax: mx, xt: [1900, 1925, 1950, 1975, 2000, 2025], yt: m === 0 ? [0, 1000, 2000, 3000, 4000] : [0, 500, 1000, 1500, 2000], yf: v => v ? (v / 100) + ' 亿吨' : '0', marks: MARKS, L: 58};
    } else {
      const sh = k => YR.map((y, i) => [y, D[k].c[i] == null ? null : D[k].c[i] / D[k].w[i] * 100]);
      const su = k => YR.map((y, i) => [y, D[k].u[i] / D[k].w[i] * 100]);
      series = [
        {name: '中国水泥', color: 'var(--ter)', pts: sh('cem'), dots: true, w: 3},
        {name: '中国钢', color: 'var(--ter)', pts: sh('st'), dots: true, dash: '5 3'},
        {name: '美国水泥', color: 'var(--main)', pts: su('cem'), dots: true, w: 3},
        {name: '美国钢', color: 'var(--main)', pts: su('st'), dots: true, dash: '5 3'}
      ];
      opt = {xmin: 1885, xmax: 2026, ymin: 0, ymax: 100, xt: [1900, 1925, 1950, 1975, 2000, 2025], yt: [0, 25, 50, 75, 100], yf: v => v + '%', marks: MARKS, L: 46};
    }
    lineChart(svg, series, opt);
    $('#gtLeg').innerHTML = series.map(s => '<span><i style="background:' + s.color + (s.dash ? ';opacity:.55' : '') + '"></i>' + s.name + (s.dash ? '（虚线）' : '') + '</span>').join('');
    if (m < 2) {
      const d = m === 0 ? D.cem : D.st, n = YR.length - 1;
      kv($('#gtKv'), [['1900 年全世界', d.w[0] + ' 百万吨'], ['2023 年全世界', (d.w[n] / 100).toFixed(1) + ' 亿吨'], ['涨了', Math.round(d.w[n] / d.w[0]) + ' 倍'], ['2023 年中国占', Math.round(d.c[n] / d.w[n] * 100) + '%']]);
      $('#gtSay').innerHTML = m === 0 ?
        '1900 年全世界一年只产约一千万吨水泥，今天是四十亿吨上下，涨了四百倍。美国在二十世纪前半叶是最大的水泥国；九十年代以后，曲线几乎全被中国拉上去了，2014 年前后中国一国约占全世界的六成。<b>此后中国的产量开始回落</b>：房子盖得差不多了。' :
        '钢比水泥早发力：1900 年前后美国一国就占全世界的三分之一以上，二战时更高。中国的钢产量在 2000 年以后几年翻一番，今天约占全世界的一半多。<b>其中很大一部分进了房子、桥和铁路</b>。';
    } else {
      kv($('#gtKv'), [['1950 年美国占水泥', Math.round(D.cem.u[3] / D.cem.w[3] * 100) + '%'], ['2014 年中国占水泥', Math.round(D.cem.c[11] / D.cem.w[11] * 100) + '%'], ['2023 年中国占钢', Math.round(D.st.c[14] / D.st.w[14] * 100) + '%']]);
      $('#gtSay').innerHTML = '一百多年里，“世界工地”换了地方：二十世纪前半叶在美国，后半叶分散到欧洲、苏联和日本，二十一世纪初集中到了中国。<b>哪里在大规模盖房子、修路、架桥，哪里就在烧水泥、炼钢</b>。接下来的工地，也许在印度、东南亚和非洲。';
    }
  }
  draw();
});
