
/* ---------- 装置 12：跑完喝多少水 ---------- */
dev('#naFig', fig => {
  const svg = $('#naSvg'), kvb = $('#naKv'), say = $('#naSay'), salt = $('#naSalt');
  const g = {w: 60, h: 4.5, s: 0.7, d: 1.2};
  function na(t){
    const tbw = 0.6 * g.w, vs = g.s * t, vd = g.d * t;
    return (140 * tbw - 40 * vs + (salt.checked ? 20 * vd : 0)) / (tbw - vs + vd);
  }
  function draw(){
    const pts = []; for (let t = 0; t <= g.h + 1e-9; t += g.h / 60) pts.push([t, na(t)]);
    const end = na(g.h), lo = Math.min(118, Math.floor(Math.min(...pts.map(p => p[1])) - 2)), hi = Math.max(146, Math.ceil(Math.max(...pts.map(p => p[1])) + 2));
    const c = lineChart(svg, [{pts, color: end < 135 ? 'var(--red)' : 'var(--ter)', w: 2.8}], {xmin: 0, xmax: g.h, ymin: lo, ymax: hi, xt: Array.from({length: Math.floor(g.h) + 1}, (_, i) => i), xf: v => v + ' 时', yt: [120, 125, 130, 135, 140, 145].filter(v => v >= lo && v <= hi), H: 240});
    let ex = '<rect x="' + c.L + '" y="' + c.Y(Math.min(145, hi)) + '" width="' + (c.W - c.L - c.R) + '" height="' + (c.Y(135) - c.Y(Math.min(145, hi))) + '" fill="var(--grn)" opacity=".12"/>';
    ex += txt(c.W - c.R - 4, c.Y(135) + 14, '135 以下：偏低', {s: 11, a: 'end', c: 'var(--red)'});
    if (lo < 125) ex += '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(125) + '" y2="' + c.Y(125) + '" stroke="var(--red)" stroke-dasharray="4 3"/>' + txt(c.W - c.R - 4, c.Y(125) - 4, '125 左右：可能头痛、呕吐、糊涂', {s: 11, a: 'end', c: 'var(--red)'});
    ex += txt(c.L + 4, c.T + 12, '血钠（毫摩尔每升）', {s: 11, a: 'start', c: 'var(--ink-3)'});
    svg.insertAdjacentHTML('afterbegin', ex);
    const dw = (g.d - g.s) * g.h;
    kv(kvb, [['出汗一共', (g.s * g.h).toFixed(1) + ' 升'], ['喝水一共', (g.d * g.h).toFixed(1) + ' 升'], ['体重变化', (dw > 0 ? '+' : dw < 0 ? '−' : '') + Math.abs(dw).toFixed(1) + ' 公斤'], ['跑完的血钠', end.toFixed(0)]]);
    let s;
    if (end < 125) s = '<b>喝得比出汗多太多了</b>：跑完体重反而重了 ' + dw.toFixed(1) + ' 公斤，血钠掉到了危险的范围。2002 年波士顿马拉松去世的那位选手，就是这种情况。';
    else if (end < 135) s = '血钠偏低了。跑完比跑前<b>还重</b>，就是喝多了的信号。按口渴喝，别逼自己每个补给站都灌一杯。';
    else if (dw < -0.03 * g.w) s = '体重掉了 ' + Math.abs(dw).toFixed(1) + ' 公斤，超过体重的百分之三，脱水比较明显了，热天容易出问题。渴了就喝，长跑可以补点含盐的饮料。';
    else s = '出汗和喝水差不多平衡，血钠在正常范围。这就是“按口渴喝”的样子：跑完体重略轻一点，比重了要安全。';
    if (salt.checked && end < 135) s += ' 运动饮料能慢一点，可喝得太多一样会低钠：它的盐比汗里少。';
    say.innerHTML = s;
  }
  salt.addEventListener('change', draw);
  slider('naW', v => { g.w = v; return v + ' 公斤'; }, draw);
  slider('naH', v => { g.h = v; return v + ' 小时'; }, draw);
  slider('naS', v => { g.s = v; return v.toFixed(1) + ' 升'; }, draw);
  slider('naD', v => { g.d = v; return v.toFixed(1) + ' 升'; }, draw);
});
