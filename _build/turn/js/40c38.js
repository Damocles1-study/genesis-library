/* ---------- 装置 39：种植园主的账本 ---------- */
dev('#labFig', fig => {
  // [年份, 新来者第一年死亡率, 此后每年死亡率, 契约仆价钱（镑）, 被奴役者价钱（镑）] —— 示意
  const P = [[1640, .25, .08, 7, 25], [1660, .18, .065, 9, 23], [1680, .09, .045, 12, 20], [1700, .06, .04, 14, 24], [1720, .05, .035, 15, 28]];
  const at = y => { let i = 0; while (i < P.length - 2 && P[i + 1][0] <= y) i++; const a = P[i], b = P[i + 1], t = clamp((y - a[0]) / (b[0] - a[0]), 0, 1); return a.map((x, j) => lerp(x, b[j], t)); };
  const TERM = 5, LIFE = 25;
  const years = (m1, m, n) => { let s = 0, alive = 1 - m1; for (let k = 0; k < n; k++) { s += alive; alive *= 1 - m; } return s; };
  // 弗吉尼亚：[年份, 被奴役者占人口 %]（约）
  const VA = [[1640, 1.4], [1650, 2.2], [1660, 3.5], [1670, 5], [1680, 7], [1690, 17], [1700, 28], [1710, 30], [1720, 31], [1730, 38], [1750, 44]];
  const Y = $('#lbY');
  Y.addEventListener('input', go);
  function go(){
    const y = +Y.value, p = at(y);
    $('#lbYo').textContent = y + ' 年';
    const ys = years(p[1], p[2], TERM), ye = years(p[1], p[2], LIFE);
    const cs = p[3] / ys, ce = p[4] / ye, mx = 3.5;
    $('#lbBars').innerHTML = [['契约仆', '干五年，期满放人', cs, 'var(--main)'], ['被奴役者', '终身，子女也是', ce, 'var(--red)']].map(r =>
      '<div class="row"><span class="nm">' + r[0] + '<small>' + r[1] + '</small></span><span class="tr"><i style="width:' + Math.min(100, r[2] / mx * 100) + '%;background:' + r[3] + '"></i></span><span class="v">' + r[2].toFixed(2) + ' 镑</span></div>').join('');
    kv($('#lbKV'), [['新来者第一年的死亡率（示意）', Math.round(p[1] * 100) + '%'], ['契约仆：价钱 / 平均能干几年', Math.round(p[3]) + ' 镑 / ' + ys.toFixed(1) + ' 年'], ['被奴役者：价钱 / 平均能干几年', Math.round(p[4]) + ' 镑 / ' + ye.toFixed(1) + ' 年']]);
    const say = $('#lbSay');
    say.className = 'say' + (ce < cs ? ' bad' : '');
    say.innerHTML = (ce >= cs
      ? '<b>按每年的活算，契约仆更“便宜”。</b>新来的人死得太快，花大价钱买一个终身的劳力，很可能几年内就人财两空；不如买一个五年的契约仆。这是十七世纪中叶切萨皮克的大致情形：田里干活的主要是英国来的穷年轻人。'
      : '<b>账算反过来了。</b>死亡率降下来以后，“终身”这两个字在账面上就值钱了；与此同时，英国国内的工钱上涨，愿意签契约过来的人越来越少，契约仆越来越贵。再加上 1676 年培根叛乱的教训：期满的契约仆会变成有枪、没地、不满的自由民，被奴役的人却永远不会“期满”。<br><small>账面上翻过来以后，真正的转变还拖了二三十年：被贩运的非洲人大多先卖给了出价更高的加勒比糖业种植园，皇家非洲公司的垄断又让运到切萨皮克的人很少，1698 年垄断取消以后，运来的人才猛增。</small>') +
      (y >= 1662 ? '<br><small>1662 年的法律规定孩子随母亲的身份，<em>于是在种植园主的账上，一个被奴役的女人生下的孩子也成了“资产”</em>。这一项这里没有算进去，种植园主算了。</small>' : '');
    // 比例图
    const svg = $('#lbSvg');
    const c = lineChart(svg, [{color: 'var(--rule)', pts: VA, w: 1.5, dash: '3 3'}, {color: 'var(--red)', pts: VA.filter(v => v[0] <= y + 2.5).concat([[y, at2(y)]]).sort((a, b) => a[0] - b[0]), w: 3}],
      {H: 200, xmin: 1640, xmax: 1750, ymin: 0, ymax: 50, xt: [1640, 1660, 1680, 1700, 1720, 1740], yt: [0, 25, 50], yf: v => v + '%', marks: [[1662, '1662 随母'], [1676, '培根叛乱'], [1705, '奴隶法典']]});
    svg.innerHTML += '<circle cx="' + c.X(y) + '" cy="' + c.Y(at2(y)) + '" r="5" fill="var(--red)"/>';
  }
  function at2(y){ let i = 0; while (i < VA.length - 2 && VA[i + 1][0] <= y) i++; const a = VA[i], b = VA[i + 1]; return lerp(a[1], b[1], clamp((y - a[0]) / (b[0] - a[0]), 0, 1)); }
  go();
});
