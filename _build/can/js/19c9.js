
/* ---------- 装置 10：胃里还剩多少 ---------- */
dev('#mealFig', fig => {
  const svg = $('#mlSvg'), say = $('#mlSay'), walk = $('#mlWalk');
  const st = {size: 1, fat: 0, lie: 0.5};
  const TH = [1.0, 1.5, 2.2];               // 半排空时间（小时）
  const left = t => Math.exp(-Math.LN2 * t / (TH[st.size] * (st.fat ? 1.35 : 1)));
  const glu = (t, w) => { const tp = 0.6, A = [1.6, 2.4, 3.0][st.size] * (w ? 0.72 : 1); const tt = w ? t * 1.1 : t; return 5 + A * (tt / tp) * Math.exp(1 - tt / tp); };
  function draw(){
    const W = 600, H = 300, L = 46, R = 14, T = 16, mid = 150, B = 30;
    const X = t => L + t / 5 * (W - L - R);
    const Y1 = v => T + (1 - v) * (mid - T - 20);
    const Y2 = v => H - B - (v - 4) / 5 * (H - B - mid - 8);
    let g = '';
    for (let h = 0; h <= 5; h++) g += '<line x1="' + X(h) + '" x2="' + X(h) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--rule)"/>' + txt(X(h), H - 10, '饭后 ' + h + ' 时', {s: 10.5, c: 'var(--ink-3)', halo: false});
    [0, 0.5, 1].forEach(v => g += txt(L - 6, Y1(v) + 4, Math.round(v * 100) + '%', {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}));
    const pts = []; for (let t = 0; t <= 5.001; t += 0.05) pts.push([t, left(t)]);
    g += '<path d="M' + X(0) + ',' + Y1(0) + 'L' + pts.map(p => X(p[0]).toFixed(1) + ',' + Y1(p[1]).toFixed(1)).join('L') + 'L' + X(5) + ',' + Y1(0) + 'Z" fill="var(--kraft)" opacity=".18"/>';
    g += '<path d="M' + pts.map(p => X(p[0]).toFixed(1) + ',' + Y1(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="var(--kraft)" stroke-width="2.4"/>';
    g += txt(W - R - 4, T + 12, '胃里还剩多少', {s: 11, a: 'end', c: 'var(--kraft)'});
    const lv = left(st.lie);
    g += '<line x1="' + X(st.lie) + '" x2="' + X(st.lie) + '" y1="' + T + '" y2="' + (mid - 20) + '" stroke="var(--red)" stroke-width="2" stroke-dasharray="4 3"/><circle cx="' + X(st.lie) + '" cy="' + Y1(lv) + '" r="5" fill="var(--red)"/>' + txt(X(st.lie) + 6, Y1(lv) - 8, '躺下：还剩 ' + Math.round(lv * 100) + '%', {s: 11.5, a: 'start', c: 'var(--red)', w: 1});
    [5, 7, 9].forEach(v => g += txt(L - 6, Y2(v) + 4, v, {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}));
    g += txt(L + 4, mid + 6, '饭后血糖（示意，毫摩尔每升）', {s: 11, a: 'start', c: 'var(--ter)'});
    const gp = w => { const a = []; for (let t = 0; t <= 5.001; t += 0.05) a.push([t, glu(t, w)]); return a; };
    g += '<path d="M' + gp(false).map(p => X(p[0]).toFixed(1) + ',' + Y2(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="var(--ink-3)" stroke-width="1.8" stroke-dasharray="' + (walk.checked ? '4 3' : '0') + '"/>';
    if (walk.checked) {
      g += '<rect x="' + X(0.2) + '" y="' + (H - B - 8) + '" width="' + (X(0.45) - X(0.2)) + '" height="6" rx="3" fill="var(--ter)"/>' + txt(X(0.32), H - B - 12, '散步', {s: 10, c: 'var(--ter)'});
      g += '<path d="M' + gp(true).map(p => X(p[0]).toFixed(1) + ',' + Y2(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="var(--ter)" stroke-width="2.6"/>';
    }
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const p0 = Math.max(...gp(false).map(p => p[1])), p1 = Math.max(...gp(true).map(p => p[1]));
    let s = '饭后 ' + st.lie + ' 小时躺下，胃里大约还剩 <b>' + Math.round(lv * 100) + '%</b>。';
    s += lv > 0.5 ? ' 胃还很满，躺平以后最容易反流；有烧心、反酸的人，至少等两三个小时。' : lv > 0.25 ? ' 胃里还有不少，反流的人再等等更好。' : ' 胃已经空得差不多了，这时候躺下对反流的人也比较友好。';
    if (walk.checked) s += ' 饭后散步让血糖峰值从约 ' + p0.toFixed(1) + ' 降到约 ' + p1.toFixed(1) + '（示意）。';
    else s += ' 勾上“饭后散步”看看血糖曲线。';
    say.innerHTML = s;
  }
  btnRow($('#mlSize'), ['吃得少', '正常一顿', '吃撑了'], 1, i => { st.size = i; draw(); });
  btnRow($('#mlFat'), ['清淡', '油腻（火锅、烧烤）'], 0, i => { st.fat = i; draw(); });
  walk.addEventListener('change', draw);
  slider('mlLie', v => { st.lie = v; return v ? v + ' 小时' : '马上'; }, draw);
});
