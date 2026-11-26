
/* ---------- 装置 13：醒了多少个小时 ---------- */
dev('#awakeFig', fig => {
  const svg = $('#awSvg'), say = $('#awSay');
  const g = {u: 7, n: 31.5};
  const clock = h => { const d = Math.floor(h / 24), m = h % 24; return (d ? '次日 ' : '') + Math.floor(m) + ':' + (m % 1 ? '30' : '00'); };
  const dip = h => { const m = ((h % 24) + 24) % 24; return m >= 1 && m <= 7 ? 15 * Math.sin(Math.PI * (m - 1) / 6) : 0; };
  const eq = (t, u) => Math.max(0, (t - u - 10) * 7) + (t - u > 14 ? dip(t) : 0);
  function draw(){
    const u = g.u, n = Math.max(g.n, u + 1), x1 = Math.max(n + 3, u + 30);
    const pts = []; for (let t = u; t <= x1; t += 0.25) pts.push([t, eq(t, u)]);
    const ymax = Math.max(130, Math.max(...pts.map(p => p[1])) + 10);
    const c = lineChart(svg, [{pts, color: 'var(--ter)', w: 2.6}], {xmin: u, xmax: x1, ymin: 0, ymax: ymax, xt: Array.from({length: Math.floor((x1 - u) / 4) + 1}, (_, i) => u + i * 4), xf: v => clock(v).replace('次日 ', '次'), yt: [0, 20, 50, 80, 120].filter(v => v <= ymax), H: 250});
    let ex = '';
    [[20, '20 饮酒驾车'], [80, '80 醉酒驾车']].forEach(l => ex += '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(l[0]) + '" y2="' + c.Y(l[0]) + '" stroke="var(--red)" stroke-dasharray="5 4" opacity=".8"/>' + txt(c.W - c.R - 4, c.Y(l[0]) - 4, l[1], {s: 11, a: 'end', c: 'var(--red)'}));
    for (let d = Math.floor(u / 24); d * 24 <= x1; d++) { const a = Math.max(u, d * 24 + 2), b = Math.min(x1, d * 24 + 6); if (b > a) ex += '<rect x="' + c.X(a) + '" y="' + c.T + '" width="' + (c.X(b) - c.X(a)) + '" height="' + (c.H - c.B - c.T) + '" fill="var(--blu)" opacity=".1"/>' + txt((c.X(a) + c.X(b)) / 2, c.T + 12, '凌晨低谷', {s: 10.5, c: 'var(--blu)'}); }
    const v = eq(n, u);
    ex += '<line x1="' + c.X(n) + '" x2="' + c.X(n) + '" y1="' + c.T + '" y2="' + (c.H - c.B) + '" stroke="var(--ink)" stroke-width="1.5"/><circle cx="' + c.X(n) + '" cy="' + c.Y(v) + '" r="5.5" fill="var(--main)"/>' + txt(c.X(n) + 6, c.Y(v) - 8, '现在', {s: 11.5, a: 'start', c: 'var(--main)', w: 1});
    ex += txt(c.L + 4, c.H - c.B - 6, '相当于血液酒精（毫克每百毫升，示意）', {s: 10.5, a: 'start', c: 'var(--ink-3)'});
    svg.insertAdjacentHTML('beforeend', ex);
    const hrs = n - u;
    let s = '从 ' + clock(u) + ' 起床，到 ' + clock(n) + ' 已经醒了 <b>' + hrs + ' 个小时</b>，开车的状态大约相当于血液酒精 <b>' + Math.round(v) + '</b> 毫克每百毫升。';
    if (v >= 80) s += ' 已经越过了“醉驾”那条线。今天别开车，先睡。';
    else if (v >= 20) s += ' 如果这是酒精，你已经算酒驾了。困驾没有人查，只能自己管住。';
    else s += ' 还在比较安全的范围，但熬到后半夜，曲线会往上走得很快。';
    say.innerHTML = s;
  }
  slider('awU', v => { g.u = v; return clock(v); }, draw);
  slider('awN', v => { g.n = v; return clock(v); }, draw);
});
