/* ---------- 装置 8：赶集 ---------- */
dev('#mktFig', fig => {
  const W = 300, H = 260, PX = 5; // 每公里 5 像素：画面约 60 × 52 公里
  const R0 = rng(77), VIL = [];
  for (let i = 0; i < 390; i++) VIL.push([R0() * W, R0() * H]);
  const PRE = [['十五分钟生活圈', 1], ['施坚雅的四川（约）', 4.5], ['布拉克顿规则', 6.2]];
  const R = $('#mktR');
  btnRow($('#mktPre'), PRE.map(p => p[0]), -1, i => { R.value = PRE[i][1]; go(); });
  R.addEventListener('input', go);
  let same = false;
  btnRow($('#mktDay'), ['集期错开', '集期都一样'], 0, i => { same = i === 1; cal(); });
  function hex(cx, cy, r){ return [...Array(6)].map((_, k) => { const a = Math.PI / 6 + k * Math.PI / 3; return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1); }).join(' '); }
  function go(){
    const rk = +R.value, r = rk * PX, D = Math.sqrt(3) * r, V = 1.5 * r;
    $('#mktRO').textContent = rk + ' 公里';
    let s = '';
    VIL.forEach(v => s += '<circle cx="' + v[0].toFixed(1) + '" cy="' + v[1].toFixed(1) + '" r="1.4" fill="var(--ink-3)"/>');
    let n = 0;
    for (let j = -1; j * V < H + V; j++) for (let i = -1; i * D < W + D; i++) {
      const cx = i * D + (j % 2 ? D / 2 : 0), cy = j * V;
      s += '<polygon points="' + hex(cx, cy, r) + '" fill="none" stroke="var(--och)" stroke-width="' + (r > 10 ? 1.3 : .6) + '"/>';
      if (cx > -2 && cx < W + 2 && cy > -2 && cy < H + 2) { n++; s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (r > 10 ? 4 : 1.8) + '" fill="var(--red)"/>'; }
    }
    s += '<line x1="8" x2="' + (8 + 10 * PX) + '" y1="252" y2="252" stroke="var(--ink)" stroke-width="2"/><text x="' + (12 + 10 * PX) + '" y="255" font-size="9" fill="var(--ink)" paint-order="stroke" stroke="var(--card)" stroke-width="3">10 公里</text>';
    $('#mktSvg').innerHTML = s;
    const area = 1.5 * Math.sqrt(3) * rk * rk, vil = area / 8;
    kv($('#mktKV'), [['单程步行约', Math.round(rk / 4.5 * 60) + ' 分钟'], ['集与集相隔', f1(Math.sqrt(3) * rk) + ' 公里'], ['一个集管', (area >= 10 ? Math.round(area) : f1(area)) + ' 平方公里'], ['约多少个村', vil >= 1 ? Math.round(vil) : '不到 1'], ['这片地上的集', n + ' 个']]);
    const S = $('#mktSay');
    S.innerHTML = rk <= 1.5 ? '一公里以内：这已经不是乡下的集，而是城里的菜市场和便利店的间距了。人越密、越不愿意走，“市”就开得越密。'
      : rk >= 8 ? '走这么远赶一次集，来回要大半天。集开得稀，一个集管的村子很多，集也会很大很热闹；可农民赶一次集的成本很高，买卖就少了。'
      : '集与集隔着一天能走个来回的路，一个集管十几到二十来个村子。这差不多就是施坚雅在四川看到的样子。农民去集上卖粮、买盐、喝茶、说媒，这片六边形就是他的“社会”。';
    cal();
  }
  function cal(){
    const M = [['东集', same ? [1, 4, 7] : [1, 4, 7]], ['西集', same ? [1, 4, 7] : [2, 5, 8]], ['南集', same ? [1, 4, 7] : [3, 6, 9]]];
    let h = '<table class="t" style="min-width:0;font-size:12.5px;margin-top:8px"><tr><th></th>' + [...Array(10)].map((_, i) => '<th style="padding:3px 2px;text-align:center">' + ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十'][i] + '</th>').join('') + '</tr>';
    M.forEach(m => { h += '<tr><td style="padding:3px 4px;white-space:nowrap">' + m[0] + '</td>' + [...Array(10)].map((_, i) => '<td style="padding:3px 2px;text-align:center">' + (m[1].includes(i + 1) ? '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--och)"></span>' : '') + '</td>').join('') + '</tr>'; });
    const days = new Set(); M.forEach(m => m[1].forEach(d => days.add(d)));
    h += '<tr><td style="padding:3px 4px;white-space:nowrap">货郎</td>' + [...Array(10)].map((_, i) => '<td style="padding:3px 2px;text-align:center">' + (days.has(i + 1) ? '✓' : '—') + '</td>').join('') + '</tr></table>';
    h += '<p class="readout" style="margin:6px 0 0">' + (same ? '三个集同一天开，货郎一旬只能赶 <b>3</b> 次集，其余七天闲着；农民也没法今天这个集卖不掉、明天去那个集。' : '集期错开，货郎今天东集、明天西集、后天南集，一旬能赶 <b>9</b> 次集，只歇初十一天。这就是一四七、二五八、三六九的用处。') + '</p>';
    $('#mktCal').innerHTML = '<div class="scroll-x">' + h + '</div>';
  }
  go();
});
