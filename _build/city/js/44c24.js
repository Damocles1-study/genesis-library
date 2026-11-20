/* ---------- 装置 25：分开住，还是混着住 ---------- */
dev('#zoneFig', fig => {
  const NX = 8, NY = 5, C = 40;
  const COL = {H: 'var(--grn)', O: 'var(--main)', S: 'var(--och)', M: 'var(--red)'};
  const NAME = {H: '住宅', O: '办公', S: '商业', M: '混合'};
  const WAYS = [
    ['雅典宪章式分区', ['HHHOOSHH', 'HHHOOSHH', 'HHHOOSHH', 'HHHOOSHH', 'HHHOOSHH']],
    ['卧城 + 商务区', ['HHHHHHHH', 'HHHHHHHH', 'HHHOOHHH', 'HHHSSHHH', 'HHHHHHHH']],
    ['老城式混合', ['MMHMMHMM', 'MSMMMMSM', 'HMMOOMMH', 'MMSMMSMM', 'MMHMMHMM']]
  ];
  // 一天 24 小时里各种用途的人气（0~1）
  const DAY = {
    H: h => (h < 7 || h >= 19) ? .9 : (h < 9 || h >= 17) ? .5 : .18,
    O: h => (h >= 9 && h < 18) ? .95 : (h >= 8 && h < 20) ? .4 : .03,
    S: h => (h >= 10 && h < 22) ? .75 : .05,
    M: h => .45 + .3 * ((h >= 10 && h < 22) ? 1 : 0) + (h < 7 ? -.15 : 0)
  };
  let w = 0, pick = null;
  btnRow($('#zoneWay'), WAYS.map(x => x[0]), 0, i => { w = i; pick = null; go(); });
  const grid = () => WAYS[w][1].map(r => r.split(''));
  $('#zoneMap').addEventListener('click', e => { const p = svgPt($('#zoneMap'), e); const i = Math.floor(p.x / C), j = Math.floor(p.y / C); if (i >= 0 && i < NX && j >= 0 && j < NY) { pick = [i, j]; go(); } });
  function go(){
    const G = grid();
    // 上班距离：住在 H 或 M 的人，到最近的 O 或 M 的格子（曼哈顿距离，公里）
    const jobs = [], homes = [];
    G.forEach((r, j) => r.forEach((t, i) => { if (t === 'O' || t === 'M') jobs.push([i, j, t === 'O' ? 3 : 1]); if (t === 'H' || t === 'M') homes.push([i, j, t === 'H' ? 3 : 1]); }));
    // 按工作岗位数量分配：每个人随机去一个岗位，越近的越可能（简化：按岗位加权平均距离）
    let tot = 0, wsum = 0;
    homes.forEach(h => { let s = 0, ws = 0; jobs.forEach(o => { const d = Math.abs(h[0] - o[0]) + Math.abs(h[1] - o[1]) + .5; const k = o[2] / Math.pow(d, 1.2); s += k * d; ws += k; }); tot += h[2] * s / ws; wsum += h[2]; });
    const commute = tot / wsum;
    // 冷清时段
    let empty = 0, cells = 0;
    let m = '';
    G.forEach((r, j) => r.forEach((t, i) => {
      let e = 0; for (let h = 0; h < 24; h++) if (DAY[t](h) < .25) e++;
      empty += e; cells++;
      m += '<rect x="' + (i * C + 1) + '" y="' + (j * C + 1) + '" width="' + (C - 2) + '" height="' + (C - 2) + '" fill="' + COL[t] + '" fill-opacity=".45" stroke="' + (pick && pick[0] === i && pick[1] === j ? 'var(--ink)' : 'var(--card)') + '" stroke-width="' + (pick && pick[0] === i && pick[1] === j ? 3 : 1) + '" style="cursor:pointer"/><text x="' + (i * C + C / 2) + '" y="' + (j * C + C / 2 + 4) + '" font-size="11" text-anchor="middle" fill="var(--ink)">' + NAME[t][0] + '</text>';
    }));
    $('#zoneMap').innerHTML = m;
    // 右图：选中格子（默认画住宅和办公两条）
    const X = h => 30 + h / 24 * 260, Y = v => 175 - v * 150;
    let d = '<line x1="30" x2="290" y1="175" y2="175" stroke="var(--ink)"/><line x1="30" x2="30" y1="20" y2="175" stroke="var(--ink)"/>';
    [0, 6, 12, 18, 24].forEach(h => d += '<text x="' + X(h) + '" y="190" font-size="10" text-anchor="middle" fill="var(--ink-3)">' + h + '时</text>');
    d += '<line x1="30" x2="290" y1="' + Y(.25) + '" y2="' + Y(.25) + '" stroke="var(--ink-3)" stroke-dasharray="3 3"/><text x="288" y="' + (Y(.25) - 4) + '" font-size="9" text-anchor="end" fill="var(--ink-3)">冷清线</text>';
    const types = pick ? [G[pick[1]][pick[0]]] : [...new Set(G.flat())];
    types.forEach(t => { let p = ''; for (let h = 0; h <= 24; h += .25) p += (p ? ' L' : 'M') + X(h).toFixed(1) + ',' + Y(DAY[t](Math.floor(h) % 24)).toFixed(1); d += '<path d="' + p + '" fill="none" stroke="' + COL[t] + '" stroke-width="2.5"/>'; });
    d += '<text x="34" y="16" font-size="10" fill="var(--ink-3)">' + (pick ? '这一格：' + NAME[G[pick[1]][pick[0]]] : '各种用途一天的人气') + '</text>';
    $('#zoneDay').innerHTML = d;
    kv($('#zoneKV'), [['平均上班距离', f1(commute) + ' 公里'], ['每个格子一天冷清多少小时', f1(empty / cells) + ' 小时']]);
    $('#zoneSay').innerHTML = [
      '功能分区：住宅一片、办公一片、商业一条。上班的人每天早晚穿过整座城；白天住宅区空着，晚上办公区黑着，每个地方一天里有大半时间是冷清的。',
      '卧城加商务区：大片住宅围着一小块商务区。早高峰所有人往中间挤，晚高峰所有人往外跑；中间那块晚上和周末几乎没人。很多“新区”和“卧城”就是这样。',
      '混合：楼下是店、楼上是家、隔壁是办公室。上班近得多，每个格子白天晚上都有人。代价是吵一点、乱一点，也更难规划和管理。下一章的主角管这叫“街道的眼睛”。'
    ][w];
  }
  go();
});
