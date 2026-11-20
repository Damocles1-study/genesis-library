/* ---------- 装置 26：街上的眼睛 ---------- */
dev('#eyesFig', fig => {
  const USE = [
    {n: '住家', c: 'var(--grn)', f: h => (h < 7 || h >= 18) ? (h >= 23 || h < 6 ? .25 : .8) : .35},
    {n: '小店', c: 'var(--och)', f: h => (h >= 7 && h < 22) ? .9 : .05},
    {n: '餐馆', c: 'var(--red)', f: h => (h >= 11 && h < 14) || (h >= 17 && h < 23) ? 1 : (h >= 6 && h < 9 ? .5 : .1)},
    {n: '办公楼', c: 'var(--main)', f: h => (h >= 9 && h < 18) ? .7 : .02},
    {n: '酒吧', c: 'var(--blu)', f: h => (h >= 20 || h < 2) ? 1 : .03},
    {n: '空墙', c: 'var(--ink-3)', f: h => 0}
  ];
  const PRE = [['郊区办公园', [3, 5, 3, 5, 3, 5, 3, 5]], ['只有住家', [0, 0, 0, 0, 0, 0, 0, 0]], ['雅各布斯的街', [1, 0, 2, 0, 0, 1, 4, 3]]];
  let slot = PRE[2][1].slice();
  btnRow($('#eyesPre'), PRE.map(p => p[0]), 2, i => { slot = PRE[i][1].slice(); go(); });
  $('#eyesSt').addEventListener('click', e => { const t = e.target.closest('[data-s]'); if (!t) return; const k = +t.dataset.s; slot[k] = (slot[k] + 1) % USE.length; go(); });
  function go(){
    let s = '<rect x="0" y="70" width="600" height="30" fill="var(--ink)" fill-opacity=".1"/><line x1="0" x2="600" y1="85" y2="85" stroke="var(--card)" stroke-dasharray="10 8"/>';
    slot.forEach((u, k) => {
      const top = k < 4, x = 20 + (k % 4) * 145, y = top ? 6 : 104, U = USE[u];
      s += '<g data-s="' + k + '" style="cursor:pointer"><rect x="' + x + '" y="' + y + '" width="130" height="60" fill="' + U.c + '" fill-opacity="' + (u === 5 ? .15 : .3) + '" stroke="' + U.c + '" stroke-width="2"/>';
      if (u !== 5) for (let w = 0; w < 3; w++) s += '<rect x="' + (x + 14 + w * 38) + '" y="' + (y + (top ? 10 : 14)) + '" width="24" height="16" fill="var(--card)" stroke="' + U.c + '"/>';
      s += '<text x="' + (x + 65) + '" y="' + (y + 50) + '" font-size="13" text-anchor="middle" fill="var(--ink)">' + U.n + '</text></g>';
    });
    $('#eyesSt').innerHTML = s;
    const eyes = h => slot.reduce((a, u) => a + USE[u].f(h), 0) + 0.15 * slot.filter(u => u === 1 || u === 2).length * ((h >= 8 && h < 22) ? 1 : 0); // 有店就有行人
    const X = h => 30 + h / 24 * 550, Y = v => 140 - v / 9 * 125;
    let d = '<line x1="30" x2="580" y1="140" y2="140" stroke="var(--ink)"/><line x1="30" x2="30" y1="10" y2="140" stroke="var(--ink)"/>';
    [0, 3, 6, 9, 12, 15, 18, 21, 24].forEach(h => d += '<text x="' + X(h) + '" y="154" font-size="10" text-anchor="middle" fill="var(--ink-3)">' + h + '</text>');
    let p = '', mn = 1e9, mh = 0;
    for (let h = 0; h < 24; h++) { const v = eyes(h); if (v < mn) { mn = v; mh = h; } p += (p ? ' L' : 'M') + X(h).toFixed(1) + ',' + Y(v).toFixed(1) + ' L' + X(h + 1).toFixed(1) + ',' + Y(v).toFixed(1); }
    d += '<path d="' + p + ' L' + X(24) + ',140 L' + X(0) + ',140 Z" fill="var(--grn)" opacity=".25"/><path d="' + p + '" fill="none" stroke="var(--grn)" stroke-width="2"/>';
    d += '<rect x="' + X(mh) + '" y="10" width="' + (X(1) - X(0)) + '" height="130" fill="var(--red)" opacity=".15"/><text x="' + (X(mh) + 4) + '" y="22" font-size="10" fill="var(--red)">最冷清</text>';
    d += '<text x="34" y="10" font-size="10" fill="var(--ink-3)">看着街的眼睛</text>';
    $('#eyesDay').innerHTML = d;
    const S = $('#eyesSay');
    const kinds = new Set(slot).size;
    S.className = 'say' + (mn < 1 ? ' bad' : mn > 2 ? ' ok' : '');
    S.innerHTML = '最冷清的时刻在 <b>' + mh + ' 点</b>，那时大约只有 ' + f1(mn) + ' 双眼睛。' + (mn < 1 ? '这条街在一天里有好几个小时几乎没人看着：办公园晚上、住宅街白天、空墙全天。' : mn > 2 ? '一天到晚都有人：早上有开店的，中午有吃饭的，晚上有回家的和喝酒的，半夜还有住家的灯。这就是雅各布斯说的“混合用途”。' : '还不错，但有一段时间比较冷清。') + (kinds <= 2 ? '<br>只有一两种用途的街，人气总会在某些时段塌下去。' : '');
  }
  go();
});
