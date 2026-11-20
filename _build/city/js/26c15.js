/* ---------- 装置 16：墓地的账 ---------- */
dev('#tombFig', fig => {
  const WAY = [['土葬', 4], ['骨灰墓', 1], ['骨灰堂（层层叠放）', 0.06], ['树葬 · 海葬', 0]];
  let w = 0;
  const P = $('#tombP'), Y = $('#tombY');
  btnRow($('#tombWay'), WAY.map(x => x[0]), 0, i => { w = i; go(); });
  [P, Y].forEach(e => e.addEventListener('input', go));
  function go(){
    const pop = +P.value * 1e6, yrs = +Y.value;
    $('#tombPO').textContent = P.value + ' 百万人'; $('#tombYO').textContent = yrs + ' 年';
    const deaths = pop * 0.007 * yrs, m2 = deaths * WAY[w][1] * 2, km2 = m2 / 1e6;
    const city = pop * 100 / 1e6; // 每人约 100 平方米建设用地
    // 画：城市建设用地的方块 vs 墓地方块
    const S = 220, side = Math.sqrt(city), sc = S / Math.max(side, Math.sqrt(km2) || 0.001, 1e-6);
    const cs = side * sc, ts = Math.sqrt(km2) * sc;
    let s = '<rect x="10" y="10" width="' + cs.toFixed(1) + '" height="' + cs.toFixed(1) + '" fill="var(--main)" fill-opacity=".12" stroke="var(--main)" stroke-width="1.5"/><text x="16" y="28" font-size="11" fill="var(--main)">城市建设用地</text>';
    if (ts > 0.3) s += '<rect x="' + (10 + cs - ts).toFixed(1) + '" y="' + (10 + cs - ts).toFixed(1) + '" width="' + ts.toFixed(1) + '" height="' + ts.toFixed(1) + '" fill="var(--ink)" fill-opacity=".35" stroke="var(--ink)" stroke-width="1.2"/>' + (ts > 30 ? '<text x="' + (16 + cs - ts).toFixed(1) + '" y="' + (26 + cs - ts).toFixed(1) + '" font-size="11" fill="var(--card)">墓地</text>' : '');
    $('#tombSvg').innerHTML = s;
    kv($('#tombKV'), [['这些年去世', fmt(deaths) + ' 人'], ['墓地占地', km2 >= 1 ? f1(km2) + ' 平方公里' : fmt(m2) + ' 平方米'], ['约等于几个中央公园', (km2 / 3.41).toFixed(km2 / 3.41 < 1 ? 2 : 1)], ['占城市建设用地', (km2 / city * 100).toFixed(km2 / city < .01 ? 2 : 1) + '%']]);
    const T = $('#tombT');
    T.innerHTML = w === 0 ? '土葬：' + yrs + ' 年下来，墓地要占掉城市建设用地的 <b>' + (km2 / city * 100).toFixed(1) + '%</b>，而且只会越来越多。这就是古代城市一次次把墓地“请出城”的原因。'
      : w === 1 ? '骨灰墓只占土葬的四分之一，可年年累加，几十年后仍是一大片山坡。'
      : w === 2 ? '骨灰堂把骨灰一层层叠起来，像死者的高层公寓，占地一下小了几十倍。香港和日本的城市就靠这个。'
      : '树葬、海葬几乎不占永久的地。这是很多城市现在在推广的做法。';
  }
  go();
});
