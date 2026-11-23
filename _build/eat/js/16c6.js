/* ---------- 装置 7：发酵罐 ---------- */
dev('#fmFig', () => {
  const S = slider('fmS', v => v + ' 克', () => draw());
  const T = slider('fmT', v => v + ' ℃', () => draw());
  const EMAX = 118; // 约 15% 酒精度对应的克/升
  function sim(s0, t){
    const f = t <= 30 ? Math.exp(-Math.pow((t - 30) / 11, 2)) : t <= 35 ? 1 - (t - 30) * 0.05 : Math.max(0, 0.75 - (t - 35) * 0.15);
    const kd = t > 35 ? 0.06 * (t - 35) : 0;
    let X = 0.01, s = s0, E = 0, dt = 0.05, done = null;
    const out = [[0, s, 0]];
    for (let d = dt, i = 1; d <= 30.0001; d += dt, i++) {
      const inh = Math.max(0, 1 - E / EMAX), sat = s / (s + 4);
      const use = Math.min(s, 45 * X * f * inh * sat * dt);
      X += (1.4 * f * X * (1 - X) * inh * sat - kd * X) * dt;
      X = Math.max(0, X); s -= use; E += 0.48 * use;
      if (i % 10 === 0) out.push([d, s, E]);
    }
    const e95 = 0.95 * E; for (const q of out) if (q[2] >= e95) { done = q[0]; break; }
    if (done != null && done > 29) done = null;
    return {out, s, E, done};
  }
  function draw(){
    const r = sim(S(), T());
    const abv = e => e / 7.89;
    const m = lineChart($('#fmChart'), [
      {pts: r.out.map(p => [p[0], p[1]]), color: 'var(--och)', w: 2.4},
      {pts: r.out.map(p => [p[0], abv(p[2]) * 20]), color: 'var(--main)', w: 2.6}
    ], {xmin: 0, xmax: 30, ymin: 0, ymax: 320, xt: [0, 5, 10, 15, 20, 25, 30], yt: [0, 100, 200, 300], xf: v => v + ' 天', H: 230, L: 40});
    let g = '';
    [0, 5, 10, 15].forEach(v => g += txt(m.W - m.R + 2, m.Y(v * 20) + 4, v + '%', {s: 11, a: 'end', c: 'var(--main)', halo: false}));
    $('#fmChart').insertAdjacentHTML('beforeend', g);
    const A = abv(r.E);
    kv($('#fmKv'), [['最后的酒精度', A.toFixed(1) + '%'], ['剩下的糖', Math.round(r.s) + ' 克/升'], ['大致发酵完', r.done ? Math.round(r.done) + ' 天' : '三十天还没完']]);
    const t = T();
    $('#fmSay').innerHTML = t > 36 ? '太热了：酵母还没干多少活就开始死，糖剩下一大半。夏天酿酒容易坏，古人挑季节、挑日子，有道理。' :
      t < 12 ? '太冷：酵母慢吞吞，三十天还在干。有些啤酒和葡萄酒就是故意在低温下慢慢发酵的，味道更干净，只是要等。' :
      A >= 14 && r.s > 20 ? '酒精到了 ' + A.toFixed(1) + '%，酵母被自己的酒毒得干不动了，罐子里还剩不少糖：这就是甜酒。想要更烈，只能靠蒸馏。' :
      r.s < 5 && A < 8 ? '糖不多，几天就吃光了，得到一罐低度的酒，像古代的啤酒和醴。' :
      '糖差不多都变成了酒精和二氧化碳：一罐“干”的酒，约 ' + A.toFixed(1) + ' 度。';
  }
  draw();
});
