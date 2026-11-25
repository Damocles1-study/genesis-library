
/* ---------- 装置 14：借来的钱能撑多久 ---------- */
dev('#levFig', fig => {
  const svg = $('#lvSvg'), kvb = $('#lvKv'), say = $('#lvSay');
  let seed = 2015, ready = false;
  function go(){
    if (!ready) return;
    const Lv = gL(), mu = gM() / 100, sig = gS() / 100, rb = gR() / 100, N = 1000, D = 250, r = rng(seed);
    const dm = mu / D - sig * sig / (2 * D), ds = sig / Math.sqrt(D), MM = 0.15;
    let dead = 0, finals = [], paths = [], noLev = [], deadLeft = 0, deadUp = 0;
    for (let i = 0; i < N; i++) {
      let P = 1, debt = Lv - 1, sh = Lv, eq = 1, out = -1; const pp = [[0, 1]];
      for (let t = 1; t <= D; t++) {
        P *= Math.exp(dm + ds * gauss(r));
        if (out >= 0) continue;
        debt *= 1 + rb / D;
        eq = sh * P - debt;
        if (Lv > 1 && eq < MM * sh * P) { out = t; eq = Math.max(0, eq); if (i < 30) pp.push([t, eq]); continue; }
        if (i < 30 && t % 5 === 0) pp.push([t, eq]);
      }
      if (out >= 0) { dead++; deadLeft += eq; if (P > 1) deadUp++; }
      finals.push(out >= 0 ? eq : eq);
      noLev.push(P);
      if (i < 30) paths.push({pp, out});
    }
    const ymax = Math.min(6, Math.max(2, pct(finals, 0.97) * 1.1));
    const ser = paths.map(p => ({color: p.out >= 0 ? 'var(--dn)' : 'var(--up)', pts: p.pp.map(q => [q[0], Math.min(q[1], ymax)]), w: 1, dots: false}));
    const g = lineChart(svg, ser, {xmin: 0, xmax: D, ymin: 0, ymax, xt: [0, 50, 100, 150, 200, 250], xf: x => x + '天', yt: [0, 1, 2, ymax > 3 ? Math.floor(ymax) : null].filter(v => v != null), yf: v => v === 1 ? '本金' : v + '倍', H: 230});
    let h = '';
    paths.forEach(p => { if (p.out >= 0) { const last = p.pp[p.pp.length - 1]; h += '<text x="' + g.X(last[0]) + '" y="' + (g.Y(Math.min(last[1], ymax)) + 4) + '" font-size="12" text-anchor="middle" fill="var(--dn)" font-weight="700">×</text>'; } });
    h += '<line x1="' + g.L + '" x2="' + (g.W - g.R) + '" y1="' + g.Y(1) + '" y2="' + g.Y(1) + '" stroke="var(--ink-3)" stroke-dasharray="3 3"/>';
    svg.insertAdjacentHTML('beforeend', h);
    const med = pct(finals, 0.5), medNo = pct(noLev, 0.5), avgLeft = dead ? deadLeft / dead : 0;
    kv(kvb, [['被强平', '<span class="dn">' + (dead / N * 100).toFixed(1) + '%</span>'], ['一年后中位数', (med * 100 - 100).toFixed(0) + '%'], ['不加杠杆的中位数', (medNo * 100 - 100).toFixed(0) + '%'], ['被强平的人平均剩下', dead ? (avgLeft * 100).toFixed(0) + '% 本金' : '—']]);
    let s = Lv === 1 ? '不加杠杆：没有平仓线，一千种走势里没有人被强制出局，最差的情况也只是账面亏损，你可以选择等。' : Lv + ' 倍杠杆：一千种走势里，有 ' + dead + ' 种在一年之内被强制平仓。';
    if (Lv > 1 && dead) s += ' 被平仓的 ' + dead + ' 种走势里，有 ' + deadUp + ' 种到年底市场其实是涨的：方向看对了，人已经不在场上。';
    if (Lv > 1 && rb > 0) s += ' 借款利息每年吃掉约 ' + ((Lv - 1) * rb * 100).toFixed(1) + ' 个百分点的本金收益。';
    say.textContent = s;
  }
  const gL = slider('lvL', v => v + ' 倍', go), gM = slider('lvM', v => (v > 0 ? '+' : '') + v + '%', go), gS = slider('lvS', v => v + '%', go), gR = slider('lvR', v => v + '%', go);
  $('#lvRe').addEventListener('click', () => { seed += 31; go(); });
  ready = true; go();
});
