/* ---------- 装置 18：霍奇金森的梁 ---------- */
dev('#tieFig', () => {
  const MAT = [['铸铁', 110, 600], ['熟铁', 320, 230], ['软钢', 250, 250]]; // [名, 抗拉, 抗压] 兆帕
  const H = 300, AF = 12000, AW = 800; // 截面高 mm，两翼缘合计面积，腹板面积 mm²
  let k = 0;
  btnRow($('#tieBtns'), MAT.map(x => x[0]), k, i => { k = i; draw(); });
  const ratio = v => Math.pow(4, (v - 10) / 15);
  const R = slider('tieR', v => { const r = ratio(v); return (r >= 1 ? r.toFixed(r < 10 ? 1 : 0) + ' : 1' : '1 : ' + (1 / r).toFixed(1)); }, () => draw());
  function cap(r, mt){
    const At = AF / (1 + r), Ab = AF - At, A = AF + AW;
    const yb = (Ab * H + AW * H / 2) / A; // 中和轴到上缘的距离
    const I = At * yb * yb + Ab * (H - yb) * (H - yb) + AW * H * H / 12 + AW * (H / 2 - yb) * (H / 2 - yb);
    const Mc = mt[2] * I / yb, Mt = mt[1] * I / (H - yb);
    return {At, Ab, yb, I, M: Math.min(Mc, Mt) / 1e6, by: Mc < Mt ? 'c' : 't', Mc: Mc / 1e6, Mt: Mt / 1e6};
  }
  function best(mt){ let b = {M: 0, v: 10}; for (let v = 0; v <= 40; v += 0.25) { const c = cap(ratio(v), mt); if (c.M > b.M) b = {M: c.M, v, r: ratio(v)}; } return b; }
  function draw(){
    const mt = MAT[k], r = ratio(R()), c = cap(r, mt), b = best(mt);
    const W = 320, Hh = 220, cx = 80, top = 30, sc = 0.5;
    const wt = 16 + c.At / AF * 110, wb = 16 + c.Ab / AF * 110;
    const ft = 6 + c.At / AF * 8, fb = 6 + c.Ab / AF * 8;
    let g = '';
    g += '<rect x="' + (cx - wt / 2) + '" y="' + top + '" width="' + wt + '" height="' + ft + '" fill="var(--main)" opacity=".85"/>';
    g += '<rect x="' + (cx - 4) + '" y="' + (top + ft) + '" width="8" height="' + (H * sc - ft - fb) + '" fill="var(--main)" opacity=".6"/>';
    g += '<rect x="' + (cx - wb / 2) + '" y="' + (top + H * sc - fb) + '" width="' + wb + '" height="' + fb + '" fill="var(--main)" opacity=".85"/>';
    const ny = top + c.yb * sc;
    g += '<line x1="10" x2="150" y1="' + ny + '" y2="' + ny + '" stroke="var(--ink-3)" stroke-dasharray="3 3"/>' + txt(14, ny - 4, '中和轴', {s: 10, a: 'start', c: 'var(--ink-3)'});
    g += txt(cx, top - 8, '截面', {s: 11, c: 'var(--ink-2)'});
    /* 坏的那一刻的应力：上缘压，下缘拉，按直线分布 */
    const M = c.M * 1e6, sTop = M * c.yb / c.I, sBot = M * (H - c.yb) / c.I;
    const ax = 230, ssc = 60 / Math.max(mt[1], mt[2], 300);
    g += '<line x1="' + ax + '" x2="' + ax + '" y1="' + top + '" y2="' + (top + H * sc) + '" stroke="var(--ink)" stroke-width="1.2"/>';
    g += '<path d="M' + ax + ',' + top + 'L' + (ax - sTop * ssc) + ',' + top + 'L' + ax + ',' + ny + 'z" fill="var(--blu)" opacity=".45"/>';
    g += '<path d="M' + ax + ',' + (top + H * sc) + 'L' + (ax + sBot * ssc) + ',' + (top + H * sc) + 'L' + ax + ',' + ny + 'z" fill="var(--red)" opacity=".45"/>';
    g += '<line x1="' + (ax - mt[2] * ssc) + '" x2="' + (ax - mt[2] * ssc) + '" y1="' + (top - 6) + '" y2="' + (top + 10) + '" stroke="var(--blu)" stroke-width="2"/>';
    g += '<line x1="' + (ax + mt[1] * ssc) + '" x2="' + (ax + mt[1] * ssc) + '" y1="' + (top + H * sc - 10) + '" y2="' + (top + H * sc + 6) + '" stroke="var(--red)" stroke-width="2"/>';
    g += txt(ax - 4, top + 22, '压 ' + Math.round(sTop), {s: 10.5, a: 'end', c: 'var(--blu)'});
    g += txt(ax + 4, top + H * sc - 14, '拉 ' + Math.round(sBot), {s: 10.5, a: 'start', c: 'var(--red)'});
    g += txt(ax, top - 8, '坏的时候的应力（兆帕）', {s: 11, c: 'var(--ink-2)'});
    g += txt(ax, top + H * sc + 22, '竖线是材料的强度', {s: 10, c: 'var(--ink-3)'});
    const svg = $('#tieSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); svg.innerHTML = g;
    const pct = c.M / b.M * 100;
    kv($('#tieKv'), [['能扛的弯矩', c.M.toFixed(0) + ' 千牛·米'], ['是最好比例的', Math.round(pct) + '%'], ['先坏在', c.by === 'c' ? '上缘压碎' : '下缘拉断'], ['这种材料最好的比例', b.r >= 1 ? b.r.toFixed(1) + ' : 1' : '1 : ' + (1 / b.r).toFixed(1)]]);
    const s = $('#tieSay');
    s.className = 'say' + (pct > 97 ? ' ok' : pct < 70 ? ' bad' : '');
    if (k === 0) s.innerHTML = pct > 97 ? '找到了：铸铁梁的下翼缘要做到上翼缘的六七倍，上缘和下缘差不多同时到极限，一点铁也不浪费。<b>这就是霍奇金森 1830 年前后试出来的形状</b>。' :
      c.by === 't' ? '铸铁梁从下面拉断了，上面的铁还远没用上劲。把更多的铁挪到下翼缘去。' : '这回轮到上缘先压碎了：下翼缘给得太多。铸铁抗压很强，上翼缘不用很大，但也不能太小。';
    else if (k === 1) s.innerHTML = '熟铁能拉，受压反而容易屈服、失稳，所以熟铁梁的最好比例和铸铁正好倒过来，上面要多一点。<b>材料不同，最好的形状就不同</b>。' + (pct > 97 ? '' : '试着往左拖。');
    else s.innerHTML = '钢拉压一样强，最好的截面是上下对称的：就是今天随处可见的工字钢。' + (pct > 97 ? '<b>到了钢的年代，梁的形状不再偏心了</b>。' : '把比例拖回 1 : 1 附近试试。');
  }
  draw();
});
