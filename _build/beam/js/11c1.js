/* ---------- 装置 2：百堵皆兴 ---------- */
dev('#hdFig', () => {
  const P = [
    ['郑州商城（大致尺度）', 7, 10, 20, 5, 10000, 0.3],
    ['一座县城', 4, 8, 10, 4, 5000, 0.3],
    ['五十公里长城（戈壁）', 50, 4, 3.5, 2, 3000, 0.3],
    ['统万城西城（示意）', 2.5, 12, 16, 6, 100000, 0.3]
  ];
  const ids = ['hdL', 'hdH', 'hdB', 'hdT', 'hdW', 'hdP'];
  btnRow($('#hdBtns'), P.map(p => p[0]), 0, i => { ids.forEach((id, k) => { $('#' + id).value = P[i][k + 1]; $('#' + id).dispatchEvent(new Event('input')); }); });
  const L = slider('hdL', v => v + ' 公里', () => draw());
  const H = slider('hdH', v => v + ' 米', () => draw());
  const B = slider('hdB', v => v + ' 米', () => draw());
  const Tp = slider('hdT', v => v + ' 米', () => draw());
  const W = slider('hdW', v => fmt(v) + ' 人', () => draw());
  const Pp = slider('hdP', v => v.toFixed(2) + ' m³', () => draw());
  function draw(){
    const b = B(), t = Math.min(Tp(), b), h = H();
    const vol = L() * 1000 * h * (b + t) / 2;
    const pd = vol / Pp(), days = pd / W();
    const layers = Math.round(h / 0.09);
    // 截面图
    const svg = $('#hdSec'), S = Math.min(140 / h, 400 / b), base = 160, cx = 300;
    let g = '<line x1="40" x2="560" y1="' + base + '" y2="' + base + '" stroke="var(--ink)" stroke-width="1.4"/>';
    const pts = [[cx - b * S / 2, base], [cx - t * S / 2, base - h * S], [cx + t * S / 2, base - h * S], [cx + b * S / 2, base]];
    g += '<path d="M' + pts.map(p => p.map(v => v.toFixed(1)).join(',')).join('L') + 'Z" fill="var(--kraft)" fill-opacity=".45" stroke="var(--ink-2)"/>';
    const n = Math.min(layers, 40);
    for (let i = 1; i < n; i++) { const yy = base - h * S * i / n, ww = (b - (b - t) * i / n) * S; g += '<line x1="' + (cx - ww / 2).toFixed(1) + '" x2="' + (cx + ww / 2).toFixed(1) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="var(--ink-3)" stroke-width=".5"/>'; }
    g += '<rect x="' + (cx + b * S / 2 + 14) + '" y="' + (base - 1.7 * S) + '" width="' + Math.max(1.7 * S * .3, 1.5) + '" height="' + 1.7 * S + '" fill="var(--ink)"/>';
    g += txt(cx, base + 16, '底宽 ' + b + ' 米', {s: 11, c: 'var(--ink-3)', halo: false}) + txt(cx, base - h * S - 6, '顶宽 ' + t + ' 米 · 高 ' + h + ' 米', {s: 11, c: 'var(--ink-2)'});
    svg.setAttribute('viewBox', '0 0 600 180'); svg.innerHTML = g;
    kv($('#hdKv'), [['土方', fmt(vol) + ' m³'], ['总工日', fmt(pd)], ['不停干要', days < 365 ? Math.round(days) + ' 天' : (days / 365).toFixed(1) + ' 年'], ['每年只干两个月', (days / 60).toFixed(1) + ' 年'], ['夯层（每层约 9 厘米）', layers + ' 层']]);
    $('#hdSay').innerHTML = '这段墙约 <b>' + fmt(vol) + ' 立方米</b>土，要 ' + fmt(pd) + ' 个工日。' + fmt(W()) + ' 人不停地干，要 ' + (days < 365 ? Math.round(days) + ' 天' : (days / 365).toFixed(1) + ' 年') +
      '；可古代的徭役大多只在农闲征一两个月，那就是 <b>' + (days / 60).toFixed(1) + ' 年</b>。' +
      (days / 60 > 5 ? '一代人的青壮年，有好几年的农闲是在城墙上度过的。' : '') +
      ' 墙上的每一层，都要有人一杵一杵地砸上几遍。';
  }
  draw();
});
