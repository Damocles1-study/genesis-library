/* ---------- 装置 23：不借钱能长多快 ---------- */
dev('#growFig', fig => {
  const svg = $('#grSvg'), kvb = $('#grKv'), say = $('#grSay');
  const g = {}; let ready = false;
  function draw(){
    if (!ready) return;
    const roe = g.t * g.m / 100, sg = roe * g.b / 100, want = g.w / 100;
    const a = [[0, g.k]], b = [[0, g.k]];
    for (let y = 1; y <= 5; y++) { a.push([y, a[y - 1][1] * (1 + sg)]); b.push([y, b[y - 1][1] * (1 + want)]); }
    const ymax = Math.max(a[5][1], b[5][1]) * 1.1;
    const step = ymax > 5e6 ? 2e6 : ymax > 2e6 ? 1e6 : ymax > 8e5 ? 5e5 : ymax > 3e5 ? 1e5 : 5e4;
    const yt = []; for (let v = 0; v <= ymax; v += step) yt.push(v);
    lineChart(svg, [{pts: b, color: 'var(--ink-3)', dash: '5 4', w: 2}, {pts: a, color: 'var(--ter)', w: 2.8, dots: true}], {xmin: 0, xmax: 5, ymin: 0, ymax: ymax, xt: [0, 1, 2, 3, 4, 5], xf: v => v + ' 年', yt: yt, yf: v => (v / 1e4) + ' 万', H: 230, L: 54});
    svg.insertAdjacentHTML('beforeend', txt(60, 22, '实线：只用自己赚的钱　虚线：想要的增长', {s: 11, a: 'start', c: 'var(--ink-2)'}));
    const profit = g.k * roe, take = profit * (1 - g.b / 100);
    const gap = Math.max(0, g.k * (want - sg));
    kv(kvb, [['一年利润', yuan(profit)], ['拿走过日子', yuan(take)], ['不借钱一年能长', '<b>' + (sg * 100).toFixed(1) + '%</b>'], ['五年后本钱', yuan(a[5][1])], ['想要的增长第一年还差', gap ? yuan(gap) : '不差']]);
    let s;
    if (sg >= want) s = '只用自己赚的钱，一年就能长 ' + (sg * 100).toFixed(0) + '%，够了。不需要借，也不需要拿投资。';
    else if (roe >= 0.4) s = '本钱回报率很高（一块本钱一年赚回 ' + roe.toFixed(2) + ' 元），自己滚也能长得不慢。想再快，可以少拿一点过日子，往右拖“留下继续投”试试，而不是先想着借钱。';
    else s = '本钱回报率只有 ' + (roe * 100).toFixed(0) + '%，自己滚一年只能长 ' + (sg * 100).toFixed(0) + '%。想达到 ' + g.w + '%，第一年就要从外面拿 ' + yuan(gap) + '，往后每年更多：这是开店、囤货这类生意想快就得借钱的原因。先问一句，真的要那么快吗？';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('grK', v => { g.k = v; return yuan(v); }, go);
  slider('grT', v => { g.t = v; return v + ' 元'; }, go);
  slider('grM', v => { g.m = v; return v + '%'; }, go);
  slider('grB', v => { g.b = v; return v + '%'; }, go);
  slider('grW', v => { g.w = v; return v + '%'; }, go);
  ready = true; draw();
});
