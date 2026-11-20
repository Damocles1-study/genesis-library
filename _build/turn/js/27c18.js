
/* ---------- 装置 19：条条大路 ---------- */
dev('#roadFig', fig => {
  // [名字, 经度, 纬度, 地区(eu 欧洲 / af 北非 / eg 埃及 / as 亚洲), 是否海港]
  const C = [
    ['罗马（奥斯提亚港）', 12.4, 41.8, 'eu', 1], ['伦迪尼乌姆（伦敦）', -0.1, 51.5, 'eu', 0], ['埃伯拉肯（约克）', -1.08, 53.96, 'eu', 0],
    ['科隆', 6.96, 50.94, 'eu', 0], ['卢格杜努姆（里昂）', 4.83, 45.76, 'eu', 0], ['马赛', 5.37, 43.3, 'eu', 1], ['塔拉科（塔拉戈纳）', 1.25, 41.12, 'eu', 1],
    ['加的斯', -6.29, 36.53, 'eu', 1], ['迦太基', 10.32, 36.85, 'af', 1], ['亚历山大里亚', 29.9, 31.2, 'eg', 1], ['安条克', 36.16, 36.2, 'as', 1],
    ['耶路撒冷', 35.23, 31.78, 'as', 0], ['雅典（比雷埃夫斯港）', 23.63, 37.94, 'eu', 1], ['拜占庭', 28.98, 41.01, 'eu', 1], ['以弗所', 27.34, 37.94, 'as', 1],
    ['尼科米底亚', 29.92, 40.77, 'as', 1], ['萨尔米泽杰图萨（达契亚）', 23.31, 45.62, 'eu', 0]
  ];
  const BYZ = [28.98, 41.01], ALX = [29.9, 31.2], ANT = [35.5, 33.5];
  const A = $('#rdA'), B = $('#rdB');
  [A, B].forEach((s, j) => { s.innerHTML = C.map((c, i) => '<option value="' + i + '"' + (i === [0, 10][j] ? ' selected' : '') + '>' + c[0] + '</option>').join(''); s.addEventListener('change', go); });
  let summer = true;
  btnRow($('#rdSea'), ['夏天出发', '冬天出发'], 0, i => { summer = i === 0; go(); });
  const m = romeMap({lon0: -10, lon1: 40, lat0: 29, lat1: 56, W: 900});
  const svg = $('#rdSvg'); svg.setAttribute('viewBox', '0 0 ' + m.W + ' ' + m.H);
  // 陆路：不同大洲之间要绕：北非经埃及，亚洲与欧洲经拜占庭
  function landPath(a, b){
    const pa = [a[1], a[2]], pb = [b[1], b[2]];
    const chain = {eu: 0, as: 1, eg: 2, af: 3};
    const way = [[], [BYZ], [BYZ, ANT], [BYZ, ANT, ALX]]; // 从欧洲出发到各地要经过的点
    let pts;
    const ra = chain[a[3]], rb = chain[b[3]];
    if (ra === rb) pts = [pa, pb];
    else {
      const lo = Math.min(ra, rb), hi = Math.max(ra, rb);
      const mid = way[hi].slice(lo);           // 两地之间的中转点
      pts = ra < rb ? [pa, ...mid, pb] : [pa, ...mid.slice().reverse(), pb];
    }
    let d = 0; for (let i = 1; i < pts.length; i++) d += hav(pts[i - 1], pts[i]);
    return {pts, d: d * 1.3};
  }
  function go(){
    const a = C[+A.value], b = C[+B.value];
    let g = m.svg;
    C.forEach((c, i) => { const p = m.P(c[1], c[2]); g += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="var(--card)" stroke="var(--ink-3)"/>'; });
    if (a === b) { svg.innerHTML = g; $('#rdBars').innerHTML = ''; $('#rdSay').textContent = '出发地和目的地是同一个地方。不用走。'; return; }
    const L = landPath(a, b);
    g += '<path d="' + m.line(L.pts) + '" fill="none" stroke="var(--ter)" stroke-width="2.6" stroke-dasharray="6 4"/>';
    const sea = a[4] && b[4], seaD = hav([a[1], a[2]], [b[1], b[2]]) * 1.2;
    if (sea) g += '<path d="' + m.line([[a[1], a[2]], [b[1], b[2]]]) + '" fill="none" stroke="var(--main)" stroke-width="2.6"/>';
    [a, b].forEach(c => { const p = m.P(c[1], c[2]); g += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="7" fill="var(--red)"/>' + txt(p[0] + 10, p[1] - 8, c[0].replace(/（.*）/, ''), {s: 14, a: 'start', w: true, hc: 'var(--land)'}); });
    svg.innerHTML = g;
    // 每天的路程（公里）：步行 30，牛车 18，官方驿传 75，十万火急的信使 160；商船夏季约 120（顺风更快，逆风更慢）
    const rows = [['步行', 30, L.d], ['牛车运货', 18, L.d], ['官方驿传', 75, L.d], ['十万火急', 160, L.d]];
    if (sea) rows.push(['坐船', 120, seaD]);
    const days = rows.map(r => r[2] / r[1] + (r[0] === '坐船' ? 2 : 0));
    const mx = Math.max(...days);
    $('#rdBars').innerHTML = rows.map((r, i) => {
      const winter = r[0] === '坐船' && !summer;
      return '<div class="row"><span class="nm">' + r[0] + '<small>' + Math.round(r[2]) + ' 公里</small></span><span class="tr"><i style="width:' + (winter ? 100 : days[i] / mx * 100) + '%;background:' + (winter ? 'var(--rule)' : r[0] === '坐船' ? 'var(--main)' : 'var(--ter)') + '"></i></span><span class="v">' + (winter ? '停航' : Math.ceil(days[i]) + ' 天') + '</span></div>';
    }).join('');
    const post = Math.ceil(days[2]);
    $('#rdSay').innerHTML = '一封信走官方驿传，从' + a[0].replace(/（.*）/, '') + '送到' + b[0].replace(/（.*）/, '') + '约 <b>' + post + ' 天</b>，等回信又是 ' + post + ' 天，<b>一问一答一个来回，至少 ' + post * 2 + ' 天</b>。' +
      (post * 2 > 40 ? '<br><small>所以皇帝不可能事事过问，行省总督和城里的议员只能自己拿主意。小普林尼偏偏事事写信请示。</small>' : '') +
      (sea && summer && days[4] < days[2] ? '<br><small>坐船比驿马还快，可风向说了算。运粮运货，几乎全走海路：海运一吨粮食走一千公里的花费，据估计比陆路便宜几十倍。</small>' : '') +
      (sea && !summer ? '<br><small>冬天海上风浪大，大约十一月到次年三月，地中海基本不开船。急事只能走陆路。</small>' : '');
  }
  go();
});
