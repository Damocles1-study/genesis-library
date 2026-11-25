/* ---------- 装置 1：能撑几个月 ---------- */
dev('#runFig', fig => {
  const svg = $('#rnSvg'), kvb = $('#rnKv'), say = $('#rnSay'), loan = $('#rnLoan');
  let ready = false;
  const g = {};
  function draw(){
    if (!ready) return;
    const L = loan.checked ? 100000 : 0, rate = 0.12 / 12;
    const stopAmt = g.stop * g.live;
    let cash = g.cash + L - g.up, months = 36, hit = null, pts = [[0, cash]], everProfit = null, spent = g.up;
    for (let m = 1; m <= months; m++) {
      const rev = g.rev * Math.min(1, m / 12);
      const out = g.live + g.op + L * rate;
      cash += rev - out;
      if (everProfit == null && rev - g.op - L * rate >= 0 && rev > 0) everProfit = m;
      if (hit == null) spent += Math.max(0, g.op + L * rate - rev);
      pts.push([m, cash]);
      if (hit == null && cash < stopAmt) hit = m;
    }
    const ys = pts.map(p => p[1]).concat([stopAmt, 0]);
    let lo = Math.min(...ys), hi = Math.max(...ys); if (hi - lo < 1000) hi = lo + 1000;
    const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    const step = (hi - lo) > 2e5 ? 50000 : (hi - lo) > 8e4 ? 20000 : (hi - lo) > 3e4 ? 10000 : 5000;
    const yt = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yt.push(v);
    const c = lineChart(svg, [{pts: pts.map(p => [p[0], p[1]]), color: 'var(--ter)', w: 2.6}], {xmin: 0, xmax: months, ymin: lo, ymax: hi, xt: [0, 6, 12, 18, 24, 30, 36], xf: v => v + ' 月', yt: yt, yf: v => (v / 1e4) + ' 万', H: 250, L: 50});
    let extra = '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(stopAmt) + '" y2="' + c.Y(stopAmt) + '" stroke="var(--main)" stroke-dasharray="5 4" stroke-width="1.6"/>' + txt(c.W - c.R - 4, c.Y(stopAmt) - 6, '止损线', {s: 12, a: 'end', c: 'var(--main)'});
    if (lo < 0) extra += '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(0) + '" y2="' + c.Y(0) + '" stroke="var(--ink-3)" stroke-width="1"/>';
    if (hit != null) extra += '<circle cx="' + c.X(hit) + '" cy="' + c.Y(pts[hit][1]) + '" r="5" fill="var(--main)"/>' + txt(c.X(hit), c.Y(pts[hit][1]) + 20, '第 ' + hit + ' 个月停', {s: 12, c: 'var(--main)', w: 1});
    svg.insertAdjacentHTML('beforeend', extra);
    const afterStop = hit != null ? pts[hit][1] : null;
    const owe = L;
    const rows = [['能撑', hit == null ? '三年以上' : hit + ' 个月'], ['生意本身不亏（不算生活费）', everProfit ? '第 ' + everProfit + ' 个月' : '三年内没有']];
    if (hit != null) rows.push(['停下时生意一共亏了', yuan(spent)]);
    if (L) rows.push(['停下时还欠', '<span class="neg">' + yuan(owe) + '</span>']);
    kv(kvb, rows);
    let s;
    if (g.cash < g.up) s = '一次性投入比手里的钱还多，' + (L ? '靠借来的钱才开得了张。' : '这门生意开不了张。') + ' ';
    else s = '';
    if (hit == null) s += '在这些假设下，钱撑得过三年。可假设是你自己定的：把“满一年时的月收入”往左拖一半，看看会怎样。';
    else if (!L) s += '钱在第 ' + hit + ' 个月碰到止损线，这时必须停。停下来的时候你亏了大约 ' + yuan(spent) + '（不算生活费），手里还留着 ' + g.stop + ' 个月的生活费去找下一份活。<b>这就是“有上限的亏”</b>。';
    else s += '钱在第 ' + hit + ' 个月碰到止损线。可这一回，停下来并不是结束：借来的十万还在，每个月一千块利息照付。<b>这就是“没有上限的亏”</b>：生意关了，债还开着。';
    say.innerHTML = s;
  }
  const go = () => { if (ready) draw(); };
  const k = (id, f) => slider(id, v => { g[id.slice(2).toLowerCase()] = v; return f(v); }, go);
  k('rnCash', v => yuan(v)); k('rnUp', v => yuan(v)); k('rnLive', v => yuan(v)); k('rnOp', v => yuan(v)); k('rnRev', v => yuan(v));
  k('rnStop', v => v ? '留 ' + v + ' 个月生活费' : '不留，花光为止');
  loan.addEventListener('change', go);
  ready = true; draw();
});
