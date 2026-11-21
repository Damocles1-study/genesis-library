
/* ---------- 装置 6：享乐跑步机 ---------- */
dev('#hdFig', fig => {
  const T = 60, BASE = 50;
  // [名字, 发生的月份, 跳升, 适应半衰期（月）, 一次性花费（万）, 每月花费（万）, 留下的长期余温]
  const IT = [
    ['换一部新手机', [2], 6, 1.2, 0.6, 0, 0],
    ['贷款买一辆车', [12], 10, 4, 15, 0.15, 0],
    ['换一套更大的房子住', [30], 14, 9, 0, 0.25, 0],
    ['每年一次长途旅行', [6, 18, 30, 42, 54], 7, 1.5, 1, 0, 0.6],
    ['搬到离单位近的地方', [4], 5, 400, 0, 0.1, 0],
    ['每周和朋友吃顿饭', [0], 4, 400, 0, 0.08, 0]
  ];
  const on = [true, true, false, true, false, false];
  $('#hdCk').innerHTML = IT.map((it, i) => '<label class="ck"><input type="checkbox" data-i="' + i + '"' + (on[i] ? ' checked' : '') + '>' + it[0] + '</label>').join('');
  $('#hdCk').addEventListener('change', e => { const c = e.target.closest('input'); if (c) { on[+c.dataset.i] = c.checked; draw(); } });
  $('#hdRef').addEventListener('change', draw);
  const REF = [0, 3, 7, 13];
  function joyOf(it, t){
    let j = 0;
    it[1].forEach(m => { if (t >= m) { const dt = t - m; const ramp = it[3] > 100 ? Math.min(1, (dt + 1) / 4) : 1; j += it[2] * ramp * Math.pow(.5, dt / it[3]) + it[6]; } });
    return j;
  }
  function draw(){
    const ref = +$('#hdRef').value;
    const raise = [12, 24, 36, 48];
    const line = [], raw = [];
    const area = IT.map(() => 0);
    for (let t = 0; t <= T; t++) {
      let v = BASE;
      raise.forEach(m => { if (t >= m) v += 6 * Math.pow(.5, (t - m) / 3); });
      // 参照点：越往上比，涨工资带来的那一点越快被吃掉，还要倒扣
      const refPen = REF[ref] * (1 + raise.filter(m => t >= m).length * .25);
      IT.forEach((it, i) => { if (on[i]) { const j = joyOf(it, t); v += j; area[i] += j; } });
      line.push([t, v - refPen]); raw.push([t, v]);
    }
    const ys = line.map(p => p[1]).concat(raw.map(p => p[1]));
    const ymin = Math.floor(Math.min(...ys, BASE - 15) / 10) * 10, ymax = Math.ceil(Math.max(...ys, BASE + 10) / 10) * 10;
    lineChart($('#hdSvg'), [
      {color: 'var(--rule)', pts: [[0, BASE], [T, BASE]], w: 1.5, dash: '4 4'},
      ...(ref ? [{color: 'var(--ink-3)', pts: raw, w: 1.5, dash: '3 3'}] : []),
      {color: 'var(--main)', pts: line, w: 2.6}
    ], {xmin: 0, xmax: T, ymin, ymax, xt: [0, 12, 24, 36, 48, 60], xf: v => v ? '第 ' + v / 12 + ' 年' : '入职', yt: [ymin, (ymin + ymax) / 2, ymax], marks: [[12, '涨薪'], [24, '涨薪'], [36, '涨薪'], [48, '涨薪']]});
    const cost = IT.map((it, i) => on[i] ? it[1].length * it[4] + it[5] * (T - it[1][0]) : 0);
    const rows = IT.map((it, i) => on[i] ? [it[0], cost[i] ? (area[i] / cost[i]).toFixed(0) : '∞'] : null).filter(Boolean);
    kv($('#hdKv'), rows.map(r => [r[0] + '<br><small>每万元换来的快乐</small>', r[1]]));
    const avg = line.reduce((a, p) => a + p[1], 0) / line.length;
    const tot = cost.reduce((a, b) => a + b, 0);
    $('#hdSay').innerHTML = '五年平均快乐指数 <b>' + avg.toFixed(1) + '</b>（虚线 50 是什么都不买时的起点），这些选择五年共花约 <b>' + tot.toFixed(1) + ' 万元</b>。' +
      (ref ? ' 灰色虚线是“不和别人比”时的样子，绿线和它之间的差，就是比较吃掉的快乐；比的对象越往上，每次涨薪后被吃掉的越多。' : ' 你只和过去的自己比，涨薪的快乐被适应吃掉，但没有被比较倒扣。') +
      ' 看看每一项“每万元换来的快乐”：很快被适应的东西，花得越多越不划算；几乎不被适应的那两项，花钱不多，却一直在。';
  }
  draw();
});
