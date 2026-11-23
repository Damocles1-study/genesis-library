/* ---------- 装置 21：挑国家（数据全部虚构） ---------- */
dev('#ckFig', () => {
  let seed = 11, C = [], inc = [], xk = 0;
  const NAMES = '甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥'.split('');
  function gen(){
    const r = rng(seed);
    C = NAMES.map(n => { const w = r(); return {n, w, fat: 18 + 24 * w + gauss(r) * 6, sug: 12 + 30 * w + gauss(r) * 7, hd: 120 + 260 * w + gauss(r) * 55}; });
    inc = C.map(() => true);
  }
  const corr = (a, b) => { const n = a.length; if (n < 3) return NaN; const ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n; let sab = 0, sa = 0, sb = 0; for (let i = 0; i < n; i++) { sab += (a[i] - ma) * (b[i] - mb); sa += (a[i] - ma) ** 2; sb += (b[i] - mb) ** 2; } return sab / Math.sqrt(sa * sb); };
  const resid = (y, w) => { const n = y.length, mw = w.reduce((s, x) => s + x, 0) / n, my = y.reduce((s, x) => s + x, 0) / n; let b = 0, d = 0; for (let i = 0; i < n; i++) { b += (w[i] - mw) * (y[i] - my); d += (w[i] - mw) ** 2; } b /= d; return y.map((v, i) => v - my - b * (w[i] - mw)); };
  const X = c => xk ? c.sug : c.fat;
  btnRow($('#ckX'), ['横轴：脂肪摄入', '横轴：糖摄入'], 0, i => { xk = i; draw(); });
  $('#ckAll').addEventListener('click', () => { inc = C.map(() => true); draw(); });
  $('#ckNew').addEventListener('click', () => { seed++; gen(); draw(); });
  $('#ckSix').addEventListener('click', () => {
    // 按横轴排序，分成三段，每段挑离整体回归线最近的两个
    const idx = C.map((c, i) => i).sort((a, b) => X(C[a]) - X(C[b]));
    const xs = C.map(X), ys = C.map(c => c.hd), n = xs.length, mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
    let b = 0, d = 0; for (let i = 0; i < n; i++) { b += (xs[i] - mx) * (ys[i] - my); d += (xs[i] - mx) ** 2; } b /= d;
    const res = i => Math.abs(ys[i] - my - b * (xs[i] - mx));
    inc = C.map(() => false);
    [idx.slice(0, 7), idx.slice(7, 15), idx.slice(15)].forEach(g => g.sort((p, q) => res(p) - res(q)).slice(0, 2).forEach(i => inc[i] = true));
    draw();
  });
  const svg = $('#ckChart');
  svg.addEventListener('click', e => { const t = e.target.closest('[data-i]'); if (!t) return; inc[+t.dataset.i] = !inc[+t.dataset.i]; draw(); });
  function draw(){
    const W = 600, H = 300, L = 50, R = 14, T = 14, B = 34;
    const xs = C.map(X), x0 = Math.min(...xs) - 3, x1 = Math.max(...xs) + 3;
    const px = x => L + (x - x0) / (x1 - x0) * (W - L - R), py = y => T + (1 - (y - 50) / 400) * (H - T - B);
    let g = '';
    [100, 200, 300, 400].forEach(v => g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + py(v) + '" y2="' + py(v) + '" stroke="var(--rule)"/>' + txt(L - 6, py(v) + 4, v, {s: 11, a: 'end', c: 'var(--ink-3)', halo: false}));
    g += txt((L + W - R) / 2, H - 8, (xk ? '糖' : '脂肪') + '摄入（占热量的百分比，虚构）', {s: 12, c: 'var(--ink-3)', halo: false});
    g += txt(L - 40, T + 4, '心脏病', {s: 11, a: 'start', c: 'var(--ink-3)', halo: false});
    const sel = C.map((c, i) => i).filter(i => inc[i]);
    const r = corr(sel.map(i => xs[i]), sel.map(i => C[i].hd));
    const pr = corr(resid(xs, C.map(c => c.w)), resid(C.map(c => c.hd), C.map(c => c.w)));
    const rAll = corr(xs, C.map(c => c.hd));
    C.forEach((c, i) => g += '<g data-i="' + i + '" style="cursor:pointer"><circle cx="' + px(xs[i]).toFixed(1) + '" cy="' + py(c.hd).toFixed(1) + '" r="14" fill="' + (inc[i] ? 'var(--main)' : 'var(--card)') + '" stroke="var(--main)" stroke-width="1.5" fill-opacity="' + (inc[i] ? .85 : 1) + '"/>' + txt(px(xs[i]), py(c.hd) + 5, c.n, {s: 14, c: inc[i] ? 'var(--paper)' : 'var(--ink-3)', halo: false}) + '</g>');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const f = v => isNaN(v) ? '—' : v.toFixed(2);
    kv($('#ckKv'), [['纳入的国家', sel.length + ' / 22'], ['相关系数 r', f(r)], ['全部 22 国扣掉“富裕程度”以后', f(pr)]]);
    $('#ckSay').innerHTML = sel.length < 3 ? '至少要三个国家才能算相关。' :
      sel.length <= 8 && r > 0.85 ? '只挑几个“合适”的国家，点几乎排成一条直线，r 高达 ' + f(r) + '，比全部 22 国的 ' + f(rAll) + ' 高得多。<b>看起来证据确凿</b>。可是用全部国家、扣掉富裕程度以后，r 只剩 ' + f(pr) + '：' + (xk ? '糖' : '脂肪') + '本身其实不影响心脏病（这是装置暗中设定的真相），是“富裕”同时推高了两者；剩下的一点相关，只是二十几个样本里的随机起伏。' :
      '全部国家放进来，r 是 ' + f(r) + '；扣掉富裕程度以后是 ' + f(pr) + '。在这批虚构数据里，脂肪和糖都和心脏病“相关”，因为它们都跟着富裕程度一起涨。<b>相关不等于因果</b>：只看这样的图，基斯和尤德金都能找到支持自己的证据。';
  }
  gen(); draw();
});
