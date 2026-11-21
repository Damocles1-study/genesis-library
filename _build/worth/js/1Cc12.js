
/* ---------- 装置 15：才能与运气 ---------- */
dev('#tlkFig', fig => {
  const N = 1000, STEPS = 80;
  let seed = 11, data = null;
  function run(){
    const pl = +$('#tlkL').value / 100, r = rng(seed);
    data = Array.from({length: N}, () => ({t: clamp(.6 + .1 * gauss(r), 0, 1), c: 10, good: 0, bad: 0}));
    for (let s = 0; s < STEPS; s++) data.forEach(p => {
      if (r() < pl) { if (r() < p.t) { p.c *= 2; p.good++; } }
      if (r() < pl) { p.c /= 2; p.bad++; }
    });
    draw();
  }
  function draw(){
    if (!data) return;
    const sv = $('#tlkSv').checked;
    const byC = [...data].sort((a, b) => b.c - a.c), byT = [...data].sort((a, b) => b.t - a.t);
    const top20 = new Set(byC.slice(0, 20));
    const W = 600, H = 300, L = 50, R = 12, T = 12, B = 30;
    const tmin = .25, tmax = .95;
    const lc = data.map(p => Math.log10(p.c)), lmin = Math.floor(Math.min(...lc)), lmax = Math.ceil(Math.max(...lc));
    const X = t => L + (t - tmin) / (tmax - tmin) * (W - L - R), Y = c => T + (1 - (Math.log10(c) - lmin) / Math.max(1, lmax - lmin)) * (H - T - B);
    let g = '';
    for (let l = lmin; l <= lmax; l++) g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(Math.pow(10, l)) + '" y2="' + Y(Math.pow(10, l)) + '" stroke="var(--rule)"' + (l === 1 ? ' stroke="var(--ink-3)"' : '') + '/>' + txt(L - 6, Y(Math.pow(10, l)) + 4, l === 1 ? '起点' : (l > 1 ? '×' + fmt(Math.pow(10, l - 1)) : '÷' + fmt(Math.pow(10, 1 - l))), {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false});
    [.3, .4, .5, .6, .7, .8, .9].forEach(t => g += txt(X(t), H - 10, t.toFixed(1), {s: 11, c: 'var(--ink-3)', halo: false}));
    g += txt(W - R, H - 10, '才能 →', {s: 11, a: 'end', c: 'var(--ink-2)', halo: false});
    data.forEach(p => {
      const top = top20.has(p);
      if (sv && !top) return;
      g += '<circle cx="' + X(clamp(p.t, tmin, tmax)).toFixed(1) + '" cy="' + Y(p.c).toFixed(1) + '" r="' + (top ? 4.5 : 2.2) + '" fill="' + (top ? 'var(--red)' : 'var(--main)') + '" opacity="' + (top ? .95 : .4) + '"/>';
    });
    const best = byT[0];
    if (!sv) g += '<circle cx="' + X(clamp(best.t, tmin, tmax)) + '" cy="' + Y(best.c) + '" r="7" fill="none" stroke="var(--och)" stroke-width="2.5"/>' + txt(X(clamp(best.t, tmin, tmax)) - 8, Y(best.c) - 10, '最有才能的人', {s: 11, a: 'end', c: 'var(--och)'});
    $('#tlkSvg').setAttribute('viewBox', '0 0 ' + W + ' ' + H); $('#tlkSvg').innerHTML = g;
    const richest = byC[0];
    const rankT = byT.indexOf(richest) + 1, rankC = byC.indexOf(best) + 1;
    const topT = byC.slice(0, 20).reduce((a, p) => a + p.t, 0) / 20, allT = data.reduce((a, p) => a + p.t, 0) / N;
    const inTop20T = byC.slice(0, 20).filter(p => byT.indexOf(p) < 100).length;
    kv($('#tlkKv'), [['最成功的人，才能排第', rankT + ' 名'], ['最有才能的人，成功排第', rankC + ' 名'], ['前二十名里，才能也在前一成的', inTop20T + ' 人'], ['前二十名平均才能 / 全体', topT.toFixed(2) + ' / ' + allT.toFixed(2)]]);
    $('#tlkSay').innerHTML = sv ? '只看最成功的二十个人：他们的平均才能是 <b>' + topT.toFixed(2) + '</b>，比全体的 ' + allT.toFixed(2) + ' 高一点，于是你会得出“成功靠才能”的结论。可你看不见的是：和他们才能差不多的人有几百个，大多数停在了起点附近，甚至更低。他们好运的次数平均比别人多 ' + (byC.slice(0, 20).reduce((a, p) => a + p.good - p.bad, 0) / 20 - data.reduce((a, p) => a + p.good - p.bad, 0) / N).toFixed(1) + ' 次。' :
      '四十年后，最成功的那个人才能排第 <b>' + rankT + '</b> 名；最有才能的那个人（橙圈），成功只排第 <b>' + rankC + '</b> 名。前二十名（红点）里，才能也在前一成的只有 ' + inTop20T + ' 个。才能高确实让人更容易抓住好运，所以红点大多在中间偏右；但才能中上的人太多，谁能连抽到好运，很大程度上是运气。多按几次“开始”。';
  }
  $('#tlkGo').addEventListener('click', () => { seed = (seed * 48271 + 7) % 2147483647; run(); });
  slider('tlkL', x => '每半年 ' + x + '%', () => run());
  $('#tlkSv').addEventListener('change', draw);
});
