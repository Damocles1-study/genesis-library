/* ---------- 装置 7：推力线 ---------- */
dev('#arFig', () => {
  const SH = [['半圆拱（罗马）', 'semi'], ['弓形拱（赵州桥）', 'seg'], ['尖拱（哥特）', 'pt'], ['悬链线拱', 'cat']];
  const LD = [['只有拱自己', 0], ['上面还压着平的桥面', 1]];
  let sh = 1, ld = 0;
  btnRow($('#arBtns'), SH.map(s => s[0]), sh, i => { sh = i; draw(); });
  btnRow($('#arLoad'), LD.map(s => s[0]), ld, i => { ld = i; draw(); });
  const F = slider('arF', v => v.toFixed(2), () => draw());
  const Tt = slider('arT', v => (v * 100).toFixed(1) + '%', () => draw());
  /* 右半条中线：从拱顶（x=0）到拱脚（x=0.5），跨度为 1 */
  function half(kind, f){
    const n = 70, P = [];
    if (kind === 'semi') { for (let i = 0; i <= n; i++) { const a = Math.PI / 2 * (1 - i / n); P.push([0.5 * Math.cos(a), 0.5 * Math.sin(a)]); } return {P, f: 0.5}; }
    if (kind === 'seg') { const R = (0.25 + f * f) / (2 * f), yc = f - R, t0 = Math.asin(0.5 / R); for (let i = 0; i <= n; i++) { const p = t0 * i / n; P.push([R * Math.sin(p), yc + R * Math.cos(p)]); } return {P, f}; }
    if (kind === 'pt') { const top = Math.PI / 3; for (let i = 0; i <= n; i++) { const a = top * (1 - i / n); P.push([-0.5 + Math.cos(a), Math.sin(a)]); } return {P, f: Math.sqrt(0.75)}; }
    let lo = 0.005, hi = 200; for (let k = 0; k < 80; k++) { const a = (lo + hi) / 2; if (a * (Math.cosh(0.5 / a) - 1) > f) lo = a; else hi = a; }
    const a = (lo + hi) / 2; for (let i = 0; i <= n; i++) { const x = 0.5 * i / n; P.push([x, f - a * (Math.cosh(x / a) - 1)]); } return {P, f};
  }
  function solve(P, t, deck){
    const n = P.length, w = new Array(n).fill(0);
    let arcW = 0;
    for (let i = 1; i < n; i++) { const ds = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]), xm = (P[i][0] + P[i - 1][0]) / 2; w[i] = ds * t; arcW += ds * t; P[i].xm = xm; }
    if (deck) for (let i = 1; i < n; i++) w[i] += arcW * 2 * (P[i][0] - P[i - 1][0]);
    const V = w.reduce((a, b) => a + b, 0);
    const M0 = P.map(p => { let m = 0; for (let j = 1; j < n; j++) if (P[j].xm < p[0]) m += w[j] * (p[0] - P[j].xm); return m; });
    const f = P[0][1];
    let best = {D: 1e9};
    for (let ci = 0; ci <= 20; ci++) {
      const c = f - t / 2 + t * ci / 20;
      for (let hi = 0; hi <= 60; hi++) {
        const H = V * Math.pow(10, -1.6 + 2.6 * hi / 60);
        let D = 0; const yT = M0.map(m => c - m / H);
        for (let i = 0; i < n && D <= best.D; i++) {
          let dmin = 1e9;
          for (let j = Math.max(1, i - 14); j < Math.min(n, i + 15); j++) {
            const ax = P[j - 1][0], ay = P[j - 1][1], bx = P[j][0], by = P[j][1], dx = bx - ax, dy = by - ay;
            const u = clamp(((P[i][0] - ax) * dx + (yT[i] - ay) * dy) / (dx * dx + dy * dy), 0, 1);
            dmin = Math.min(dmin, Math.hypot(P[i][0] - ax - u * dx, yT[i] - ay - u * dy));
          }
          D = Math.max(D, dmin);
        }
        let xb; if (yT[n - 1] >= 0) xb = 0.5 + yT[n - 1] * H / V; else { let k = n - 1; while (k > 0 && yT[k - 1] < 0) k--; xb = k ? P[k - 1][0] + (P[k][0] - P[k - 1][0]) * yT[k - 1] / (yT[k - 1] - yT[k]) : 0; }
        D = Math.max(D, Math.abs(xb - 0.5));
        if (D < best.D) best = {D, c, H, yT, xb, V};
      }
    }
    return best;
  }
  function draw(){
    const kind = SH[sh][1], t = Tt();
    const fr = $('#arF'); fr.disabled = kind === 'semi' || kind === 'pt'; fr.parentElement.style.opacity = fr.disabled ? .45 : 1;
    const {P, f} = half(kind, F());
    const b = solve(P.map(p => [p[0], p[1]]), t, ld);
    const S = 340 / Math.max(1, (f + t) * 1.15), X = x => 300 + x * S, base = (f + t / 2) * S + 24, Y = y => base - y * S;
    const full = [...P.slice().reverse().map(p => [-p[0], p[1]]), ...P.slice(1)];
    const nrm = full.map((p, i) => { const a = full[Math.max(0, i - 1)], c = full[Math.min(full.length - 1, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy); return [-dy / L, dx / L]; });
    const outer = full.map((p, i) => [p[0] + nrm[i][0] * t / 2, p[1] + nrm[i][1] * t / 2]), inner = full.map((p, i) => [p[0] - nrm[i][0] * t / 2, p[1] - nrm[i][1] * t / 2]);
    const pth = pts => pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('');
    let g = '<line x1="20" x2="580" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="var(--ink)" stroke-width="1.2"/>';
    g += '<rect x="' + (X(-0.5) - 60) + '" y="' + Y(0) + '" width="' + (60 + t / 2 * S) + '" height="14" fill="var(--ink-3)" fill-opacity=".35"/><rect x="' + (X(0.5) - t / 2 * S) + '" y="' + Y(0) + '" width="' + (60 + t / 2 * S) + '" height="14" fill="var(--ink-3)" fill-opacity=".35"/>';
    g += '<path d="' + pth(outer) + pth(inner.slice().reverse()).replace('M', 'L') + 'Z" fill="var(--kraft)" fill-opacity=".4" stroke="var(--ink-2)" stroke-width="1"/>';
    // 中间三分之一
    const m1 = full.map((p, i) => [p[0] + nrm[i][0] * t / 6, p[1] + nrm[i][1] * t / 6]), m2 = full.map((p, i) => [p[0] - nrm[i][0] * t / 6, p[1] - nrm[i][1] * t / 6]);
    g += '<path d="' + pth(m1) + '" fill="none" stroke="var(--ink-3)" stroke-width=".6" stroke-dasharray="1 3"/><path d="' + pth(m2) + '" fill="none" stroke="var(--ink-3)" stroke-width=".6" stroke-dasharray="1 3"/>';
    const ok = b.D <= t / 2 + 1e-9, good = b.D <= t / 6;
    const tr = P.map((p, i) => [p[0], b.yT[i]]); tr.push([b.xb, 0]);
    const trFull = [...tr.slice().reverse().map(p => [-p[0], p[1]]), ...tr.slice(1)];
    g += '<path d="' + pth(trFull) + '" fill="none" stroke="var(--red)" stroke-width="2" stroke-dasharray="6 4"/>';
    if (ld) for (let k = -5; k <= 5; k++) g += '<path d="M' + X(k / 10.5) + ',' + (Y(f + t / 2) - 22) + 'v14" stroke="var(--blu)" stroke-width="1.4"/><path d="M' + (X(k / 10.5) - 3) + ',' + (Y(f + t / 2) - 12) + 'l3 5 3-5" fill="var(--blu)"/>';
    const Hh = Math.ceil(base + 22);
    const svg = $('#arSvg'); svg.setAttribute('viewBox', '0 0 600 ' + Hh); svg.innerHTML = g;
    const push = b.H / (2 * b.V);
    kv($('#arKv'), [['推力线偏离（半厚 = 100%）', Math.round(b.D / (t / 2) * 100) + '%'], ['往外推的力', '总重的 ' + Math.round(push * 100) + '%'], ['矢跨比', f.toFixed(2)]]);
    $('#arSay').className = 'say' + (good ? ' ok' : ok ? '' : ' bad');
    $('#arSay').innerHTML = (good ? '<b>很稳。</b>推力线留在拱身正中三分之一以内，石头之间处处压得实实的。' : ok ? '<b>站得住，</b>但推力线已经靠近拱身边缘，石缝的一侧开始张开，再薄一点就危险了。' : '<b>会塌。</b>在这个厚度里找不到一条推力线，拱会在几个地方裂开成铰，折下来。') +
      ' 拱脚往外推的力约为整道拱重量的 ' + Math.round(push * 100) + '%' + (push > 0.4 ? '，推得很狠，两岸要有非常结实的桥台。' : push < 0.2 ? '，推得轻，桥台可以省一些。' : '。') +
      (kind === 'semi' && !ld ? ' 试着把厚度往下调：半圆拱只靠自重时，大约在厚度为跨度的 5% 上下站不住，这就是海曼算出的“半径的十分之一”。' : '') +
      (kind === 'cat' && !ld ? ' 悬链线拱正好是倒挂链子的形状，推力线几乎和中线重合，可以做得很薄。' : '') +
      (kind === 'seg' && ld ? ' 平的桥面让荷载更均匀，扁拱反而更合身：赵州桥选扁拱，不只是为了桥面平。' : '');
  }
  draw();
});
