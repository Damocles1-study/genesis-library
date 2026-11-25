/* ---------- 装置 6：先攒几年 ---------- */
dev('#saveFig', fig => {
  const svg = $('#svSvg'), kvb = $('#svKv'), say = $('#svSay');
  const g = {}; let ready = false;
  const chance = y => 0.2 + 0.3 * (1 - Math.exp(-y / 3));   // 示意曲线
  const saved = (y) => { let s = 0, w = g.w; for (let i = 0; i < y; i++) { s += w * 12 * g.s / 100; w *= 1 + g.g / 100; } return s; };
  function draw(){
    if (!ready) return;
    const pts = [], cp = [];
    for (let y = 0; y <= 10; y++) { pts.push([y, saved(y) / 1e4]); cp.push([y, chance(y) * 100]); }
    const maxS = Math.max(10, Math.ceil(pts[10][1] / 10) * 10);
    // 左轴：攒下的钱（万），右轴：机会（%）映射到同一高度
    const c = lineChart(svg, [{pts: pts, color: 'var(--ter)', w: 2.6}, {pts: cp.map(p => [p[0], p[1] / 100 * maxS]), color: 'var(--main)', dash: '6 4', w: 2}], {xmin: 0, xmax: 10, ymin: 0, ymax: maxS, xt: [0, 2, 4, 6, 8, 10], xf: v => v + ' 年', yt: [0, maxS / 2, maxS], yf: v => v + ' 万', H: 240, L: 50});
    let ex = '<line x1="' + c.X(g.y) + '" x2="' + c.X(g.y) + '" y1="' + c.T + '" y2="' + (c.H - c.B) + '" stroke="var(--ink-2)" stroke-dasharray="2 3"/>';
    ex += '<circle cx="' + c.X(g.y) + '" cy="' + c.Y(pts[g.y][1]) + '" r="5" fill="var(--ter)"/><circle cx="' + c.X(g.y) + '" cy="' + c.Y(cp[g.y][1] / 100 * maxS) + '" r="5" fill="var(--main)"/>';
    ex += txt(c.W - c.R - 4, c.T + 12, '实线：攒下的钱　虚线：示意的机会（右边满格 = 100%）', {s: 11, a: 'end', c: 'var(--ink-2)'});
    svg.insertAdjacentHTML('beforeend', ex);
    const S = saved(g.y), risk = S * g.r / 100, keep = S - risk, months = Math.floor(risk / 4000), back = Math.floor(keep / 4000);
    kv(kvb, [['出来时攒下', yuan(S)], ['拿出来冒险', yuan(risk)], ['冒险的钱够撑', months + ' 个月生活费'], ['失败后还剩', yuan(keep) + '（' + back + ' 个月）'], ['示意的机会', Math.round(chance(g.y) * 100) + '%']]);
    let s;
    if (g.y === 0) s = '一毕业就出来：手里没有攒下的钱，只能做本钱几乎为零的生意；示意的机会也最低。好处是退路宽：失败了，二十三四岁还能从头上班。';
    else if (g.r >= 90) s = '几乎全部押上了：失败了就从零开始，回去上班之前连几个月生活费都没有。先上班的好处，就是可以只拿一部分出来冒险。';
    else if (g.y >= 8) s = '攒了 ' + g.y + ' 年，钱和机会都多了，可示意曲线越往后涨得越慢。现实里还要加上房贷、家庭和越来越高的工资：“金手铐”可能比这条曲线更早把你锁住。';
    else s = '上 ' + g.y + ' 年班，攒下 ' + yuan(S) + '，拿出一部分冒险，够撑 ' + months + ' 个月；失败了还剩 ' + back + ' 个月的生活费回去找工作。这就是“先上班”这条路的样子：慢，但每一步都有底。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('svW', v => { g.w = v; return yuan(v); }, go);
  slider('svG', v => { g.g = v; return v + '%'; }, go);
  slider('svS', v => { g.s = v; return v + '%'; }, go);
  slider('svY', v => { g.y = v; return v ? v + ' 年' : '一毕业就出来'; }, go);
  slider('svR', v => { g.r = v; return v + '%'; }, go);
  ready = true; draw();
});
