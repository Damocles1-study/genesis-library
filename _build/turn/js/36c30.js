/* ---------- 装置 31：你的糖罐 ---------- */
dev('#sugarFig', fig => {
  const PC = [[1700, 4], [1730, 8], [1750, 10], [1770, 13], [1790, 17], [1800, 18], [1815, 19], [1830, 20]];   // 英国人均每年吃糖（磅），示意
  const per = y => { for (let i = 0; i < PC.length - 1; i++) if (y <= PC[i + 1][0]) return lerp(PC[i][1], PC[i + 1][1], (y - PC[i][0]) / (PC[i + 1][0] - PC[i][0])); return PC[PC.length - 1][1]; };
  const LBS = 600;   // 每个被奴役者每年产糖（磅，全部人口平均，示意）
  const Q = [[1501, 1.3], [1526, 5.1], [1551, 6.1], [1576, 15.2], [1601, 35.2], [1626, 31.5], [1651, 48.8], [1676, 72], [1701, 108.8], [1726, 147.1], [1751, 192.5], [1776, 200.8], [1801, 187.6], [1826, 177.1], [1851, 22.5]];
  const Y = $('#sgY'), N = $('#sgN'), svg = $('#sgSvg');
  Y.addEventListener('input', go); N.addEventListener('input', go);
  function go(){
    const y = +Y.value, n = +N.value, lb = per(y) * n, days = lb / LBS * 365;
    $('#sgYo').textContent = y + ' 年'; $('#sgNo').textContent = n + ' 人';
    kv($('#sgKV'), [['每人每年吃糖', per(y).toFixed(0) + ' 磅'], ['你家一年', Math.round(lb) + ' 磅'], ['相当于一个人', Math.round(days) + ' 天的活'], ['一百户这样的人家', (lb * 100 / LBS).toFixed(1) + ' 个人一整年']]);
    const say = $('#sgSay');
    say.className = 'say' + (y >= 1807 ? ' ok' : '');
    say.innerHTML = (y < 1750 ? '糖还没那么普及，可伦敦的咖啡馆和茶馆已经离不开它。' : y < 1791 ? '茶加糖，成了英国工人的日常。几乎每一磅都来自加勒比的奴隶种植园。' : y < 1807 ? '1791 年，几十万人发誓不吃“奴隶糖”。有的商店开始卖“东印度的糖”，广告上写着“不是奴隶种的”。' : y < 1834 ? '奴隶贸易已经禁止了，可种植园里的人还是奴隶，糖照样是他们种的。' : '1834 年以后，英属殖民地的奴隶制废除了。可英国人很快又开始买更便宜的古巴和巴西的糖，那里还是奴隶种的。') +
      '<br><small>按 1790 年代牙买加的产量粗算（每人每年约 ' + LBS + ' 磅）。这个数字很粗，只说明一个比例：一个英国家庭的糖罐，背后站着的是一个具体的人一年里的好些天。</small>';
    // 柱状图
    const W = 600, H = 190, L = 34, B = 26, T = 10, bw = (W - L - 6) / Q.length;
    let g = '';
    [0, 100, 200].forEach(v => { const yy = T + (1 - v / 210) * (H - T - B); g += '<line x1="' + L + '" x2="' + W + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--rule)"/>' + txt(L - 5, yy + 4, v, {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}); });
    Q.forEach((q, i) => { const h = q[1] / 210 * (H - T - B), x = L + i * bw + 2, on = y >= q[0] && y < q[0] + 25; g += '<rect x="' + x + '" y="' + (H - B - h) + '" width="' + (bw - 4) + '" height="' + h + '" rx="2" fill="' + (on ? 'var(--red)' : 'var(--ter)') + '" fill-opacity="' + (on ? 1 : .55) + '"/>' + (i % 2 === 0 ? txt(x + bw / 2 - 2, H - 8, q[0], {s: 10.5, c: 'var(--ink-3)', halo: false}) : ''); });
    const x07 = L + (1807 - 1501) / 25 * bw; g += '<line x1="' + x07 + '" x2="' + x07 + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink)" stroke-dasharray="3 3"/>' + txt(x07 + 4, T + 12, '1807 英国禁运', {s: 11, a: 'start'});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
  }
  go();
});
