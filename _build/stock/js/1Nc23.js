
/* ---------- 装置 24：一辈子的三种花法 ---------- */
dev('#lifeCycleFig', fig => {
  const svg = $('#lcSvg'), kvb = $('#lcKv'), say = $('#lcSay'), ill = $('#lcIll'), ins = $('#lcIns');
  const PATHS = ['先苦后甜', '细水长流', '先甜后苦'];
  let path = 1;
  const inc = a => a < 22 ? 0 : a <= 62 ? 6 + Math.min(1, (a - 22) / 20) * 6 : 0; // 万元/年
  const pension = a => a > 62 ? 3 : 0;
  function run(p, withIll, withIns){
    const r = 0.02; let W = 0, util = 0, minW = 0; const pts = [];
    // 细水长流：终身平均可支配；先苦后甜：工作期花得少、退休花得多；先甜后苦相反
    let lifetime = 0; for (let a = 22; a <= 85; a++) lifetime += inc(a) + pension(a);
    const avg = lifetime / 64;
    for (let a = 22; a <= 85; a++) {
      const I = inc(a) + pension(a);
      let want = p === 1 ? avg : p === 0 ? (a <= 62 ? avg * 0.75 : avg * 1.55) : (a <= 45 ? avg * 1.3 : avg * 0.88);
      let prem = withIns && a <= 75 ? I * 0.02 + (a > 62 ? 0.12 : 0) : 0;
      W = W * (1 + r) + I - prem;
      if (withIll && a === 70) { const cost = 36; W -= withIns ? cost * 0.3 : cost; }
      const c = Math.max(0, Math.min(want, W + 0));
      W -= c; util += Math.sqrt(Math.max(c, 0.01));
      minW = Math.min(minW, W);
      pts.push([a, W]);
    }
    return {pts, util, left: W};
  }
  function go(){
    const res = PATHS.map((n, i) => run(i, ill.checked, ins.checked));
    const all = res.flatMap(r => r.pts.map(p => p[1])), ymax = Math.max(...all) * 1.08, ymin = Math.min(0, ...all);
    lineChart(svg, res.map((r, i) => ({name: PATHS[i], color: ['var(--blu)', 'var(--grn)', 'var(--och)'][i], pts: r.pts, w: i === path ? 3 : 1.4, dash: i === path ? '' : '4 3'})), {xmin: 22, xmax: 85, ymin, ymax, xt: [22, 40, 62, 70, 85], xf: x => x + '岁', yt: [0, Math.round(ymax / 2), Math.round(ymax)], yf: v => v + '万', marks: ill.checked ? [[70, '大病']] : [], H: 230});
    const me = res[path];
    kv(kvb, [['你选的', PATHS[path]], ['“过得好不好”总分', me.util.toFixed(1)], ['三种里最高', PATHS[res.map(r => r.util).indexOf(Math.max(...res.map(r => r.util)))]], ['八十五岁留下', me.left.toFixed(0) + ' 万']]);
    let s = PATHS[path] + '：一辈子的“过得好”总分 ' + me.util.toFixed(1) + '，八十五岁时还剩 ' + me.left.toFixed(0) + ' 万。';
    if (path === 0) s += ' 年轻时省下的钱，到了老年未必花得出去：剩下的越多，说明当年少享受的越多。';
    if (path === 2) s += ' 年轻时多花，老了只能紧巴巴地过；如果再碰上大病，存款会见底。';
    if (path === 1) s += ' 因为“多花一点的满足越往上越少”，把消费摊平，往往比忽多忽少的总分更高。';
    if (ill.checked && !ins.checked) s += ' 没有保险时，七十岁那场病吃掉一大块存款，这正是老一辈“一病花光”的样子，也是他们拼命存钱的原因。';
    if (ill.checked && ins.checked) s += ' 有了保险，每年交一点钱，那场病只吃掉一小块：保险让“为了怕而存的钱”可以少存一些。';
    say.textContent = s;
  }
  btnRow($('#lcPath'), PATHS, path, i => { path = i; go(); });
  ill.addEventListener('change', go); ins.addEventListener('change', go);
  go();
});
