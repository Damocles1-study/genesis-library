
/* ---------- 装置 17：潜水以后多久能飞 ---------- */
dev('#diveFig', fig => {
  const svg = $('#dvSvg'), say = $('#dvSay');
  const g = {d: 18, t: 45, n: 1, s: 2};
  const HT = [10, 40, 120, 360], MR = [1.6, 1.35, 1.2, 1.1], NAME = ['很快的组织', '较快', '较慢', '很慢的组织'];
  const CAB = 0.79, N2 = 0.79;
  const step = (P, Pin, min, ht) => Pin + (P - Pin) * Math.pow(2, -min / ht);
  function load(){
    let P = HT.map(() => N2);
    for (let k = 0; k < g.n; k++) {
      P = P.map((p, i) => step(p, N2 * (1 + g.d / 10), g.t, HT[i]));
      if (k < g.n - 1) P = P.map((p, i) => step(p, N2, 90, HT[i]));
    }
    return P;
  }
  const after = (P0, hrs) => P0.map((p, i) => step(p, N2, hrs * 60, HT[i]));
  const ratio = P => P.map((p, i) => p / (CAB * MR[i]));
  function draw(){
    const P0 = load();
    const W = 600, H = 300, L = 46, R = 14, T = 16, split = 330;
    let g2 = '';
    /* 左：四种组织此刻离“冒泡线”多远 */
    const rr = ratio(after(P0, g.s));
    const bx = 70, bw = 46, gap = 18, top = 30, base = 250, Ymax = 1.6;
    const Y = v => base - Math.min(v, Ymax) / Ymax * (base - top);
    g2 += '<line x1="40" x2="' + (split - 20) + '" y1="' + Y(1) + '" y2="' + Y(1) + '" stroke="var(--red)" stroke-dasharray="5 4"/>' + txt(42, Y(1) - 5, '冒泡线', {s: 11, a: 'start', c: 'var(--red)'});
    rr.forEach((v, i) => {
      const x = bx + i * (bw + gap);
      g2 += '<rect x="' + x + '" y="' + Y(v) + '" width="' + bw + '" height="' + (base - Y(v)) + '" rx="3" fill="' + (v >= 1 ? 'var(--red)' : v > 0.85 ? 'var(--och)' : 'var(--ter)') + '" opacity=".85"/>';
      g2 += txt(x + bw / 2, Y(v) - 5, Math.round(v * 100) + '%', {s: 11, w: 1});
      g2 += txt(x + bw / 2, base + 14, HT[i] + '分', {s: 10.5, c: 'var(--ink-3)', halo: false});
    });
    g2 += txt(bx - 30, top - 12, '此刻登机，各组织到冒泡线的百分比', {s: 11, a: 'start', c: 'var(--ink-3)'});
    g2 += txt(bx + 2 * (bw + gap) - gap / 2, base + 30, '组织的半饱和时间', {s: 10.5, c: 'var(--ink-3)', halo: false});
    /* 右：最危险的组织随水面休息时间的变化 */
    const X2 = h => split + 20 + h / 30 * (W - R - split - 20);
    const Y2 = v => base - Math.min(v, Ymax) / Ymax * (base - top);
    const curve = []; let ok = null;
    for (let h = 0; h <= 30; h += 0.25) { const v = Math.max(...ratio(after(P0, h))); curve.push([h, v]); if (ok == null && v < 1) ok = h; }
    [0, 6, 12, 18, 24, 30].forEach(h => g2 += '<line x1="' + X2(h) + '" x2="' + X2(h) + '" y1="' + top + '" y2="' + base + '" stroke="var(--rule)"/>' + txt(X2(h), base + 14, h + '时', {s: 10.5, c: 'var(--ink-3)', halo: false}));
    g2 += '<line x1="' + X2(0) + '" x2="' + X2(30) + '" y1="' + Y2(1) + '" y2="' + Y2(1) + '" stroke="var(--red)" stroke-dasharray="5 4"/>';
    const gl = g.n > 1 ? 18 : 12;
    g2 += '<rect x="' + X2(0) + '" y="' + top + '" width="' + (X2(gl) - X2(0)) + '" height="' + (base - top) + '" fill="var(--main)" opacity=".08"/>' + txt(X2(gl) - 3, top + 12, '指南：至少 ' + gl + ' 小时', {s: 11, a: 'end', c: 'var(--main)', w: 1});
    g2 += '<path d="M' + curve.map(p => X2(p[0]).toFixed(1) + ',' + Y2(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="var(--ter)" stroke-width="2.4"/>';
    const vNow = Math.max(...rr);
    g2 += '<circle cx="' + X2(g.s) + '" cy="' + Y2(vNow) + '" r="5" fill="var(--main)"/>';
    g2 += txt(split + 20, top - 12, '上水以后过了多久（最危险的那种组织）', {s: 11, a: 'start', c: 'var(--ink-3)'});
    g2 += txt(X2(15), base + 30, '水面休息时间', {s: 10.5, c: 'var(--ink-3)', halo: false});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g2;
    const worst = rr.indexOf(vNow);
    let s = '上水 ' + g.s + ' 小时后登机，' + NAME[worst] + '离冒泡线最近（' + Math.round(vNow * 100) + '%）。';
    s += ok == null ? ' 这个模型里三十小时都没降下来，这样的潜水一定要按专业的减压规定来。' : ' 这个简化模型算出来，大约 <b>' + ok + ' 小时</b>后各组织都降到线下；指南要求的是至少 <b>' + gl + ' 小时</b>。';
    s += ' 两者的差距就是安全余量：真实的身体有气泡、有个体差异、有脱水和疲劳，指南宁可多等。';
    if (g.n > 1) s += ' 一天潜好几次，慢组织里攒下的氮更多，所以要等得更久。';
    say.innerHTML = s;
  }
  slider('dvD', v => { g.d = v; return v + ' 米'; }, draw);
  slider('dvT', v => { g.t = v; return v + ' 分钟'; }, draw);
  slider('dvN', v => { g.n = v; return v + ' 次'; }, draw);
  slider('dvS', v => { g.s = v; return v + ' 小时'; }, draw);
});
