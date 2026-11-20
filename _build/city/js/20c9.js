/* ---------- 装置 10：管子要多粗 ---------- */
dev('#pipeFig', fig => {
  const K = $('#pipeK'), Rr = $('#pipeR');
  let sep = false;
  btnRow($('#pipeSys'), ['合流制（雨污一根管）', '分流制（雨污两根管）'], 0, i => { sep = i === 1; go(); });
  [K, Rr].forEach(e => e.addEventListener('input', go));
  const Y0 = 1860, Y1 = 2060, U = 0.006; // 每人用水每年涨 0.6%
  function go(){
    const k = +K.value, r = +Rr.value / 100;
    $('#pipeKO').textContent = '当年需要的 ' + k + ' 倍';
    $('#pipeRO').textContent = (r * 100).toFixed(1) + '% / 年';
    const dry = y => Math.exp((r + U) * (y - Y0));          // 晴天污水（1860 年 = 1）
    const rain = y => 2.2 * Math.exp(r * 0.85 * (y - Y0));  // 暴雨时流进来的雨水，随城区面积长
    const wet = y => dry(y) + (sep ? 0 : rain(y));
    const cap = k;
    let yDry = null, yWet = null;
    for (let y = Y0; y <= Y1; y++) { if (yWet === null && wet(y) > cap) yWet = y; if (yDry === null && dry(y) > cap) yDry = y; }
    const top = Math.max(cap * 1.4, Math.min(wet(Y1), cap * 3.5), 4);
    const X = y => 40 + (y - Y0) / (Y1 - Y0) * 545, Yv = v => 210 - Math.min(v, top) / top * 190;
    let s = '<line x1="40" x2="585" y1="210" y2="210" stroke="var(--ink)"/><line x1="40" x2="40" y1="16" y2="210" stroke="var(--ink)"/>';
    for (let y = 1860; y <= 2060; y += 40) s += '<text x="' + X(y) + '" y="226" font-size="11" text-anchor="middle" fill="var(--ink-3)">' + y + '</text><line x1="' + X(y) + '" x2="' + X(y) + '" y1="210" y2="214" stroke="var(--ink)"/>';
    let pw = 'M' + X(Y0) + ',210', pd = '';
    for (let y = Y0; y <= Y1; y += 2) { pw += ' L' + X(y).toFixed(1) + ',' + Yv(wet(y)).toFixed(1); pd += (pd ? ' L' : 'M') + X(y).toFixed(1) + ',' + Yv(dry(y)).toFixed(1); }
    pw += ' L' + X(Y1) + ',210 Z';
    if (!sep) s += '<path d="' + pw + '" fill="var(--wat)" opacity=".55"/>';
    s += '<path d="' + pd + '" fill="none" stroke="var(--blu)" stroke-width="2.5"/>';
    s += '<line x1="40" x2="585" y1="' + Yv(cap) + '" y2="' + Yv(cap) + '" stroke="var(--red)" stroke-width="2" stroke-dasharray="6 3"/><text x="44" y="' + (Yv(cap) - 5) + '" font-size="11" fill="var(--red)">管子容量</text>';
    [[2025, '今天']].forEach(m => s += '<line x1="' + X(m[0]) + '" x2="' + X(m[0]) + '" y1="16" y2="210" stroke="var(--ink-3)" stroke-dasharray="2 3"/><text x="' + (X(m[0]) + 3) + '" y="26" font-size="11" fill="var(--ink-3)">' + m[1] + '</text>');
    $('#pipeSvg').innerHTML = s;
    const cost = Math.pow(k, 0.75) * (sep ? 1.7 : 1);
    kv($('#pipeKV'), [['造价（1 倍合流 = 1）', cost.toFixed(1)], ['下大雨就溢流，从', sep ? '不会（雨水另走）' : (yWet === null ? '2060 年后' : yWet === Y0 ? '第一天起' : yWet + ' 年')], ['晴天也装不下，从', yDry === null ? '2060 年后' : yDry + ' 年'], ['撑到今天了吗', (yDry === null || yDry > 2025) ? '撑住了' : '没有']]);
    const S = $('#pipeSay');
    let t;
    if (yDry !== null && yDry < 1940) t = '管子太细，没撑几十年晴天都装不下了：污水从井盖里冒出来，街又回到了 1858 年。后人只能把街重新挖开。';
    else if (yDry !== null && yDry <= 2025) t = '撑了将近一百年，在二十世纪后半叶不够用了。很多城市的老城区就是这个处境：管子还在用，但已经超载。';
    else t = '晴天的污水，这套管子撑到了今天甚至更久。这就是巴泽尔杰特“加一倍”的道理：多花的钱，换来了一百多年不用挖街。';
    if (!sep && yWet !== null) t += '<br>可是合流制在暴雨时，雨水一涌进来，管子很快就装不下了，多出来的只能从溢流口连着污水一起排进河里。城市越大，铺的路面越多，溢流就越频繁。';
    if (sep) t += '<br>分流制雨天不溢流，代价是两套管子，贵得多；老城区要改成分流，几乎要把每条街都挖开一遍。';
    S.innerHTML = t;
  }
  go();
});
