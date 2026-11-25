
/* ---------- 装置 12：一次买进，还是每年买一点 ---------- */
dev('#dcaFig', fig => {
  const svg = $('#dcaSvg'), kvb = $('#dcaKv'), say = $('#dcaSay'), ck = $('#dcaDiv');
  const DATA = [SH, SP], NAME = ['上证综指', '标普 500'];
  let idx = 0, ready = false;
  function go(){
    if (!ready) return;
    const d = DATA[idx], y0 = gY(), END = 2025, n = END - y0 + 1, div = ck.checked ? 0.02 : 0;
    const total = n * 1; // 每份 1 万元，共 n 份
    // 一次买进
    let lump = total, sh = 0, units = 0, invested = 0;
    const pL = [], pD = [], pI = [];
    for (let y = y0; y <= END; y++) {
      if (y === y0) sh = lump / d[y]; else sh *= 1 + div;
      units = (y === y0 ? 0 : units * (1 + div)) + 1 / d[y]; invested += 1;
      pL.push([y, sh * d[y]]); pD.push([y, units * d[y]]); pI.push([y, invested]);
    }
    const L = pL[pL.length - 1][1], D = pD[pD.length - 1][1];
    const ymax = Math.max(...pL.map(p => p[1]), ...pD.map(p => p[1]), total) * 1.08;
    lineChart(svg, [
      {name: '投入', color: 'var(--ink-3)', pts: pI, dash: '3 3', w: 1.4},
      {name: '一次买进', color: 'var(--och)', pts: pL},
      {name: '每年一份', color: 'var(--up)', pts: pD}
    ], {xmin: y0, xmax: END, ymin: 0, ymax, xt: [y0, Math.round((y0 + END) / 2), END], yt: [0, Math.round(ymax / 2), Math.round(ymax)], yf: v => v + '万', H: 230});
    kv(kvb, [['总共投入', total + ' 万'], ['一次买进 → 2025', '<span class="' + (L >= total ? 'up' : 'dn') + '">' + L.toFixed(1) + ' 万</span>'], ['每年一份 → 2025', '<span class="' + (D >= total ? 'up' : 'dn') + '">' + D.toFixed(1) + ' 万</span>'], ['谁更多', L > D ? '一次买进' : '每年一份']]);
    let s = NAME[idx] + '：' + y0 + ' 年底起，一共投入 ' + total + ' 万。一次买进，2025 年底剩 ' + L.toFixed(1) + ' 万；每年买一份，剩 ' + D.toFixed(1) + ' 万。';
    s += L > D ? ' 这一段里市场整体在涨，越早把钱放进去越好，一次买进胜出：这是更常见的情况。' : ' 起点正好在高处，分批买进摊低了成本，胜出了。可这要事后才知道。';
    say.textContent = s;
  }
  btnRow($('#dcaIdx'), NAME, 0, i => { idx = i; go(); });
  const gY = slider('dcaY', v => v + ' 年', go);
  ck.addEventListener('change', go);
  ready = true; go();
});
