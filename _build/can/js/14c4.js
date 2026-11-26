
/* ---------- 装置 5：酒精走到哪一步 ---------- */
dev('#alcFig', fig => {
  const svg = $('#alSvg'), kvb = $('#alKv'), say = $('#alSay');
  const st = {n: 1, gene: 0, drug: 0};
  /* 乙醛被拆掉的速度（每小时） */
  const K2 = (gene, drug) => drug ? (gene ? 0.15 : 0.3) : (gene ? 3 : 20);
  function sim(n, k2){
    const dt = 0.02, T = 8, ka = 3, Vmax = 8, Km = 1;
    let G = 16 * n, E = 0, A = 0, t = 0, out = [], peak = 0, done = null, over = 0;
    for (let i = 0; i <= T / dt; i++) {
      const ab = ka * G * dt; G -= ab; E += ab;
      const r = Vmax * E / (Km + E) * dt; E = Math.max(0, E - r);
      A += r - k2 * A * dt;
      t = i * dt;
      if (i % 5 === 0) out.push([t, A]);
      if (A > peak) peak = A;
      if (done == null && G < 0.05 && E < 0.1) done = t;
    }
    return {pts: out, peak, done};
  }
  const REF = sim(1, 20).peak;
  const LINES = [[3, '脸红、心跳快'], [10, '头痛、恶心、胸闷'], [25, '血压骤降、喘不上气']];
  function draw(){
    const k2 = K2(st.gene, st.drug), r = sim(st.n, k2), base = sim(st.n, 20);
    const rel = p => [p[0], p[1] / REF];
    const ymax = Math.max(30, r.peak / REF * 1.12);
    const c = lineChart(svg, [
      {pts: base.pts.map(rel), color: 'var(--ink-3)', w: 1.6, dash: '4 3'},
      {pts: r.pts.map(rel), color: st.drug ? 'var(--red)' : st.gene ? 'var(--och)' : 'var(--ter)', w: 2.8}
    ], {xmin: 0, xmax: 8, ymin: 0, ymax: ymax, xt: [0, 1, 2, 3, 4, 5, 6, 7, 8], xf: v => v + ' 时', yt: Array.from({length: Math.floor(ymax / 10) + 1}, (_, i) => i * 10), H: 260});
    let extra = '';
    LINES.forEach(l => { if (l[0] < ymax) extra += '<line x1="' + c.L + '" x2="' + (c.W - c.R) + '" y1="' + c.Y(l[0]) + '" y2="' + c.Y(l[0]) + '" stroke="var(--red)" stroke-dasharray="2 4" opacity=".7"/>' + txt(c.W - c.R - 4, c.Y(l[0]) - 4, l[1], {s: 11, a: 'end', c: 'var(--red)'}); });
    extra += txt(c.L + 6, c.T + 12, '乙醛（相对值）', {s: 11, a: 'start', c: 'var(--ink-3)'});
    svg.insertAdjacentHTML('beforeend', extra);
    const pk = r.peak / REF;
    let above = 0; r.pts.forEach((p, i) => { if (i && p[1] / REF > 3) above += p[0] - r.pts[i - 1][0]; });
    kv(kvb, [['乙醛的峰值', pk < 1.5 ? '约 ' + pk.toFixed(1) : '约 ' + Math.round(pk) + ' 倍'], ['超过“脸红线”', above < 0.05 ? '没有' : '约 ' + above.toFixed(1) + ' 小时'], ['酒精拆完', r.done ? '约 ' + r.done.toFixed(1) + ' 小时' : '8 小时以上']]);
    let s;
    if (!st.gene && !st.drug) s = '第二步很快，乙醛刚产生就被拆掉，曲线一直贴着底。喝得多，乙醛不会堆得更高，只是拖得更久；这时候让人醉的主要是酒精本身。' + (st.n >= 3 ? ' 注意右边：' + st.n + ' 瓶啤酒的酒精要好几个小时才拆完，第二天早上开车前想一想（第二部细讲）。' : '');
    else if (st.gene && !st.drug) s = '第二步天生慢，乙醛堆到了正常人的好几倍，所以脸红、心跳快。这不是“酒量好”，是身体在报警。长期这样喝，乙醛长期泡着食管。';
    else s = '第二步几乎被卡死，乙醛一路往上堆，' + (pk > 25 ? '<b>越过了最上面那条线</b>' : '堆得很高') + '。这就是双硫仑样反应：和喝了多少不完全成比例，一瓶也可能出事。现实中出现这种症状，马上打 120。';
    say.innerHTML = s;
  }
  btnRow($('#alG'), ['喝酒不脸红', '一喝就脸红'], 0, i => { st.gene = i; draw(); });
  btnRow($('#alD'), ['没吃药', '吃了头孢'], 0, i => { st.drug = i; draw(); });
  slider('alN', v => { st.n = v; return v + ' 瓶（约 ' + v * 16 + ' 克酒精）'; }, draw);
});
