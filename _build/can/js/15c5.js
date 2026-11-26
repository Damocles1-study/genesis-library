
/* ---------- 装置 6：一杯西柚汁之后 ---------- */
dev('#gfFig', fig => {
  const svg = $('#gfSvg'), say = $('#gfSay'), days = $('#gfDays');
  const DN = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const on = [1, 1, 1, 1, 1, 1, 1];
  const DR = [['很依赖这道门的药', 2 / 3], ['中等依赖的药', 0.375], ['不经过这道门的药', 0]];
  let drug = 0, gap = 0;
  days.innerHTML = DN.map((d, i) => '<button data-i="' + i + '">' + d + '</button>').join('');
  days.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; on[+b.dataset.i] ^= 1; draw(); });
  btnRow($('#gfDrug'), DR.map(d => d[0]), 0, i => { drug = i; draw(); });
  function sim(){
    const dt = 0.25, tau = 33, drop = 0.4;           // 一杯降到原来的四成；恢复时间常数约 33 小时（半衰期约一天）
    const juice = []; on.forEach((v, d) => { if (v) juice.push(d * 24 + 8 - gap); });
    let E = 1, pts = [], exp = [];
    for (let t = -14; t <= 168; t += dt) {
      if (juice.some(j => Math.abs(j - t) < dt / 2)) E *= drop;
      E += (1 - E) / tau * dt;
      if (t >= 0) pts.push([t, E]);
      for (let d = 0; d < 7; d++) if (Math.abs(t - (d * 24 + 8)) < dt / 2) exp.push(E);
    }
    return {pts, exp};
  }
  function draw(){
    $$('button', days).forEach(b => b.classList.toggle('on', !!on[+b.dataset.i]));
    const r = sim(), fm = DR[drug][1];
    const M = E => (1 - fm * E) / (1 - fm);
    const W = 600, H = 300, L = 46, R = 14, T = 14, mid = 150, B = 30;
    const X = t => L + t / 168 * (W - L - R);
    const Y1 = e => T + (1 - e) * (mid - T - 24);
    const mx = Math.max(3.2, ...r.exp.map(M));
    const Y2 = m => H - B - (m / mx) * (H - B - mid - 6);
    let g = '';
    for (let d = 0; d <= 7; d++) g += '<line x1="' + X(d * 24) + '" x2="' + X(d * 24) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--rule)"/>';
    DN.forEach((d, i) => g += txt(X(i * 24 + 12), H - 10, d, {s: 11, c: 'var(--ink-3)', halo: false}));
    [0, 0.5, 1].forEach(v => g += txt(L - 6, Y1(v) + 4, Math.round(v * 100) + '%', {s: 10.5, a: 'end', c: 'var(--ink-3)', halo: false}));
    g += txt(W - R - 2, Y1(0) + 12, '↑ 门还剩几成（肠壁上拆药的酶）', {s: 11, a: 'end', c: 'var(--ter)'});
    g += '<path d="M' + r.pts.map(p => X(p[0]).toFixed(1) + ',' + Y1(p[1]).toFixed(1)).join('L') + '" fill="none" stroke="var(--ter)" stroke-width="2.4"/>';
    on.forEach((v, d) => { if (v) { const t = d * 24 + 8 - gap; if (t >= 0) g += '<circle cx="' + X(t) + '" cy="' + (Y1(1) - 2) + '" r="4.5" fill="var(--och)"/>'; } });
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y2(1) + '" y2="' + Y2(1) + '" stroke="var(--ink-3)" stroke-dasharray="3 3"/>' + txt(W - R - 2, Y2(1) - 4, '正常 = 1', {s: 10.5, a: 'end', c: 'var(--ink-3)'});
    g += txt(L + 4, mid + 4, '每天早上 8 点那片药进到血里的量', {s: 11, a: 'start', c: 'var(--main)'});
    r.exp.forEach((e, d) => {
      const m = M(e), x = X(d * 24 + 8);
      g += '<rect x="' + (x - 9) + '" y="' + Y2(m) + '" width="18" height="' + (Y2(0) - Y2(m)) + '" rx="2" fill="' + (m > 1.5 ? 'var(--red)' : 'var(--main)') + '" opacity=".8"/>' + txt(x, Y2(m) - 4, '×' + m.toFixed(1), {s: 10.5});
    });
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="var(--ink)"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    const ms = r.exp.map(M), top = Math.max(...ms), cnt = on.reduce((a, b) => a + b, 0);
    let s;
    if (!cnt) s = '一杯都没喝，门一直开着，每片药进血的量都是正常的 1 倍。点上面的格子加几天西柚汁。';
    else if (fm === 0) s = '这种药不经过肠壁上的那道门，西柚汁对它没影响。并不是所有的药都怕西柚，所以要看说明书。';
    else {
      s = '这一周里，同一片药进到血里最多到了正常的 <b>' + top.toFixed(1) + ' 倍</b>。';
      if (cnt >= 5) s += ' 天天喝，门一直修不好，作用一天天叠上去。';
      if (gap >= 6) s += ' 把西柚汁挪到吃药前 ' + gap + ' 小时，几乎没用：门要一天以上才修得好。';
      else s += ' 试试把“喝汁比吃药早”拉到 12 小时，看看能不能躲开。';
    }
    say.innerHTML = s;
  }
  slider('gfGap', v => { gap = v; return v ? v + ' 小时' : '同时（用果汁送药）'; }, draw);
});
