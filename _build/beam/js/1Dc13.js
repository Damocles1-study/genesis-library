/* ---------- 装置 14：尖拱的好处 ---------- */
dev('#jgFig', () => {
  let pt = 0;
  btnRow($('#jgBtns'), ['全用半圆拱', '全用尖拱'], pt, i => { pt = i; draw(); });
  const A = slider('jgA', v => v + ' 米', () => draw());
  const B = slider('jgB', v => v + ' 米', () => draw());
  function arcPts(s, f){
    // 返回跨度 s、矢高 f 的拱上的点（x 从 0 到 s）
    const P = [];
    if (Math.abs(f - s / 2) < 1e-6 || f < s / 2) { const r = s / 2; for (let i = 0; i <= 40; i++) { const t = Math.PI * i / 40; P.push([r - r * Math.cos(t), r * Math.sin(t)]); } return P; }
    const R = (f * f + s * s / 4) / s; // 两心尖拱
    const c1 = R, c2 = s - R; // 左半圆心在 x = R（右侧），右半圆心在 x = s - R
    const a = Math.asin(f / R);
    for (let i = 0; i <= 20; i++) { const t = Math.PI - (Math.PI - (Math.PI - a)) * 0 - (a) * i / 20; P.push([c1 + R * Math.cos(Math.PI - a * i / 20), R * Math.sin(Math.PI - a * i / 20)]); }
    for (let i = 20; i >= 0; i--) P.push([c2 + R * Math.cos(a * i / 20), R * Math.sin(a * i / 20)]);
    return P;
  }
  function draw(){
    const a = Math.min(A(), B()), b = Math.max(A(), B()), c = Math.hypot(a, b);
    const spans = [['短边', a], ['长边', b], ['对角线', c]];
    const Hc = c / 2;
    const rows = spans.map(sp => ({n: sp[0], s: sp[1], f: pt ? Hc : sp[1] / 2}));
    const W = 600, k = 170 / Math.max(c, 1) * 1.0, base = 30 + Hc * k + 6;
    let x = 20, g = '<line x1="10" x2="590" y1="' + (base - Hc * k) + '" y2="' + (base - Hc * k) + '" stroke="var(--ink-3)" stroke-dasharray="3 4"/>';
    rows.forEach((r, i) => {
      const P = arcPts(r.s, r.f), col = ['var(--main)', 'var(--ter)', 'var(--och)'][i];
      g += '<path d="M' + P.map(p => (x + p[0] * k).toFixed(1) + ',' + (base - p[1] * k).toFixed(1)).join('L') + '" fill="none" stroke="' + col + '" stroke-width="4" stroke-linecap="round"/>';
      g += '<line x1="' + x + '" x2="' + (x + r.s * k) + '" y1="' + base + '" y2="' + base + '" stroke="var(--ink)"/>';
      g += txt(x + r.s * k / 2, base + 16, r.n + ' ' + r.s.toFixed(1) + ' 米', {s: 11.5, c: 'var(--ink-2)', halo: false});
      g += txt(x + r.s * k / 2, base - r.f * k - 6, '高 ' + r.f.toFixed(1), {s: 11, c: col});
      x += r.s * k + 26;
    });
    const svg = $('#jgSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (base + 24)); svg.innerHTML = g;
    const push = r => Math.round(r.s / r.f / 2 * 100);
    kv($('#jgKv'), rows.map(r => [r.n + '拱：高 / 推力', r.f.toFixed(1) + ' 米 / ' + push(r) + '%']));
    $('#jgSay').innerHTML = pt ? '全用尖拱：三道拱都在 ' + Hc.toFixed(1) + ' 米的高度碰头，屋顶是平的；跨度小的那几道拱更尖，往外推得更轻（短边只有 ' + push(rows[0]) + '%）。<b>同一个高度，配不同的跨度</b>，这就是哥特工匠最需要的那点自由。' :
      '全用半圆拱：短边、长边和对角线的拱高度分别是 ' + rows.map(r => r.f.toFixed(1)).join('、') + ' 米，三道拱碰不到一起，屋顶会高低不平。罗马式建筑的办法是把开间做成正方形，或者把拱顶做成笨重的筒拱；长方形的开间，半圆拱很难对付。';
  }
  draw();
});
