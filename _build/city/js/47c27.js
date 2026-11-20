/* ---------- 装置 28：按多少人修 ---------- */
dev('#planFig', fig => {
  const WAY = ['一次修到位', '分期修', '先按眼下修'];
  const REAL = ['照预测长', '长得更快', '长到一半停了', '先长后缩'];
  let w = 0, r = 0;
  btnRow($('#planWay'), WAY, 0, i => { w = i; go(); });
  btnRow($('#planReal'), REAL, 0, i => { r = i; go(); });
  const Y = 40;
  const demand = (t, k) => k === 0 ? 1 + t / Y : k === 1 ? 1 + 2 * t / Y : k === 2 ? 1 + .45 * Math.min(t, 15) / 15 : (t < 18 ? 1 + .5 * t / 18 : 1.5 - .6 * (t - 18) / 22);
  function run(way, k){
    let cap, cost, short = 0, idle = 0;
    const build = (c, prem) => Math.pow(c, .75) * 100 * (prem || 1);
    if (way === 0) { cap = 2; cost = build(2); }
    else if (way === 1) { cap = 1.3; cost = build(1.3); }
    else { cap = 1.05; cost = build(1.05); }
    const caps = [];
    for (let t = 0; t <= Y; t++) {
      const d = demand(t, k);
      if (way === 0 && d > cap) { cap += .5; cost += build(.5, 1.5); }
      if (way === 1 && d > cap * .9) { cap += .35; cost += build(.35, 1.2); }
      if (way === 2 && d > cap) { cap += .25; cost += build(.25, 1.7); short += 1; }
      if (d > cap) short++;
      idle += Math.max(0, cap - d);
      cost += cap * 2; // 每年的维护费，修得越多越贵
      caps.push(cap);
    }
    return {cost, short, idle, caps};
  }
  function go(){
    const res = run(w, r);
    const X = t => 40 + t / Y * 540, Yv = v => 200 - v / 3.2 * 180;
    let s = '<line x1="40" x2="580" y1="200" y2="200" stroke="var(--ink)"/><line x1="40" x2="40" y1="15" y2="200" stroke="var(--ink)"/>';
    for (let t = 0; t <= Y; t += 10) s += '<text x="' + X(t) + '" y="214" font-size="10" text-anchor="middle" fill="var(--ink-3)">第 ' + t + ' 年</text>';
    // 预测线
    let pf = ''; for (let t = 0; t <= Y; t++) pf += (pf ? ' L' : 'M') + X(t) + ',' + Yv(demand(t, 0)).toFixed(1);
    s += '<path d="' + pf + '" fill="none" stroke="var(--ink-3)" stroke-dasharray="4 3"/><text x="' + X(Y) + '" y="' + (Yv(2) - 6) + '" font-size="10" text-anchor="end" fill="var(--ink-3)">规划的预测</text>';
    // 容量阶梯
    let pc = ''; res.caps.forEach((c, t) => { pc += (pc ? ' L' : 'M') + X(t).toFixed(1) + ',' + Yv(c).toFixed(1) + ' L' + X(Math.min(Y, t + 1)).toFixed(1) + ',' + Yv(c).toFixed(1); });
    s += '<path d="' + pc + '" fill="none" stroke="var(--main)" stroke-width="2.5"/>';
    // 真实需求
    let pd = ''; for (let t = 0; t <= Y; t++) pd += (pd ? ' L' : 'M') + X(t) + ',' + Yv(demand(t, r)).toFixed(1);
    s += '<path d="' + pd + '" fill="none" stroke="var(--red)" stroke-width="2.5"/>';
    s += '<text x="46" y="24" font-size="10" fill="var(--main)">蓝：修了多少</text><text x="130" y="24" font-size="10" fill="var(--red)">红：真实需要</text>';
    $('#planSvg').innerHTML = s;
    kv($('#planKV'), [['总花费', Math.round(res.cost)], ['不够用的年数', res.short + ' 年'], ['闲置（容量 × 年）', f1(res.idle)]]);
    const all = WAY.map((_, i) => run(i, r));
    const cheapest = all.map(a => a.cost).indexOf(Math.min(...all.map(a => a.cost)));
    $('#planSay').innerHTML = '这种未来下，三种做法的花费分别是：' + WAY.map((n, i) => n + ' ' + Math.round(all[i].cost) + (all[i].short ? '（' + all[i].short + ' 年不够用）' : '')).join('；') + '。最省钱的是<b>' + WAY[cheapest] + '</b>。<br>' +
      ['照预测长的时候，一次修到位最划算：规模大、单价低。可惜现实很少照预测长。', '长得比预测快：一次修到位的也不够了，先按眼下修的那种，年年在紧急扩建、年年挤。', '长到一半停了：一次修到位的那一半，几十年都闲着，还要年年花钱维护。分期修的损失最小。', '先长后缩：修得越多，后来闲置得越多，还要花钱维护。这就是收缩城市的处境。'][r] +
      '<br>换几种未来试试：分期修很少是最省钱的，却几乎从来不是最惨的。这就是“留余地”的价值。';
  }
  go();
});
