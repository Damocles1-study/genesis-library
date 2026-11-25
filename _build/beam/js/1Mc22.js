/* ---------- 装置 23：一根缆能拉多远 ---------- */
dev('#cabFig', () => {
  const Q = 200e3; // 桥面荷载 N/m（两根缆合计）
  /* [名字, 容许应力 Pa, 重度 N/m³] */
  const MT = [['现代高强钢丝', 800e6, 78.5e3], ['布鲁克林时代的钢丝', 180e6, 78.5e3], ['设想：碳纤维缆', 1000e6, 16e3]];
  let k = 0;
  btnRow($('#cabBtns'), MT.map(x => x[0]), k, i => { k = i; draw(); });
  const Lr = slider('cabL', v => v.toLocaleString() + ' 米', () => draw());
  const Nr = slider('cabN', v => '1 / ' + (1 / v).toFixed(1), () => draw());
  const cf = (L, n) => L * Math.sqrt(1 + 16 * n * n) / (8 * n);
  function cab(L, n, m){ const c = cf(L, n), den = m[1] - c * m[2]; if (den <= 0) return null; const A = c * Q / den; return {A, frac: m[2] * A / (Q + m[2] * A)}; }
  const BR = [[486, '布鲁克林'], [853, '塔科马'], [1280, '金门'], [1991, '明石'], [2023, '恰纳卡莱']];
  function draw(){
    const L = Lr(), n = Nr(), m = MT[k], c = cab(L, n, m);
    const Lmax = 8 * n * m[1] / (m[2] * Math.sqrt(1 + 16 * n * n));
    const pts = []; for (let x = 100; x <= 6000; x += 25) { const r = cab(x, n, m); pts.push([x, r ? r.frac * 100 : null]); }
    const geo = lineChart($('#cabSvg'), [{name: '自重占比', color: 'var(--ter)', pts, w: 2.6}], {xmin: 0, xmax: 6000, ymin: 0, ymax: 100, xt: [0, 1000, 2000, 3000, 4000, 5000, 6000], xf: v => v ? (v / 1000) + ' 千米' : '0', yt: [0, 25, 50, 75, 100], yf: v => v + '%', marks: BR.map(b => [b[0], b[1]]), H: 250, L: 44});
    let extra = '';
    if (c) extra += '<circle cx="' + geo.X(L) + '" cy="' + geo.Y(c.frac * 100) + '" r="6" fill="var(--main)" stroke="var(--card)" stroke-width="2"/>';
    if (Lmax < 6000) extra += '<line x1="' + geo.X(Lmax) + '" x2="' + geo.X(Lmax) + '" y1="' + geo.T + '" y2="' + (geo.H - geo.B) + '" stroke="var(--red)" stroke-width="2"/>' + txt(geo.X(Lmax) - 4, geo.H - geo.B - 8, '缆只能吊住自己', {s: 11, a: 'end', c: 'var(--red)'});
    $('#cabSvg').insertAdjacentHTML('beforeend', extra);
    if (c) {
      const each = c.A / 2, d = Math.sqrt(each / 0.8 * 4 / Math.PI);
      const len = L * (1 + 8 / 3 * n * n) * 2;
      const tons = m[2] * c.A * len / 9.81 / 1000;
      kv($('#cabKv'), [['每根大缆直径约', d < 1 ? Math.round(d * 100) + ' 厘米' : d.toFixed(2) + ' 米'], ['主跨里缆的重量约', tons >= 10000 ? (tons / 10000).toFixed(1) + ' 万吨' : Math.round(tons).toLocaleString() + ' 吨'], ['力气花在吊自己上', Math.round(c.frac * 100) + '%'], ['这种缆的极限跨度', Math.round(Lmax).toLocaleString() + ' 米']]);
    } else kv($('#cabKv'), [['每根大缆直径', '无穷大'], ['力气花在吊自己上', '100%'], ['这种缆的极限跨度', Math.round(Lmax).toLocaleString() + ' 米']]);
    const s = $('#cabSay');
    s.className = 'say' + (!c || c.frac > 0.6 ? ' bad' : c.frac < 0.3 ? ' ok' : '');
    s.innerHTML = !c ? '跨度超过了这种缆的极限：缆光是吊住自己就已经拉到了容许应力，再加多少钢丝都没用，加上去的钢丝只会让缆更重。<b>这是悬索桥跨度的天花板</b>。' :
      k === 1 ? '十九世纪的钢丝强度低，又要留很大的安全系数（布鲁克林大桥按六倍设计），所以跨度一过一千多米，缆的力气大半都花在吊自己上了。' :
      k === 2 ? '碳纤维又轻又强，理论上能把跨度推到很远，可是它贵、怕剪、接头难做，耐久性也还在研究，今天还没有用它做主缆的大桥。' :
      '跨度 ' + L.toLocaleString() + ' 米时，大缆约 ' + Math.round(c.frac * 100) + '% 的力气用来吊住它自己。' + (c.frac > 0.5 ? '<b>跨度越大，缆越像在给自己打工</b>，这也是世界最长的悬索桥停在两千米出头的原因之一（另一些原因是风、造价和锚碇）。' : '垂度大一点，缆的拉力就小一点，可是塔得更高。');
  }
  draw();
});
