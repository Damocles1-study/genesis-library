/* ---------- 装置 18：利润和现金 ---------- */
dev('#cashFig', fig => {
  const svg = $('#cfSvg'), kvb = $('#cfKv'), say = $('#cfSay');
  const g = {}; let ready = false;
  function draw(){
    if (!ready) return;
    const M = 12, lagIn = Math.round(g.d / 30), lagOut = Math.round(g.p / 30);
    const rev = [], cogs = [];
    for (let m = 0; m < M + 6; m++) { rev.push(g.r * Math.pow(1 + g.g / 100, m)); cogs.push(rev[m] * (1 - g.m / 100)); }
    let profit = 0, cash = g.c; const pP = [[0, 0]], pC = [[0, cash]]; let low = cash, lowM = 0, firstNeg = null;
    for (let m = 0; m < M; m++) {
      profit += rev[m] - cogs[m] - g.f;
      const inflow = m - lagIn >= 0 ? rev[m - lagIn] : 0;
      const outV = m - lagOut >= 0 ? cogs[m - lagOut] : 0;
      cash += inflow - outV - g.f;
      pP.push([m + 1, profit]); pC.push([m + 1, cash]);
      if (cash < low) { low = cash; lowM = m + 1; }
      if (firstNeg == null && cash < 0) firstNeg = m + 1;
    }
    const ys = pP.concat(pC).map(p => p[1]).concat([0]);
    let lo = Math.min(...ys), hi = Math.max(...ys); const pad = (hi - lo) * .08 || 1000; lo -= pad; hi += pad;
    const span = hi - lo, step = span > 2e6 ? 500000 : span > 8e5 ? 200000 : span > 3e5 ? 100000 : span > 1.2e5 ? 50000 : span > 5e4 ? 20000 : 10000;
    const yt = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yt.push(v);
    const c = lineChart(svg, [{pts: pP, color: 'var(--ter)', w: 2.6}, {pts: pC, color: 'var(--main)', w: 2.6, dash: '6 4'}], {xmin: 0, xmax: M, ymin: lo, ymax: hi, xt: [0, 3, 6, 9, 12], xf: v => v + ' 月', yt: yt, yf: v => (v / 1e4) + ' 万', H: 250, L: 50});
    let ex = '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(0) + '" y2="' + c.Y(0) + '" stroke="var(--ink)" stroke-width="1"/>';
    ex += txt(c.L + 6, c.T + 12, '实线：累计利润　虚线：手里的现金', {s: 11, a: 'start', c: 'var(--ink-2)'});
    if (firstNeg) ex += '<circle cx="' + c.X(firstNeg) + '" cy="' + c.Y(pC[firstNeg][1]) + '" r="5" fill="var(--main)"/>' + txt(c.X(firstNeg), c.Y(pC[firstNeg][1]) + 20, '第 ' + firstNeg + ' 个月钱没了', {s: 12, c: 'var(--main)', w: 1});
    svg.insertAdjacentHTML('beforeend', ex);
    kv(kvb, [['一年累计利润', '<span class="' + (profit >= 0 ? 'pos' : 'neg') + '">' + yuan(profit) + '</span>'], ['年底手里的现金', yuan(cash)], ['现金最低', yuan(low) + '（第 ' + lowM + ' 个月）'], ['被客户压着的钱', yuan(rev.slice(M - lagIn, M).reduce((a, b) => a + b, 0))]]);
    let s;
    if (firstNeg && profit > 0) s = '这就是“黑字倒闭”的样子：一年下来赚了 ' + yuan(profit) + '，可第 ' + firstNeg + ' 个月手里的钱就用光了，最低时差 ' + yuan(-low) + '。要么先借钱垫上，要么想办法让钱早点回来：收定金、分阶段付款、晚一点付供应商。';
    else if (firstNeg) s = '生意本身就在亏，现金先断是迟早的事。';
    else if (lagIn >= 2) s = '这一回没断，可年底有 ' + yuan(rev.slice(M - lagIn, M).reduce((a, b) => a + b, 0)) + ' 压在客户手里。试着把“每月增长”往右拖：生意越好，压着的钱越多。';
    else s = '客户付款快，现金几乎跟着利润走。这是先收后付的好处。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('cfR', v => { g.r = v; return yuan(v); }, go);
  slider('cfG', v => { g.g = v; return v + '%'; }, go);
  slider('cfM', v => { g.m = v; return v + '%'; }, go);
  slider('cfF', v => { g.f = v; return yuan(v); }, go);
  slider('cfD', v => { g.d = v; return v ? v + ' 天' : '当场付'; }, go);
  slider('cfP', v => { g.p = v; return v ? v + ' 天' : '当场付'; }, go);
  slider('cfC', v => { g.c = v; return yuan(v); }, go);
  ready = true; draw();
});
