
/* ---------- 装置 20：上岸的概率 ---------- */
dev('#gkFig', fig => {
  const svg = $('#gkSvg');
  // 上半：过审人数（万）与竞争比
  const D = [[2023, 259.8, 70], [2024, 303.3, 77], [2025, 341.6, 86], [2026, 371.8, 98]];
  (function chart(){
    const W = 600, H = 170, L = 50, B = 26, T = 12;
    const X = i => L + 40 + i * ((W - L - 80) / 3), Y = v => T + (1 - v / 400) * (H - T - B);
    let g = '';
    [0, 100, 200, 300, 400].forEach(v => g += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--rule)"/>' + txt(L - 6, Y(v) + 4, v + '万', {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}));
    D.forEach((d, i) => {
      g += '<rect x="' + (X(i) - 30) + '" y="' + Y(d[1]) + '" width="60" height="' + (Y(0) - Y(d[1])) + '" rx="3" fill="var(--main)" opacity=".8"/>';
      g += txt(X(i), Y(d[1]) - 6, d[1] + ' 万', {s: 12, c: 'var(--ink)'}) + txt(X(i), Y(d[1]) + 18, d[2] + ':1', {s: 12, c: 'var(--paper)', halo: false, w: true});
      g += txt(X(i), H - 8, d[0] + ' 年度', {s: 11, c: 'var(--ink-3)', halo: false});
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
  })();
  const LV = ['后一半', '平均水平', '前 40%', '前 25%', '前 15%', '前 10%', '前 5%', '前 1%'];
  const MUL = [0.3, 1, 1.6, 2.6, 4, 5.5, 8, 15];
  const Rr = $('#gkR'), Lr = $('#gkL'), Nr = $('#gkN'), Yr = $('#gkY');
  Lr.value = 2;
  function calc(){
    const ratio = +Rr.value, m = MUL[+Lr.value - 1], n = +Nr.value, y = +Yr.value;
    $('#gkRO').textContent = ratio + ' : 1'; $('#gkLO').textContent = LV[+Lr.value - 1]; $('#gkNO').textContent = n + ' 次'; $('#gkYO').textContent = y + ' 年';
    const p = clamp(m / ratio, 0, 0.85);
    const tot = 1 - Math.pow(1 - p, n * y);
    kv($('#gkKv'), [['单次考上的概率', (p * 100).toFixed(p < 0.01 ? 2 : 1) + '%'], ['一共考', n * y + ' 次'], ['至少上岸一次', (tot * 100).toFixed(1) + '%']]);
    const s = $('#gkSay');
    s.className = 'say ' + (tot > 0.6 ? 'ok' : tot < 0.2 ? 'bad' : '');
    s.innerHTML = m <= 1 ? '水平在平均线上下的人，面对 ' + ratio + ' 比 1 的岗位，单次机会就是 ' + (100 / ratio).toFixed(1) + '% 左右。<b>决定结果的主要是两样：你能不能挤进前列，以及你报的岗位竞争有多激烈</b>。' :
      tot > 0.8 ? '如果你真的稳定在这个水平，多考几次，上岸几乎是时间问题。难的是：大多数人高估了自己的位置。' :
      '把竞争比拖到三十上下（偏远地区、限制条件多的岗位常见），再看看概率变成多少。<b>选岗位，有时候比多刷一套题更管用</b>。';
  }
  [Rr, Lr, Nr, Yr].forEach(x => x.addEventListener('input', calc)); calc();
});
