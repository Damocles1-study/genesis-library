
/* ---------- 装置 5：抛硬币的一辈子 ---------- */
dev('#coinFig', fig => {
  const svg = $('#coinSvg'), N = 1000, SHOW = 60;
  let seed = 7;
  const fR = $('#coinF'), nR = $('#coinN');
  function run(){
    const f = +fR.value / 100, T = +nR.value;
    $('#coinFO').textContent = Math.round(f * 100) + '%' + (f > 1 ? '（加杠杆）' : '');
    $('#coinNO').textContent = T + ' 轮';
    const r = rng(seed);
    const W = 600, H = 300, L = 52, R = 12, Tp = 12, B = 28;
    const lmin = -2, lmax = 5; // 0.01 倍到 10 万倍（相对本钱 100 → 1 元到 1000 万元）
    const X = t => L + t / T * (W - L - R), Y = v => { const l = Math.log10(Math.max(v / 100, 1e-2)); return Tp + (1 - (Math.min(l, lmax) - lmin) / (lmax - lmin)) * (H - Tp - B); };
    const paths = [], fin = [];
    let ruined = 0;
    const sum = new Array(T + 1).fill(0), meds = [];
    const all = [];
    for (let i = 0; i < N; i++) {
      let w = 100, out = false; const p = [w];
      for (let t = 1; t <= T; t++) {
        if (!out) { w = w * (r() < .5 ? 1 + .5 * f : 1 - .4 * f); if (w < 1) { out = true; w = Math.max(w, 0); } }
        p.push(w);
      }
      if (out) ruined++;
      all.push(p); fin.push(w);
    }
    for (let t = 0; t <= T; t++) { let s = 0; for (let i = 0; i < N; i++) s += all[i][t]; sum[t] = s / N; meds.push(pct(all.map(x => x[t]), .5)); }
    let g = '';
    [-2, -1, 0, 1, 2, 3, 4, 5].forEach(l => { const y = Y(100 * Math.pow(10, l)); g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="var(--rule)"' + (l === 0 ? ' stroke-width="1.6" stroke="var(--ink-3)"' : '') + '/>' + txt(L - 6, y + 4, l === 0 ? '本钱' : (l > 0 ? '×' + fmt(Math.pow(10, l)) : (Math.pow(10, l) * 100) + '%'), {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}); });
    for (let i = 0; i < SHOW; i++) g += '<path d="M' + all[i].map((v, t) => X(t).toFixed(1) + ',' + Y(v).toFixed(1)).join('L') + '" fill="none" stroke="var(--ink-3)" stroke-width=".8" opacity=".35"/>';
    g += '<path d="M' + sum.map((v, t) => X(t).toFixed(1) + ',' + Y(v).toFixed(1)).join('L') + '" fill="none" stroke="var(--och)" stroke-width="3"/>';
    g += '<path d="M' + meds.map((v, t) => X(t).toFixed(1) + ',' + Y(v).toFixed(1)).join('L') + '" fill="none" stroke="var(--main)" stroke-width="3"/>';
    [0, Math.round(T / 2), T].forEach(t => g += txt(X(t), H - 8, '第 ' + t + ' 轮', {s: 11, c: 'var(--ink-3)', halo: false}));
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const med = meds[T], mean = sum[T];
    const below = fin.filter(v => v < 100).length;
    kv($('#coinKv'), [['平均数', fmt(mean) + ' 元'], ['中位数', med < 10 ? med.toFixed(2) + ' 元' : fmt(med) + ' 元'], ['比本钱少的人', Math.round(below / N * 100) + '%'], ['出局的人', Math.round(ruined / N * 100) + '%']]);
    const s = $('#coinSay');
    s.className = 'say ' + (med >= 100 ? 'ok' : 'bad');
    s.innerHTML = f === 0 ? '一分不押，谁也不赚不赔。' :
      (mean > 100 && med < 100 ? '平均数是 <b>' + fmt(mean) + '</b> 元，看上去很美；可中间那个人只剩 <b>' + (med < 10 ? med.toFixed(2) : fmt(med)) + '</b> 元，' + Math.round(below / N * 100) + '% 的人比本钱少。平均数是被少数幸运儿拉上去的。' :
       med >= 100 ? '中间那个人也赚了：' + fmt(med) + ' 元。押得适中，好游戏才真的对“一个人”是好游戏。' : '平均数和中位数都在往下掉。') +
      (f > 1 ? ' 加了杠杆，<b>' + Math.round(ruined / N * 100) + '%</b> 的人出局了，有的还倒欠。' : '') +
      ' 试试 25%（凯利比例）、50%、100%、150%，比较中位数。';
  }
  fR.addEventListener('input', run); nR.addEventListener('input', run);
  $('#coinRe').addEventListener('click', () => { seed = (seed * 7919 + 13) % 99991; run(); });
  $('#coinK').addEventListener('click', () => { fR.value = 25; run(); });
  run();
});
