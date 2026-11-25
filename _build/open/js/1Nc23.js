/* ---------- 装置 24：卖掉，还是继续 ---------- */
dev('#exitFig', fig => {
  const box = $('#exBars'), kvb = $('#exKv'), say = $('#exSay');
  const g = {}; let ready = false;
  function draw(){
    if (!ready) return;
    const d = g.d / 100, gr = g.g / 100, Y = 5;
    let keep = 0, p = g.p, sellPath = g.p * g.m;
    for (let t = 1; t <= Y; t++) {
      keep += (p - g.o) / Math.pow(1 + d, t);   // 多赚的（或少赚的）
      p *= 1 + gr;
    }
    const later = Math.max(0, p / (1 + gr) * g.m) / Math.pow(1 + d, Y); // 五年后再卖
    const keepV = keep + later;
    bars(box, [['现在卖掉', sellPath, '一次拿到 ' + g.m + ' 倍年利润，之后去做别的', 'var(--ter)'], ['继续干五年', Math.max(0, keepV), keepV < 0 ? '比去做别的还亏 ' + yuan(-keepV) : '比去做别的多出的，折成今天的钱，含五年后再卖', 'var(--main)']], Math.max(sellPath, keepV, 1), v => yuan(v));
    const p5 = g.p * Math.pow(1 + gr, Y - 1);
    kv(kvb, [['卖掉拿到', yuan(sellPath)], ['继续干的价值', yuan(keepV)], ['第五年的利润', yuan(p5)], ['五年后再卖值', yuan(Math.max(0, p5 * g.m))]]);
    let s;
    if (sellPath > keepV * 1.15) s = '在这组假设下，现在卖掉更划算：生意在变差，或者它给你的并不比你去做别的多。买家出的是今天的价，五年后它可能只值一半。';
    else if (keepV > sellPath * 1.15) s = '在这组假设下，继续干更划算：利润在涨，而且比你去做别的多出不少。那就别卖，但想一想这份判断有多大把握。';
    else s = '两条路差不多。这时候数字帮不了你多少：想想你想要什么样的生活，第二十二章的那个问题。';
    if (g.o >= g.p) s += ' 注意：你去做别的一年能挣的，已经不比这门生意少了，你是在用自己的时间补贴它。';
    say.textContent = s;
  }
  const go = () => { if (ready) draw(); };
  slider('exP', v => { g.p = v; return yuan(v); }, go);
  slider('exG', v => { g.g = v; return (v > 0 ? '涨 ' : v < 0 ? '跌 ' : '不变 ') + (v ? Math.abs(v) + '%' : ''); }, go);
  slider('exO', v => { g.o = v; return yuan(v); }, go);
  slider('exM', v => { g.m = v; return v + ' 倍'; }, go);
  slider('exD', v => { g.d = v; return v + '%'; }, go);
  ready = true; draw();
});
