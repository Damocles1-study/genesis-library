
/* ---------- 装置 4：四种复利 ---------- */
dev('#cpFig', fig => {
  const P = [
    {k: '钱', v0: 10, g: 7, d: 3, K: 1000, q: 4, L: 35, unit: '万', note: '默认：年增长 7%，通胀和费用吃掉 3%，每年 4% 的机会遇到一次损失三成多的意外（失业、大病、投资大跌）。钱几乎没有天花板，所以海报和现实的差别主要来自漏水和意外。'},
    {k: '技能', v0: 5, g: 35, d: 4, K: 100, q: 8, L: 30, unit: '分', note: '默认：起步快（35%），遗忘每年 4%，天花板 100 分；每年 8% 的机会换到不相干的方向，丢掉三成。注意那条绿线：它前几年和海报差不多，后来贴着天花板走平。技能的价钱为什么还会越往上越陡，正文里讲了。'},
    {k: '身体', v0: 60, g: 10, d: 3, K: 100, q: 6, L: 25, unit: '分', note: '默认：坚持锻炼每年进步 10%，年龄带来的衰退每年 3%（随年龄会更大，这里没算），每年 6% 的机会受伤或生病丢掉四分之一。把增长率拉到 0（不锻炼），看看会怎样。'},
    {k: '名声', v0: 1, g: 30, d: 1, K: 100, q: 3, L: 85, unit: '分', note: '默认：口碑一传十、十传百，增长很快；但每年有 3% 的机会出一件事，一下子丢掉八成多。把“一次意外损失”拉到 100%，再把意外概率调高一点，看看名声有多脆。'}
  ];
  let cur = 0;
  const ids = ['G', 'D', 'K', 'Q', 'L'];
  btnRow($('#cpTabs'), P.map(p => p.k), 0, i => { cur = i; load(); });
  const fmts = {G: x => x + '% / 年', D: x => x + '% / 年', K: x => x + ' ' + P[cur].unit, Q: x => x + '%', L: x => x + '%'};
  ids.forEach(id => $('#cp' + id).addEventListener('input', () => { $('#cp' + id + 'O').textContent = fmts[id](+$('#cp' + id).value); draw(); }));
  function load(){
    const p = P[cur];
    [['G', p.g], ['D', p.d], ['K', p.K], ['Q', p.q], ['L', p.L]].forEach(a => { $('#cp' + a[0]).value = a[1]; $('#cp' + a[0] + 'O').textContent = fmts[a[0]](a[1]); });
    draw();
  }
  function draw(){
    const p = P[cur], g = +$('#cpG').value / 100, d = +$('#cpD').value / 100, K = +$('#cpK').value, q = +$('#cpQ').value / 100, L = +$('#cpL').value / 100;
    const Y = 30, poster = [], logi = [];
    let a = p.v0, b = p.v0;
    for (let t = 0; t <= Y; t++) { poster.push([t, a]); logi.push([t, b]); a *= 1 + g; b = Math.max(0, b + g * b * (1 - b / K) - d * b); }
    const r = rng(12345 + cur), N = 200, paths = [];
    for (let i = 0; i < N; i++) { let v = p.v0; const path = [v]; for (let t = 1; t <= Y; t++) { v = Math.max(0, v + g * v * (1 - v / K) - d * v); if (r() < q) v *= 1 - L; path.push(v); } paths.push(path); }
    const med = [], lo = [], hi = [];
    for (let t = 0; t <= Y; t++) { const col = paths.map(x => x[t]); med.push([t, pct(col, .5)]); lo.push(pct(col, .1)); hi.push(pct(col, .9)); }
    const ymax = Math.max(...logi.map(x => x[1]), ...hi) * 1.25 || 1;
    const svg = $('#cpSvg');
    const ax = lineChart(svg, [
      {color: 'var(--ink-3)', pts: poster.map(x => [x[0], x[1] <= ymax ? x[1] : null]), dash: '5 4', w: 2},
      {color: 'var(--main)', pts: logi, w: 2.6},
      {color: 'var(--red)', pts: med, w: 2.6}
    ], {xmin: 0, xmax: Y, ymin: 0, ymax, xt: [0, 5, 10, 15, 20, 25, 30], xf: v => v + ' 年', yt: [0, ymax / 4, ymax / 2, ymax * 3 / 4].map(v => +v.toPrecision(2)), yf: v => fmt(v)});
    const band = '<path d="M' + lo.map((v, t) => ax.X(t).toFixed(1) + ',' + ax.Y(v).toFixed(1)).join('L') + 'L' + hi.map((v, t) => ax.X(t).toFixed(1) + ',' + ax.Y(v).toFixed(1)).reverse().join('L') + 'Z" fill="var(--red)" opacity=".12"/>';
    svg.innerHTML = band + svg.innerHTML;
    const out = poster.findIndex(x => x[1] > ymax);
    if (out > 0) svg.innerHTML += txt(ax.X(out - 1) + 4, ax.T + 12, '海报上的线在第 ' + out + ' 年冲出了图', {s: 11, a: 'start', c: 'var(--ink-3)'});
    const zero = paths.filter(x => x[Y] < p.v0).length;
    $('#cpSay').innerHTML = '<b>' + p.k + '</b>：三十年后，海报上的数是 <b>' + fmt(poster[Y][1]) + '</b>，有天花板和漏水是 <b>' + fmt(logi[Y][1]) + '</b>，再加上意外，中间那个人是 <b>' + fmt(med[Y][1]) + '</b>（单位：' + p.unit + '）。两百人里有 <b>' + zero + '</b> 个人最后比起点还少。<br><small>' + p.note + '</small>';
  }
  load();
});
