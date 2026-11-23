/* ---------- 装置 8：穹顶的箍 ---------- */
dev('#dmFig', () => {
  /* [名字, 开多大(度), 跨度 m, 厚度 m]：大致数字，只为示意 */
  const P = [['万神殿（大致）', 90, 43, 2.5], ['圣索菲亚（大致）', 70, 31, 0.8], ['佛罗伦萨（按球壳近似）', 60, 42, 2.2], ['蒙古包的形状', 25, 6, 0.1], ['一把伞的形状', 40, 1, 0.1]];
  const ids = ['dmP', 'dmD', 'dmT'];
  btnRow($('#dmBtns'), P.map(p => p[0]), 0, i => ids.forEach((id, k) => { $('#' + id).value = P[i][k + 1]; $('#' + id).dispatchEvent(new Event('input')); }));
  const Ph = slider('dmP', v => v + '°', () => draw());
  const D = slider('dmD', v => v + ' 米', () => draw());
  const T = slider('dmT', v => v.toFixed(1) + ' 米', () => draw());
  $('#dmL').addEventListener('change', () => draw());
  function draw(){
    const p0 = Ph() * Math.PI / 180, d = D(), t = T(), lantern = $('#dmL').checked;
    const a = d / 2 / Math.sin(p0), w = 2000 * 9.8 * t;
    const Wd = 2 * Math.PI * a * a * (1 - Math.cos(p0)) * w, PL = lantern ? 0.1 * Wd : 0;
    const Nphi = f => -a * w / (1 + Math.cos(f)) - PL / (2 * Math.PI * a * Math.sin(f) ** 2);
    const Nth = f => a * w * (1 / (1 + Math.cos(f)) - Math.cos(f)) + PL / (2 * Math.PI * a * Math.sin(f) ** 2);
    const svg = $('#dmSvg'), S = 250 / a, cx = 300, base = 30 + a * S * (1 - Math.cos(p0)) + 10;
    const Pt = f => [cx + a * S * Math.sin(f), base - a * S * (Math.cos(f) - Math.cos(p0))];
    let g = '<line x1="20" x2="580" y1="' + base + '" y2="' + base + '" stroke="var(--ink)" stroke-width="1.2"/>';
    const sw = clamp(t * S, 3, 18);
    let maxT = 0, maxC = 0, firstTen = null, tsum = 0;
    const n = 60;
    for (let i = 0; i < n; i++) {
      const f1 = p0 * i / n, f2 = p0 * (i + 1) / n, fm = (f1 + f2) / 2, nt = Nth(fm);
      if (fm > 0.06 || !lantern) { if (nt > 0) { maxT = Math.max(maxT, nt); if (firstTen === null) firstTen = fm; } else maxC = Math.max(maxC, -nt); }
      if (nt > 0) tsum += nt * a * (f2 - f1);
      const col = nt > 0 ? 'var(--red)' : 'var(--blu)';
      [1, -1].forEach(sg => { const A = Pt(f1), B = Pt(f2); g += '<line x1="' + (cx + (A[0] - cx) * sg).toFixed(1) + '" y1="' + A[1].toFixed(1) + '" x2="' + (cx + (B[0] - cx) * sg).toFixed(1) + '" y2="' + B[1].toFixed(1) + '" stroke="' + col + '" stroke-width="' + sw + '" stroke-linecap="round"/>'; });
    }
    if (p0 > 0.904 && !lantern) { const q = Pt(0.9046); g += '<line x1="' + (2 * cx - q[0] - 40) + '" x2="' + (q[0] + 40) + '" y1="' + q[1] + '" y2="' + q[1] + '" stroke="var(--ink-3)" stroke-dasharray="3 3"/>' + txt(q[0] + 44, q[1] + 4, '约 52°', {s: 11, a: 'start', c: 'var(--ink-2)'}); }
    if (lantern) { const tp = Pt(0); g += '<rect x="' + (cx - 10) + '" y="' + (tp[1] - 34) + '" width="20" height="30" fill="var(--ink-3)" fill-opacity=".6"/>'; }
    const H = Math.abs(Nphi(p0)) * Math.cos(p0), ring = H * a * Math.sin(p0) + tsum;
    const e = Pt(p0); g += '<ellipse cx="' + cx + '" cy="' + e[1] + '" rx="' + (e[0] - cx) + '" ry="7" fill="none" stroke="var(--och)" stroke-width="2.5"/>';
    svg.setAttribute('viewBox', '0 0 600 ' + Math.ceil(base + 14)); svg.innerHTML = g;
    const sig = maxT / t / 1e6;
    kv($('#dmKv'), [['圆顶自重', fmt(Wd / 9800) + ' 吨'], ['腰上需要的箍力', ring > 1 ? fmt(ring / 9800) + ' 吨' : '几乎不用'], ['最大横向拉应力', sig > 0.0005 ? sig.toFixed(2) + ' 兆帕' : '没有'], ['矢高', (a * (1 - Math.cos(p0))).toFixed(1) + ' 米']]);
    const crack = sig > 0.1;
    $('#dmSay').className = 'say' + (crack ? ' bad' : ' ok');
    $('#dmSay').innerHTML = (maxT <= 0 ? '整个圆顶每一圈都被挤着（全是蓝色）：这是个扁的盖子，开口没过 52°。它不会自己裂开，但底部一圈往外推，要靠墙或箍顶住：箍力约 <b>' + fmt(ring / 9800) + ' 吨</b>，是圆顶自重的 ' + Math.round(ring / Wd * 100) + '%。越扁，这个比例越大。蒙古包的腰绳干的就是这个活。' :
      '红色部分每一圈都被往外撑。' + (firstTen !== null ? '从顶往下约 ' + Math.round(firstTen * 180 / Math.PI) + '° 以后变红。' : '') + '最大的横向拉应力约 ' + sig.toFixed(2) + ' 兆帕，' + (crack ? '<b>砖石扛不住</b>（灰缝的抗拉能力只有零点一兆帕上下），会从下往上裂出一道道竖缝：所以要箍铁链、压重墙。' : '还不算大，靠灰缝和自重勉强能对付。')) +
      (lantern ? ' 顶上加了灯塔以后，整个圆顶每一圈都多了一份往外撑的力，连顶上也变红了：布鲁内莱斯基的穹顶最后压上一座大理石灯塔，他必须事先在腰上箍好链子。' : '');
  }
  draw();
});
