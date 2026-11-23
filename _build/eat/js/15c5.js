/* ---------- 装置 6：喝奶的基因 ---------- */
dev('#lcFig', () => {
  const P = slider('lcP', v => (v === 0 ? 0.1 : v / 10).toFixed(1) + '% 的基因', () => draw());
  const S = slider('lcS', v => v.toFixed(1) + '%', () => draw());
  const GEN = 25, YRS = 8000;
  function draw(){
    let p = (P() === 0 ? 0.1 : P() / 10) / 100; const s = S() / 100;
    const pts = [], ph = x => 1 - (1 - x) * (1 - x);
    let t50 = null, t90 = null;
    for (let y = 0; y <= YRS; y += GEN) {
      const f = ph(p);
      pts.push([y, f * 100]);
      if (t50 == null && f >= 0.5) t50 = y;
      if (t90 == null && f >= 0.9) t90 = y;
      const wbar = 1 + s * f;
      p = p * (1 + s) / wbar;
    }
    lineChart($('#lcChart'), [{pts, color: 'var(--main)', w: 2.6}], {xmin: 0, xmax: YRS, ymin: 0, ymax: 100, xt: [0, 2000, 4000, 6000, 8000], yt: [0, 50, 90], xf: v => v + ' 年', yf: v => v + '%', H: 220});
    kv($('#lcKv'), [['开头能消化的人', (ph((P() === 0 ? 0.1 : P() / 10) / 100) * 100).toFixed(1) + '%'], ['过半要', t50 != null ? t50 + ' 年' : '八千年内没到'], ['到九成要', t90 != null ? t90 + ' 年' : '八千年内没到'], ['相当于', t90 != null ? Math.round(t90 / GEN) + ' 代人' : '—']]);
    $('#lcSay').innerHTML = (t90 != null && t90 <= 6000 ? '每代只多留下 ' + S().toFixed(1) + '% 的后代，' + Math.round(t90 / GEN) + ' 代人以后，九成的人都能喝奶了。<b>一点点优势，乘上几百代，就是翻天覆地</b>。' :
      t50 != null ? '优势不大，要很久才传开。欧洲的乳糖酶持续性从少见到常见，只用了三四千年，说明当时的选择相当猛烈，这正是“饥荒和瘟疫”那种解释想说明的。' :
      '优势太小、开头太少，八千年也传不开。很多人群里这个突变始终罕见，一个原因是那里从来没有靠奶熬过荒年的历史。');
  }
  draw();
});
