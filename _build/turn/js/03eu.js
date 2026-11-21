/* ---------- 第三部封面装置：四百年，谁的海军最大 ---------- */
dev('#seaFig', fig => {
  const C = [['葡萄牙', '#4f9a6a'], ['西班牙', '#c9573a'], ['荷兰', '#e08a2e'], ['英国', '#3a6ea5'], ['法国', '#7d5ba6'], ['俄国', '#a0785a'], ['德国', '#7a7a7a'], ['日本', '#d16b8f'], ['美国', '#2a9d9a']];
  // 年份 → 各国份额（%，示意：参照现代学者对主力战舰的统计粗略取整，只看谁上谁下）
  const D = [
    [1500, [45, 25, 5, 10, 15, 0, 0, 0, 0]], [1520, [55, 20, 0, 13, 12, 0, 0, 0, 0]], [1550, [45, 25, 5, 12, 13, 0, 0, 0, 0]],
    [1580, [20, 40, 10, 20, 10, 0, 0, 0, 0]], [1600, [10, 35, 25, 25, 5, 0, 0, 0, 0]], [1630, [5, 25, 40, 20, 10, 0, 0, 0, 0]],
    [1660, [0, 10, 40, 35, 15, 0, 0, 0, 0]], [1690, [0, 5, 25, 40, 30, 0, 0, 0, 0]], [1720, [0, 10, 15, 55, 15, 5, 0, 0, 0]],
    [1750, [0, 15, 5, 45, 30, 5, 0, 0, 0]], [1780, [0, 20, 5, 40, 30, 5, 0, 0, 0]], [1810, [0, 5, 0, 70, 15, 10, 0, 0, 0]],
    [1830, [0, 0, 0, 55, 25, 15, 0, 0, 5]], [1860, [0, 0, 0, 50, 35, 8, 0, 0, 7]], [1880, [0, 0, 0, 55, 25, 8, 5, 2, 5]],
    [1900, [0, 0, 0, 45, 18, 12, 10, 5, 10]], [1914, [0, 0, 0, 40, 10, 5, 25, 5, 15]], [1930, [0, 0, 0, 35, 8, 2, 2, 18, 35]],
    [1945, [0, 0, 0, 25, 2, 3, 0, 0, 70]], [1950, [0, 0, 0, 18, 4, 8, 0, 0, 70]]
  ];
  const at = y => { let i = 0; while (i < D.length - 2 && D[i + 1][0] <= y) i++; const a = D[i], b = D[i + 1], t = clamp((y - a[0]) / (b[0] - a[0]), 0, 1); const v = a[1].map((x, j) => lerp(x, b[1][j], t)); const s = v.reduce((p, q) => p + q, 0); return v.map(x => x / s * 100); };
  const R = $('#sfR'), svg = $('#sfSvg');
  $('#sfLeg').innerHTML = C.map(c => '<span><i style="background:' + c[1] + '"></i>' + c[0] + '</span>').join('');
  const W = 600, H = 230, L = 34, Rr = 10, T = 10, B = 26;
  const X = y => L + (y - 1500) / 450 * (W - L - Rr), Y = v => T + (1 - v / 100) * (H - T - B);
  let base = '';
  const ys = []; for (let y = 1500; y <= 1950; y += 5) ys.push(y);
  const vals = ys.map(at);
  for (let j = C.length - 1; j >= 0; j--) {
    const top = vals.map(v => v.slice(0, j + 1).reduce((p, q) => p + q, 0)), bot = vals.map(v => v.slice(0, j).reduce((p, q) => p + q, 0));
    base += '<path d="M' + ys.map((y, i) => X(y).toFixed(1) + ',' + Y(top[i]).toFixed(1)).join('L') + 'L' + ys.slice().reverse().map((y, i) => X(y).toFixed(1) + ',' + Y(bot[bot.length - 1 - i]).toFixed(1)).join('L') + 'Z" fill="' + C[j][1] + '" fill-opacity=".85"/>';
  }
  [1500, 1600, 1700, 1800, 1900].forEach(y => base += txt(X(y), H - 8, y, {s: 11, c: 'var(--ink-3)', halo: false}));
  [0, 50, 100].forEach(v => base += txt(L - 5, Y(v) + 4, v + '%', {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}));
  const SAY = [
    [1580, '葡萄牙人卡住了印度洋的咽喉，西班牙人守着大西洋的银船航线。英国和荷兰的船还在后面追。'],
    [1640, '荷兰人来了：一个人口一两百万的小国，船比英、法、西加起来还多（商船更是如此）。<a href="' + href('c28') + '">第二十八章</a>。'],
    [1700, '英荷三次海战之后，又请来一个荷兰国王（<a href="' + href('c29') + '">第二十九章</a>），英国和荷兰合伙对付法国。'],
    [1800, '“第二次百年战争”：英国和法国打了一百多年，几乎每一次都是在海上赢的。<a href="' + href('c31') + '">第三十一章</a>。'],
    [1890, '特拉法尔加以后，皇家海军独步天下将近一百年。英国的规矩是“两强标准”：海军要比排在后面的两个国家加起来还强。'],
    [1925, '德国的造舰竞赛被一战打断了；1922 年的华盛顿条约，英国第一次同意让美国的主力舰和自己一样多。'],
    [1951, '二战结束时，美国海军的军舰比全世界其余国家加起来还多。棒交出去了。<a href="' + href('c37') + '">第三十七章</a>。']
  ];
  R.addEventListener('input', go);
  function go(){
    const y = +R.value, v = at(y);
    $('#sfO').textContent = y + ' 年';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = base + '<line x1="' + X(y) + '" x2="' + X(y) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink)" stroke-width="2"/>';
    const order = C.map((c, i) => [c, v[i]]).filter(x => x[1] >= 0.5).sort((a, b) => b[1] - a[1]);
    $('#sfBars').innerHTML = order.map(x => '<div class="row"><span class="nm">' + x[0][0] + '</span><span class="tr"><i style="width:' + x[1] + '%;background:' + x[0][1] + '"></i></span><span class="v">' + Math.round(x[1]) + '%</span></div>').join('');
    const s = SAY.find(z => y < z[0]) || SAY[SAY.length - 1];
    $('#sfSay').innerHTML = '<b>' + y + ' 年，排第一的是' + order[0][0][0] + '。</b>' + s[1];
  }
  go();
});
