
/* ---------- 装置 10：长街 ---------- */
dev('#pdFig', fig => {
  const NM = ['老实人', '精明人', '以牙还牙', '宽厚的以牙还牙', '记仇的', '看心情的'];
  const CL = ['var(--kraft)', 'var(--red)', 'var(--main)', 'var(--blu)', 'var(--pur)', 'var(--och)'];
  const PAY = [[3, 0], [5, 1]]; // PAY[我背叛?][对方背叛?]  合作=0 背叛=1
  function move(k, my, his, r){
    if (k === 0) return 0; if (k === 1) return 1; if (k === 5) return r() < .5 ? 1 : 0;
    if (!his.length) return 0;
    if (k === 2) return his[his.length - 1];
    if (k === 3) return his[his.length - 1] && r() > .3 ? 1 : 0;
    if (k === 4) return his.includes(1) ? 1 : 0;
  }
  let M = null;
  function matrix(w, e){
    const r = rng(Math.round(w * 1000) * 31 + Math.round(e * 1000) + 7), K = 40;
    const m = NM.map(() => NM.map(() => 0));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      let tot = 0, rounds = 0;
      for (let k = 0; k < K; k++) {
        const ha = [], hb = []; // 各自“看到”的对方历史
        let n = 0;
        do {
          let a = move(i, null, ha, r), b = move(j, null, hb, r);
          if (r() < e) a = 1 - a; if (r() < e) b = 1 - b;
          tot += PAY[a][b]; ha.push(b); hb.push(a); n++;
        } while (r() < w && n < 150);
        rounds += n;
      }
      m[i][j] = tot / rounds;
    }
    return m;
  }
  const shares = d => { const x = NM.map(() => (1 - d) / 5); x[1] = d; return x; };
  const fit = x => NM.map((_, i) => x.reduce((s, xj, j) => s + xj * M[i][j], 0));
  function draw(){
    const w = +$('#pdW').value / 100, e = +$('#pdE').value / 100, d = +$('#pdD').value / 100;
    M = matrix(w, e);
    const f = fit(shares(d));
    const order = NM.map((n, i) => i).sort((a, b) => f[b] - f[a]);
    bars($('#pdBars'), order.map(i => [NM[i], f[i], i === 1 ? '比例 ' + Math.round(d * 100) + '%' : '', CL[i]]), 5, v => v.toFixed(2) + ' 分');
    $('#pdSvg').innerHTML = ''; $('#pdLeg').innerHTML = '';
    $('#pdSay').innerHTML = '这一场里，每一轮平均得分最高的是 <b>' + NM[order[0]] + '</b>（最高 5 分，两人都合作是 3 分，都背叛是 1 分）。' +
      (w < .3 ? ' 几乎是一锤子买卖：背叛最划算，老实人吃亏。大城市里一次性的交易，常常就是这样。' : w > .8 ? ' 大家都知道以后还会见很多次：会合作、也会还手的人占了上风。' : '') +
      (e > .08 ? ' 误会多了以后，“记仇的”和死板的“以牙还牙”会因为一次误会陷入没完没了的互相报复，肯原谅的那一种更占便宜。' : '');
  }
  $('#pdEvo').addEventListener('click', () => {
    if (!M) draw();
    let x = shares(+$('#pdD').value / 100);
    const hist = [x.slice()];
    for (let g = 0; g < 30; g++) { const f = fit(x); const avg = x.reduce((s, xi, i) => s + xi * f[i], 0); x = x.map((xi, i) => xi * f[i] / avg); hist.push(x.slice()); }
    lineChart($('#pdSvg'), NM.map((n, i) => ({color: CL[i], pts: hist.map((h, g) => [g, h[i] * 100]), w: 2.4})), {xmin: 0, xmax: 30, ymin: 0, ymax: 100, xt: [0, 10, 20, 30], xf: v => '第 ' + v + ' 代', yt: [0, 25, 50, 75, 100], yf: v => v + '%', H: 220});
    $('#pdLeg').innerHTML = NM.map((n, i) => '<span><i style="background:' + CL[i] + '"></i>' + n + ' ' + Math.round(x[i] * 100) + '%</span>').join('');
    const top = x.indexOf(Math.max(...x));
    $('#pdSay').innerHTML = '三十代以后，街上最多的是 <b>' + NM[top] + '</b>（' + Math.round(x[top] * 100) + '%）。' +
      (top === 1 ? ' 再见面的机会太小，或者精明人一开始就太多，合作的人家被吃光了。把“再见面的机会”往上拉试试。' : ' 精明人一开始能占老实人的便宜，可老实人被吃光以后，精明人只能互相背叛，每轮 1 分，慢慢被会合作又会还手的邻居比下去。<b>“未来的影子”够长，善良才不吃亏</b>。');
  });
  ['pdW', 'pdE', 'pdD'].forEach(id => slider(id, x => x + '%', () => { if (M || id) draw(); }));
});
