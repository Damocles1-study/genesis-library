
/* ---------- 装置 20：空锅开大火 ---------- */
dev('#panFig', fig => {
  const svg = $('#panSvg'), say = $('#panSay');
  const FIRE = [['小火', 400], ['中火', 800], ['大火', 1500]];
  const IN = [['空锅', 0, 0], ['一勺油', 54, 0], ['一锅菜（约三百克）', 54 + 900, 300]];   // [名, 额外热容 J/K, 水 g]
  let fi = 2, ii = 0, tm = 3;
  const C0 = 540, k = 3.1, T0 = 25, LH = 2260;
  function run(){
    const P = FIRE[fi][1], C = C0 + IN[ii][1];
    let T = T0, water = IN[ii][2];
    const pts = [[0, T]]; let tSmoke = null, t260 = null, t350 = null, tDry = null;
    for (let s = 1; s <= 600; s++) {
      const net = P - k * (T - T0);
      if (water > 0 && T >= 100) { water -= Math.max(0, net) / LH; T = 100; if (water <= 0) { water = 0; tDry = s; } }
      else T += net / (C + water * 4.18);
      if (ii === 1 && tSmoke == null && T >= 200) tSmoke = s;
      if (t260 == null && T >= 260) t260 = s; if (t350 == null && T >= 350) t350 = s;
      if (s % 5 === 0) pts.push([s / 60, T]);
    }
    return {pts, tSmoke, t260, t350, tDry};
  }
  const mm = s => s == null ? null : (s < 60 ? s + ' 秒' : (s / 60).toFixed(1).replace(/\.0$/, '') + ' 分钟');
  function draw(){
    const r = run();
    const c = lineChart(svg, [{pts: r.pts.filter(p => p[0] <= tm + 1e-9), color: 'var(--red)', w: 2.8}, {pts: r.pts.filter(p => p[0] >= tm - 1e-9), color: 'var(--rule)', w: 1.6, dash: '3 3'}], {xmin: 0, xmax: 10, ymin: 0, ymax: 520, xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], xf: v => v + ' 分', yt: [0, 100, 200, 300, 400, 500], yf: v => v + '°', H: 260});
    let ex = '';
    [[100, '水开', 'var(--ter)'], [200, '油开始冒烟（约）', 'var(--main)'], [260, '涂层开始分解（约）', 'var(--red)'], [350, '明显分解，鸟有危险', 'var(--red)']].forEach(l => {
      ex += '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(l[0]) + '" y2="' + c.Y(l[0]) + '" stroke="' + l[2] + '" stroke-dasharray="5 4" opacity=".75"/>' + txt(c.W - c.R - 4, c.Y(l[0]) - 4, l[1], {s: 11, a: 'end', c: l[2]});
    });
    const cur = r.pts.reduce((a, p) => Math.abs(p[0] - tm) < Math.abs(a[0] - tm) ? p : a, r.pts[0]);
    ex += '<circle cx="' + c.X(cur[0]) + '" cy="' + c.Y(cur[1]) + '" r="6" fill="var(--red)"/>' + txt(c.X(cur[0]) + 8, c.Y(cur[1]) + 16, Math.round(cur[1]) + '°', {s: 12.5, a: 'start', c: 'var(--red)', w: 1});
    ex += txt(c.L + 4, c.T + 10, '锅底温度', {s: 11, a: 'start', c: 'var(--ink-3)'});
    svg.insertAdjacentHTML('beforeend', ex);
    let s = FIRE[fi][0] + '、' + IN[ii][0] + '，开了 ' + mm(Math.round(tm * 60)) + '，锅底约 <b>' + Math.round(cur[1]) + ' 度</b>。';
    if (ii === 2) s += r.tDry && r.tDry <= 600 ? '菜里的水分把锅按在一百度上下，直到 ' + mm(r.tDry) + ' 左右烧干，之后温度又开始往上蹿：煳锅就是这样来的。' : '菜里的水分一直把锅按在一百度上下，这就是正常炒菜时涂层很安全的原因。';
    else if (r.t260 == null) s += '这个火力下，锅底到不了涂层开始分解的温度。';
    else s += (ii === 1 && r.tSmoke ? '油在 ' + mm(r.tSmoke) + ' 左右开始冒烟，这是个警报；' : '') + '锅底在约 <b>' + mm(r.t260) + '</b> 碰到涂层开始分解的那条线' + (r.t350 ? '，约 ' + mm(r.t350) + ' 过了三百五十度' : '') + '。接一个电话、回一条消息，就够了。' + (ii === 1 ? '一勺油几乎拖不慢它。' : '');
    say.innerHTML = s;
  }
  btnRow($('#panFire'), FIRE.map(f => f[0]), 2, i => { fi = i; draw(); });
  btnRow($('#panIn'), IN.map(f => f[0]), 0, i => { ii = i; draw(); });
  slider('panT', v => { tm = v; return v + ' 分钟'; }, draw);
});
