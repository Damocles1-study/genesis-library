
/* ---------- 装置 18：干部稳定 ---------- */
dev('#stabFig', fig => {
  const svg = $('#stSvg'), R = $('#stR');
  const fr = () => $('#stRO').textContent = R.value + '%'; R.addEventListener('input', fr); fr();
  function run(){
    const rate = +R.value / 100, r = rng(1964 + +R.value);
    // 金字塔：第 0 层 10 个位子（最高），第 1 层 30 个，第 2 层 60 个
    const tiers = [10, 30, 60];
    const pos = [];
    tiers.forEach((n, t) => { for (let i = 0; i < n; i++) pos.push({t, age: [57, 52, 46][t] + Math.round((r() - 0.5) * 12)}); });
    const topA = [], allA = []; let promos = 0, young = 0;
    for (let y = 1964; y <= 1984; y++) {
      const a0 = pos.filter(p => p.t === 0).reduce((s, p) => s + p.age, 0) / 10;
      topA.push([y, a0]); allA.push([y, pos.reduce((s, p) => s + p.age, 0) / pos.length]);
      if (y === 1984) break;
      // 死亡 + 强制更替 → 空位
      pos.forEach(p => { const pd = p.age < 60 ? 0.006 : p.age < 70 ? 0.02 : 0.06; p.vac = r() < pd || r() < rate * (p.age > 60 ? 1.6 : 0.6); });
      // 自上而下递补：由下一层最年长者补入
      for (let t = 0; t < 3; t++) {
        pos.filter(p => p.t === t && p.vac).forEach(p => {
          if (t < 2) { const c = pos.filter(q => q.t === t + 1 && !q.vac).sort((a, b) => b.age - a.age)[0]; if (c) { p.age = c.age; p.vac = false; c.vac = true; promos++; if (c.age < 50) young++; } }
          else { p.age = 38 + Math.round(r() * 6); p.vac = false; }
        });
      }
      pos.forEach(p => p.age++);
    }
    lineChart(svg, [{color: 'var(--zhu)', pts: topA, w: 2.8}, {color: 'var(--main)', pts: allA, dash: '5 4'}], {xmin: 1964, xmax: 1984, ymin: 40, ymax: 80, yt: [40, 50, 60, 70, 80], xt: [1964, 1969, 1974, 1979, 1984], H: 230});
    const end = topA[topA.length - 1][1];
    kv($('#stKv'), [['1964 年最高层', topA[0][1].toFixed(1) + ' 岁'], ['1984 年最高层', end.toFixed(1) + ' 岁'], ['二十年晋升次数', promos], ['五十岁前得到晋升', young + ' 次']]);
    const s = $('#stSay');
    s.className = 'say ' + (end > 68 ? 'bad' : 'ok');
    s.innerHTML = rate <= 0.01 ? '几乎不更替：最高层的平均年龄每年涨将近一岁，二十年后接近七十。<b>这差不多就是勃列日涅夫时代的政治局</b>。年轻人的晋升机会少得可怜。' :
      rate >= 0.08 ? '更替很快：最高层保持年轻，晋升机会多。代价是官员们又回到了赫鲁晓夫时代的提心吊胆，经验也来不及积累。' :
      '适中的更替让年龄大致稳住。稳定和更新之间，没有一个永远正确的比例。';
  }
  $('#stGo').addEventListener('click', run); run();
});
