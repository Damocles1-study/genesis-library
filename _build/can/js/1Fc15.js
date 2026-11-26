
/* ---------- 装置 16：台面上化一块肉 ---------- */
dev('#thawFig', fig => {
  const svg = $('#thSvg'), kvb = $('#thKv'), say = $('#thSay'), roomRow = $('#thRoomRow');
  const MT = [['台面上（室温）', 'room', 0.6], ['冷藏室（4 度）', 4, 0.6], ['冷水里（每半小时换水）', 15, 4], ['热水里（50 度）', 50, 4]];
  let m = 0, room = 26;
  function sim(){
    const Ta = MT[m][1] === 'room' ? room : MT[m][1], h = MT[m][2], k = 1.0, Lh = 12, C = 1.5, dt = 0.01;
    let Ts = -18, Tc = -18, lat = 0, t = 0, thaw = null, dangerBefore = 0, dangerAll = 0;
    const ps = [], pc = [];
    for (let i = 0; i <= 24 / dt; i++) {
      t = i * dt;
      const q = k * (Ts - Tc);
      Ts += (h * (Ta - Ts) - q) * dt;
      if (Tc < -1) Tc = Math.min(-1, Tc + q / C * dt);
      else if (lat < 1) { lat += q / Lh * dt; Tc = -1; if (lat >= 1 && thaw == null) thaw = t; }
      else Tc += q / C * dt;
      const inD = Ts > 5 && Ts < 60;
      if (inD) { dangerAll += dt; if (thaw == null) dangerBefore += dt; }
      if (i % 10 === 0) { ps.push([t, Ts]); pc.push([t, Tc]); }
    }
    return {ps, pc, thaw, dangerBefore, dangerAll, Ta};
  }
  function draw(){
    roomRow.style.display = MT[m][1] === 'room' ? '' : 'none';
    const r = sim(), ymax = Math.max(30, r.Ta + 5);
    const c = lineChart(svg, [{pts: r.ps, color: 'var(--och)', w: 2.6}, {pts: r.pc, color: 'var(--blu)', w: 2.6}], {xmin: 0, xmax: 24, ymin: -20, ymax: ymax, xt: [0, 2, 4, 6, 8, 12, 16, 20, 24], xf: v => v + ' 时', yt: [-20, -10, 0, 10, 20, 30, 40, 50].filter(v => v <= ymax), yf: v => v + '℃', H: 250});
    let ex = '<rect x="' + c.L + '" y="' + c.Y(Math.min(60, ymax)) + '" width="' + (c.W - c.L - c.R) + '" height="' + (c.Y(5) - c.Y(Math.min(60, ymax))) + '" fill="var(--ink-3)" opacity=".12"/>' + txt(c.L + 4, c.Y(5) - 5, '5℃ 以上：危险温度区', {s: 11, a: 'start', c: 'var(--ink-2)'});
    if (r.thaw != null) ex += '<line x1="' + c.X(r.thaw) + '" x2="' + c.X(r.thaw) + '" y1="' + c.T + '" y2="' + (c.H - c.B) + '" stroke="var(--blu)" stroke-dasharray="4 3"/>' + txt(c.X(r.thaw) + 4, c.T + 12, '中心化透', {s: 11, a: 'start', c: 'var(--blu)', w: 1});
    ex += txt(c.W - c.R - 4, c.H - c.B - 6, '橙：表面　蓝：中心', {s: 10.5, a: 'end', c: 'var(--ink-3)'});
    svg.insertAdjacentHTML('afterbegin', ex);
    const f = x => x < 0.1 ? '几乎没有' : x.toFixed(1) + ' 小时';
    kv(kvb, [['中心化透', r.thaw != null ? '约 ' + r.thaw.toFixed(1) + ' 小时' : '24 小时内没化透'], ['化透之前，表面在危险区', f(r.dangerBefore)], ['放满一天，表面在危险区', f(r.dangerAll)]]);
    const S = [
      '等中心化透，表面已经在危险温度区里待了 ' + f(r.dangerBefore) + '；要是像那位合租的男生一样放一整天，表面在危险区里泡了 ' + f(r.dangerAll) + '。屋里越热，越糟。',
      '最慢，可表面一直待在冰箱的温度，几乎不进危险区。头天晚上挪进冷藏室，是最省心的化法。',
      '比台面快得多：水传热比空气快几十倍，水又是凉的，表面温度不高。记得换水，化好马上做。',
      '最快，可表面很快就到了四十多度，正是细菌最爱的温度，里面却还冻着。别用热水化肉。'
    ];
    say.innerHTML = S[m];
  }
  btnRow($('#thM'), MT.map(x => x[0]), 0, i => { m = i; draw(); });
  slider('thR', v => { room = v; return v + '℃'; }, draw);
});
