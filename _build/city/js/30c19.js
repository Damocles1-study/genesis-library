/* ---------- 装置 20：多修一条路（布雷斯悖论） ---------- */
dev('#braFig', fig => {
  const N = $('#braN'), NEW = $('#braNew');
  [N, NEW].forEach(e => e.addEventListener('input', go));
  NEW.addEventListener('change', go);
  // 家 → A：车越多越慢，n/100 分钟；A → 城：45 分钟；家 → B：45 分钟；B → 城：n/100 分钟；A → B：0 分钟
  function solve(n, link){
    if (!link || n >= 9000) return {x1: n / 2, x2: n / 2, x3: 0, t: n / 200 + 45};
    if (n <= 4500) return {x1: 0, x2: 0, x3: n, t: 2 * n / 100};
    const a = n - 4500; return {x1: a, x2: a, x3: n - 2 * a, t: 90};
  }
  function go(){
    const n = +N.value, link = NEW.checked;
    $('#braNO').textContent = fmt(n) + ' 辆';
    const r = solve(n, link), r0 = solve(n, false);
    const sa = r.x1 + r.x3, be = r.x2 + r.x3;
    const P = {S: [60, 130], A: [300, 40], B: [300, 220], E: [540, 130]};
    const edge = (a, b, flow, lab, cong) => {
      const w = 1.5 + flow / 600, mx = (P[a][0] + P[b][0]) / 2, my = (P[a][1] + P[b][1]) / 2;
      return '<line x1="' + P[a][0] + '" y1="' + P[a][1] + '" x2="' + P[b][0] + '" y2="' + P[b][1] + '" stroke="' + (cong ? 'var(--red)' : 'var(--ink-3)') + '" stroke-width="' + w.toFixed(1) + '" stroke-linecap="round" opacity="' + (flow > 0 ? .85 : .25) + '"/>' +
        '<text x="' + mx + '" y="' + (my + (my < 130 ? -10 : 18)) + '" font-size="12" text-anchor="middle" fill="var(--ink)" paint-order="stroke" stroke="var(--card)" stroke-width="3">' + lab + ' · ' + fmt(flow) + ' 辆</text>';
    };
    let s = edge('S', 'A', sa, '会堵 ' + Math.round(sa / 100) + ' 分', true) + edge('A', 'E', r.x1, '国道 45 分', false) + edge('S', 'B', r.x2, '国道 45 分', false) + edge('B', 'E', be, '会堵 ' + Math.round(be / 100) + ' 分', true);
    if (link) s += '<line x1="300" y1="40" x2="300" y2="220" stroke="var(--main)" stroke-width="' + (2 + r.x3 / 600).toFixed(1) + '" stroke-dasharray="8 4"/><text x="310" y="134" font-size="12" fill="var(--main)">快速路 0 分 · ' + fmt(r.x3) + ' 辆</text>';
    [['S', '家'], ['A', 'A'], ['B', 'B'], ['E', '城']].forEach(p => s += '<circle cx="' + P[p[0]][0] + '" cy="' + P[p[0]][1] + '" r="16" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><text x="' + P[p[0]][0] + '" y="' + (P[p[0]][1] + 5) + '" font-size="14" text-anchor="middle" fill="var(--ink)">' + p[1] + '</text>');
    $('#braSvg').innerHTML = s;
    kv($('#braKV'), [['不修快速路，每人', Math.round(r0.t) + ' 分钟'], ['修了快速路，每人', link ? Math.round(r.t) + ' 分钟' : '—'], ['差别', link ? (r.t > r0.t + .5 ? '慢了 ' + Math.round(r.t - r0.t) + ' 分钟' : r.t < r0.t - .5 ? '快了 ' + Math.round(r0.t - r.t) + ' 分钟' : '一样') : '—']]);
    const S = $('#braSay');
    if (!link) { S.className = 'say'; S.innerHTML = '没有快速路时，车辆自然分成两半，上下两条路线一样快，每人 ' + Math.round(r0.t) + ' 分钟。勾上“修 A → B 快速路”试试。'; return; }
    if (r.t > r0.t + .5) { S.className = 'say bad'; S.innerHTML = '修了一条“零分钟”的快速路，<b>每个人都慢了 ' + Math.round(r.t - r0.t) + ' 分钟</b>。因为对每个司机来说，“家 → A → 快速路 → B → 城”看起来都比原来的路线快，于是大家全挤上了两段会堵的路，那两段越来越慢。没有谁做错了选择，可结果人人吃亏。这就是布雷斯悖论。'; }
    else { S.className = 'say ok'; S.innerHTML = '车少的时候（或者特别多的时候），新路确实帮了忙或者没影响。布雷斯悖论只在“中间那一段”出现：路网不太空、也不太满的时候，新增一条路反而让所有人变慢。真实的城市里，没人能事先保证新路落在哪一段。'; }
  }
  go();
});
