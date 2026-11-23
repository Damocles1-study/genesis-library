/* ---------- 装置 6：一根梁能搭多远 ---------- */
dev('#bmFig', () => {
  /* [名字, 密度, 允许应力 Pa, 截面类型] */
  const M = [['石梁', 2600, 2.5e6, 'r'], ['木梁', 500, 10e6, 'r'], ['钢工字梁', 7850, 160e6, 'i']];
  let cur = 1;
  btnRow($('#bmBtns'), M.map(m => m[0]), cur, i => { cur = i; draw(); });
  const Hs = slider('bmH', v => v.toFixed(2) + ' 米', () => draw());
  const Q = slider('bmQ', v => v + ' 千牛/米', () => draw());
  const Ls = slider('bmL', v => v + ' 米', () => draw());
  const sec = (m, h) => m[3] === 'r' ? {A: 2 / 3 * h * h, S: h * h * h / 9} : {A: 0.043 * h * h, S: 0.33 * 0.043 * h * h * h};
  const set = (id, v) => { const r = $('#' + id); r.value = v; r.dispatchEvent(new Event('input')); };
  let saved = null;
  $('#bmX2').addEventListener('click', () => { saved = saved || [Hs(), Ls()]; set('bmH', Math.min(2, Hs() * 2)); set('bmL', Math.min(40, Ls() * 2)); });
  $('#bmR').addEventListener('click', () => { const s = saved || [0.6, 6]; set('bmH', s[0]); set('bmL', s[1]); saved = null; });
  function draw(){
    const m = M[cur], h = Hs(), q = Q() * 1000, L = Ls();
    const s = sec(m, h), w = m[1] * 9.8 * s.A;
    const sig = (w + q) * L * L / 8 / s.S, r = sig / m[2];
    const sigSelf = w * L * L / 8 / s.S;
    const Lmax = Math.sqrt(8 * s.S * m[2] / (w + q));
    const svg = $('#bmSvg'), W = 600, H = 150;
    const px = 520 / Math.max(L, Lmax * 1.05, 4), x0 = 40, x1 = x0 + L * px, bh = Math.max(4, Math.min(30, h * px));
    const sag = Math.min(26, 6 * r);
    const col = r > 1 ? 'var(--red)' : r > 0.7 ? 'var(--och)' : 'var(--grn)';
    let g = '<rect x="' + (x0 - 10) + '" y="70" width="12" height="70" fill="var(--ink-3)" fill-opacity=".5"/><rect x="' + (x1 - 2) + '" y="70" width="12" height="70" fill="var(--ink-3)" fill-opacity=".5"/>';
    g += '<path d="M' + x0 + ',' + (70 - bh) + 'Q' + ((x0 + x1) / 2) + ',' + (70 - bh + sag * 2) + ' ' + x1 + ',' + (70 - bh) + 'L' + x1 + ',70Q' + ((x0 + x1) / 2) + ',' + (70 + sag * 2) + ' ' + x0 + ',70Z" fill="' + col + '" fill-opacity=".35" stroke="' + col + '" stroke-width="1.5"/>';
    if (r > 1) g += '<path d="M' + ((x0 + x1) / 2) + ',' + (70 + sag) + 'l-3,-' + (bh * .5) + 'l5,-4l-3,-' + (bh * .3) + '" fill="none" stroke="var(--red)" stroke-width="2"/>';
    const lm = x0 + Lmax * px; if (Lmax * px < 560) g += '<line x1="' + lm + '" x2="' + lm + '" y1="20" y2="140" stroke="var(--ink-3)" stroke-dasharray="3 3"/>' + txt(lm, 16, '最远约 ' + Lmax.toFixed(1) + ' 米', {s: 11, c: 'var(--ink-2)'});
    g += '<rect x="' + (x1 + 22) + '" y="' + (140 - 1.7 * px) + '" width="' + Math.max(1.7 * px * .28, 1.5) + '" height="' + 1.7 * px + '" fill="var(--ink)"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = g;
    kv($('#bmKv'), [['吃力程度', Math.round(r * 100) + '%'], ['其中自重占', Math.round(sigSelf / sig * 100) + '%'], ['这样的梁最远', Lmax.toFixed(1) + ' 米'], ['梁每米重', (w / 9800).toFixed(2) + ' 吨']]);
    $('#bmSay').innerHTML = (r > 1 ? '<b>要裂了。</b>' : r > 0.7 ? '扛得住，但已经很吃力。' : '轻松扛住。') +
      ' 这根' + m[0] + '高 ' + h.toFixed(2) + ' 米，最远能搭约 ' + Lmax.toFixed(1) + ' 米。' +
      (cur === 0 ? ' 石头很重又怕拉，自重就吃掉了一大半力气，所以神庙的柱子只能隔几米一根。' : cur === 1 ? ' 木头轻，能搭得比同样高的石梁远得多；可是山里很难找到又高又直的大树。' : ' 钢又结实又能做成工字形，几十米的跨度不在话下，第三部讲它怎样改变了房子。') +
      (saved ? ' 你刚把尺寸放大了一倍：自重造成的应力也跟着翻了一倍，这就是伽利略说的“不能无限放大”。' : '');
    $('#bmSay').className = 'say' + (r > 1 ? ' bad' : r <= 0.7 ? ' ok' : '');
  }
  draw();
});
