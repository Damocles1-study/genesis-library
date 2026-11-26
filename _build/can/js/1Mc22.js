
/* ---------- 装置 23：一间关着窗的屋子 ---------- */
dev('#coFig', fig => {
  const svg = $('#coSvg'), kvb = $('#coKv'), say = $('#coSay');
  /* [名称, 放出 L/h, 持续 h, 屋子 m³, 屋子说明] */
  const SRC = [['卧室里一盆炭火', 18, 4, 30, '约十二平方米的卧室'], ['没封好的煤炉，整夜', 5, 10, 30, '约十二平方米的卧室'], ['浴室里烧得不好的燃气热水器', 40, 0.5, 6, '约三平方米的小浴室']];
  const VEN = [['门窗紧闭', 0.3], ['开一条窗缝', 1.5], ['开着窗', 6]];
  let si = 0, vi = 0, tm = 3;
  const BANDS = [[0, 10, '一般没感觉'], [10, 20, '头疼'], [20, 30, '头晕、恶心、没劲'], [30, 40, '迷糊、腿软站不起来'], [40, 60, '昏迷'], [60, 80, '可能致命']];
  function run(){
    const s = SRC[si], a = VEN[vi][1], dt = 1 / 120;
    let C = 0, H = 0.5; const pc = [[0, 0]], ph = [[0, H]]; let t20 = null, t40 = null, peakC = 0;
    for (let k = 1; k <= 8 * 120; k++) {
      const t = k * dt, src = t <= s[2] ? 1000 * s[1] / s[3] : 0;
      C += (src - a * C) * dt; if (C > peakC) peakC = C;
      H += (0.16 * C - H) / 2.5 * dt; H = Math.max(0.5, Math.min(80, H));
      if (t20 == null && H >= 20) t20 = t; if (t40 == null && H >= 40) t40 = t;
      if (k % 5 === 0) { pc.push([t, C]); ph.push([t, H]); }
    }
    return {pc, ph, t20, t40, peakC};
  }
  const hm = h => h == null ? '' : h < 1 ? Math.round(h * 60) + ' 分钟' : (Math.round(h * 4) / 4) + ' 小时';
  function draw(){
    const r = run();
    const c = lineChart(svg, [{pts: r.ph.filter(p => p[0] <= tm + 1e-9), color: 'var(--red)', w: 2.8}, {pts: r.ph.filter(p => p[0] >= tm - 1e-9), color: 'var(--rule)', w: 1.6, dash: '3 3'}], {xmin: 0, xmax: 8, ymin: 0, ymax: 80, xt: [0, 1, 2, 3, 4, 5, 6, 7, 8], xf: v => v + ' 时', yt: [0, 20, 40, 60, 80], yf: v => v + '%', H: 270, L: 40});
    let ex = '';
    BANDS.forEach((b, k) => { ex += '<rect x="' + c.L + '" y="' + c.Y(b[1]) + '" width="' + (c.W - c.L - c.R) + '" height="' + (c.Y(b[0]) - c.Y(b[1])) + '" fill="var(--red)" opacity="' + (0.02 + k * 0.035) + '"/>' + txt(c.W - c.R - 4, c.Y(b[1]) + 13, b[2], {s: 10.5, a: 'end', c: 'var(--ink-2)'}); });
    svg.insertAdjacentHTML('afterbegin', ex);
    const cur = r.ph.reduce((a, p) => Math.abs(p[0] - tm) < Math.abs(a[0] - tm) ? p : a, r.ph[0]);
    const cc = r.pc.reduce((a, p) => Math.abs(p[0] - tm) < Math.abs(a[0] - tm) ? p : a, r.pc[0]);
    svg.insertAdjacentHTML('beforeend', '<circle cx="' + c.X(cur[0]) + '" cy="' + c.Y(cur[1]) + '" r="6" fill="var(--red)"/>' + txt(c.L + 4, c.T + 10, '血液里的碳氧血红蛋白', {s: 11, a: 'start', c: 'var(--ink-3)'}) + (SRC[si][2] < 8 ? '<line x1="' + c.X(SRC[si][2]) + '" x2="' + c.X(SRC[si][2]) + '" y1="' + c.T + '" y2="' + (c.H - c.B) + '" stroke="var(--ink-3)" stroke-dasharray="2 3"/>' + txt(c.X(SRC[si][2]) + 3, c.H - c.B - 6, '火源灭了', {s: 10.5, a: 'start', c: 'var(--ink-3)'}) : ''));
    const band = BANDS.find(b => cur[1] < b[1]) || BANDS[BANDS.length - 1];
    kv(kvb, [['屋里的一氧化碳', Math.round(cc[1]).toLocaleString() + ' ppm'], ['碳氧血红蛋白', Math.round(cur[1]) + '%'], ['大概的状态', band[2]]]);
    let s = SRC[si][0] + '，' + SRC[si][4] + '，' + VEN[vi][0] + '。';
    if (r.t40 != null) s += '约 <b>' + hm(r.t20) + '</b> 后开始头晕恶心，约 <b>' + hm(r.t40) + '</b> 后可能昏迷。' + (si === 2 ? '这就是有人在浴室里洗着洗着就倒下的原因：浴室小，热水器烧得不好，二三十分钟就够了。' : '人要是睡着了，头疼头晕根本不会把他叫醒。');
    else if (r.t20 != null) s += '约 ' + hm(r.t20) + ' 后会开始头晕、恶心、没劲，像感冒。这时候最要紧的是意识到“不是感冒”，开窗出门。';
    else s += '换气够快，屋里的一氧化碳积不起来，碳氧血红蛋白一直没上到让人难受的程度。可这只是模型：风向一变、窗被关上，结果就完全不同。';
    if (vi === 0) s += ' 试试“开一条窗缝”或者“开着窗”。';
    say.innerHTML = s;
  }
  btnRow($('#coSrc'), SRC.map(x => x[0]), 0, i => { si = i; draw(); });
  btnRow($('#coVen'), VEN.map(x => x[0]), 0, i => { vi = i; draw(); });
  slider('coT', v => { tm = v; return v < 1 ? Math.round(v * 60) + ' 分钟' : v + ' 小时'; }, draw);
});
