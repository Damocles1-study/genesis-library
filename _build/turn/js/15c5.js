
/* ---------- 装置 6：船换成钱 ---------- */
dev('#leagueFig', fig => {
  const R = $('#lgR'), svg = $('#lgSvg');
  // 示意：开始时有 40 个出船的盟友，共约 240 条船；萨摩斯、纳克索斯、萨索斯是其中较大的
  const REVOLT = [[-470, '纳克索斯', 12], [-465, '萨索斯', 20], [-440, '萨摩斯', 60]];
  R.addEventListener('input', go);
  function sim(rate){
    const r = rng(9), allies = [];
    for (let i = 0; i < 37; i++) allies.push({n: 2 + Math.floor(r() * 5), ship: true});
    REVOLT.forEach(v => allies.push({n: v[2], ship: true, name: v[1]}));
    const out = []; let A = 200, gone = 0;
    for (let y = -478; y <= -431; y++) {
      allies.forEach(a => { if (a.ship && !a.name && r() < rate) { a.ship = false; gone += a.n; } });
      // 大岛到了起事那一年之前，也可能先“省事”
      allies.forEach(a => { if (a.ship && a.name && r() < rate * .5) { a.ship = false; gone += a.n; a.paid = y; } });
      const S = allies.filter(a => a.ship).reduce((s, a) => s + a.n, 0);
      A = 200 + gone * 1.25 + (y + 478) * 1.5;   // 盟友的钱养出更多雅典船，金库也在慢慢攒
      out.push([y, A, S, allies.map(a => a.ship)]);
    }
    return {out, allies};
  }
  function go(){
    const rate = +R.value / 100;
    $('#lgO').textContent = rate ? '每年 ' + R.value + '% 的盟友改交钱' : '谁也不想省事';
    const {out, allies} = sim(rate);
    const ymax = Math.max(500, Math.ceil(Math.max(...out.map(p => p[1])) / 100) * 100);
    const ch = lineChart(svg, [{color: 'var(--main)', pts: out.map(p => [p[0], p[1]]), w: 3}, {color: 'var(--och)', pts: out.map(p => [p[0], p[2]]), w: 3}],
      {xmin: -480, xmax: -430, ymin: 0, ymax, xt: [-478, -470, -460, -450, -440, -431], xf: v => '前' + (-v), yt: [0, ymax / 5, ymax * 2 / 5, ymax * 3 / 5, ymax * 4 / 5, ymax], yf: v => v + ' 条', marks: REVOLT.map(v => [v[0], v[1]])});
    // 三次退群：起事一方的船 + 剩下盟友船的一半来帮忙，对上雅典舰队的一半（雅典总要留一些船在别处）
    $('#lgCards').innerHTML = REVOLT.map((v, i) => {
      const row = out.find(p => p[0] === v[0]), idx = allies.findIndex(a => a.name === v[1]);
      const own = allies[idx].paid && allies[idx].paid <= v[0] ? 0 : v[2];
      const reb = own + (row[2] - (row[3][idx] ? v[2] : 0)) / 2, ath = row[1] * .5;
      const ok = reb > ath;
      return '<div class="cd' + (ok ? ' on' : '') + '"><b>' + v[1] + ' · 前 ' + (-v[0]) + '</b>' + (own ? '自己有 ' + own + ' 条船' : '早就改交钱了，<b>手里一条战船也没有</b>') + '，能拉来的帮手约 ' + Math.round(reb - own) + ' 条；雅典能派来约 ' + Math.round(ath) + ' 条。<br><small>' + (ok ? '这回有一拼，雅典要付出很大代价。' : '没有胜算。拆城墙、交战船、交钱。') + '</small></div>';
    }).join('');
    const last = out[out.length - 1];
    $('#lgCards').insertAdjacentHTML('beforeend', '<div class="cd"><b>前 431 年</b>雅典和金库养着约 ' + Math.round(last[1]) + ' 条船，盟友自己还剩约 ' + Math.round(last[2]) + ' 条。<br><small>' + (last[2] < 80 ? '真实的历史里，这时还自己出船的只剩希俄斯和莱斯沃斯。' : '盟友手里还有不少船，雅典要想当帝国可没那么容易。') + '</small></div>');
  }
  go();
});
