
/* ---------- 装置 22：记忆的利息 ---------- */
dev('#memFig', fig => {
  const svg = $('#mmSvg'), kvb = $('#mmKv'), say = $('#mmSay');
  let ready = false;
  function go(){
    if (!ready) return;
    const hA = gA() / 12, U = gU(), hM = gM(), r = gR() / 100, win = gW() / 100, Y = 15, dt = 1 / 12;
    // 每种花法每个月的快乐流（单位任意），累计
    const flows = {thing: [], use: [], trip: [], save: []};
    const tripAt = 0.25, saveAt = 10, boost = Math.pow(1 + r, 10);
    for (let i = 0; i <= Y * 12; i++) { const t = i * dt;
      // 普通东西：一次性的高兴，指数衰减
      flows.thing.push(1.0 * Math.exp(-t * Math.LN2 / hA) * 0.5);
      // 体验型东西：同样有新鲜感，另外在能用的年头里每年带来稳定的小经历
      flows.use.push(0.8 * Math.exp(-t * Math.LN2 / hA) * 0.5 + (t < U ? 0.18 : 0));
      // 旅行：出发前期待，当下高峰，之后回味按半衰期衰减
      let tr = 0; if (t < tripAt) tr = 0.6 * t / tripAt; else if (t < tripAt + dt - 1e-9) tr = 6; else tr = 0.35 * Math.exp(-(t - tripAt) * Math.LN2 / hM);
      flows.trip.push(tr);
      // 存起来：十年后变多再花一次（按旅行的形状），乘上窗口
      let sv = 0; const ts = t - saveAt; if (ts >= -tripAt && ts < -1e-9) sv = 0.6 * (ts + tripAt) / tripAt; else if (ts >= -1e-9 && ts < dt - 1e-9) sv = 6; else if (ts >= dt - 1e-9) sv = 0.35 * Math.exp(-ts * Math.LN2 / hM);
      flows.save.push(sv * boost * win);
    }
    const cum = arr => { let s = 0; return arr.map((v, i) => [i * dt, (s += v * dt)]); };
    const C = {thing: cum(flows.thing), use: cum(flows.use), trip: cum(flows.trip), save: cum(flows.save)};
    const fin = k => C[k][C[k].length - 1][1];
    const ymax = Math.max(fin('thing'), fin('use'), fin('trip'), fin('save')) * 1.1;
    lineChart(svg, [
      {name: '普通东西', color: 'var(--ink-3)', pts: C.thing},
      {name: '常用的东西', color: 'var(--blu)', pts: C.use},
      {name: '旅行', color: 'var(--up)', pts: C.trip},
      {name: '十年后再花', color: 'var(--och)', pts: C.save, dash: '5 3'}
    ], {xmin: 0, xmax: Y, ymin: 0, ymax, xt: [0, 5, 10, 15], xf: x => x + '年', yt: [0, ymax / 2, ymax].map(v => +v.toFixed(1)), yf: v => v.toFixed(1), H: 220});
    const names = {thing: '普通东西', use: '常用的“体验型东西”', trip: '一次旅行', save: '存起来十年后再花'};
    const rank = Object.keys(names).sort((a, b) => fin(b) - fin(a));
    kv(kvb, rank.map(k => [names[k], fin(k).toFixed(2)]));
    let s = '按这组假设，十五年累计下来排第一的是“' + names[rank[0]] + '”。';
    if (rank[0] === 'save') s += ' 你给了存起来的钱很高的收益、很宽的窗口：十年后的你还有时间、兴致和同伴，这笔交换就划算。';
    else s += ' 存起来的钱十年后变成了 ' + boost.toFixed(2) + ' 倍，可乘上“窗口”（' + Math.round(win * 100) + '%）以后，再加上少收了十年的“记忆利息”，没能追上。';
    s += ' 把“记忆留多久”调短、把“东西多久不新鲜”调长，排名就会变：这正是每个人的答案不同的原因。';
    say.textContent = s;
  }
  const gA = slider('mmA', v => v + ' 个月', go), gU = slider('mmU', v => v + ' 年', go), gM = slider('mmM', v => v + ' 年', go), gR = slider('mmR', v => v + '%', go), gW = slider('mmW', v => v + '%', go);
  ready = true; go();
});
