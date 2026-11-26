
/* ---------- 装置 11：几点能开车 ---------- */
dev('#bacFig', fig => {
  const svg = $('#bcSvg'), kvb = $('#bcKv'), say = $('#bcSay');
  const g = {b: 3, p: 2, r: 0};
  const num = id => +$('#' + id).value;
  const clock = h => { const d = Math.floor(h / 24), m = ((h % 24) + 24) % 24; return (d ? '次日 ' : '') + Math.floor(m) + ':' + (m % 1 >= 0.5 ? '30' : '00'); };
  function sim(beta){
    const W = clamp(num('bcW') || 65, 35, 150), r = +$('#bcS').value;
    const t0 = clamp(num('bcT0'), 0, 23), t1 = Math.max(t0 + 0.5, clamp(num('bcT1'), 0, 30));
    const A = g.b * 20.5 + g.p * 16 + g.r * 14;                 // 克
    const dt = 0.05, ka = 2; let stom = 0, C = 0, pts = [], peak = 0, tp = t0, below80 = null, below20 = null;
    for (let t = t0; t <= t0 + 36; t += dt) {
      if (t < t1) stom += A / (t1 - t0) * dt;
      const ab = ka * stom * dt; stom -= ab;
      C += ab / (r * W) * 100;                                     // 毫克每百毫升
      C = Math.max(0, C - beta * dt);
      pts.push([t, C]);
      if (C > peak) { peak = C; tp = t; }
      if (t > t1 && t > tp) { if (below80 == null && C < 80) below80 = t; if (below20 == null && C < 20) below20 = t; }
    }
    if (peak < 80) below80 = null; if (peak < 20) below20 = null;
    return {pts, peak, tp, below80, below20, A, t0, t1};
  }
  function draw(){
    const slow = sim(10), fast = sim(20);
    const t0 = slow.t0, tmax = Math.max(t0 + 12, (slow.below20 || slow.t1 + 2) + 2);
    const ymax = Math.max(100, slow.peak * 1.15);
    const c = lineChart(svg, [
      {pts: slow.pts.filter(p => p[0] <= tmax), color: 'var(--red)', w: 2.2},
      {pts: fast.pts.filter(p => p[0] <= tmax), color: 'var(--ter)', w: 2.2}
    ], {xmin: t0, xmax: tmax, ymin: 0, ymax: ymax, xt: Array.from({length: Math.floor((tmax - t0) / 3) + 1}, (_, i) => t0 + i * 3), xf: v => clock(v).replace('次日 ', '次'), yt: [0, 20, 80, 150, 250].filter(v => v <= ymax), H: 260});
    let ex = '';
    [[20, '20 饮酒驾车'], [80, '80 醉酒驾车']].forEach(l => ex += '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(l[0]) + '" y2="' + c.Y(l[0]) + '" stroke="var(--red)" stroke-dasharray="5 4" opacity=".8"/>' + txt(c.W - c.R - 4, c.Y(l[0]) - 4, l[1], {s: 11, a: 'end', c: 'var(--red)'}));
    ex += '<rect x="' + c.X(t0) + '" y="' + c.T + '" width="' + (c.X(slow.t1) - c.X(t0)) + '" height="' + (c.H - c.B - c.T) + '" fill="var(--och)" opacity=".1"/>' + txt(c.X(t0) + 4, c.T + 12, '喝酒中', {s: 11, a: 'start', c: 'var(--och)'});
    ex += txt(c.L + 4, c.H - c.B - 6, '红：拆得慢的人　蓝：拆得快的人', {s: 10.5, a: 'start', c: 'var(--ink-3)'});
    svg.insertAdjacentHTML('beforeend', ex);
    kv(kvb, [['喝下的纯酒精', '约 ' + Math.round(slow.A) + ' 克'], ['峰值', '约 ' + Math.round(fast.peak) + '—' + Math.round(slow.peak)], ['降到 80 以下', slow.below80 ? clock(fast.below80 || slow.below80) + ' — ' + clock(slow.below80) : '没超过 80'], ['降到 20 以下', slow.below20 ? clock(fast.below20 || slow.below20) + ' — ' + clock(slow.below20) : '没超过 20']]);
    let s;
    if (!slow.A) s = '什么都没喝。拖动上面的滑块。';
    else if (slow.peak < 20) s = '这点酒，算出来的峰值没有超过 20。可人和人差别很大，空腹、体重轻的人会更高。<b>喝了就别开车</b>，这条规矩最省事。';
    else {
      s = '算出来，最早也要到 <b>' + clock(fast.below20) + '</b>，拆得慢的人要到 <b>' + clock(slow.below20) + '</b>，血液酒精才降到 20 以下。';
      if (slow.below20 - 24 > 6) s += ' 也就是说，第二天上午开车很可能还算酒驾，人却觉得自己早就醒了。';
      s += ' 这个时间只是一个粗略的范围，<b>不能拿它来决定能不能开车</b>。';
    }
    say.innerHTML = s;
  }
  ['bcW', 'bcS', 'bcT0', 'bcT1'].forEach(id => $('#' + id).addEventListener('input', draw));
  $('#bcS').addEventListener('change', draw);
  slider('bcB', v => { g.b = v; return v ? v + ' 两（' + v * 50 + ' 毫升）' : '没喝'; }, draw);
  slider('bcP', v => { g.p = v; return v ? v + ' 瓶' : '没喝'; }, draw);
  slider('bcR', v => { g.r = v; return v ? v + ' 杯' : '没喝'; }, draw);
});
