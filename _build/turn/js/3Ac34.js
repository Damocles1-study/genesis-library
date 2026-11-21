/* ---------- 装置 35：白银往哪边流 ---------- */
dev('#opiumFig', fig => {
  // 每年运进中国的鸦片（箱）与中国白银净流入（百万两，示意）
  const OP = [[1790, 4000], [1800, 4500], [1810, 4800], [1820, 5000], [1825, 9600], [1830, 18000], [1835, 30000], [1838, 40000], [1840, 20000], [1842, 30000], [1845, 39000], [1850, 50000], [1855, 65000], [1860, 60000]];
  const AG = [[1790, 3], [1800, 3], [1810, 2], [1818, 0.5], [1822, -1], [1828, -3], [1833, -7], [1838, -9], [1842, -8], [1850, -6], [1856, -4], [1860, -3]];
  const at = (A, y) => { for (let i = 0; i < A.length - 1; i++) if (y <= A[i + 1][0]) return lerp(A[i][1], A[i + 1][1], (y - A[i][0]) / (A[i + 1][0] - A[i][0])); return A[A.length - 1][1]; };
  const Y = $('#opY'), svg = $('#opSvg'), tri = $('#opTri');
  const EV = [[1793, '马戛尔尼'], [1839, '虎门销烟'], [1842, '南京条约'], [1858, '鸦片合法化']];
  const SIDES = [
    ['英国 → 印度', '兰开夏的机织棉布。印度的手工纺织业被冲垮（上一章的装置）。印度用卖鸦片的钱付英国的布钱、付英国官员的薪水和退休金。'],
    ['印度 → 中国', '孟加拉的鸦片，由私商走私进中国，换成白银。到十九世纪中叶，鸦片收入约占英属印度财政收入的七分之一左右（<b>存疑</b>）。'],
    ['中国 → 英国', '茶叶，还有丝。东印度公司用卖鸦片得来的白银在广州买茶，运回伦敦。英国政府从茶叶上收关税。']
  ];
  let side = 1;
  Y.addEventListener('input', go);
  tri.addEventListener('click', e => { const g = e.target.closest('[data-s]'); if (g) { side = +g.dataset.s; go(); } });
  function go(){
    const y = +Y.value;
    $('#opYo').textContent = y + ' 年';
    const W = 600, H = 230, L = 50, R = 50, T = 14, B = 30, mid = T + (H - T - B) * 0.55;
    const X = v => L + (v - 1790) / 70 * (W - L - R);
    const Yo = v => mid - v / 70000 * (mid - T), Ya = v => mid - v / 10 * (H - B - mid) * 1.0;
    let g = '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + mid + '" y2="' + mid + '" stroke="var(--ink)" stroke-width="1"/>';
    [1790, 1810, 1830, 1850].forEach(v => g += txt(X(v), H - 8, v, {s: 11, c: 'var(--ink-3)', halo: false}));
    [20000, 40000, 60000].forEach(v => g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Yo(v) + '" y2="' + Yo(v) + '" stroke="var(--rule)"/>' + txt(L - 5, Yo(v) + 4, (v / 10000) + '万箱', {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}));
    [-5, 5].forEach(v => g += txt(W - R + 5, Ya(v) + 4, (v > 0 ? '+' : '') + v + '百万两', {s: 10.5, a: 'start', c: 'var(--och)', halo: false}));
    // 鸦片：面积
    let d = 'M' + X(1790) + ',' + mid; for (let v = 1790; v <= 1860; v++) d += 'L' + X(v).toFixed(1) + ',' + Yo(at(OP, v)).toFixed(1); d += 'L' + X(1860) + ',' + mid + 'Z';
    g += '<path d="' + d + '" fill="var(--pur)" fill-opacity=".28"/>';
    let a = ''; for (let v = 1790; v <= 1860; v++) a += (v === 1790 ? 'M' : 'L') + X(v).toFixed(1) + ',' + Ya(at(AG, v)).toFixed(1);
    g += '<path d="' + a + '" fill="none" stroke="var(--och)" stroke-width="2.6"/>';
    EV.forEach((e, i) => g += '<line x1="' + X(e[0]) + '" x2="' + X(e[0]) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink-3)" stroke-dasharray="2 3"/>' + txt(X(e[0]) + 3, T + 10 + (i % 2) * 13, e[1], {s: 11, a: 'start', c: 'var(--ink-2)'}));
    g += '<line x1="' + X(y) + '" x2="' + X(y) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink)" stroke-width="2"/>';
    g += txt(L + 4, mid - 6, '紫：鸦片箱数', {s: 11, a: 'start', c: 'var(--pur)'}) + txt(L + 4, mid + 16, '金线：白银进出中国', {s: 11, a: 'start', c: 'var(--och)'});
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const op = Math.round(at(OP, y) / 100) * 100, ag = at(AG, y);
    kv($('#opKV'), [['鸦片', op.toLocaleString() + ' 箱/年'], ['约合', Math.round(op * 63.5 / 1000).toLocaleString() + ' 吨'], ['白银', (ag >= 0 ? '流入 ' : '流出 ') + Math.abs(ag).toFixed(1) + ' 百万两/年（示意）']]);
    // 三角
    const P = [[60, 40], [200, 40], [130, 150]], NM = ['英国', '印度', '中国'];
    let t = '';
    [[0, 1], [1, 2], [2, 0]].forEach((s, i) => { const p = P[s[0]], q = P[s[1]]; t += '<g data-s="' + i + '" style="cursor:pointer"><line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="transparent" stroke-width="18"/><line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="' + (i === side ? 'var(--ter)' : 'var(--ink-3)') + '" stroke-width="' + (i === side ? 4 : 2) + '" marker-end="url(#opArr)"/></g>'; });
    P.forEach((p, i) => t += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="20" fill="var(--paper)" stroke="var(--ink)"/>' + txt(p[0], p[1] + 5, NM[i], {s: 13, w: true, hc: 'var(--paper)'}));
    tri.setAttribute('viewBox', '0 0 260 190');
    tri.innerHTML = '<defs><marker id="opArr" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--ink-2)"/></marker></defs>' + t;
    $('#opSay').innerHTML = '<b>' + SIDES[side][0] + '</b><br>' + SIDES[side][1] + '<br><small>点三角形的边换一条。</small>';
  }
  go();
});
