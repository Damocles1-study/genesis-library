
/* ---------- 装置 21：买车还是打车 ---------- */
dev('#carFig', fig => {
  const kvb = $('#crKv2'), box = $('#crBars'), say = $('#crSay2'), ev = $('#crE');
  let ready = false;
  function go(){
    if (!ready) return;
    const P = gP() * 1e4, Y = gY(), K = gK(), S = gS(), T = gT(), isEV = ev.checked;
    const first = isEV ? 0.72 : 0.80, keep = isEV ? 0.80 : 0.85;
    const resid = P * first * Math.pow(keep, Y - 1);
    const dep = (P - resid) / Y, insr = P * 0.035, park = S * 12, misc = 3000, energy = K * (isEV ? 0.12 : 0.6);
    const carY = dep + insr + park + misc + energy, taxiY = K * T;
    const fixed = dep + insr + park + misc, perKmVar = (isEV ? 0.12 : 0.6);
    const be = T > perKmVar ? fixed / (T - perKmVar) : Infinity;
    kv(kvb, [['买车：一年', yuan(carY)], ['每公里', (carY / K).toFixed(2) + ' 元'], ['打车：一年', yuan(taxiY)], ['一年开过多少公里买车更省', isFinite(be) ? Math.round(be).toLocaleString() + ' 公里' : '永远不会']]);
    bars(box, [['折旧', dep, '', 'var(--main)'], ['保险', insr, '', 'var(--och)'], ['停车', park, '', 'var(--blu)'], ['保养杂费', misc, '', 'var(--ink-3)'], ['油/电', energy, '', 'var(--grn)']], carY, v => yuan(v));
    let s = '开 ' + Y + ' 年卖掉，车还值约 ' + yuan(resid) + '；平均每年折旧 ' + yuan(dep) + '，是最大的一笔。';
    s += carY > taxiY ? ' 一年开 ' + K.toLocaleString() + ' 公里，买车比打车每年多花 ' + yuan(carY - taxiY) + '。这笔差价买的是方便和自由，值不值你自己定。' : ' 一年开 ' + K.toLocaleString() + ' 公里，买车反而每年省 ' + yuan(taxiY - carY) + '：开得够多，车就是划算的工具。';
    say.textContent = s;
  }
  const gP = slider('crP', v => v + ' 万', go), gY = slider('crY', v => v + ' 年', go), gK = slider('crK', v => v.toLocaleString() + ' 公里', go), gS = slider('crS', v => v + ' 元', go), gT = slider('crT', v => v.toFixed(1) + ' 元', go);
  ev.addEventListener('change', go);
  ready = true; go();
});
