/* ---------- 装置 11：一座房子，三张图 ---------- */
dev('#tuFig', () => {
  const RT = [['硬山', 'gable', 0], ['悬山', 'gable', 0.6], ['庑殿', 'hip', 0]];
  let rt = 0;
  btnRow($('#tuBtns'), RT.map(r => r[0] + '顶'), rt, i => { rt = i; draw(); });
  const N = slider('tuN', v => v + ' 间', () => draw());
  const D = slider('tuD', v => v + ' 米', () => draw());
  const Hh = slider('tuH', v => v.toFixed(1) + ' 米', () => draw());
  const R = slider('tuR', v => v.toFixed(2), () => draw());
  function draw(){
    const n = N(), bay = 3.6, L = n * bay, d = D(), h = Hh(), rise = R() * d, e = 0.9;
    const ye = h - e * rise / (d / 2), top = h + rise, kind = RT[rt][1], oh = RT[rt][2];
    /* 三维的线：[[x,y,z],[x,y,z]] */
    const E = [];
    const box = [[0, 0, 0], [L, 0, 0], [L, 0, d], [0, 0, d]];
    for (let i = 0; i < 4; i++) { const a = box[i], b = box[(i + 1) % 4]; E.push([a, b, 'w']); E.push([[a[0], h, a[2]], [b[0], h, b[2]], 'w']); E.push([a, [a[0], h, a[2]], 'w']); }
    for (let i = 1; i < n; i++) [0, d].forEach(z => E.push([[i * bay, 0, z], [i * bay, h, z], 'c']));
    let rx0, rx1;
    if (kind === 'gable') {
      const x0 = -oh, x1 = L + oh; rx0 = x0; rx1 = x1;
      E.push([[x0, ye, -e], [x1, ye, -e], 'r'], [[x0, ye, d + e], [x1, ye, d + e], 'r'], [[x0, top, d / 2], [x1, top, d / 2], 'r']);
      [x0, x1].forEach(x => { E.push([[x, ye, -e], [x, top, d / 2], 'r'], [[x, ye, d + e], [x, top, d / 2], 'r']); });
    } else {
      const Lr = Math.max(L - d, 0.4); rx0 = (L - Lr) / 2; rx1 = (L + Lr) / 2;
      const c = [[-e, ye, -e], [L + e, ye, -e], [L + e, ye, d + e], [-e, ye, d + e]];
      for (let i = 0; i < 4; i++) E.push([c[i], c[(i + 1) % 4], 'r']);
      E.push([[rx0, top, d / 2], [rx1, top, d / 2], 'r'], [c[0], [rx0, top, d / 2], 'r'], [c[3], [rx0, top, d / 2], 'r'], [c[1], [rx1, top, d / 2], 'r'], [c[2], [rx1, top, d / 2], 'r']);
    }
    const W = 600;
    const s = Math.min(250 / (L + 2 * e + 2 * oh), 150 / (top + 0.5), 150 / (d + 2 * e));
    const fx = 30, fy = 24 + top * s;              // 正立面原点：左下
    const px = fx, pz = fy + 30;                   // 平面：x 对齐正面，z 往下
    const sx = 330, sy = fy;                       // 侧立面：z 往右
    const Hs = Math.max(pz + (d + 2 * e) * s + 14, fy + 170);
    const raw = p => [(p[0] - p[2]) * 0.866, -p[1] + (p[0] + p[2]) * 0.5];
    let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
    E.forEach(ed => [ed[0], ed[1]].forEach(q => { const r = raw(q); bx0 = Math.min(bx0, r[0]); bx1 = Math.max(bx1, r[0]); by0 = Math.min(by0, r[1]); by1 = Math.max(by1, r[1]); }));
    const iTop = fy + 22, si = Math.min(250 / (bx1 - bx0), (Hs - iTop - 8) / (by1 - by0));
    const ix = 330 + (260 - (bx1 - bx0) * si) / 2;
    const views = {
      F: p => [fx + p[0] * s, fy - p[1] * s],
      P: p => [px + p[0] * s, pz + (p[2] + e) * s],
      S: p => [sx + (p[2] + e) * s, sy - p[1] * s],
      I: p => { const r = raw(p); return [ix + (r[0] - bx0) * si, iTop + (r[1] - by0) * si]; }
    };
    const col = t => t === 'r' ? 'var(--ter)' : t === 'c' ? 'var(--ink-3)' : 'var(--ink)';
    let g = '';
    Object.entries(views).forEach(([k, P]) => {
      E.forEach(ed => { if (k === 'P' && ed[2] === 'c') return; const a = P(ed[0]), b = P(ed[1]); g += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + col(ed[2]) + '" stroke-width="' + (ed[2] === 'r' ? 1.4 : 1) + '"' + (k === 'P' && ed[2] === 'r' ? ' stroke-dasharray="4 3"' : '') + '/>'; });
    });
    for (let i = 0; i <= n; i++) [0, d].forEach(z => { const q = views.P([i * bay, 0, z]); g += '<rect x="' + (q[0] - 2.5) + '" y="' + (q[1] - 2.5) + '" width="5" height="5" fill="var(--ink)"/>'; });
    for (let i = 0; i <= n; i++) { const a = views.F([i * bay, 0, 0]), b = views.P([i * bay, 0, 0]); g += '<line x1="' + a[0] + '" x2="' + b[0] + '" y1="' + a[1] + '" y2="' + b[1] + '" stroke="var(--blu)" stroke-opacity=".35" stroke-dasharray="2 3"/>'; }
    [top, ye, h].forEach(y => { const a = views.F([L + oh + e, y, 0]), b = views.S([0, y, -e]); g += '<line x1="' + a[0] + '" x2="' + b[0] + '" y1="' + a[1] + '" y2="' + b[1] + '" stroke="var(--blu)" stroke-opacity=".35" stroke-dasharray="2 3"/>'; });
    g += txt(fx, 12, '正立面', {s: 11, a: 'start', c: 'var(--main)'}) + txt(px, pz - 8 + 0, '平面', {s: 11, a: 'start', c: 'var(--main)'}) + txt(sx, 12, '侧立面', {s: 11, a: 'start', c: 'var(--main)'}) + txt(330, iTop - 4, '轴测', {s: 11, a: 'start', c: 'var(--main)'});
    const svg = $('#tuSvg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hs); svg.innerHTML = g;
    $('#tuSay').innerHTML = '面阔 ' + n + ' 间、约 ' + L.toFixed(1) + ' 米，进深 ' + d + ' 米，屋脊高约 ' + top.toFixed(1) + ' 米，' + RT[rt][0] + '顶。' +
      (kind === 'hip' ? '庑殿顶在正面看是梯形、侧面看是三角形，只看一张图分不出它和别的屋顶，' : '硬山和悬山的正面看起来差不多，只有在平面和侧面上才看得出屋顶有没有伸出山墙，') +
      '<b>所以一张图永远不够，至少要两张，最好三张</b>。' + (n >= 9 ? ' 九间以上、庑殿顶，在清代只有皇家才能用。' : '');
  }
  draw();
});
